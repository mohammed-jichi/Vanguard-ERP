'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  DollarSign,
  Plus,
  Trash2,
  Check,
  History,
  Tag,
  Percent,
  Calendar,
  Save,
  Search,
  Sparkles,
  Building2
} from 'lucide-react';
import { toast } from '@/lib/toast';
import {
  CustomerSpecialPrice,
  getCustomerSpecialPrices,
  saveCustomerSpecialPrices
} from '@/lib/customerSalesService';
import { resolveItemUnitPrice } from '@/lib/engine/erpCalculationEngine';
import { CANONICAL_CUSTOMERS } from '@/lib/customerDirectoryEngine';

interface CustomerPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCustomerId?: string;
  selectedCustomerName?: string;
  activeCustomer?: { id: string; name: string; address?: string };
  customers?: Array<{ id: string; name: string; address?: string; priceTier?: string; tier?: string; group?: string }>;
  catalogProducts?: Array<{ id: string; code: string; name: string; unit: string; price: number }>;
  catalogItems?: Array<{ id: string; code: string; name: string; unit: string; price: number }>;
  invoicesDirectory?: any[];
  tenantId?: string;
  onApplyPricingToCart?: (contractPrices: Record<string, number>, targetCustomer?: any) => void;
  onApplyRatesToCart?: (contractPrices: Record<string, number>, targetCustomer?: any) => void;
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

