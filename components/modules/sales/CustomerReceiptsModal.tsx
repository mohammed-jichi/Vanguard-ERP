'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Printer,
  Receipt,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  User,
  Plus,
  RefreshCw,
  Search,
  Check,
  Building2,
  Percent,
  Clock,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { toast } from '@/lib/toast';
import { printElementById } from '@/lib/utils/printDocument';
import {
  CustomerReceipt,
  ReceiptInvoiceAllocation,
  getCustomerReceipts,
  recordCustomerReceipt,
  generateNextReceiptNumber,
  CUSTOMER_RECEIPTS_UPDATED_EVENT
} from '@/lib/customerSalesService';
import { calculateCustomerReceivables } from '@/lib/engine/erpCalculationEngine';
import { POS_EXCHANGE_RATE_LBP } from '@/lib/posShiftService';

interface CustomerReceiptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCustomerId?: string;
  activeCustomer?: { id: string; name: string; balance?: number; address?: string };
  customers?: Array<{ id: string; name: string; balance?: number; address?: string }>;
  invoicesDirectory?: any[];
  invoices?: any[];
  onInvoicesUpdated?: (updatedInvoices: any[]) => void;
  onReceiptRecorded?: (receipt: CustomerReceipt) => void;
  branchName?: string;
  cashierName?: string;
  tenantId?: string;
  printerType?: 'a4' | 'thermal' | 'a5' | 'dot_matrix';
}

