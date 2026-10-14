'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Repeat,
  Save,
  Search,
  Check,
  Trash2,
  Calendar,
  Clock,
  User,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { toast } from '@/lib/toast';
import {
  RecurringInvoiceTemplate,
  getRecurringTemplates,
  saveRecurringTemplates,
  RECURRING_TEMPLATES_UPDATED_EVENT
} from '@/lib/customerSalesService';

interface RecurringInvoicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'STORE' | 'RECALL';
  initialMode?: 'STORE' | 'RECALL';
  activeCustomer?: { id: string; name: string; address?: string };
  activeCartItems?: any[];
  currentCartItems?: any[];
  activeGrandTotal?: number;
  activeCurrency?: string;
  currency?: string;
  transactionType?: string;
  activeSalesman?: string;
  salesman?: string;
  activeDeliveredBy?: string;
  deliveredBy?: string;
  tenantId?: string;
  onLoadTemplate?: (template: RecurringInvoiceTemplate | any) => void;
  branchName?: string;
}

export default function RecurringInvoicesModal({
  isOpen,
  onClose,
  mode,
  initialMode,
  activeCustomer = { id: 'CUST-002', name: 'Beirut Gourmet Market' },
  activeCartItems,
  currentCartItems,
  activeGrandTotal = 0,
  activeCurrency,
  currency,
  transactionType,
  activeSalesman,
  salesman,
  activeDeliveredBy,
  deliveredBy,
  tenantId,
  onLoadTemplate,
  branchName = 'Southern Olive and Oil Products S.A.R.L.'
}: RecurringInvoicesModalProps) {
  const effectiveMode = initialMode || mode || 'RECALL';
  const effectiveCartItems = currentCartItems || activeCartItems || [];
  const effectiveCurrency = currency || activeCurrency || 'USD';
  const effectiveSalesman = salesman || activeSalesman || 'Sami Nader';
  const effectiveDeliveredBy = deliveredBy || activeDeliveredBy || 'Van #4 - Tripoli & Coast';

  // Store form state
  const [templateName, setTemplateName] = useState<string>('');
  const [frequency, setFrequency] = useState<'Daily' | 'Weekly' | 'Bi-Weekly' | 'Monthly' | 'On-Demand'>('Weekly');
  const [useLivePrice, setUseLivePrice] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');

  // Recall list state
  const [templates, setTemplates] = useState<RecurringInvoiceTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setTemplates(getRecurringTemplates());
      if (effectiveMode === 'STORE') {
        setTemplateName(`Regular ${frequency} Supply - ${activeCustomer.name}`);
      }
    }
  }, [isOpen, effectiveMode, activeCustomer, frequency]);

  useEffect(() => {
    const handleUpdated = () => {
      setTemplates(getRecurringTemplates());
    };
    window.addEventListener(RECURRING_TEMPLATES_UPDATED_EVENT, handleUpdated);
    window.addEventListener('storage', handleUpdated);
    return () => {
      window.removeEventListener(RECURRING_TEMPLATES_UPDATED_EVENT, handleUpdated);
      window.removeEventListener('storage', handleUpdated);
    };
  }, []);

  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return templates;
    const q = searchQuery.toLowerCase();
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.frequency.toLowerCase().includes(q)
    );
  }, [templates, searchQuery]);

  // Handle Save
  const handleSaveTemplate = () => {
    if (effectiveCartItems.length === 0) {
      toast.error('Cart is empty. Please add items to cart before storing as template.');
      return;
    }
    if (!templateName.trim()) {
      toast.error('Please enter a template name.');
      return;
    }

    const newTpl: RecurringInvoiceTemplate = {
      id: `REC-TPL-${Date.now()}`,
      branchId: branchName,
      name: templateName.trim(),
      frequency,
      customerId: activeCustomer.id,
      customerName: activeCustomer.name,
      currency: effectiveCurrency,
      transactionType: transactionType || 'Credit (On Account)',
      deliveredBy: effectiveDeliveredBy,
      salesman: effectiveSalesman,
      useLivePrice,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      items: effectiveCartItems.map((item) => ({
        id: item.id || `it-${Date.now()}`,
        code: item.code,
        name: item.name,
        unit: item.unit,
        qty: item.qty,
        unitPrice: item.unitPrice,
        total: item.total || item.qty * item.unitPrice
      }))
    };

    const updated = [newTpl, ...templates];
    saveRecurringTemplates(updated);
    setTemplates(updated);
    toast.success(`Recurring template "${newTpl.name}" saved successfully!`);
    onClose();
  };

  // Handle Delete
  const handleDeleteTemplate = (id: string) => {
    const updated = templates.filter((t) => t.id !== id);
    saveRecurringTemplates(updated);
    setTemplates(updated);
    toast.success('Template deleted.');
  };

  // Handle Recall
  const handleSelectTemplate = (tpl: RecurringInvoiceTemplate) => {
    if (onLoadTemplate) {
      onLoadTemplate(tpl);
    }
    toast.success(`Loaded recurring template: ${tpl.name}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-5 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-slate-800">
        
        {/* Header */}
        <div className="bg-primary text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold tracking-tight">
                  {mode === 'STORE'
                    ? 'Store Recurring Order Template (حفظ كفاتورة متكررة)'
                    : 'Recall Recurring Order Template (استدعاء فاتورة متكررة)'}
                </h3>
                <span className="bg-white/15 text-white/90 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/20">
                  Vanguard ERP
                </span>
              </div>
              <p className="text-[11px] text-slate-200">
                Southern Olive and Oil Products S.A.R.L. • Facility: [1300-01] Main
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {effectiveMode === 'STORE' ? (
            /* STORE FORM */
            <div className="space-y-3.5">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-900">
                Save the current <strong>{effectiveCartItems.length} items</strong> (${activeGrandTotal.toFixed(2)}) as a standardized recurring order template for <strong>{activeCustomer.name}</strong>.
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Template Name / Reference <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Weekly Restock - Gourmet Market"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-bold text-slate-900 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Recurrence Schedule (دورية التكرار)
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-semibold text-slate-800"
                  >
                    <option value="Daily">Daily (يومي)</option>
                    <option value="Weekly">Weekly (أسبوعي)</option>
                    <option value="Bi-Weekly">Bi-Weekly (كل أسبوعين)</option>
                    <option value="Monthly">Monthly (شهري)</option>
                    <option value="On-Demand">On-Demand (عند الطلب)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Pricing Mode on Recall
                  </label>
                  <select
                    value={useLivePrice ? 'LIVE' : 'LOCKED'}
                    onChange={(e) => setUseLivePrice(e.target.value === 'LIVE')}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-semibold text-slate-800"
                  >
                    <option value="LIVE">Live Price Waterfall (سعر العقد الحالي)</option>
                    <option value="LOCKED">Lock Template Prices (تثبيت السعر)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Notes (ملاحظات)</label>
                <input
                  type="text"
                  placeholder="e.g. Preferred delivery in morning shift"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 bg-white"
                />
              </div>

              {/* Items summary */}
              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-1 font-mono text-[11px]">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Cart Items ({effectiveCartItems.length}):</span>
                  <span>Est. Total: ${activeGrandTotal.toFixed(2)} USD</span>
                </div>
                <div className="text-slate-500 max-h-32 overflow-y-auto divide-y divide-slate-200">
                  {effectiveCartItems.map((item, idx) => (
                    <div key={idx} className="py-1 flex justify-between">
                      <span>{item.qty}x {item.name} ({item.unit})</span>
                      <span>${(item.total || item.qty * item.unitPrice).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* RECALL LIST */
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter templates by name, customer, schedule..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                />
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredTemplates.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 border border-dashed border-slate-300 rounded-lg">
                    No recurring invoice templates found.
                  </div>
                ) : (
                  filteredTemplates.map((tpl) => {
                    const totalAmt = tpl.items.reduce((s, i) => s + (i.total || i.qty * i.unitPrice), 0);
                    return (
                      <div
                        key={tpl.id}
                        className="border border-slate-200 rounded-lg p-3 hover:border-slate-400 transition-colors bg-white flex flex-col gap-2 shadow-2xs"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded">
                                {tpl.frequency}
                              </span>
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                                tpl.useLivePrice ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                              }`}>
                                {tpl.useLivePrice ? 'Live Pricing' : 'Locked Price'}
                              </span>
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm">{tpl.name}</h4>
                            <p className="text-slate-500 text-xs">Customer: <strong className="text-slate-800">{tpl.customerName}</strong></p>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-slate-900 text-sm">${totalAmt.toFixed(2)}</span>
                            <span className="block text-[11px] text-slate-400">{tpl.items.length} items</span>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-2 rounded text-[11px] text-slate-600 flex justify-between items-center">
                          <span className="truncate max-w-sm">
                            {tpl.items.map((it) => `${it.qty}x ${it.name}`).join(' • ')}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleDeleteTemplate(tpl.id)}
                              className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 cursor-pointer"
                              title="Delete template"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSelectTemplate(tpl)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1 rounded shadow-2xs cursor-pointer flex items-center gap-1"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                              <span>Load into Invoice</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex justify-between items-center shrink-0">
          <span className="text-[11px] text-slate-500">
            Standardized B2B recurring templates • Vanguard ERP
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-4 py-1.5 rounded-md text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            {mode === 'STORE' && (
              <button
                type="button"
                onClick={handleSaveTemplate}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-1.5 rounded-md text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Recurring Template</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
