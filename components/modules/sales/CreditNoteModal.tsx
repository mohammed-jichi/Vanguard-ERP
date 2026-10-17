'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  RotateCcw,
  X,
  Search,
  Check,
  Printer,
  Trash2,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Plus
} from 'lucide-react';
import { Corporate3ZoneHeader, CorporatePrintableFooter } from '@/components/documents/Corporate3ZoneHeader';
import { printElementById } from '@/lib/utils/printDocument';
import {
  CreditNoteRecord,
  CreditNoteItem,
  postCreditNote,
  getCreditNotes
} from '@/lib/customerSalesService';
import { POS_EXCHANGE_RATE_LBP, getActiveShift } from '@/lib/posShiftService';
import { peekNextDocNumber, cleanDocumentNumber } from '@/lib/utils/documentSequence';
import { calculateDocumentTotals } from '@/lib/engine/erpCalculationEngine';
import { CANONICAL_CUSTOMERS } from '@/lib/customerDirectoryEngine';
import { toast } from '@/lib/toast';

interface CreditNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: any[];
  activeCustomer?: { id: string; name: string; address?: string };
  customers?: Array<{ id: string; name: string; address?: string; priceTier?: string; tier?: string; group?: string }>;
  catalogItems?: Array<{ id: string; code: string; name: string; unit: string; price: number; costPrice?: number }>;
  currentCartItems?: any[];
  tenantId?: string;
  onCreditNotePosted?: (crn: CreditNoteRecord) => void;
  onSwitchToDirectMode?: () => void;
}

const PRESET_CUSTOMERS = [
  { id: 'CUST-001', name: 'Walk-in Cash Customer', address: 'Local Branch Outlet', tier: 'Retail Counter' },
  { id: 'CUST-002', name: 'Beirut Gourmet Market', address: 'Hamra Street, Bloc B, Beirut', tier: 'Wholesale Tier' },
  { id: 'CUST-003', name: 'Al-Janoub Mart Supermarket', address: 'Main Highway, Nabatieh', tier: 'Wholesale Tier' },
  { id: 'CUST-004', name: 'Tyre Regional Co-op', address: 'Port Road, Tyre', tier: 'Key Accounts' },
  { id: 'CUST-005', name: 'Cedar Valley Organics', address: 'Ashrafieh, Tabaris, Beirut', tier: 'VIP / Premium' },
  { id: 'CUST-006', name: 'Tripoli Olive Press & Co', address: 'Mina Coastal Road, Tripoli', tier: 'Wholesale Tier' }
];