export default function CustomerPricingModal({
  isOpen,
  onClose,
  selectedCustomerId,
  selectedCustomerName,
  activeCustomer,
  customers = [],
  catalogProducts,
  catalogItems,
  invoicesDirectory = [],
  tenantId,
  onApplyPricingToCart,
  onApplyRatesToCart
}: CustomerPricingModalProps) {
  const effectiveCatalog = catalogProducts || catalogItems || [];
  const effectiveOnApply = onApplyRatesToCart || onApplyPricingToCart;

  // Build merged, deduplicated customer directory
  const allCustomers = useMemo(() => {
    const map = new Map<string, { id: string; name: string; tier: string }>();

    // 1. Core presets CUST-001 to CUST-006
    PRESET_CUSTOMERS.forEach((c) => {
      map.set(c.id, { id: c.id, name: c.name, tier: c.tier });
    });

    // 2. Canonical customer registry
    CANONICAL_CUSTOMERS.forEach((c) => {
      if (c.id && !map.has(c.id)) {
        map.set(c.id, { id: c.id, name: c.name, tier: resolveCustomerTier(c) });
      }
    });

    // 3. Injected customers prop
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

    // 4. Invoices directory customers
    invoicesDirectory.forEach((inv) => {
      const id = inv.customerId || inv.customer?.id;
      const name = inv.customerName || inv.customer?.name;
      if (id && name && !map.has(id)) {
        map.set(id, { id, name, tier: resolveCustomerTier({ id, name }) });
      }
    });

    // 5. Active customer from SalesView
    if (activeCustomer?.id && activeCustomer?.name && !map.has(activeCustomer.id)) {
      map.set(activeCustomer.id, {
        id: activeCustomer.id,
        name: activeCustomer.name,
        tier: resolveCustomerTier(activeCustomer)
      });
    }

    return Array.from(map.values()).filter((c) => c.id.trim() !== '');
  }, [customers, invoicesDirectory, activeCustomer]);

  const [activeCustomerId, setActiveCustomerId] = useState<string>('CUST-002');
  const [activeTab, setActiveTab] = useState<'matrix' | 'history'>('matrix');
  const [specialPrices, setSpecialPrices] = useState<CustomerSpecialPrice[]>([]);

  // Add new special price form
  const [selectedProductCode, setSelectedProductCode] = useState<string>('');
  const [specialPriceInput, setSpecialPriceInput] = useState<string>('');
  const [discountPercentInput, setDiscountPercentInput] = useState<string>('');

  // Synchronize on modal open
  useEffect(() => {
    if (isOpen) {
      let matchedId = '';
      const isWalkInOrRetail =
        !activeCustomer?.id ||
        activeCustomer.id === 'CUST-001' ||
        activeCustomer.id.toLowerCase().includes('walk-in') ||
        activeCustomer.name?.toLowerCase().includes('walk-in') ||
        activeCustomer.name?.toLowerCase().includes('cash customer');

      if (!isWalkInOrRetail) {
        if (activeCustomer?.id && allCustomers.some((c) => c.id === activeCustomer.id)) {
          matchedId = activeCustomer.id;
        } else if (activeCustomer?.name) {
          const found = allCustomers.find(
            (c) => c.name.toLowerCase() === activeCustomer.name.toLowerCase()
          );
          if (found) matchedId = found.id;
        }
      }

      if (!matchedId && selectedCustomerId && selectedCustomerId !== 'CUST-001' && allCustomers.some((c) => c.id === selectedCustomerId)) {
        matchedId = selectedCustomerId;
      }
      if (!matchedId && selectedCustomerName && !selectedCustomerName.toLowerCase().includes('walk-in')) {
        const found = allCustomers.find(
          (c) => c.name.toLowerCase() === selectedCustomerName.toLowerCase()
        );
        if (found) matchedId = found.id;
      }

      // Default to CUST-002 (Beirut Gourmet Market) or first valid registered B2B contract customer
      if (!matchedId || !allCustomers.some((c) => c.id === matchedId)) {
        const b2b =
          allCustomers.find((c) => c.id === 'CUST-002') ||
          allCustomers.find((c) => c.id !== 'CUST-001' && !c.name.toLowerCase().includes('walk-in')) ||
          allCustomers[0];
        matchedId = b2b?.id || 'CUST-002';
      }

      setActiveCustomerId(matchedId);
      setSpecialPrices(getCustomerSpecialPrices());
      if (effectiveCatalog.length > 0) {
        setSelectedProductCode(effectiveCatalog[0].code);
      }
    }
  }, [isOpen, activeCustomer, selectedCustomerId, selectedCustomerName, allCustomers, effectiveCatalog]);

  const currentCustomer = useMemo(() => {
    return (
      allCustomers.find((c) => c.id === activeCustomerId) || {
        id: activeCustomerId,
        name: selectedCustomerName || activeCustomer?.name || 'Customer Account',
        tier: 'Standard'
      }
    );
  }, [allCustomers, activeCustomerId, selectedCustomerName, activeCustomer]);

  // Special prices for this customer (matching ID or Name)
  const customerRules = useMemo(() => {
    return specialPrices.filter(
      (sp) =>
        sp.customerId === activeCustomerId ||
        (currentCustomer?.name &&
          sp.customerName &&
          sp.customerName.toLowerCase() === currentCustomer.name.toLowerCase())
    );
  }, [specialPrices, activeCustomerId, currentCustomer]);

  // Historical purchases across invoices for this customer
  const purchaseHistory = useMemo(() => {
    const historyList: Array<{
      invoiceNo: string;
      date: string;
      code: string;
      name: string;
      qty: number;
      unit: string;
      unitPrice: number;
    }> = [];

    invoicesDirectory.forEach((inv) => {
      const invCustId = inv.customerId || inv.customer?.id;
      const invCustName = inv.customerName || inv.customer?.name;
      const isMatch =
        invCustId === activeCustomerId ||
        (currentCustomer?.name &&
          invCustName &&
          invCustName.toLowerCase() === currentCustomer.name.toLowerCase());

      if (isMatch && inv.items && Array.isArray(inv.items)) {
        inv.items.forEach((it: any) => {
          historyList.push({
            invoiceNo: inv.invoiceNumber || inv.id,
            date: inv.date || '',
            code: it.code || '',
            name: it.name || '',
            qty: it.qty || 1,
            unit: it.unit || 'BOT',
            unitPrice: it.unitPrice || 0
          });
        });
      }
    });

    return historyList;
  }, [invoicesDirectory, activeCustomerId, currentCustomer]);

  // Handle Add Rule
  const handleAddRule = () => {
    const product = effectiveCatalog.find((p) => p.code === selectedProductCode);
    if (!product) {
      toast.error('Please select a product.');
      return;
    }

    const priceVal = parseFloat(specialPriceInput);
    const discVal = parseFloat(discountPercentInput);

    const resolvedResult = resolveItemUnitPrice({
      itemCode: product.code,
      standardPrice: product.price,
      customerDiscountPercent: !isNaN(discVal) && discVal > 0 ? discVal : undefined
    });

    let finalPrice = product.price;
    if (!isNaN(priceVal) && priceVal > 0) {
      finalPrice = priceVal;
    } else if (!isNaN(discVal) && discVal > 0) {
      finalPrice = resolvedResult.unitPrice;
    } else {
      toast.error('Please enter a valid contract price or discount percentage.');
      return;
    }

    // Check if exists, update or add
    const existingIdx = specialPrices.findIndex(
      (sp) => sp.customerId === activeCustomerId && (sp.itemCode === product.code || sp.itemId === product.id)
    );

    const newRule: CustomerSpecialPrice = {
      id: existingIdx >= 0 ? specialPrices[existingIdx].id : `sp-${Date.now()}`,
      customerId: activeCustomerId,
      customerName: currentCustomer.name,
      itemId: product.id,
      itemCode: product.code,
      itemName: product.name,
      unit: product.unit,
      currencyCode: 'USD',
      specialPrice: finalPrice,
      discountPercent: !isNaN(discVal) ? discVal : undefined,
      updatedAt: new Date().toISOString()
    };

    let updated: CustomerSpecialPrice[];
    if (existingIdx >= 0) {
      updated = [...specialPrices];
      updated[existingIdx] = newRule;
    } else {
      updated = [newRule, ...specialPrices];
    }

    setSpecialPrices(updated);
    saveCustomerSpecialPrices(updated);

    // Also auto-sync to active cart if requested
    const updatedCustomerRules = updated.filter(
      (sp) =>
        sp.customerId === activeCustomerId ||
        (currentCustomer?.name &&
          sp.customerName &&
          sp.customerName.toLowerCase() === currentCustomer.name.toLowerCase())
    );
    const priceMap: Record<string, number> = {};
    updatedCustomerRules.forEach((r) => {
      if (r.itemCode) {
        priceMap[r.itemCode] = r.specialPrice;
        priceMap[r.itemCode.toLowerCase()] = r.specialPrice;
      }
      if (r.itemId) {
        priceMap[r.itemId] = r.specialPrice;
        priceMap[r.itemId.toLowerCase()] = r.specialPrice;
      }
      if (r.itemName) {
        priceMap[r.itemName] = r.specialPrice;
        priceMap[r.itemName.toLowerCase()] = r.specialPrice;
      }
    });
    if (effectiveOnApply) {
      effectiveOnApply(priceMap, currentCustomer);
    }

    toast.success(`Special pricing saved for ${product.name}!`);

    // Reset input
    setSpecialPriceInput('');
    setDiscountPercentInput('');
  };

  // Handle Delete Rule
  const handleDeleteRule = (id: string) => {
    const updated = specialPrices.filter((sp) => sp.id !== id);
    setSpecialPrices(updated);
    saveCustomerSpecialPrices(updated);
    toast.success('Contract pricing rule removed.');
  };

  // Apply to active Cart
  const handleApplyToCart = () => {
    const priceMap: Record<string, number> = {};
    customerRules.forEach((r) => {
      if (r.itemCode) {
        priceMap[r.itemCode] = r.specialPrice;
        priceMap[r.itemCode.toLowerCase()] = r.specialPrice;
      }
      if (r.itemId) {
        priceMap[r.itemId] = r.specialPrice;
        priceMap[r.itemId.toLowerCase()] = r.specialPrice;
      }
      if (r.itemName) {
        priceMap[r.itemName] = r.specialPrice;
        priceMap[r.itemName.toLowerCase()] = r.specialPrice;
      }
    });

    if (effectiveOnApply) {
      effectiveOnApply(priceMap, currentCustomer);
    }
    toast.success(`Applied negotiated rates for ${currentCustomer.name} to active cart!`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-5 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800">
        
        {/* Header */}
        <div className="bg-primary text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold tracking-tight">
                  Customer Contract Pricing & Special Rates (أسعار خاصة للزبائن)
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

        {/* Customer Selector & Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="min-w-[360px] w-full sm:w-[440px] flex-1 max-w-[440px]" style={{ minWidth: '360px', width: '100%', maxWidth: '440px' }}>
            <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">
              Client Account (حساب الزبون)
            </label>
            <select
              value={activeCustomerId}
              onChange={(e) => setActiveCustomerId(e.target.value)}
              style={{ minWidth: '360px', width: '100%', maxWidth: '440px' }}
              className="w-full min-w-[360px] px-3 py-2 text-sm font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg shadow-xs focus:ring-1 focus:ring-primary focus:border-primary truncate"
            >
              {allCustomers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.id}) — {c.tier}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-white border border-slate-300 rounded p-0.5">
            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1 rounded text-xs font-bold cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'matrix' ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Contract Rates Matrix</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1 rounded text-xs font-bold cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'history' ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Purchase Price History ({purchaseHistory.length})</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {activeTab === 'matrix' ? (
            <>
              {/* Add New Contract Rate */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2.5">
                <span className="font-bold text-slate-800 block">Add or Update Negotiated Item Rate</span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Catalog Item</label>
                    <select
                      value={selectedProductCode}
                      onChange={(e) => setSelectedProductCode(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800"
                    >
                      {effectiveCatalog.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.name} — Std: ${(Number(p.price) || 0).toFixed(2)} / {p.unit}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Special Price ($ USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 105.00"
                      value={specialPriceInput}
                      onChange={(e) => {
                        setSpecialPriceInput(e.target.value);
                        setDiscountPercentInput('');
                      }}
                      className="w-full border border-slate-300 rounded px-2 py-1 font-mono font-bold text-slate-900 bg-white"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleAddRule}
                      className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-1.5 px-3 rounded text-xs flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Save Contract Rate</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Contract Rates Table */}
              <div className="space-y-1.5">
                <h5 className="font-bold text-slate-800">
                  Active Negotiated Rates for {currentCustomer.name} ({customerRules.length})
                </h5>
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Item Description</th>
                        <th className="py-2 px-2 text-center">Unit</th>
                        <th className="py-2 px-2 text-right">Standard Price</th>
                        <th className="py-2 px-2 text-right font-bold text-primary">Negotiated Rate</th>
                        <th className="py-2 px-2 text-right text-emerald-700">Client Saving</th>
                        <th className="py-2 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {customerRules.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            No special contract prices configured for this client. Standard branch rates apply.
                          </td>
                        </tr>
                      ) : (
                        customerRules.map((rule) => {
                          const stdProduct = effectiveCatalog.find((p) => p.code === rule.itemCode);
                          const stdPrice = stdProduct?.price || rule.specialPrice;
                          const saving = Math.max(0, stdPrice - rule.specialPrice);
                          return (
                            <tr key={rule.id} className="hover:bg-slate-50">
                              <td className="py-2 px-3">
                                <span className="font-semibold text-slate-900 block">{rule.itemName}</span>
                                <span className="font-mono text-[10px] text-slate-400">{rule.itemCode}</span>
                              </td>
                              <td className="py-2 px-2 text-center text-slate-600">{rule.unit}</td>
                              <td className="py-2 px-2 text-right font-mono text-slate-500 line-through">
                                ${(Number(stdPrice) || 0).toFixed(2)}
                              </td>
                              <td className="py-2 px-2 text-right font-mono font-bold text-primary text-sm">
                                ${(Number(rule.specialPrice) || 0).toFixed(2)}
                              </td>
                              <td className="py-2 px-2 text-right font-mono font-bold text-emerald-600">
                                {saving > 0 ? `-$${(Number(saving) || 0).toFixed(2)}` : '0.00'}
                              </td>
                              <td className="py-2 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRule(rule.id)}
                                  className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 cursor-pointer"
                                  title="Delete Contract Rate"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            /* Purchase Price History Tab */
            <div className="space-y-1.5">
              <h5 className="font-bold text-slate-800">
                Historical Invoice Purchase Prices for {currentCustomer.name}
              </h5>
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Invoice #</th>
                      <th className="py-2 px-2">Date</th>
                      <th className="py-2 px-2">Item</th>
                      <th className="py-2 px-2 text-center">Unit</th>
                      <th className="py-2 px-2 text-right">Qty</th>
                      <th className="py-2 px-3 text-right">Unit Price Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {purchaseHistory.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          No previous invoices found for this customer.
                        </td>
                      </tr>
                    ) : (
                      purchaseHistory.map((h, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono font-bold text-slate-800">{h.invoiceNo}</td>
                          <td className="py-2 px-2 text-slate-500">{h.date}</td>
                          <td className="py-2 px-2 font-medium text-slate-800">{h.name}</td>
                          <td className="py-2 px-2 text-center text-slate-600">{h.unit}</td>
                          <td className="py-2 px-2 text-right font-mono">{h.qty}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">
                            ${(Number(h.unitPrice) || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex justify-between items-center shrink-0">
          <span className="text-[11px] text-slate-500">
            Price Waterfall: Special Price &gt; Wholesale Tier &gt; Default Branch Rate
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-4 py-1.5 rounded-md text-xs font-semibold cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleApplyToCart}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-1.5 rounded-md text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Rates to Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
