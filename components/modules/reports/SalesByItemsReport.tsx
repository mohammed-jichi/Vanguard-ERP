'use client';

import React, { useState } from 'react';

export const REPORT_MODES = [
  'Sales by Items',
  'Sales by Items (Group by Mode)',
  'Sales by Item by Salesman',
  'Sales By Items (service items only)',
  'Sales by Items by Customer',
  'Sales by Item by Size by Color',
] as const;

export const DATE_PERIODS = [
  'Today',
  'Yesterday',
  'This Month',
  'Last Month',
  '1st Quarter',
  '2nd Quarter',
  '3rd Quarter',
  '4th Quarter',
  'This Year',
  'Last Year',
  'Date Range',
  'EOD Date',
  'Year',
] as const;

export const SALESMEN_LIST = [
  'All Salesmen',
  'Cashier N2',
  'Cashier NK',
  'Cashier R',
  'Hiba Aloulou',
  'HUSSEIN',
  'Hussien Mahdi',
  'Mahdi',
  'Nour Yazbeck',
  'Ricky',
] as const;

export const INVOICES_TYPES = [
  'All Invoices',
  'Inventory Invoices',
  'POS Invoices',
  'Training Invoices',
] as const;

export const CATEGORIES_LIST = [
  'All Categories',
  'Raw Materials',
  'جملة',
  'عروض',
  'مفرق',
  'مواد اولية',
] as const;

export const DIVISIONS_LIST = [
  'All Divisions',
  'مقطرات ومدبسات مفرق',
  'مونة بلدية مفرق',
  'زيتون مفرق',
  'كبيس ومخللات مفرق',
  'مربيات مفرق',
  'عسل مفرق',
  'فواكه مجففه مفرق',
  'مقطرات ومدبسات جملة',
  'مونة بلدية جملة',
  'زيتون جملة',
  'كبيس ومخللات جملة',
  'عسل جملة',
  'كيلو جملة',
  'فواكه مجففه جملة',
  'مربيات جملة',
  'بهارات مفرق',
  'براد',
  'مجففات',
  'مقرمشات',
  'زيوت مفرق',
  'محمصة مفرق',
  'زيوت جملة',
  'مكعزلة مفرق',
  'مكعزلة جملة',
  'عروض',
  'كيلو مفرق',
  'مرطبان',
  'Jars',
  'Bottles',
  'Sprout',
  'Demijohns',
  'SERVICES',
  'Main Materials',
  'Assembled Items',
  'Plastic',
] as const;

export const GROUPS_LIST = [
  'All Groups',
  'حبوب فلت',
  'زيت زيتون خضير مفرق',
  'زيت زيتون فرجين مفرق',
  'زيت اوكراني دوار الشمس مفرق',
  'مقطرات مفرق 250مل',
  'تمور',
  'زيتون اخضر مفرق',
  'كبيس ومخللات مفرق',
  'مربيات مفرق',
  'عسل مفرق',
  'فواكه مجففه مفرق',
  'زيت اوكراني دوار الشمس جملة',
  'مونة بلدية جملة',
  'زيتون جملة',
  'كبيس ومخللات جملة',
  'عسل جملة',
  'كيلو جملة',
  'فواكه مجففه جملة',
  'مربيات جملة',
  'مرشة بهار',
  'علبة بهارات',
  'بهارات غ',
  'مرتديلا',
  'جبنة مطبوخة',
  'علبة كبيرة',
  'علبة صغيرة',
  'أجبان و ألبان',
  'قلوبات مفرق',
  'مكعزلة بقر مفرق',
  'زيت زيتون خضير جملة',
  'زيت زيتون كورة جملة',
  'زيت زيتون فرجين جملة',
  'مدبسات مفرق 509',
  'زيتون اسود مفرق',
  'مكعزلة معزة مفرق',
  'معلبات أخرى',
  'مقطرات جملة',
  'مدبسات جملة',
  'بزورات مفرق',
  'عروض',
  'حبوب مكيسة',
  'مقطرات مفرق 500مل',
  'مدبسات مفرق 510',
  'مقطرات 1 ليتر',
  'رف',
  '509 مرطبان',
  'كيلو مفرق',
  'مرطبان 510',
  'مرطبان 507',
  'JAR',
  'Bottles',
  'Demijohn',
  'SERVICES',
  'Main materials',
  'Plastic Gallon',
  'Assembled Items Per 1',
  'Plastic Bottles',
  'CLASSIC-C/R',
  'CLASSIC-R/R',
] as const;

