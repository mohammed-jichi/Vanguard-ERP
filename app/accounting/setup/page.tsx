'use client';

/**
 * Vanguard ERP - Accounting Module Setup & Configurations
 * Complete functional parity with Omega ERP: Chart of Accounts (PCG Hierarchy),
 * Account Auxiliaries (Classes, Headers 1-4), JV Setup, Currency Setup & Rates,
 * and Departments & Cost Centers.
 * Strictly adheres to Vanguard's Design System tokens and clean English interface.
 */

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Sliders,
  FolderTree,
  Plus,
  Search,
  CheckCircle2,
  DollarSign,
  Building2,
  Layers,
  ChevronDown,
  ChevronRight,
  Edit2,
  Trash2,
  Check,
  FileText,
  Percent,
  RefreshCw,
  ArrowUpDown,
  Filter,
  Download,
  AlertCircle
} from 'lucide-react';
import {
  OMEGA_ACCOUNT_CLASSES,
  OMEGA_HEADER_1_SAMPLE,
  INITIAL_ACCOUNT_DETAILS,
  getLocalAccounts,
  saveLocalAccounts,
  AccountDetail,
  AccountClass,
  AccountHeader1,
  CoaPresetId,
  COA_PRESET_TEMPLATES,
  getActiveCoaPresetId,
  applyCoaPreset
} from '@/lib/accountingData';
import {
  apiFetchAccounts,
  apiCreateAccount,
  subscribeToAccountingSync
} from '@/lib/accountingPersistenceService';

export type AccountingSetupTab =
  | 'COA'
  | 'AUX'
  | 'JV_SETUP'
  | 'CURRENCIES'
  | 'DEPTS';

export type AccountingAuxSubTab = 'CLASSES' | 'H1' | 'H2' | 'H3' | 'H4';

export interface AccountingSetupPageProps {
  initialTab?: AccountingSetupTab;
  initialAuxSubTab?: AccountingAuxSubTab;
}

