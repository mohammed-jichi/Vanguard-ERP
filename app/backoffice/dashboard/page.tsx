'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function MasterDashboardOperationsPage() {
  // Live Exchange Rate State
  const [usdRate, setUsdRate] = useState('89,500.00');
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [tempRate, setTempRate] = useState('89,500.00');

  // Modals States
  const [alertsModalOpen, setAlertsModalOpen] = useState(false);
  const [endOfMonthModalOpen, setEndOfMonthModalOpen] = useState(false);
  const [endOfMonthClosed, setEndOfMonthClosed] = useState(false);

  // Active Real Alerts for Southern Olive Oil Products S.A.R.L
  const [alertsList, setAlertsList] = useState([
    {
      id: 'ALT-01',
      type: 'STOCK_LOW',
      severity: 'HIGH',
      title: 'Low Stock Alert: 17.5L Metal Tin Cans',
      message: 'Physical inventory at Choueifat Main Facility reached 45 tins (Safety minimum: 200 tins). Reorder required before harvest press run.',
      date: 'Today 09:30 AM',
      resolved: false,
    },
    {
      id: 'ALT-02',
      type: 'EXPIRY_NEAR',
      severity: 'MEDIUM',
      title: 'Expiry Warning: Natural Citric Acid Additive (Batch #12)',
      message: 'Batch #12 (Used for Pomegranate Molasses acidity stabilization) expires in 14 days (14-Sep-2026). Quantity: 15 Kg.',
      date: 'Today 08:00 AM',
      resolved: false,
    },
    {
      id: 'ALT-03',
      type: 'VARIANCE',
      severity: 'HIGH',
      title: 'Meter Variance Alert: Stainless Tank #03 (Extra Virgin)',
      message: 'Tank #03 electronic flow sensor recorded 2,450L vs ledger balance 2,437.5L (Discrepancy: +12.5L). Physical audit suggested.',
      date: 'Yesterday 06:15 PM',
      resolved: false,
    },
  ]);

  const handleSaveRate = () => {
    setUsdRate(tempRate);
    setIsEditingRate(false);
    alert(`Global System Exchange Rate updated to ${tempRate} LBP / USD`);
  };

  const handleExecuteEndOfMonth = () => {
    setEndOfMonthClosed(true);
    setEndOfMonthModalOpen(false);
    alert('August 2026 Financial & Inventory End Of Month closeout executed successfully!');
  };

  const activeAlertsCount = alertsList.filter((a) => !a.resolved).length;

  return (
    <div className="w-full flex flex-col min-h-[calc(100vh-100px)] select-none text-left font-sans space-y-3 pb-8 max-w-[1440px] mx-auto">
      
      {/* =================================================================== */}
      {/* 1. TOP COMPACT SUB-HEADER & EXCHANGE RATE BAR                       */}
      {/* =================================================================== */}
      <div className="bg-white rounded-xl border border-slate-300/80 p-2.5 px-4 flex flex-wrap items-center justify-between gap-2.5 shadow-2xs">
        
        {/* Module Navigation Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <Link href="/backoffice/operations" className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-200 transition-colors">
            Operations Center
          </Link>
          <Link href="/backoffice/accounting" className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-200 transition-colors">
            Accounting
          </Link>
          <Link href="/backoffice/hr" className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-200 transition-colors">
            Human Resources
          </Link>
          <Link href="/backoffice/customers" className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-200 transition-colors">
            Customer Management
          </Link>
          <Link href="/backoffice/fleet" className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-200 transition-colors">
            Fleet Management
          </Link>
        </div>

        {/* Live USD Currency Rate Bar */}
        <div className="flex items-center gap-2 bg-[#f8faf8] border border-[#1e3a2b]/20 px-3 py-1 rounded-lg shadow-2xs">
          <span className="text-slate-400 text-xs font-bold">🔍</span>
          <span className="text-xs font-bold text-slate-700">USD rate:</span>
          
          {isEditingRate ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={tempRate}
                onChange={(e) => setTempRate(e.target.value)}
                className="w-20 px-1 py-0.5 bg-white border border-slate-300 rounded font-mono font-bold text-xs text-[#1e3a2b] focus:outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={handleSaveRate}
                className="px-1.5 py-0.5 bg-[#1e3a2b] text-white rounded text-[10px] font-bold"
              >
                ✓
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="font-mono font-extrabold text-xs text-[#1e3a2b]">
                {usdRate} LBP
              </span>
              <button
                type="button"
                onClick={() => setIsEditingRate(true)}
                className="text-slate-400 hover:text-slate-700 text-xs"
                title="Update Exchange Rate"
              >
                ✏️
              </button>
            </div>
          )}
        </div>

      </div>

      {/* =================================================================== */}
      {/* 2. SUB-RIBBON: RECENTLY VISITED + ACTION BADGES (EOM & ALERTS)     */}
      {/* =================================================================== */}
      <div className="bg-white rounded-xl border border-slate-300/80 p-2.5 px-4 flex flex-wrap items-center justify-between gap-2 shadow-2xs text-xs">
        
        {/* Left: Recently Visited */}
        <div className="flex items-center gap-2 text-slate-600">
          <span className="font-bold text-slate-400 text-[10.5px] uppercase tracking-wider">Recently Visited:</span>
          <Link href="/backoffice/online-orders" className="text-[#1e3a2b] hover:underline font-semibold">Sales</Link>
          <span className="text-slate-300">|</span>
          <Link href="/backoffice/reportview" className="text-[#1e3a2b] hover:underline font-semibold">Reports</Link>
          <span className="text-slate-300">|</span>
          <Link href="/backoffice/dashboard" className="text-[#1e3a2b] hover:underline font-semibold">Dashboard</Link>
          <span className="text-slate-300">|</span>
          <Link href="/backoffice/fleet" className="text-[#1e3a2b] hover:underline font-semibold">Fleet Hub</Link>
        </div>

        {/* Center: Dynamic Status Action Badges */}
        <div className="flex items-center gap-2">
          {!endOfMonthClosed ? (
            <button
              type="button"
              onClick={() => setEndOfMonthModalOpen(true)}
              className="px-3 py-0.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-[11px] flex items-center gap-1 shadow-xs transition-transform active:scale-95 animate-pulse"
            >
              <span>🔔</span>
              <span>End Of Month</span>
            </button>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10.5px] border border-emerald-300 flex items-center gap-1">
              <span>✓</span>
              <span>Month Closed</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => setAlertsModalOpen(true)}
            className="px-3 py-0.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-[11px] flex items-center gap-1 shadow-xs transition-transform active:scale-95"
          >
            <span>🔔</span>
            <span>Alerts ({activeAlertsCount})</span>
          </button>
        </div>

        {/* Right: Operational Shortcuts */}
        <div className="flex items-center gap-2 text-[10.5px] font-semibold text-slate-600">
          <button type="button" onClick={() => setEndOfMonthModalOpen(true)} className="text-[#1e3a2b] hover:underline">
            End of Month ➔
          </button>
          <span className="text-slate-300">|</span>
          <Link href="/backoffice/inbox" className="hover:text-slate-900">Latest Transactions</Link>
          <span className="text-slate-300">|</span>
          <button type="button" onClick={() => alert('Daily Check List')} className="hover:text-slate-900">Check List</button>
        </div>

      </div>

      {/* =================================================================== */}
      {/* 3. BALANCED 5-COLUMN EVEN MATRIX (6 TIERS - 30 CARDS PROPORTIONED)  */}
      {/* =================================================================== */}
      <div className="space-y-3">
        
        {/* TIER 1: OVERVIEW */}
        <div className="bg-white rounded-xl border border-slate-300/80 p-3.5 shadow-2xs space-y-2.5">
          <h3 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider pl-0.5">Overview</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 w-full">
            
            <Link href="/backoffice/dashboard" className="h-[88px] p-2 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fafbfa] hover:bg-white flex flex-col items-center justify-center text-center group transition-all">
              <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">📊</span>
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#1e3a2b] leading-tight">Dashboard</span>
            </Link>

            <Link href="/backoffice/reportview" className="h-[88px] p-2 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fafbfa] hover:bg-white flex flex-col items-center justify-center text-center group transition-all">
              <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">📈</span>
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#1e3a2b] leading-tight">Reports Matrix</span>
            </Link>

            <button type="button" onClick={() => alert('Events Calendar')} className="h-[88px] p-2 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fafbfa] hover:bg-white flex flex-col items-center justify-center text-center group transition-all">
              <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🎟️</span>
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#1e3a2b] leading-tight">Events</span>
            </button>

            <button type="button" onClick={() => alert('Tasks & Appointments')} className="h-[88px] p-2 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fafbfa] hover:bg-white flex flex-col items-center justify-center text-center group transition-all">
              <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🤝</span>
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#1e3a2b] leading-tight">Tasks & Appointments</span>
            </button>

            <Link href="/backoffice/customers" className="h-[88px] p-2 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fafbfa] hover:bg-white flex flex-col items-center justify-center text-center group transition-all">
              <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">👤</span>
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#1e3a2b] leading-tight">Customer Aged</span>
            </Link>

          </div>
        </div>

        {/* TIER 2: BILLING */}
        <div className="bg-white rounded-xl border border-slate-300/80 p-3.5 shadow-2xs space-y-2.5">
          <h3 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider pl-0.5">Billing</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 w-full">
            
            <Link href="/backoffice/customers" className="h-[88px] p-2 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fafbfa] hover:bg-white flex flex-col items-center justify-center text-center group transition-all">
              <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">👥</span>
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#1e3a2b] leading-tight">Customers</span>
            </Link>

            <Link href="/backoffice/online-orders" className="h-[88px] p-2 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fafbfa] hover:bg-white flex flex-col items-center justify-center text-center group transition-all">
              <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">📄</span>
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#1e3a2b] leading-tight">Quotations</span>
            </Link>

            <Link href="/backoffice/online-orders" className="h-[88px] p-2 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fafbfa] hover:bg-white flex flex-col items-center justify-center text-center group transition-all">
              <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">💰</span>
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#1e3a2b] leading-tight">Sales</span>
            </Link>

            <Link href="/backoffice/fleet" className="h-[88px] p-2 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fafbfa] hover:bg-white flex flex-col items-center justify-center text-center group transition-all">
              <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🚚</span>
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#1e3a2b] leading-tight">Delivery Of Goods</span>
            </Link>

            <Link href="/backoffice/accounting" className="h-[88px] p-2 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fafbfa] hover:bg-white flex flex-col items-center justify-center text-center group transition-all">
              <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🧾</span>
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#1e3a2b] leading-tight">Receipts</span>
            </Link>

          </div>
        </div>

        {/* TIER 3: MOVEMENTS */}
        <div className="bg-white rounded-xl border border-slate-300/80 p-3.5 shadow-2xs space-y-2.5">
          <h3 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider pl-0.5">Movements</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 w-full">
            
            <Link href="/backoffice/operations" className="h-[88px] p-2 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fafbfa] hover:bg-white flex flex-col items-center justify-center text-center group transition-all">
              <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🗑️</span>
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#1e3a2b] leading-tight">Lost Goods</span>
            </Link>

            <Link href="/backoffice/operations" className="h-[88px] p-2 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fafbfa] hover:bg-white flex flex-col items-center justify-center text-center group transition-all">
              <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🏗️</span>
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#1e3a2b] leading-tight">Item Assembly</span>
            </Link>

            <Link href="/backoffice/operations" className="h-[88px] p-2 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fafbfa] hover:bg-white flex flex-col items-center justify-center text-center group transition-all">
              <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">⚖️</span>
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#1e3a2b] leading-tight">Adjustment</span>
            </Link>

            <Link href="/backoffice/operations" className="h-[88px] p-2 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fafbfa] hover:bg-white flex flex-col items-center justify-center text-center group transition-all">
              <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">📋</span>
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#1e3a2b] leading-tight">Product Request</span>
            </Link>

            <Link href="/backoffice/operations" className="h-[88px] p-2 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fafbfa] hover:bg-white flex flex-col items-center justify-center text-center group transition-all">
              <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🛒</span>
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#1e3a2b] leading-tight">Transfers</span>
            </Link>

          </div>
        </div>

        {/* TIER 4: PROCUREMENTS */}
        <div className="bg-white rounded-xl border border-slate-300/80 p-3.5 shadow-2xs space-y-2.5">
          <h3 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider pl-0.5">Procurements</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 w-full">
            
            <Link href="/backoffice/operations" className="h-[88px] p-2 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fafbfa] hover:bg-white flex flex-col items-center justify-center text-center group transition-all">
              <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">📦</span>
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#1e3a2b] leading-tight">Products & Services</span>
            </Link>

            <Link href="/backoffice/operations" className="h-[88px] p-2 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fafbfa] hover:bg-white flex flex-col items-center justify-center text-center group transition-all">
              <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🤝</span>
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#1e3a2b] leading-tight">Suppliers</span>
            </Link>

            <Link href="/backoffice/operations" className="h-[88px] p-2 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fafbfa] hover:bg-white flex flex-col items-center justify-center text-center group transition-all">
              <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🛒</span>
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#1e3a2b] leading-tight">Reorder Guide</span>
            </Link>

            <Link href="/backoffice/operations" className="h-[88px] p-2 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fafbfa] hover:bg-white flex flex-col items-center justify-center text-center group transition-all">
              <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">📋</span>
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#1e3a2b] leading-tight">Purchase Orders</span>
            </Link>

            <Link href="/backoffice/operations" className="h-[88px] p-2 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fafbfa] hover:bg-white flex flex-col items-center justify-center text-center group transition-all">
              <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🛍️</span>
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#1e3a2b] leading-tight">Purchases</span>
            </Link>

          </div>
        </div>

        {/* TIER 5: SUPERSONIC FLEET MANAGEMENT */}
        <div className="bg-white rounded-xl border border-slate-300/80 p-3.5 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider pl-0.5">SuperSonic Fleet Management</h3>
            <span className="text-[9.5px] font-mono bg-[#1e3a2b]/15 text-[#1e3a2b] px-2 py-0.5 rounded-full font-bold">Logistics & Tracking</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 w-full">
            
            <Link href="/backoffice/fleet" className="h-[88px] p-2 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fafbfa] hover:bg-white flex flex-col items-center justify-center text-center group transition-all">
              <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🗺️</span>
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#1e3a2b] leading-tight">Live Fleet Map</span>
            </Link>

            <Link href="/backoffice/fleet" className="h-[88px] p-2 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fafbfa] hover:bg-white flex flex-col items-center justify-center text-center group transition-all">
              <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🛣️</span>
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#1e3a2b] leading-tight">Trip Dispatch</span>
            </Link>

            <Link href="/backoffice/fleet" className="h-[88px] p-2 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fafbfa] hover:bg-white flex flex-col items-center justify-center text-center group transition-all">
              <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">👤</span>
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#1e3a2b] leading-tight">Drivers & Vehicles</span>
            </Link>

            <Link href="/backoffice/fleet" className="h-[88px] p-2 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fafbfa] hover:bg-white flex flex-col items-center justify-center text-center group transition-all">
              <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">⛽</span>
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#1e3a2b] leading-tight">Fuel & Maintenance</span>
            </Link>

            <Link href="/backoffice/fleet" className="h-[88px] p-2 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fafbfa] hover:bg-white flex flex-col items-center justify-center text-center group transition-all">
              <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">📦</span>
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#1e3a2b] leading-tight">Proof of Delivery</span>
            </Link>

          </div>
        </div>

        {/* TIER 6: SOCIAL CRM & CUSTOMER SUPPORT HUB */}
        <div className="bg-white rounded-xl border border-slate-300/80 p-3.5 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider pl-0.5">Social CRM & Customer Support Hub</h3>
            <span className="text-[9.5px] font-mono bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold">Omnichannel Engine</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 w-full">
            
            <Link href="/backoffice/social-crm" className="h-[88px] p-2 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fafbfa] hover:bg-white flex flex-col items-center justify-center text-center group transition-all">
              <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">💬</span>
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#1e3a2b] leading-tight">Omnichannel Inbox</span>
            </Link>

            <Link href="/backoffice/social-crm" className="h-[88px] p-2 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fafbfa] hover:bg-white flex flex-col items-center justify-center text-center group transition-all">
              <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">📢</span>
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#1e3a2b] leading-tight">WhatsApp Broadcasts</span>
            </Link>

            <Link href="/backoffice/social-crm" className="h-[88px] p-2 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fafbfa] hover:bg-white flex flex-col items-center justify-center text-center group transition-all">
              <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🎫</span>
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#1e3a2b] leading-tight">Support Tickets</span>
            </Link>

            <Link href="/backoffice/social-crm" className="h-[88px] p-2 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fafbfa] hover:bg-white flex flex-col items-center justify-center text-center group transition-all">
              <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">⭐</span>
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#1e3a2b] leading-tight">Customer Feedback</span>
            </Link>

            <Link href="/backoffice/social-crm" className="h-[88px] p-2 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fafbfa] hover:bg-white flex flex-col items-center justify-center text-center group transition-all">
              <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">📚</span>
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#1e3a2b] leading-tight">Knowledge Base</span>
            </Link>

          </div>
        </div>

      </div>

      {/* =================================================================== */}
      {/* 4. FOOTER                                                           */}
      {/* =================================================================== */}
      <footer className="pt-3 border-t border-slate-200 text-center text-xs text-slate-500 font-medium space-y-1">
        <div>© 2026 Southern Olive Oil Products S.A.R.L. All rights reserved.</div>
        <div className="flex items-center justify-center gap-3 text-[10.5px] text-slate-400 font-mono">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <span>|</span>
          <a href="#" className="hover:underline">Terms & Conditions</a>
          <span>|</span>
          <a href="#" className="hover:underline">Support</a>
        </div>
      </footer>

      {/* =================================================================== */}
      {/* 5. ALERTS MODAL                                                     */}
      {/* =================================================================== */}
      {alertsModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 print:hidden animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-red-50/50">
              <div className="flex items-center gap-2">
                <span className="text-red-600 font-bold text-lg">🔔</span>
                <h3 className="text-base font-bold text-slate-900">Active Operational Alerts</h3>
              </div>
              <button type="button" onClick={() => setAlertsModalOpen(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <div className="p-5 overflow-y-auto custom-scrollbar space-y-3">
              {alertsList.map((alertItem) => (
                <div
                  key={alertItem.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    alertItem.severity === 'HIGH' ? 'bg-red-50/60 border-red-200' : 'bg-amber-50/60 border-amber-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-slate-900 text-xs">{alertItem.title}</span>
                    <span className="font-mono text-[10px] text-slate-400">{alertItem.date}</span>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-relaxed mb-2">
                    {alertItem.message}
                  </p>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAlertsList(alertsList.map((a) => a.id === alertItem.id ? { ...a, resolved: true } : a));
                        alert('Alert acknowledged and marked as resolved.');
                      }}
                      className="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs"
                    >
                      Acknowledge & Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button type="button" onClick={() => setAlertsModalOpen(false)} className="px-4 py-1.5 bg-[#1e3a2b] text-white font-bold rounded-lg text-xs">
                Close Alerts
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 6. END OF MONTH MODAL                                               */}
      {/* =================================================================== */}
      {endOfMonthModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 print:hidden animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-amber-50/50">
              <div className="flex items-center gap-2">
                <span className="text-amber-600 font-bold text-lg">⏳</span>
                <h3 className="text-base font-bold text-slate-900">End Of Month Closeout</h3>
              </div>
              <button type="button" onClick={() => setEndOfMonthModalOpen(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <div className="p-5 space-y-3 text-xs text-slate-800 leading-relaxed">
              <p>
                Executing End Of Month will freeze ledger entries for <strong>August 2026</strong>, calculate monthly depreciation, and generate automated closing inventory balances for:
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] space-y-1">
                <div>• Total Sales Revenue: $148,200.00</div>
                <div>• Olive Pressing Production Yield: 42,800 Liters</div>
                <div>• Total Voids & Discounts Audited: 100% Verified</div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button type="button" onClick={() => setEndOfMonthModalOpen(false)} className="px-4 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-lg text-xs">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteEndOfMonth}
                className="px-5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs shadow-xs"
              >
                Execute End Of Month
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
