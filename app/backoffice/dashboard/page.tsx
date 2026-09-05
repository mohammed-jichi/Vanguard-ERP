'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function MasterSalesDashboardPage() {
  // Global Filters
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState('09');
  const [selectedDay, setSelectedDay] = useState('ALL');
  
  // UI States
  const [recalculating, setRecalculating] = useState(false);
  const [eodModalOpen, setEodModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'daily' | 'hourly' | 'weekday' | 'category' | 'payments' | 'branches'>('daily');

  // Rate
  const usdRate = 89500;

  const branches = [
    { id: 'ALL', name: 'All Branches (001 - 006)', code: '-100' },
    { id: '001', name: '001 - Choueifat Main Facility & Plant', code: 'BR_001' },
    { id: '002', name: '002 - Beirut Wholesale Hub', code: 'BR_002' },
    { id: '003', name: '003 - Saida Southern Center', code: 'BR_003' },
    { id: '004', name: '004 - Zahle Bekaa Branch', code: 'BR_004' },
    { id: '005', name: '005 - Tripoli North Depot', code: 'BR_005' },
    { id: '006', name: '006 - Nabatieh Center', code: 'BR_006' },
  ];

  const formatCurrency = (valUsd: number) => {
    if (selectedCurrency === 'LBP') {
      const lbpVal = Math.round(valUsd * usdRate);
      return `${lbpVal.toLocaleString()} LBP`;
    }
    return `$${valUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleRecalculate = () => {
    setRecalculating(true);
    setTimeout(() => {
      setRecalculating(false);
    }, 800);
  };

  const handleExportPdf = () => {
    window.print();
  };

  // Branch EOD Closeout status
  const branchEods = [
    { branch: '001 - Choueifat Main Facility', lastEod: '2026-09-04 23:45', status: 'Closed', cashier: 'Mahdi Jichi' },
    { branch: '002 - Beirut Wholesale Hub', lastEod: '2026-09-04 22:15', status: 'Closed', cashier: 'Hiba Aloulou' },
    { branch: '003 - Saida Southern Center', lastEod: '2026-09-04 21:30', status: 'Closed', cashier: 'Hussein Daik' },
    { branch: '004 - Zahle Bekaa Branch', lastEod: '2026-09-04 20:50', status: 'Closed', cashier: 'Rami Kassem' },
    { branch: '005 - Tripoli North Depot', lastEod: '2026-09-04 21:10', status: 'Closed', cashier: 'Ahmad Taha' },
    { branch: '006 - Nabatieh Center', lastEod: '2026-09-04 22:00', status: 'Closed', cashier: 'Ali Wehbe' },
  ];

  // Daily Sales dataset (September 2026)
  const dailySalesData = [
    { day: '01-Sep', dayName: 'Tue', salesUsd: 14250, invoices: 182, avgTicket: 78.30, lyearUsd: 12800 },
    { day: '02-Sep', dayName: 'Wed', salesUsd: 16800, invoices: 210, avgTicket: 80.00, lyearUsd: 14500 },
    { day: '03-Sep', dayName: 'Thu', salesUsd: 19400, invoices: 245, avgTicket: 79.18, lyearUsd: 17100 },
    { day: '04-Sep', dayName: 'Fri', salesUsd: 22100, invoices: 278, avgTicket: 79.50, lyearUsd: 19600 },
    { day: '05-Sep', dayName: 'Sat', salesUsd: 18450, invoices: 224, avgTicket: 82.36, lyearUsd: 16300 },
  ];

  // Hourly Breakdown
  const hourlyData = [
    { hour: '08:00 - 09:00', salesUsd: 1200, count: 18, pct: '6.5%' },
    { hour: '09:00 - 10:00', salesUsd: 2450, count: 32, pct: '13.3%' },
    { hour: '10:00 - 11:00', salesUsd: 3800, count: 48, pct: '20.6%' },
    { hour: '11:00 - 12:00', salesUsd: 3400, count: 42, pct: '18.4%' },
    { hour: '12:00 - 13:00', salesUsd: 1900, count: 25, pct: '10.3%' },
    { hour: '13:00 - 14:00', salesUsd: 1400, count: 19, pct: '7.6%' },
    { hour: '14:00 - 15:00', salesUsd: 1100, count: 14, pct: '6.0%' },
    { hour: '15:00 - 16:00', salesUsd: 1600, count: 20, pct: '8.7%' },
    { hour: '16:00 - 17:00', salesUsd: 1600, count: 21, pct: '8.7%' },
  ];

  // Weekday Breakdown
  const weekdayData = [
    { day: 'Monday', avgSalesUsd: 15800, totalInvoices: 820, share: '14.8%' },
    { day: 'Tuesday', avgSalesUsd: 16400, totalInvoices: 845, share: '15.4%' },
    { day: 'Wednesday', avgSalesUsd: 17200, totalInvoices: 890, share: '16.1%' },
    { day: 'Thursday', avgSalesUsd: 19800, totalInvoices: 1020, share: '18.5%' },
    { day: 'Friday', avgSalesUsd: 22400, totalInvoices: 1150, share: '21.0%' },
    { day: 'Saturday', avgSalesUsd: 15200, totalInvoices: 780, share: '14.2%' },
    { day: 'Sunday', avgSalesUsd: 0, totalInvoices: 0, share: '0.0%' },
  ];

  // Category Revenue
  const categoryData = [
    { name: 'Extra Virgin Olive Oil (EVOO)', salesUsd: 224800, qty: '18,450 L', pct: '56.4%' },
    { name: 'Virgin Olive Oil', salesUsd: 78500, qty: '8,200 L', pct: '19.7%' },
    { name: 'Table Olives & Pickles', salesUsd: 42300, qty: '4,600 Kg', pct: '10.6%' },
    { name: 'Pomegranate Molasses & Vinegar', salesUsd: 31200, qty: '3,800 Bottles', pct: '7.8%' },
    { name: 'Olive Pomace Oil & Industrial', salesUsd: 15400, qty: '2,900 L', pct: '3.9%' },
    { name: 'Bulk Packaging & Tin Containers', salesUsd: 6450, qty: '1,200 Tins', pct: '1.6%' },
  ];

  // Payment Breakdown
  const paymentData = [
    { method: 'Cash (USD)', amountUsd: 215400, transactions: 2450, pct: '54.0%' },
    { method: 'Cash (LBP)', amountUsd: 112300, transactions: 1520, pct: '28.2%' },
    { method: 'Customer Account Ledger (Credit)', amountUsd: 48500, transactions: 410, pct: '12.2%' },
    { method: 'Whish Money Transfer', amountUsd: 14200, transactions: 180, pct: '3.6%' },
    { method: 'Credit Card / POS Terminal', amountUsd: 5800, transactions: 74, pct: '1.5%' },
    { method: 'Bank Cheques', amountUsd: 2450, transactions: 12, pct: '0.6%' },
  ];

  // Branch Performance
  const branchData = [
    { branch: '001 - Choueifat Main Facility & Plant', salesUsd: 168400, invoices: 1850, pct: '42.2%', growth: '+14.2%' },
    { branch: '002 - Beirut Wholesale Hub', salesUsd: 98200, invoices: 1120, pct: '24.6%', growth: '+12.5%' },
    { branch: '003 - Saida Southern Center', salesUsd: 62400, invoices: 740, pct: '15.7%', growth: '+9.8%' },
    { branch: '004 - Zahle Bekaa Branch', salesUsd: 34100, invoices: 410, pct: '8.6%', growth: '+11.0%' },
    { branch: '005 - Tripoli North Depot', salesUsd: 21300, invoices: 290, pct: '5.3%', growth: '+7.4%' },
    { branch: '006 - Nabatieh Center', salesUsd: 14250, invoices: 258, pct: '3.6%', growth: '+15.8%' },
  ];

  return (
    <div className="w-full flex flex-col min-h-[calc(100vh-80px)] text-left font-sans space-y-3 pb-8 max-w-7xl mx-auto px-2">
      
      {/* =================================================================== */}
      {/* 1. OMEGA STYLE TOPBAR FILTER BAR                                    */}
      {/* =================================================================== */}
      <div className="bg-white rounded-xl border border-slate-300/80 p-3 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Left Title & System Status */}
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>📊</span>
                <span>Sales Dashboard</span>
              </h1>
              <div className="text-[11px] font-mono text-slate-500">
                Southern Olive Oil Products S.A.R.L • Executive Sales Control
              </div>
            </div>
          </div>

          {/* Center Filters matching Omega exactly */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            
            {/* Branch Filter */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1">
              <span className="text-slate-400 font-bold">🏢</span>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer text-xs"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Currency Filter */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1">
              <span className="text-slate-400 font-bold">💱</span>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer text-xs font-mono"
              >
                <option value="USD">USD ($)</option>
                <option value="LBP">LBP (89,500)</option>
              </select>
            </div>

            {/* Year Filter */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1">
              <span className="text-slate-400 font-bold">📅</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer text-xs font-mono"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>

            {/* Month Filter */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer text-xs"
              >
                <option value="ALL">All Months</option>
                <option value="01">January</option>
                <option value="02">February</option>
                <option value="03">March</option>
                <option value="04">April</option>
                <option value="05">May</option>
                <option value="06">June</option>
                <option value="07">July</option>
                <option value="08">August</option>
                <option value="09">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
            </div>

            {/* Day Filter */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1">
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer text-xs"
              >
                <option value="ALL">All Days</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={String(d).padStart(2, '0')}>Day {d}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Right Action Icons matching Omega Eod_Recalbtns */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleExportPdf}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <span>📥</span>
              <span>Export PDF</span>
            </button>

            <button
              type="button"
              onClick={() => setEodModalOpen(true)}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
              title="Branches Last EOD Date"
            >
              🕒
            </button>

            <button
              type="button"
              onClick={handleRecalculate}
              className={`p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors ${recalculating ? 'animate-spin text-emerald-700' : ''}`}
              title="Recalculate Data by Selected Filters"
            >
              🔄
            </button>

            <Link
              href="/backoffice/reportview"
              className="px-3 py-1.5 rounded-lg bg-[#1e3a2b] hover:bg-[#162c20] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
              title="Open Full 93-Report Center"
            >
              <span>📈</span>
              <span>Reports Center</span>
            </Link>
          </div>

        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. OMEGA 4-ROW KPI MATRIX SUITE                                     */}
      {/* =================================================================== */}
      
      {/* ROW 1: TODAY'S PULSE (Omega exact layout) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <div className="bg-white rounded-xl border border-slate-300/80 p-3 shadow-2xs border-l-4 border-l-emerald-600">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Today's Net Sales</div>
          <div className="text-xl font-black text-slate-900 font-mono mt-0.5">{formatCurrency(18450)}</div>
          <div className="text-[10px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
            <span>▲ +12.4%</span>
            <span className="text-slate-400 font-normal">vs yesterday</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-300/80 p-3 shadow-2xs border-l-4 border-l-blue-600">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Today's Receipts</div>
          <div className="text-xl font-black text-slate-900 font-mono mt-0.5">{formatCurrency(19200)}</div>
          <div className="text-[10px] text-blue-700 font-bold mt-1 flex items-center gap-1">
            <span>224 Invoices</span>
            <span className="text-slate-400 font-normal">collected</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-300/80 p-3 shadow-2xs border-l-4 border-l-amber-500">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Today's Discounts</div>
          <div className="text-xl font-black text-slate-900 font-mono mt-0.5">{formatCurrency(750)}</div>
          <div className="text-[10px] text-amber-700 font-bold mt-1 flex items-center gap-1">
            <span>3.9%</span>
            <span className="text-slate-400 font-normal">discount ratio</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-300/80 p-3 shadow-2xs border-l-4 border-l-red-600">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Today's Refunds</div>
          <div className="text-xl font-black text-slate-900 font-mono mt-0.5">{formatCurrency(0)}</div>
          <div className="text-[10px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
            <span>✓ 0 Voids</span>
            <span className="text-slate-400 font-normal">clean run</span>
          </div>
        </div>
      </div>

      {/* ROW 2: MONTHLY REVENUE MATRIX */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <div className="bg-white rounded-xl border border-slate-300/80 p-3 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Gross Sales</div>
          <div className="text-lg font-black text-slate-800 font-mono mt-0.5">{formatCurrency(412850)}</div>
          <div className="text-[10px] font-mono text-slate-500">4,668 items billed</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-300/80 p-3 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Discount</div>
          <div className="text-lg font-black text-amber-700 font-mono mt-0.5">-{formatCurrency(14200)}</div>
          <div className="text-[10px] font-mono text-slate-500">Customer terms & promotions</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-300/80 p-3 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tax (VAT 11%)</div>
          <div className="text-lg font-black text-slate-800 font-mono mt-0.5">{formatCurrency(43851.5)}</div>
          <div className="text-[10px] font-mono text-slate-500">Ministry of Finance ledger</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-300/80 p-3 shadow-2xs bg-emerald-50/40">
          <div className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">Net Sales</div>
          <div className="text-lg font-black text-emerald-900 font-mono mt-0.5">{formatCurrency(398650)}</div>
          <div className="text-[10px] font-mono text-emerald-700 font-bold">Executive Realized Revenue</div>
        </div>
      </div>

      {/* ROW 3: PERFORMANCE COMPARISONS (MTD vs LYM / YTD vs LYTM) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        <div className="bg-white rounded-xl border border-slate-300/80 p-3 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">MTD vs LYM (Month to Date vs Last Year)</div>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-lg font-black font-mono text-slate-900">{formatCurrency(398650)}</span>
              <span className="text-xs font-mono text-slate-400">LYM: {formatCurrency(352400)}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold text-xs">
              ▲ +13.1% YoY
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-300/80 p-3 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">YTD vs LYTM (Year to Date vs Last Year)</div>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-lg font-black font-mono text-slate-900">{formatCurrency(3145200)}</span>
              <span className="text-xs font-mono text-slate-400">LYTM: {formatCurrency(2810500)}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold text-xs">
              ▲ +11.9% YoY
            </span>
          </div>
        </div>
      </div>

      {/* ROW 4: OPERATIONAL & CUSTOMER FLOW METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2.5 text-xs">
        <div className="bg-white rounded-xl border border-slate-300/80 p-2.5 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Customer Aged</div>
          <div className="text-sm font-black font-mono text-slate-900 mt-1">{formatCurrency(84200)}</div>
          <div className="text-[9.5px] text-amber-700 font-bold mt-0.5">Receivables</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-300/80 p-2.5 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase">MTD Receipts</div>
          <div className="text-sm font-black font-mono text-slate-900 mt-1">{formatCurrency(382100)}</div>
          <div className="text-[9.5px] text-blue-700 font-bold mt-0.5">95.8% Collection</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-300/80 p-2.5 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Paid In / Paid Out</div>
          <div className="text-sm font-black font-mono text-slate-900 mt-1">{formatCurrency(4500)} / {formatCurrency(2850)}</div>
          <div className="text-[9.5px] text-slate-500 mt-0.5">Net +{formatCurrency(1650)}</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-300/80 p-2.5 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Voids & Refunds</div>
          <div className="text-sm font-black font-mono text-slate-900 mt-1">{formatCurrency(1200)} / {formatCurrency(850)}</div>
          <div className="text-[9.5px] text-red-700 font-bold mt-0.5">6 Total Cases</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-300/80 p-2.5 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Avg Inv / Cust</div>
          <div className="text-sm font-black font-mono text-slate-900 mt-1">{formatCurrency(85.40)} / {formatCurrency(245.80)}</div>
          <div className="text-[9.5px] text-slate-500 mt-0.5">Ticket size</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-300/80 p-2.5 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Cust / Inv Count</div>
          <div className="text-sm font-black font-mono text-slate-900 mt-1">1,620 / 4,668</div>
          <div className="text-[9.5px] text-emerald-700 font-bold mt-0.5">High Frequency</div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. VISUAL CHARTS & BREAKDOWN TABS (Omega exact modules)             */}
      {/* =================================================================== */}
      <div className="bg-white rounded-xl border border-slate-300/80 shadow-2xs overflow-hidden">
        
        {/* Navigation Tabs Header */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2 gap-2">
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('daily')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'daily' ? 'bg-[#1e3a2b] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              📅 Daily Sales Breakdown
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('hourly')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'hourly' ? 'bg-[#1e3a2b] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              ⏰ Hourly Distribution
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('weekday')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'weekday' ? 'bg-[#1e3a2b] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              📊 Weekday Trends
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('category')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'category' ? 'bg-[#1e3a2b] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              🫒 Revenue by Category
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('payments')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'payments' ? 'bg-[#1e3a2b] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              💵 Payment Methods
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('branches')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'branches' ? 'bg-[#1e3a2b] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              🏢 Regional Performance
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-500 font-semibold">
            Status: Synchronized Live • Branch: {selectedBranch}
          </div>
        </div>

        {/* Tab 1: Daily Sales Table & Chart */}
        {activeTab === 'daily' && (
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>Daily Sales Performance Log (September 2026)</span>
              <span className="font-mono text-slate-500">Normal-case Data Table</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-100 font-bold text-slate-700">
                    <th className="p-2.5 normal-case">Date</th>
                    <th className="p-2.5 normal-case">Weekday</th>
                    <th className="p-2.5 normal-case text-right">Net Sales</th>
                    <th className="p-2.5 normal-case text-right">Invoices</th>
                    <th className="p-2.5 normal-case text-right">Avg Ticket</th>
                    <th className="p-2.5 normal-case text-right">LY Sales</th>
                    <th className="p-2.5 normal-case text-center">Variance %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
                  {dailySalesData.map((row, idx) => {
                    const diffPct = (((row.salesUsd - row.lyearUsd) / row.lyearUsd) * 100).toFixed(1);
                    return (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-2.5 font-bold">{row.day}-2026</td>
                        <td className="p-2.5 font-sans font-semibold text-slate-600">{row.dayName}</td>
                        <td className="p-2.5 text-right font-bold text-emerald-800">{formatCurrency(row.salesUsd)}</td>
                        <td className="p-2.5 text-right">{row.invoices}</td>
                        <td className="p-2.5 text-right">{formatCurrency(row.avgTicket)}</td>
                        <td className="p-2.5 text-right text-slate-400">{formatCurrency(row.lyearUsd)}</td>
                        <td className="p-2.5 text-center font-bold text-emerald-700">+{diffPct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-400 bg-slate-50 font-mono font-black text-xs">
                    <td className="p-2.5" colSpan={2}>Period Total</td>
                    <td className="p-2.5 text-right text-emerald-900">{formatCurrency(91000)}</td>
                    <td className="p-2.5 text-right">1,139</td>
                    <td className="p-2.5 text-right">{formatCurrency(79.89)}</td>
                    <td className="p-2.5 text-right text-slate-500">{formatCurrency(80300)}</td>
                    <td className="p-2.5 text-center text-emerald-800">+13.3%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Hourly Distribution */}
        {activeTab === 'hourly' && (
          <div className="p-4 space-y-4">
            <div className="text-xs font-bold text-slate-700">Hourly Traffic & Revenue Distribution (08:00 - 17:00)</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-100 font-bold text-slate-700">
                    <th className="p-2.5 normal-case">Hour Window</th>
                    <th className="p-2.5 normal-case text-right">Net Sales</th>
                    <th className="p-2.5 normal-case text-right">Ticket Count</th>
                    <th className="p-2.5 normal-case text-right">Share %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
                  {hourlyData.map((h, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold">{h.hour}</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">{formatCurrency(h.salesUsd)}</td>
                      <td className="p-2.5 text-right">{h.count}</td>
                      <td className="p-2.5 text-right text-blue-700 font-bold">{h.pct}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Graphical Visual Bars */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-700 mb-2">Visual Hourly Concentration</div>
                {hourlyData.map((h, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span>{h.hour}</span>
                      <span className="font-bold">{formatCurrency(h.salesUsd)} ({h.pct})</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#1e3a2b]"
                        style={{ width: `${Math.min(100, (h.salesUsd / 3800) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Weekday Breakdown */}
        {activeTab === 'weekday' && (
          <div className="p-4 space-y-4">
            <div className="text-xs font-bold text-slate-700">Weekly Performance Cycle</div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-100 font-bold text-slate-700">
                  <th className="p-2.5 normal-case">Weekday</th>
                  <th className="p-2.5 normal-case text-right">Average Daily Sales</th>
                  <th className="p-2.5 normal-case text-right">Total Invoices</th>
                  <th className="p-2.5 normal-case text-right">Weekly Revenue Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
                {weekdayData.map((w, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold font-sans">{w.day}</td>
                    <td className="p-2.5 text-right font-bold text-slate-900">{formatCurrency(w.avgSalesUsd)}</td>
                    <td className="p-2.5 text-right">{w.totalInvoices.toLocaleString()}</td>
                    <td className="p-2.5 text-right font-bold text-emerald-800">{w.share}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Revenue by Category */}
        {activeTab === 'category' && (
          <div className="p-4 space-y-4">
            <div className="text-xs font-bold text-slate-700">Product Category Distribution (Sales & Volume)</div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-100 font-bold text-slate-700">
                  <th className="p-2.5 normal-case">Product Category</th>
                  <th className="p-2.5 normal-case text-right">Net Revenue</th>
                  <th className="p-2.5 normal-case text-right">Physical Volume Sold</th>
                  <th className="p-2.5 normal-case text-right">Contribution %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
                {categoryData.map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold font-sans">{c.name}</td>
                    <td className="p-2.5 text-right font-bold text-emerald-800">{formatCurrency(c.salesUsd)}</td>
                    <td className="p-2.5 text-right">{c.qty}</td>
                    <td className="p-2.5 text-right text-blue-700 font-bold">{c.pct}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 5: Payment Methods */}
        {activeTab === 'payments' && (
          <div className="p-4 space-y-4">
            <div className="text-xs font-bold text-slate-700">Payment Tender Distribution & Cash Reconciliations</div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-100 font-bold text-slate-700">
                  <th className="p-2.5 normal-case">Tender Method</th>
                  <th className="p-2.5 normal-case text-right">Collected Amount</th>
                  <th className="p-2.5 normal-case text-right">Transaction Count</th>
                  <th className="p-2.5 normal-case text-right">Tender Share %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
                {paymentData.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold font-sans">{p.method}</td>
                    <td className="p-2.5 text-right font-bold text-slate-900">{formatCurrency(p.amountUsd)}</td>
                    <td className="p-2.5 text-right">{p.transactions.toLocaleString()}</td>
                    <td className="p-2.5 text-right font-bold text-emerald-800">{p.pct}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 6: Regional Performance */}
        {activeTab === 'branches' && (
          <div className="p-4 space-y-4">
            <div className="text-xs font-bold text-slate-700">Branch & Regional Sales Distribution</div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-100 font-bold text-slate-700">
                  <th className="p-2.5 normal-case">Facility & Branch</th>
                  <th className="p-2.5 normal-case text-right">Net Sales</th>
                  <th className="p-2.5 normal-case text-right">Invoices</th>
                  <th className="p-2.5 normal-case text-right">Network Share</th>
                  <th className="p-2.5 normal-case text-center">YoY Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
                {branchData.map((b, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold font-sans">{b.branch}</td>
                    <td className="p-2.5 text-right font-bold text-slate-900">{formatCurrency(b.salesUsd)}</td>
                    <td className="p-2.5 text-right">{b.invoices}</td>
                    <td className="p-2.5 text-right text-blue-700 font-bold">{b.pct}</td>
                    <td className="p-2.5 text-center font-bold text-emerald-700">{b.growth}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* =================================================================== */}
      {/* 4. MODAL: BRANCHES LAST EOD CLOSEOUT MODAL                         */}
      {/* =================================================================== */}
      {eodModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-300 max-w-xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🕒</span>
                <h3 className="text-base font-bold text-slate-900">Branches Last EOD Date Registry</h3>
              </div>
              <button
                type="button"
                onClick={() => setEodModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-100 font-bold text-slate-700">
                    <th className="p-2 normal-case">Branch Name</th>
                    <th className="p-2 normal-case">Last Closeout Date</th>
                    <th className="p-2 normal-case">Status</th>
                    <th className="p-2 normal-case">Auditor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
                  {branchEods.map((e, idx) => (
                    <tr key={idx}>
                      <td className="p-2 font-sans font-semibold">{e.branch}</td>
                      <td className="p-2 font-bold">{e.lastEod}</td>
                      <td className="p-2 font-bold text-emerald-700">{e.status}</td>
                      <td className="p-2 font-sans text-slate-600">{e.cashier}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setEodModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
              >
                Close Registry
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
