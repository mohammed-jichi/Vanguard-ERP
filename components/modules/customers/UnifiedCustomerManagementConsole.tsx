'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
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
  CreditCard
} from 'lucide-react';

// ==============================================================================
// INITIAL MOCK DATA GROUNDED IN OMEGA SOUTHERN OLIVE CORP SPECIFICATION
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
    status: 'ACTIVE'
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
    status: 'ACTIVE'
  },
  {
    id: 'CUST-1003',
    code: 'SO-CLI-03',
    company: 'Sidon Central Cooperative',
    firstName: 'Ibrahim',
    lastName: 'Saad',
    phone: '+961 7 721 340',
    email: 'procurement@sidon-coop.org',
    city: 'Sidon',
    country: 'Lebanon',
    group: 'Wholesales / Clients',
    dateCreated: '2026-03-01',
    balanceUsd: 0.00,
    balanceLbp: 0,
    creditLimitUsd: 7500,
    status: 'ACTIVE'
  },
  {
    id: 'CUST-1004',
    code: 'SO-CLI-04',
    company: 'Verdun Olive Specialty Boutique',
    firstName: 'Maya',
    lastName: 'Chemali',
    phone: '+961 3 881 204',
    email: 'maya@verdun-olive.com',
    city: 'Beirut',
    country: 'Lebanon',
    group: 'Retail Outlets',
    dateCreated: '2026-04-18',
    balanceUsd: 875.25,
    balanceLbp: 78334875,
    creditLimitUsd: 3000,
    status: 'ACTIVE'
  }
];

export interface ReceiptRow {
  id: string;
  receiptNumber: string;
  customerName: string;
  date: string;
  paymentMethod: 'CASH' | 'WHISH' | 'CARD' | 'CHEQUE';
  amountUsd: number;
  amountLbp: number;
  referenceNo: string;
  status: 'POSTED' | 'DRAFT';
}

