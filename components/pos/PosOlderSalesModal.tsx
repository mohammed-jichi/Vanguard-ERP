'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Search,
  Printer,
  History,
  CheckCircle2,
  Calendar,
  User,
  Hash,
  Receipt,
  Eye,
  FileText,
} from 'lucide-react';
import { POS_EXCHANGE_RATE } from '@/lib/pos/posStateEngine';

interface HistoricalInvoiceItem {
  name: string;
  qty: number;
  priceUsd: number;
  totalUsd: number;
}

interface HistoricalInvoice {
  id: string;
  invoiceNo: string;
  timestamp: string;
  customerName: string;
  tenderMethod: string;
  cashierName: string;
  itemsCount: number;
  totalUsd: number;
  totalLbp: number;
  items: HistoricalInvoiceItem[];
}

interface PosOlderSalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReprint?: (invoice: HistoricalInvoice) => void;
}

export default function PosOlderSalesModal({
  isOpen,
  onClose,
  onReprint,
}: PosOlderSalesModalProps) {
  const [invoiceQuery, setInvoiceQuery] = useState<string>('');
  const [customerQuery, setCustomerQuery] = useState<string>('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('INV-2026-0848');
  const [notification, setNotification] = useState<string | null>(null);

  // Mock historical transactions
  const historicalInvoices: HistoricalInvoice[] = useMemo(
    () => [
      {
        id: '1',
        invoiceNo: 'INV-2026-0848',
        timestamp: '15:42:18',
        customerName: 'General Retail Cash Walk-in',
        tenderMethod: 'Cash USD',
        cashierName: 'Maya Khoury',
        itemsCount: 3,
        totalUsd: 122.0,
        totalLbp: 122.0 * POS_EXCHANGE_RATE,
        items: [
          { name: '17.5L Extra Virgin Olive Oil Tin', qty: 1, priceUsd: 110.0, totalUsd: 110.0 },
          { name: 'Pure Pomegranate Molasses 500ml', qty: 2, priceUsd: 6.0, totalUsd: 12.0 },
        ],
      },
      {
        id: '2',
        invoiceNo: 'INV-2026-0847',
        timestamp: '15:15:04',
        customerName: 'Al-Bustan Supermarket Co.',
        tenderMethod: 'Credit on Account',
        cashierName: 'Maya Khoury',
        itemsCount: 5,
        totalUsd: 450.0,
        totalLbp: 450.0 * POS_EXCHANGE_RATE,
        items: [
          { name: '17.5L Extra Virgin Olive Oil Tin', qty: 4, priceUsd: 110.0, totalUsd: 440.0 },
          { name: 'Cold-Pressed Glass Bottle 750ml', qty: 1, priceUsd: 10.0, totalUsd: 10.0 },
        ],
      },
      {
        id: '3',
        invoiceNo: 'INV-2026-0846',
        timestamp: '14:50:22',
        customerName: 'Karim Haddad',
        tenderMethod: 'Credit Card USD',
        cashierName: 'Ahmad Zein',
        itemsCount: 2,
        totalUsd: 26.5,
        totalLbp: 26.5 * POS_EXCHANGE_RATE,
        items: [
          { name: 'Cold-Pressed Glass Bottle 750ml', qty: 2, priceUsd: 10.0, totalUsd: 20.0 },
          { name: 'Pure Apple Cider Vinegar 500ml', qty: 1, priceUsd: 6.5, totalUsd: 6.5 },
        ],
      },
      {
        id: '4',
        invoiceNo: 'INV-2026-0845',
        timestamp: '14:18:50',
        customerName: 'Samir Mansour (Wholesale)',
        tenderMethod: 'Cash LBP',
        cashierName: 'Maya Khoury',
        itemsCount: 10,
        totalUsd: 1100.0,
        totalLbp: 98450000,
        items: [
          { name: '17.5L Extra Virgin Olive Oil Tin', qty: 10, priceUsd: 110.0, totalUsd: 1100.0 },
        ],
      },
      {
        id: '5',
        invoiceNo: 'INV-2026-0844',
        timestamp: '13:55:10',
        customerName: 'General Retail Cash Walk-in',
        tenderMethod: 'Cash USD',
        cashierName: 'Hadi (Admin)',
        itemsCount: 1,
        totalUsd: 14.0,
        totalLbp: 14.0 * POS_EXCHANGE_RATE,
        items: [
          { name: 'Natural Laurel Olive Soap Bar (6-pack)', qty: 1, priceUsd: 14.0, totalUsd: 14.0 },
        ],
      },
    ],
    []
  );

  // Filter logic
  const filteredInvoices = useMemo(() => {
    return historicalInvoices.filter((inv) => {
      const matchInv = inv.invoiceNo.toLowerCase().includes(invoiceQuery.trim().toLowerCase());
      const matchCust = inv.customerName.toLowerCase().includes(customerQuery.trim().toLowerCase());
      return matchInv && matchCust;
    });
  }, [historicalInvoices, invoiceQuery, customerQuery]);

  const selectedInvoice = useMemo(() => {
    return historicalInvoices.find((i) => i.invoiceNo === selectedInvoiceId) || filteredInvoices[0] || null;
  }, [historicalInvoices, selectedInvoiceId, filteredInvoices]);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'F1' && selectedInvoice) {
        e.preventDefault();
        notify(`Reprinting duplicate receipt for ${selectedInvoice.invoiceNo}...`);
        onReprint?.(selectedInvoice);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onReprint, selectedInvoice]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in select-none font-sans">
      <div className="bg-[#141822] border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[92vh] text-slate-100 overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#1b2230] border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500 text-slate-950 shadow-md">
              <History className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-mono font-black text-purple-400 tracking-wide uppercase">
                  HISTORICAL SALES & INVOICE REPRINT VIEWER
                </h2>
                <span className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-600/70 text-[10px] font-mono text-purple-300 font-bold">
                  CTRL + F6
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspect past customer transactions, line item breakdowns, and issue official duplicate receipts.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className="bg-emerald-950/90 border-b border-emerald-500 px-6 py-2 text-xs font-mono text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{notification}</span>
          </div>
        )}

        {/* Dual Search Input Bar */}
        <div className="px-6 py-3 bg-[#181e2b] border-b border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
          <div className="relative flex items-center">
            <Hash className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by Invoice # (e.g. 0848)..."
              value={invoiceQuery}
              onChange={(e) => setInvoiceQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#0e1219] border border-slate-700 rounded-lg text-slate-200 focus:border-purple-400 focus:outline-none"
            />
          </div>

          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by Customer Name (e.g. Al-Bustan)..."
              value={customerQuery}
              onChange={(e) => setCustomerQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#0e1219] border border-slate-700 rounded-lg text-slate-200 focus:border-purple-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Split View: Left List | Right Preview */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {/* Invoices List Table */}
          <div className="md:col-span-7 overflow-y-auto max-h-[58vh] p-4">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 pb-2">
                  <th className="pb-2">Invoice #</th>
                  <th className="pb-2">Time</th>
                  <th className="pb-2">Customer / Tender</th>
                  <th className="pb-2 text-right">Total ($ USD)</th>
                  <th className="pb-2 text-right">Total (LBP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredInvoices.map((inv) => {
                  const isSelected = selectedInvoice?.invoiceNo === inv.invoiceNo;
                  return (
                    <tr
                      key={inv.invoiceNo}
                      onClick={() => setSelectedInvoiceId(inv.invoiceNo)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-purple-950/60 text-purple-200 border-l-4 border-purple-500'
                          : 'hover:bg-slate-800/50 text-slate-300'
                      }`}
                    >
                      <td className="py-2.5 px-2 font-bold text-slate-100">{inv.invoiceNo}</td>
                      <td className="py-2.5 px-2 text-slate-400">{inv.timestamp}</td>
                      <td className="py-2.5 px-2">
                        <span className="font-bold block text-slate-200">{inv.customerName}</span>
                        <span className="text-[10px] text-amber-400">{inv.tenderMethod} • {inv.cashierName}</span>
                      </td>
                      <td className="py-2.5 px-2 text-right font-bold text-emerald-400">
                        ${inv.totalUsd.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-2 text-right text-amber-400 font-bold">
                        {inv.totalLbp.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No invoices found matching query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Selected Invoice Receipt Preview */}
          <div className="md:col-span-5 bg-[#10141d] p-5 overflow-y-auto max-h-[58vh] flex flex-col justify-between">
            {selectedInvoice ? (
              <div className="space-y-4 font-mono text-xs">
                {/* Thermal Preview Paper Header */}
                <div className="p-4 bg-[#181e2b] border border-slate-700 rounded-xl space-y-2">
                  <div className="text-center pb-2 border-b border-dashed border-slate-700">
                    <span className="font-bold text-amber-400 text-sm block">VANGUARD FOODS S.A.R.L</span>
                    <span className="text-[10px] text-slate-400 block">Choueifat Industrial Zone, Lebanon</span>
                    <span className="text-[10px] text-slate-400 block">Tel: +961 5 430 110 | MOF: 3192081</span>
                  </div>

                  <div className="text-[11px] space-y-0.5 text-slate-300 pt-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Invoice:</span>
                      <span className="font-bold text-slate-100">{selectedInvoice.invoiceNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Date/Time:</span>
                      <span>{selectedInvoice.timestamp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cashier:</span>
                      <span>{selectedInvoice.cashierName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Customer:</span>
                      <span className="text-amber-300 font-bold truncate max-w-[160px]">{selectedInvoice.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tender:</span>
                      <span className="text-emerald-400 font-bold">{selectedInvoice.tenderMethod}</span>
                    </div>
                  </div>

                  {/* Line items */}
                  <div className="pt-2 border-t border-dashed border-slate-700 space-y-1.5">
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
                      <span>Item</span>
                      <span>Qty x Price</span>
                      <span>Total</span>
                    </div>
                    {selectedInvoice.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-baseline text-[11px]">
                        <span className="text-slate-200 truncate max-w-[140px]">{item.name}</span>
                        <span className="text-slate-400">{item.qty} x ${item.priceUsd.toFixed(2)}</span>
                        <span className="font-bold text-slate-100">${item.totalUsd.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Totals */}
                  <div className="pt-2 border-t border-slate-700 space-y-1">
                    <div className="flex justify-between text-xs font-black">
                      <span className="text-slate-300">TOTAL USD:</span>
                      <span className="text-emerald-400 text-sm">${selectedInvoice.totalUsd.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-black">
                      <span className="text-slate-300">TOTAL LBP (89,500):</span>
                      <span className="text-amber-400">{selectedInvoice.totalLbp.toLocaleString()} LBP</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 font-mono text-xs">
                Select an invoice from the table to preview details.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#11141b] border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200">F1</kbd> Reprint Selected
            </span>
            <span className="mx-2">•</span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200">ESC</kbd> Close
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={!selectedInvoice}
              onClick={() => {
                if (selectedInvoice) {
                  notify(`Reprinting duplicate receipt for ${selectedInvoice.invoiceNo}...`);
                  onReprint?.(selectedInvoice);
                }
              }}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              <Printer className="w-4 h-4" />
              <span>Reprint Invoice (F1)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-100 font-mono text-xs font-bold transition-all active:scale-95"
            >
              Close (Esc)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
