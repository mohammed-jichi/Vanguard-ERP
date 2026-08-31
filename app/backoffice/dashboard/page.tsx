'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function MasterDashboardOperationsPage() {
  // Live Exchange Rate State (Lebanese Market)
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
    <div className="w-full flex flex-col min-h-[calc(100vh-100px)] select-none text-left font-sans space-y-4">
      
      {/* =================================================================== */}
      {/* 1. TOP SUB-HEADER & EXCHANGE RATE BAR                               */}
      {/* =================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-300/80 p-3 px-5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        
        {/* Left: Quick Module Navigation Chips */}
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/backoffice/operations"
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-200 transition-colors"
          >
            Operations Center
          </Link>
          <Link
            href="/backoffice/accounting"
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-200 transition-colors"
          >
            Accounting
          </Link>
          <Link
            href="/backoffice/hr"
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-200 transition-colors"
          >
            Human Resources
          </Link>
          <Link
            href="/backoffice/customers"
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-200 transition-colors"
          >
            Customer Management
          </Link>
          <Link
            href="/backoffice/fleet"
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-200 transition-colors"
          >
            Fleet Management
          </Link>
        </div>

        {/* Right: Live USD Currency Rate Bar with Quick Edit */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#f8faf8] border border-[#1e3a2b]/20 px-3.5 py-1.5 rounded-xl shadow-2xs">
            <span className="text-slate-400 text-xs font-bold">🔍</span>
            <span className="text-xs font-bold text-slate-700">USD rate:</span>
            
            {isEditingRate ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={tempRate}
                  onChange={(e) => setTempRate(e.target.value)}
                  className="w-24 px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono font-bold text-xs text-[#1e3a2b] focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSaveRate}
                  className="px-2 py-0.5 bg-[#1e3a2b] text-white rounded text-[10.5px] font-bold"
                >
                  ✓
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
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

      </div>

      {/* =================================================================== */}
      {/* 2. SUB-RIBBON: RECENTLY VISITED + ACTION BADGES (EOM & ALERTS)     */}
      {/* =================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-300/80 p-3 px-5 flex flex-wrap items-center justify-between gap-3 shadow-2xs text-xs">
        
        {/* Left: Recently Visited Shortcuts */}
        <div className="flex items-center gap-2 text-slate-600">
          <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider">Recently Visited:</span>
          <Link href="/backoffice/online-orders" className="text-[#1e3a2b] hover:underline font-semibold">Sales</Link>
          <span className="text-slate-300">|</span>
          <Link href="/backoffice/reportview" className="text-[#1e3a2b] hover:underline font-semibold">Reports</Link>
          <span className="text-slate-300">|</span>
          <Link href="/backoffice/dashboard" className="text-[#1e3a2b] hover:underline font-semibold">Dashboard</Link>
          <span className="text-slate-300">|</span>
          <Link href="/backoffice/fleet" className="text-[#1e3a2b] hover:underline font-semibold">Fleet Hub</Link>
          <span className="text-slate-300">|</span>
          <Link href="/backoffice/social-crm" className="text-[#1e3a2b] hover:underline font-semibold">Social CRM</Link>
        </div>

        {/* Center: Dynamic Status Action Badges */}
        <div className="flex items-center gap-2">
          {!endOfMonthClosed ? (
            <button
              type="button"
              onClick={() => setEndOfMonthModalOpen(true)}
              className="px-3.5 py-1 rounded-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 animate-pulse"
            >
              <span>🔔</span>
              <span>End Of Month</span>
            </button>
          ) : (
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 flex items-center gap-1">
              <span>✓</span>
              <span>Month Closed (August 2026)</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => setAlertsModalOpen(true)}
            className="px-3.5 py-1 rounded-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition-transform active:scale-95"
          >
            <span>🔔</span>
            <span>Alerts ({activeAlertsCount})</span>
          </button>
        </div>

        {/* Right: Operational Shortcuts */}
        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600">
          <button type="button" onClick={() => setEndOfMonthModalOpen(true)} className="text-[#1e3a2b] hover:underline flex items-center gap-1">
            <span>End of Month ➔</span>
          </button>
          <span className="text-slate-300">|</span>
          <Link href="/backoffice/inbox" className="hover:text-slate-900">Latest Transactions</Link>
          <span className="text-slate-300">|</span>
          <button type="button" onClick={() => alert('Daily Operations Check List Opened')} className="hover:text-slate-900">
            Check List
          </button>
          <span className="text-slate-300">|</span>
          <button type="button" onClick={() => alert('Watch Vanguard Video Tutorials')} className="hover:text-slate-900">
            Watch Tutorials
          </button>
        </div>

      </div>

      {/* =================================================================== */}
      {/* 3. 30-TILE MASTER OPERATIONS COMMAND MATRIX (6 TIERS)               */}
      {/* =================================================================== */}
      <div className="space-y-4">
        
        {/* TIER 1: OVERVIEW (5 TILES) */}
        <div className="bg-white rounded-2xl border border-slate-300/80 p-4 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Overview</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            
            <Link href="/backoffice/dashboard" className="p-4 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fbfcfb] hover:bg-white flex flex-col items-center justify-center gap-2 group transition-all">
              <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📊</div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-[#1e3a2b]">Dashboard</span>
            </Link>

            <Link href="/backoffice/reportview" className="p-4 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fbfcfb] hover:bg-white flex flex-col items-center justify-center gap-2 group transition-all">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📈</div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-[#1e3a2b]">Reports Matrix</span>
            </Link>

            <button type="button" onClick={() => alert('Events & Seasonal Harvest Calendar')} className="p-4 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fbfcfb] hover:bg-white flex flex-col items-center justify-center gap-2 group transition-all">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🎟️</div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-[#1e3a2b]">Events</span>
            </button>

            <button type="button" onClick={() => alert('Tasks & Appointments Schedule')} className="p-4 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fbfcfb] hover:bg-white flex flex-col items-center justify-center gap-2 group transition-all">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🤝</div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-[#1e3a2b]">Tasks & Appointments</span>
            </button>

            <Link href="/backoffice/customers" className="p-4 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fbfcfb] hover:bg-white flex flex-col items-center justify-center gap-2 group transition-all">
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">👤</div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-[#1e3a2b]">Customer Aged</span>
            </Link>

          </div>
        </div>

        {/* TIER 2: BILLING (5 TILES) */}
        <div className="bg-white rounded-2xl border border-slate-300/80 p-4 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Billing</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            
            <Link href="/backoffice/customers" className="p-4 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fbfcfb] hover:bg-white flex flex-col items-center justify-center gap-2 group transition-all">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">👥</div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-[#1e3a2b]">Customers</span>
            </Link>

            <Link href="/backoffice/online-orders" className="p-4 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fbfcfb] hover:bg-white flex flex-col items-center justify-center gap-2 group transition-all">
              <div className="w-11 h-11 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📄</div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-[#1e3a2b]">Quotations</span>
            </Link>

            <Link href="/backoffice/online-orders" className="p-4 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fbfcfb] hover:bg-white flex flex-col items-center justify-center gap-2 group transition-all">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">💰</div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-[#1e3a2b]">Sales</span>
            </Link>

            <Link href="/backoffice/fleet" className="p-4 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fbfcfb] hover:bg-white flex flex-col items-center justify-center gap-2 group transition-all">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🚚</div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-[#1e3a2b]">Delivery Of Goods</span>
            </Link>

            <Link href="/backoffice/accounting" className="p-4 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fbfcfb] hover:bg-white flex flex-col items-center justify-center gap-2 group transition-all">
              <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🧾</div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-[#1e3a2b]">Receipts</span>
            </Link>

          </div>
        </div>

        {/* TIER 3: MOVEMENTS (5 TILES) */}
        <div className="bg-white rounded-2xl border border-slate-300/80 p-4 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Movements</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            
            <Link href="/backoffice/operations" className="p-4 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fbfcfb] hover:bg-white flex flex-col items-center justify-center gap-2 group transition-all">
              <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🗑️</div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-[#1e3a2b]">Lost Goods</span>
            </Link>

            <Link href="/backoffice/operations" className="p-4 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fbfcfb] hover:bg-white flex flex-col items-center justify-center gap-2 group transition-all">
              <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🏗️</div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-[#1e3a2b]">Item Assembly</span>
            </Link>

            <Link href="/backoffice/operations" className="p-4 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fbfcfb] hover:bg-white flex flex-col items-center justify-center gap-2 group transition-all">
              <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">⚖️</div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-[#1e3a2b]">Adjustment</span>
            </Link>

            <Link href="/backoffice/operations" className="p-4 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fbfcfb] hover:bg-white flex flex-col items-center justify-center gap-2 group transition-all">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📋</div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-[#1e3a2b]">Product Request</span>
            </Link>

            <Link href="/backoffice/operations" className="p-4 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fbfcfb] hover:bg-white flex flex-col items-center justify-center gap-2 group transition-all">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🛒</div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-[#1e3a2b]">Transfers</span>
            </Link>

          </div>
        </div>

        {/* TIER 4: PROCUREMENTS (5 TILES) */}
        <div className="bg-white rounded-2xl border border-slate-300/80 p-4 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Procurements</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            
            <Link href="/backoffice/operations" className="p-4 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fbfcfb] hover:bg-white flex flex-col items-center justify-center gap-2 group transition-all">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📦</div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-[#1e3a2b]">Products & Services</span>
            </Link>

            <Link href="/backoffice/operations" className="p-4 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fbfcfb] hover:bg-white flex flex-col items-center justify-center gap-2 group transition-all">
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🤝</div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-[#1e3a2b]">Suppliers</span>
            </Link>

            <Link href="/backoffice/operations" className="p-4 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fbfcfb] hover:bg-white flex flex-col items-center justify-center gap-2 group transition-all">
              <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🛒</div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-[#1e3a2b]">Reorder Guide</span>
            </Link>

            <Link href="/backoffice/operations" className="p-4 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fbfcfb] hover:bg-white flex flex-col items-center justify-center gap-2 group transition-all">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📋</div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-[#1e3a2b]">Purchase Orders</span>
            </Link>

            <Link href="/backoffice/operations" className="p-4 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fbfcfb] hover:bg-white flex flex-col items-center justify-center gap-2 group transition-all">
              <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🛍️</div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-[#1e3a2b]">Purchases</span>
            </Link>

          </div>
        </div>

        {/* TIER 5: SUPERSONIC FLEET MANAGEMENT (5 TILES) */}
        <div className="bg-white rounded-2xl border border-slate-300/80 p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">SuperSonic Fleet Management</h3>
            <span className="text-[10px] font-mono bg-[#1e3a2b]/15 text-[#1e3a2b] px-2 py-0.5 rounded-full font-bold">Logistics & Tracking</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            
            <Link href="/backoffice/fleet" className="p-4 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fbfcfb] hover:bg-white flex flex-col items-center justify-center gap-2 group transition-all">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🗺️</div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-[#1e3a2b]">Live Fleet Map</span>
            </Link>

            <Link href="/backoffice/fleet" className="p-4 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fbfcfb] hover:bg-white flex flex-col items-center justify-center gap-2 group transition-all">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🛣️</div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-[#1e3a2b]">Trip Dispatch</span>
            </Link>

            <Link href="/backoffice/fleet" className="p-4 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fbfcfb] hover:bg-white flex flex-col items-center justify-center gap-2 group transition-all">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">👤</div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-[#1e3a2b]">Drivers & Vehicles</span>
            </Link>

            <Link href="/backoffice/fleet" className="p-4 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fbfcfb] hover:bg-white flex flex-col items-center justify-center gap-2 group transition-all">
              <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">⛽</div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-[#1e3a2b]">Fuel & Maintenance</span>
            </Link>

            <Link href="/backoffice/fleet" className="p-4 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fbfcfb] hover:bg-white flex flex-col items-center justify-center gap-2 group transition-all">
              <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📦</div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-[#1e3a2b]">Proof of Delivery</span>
            </Link>

          </div>
        </div>

        {/* TIER 6: SOCIAL CRM & CUSTOMER SUPPORT HUB (5 TILES) */}
        <div className="bg-white rounded-2xl border border-slate-300/80 p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Social CRM & Customer Support Hub</h3>
            <span className="text-[10px] font-mono bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold">Omnichannel Engine</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            
            <Link href="/backoffice/social-crm" className="p-4 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fbfcfb] hover:bg-white flex flex-col items-center justify-center gap-2 group transition-all">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">💬</div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-[#1e3a2b]">Omnichannel Inbox</span>
            </Link>

            <Link href="/backoffice/social-crm" className="p-4 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fbfcfb] hover:bg-white flex flex-col items-center justify-center gap-2 group transition-all">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📢</div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-[#1e3a2b]">WhatsApp Broadcasts</span>
            </Link>

            <Link href="/backoffice/social-crm" className="p-4 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fbfcfb] hover:bg-white flex flex-col items-center justify-center gap-2 group transition-all">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🎫</div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-[#1e3a2b]">Support Tickets</span>
            </Link>

            <Link href="/backoffice/social-crm" className="p-4 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fbfcfb] hover:bg-white flex flex-col items-center justify-center gap-2 group transition-all">
              <div className="w-11 h-11 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">⭐</div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-[#1e3a2b]">Customer Feedback</span>
            </Link>

            <Link href="/backoffice/social-crm" className="p-4 rounded-xl border border-slate-200 hover:border-[#1e3a2b] hover:shadow-md bg-[#fbfcfb] hover:bg-white flex flex-col items-center justify-center gap-2 group transition-all">
              <div className="w-11 h-11 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📚</div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-[#1e3a2b]">Knowledge Base</span>
            </Link>

          </div>
        </div>

      </div>

      {/* =================================================================== */}
      {/* 4. FOOTER                                                           */}
      {/* =================================================================== */}
      <footer className="pt-4 border-t border-slate-200 text-center text-xs text-slate-500 font-medium space-y-1">
        <div>
          © 2026 Southern Olive Oil Products S.A.R.L. All rights reserved.
        </div>
        <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400 font-mono">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <span>|</span>
          <a href="#" className="hover:underline">Terms and Conditions</a>
          <span>|</span>
          <a href="#" className="hover:underline">Support</a>
          <span>|</span>
          <a href="#" className="hover:underline">Feedback</a>
        </div>
      </footer>

      {/* =================================================================== */}
      {/* 5. DYNAMIC ALERTS MODAL                                             */}
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
      {/* 6. END OF MONTH CLOSEOUT MODAL                                      */}
      {/* =================================================================== */}
      {endOfMonthModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 print:hidden animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-amber-50/50">
              <div className="flex items-center gap-2">
                <span className="text-amber-600 font-bold text-lg">⏳</span>
                <h3 className="text-base font-bold text-slate-900">End Of Month Closeout Workflow</h3>
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
