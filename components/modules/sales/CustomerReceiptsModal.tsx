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
  AlertCircle,
  Landmark,
  FileText,
  CreditCard,
  Banknote,
  Calendar,
  Layers,
  Sparkles,
  Lock,
  Unlock
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
import {
  calculateCustomerReceivables,
  calculateReceiptSettlement,
  ReceiptSettlementResult
} from '@/lib/engine/erpCalculationEngine';
import { cleanDocumentNumber } from '@/lib/utils/documentSequence';
import { POS_EXCHANGE_RATE_LBP } from '@/lib/posShiftService';

export interface CompanyBankAccount {
  id: string;
  name: string;
  accountNumber: string;
  currency: 'USD' | 'LBP' | 'ANY';
}

export const COMPANY_BANK_ACCOUNTS: CompanyBankAccount[] = [
  {
    id: 'blom_usd',
    name: 'BLOM Bank S.A.L. - Commercial (USD)',
    accountNumber: 'LB12 0014 0000 0000 5122 0002 01',
    currency: 'USD'
  },
  {
    id: 'audi_usd',
    name: 'Bank Audi S.A.L. - Corporate Settlement (USD)',
    accountNumber: 'LB28 0002 0000 0000 5123 0003 01',
    currency: 'USD'
  },
  {
    id: 'bob_lbp',
    name: 'Bank of Beirut (BOB) - Operations (LBP)',
    accountNumber: 'LB44 0075 0000 0000 5121 0001 01',
    currency: 'LBP'
  },
  {
    id: 'custom',
    name: 'Other / Custom Bank Account',
    accountNumber: '',
    currency: 'ANY'
  }
];