export default function SalesByItemsReport() {
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

  // Common high-contrast input class (SOLID & CRISP - NO GHOSTING)
  const solidInputClass = "bg-white border-2 border-slate-400 text-slate-900 font-semibold text-xs rounded px-2.5 py-1.5 focus:border-[#1a629b] focus:outline-none shadow-2xs opacity-100";

  return (
    <div className="w-full font-sans text-slate-800">
      
      {/* 1. SOLID, HIGH-CONTRAST FILTER CARD */}
      <div className="bg-white rounded-xl border-2 border-slate-300 shadow-sm p-4 mb-4 print:hidden">
        
        <div className="flex items-center gap-2 mb-3 border-b border-slate-200 pb-2">
          <div className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center text-slate-700">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Filters</div>
            <div className="text-[11px] text-[#1a629b] font-bold">{reportMode}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Filter Inputs Area */}
          <div className="md:col-span-9 space-y-2.5">
            
            {/* Mode Selector */}
            <div>
              <select
                value={reportMode}
                onChange={(e) => setReportMode(e.target.value)}
                className={`w-full md:w-80 ${solidInputClass}`}
              >
                {REPORT_MODES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Date Row */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className={`min-w-[150px] ${solidInputClass}`}
              >
                {DATE_PERIODS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <input
                type="text"
                value={dateDisplay}
                onChange={(e) => setDateDisplay(e.target.value)}
                className={`min-w-[180px] ${solidInputClass}`}
              />
            </div>

            {/* Conditional Filter Fields */}
            {reportMode === 'Sales by Items' && (
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 mb-0.5">Branch</label>
                    <select value={branch} onChange={(e) => setBranch(e.target.value)} className={`w-full ${solidInputClass}`}>
                      <option value="All Branches">All Branches</option>
                      <option value="choueifat">فرع الشويفات</option>
                      <option value="beirut">فرع بيروت</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 mb-0.5">Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className={`w-full ${solidInputClass}`}>
                      {CATEGORIES_LIST.map((c) => (<option key={c} value={c}>{c}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 mb-0.5">Division</label>
                    <select value={division} onChange={(e) => setDivision(e.target.value)} className={`w-full ${solidInputClass}`}>
                      {DIVISIONS_LIST.map((d) => (<option key={d} value={d}>{d}</option>))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <div className="w-full md:w-64">
                    <label className="block text-[11px] font-bold text-slate-800 mb-0.5">Group</label>
                    <select value={group} onChange={(e) => setGroup(e.target.value)} className={`w-full ${solidInputClass}`}>
                      {GROUPS_LIST.map((g) => (<option key={g} value={g}>{g}</option>))}
                    </select>
                  </div>
                  <div className="flex items-center gap-4 pt-4 text-xs font-bold text-slate-900">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={removeGrouping} onChange={(e) => setRemoveGrouping(e.target.checked)} className="w-4 h-4 rounded text-[#1a629b]" />
                      <span>Remove Grouping</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={showRemark} onChange={(e) => setShowRemark(e.target.checked)} className="w-4 h-4 rounded text-[#1a629b]" />
                      <span>Show Remark</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Salesman Mode */}
            {reportMode === 'Sales by Item by Salesman' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 mb-0.5">Salesman</label>
                  <select value={salesman} onChange={(e) => setSalesman(e.target.value)} className={`w-full ${solidInputClass}`}>
                    {SALESMEN_LIST.map((s) => (<option key={s} value={s}>{s}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 mb-0.5">Invoices</label>
                  <select value={invoicesType} onChange={(e) => setInvoicesType(e.target.value)} className={`w-full ${solidInputClass}`}>
                    {INVOICES_TYPES.map((i) => (<option key={i} value={i}>{i}</option>))}
                  </select>
                </div>
                <div className="flex items-center gap-1.5 pt-4 text-xs font-bold text-slate-900">
                  <input type="checkbox" checked={showRemark} onChange={(e) => setShowRemark(e.target.checked)} className="w-4 h-4 rounded text-[#1a629b]" />
                  <span>Show Remark</span>
                </div>
              </div>
            )}

          </div>

          {/* Action Buttons */}
          <div className="md:col-span-3 flex flex-col gap-2 justify-start pt-1">
            <button type="button" className="w-full py-2 px-3 bg-[#2d3748] hover:bg-[#1a202c] text-white text-xs font-bold rounded shadow-sm">
              Filter Report
            </button>
            <button type="button" className="w-full py-2 px-3 bg-[#4a2626] hover:bg-[#341818] text-white text-xs font-bold rounded shadow-sm">
              Reset Filters
            </button>
          </div>

        </div>
      </div>

      {/* 2. COMPACT TOOLBAR */}
      <div className="flex items-center justify-between bg-white border border-slate-300 rounded-t-xl px-4 py-2 print:hidden">
        <h3 className="text-xs font-bold text-slate-900">{reportMode}</h3>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => window.print()} className="px-3 py-1 bg-[#2d3748] text-white text-xs font-semibold rounded shadow-sm">
            Print Report
          </button>
          <button type="button" className="px-3 py-1 bg-[#2d3748] text-white text-xs font-semibold rounded shadow-sm">
            Export Report
          </button>
        </div>
      </div>

      {/* 3. STRICT VANGUARD A4 PRINT CONTAINER (NORMAL-CASE & CONDENSED) */}
      <div className="w-full overflow-x-auto flex justify-center bg-slate-200/60 p-4 md:p-6 rounded-b-xl">
        <div className="w-[794px] min-h-[1123px] page-break-after-always relative bg-white p-8 shadow-md text-[11px] font-['Arial','Helvetica',sans-serif] leading-none text-black select-none">
          
          {/* Header Metadata */}
          <div className="flex justify-between items-start mb-3 border-b border-slate-200 pb-2">
            <div>
              <div className="text-[#1a629b] font-bold text-[13px] tracking-tight">
                Southern Olive Oil Products S.A.R.L
              </div>
              <div className="text-[10px] text-slate-500 mt-1">{dateDisplay}</div>
            </div>

            <div className="text-center">
              <div className="font-bold text-xs">{reportMode}</div>
              <div className="text-[10px] text-slate-600 mt-0.5">Year: 2026 - Month: 8</div>
            </div>

            <div className="text-right text-[10px] text-slate-500 font-mono">
              Page 1 of 5
            </div>
          </div>

          {/* Table with STRICT NORMAL-CASE HEADERS */}
          <table className="w-full text-left border-collapse mt-2">
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
                <td colSpan={4} className="py-0.5 font-bold pl-2 border-b border-dashed border-slate-300">
                  Division: {division}
                </td>
              </tr>
              <tr>
                <td colSpan={4} className="py-0.5 font-semibold pl-4">
                  Group: {group}
                </td>
              </tr>

              <tr>
                <td className="py-[2px] px-1 pl-6">خل ابيض 500مل</td>
                <td className="py-[2px] px-1 text-center font-mono">5281234123528</td>
                <td className="py-[2px] px-1 text-right">3.00</td>
                <td className="py-[2px] px-1 text-right">210,000.00</td>
              </tr>
              <tr>
                <td className="py-[2px] px-1 pl-6">ماء ورد 500مل</td>
                <td className="py-[2px] px-1 text-center font-mono">5281234123597</td>
                <td className="py-[2px] px-1 text-right">1.00</td>
                <td className="py-[2px] px-1 text-right">90,000.00</td>
              </tr>
              <tr>
                <td className="py-[2px] px-1 pl-6">دبس رمان 500 مل</td>
                <td className="py-[2px] px-1 text-center font-mono">5281234123979</td>
                <td className="py-[2px] px-1 text-right">4.00</td>
                <td className="py-[2px] px-1 text-right">480,000.00</td>
              </tr>

              <tr className="border-t border-slate-200 font-bold">
                <td colSpan={2} className="py-[2px] px-1 pl-4">Total by Group: {group}</td>
                <td className="py-[2px] px-1 text-right">8.00</td>
                <td className="py-[2px] px-1 text-right">780,000.00</td>
              </tr>
            </tbody>
          </table>

          {/* Footer */}
          <div className="absolute bottom-4 left-8 right-8 pt-2 border-t border-slate-300 flex justify-between items-center text-[9px] text-slate-500 font-sans">
            <span>REP_S_00191</span>
            <span>Copyright © 2026 Vanguard ERP. All Rights Reserved.</span>
            <span>www.vanguarderp.com</span>
          </div>

        </div>
      </div>

    </div>
  );
}
