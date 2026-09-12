'use client';

import React, { useState } from 'react';
import { Printer, Download, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface VoidRecord {
  id: string;
  date: string;
  orderDate: string;
  server: string;
  invoice: string;
  description: string;
  qty: number;
  valueLbp: number;
  reason: string;
}

const VOID_RECORDS: VoidRecord[] = [
  {
    id: '1',
    date: '22-Aug-2026 5:31 PM',
    orderDate: '22-Aug-2026 5:31 PM',
    server: 'Hiba Aloulou',
    invoice: '103225',
    description: 'Special Promo - Extra Virgin Olive Oil 17.5L',
    qty: 1.0,
    valueLbp: 9000000.0,
    reason: 'Count Error',
  },
  {
    id: '2',
    date: '13-Aug-2026 6:58 PM',
    orderDate: '13-Aug-2026 6:58 PM',
    server: 'Hiba Aloulou',
    invoice: '103125',
    description: 'Local Olive Oil 1000ml Bottle',
    qty: 1.0,
    valueLbp: 990000.0,
    reason: 'Count Error',
  },
  {
    id: '3',
    date: '13-Aug-2026 6:58 PM',
    orderDate: '13-Aug-2026 6:58 PM',
    server: 'Hiba Aloulou',
    invoice: '103125',
    description: 'Local Bee Pollen 360g',
    qty: 1.0,
    valueLbp: 900000.0,
    reason: 'Count Error',
  },
  {
    id: '4',
    date: '15-Aug-2026 2:10 PM',
    orderDate: '15-Aug-2026 2:10 PM',
    server: 'Ahmad K.',
    invoice: '103140',
    description: 'Pressed Green Olives 1 Kg',
    qty: 1.0,
    valueLbp: 450000.0,
    reason: 'Item Exchange',
  },
  {
    id: '5',
    date: '14-Aug-2026 11:20 AM',
    orderDate: '14-Aug-2026 11:20 AM',
    server: 'Samer R.',
    invoice: '103110',
    description: 'Apple Cider Vinegar 5L',
    qty: 2.0,
    valueLbp: 2722500.0,
    reason: 'Barcode Error',
  },
];

interface SummaryOfVoidsTemplateProps {
  hideToolbar?: boolean;
  dynamicPeriodText?: string;
  executionDate?: string;
  fromDate?: string;
  toDate?: string;
}

export const SummaryOfVoidsTemplate: React.FC<SummaryOfVoidsTemplateProps> = ({
  hideToolbar = true,
  dynamicPeriodText,
  executionDate = '06-Sep-2026',
  fromDate = '01-Aug-2026',
  toDate = '27-Aug-2026',
}) => {
  const [period, setPeriod] = useState('This Month');
  const [branch, setBranch] = useState('All Branches');
  const [zoomLevel, setZoomLevel] = useState(1);

  const totalVoidsCount = VOID_RECORDS.length;
  const totalQty = VOID_RECORDS.reduce((sum, r) => sum + r.qty, 0);
  const totalValueLbp = VOID_RECORDS.reduce((sum, r) => sum + r.valueLbp, 0);

  const handlePrint = () => window.print();

  const handleExportCSV = () => {
    let csv = 'Date & Time,Order Date,Server,Invoice #,Description,Qty,Value (LBP),Reason\n';
    VOID_RECORDS.forEach((r) => {
      csv += `"${r.date}","${r.orderDate}","${r.server}","${r.invoice}","${r.description.replace(/"/g, '""')}",${r.qty},${r.valueLbp},"${r.reason}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Vanguard_Summary_Of_Voids_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="w-full font-sans text-slate-800">
      {!hideToolbar && (
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4 print:hidden">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border border-slate-400 rounded p-1.5 text-[13px] bg-white text-black font-bold focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="Today">Today</option>
            <option value="Yesterday">Yesterday</option>
            <option value="This Month">This Month</option>
            <option value="Last Month">Last Month</option>
            <option value="This Year">This Year</option>
          </select>

          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="border border-slate-400 rounded p-1.5 text-[13px] bg-white text-black font-bold focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="Main Branch">Main Branch (الفرع الرئيسي)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoomLevel((prev) => Math.min(prev + 0.1, 1.5))}
            className="p-1.5 border border-slate-300 rounded bg-white hover:bg-slate-100 text-slate-700"
            title="Zoom in"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={() => setZoomLevel((prev) => Math.max(prev - 0.1, 0.7))}
            className="p-1.5 border border-slate-300 rounded bg-white hover:bg-slate-100 text-slate-700"
            title="Zoom out"
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold transition-colors"
          >
            <Download size={13} />
            <span>CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#195a96] hover:bg-[#124b77] text-white rounded text-xs font-bold transition-colors"
          >
            <Printer size={13} />
            <span>Print</span>
          </button>
        </div>
      </div>
      )}

      {/* REPORT PAPER CONTAINER */}
      <div
        className="w-full bg-white border border-slate-200 rounded-xl p-6 shadow-sm overflow-x-auto print:border-none print:shadow-none print:p-0"
        style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
      >
        {/* Header Section */}
        <div className="flex justify-between items-start mb-2">
          <div className="text-[#195a96] font-bold text-sm">
            Southern Olive Oil Products S.A.R.L
          </div>
          <div className="text-right text-xs text-slate-500 font-mono">
            Prepared By: Operations Audit
          </div>
        </div>

        <div className="text-center font-bold text-base text-slate-900 mb-3">
          Summary of voids
        </div>

        <div className="flex justify-between items-center text-xs font-mono border-b border-black pb-1.5 text-slate-700 mb-3">
          <div>{executionDate}</div>
          <div className="flex gap-8">
            <span>{dynamicPeriodText || "From Date: 01-Aug-2026 To Date: 31-Aug-2026"}</span>
          </div>
          <div>Page 1 of 1</div>
        </div>

        {/* Branch Title */}
        <div className="text-xs font-bold underline mb-2 text-slate-900">
          Branch: Main Branch
        </div>

        {/* Native Table */}
        <table className="w-full table-fixed text-left border-collapse text-[11px]">
          <thead>
            <tr className="border-t-2 border-b-2 border-black font-bold text-black leading-tight bg-slate-50">
              <th className="py-2 px-1 normal-case w-[15%]">date & time</th>
              <th className="py-2 px-1 normal-case w-[15%]">order date</th>
              <th className="py-2 px-1 normal-case w-[12%]">server</th>
              <th className="py-2 px-1 normal-case w-[9%] text-center">invoice #</th>
              <th className="py-2 px-1 normal-case w-[27%]">description</th>
              <th className="py-2 px-1 normal-case w-[6%] text-center">qty</th>
              <th className="py-2 px-1 normal-case w-[11%] text-right">value (LBP)</th>
              <th className="py-2 px-1 normal-case w-[8%] pl-2">reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {VOID_RECORDS.map((rec) => (
              <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-1.5 px-1 font-mono text-slate-700">{rec.date}</td>
                <td className="py-1.5 px-1 font-mono text-slate-700">{rec.orderDate}</td>
                <td className="py-1.5 px-1 font-semibold text-slate-800">{rec.server}</td>
                <td className="py-1.5 px-1 font-mono text-center font-bold text-slate-900">{rec.invoice}</td>
                <td className="py-1.5 px-1 font-medium text-slate-900">{rec.description}</td>
                <td className="py-1.5 px-1 font-mono text-center font-bold">{rec.qty.toFixed(2)}</td>
                <td className="py-1.5 px-1 font-mono text-right font-bold text-red-700">
                  {rec.valueLbp.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-1.5 px-1 text-slate-600 pl-2 text-[10.5px]">{rec.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Summary */}
        <div className="mt-4 pt-2 border-t border-black flex justify-end">
          <div className="w-80 space-y-1 text-xs font-mono bg-slate-50 p-2.5 rounded border border-slate-200">
            <div className="flex justify-between font-bold text-slate-800">
              <span>Total Voids Count:</span>
              <span>{totalVoidsCount}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-800">
              <span>Total Qty Voided:</span>
              <span>{totalQty.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-black pt-1 font-bold text-sm text-red-700">
              <span>Total Value (LBP):</span>
              <span>{totalValueLbp.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-2 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500 font-mono">
          <span>Vanguard ERP Sales Control Engine</span>
          <span>REP_S_00183 - Summary of Voids</span>
          <span>Page 1 of 1</span>
        </div>
      </div>
    </div>
  );
};