export default function CustomerReceiptsModal({
  isOpen,
  onClose,
  initialCustomerId,
  activeCustomer: propActiveCustomer,
  customers = [],
  invoicesDirectory,
  invoices,
  onInvoicesUpdated,
  onReceiptRecorded,
  branchName = 'Southern Olive and Oil Products S.A.R.L.',
  cashierName = 'Active Cashier',
  tenantId,
  printerType = 'thermal'
}: CustomerReceiptsModalProps) {
  const effectiveInvoices = invoicesDirectory || invoices || [];
  const effectiveInitialCustomerId = initialCustomerId || propActiveCustomer?.id || 'CUST-002';

  // State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(effectiveInitialCustomerId);
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH USD');
  const [currencyCode, setCurrencyCode] = useState<'USD' | 'LBP' | 'EUR' | 'GBP'>('USD');
  const [amountReceived, setAmountReceived] = useState<string>('');
  const [discountGiven, setDiscountGiven] = useState<string>('');
  const [exchangeRate, setExchangeRate] = useState<number>(POS_EXCHANGE_RATE_LBP);
  const [notes, setNotes] = useState<string>('');
  const [allocationMode, setAllocationMode] = useState<'SPECIFIC' | 'FIFO'>('SPECIFIC');
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<Record<string, number>>({});
  const [printOnSave, setPrintOnSave] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // History & Print
  const [receiptsList, setReceiptsList] = useState<CustomerReceipt[]>([]);
  const [printingReceipt, setPrintingReceipt] = useState<CustomerReceipt | null>(null);

  // On open or initial customer change
  useEffect(() => {
    if (isOpen) {
      if (initialCustomerId || propActiveCustomer?.id) {
        setSelectedCustomerId(initialCustomerId || propActiveCustomer?.id || 'CUST-002');
      }
      setReceiptsList(getCustomerReceipts());
    }
  }, [isOpen, initialCustomerId, propActiveCustomer]);

  // Sync event listener
  useEffect(() => {
    const handleUpdated = () => {
      setReceiptsList(getCustomerReceipts());
    };
    window.addEventListener(CUSTOMER_RECEIPTS_UPDATED_EVENT, handleUpdated);
    window.addEventListener('storage', handleUpdated);
    return () => {
      window.removeEventListener(CUSTOMER_RECEIPTS_UPDATED_EVENT, handleUpdated);
      window.removeEventListener('storage', handleUpdated);
    };
  }, []);

  const activeCustomer = useMemo(() => {
    return (
      customers.find((c) => c.id === selectedCustomerId) ||
      customers[0] || { id: 'CUST-002', name: 'Beirut Gourmet Market', balance: 850.0 }
    );
  }, [customers, selectedCustomerId]);

  // Find all unpaid invoices for this customer
  const unpaidInvoices = useMemo(() => {
    return effectiveInvoices
      .filter((inv) => {
        const cId = inv.customerId || inv.customer?.id;
        const isMatch = cId === selectedCustomerId;
        const total = Number(inv.grandTotal || 0);
        const paid = Number(inv.amount_paid || inv.paidAmount || (inv.payments && inv.payments.reduce((s: number, p: any) => s + Number(p.amount || 0), 0)) || 0);
        const balanceDue = total - paid;
        return isMatch && balanceDue > 0.01 && inv.status !== 'Draft' && inv.docType !== 'CREDIT_NOTE';
      })
      .map((inv) => {
        const total = Number(inv.grandTotal || 0);
        const paid = Number(inv.amount_paid || inv.paidAmount || (inv.payments && inv.payments.reduce((s: number, p: any) => s + Number(p.amount || 0), 0)) || 0);
        const balanceDue = total - paid;
        return {
          ...inv,
          balanceDue,
          grandTotalUsd: total,
          paidAmountUsd: paid
        };
      });
  }, [effectiveInvoices, selectedCustomerId]);

  const customerReceivables = useMemo(() => {
    return calculateCustomerReceivables({
      customerId: selectedCustomerId,
      customerName: activeCustomer?.name,
      creditLimit: (activeCustomer as any)?.creditLimit || 5000,
      invoices: effectiveInvoices
    });
  }, [selectedCustomerId, activeCustomer, effectiveInvoices]);

  const totalOutstandingCustomerDebt = customerReceivables.currentOpenBalance;

  // Handle invoice toggle in specific mode
  const handleToggleInvoice = (invId: string, balanceDue: number) => {
    setSelectedInvoiceIds((prev) => {
      const next = { ...prev };
      if (next[invId] !== undefined) {
        delete next[invId];
      } else {
        next[invId] = balanceDue;
      }
      // Sum selected and auto set amount received
      const totalSelected = Object.values(next).reduce((s, a) => s + a, 0);
      setAmountReceived(totalSelected > 0 ? totalSelected.toFixed(2) : '');
      return next;
    });
  };

  // Handle Auto FIFO Allocation
  const handleFifoAllocation = (totalAmt: number) => {
    let remaining = totalAmt;
    const allocated: Record<string, number> = {};
    for (const inv of unpaidInvoices) {
      if (remaining <= 0) break;
      const allocateForThis = Math.min(remaining, inv.balanceDue);
      allocated[inv.id || inv.invoiceNumber] = Number(allocateForThis.toFixed(2));
      remaining -= allocateForThis;
    }
    setSelectedInvoiceIds(allocated);
  };

  // Submit Receipt
  const handlePostReceipt = async () => {
    const rawAmt = parseFloat(amountReceived);
    if (isNaN(rawAmt) || rawAmt <= 0) {
      toast.error('Please enter a valid receipt amount received.');
      return;
    }

    const rawDiscount = parseFloat(discountGiven) || 0;
    setIsSubmitting(true);

    try {
      const amtUsd = currencyCode === 'LBP' ? Number((rawAmt / exchangeRate).toFixed(2)) : rawAmt;
      const amtLbp = currencyCode === 'LBP' ? rawAmt : Math.round(rawAmt * exchangeRate);

      // Build allocations
      const allocations: ReceiptInvoiceAllocation[] = [];
      const updatedInvoices = [...effectiveInvoices];

      let remainingToAllocate = amtUsd + rawDiscount;

      // If specific invoices selected
      if (Object.keys(selectedInvoiceIds).length > 0) {
        for (const [invId, allocAmt] of Object.entries(selectedInvoiceIds)) {
          const targetIdx = updatedInvoices.findIndex((inv) => (inv.id || inv.invoiceNumber) === invId);
          if (targetIdx >= 0) {
            const currentPaid = Number(updatedInvoices[targetIdx].amount_paid || 0);
            const total = Number(updatedInvoices[targetIdx].grandTotal || 0);
            const newPaid = Number((currentPaid + allocAmt).toFixed(2));
            const newRemaining = Math.max(0, total - newPaid);

            updatedInvoices[targetIdx] = {
              ...updatedInvoices[targetIdx],
              amount_paid: newPaid,
              paidAmount: newPaid,
              status: newRemaining <= 0.01 ? 'Paid' : 'Partial',
              paymentStatus: newRemaining <= 0.01 ? 'PAID' : 'PARTIAL'
            };

            allocations.push({
              invoiceId: invId,
              invoiceNo: updatedInvoices[targetIdx].invoiceNumber || invId,
              invoiceDate: updatedInvoices[targetIdx].date,
              totalInvoiceAmountUsd: total,
              previousBalanceDueUsd: total - currentPaid,
              allocatedAmountUsd: allocAmt,
              remainingBalanceDueUsd: newRemaining
            });
          }
        }
      } else {
        // Lump sum auto FIFO
        for (let i = 0; i < updatedInvoices.length; i++) {
          if (remainingToAllocate <= 0) break;
          const inv = updatedInvoices[i];
          if ((inv.customerId || inv.customer?.id) === selectedCustomerId) {
            const currentPaid = Number(inv.amount_paid || 0);
            const total = Number(inv.grandTotal || 0);
            const due = total - currentPaid;
            if (due > 0.01) {
              const toAlloc = Math.min(due, remainingToAllocate);
              const newPaid = Number((currentPaid + toAlloc).toFixed(2));
              const newRemaining = Math.max(0, total - newPaid);

              updatedInvoices[i] = {
                ...inv,
                amount_paid: newPaid,
                paidAmount: newPaid,
                status: newRemaining <= 0.01 ? 'Paid' : 'Partial'
              };

              allocations.push({
                invoiceId: inv.id || inv.invoiceNumber,
                invoiceNo: inv.invoiceNumber || inv.id,
                invoiceDate: inv.date,
                totalInvoiceAmountUsd: total,
                previousBalanceDueUsd: due,
                allocatedAmountUsd: toAlloc,
                remainingBalanceDueUsd: newRemaining
              });

              remainingToAllocate -= toAlloc;
            }
          }
        }
      }

      // Record Customer Receipt
      const receipt = await recordCustomerReceipt(
        {
          branchId: branchName,
          shiftId: 'SH-20261014-44',
          customerId: selectedCustomerId,
          customerName: activeCustomer.name,
          paymentMethod,
          currencyCode,
          amountReceived: rawAmt,
          amountReceivedUsd: amtUsd,
          amountReceivedLbp: amtLbp,
          discountGiven: rawDiscount,
          exchangeRate,
          notes: notes.trim() || `Payment received from ${activeCustomer.name} on account`,
          allocations,
          cashierName
        },
        tenantId
      );

      // Trigger Invoices update in parent
      if (onInvoicesUpdated) {
        onInvoicesUpdated(updatedInvoices);
      }
      if (onReceiptRecorded) {
        onReceiptRecorded(receipt);
      }

      toast.success(`Customer Receipt ${receipt.receiptNo} posted successfully!`);

      // Print voucher if requested
      if (printOnSave) {
        setPrintingReceipt(receipt);
        setTimeout(() => {
          printElementById('printable-customer-receipt', `Customer Receipt ${receipt.receiptNo}`);
        }, 150);
      }

      // Reset form
      setAmountReceived('');
      setDiscountGiven('');
      setNotes('');
      setSelectedInvoiceIds({});
    } catch (err: any) {
      toast.error('Failed to post customer receipt.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualPrint = (receipt: CustomerReceipt) => {
    setPrintingReceipt(receipt);
    setTimeout(() => {
      printElementById('printable-customer-receipt', `Customer Receipt ${receipt.receiptNo}`);
    }, 150);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-5 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800">
        
        {/* Header */}
        <div className="bg-primary text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold tracking-tight">
                  Customer Receipts & Invoice Allocations (سندات قبض الزبائن)
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

        {/* Customer Selector & Open Balance Banner */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase">Customer Account (الزبون)</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => {
                  setSelectedCustomerId(e.target.value);
                  setSelectedInvoiceIds({});
                }}
                className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-semibold text-slate-900"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.id})
                  </option>
                ))}
              </select>
            </div>
            <div className="h-8 w-px bg-slate-200 hidden sm:block" />
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Current Open Debt (الرصيد المستحق)</span>
              <span className="text-base font-mono font-extrabold text-red-600">
                ${totalOutstandingCustomerDebt.toFixed(2)} USD
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded">
              Next Voucher: {generateNextReceiptNumber()}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          
          {/* Top Form: Payment Method, Currency, Amount, Discount */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs space-y-3.5">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Record Payment & Settlement (بيانات القبض والتسوية)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {/* Payment Method */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Payment Method (طريقة القبض)</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-800"
                >
                  <option value="CASH USD">Cash USD (صندوق الكاشير)</option>
                  <option value="CASH LBP">Cash LBP (صندوق الكاشير)</option>
                  <option value="BANK TRANSFER">Bank Transfer (BLOM/Audi)</option>
                  <option value="CHECK">Commercial Bank Cheque</option>
                  <option value="CARD">Visa / MasterCard</option>
                  <option value="WHISH">Whish Money Transfer</option>
                </select>
              </div>

              {/* Currency */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Currency (العملة)</label>
                <select
                  value={currencyCode}
                  onChange={(e) => setCurrencyCode(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-800"
                >
                  <option value="USD">USD ($)</option>
                  <option value="LBP">LBP (ل.ل)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              {/* Amount Received */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Amount Received (المبلغ المقبوض) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amountReceived}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAmountReceived(val);
                    if (allocationMode === 'FIFO' && parseFloat(val) > 0) {
                      handleFifoAllocation(parseFloat(val));
                    }
                  }}
                  className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 font-mono font-bold text-slate-900 bg-white"
                />
              </div>

              {/* Settlement Discount */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Settlement Discount (حسم ممنوح)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={discountGiven}
                  onChange={(e) => setDiscountGiven(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 font-mono text-slate-900 bg-white"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Notes / Reference (البيان ورقم الشيك/التحويل)</label>
              <input
                type="text"
                placeholder="e.g. دفعة نقدية على الحساب / Cheque #894210 BLOM Bank"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-800 bg-white"
              />
            </div>
          </div>

          {/* Invoice Allocation Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
                <span>Unsettled Customer Invoices (الفواتير غير المسددة)</span>
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  {unpaidInvoices.length} Invoices
                </span>
              </h5>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAllocationMode('SPECIFIC');
                    setSelectedInvoiceIds({});
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer border ${
                    allocationMode === 'SPECIFIC'
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Manual Selection
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAllocationMode('FIFO');
                    const amt = parseFloat(amountReceived) || totalOutstandingCustomerDebt;
                    handleFifoAllocation(amt);
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer border ${
                    allocationMode === 'FIFO'
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Auto FIFO Allocation
                </button>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3 text-center w-10">Select</th>
                    <th className="py-2 px-2.5">Invoice #</th>
                    <th className="py-2 px-2">Date</th>
                    <th className="py-2 px-2 text-right">Grand Total</th>
                    <th className="py-2 px-2 text-right">Paid</th>
                    <th className="py-2 px-2 text-right">Balance Due</th>
                    <th className="py-2 px-3 text-right">Allocated ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {unpaidInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-400">
                        This customer has zero outstanding invoices. Any payment will be recorded as credit on account.
                      </td>
                    </tr>
                  ) : (
                    unpaidInvoices.map((inv) => {
                      const isSelected = selectedInvoiceIds[inv.id || inv.invoiceNumber] !== undefined;
                      const allocatedAmt = selectedInvoiceIds[inv.id || inv.invoiceNumber] || 0;
                      return (
                        <tr key={inv.id} className={isSelected ? 'bg-emerald-50/50' : 'hover:bg-slate-50'}>
                          <td className="py-2 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleInvoice(inv.id || inv.invoiceNumber, inv.balanceDue)}
                              className="rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                            />
                          </td>
                          <td className="py-2 px-2.5 font-mono font-bold text-slate-800">{inv.invoiceNumber}</td>
                          <td className="py-2 px-2 text-slate-600">{inv.date}</td>
                          <td className="py-2 px-2 text-right font-mono">${inv.grandTotalUsd.toFixed(2)}</td>
                          <td className="py-2 px-2 text-right font-mono text-slate-500">${inv.paidAmountUsd.toFixed(2)}</td>
                          <td className="py-2 px-2 text-right font-mono font-bold text-red-600">
                            ${inv.balanceDue.toFixed(2)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">
                            {isSelected ? `$${allocatedAmt.toFixed(2)}` : '—'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Footer Bar inside Modal */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={printOnSave}
                  onChange={(e) => setPrintOnSave(e.target.checked)}
                  className="rounded border-slate-300 text-primary"
                />
                <span>Print Official Receipt Voucher on Save</span>
              </label>
            </div>

            <button
              type="button"
              onClick={handlePostReceipt}
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-md text-xs shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
            >
              {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>Post Customer Receipt & Sync Ledger</span>
            </button>
          </div>

          {/* Receipts History */}
          <div className="space-y-2">
            <h5 className="font-bold text-slate-800">Recent Customer Receipts History</h5>
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Receipt #</th>
                    <th className="py-2 px-2">Date</th>
                    <th className="py-2 px-2">Customer</th>
                    <th className="py-2 px-2">Method</th>
                    <th className="py-2 px-2 text-right">Amount Received</th>
                    <th className="py-2 px-2 text-center">GL Entry</th>
                    <th className="py-2 px-3 text-right">Print</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {receiptsList.slice(0, 10).map((rct) => (
                    <tr key={rct.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono font-bold text-slate-800">{rct.receiptNo}</td>
                      <td className="py-2 px-2 text-slate-500">{new Date(rct.createdAt).toLocaleDateString()}</td>
                      <td className="py-2 px-2 font-medium text-slate-800">{rct.customerName}</td>
                      <td className="py-2 px-2 text-slate-600">{rct.paymentMethod}</td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-emerald-700">
                        ${rct.amountReceivedUsd.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span className="bg-blue-50 text-blue-700 text-[10px] font-mono px-1.5 py-0.5 rounded border border-blue-200">
                          JV-{rct.receiptNo}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleManualPrint(rct)}
                          className="p-1 text-slate-600 hover:text-primary rounded hover:bg-slate-100 cursor-pointer"
                          title="Print Receipt"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-1.5 rounded-md text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* ISOLATED PRINTABLE CUSTOMER RECEIPT (#printable-customer-receipt)       */}
      {/* ======================================================================= */}
      <div id="printable-customer-receipt" className="hidden">
        {printingReceipt && (
          <div
            style={{
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              color: '#000000',
              padding: printerType === 'thermal' ? '5mm' : '15mm',
              maxWidth: printerType === 'thermal' ? '76mm' : '210mm',
              margin: '0 auto',
              backgroundColor: '#ffffff'
            }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '12px' }}>
              <h2 style={{ margin: '0 0 2px 0', fontSize: printerType === 'thermal' ? '14px' : '18px', fontWeight: 'bold' }}>
                SOUTHERN OLIVE AND OIL PRODUCTS S.A.R.L.
              </h2>
              <h3 style={{ margin: '0 0 4px 0', fontSize: printerType === 'thermal' ? '12px' : '15px', fontWeight: 'bold' }}>
                شركة منتوجات زيت وزيتون الجنوب ش.م.م
              </h3>
              <p style={{ margin: 0, fontSize: printerType === 'thermal' ? '9px' : '11px', color: '#444' }}>
                Branch [1300-01] Main • Commercial & Pressing Center
              </p>
            </div>

            {/* Title */}
            <div style={{ textAlign: 'center', margin: '10px 0', padding: '6px', border: '1px solid #000', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
              <h4 style={{ margin: 0, fontSize: printerType === 'thermal' ? '13px' : '16px', fontWeight: 'bold' }}>
                OFFICIAL CUSTOMER RECEIPT VOUCHER (سند قبض زبون)
              </h4>
            </div>

            {/* Meta */}
            <table style={{ width: '100%', fontSize: printerType === 'thermal' ? '10px' : '12px', borderCollapse: 'collapse', marginBottom: '12px' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '3px 0', fontWeight: 'bold' }}>Receipt No / رقم الإيصال:</td>
                  <td style={{ padding: '3px 0', textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold' }}>
                    {printingReceipt.receiptNo}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '3px 0', fontWeight: 'bold' }}>Date / التاريخ:</td>
                  <td style={{ padding: '3px 0', textAlign: 'right' }}>
                    {new Date(printingReceipt.createdAt).toLocaleDateString()}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '3px 0', fontWeight: 'bold' }}>Customer / الزبون:</td>
                  <td style={{ padding: '3px 0', textAlign: 'right', fontWeight: 'bold' }}>
                    {printingReceipt.customerName}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '3px 0', fontWeight: 'bold' }}>Payment Method / طريقة الدفع:</td>
                  <td style={{ padding: '3px 0', textAlign: 'right' }}>
                    {printingReceipt.paymentMethod}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '3px 0', fontWeight: 'bold' }}>Accounting JV / رقم القيد:</td>
                  <td style={{ padding: '3px 0', textAlign: 'right', fontFamily: 'monospace' }}>
                    JV-{printingReceipt.receiptNo}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Amount Box */}
            <div style={{ border: '2px solid #000', padding: '10px', textAlign: 'center', marginBottom: '14px', borderRadius: '4px' }}>
              <span style={{ fontSize: printerType === 'thermal' ? '10px' : '11px', display: 'block', fontWeight: 'bold', textTransform: 'uppercase' }}>
                Total Amount Received / صافي المبلغ المقبوض
              </span>
              <div style={{ fontSize: printerType === 'thermal' ? '18px' : '24px', fontWeight: 'extrabold', fontFamily: 'monospace', margin: '4px 0' }}>
                ${printingReceipt.amountReceivedUsd.toFixed(2)} USD
              </div>
              <div style={{ fontSize: printerType === 'thermal' ? '11px' : '13px', fontFamily: 'monospace', color: '#333' }}>
                {printingReceipt.amountReceivedLbp.toLocaleString()} LBP (Rate: {printingReceipt.exchangeRate.toLocaleString()})
              </div>
              {printingReceipt.discountGiven > 0 && (
                <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                  Settlement Discount Allowed: ${printingReceipt.discountGiven.toFixed(2)} USD
                </div>
              )}
            </div>

            {/* Allocated Invoices */}
            {printingReceipt.allocations && printingReceipt.allocations.length > 0 && (
              <div style={{ marginBottom: '15px' }}>
                <div style={{ fontWeight: 'bold', fontSize: printerType === 'thermal' ? '10px' : '11px', marginBottom: '4px' }}>
                  Allocated Invoices / الفواتير المسددة:
                </div>
                <table style={{ width: '100%', fontSize: printerType === 'thermal' ? '9px' : '11px', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
                      <th style={{ padding: '3px', textAlign: 'left' }}>Invoice #</th>
                      <th style={{ padding: '3px', textAlign: 'right' }}>Total</th>
                      <th style={{ padding: '3px', textAlign: 'right' }}>Allocated</th>
                      <th style={{ padding: '3px', textAlign: 'right' }}>Remaining</th>
                    </tr>
                  </thead>
                  <tbody>
                    {printingReceipt.allocations.map((a, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '3px' }}>{a.invoiceNo}</td>
                        <td style={{ padding: '3px', textAlign: 'right' }}>${a.totalInvoiceAmountUsd.toFixed(2)}</td>
                        <td style={{ padding: '3px', textAlign: 'right', fontWeight: 'bold' }}>${a.allocatedAmountUsd.toFixed(2)}</td>
                        <td style={{ padding: '3px', textAlign: 'right' }}>${a.remainingBalanceDueUsd.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Signatures */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '25px', paddingTop: '10px', borderTop: '1px solid #ddd', fontSize: printerType === 'thermal' ? '9px' : '11px' }}>
              <div style={{ textAlign: 'center', width: '45%' }}>
                <div style={{ height: '35px' }} />
                <div style={{ borderTop: '1px dashed #000', paddingTop: '4px', fontWeight: 'bold' }}>
                  Cashier Signature
                  <br />
                  أمين الصندوق
                </div>
              </div>
              <div style={{ textAlign: 'center', width: '45%' }}>
                <div style={{ height: '35px' }} />
                <div style={{ borderTop: '1px dashed #000', paddingTop: '4px', fontWeight: 'bold' }}>
                  Customer Signature
                  <br />
                  توقيع المسدد
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '8px', color: '#666', borderTop: '1px solid #eee', paddingTop: '4px' }}>
              Generated by Vanguard ERP • Southern Olive and Oil Products S.A.R.L.
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
