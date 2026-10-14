'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  MapPin,
  Tag,
  Plus,
  Search,
  Edit2,
  Trash2,
  Printer,
  Download,
  RefreshCw,
  X,
  Check,
  CheckCircle2,
  AlertCircle,
  Phone,
  User,
  DollarSign,
  Truck,
  Layers,
  ArrowLeft,
  Percent,
  ShieldCheck
} from 'lucide-react';
import { useTenant } from '@/lib/TenantContext';
import { useLanguage } from '@/lib/LanguageContext';
import { toast } from '@/lib/toast';
import { printElementById } from '@/lib/utils/printDocument';
import {
  WholesaleAccountRecord,
  ZoneTerritoryRecord,
  CustomerCategoryRecord,
  CRM_UPDATED_EVENT,
  fetchWholesaleAccounts,
  persistWholesaleAccounts,
  fetchZoneTerritories,
  persistZoneTerritories,
  fetchCustomerCategories,
  persistCustomerCategories
} from '@/lib/crmSetupData';
import { fetchUnifiedDeliveryProviders } from '@/lib/deliveryProviders';

export type CrmSubModuleTab = 'wholesale-accounts' | 'zones-territories' | 'customer-categories';

interface CrmSubModulesViewProps {
  initialTab?: CrmSubModuleTab | string;
  onBack?: () => void;
  showBackNavigation?: boolean;
}