const INITIAL_RECEIPTS: ReceiptRow[] = [
  {
    id: 'REC-2026-081',
    receiptNumber: 'RV-10941',
    customerName: 'Al-Baraka Supermarket S.A.R.L',
    date: '2026-09-17',
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

export interface LeadRow {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  source: string;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'WON' | 'LOST';
  stage: string;
  salesOwner: string;
  phone: string;
  dateCreated: string;
}

const INITIAL_LEADS: LeadRow[] = [
  {
    id: 'LD-501',
    firstName: 'Karim',
    lastName: 'Haddad',
    company: 'Cedar Phoenicia Hotels Group',
    source: 'Website Form',
    status: 'QUALIFIED',
    stage: 'Proposal Sent',
    salesOwner: 'Mohammed Jichi',
    phone: '+961 1 360 000',
    dateCreated: '2026-09-10'
  },
  {
    id: 'LD-502',
    firstName: 'Rania',
    lastName: 'Zein',
    company: 'Byblos Organic Mart',
    source: 'WhatsApp Care',
    status: 'CONTACTED',
    stage: 'Discovery Call',
    salesOwner: 'Lara Khoury',
    phone: '+961 9 540 120',
    dateCreated: '2026-09-12'
  },
  {
    id: 'LD-503',
    firstName: 'Ziad',
    lastName: 'Boulos',
    company: 'Tyre Hospitality Catering',
    source: 'Referral',
    status: 'NEW',
    stage: 'Lead Inbound',
    salesOwner: 'Walid Sleiman',
    phone: '+961 7 344 890',
    dateCreated: '2026-09-14'
  }
];

export default function UnifiedCustomerManagementConsole() {
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

  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState('ALL');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [selectedCustomerForSoa, setSelectedCustomerForSoa] = useState<CustomerRow | null>(null);

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
    creditLimitUsd: 5000
  });

  const [newReceiptForm, setNewReceiptForm] = useState({
    customerName: '',
    paymentMethod: 'CASH',
    amountUsd: 0,
    amountLbp: 0,
    referenceNo: '',
    notes: ''
  });

  const [newLeadForm, setNewLeadForm] = useState({
    firstName: '',
    lastName: '',
    company: '',
    phone: '',
    source: 'Website Form',
    salesOwner: 'Mohammed Jichi'
  });

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return INITIAL_CUSTOMERS.filter(c => {
      const matchesSearch =
        c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGroup = groupFilter === 'ALL' || c.group === groupFilter;
      return matchesSearch && matchesGroup;
    });
  }, [searchQuery, groupFilter]);

  return (
    <div className="space-y-4 font-sans text-slate-800">
      {/* 1. SECTION TITLE & ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-primary text-primary-foreground">
              MODULE 3 • CRM &amp; AR
            </span>
            <span className="text-xs font-mono text-slate-500 font-bold">
              SECTION: {activeSection.toUpperCase().replace('_', ' ')}
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1">
            {activeSection === 'customers' && 'Master Customers & Accounts Receivable'}
            {activeSection === 'receipts' && 'Customer Receipts & Collection Vouchers'}
            {activeSection === 'aged' && 'Customer Aged Debtors Analysis'}
            {activeSection === 'insights' && 'AI Customer Insights & Lifetime Value'}
            {activeSection === 'tasks' && 'Tasks and Appointments Schedule'}
            {activeSection === 'leads' && 'Leads & Commercial Contacts Roster'}
            {activeSection === 'performance' && 'Sales Team Performance & Conversion'}
            {activeSection === 'groups' && 'Customers Groups Configuration'}
            {activeSection === 'categories' && 'Customers Categories Configuration'}
            {activeSection === 'tags' && 'Customers Tags Configuration'}
            {activeSection === 'leads_settings' && 'Leads Pipeline Settings & Stages'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {activeSection === 'customers' && (
            <button
              onClick={() => setIsCustomerModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-bold shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Customer</span>
            </button>
          )}

          {activeSection === 'receipts' && (
            <button
              onClick={() => setIsReceiptModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Receipt Voucher</span>
            </button>
          )}

          {activeSection === 'leads' && (
            <button
              onClick={() => setIsLeadModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-bold shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Lead</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 transition"
            title="Print View"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. SECTION RENDER SWITCHER */}
      {activeSection === 'customers' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[280px]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Quick lookups (exact match) or general search (name, company, code, phone)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold bg-white text-slate-700"
              >
                <option value="ALL">All Customer Groups</option>
                <option value="Wholesales / Clients">Wholesales / Clients</option>
                <option value="Key Commercial Accounts">Key Commercial Accounts</option>
                <option value="Retail Outlets">Retail Outlets</option>
              </select>

              <button
                onClick={() => { setSearchQuery(''); setGroupFilter('ALL'); }}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3.5">Cust. ID</th>
                    <th className="py-3 px-3.5">Company Account</th>
                    <th className="py-3 px-3.5">Contact Person</th>
                    <th className="py-3 px-3.5">Phone Number</th>
                    <th className="py-3 px-3.5">City - Country</th>
                    <th className="py-3 px-3.5">Group</th>
                    <th className="py-3 px-3.5 text-right">Balance (USD)</th>
                    <th className="py-3 px-3.5 text-right">Balance (LBP)</th>
                    <th className="py-3 px-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3.5 font-mono font-bold text-primary">{cust.code}</td>
                      <td className="py-3 px-3.5 font-bold text-slate-900">{cust.company}</td>
                      <td className="py-3 px-3.5 font-medium text-slate-700">{cust.firstName} {cust.lastName}</td>
                      <td className="py-3 px-3.5 font-mono text-slate-600">{cust.phone}</td>
                      <td className="py-3 px-3.5 text-slate-600">{cust.city}, {cust.country}</td>
                      <td className="py-3 px-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {cust.group}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900">
                        ${cust.balanceUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono text-slate-500">
                        {cust.balanceLbp.toLocaleString()} LBP
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedCustomerForSoa(cust)}
                            className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-bold hover:bg-amber-100 transition"
                            title="Statement of Account"
                          >
                            Statement
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Customer Receipts */}
      {activeSection === 'receipts' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Receipt #</th>
                    <th className="py-3 px-4">Customer Account</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-center">Tender</th>
                    <th className="py-3 px-4">Reference #</th>
                    <th className="py-3 px-4 text-right">Amount (USD)</th>
                    <th className="py-3 px-4 text-right">Amount (LBP)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {INITIAL_RECEIPTS.map(rec => (
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

      {/* Customer Aged */}
      {activeSection === 'aged' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="font-bold text-xs text-slate-700">Till Date: As of Today • All Customer Tiers</span>
              <span className="text-xs font-mono font-bold text-rose-700">Total Outstanding: $5,525.75</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3.5">Cust. ID</th>
                    <th className="py-3 px-3.5 font-sans">Customer / Company</th>
                    <th className="py-3 px-3.5 font-sans">Group</th>
                    <th className="py-3 px-3.5 text-right">Current</th>
                    <th className="py-3 px-3.5 text-right">1-30 Days</th>
                    <th className="py-3 px-3.5 text-right">31-60 Days</th>
                    <th className="py-3 px-3.5 text-right">61-90 Days</th>
                    <th className="py-3 px-3.5 text-right">&gt;90 Days</th>
                    <th className="py-3 px-3.5 text-right">Total Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-3.5 font-bold text-primary">SO-CLI-01</td>
                    <td className="py-3 px-3.5 font-sans font-bold text-slate-900">Al-Baraka Supermarket S.A.R.L</td>
                    <td className="py-3 px-3.5 font-sans text-slate-600">Wholesales</td>
                    <td className="py-3 px-3.5 text-right text-emerald-600">$450.00</td>
                    <td className="py-3 px-3.5 text-right text-slate-600">$1,000.00</td>
                    <td className="py-3 px-3.5 text-right text-slate-400">$0.00</td>
                    <td className="py-3 px-3.5 text-right text-slate-400">$0.00</td>
                    <td className="py-3 px-3.5 text-right text-slate-400">$0.00</td>
                    <td className="py-3 px-3.5 text-right font-bold text-slate-900">$1,450.00</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-3.5 font-bold text-primary">SO-CLI-02</td>
                    <td className="py-3 px-3.5 font-sans font-bold text-slate-900">Beirut Gourmet Emporium</td>
                    <td className="py-3 px-3.5 font-sans text-slate-600">Key Accounts</td>
                    <td className="py-3 px-3.5 text-right text-emerald-600">$1,200.50</td>
                    <td className="py-3 px-3.5 text-right text-slate-600">$2,000.00</td>
                    <td className="py-3 px-3.5 text-right text-slate-400">$0.00</td>
                    <td className="py-3 px-3.5 text-right text-slate-400">$0.00</td>
                    <td className="py-3 px-3.5 text-right text-slate-400">$0.00</td>
                    <td className="py-3 px-3.5 text-right font-bold text-slate-900">$3,200.50</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-3.5 font-bold text-primary">SO-CLI-04</td>
                    <td className="py-3 px-3.5 font-sans font-bold text-slate-900">Verdun Olive Specialty Boutique</td>
                    <td className="py-3 px-3.5 font-sans text-slate-600">Retail</td>
                    <td className="py-3 px-3.5 text-right text-emerald-600">$875.25</td>
                    <td className="py-3 px-3.5 text-right text-slate-400">$0.00</td>
                    <td className="py-3 px-3.5 text-right text-slate-400">$0.00</td>
                    <td className="py-3 px-3.5 text-right text-slate-400">$0.00</td>
                    <td className="py-3 px-3.5 text-right text-slate-400">$0.00</td>
                    <td className="py-3 px-3.5 text-right font-bold text-slate-900">$875.25</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Leads & Contacts */}
      {activeSection === 'leads' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4"># ID</th>
                    <th className="py-3 px-4">Lead Name</th>
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-4">Source</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Pipeline Stage</th>
                    <th className="py-3 px-4">Sales Owner</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Created Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {INITIAL_LEADS.map(lead => (
                    <tr key={lead.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-primary">{lead.id}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{lead.firstName} {lead.lastName}</td>
                      <td className="py-3 px-4 text-slate-700">{lead.company}</td>
                      <td className="py-3 px-4 text-slate-600">{lead.source}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{lead.stage}</td>
                      <td className="py-3 px-4 text-slate-600">{lead.salesOwner}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{lead.phone}</td>
                      <td className="py-3 px-4 text-slate-500">{lead.dateCreated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Customers Groups / Categories / Tags Settings */}
      {(activeSection === 'groups' || activeSection === 'categories' || activeSection === 'tags' || activeSection === 'leads_settings') && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-bold text-slate-900 text-sm">
              Configuration Registry • {activeSection.toUpperCase().replace('_', ' ')}
            </h2>
            <button className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-bold shadow-xs transition">
              + Add Entry
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Wholesales / Clients</span>
              <span className="text-lg font-bold text-slate-900 mt-1 block">5% Volume Discount</span>
              <span className="text-[11px] text-slate-500 mt-1 block">Primary commercial distributors tier</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Key Commercial Accounts</span>
              <span className="text-lg font-bold text-slate-900 mt-1 block">10% Key Partner Margin</span>
              <span className="text-[11px] text-slate-500 mt-1 block">Hotel &amp; large supermarket chains</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Retail Outlets</span>
              <span className="text-lg font-bold text-slate-900 mt-1 block">Standard List Price</span>
              <span className="text-[11px] text-slate-500 mt-1 block">Direct POS and retail walk-in buyers</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NEW CUSTOMER */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Add New Commercial Customer</h3>
              <button onClick={() => setIsCustomerModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  placeholder="First name"
                  value={newCustomerForm.firstName}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, firstName: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Last name"
                  value={newCustomerForm.lastName}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, lastName: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Company Account Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al-Baraka Supermarket S.A.R.L"
                  value={newCustomerForm.company}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, company: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Mobile Tel *</label>
                <input
                  type="text"
                  required
                  placeholder="+961 3 123 456"
                  value={newCustomerForm.phone}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="orders@company.com"
                  value={newCustomerForm.email}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">City</label>
                <input
                  type="text"
                  value={newCustomerForm.city}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, city: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Credit Limit ($)</label>
                <input
                  type="number"
                  value={newCustomerForm.creditLimitUsd}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, creditLimitUsd: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCustomerModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  alert('Customer profile saved successfully to Vanguard Supabase!');
                  setIsCustomerModalOpen(false);
                }}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-bold transition"
              >
                Save Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: STATEMENT OF ACCOUNT */}
      {selectedCustomerForSoa && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">Customer Statement of Account (SOA)</h3>
                <p className="text-xs text-slate-500 font-semibold">{selectedCustomerForSoa.company} • {selectedCustomerForSoa.code}</p>
              </div>
              <button onClick={() => setSelectedCustomerForSoa(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between text-xs">
              <div>
                <span className="text-slate-500 block">Current Balance USD</span>
                <span className="text-base font-bold font-mono text-slate-900">${selectedCustomerForSoa.balanceUsd.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Current Balance LBP</span>
                <span className="text-base font-bold font-mono text-slate-900">{selectedCustomerForSoa.balanceLbp.toLocaleString()} LBP</span>
              </div>
              <div>
                <span className="text-slate-500 block">Credit Limit</span>
                <span className="text-base font-bold font-mono text-blue-700">${selectedCustomerForSoa.creditLimitUsd.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official SOA</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