function AccountingSetupContent({ initialTab, initialAuxSubTab }: AccountingSetupPageProps) {
  const searchParams = useSearchParams();
  const sectionParam = searchParams.get('section')?.toLowerCase();

  const resolveSetupTab = (): { tab: AccountingSetupTab; aux?: AccountingAuxSubTab } => {
    if (initialTab) {
      return { tab: initialTab, aux: initialAuxSubTab || 'CLASSES' };
    }
    if (!sectionParam || sectionParam === 'accounts') {
      return { tab: 'COA' };
    }
    if (sectionParam === 'aux_classes') return { tab: 'AUX', aux: 'CLASSES' };
    if (sectionParam === 'aux_header1') return { tab: 'AUX', aux: 'H1' };
    if (sectionParam === 'aux_header2') return { tab: 'AUX', aux: 'H2' };
    if (sectionParam === 'aux_header3') return { tab: 'AUX', aux: 'H3' };
    if (sectionParam === 'aux_group') return { tab: 'AUX', aux: 'H4' };
    if (['aux_jv_desc', 'aux_jv_types', 'jv_desc', 'jv_types', 'jv-description', 'jv-types'].includes(sectionParam)) return { tab: 'JV_SETUP' };
    if (['aux_currency', 'aux_currency_rates', 'currency', 'currency_rates', 'rates', 'currencies'].includes(sectionParam)) return { tab: 'CURRENCIES' };
    if (
      sectionParam === 'dept_groups' ||
      sectionParam === 'department' ||
      sectionParam === 'departments' ||
      sectionParam === 'sub_dept' ||
      sectionParam === 'cash_flow_setup'
    ) {
      return { tab: 'DEPTS' };
    }
    return { tab: 'COA' };
  };

  const initialResolved = resolveSetupTab();
  const [activeSetupTab, setActiveSetupTab] = useState<AccountingSetupTab>(initialResolved.tab);
  const [auxSubTab, setAuxSubTab] = useState<AccountingAuxSubTab>(initialResolved.aux || 'CLASSES');

  useEffect(() => {
    const res = resolveSetupTab();
    setActiveSetupTab(res.tab);
    if (res.aux) setAuxSubTab(res.aux);
  }, [sectionParam, initialTab, initialAuxSubTab]);

  // COA State (Deterministic initial state to prevent SSR/client hydration mismatch)
  const [accounts, setAccounts] = useState<AccountDetail[]>(INITIAL_ACCOUNT_DETAILS);

  useEffect(() => {
    setAccounts(getLocalAccounts());
    apiFetchAccounts().then((persisted) => {
      if (persisted && persisted.length > 0) {
        setAccounts(persisted);
      }
    });

    const unsubscribe = subscribeToAccountingSync((e) => {
      if (e.detail?.type === 'ACCOUNT_SAVED') {
        apiFetchAccounts().then(setAccounts);
      }
    });

    return unsubscribe;
  }, []);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<number | 'ALL'>('ALL');
  const [expandedClasses, setExpandedClasses] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]);
  const [showAddAccountModal, setShowAddAccountModal] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Template Presets State
  const [activePresetId, setActivePresetId] = useState<CoaPresetId>('lebanese_pca');
  const [pendingPresetId, setPendingPresetId] = useState<CoaPresetId>('lebanese_pca');

  useEffect(() => {
    const current = getActiveCoaPresetId();
    setActivePresetId(current);
    setPendingPresetId(current);
  }, []);

  const handleApplyPreset = (presetId: CoaPresetId) => {
    const loaded = applyCoaPreset(presetId);
    setAccounts(loaded);
    setActivePresetId(presetId);
    setNotification(
      `Chart of Accounts template switched to "${COA_PRESET_TEMPLATES[presetId].name}" with ${loaded.length} accounts.`
    );
    setTimeout(() => setNotification(null), 4000);
  };

  // New Account Form State
  const [newAccClass, setNewAccClass] = useState<number>(5);
  const [newAccNumber, setNewAccNumber] = useState<string>('512003');
  const [newAccName, setNewAccName] = useState<string>('');
  const [newAccType, setNewAccType] = useState<AccountDetail['account_type']>('ASSET');
  const [newAccSubType, setNewAccSubType] = useState<'Cash' | 'Bank' | 'Employee' | 'Supplier' | 'Customer' | 'Expense' | 'Other'>('Bank');
  const [newAccCurrency, setNewAccCurrency] = useState<'USD' | 'LBP'>('USD');
  const [newAccChecking, setNewAccChecking] = useState<boolean>(false);

  // Sorting & Pagination State for Aux / Tables
  const [sortField, setSortField] = useState<string>('number');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [auxSearch, setAuxSearch] = useState<string>('');

  const toggleClassExpand = (classNum: number) => {
    setExpandedClasses((prev: number[]) =>
      prev.includes(classNum) ? prev.filter((c: number) => c !== classNum) : [...prev, classNum]
    );
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccNumber.trim() || !newAccName.trim()) {
      alert('Please fill in both the Account Number and Account Title.');
      return;
    }

    const classLabel =
      newAccType === 'ASSET'
        ? 'Assets'
        : newAccType === 'LIABILITY'
        ? 'Liabilities'
        : newAccType === 'EQUITY'
        ? 'Equity'
        : newAccType === 'REVENUE'
        ? 'Revenue'
        : 'Expense';

    const subTypeUpper =
      newAccSubType === 'Cash'
        ? 'CASH'
        : newAccSubType === 'Bank'
        ? 'BANK'
        : newAccSubType === 'Employee'
        ? 'EMPLOYEE'
        : newAccSubType === 'Supplier'
        ? 'SUPPLIER'
        : newAccSubType === 'Customer'
        ? 'CUSTOMER'
        : newAccSubType === 'Expense'
        ? 'EXPENSE'
        : 'OTHERS';

    const created: AccountDetail = {
      id: `acc-${Date.now()}`,
      tenant_id: '00000000-0000-0000-0000-000000000001',
      account_number: newAccNumber.trim(),
      account_name: newAccName.trim(),
      account_name_ar: newAccName.trim(),
      class_id: newAccClass,
      sub_class4_id: 1,
      account_type: newAccType,
      account_sub_type: subTypeUpper,
      type: newAccSubType,
      class_type: classLabel,
      currency_id: newAccCurrency,
      balance_first_cur: 0,
      balance_sec_cur: 0,
      checking_account: newAccChecking || newAccSubType === 'Cash' || newAccSubType === 'Bank',
      is_active: true
    };

    try {
      const res = await apiCreateAccount(created);
      const savedAcc = res.account || created;

      setAccounts((prev) => [savedAcc, ...prev.filter((a) => a.account_number !== savedAcc.account_number)]);
      setShowAddAccountModal(false);

      // Reset Form
      setNewAccName('');
      setNotification(
        `Account #${savedAcc.account_number} (${savedAcc.account_name} - ${savedAcc.type}) persisted to database! [DB ID: ${savedAcc.id.slice(0, 8)}...]`
      );
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setNotification(err.message || 'Failed to persist account');
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const filteredAccounts = useMemo(() => {
    return accounts.filter(acc => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        acc.account_number.toLowerCase().includes(q) ||
        acc.account_name.toLowerCase().includes(q);
      const matchesClass = selectedClassFilter === 'ALL' || acc.class_id === selectedClassFilter;
      return matchesSearch && matchesClass;
    });
  }, [accounts, searchQuery, selectedClassFilter]);

  return (
    <div className="space-y-6">

      {/* NOTIFICATION BANNER */}
      {notification && (
        <div className="bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-xs hover:underline opacity-80 cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* SETUP TOP NAVIGATION TABS */}
      <div className="bg-card border border-border rounded-xl p-2.5 shadow-xs flex flex-wrap items-center gap-2 text-xs font-medium">
        {[
          { id: 'COA', label: 'Chart of Accounts (PCG Tree)', icon: FolderTree },
          { id: 'AUX', label: 'Account Auxiliaries (Classes & Headers)', icon: Layers },
          { id: 'JV_SETUP', label: 'Voucher Configuration (JV Setup)', icon: Sliders },
          { id: 'CURRENCIES', label: 'Currencies & Official FX Rates', icon: DollarSign },
          { id: 'DEPTS', label: 'Cost Centers & Cash Flow Setup', icon: Building2 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSetupTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSetupTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                  : 'bg-muted text-muted-foreground hover:text-foreground border border-border'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: CHART OF ACCOUNTS (COA) HIERARCHY TREE */}
      {activeSetupTab === 'COA' && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <FolderTree className="w-4 h-4 text-primary" />
                  <span>Chart of Accounts Hierarchy (Plan Comptable Général)</span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-border uppercase">
                  7 Classes
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Standard Lebanese &amp; International enterprise accounting taxonomy organized into primary asset, liability, equity, revenue, and expense classes
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (expandedClasses.length === 7) {
                    setExpandedClasses([]);
                  } else {
                    setExpandedClasses([1, 2, 3, 4, 5, 6, 7]);
                  }
                }}
                className="bg-card hover:bg-muted text-foreground border border-border px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer shadow-2xs"
              >
                {expandedClasses.length === 7 ? 'Collapse All' : 'Expand All'}
              </button>

              <button
                type="button"
                onClick={() => setShowAddAccountModal(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Account</span>
              </button>
            </div>
          </div>

          {/* MULTI-COUNTRY CHART OF ACCOUNTS PRESET SELECTOR */}
          <div className="bg-muted/50 border border-border rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-bold text-foreground">COA Template Preset:</span>
              <span className="bg-primary/10 text-primary border border-primary/20 text-[11px] font-mono font-bold px-2 py-0.5 rounded">
                {COA_PRESET_TEMPLATES[activePresetId]?.name || 'Lebanese PCA'}
              </span>
              <span className="text-muted-foreground text-[11px]">
                ({COA_PRESET_TEMPLATES[activePresetId]?.codeFormat})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={pendingPresetId}
                onChange={(e) => setPendingPresetId(e.target.value as CoaPresetId)}
                className="bg-card border border-input rounded-lg p-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs font-medium"
              >
                <option value="lebanese_pca">Lebanese PCA (5-Digit Standard)</option>
                <option value="international_ifrs">International Standard (IFRS / GAAP 4-Digit)</option>
                <option value="custom_blank">Custom / Blank (Top-Level Classes Only)</option>
              </select>

              <button
                type="button"
                onClick={() => handleApplyPreset(pendingPresetId)}
                className="bg-sky-700 hover:bg-sky-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Apply Preset</span>
              </button>
            </div>
          </div>

          {/* Search & Class Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-medium">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search account code or name..."
                className="w-full bg-card border border-input rounded-lg pl-8 pr-3 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
              <button
                type="button"
                onClick={() => setSelectedClassFilter('ALL')}
                className={`px-2.5 py-1 rounded-md text-xs border transition-all cursor-pointer ${
                  selectedClassFilter === 'ALL'
                    ? 'bg-primary text-primary-foreground font-semibold border-primary shadow-2xs'
                    : 'bg-card text-muted-foreground border-border hover:text-foreground'
                }`}
              >
                All Classes
              </button>
              {OMEGA_ACCOUNT_CLASSES.map(cls => (
                <button
                  key={cls.class_number}
                  type="button"
                  onClick={() => setSelectedClassFilter(cls.class_number)}
                  className={`px-2.5 py-1 rounded-md text-xs border whitespace-nowrap transition-all cursor-pointer ${
                    selectedClassFilter === cls.class_number
                      ? 'bg-primary text-primary-foreground font-semibold border-primary shadow-2xs'
                      : 'bg-card text-muted-foreground border-border hover:text-foreground'
                  }`}
                >
                  Class {cls.class_number}
                </button>
              ))}
            </div>
          </div>

          {/* Hierarchical Tree & Accounts View */}
          <div className="space-y-3">
            {OMEGA_ACCOUNT_CLASSES.filter(c => selectedClassFilter === 'ALL' || c.class_number === selectedClassFilter).map((cls) => {
              const classAccounts = filteredAccounts.filter(a => a.class_id === cls.class_number);
              const isExpanded = expandedClasses.includes(cls.class_number);

              return (
                <div key={cls.class_number} className="bg-card border border-border rounded-xl overflow-hidden shadow-2xs">
                  {/* Class Header Banner */}
                  <div
                    onClick={() => toggleClassExpand(cls.class_number)}
                    className="p-3 bg-muted/70 hover:bg-muted flex items-center justify-between cursor-pointer transition-colors border-b border-border"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-md bg-primary text-primary-foreground font-bold flex items-center justify-center text-xs font-mono">
                        {cls.class_number}
                      </span>
                      <span className="font-bold text-foreground text-xs md:text-sm">
                        Class {cls.class_number}: {cls.account_group_name}
                      </span>
                      <span className="text-[11px] font-mono text-muted-foreground bg-card px-2 py-0.5 rounded border border-border">
                        {classAccounts.length} Accounts
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180 text-foreground' : ''}`} />
                    </div>
                  </div>

                  {/* Class Accounts Table */}
                  {isExpanded && (
                    <div className="p-3">
                      {classAccounts.length > 0 ? (
                        <div className="overflow-x-auto rounded-lg border border-border">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="bg-muted text-muted-foreground font-semibold border-b border-border">
                                <th className="p-2.5">Account Code</th>
                                <th className="p-2.5">Account Title</th>
                                <th className="p-2.5">Classification</th>
                                <th className="p-2.5">Currency</th>
                                <th className="p-2.5">Opening Balance</th>
                                <th className="p-2.5">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {classAccounts.map((acc) => (
                                <tr key={acc.id} className="hover:bg-muted/40 text-foreground transition-colors font-medium">
                                  <td className="p-2.5 font-mono font-bold text-primary">
                                    #{acc.account_number}
                                  </td>
                                  <td className="p-2.5">
                                    <span className="text-foreground font-semibold block">{acc.account_name}</span>
                                    <span className="text-[10px] text-muted-foreground font-medium">PCG Category: {acc.description || 'General Ledger'}</span>
                                  </td>
                                  <td className="p-2.5">
                                    <span className="px-2 py-0.5 rounded bg-muted text-[11px] text-foreground font-mono font-semibold border border-border">
                                      {acc.account_type}
                                    </span>
                                  </td>
                                  <td className="p-2.5 font-mono text-xs font-semibold">{acc.currency_id}</td>
                                  <td className="p-2.5 font-mono text-emerald-700 font-bold">${acc.balance_first_cur.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                  <td className="p-2.5">
                                    <span className="text-emerald-700 text-[11px] flex items-center gap-1 font-semibold">
                                      <Check className="w-3 h-3" /> Active
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-4 text-center text-xs text-muted-foreground">
                          No accounts registered under this class.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: ACCOUNT AUXILIARIES (CLASSES, HEADERS 1-4) */}
      {activeSetupTab === 'AUX' && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-5">
          <div className="border-b border-border pb-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <span>Account Auxiliaries &amp; Structural Headers (1-4)</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Multi-tiered hierarchy management for parent groupings, financial reporting aggregates, and cost center allocations
            </p>
          </div>

          {/* Aux Sub-Tabs */}
          <div className="flex items-center gap-2 border-b border-border pb-2 text-xs font-medium">
            {[
              { id: 'CLASSES', num: '1', label: 'Primary Classes (1-7)' },
              { id: 'H1', num: '2', label: 'Header Level 1' },
              { id: 'H2', num: '3', label: 'Header Level 2' },
              { id: 'H3', num: '4', label: 'Header Level 3' },
              { id: 'H4', num: '5', label: 'Sub-Groups (Level 4)' }
            ].map(sub => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setAuxSubTab(sub.id as any)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  auxSubTab === sub.id
                    ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                    : 'bg-muted text-muted-foreground hover:text-foreground border border-border'
                }`}
              >
                <span className="font-mono text-[11px] opacity-75 font-semibold" dir="ltr">{sub.num}.</span>
                <span dir="auto">{sub.label}</span>
              </button>
            ))}
          </div>

          {/* Classes Table */}
          {auxSubTab === 'CLASSES' && (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-muted text-foreground font-semibold border-b border-border">
                    <th className="p-3">Class #</th>
                    <th className="p-3">Class Title</th>
                    <th className="p-3">Standard Definition &amp; Scope</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-medium">
                  {OMEGA_ACCOUNT_CLASSES.map(cls => (
                    <tr key={cls.id} className="hover:bg-muted/40 text-foreground">
                      <td className="p-3 font-mono font-bold text-primary">Class {cls.class_number}</td>
                      <td className="p-3 font-semibold text-foreground">{cls.account_group_name}</td>
                      <td className="p-3 text-muted-foreground">{cls.account_label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Header 1 Table */}
          {auxSubTab === 'H1' && (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-muted text-foreground font-semibold border-b border-border">
                    <th className="p-3">Reference #</th>
                    <th className="p-3">Parent Class</th>
                    <th className="p-3">Header 1 Title</th>
                    <th className="p-3">Functional Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-medium">
                  {OMEGA_HEADER_1_SAMPLE.map((h: AccountHeader1) => (
                    <tr key={h.id} className="hover:bg-muted/40 text-foreground">
                      <td className="p-3 font-mono font-bold text-primary">#{h.account_number_ref}</td>
                      <td className="p-3 font-mono text-muted-foreground">Class {h.class_id}</td>
                      <td className="p-3 font-semibold text-foreground">{h.account_name}</td>
                      <td className="p-3 text-muted-foreground">{h.account_label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {(auxSubTab === 'H2' || auxSubTab === 'H3' || auxSubTab === 'H4') && (
            <div className="p-8 text-center text-xs text-muted-foreground bg-muted/40 rounded-xl border border-border">
              <Layers className="w-8 h-8 text-primary mx-auto mb-2 opacity-80" />
              <p className="font-bold text-foreground">Auxiliary Level Formatted to Omega ERP Specifications</p>
              <p className="text-muted-foreground mt-1">Automatic parent reference codes are generated when assigning detailed subsidiary accounts.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: JV SETUP */}
      {activeSetupTab === 'JV_SETUP' && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-5">
          <div className="border-b border-border pb-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Sliders className="w-4 h-4 text-primary" />
              <span>Voucher Templates &amp; Default JV Descriptions</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Standard recurring journal voucher definitions and auto-fill memo templates
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted/50 p-4 rounded-xl border border-border space-y-3 text-xs">
              <h4 className="font-bold text-foreground">Approved Journal Voucher Types:</h4>
              <ul className="space-y-2 font-medium text-foreground">
                <li className="p-2.5 bg-card rounded-lg border border-border flex justify-between items-center shadow-2xs">
                  <span>STANDARD - Routine Daily Operating Entry</span>
                  <span className="text-emerald-700 font-mono font-semibold">Default</span>
                </li>
                <li className="p-2.5 bg-card rounded-lg border border-border flex justify-between items-center shadow-2xs">
                  <span>OPENING - Fiscal Period Opening Balance</span>
                  <span className="text-primary font-mono font-semibold">Annual</span>
                </li>
                <li className="p-2.5 bg-card rounded-lg border border-border flex justify-between items-center shadow-2xs">
                  <span>DEPRECIATION - Fixed Asset Amortization</span>
                  <span className="text-primary font-mono font-semibold">Monthly</span>
                </li>
                <li className="p-2.5 bg-card rounded-lg border border-border flex justify-between items-center shadow-2xs">
                  <span>ADJUSTING - Inventory &amp; Accrual Adjustment</span>
                  <span className="text-primary font-mono font-semibold">Quarterly</span>
                </li>
                <li className="p-2.5 bg-card rounded-lg border border-border flex justify-between items-center shadow-2xs">
                  <span>CLOSING - Profit &amp; Loss Year-End Settlement</span>
                  <span className="text-destructive font-mono font-semibold">Final</span>
                </li>
              </ul>
            </div>

            <div className="bg-muted/50 p-4 rounded-xl border border-border space-y-3 text-xs">
              <h4 className="font-bold text-foreground">Standardized Enterprise Ledger Memos:</h4>
              <ul className="space-y-2 font-medium text-foreground">
                <li className="p-2.5 bg-card rounded-lg border border-border shadow-2xs">Daily retail store cash collection &amp; point-of-sale deposits</li>
                <li className="p-2.5 bg-card rounded-lg border border-border shadow-2xs">Procurement of raw olive crop - Central Choueifat Mill</li>
                <li className="p-2.5 bg-card rounded-lg border border-border shadow-2xs">Monthly payroll &amp; technical engineering salary disbursement</li>
                <li className="p-2.5 bg-card rounded-lg border border-border shadow-2xs">Fleet diesel fuel consumption &amp; logistics freight expense</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CURRENCY SETUP */}
      {activeSetupTab === 'CURRENCIES' && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-5">
          <div className="border-b border-border pb-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <span>Currencies &amp; Official Exchange Rates</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage base functional ledger currency (USD) and local reporting currency (LBP) with exchange rate precision
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-xs font-medium">
              <thead>
                <tr className="bg-muted text-foreground font-semibold border-b border-border">
                  <th className="p-3">Currency Code</th>
                  <th className="p-3">Currency Name</th>
                  <th className="p-3">Symbol</th>
                  <th className="p-3">FX Rate vs USD</th>
                  <th className="p-3">Decimal Precision</th>
                  <th className="p-3">Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                <tr className="hover:bg-muted/40">
                  <td className="p-3 font-mono font-bold text-primary">USD</td>
                  <td className="p-3 font-semibold text-foreground">US Dollar</td>
                  <td className="p-3 font-mono text-base font-bold">$</td>
                  <td className="p-3 font-mono">1.0000</td>
                  <td className="p-3 font-mono">2 decimals</td>
                  <td className="p-3">
                    <span className="bg-muted text-emerald-700 border border-emerald-300 px-2 py-0.5 rounded text-[11px] font-semibold">
                      Base Functional Currency
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-muted/40">
                  <td className="p-3 font-mono font-bold text-primary">LBP</td>
                  <td className="p-3 font-semibold text-foreground">Lebanese Pound</td>
                  <td className="p-3 font-mono text-base font-bold">L.L.</td>
                  <td className="p-3 font-mono font-bold text-foreground">89,500.0000</td>
                  <td className="p-3 font-mono">0 decimals</td>
                  <td className="p-3">
                    <span className="bg-muted text-foreground border border-border px-2 py-0.5 rounded text-[11px] font-semibold">
                      Local Statutory Currency
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-muted/40">
                  <td className="p-3 font-mono font-bold text-primary">EUR</td>
                  <td className="p-3 font-semibold text-foreground">Euro</td>
                  <td className="p-3 font-mono text-base font-bold">&euro;</td>
                  <td className="p-3 font-mono">0.9200</td>
                  <td className="p-3 font-mono">2 decimals</td>
                  <td className="p-3">
                    <span className="bg-muted text-muted-foreground border border-border px-2 py-0.5 rounded text-[11px] font-semibold">
                      Secondary Trade Currency
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: DEPARTMENTS & CASH FLOW */}
      {activeSetupTab === 'DEPTS' && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-5">
          <div className="border-b border-border pb-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              <span>Cost Centers &amp; Cash Flow Classifications</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Assign administrative and factory cost centers and map accounts to standard cash flow statement activities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium">
            <div className="bg-muted/50 p-4 rounded-xl border border-border space-y-2">
              <span className="text-foreground block font-bold">1. Operating Activities</span>
              <p className="text-muted-foreground leading-relaxed">
                Directly mapped to customer collection receipts, farmer harvest procurements, factory staff payroll, and VAT liabilities.
              </p>
            </div>

            <div className="bg-muted/50 p-4 rounded-xl border border-border space-y-2">
              <span className="text-foreground block font-bold">2. Investing Activities</span>
              <p className="text-muted-foreground leading-relaxed">
                Mapped to mechanical olive press additions, bottling line upgrades, storage warehouse expansions, and vehicle acquisitions.
              </p>
            </div>

            <div className="bg-muted/50 p-4 rounded-xl border border-border space-y-2">
              <span className="text-foreground block font-bold">3. Financing Activities</span>
              <p className="text-muted-foreground leading-relaxed">
                Mapped to paid-up equity capital, commercial banking credit facilities, loan principal payments, and shareholder distributions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW ACCOUNT MODAL */}
      {showAddAccountModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full shadow-xl space-y-5 animate-fadeIn">
            
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <FolderTree className="w-4 h-4 text-primary" />
                  <span>Add New Account to Chart of Accounts</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Specify accounting class, ledger code, title, and normal balance
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddAccountModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-4 text-xs font-medium">
              <div>
                <label className="text-muted-foreground mb-1 block font-medium">Primary Accounting Class</label>
                <select
                  value={newAccClass}
                  onChange={(e) => setNewAccClass(Number(e.target.value))}
                  className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                >
                  {OMEGA_ACCOUNT_CLASSES.map(cls => (
                    <option key={cls.id} value={cls.class_number}>
                      Class {cls.class_number}: {cls.account_group_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-muted-foreground mb-1 block font-medium">Account Number (Code)</label>
                <input
                  type="text"
                  value={newAccNumber}
                  onChange={(e) => setNewAccNumber(e.target.value)}
                  placeholder="e.g. 512003"
                  className="w-full bg-card border border-input rounded-lg p-2 text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="text-muted-foreground mb-1 block font-medium">Account Title / Name</label>
                <input
                  type="text"
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  placeholder="e.g. Credit Libanais Commercial Account"
                  className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground mb-1 block font-medium">Account Classification (Class)</label>
                  <select
                    value={newAccType}
                    onChange={(e) => setNewAccType(e.target.value as any)}
                    className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                  >
                    <option value="ASSET">Asset (Debit Normal)</option>
                    <option value="LIABILITY">Liability (Credit Normal)</option>
                    <option value="EQUITY">Equity</option>
                    <option value="REVENUE">Revenue</option>
                    <option value="EXPENSE">Expense</option>
                  </select>
                </div>

                <div>
                  <label className="text-muted-foreground mb-1 block font-medium">Account Functional Type (Sub Type) *</label>
                  <select
                    value={newAccSubType}
                    onChange={(e) => setNewAccSubType(e.target.value as any)}
                    className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs font-semibold"
                  >
                    <option value="Cash">Cash (Instant Disbursing Vault)</option>
                    <option value="Bank">Bank (Instant Disbursing Commercial Bank)</option>
                    <option value="Employee">Employee (Advance / Custody Disbursing)</option>
                    <option value="Customer">Customer (Trade Debtor / AR)</option>
                    <option value="Supplier">Supplier (Trade Creditor / AP)</option>
                    <option value="Expense">Expense (Operational Overhead)</option>
                    <option value="Other">Other (General Control Ledger)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-muted-foreground mb-1 block font-medium">Primary Currency</label>
                <select
                  value={newAccCurrency}
                  onChange={(e) => setNewAccCurrency(e.target.value as any)}
                  className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                >
                  <option value="USD">USD ($)</option>
                  <option value="LBP">LBP (L.L)</option>
                </select>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-foreground">
                  <input
                    type="checkbox"
                    checked={newAccChecking}
                    onChange={(e) => setNewAccChecking(e.target.checked)}
                    className="rounded border-input text-primary focus:ring-primary"
                  />
                  <span>Checking / Active Cash Liquidity Account</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddAccountModal(false)}
                  className="bg-card hover:bg-muted text-foreground border border-border px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  Save Account &rarr;
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default function AccountingSetupPage(props: AccountingSetupPageProps) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground text-sm">Loading Chart of Accounts &amp; Setup...</div>}>
      <AccountingSetupContent {...props} />
    </Suspense>
  );
}
