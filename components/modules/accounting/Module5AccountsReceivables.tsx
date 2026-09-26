'use client';
import { useLanguage } from '@/lib/LanguageContext';

/**
 * Vanguard ERP - Module 5: Accounts Receivables (AR Aging & CRM Station)
 * Exact Omega ERP Functional Parity:
 * A. Master Grid (Controls, Sortable Columns, Aging Buckets, 5 Action Icons)
 * B. 3 Comprehensive Modals:
 *    1. Send Statement Of Account Modal (Source emails with tooltip, recipient status table)
 *    2. Money Collection Modal (Promise date, status, history log grid)
 *    3. New Customer Comprehensive Profile Modal (Tab 1: Info, Tab 2: More)
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Printer,
  FileText,
  Send,
  DollarSign,
  Info,
  X,
  Plus,
  RefreshCw,
  HelpCircle,
  ArrowUpDown,
  Tag,
  MapPin,
  Check,
  Building,
  User,
  Calendar,
  Image as ImageIcon
} from 'lucide-react';
import {
  ARAgingItem,
  MoneyCollectionRecord,
  INITIAL_AR_AGING,
  INITIAL_MONEY_COLLECTION_LOGS,
  LBP_RATE
} from '@/lib/accountingData';

interface Module5AccountsReceivablesProps {
  onShowToast: (msg: string, isError?: boolean) => void;
  onOpenReceiptWithCustomer?: (accountCode: string, customerName: string) => void;
}

export function Module5AccountsReceivables({
  onShowToast,
  onOpenReceiptWithCustomer
}: Module5AccountsReceivablesProps) {
  const { t } = useLanguage();
  const [customers, setCustomers] = useState<ARAgingItem[]>(() => INITIAL_AR_AGING);
  const [selectedCustomerCodes, setSelectedCustomerCodes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showZeroBalances, setShowZeroBalances] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<'customer' | 'amount' | 'lastPayment'>('amount');
  const [sortAsc, setSortAsc] = useState(false);

  // Modals state
  const [statementModalCustomer, setStatementModalCustomer] = useState<ARAgingItem | null>(null);
  const [moneyColCustomer, setMoneyColCustomer] = useState<ARAgingItem | null>(null);
  const [newCustomerModalOpen, setNewCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<ARAgingItem | null>(null);

  // 1. Send Statement Modal State
  const [sourceEmail, setSourceEmail] = useState('billing@vanguard-holdings.lb');
  const [otherEmails, setOtherEmails] = useState('');
  const [statementTemplate, setStatementTemplate] = useState('Standard Overdue Notice & Ledger Statement');

  // 2. Money Collection Modal State
  const [collectionLogs, setCollectionLogs] = useState<MoneyCollectionRecord[]>(
    () => INITIAL_MONEY_COLLECTION_LOGS
  );
  const [colType, setColType] = useState<'N/A' | 'Amount Ready' | 'Call Him Back'>('N/A');
  const [colDatePromised, setColDatePromised] = useState(() => new Date().toISOString().split('T')[0]);
  const [colRemarks, setColRemarks] = useState('');

  // 3. New Customer Modal State (2 Tabs)
  const [activeCustTab, setActiveCustTab] = useState<'INFO' | 'MORE'>('INFO');
  const [custForm, setCustForm] = useState<Partial<ARAgingItem>>({
    title: 'Mr.',
    firstName: '',
    lastName: '',
    company: '',
    commercialName: '',
    group: 'Wholesale Retailers',
    mobile: '+961 ',
    email: '',
    landline: '',
    contactPerson: '',
    street: '',
    building: '',
    floor: '',
    city: 'Beirut',
    state: 'Beirut Governorate',
    country: 'Lebanon',
    near: '',
    zipCode: '',
    zone: '',
    lat: 33.8938,
    lng: 35.5018,
    remark1: '',
    discountType: 'Null',
    discountPercent: 0,
    creditLimit: 10000,
    dailyLimit: 2000,
    sellingPriceLevel: 1,
    vatAccountNumber: '',
    membershipCode: '',
    membershipExpiry: '',
    membershipNumber: '',
    birthday: ''
  });

  // Tag color picker modal state
  const [showTagModal, setShowTagModal] = useState(false);
  const [newTagLabel, setNewTagLabel] = useState('');
  const [newTagColor, setNewTagColor] = useState('#16a34a');

  // Filtered & Sorted Customers
  const filteredCustomers = useMemo(() => {
    let list = [...customers];

    if (!showZeroBalances) {
      list = list.filter((c) => c.totalDebt > 0);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.customerName.toLowerCase().includes(q) ||
          c.accountCode.toLowerCase().includes(q) ||
          (c.email && c.email.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => {
      if (sortField === 'customer') {
        return sortAsc ? a.customerName.localeCompare(b.customerName) : b.customerName.localeCompare(a.customerName);
      }
      if (sortField === 'lastPayment') {
        return sortAsc ? a.lastPaymentDate.localeCompare(b.lastPaymentDate) : b.lastPaymentDate.localeCompare(a.lastPaymentDate);
      }
      return sortAsc ? a.totalDebt - b.totalDebt : b.totalDebt - a.totalDebt;
    });

    return list;
  }, [customers, showZeroBalances, searchQuery, sortField, sortAsc]);

  const totalAmountUSD = filteredCustomers.reduce((sum, c) => sum + c.totalDebt, 0);

  // Row selection toggle
  const handleToggleSelectRow = (code: string) => {
    setSelectedCustomerCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleSelectAll = () => {
    if (selectedCustomerCodes.length === filteredCustomers.length) {
      setSelectedCustomerCodes([]);
    } else {
      setSelectedCustomerCodes(filteredCustomers.map((c) => c.accountCode));
    }
  };

  // Money Collection Save
  const handleSaveCollection = () => {
    if (!moneyColCustomer) return;
    const newRecord: MoneyCollectionRecord = {
      id: `col-${Date.now()}`,
      accountNumber: moneyColCustomer.accountCode,
      accountName: moneyColCustomer.customerName,
      dateCreated: new Date().toLocaleString(),
      type: colType,
      remark: colRemarks || 'Follow up logged.',
      datePromised: colDatePromised,
      byUser: 'Credit Manager'
    };
    setCollectionLogs((prev) => [newRecord, ...prev]);
    onShowToast(`Promise record saved for ${moneyColCustomer.customerName}.`);
    setColRemarks('');
    setMoneyColCustomer(null);
  };

  // Save New Customer
  const handleSaveNewCustomer = () => {
    if (!custForm.firstName || !custForm.lastName) {
      onShowToast('Please fill First Name* and Last Name*.', true);
      return;
    }

    const nextCode = `41110-${Math.floor(10 + Math.random() * 90)}`;
    const newCust: ARAgingItem = {
      accountCode: nextCode,
      customerName: `${custForm.firstName} ${custForm.lastName} (${custForm.company || 'Enterprise'})`,
      current: 0,
      days30: 0,
      days60: 0,
      days90Plus: 0,
      overDue: 0,
      lastPaymentDate: new Date().toISOString().split('T')[0],
      totalDebt: 0,
      creditLimit: Number(custForm.creditLimit) || 10000,
      risk: 'LOW',
      ...custForm
    } as ARAgingItem;

    setCustomers((prev) => [newCust, ...prev]);
    onShowToast(`New Customer "${newCust.customerName}" profile saved with Account #${nextCode}!`);
    setNewCustomerModalOpen(false);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* ========================================================================= */}
      {/* A. MASTER GRID                                                            */}
      {/* ========================================================================= */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
        {/* Controls Bar: Search... input | Show 0 Balances Checkbox | Total Amount: 0.00 $ */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Accounts Receivables (AR Aging &amp; CRM Station)</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('aging_schedule_analysis_credit_control', 'Aging schedule analysis, credit control, money collection promise tracking, and customer profiles')}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setCustForm({
                title: 'Mr.',
                firstName: '',
                lastName: '',
                company: '',
                commercialName: '',
                group: 'Wholesale Retailers',
                mobile: '+961 ',
                email: '',
                landline: '',
                contactPerson: '',
                street: '',
                building: '',
                floor: '',
                city: 'Beirut',
                state: 'Beirut Governorate',
                country: 'Lebanon',
                creditLimit: 15000,
                dailyLimit: 3000,
                sellingPriceLevel: 1
              });
              setNewCustomerModalOpen(true);
            }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New Customer</span>
          </button>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-medium">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search... input */}
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search', 'Search...')}
                className="w-full bg-card border border-input rounded-lg pl-8 pr-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
              />
            </div>

            {/* Show 0 Balances Checkbox */}
            <label className="flex items-center gap-2 text-foreground font-semibold cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showZeroBalances}
                onChange={(e) => setShowZeroBalances(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary h-4 w-4"
              />
              <span>{t('show_0_balances', 'Show 0 Balances')}</span>
            </label>
          </div>

          {/* Total Amount Indicator */}
          <div className="bg-muted px-4 py-2 rounded-xl border border-border">
            <span className="text-muted-foreground text-[11px] block">{t('total_receivables', 'Total Receivables:')}</span>
            <span className="font-mono text-base font-bold text-emerald-700">
              Total Amount: ${totalAmountUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* MASTER TABLE */}
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-muted text-foreground font-semibold border-b border-border select-none">
                <th className="p-2.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredCustomers.length > 0 &&
                      selectedCustomerCodes.length === filteredCustomers.length
                    }
                    onChange={handleSelectAll}
                    className="rounded border-input text-primary focus:ring-primary h-3.5 w-3.5"
                  />
                </th>
                <th
                  className="p-2.5 cursor-pointer hover:bg-muted/80 transition-colors"
                  onClick={() => {
                    setSortField('customer');
                    setSortAsc((p) => !p);
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>{t('customer', 'Customer')}</span>
                    <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                  </div>
                </th>
                <th
                  className="p-2.5 text-right cursor-pointer hover:bg-muted/80 transition-colors"
                  onClick={() => {
                    setSortField('amount');
                    setSortAsc((p) => !p);
                  }}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Amount ($)</span>
                    <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                  </div>
                </th>
                <th
                  className="p-2.5 cursor-pointer hover:bg-muted/80 transition-colors"
                  onClick={() => {
                    setSortField('lastPayment');
                    setSortAsc((p) => !p);
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>{t('last_payment_date', 'Last Payment Date')}</span>
                    <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                  </div>
                </th>
                <th className="p-2.5 text-right">30 Days</th>
                <th className="p-2.5 text-right">60 Days</th>
                <th className="p-2.5 text-right">90 Days</th>
                <th className="p-2.5 text-right text-destructive">{t('over_due', 'Over Due')}</th>
                <th className="p-2.5 text-center min-w-[160px]">{t('actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-muted-foreground">
                    {t('no_receivables_found', 'No Receivables Found!')}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const isChecked = selectedCustomerCodes.includes(cust.accountCode);
                  return (
                    <tr
                      key={cust.accountCode}
                      className={`hover:bg-muted/40 transition-colors ${isChecked ? 'bg-primary/5' : ''}`}
                    >
                      {/* Row Checkbox */}
                      <td className="p-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelectRow(cust.accountCode)}
                          className="rounded border-input text-primary focus:ring-primary h-3.5 w-3.5"
                        />
                      </td>

                      {/* Customer */}
                      <td className="p-2.5">
                        <div className="font-semibold text-foreground">{cust.customerName}</div>
                        <div className="text-[10px] font-mono text-muted-foreground">
                          Code: #{cust.accountCode} | Limit: ${cust.creditLimit.toLocaleString()}
                        </div>
                      </td>

                      {/* Amount ($) */}
                      <td className="p-2.5 font-mono font-bold text-foreground text-right">
                        ${cust.totalDebt.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      {/* Last Payment Date */}
                      <td className="p-2.5 font-mono text-muted-foreground text-[11px]">
                        {cust.lastPaymentDate}
                      </td>

                      {/* Aging Buckets */}
                      <td className="p-2.5 font-mono text-muted-foreground text-right">
                        ${cust.days30.toLocaleString()}
                      </td>
                      <td className="p-2.5 font-mono text-muted-foreground text-right">
                        ${cust.days60.toLocaleString()}
                      </td>
                      <td className="p-2.5 font-mono text-muted-foreground text-right">
                        ${cust.days90Plus.toLocaleString()}
                      </td>
                      <td className="p-2.5 font-mono font-bold text-destructive text-right">
                        ${cust.overDue.toLocaleString()}
                      </td>

                      {/* 5 Action Icons per customer row */}
                      <td className="p-2.5">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* 1. Paper Airplane -> Send Statement Of Account Modal */}
                          <button
                            type="button"
                            onClick={() => setStatementModalCustomer(cust)}
                            title={t('send_statement_of_account', 'Send Statement Of Account')}
                            className="text-muted-foreground hover:text-primary p-1 rounded hover:bg-muted transition-colors cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>

                          {/* 2. Report / Printer -> Opens Statement of Account Report */}
                          <button
                            type="button"
                            onClick={() => {
                              if (typeof window !== 'undefined') window.print();
                            }}
                            title={t('print_statement_report', 'Print Statement Report')}
                            className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted transition-colors cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* 3. Document -> Opens Accounting Receipt pre-filled */}
                          <button
                            type="button"
                            onClick={() => {
                              if (onOpenReceiptWithCustomer) {
                                onOpenReceiptWithCustomer(cust.accountCode, cust.customerName);
                              } else {
                                onShowToast(`Opened Accounting Receipt for ${cust.customerName}.`);
                              }
                            }}
                            title={t('open_accounting_receipt', 'Open Accounting Receipt')}
                            className="text-muted-foreground hover:text-emerald-700 p-1 rounded hover:bg-muted transition-colors cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          {/* 4. Green Money Bill -> Money Collection Modal */}
                          <button
                            type="button"
                            onClick={() => setMoneyColCustomer(cust)}
                            title={t('money_collection_promise', 'Money Collection Promise')}
                            className="text-emerald-600 hover:text-emerald-700 p-1 rounded hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            <DollarSign className="w-3.5 h-3.5 font-bold" />
                          </button>

                          {/* 5. Info (i) -> New Customer Comprehensive Profile Modal */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCustomer(cust);
                              setCustForm({ ...cust });
                              setNewCustomerModalOpen(true);
                            }}
                            title={t('view_edit_customer_profile', 'View / Edit Customer Profile')}
                            className="text-muted-foreground hover:text-primary p-1 rounded hover:bg-muted transition-colors cursor-pointer"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* B. AR MODALS SPECIFICATION                                                */}
      {/* ========================================================================= */}

      {/* 1. SEND STATEMENT OF ACCOUNT MODAL */}
      {statementModalCustomer && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Send className="w-4 h-4 text-primary" />
                <span>{t('send_statement_of_account', 'Send Statement Of Account')}</span>
              </h4>
              <button
                type="button"
                onClick={() => setStatementModalCustomer(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs font-medium">
              {/* From (Source email dropdown + Tooltip) */}
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <label className="text-foreground font-semibold">{t('from', 'From:')}</label>
                  <span
                    className="text-muted-foreground cursor-help"
                    title="Source emails are defined in Settings / Company Info / Email Setting, only admins can add, edit or delete the source emails."
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-primary" />
                  </span>
                </div>
                <select
                  value={sourceEmail}
                  onChange={(e) => setSourceEmail(e.target.value)}
                  className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                >
                  <option value="billing@vanguard-holdings.lb">billing@vanguard-holdings.lb (Corporate Billing)</option>
                  <option value="ar@vanguard-holdings.lb">ar@vanguard-holdings.lb (Credit &amp; Collections)</option>
                  <option value="treasury@vanguard-holdings.lb">treasury@vanguard-holdings.lb (Treasury Dept)</option>
                </select>
              </div>

              {/* To Account (Read-only customer account name) */}
              <div>
                <label className="text-foreground mb-1 block font-semibold">{t('to_account', 'To Account:')}</label>
                <input
                  type="text"
                  readOnly
                  value={`${statementModalCustomer.customerName} (#${statementModalCustomer.accountCode})`}
                  className="w-full bg-muted border border-input rounded-lg p-2 text-foreground font-medium shadow-2xs cursor-not-allowed"
                />
              </div>

              {/* Other Emails (Text input for CC recipients) */}
              <div>
                <label className="text-foreground mb-1 block font-semibold">Other Emails (CC):</label>
                <input
                  type="text"
                  value={otherEmails}
                  onChange={(e) => setOtherEmails(e.target.value)}
                  placeholder={t('financeteamclientcom_accountantclientcom', 'finance-team@client.com, accountant@client.com')}
                  className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                />
              </div>

              {/* Receivable Template */}
              <div>
                <label className="text-foreground mb-1 block font-semibold">{t('receivable_template', 'Receivable Template:')}</label>
                <select
                  value={statementTemplate}
                  onChange={(e) => setStatementTemplate(e.target.value)}
                  className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                >
                  <option>Standard Overdue Notice &amp; Ledger Statement</option>
                  <option>{t('monthly_commercial_statement_of_account', 'Monthly Commercial Statement of Account')}</option>
                  <option>Urgent Payment Demand (Overdue &gt; 60 Days)</option>
                </select>
              </div>

              {/* Sub-table: Recipient | Status */}
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted border-b border-border text-foreground font-semibold">
                    <tr>
                      <th className="p-2">{t('recipient', 'Recipient')}</th>
                      <th className="p-2 text-right">{t('status', 'Status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="p-2 text-foreground font-mono">
                        {statementModalCustomer.email || 'billing@client-firm.lb'}
                      </td>
                      <td className="p-2 text-right text-emerald-700 font-bold">{t('ready_to_dispatch', 'Ready to Dispatch')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action: Send button */}
            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setStatementModalCustomer(null)}
                className="bg-card hover:bg-muted text-muted-foreground px-4 py-1.5 rounded-lg text-xs font-semibold border border-border cursor-pointer"
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  onShowToast(`Statement of Account dispatched to ${statementModalCustomer.customerName}!`);
                  setStatementModalCustomer(null);
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t('send', 'Send')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MONEY COLLECTION MODAL */}
      {moneyColCustomer && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>{t('money_collection_workstation', 'Money Collection Workstation')}</span>
                </h4>
                {/* Header: Displays Account Name & Account Number (Read-only) */}
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                  {t('account', 'Account:')} <strong className="text-foreground">{moneyColCustomer.customerName}</strong> (#{moneyColCustomer.accountCode})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMoneyColCustomer(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-medium">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Type* (N/A by default, Amount Ready, Call Him Back) */}
                <div>
                  <label className="text-foreground mb-1 block font-semibold">{t('type', 'Type *')}</label>
                  <select
                    value={colType}
                    onChange={(e) => setColType(e.target.value as any)}
                    className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                  >
                    <option value="N/A">{t('na', 'N/A')}</option>
                    <option value="Amount Ready">{t('amount_ready', 'Amount Ready')}</option>
                    <option value="Call Him Back">{t('call_him_back', 'Call Him Back')}</option>
                  </select>
                </div>

                {/* Date Promised* */}
                <div>
                  <label className="text-foreground mb-1 block font-semibold">{t('date_promised', 'Date Promised *')}</label>
                  <input
                    type="date"
                    value={colDatePromised}
                    onChange={(e) => setColDatePromised(e.target.value)}
                    className="w-full bg-card border border-input rounded-lg p-2 text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                  />
                </div>
              </div>

              {/* Remarks (Textarea) */}
              <div>
                <label className="text-foreground mb-1 block font-semibold">{t('remarks', 'Remarks')}</label>
                <textarea
                  rows={2}
                  value={colRemarks}
                  onChange={(e) => setColRemarks(e.target.value)}
                  placeholder={t('record_customer_commitment_details', 'Record customer commitment details, promised cheque numbers, collector notes...')}
                  className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs text-xs"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveCollection}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                >
                  {t('save_collection_note', 'Save Collection Note')}
                </button>
              </div>

              {/* History Log Grid: Date Created | Type | Remark | Date Promised | By User */}
              <div className="pt-2">
                <label className="font-semibold text-foreground mb-1.5 block">{t('history_log', 'History Log:')}</label>
                <div className="overflow-y-auto max-h-48 rounded-lg border border-border">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted border-b border-border text-foreground font-semibold">
                      <tr>
                        <th className="p-2">{t('date_created', 'Date Created')}</th>
                        <th className="p-2">{t('type', 'Type')}</th>
                        <th className="p-2 min-w-[160px]">{t('remark', 'Remark')}</th>
                        <th className="p-2">{t('date_promised', 'Date Promised')}</th>
                        <th className="p-2">{t('by_user', 'By User')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {collectionLogs
                        .filter((l) => l.accountNumber === moneyColCustomer.accountCode)
                        .map((l) => (
                          <tr key={l.id} className="hover:bg-muted/40">
                            <td className="p-2 font-mono text-muted-foreground text-[11px]">
                              {l.dateCreated}
                            </td>
                            <td className="p-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-foreground border border-border">
                                {l.type}
                              </span>
                            </td>
                            <td className="p-2 text-foreground">{l.remark}</td>
                            <td className="p-2 font-mono font-bold text-emerald-700">
                              {l.datePromised}
                            </td>
                            <td className="p-2 text-muted-foreground">{l.byUser}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setMoneyColCustomer(null)}
                className="bg-card hover:bg-muted text-foreground border border-border px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
              >
                {t('close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. NEW CUSTOMER MODAL (FULL PROFILE WITH TABS: INFO & MORE) */}
      {newCustomerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col p-5 space-y-4">
            {/* Header: Accounting Company Name, Account Name, Account Number */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <span>{editingCustomer ? 'Edit Customer Profile' : 'New Customer (Full Profile)'}</span>
                </h4>
                <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-3">
                  <span>{t('company', 'Company:')} <strong>{t('southern_olive_oil_products_sarl', 'Southern Olive Oil Products S.A.R.L')}</strong></span>
                  <span>|</span>
                  <span>{t('account', 'Account:')} <strong>{custForm.customerName || 'Trade Receivable'}</strong></span>
                  <span>|</span>
                  <span>{t('account', 'Account #:')} <strong>{custForm.accountCode || '41110-AUTO'}</strong></span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNewCustomerModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab Navigation: Tab 1 (Info), Tab 2 (More) */}
            <div className="flex items-center gap-2 border-b border-border pb-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveCustTab('INFO')}
                className={`px-4 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeCustTab === 'INFO'
                    ? 'bg-primary text-primary-foreground shadow-2xs'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {t('tab_1_info', 'Tab 1: Info')}
              </button>
              <button
                type="button"
                onClick={() => setActiveCustTab('MORE')}
                className={`px-4 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeCustTab === 'MORE'
                    ? 'bg-primary text-primary-foreground shadow-2xs'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {t('tab_2_more', 'Tab 2: More')}
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 max-h-[60vh] space-y-4 pr-1 text-xs font-medium">
              {/* TAB 1: INFO */}
              {activeCustTab === 'INFO' && (
                <div className="space-y-4">
                  {/* Profile Section */}
                  <div className="bg-muted/40 p-3.5 rounded-xl border border-border space-y-3">
                    <span className="font-bold text-foreground block">{t('profile_section', 'Profile Section')}</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-foreground mb-1 block font-semibold">{t('title', 'Title *')}</label>
                        <select
                          value={custForm.title}
                          onChange={(e) => setCustForm({ ...custForm, title: e.target.value })}
                          className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs"
                        >
                          <option value="Mr.">{t('mr', 'Mr.')}</option>
                          <option value="Ms.">{t('ms', 'Ms.')}</option>
                          <option value="Dr.">{t('dr', 'Dr.')}</option>
                          <option value="Eng.">{t('eng', 'Eng.')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-foreground mb-1 block font-semibold">{t('first_name', 'First Name *')}</label>
                        <input
                          type="text"
                          value={custForm.firstName || ''}
                          onChange={(e) => setCustForm({ ...custForm, firstName: e.target.value })}
                          className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="text-foreground mb-1 block font-semibold">{t('last_name', 'Last Name *')}</label>
                        <input
                          type="text"
                          value={custForm.lastName || ''}
                          onChange={(e) => setCustForm({ ...custForm, lastName: e.target.value })}
                          className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="text-muted-foreground mb-1 block">{t('company', 'Company')}</label>
                        <input
                          type="text"
                          value={custForm.company || ''}
                          onChange={(e) => setCustForm({ ...custForm, company: e.target.value })}
                          className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="text-muted-foreground mb-1 block">{t('commercial_name', 'Commercial Name')}</label>
                        <input
                          type="text"
                          value={custForm.commercialName || ''}
                          onChange={(e) => setCustForm({ ...custForm, commercialName: e.target.value })}
                          className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="text-foreground mb-1 block font-semibold flex items-center justify-between">
                          <span>{t('group', 'Group *')}</span>
                          <button
                            type="button"
                            onClick={() => onShowToast('Add customer group modal opened.')}
                            className="text-primary text-[10px] hover:underline cursor-pointer"
                          >
                            + Add Group
                          </button>
                        </label>
                        <select
                          value={custForm.group}
                          onChange={(e) => setCustForm({ ...custForm, group: e.target.value })}
                          className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs"
                        >
                          <option>{t('wholesale_key_accounts', 'Wholesale Key Accounts')}</option>
                          <option>{t('regional_distributors', 'Regional Distributors')}</option>
                          <option>Hotels &amp; Restaurants (HORECA)</option>
                          <option>{t('gourmet_delicatessen', 'Gourmet Delicatessen')}</option>
                          <option>Dining &amp; Catering</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Contacts Section: Mobile* (+961), Email, Landline, Contact Person */}
                  <div className="bg-muted/40 p-3.5 rounded-xl border border-border space-y-3">
                    <span className="font-bold text-foreground block">{t('contacts_section', 'Contacts Section')}</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="text-foreground mb-1 block font-semibold">Mobile * (Prefix +961)</label>
                        <input
                          type="text"
                          value={custForm.mobile || ''}
                          onChange={(e) => setCustForm({ ...custForm, mobile: e.target.value })}
                          placeholder="+961 71 000 000"
                          className="w-full bg-card border border-input rounded-lg p-2 text-foreground font-mono shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="text-muted-foreground mb-1 block">{t('email', 'Email')}</label>
                        <input
                          type="email"
                          value={custForm.email || ''}
                          onChange={(e) => setCustForm({ ...custForm, email: e.target.value })}
                          placeholder={t('clientdomainlb', 'client@domain.lb')}
                          className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="text-muted-foreground mb-1 block">{t('landline', 'Landline')}</label>
                        <input
                          type="text"
                          value={custForm.landline || ''}
                          onChange={(e) => setCustForm({ ...custForm, landline: e.target.value })}
                          placeholder="+961 1 000 000"
                          className="w-full bg-card border border-input rounded-lg p-2 text-foreground font-mono shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="text-muted-foreground mb-1 block">{t('contact_person', 'Contact Person')}</label>
                        <input
                          type="text"
                          value={custForm.contactPerson || ''}
                          onChange={(e) => setCustForm({ ...custForm, contactPerson: e.target.value })}
                          placeholder={t('managing_representative', 'Managing representative...')}
                          className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address Section: Street, Building, Floor, City, State, Country*, Near, Zip, Zone, Lat, Lng, Remark */}
                  <div className="bg-muted/40 p-3.5 rounded-xl border border-border space-y-3">
                    <span className="font-bold text-foreground block">{t('address_section', 'Address Section')}</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="text-muted-foreground mb-1 block">{t('street', 'Street')}</label>
                        <input
                          type="text"
                          value={custForm.street || ''}
                          onChange={(e) => setCustForm({ ...custForm, street: e.target.value })}
                          className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="text-muted-foreground mb-1 block">{t('building', 'Building')}</label>
                        <input
                          type="text"
                          value={custForm.building || ''}
                          onChange={(e) => setCustForm({ ...custForm, building: e.target.value })}
                          className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="text-muted-foreground mb-1 block">{t('floor', 'Floor')}</label>
                        <input
                          type="text"
                          value={custForm.floor || ''}
                          onChange={(e) => setCustForm({ ...custForm, floor: e.target.value })}
                          className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="text-muted-foreground mb-1 block">City (Lookup)</label>
                        <input
                          type="text"
                          value={custForm.city || ''}
                          onChange={(e) => setCustForm({ ...custForm, city: e.target.value })}
                          className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="text-muted-foreground mb-1 block">State (Lookup)</label>
                        <input
                          type="text"
                          value={custForm.state || ''}
                          onChange={(e) => setCustForm({ ...custForm, state: e.target.value })}
                          className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="text-foreground mb-1 block font-semibold">{t('country', 'Country *')}</label>
                        <select
                          value={custForm.country}
                          onChange={(e) => setCustForm({ ...custForm, country: e.target.value })}
                          className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs"
                        >
                          <option value="Lebanon">{t('lebanon', 'Lebanon')}</option>
                          <option value="United Arab Emirates">{t('united_arab_emirates', 'United Arab Emirates')}</option>
                          <option value="Saudi Arabia">{t('saudi_arabia', 'Saudi Arabia')}</option>
                          <option value="Cyprus">{t('cyprus', 'Cyprus')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-muted-foreground mb-1 block">{t('near_landmark', 'Near / Landmark')}</label>
                        <input
                          type="text"
                          value={custForm.near || ''}
                          onChange={(e) => setCustForm({ ...custForm, near: e.target.value })}
                          className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="text-muted-foreground mb-1 block">{t('zip_postal_code', 'Zip / Postal Code')}</label>
                        <input
                          type="text"
                          value={custForm.zipCode || ''}
                          onChange={(e) => setCustForm({ ...custForm, zipCode: e.target.value })}
                          className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-muted-foreground mb-1 block">Zone (Search)</label>
                        <input
                          type="text"
                          value={custForm.zone || ''}
                          onChange={(e) => setCustForm({ ...custForm, zone: e.target.value })}
                          placeholder={t('zone_code', 'Zone Code...')}
                          className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="text-muted-foreground mb-1 block">{t('lat', 'Lat')}</label>
                        <input
                          type="number"
                          step="0.0001"
                          value={custForm.lat || ''}
                          onChange={(e) => setCustForm({ ...custForm, lat: Number(e.target.value) })}
                          className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-muted-foreground mb-1 block">{t('lng', 'Lng')}</label>
                        <input
                          type="number"
                          step="0.0001"
                          value={custForm.lng || ''}
                          onChange={(e) => setCustForm({ ...custForm, lng: Number(e.target.value) })}
                          className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-muted-foreground mb-1 block">{t('remark', 'Remark')}</label>
                        <input
                          type="text"
                          value={custForm.remark1 || ''}
                          onChange={(e) => setCustForm({ ...custForm, remark1: e.target.value })}
                          placeholder={t('delivery_instructions', 'Delivery instructions...')}
                          className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MORE */}
              {activeCustTab === 'MORE' && (
                <div className="space-y-4">
                  {/* Billing Section: Automatic Discount, Discount %, Credit Limit, Daily Limit, Selling Price Level, Contact Person, Account Number, VAT Account Number */}
                  <div className="bg-muted/40 p-3.5 rounded-xl border border-border space-y-3">
                    <span className="font-bold text-foreground block">{t('billing_section', 'Billing Section')}</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="text-muted-foreground mb-1 block">{t('automatic_discount', 'Automatic Discount')}</label>
                        <select
                          value={custForm.discountType}
                          onChange={(e) => setCustForm({ ...custForm, discountType: e.target.value as any })}
                          className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs"
                        >
                          <option value="Null">{t('null', 'Null')}</option>
                          <option value="DISCOUNT">{t('discount', 'DISCOUNT')}</option>
                          <option value="DISCOUNT 100%">{t('discount_100', 'DISCOUNT 100%')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-muted-foreground mb-1 block">{t('discount', 'Discount %')}</label>
                        <input
                          type="number"
                          value={custForm.discountPercent || 0}
                          onChange={(e) => setCustForm({ ...custForm, discountPercent: Number(e.target.value) })}
                          className="w-full bg-card border border-input rounded-lg p-2 text-foreground font-mono shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="text-muted-foreground mb-1 block">Credit Limit ($)</label>
                        <input
                          type="number"
                          value={custForm.creditLimit || 0}
                          onChange={(e) => setCustForm({ ...custForm, creditLimit: Number(e.target.value) })}
                          className="w-full bg-card border border-input rounded-lg p-2 text-foreground font-mono shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="text-muted-foreground mb-1 block">Daily Limit ($)</label>
                        <input
                          type="number"
                          value={custForm.dailyLimit || 0}
                          onChange={(e) => setCustForm({ ...custForm, dailyLimit: Number(e.target.value) })}
                          className="w-full bg-card border border-input rounded-lg p-2 text-foreground font-mono shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="text-muted-foreground mb-1 block">{t('selling_price_level', 'Selling Price Level')}</label>
                        <select
                          value={custForm.sellingPriceLevel}
                          onChange={(e) => setCustForm({ ...custForm, sellingPriceLevel: Number(e.target.value) })}
                          className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs"
                        >
                          <option value={1}>{t('level_1_wholesale_tier', 'Level 1 - Wholesale Tier')}</option>
                          <option value={2}>{t('level_2_commercial_distributor', 'Level 2 - Commercial Distributor')}</option>
                          <option value={3}>{t('level_3_horeca_contract', 'Level 3 - HORECA Contract')}</option>
                          <option value={4}>{t('level_4_standard_retail', 'Level 4 - Standard Retail')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-muted-foreground mb-1 block flex items-center justify-between">
                          <span>{t('account_number', 'Account Number')}</span>
                          <RefreshCw
                            className="w-3 h-3 text-muted-foreground hover:text-primary cursor-pointer"
                            onClick={() => onShowToast('Refreshed Account Sequence Number.')}
                          />
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={custForm.accountCode || '41110-NEW'}
                          className="w-full bg-muted border border-input rounded-lg p-2 text-foreground font-mono shadow-2xs"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-muted-foreground mb-1 block">{t('vat_account_number', 'VAT Account Number')}</label>
                        <input
                          type="text"
                          value={custForm.vatAccountNumber || ''}
                          onChange={(e) => setCustForm({ ...custForm, vatAccountNumber: e.target.value })}
                          placeholder={t('eg_4427008812', 'e.g. 44270-08812')}
                          className="w-full bg-card border border-input rounded-lg p-2 text-foreground font-mono shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Remarks Section: 6 distinct text fields (Remark, Remark 2, Remark 3, Remark 4, Note, Website) */}
                  <div className="bg-muted/40 p-3.5 rounded-xl border border-border space-y-3">
                    <span className="font-bold text-foreground block">Remarks Section (6 Fields)</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-muted-foreground mb-1 block">{t('remark', 'Remark')}</label>
                        <input
                          type="text"
                          value={custForm.remark1 || ''}
                          onChange={(e) => setCustForm({ ...custForm, remark1: e.target.value })}
                          className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="text-muted-foreground mb-1 block">{t('remark_2', 'Remark 2')}</label>
                        <input
                          type="text"
                          value={custForm.remark2 || ''}
                          onChange={(e) => setCustForm({ ...custForm, remark2: e.target.value })}
                          className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="text-muted-foreground mb-1 block">{t('remark_3', 'Remark 3')}</label>
                        <input
                          type="text"
                          value={custForm.remark3 || ''}
                          onChange={(e) => setCustForm({ ...custForm, remark3: e.target.value })}
                          className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="text-muted-foreground mb-1 block">{t('remark_4', 'Remark 4')}</label>
                        <input
                          type="text"
                          value={custForm.remark4 || ''}
                          onChange={(e) => setCustForm({ ...custForm, remark4: e.target.value })}
                          className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="text-muted-foreground mb-1 block">{t('note', 'Note')}</label>
                        <input
                          type="text"
                          value={custForm.note || ''}
                          onChange={(e) => setCustForm({ ...custForm, note: e.target.value })}
                          className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="text-muted-foreground mb-1 block">{t('website', 'Website')}</label>
                        <input
                          type="text"
                          value={custForm.website || ''}
                          onChange={(e) => setCustForm({ ...custForm, website: e.target.value })}
                          placeholder="https://..."
                          className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Membership Section: Code, Card/Code Expiry Date, Membership #, Birthday */}
                  <div className="bg-muted/40 p-3.5 rounded-xl border border-border space-y-3">
                    <span className="font-bold text-foreground block">{t('membership_section', 'Membership Section')}</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="text-muted-foreground mb-1 block">{t('code', 'Code')}</label>
                        <input
                          type="text"
                          value={custForm.membershipCode || ''}
                          onChange={(e) => setCustForm({ ...custForm, membershipCode: e.target.value })}
                          className="w-full bg-card border border-input rounded-lg p-2 text-foreground font-mono shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="text-muted-foreground mb-1 block">{t('cardcode_expiry_date', 'Card/Code Expiry Date')}</label>
                        <input
                          type="date"
                          value={custForm.membershipExpiry || ''}
                          onChange={(e) => setCustForm({ ...custForm, membershipExpiry: e.target.value })}
                          className="w-full bg-card border border-input rounded-lg p-2 text-foreground font-mono shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="text-muted-foreground mb-1 block">{t('membership', 'Membership #')}</label>
                        <input
                          type="text"
                          value={custForm.membershipNumber || ''}
                          onChange={(e) => setCustForm({ ...custForm, membershipNumber: e.target.value })}
                          className="w-full bg-card border border-input rounded-lg p-2 text-foreground font-mono shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="text-muted-foreground mb-1 block">{t('birthday', 'Birthday')}</label>
                        <input
                          type="date"
                          value={custForm.birthday || ''}
                          onChange={(e) => setCustForm({ ...custForm, birthday: e.target.value })}
                          className="w-full bg-card border border-input rounded-lg p-2 text-foreground font-mono shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Image Section: Thumbnail preview (`no-image`) with Select image and Remove buttons */}
                  <div className="bg-muted/40 p-3.5 rounded-xl border border-border space-y-3">
                    <span className="font-bold text-foreground block">{t('image_section', 'Image Section')}</span>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-card border border-border rounded-xl flex items-center justify-center text-muted-foreground text-[11px] font-mono shadow-2xs">
                        {t('noimage', 'no-image')}
                      </div>
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => onShowToast('Image selected from file system.')}
                          className="bg-card hover:bg-muted text-foreground border border-border px-3 py-1.5 rounded-lg text-xs font-semibold block transition-colors cursor-pointer"
                        >
                          {t('select_image', 'Select image')}
                        </button>
                        <button
                          type="button"
                          onClick={() => onShowToast('Image removed.')}
                          className="bg-card hover:bg-destructive/10 text-destructive border border-destructive/30 px-3 py-1.5 rounded-lg text-xs font-semibold block transition-colors cursor-pointer"
                        >
                          {t('remove', 'Remove')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer: Save Button */}
            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setNewCustomerModalOpen(false)}
                className="bg-card hover:bg-muted text-muted-foreground px-4 py-2 rounded-lg text-xs font-semibold border border-border cursor-pointer"
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleSaveNewCustomer}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
              >
                {t('save', 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
