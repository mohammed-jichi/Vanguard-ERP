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
  Sparkles,
  Plus,
  Filter
} from 'lucide-react';
import { toast } from '@/lib/toast';
import {
  RecurringInvoiceTemplate,
  getRecurringTemplates,
  saveRecurringTemplates,
  RECURRING_TEMPLATES_UPDATED_EVENT
} from '@/lib/customerSalesService';
import { CANONICAL_CUSTOMERS } from '@/lib/customerDirectoryEngine';

interface RecurringInvoicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'STORE' | 'RECALL';
  initialMode?: 'STORE' | 'RECALL';
  activeCustomer?: { id: string; name: string; address?: string };
  customers?: Array<{ id: string; name: string; address?: string; priceTier?: string; tier?: string; group?: string }>;
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

const PRESET_CUSTOMERS = [
  { id: 'CUST-001', name: 'Walk-in Cash Customer', tier: 'Retail Counter' },
  { id: 'CUST-002', name: 'Beirut Gourmet Market', tier: 'Wholesale Tier' },
  { id: 'CUST-003', name: 'Al-Janoub Mart Supermarket', tier: 'Wholesale Tier' },
  { id: 'CUST-004', name: 'Tyre Regional Co-op', tier: 'Key Accounts' },
  { id: 'CUST-005', name: 'Cedar Valley Organics', tier: 'VIP / Premium' },
  { id: 'CUST-006', name: 'Tripoli Olive Press & Co', tier: 'Wholesale Tier' }
];

function resolveCustomerTier(c: { id?: string; name?: string; tier?: string; priceTier?: string; category?: string; group?: string }): string {
  if (c.tier) return c.tier;
  if (c.priceTier) return c.priceTier;
  if (c.category) return c.category;
  if (c.group === 'WHOLESALE') return 'Wholesale Tier';
  if (c.group === 'KEY_ACCOUNTS') return 'Key Accounts';
  if (c.group === 'HORECA') return 'HORECA / Hospitality';
  if (c.group === 'RETAIL') return 'Retail Tier';
  if (c.id === 'CUST-002' || c.id === 'CUST-003' || c.id === 'CUST-006') return 'Wholesale Tier';
  if (c.id === 'CUST-004') return 'Key Accounts';
  if (c.id === 'CUST-005') return 'VIP / Premium';
  if (c.id === 'CUST-001' || c.id === 'Walk-in Cash Customer') return 'Retail Counter';
  return 'Retail Counter';
}

