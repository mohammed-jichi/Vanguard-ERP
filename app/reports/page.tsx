'use client';

import React, { useState } from 'react';
import MasterReportContainer from '@/components/modules/reports/MasterReportContainer';
import {
  REPORT_MODES,
  DATE_PERIODS,
  CATEGORIES_LIST,
  DIVISIONS_LIST,
  GROUPS_LIST,
  SALESMEN_LIST,
  INVOICES_TYPES,
} from '@/components/modules/reports/SalesByItemsReport';

export default function ReportsPage() {
  const [reportMode, setReportMode] = useState<string>('Sales by Items');
  const [period, setPeriod] = useState<string>('This Month');
  const [dateDisplay, setDateDisplay] = useState<string>('Aug, 2026');
  const [branch, setBranch] = useState<string>('All Branches');
  const [category, setCategory] = useState<string>('All Categories');
  const [division, setDivision] = useState<string>('All Divisions');
  const [group, setGroup] = useState<string>('All Groups');
  const [salesman, setSalesman] = useState<string>('All Salesmen');
  const [invoicesType, setInvoicesType] = useState<string>('All Invoices');
  const [removeGrouping, setRemoveGrouping] = useState<boolean>(false);
  const [showRemark, setShowRemark] = useState<boolean>(false);

  // Dynamic Filters Component passed to Master Container
  const filtersContent = (
    <div className="space-y-2.5">
      {/* Row 1: Mode Selector */}
      <div>
        <select
          value={reportMode}
          onChange={(e) => setReportMode(e.target.value)}
          className="w-full md:w-80 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none focus:border-[#1a629b]"
        >
          {REPORT_MODES.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* Row 2: Date Period & Display */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 min-w-[150px]"
        >
          {DATE_PERIODS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <input
          type="text"
          value={dateDisplay}
          onChange={(e) => setDateDisplay(e.target.value)}
          className="border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 min-w-[180px]"
        />
      </div>

      {/* Row 3: Conditional Filters based on Mode */}
      {reportMode === 'Sales by Items' && (
        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Branch</label>
              <select value={branch} onChange={(e) => setBranch(e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1 text-xs">
                <option value="All Branches">All Branches</option>
                <option value="choueifat">فرع الشويفات</option>
                <option value="beirut">فرع بيروت</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1 text-xs">
                {CATEGORIES_LIST.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Division</label>
              <select value={division} onChange={(e) => setDivision(e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1 text-xs">
                {DIVISIONS_LIST.map((d) => (<option key={d} value={d}>{d}</option>))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-1">
            <div className="w-full md:w-64">
              <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Group</label>
              <select value={group} onChange={(e) => setGroup(e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1 text-xs">
                {GROUPS_LIST.map((g) => (<option key={g} value={g}>{g}</option>))}
              </select>
            </div>
            <div className="flex items-center gap-4 pt-4 text-xs font-semibold text-slate-700">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={removeGrouping} onChange={(e) => setRemoveGrouping(e.target.checked)} className="rounded text-[#1a629b]" />
                <span>Remove Grouping</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={showRemark} onChange={(e) => setShowRemark(e.target.checked)} className="rounded text-[#1a629b]" />
                <span>Show Remark</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: Sales by Salesman */}
      {reportMode === 'Sales by Item by Salesman' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Salesman</label>
            <select value={salesman} onChange={(e) => setSalesman(e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1 text-xs">
              {SALESMEN_LIST.map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Invoices</label>
            <select value={invoicesType} onChange={(e) => setInvoicesType(e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1 text-xs">
              {INVOICES_TYPES.map((i) => (<option key={i} value={i}>{i}</option>))}
            </select>
          </div>
          <div className="flex items-center gap-1.5 pt-4 text-xs font-semibold text-slate-700">
            <input type="checkbox" checked={showRemark} onChange={(e) => setShowRemark(e.target.checked)} className="rounded text-[#1a629b]" />
            <span>Show Remark</span>
          </div>
        </div>
      )}

      {/* Mode 5: Sales by Customer */}
      {reportMode === 'Sales by Items by Customer' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Branch</label>
            <select value={branch} onChange={(e) => setBranch(e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1 text-xs">
              <option value="All Branches">All Branches</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Invoices</label>
            <select value={invoicesType} onChange={(e) => setInvoicesType(e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1 text-xs">
              {INVOICES_TYPES.map((i) => (<option key={i} value={i}>{i}</option>))}
            </select>
          </div>
        </div>
      )}

      {/* Simplified Modes */}
      {['Sales by Items (Group by Mode)', 'Sales By Items (service items only)', 'Sales by Item by Size by Color'].includes(reportMode) && (
        <div className="w-full md:w-64 pt-1">
          <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Branch</label>
          <select value={branch} onChange={(e) => setBranch(e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1 text-xs">
            <option value="All Branches">All Branches</option>
          </select>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] p-4 md:p-6 font-sans">
      
      {/* 1. Header Navigation */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-[20px] font-bold text-[#1e293b]">Sales Reports</h1>
          <nav className="flex items-center gap-1.5 text-xs text-[#527a9e] mt-0.5 font-medium">
            <span>Home</span>
            <span className="text-slate-400">/</span>
            <span>Sales Reports</span>
            <span className="text-slate-400">/</span>
            <span className="text-[#1a629b] font-bold">{reportMode}</span>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs">
            Close Report
          </button>
          <button type="button" className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 transition-colors shadow-2xs">
            Return to Hub
          </button>
        </div>
      </div>

      {/* 2. Unified Master Report Component */}
      <MasterReportContainer
        reportTitle={reportMode}
        reportId="REP_S_00191"
        dateDisplay="29-Aug-26"
        totalPages={5}
        currentPage={1}
        filtersComponent={filtersContent}
      >
        {/* Table Matrix Content */}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black text-black font-bold normal-case text-[11px]">
              <th className="py-[2px] px-1 normal-case w-1/2">description</th>
              <th className="py-[2px] px-1 normal-case text-center">barcode</th>
              <th className="py-[2px] px-1 normal-case text-right">qty</th>
              <th className="py-[2px] px-1 normal-case text-right">total amount</th>
            </tr>
          </thead>
          <tbody className="text-[11px] leading-tight">
            <tr>
              <td colSpan={4} className="py-1 font-bold">Branch: Southern Olive Oil Products S.A.R.L (Choueifat)</td>
            </tr>
            <tr>
              <td colSpan={4} className="py-0.5 font-bold pl-2 border-b border-dashed border-slate-300">Division: مقطرات ومربيات مفرق</td>
            </tr>
            <tr>
              <td colSpan={4} className="py-0.5 font-semibold pl-4">Group: مقطرات مفرق 500مل</td>
            </tr>
            <tr>
              <td className="py-[2px] px-1 pl-6">خل ابيض 500مل</td>
              <td className="py-[2px] px-1 text-center font-mono">5281234123528</td>
              <td className="py-[2px] px-1 text-right">3.00</td>
              <td className="py-[2px] px-1 text-right">210,000.00</td>
            </tr>
            <tr>
              <td className="py-[2px] px-1 pl-6">دبس رمان 500 مل</td>
              <td className="py-[2px] px-1 text-center font-mono">5281234123979</td>
              <td className="py-[2px] px-1 text-right">4.00</td>
              <td className="py-[2px] px-1 text-right">480,000.00</td>
            </tr>
            <tr className="border-t border-slate-200 font-bold">
              <td colSpan={2} className="py-[2px] px-1 pl-4">Total by Group: مقطرات مفرق 500مل</td>
              <td className="py-[2px] px-1 text-right">7.00</td>
              <td className="py-[2px] px-1 text-right">690,000.00</td>
            </tr>
          </tbody>
        </table>
      </MasterReportContainer>

    </div>
  );
}
