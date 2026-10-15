'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Printer,
  FileSpreadsheet,
  Calendar,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Receipt,
  Search,
  Building2,
  DollarSign,
  Download,
  Filter
} from 'lucide-react';
import { printElementById } from '@/lib/utils/printDocument';
import { calculateCustomerAging, CustomerAgingRow } from '@/lib/customerSalesService';
import { calculateAllCustomersAging } from '@/lib/engine/erpCalculationEngine';

interface CustomerAgedModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCustomerId?: string;
  activeCustomer?: { id: string; name: string; address?: string };
  customers?: Array<{ id: string; name: string }>;
  invoicesDirectory?: any[];
  invoices?: any[];
  tenantId?: string;
  onOpenReceiptForCustomer?: (customerId: string) => void;
  onSelectCustomerForReceipt?: (customer: any) => void;
  branchName?: string;
}

export default function CustomerAgedModal({
  isOpen,
  onClose,
  selectedCustomerId,
  activeCustomer,
  customers = [],
  invoicesDirectory,
  invoices,
  tenantId,
  onOpenReceiptForCustomer,
  onSelectCustomerForReceipt,
  branchName = 'Southern Olive and Oil Products S.A.R.L.'
}: CustomerAgedModalProps) {
  const effectiveInvoices = invoicesDirectory || invoices || [];
  const effectiveCustomerId = selectedCustomerId || activeCustomer?.id;
  const [filterMode, setFilterMode] = useState<'ALL' | 'SELECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null);

  // Compute live aging rows via Central ERP Calculation Engine
  const agingRows: CustomerAgingRow[] = useMemo(() => {
    const targetCId = filterMode === 'SELECTED' && effectiveCustomerId ? effectiveCustomerId : undefined;
    return calculateAllCustomersAging(effectiveInvoices, targetCId) as unknown as CustomerAgingRow[];
  }, [effectiveInvoices, filterMode, effectiveCustomerId]);

  // Filter with search
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return agingRows;
    const q = searchQuery.toLowerCase();
    return agingRows.filter(
      (r) => r.customerName.toLowerCase().includes(q) || r.customerId.toLowerCase().includes(q)
    );
  }, [agingRows, searchQuery]);

  // Grand summary across buckets
  const grandTotals = useMemo(() => {
    return filteredRows.reduce(
      (acc, r) => {
        acc.current30 += r.buckets.current30;
        acc.days31to60 += r.buckets.days31to60;
        acc.days61to90 += r.buckets.days61to90;
        acc.over90 += r.buckets.over90;
        acc.totalDue += r.buckets.totalDue;
        return acc;
      },
      { current30: 0, days31to60: 0, days61to90: 0, over90: 0, totalDue: 0 }
    );
  }, [filteredRows]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Customer ID', 'Customer Name', '0-30 Days', '31-60 Days', '61-90 Days', '90+ Days', 'Total Balance Due'];
    const rows = filteredRows.map((r) => [
      `"${r.customerId}"`,
      `"${r.customerName}"`,
      (Number(r.buckets?.current30) || 0).toFixed(2),
      (Number(r.buckets?.days31to60) || 0).toFixed(2),
      (Number(r.buckets?.days61to90) || 0).toFixed(2),
      (Number(r.buckets?.over90) || 0).toFixed(2),
      (Number(r.buckets?.totalDue) || 0).toFixed(2)
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `customer_aging_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    printElementById('printable-customer-aged', 'Customer Aged Receivables Report');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-5 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800">
        
        {/* Header */}
        <div className="bg-primary text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold tracking-tight">
                  Customer Aged Receivables Report (كشف أعمار الديون والذمم)
                </h3>
                <span className="bg-white/15 text-white/90 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/20">
                  Vanguard ERP
                </span>
              </div>
              <p className="text-[11px] text-slate-200">
                Southern Olive and Oil Products S.A.R.L. • Facility: [1300-01] Main • As of {new Date().toLocaleDateString()}
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

        {/* Filter and Summary Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white border border-slate-300 rounded p-0.5">
              <button
                type="button"
                onClick={() => setFilterMode('ALL')}
                className={`px-3 py-1 rounded text-xs font-bold cursor-pointer ${
                  filterMode === 'ALL' ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Customers
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('SELECTED')}
                className={`px-3 py-1 rounded text-xs font-bold cursor-pointer ${
                  filterMode === 'SELECTED' ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Selected Customer
              </button>
            </div>

            <div className="relative w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search customer name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1 border border-slate-300 rounded bg-white text-xs"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="bg-primary hover:bg-primary/90 text-white px-3.5 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Aging Report</span>
            </button>
          </div>
        </div>

        {/* Grand Aging Buckets KPI Banner */}
        <div className="bg-white border-b border-slate-200 px-5 py-3 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs shrink-0">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
            <span className="text-[10px] text-emerald-700 font-bold uppercase block">Current (0–30 Days)</span>
            <span className="text-base font-mono font-extrabold text-emerald-800">${(Number(grandTotals?.current30) || 0).toFixed(2)}</span>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
            <span className="text-[10px] text-blue-700 font-bold uppercase block">31–60 Days</span>
            <span className="text-base font-mono font-extrabold text-blue-800">${(Number(grandTotals?.days31to60) || 0).toFixed(2)}</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
            <span className="text-[10px] text-amber-700 font-bold uppercase block">61–90 Days</span>
            <span className="text-base font-mono font-extrabold text-amber-800">${(Number(grandTotals?.days61to90) || 0).toFixed(2)}</span>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-2.5">
            <span className="text-[10px] text-red-700 font-bold uppercase block flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-red-600" />
              <span>90+ Days (Overdue)</span>
            </span>
            <span className="text-base font-mono font-extrabold text-red-700">${(Number(grandTotals?.over90) || 0).toFixed(2)}</span>
          </div>
          <div className="bg-slate-100 border border-slate-300 rounded-lg p-2.5">
            <span className="text-[10px] text-slate-600 font-bold uppercase block">Total Balance Due</span>
            <span className="text-lg font-mono font-extrabold text-slate-900">${(Number(grandTotals?.totalDue) || 0).toFixed(2)}</span>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto p-5 text-xs">
          <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-3">Customer Account</th>
                  <th className="py-2.5 px-2 text-right">0–30 Days</th>
                  <th className="py-2.5 px-2 text-right">31–60 Days</th>
                  <th className="py-2.5 px-2 text-right">61–90 Days</th>
                  <th className="py-2.5 px-2 text-right text-red-700 font-bold">90+ Days</th>
                  <th className="py-2.5 px-2 text-right font-extrabold">Total Due</th>
                  <th className="py-2.5 px-3 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Zero outstanding debt found for the selected filter. All accounts in good standing.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((r) => {
                    const isExpanded = expandedCustomerId === r.customerId;
                    return (
                      <React.Fragment key={r.customerId}>
                        <tr
                          className="hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => setExpandedCustomerId(isExpanded ? null : r.customerId)}
                        >
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1.5">
                              {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                              )}
                              <span className="font-bold text-slate-900">{r.customerName}</span>
                              <span className="text-[10px] text-slate-400 font-mono">({r.customerId})</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono text-slate-600">
                            ${(Number(r.buckets?.current30) || 0).toFixed(2)}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono text-slate-600">
                            ${(Number(r.buckets?.days31to60) || 0).toFixed(2)}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono text-amber-700 font-semibold">
                            ${(Number(r.buckets?.days61to90) || 0).toFixed(2)}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono text-red-600 font-bold">
                            ${(Number(r.buckets?.over90) || 0).toFixed(2)}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono font-extrabold text-slate-900">
                            ${(Number(r.buckets?.totalDue) || 0).toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                if (onSelectCustomerForReceipt) {
                                  onSelectCustomerForReceipt({ id: r.customerId, name: r.customerName });
                                } else if (onOpenReceiptForCustomer) {
                                  onOpenReceiptForCustomer(r.customerId);
                                }
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2.5 py-1 rounded shadow-2xs inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Receipt className="w-3 h-3" />
                              <span>Receive Payment</span>
                            </button>
                          </td>
                        </tr>

                        {/* Expanded Invoices Sub-table */}
                        {isExpanded && (
                          <tr className="bg-slate-50/70">
                            <td colSpan={7} className="px-6 py-3 border-y border-slate-200">
                              <div className="space-y-1.5">
                                <span className="font-bold text-slate-700 text-[11px] block">
                                  Underlying Open Invoices for {r.customerName}:
                                </span>
                                <table className="w-full text-left text-xs bg-white border border-slate-200 rounded">
                                  <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold border-b border-slate-200">
                                    <tr>
                                      <th className="py-1.5 px-2.5">Invoice #</th>
                                      <th className="py-1.5 px-2">Date</th>
                                      <th className="py-1.5 px-2 text-center">Days Old</th>
                                      <th className="py-1.5 px-2 text-right">Grand Total</th>
                                      <th className="py-1.5 px-2 text-right">Paid</th>
                                      <th className="py-1.5 px-2 text-right font-bold">Balance Due</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {r.unpaidInvoices.map((inv) => (
                                      <tr key={inv.invoiceId} className="hover:bg-slate-50">
                                        <td className="py-1.5 px-2.5 font-mono font-bold text-slate-800">{inv.invoiceNo}</td>
                                        <td className="py-1.5 px-2 text-slate-500">{inv.date}</td>
                                        <td className="py-1.5 px-2 text-center">
                                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                            inv.daysOld > 90 ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                                          }`}>
                                            {inv.daysOld} d
                                          </span>
                                        </td>
                                        <td className="py-1.5 px-2 text-right font-mono text-slate-600">${(Number(inv.grandTotal) || 0).toFixed(2)}</td>
                                        <td className="py-1.5 px-2 text-right font-mono text-slate-500">${(Number(inv.amountPaid) || 0).toFixed(2)}</td>
                                        <td className="py-1.5 px-2 text-right font-mono font-bold text-red-600">${(Number(inv.balanceDue) || 0).toFixed(2)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex justify-between items-center shrink-0">
          <span className="text-[11px] text-slate-500">
            Aged calculations synchronized in real-time with Sales & Accounting Ledgers
          </span>
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
      {/* ISOLATED PRINTABLE AGING REPORT (#printable-customer-aged)              */}
      {/* ======================================================================= */}
      <div id="printable-customer-aged" className="hidden">
        <div
          style={{
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            color: '#000000',
            padding: '12mm',
            maxWidth: '210mm',
            margin: '0 auto',
            backgroundColor: '#ffffff'
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '14px' }}>
            <h2 style={{ margin: '0 0 2px 0', fontSize: '18px', fontWeight: 'bold' }}>
              SOUTHERN OLIVE AND OIL PRODUCTS S.A.R.L.
            </h2>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 'bold' }}>
              شركة منتوجات زيت وزيتون الجنوب ش.م.م
            </h3>
            <p style={{ margin: 0, fontSize: '11px', color: '#444' }}>
              Facility: [1300-01] Main Commercial Center • Customer Aged Receivables Analysis
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '11px' }}>
            <span><strong>Date Generated:</strong> {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</span>
            <span><strong>Filter:</strong> {filterMode === 'ALL' ? 'All Trade Customers' : 'Selected Account'}</span>
            <span><strong>Total Receivables:</strong> ${(Number(grandTotals?.totalDue) || 0).toFixed(2)} USD</span>
          </div>

          {/* Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', marginBottom: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #000' }}>
                <th style={{ padding: '6px 4px', textAlign: 'left' }}>Customer</th>
                <th style={{ padding: '6px 4px', textAlign: 'right' }}>0–30 Days</th>
                <th style={{ padding: '6px 4px', textAlign: 'right' }}>31–60 Days</th>
                <th style={{ padding: '6px 4px', textAlign: 'right' }}>61–90 Days</th>
                <th style={{ padding: '6px 4px', textAlign: 'right' }}>90+ Days</th>
                <th style={{ padding: '6px 4px', textAlign: 'right' }}>Total Due</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '5px 4px', fontWeight: 'bold' }}>{r.customerName} ({r.customerId})</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', fontFamily: 'monospace' }}>${(Number(r.buckets?.current30) || 0).toFixed(2)}</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', fontFamily: 'monospace' }}>${(Number(r.buckets?.days31to60) || 0).toFixed(2)}</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', fontFamily: 'monospace' }}>${(Number(r.buckets?.days61to90) || 0).toFixed(2)}</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold', color: (Number(r.buckets?.over90) || 0) > 0 ? '#b91c1c' : '#000' }}>
                    ${(Number(r.buckets?.over90) || 0).toFixed(2)}
                  </td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold' }}>
                    ${(Number(r.buckets?.totalDue) || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid #000', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>
                <td style={{ padding: '6px 4px' }}>Grand Totals</td>
                <td style={{ padding: '6px 4px', textAlign: 'right', fontFamily: 'monospace' }}>${(Number(grandTotals?.current30) || 0).toFixed(2)}</td>
                <td style={{ padding: '6px 4px', textAlign: 'right', fontFamily: 'monospace' }}>${(Number(grandTotals?.days31to60) || 0).toFixed(2)}</td>
                <td style={{ padding: '6px 4px', textAlign: 'right', fontFamily: 'monospace' }}>${(Number(grandTotals?.days61to90) || 0).toFixed(2)}</td>
                <td style={{ padding: '6px 4px', textAlign: 'right', fontFamily: 'monospace', color: '#b91c1c' }}>${(Number(grandTotals?.over90) || 0).toFixed(2)}</td>
                <td style={{ padding: '6px 4px', textAlign: 'right', fontFamily: 'monospace', fontSize: '11px' }}>${(Number(grandTotals?.totalDue) || 0).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          {/* Signatures */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', paddingTop: '10px', borderTop: '1px solid #ddd', fontSize: '10px' }}>
            <div style={{ textAlign: 'center', width: '45%' }}>
              <div style={{ height: '35px' }} />
              <div style={{ borderTop: '1px dashed #000', paddingTop: '4px', fontWeight: 'bold' }}>
                Credit Controller Signature
              </div>
            </div>
            <div style={{ textAlign: 'center', width: '45%' }}>
              <div style={{ height: '35px' }} />
              <div style={{ borderTop: '1px dashed #000', paddingTop: '4px', fontWeight: 'bold' }}>
                Finance Director Signature
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '8px', color: '#666', borderTop: '1px solid #eee', paddingTop: '4px' }}>
            Generated by Vanguard ERP • Southern Olive and Oil Products S.A.R.L.
          </div>
        </div>
      </div>

    </div>
  );
}
