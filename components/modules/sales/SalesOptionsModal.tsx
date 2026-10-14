'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  X,
  Check,
  RotateCcw,
  Sliders,
  FileText,
  DollarSign,
  Percent,
  Building,
  Printer,
  User,
  MapPin,
  Tag,
  ShieldAlert,
  Layers,
  Globe,
  HelpCircle,
  Truck
} from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { toast } from '@/lib/toast';
import {
  SalesOptionsState,
  DEFAULT_SALES_OPTIONS,
  persistSalesOptions,
  getAvailableCurrencyOptions,
  getAvailableSalesmen,
  getAvailableDepartments,
  getAvailableLocations
} from '@/lib/salesOptionsService';

interface SalesOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentOptions: SalesOptionsState;
  onSaveSuccess: (updated: SalesOptionsState) => void;
  tenantId?: string;
  branchOptions?: { id: string; name: string }[];
  paymentTypeOptions?: { id: string; name: string }[];
}

export default function SalesOptionsModal({
  isOpen,
  onClose,
  currentOptions,
  onSaveSuccess,
  tenantId,
  branchOptions = [
    { id: 'zeit', name: 'Zeit w zaytoun ljanoub' },
    { id: 'southern', name: 'Southern Olive Oil Products S.A.R.L' }
  ],
  paymentTypeOptions = [
    { id: 'cash_usd', name: 'Cash USD' },
    { id: 'cash_lbp', name: 'Cash LBP' },
    { id: 'visa', name: 'Visa / MasterCard' },
    { id: 'check', name: 'Bank Check' },
    { id: 'on_account', name: 'On Account / Credit' },
    { id: 'whish', name: 'Whish Money / OMT' }
  ]
}: SalesOptionsModalProps) {
  const { t, dir } = useLanguage();
  const [activeTab, setActiveTab] = useState<'sales' | 'invoice'>('sales');
  const [formData, setFormData] = useState<SalesOptionsState>(currentOptions);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(currentOptions);
  }, [currentOptions, isOpen]);

  if (!isOpen) return null;

  const currencyOptions = getAvailableCurrencyOptions('LBP');
  const salesmenOptions = getAvailableSalesmen();
  const departmentOptions = getAvailableDepartments();
  const locationOptions = getAvailableLocations();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await persistSalesOptions(formData, tenantId);
      toast.success(t('options_saved', 'Sales Options & Invoice Setup saved successfully!'));
      onSaveSuccess(formData);
      onClose();
    } catch (err: any) {
      toast.error('Failed to save options: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (confirm(t('confirm_reset_defaults', 'Reset all sales and invoice options to standard factory defaults?'))) {
      setFormData(DEFAULT_SALES_OPTIONS);
      toast.info(t('options_reset', 'Options reset to default values. Click Save to apply.'));
    }
  };

  return (
    <div dir={dir} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 md:p-6 overflow-y-auto animate-fade-in font-sans">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* 1. MODAL HEADER */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                <span>{t('sales_options_title', 'Options')}</span>
                <span className="text-[11px] font-medium bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                  Sales & Invoice Engine
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Configure commercial markup, system defaults, operational validations, and invoice rendering rules.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. TAB NAVIGATION BAR */}
        <div className="bg-slate-100 border-b border-slate-200 px-5 pt-2 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('sales')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition cursor-pointer border-t border-x ${
              activeTab === 'sales'
                ? 'bg-white text-blue-700 border-slate-200 -mb-px shadow-2xs'
                : 'text-slate-600 border-transparent hover:bg-slate-200/70'
            }`}
          >
            <Sliders className="w-4 h-4 text-blue-600" />
            <span>{t('tab_sales_options', 'Sales Options')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('invoice')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition cursor-pointer border-t border-x ${
              activeTab === 'invoice'
                ? 'bg-white text-emerald-700 border-slate-200 -mb-px shadow-2xs'
                : 'text-slate-600 border-transparent hover:bg-slate-200/70'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>{t('tab_invoice_setup', 'Invoice Setup')}</span>
          </button>
        </div>

        {/* 3. MODAL BODY (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6 text-xs text-slate-800 bg-slate-50/50">
          
          {/* ========================================================================= */}
          {/* TAB 1: SALES OPTIONS                                                      */}
          {/* ========================================================================= */}
          {activeTab === 'sales' && (
            <div className="space-y-6">

              {/* SECTION A: PRICING & MARKUP */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3.5">
                <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Percent className="w-4 h-4 text-amber-600" />
                  <span>Pricing, Markup & Tax Policies</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 items-end">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 flex items-center gap-1">
                      <span>Mark Up (%)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={formData.mark_up_pct}
                        onChange={e => setFormData({ ...formData, mark_up_pct: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.0"
                      />
                      <span className="absolute right-3 top-2 text-slate-400 font-bold">%</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Calculate mark-up based on</label>
                    <select
                      value={formData.markup_based_on}
                      onChange={e => setFormData({ ...formData, markup_based_on: e.target.value as any })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="unit_cost">Unit Cost (آخر كلفة شراء)</option>
                      <option value="average_cost">Average Cost (متوسط الكلفة المرجح)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Selling Price Tier</label>
                    <select
                      value={formData.selling_price_tier}
                      onChange={e => setFormData({ ...formData, selling_price_tier: e.target.value as any })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="SP1">SP1 (Standard Retail / تسعير مفرق)</option>
                      <option value="SP2">SP2 (Wholesale / تسعير جملة)</option>
                      <option value="SP3">SP3 (Special / HORECA)</option>
                      <option value="Wholesale">Wholesale Grade</option>
                      <option value="Retail">Retail Grade</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2 border-t border-slate-100 flex-wrap">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.apply_markup_on_item}
                      onChange={e => setFormData({ ...formData, apply_markup_on_item: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                    />
                    <span className="font-semibold text-slate-800">Apply Markup On Item</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.no_tax}
                      onChange={e => setFormData({ ...formData, no_tax: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300 cursor-pointer"
                    />
                    <span className="font-semibold text-slate-800">No Tax (Zero VAT Globally on Invoices)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.layaway}
                      onChange={e => setFormData({ ...formData, layaway: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                    />
                    <span className="font-semibold text-slate-800">Enable Layaway (حجز البضاعة وسداد مجزأ)</span>
                  </label>
                </div>
              </div>

              {/* SECTION B: DEFAULT WORKSTATION VALUES */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3.5">
                <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Building className="w-4 h-4 text-blue-600" />
                  <span>Workstation Defaults & Hardware Routing</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Default Branch</label>
                    <select
                      value={formData.default_branch}
                      onChange={e => setFormData({ ...formData, default_branch: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {branchOptions.map(b => (
                        <option key={b.id} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Default Currency</label>
                    <select
                      value={formData.default_currency}
                      onChange={e => setFormData({ ...formData, default_currency: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {currencyOptions.map(c => (
                        <option key={c.code} value={c.code}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Default Payment Method</label>
                    <select
                      value={formData.default_payment}
                      onChange={e => setFormData({ ...formData, default_payment: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {paymentTypeOptions.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Default Salesman</label>
                    <select
                      value={formData.default_salesman}
                      onChange={e => setFormData({ ...formData, default_salesman: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {salesmenOptions.map((s, idx) => (
                        <option key={idx} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Default Department</label>
                    <select
                      value={formData.default_department}
                      onChange={e => setFormData({ ...formData, default_department: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {departmentOptions.map((d, idx) => (
                        <option key={idx} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Default Location</label>
                    <select
                      value={formData.default_location}
                      onChange={e => setFormData({ ...formData, default_location: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {locationOptions.map((l, idx) => (
                        <option key={idx} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Printer Type</label>
                    <select
                      value={formData.printer_type}
                      onChange={e => setFormData({ ...formData, printer_type: e.target.value as any })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="a4">Standard A4 / Laser Printer</option>
                      <option value="thermal">Thermal 80mm POS Slip</option>
                      <option value="a5">Half-Page A5 Voucher</option>
                      <option value="dot_matrix">Continuous Dot Matrix 3-Ply</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Print Report on Save</label>
                    <select
                      value={formData.print_report_on_save}
                      onChange={e => setFormData({ ...formData, print_report_on_save: e.target.value as any })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ask">Ask After Save (تأكيد الطباعة)</option>
                      <option value="auto">Open Report Automatically (طباعة فورية)</option>
                      <option value="never">Never (حفظ دون طباعة)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION C: OPERATIONAL & VALIDATION CHECKBOXES */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
                <h3 className="font-bold text-slate-900 text-xs flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-emerald-600" />
                    <span>Operational Controls & Workflow Behaviors</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">17 System Flags</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                  
                  <label className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.enter_amount_paid_on_close}
                      onChange={e => setFormData({ ...formData, enter_amount_paid_on_close: e.target.checked })}
                      className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <div>
                      <span className="font-semibold text-slate-900 block leading-tight">Enter Amount Paid on Close</span>
                      <span className="text-[10px] text-slate-500">Require exact tender cash input when closing bill</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.cash_sales}
                      onChange={e => setFormData({ ...formData, cash_sales: e.target.checked })}
                      className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <div>
                      <span className="font-semibold text-slate-900 block leading-tight">Cash Sales</span>
                      <span className="text-[10px] text-slate-500">Restricts invoices exclusively to liquid cash</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.enable_sales_conversion_to_purchase}
                      onChange={e => setFormData({ ...formData, enable_sales_conversion_to_purchase: e.target.checked })}
                      className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <div>
                      <span className="font-semibold text-slate-900 block leading-tight">Auto Convert Inter-Branch Sales</span>
                      <span className="text-[10px] text-slate-500">Auto-create purchase in receiving facility</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allow_customer_pricing}
                      onChange={e => setFormData({ ...formData, allow_customer_pricing: e.target.checked })}
                      className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <div>
                      <span className="font-semibold text-slate-900 block leading-tight">Allow Customer Pricing</span>
                      <span className="text-[10px] text-slate-500">Respect customer-specific negotiated price lists</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allow_import_from_csv}
                      onChange={e => setFormData({ ...formData, allow_import_from_csv: e.target.checked })}
                      className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <div>
                      <span className="font-semibold text-slate-900 block leading-tight">Allow Import From CSV</span>
                      <span className="text-[10px] text-slate-500">Enables batch invoice cart upload from spreadsheet</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.disable_sales_save_button}
                      onChange={e => setFormData({ ...formData, disable_sales_save_button: e.target.checked })}
                      className="w-4 h-4 mt-0.5 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
                    />
                    <div>
                      <span className="font-semibold text-slate-900 block leading-tight">Disable Sales Save Button</span>
                      <span className="text-[10px] text-rose-600 font-medium">Prevent saving (audit & read-only lock)</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.verify_customer_credit_limit}
                      onChange={e => setFormData({ ...formData, verify_customer_credit_limit: e.target.checked })}
                      className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <div>
                      <span className="font-semibold text-slate-900 block leading-tight">Verify Customer Credit Limit</span>
                      <span className="text-[10px] text-slate-500">Block or alert when AR exceeds customer ceiling</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.print_delivery_note}
                      onChange={e => setFormData({ ...formData, print_delivery_note: e.target.checked })}
                      className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <div>
                      <span className="font-semibold text-slate-900 block leading-tight">Print Delivery Note</span>
                      <span className="text-[10px] text-slate-500">Automatically print delivery note alongside invoice</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.remove_tax_for_international}
                      onChange={e => setFormData({ ...formData, remove_tax_for_international: e.target.checked })}
                      className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <div>
                      <span className="font-semibold text-slate-900 block leading-tight">Remove Tax For International Sales</span>
                      <span className="text-[10px] text-slate-500">Zero VAT automatically on cross-border shipments</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allow_sales_negative_stock}
                      onChange={e => setFormData({ ...formData, allow_sales_negative_stock: e.target.checked })}
                      className="w-4 h-4 mt-0.5 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                    />
                    <div>
                      <span className="font-semibold text-slate-900 block leading-tight">Allow Sales If QTOH &le; 0</span>
                      <span className="text-[10px] text-slate-500">Permit selling items with zero or negative inventory</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.show_temporary_invoice_no}
                      onChange={e => setFormData({ ...formData, show_temporary_invoice_no: e.target.checked })}
                      className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <div>
                      <span className="font-semibold text-slate-900 block leading-tight">Show Temp Invoice No. on Posted</span>
                      <span className="text-[10px] text-slate-500">Retain pre-posting draft voucher trace code</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.show_randomized_ref_no}
                      onChange={e => setFormData({ ...formData, show_randomized_ref_no: e.target.checked })}
                      className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <div>
                      <span className="font-semibold text-slate-900 block leading-tight">Show Randomized Ref Number</span>
                      <span className="text-[10px] text-slate-500">Display alphanumeric fraud-prevention code</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.use_second_currency_price}
                      onChange={e => setFormData({ ...formData, use_second_currency_price: e.target.checked })}
                      className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <div>
                      <span className="font-semibold text-slate-900 block leading-tight">Use 2nd Currency Item Price</span>
                      <span className="text-[10px] text-slate-500">Pull secondary price directly from catalog cards</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hide_divisions_in_carousel}
                      onChange={e => setFormData({ ...formData, hide_divisions_in_carousel: e.target.checked })}
                      className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <div>
                      <span className="font-semibold text-slate-900 block leading-tight">Hide Divisions in Carousel</span>
                      <span className="text-[10px] text-slate-500">Simplify product catalog view to categories only</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.enable_direct_printing}
                      onChange={e => setFormData({ ...formData, enable_direct_printing: e.target.checked })}
                      className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <div>
                      <span className="font-semibold text-slate-900 block leading-tight">Enable Direct Printing</span>
                      <span className="text-[10px] text-slate-500">Bypass browser preview dialog to system printer</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.show_location_in_details}
                      onChange={e => setFormData({ ...formData, show_location_in_details: e.target.checked })}
                      className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <div>
                      <span className="font-semibold text-slate-900 block leading-tight">Show Location in Cart Details</span>
                      <span className="text-[10px] text-slate-500">Display warehouse/aisle position in cart grid</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.select_salesman_per_item}
                      onChange={e => setFormData({ ...formData, select_salesman_per_item: e.target.checked })}
                      className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <div>
                      <span className="font-semibold text-slate-900 block leading-tight">Select Salesman Per Item</span>
                      <span className="text-[10px] text-slate-500">Assign individual staff commission per item line</span>
                    </div>
                  </label>

                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: INVOICE SETUP                                                      */}
          {/* ========================================================================= */}
          {activeTab === 'invoice' && (
            <div className="space-y-6">

              {/* SECTION A: PRINTABLE INVOICE VISIBILITY TOGGLES */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3.5">
                <h3 className="font-bold text-slate-900 text-xs flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>Printable Voucher Elements & Branding Controls</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">Active Template: Corporate 3-Zone</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                  
                  <label className="flex items-start gap-2 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.show_logo_on_invoice}
                      onChange={e => setFormData({ ...formData, show_logo_on_invoice: e.target.checked })}
                      className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">Show Logo on Invoice</span>
                      <span className="text-[10px] text-slate-500">Print high-resolution company emblem</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.show_branch_payment_info}
                      onChange={e => setFormData({ ...formData, show_branch_payment_info: e.target.checked })}
                      className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">Show Branch Payment Info</span>
                      <span className="text-[10px] text-slate-500">Include bank wire details & payment methods</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.show_barcode_on_invoice}
                      onChange={e => setFormData({ ...formData, show_barcode_on_invoice: e.target.checked })}
                      className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">Show Item Barcode on Invoice</span>
                      <span className="text-[10px] text-slate-500">Render individual product SKU/EAN codes</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.show_branch_address}
                      onChange={e => setFormData({ ...formData, show_branch_address: e.target.checked })}
                      className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">Show Branch Address on Invoice</span>
                      <span className="text-[10px] text-slate-500">Display street, city & phone contact line</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.show_item_image}
                      onChange={e => setFormData({ ...formData, show_item_image: e.target.checked })}
                      className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">Show Item Image on Invoice</span>
                      <span className="text-[10px] text-slate-500">Print thumbnail photo next to item name</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.show_delivery_provider_info}
                      onChange={e => setFormData({ ...formData, show_delivery_provider_info: e.target.checked })}
                      className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">Show Delivery Provider Info</span>
                      <span className="text-[10px] text-slate-500">Display carrier fleet name & tracking badge</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition cursor-pointer col-span-full sm:col-span-1">
                    <input
                      type="checkbox"
                      checked={formData.show_message_on_invoice}
                      onChange={e => setFormData({ ...formData, show_message_on_invoice: e.target.checked })}
                      className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">Show Message on Invoice</span>
                      <span className="text-[10px] text-slate-500">Display custom greeting or seasonal banner</span>
                    </div>
                  </label>

                </div>
              </div>

              {/* SECTION B: LANGUAGE & FOOTER TEXT */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-4">
                <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span>Language Localization & Legal Terms Footer</span>
                </h3>

                <div className="space-y-1 max-w-xs">
                  <label className="font-bold text-slate-700">Invoice Language</label>
                  <select
                    value={formData.invoice_language}
                    onChange={e => setFormData({ ...formData, invoice_language: e.target.value as any })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="bilingual">Bilingual (English + Arabic / عربي وإنجليزي)</option>
                    <option value="ar">Arabic Only (عربي فقط)</option>
                    <option value="en">English Only (إنجليزي فقط)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700">Sales Report Footer Terms (شروط وتذييل الفاتورة)</label>
                    <span className="text-[10px] text-slate-400 font-mono">Printed on bottom of voucher</span>
                  </div>
                  <textarea
                    rows={3}
                    value={formData.sales_report_footer}
                    onChange={e => setFormData({ ...formData, sales_report_footer: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter legal disclaimer, return conditions, warranty info..."
                  />
                </div>
              </div>

            </div>
          )}

        </div>

        {/* 4. MODAL FOOTER ACTIONS */}
        <div className="bg-white border-t border-slate-200 px-5 py-3.5 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Factory Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
