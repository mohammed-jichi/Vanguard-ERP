'use client';
import { useLanguage } from '@/lib/LanguageContext';

/**
 * Vanguard ERP - Module 6: Accounts Payables (AP Aging & Supplier Station)
 * Exact Omega ERP Functional Parity:
 * A. Master Grid with Dynamic Bucket Checkbox Headers ([ ] 7d, 14d, 30d, 60d, 90d, Over Due)
 * B. 3 Action Icons per supplier row (Report/Print, Document -> Accounting Payment, Info -> New Supplier)
 * C. New Supplier Modal (Marketplace search, VAT Reg toggle, Payment Terms modal)
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Printer,
  FileText,
  DollarSign,
  Info,
  X,
  Plus,
  RefreshCw,
  Check,
  Building,
  Layers,
  ArrowUpDown,
  Download,
  ShoppingBag
} from 'lucide-react';
import {
  APAgingItem,
  INITIAL_AP_AGING,
  LBP_RATE
} from '@/lib/accountingData';
import { NewPaymentTermModal } from './ModalsShared';

interface Module6AccountsPayablesProps {
  onShowToast: (msg: string, isError?: boolean) => void;
  onOpenPaymentWithSupplier?: (vendorCode: string, supplierName: string) => void;
}

export function Module6AccountsPayables({
  onShowToast,
  onOpenPaymentWithSupplier
}: Module6AccountsPayablesProps) {
  const { t } = useLanguage();
  const [suppliers, setSuppliers] = useState<APAgingItem[]>(() => INITIAL_AP_AGING);
  const [selectedVendorCodes, setSelectedVendorCodes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showZeroBalances, setShowZeroBalances] = useState(false);

  // Dynamic Bucket Checkbox Headers: [ ] 7 Days | [ ] 14 Days | [ ] 30 Days | [ ] 60 Days | [ ] 90 Days | Over Due
  const [filterBucket7, setFilterBucket7] = useState(false);
  const [filterBucket14, setFilterBucket14] = useState(false);
  const [filterBucket30, setFilterBucket30] = useState(false);
  const [filterBucket60, setFilterBucket60] = useState(false);
  const [filterBucket90, setFilterBucket90] = useState(false);
  const [filterBucketOverdue, setFilterBucketOverdue] = useState(false);

  // Modal State
  const [newSupplierModalOpen, setNewSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<APAgingItem | null>(null);
  const [paymentTermModalOpen, setPaymentTermModalOpen] = useState(false);

  // New Supplier Form State
  const [suppForm, setSuppForm] = useState<Partial<APAgingItem>>({
    supplierName: '',
    contactPerson: '',
    contactTitle: 'Managing Director',
    status: 'CURRENT',
    phone: '',
    mobile: '+961 ',
    fax: '',
    email: '',
    emailCc: '',
    street: '',
    city: 'Beirut',
    country: 'Lebanon',
    postalCode: '',
    currency: 'USD',
    terms: 'Net 30 Days',
    paymentTypes: 'Wire Transfer / Check',
    bankInfo: '',
    vatReg: false,
    vatNb: '',
    grade: 'A',
    website: '',
    internalNote: ''
  });

  const [paymentTermsList, setPaymentTermsList] = useState<string[]>([
    'Cash on Delivery',
    '7 Days',
    '14 Days',
    'Net 30 Days',
    '60 Days',
    '90 Days'
  ]);

  // Interactive Dynamic Bucket Filtering:
  // Toggling any bucket checkbox dynamically filters the table and isolates that specific aging duration.
  const isAnyBucketActive =
    filterBucket7 || filterBucket14 || filterBucket30 || filterBucket60 || filterBucket90 || filterBucketOverdue;

  const filteredSuppliers = useMemo(() => {
    let list = [...suppliers];

    if (!showZeroBalances) {
      list = list.filter((s) => s.totalOwed > 0);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.supplierName.toLowerCase().includes(q) ||
          s.vendorCode.toLowerCase().includes(q) ||
          (s.email && s.email.toLowerCase().includes(q))
      );
    }

    if (isAnyBucketActive) {
      list = list.filter((s) => {
        if (filterBucket7 && s.days7 > 0) return true;
        if (filterBucket14 && s.days14 > 0) return true;
        if (filterBucket30 && s.days30 > 0) return true;
        if (filterBucket60 && s.days60 > 0) return true;
        if (filterBucket90 && s.days90Plus > 0) return true;
        if (filterBucketOverdue && s.overDue > 0) return true;
        return false;
      });
    }

    return list;
  }, [
    suppliers,
    showZeroBalances,
    searchQuery,
    isAnyBucketActive,
    filterBucket7,
    filterBucket14,
    filterBucket30,
    filterBucket60,
    filterBucket90,
    filterBucketOverdue
  ]);

  const totalAmountUSD = filteredSuppliers.reduce((sum, s) => sum + s.totalOwed, 0);

  const handleToggleSelectRow = (code: string) => {
    setSelectedVendorCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleSelectAll = () => {
    if (selectedVendorCodes.length === filteredSuppliers.length) {
      setSelectedVendorCodes([]);
    } else {
      setSelectedVendorCodes(filteredSuppliers.map((s) => s.vendorCode));
    }
  };

  const handlePaySelected = () => {
    if (selectedVendorCodes.length === 0) {
      onShowToast('Please check at least one supplier row to pay.', true);
      return;
    }
    const target = suppliers.find((s) => s.vendorCode === selectedVendorCodes[0]);
    if (onOpenPaymentWithSupplier && target) {
      onOpenPaymentWithSupplier(target.vendorCode, target.supplierName);
    } else {
      onShowToast(`Disbursing payment batch for ${selectedVendorCodes.length} selected suppliers.`);
    }
  };

  const handleSaveSupplier = () => {
    if (!suppForm.supplierName?.trim()) {
      onShowToast('Company Name* is mandatory.', true);
      return;
    }
    const nextCode = `40110-${Math.floor(10 + Math.random() * 90)}`;
    const newSupp: APAgingItem = {
      vendorCode: nextCode,
      supplierName: suppForm.supplierName,
      current: 0,
      days7: 0,
      days14: 0,
      days30: 0,
      days60: 0,
      days90Plus: 0,
      overDue: 0,
      lastPaymentDate: new Date().toISOString().split('T')[0],
      totalOwed: 0,
      terms: suppForm.terms || 'Net 30 Days',
      status: 'CURRENT',
      ...suppForm
    } as APAgingItem;

    setSuppliers((prev) => [newSupp, ...prev]);
    onShowToast(`New Supplier "${newSupp.supplierName}" registered with Account #${nextCode}!`);
    setNewSupplierModalOpen(false);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* ========================================================================= */}
      {/* A. MASTER GRID & INTERACTIVE FILTERING                                    */}
      {/* ========================================================================= */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
        {/* Header Controls: Search... | Show 0 Balances Checkbox | Total Amount: 0.00 $ | Export PDF | Pay Selected */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <span>Accounts Payables (AP Aging &amp; Supplier Station)</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('outstanding_supplier_balances_maturity', 'Outstanding supplier balances, maturity bucket filtering, payment orders, and marketplace directory')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Pay Selected */}
            <button
              type="button"
              onClick={handlePaySelected}
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Pay Selected ({selectedVendorCodes.length})</span>
            </button>

            {/* Export PDF */}
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') window.print();
              }}
              className="bg-card hover:bg-muted text-foreground border border-border px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{t('export_pdf', 'Export PDF')}</span>
            </button>

            {/* + New Supplier */}
            <button
              type="button"
              onClick={() => {
                setSuppForm({
                  supplierName: '',
                  contactPerson: '',
                  contactTitle: 'Managing Director',
                  mobile: '+961 ',
                  city: 'Beirut',
                  country: 'Lebanon',
                  currency: 'USD',
                  terms: 'Net 30 Days',
                  paymentTypes: 'Wire Transfer / Check',
                  grade: 'A',
                  vatReg: false
                });
                setNewSupplierModalOpen(true);
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Supplier</span>
            </button>
          </div>
        </div>

        {/* Filter Bar Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-medium">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search... */}
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search_supplier_account', 'Search supplier, account #...')}
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
            <span className="text-muted-foreground text-[11px] block">{t('total_outstanding_payables', 'Total Outstanding Payables:')}</span>
            <span className="font-mono text-base font-bold text-destructive">
              Total Amount: ${totalAmountUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* TABLE WITH DYNAMIC BUCKET CHECKBOX HEADERS */}
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-muted text-foreground font-semibold border-b border-border select-none">
                <th className="p-2.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredSuppliers.length > 0 &&
                      selectedVendorCodes.length === filteredSuppliers.length
                    }
                    onChange={handleSelectAll}
                    className="rounded border-input text-primary focus:ring-primary h-3.5 w-3.5"
                  />
                </th>
                <th className="p-2.5">{t('supplier', 'Supplier')}</th>
                <th className="p-2.5 text-right">Amount ($)</th>
                <th className="p-2.5">{t('last_payment_date', 'Last Payment Date')}</th>

                {/* DYNAMIC BUCKET CHECKBOX HEADERS */}
                <th className="p-2.5 text-right">
                  <label className="inline-flex items-center gap-1 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={filterBucket7}
                      onChange={(e) => setFilterBucket7(e.target.checked)}
                      className="rounded border-input text-primary focus:ring-primary h-3 w-3"
                    />
                    <span>7 Days</span>
                  </label>
                </th>

                <th className="p-2.5 text-right">
                  <label className="inline-flex items-center gap-1 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={filterBucket14}
                      onChange={(e) => setFilterBucket14(e.target.checked)}
                      className="rounded border-input text-primary focus:ring-primary h-3 w-3"
                    />
                    <span>14 Days</span>
                  </label>
                </th>

                <th className="p-2.5 text-right">
                  <label className="inline-flex items-center gap-1 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={filterBucket30}
                      onChange={(e) => setFilterBucket30(e.target.checked)}
                      className="rounded border-input text-primary focus:ring-primary h-3 w-3"
                    />
                    <span>30 Days</span>
                  </label>
                </th>

                <th className="p-2.5 text-right">
                  <label className="inline-flex items-center gap-1 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={filterBucket60}
                      onChange={(e) => setFilterBucket60(e.target.checked)}
                      className="rounded border-input text-primary focus:ring-primary h-3 w-3"
                    />
                    <span>60 Days</span>
                  </label>
                </th>

                <th className="p-2.5 text-right">
                  <label className="inline-flex items-center gap-1 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={filterBucket90}
                      onChange={(e) => setFilterBucket90(e.target.checked)}
                      className="rounded border-input text-primary focus:ring-primary h-3 w-3"
                    />
                    <span>90 Days</span>
                  </label>
                </th>

                <th className="p-2.5 text-right text-destructive">
                  <label className="inline-flex items-center gap-1 cursor-pointer font-bold text-destructive">
                    <input
                      type="checkbox"
                      checked={filterBucketOverdue}
                      onChange={(e) => setFilterBucketOverdue(e.target.checked)}
                      className="rounded border-input text-destructive focus:ring-destructive h-3 w-3"
                    />
                    <span>{t('over_due', 'Over Due')}</span>
                  </label>
                </th>

                <th className="p-2.5 text-center min-w-[130px]">{t('actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-muted-foreground">
                    {t('no_payables_found_for_selected_filter', 'No Payables Found for selected filter buckets!')}
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((supp) => {
                  const isChecked = selectedVendorCodes.includes(supp.vendorCode);
                  return (
                    <tr
                      key={supp.vendorCode}
                      className={`hover:bg-muted/40 transition-colors ${isChecked ? 'bg-primary/5' : ''}`}
                    >
                      <td className="p-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelectRow(supp.vendorCode)}
                          className="rounded border-input text-primary focus:ring-primary h-3.5 w-3.5"
                        />
                      </td>

                      <td className="p-2.5">
                        <div className="font-semibold text-foreground">{supp.supplierName}</div>
                        <div className="text-[10px] font-mono text-muted-foreground">
                          Code: #{supp.vendorCode} | Terms: {supp.terms}
                        </div>
                      </td>

                      <td className="p-2.5 font-mono font-bold text-destructive text-right">
                        ${supp.totalOwed.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      <td className="p-2.5 font-mono text-muted-foreground text-[11px]">
                        {supp.lastPaymentDate}
                      </td>

                      <td className="p-2.5 font-mono text-muted-foreground text-right">
                        ${supp.days7.toLocaleString()}
                      </td>
                      <td className="p-2.5 font-mono text-muted-foreground text-right">
                        ${supp.days14.toLocaleString()}
                      </td>
                      <td className="p-2.5 font-mono text-muted-foreground text-right">
                        ${supp.days30.toLocaleString()}
                      </td>
                      <td className="p-2.5 font-mono text-muted-foreground text-right">
                        ${supp.days60.toLocaleString()}
                      </td>
                      <td className="p-2.5 font-mono text-muted-foreground text-right">
                        ${supp.days90Plus.toLocaleString()}
                      </td>
                      <td className="p-2.5 font-mono font-bold text-destructive text-right">
                        ${supp.overDue.toLocaleString()}
                      </td>

                      {/* 3 Action Icons: 1. Report/Print, 2. Document -> Accounting Payment, 3. Info (i) */}
                      <td className="p-2.5">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* 1. Report/Print -> Statement of Account Report for Supplier */}
                          <button
                            type="button"
                            onClick={() => {
                              if (typeof window !== 'undefined') window.print();
                            }}
                            title={t('statement_of_account_report', 'Statement of Account Report')}
                            className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted transition-colors cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* 2. Document -> Opens Accounting Payment with Pay To & Balance populated */}
                          <button
                            type="button"
                            onClick={() => {
                              if (onOpenPaymentWithSupplier) {
                                onOpenPaymentWithSupplier(supp.vendorCode, supp.supplierName);
                              } else {
                                onShowToast(`Opened Accounting Payment for ${supp.supplierName}.`);
                              }
                            }}
                            title="Issue Accounting Payment (PV)"
                            className="text-muted-foreground hover:text-emerald-700 p-1 rounded hover:bg-muted transition-colors cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          {/* 3. Info (i) -> New Supplier Modal */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSupplier(supp);
                              setSuppForm({ ...supp });
                              setNewSupplierModalOpen(true);
                            }}
                            title={t('view_edit_supplier_profile', 'View / Edit Supplier Profile')}
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
      {/* B. NEW SUPPLIER MODAL                                                     */}
      {/* ========================================================================= */}
      {newSupplierModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Building className="w-4 h-4 text-primary" />
                <span>{editingSupplier ? 'Edit Supplier Profile' : 'New Supplier Profile'}</span>
              </h4>
              <button
                type="button"
                onClick={() => setNewSupplierModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 max-h-[65vh] space-y-4 pr-1 text-xs font-medium">
              {/* General Section: Company Name* + Green Search Button (Search in Vanguard Marketplace), Contact Person, Contact Title (+), Not Active Checkbox */}
              <div className="bg-muted/40 p-3.5 rounded-xl border border-border space-y-3">
                <span className="font-bold text-foreground block">{t('general_section', 'General Section')}</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="text-foreground mb-1 block font-semibold">{t('company_name', 'Company Name *')}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={suppForm.supplierName || ''}
                        onChange={(e) => setSuppForm({ ...suppForm, supplierName: e.target.value })}
                        placeholder={t('eg_south_olive_farmers_cooperative', 'e.g. South Olive Farmers Cooperative')}
                        className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs"
                      />
                      {/* Green Search Button: Search in Vanguard Marketplace */}
                      <button
                        type="button"
                        onClick={() => onShowToast('Searching Vanguard B2B Marketplace verified supplier registry...')}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-xs"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{t('search_in_vanguard_marketplace', 'Search in Vanguard Marketplace')}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-muted-foreground mb-1 block">{t('contact_person', 'Contact Person')}</label>
                    <input
                      type="text"
                      value={suppForm.contactPerson || ''}
                      onChange={(e) => setSuppForm({ ...suppForm, contactPerson: e.target.value })}
                      className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="text-muted-foreground mb-1 block flex items-center justify-between">
                      <span>{t('contact_title', 'Contact Title')}</span>
                      <button
                        type="button"
                        onClick={() => onShowToast('New contact title dialog opened.')}
                        className="text-primary text-[10px] hover:underline cursor-pointer"
                      >
                        + Add Title
                      </button>
                    </label>
                    <select
                      value={suppForm.contactTitle}
                      onChange={(e) => setSuppForm({ ...suppForm, contactTitle: e.target.value })}
                      className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs"
                    >
                      <option>{t('managing_director', 'Managing Director')}</option>
                      <option>{t('chairman', 'Chairman')}</option>
                      <option>{t('sales_director', 'Sales Director')}</option>
                      <option>{t('procurement_officer', 'Procurement Officer')}</option>
                    </select>
                  </div>

                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 text-muted-foreground cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={suppForm.status === 'OVERDUE'}
                        onChange={(e) => setSuppForm({ ...suppForm, status: e.target.checked ? 'OVERDUE' : 'CURRENT' })}
                        className="rounded border-input text-destructive focus:ring-destructive h-4 w-4"
                      />
                      <span>{t('not_active_inactive_vendor', 'Not Active / Inactive Vendor')}</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Contact Info: Phone Number, Mobile, Fax Number, Email Address, Email CC */}
              <div className="bg-muted/40 p-3.5 rounded-xl border border-border space-y-3">
                <span className="font-bold text-foreground block">{t('contact_information', 'Contact Information')}</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-muted-foreground mb-1 block">{t('phone_number', 'Phone Number')}</label>
                    <input
                      type="text"
                      value={suppForm.phone || ''}
                      onChange={(e) => setSuppForm({ ...suppForm, phone: e.target.value })}
                      placeholder="+961 1 000 000"
                      className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-muted-foreground mb-1 block">{t('mobile', 'Mobile')}</label>
                    <input
                      type="text"
                      value={suppForm.mobile || ''}
                      onChange={(e) => setSuppForm({ ...suppForm, mobile: e.target.value })}
                      placeholder="+961 70 000 000"
                      className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-muted-foreground mb-1 block">{t('fax_number', 'Fax Number')}</label>
                    <input
                      type="text"
                      value={suppForm.fax || ''}
                      onChange={(e) => setSuppForm({ ...suppForm, fax: e.target.value })}
                      className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-muted-foreground mb-1 block">{t('email_address', 'Email Address')}</label>
                    <input
                      type="email"
                      value={suppForm.email || ''}
                      onChange={(e) => setSuppForm({ ...suppForm, email: e.target.value })}
                      placeholder={t('vendordomainlb', 'vendor@domain.lb')}
                      className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="text-muted-foreground mb-1 block">{t('email_cc', 'Email CC')}</label>
                    <input
                      type="email"
                      value={suppForm.emailCc || ''}
                      onChange={(e) => setSuppForm({ ...suppForm, emailCc: e.target.value })}
                      placeholder={t('financevendorlb', 'finance@vendor.lb')}
                      className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Address: Street, City, Country, Postal Code */}
              <div className="bg-muted/40 p-3.5 rounded-xl border border-border space-y-3">
                <span className="font-bold text-foreground block">{t('address', 'Address')}</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-muted-foreground mb-1 block">{t('street', 'Street')}</label>
                    <input
                      type="text"
                      value={suppForm.street || ''}
                      onChange={(e) => setSuppForm({ ...suppForm, street: e.target.value })}
                      className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="text-muted-foreground mb-1 block">City (Dropdown/Lookup)</label>
                    <select
                      value={suppForm.city}
                      onChange={(e) => setSuppForm({ ...suppForm, city: e.target.value })}
                      className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs"
                    >
                      <option value="Beirut">{t('beirut', 'Beirut')}</option>
                      <option value="Saida">{t('saida', 'Saida')}</option>
                      <option value="Tyre">{t('tyre', 'Tyre')}</option>
                      <option value="Nabatieh">{t('nabatieh', 'Nabatieh')}</option>
                      <option value="Tripoli">{t('tripoli', 'Tripoli')}</option>
                      <option value="Choueifat">{t('choueifat', 'Choueifat')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-muted-foreground mb-1 block">{t('country', 'Country')}</label>
                    <select
                      value={suppForm.country}
                      onChange={(e) => setSuppForm({ ...suppForm, country: e.target.value })}
                      className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs"
                    >
                      <option value="Lebanon">{t('lebanon', 'Lebanon')}</option>
                      <option value="United Arab Emirates">{t('united_arab_emirates', 'United Arab Emirates')}</option>
                      <option value="Saudi Arabia">{t('saudi_arabia', 'Saudi Arabia')}</option>
                      <option value="Italy">Italy (Press Machinery)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-muted-foreground mb-1 block">{t('postal_code', 'Postal Code')}</label>
                    <input
                      type="text"
                      value={suppForm.postalCode || ''}
                      onChange={(e) => setSuppForm({ ...suppForm, postalCode: e.target.value })}
                      className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Billing: Supplier Currency*, Payments Terms*, Payments Types*, Bank Information, V.A.T Reg Checkbox displaying V.A.T NB */}
              <div className="bg-muted/40 p-3.5 rounded-xl border border-border space-y-3">
                <span className="font-bold text-foreground block">{t('billing_configuration', 'Billing Configuration')}</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-foreground mb-1 block font-semibold flex items-center justify-between">
                      <span>{t('supplier_currency', 'Supplier Currency *')}</span>
                      <button
                        type="button"
                        onClick={() => onShowToast('Currency configuration opened.')}
                        className="text-primary text-[10px] hover:underline"
                      >
                        + Add Cur
                      </button>
                    </label>
                    <select
                      value={suppForm.currency}
                      onChange={(e) => setSuppForm({ ...suppForm, currency: e.target.value as any })}
                      className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs font-bold"
                    >
                      <option value="USD">USD ($) - US Dollar</option>
                      <option value="LBP">LBP (L.L) - Lebanese Pound</option>
                      <option value="EUR">EUR (€) - Euro</option>
                      <option value="GBP">GBP (£) - British Pound</option>
                    </select>
                  </div>

                  {/* Payment Terms* + button opening New Payment Term Modal */}
                  <div>
                    <label className="text-foreground mb-1 block font-semibold flex items-center justify-between">
                      <span>{t('payments_terms', 'Payments Terms *')}</span>
                      <button
                        type="button"
                        onClick={() => setPaymentTermModalOpen(true)}
                        className="text-primary text-[10px] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{t('add_term', 'Add Term')}</span>
                      </button>
                    </label>
                    <select
                      value={suppForm.terms}
                      onChange={(e) => setSuppForm({ ...suppForm, terms: e.target.value })}
                      className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs"
                    >
                      {paymentTermsList.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-foreground mb-1 block font-semibold">{t('payments_types', 'Payments Types *')}</label>
                    <select
                      value={suppForm.paymentTypes}
                      onChange={(e) => setSuppForm({ ...suppForm, paymentTypes: e.target.value })}
                      className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs"
                    >
                      <option value="Wire Transfer / Check">{t('wire_transfer_check', 'Wire Transfer / Check')}</option>
                      <option value="Cash">{t('cash', 'Cash')}</option>
                      <option value="Credit Card">{t('credit_card', 'Credit Card')}</option>
                      <option value="Check">{t('check', 'Check')}</option>
                      <option value="Wire Transfer">{t('wire_transfer', 'Wire Transfer')}</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-muted-foreground mb-1 block">{t('bank_information', 'Bank Information')}</label>
                    <textarea
                      rows={2}
                      value={suppForm.bankInfo || ''}
                      onChange={(e) => setSuppForm({ ...suppForm, bankInfo: e.target.value })}
                      placeholder={t('bank_name_branch_ibanaccount_number', 'Bank name, branch, IBAN/Account Number...')}
                      className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs text-xs"
                    />
                  </div>

                  {/* V.A.T Reg Checkbox: When checked, dynamically displays V.A.T NB input */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 font-semibold text-foreground cursor-pointer select-none pt-2">
                      <input
                        type="checkbox"
                        checked={suppForm.vatReg || false}
                        onChange={(e) => setSuppForm({ ...suppForm, vatReg: e.target.checked })}
                        className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                      />
                      <span>V.A.T Reg (Registered for VAT)</span>
                    </label>

                    {suppForm.vatReg && (
                      <div className="animate-fadeIn">
                        <label className="text-foreground mb-0.5 block text-[11px] font-semibold">
                          {t('vat_nb', 'V.A.T NB *')}
                        </label>
                        <input
                          type="text"
                          value={suppForm.vatNb || ''}
                          onChange={(e) => setSuppForm({ ...suppForm, vatNb: e.target.value })}
                          placeholder={t('eg_vat882109', 'e.g. VAT-882109')}
                          className="w-full bg-card border border-input rounded-lg p-1.5 text-foreground shadow-2xs font-mono"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Information: Account Number (Refresh button), Grade (A to Z), Website, Internal Note */}
              <div className="bg-muted/40 p-3.5 rounded-xl border border-border space-y-3">
                <span className="font-bold text-foreground block">{t('additional_information', 'Additional Information')}</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-muted-foreground mb-1 block flex items-center justify-between">
                      <span>{t('account_number', 'Account Number')}</span>
                      <RefreshCw
                        className="w-3 h-3 text-muted-foreground hover:text-primary cursor-pointer"
                        onClick={() => onShowToast('Refreshed Supplier Account Number.')}
                      />
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={suppForm.vendorCode || '40110-NEW'}
                      className="w-full bg-muted border border-input rounded-lg p-2 text-foreground font-mono shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="text-muted-foreground mb-1 block">Grade (A to Z)</label>
                    <select
                      value={suppForm.grade}
                      onChange={(e) => setSuppForm({ ...suppForm, grade: e.target.value })}
                      className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs font-bold"
                    >
                      {['A', 'B', 'C', 'D', 'E', 'F'].map((g) => (
                        <option key={g} value={g}>
                          Grade {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-muted-foreground mb-1 block">{t('website', 'Website')}</label>
                    <input
                      type="text"
                      value={suppForm.website || ''}
                      onChange={(e) => setSuppForm({ ...suppForm, website: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs"
                    />
                  </div>

                  <div className="md:col-span-4">
                    <label className="text-muted-foreground mb-1 block">{t('internal_note', 'Internal Note')}</label>
                    <textarea
                      rows={2}
                      value={suppForm.internalNote || ''}
                      onChange={(e) => setSuppForm({ ...suppForm, internalNote: e.target.value })}
                      placeholder={t('audited_procurement_notes', 'Audited procurement notes...')}
                      className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setNewSupplierModalOpen(false)}
                className="bg-card hover:bg-muted text-muted-foreground px-4 py-2 rounded-lg text-xs font-semibold border border-border cursor-pointer"
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleSaveSupplier}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
              >
                {t('save', 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Payment Term Modal */}
      <NewPaymentTermModal
        isOpen={paymentTermModalOpen}
        onClose={() => setPaymentTermModalOpen(false)}
        onSave={(term) => {
          const formatted = `${term.description} (${term.days} Days)`;
          setPaymentTermsList((prev) => [...prev, formatted]);
          setSuppForm((prev) => ({ ...prev, terms: formatted }));
          onShowToast(`Created and selected payment term: "${formatted}".`);
        }}
      />
    </div>
  );
}