const DEFAULT_CATALOG_ITEMS = [
  { id: 'item-1', code: 'EVOO-PREM-500', name: 'Extra Virgin Olive Oil 500ml', unit: 'BOT', price: 12.50, costPrice: 7.50 },
  { id: 'item-2', code: 'EVOO-GOLD-1000', name: 'Extra Virgin Gold 1L Tin', unit: 'TIN', price: 22.00, costPrice: 13.50 },
  { id: 'item-3', code: 'OLIVE-TAP-250', name: 'Artisan Olive Tapenade 250g', unit: 'JAR', price: 4.50, costPrice: 2.20 },
  { id: 'item-4', code: 'OLIVE-GRN-1KG', name: 'Green Olives in Brine 1kg', unit: 'JAR', price: 6.00, costPrice: 3.20 },
  { id: 'item-5', code: 'OLIVE-BLK-1KG', name: 'Black Kalamata Olives 1kg', unit: 'JAR', price: 7.50, costPrice: 4.00 },
  { id: 'item-6', code: 'EVOO-BULK-16L', name: 'Extra Virgin Olive Oil 16L Bulk Tin', unit: 'TIN', price: 165.00, costPrice: 110.00 }
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

export default function CreditNoteModal({
  isOpen,
  onClose,
  invoices,
  activeCustomer,
  customers = [],
  catalogItems = [],
  currentCartItems = [],
  tenantId,
  onCreditNotePosted,
  onSwitchToDirectMode
}: CreditNoteModalProps) {
  const [mode, setMode] = useState<'INVOICE_LOOKUP' | 'DIRECT_RETURN'>('INVOICE_LOOKUP');
  const [selectedParentInvoiceNo, setSelectedParentInvoiceNo] = useState<string>('');
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('');

  // Catalog for Direct Return
  const effectiveCatalogItems = useMemo(() => {
    return catalogItems && catalogItems.length > 0 ? catalogItems : DEFAULT_CATALOG_ITEMS;
  }, [catalogItems]);

  // Merge customer directory
  const allCustomers = useMemo(() => {
    const map = new Map<string, { id: string; name: string; address?: string; tier: string }>();

    PRESET_CUSTOMERS.forEach((c) => {
      map.set(c.id, { id: c.id, name: c.name, address: c.address, tier: c.tier });
    });

    CANONICAL_CUSTOMERS.forEach((c) => {
      if (c.id && !map.has(c.id)) {
        map.set(c.id, { id: c.id, name: c.name, address: 'Lebanon Branch', tier: resolveCustomerTier(c) });
      }
    });

    customers.forEach((c) => {
      if (c.id && c.name) {
        const existing = map.get(c.id);
        map.set(c.id, {
          id: c.id,
          name: c.name,
          address: c.address || existing?.address || 'Local Branch',
          tier: resolveCustomerTier(c) || existing?.tier || 'Retail Counter'
        });
      }
    });

    invoices.forEach((inv) => {
      const id = inv.customerId || inv.customer?.id;
      const name = inv.customerName || inv.customer?.name;
      const address = inv.customerAddress || inv.customer?.address;
      if (id && name && !map.has(id)) {
        map.set(id, { id, name, address, tier: resolveCustomerTier({ id, name }) });
      }
    });

    if (activeCustomer?.id && activeCustomer?.name && !map.has(activeCustomer.id)) {
      map.set(activeCustomer.id, {
        id: activeCustomer.id,
        name: activeCustomer.name,
        address: activeCustomer.address,
        tier: resolveCustomerTier(activeCustomer)
      });
    }

    return Array.from(map.values()).filter((c) => c.id.trim() !== '');
  }, [customers, invoices, activeCustomer]);

  // Return Header
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [settlementMethod, setSettlementMethod] = useState<'CASH_REFUND' | 'ON_ACCOUNT'>('CASH_REFUND');
  const [reason, setReason] = useState('Customer Return / Defective Goods');
  const [notes, setNotes] = useState('');
  const [returnLocation, setReturnLocation] = useState('Main Store');

  // Items to Return
  const [returnItems, setReturnItems] = useState<CreditNoteItem[]>([]);

  // Direct Return Form state
  const [directSelectedCode, setDirectSelectedCode] = useState<string>('');
  const [directQty, setDirectQty] = useState<string>('1');
  const [directPrice, setDirectPrice] = useState<string>('0.00');

  // Status and Feedback
  const [isPosting, setIsPosting] = useState(false);
  const [postedCrn, setPostedCrn] = useState<CreditNoteRecord | null>(null);
  const [showPrintSlip, setShowPrintSlip] = useState(false);

  // Initialize modal state on open
  useEffect(() => {
    if (isOpen) {
      setPostedCrn(null);
      setShowPrintSlip(false);
      setSelectedParentInvoiceNo('');
      setInvoiceSearchQuery('');

      if (mode === 'INVOICE_LOOKUP') {
        // In Invoice Lookup mode: if activeCustomer is explicitly set to a known customer, sync it, else leave placeholder
        if (activeCustomer?.id && activeCustomer.id !== '' && activeCustomer.id !== 'CUST-001') {
          setCustomerId(activeCustomer.id);
          setCustomerName(activeCustomer.name);
          setCustomerAddress(activeCustomer.address || 'Local Branch');
        } else {
          setCustomerId('');
          setCustomerName('');
          setCustomerAddress('');
        }
        setReturnItems([]);
      } else {
        // Direct Return Mode: initialize from activeCustomer or default preset
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
          matchedId = allCustomers[0]?.id || 'CUST-001';
        }
        setCustomerId(matchedId);
        const custObj = allCustomers.find((c) => c.id === matchedId);
        setCustomerName(custObj?.name || activeCustomer?.name || 'Walk-in Cash Customer');
        setCustomerAddress(custObj?.address || activeCustomer?.address || 'Local Branch');
      }

      if (effectiveCatalogItems.length > 0) {
        setDirectSelectedCode(effectiveCatalogItems[0].code);
        setDirectPrice(String(effectiveCatalogItems[0].price || '0.00'));
      }
    }
  }, [isOpen, mode, activeCustomer, allCustomers, effectiveCatalogItems]);

  // Filter posted invoices for lookup
  const eligibleInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const isCreditNote = inv.docType === 'CREDIT_NOTE' || inv.transactionType === 'Credit Note';
      if (isCreditNote) return false;
      if (!invoiceSearchQuery.trim()) return true;
      const q = invoiceSearchQuery.toLowerCase();
      return (
        inv.invoiceNumber?.toLowerCase().includes(q) ||
        inv.customerName?.toLowerCase().includes(q) ||
        inv.id?.toLowerCase().includes(q)
      );
    });
  }, [invoices, invoiceSearchQuery]);

  // When an invoice is selected from lookup
  const handleSelectInvoice = (inv: any) => {
    const invNo = inv.invoiceNumber || inv.id;
    setSelectedParentInvoiceNo(invNo);
    const cId = inv.customerId || inv.customer?.id || 'CUST-001';
    const cName = inv.customerName || inv.customer?.name || 'Customer';
    const cAddr = inv.customerAddress || inv.customer?.address || 'Local Branch';
    setCustomerId(cId);
    setCustomerName(cName);
    setCustomerAddress(cAddr);
    setCurrency(inv.currency || 'USD');

    // Default settlement: if invoice was credit -> on account, if cash -> cash refund
    if (
      inv.transactionType?.toLowerCase().includes('credit') ||
      inv.transactionType?.toLowerCase().includes('account')
    ) {
      setSettlementMethod('ON_ACCOUNT');
    } else {
      setSettlementMethod('CASH_REFUND');
    }

    // Map items from this invoice
    if (Array.isArray(inv.items) && inv.items.length > 0) {
      const mapped: CreditNoteItem[] = inv.items.map((it: any, idx: number) => {
        const qty = Number(it.qty) || 1;
        const unitPrice = Number(it.unitPrice ?? (it.total && it.qty ? it.total / it.qty : 0));
        return {
          id: `crn-item-${Date.now()}-${idx}`,
          code: it.code || `SKU-${idx + 1}`,
          name: it.name || 'Catalog Item',
          unit: it.unit || 'PCS',
          qty,
          unitPrice,
          total: Number((qty * unitPrice).toFixed(2)),
          location: it.location || returnLocation,
          costPrice: it.costPrice || (unitPrice ? unitPrice * 0.65 : 0)
        };
      });
      setReturnItems(mapped);
    } else {
      setReturnItems([]);
    }
  };

  // Add Item in Direct Return Mode
  const handleAddDirectCatalogItem = () => {
    const product = effectiveCatalogItems.find((p) => p.code === directSelectedCode);
    if (!product) return;
    const qty = Math.max(1, parseFloat(directQty) || 1);
    const unitPrice = Math.max(0, parseFloat(directPrice) || product.price || 0);

    const existingIdx = returnItems.findIndex((it) => it.code === product.code);
    if (existingIdx >= 0) {
      setReturnItems((prev) =>
        prev.map((it, idx) =>
          idx === existingIdx
            ? {
                ...it,
                qty: it.qty + qty,
                total: Number(((it.qty + qty) * it.unitPrice).toFixed(2))
              }
            : it
        )
      );
    } else {
      const newItem: CreditNoteItem = {
        id: `crn-item-${Date.now()}-${returnItems.length}`,
        code: product.code,
        name: product.name,
        unit: product.unit || 'PCS',
        qty,
        unitPrice,
        total: Number((qty * unitPrice).toFixed(2)),
        location: returnLocation,
        costPrice: (product as any).costPrice || unitPrice * 0.65
      };
      setReturnItems((prev) => [...prev, newItem]);
    }
    toast.success(`Added ${product.name} to return list.`);
  };

  // Update quantity on return line
  const handleUpdateQty = (itemId: string, newQty: number) => {
    setReturnItems((prev) =>
      prev.map((it) => {
        if (it.id === itemId) {
          const qty = Math.max(0, newQty);
          return {
            ...it,
            qty,
            total: Number((qty * it.unitPrice).toFixed(2))
          };
        }
        return it;
      })
    );
  };

  // Remove a line
  const handleRemoveLine = (itemId: string) => {
    setReturnItems((prev) => prev.filter((it) => it.id !== itemId));
  };

  // Dynamic Calculation via erpCalculationEngine
  const totals = useMemo(() => {
    return calculateDocumentTotals({
      items: returnItems.map((it) => ({
        id: it.id,
        code: it.code,
        name: it.name,
        unit: it.unit,
        qty: it.qty,
        unitPrice: it.unitPrice,
        total: it.total
      })),
      overallDiscountPercent: 0,
      taxRate: 0,
      isTaxEnabled: false,
      noTax: true,
      primaryCurrency: currency || 'USD',
      secondaryCurrency: 'LBP',
      exchangeRate: POS_EXCHANGE_RATE_LBP
    });
  }, [returnItems, currency]);

  const subtotal = totals.subtotal;
  const tax = 0;
  const grandTotal = totals.grandTotal;
  const grandTotalLbp = totals.grandTotalLbp || grandTotal * POS_EXCHANGE_RATE_LBP;

  // Execute Credit Note Post
  const handlePost = async () => {
    if (returnItems.length === 0 || returnItems.every((it) => it.qty === 0)) {
      alert('Please include at least one item with a return quantity greater than 0.');
      return;
    }
    if (!customerName.trim()) {
      alert('Please select or specify a customer account.');
      return;
    }

    setIsPosting(true);
    try {
      const crnNumber = peekNextDocNumber('CREDIT_NOTE', getCreditNotes());
      const currentShift = getActiveShift();
      const crnRecord: CreditNoteRecord = {
        id: crnNumber,
        invoiceNumber: crnNumber,
        parentInvoiceNo: selectedParentInvoiceNo || undefined,
        docType: 'CREDIT_NOTE',
        doc_type: 'CREDIT_NOTE',
        shiftId: currentShift.id,
        shiftNumber: currentShift.shiftNumber,
        date: new Date().toISOString().split('T')[0],
        customerId: customerId || 'CUST-001',
        customerName: customerName.trim(),
        customerAddress: customerAddress || 'Local Branch',
        settlementMethod,
        reason,
        notes: notes.trim() || `Sales Return (${reason})`,
        branch: 'Southern Olive and Oil Products S.A.R.L. - Facility [1300-01] Main',
        currency,
        exchangeRate: POS_EXCHANGE_RATE_LBP,
        items: returnItems.filter((it) => it.qty > 0),
        subtotal,
        tax,
        grandTotal,
        status: 'Posted',
        posted: true,
        is_posted: true,
        createdAt: new Date().toISOString(),
        createdAtIso: new Date().toISOString(),
        isReconciledOrClosed: false,
        closedInZReport: false,
        shiftClosed: false
      };

      await postCreditNote(crnRecord, tenantId);
      setPostedCrn(crnRecord);
      setShowPrintSlip(true);

      if (onCreditNotePosted) {
        onCreditNotePosted(crnRecord);
      }
    } catch (err: any) {
      console.error('Error posting credit note:', err);
      alert(`Failed to post Credit Note: ${err.message || 'Unknown error'}`);
    } finally {
      setIsPosting(false);
    }
  };

  const handlePrint = () => {
    printElementById('printable-credit-note', 'Credit Note');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in font-sans">
      <div className="bg-white rounded-lg shadow-2xl border-4 border-border w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-red-800 text-white px-5 py-3.5 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-red-900 rounded">
              <RotateCcw className="w-5 h-5 text-red-200" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-wide">
                CREDIT NOTE & SALES RETURN — إشعار دائن ومرتجع مبيعات
              </h3>
              <p className="text-[11px] text-red-200">
                Southern Olive and Oil Products S.A.R.L. • Facility [1300-01] Main
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-red-200 hover:text-white p-1 rounded hover:bg-red-700/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        {!postedCrn && (
          <div className="bg-slate-100 border-b border-slate-200 px-5 py-2 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMode('INVOICE_LOOKUP')}
                className={`px-3.5 py-1.5 rounded-md font-semibold cursor-pointer transition-colors ${
                  mode === 'INVOICE_LOOKUP'
                    ? 'bg-red-700 text-white shadow-2xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                }`}
              >
                1. Lookup Original Invoice (استرجاع من فاتورة)
              </button>
              <button
                type="button"
                onClick={() => setMode('DIRECT_RETURN')}
                className={`px-3.5 py-1.5 rounded-md font-semibold cursor-pointer transition-colors ${
                  mode === 'DIRECT_RETURN'
                    ? 'bg-red-700 text-white shadow-2xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                }`}
              >
                2. Direct Return Mode (مرتجع مباشر)
              </button>
            </div>

            {onSwitchToDirectMode && (
              <button
                type="button"
                onClick={() => {
                  onSwitchToDirectMode();
                  onClose();
                }}
                className="text-red-700 hover:text-red-900 font-semibold flex items-center gap-1 cursor-pointer bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded border border-red-200"
              >
                <span>Switch Active Workstation to Credit Note Mode</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-5 text-xs space-y-4 custom-scrollbar bg-slate-50">
          {postedCrn ? (
            /* Post Success & Print Preview */
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-4 text-emerald-900 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-600 text-white rounded-full">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Credit Note {postedCrn.invoiceNumber} Successfully Posted!</h4>
                    <p className="text-xs text-emerald-700">
                      {postedCrn.settlementMethod === 'CASH_REFUND'
                        ? `Cash refund of $${(Number(postedCrn.grandTotal) || 0).toFixed(2)} deducted from active drawer balance.`
                        : `Customer balance credited with $${(Number(postedCrn.grandTotal) || 0).toFixed(2)} on account.`}
                      {' • Inventory restocked (+qty) in '}{returnLocation}.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Credit Note Slip</span>
                </button>
              </div>

              {/* Printable Document */}
              <div
                id="printable-credit-note"
                className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 text-slate-800 space-y-6"
              >
                <Corporate3ZoneHeader
                  facilityName="[1300-01] Main Oil Press & Bottling Facility"
                  documentTitle="CREDIT NOTE / RETURN INVOICE"
                  voucherCode={cleanDocumentNumber(postedCrn.invoiceNumber)}
                  voucherLabel="Credit Note #"
                  transactionDate={postedCrn.date}
                  status="POSTED"
                  refNumber={postedCrn.parentInvoiceNo ? `#${cleanDocumentNumber(postedCrn.parentInvoiceNo)}` : 'Direct Return'}
                />

                {/* Client / Restock info */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Customer / Credited Account</span>
                    <strong className="text-slate-900 block text-sm">{postedCrn.customerName}</strong>
                    <span className="text-slate-500">{postedCrn.customerAddress || 'Local Branch'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Restock Destination & Reason</span>
                    <strong className="text-slate-900 block">{returnLocation}</strong>
                    <span className="text-slate-500">{postedCrn.reason}</span>
                  </div>
                </div>

                {/* Items Table */}
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="border-b-2 border-slate-800 text-slate-800 font-bold">
                    <tr>
                      <th className="py-2">Item Code</th>
                      <th className="py-2">Description</th>
                      <th className="py-2 text-center">Unit</th>
                      <th className="py-2 text-right">Returned Qty</th>
                      <th className="py-2 text-right">Unit Price</th>
                      <th className="py-2 text-right">Total Credit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {postedCrn.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2 font-mono text-[11px] text-slate-500">{it.code}</td>
                        <td className="py-2 font-medium">{it.name}</td>
                        <td className="py-2 text-center">{it.unit}</td>
                        <td className="py-2 text-right font-mono font-bold text-red-700">+{it.qty}</td>
                        <td className="py-2 text-right font-mono">${(Number(it.unitPrice) || 0).toFixed(2)}</td>
                        <td className="py-2 text-right font-mono font-bold">${(Number(it.total) || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-64 space-y-1.5 text-xs text-right">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal Credit:</span>
                      <span className="font-mono">${(Number(postedCrn.subtotal) || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Tax (0%):</span>
                      <span className="font-mono">$0.00</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-red-700 border-t border-slate-300 pt-1.5">
                      <span>Total Credit Issued:</span>
                      <span className="font-mono">${(Number(postedCrn.grandTotal) || 0).toFixed(2)} USD</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-500">
                      ≈ {(Number(postedCrn.grandTotal) || 0) * POS_EXCHANGE_RATE_LBP > 0 ? ((Number(postedCrn.grandTotal) || 0) * POS_EXCHANGE_RATE_LBP).toLocaleString() : '0'} LBP
                    </div>
                  </div>
                </div>

                {/* Signatures */}
                <div className="pt-8 grid grid-cols-3 gap-6 text-[11px] text-slate-500 text-center border-t border-slate-200">
                  <div>
                    <div className="h-10 border-b border-dashed border-slate-300"></div>
                    <span className="mt-1 block">Warehouse Keeper / Restocked</span>
                  </div>
                  <div>
                    <div className="h-10 border-b border-dashed border-slate-300"></div>
                    <span className="mt-1 block">Accountant / Cashier Settlement</span>
                  </div>
                  <div>
                    <div className="h-10 border-b border-dashed border-slate-300"></div>
                    <span className="mt-1 block">Customer Acceptance Stamp</span>
                  </div>
                </div>

                <CorporatePrintableFooter voucherCode={cleanDocumentNumber(postedCrn.invoiceNumber)} />
              </div>
            </div>
          ) : (
            /* Return Form */
            <div className="space-y-4">
              {/* Lookup Invoice Box */}
              {mode === 'INVOICE_LOOKUP' && (
                <div className="bg-white border border-slate-200 rounded-lg p-3.5 space-y-2.5 shadow-2xs">
                  <span className="font-bold text-slate-800 text-xs block">
                    Select Original Sales Invoice to Return Against:
                  </span>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search invoice by # (e.g. 0002601) or customer name..."
                        value={invoiceSearchQuery}
                        onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded pl-8 pr-3 py-1.5 text-xs text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded text-xs bg-slate-50 custom-scrollbar">
                    {eligibleInvoices.length > 0 ? (
                      eligibleInvoices.slice(0, 10).map((inv) => (
                        <div
                          key={inv.id || inv.invoiceNumber}
                          onClick={() => handleSelectInvoice(inv)}
                          className={`p-2.5 flex items-center justify-between hover:bg-red-50/70 cursor-pointer transition-colors ${
                            selectedParentInvoiceNo === (inv.invoiceNumber || inv.id) ? 'bg-red-50 border-l-4 border-red-600' : ''
                          }`}
                        >
                          <div>
                            <span className="font-mono font-bold text-slate-800">{inv.invoiceNumber || inv.id}</span>
                            <span className="text-slate-500 ml-2">({inv.date})</span>
                            <p className="text-slate-700 font-medium text-[11px]">{inv.customerName}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-slate-900 block">
                              ${(Number(inv.grandTotal || inv.total || 0)).toFixed(2)}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {inv.items?.length || 0} line items
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-slate-400">No eligible posted invoices found matching search.</div>
                    )}
                  </div>
                </div>
              )}

              {/* Customer & Return Parameters */}
              <div className="bg-white border border-slate-200 rounded-lg p-3.5 grid grid-cols-1 md:grid-cols-3 gap-3 shadow-2xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Customer / Bill To {mode === 'DIRECT_RETURN' && '(الزبون المسترجع منه)'}
                  </label>
                  {mode === 'DIRECT_RETURN' ? (
                    <select
                      value={customerId}
                      onChange={(e) => {
                        const cId = e.target.value;
                        setCustomerId(cId);
                        const found = allCustomers.find((c) => c.id === cId);
                        if (found) {
                          setCustomerName(found.name);
                          setCustomerAddress(found.address || 'Local Branch');
                        }
                      }}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-bold text-slate-800 shadow-2xs"
                    >
                      {allCustomers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.id}) — {c.tier}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      readOnly={Boolean(selectedParentInvoiceNo)}
                      placeholder="Select an invoice above or choose customer..."
                      value={customerName ? (customerId ? `${customerName} (${customerId})` : customerName) : ''}
                      onChange={(e) => {
                        if (!selectedParentInvoiceNo) {
                          setCustomerName(e.target.value);
                        }
                      }}
                      className={`w-full border border-slate-300 rounded px-2.5 py-1.5 font-bold text-slate-800 ${
                        selectedParentInvoiceNo ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'
                      }`}
                    />
                  )}
                  {selectedParentInvoiceNo ? (
                    <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
                      Linked Original: #{selectedParentInvoiceNo}
                    </span>
                  ) : (
                    mode === 'INVOICE_LOOKUP' && (
                      <span className="text-[10px] text-slate-400 block mt-1">
                        Click any invoice in the list above to link customer & line items
                      </span>
                    )
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Settlement Method (طريقة التسوية)</label>
                  <select
                    value={settlementMethod}
                    onChange={(e) => setSettlementMethod(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-bold text-slate-800"
                  >
                    <option value="CASH_REFUND">Cash Refund (رد نقدي من الصندوق)</option>
                    <option value="ON_ACCOUNT">On Account (تنزيل من حساب الذمم)</option>
                  </select>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    {settlementMethod === 'CASH_REFUND' ? 'Deducts physical cash from register drawer' : 'Reduces customer open balance'}
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reason for Return (سبب الإرجاع)</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800"
                  >
                    <option value="Customer Return / Defective Goods">Customer Return / Defective Goods</option>
                    <option value="Damaged Goods in Transit">Damaged Goods in Transit</option>
                    <option value="Incorrect Item Dispatched">Incorrect Item Dispatched</option>
                    <option value="Quality Inspection Failure">Quality Inspection Failure / Taste Issue</option>
                    <option value="Over-invoiced Quantity Correction">Over-invoiced Quantity Correction</option>
                    <option value="Customer Cancellation">Customer Cancellation</option>
                  </select>
                </div>
              </div>

              {/* Direct Mode: Add Catalog Item to Return */}
              {mode === 'DIRECT_RETURN' && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                  <span className="font-bold text-slate-800 text-xs block">
                    Add Items to Return from Catalog (إضافة مواد للإرجاع من الكتالوج):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-end">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Catalog Item</label>
                      <select
                        value={directSelectedCode}
                        onChange={(e) => {
                          const code = e.target.value;
                          setDirectSelectedCode(code);
                          const found = effectiveCatalogItems.find((p) => p.code === code);
                          if (found) {
                            setDirectPrice(String(found.price || 0));
                          }
                        }}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800"
                      >
                        {effectiveCatalogItems.map((p) => (
                          <option key={p.code} value={p.code}>
                            {p.name} (${(Number(p.price) || 0).toFixed(2)} / {p.unit})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Return Qty</label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={directQty}
                        onChange={(e) => setDirectQty(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Unit Price ($ USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={directPrice}
                        onChange={(e) => setDirectPrice(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={handleAddDirectCatalogItem}
                        className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-1.5 px-3 rounded text-xs flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Add to Return</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Items Return Table */}
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
                <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex justify-between items-center">
                  <span className="font-bold text-slate-800">
                    Items to Return ({returnItems.length} items)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">Restock Location:</span>
                    <select
                      value={returnLocation}
                      onChange={(e) => setReturnLocation(e.target.value)}
                      className="bg-white border border-slate-300 rounded px-2 py-0.5 text-slate-700 text-[11px]"
                    >
                      <option value="Main Store">Main Store</option>
                      <option value="Wholesale Store">Wholesale Store</option>
                      <option value="Showroom">Showroom</option>
                      <option value="Damaged / Quarantine">Damaged / Quarantine</option>
                    </select>
                  </div>
                </div>

                {returnItems.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 space-y-2">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto opacity-70" />
                    <p>
                      {mode === 'INVOICE_LOOKUP'
                        ? 'No items loaded. Select an invoice above to populate items, or switch to Direct Return Mode.'
                        : 'No items in return list. Select an item from the catalog above and click "+ Add to Return".'}
                    </p>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Item Description</th>
                        <th className="py-2 px-2 text-center">Unit</th>
                        <th className="py-2 px-2 text-right">Unit Price</th>
                        <th className="py-2 px-2 text-center w-28">Return Qty</th>
                        <th className="py-2 px-3 text-right">Refund Total</th>
                        <th className="py-2 px-2 text-center w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {returnItems.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3">
                            <p className="font-semibold text-slate-800">{item.name}</p>
                            <span className="text-[10px] font-mono text-slate-400">{item.code}</span>
                          </td>
                          <td className="py-2.5 px-2 text-center text-slate-600">{item.unit}</td>
                          <td className="py-2.5 px-2 text-right font-mono text-slate-700">${(Number(item.unitPrice) || 0).toFixed(2)}</td>
                          <td className="py-2.5 px-2 text-center">
                            <input
                              type="number"
                              min="0"
                              value={item.qty}
                              onChange={(e) => handleUpdateQty(item.id, parseFloat(e.target.value) || 0)}
                              className="w-20 text-center border border-red-300 rounded px-2 py-1 font-bold text-red-700 bg-red-50/50 focus:bg-white"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-red-600">
                            ${(Number(item.total) || 0).toFixed(2)}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveLine(item.id)}
                              className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Financial Summary Box */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-red-900 text-sm">Settlement Total:</span>
                    <span className="font-mono text-xl font-extrabold text-red-700">
                      ${(Number(grandTotal) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                    </span>
                    <span className="text-slate-500 font-mono text-xs">
                      (≈ {(Number(grandTotalLbp) || 0).toLocaleString()} LBP)
                    </span>
                  </div>
                  <p className="text-[11px] text-red-800">
                    Posting will restock inventory (+qty in {returnLocation}), update General Ledger (Reverse Revenue & COGS), and{' '}
                    {settlementMethod === 'CASH_REFUND' ? 'deduct cash from the active register drawer' : 'credit the customer open receivable account'}.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isPosting || returnItems.length === 0}
                    onClick={handlePost}
                    className="bg-red-700 hover:bg-red-800 text-white px-5 py-2 rounded text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>{isPosting ? 'Posting...' : 'Issue & Post Credit Note'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {postedCrn && (
          <div className="bg-slate-100 border-t border-slate-200 px-5 py-2.5 flex justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="bg-primary hover:bg-primary/90 text-white px-5 py-1.5 rounded text-xs font-semibold cursor-pointer"
            >
              Done & Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