interface CustomerReceiptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCustomerId?: string;
  activeCustomer?: { id: string; name: string; balance?: number; address?: string; phone?: string };
  customers?: Array<{ id: string; name: string; balance?: number; address?: string; phone?: string }>;
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
  printerType = 'a4'
}: CustomerReceiptsModalProps) {
  const effectiveInvoices = invoicesDirectory || invoices || [];
  const effectiveInitialCustomerId = initialCustomerId || propActiveCustomer?.id || 'CUST-002';

  // --------------------------------------------------------------------------
  // Dynamic Customer Directory Extraction & Deduplication
  // --------------------------------------------------------------------------
  const customerList = useMemo(() => {
    const map = new Map<string, { id: string; name: string; balance?: number; address?: string; phone?: string }>();
    (customers || []).forEach((c) => {
      if (c && c.id) map.set(c.id, { ...c });
    });
    // Add from effectiveInvoices if missing
    effectiveInvoices.forEach((inv) => {
      const id = inv.customerId || inv.customer?.id;
      const name = inv.customerName || inv.company || inv.customer?.name;
      if (id && !map.has(id)) {
        map.set(id, {
          id,
          name: name || id,
          address: inv.customerAddress || 'Local Address',
          phone: inv.customerPhone || ''
        });
      }
    });
    // Fallback if empty
    if (map.size === 0) {
      [
        { id: 'CUST-001', name: 'Walk-in Cash Customer', address: 'Local Branch Outlet' },
        { id: 'CUST-002', name: 'Beirut Gourmet Market', address: 'Hamra Street, Bloc B, Beirut' },
        { id: 'CUST-003', name: 'Al-Janoub Mart Supermarket', address: 'Main Highway, Nabatieh' },
        { id: 'CUST-004', name: 'Tyre Regional Co-op', address: 'Port Road, Tyre' },
        { id: 'CUST-005', name: 'Cedar Valley Organics', address: 'Ashrafieh, Tabaris, Beirut' }
      ].forEach((c) => map.set(c.id, c));
    }
    return Array.from(map.values());
  }, [customers, effectiveInvoices]);

  // --------------------------------------------------------------------------
  // Form State
  // --------------------------------------------------------------------------
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(effectiveInitialCustomerId);
  const [customerSearchFilter, setCustomerSearchFilter] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH USD');
  const [currencyCode, setCurrencyCode] = useState<'USD' | 'LBP' | 'EUR' | 'GBP'>('USD');
  const [amountReceived, setAmountReceived] = useState<string>('');
  const [discountMode, setDiscountMode] = useState<'AMOUNT' | 'PERCENT'>('AMOUNT');
  const [discountGiven, setDiscountGiven] = useState<string>('');
  const [exchangeRate, setExchangeRate] = useState<number>(POS_EXCHANGE_RATE_LBP);
  const [notes, setNotes] = useState<string>('');
  const [allocationMode, setAllocationMode] = useState<'FIFO' | 'SPECIFIC'>('FIFO');
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<Record<string, number>>({});
  const [printOnSave, setPrintOnSave] = useState<boolean>(true);
  const [printPaperFormat, setPrintPaperFormat] = useState<'a4' | 'thermal'>(
    printerType === 'thermal' ? 'thermal' : 'a4'
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Bank Account State (for Bank Transfer & Check)
  const [selectedBankId, setSelectedBankId] = useState<string>('blom_usd');
  const [bankAccountName, setBankAccountName] = useState<string>('BLOM Bank S.A.L. - Commercial (USD)');
  const [bankAccountNumber, setBankAccountNumber] = useState<string>('LB12 0014 0000 0000 5122 0002 01');

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
      customerList.find((c) => c.id === selectedCustomerId) ||
      customerList[0] || { id: 'CUST-002', name: 'Beirut Gourmet Market', balance: 850.0 }
    );
  }, [customerList, selectedCustomerId]);

  // --------------------------------------------------------------------------
  // Unsettled Invoices Dynamic Lookup & 7-Digit Normalization
  // --------------------------------------------------------------------------
  const targetCustId = selectedCustomerId.trim().toLowerCase();
  const targetName = (activeCustomer?.name || '').trim().toLowerCase();

  const unpaidInvoices = useMemo(() => {
    return effectiveInvoices
      .filter((inv) => {
        if (!inv) return false;
        const status = String(inv.status || '').toLowerCase();
        const docType = String(inv.docType || inv.doc_type || '').toUpperCase();
        if (status === 'draft' || docType === 'CREDIT_NOTE' || String(inv.invoiceNumber || '').startsWith('CRN-')) {
          return false;
        }

        const invCustId = String(inv.customerId || inv.customer?.id || '').trim().toLowerCase();
        const invCustName = String(inv.customerName || inv.company || inv.customer?.name || '').trim().toLowerCase();

        const isMatch =
          (targetCustId && invCustId === targetCustId) ||
          (targetName &&
            invCustName &&
            (invCustName === targetName || invCustName.includes(targetName) || targetName.includes(invCustName)));

        if (!isMatch) return false;

        const total = Number(inv.grandTotal ?? inv.subtotal ?? 0);
        const paid = Number(
          inv.amount_paid ??
            inv.paidAmount ??
            (inv.payments && Array.isArray(inv.payments)
              ? inv.payments.reduce((s: number, p: any) => s + Number(p.amount || 0), 0)
              : 0)
        );
        const balanceDue = Number((total - paid).toFixed(2));
        return balanceDue > 0.01;
      })
      .map((inv) => {
        const total = Number(inv.grandTotal ?? inv.subtotal ?? 0);
        const paid = Number(
          inv.amount_paid ??
            inv.paidAmount ??
            (inv.payments && Array.isArray(inv.payments)
              ? inv.payments.reduce((s: number, p: any) => s + Number(p.amount || 0), 0)
              : 0)
        );
        const balanceDue = Number((total - paid).toFixed(2));
        const rawNo = cleanDocumentNumber(inv.invoiceNumber || inv.id);
        const cleanNo = rawNo ? (rawNo.length >= 7 ? rawNo : rawNo.padStart(7, '0')) : '0002601';

        return {
          ...inv,
          id: inv.id || cleanNo,
          invoiceNumber: cleanNo,
          date: inv.date || inv.invoiceDate || (inv.createdAt ? String(inv.createdAt).split('T')[0] : '2026-09-04'),
          balanceDue,
          grandTotalUsd: total,
          paidAmountUsd: paid
        };
      })
      .sort((a, b) => {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        if (isNaN(timeA) || isNaN(timeB)) {
          return String(a.invoiceNumber).localeCompare(String(b.invoiceNumber), undefined, { numeric: true });
        }
        return timeA - timeB;
      });
  }, [effectiveInvoices, selectedCustomerId, targetCustId, targetName]);

  // Live Receivables Position
  const customerReceivables = useMemo(() => {
    return calculateCustomerReceivables({
      customerId: selectedCustomerId,
      customerName: activeCustomer?.name,
      creditLimit: (activeCustomer as any)?.creditLimit || 5000,
      invoices: effectiveInvoices
    });
  }, [selectedCustomerId, activeCustomer, effectiveInvoices]);

  const totalOutstandingCustomerDebt = customerReceivables.currentOpenBalance;

  // --------------------------------------------------------------------------
  // Central Receipt Settlement Engine (FIFO vs Manual Allocation)
  // --------------------------------------------------------------------------
  const settlementCalculation: ReceiptSettlementResult = useMemo(() => {
    return calculateReceiptSettlement({
      amountReceived: parseFloat(amountReceived) || 0,
      currencyCode,
      exchangeRate,
      discountMode,
      discountInput: parseFloat(discountGiven) || 0,
      unsettledInvoices: unpaidInvoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        date: inv.date,
        grandTotal: inv.grandTotalUsd,
        balanceDue: inv.balanceDue
      })),
      allocationMode: allocationMode === 'FIFO' ? 'FIFO' : 'MANUAL',
      manualAllocations: selectedInvoiceIds
    });
  }, [amountReceived, currencyCode, exchangeRate, discountMode, discountGiven, unpaidInvoices, allocationMode, selectedInvoiceIds]);

  // Synchronize Payment Method and Currency
  const handlePaymentMethodChange = (newMethod: string) => {
    setPaymentMethod(newMethod);
    if (newMethod === 'CASH USD' || newMethod === 'CARD USD') {
      setCurrencyCode('USD');
    } else if (newMethod === 'CASH LBP' || newMethod === 'CARD LBP') {
      setCurrencyCode('LBP');
    }
  };

  const handleCurrencyChange = (newCurr: 'USD' | 'LBP' | 'EUR' | 'GBP') => {
    setCurrencyCode(newCurr);
    if (paymentMethod === 'CASH USD' && newCurr === 'LBP') {
      setPaymentMethod('CASH LBP');
    } else if (paymentMethod === 'CASH LBP' && newCurr === 'USD') {
      setPaymentMethod('CASH USD');
    } else if (paymentMethod === 'CARD USD' && newCurr === 'LBP') {
      setPaymentMethod('CARD LBP');
    } else if (paymentMethod === 'CARD LBP' && newCurr === 'USD') {
      setPaymentMethod('CARD USD');
    }
  };

  // Synchronize Bank Account Selection
  const handleBankSelect = (bankId: string) => {
    setSelectedBankId(bankId);
    const found = COMPANY_BANK_ACCOUNTS.find((b) => b.id === bankId);
    if (found) {
      if (bankId !== 'custom') {
        setBankAccountName(found.name);
        setBankAccountNumber(found.accountNumber);
        if (found.currency === 'LBP' && currencyCode !== 'LBP') {
          handleCurrencyChange('LBP');
        } else if (found.currency === 'USD' && currencyCode !== 'USD') {
          handleCurrencyChange('USD');
        }
      }
    }
  };

  // Manual Selection & Partial Allocation Handler
  const handleToggleInvoice = (invId: string, balanceDue: number) => {
    if (allocationMode === 'FIFO') return;

    setSelectedInvoiceIds((prev) => {
      const next = { ...prev };
      if (next[invId] !== undefined) {
        delete next[invId];
      } else {
        const alreadyAllocated = Object.entries(prev)
          .filter(([id]) => id !== invId)
          .reduce((sum, [, val]) => sum + val, 0);

        const currentAmt = parseFloat(amountReceived) || 0;
        if (currentAmt > 0) {
          const remainingSettlement = Math.max(0, settlementCalculation.totalSettledBaseUsd - alreadyAllocated);
          next[invId] = Number(Math.min(balanceDue, remainingSettlement).toFixed(2));
        } else {
          next[invId] = balanceDue;
        }
      }

      // If amountReceived was empty or 0, auto-fill it with total of selected
      const totalSelected = Object.values(next).reduce((s, a) => s + a, 0);
      if (!amountReceived || parseFloat(amountReceived) === 0) {
        setAmountReceived(totalSelected > 0 ? totalSelected.toFixed(2) : '');
      }
      return next;
    });
  };

  const handleManualAllocationChange = (invId: string, maxDue: number, valStr: string) => {
    const val = parseFloat(valStr);
    const sanitized = isNaN(val) ? 0 : Math.max(0, Math.min(maxDue, val));
    setSelectedInvoiceIds((prev) => {
      return { ...prev, [invId]: Number(sanitized.toFixed(2)) };
    });
  };

  // --------------------------------------------------------------------------
  // Submit & Post Customer Receipt
  // --------------------------------------------------------------------------
  const handlePostReceipt = async () => {
    const rawAmt = parseFloat(amountReceived);
    if (isNaN(rawAmt) || rawAmt <= 0) {
      toast.error('Please enter a valid receipt amount received.');
      return;
    }

    setIsSubmitting(true);

    try {
      const amtUsd = settlementCalculation.amountReceivedInBaseUsd;
      const amtLbp = settlementCalculation.amountReceivedInSecondary;
      const discountUsd = settlementCalculation.discountAmountUsd;
      const totalSettledUsd = settlementCalculation.totalSettledBaseUsd;
      const unallocatedCreditUsd = settlementCalculation.unallocatedCreditUsd;

      // Build allocations
      const allocations: ReceiptInvoiceAllocation[] = settlementCalculation.allocatedInvoices.map((alloc) => ({
        invoiceId: alloc.invoiceId,
        invoiceNo: alloc.invoiceNo,
        invoiceDate: alloc.invoiceDate,
        totalInvoiceAmountUsd: alloc.totalInvoiceAmountUsd,
        previousBalanceDueUsd: alloc.previousBalanceDueUsd,
        allocatedAmountUsd: alloc.allocatedAmountUsd,
        remainingBalanceDueUsd: alloc.remainingBalanceDueUsd
      }));

      // Update invoices in parent
      const updatedInvoices = effectiveInvoices.map((inv) => {
        const invId = inv.id || inv.invoiceNumber;
        const alloc = settlementCalculation.allocatedInvoices.find((a) => a.invoiceId === invId);
        if (alloc) {
          const currentPaid = Number(inv.amount_paid || inv.paidAmount || 0);
          const newPaid = Number((currentPaid + alloc.allocatedAmountUsd).toFixed(2));
          const newRemaining = alloc.remainingBalanceDueUsd;
          return {
            ...inv,
            amount_paid: newPaid,
            paidAmount: newPaid,
            status: newRemaining <= 0.01 ? 'Paid' : 'Partial',
            paymentStatus: newRemaining <= 0.01 ? 'PAID' : 'PARTIAL'
          };
        }
        return inv;
      });

      const isBankOrCheck = paymentMethod === 'BANK TRANSFER' || paymentMethod === 'CHECK';

      // Record Customer Receipt
      const receipt = await recordCustomerReceipt(
        {
          branchId: branchName,
          shiftId: 'SH-20261014-44',
          customerId: selectedCustomerId,
          customerName: activeCustomer.name,
          paymentMethod,
          currencyCode,
          bankAccountName: isBankOrCheck ? bankAccountName : undefined,
          bankAccountNumber: isBankOrCheck ? bankAccountNumber : undefined,
          amountReceived: rawAmt,
          amountReceivedUsd: amtUsd,
          amountReceivedLbp: amtLbp,
          discountGiven: discountUsd,
          discountMode,
          discountPercent: discountMode === 'PERCENT' ? parseFloat(discountGiven) || 0 : undefined,
          totalSettledUsd,
          unallocatedCreditUsd,
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

      toast.success(`Customer Receipt #${receipt.receiptNo} posted successfully!`);

      // Print voucher if requested
      if (printOnSave) {
        setPrintingReceipt(receipt);
        setTimeout(() => {
          printElementById('printable-customer-receipt', `Customer Receipt ${receipt.receiptNo}`);
        }, 200);
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
    }, 200);
  };

  if (!isOpen) return null;

  const isBankOrCheckActive = paymentMethod === 'BANK TRANSFER' || paymentMethod === 'CHECK';

  // Filtered customer list for search
  const filteredCustomers = customerList.filter((c) => {
    if (!customerSearchFilter.trim()) return true;
    const q = customerSearchFilter.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-5 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden text-slate-800">
        
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
          
          <div className="flex items-center gap-2">
            {/* Paper Format Toggle */}
            <div className="hidden sm:flex items-center bg-black/20 p-0.5 rounded-lg border border-white/10 text-[11px]">
              <button
                type="button"
                onClick={() => setPrintPaperFormat('a4')}
                className={`px-2.5 py-1 rounded font-semibold cursor-pointer transition-colors ${
                  printPaperFormat === 'a4' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-200 hover:text-white'
                }`}
              >
                A4 Voucher (Standard)
              </button>
              <button
                type="button"
                onClick={() => setPrintPaperFormat('thermal')}
                className={`px-2.5 py-1 rounded font-semibold cursor-pointer transition-colors ${
                  printPaperFormat === 'thermal' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-200 hover:text-white'
                }`}
              >
                80mm Thermal
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-300 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Customer Selector & Open Balance Banner */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Widen Customer Account Selector (min-w-[340px]) */}
            <div className="min-w-[340px] w-full sm:w-[380px]">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-slate-600 font-bold uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3 h-3 text-primary" />
                  <span>Customer Account (حساب الزبون)</span>
                </label>
                {customerList.length > 5 && (
                  <span className="text-[10px] text-slate-400">
                    {customerList.length} accounts
                  </span>
                )}
              </div>
              <select
                value={selectedCustomerId}
                onChange={(e) => {
                  setSelectedCustomerId(e.target.value);
                  setSelectedInvoiceIds({});
                }}
                className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs font-bold text-slate-900 shadow-2xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {filteredCustomers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="h-9 w-px bg-slate-200 hidden md:block" />

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">
                Current Open Debt (الرصيد المستحق)
              </span>
              <span className="text-base font-mono font-extrabold text-red-600 flex items-center gap-1">
                ${totalOutstandingCustomerDebt.toFixed(2)} USD
                <span className="text-[11px] font-normal text-slate-500">
                  ({(totalOutstandingCustomerDebt * exchangeRate).toLocaleString()} LBP)
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-md shadow-2xs">
              Next Voucher: #{generateNextReceiptNumber()}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          
          {/* Top Form: Payment Method, Currency, Amount, Discount, Bank Details */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs space-y-3.5">
            <h4 className="font-bold text-slate-800 flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Record Payment & Settlement (بيانات القبض والتسوية)</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                Exchange Rate: 1 USD = {exchangeRate.toLocaleString()} LBP
              </span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Payment Method */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Payment Method (طريقة القبض)
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => handlePaymentMethodChange(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-primary/20"
                >
                  <option value="CASH USD">Cash USD (صندوق الكاشير)</option>
                  <option value="CASH LBP">Cash LBP (صندوق الكاشير)</option>
                  <option value="BANK TRANSFER">Bank Transfer (حوالة مصرفية)</option>
                  <option value="CHECK">Commercial Bank Cheque (شيك بنكي)</option>
                  <option value="CARD USD">Visa / MasterCard (USD)</option>
                  <option value="CARD LBP">Visa / MasterCard (LBP)</option>
                  <option value="WHISH">Whish Money Transfer (ويش موني)</option>
                </select>
              </div>

              {/* Currency with auto-sync */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Currency (العملة)
                </label>
                <select
                  value={currencyCode}
                  onChange={(e) => handleCurrencyChange(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-primary/20"
                >
                  <option value="USD">USD ($) - Primary Base</option>
                  <option value="LBP">LBP (ل.ل) - Secondary</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              {/* Amount Received */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Amount Received (المبلغ المقبوض) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    className="w-full border border-slate-300 rounded-md pl-2.5 pr-12 py-1.5 font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500">
                    {currencyCode}
                  </span>
                </div>
              </div>

              {/* Settlement Discount with % vs Currency Mode Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-700">
                    Settlement Discount (حسم تعجيل)
                  </label>
                  {/* Mode Toggle Button */}
                  <div className="flex items-center bg-slate-100 p-0.5 rounded border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setDiscountMode('AMOUNT')}
                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded cursor-pointer ${
                        discountMode === 'AMOUNT' ? 'bg-primary text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Fixed Amount Discount"
                    >
                      {currencyCode === 'LBP' ? 'LBP' : '$'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountMode('PERCENT')}
                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded cursor-pointer ${
                        discountMode === 'PERCENT' ? 'bg-primary text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Percentage Discount"
                    >
                      %
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={discountGiven}
                    onChange={(e) => setDiscountGiven(e.target.value)}
                    className="w-full border border-slate-300 rounded-md pl-2.5 pr-20 py-1.5 font-mono text-slate-900 bg-white focus:ring-2 focus:ring-primary/20"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {discountMode === 'PERCENT' && settlementCalculation.discountAmountUsd > 0 && (
                      <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-1 rounded border border-emerald-200">
                        -${settlementCalculation.discountAmountUsd.toFixed(2)}
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-slate-400">
                      {discountMode === 'PERCENT' ? '%' : currencyCode}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Conditional Bank Account Details Row */}
            {isBankOrCheckActive && (
              <div className="bg-blue-50/60 border border-blue-200 rounded-md p-3 space-y-2 animate-fade-in">
                <div className="flex items-center gap-1.5 text-blue-900 font-bold text-[11px]">
                  <Landmark className="w-3.5 h-3.5 text-blue-700" />
                  <span>Company Bank Account Details (تفاصيل الحساب المصرفي)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-blue-800 mb-0.5">
                      Select Bank Account (الحساب المعتمد)
                    </label>
                    <select
                      value={selectedBankId}
                      onChange={(e) => handleBankSelect(e.target.value)}
                      className="w-full bg-white border border-blue-200 rounded px-2 py-1 text-xs font-medium text-slate-800"
                    >
                      {COMPANY_BANK_ACCOUNTS.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-blue-800 mb-0.5">
                      Bank / Account Name (اسم المصرف والحساب)
                    </label>
                    <input
                      type="text"
                      value={bankAccountName}
                      onChange={(e) => setBankAccountName(e.target.value)}
                      placeholder="e.g. BLOM Bank S.A.L."
                      className="w-full bg-white border border-blue-200 rounded px-2 py-1 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-blue-800 mb-0.5">
                      Account Number / IBAN (رقم الحساب / الآيبان)
                    </label>
                    <input
                      type="text"
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                      placeholder="e.g. LB12 0014 0000 0000..."
                      className="w-full bg-white border border-blue-200 rounded px-2 py-1 text-xs font-mono text-slate-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notes / Reference Row */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Notes & Settlement Remarks (البيان ورقم الإشعار / الشيك)
              </label>
              <input
                type="text"
                placeholder="e.g. Cheque #894210 BLOM Bank / Wire Ref #TR-994821 / تسوية فواتير على الحساب"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-800 bg-white focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Settlement Live Summary Banner */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <span className="text-[10px] text-emerald-800 font-bold uppercase block">Total Net Settled</span>
                <span className="text-sm font-mono font-extrabold text-emerald-800">
                  ${settlementCalculation.totalSettledBaseUsd.toFixed(2)} USD
                </span>
              </div>
              <div className="h-6 w-px bg-emerald-200 hidden sm:block" />
              <div>
                <span className="text-[10px] text-emerald-800 font-bold uppercase block">Allocated to Invoices</span>
                <span className="text-sm font-mono font-extrabold text-slate-900">
                  ${settlementCalculation.totalAllocatedToInvoicesUsd.toFixed(2)} USD
                </span>
              </div>
              <div className="h-6 w-px bg-emerald-200 hidden sm:block" />
              <div>
                <span className="text-[10px] text-emerald-800 font-bold uppercase block">
                  Unallocated Credit (دفعة على الحساب)
                </span>
                <span className={`text-sm font-mono font-extrabold ${
                  settlementCalculation.unallocatedCreditUsd > 0 ? 'text-blue-700 font-black' : 'text-slate-500'
                }`}>
                  ${settlementCalculation.unallocatedCreditUsd.toFixed(2)} USD
                </span>
              </div>
            </div>

            {settlementCalculation.unallocatedCreditUsd > 0 && (
              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-blue-200">
                Payment exceeds open invoices: surplus will remain as customer credit balance
              </span>
            )}
          </div>

          {/* Invoice Allocation Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-primary" />
                <span>Unsettled Customer Invoices (الفواتير غير المسددة)</span>
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  {unpaidInvoices.length} Invoices
                </span>
              </h5>

              {/* Allocation Mode Switch */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setAllocationMode('FIFO');
                    setSelectedInvoiceIds({});
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                    allocationMode === 'FIFO'
                      ? 'bg-primary text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Lock className="w-3 h-3" />
                  <span>Auto FIFO Allocation</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAllocationMode('SPECIFIC');
                    // Pre-fill manual selection with current FIFO allocation
                    setSelectedInvoiceIds({ ...settlementCalculation.allocationsMap });
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                    allocationMode === 'SPECIFIC'
                      ? 'bg-primary text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Unlock className="w-3 h-3" />
                  <span>Manual Selection</span>
                </button>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-12">
                      {allocationMode === 'FIFO' ? 'FIFO' : 'Select'}
                    </th>
                    <th className="py-2.5 px-3">Invoice #</th>
                    <th className="py-2.5 px-2.5">Date</th>
                    <th className="py-2.5 px-2.5 text-right">Grand Total</th>
                    <th className="py-2.5 px-2.5 text-right">Paid</th>
                    <th className="py-2.5 px-2.5 text-right">Balance Due</th>
                    <th className="py-2.5 px-4 text-right w-40">Allocated ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {unpaidInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-1 opacity-60" />
                        <span className="block font-semibold">Zero Outstanding Invoices</span>
                        <span className="text-[11px] text-slate-500">
                          This customer is fully settled. Any posted receipt will be recorded as advance credit on account.
                        </span>
                      </td>
                    </tr>
                  ) : (
                    unpaidInvoices.map((inv) => {
                      const isFifo = allocationMode === 'FIFO';
                      const allocatedAmt = isFifo
                        ? settlementCalculation.allocationsMap[inv.id] || 0
                        : selectedInvoiceIds[inv.id] || 0;
                      const isFunded = allocatedAmt > 0;
                      const isSelected = !isFifo && selectedInvoiceIds[inv.id] !== undefined;

                      return (
                        <tr
                          key={inv.id}
                          className={`${
                            isFunded
                              ? 'bg-emerald-50/60'
                              : isSelected
                              ? 'bg-blue-50/40'
                              : 'hover:bg-slate-50'
                          } transition-colors`}
                        >
                          <td className="py-2 px-3 text-center">
                            {isFifo ? (
                              <input
                                type="checkbox"
                                checked={isFunded}
                                disabled
                                className="rounded border-slate-300 text-primary cursor-not-allowed opacity-80"
                                title="Auto FIFO controlled"
                              />
                            ) : (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleInvoice(inv.id, inv.balanceDue)}
                                className="rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                              />
                            )}
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-900">
                            #{inv.invoiceNumber}
                          </td>
                          <td className="py-2 px-2.5 text-slate-600 font-mono text-[11px]">
                            {inv.date}
                          </td>
                          <td className="py-2 px-2.5 text-right font-mono text-slate-700">
                            ${inv.grandTotalUsd.toFixed(2)}
                          </td>
                          <td className="py-2 px-2.5 text-right font-mono text-slate-500">
                            ${inv.paidAmountUsd.toFixed(2)}
                          </td>
                          <td className="py-2 px-2.5 text-right font-mono font-bold text-red-600">
                            ${inv.balanceDue.toFixed(2)}
                          </td>
                          <td className="py-2 px-4 text-right">
                            {isFifo ? (
                              <span
                                className={`font-mono font-bold ${
                                  isFunded ? 'text-emerald-700 text-xs' : 'text-slate-300'
                                }`}
                              >
                                {isFunded ? `$${allocatedAmt.toFixed(2)}` : '—'}
                              </span>
                            ) : (
                              <div className="flex items-center justify-end gap-1">
                                {isSelected ? (
                                  <div className="relative w-28">
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-[10px]">
                                      $
                                    </span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      max={inv.balanceDue}
                                      value={allocatedAmt || ''}
                                      onChange={(e) =>
                                        handleManualAllocationChange(inv.id, inv.balanceDue, e.target.value)
                                      }
                                      className="w-full text-right font-mono font-bold text-xs bg-white border border-emerald-400 rounded px-2 py-0.5 text-emerald-800 focus:ring-1 focus:ring-emerald-500"
                                    />
                                  </div>
                                ) : (
                                  <span className="text-slate-300 font-mono">—</span>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Bar inside Modal */}
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
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2 rounded-md text-xs shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
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
                      <td className="py-2 px-3 font-mono font-bold text-slate-800">#{rct.receiptNo}</td>
                      <td className="py-2 px-2 text-slate-500 font-mono text-[11px]">
                        {new Date(rct.createdAt).toLocaleDateString()}
                      </td>
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
                          title="Print Receipt Voucher"
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

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex justify-between items-center shrink-0">
          <span className="text-[11px] text-slate-500">
            Current Cashier: <strong className="text-slate-700">{cashierName}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* ISOLATED PRINTABLE CUSTOMER RECEIPT (#printable-customer-receipt)       */}
      {/* Supports Full-Width A4 Portrait Standard & 80mm Thermal Rolls           */}
      {/* ======================================================================= */}
      <div id="printable-customer-receipt" className="hidden">
        {printingReceipt && (
          <div
            style={{
              fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
              color: '#0f172a',
              padding: printPaperFormat === 'thermal' ? '5mm' : '12mm',
              maxWidth: printPaperFormat === 'thermal' ? '76mm' : '210mm',
              width: '100%',
              margin: '0 auto',
              backgroundColor: '#ffffff',
              boxSizing: 'border-box'
            }}
          >
            {printPaperFormat === 'a4' ? (
              /* ================================================================= */
              /* FULL A4 PORTRAIT OFFICIAL RECEIPT VOUCHER                         */
              /* ================================================================= */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* 3-Zone Official Corporate Header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    borderBottom: '2px solid #0f172a',
                    paddingBottom: '12px'
                  }}
                >
                  {/* Left: Company Details */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', lineHeight: '1.2' }}>
                      SOUTHERN OLIVE AND OIL PRODUCTS S.A.R.L.
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#166534', marginTop: '2px' }}>
                      شركة منتوجات زيت وزيتون الجنوب ش.م.م
                    </div>
                    <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>
                      Facility: [1300-01] Main • Commercial Registration: 71044 Saida
                    </div>
                    <div style={{ fontSize: '11px', color: '#475569' }}>
                      Tax ID / MOF #: 3198042 • Industrial Zone, Old Saida Road
                    </div>
                  </div>

                  {/* Center: Voucher Title */}
                  <div style={{ flex: 1, textAlign: 'center', padding: '0 8px' }}>
                    <div
                      style={{
                        display: 'inline-block',
                        border: '2px solid #0f172a',
                        padding: '6px 14px',
                        borderRadius: '4px',
                        backgroundColor: '#f8fafc'
                      }}
                    >
                      <div style={{ fontSize: '14px', fontWeight: '900', letterSpacing: '0.5px' }}>
                        OFFICIAL CUSTOMER RECEIPT VOUCHER
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#166534', marginTop: '2px' }}>
                        سند قبض رسمي - ذمم زبائن
                      </div>
                    </div>
                    <div
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: '800',
                        fontSize: '13px',
                        color: '#0f172a',
                        marginTop: '6px'
                      }}
                    >
                      VOUCHER #{printingReceipt.receiptNo}
                    </div>
                  </div>

                  {/* Right: Branch & Metadata */}
                  <div style={{ flex: 1, textAlign: 'right', fontSize: '11px', color: '#334155' }}>
                    <div>
                      <strong>Date / التاريخ:</strong> {new Date(printingReceipt.createdAt).toLocaleDateString()}
                    </div>
                    <div>
                      <strong>Time / الوقت:</strong> {new Date(printingReceipt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div>
                      <strong>Cashier / أمين الصندوق:</strong> {printingReceipt.cashierName || cashierName}
                    </div>
                    <div>
                      <strong>Journal Entry / القيد:</strong> JV-{printingReceipt.receiptNo}
                    </div>
                    <div style={{ marginTop: '2px' }}>
                      <span style={{ backgroundColor: '#ecfdf5', color: '#065f46', padding: '1px 6px', borderRadius: '4px', fontWeight: 'bold', border: '1px solid #a7f3d0' }}>
                        STATUS: POSTED
                      </span>
                    </div>
                  </div>
                </div>

                {/* Structured Two-Column Metadata Box */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '12px'
                  }}
                >
                  {/* Left Column: Customer Account */}
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#475569', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px', marginBottom: '6px' }}>
                      Customer Account Details / بيانات حساب الزبون
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
                      {printingReceipt.customerName}
                    </div>
                    <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                      Account Code: <strong style={{ fontFamily: 'monospace' }}>{printingReceipt.customerId}</strong>
                    </div>
                    <div style={{ fontSize: '11px', color: '#475569' }}>
                      Branch / Facility: {branchName}
                    </div>
                  </div>

                  {/* Right Column: Payment Details */}
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#475569', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px', marginBottom: '6px' }}>
                      Settlement & Payment Method / تفاصيل الدفع والتسوية
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>
                      {printingReceipt.paymentMethod} ({printingReceipt.currencyCode})
                    </div>
                    {printingReceipt.bankAccountName && (
                      <div style={{ fontSize: '11px', color: '#1e3a8a', marginTop: '2px' }}>
                        Bank: <strong>{printingReceipt.bankAccountName}</strong>
                      </div>
                    )}
                    {printingReceipt.bankAccountNumber && (
                      <div style={{ fontSize: '10.5px', fontFamily: 'monospace', color: '#1e3a8a' }}>
                        Account / IBAN: {printingReceipt.bankAccountNumber}
                      </div>
                    )}
                    <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                      Reference / البيان: <em>{printingReceipt.notes}</em>
                    </div>
                  </div>
                </div>

                {/* Dual-Currency Settlement Summary Box */}
                <div
                  style={{
                    border: '2px solid #0f172a',
                    borderRadius: '6px',
                    padding: '14px',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', textAlign: 'center' }}>
                    <div style={{ borderRight: '1px solid #e2e8f0', paddingRight: '10px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                        Amount Received
                      </span>
                      <div style={{ fontSize: '18px', fontWeight: '900', fontFamily: 'monospace', color: '#0f172a', marginTop: '2px' }}>
                        ${printingReceipt.amountReceivedUsd.toFixed(2)} USD
                      </div>
                      <div style={{ fontSize: '10.5px', fontFamily: 'monospace', color: '#64748b' }}>
                        {printingReceipt.amountReceivedLbp.toLocaleString()} LBP
                      </div>
                    </div>

                    <div style={{ borderRight: '1px solid #e2e8f0', paddingRight: '10px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                        Settlement Discount
                      </span>
                      <div style={{ fontSize: '18px', fontWeight: '900', fontFamily: 'monospace', color: '#047857', marginTop: '2px' }}>
                        ${printingReceipt.discountGiven.toFixed(2)} USD
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#047857' }}>
                        {printingReceipt.discountPercent ? `${printingReceipt.discountPercent}% Granted` : 'Fixed Discount'}
                      </div>
                    </div>

                    <div style={{ borderRight: '1px solid #e2e8f0', paddingRight: '10px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                        Net Credited to Account
                      </span>
                      <div style={{ fontSize: '18px', fontWeight: '900', fontFamily: 'monospace', color: '#15803d', marginTop: '2px' }}>
                        ${((printingReceipt.amountReceivedUsd || 0) + (printingReceipt.discountGiven || 0)).toFixed(2)} USD
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#15803d' }}>
                        صافي المحسوم من الذمة
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                        Exchange Rate
                      </span>
                      <div style={{ fontSize: '18px', fontWeight: '900', fontFamily: 'monospace', color: '#0f172a', marginTop: '2px' }}>
                        {printingReceipt.exchangeRate.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                        LBP per 1 USD
                      </div>
                    </div>
                  </div>
                </div>

                {/* Allocated Invoices Table */}
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
                    Allocated Invoices & Debt Settlement Breakdown / تفصيل تسديد الفواتير:
                  </div>
                  <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', border: '1px solid #cbd5e1' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1.5px solid #cbd5e1' }}>
                        <th style={{ padding: '6px 8px', textAlign: 'left' }}>Invoice #</th>
                        <th style={{ padding: '6px 8px', textAlign: 'left' }}>Date</th>
                        <th style={{ padding: '6px 8px', textAlign: 'right' }}>Total Invoice</th>
                        <th style={{ padding: '6px 8px', textAlign: 'right' }}>Previous Balance</th>
                        <th style={{ padding: '6px 8px', textAlign: 'right' }}>Allocated ($)</th>
                        <th style={{ padding: '6px 8px', textAlign: 'right' }}>Remaining Balance</th>
                        <th style={{ padding: '6px 8px', textAlign: 'center' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {printingReceipt.allocations && printingReceipt.allocations.length > 0 ? (
                        printingReceipt.allocations.map((a, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: i % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                            <td style={{ padding: '6px 8px', fontFamily: 'monospace', fontWeight: 'bold' }}>
                              #{a.invoiceNo}
                            </td>
                            <td style={{ padding: '6px 8px', color: '#64748b' }}>
                              {a.invoiceDate || '—'}
                            </td>
                            <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'monospace' }}>
                              ${a.totalInvoiceAmountUsd.toFixed(2)}
                            </td>
                            <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'monospace' }}>
                              ${a.previousBalanceDueUsd.toFixed(2)}
                            </td>
                            <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold', color: '#166534' }}>
                              ${a.allocatedAmountUsd.toFixed(2)}
                            </td>
                            <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'monospace', color: a.remainingBalanceDueUsd <= 0.01 ? '#047857' : '#dc2626' }}>
                              ${a.remainingBalanceDueUsd.toFixed(2)}
                            </td>
                            <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                              <span
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 'bold',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  backgroundColor: a.remainingBalanceDueUsd <= 0.01 ? '#dcfce7' : '#fef3c7',
                                  color: a.remainingBalanceDueUsd <= 0.01 ? '#166534' : '#92400e'
                                }}
                              >
                                {a.remainingBalanceDueUsd <= 0.01 ? 'FULL' : 'PARTIAL'}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} style={{ padding: '10px', textAlign: 'center', color: '#64748b' }}>
                            Advance settlement credited directly to customer account.
                          </td>
                        </tr>
                      )}

                      {/* Unallocated Credit Line if surplus exists */}
                      {printingReceipt.unallocatedCreditUsd !== undefined && printingReceipt.unallocatedCreditUsd > 0 && (
                        <tr style={{ backgroundColor: '#eff6ff', fontWeight: 'bold', borderTop: '2px solid #bfdbfe' }}>
                          <td colSpan={4} style={{ padding: '6px 8px', color: '#1e40af' }}>
                            Advance Credit on Account (دفعة على الحساب فائضة عن الفواتير المفتوحة):
                          </td>
                          <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'monospace', color: '#1e40af' }}>
                            ${printingReceipt.unallocatedCreditUsd.toFixed(2)}
                          </td>
                          <td colSpan={2} style={{ padding: '6px 8px', textAlign: 'center', color: '#1e40af' }}>
                            Held as Customer Credit Balance
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Official Signatures Row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '20px',
                    marginTop: '25px',
                    paddingTop: '10px',
                    borderTop: '1px solid #cbd5e1',
                    fontSize: '11px',
                    textAlign: 'center'
                  }}
                >
                  <div>
                    <div style={{ height: '40px' }} />
                    <div style={{ borderTop: '1px dashed #0f172a', paddingTop: '4px', fontWeight: 'bold' }}>
                      Cashier / Prepared By
                      <br />
                      أمين الصندوق
                    </div>
                  </div>

                  <div>
                    <div style={{ height: '40px' }} />
                    <div style={{ borderTop: '1px dashed #0f172a', paddingTop: '4px', fontWeight: 'bold' }}>
                      Customer / Received By
                      <br />
                      توقيع المسدد / الزبون
                    </div>
                  </div>

                  <div>
                    <div style={{ height: '40px' }} />
                    <div style={{ borderTop: '1px dashed #0f172a', paddingTop: '4px', fontWeight: 'bold' }}>
                      Accounting Approval
                      <br />
                      تدقيق الحسابات
                    </div>
                  </div>
                </div>

                {/* Footer Security Watermark */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid #e2e8f0',
                    paddingTop: '6px',
                    fontSize: '9px',
                    color: '#94a3b8'
                  }}
                >
                  <span>Generated by Vanguard ERP Enterprise Engine • Document Sequence Standard: 7-Digit</span>
                  <span style={{ fontFamily: 'monospace' }}>DOC ID: #{printingReceipt.receiptNo} • Page 1 of 1</span>
                </div>
              </div>
            ) : (
              /* ================================================================= */
              /* 80mm COMPACT THERMAL RECEIPT LAYOUT                               */
              /* ================================================================= */
              <div>
                {/* Header */}
                <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '10px' }}>
                  <h2 style={{ margin: '0 0 2px 0', fontSize: '13px', fontWeight: 'bold' }}>
                    SOUTHERN OLIVE AND OIL PRODUCTS S.A.R.L.
                  </h2>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: 'bold' }}>
                    شركة منتوجات زيت وزيتون الجنوب ش.م.م
                  </h3>
                  <p style={{ margin: 0, fontSize: '9px', color: '#444' }}>
                    Facility [1300-01] Main • Reg: 71044 Saida
                  </p>
                </div>

                {/* Title */}
                <div style={{ textAlign: 'center', margin: '8px 0', padding: '4px', border: '1px solid #000', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
                  <h4 style={{ margin: 0, fontSize: '12px', fontWeight: 'bold' }}>
                    CUSTOMER RECEIPT (سند قبض)
                  </h4>
                  <div style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '11px', marginTop: '2px' }}>
                    #{printingReceipt.receiptNo}
                  </div>
                </div>

                {/* Meta */}
                <table style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse', marginBottom: '10px' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '2px 0', fontWeight: 'bold' }}>Date / التاريخ:</td>
                      <td style={{ padding: '2px 0', textAlign: 'right' }}>
                        {new Date(printingReceipt.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '2px 0', fontWeight: 'bold' }}>Customer / الزبون:</td>
                      <td style={{ padding: '2px 0', textAlign: 'right', fontWeight: 'bold' }}>
                        {printingReceipt.customerName}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '2px 0', fontWeight: 'bold' }}>Method / الطريقة:</td>
                      <td style={{ padding: '2px 0', textAlign: 'right' }}>
                        {printingReceipt.paymentMethod}
                      </td>
                    </tr>
                    {printingReceipt.bankAccountName && (
                      <tr>
                        <td style={{ padding: '2px 0', fontWeight: 'bold' }}>Bank / المصرف:</td>
                        <td style={{ padding: '2px 0', textAlign: 'right', fontSize: '9px' }}>
                          {printingReceipt.bankAccountName}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td style={{ padding: '2px 0', fontWeight: 'bold' }}>JV No / القيد:</td>
                      <td style={{ padding: '2px 0', textAlign: 'right', fontFamily: 'monospace' }}>
                        JV-{printingReceipt.receiptNo}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Amount Box */}
                <div style={{ border: '2px solid #000', padding: '8px', textAlign: 'center', marginBottom: '12px', borderRadius: '4px' }}>
                  <span style={{ fontSize: '9px', display: 'block', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    Total Amount Received
                  </span>
                  <div style={{ fontSize: '18px', fontWeight: 'extrabold', fontFamily: 'monospace', margin: '3px 0' }}>
                    ${printingReceipt.amountReceivedUsd.toFixed(2)} USD
                  </div>
                  <div style={{ fontSize: '10px', fontFamily: 'monospace', color: '#333' }}>
                    {printingReceipt.amountReceivedLbp.toLocaleString()} LBP
                  </div>
                  {printingReceipt.discountGiven > 0 && (
                    <div style={{ fontSize: '9px', color: '#047857', marginTop: '3px', fontWeight: 'bold' }}>
                      Settlement Discount: ${printingReceipt.discountGiven.toFixed(2)} USD
                    </div>
                  )}
                </div>

                {/* Allocated Invoices */}
                {printingReceipt.allocations && printingReceipt.allocations.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '10px', marginBottom: '4px' }}>
                      Allocated Invoices / الفواتير المسددة:
                    </div>
                    <table style={{ width: '100%', fontSize: '9px', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
                          <th style={{ padding: '2px 4px', textAlign: 'left' }}>Inv #</th>
                          <th style={{ padding: '2px 4px', textAlign: 'right' }}>Total</th>
                          <th style={{ padding: '2px 4px', textAlign: 'right' }}>Allocated</th>
                          <th style={{ padding: '2px 4px', textAlign: 'right' }}>Due</th>
                        </tr>
                      </thead>
                      <tbody>
                        {printingReceipt.allocations.map((a, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '2px 4px' }}>#{a.invoiceNo}</td>
                            <td style={{ padding: '2px 4px', textAlign: 'right' }}>${a.totalInvoiceAmountUsd.toFixed(2)}</td>
                            <td style={{ padding: '2px 4px', textAlign: 'right', fontWeight: 'bold' }}>${a.allocatedAmountUsd.toFixed(2)}</td>
                            <td style={{ padding: '2px 4px', textAlign: 'right' }}>${a.remainingBalanceDueUsd.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Signatures */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '8px', borderTop: '1px solid #ddd', fontSize: '9px' }}>
                  <div style={{ textAlign: 'center', width: '45%' }}>
                    <div style={{ height: '24px' }} />
                    <div style={{ borderTop: '1px dashed #000', paddingTop: '2px', fontWeight: 'bold' }}>
                      Cashier
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', width: '45%' }}>
                    <div style={{ height: '24px' }} />
                    <div style={{ borderTop: '1px dashed #000', paddingTop: '2px', fontWeight: 'bold' }}>
                      Customer
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '8px', color: '#666', borderTop: '1px solid #eee', paddingTop: '3px' }}>
                  Vanguard ERP • Southern Olive and Oil Products S.A.R.L.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