export default function RecurringInvoicesModal({
  isOpen,
  onClose,
  mode,
  initialMode,
  activeCustomer,
  customers = [],
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
  const effectiveCartItems = currentCartItems || activeCartItems || [];
  const effectiveCurrency = currency || activeCurrency || 'USD';
  const effectiveSalesman = salesman || activeSalesman || 'Sami Nader';
  const effectiveDeliveredBy = deliveredBy || activeDeliveredBy || 'Van #4 - Tripoli & Coast';

  // Merge customer directory
  const allCustomers = useMemo(() => {
    const map = new Map<string, { id: string; name: string; tier: string }>();

    PRESET_CUSTOMERS.forEach((c) => {
      map.set(c.id, { id: c.id, name: c.name, tier: c.tier });
    });

    CANONICAL_CUSTOMERS.forEach((c) => {
      if (c.id && !map.has(c.id)) {
        map.set(c.id, { id: c.id, name: c.name, tier: resolveCustomerTier(c) });
      }
    });

    customers.forEach((c) => {
      if (c.id && c.name) {
        const existing = map.get(c.id);
        map.set(c.id, {
          id: c.id,
          name: c.name,
          tier: resolveCustomerTier(c) || existing?.tier || 'Retail Counter'
        });
      }
    });

    if (activeCustomer?.id && activeCustomer?.name && !map.has(activeCustomer.id)) {
      map.set(activeCustomer.id, {
        id: activeCustomer.id,
        name: activeCustomer.name,
        tier: resolveCustomerTier(activeCustomer)
      });
    }

    return Array.from(map.values()).filter((c) => c.id.trim() !== '');
  }, [customers, activeCustomer]);

  // Mode Tabs: RECALL vs STORE
  const [activeTab, setActiveTab] = useState<'RECALL' | 'STORE'>('RECALL');

  // Customer selection in modal
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('CUST-002');
  const [selectedCustomerName, setSelectedCustomerName] = useState<string>('Beirut Gourmet Market');

  // Filter in Recall mode
  const [customerFilter, setCustomerFilter] = useState<string>('ALL');

  // Store form state
  const [templateName, setTemplateName] = useState<string>('');
  const [frequency, setFrequency] = useState<'Daily' | 'Weekly' | 'Bi-Weekly' | 'Monthly' | 'On-Demand'>('Weekly');
  const [useLivePrice, setUseLivePrice] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');

  // Recall list state
  const [templates, setTemplates] = useState<RecurringInvoiceTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Compute cart total dynamically (Fix $0.00 bug)
  const computedCartTotal = useMemo(() => {
    if (activeGrandTotal && Number(activeGrandTotal) > 0) {
      return Number(activeGrandTotal);
    }
    return effectiveCartItems.reduce((acc, item) => {
      const qty = Number(item.qty) || 0;
      const price = Number(item.unitPrice ?? item.price ?? 0);
      const lineTotal = item.total !== undefined ? Number(item.total) : qty * price;
      return acc + (Number(lineTotal) || 0);
    }, 0);
  }, [activeGrandTotal, effectiveCartItems]);

  useEffect(() => {
    if (isOpen) {
      setTemplates(getRecurringTemplates());

      // Determine initial tab: if opened in STORE mode and has cart items (or user explicitly clicked Store)
      const isStoreIntent = initialMode === 'STORE' || mode === 'STORE';
      if (isStoreIntent) {
        setActiveTab('STORE');
      } else {
        setActiveTab('RECALL');
      }

      // Synchronize customer from active customer
      let matchedId = '';
      if (activeCustomer?.id && allCustomers.some((c) => c.id === activeCustomer.id)) {
        matchedId = activeCustomer.id;
      } else if (activeCustomer?.name) {
        const found = allCustomers.find(
          (c) => c.name.toLowerCase() === activeCustomer.name.toLowerCase()
        );
        if (found) matchedId = found.id;
      }
      if (!matchedId) {
        matchedId = allCustomers[0]?.id || 'CUST-002';
      }

      setSelectedCustomerId(matchedId);
      const custObj = allCustomers.find((c) => c.id === matchedId);
      const cName = custObj?.name || activeCustomer?.name || 'Customer Account';
      setSelectedCustomerName(cName);
      setTemplateName(`Regular ${frequency} Supply - ${cName}`);
    }
  }, [isOpen, initialMode, mode, activeCustomer, allCustomers, frequency]);

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
    return templates.filter((t) => {
      if (customerFilter !== 'ALL') {
        const matchId = t.customerId === customerFilter;
        const custObj = allCustomers.find((c) => c.id === customerFilter);
        const matchName =
          custObj && t.customerName && t.customerName.toLowerCase() === custObj.name.toLowerCase();
        if (!matchId && !matchName) return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.frequency.toLowerCase().includes(q)
      );
    });
  }, [templates, customerFilter, searchQuery, allCustomers]);

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
      customerId: selectedCustomerId,
      customerName: selectedCustomerName,
      currency: effectiveCurrency,
      transactionType: transactionType || 'Credit (On Account)',
      deliveredBy: effectiveDeliveredBy,
      salesman: effectiveSalesman,
      useLivePrice,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      items: effectiveCartItems.map((item) => {
        const qty = Number(item.qty) || 1;
        const unitPrice = Number(item.unitPrice ?? item.price ?? 0);
        return {
          id: item.id || `it-${Date.now()}`,
          code: item.code,
          name: item.name,
          unit: item.unit || 'PCS',
          qty,
          unitPrice,
          total: item.total !== undefined ? Number(item.total) : qty * unitPrice
        };
      })
    };

    const updated = [newTpl, ...templates];
    saveRecurringTemplates(updated);
    setTemplates(updated);
    toast.success(`Recurring template "${newTpl.name}" saved successfully!`);
    // Switch to recall list to show saved template immediately
    setActiveTab('RECALL');
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
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800">
        
        {/* Header */}
        <div className="bg-primary text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold tracking-tight">
                  Recurring Order Templates (الطلبيات والفواتير المتكررة)
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

        {/* Bug A: Mode Tabs Switcher */}
        <div className="bg-slate-100 border-b border-slate-200 px-5 py-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center bg-white border border-slate-300 rounded-lg p-1 shadow-2xs w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab('RECALL')}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-md text-xs font-bold cursor-pointer flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'RECALL'
                  ? 'bg-primary text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Recall Saved Templates (استدعاء طلبية متكررة)</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === 'RECALL' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {filteredTemplates.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('STORE')}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-md text-xs font-bold cursor-pointer flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'STORE'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Current Cart as Template (حفظ الفاتورة كطلبية متكررة)</span>
              {effectiveCartItems.length > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === 'STORE' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {effectiveCartItems.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {activeTab === 'STORE' ? (
            /* STORE FORM */
            <div className="space-y-3.5">
              {/* Bug C: Dynamic Non-$0.00 Total Calculation & Info Banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-900">
                Save the current <strong>{effectiveCartItems.length} items</strong> (
                <span className="font-mono font-bold text-blue-950">
                  ${(Number(computedCartTotal) || 0).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}{' '}
                  USD
                </span>
                ) as a standardized recurring order template for <strong>{selectedCustomerName}</strong>.
              </div>

              {/* Bug D: Sync Active Customer & Wide Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Customer Account / Bill To (الزبون المستهدف)
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setSelectedCustomerId(newId);
                    const found = allCustomers.find((c) => c.id === newId);
                    const cName = found ? found.name : '';
                    setSelectedCustomerName(cName);
                    setTemplateName(`Regular ${frequency} Supply - ${cName}`);
                  }}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-bold text-slate-900 shadow-2xs"
                >
                  {allCustomers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.id}) — {c.tier}
                    </option>
                  ))}
                </select>
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
                    onChange={(e) => {
                      const newFreq = e.target.value as any;
                      setFrequency(newFreq);
                      setTemplateName(`Regular ${newFreq} Supply - ${selectedCustomerName}`);
                    }}
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
                <div className="flex justify-between font-bold text-slate-800 border-b border-slate-200 pb-1.5">
                  <span>Cart Items ({effectiveCartItems.length}):</span>
                  <span className="text-emerald-700 font-bold">
                    Est. Total: $
                    {(Number(computedCartTotal) || 0).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}{' '}
                    USD
                  </span>
                </div>
                {effectiveCartItems.length === 0 ? (
                  <div className="py-4 text-center text-slate-400 font-sans text-xs">
                    Your cart is currently empty. Please add items on the main sales screen first, or switch to the Recall tab.
                  </div>
                ) : (
                  <div className="text-slate-600 max-h-36 overflow-y-auto divide-y divide-slate-200 pt-1">
                    {effectiveCartItems.map((item, idx) => {
                      const lineQty = Number(item.qty) || 0;
                      const linePrice = Number(item.unitPrice ?? item.price ?? 0);
                      const lineTot = item.total !== undefined ? Number(item.total) : lineQty * linePrice;
                      return (
                        <div key={idx} className="py-1 flex justify-between">
                          <span>
                            {lineQty}x {item.name} ({item.unit || 'PCS'})
                          </span>
                          <span className="font-semibold">${(Number(lineTot) || 0).toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* RECALL LIST */
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Filter templates by name, schedule..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                  />
                </div>
                <div className="sm:w-64">
                  <select
                    value={customerFilter}
                    onChange={(e) => setCustomerFilter(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs"
                  >
                    <option value="ALL">All Customers (جميع الزبائن)</option>
                    {allCustomers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredTemplates.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 border border-dashed border-slate-300 rounded-lg">
                    No recurring invoice templates found matching your search.
                  </div>
                ) : (
                  filteredTemplates.map((tpl) => {
                    const totalAmt = tpl.items.reduce(
                      (s, i) => s + (Number(i.total) || (Number(i.qty) || 0) * (Number(i.unitPrice) || 0)),
                      0
                    );
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
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                                  tpl.useLivePrice
                                    ? 'bg-emerald-50 text-emerald-800'
                                    : 'bg-amber-50 text-amber-800'
                                }`}
                              >
                                {tpl.useLivePrice ? 'Live Pricing' : 'Locked Price'}
                              </span>
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm">{tpl.name}</h4>
                            <p className="text-slate-500 text-xs">
                              Customer: <strong className="text-slate-800">{tpl.customerName}</strong>
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-slate-900 text-sm">
                              $
                              {(Number(totalAmt) || 0).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </span>
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
                              <span>Load into Cart (تحميل للفاتورة)</span>
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

        {/* Bug B: Restored Primary Action Button in Footer */}
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
            {activeTab === 'STORE' && (
              <button
                type="button"
                onClick={handleSaveTemplate}
                disabled={effectiveCartItems.length === 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-1.5 rounded-md text-xs shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>+ Save Recurring Template (حفظ القالب المتكرر)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
