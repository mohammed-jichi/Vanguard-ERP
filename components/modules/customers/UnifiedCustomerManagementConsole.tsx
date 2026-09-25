'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';
import {
  Users,
  Receipt,
  Clock,
  LayoutDashboard,
  Calendar,
  SlidersHorizontal,
  FolderTree,
  ListFilter,
  Tag,
  Search,
  Plus,
  Filter,
  Printer,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Building,
  TrendingUp,
  UserCheck,
  ChevronRight,
  X,
  ExternalLink,
  CreditCard,
  Send,
  FileSpreadsheet
} from 'lucide-react';

// ==============================================================================
// CUSTOMER & DEBTOR INTERFACES & MOCK DATA
// ==============================================================================

export interface CustomerRow {
  id: string;
  code: string;
  company: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  city: string;
  country: string;
  group: string;
  dateCreated: string;
  balanceUsd: number;
  balanceLbp: number;
  creditLimitUsd: number;
  status: 'ACTIVE' | 'SUSPENDED';
  taxNumber: string;
  gracePeriodDays: number;
  paymentRating: 'AAA' | 'AA' | 'A' | 'B' | 'C';
}

export interface StatementTransaction {
  id: string;
  date: string;
  type: 'INVOICE' | 'RETURN' | 'PAYMENT' | 'CREDIT_NOTE';
  refNo: string;
  debitUsd: number;
  creditUsd: number;
  notes: string;
}

export interface ReceiptRow {
  id: string;
  receiptNumber: string;
  customerName: string;
  date: string;
  paymentMethod: 'CASH' | 'CHEQUE' | 'WHISH' | 'BANK_TRANSFER';
  amountUsd: number;
  amountLbp: number;
  referenceNo: string;
  status: 'POSTED' | 'PENDING';
}

const INITIAL_CUSTOMERS: CustomerRow[] = [
  {
    id: 'CUST-1001',
    code: 'SO-CLI-01',
    company: 'Al-Baraka Supermarket S.A.R.L',
    firstName: 'Tariq',
    lastName: 'Mansour',
    phone: '+961 3 451 229',
    email: 'info@albaraka-market.com',
    city: 'Choueifat',
    country: 'Lebanon',
    group: 'Wholesales / Clients',
    dateCreated: '2026-01-15',
    balanceUsd: 1450.00,
    balanceLbp: 129775000,
    creditLimitUsd: 5000,
    status: 'ACTIVE',
    taxNumber: '601-992144-01',
    gracePeriodDays: 30,
    paymentRating: 'AAA'
  },
  {
    id: 'CUST-1002',
    code: 'SO-CLI-02',
    company: 'Beirut Gourmet Emporium',
    firstName: 'Nadine',
    lastName: 'Kassir',
    phone: '+961 1 789 450',
    email: 'purchasing@beirutgourmet.lb',
    city: 'Beirut',
    country: 'Lebanon',
    group: 'Key Commercial Accounts',
    dateCreated: '2026-02-10',
    balanceUsd: 3200.50,
    balanceLbp: 286444750,
    creditLimitUsd: 10000,
    status: 'ACTIVE',
    taxNumber: '883-102941-02',
    gracePeriodDays: 45,
    paymentRating: 'AA'
  },
  {
    id: 'CUST-1003',
    code: 'SO-CLI-03',
    company: 'Sidon Central Cooperative',
    firstName: 'Ibrahim',
    lastName: 'Saad',
    phone: '+961 7 724 100',
    email: 'coop@sidon-agri.org',
    city: 'Sidon',
    country: 'Lebanon',
    group: 'Wholesales / Clients',
    dateCreated: '2026-03-01',
    balanceUsd: 0.00,
    balanceLbp: 0,
    creditLimitUsd: 8000,
    status: 'ACTIVE',
    taxNumber: '441-309812-01',
    gracePeriodDays: 30,
    paymentRating: 'AAA'
  },
  {
    id: 'CUST-1004',
    code: 'SO-CLI-04',
    company: 'Verdun Olive Specialty Boutique',
    firstName: 'Maya',
    lastName: 'Rizk',
    phone: '+961 70 889 012',
    email: 'boutique@verdun-delicacies.com',
    city: 'Beirut',
    country: 'Lebanon',
    group: 'Retail Outlets',
    dateCreated: '2026-04-18',
    balanceUsd: 875.25,
    balanceLbp: 78334875,
    creditLimitUsd: 2500,
    status: 'ACTIVE',
    taxNumber: '912-440182-03',
    gracePeriodDays: 15,
    paymentRating: 'A'
  },
  {
    id: 'CUST-1005',
    code: 'SO-CLI-05',
    company: 'Phoenicia Luxury Resorts S.A.L',
    firstName: 'Marc',
    lastName: 'Daou',
    phone: '+961 1 369 100',
    email: 'procurement@phoenicia-beirut.com',
    city: 'Beirut',
    country: 'Lebanon',
    group: 'Key Commercial Accounts',
    dateCreated: '2026-05-02',
    balanceUsd: 6420.00,
    balanceLbp: 574590000,
    creditLimitUsd: 15000,
    status: 'SUSPENDED',
    taxNumber: '109-882310-01',
    gracePeriodDays: 60,
    paymentRating: 'B'
  }
];