export default function CrmSubModulesView({
  initialTab = 'wholesale-accounts',
  onBack,
  showBackNavigation = true
}: CrmSubModulesViewProps) {
  const { currentTenant } = useTenant();
  const { t, dir } = useLanguage();
  const tenantId = currentTenant?.id;

  // Resolve normalized initial tab
  const normalizedInitialTab = useMemo<CrmSubModuleTab>(() => {
    const raw = (initialTab || '').toLowerCase();
    if (raw.includes('zone') || raw.includes('territor')) return 'zones-territories';
    if (raw.includes('categor')) return 'customer-categories';
    return 'wholesale-accounts';
  }, [initialTab]);

  const [activeTab, setActiveTab] = useState<CrmSubModuleTab>(normalizedInitialTab);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Datasets
  const [wholesaleAccounts, setWholesaleAccounts] = useState<WholesaleAccountRecord[]>([]);
  const [zones, setZones] = useState<ZoneTerritoryRecord[]>([]);
  const [categories, setCategories] = useState<CustomerCategoryRecord[]>([]);
  const [deliveryProviders, setDeliveryProviders] = useState<string[]>([]);

  // Modals & Editing states
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [editingAccount, setEditingAccount] = useState<WholesaleAccountRecord | null>(null);

  const [isZoneModalOpen, setIsZoneModalOpen] = useState<boolean>(false);
  const [editingZone, setEditingZone] = useState<ZoneTerritoryRecord | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<CustomerCategoryRecord | null>(null);

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: 'account' | 'zone' | 'category';
    id: string;
    name: string;
  } | null>(null);

  // Load all CRM sub-modules
  const loadData = async (showToast = false) => {
    setLoading(true);
    try {
      const [accs, zns, cats, dps] = await Promise.all([
        fetchWholesaleAccounts(tenantId),
        fetchZoneTerritories(tenantId),
        fetchCustomerCategories(tenantId),
        fetchUnifiedDeliveryProviders(tenantId)
      ]);
      setWholesaleAccounts(accs);
      setZones(zns);
      setCategories(cats);
      setDeliveryProviders(dps.map(p => p.name));
      if (showToast) {
        toast.success(t('crm_data_refreshed', 'CRM records refreshed successfully'));
      }
    } catch (err: any) {
      console.error('Error loading CRM data:', err);
      toast.error('Failed to load CRM data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleCrmUpdate = (e: any) => {
      if (e.detail?.type === 'wholesale') setWholesaleAccounts(e.detail.accounts);
      if (e.detail?.type === 'zones') setZones(e.detail.zones);
      if (e.detail?.type === 'categories') setCategories(e.detail.categories);
    };

    window.addEventListener(CRM_UPDATED_EVENT, handleCrmUpdate);
    return () => window.removeEventListener(CRM_UPDATED_EVENT, handleCrmUpdate);
  }, [tenantId]);

  // Sync prop changes if changed externally
  useEffect(() => {
    setActiveTab(normalizedInitialTab);
  }, [normalizedInitialTab]);

  /* =========================================================================
     WHOLESALE ACCOUNTS ACTIONS
     ========================================================================= */

  const handleOpenAddAccount = () => {
    const nextNum = wholesaleAccounts.length + 1001;
    setEditingAccount({
      id: `WHL-${nextNum}`,
      accountCode: `WHL-${nextNum}`,
      companyName: '',
      contactPerson: '',
      phone: '+961 ',
      territoryZone: zones[0]?.zoneName || 'Beirut Central & Metropolitan',
      creditLimitUsd: 10000,
      paymentTerms: 'Net 30',
      priceTier: 'Wholesale',
      status: 'Active'
    });
    setIsAccountModalOpen(true);
  };

  const handleSaveAccount = async (account: WholesaleAccountRecord) => {
    if (!account.companyName.trim()) {
      toast.error(t('company_name_required', 'Company / Business Name is required'));
      return;
    }
    if (!account.accountCode.trim()) {
      toast.error(t('account_code_required', 'Account Code is required'));
      return;
    }

    const isExisting = wholesaleAccounts.some(a => a.id === account.id);
    let updated: WholesaleAccountRecord[];
    if (isExisting) {
      updated = wholesaleAccounts.map(a => (a.id === account.id ? account : a));
    } else {
      updated = [account, ...wholesaleAccounts];
    }

    setWholesaleAccounts(updated);
    setIsAccountModalOpen(false);
    setEditingAccount(null);

    await persistWholesaleAccounts(updated, tenantId);
    toast.success(isExisting ? 'Wholesale account updated' : 'Wholesale account created');
  };

  const handleToggleAccountStatus = async (account: WholesaleAccountRecord) => {
    const nextStatus: 'Active' | 'On Hold' = account.status === 'Active' ? 'On Hold' : 'Active';
    const updated = wholesaleAccounts.map(a =>
      a.id === account.id ? { ...a, status: nextStatus } : a
    );
    setWholesaleAccounts(updated);
    await persistWholesaleAccounts(updated, tenantId);
    toast.success(`${account.companyName} is now ${nextStatus}`);
  };

  /* =========================================================================
     ZONES & TERRITORIES ACTIONS
     ========================================================================= */

  const handleOpenAddZone = () => {
    const nextCode = `ZN-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setEditingZone({
      id: nextCode,
      zoneCode: nextCode,
      zoneName: '',
      assignedSalesman: '',
      deliveryProvider: deliveryProviders[0] || 'SuperSonic Fleet Management (Internal)',
      activeCustomersCount: 0,
      status: 'Active'
    });
    setIsZoneModalOpen(true);
  };

  const handleSaveZone = async (zone: ZoneTerritoryRecord) => {
    if (!zone.zoneName.trim()) {
      toast.error(t('zone_name_required', 'Zone / Territory Name is required'));
      return;
    }
    if (!zone.zoneCode.trim()) {
      toast.error(t('zone_code_required', 'Zone Code is required'));
      return;
    }

    const isExisting = zones.some(z => z.id === zone.id);
    let updated: ZoneTerritoryRecord[];
    if (isExisting) {
      updated = zones.map(z => (z.id === zone.id ? zone : z));
    } else {
      updated = [zone, ...zones];
    }

    setZones(updated);
    setIsZoneModalOpen(false);
    setEditingZone(null);

    await persistZoneTerritories(updated, tenantId);
    toast.success(isExisting ? 'Zone updated' : 'Zone created');
  };

  const handleToggleZoneStatus = async (zone: ZoneTerritoryRecord) => {
    const nextStatus: 'Active' | 'Inactive' = zone.status === 'Active' ? 'Inactive' : 'Active';
    const updated = zones.map(z =>
      z.id === zone.id ? { ...z, status: nextStatus } : z
    );
    setZones(updated);
    await persistZoneTerritories(updated, tenantId);
    toast.success(`${zone.zoneName} is now ${nextStatus}`);
  };

  /* =========================================================================
     CUSTOMER CATEGORIES ACTIONS
     ========================================================================= */

  const handleOpenAddCategory = () => {
    const nextCode = `CAT-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setEditingCategory({
      id: nextCode,
      categoryCode: nextCode,
      categoryName: '',
      defaultPriceList: 'Wholesale',
      defaultDiscountPct: 0,
      taxExempt: false,
      status: 'Active'
    });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (category: CustomerCategoryRecord) => {
    if (!category.categoryName.trim()) {
      toast.error(t('category_name_required', 'Category Name is required'));
      return;
    }
    if (!category.categoryCode.trim()) {
      toast.error(t('category_code_required', 'Category Code is required'));
      return;
    }

    const isExisting = categories.some(c => c.id === category.id);
    let updated: CustomerCategoryRecord[];
    if (isExisting) {
      updated = categories.map(c => (c.id === category.id ? category : c));
    } else {
      updated = [category, ...categories];
    }

    setCategories(updated);
    setIsCategoryModalOpen(false);
    setEditingCategory(null);

    await persistCustomerCategories(updated, tenantId);
    toast.success(isExisting ? 'Category updated' : 'Category created');
  };

  const handleToggleCategoryStatus = async (cat: CustomerCategoryRecord) => {
    const nextStatus: 'Active' | 'Inactive' = cat.status === 'Active' ? 'Inactive' : 'Active';
    const updated = categories.map(c =>
      c.id === cat.id ? { ...c, status: nextStatus } : c
    );
    setCategories(updated);
    await persistCustomerCategories(updated, tenantId);
    toast.success(`${cat.categoryName} is now ${nextStatus}`);
  };

  /* =========================================================================
     DELETE CONFIRMATION HANDLER
     ========================================================================= */

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;
    const { type, id, name } = deleteConfirmation;

    if (type === 'account') {
      const updated = wholesaleAccounts.filter(a => a.id !== id);
      setWholesaleAccounts(updated);
      await persistWholesaleAccounts(updated, tenantId);
      toast.success(`Wholesale account "${name}" deleted`);
    } else if (type === 'zone') {
      const updated = zones.filter(z => z.id !== id);
      setZones(updated);
      await persistZoneTerritories(updated, tenantId);
      toast.success(`Zone "${name}" deleted`);
    } else if (type === 'category') {
      const updated = categories.filter(c => c.id !== id);
      setCategories(updated);
      await persistCustomerCategories(updated, tenantId);
      toast.success(`Category "${name}" deleted`);
    }

    setDeleteConfirmation(null);
  };

  /* =========================================================================
     CSV EXPORTS
     ========================================================================= */

  const handleExportCsv = () => {
    let filename = 'vanguard_crm_export.csv';
    let headers: string[] = [];
    let rows: string[][] = [];

    if (activeTab === 'wholesale-accounts') {
      filename = `vanguard_wholesale_accounts_${new Date().toISOString().slice(0, 10)}.csv`;
      headers = [
        'Account Code',
        'Company Name',
        'Contact Person',
        'Phone',
        'Territory Zone',
        'Credit Limit USD',
        'Payment Terms',
        'Price Tier',
        'Status'
      ];
      rows = filteredAccounts.map(a => [
        `"${a.accountCode}"`,
        `"${a.companyName.replace(/"/g, '""')}"`,
        `"${a.contactPerson.replace(/"/g, '""')}"`,
        `"${a.phone}"`,
        `"${a.territoryZone.replace(/"/g, '""')}"`,
        `"${a.creditLimitUsd}"`,
        `"${a.paymentTerms}"`,
        `"${a.priceTier}"`,
        `"${a.status}"`
      ]);
    } else if (activeTab === 'zones-territories') {
      filename = `vanguard_zones_territories_${new Date().toISOString().slice(0, 10)}.csv`;
      headers = [
        'Zone Code',
        'Zone Name',
        'Assigned Salesman',
        'Delivery Provider',
        'Active Customers Count',
        'Status'
      ];
      rows = filteredZones.map(z => [
        `"${z.zoneCode}"`,
        `"${z.zoneName.replace(/"/g, '""')}"`,
        `"${z.assignedSalesman.replace(/"/g, '""')}"`,
        `"${z.deliveryProvider.replace(/"/g, '""')}"`,
        `"${z.activeCustomersCount}"`,
        `"${z.status}"`
      ]);
    } else {
      filename = `vanguard_customer_categories_${new Date().toISOString().slice(0, 10)}.csv`;
      headers = [
        'Category Code',
        'Category Name',
        'Default Price List',
        'Default Discount Pct',
        'Tax Exempt',
        'Status'
      ];
      rows = filteredCategories.map(c => [
        `"${c.categoryCode}"`,
        `"${c.categoryName.replace(/"/g, '""')}"`,
        `"${c.defaultPriceList}"`,
        `"${c.defaultDiscountPct}%"`,
        `"${c.taxExempt ? 'Yes' : 'No'}"`,
        `"${c.status}"`
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Spreadsheet exported successfully');
  };

  /* =========================================================================
     PRINT DISPATCHER
     ========================================================================= */

  const handlePrint = () => {
    if (activeTab === 'wholesale-accounts') {
      printElementById('printable-wholesale-accounts', 'Wholesale Accounts Directory');
    } else if (activeTab === 'zones-territories') {
      printElementById('printable-zones-territories', 'Zones & Territories Directory');
    } else {
      printElementById('printable-customer-categories', 'Customer Categories Directory');
    }
  };

  /* =========================================================================
     FILTERED LISTS
     ========================================================================= */

  const filteredAccounts = useMemo(() => {
    return wholesaleAccounts.filter(a => {
      const q = searchQuery.toLowerCase();
      const matchQuery =
        !q ||
        a.accountCode.toLowerCase().includes(q) ||
        a.companyName.toLowerCase().includes(q) ||
        a.contactPerson.toLowerCase().includes(q) ||
        a.phone.toLowerCase().includes(q) ||
        a.territoryZone.toLowerCase().includes(q);
      const matchStatus =
        statusFilter === 'ALL' || a.status.toUpperCase() === statusFilter;
      return matchQuery && matchStatus;
    });
  }, [wholesaleAccounts, searchQuery, statusFilter]);

  const filteredZones = useMemo(() => {
    return zones.filter(z => {
      const q = searchQuery.toLowerCase();
      const matchQuery =
        !q ||
        z.zoneCode.toLowerCase().includes(q) ||
        z.zoneName.toLowerCase().includes(q) ||
        z.assignedSalesman.toLowerCase().includes(q) ||
        z.deliveryProvider.toLowerCase().includes(q);
      const matchStatus =
        statusFilter === 'ALL' || z.status.toUpperCase() === statusFilter;
      return matchQuery && matchStatus;
    });
  }, [zones, searchQuery, statusFilter]);

  const filteredCategories = useMemo(() => {
    return categories.filter(c => {
      const q = searchQuery.toLowerCase();
      const matchQuery =
        !q ||
        c.categoryCode.toLowerCase().includes(q) ||
        c.categoryName.toLowerCase().includes(q) ||
        c.defaultPriceList.toLowerCase().includes(q);
      const matchStatus =
        statusFilter === 'ALL' || c.status.toUpperCase() === statusFilter;
      return matchQuery && matchStatus;
    });
  }, [categories, searchQuery, statusFilter]);

  return (
    <div dir={dir} className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* 1. TOP HEADER & BREADCRUMB */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {showBackNavigation && onBack && (
            <button
              onClick={onBack}
              title="Return to Dashboard"
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center text-blue-600 shadow-2xs">
            {activeTab === 'wholesale-accounts' && <Building2 className="w-5 h-5" />}
            {activeTab === 'zones-territories' && <MapPin className="w-5 h-5" />}
            {activeTab === 'customer-categories' && <Tag className="w-5 h-5" />}
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-slate-900 flex items-center gap-2">
              {activeTab === 'wholesale-accounts' && t('wholesale_accounts_title', 'Wholesale Accounts & Credit Lines')}
              {activeTab === 'zones-territories' && t('zones_territories_title', 'Zones & Distribution Territories')}
              {activeTab === 'customer-categories' && t('customer_categories_title', 'Customer Categories & Price Tiers')}
              <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                CRM Master
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeTab === 'wholesale-accounts' && 'Configure B2B commercial terms, credit ceilings, and price tier assignments.'}
              {activeTab === 'zones-territories' && 'Manage geographic delivery sectors, designated sales reps, and carrier routes.'}
              {activeTab === 'customer-categories' && 'Classify customer segments with default price lists, discounts, and tax status.'}
            </p>
          </div>
        </div>

        {/* TOP ACTIONS */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
          {activeTab === 'wholesale-accounts' && (
            <button
              onClick={handleOpenAddAccount}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('add_account', '+ Add Account')}</span>
            </button>
          )}

          {activeTab === 'zones-territories' && (
            <button
              onClick={handleOpenAddZone}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('add_zone', '+ Add Zone')}</span>
            </button>
          )}

          {activeTab === 'customer-categories' && (
            <button
              onClick={handleOpenAddCategory}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('add_category', '+ Add Category')}</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2">
            <button
              onClick={handleExportCsv}
              title="Export CSV Spreadsheet"
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrint}
              title="Print Document"
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={() => loadData(true)}
              title="Refresh Records"
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. SUB-MODULE NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => { setActiveTab('wholesale-accounts'); setSearchQuery(''); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeTab === 'wholesale-accounts'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{t('wholesale_accounts', 'Wholesale Accounts')}</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            activeTab === 'wholesale-accounts' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'
          }`}>
            {wholesaleAccounts.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('zones-territories'); setSearchQuery(''); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeTab === 'zones-territories'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>{t('zones_territories', 'Zones & Territories')}</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            activeTab === 'zones-territories' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
          }`}>
            {zones.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('customer-categories'); setSearchQuery(''); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeTab === 'customer-categories'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>{t('customer_categories', 'Customer Categories')}</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            activeTab === 'customer-categories' ? 'bg-purple-500 text-white' : 'bg-slate-200 text-slate-600'
          }`}>
            {categories.length}
          </span>
        </button>
      </div>

      {/* 3. SEARCH & FILTER CONTROLS */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder={
              activeTab === 'wholesale-accounts'
                ? 'Search accounts by company, contact person, phone, zone...'
                : activeTab === 'zones-territories'
                ? 'Search zones by name, code, salesman, carrier...'
                : 'Search categories by name, code, price list...'
            }
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            {activeTab === 'wholesale-accounts' && <option value="ON HOLD">On Hold</option>}
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* =====================================================================
          VIEW TAB 1: WHOLESALE ACCOUNTS
          ===================================================================== */}
      {activeTab === 'wholesale-accounts' && (
        <div className="space-y-4">
          <div
            id="printable-wholesale-accounts"
            className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden"
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-xs md:text-sm">
                  Wholesale Accounts Directory & Commercial Terms
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {filteredAccounts.length} of {wholesaleAccounts.length} accounts
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Account Code</th>
                    <th className="py-3 px-4">Company / Business Name</th>
                    <th className="py-3 px-4">Contact Person</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Territory / Zone</th>
                    <th className="py-3 px-4">Credit Limit</th>
                    <th className="py-3 px-4">Payment Terms</th>
                    <th className="py-3 px-4">Price Tier</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        Loading wholesale accounts...
                      </td>
                    </tr>
                  ) : filteredAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        No wholesale accounts found matching your query.
                      </td>
                    </tr>
                  ) : (
                    filteredAccounts.map(account => (
                      <tr key={account.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">
                          {account.accountCode}
                        </td>
                        {/* High-contrast typography: text-slate-900 font-semibold */}
                        <td className="py-3 px-4 font-semibold text-slate-900 text-sm">
                          {account.companyName}
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {account.contactPerson || '-'}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {account.phone || '-'}
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          <span className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {account.territoryZone || 'Unassigned'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-emerald-700">
                          ${account.creditLimitUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            {account.paymentTerms}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium">
                          {account.priceTier}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleToggleAccountStatus(account)}
                            title="Click to toggle status"
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                              account.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : account.status === 'On Hold'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                                : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${account.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            {account.status}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => { setEditingAccount(account); setIsAccountModalOpen(true); }}
                              title="Edit Account"
                              className="p-1.5 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-lg transition cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmation({ type: 'account', id: account.id, name: account.companyName })}
                              title="Delete Account"
                              className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW TAB 2: ZONES & TERRITORIES
          ===================================================================== */}
      {activeTab === 'zones-territories' && (
        <div className="space-y-4">
          <div
            id="printable-zones-territories"
            className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden"
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-xs md:text-sm">
                  Geographic Zones & Distribution Sectors
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {filteredZones.length} of {zones.length} zones
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Zone Code</th>
                    <th className="py-3 px-4">Zone Name</th>
                    <th className="py-3 px-4">Assigned Salesman</th>
                    <th className="py-3 px-4">Delivery Carrier / Fleet</th>
                    <th className="py-3 px-4 text-center">Active Customers</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        Loading distribution zones...
                      </td>
                    </tr>
                  ) : filteredZones.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No zones found matching your query.
                      </td>
                    </tr>
                  ) : (
                    filteredZones.map(zone => (
                      <tr key={zone.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">
                          {zone.zoneCode}
                        </td>
                        {/* High-contrast typography: text-slate-900 font-semibold */}
                        <td className="py-3 px-4 font-semibold text-slate-900 text-sm">
                          {zone.zoneName}
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">
                          <span className="inline-flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {zone.assignedSalesman || 'Unassigned Rep'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          <span className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                            <Truck className="w-3 h-3 text-slate-400" />
                            {zone.deliveryProvider}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-blue-700">
                          {zone.activeCustomersCount} accounts
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleToggleZoneStatus(zone)}
                            title="Click to toggle status"
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                              zone.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${zone.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            {zone.status}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => { setEditingZone(zone); setIsZoneModalOpen(true); }}
                              title="Edit Zone"
                              className="p-1.5 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 rounded-lg transition cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmation({ type: 'zone', id: zone.id, name: zone.zoneName })}
                              title="Delete Zone"
                              className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW TAB 3: CUSTOMER CATEGORIES
          ===================================================================== */}
      {activeTab === 'customer-categories' && (
        <div className="space-y-4">
          <div
            id="printable-customer-categories"
            className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden"
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-xs md:text-sm">
                  Customer Categories, Pricing Tiers & VAT Classification
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {filteredCategories.length} of {categories.length} categories
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Category Code</th>
                    <th className="py-3 px-4">Category Name</th>
                    <th className="py-3 px-4">Default Price List</th>
                    <th className="py-3 px-4 text-center">Default Discount %</th>
                    <th className="py-3 px-4 text-center">Tax Exempt Status</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        Loading customer categories...
                      </td>
                    </tr>
                  ) : filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No categories found matching your query.
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map(cat => (
                      <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">
                          {cat.categoryCode}
                        </td>
                        {/* High-contrast typography: text-slate-900 font-semibold */}
                        <td className="py-3 px-4 font-semibold text-slate-900 text-sm">
                          {cat.categoryName}
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">
                          <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-800 border border-purple-200">
                            {cat.defaultPriceList}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-emerald-700">
                          {cat.defaultDiscountPct}%
                        </td>
                        <td className="py-3 px-4 text-center">
                          {cat.taxExempt ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Tax-Exempt
                            </span>
                          ) : (
                            <span className="inline-flex text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                              Standard VAT 11%
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleToggleCategoryStatus(cat)}
                            title="Click to toggle status"
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                              cat.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${cat.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            {cat.status}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => { setEditingCategory(cat); setIsCategoryModalOpen(true); }}
                              title="Edit Category"
                              className="p-1.5 hover:bg-purple-50 text-slate-500 hover:text-purple-600 rounded-lg transition cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmation({ type: 'category', id: cat.id, name: cat.categoryName })}
                              title="Delete Category"
                              className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 1: ADD / EDIT WHOLESALE ACCOUNT
          ===================================================================== */}
      {isAccountModalOpen && editingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {wholesaleAccounts.some(a => a.id === editingAccount.id)
                    ? 'Edit Wholesale Account'
                    : 'Create Wholesale Account'}
                </h3>
              </div>
              <button
                onClick={() => { setIsAccountModalOpen(false); setEditingAccount(null); }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Account Code *</label>
                <input
                  type="text"
                  value={editingAccount.accountCode}
                  onChange={e => setEditingAccount({ ...editingAccount, accountCode: e.target.value })}
                  placeholder="e.g. WHL-1001"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Status</label>
                <select
                  value={editingAccount.status}
                  onChange={e => setEditingAccount({ ...editingAccount, status: e.target.value as any })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="col-span-full space-y-1">
                <label className="font-bold text-slate-700">Company / Business Name *</label>
                <input
                  type="text"
                  value={editingAccount.companyName}
                  onChange={e => setEditingAccount({ ...editingAccount, companyName: e.target.value })}
                  placeholder="e.g. Al-Baraka Supermarket & Distribution"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Contact Person</label>
                <input
                  type="text"
                  value={editingAccount.contactPerson}
                  onChange={e => setEditingAccount({ ...editingAccount, contactPerson: e.target.value })}
                  placeholder="e.g. Hassan Baraka"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Phone</label>
                <input
                  type="text"
                  value={editingAccount.phone}
                  onChange={e => setEditingAccount({ ...editingAccount, phone: e.target.value })}
                  placeholder="e.g. +961 1 820 440"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Territory / Zone</label>
                <select
                  value={editingAccount.territoryZone}
                  onChange={e => setEditingAccount({ ...editingAccount, territoryZone: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {zones.map(z => (
                    <option key={z.id} value={z.zoneName}>
                      {z.zoneName}
                    </option>
                  ))}
                  <option value="Beirut Central & Metropolitan">Beirut Central & Metropolitan</option>
                  <option value="Mount Lebanon North">Mount Lebanon North</option>
                  <option value="South Lebanon (Saida & Tyre)">South Lebanon (Saida & Tyre)</option>
                  <option value="Bekaa Valley">Bekaa Valley</option>
                  <option value="North Lebanon">North Lebanon</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Credit Limit ($ USD)</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={editingAccount.creditLimitUsd}
                  onChange={e => setEditingAccount({ ...editingAccount, creditLimitUsd: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Payment Terms</label>
                <select
                  value={editingAccount.paymentTerms}
                  onChange={e => setEditingAccount({ ...editingAccount, paymentTerms: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                  <option value="Net 15">Net 15 Days</option>
                  <option value="Net 30">Net 30 Days</option>
                  <option value="Net 45">Net 45 Days</option>
                  <option value="Net 60">Net 60 Days</option>
                  <option value="Cheque 30 Days">Cheque 30 Days</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Price Tier</label>
                <select
                  value={editingAccount.priceTier}
                  onChange={e => setEditingAccount({ ...editingAccount, priceTier: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Wholesale">Wholesale Standard</option>
                  <option value="Wholesale Premium">Wholesale Premium</option>
                  <option value="HORECA Wholesale">HORECA Wholesale</option>
                  <option value="Distributor">Distributor Tier</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => { setIsAccountModalOpen(false); setEditingAccount(null); }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveAccount(editingAccount)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: ADD / EDIT ZONE & TERRITORY
          ===================================================================== */}
      {isZoneModalOpen && editingZone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {zones.some(z => z.id === editingZone.id) ? 'Edit Distribution Zone' : 'Create Distribution Zone'}
                </h3>
              </div>
              <button
                onClick={() => { setIsZoneModalOpen(false); setEditingZone(null); }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Zone Code *</label>
                <input
                  type="text"
                  value={editingZone.zoneCode}
                  onChange={e => setEditingZone({ ...editingZone, zoneCode: e.target.value.toUpperCase() })}
                  placeholder="e.g. ZN-BEIRUT"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Status</label>
                <select
                  value={editingZone.status}
                  onChange={e => setEditingZone({ ...editingZone, status: e.target.value as any })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="col-span-full space-y-1">
                <label className="font-bold text-slate-700">Zone Name *</label>
                <input
                  type="text"
                  value={editingZone.zoneName}
                  onChange={e => setEditingZone({ ...editingZone, zoneName: e.target.value })}
                  placeholder="e.g. Beirut Central & Metropolitan"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Assigned Salesman / Rep</label>
                <input
                  type="text"
                  value={editingZone.assignedSalesman}
                  onChange={e => setEditingZone({ ...editingZone, assignedSalesman: e.target.value })}
                  placeholder="e.g. Fadi Chemali"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Active Customers Count</label>
                <input
                  type="number"
                  min="0"
                  value={editingZone.activeCustomersCount}
                  onChange={e => setEditingZone({ ...editingZone, activeCustomersCount: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="col-span-full space-y-1">
                <label className="font-bold text-slate-700">Delivery Carrier / Fleet Provider</label>
                <select
                  value={editingZone.deliveryProvider}
                  onChange={e => setEditingZone({ ...editingZone, deliveryProvider: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {deliveryProviders.map((p, idx) => (
                    <option key={idx} value={p}>
                      {p}
                    </option>
                  ))}
                  <option value="SuperSonic Fleet Management (Internal)">SuperSonic Fleet Management (Internal)</option>
                  <option value="Aramex Lebanon International Cargo">Aramex Lebanon International Cargo</option>
                  <option value="DHL Express Fresh Cargo Logistics">DHL Express Fresh Cargo Logistics</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => { setIsZoneModalOpen(false); setEditingZone(null); }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveZone(editingZone)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Zone</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 3: ADD / EDIT CUSTOMER CATEGORY
          ===================================================================== */}
      {isCategoryModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {categories.some(c => c.id === editingCategory.id) ? 'Edit Customer Category' : 'Create Customer Category'}
                </h3>
              </div>
              <button
                onClick={() => { setIsCategoryModalOpen(false); setEditingCategory(null); }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Category Code *</label>
                <input
                  type="text"
                  value={editingCategory.categoryCode}
                  onChange={e => setEditingCategory({ ...editingCategory, categoryCode: e.target.value.toUpperCase() })}
                  placeholder="e.g. CAT-SUPERMARKET"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Status</label>
                <select
                  value={editingCategory.status}
                  onChange={e => setEditingCategory({ ...editingCategory, status: e.target.value as any })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="col-span-full space-y-1">
                <label className="font-bold text-slate-700">Category Name *</label>
                <input
                  type="text"
                  value={editingCategory.categoryName}
                  onChange={e => setEditingCategory({ ...editingCategory, categoryName: e.target.value })}
                  placeholder="e.g. Supermarkets & Hypermarkets"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Default Price List</label>
                <select
                  value={editingCategory.defaultPriceList}
                  onChange={e => setEditingCategory({ ...editingCategory, defaultPriceList: e.target.value as any })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Wholesale">Wholesale</option>
                  <option value="Retail">Retail</option>
                  <option value="HORECA">HORECA</option>
                  <option value="Distributor">Distributor</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Default Discount %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editingCategory.defaultDiscountPct}
                  onChange={e => setEditingCategory({ ...editingCategory, defaultDiscountPct: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="col-span-full flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="taxExemptCheckbox"
                  checked={editingCategory.taxExempt}
                  onChange={e => setEditingCategory({ ...editingCategory, taxExempt: e.target.checked })}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
                />
                <label htmlFor="taxExemptCheckbox" className="font-semibold text-slate-800 cursor-pointer">
                  Tax Exempt Classification (0% VAT applies by default)
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => { setIsCategoryModalOpen(false); setEditingCategory(null); }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveCategory(editingCategory)}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Category</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          DELETE CONFIRMATION MODAL
          ===================================================================== */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Confirm Deletion</h3>
              <p className="text-xs text-slate-600 mt-1">
                Are you sure you want to delete <span className="font-bold text-slate-900">&quot;{deleteConfirmation.name}&quot;</span>?
                This record will be permanently removed.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
