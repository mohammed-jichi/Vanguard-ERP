'use client';

import React, { useState } from 'react';

/* ========================================================================= */
/* 1. CONSTANTS & DATA MATRICES FROM OMEGA SYSTEM                            */
/* ========================================================================= */

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
  'علبة كبيرة.',
  'علبة صغيرة.',
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
  'زيتون اسود جملة',
  'زيتون اخضر جملة',
  'مكعزلة بقر جملة',
  'مكعزلة معزة جملة',
  'قلوبات ني',
  'حلوى',
  'عروض',
  'مراطبين عروض',
  'حبوب مكيسة',
  'مقطرات ومدبسات غالون',
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

export default function SalesByItemsMasterReport() {
  // State Machine for Dynamic Filters
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

  // Print Handler
  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };

  return (
    <div className="w-full bg-[#f8fafc] min-h-screen p-4 font-sans text-slate-800">
      
      {/* 1. TOP DYNAMIC FILTERS CARD */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-5 print:hidden">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">Filters</div>
            <div className="text-[11px] text-slate-500">{reportMode}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Left: Dynamic Form Controls (9 Columns) */}
          <div className="md:col-span-9 space-y-2.5">
            
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

            {/* Row 3 & 4: CONDITIONAL FILTERS BASED ON ACTIVE MODE */}
            
            {/* Mode 1: Standard 'Sales by Items' */}
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

            {/* Mode 3: 'Sales by Item by Salesman' */}
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

            {/* Mode 5: 'Sales by Items by Customer' */}
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

            {/* Modes 2, 4, 6: Simplified Branch Selector */}
            {['Sales by Items (Group by Mode)', 'Sales By Items (service items only)', 'Sales by Item by Size by Color'].includes(reportMode) && (
              <div className="w-full md:w-64 pt-1">
                <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Branch</label>
                <select value={branch} onChange={(e) => setBranch(e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1 text-xs">
                  <option value="All Branches">All Branches</option>
                </select>
              </div>
            )}

          </div>

          {/* Right: Action Buttons (3 Columns) */}
          <div className="md:col-span-3 flex flex-col gap-2 justify-start pt-1">
            <button type="button" className="w-full py-2 px-3 bg-[#2d3748] hover:bg-[#1a202c] text-white text-xs font-bold rounded shadow-sm transition-colors">
              Filter Report
            </button>
            <button type="button" className="w-full py-2 px-3 bg-[#4a2626] hover:bg-[#341818] text-white text-xs font-bold rounded shadow-sm transition-colors">
              Reset Filters
            </button>
          </div>

        </div>
      </div>

      {/* 2. REPORT ACTION BAR (Zoom, Print, Export) */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-t-xl px-4 py-2.5 print:hidden">
        <h3 className="text-xs font-bold text-slate-800">{reportMode}</h3>
        <div className="flex items-center gap-1.5">
          <button type="button" title="Zoom In" className="w-7 h-7 bg-[#2e6b38] hover:bg-[#22522a] text-white rounded flex items-center justify-center text-xs">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" /></svg>
          </button>
          <button type="button" title="Zoom Out" className="w-7 h-7 bg-[#2e6b38] hover:bg-[#22522a] text-white rounded flex items-center justify-center text-xs">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>
          </button>
          <button type="button" onClick={handlePrint} className="px-3 py-1 bg-[#2d3748] hover:bg-[#1a202c] text-white text-xs font-semibold rounded shadow-sm transition-colors">
            Print Report
          </button>
          <button type="button" className="px-3 py-1 bg-[#2d3748] hover:bg-[#1a202c] text-white text-xs font-semibold rounded shadow-sm transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {/* 3. STRICT OMEGA A4 PRINT CONTAINER */}
      <div className="w-full overflow-x-auto flex justify-center bg-slate-200/60 p-4 rounded-b-xl">
        <div className="w-[794px] min-h-[1123px] page-break-after-always relative bg-white p-8 shadow-md text-[11px] font-['Arial','Helvetica',sans-serif] leading-none text-black select-none">
          
          {/* Header Metadata */}
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="text-[#1a629b] font-bold text-xs">Southern Olive Oil Products S.A.R.L</div>
              <div className="text-[10px] text-slate-500 mt-1">29-Aug-26</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-xs">{reportMode}</div>
              <div className="text-[10px] text-slate-600 mt-0.5">Year: 2026 - Month: 8</div>
            </div>
            <div className="text-right text-[10px] text-slate-500">
              Page 1 of 5
            </div>
          </div>

          {/* DYNAMIC TABLE RENDERING BASED ON MODE */}
          
          {/* Mode 1 & 4: Standard / Service Table */}
          {['Sales by Items', 'Sales By Items (service items only)'].includes(reportMode) && (
            <div className="mt-4">
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
                  {/* Sample Items */}
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
                  {/* Subtotal */}
                  <tr className="border-t border-slate-200 font-bold">
                    <td colSpan={2} className="py-[2px] px-1 pl-4">Total by Group: مقطرات مفرق 500مل</td>
                    <td className="py-[2px] px-1 text-right">7.00</td>
                    <td className="py-[2px] px-1 text-right">690,000.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Mode 3: Sales by Salesman Table */}
          {reportMode === 'Sales by Item by Salesman' && (
            <div className="mt-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black text-black font-bold normal-case text-[11px]">
                    <th className="py-[2px] px-1 normal-case w-1/3">employee name</th>
                    <th className="py-[2px] px-1 normal-case text-right w-20">qty</th>
                    <th className="py-[2px] px-1 normal-case pl-4">description</th>
                  </tr>
                </thead>
                <tbody className="text-[11px] leading-tight">
                  <tr className="font-bold">
                    <td colSpan={3} className="py-1">Hiba Aloulou</td>
                  </tr>
                  <tr>
                    <td></td>
                    <td className="py-[2px] px-1 text-right font-semibold">70.0</td>
                    <td className="py-[2px] px-1 pl-4 font-semibold">Raw Materials</td>
                  </tr>
                  <tr>
                    <td></td>
                    <td className="py-[2px] px-1 text-right">24.0</td>
                    <td className="py-[2px] px-1 pl-4">P Blue Gallon 10 Liters</td>
                  </tr>
                  <tr>
                    <td></td>
                    <td className="py-[2px] px-1 text-right">46.0</td>
                    <td className="py-[2px] px-1 pl-4">P Blue Gallon 20 Litres</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Mode 6: Size by Color Table */}
          {reportMode === 'Sales by Item by Size by Color' && (
            <div className="mt-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black text-black font-bold normal-case text-[11px]">
                    <th className="py-[2px] px-1 normal-case w-1/2">product description</th>
                    <th className="py-[2px] px-1 normal-case text-right">qty</th>
                    <th className="py-[2px] px-1 normal-case text-center">size</th>
                    <th className="py-[2px] px-1 normal-case text-center">color</th>
                  </tr>
                </thead>
                <tbody className="text-[11px] leading-tight">
                  <tr>
                    <td className="py-[2px] px-1">Fixed Offer</td>
                    <td className="py-[2px] px-1 text-right">-24.0</td>
                    <td className="py-[2px] px-1 text-center">-</td>
                    <td className="py-[2px] px-1 text-center">-</td>
                  </tr>
                  <tr>
                    <td className="py-[2px] px-1">أرز بسمتي Manas</td>
                    <td className="py-[2px] px-1 text-right">-3.5</td>
                    <td className="py-[2px] px-1 text-center">-</td>
                    <td className="py-[2px] px-1 text-center">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Footer Branding */}
          <div className="absolute bottom-4 left-8 right-8 pt-2 border-t border-slate-300 flex justify-between items-center text-[9px] text-slate-500">
            <span>REP_S_00191</span>
            <span>Copyright © 2026 Vanguard ERP. All Rights Reserved.</span>
            <span>www.vanguarderp.com</span>
          </div>

        </div>
      </div>

    </div>
  );
}