const INITIAL_RECEIPTS: ReceiptRow[] = [
  {
    id: 'REC-2026-081',
    receiptNumber: 'RV-10941',
    customerName: 'Al-Baraka Supermarket S.A.R.L',
    date: '2026-09-18',
    paymentMethod: 'CASH',
    amountUsd: 1200.00,
    amountLbp: 107400000,
    referenceNo: 'CSH-CHK-01',
    status: 'POSTED'
  },
  {
    id: 'REC-2026-082',
    receiptNumber: 'RV-10942',
    customerName: 'Beirut Gourmet Emporium',
    date: '2026-09-16',
    paymentMethod: 'WHISH',
    amountUsd: 850.00,
    amountLbp: 76075000,
    referenceNo: 'WSH-TXN-882194',
    status: 'POSTED'
  },
  {
    id: 'REC-2026-083',
    receiptNumber: 'RV-10943',
    customerName: 'Verdun Olive Specialty Boutique',
    date: '2026-09-15',
    paymentMethod: 'CHEQUE',
    amountUsd: 500.00,
    amountLbp: 44750000,
    referenceNo: 'BLOM-CHQ-449102',
    status: 'POSTED'
  }
];

export default function UnifiedCustomerManagementConsole() {
  const { t, dir } = useLanguage();
  const searchParams = useSearchParams();
  const rawSection = searchParams.get('section') || 'customers';

  // Normalize section
  const activeSection = useMemo(() => {
    switch (rawSection.toLowerCase()) {
      case 'receipts': return 'receipts';
      case 'aged': return 'aged';
      case 'insights': return 'insights';
      case 'tasks': return 'tasks';
      case 'leads': return 'leads';
      case 'performance': return 'performance';
      case 'groups': return 'groups';
      case 'categories': return 'categories';
      case 'tags': return 'tags';
      case 'leads_settings': return 'leads_settings';
      default: return 'customers';
    }
  }, [rawSection]);

  const [customers, setCustomers] = useState<CustomerRow[]>(INITIAL_CUSTOMERS);
  const [receipts, setReceipts] = useState<ReceiptRow[]>(INITIAL_RECEIPTS);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState('ALL');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedCustomerForSoa, setSelectedCustomerForSoa] = useState<CustomerRow | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Form states for modals
  const [newCustomerForm, setNewCustomerForm] = useState({
    firstName: '',
    lastName: '',
    company: '',
    phone: '',
    email: '',
    city: 'Choueifat',
    country: 'Lebanon',
    group: 'Wholesales / Clients',
    creditLimitUsd: 5000,
    taxNumber: '',
    gracePeriodDays: 30,
    paymentRating: 'AAA' as 'AAA' | 'AA' | 'A' | 'B' | 'C',
    status: 'ACTIVE' as 'ACTIVE' | 'SUSPENDED'
  });

  const [newReceiptForm, setNewReceiptForm] = useState({
    customerName: 'Al-Baraka Supermarket S.A.R.L',
    paymentMethod: 'CASH' as 'CASH' | 'CHEQUE' | 'WHISH' | 'BANK_TRANSFER',
    amountUsd: 500,
    amountLbp: 44750000,
    referenceNo: '',
    notes: ''
  });

  // Filtered customer list (searches name, company, taxNumber, phone, code)
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        c.company.toLowerCase().includes(q) ||
        c.firstName.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q) ||
        c.phone.includes(searchQuery) ||
        c.code.toLowerCase().includes(q) ||
        c.taxNumber.toLowerCase().includes(q);

      const matchesGroup = groupFilter === 'ALL' || c.group === groupFilter;
      const matchesCity = cityFilter === 'ALL' || c.city === cityFilter;
      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;

      return matchesSearch && matchesGroup && matchesCity && matchesStatus;
    });
  }, [customers, searchQuery, groupFilter, cityFilter, statusFilter]);

  // Handle saving new customer
  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `CUST-${1000 + customers.length + 1}`;
    const newCode = `SO-CLI-0${customers.length + 1}`;
    const newEntry: CustomerRow = {
      id: newId,
      code: newCode,
      company: newCustomerForm.company,
      firstName: newCustomerForm.firstName,
      lastName: newCustomerForm.lastName,
      phone: newCustomerForm.phone,
      email: newCustomerForm.email,
      city: newCustomerForm.city,
      country: newCustomerForm.country,
      group: newCustomerForm.group,
      dateCreated: new Date().toISOString().split('T')[0],
      balanceUsd: 0,
      balanceLbp: 0,
      creditLimitUsd: Number(newCustomerForm.creditLimitUsd) || 0,
      status: newCustomerForm.status,
      taxNumber: newCustomerForm.taxNumber || '100-000000-01',
      gracePeriodDays: Number(newCustomerForm.gracePeriodDays) || 30,
      paymentRating: newCustomerForm.paymentRating
    };

    setCustomers(prev => [newEntry, ...prev]);
    setIsCustomerModalOpen(false);
    showToast(t('customer_saved_toast', 'Customer profile registered and credit ceiling initialized.'));
  };

  // Handle saving receipt / debt settlement voucher
  const handleSaveReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `REC-2026-${80 + receipts.length + 1}`;
    const newRv = `RV-${10940 + receipts.length + 1}`;
    const newEntry: ReceiptRow = {
      id: newId,
      receiptNumber: newRv,
      customerName: newReceiptForm.customerName,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: newReceiptForm.paymentMethod,
      amountUsd: Number(newReceiptForm.amountUsd) || 0,
      amountLbp: Number(newReceiptForm.amountLbp) || 0,
      referenceNo: newReceiptForm.referenceNo || 'CSH-SETTLE',
      status: 'POSTED'
    };

    setReceipts(prev => [newEntry, ...prev]);
    setIsReceiptModalOpen(false);
    showToast(t('debt_settlement_saved_toast', 'Debt settlement receipt voucher posted to general ledger.'));
  };

  // Dynamic SOA ledger transactions for selected customer
  const customerSoaTransactions: StatementTransaction[] = useMemo(() => {
    if (!selectedCustomerForSoa) return [];
    return [
      {
        id: 'TXN-01',
        date: '2026-08-01',
        type: 'INVOICE',
        refNo: 'INV-2026-8801',
        debitUsd: selectedCustomerForSoa.balanceUsd > 0 ? selectedCustomerForSoa.balanceUsd + 1200 : 2500,
        creditUsd: 0,
        notes: t('initial_wholesale_delivery', 'Wholesale olive oil tins and bottled stock delivery')
      },
      {
        id: 'TXN-02',
        date: '2026-08-15',
        type: 'RETURN',
        refNo: 'RET-2026-041',
        debitUsd: 0,
        creditUsd: 150.00,
        notes: t('damaged_empty_bottles_return', 'Damaged glass packaging return credit')
      },
      {
        id: 'TXN-03',
        date: '2026-09-01',
        type: 'PAYMENT',
        refNo: 'RV-10941',
        debitUsd: 0,
        creditUsd: 1050.00,
        notes: t('cash_collection_voucher', 'Cash collection voucher credited to client account')
      },
      {
        id: 'TXN-04',
        date: '2026-09-10',
        type: 'CREDIT_NOTE',
        refNo: 'CRN-2026-018',
        debitUsd: 0,
        creditUsd: selectedCustomerForSoa.balanceUsd > 0 ? 0 : 1300,
        notes: t('commercial_volume_rebate', 'Commercial volume loyalty rebate deduction')
      }
    ];
  }, [selectedCustomerForSoa, t]);

  return (
    <div dir={dir} className="space-y-4 font-sans text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[9999] bg-emerald-700 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-fade-in text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. SECTION TITLE & ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-primary text-primary-foreground">
              {t('module_crm_ar', 'MODULE 4 • CRM & AR (DEBTORS)')}
            </span>
            <span className="text-xs font-mono text-slate-500 font-bold">
              {t('section_colon', 'SECTION:')} {t(activeSection, activeSection.toUpperCase().replace('_', ' '))}
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1">
            {activeSection === 'customers' && t('master_customers_ar', 'Master Customers & Accounts Receivable (Client Directory)')}
            {activeSection === 'receipts' && t('customer_receipts_vouchers', 'Customer Receipts & Collection Vouchers')}
            {activeSection === 'aged' && t('customer_aged_debtors', 'Customer Aged Debtors Analysis (Accounts Receivable Aging)')}
            {activeSection === 'insights' && t('ai_customer_insights', 'AI Customer Insights & Lifetime Value')}
            {activeSection === 'tasks' && t('tasks_appointments_schedule', 'Tasks and Appointments Schedule')}
            {activeSection === 'leads' && t('leads_contacts_roster', 'Leads & Commercial Contacts Roster')}
            {activeSection === 'performance' && t('sales_team_performance', 'Sales Team Performance & Conversion')}
            {activeSection === 'groups' && t('customers_groups_config', 'Customers Groups Configuration')}
            {activeSection === 'categories' && t('customers_categories_config', 'Customers Categories Configuration')}
            {activeSection === 'tags' && t('customers_tags_config', 'Customers Tags Configuration')}
            {activeSection === 'leads_settings' && t('leads_pipeline_settings', 'Leads Pipeline Settings & Stages')}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {activeSection === 'customers' && (
            <button
              onClick={() => setIsCustomerModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('new_customer', 'New Customer')}</span>
            </button>
          )}

          {(activeSection === 'receipts' || activeSection === 'aged') && (
            <button
              onClick={() => setIsReceiptModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Receipt className="w-4 h-4" />
              <span>{t('new_receipt_voucher', 'New Receipt / Debt Settlement')}</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 transition cursor-pointer"
            title={t('print_view', 'Print View')}
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. SECTION RENDER SWITCHER */}
      {activeSection === 'customers' && (
        <div className="space-y-4">
          {/* Filters Bar: Search by name/tax ID/phone + Filter by Category & Area & Status */}
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[280px]">
              <div className="relative flex-1">
                <Search className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 text-slate-400 ${dir === 'rtl' ? 'right-3' : 'left-3'}`} />
                <input
                  type="text"
                  placeholder={t('search_customers_placeholder', 'Quick lookups by name, tax ID, phone, customer code...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full ${dir === 'rtl' ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Category / Group Filter */}
              <select
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold bg-white text-slate-700 cursor-pointer"
              >
                <option value="ALL">{t('all_customer_groups', 'All Customer Groups')}</option>
                <option value="Wholesales / Clients">{t('wholesales_clients', 'Wholesales / Clients')}</option>
                <option value="Key Commercial Accounts">{t('key_commercial_accounts', 'Key Commercial Accounts')}</option>
                <option value="Retail Outlets">{t('retail_outlets', 'Retail Outlets')}</option>
              </select>

              {/* City / Area Filter */}
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold bg-white text-slate-700 cursor-pointer"
              >
                <option value="ALL">{t('all_areas_cities', 'All Areas / Cities')}</option>
                <option value="Choueifat">{t('choueifat', 'Choueifat')}</option>
                <option value="Beirut">{t('beirut', 'Beirut')}</option>
                <option value="Sidon">{t('sidon', 'Sidon')}</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold bg-white text-slate-700 cursor-pointer"
              >
                <option value="ALL">{t('all_statuses', 'All Statuses')}</option>
                <option value="ACTIVE">{t('active', 'Active')}</option>
                <option value="SUSPENDED">{t('suspended', 'Suspended')}</option>
              </select>

              <button
                onClick={() => { setSearchQuery(''); setGroupFilter('ALL'); setCityFilter('ALL'); setStatusFilter('ALL'); }}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                {t('reset', 'Reset')}
              </button>
            </div>
          </div>

          {/* Table: Client Directory & Credit Profiles */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">{t('cust_id', 'Cust. ID')}</th>
                    <th className="py-3 px-3">{t('commercial_name', 'Commercial Name')}</th>
                    <th className="py-3 px-3">{t('tax_number', 'Tax Number')}</th>
                    <th className="py-3 px-3">{t('contact_person', 'Contact Person')}</th>
                    <th className="py-3 px-3">{t('phone_number', 'Phone Number')}</th>
                    <th className="py-3 px-3">{t('city_country', 'City - Country')}</th>
                    <th className="py-3 px-3 text-right">{t('credit_ceiling', 'Credit Ceiling')}</th>
                    <th className="py-3 px-3 text-center">{t('grace_period', 'Grace Period')}</th>
                    <th className="py-3 px-3 text-center">{t('payment_rating', 'Rating')}</th>
                    <th className="py-3 px-3 text-center">{t('status', 'Status')}</th>
                    <th className="py-3 px-3 text-right rtl:text-left">{t('balance_usd', 'Balance (USD)')}</th>
                    <th className="py-3 px-3 text-center">{t('actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-8 text-center text-slate-400 font-medium">
                        {t('no_customers_found', 'No customers found matching your criteria')}
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((cust) => (
                      <tr key={cust.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-3 font-mono font-bold text-primary">{cust.code}</td>
                        <td className="py-3 px-3 font-bold text-slate-900">{cust.company}</td>
                        <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">{cust.taxNumber}</td>
                        <td className="py-3 px-3 font-medium text-slate-700">{cust.firstName} {cust.lastName}</td>
                        <td className="py-3 px-3 font-mono text-slate-600">{cust.phone}</td>
                        <td className="py-3 px-3 text-slate-600">{cust.city}, {cust.country}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-blue-800">
                          ${cust.creditLimitUsd.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-center font-mono">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {cust.gracePeriodDays} {t('days_unit', 'Days')}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-300">
                            {cust.paymentRating}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-block ${
                              cust.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : 'bg-rose-50 text-rose-700 border-rose-300'
                            }`}
                          >
                            {cust.status === 'ACTIVE' ? t('active', 'Active') : t('suspended', 'Suspended')}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          ${cust.balanceUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedCustomerForSoa(cust)}
                              className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[11px] font-bold hover:bg-amber-100 transition cursor-pointer"
                              title={t('statement_of_account', 'Statement of Account')}
                            >
                              {t('statement', 'Statement')}
                            </button>
                            <button
                              onClick={() => {
                                setNewReceiptForm(prev => ({ ...prev, customerName: cust.company }));
                                setIsReceiptModalOpen(true);
                              }}
                              className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[11px] font-bold hover:bg-emerald-100 transition cursor-pointer"
                              title={t('debt_settlement_voucher', 'Debt Settlement Voucher')}
                            >
                              {t('settle', 'Settle')}
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

      {/* Customer Receipts / Debt Settlement Vouchers */}
      {activeSection === 'receipts' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">{t('receipt_number', 'Receipt #')}</th>
                    <th className="py-3 px-4">{t('customer_account', 'Customer Account')}</th>
                    <th className="py-3 px-4">{t('date', 'Date')}</th>
                    <th className="py-3 px-4 text-center">{t('tender', 'Tender')}</th>
                    <th className="py-3 px-4">{t('reference_number', 'Reference #')}</th>
                    <th className="py-3 px-4 text-right">{t('amount_usd', 'Amount (USD)')}</th>
                    <th className="py-3 px-4 text-right">{t('amount_lbp', 'Amount (LBP)')}</th>
                    <th className="py-3 px-4 text-center">{t('status', 'Status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {receipts.map(rec => (
                    <tr key={rec.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-bold text-primary">{rec.receiptNumber}</td>
                      <td className="py-3 px-4 font-sans font-semibold text-slate-900">{rec.customerName}</td>
                      <td className="py-3 px-4 text-slate-500 font-sans">{rec.date}</td>
                      <td className="py-3 px-4 text-center font-sans">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                          {rec.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{rec.referenceNo}</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700">
                        ${rec.amountUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500">
                        {rec.amountLbp.toLocaleString()} LBP
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Customer Aged Debtors (Accounts Receivable Aging) */}
      {activeSection === 'aged' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="font-bold text-xs text-slate-800 block">
                  {t('aged_debtors_summary', 'Till Date: As of Today • All Customer Tiers')}
                </span>
                <span className="text-[11px] text-slate-500">
                  {t('aged_debtors_subtitle', 'Current, 30 days, 60 days, 90+ days aging buckets with collections')}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-rose-700 block">
                  {t('total_outstanding', 'Total Outstanding:')} $11,945.75
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right text-xs font-mono">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3.5">{t('cust_id', 'Cust. ID')}</th>
                    <th className="py-3 px-3.5 font-sans">{t('customer_company', 'Customer / Company')}</th>
                    <th className="py-3 px-3.5 font-sans">{t('tax_number', 'Tax Number')}</th>
                    <th className="py-3 px-3.5 text-right">{t('aging_current', 'Current')}</th>
                    <th className="py-3 px-3.5 text-right">{t('aging_30', '1-30 Days')}</th>
                    <th className="py-3 px-3.5 text-right">{t('aging_60', '31-60 Days')}</th>
                    <th className="py-3 px-3.5 text-right">{t('aging_90', '61-90 Days')}</th>
                    <th className="py-3 px-3.5 text-right">{t('aging_90_plus', '>90 Days')}</th>
                    <th className="py-3 px-3.5 text-right font-bold text-slate-900">{t('total_due', 'Total Due')}</th>
                    <th className="py-3 px-3.5 text-center font-sans">{t('actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-3.5 font-bold text-primary">SO-CLI-01</td>
                    <td className="py-3 px-3.5 font-sans font-bold text-slate-900">Al-Baraka Supermarket S.A.R.L</td>
                    <td className="py-3 px-3.5 text-slate-500 text-[11px]">601-992144-01</td>
                    <td className="py-3 px-3.5 text-right text-emerald-600">$450.00</td>
                    <td className="py-3 px-3.5 text-right text-slate-600">$1,000.00</td>
                    <td className="py-3 px-3.5 text-right text-slate-400">$0.00</td>
                    <td className="py-3 px-3.5 text-right text-slate-400">$0.00</td>
                    <td className="py-3 px-3.5 text-right text-slate-400">$0.00</td>
                    <td className="py-3 px-3.5 text-right font-bold text-slate-900">$1,450.00</td>
                    <td className="py-3 px-3.5 text-center font-sans">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => showToast(t('collection_reminder_sent_toast', 'Collection reminder sent to Al-Baraka via WhatsApp & SMS.'))}
                          className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-bold hover:bg-blue-100 transition cursor-pointer flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>{t('send_collection_reminder', 'Reminder')}</span>
                        </button>
                        <button
                          onClick={() => {
                            setNewReceiptForm(prev => ({ ...prev, customerName: 'Al-Baraka Supermarket S.A.R.L', amountUsd: 1450 }));
                            setIsReceiptModalOpen(true);
                          }}
                          className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold hover:bg-emerald-100 transition cursor-pointer"
                        >
                          {t('settle', 'Settle')}
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-3.5 font-bold text-primary">SO-CLI-02</td>
                    <td className="py-3 px-3.5 font-sans font-bold text-slate-900">Beirut Gourmet Emporium</td>
                    <td className="py-3 px-3.5 text-slate-500 text-[11px]">883-102941-02</td>
                    <td className="py-3 px-3.5 text-right text-emerald-600">$1,200.50</td>
                    <td className="py-3 px-3.5 text-right text-slate-600">$2,000.00</td>
                    <td className="py-3 px-3.5 text-right text-slate-400">$0.00</td>
                    <td className="py-3 px-3.5 text-right text-slate-400">$0.00</td>
                    <td className="py-3 px-3.5 text-right text-slate-400">$0.00</td>
                    <td className="py-3 px-3.5 text-right font-bold text-slate-900">$3,200.50</td>
                    <td className="py-3 px-3.5 text-center font-sans">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => showToast(t('collection_reminder_sent_toast', 'Collection reminder sent to Beirut Gourmet via WhatsApp & SMS.'))}
                          className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-bold hover:bg-blue-100 transition cursor-pointer flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>{t('send_collection_reminder', 'Reminder')}</span>
                        </button>
                        <button
                          onClick={() => {
                            setNewReceiptForm(prev => ({ ...prev, customerName: 'Beirut Gourmet Emporium', amountUsd: 3200.50 }));
                            setIsReceiptModalOpen(true);
                          }}
                          className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold hover:bg-emerald-100 transition cursor-pointer"
                        >
                          {t('settle', 'Settle')}
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-3.5 font-bold text-primary">SO-CLI-04</td>
                    <td className="py-3 px-3.5 font-sans font-bold text-slate-900">Verdun Olive Specialty Boutique</td>
                    <td className="py-3 px-3.5 text-slate-500 text-[11px]">912-440182-03</td>
                    <td className="py-3 px-3.5 text-right text-emerald-600">$875.25</td>
                    <td className="py-3 px-3.5 text-right text-slate-400">$0.00</td>
                    <td className="py-3 px-3.5 text-right text-slate-400">$0.00</td>
                    <td className="py-3 px-3.5 text-right text-slate-400">$0.00</td>
                    <td className="py-3 px-3.5 text-right text-slate-400">$0.00</td>
                    <td className="py-3 px-3.5 text-right font-bold text-slate-900">$875.25</td>
                    <td className="py-3 px-3.5 text-center font-sans">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => showToast(t('collection_reminder_sent_toast', 'Collection reminder sent to Verdun Boutique via WhatsApp & SMS.'))}
                          className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-bold hover:bg-blue-100 transition cursor-pointer flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>{t('send_collection_reminder', 'Reminder')}</span>
                        </button>
                        <button
                          onClick={() => {
                            setNewReceiptForm(prev => ({ ...prev, customerName: 'Verdun Olive Specialty Boutique', amountUsd: 875.25 }));
                            setIsReceiptModalOpen(true);
                          }}
                          className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold hover:bg-emerald-100 transition cursor-pointer"
                        >
                          {t('settle', 'Settle')}
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-3.5 font-bold text-primary">SO-CLI-05</td>
                    <td className="py-3 px-3.5 font-sans font-bold text-slate-900">Phoenicia Luxury Resorts S.A.L</td>
                    <td className="py-3 px-3.5 text-slate-500 text-[11px]">109-882310-01</td>
                    <td className="py-3 px-3.5 text-right text-slate-400">$0.00</td>
                    <td className="py-3 px-3.5 text-right text-slate-600">$1,420.00</td>
                    <td className="py-3 px-3.5 text-right text-amber-600">$2,000.00</td>
                    <td className="py-3 px-3.5 text-right text-rose-600">$1,500.00</td>
                    <td className="py-3 px-3.5 text-right font-bold text-rose-700">$1,500.00</td>
                    <td className="py-3 px-3.5 text-right font-bold text-rose-800">$6,420.00</td>
                    <td className="py-3 px-3.5 text-center font-sans">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => showToast(t('urgent_legal_reminder_toast', 'Urgent overdue payment notice dispatched to corporate finance.'))}
                          className="px-2 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[10px] font-bold hover:bg-rose-100 transition cursor-pointer flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>{t('urgent_notice', 'Urgent Notice')}</span>
                        </button>
                        <button
                          onClick={() => {
                            setNewReceiptForm(prev => ({ ...prev, customerName: 'Phoenicia Luxury Resorts S.A.L', amountUsd: 6420 }));
                            setIsReceiptModalOpen(true);
                          }}
                          className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold hover:bg-emerald-100 transition cursor-pointer"
                        >
                          {t('settle', 'Settle')}
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Leads & Contacts Redirection to Module 10 V-Connect */}
      {(activeSection === 'leads' || activeSection === 'leads_settings') && (
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-2xl p-8 text-center space-y-4 shadow-sm max-w-3xl mx-auto my-6">
          <div className="w-16 h-16 bg-white border border-cyan-200 rounded-2xl mx-auto flex items-center justify-center text-cyan-600 shadow-sm text-2xl">
            🎯
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full">
              {t('structural_coupling_mod10', 'Unified Structural Coupling • Module 10')}
            </span>
            <h2 className="text-xl font-extrabold text-slate-900">
              {t('lead_pipeline_vconnect_title', 'Lead Pipeline & Acquisition is Managed in Module 10: V-Connect (Social CRM)')}
            </h2>
            <p className="text-xs text-slate-600 max-w-lg mx-auto">
              {t('lead_pipeline_vconnect_desc', 'Per architectural governance, all lead capture forms, lead conversion stages, multichannel social inquiries, and contact synchronization are managed within the V-Connect workspace.')}
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/backoffice/social-crm?tab=cpl"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all"
            >
              <span>{t('open_vconnect_pipeline', 'Open Lead Pipeline in V-Connect (Social CRM) →')}</span>
            </Link>
          </div>
        </div>
      )}

      {/* Customers Groups / Categories / Tags Settings */}
      {(activeSection === 'groups' || activeSection === 'categories' || activeSection === 'tags') && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-bold text-slate-900 text-sm">
              {t('configuration_registry', 'Configuration Registry')} • {activeSection.toUpperCase().replace('_', ' ')}
            </h2>
            <button className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-bold shadow-xs transition cursor-pointer">
              {t('add_entry', '+ Add Entry')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">{t('wholesales_clients', 'Wholesales / Clients')}</span>
              <span className="text-lg font-bold text-slate-900 mt-1 block">5% {t('volume_discount', 'Volume Discount')}</span>
              <span className="text-[11px] text-slate-500 mt-1 block">{t('primary_distributors_tier', 'Primary commercial distributors tier')}</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">{t('key_commercial_accounts', 'Key Commercial Accounts')}</span>
              <span className="text-lg font-bold text-slate-900 mt-1 block">10% {t('key_partner_margin', 'Key Partner Margin')}</span>
              <span className="text-[11px] text-slate-500 mt-1 block">{t('hotel_supermarket_chains', 'Hotel & large supermarket chains')}</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">{t('retail_outlets', 'Retail Outlets')}</span>
              <span className="text-lg font-bold text-slate-900 mt-1 block">{t('standard_list_price', 'Standard List Price')}</span>
              <span className="text-[11px] text-slate-500 mt-1 block">{t('direct_pos_walkin_buyers', 'Direct POS and retail walk-in buyers')}</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD NEW COMMERCIAL CUSTOMER / DEBTOR */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">{t('add_new_commercial_customer', 'Add New Commercial Customer / Debtor')}</h3>
              <button onClick={() => setIsCustomerModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">{t('company_account_name_req', 'Company Account Name *')}</label>
                  <input
                    type="text"
                    required
                    placeholder={t('company_name_placeholder', 'e.g. Al-Baraka Supermarket S.A.R.L')}
                    value={newCustomerForm.company}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, company: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('tax_number', 'Tax Number / MOF')}</label>
                  <input
                    type="text"
                    placeholder="601-992144-01"
                    value={newCustomerForm.taxNumber}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, taxNumber: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('mobile_phone_req', 'Mobile Tel *')}</label>
                  <input
                    type="text"
                    required
                    placeholder="+961 3 123 456"
                    value={newCustomerForm.phone}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('first_name_req', 'First Name *')}</label>
                  <input
                    type="text"
                    required
                    placeholder={t('first_name', 'First name')}
                    value={newCustomerForm.firstName}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, firstName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('last_name_req', 'Last Name *')}</label>
                  <input
                    type="text"
                    required
                    placeholder={t('last_name', 'Last name')}
                    value={newCustomerForm.lastName}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, lastName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('email_address', 'Email Address')}</label>
                  <input
                    type="email"
                    placeholder="orders@company.com"
                    value={newCustomerForm.email}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('city_area', 'City / Area')}</label>
                  <input
                    type="text"
                    value={newCustomerForm.city}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, city: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('customer_group', 'Customer Group')}</label>
                  <select
                    value={newCustomerForm.group}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, group: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:border-primary focus:outline-none"
                  >
                    <option value="Wholesales / Clients">{t('wholesales_clients', 'Wholesales / Clients')}</option>
                    <option value="Key Commercial Accounts">{t('key_commercial_accounts', 'Key Commercial Accounts')}</option>
                    <option value="Retail Outlets">{t('retail_outlets', 'Retail Outlets')}</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('credit_ceiling_usd', 'Credit Ceiling ($)')}</label>
                  <input
                    type="number"
                    value={newCustomerForm.creditLimitUsd}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, creditLimitUsd: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('grace_period_days', 'Grace Period (Days)')}</label>
                  <input
                    type="number"
                    value={newCustomerForm.gracePeriodDays}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, gracePeriodDays: parseInt(e.target.value) || 30 })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('payment_rating', 'Payment Rating')}</label>
                  <select
                    value={newCustomerForm.paymentRating}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, paymentRating: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:border-primary focus:outline-none"
                  >
                    <option value="AAA">AAA - {t('prime_credit', 'Prime Credit')}</option>
                    <option value="AA">AA - {t('excellent_credit', 'Excellent Credit')}</option>
                    <option value="A">A - {t('standard_credit', 'Standard Credit')}</option>
                    <option value="B">B - {t('moderate_risk', 'Moderate Risk')}</option>
                    <option value="C">C - {t('high_risk', 'High Risk')}</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  {t('cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  {t('save_customer', 'Save Customer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DEBT SETTLEMENT & RECEIPT VOUCHER */}
      {isReceiptModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">{t('debt_settlement_voucher', 'Debt Settlement Voucher')}</h3>
              </div>
              <button onClick={() => setIsReceiptModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReceipt} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('customer_account', 'Customer Account *')}</label>
                <select
                  value={newReceiptForm.customerName}
                  onChange={(e) => setNewReceiptForm({ ...newReceiptForm, customerName: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-primary focus:outline-none"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.company}>
                      {c.company} ({c.code}) - ${c.balanceUsd.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('payment_method', 'Payment Method')}</label>
                  <select
                    value={newReceiptForm.paymentMethod}
                    onChange={(e) => setNewReceiptForm({ ...newReceiptForm, paymentMethod: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:border-primary focus:outline-none"
                  >
                    <option value="CASH">{t('cash_tender', 'Cash Drawer')}</option>
                    <option value="CHEQUE">{t('cheque_tender', 'Bank Cheque')}</option>
                    <option value="WHISH">{t('whish_money', 'Whish Money Transfer')}</option>
                    <option value="BANK_TRANSFER">{t('bank_transfer', 'Direct Bank Wire')}</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('reference_number', 'Reference / Cheque #')}</label>
                  <input
                    type="text"
                    placeholder="CHQ-99120"
                    value={newReceiptForm.referenceNo}
                    onChange={(e) => setNewReceiptForm({ ...newReceiptForm, referenceNo: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('amount_usd', 'Amount (USD) *')}</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newReceiptForm.amountUsd}
                    onChange={(e) => {
                      const usd = parseFloat(e.target.value) || 0;
                      setNewReceiptForm({ ...newReceiptForm, amountUsd: usd, amountLbp: usd * 89500 });
                    }}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-emerald-700 focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('amount_lbp', 'Amount (LBP)')}</label>
                  <input
                    type="number"
                    value={newReceiptForm.amountLbp}
                    onChange={(e) => setNewReceiptForm({ ...newReceiptForm, amountLbp: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono text-slate-600 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('notes', 'Notes')}</label>
                <input
                  type="text"
                  placeholder={t('voucher_notes_placeholder', 'Settlement against invoice balance...')}
                  value={newReceiptForm.notes}
                  onChange={(e) => setNewReceiptForm({ ...newReceiptForm, notes: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  {t('cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  {t('post_receipt_voucher', 'Post Receipt Voucher')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: STATEMENT OF ACCOUNT (SOA) WITH INVOICED HISTORY, RETURNS, PAYMENTS, CREDIT NOTES */}
      {selectedCustomerForSoa && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">{t('customer_soa_title', 'Customer Statement of Account (SOA)')}</h3>
                <p className="text-xs text-slate-500 font-semibold">{selectedCustomerForSoa.company} • {selectedCustomerForSoa.code} • {t('tax_id_colon', 'Tax ID:')} {selectedCustomerForSoa.taxNumber}</p>
              </div>
              <button onClick={() => setSelectedCustomerForSoa(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Balances Banner */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">{t('current_balance_usd', 'Current Balance USD')}</span>
                <span className="text-base font-bold font-mono text-slate-900">${selectedCustomerForSoa.balanceUsd.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">{t('current_balance_lbp', 'Current Balance LBP')}</span>
                <span className="text-base font-bold font-mono text-slate-900">{selectedCustomerForSoa.balanceLbp.toLocaleString()} LBP</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">{t('credit_limit_usd', 'Credit Limit USD')}</span>
                <span className="text-base font-bold font-mono text-blue-700">${selectedCustomerForSoa.creditLimitUsd.toLocaleString()}</span>
              </div>
            </div>

            {/* Invoiced History & Transactions Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {t('statement_transactions_history', 'Invoiced History, Returns, Payments & Credit Notes')}
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left rtl:text-right text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">{t('date', 'Date')}</th>
                      <th className="p-2.5">{t('type', 'Type')}</th>
                      <th className="p-2.5">{t('ref_number', 'Ref #')}</th>
                      <th className="p-2.5">{t('description', 'Description')}</th>
                      <th className="p-2.5 text-right">{t('debit', 'Debit ($)')}</th>
                      <th className="p-2.5 text-right">{t('credit', 'Credit ($)')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {customerSoaTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50">
                        <td className="p-2.5 text-slate-500 font-sans">{tx.date}</td>
                        <td className="p-2.5 font-sans">
                          <span
                            className={`px-2 py-0.5 rounded text-[9.5px] font-bold ${
                              tx.type === 'INVOICE'
                                ? 'bg-blue-50 text-blue-700'
                                : tx.type === 'RETURN'
                                ? 'bg-amber-50 text-amber-700'
                                : tx.type === 'PAYMENT'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-purple-50 text-purple-700'
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="p-2.5 font-bold text-slate-800">{tx.refNo}</td>
                        <td className="p-2.5 font-sans text-slate-600">{tx.notes}</td>
                        <td className="p-2.5 text-right font-bold text-slate-900">
                          {tx.debitUsd > 0 ? `$${tx.debitUsd.toFixed(2)}` : '-'}
                        </td>
                        <td className="p-2.5 text-right font-bold text-emerald-700">
                          {tx.creditUsd > 0 ? `$${tx.creditUsd.toFixed(2)}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions: Export PDF / Excel & Print */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => showToast(t('pdf_exported_toast', 'Statement PDF generated successfully.'))}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t('export_pdf', 'Export PDF')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => showToast(t('excel_exported_toast', 'Statement Excel workbook exported.'))}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t('export_excel', 'Export Excel')}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCustomerForSoa(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  {t('close', 'Close')}
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>{t('print_official_soa', 'Print Official SOA')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
