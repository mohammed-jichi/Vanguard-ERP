'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  MapPin,
  Clock,
  Truck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  DollarSign,
  Calendar,
  Search,
  Building2,
  Users,
  Phone,
  Navigation,
  X
} from 'lucide-react';
import {
  getDefaultInitialDateRange,
  resolveDateRangeFromPreset,
} from '@/lib/dateRangeEngine';

interface TrackingOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  offerDetails: string;
  amountUsd: number;
  scheduledEta: string; // From SuperSonic Fleet
  status: 'IN_TRANSIT' | 'DELIVERED' | 'PENDING' | 'CANCELLED';
  driverName?: string;
  driverPhone?: string;
  statusReason?: string;
  repCommission: number;
  driverLocation?: { lat: number; lng: number; lastUpdate: string };
}

const SAMPLE_TRACKING_ORDERS: TrackingOrder[] = [
  {
    id: 'ORD-SO-9921',
    customerName: 'Fadi Khalil',
    customerPhone: '+961 3 889900',
    customerAddress: 'Beirut - Hamra, Sadat St.',
    offerDetails: '17.5L Extra Virgin Olive Oil Tin + 2 Pomegranate Molasses',
    amountUsd: 125.0,
    scheduledEta: 'Today at 3:30 PM',
    status: 'IN_TRANSIT',
    driverName: 'Samir Kassem (Choueifat Fleet)',
    driverPhone: '+961 70 112233',
    repCommission: 6.25,
    driverLocation: { lat: 33.8886, lng: 35.4955, lastUpdate: '2 mins ago' },
  },
  {
    id: 'ORD-SO-9922',
    customerName: 'George Haddad',
    customerPhone: '+961 71 445566',
    customerAddress: 'Jounieh - Haret Sakhr',
    offerDetails: 'Pantry Bundle: 3 Pomegranate Molasses + Mixed Pickles',
    amountUsd: 45.0,
    scheduledEta: 'Today at 5:00 PM',
    status: 'DELIVERED',
    driverName: 'Ali Reda',
    driverPhone: '+961 3 556677',
    repCommission: 2.25,
  },
  {
    id: 'ORD-SO-9924',
    customerName: 'Karim Saab',
    customerPhone: '+961 70 223344',
    customerAddress: 'Choueifat - Municipality Road',
    offerDetails: '5L Olive Oil Gallon + Organic Olive Soap',
    amountUsd: 65.0,
    scheduledEta: 'Tomorrow Morning',
    status: 'PENDING',
    statusReason: 'Customer requested rescheduling to tomorrow (out of town)',
    repCommission: 3.25,
  },
  {
    id: 'ORD-SO-9923',
    customerName: 'Rana El-Masri',
    customerPhone: '+961 76 998877',
    customerAddress: 'Sidon - Commercial District',
    offerDetails: '2x 17.5L Extra Virgin Olive Oil Tin',
    amountUsd: 220.0,
    scheduledEta: 'Cancelled',
    status: 'CANCELLED',
    statusReason: 'Customer cancelled order - purchased from retail store',
    repCommission: 0.0,
  },
];

export default function SocialRepStatisticsAndTracking() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'statistics' | 'live_tracking'>('statistics');

  // Role: Rep Personal View vs Management Overview
  const [isManagementView, setIsManagementView] = useState(false);
  const [selectedRepCode, setSelectedRepCode] = useState('ALL');

  // Time Period Filter
  const initialDateRange = getDefaultInitialDateRange('This Month');
  const [periodFilter, setPeriodFilter] = useState('this_month');
  const [fromDate, setFromDate] = useState(initialDateRange.fromDate);
  const [toDate, setToDate] = useState(initialDateRange.toDate);

  // Map Modal State for Live Location
  const [selectedLiveOrder, setSelectedLiveOrder] = useState<TrackingOrder | null>(null);

  // Statistics Calculation
  const totalOrdersCount = SAMPLE_TRACKING_ORDERS.length;
  const deliveredCount = SAMPLE_TRACKING_ORDERS.filter((o) => o.status === 'DELIVERED').length;
  const inTransitCount = SAMPLE_TRACKING_ORDERS.filter((o) => o.status === 'IN_TRANSIT').length;
  const pendingCount = SAMPLE_TRACKING_ORDERS.filter((o) => o.status === 'PENDING').length;
  const cancelledCount = SAMPLE_TRACKING_ORDERS.filter((o) => o.status === 'CANCELLED').length;
  
  const earnedCommission = SAMPLE_TRACKING_ORDERS
    .filter((o) => o.status === 'DELIVERED')
    .reduce((sum, o) => sum + o.repCommission, 0);
  
  const pendingCommission = SAMPLE_TRACKING_ORDERS
    .filter((o) => o.status === 'IN_TRANSIT' || o.status === 'PENDING')
    .reduce((sum, o) => sum + o.repCommission, 0);

  return (
    <div className="w-full min-h-screen bg-background p-4 md:p-6 font-sans text-foreground text-left select-none">
      
      {/* 1. Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-border gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              Sales Statistics & Order Tracking (SuperSonic Live Tracking)
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            Vanguard ERP - Track delivered, in-transit, pending, and cancelled social orders
          </p>
        </div>

        {/* Tab & Role Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsManagementView(!isManagementView)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              isManagementView
                ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                : 'bg-card text-foreground border-border hover:bg-muted'
            }`}
          >
            {isManagementView ? 'Management View (All Reps)' : 'Personal View (My Account)'}
          </button>

          <div className="flex items-center bg-muted p-1 rounded-xl border border-border gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('statistics')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'statistics'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Statistics Dashboard
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('live_tracking')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'live_tracking'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Live Fleet Tracking
            </button>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. TOP FILTER BAR (PERIODS & REP SELECTOR)                         */}
      {/* =================================================================== */}
      <div className="bg-card rounded-xl border border-border shadow-xs p-4 mb-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Period Selector Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
            <span className="text-muted-foreground mr-1">Period:</span>
            {[
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: 'this_month', label: 'This Month' },
              { id: 'last_month', label: 'Last Month' },
              { id: 'last_year', label: 'Last Year' },
              { id: 'custom', label: 'Custom Range' },
            ].map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => {
                  setPeriodFilter(btn.id);
                  if (btn.id !== 'custom') {
                    const resolved = resolveDateRangeFromPreset(btn.id, fromDate, toDate);
                    setFromDate(resolved.fromDate);
                    setToDate(resolved.toDate);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  periodFilter === btn.id
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                    : 'bg-muted text-foreground border-border hover:bg-slate-200'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Management Mode: Rep Selector */}
          {isManagementView && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-foreground">Sales Rep:</label>
              <select
                value={selectedRepCode}
                onChange={(e) => setSelectedRepCode(e.target.value)}
                className="px-3 py-1.5 bg-card border border-border rounded-lg text-xs font-semibold text-foreground focus:outline-none focus:border-primary"
              >
                <option value="ALL">All Representatives (All Branches)</option>
                <option value="REP-SO-8492">Ahmad Ali Kassem (Code: ADM-REP-01)</option>
                <option value="REP-SO-8493">Hiba Al-Elw (Code: ADM-REP-02)</option>
                <option value="REP-SO-8494">Hussein Mehdi (Code: ADM-REP-03)</option>
              </select>
            </div>
          )}

        </div>

        {periodFilter === 'custom' && (
          <div className="flex items-center gap-3 pt-2 border-t border-border/60 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-medium text-muted-foreground">From Date:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-2.5 py-1 border border-border rounded-lg font-mono bg-card text-foreground"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-muted-foreground">To Date:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-2.5 py-1 border border-border rounded-lg font-mono bg-card text-foreground"
              />
            </div>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* TAB 1: STATISTICS DASHBOARD (ALL 4 STATUSES + COMMISSIONS)         */}
      {/* =================================================================== */}
      {activeTab === 'statistics' && (
        <div className="space-y-6">
          
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            
            {/* Total Orders */}
            <div className="bg-card p-3.5 rounded-xl border border-border shadow-xs text-center space-y-1">
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Total Orders</div>
              <div className="text-xl font-bold font-mono text-foreground">{totalOrdersCount}</div>
              <div className="text-[10px] text-muted-foreground">Social Inquiries</div>
            </div>

            {/* Delivered */}
            <div className="bg-card p-3.5 rounded-xl border border-emerald-200 shadow-xs text-center space-y-1 bg-emerald-50/20">
              <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wide">Delivered</div>
              <div className="text-xl font-bold font-mono text-emerald-700">{deliveredCount}</div>
              <div className="text-[10px] text-emerald-700 font-medium">Fully Collected</div>
            </div>

            {/* In Transit */}
            <div className="bg-card p-3.5 rounded-xl border border-blue-200 shadow-xs text-center space-y-1 bg-blue-50/20">
              <div className="text-[11px] font-semibold text-blue-800 uppercase tracking-wide">In Transit</div>
              <div className="text-xl font-bold font-mono text-blue-700">{inTransitCount}</div>
              <div className="text-[10px] text-blue-700 font-medium">With Courier</div>
            </div>

            {/* Pending / Postponed */}
            <div className="bg-card p-3.5 rounded-xl border border-amber-200 shadow-xs text-center space-y-1 bg-amber-50/20">
              <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wide">Pending</div>
              <div className="text-xl font-bold font-mono text-amber-700">{pendingCount}</div>
              <div className="text-[10px] text-amber-700 font-medium">Rescheduled</div>
            </div>

            {/* Cancelled */}
            <div className="bg-card p-3.5 rounded-xl border border-rose-200 shadow-xs text-center space-y-1 bg-rose-50/20">
              <div className="text-[11px] font-semibold text-rose-800 uppercase tracking-wide">Cancelled</div>
              <div className="text-xl font-bold font-mono text-rose-700">{cancelledCount}</div>
              <div className="text-[10px] text-rose-700 font-medium">With Cause Stated</div>
            </div>

            {/* Commissions */}
            <div className="bg-card p-3.5 rounded-xl border border-border shadow-xs text-center space-y-1 col-span-2 md:col-span-1">
              <div className="text-[11px] font-semibold text-foreground uppercase tracking-wide">Earned Commission</div>
              <div className="text-xl font-bold font-mono text-emerald-700">${earnedCommission.toFixed(2)}</div>
              <div className="text-[10px] text-muted-foreground">+ ${pendingCommission.toFixed(2)} Pending</div>
            </div>

          </div>

          {/* Detailed Performance Table (Vanguard Style) */}
          <div className="bg-card rounded-xl border border-border shadow-xs p-4 space-y-3">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wide border-b border-border/60 pb-2">
              Representative Orders Ledger & Delivery Status
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-3">Order ID</th>
                    <th className="py-2.5 px-3">Customer & Contact</th>
                    <th className="py-2.5 px-3">Package / Offer Details</th>
                    <th className="py-2.5 px-3 text-right">Amount ($)</th>
                    <th className="py-2.5 px-3 text-right">Commission ($)</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3">Remarks / Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-medium text-xs">
                  {SAMPLE_TRACKING_ORDERS.map((ord) => (
                    <tr key={ord.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-primary">{ord.id}</td>
                      <td className="py-2.5 px-3 font-medium text-foreground">
                        <div>{ord.customerName}</div>
                        <div className="text-[11px] font-mono text-muted-foreground">{ord.customerPhone}</div>
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">{ord.offerDetails}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">${ord.amountUsd.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                        ${ord.repCommission.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {ord.status === 'DELIVERED' && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10.5px] font-bold">Delivered ✓</span>
                        )}
                        {ord.status === 'IN_TRANSIT' && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10.5px] font-bold">In Transit 🚗</span>
                        )}
                        {ord.status === 'PENDING' && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10.5px] font-bold">Pending ⏳</span>
                        )}
                        {ord.status === 'CANCELLED' && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10.5px] font-bold">Cancelled ✕</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground text-[11px]">
                        {ord.statusReason || 'Successfully Delivered'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: LIVE ORDERS TRACKING & SUPERSONIC INTEGRATION                */}
      {/* =================================================================== */}
      {activeTab === 'live_tracking' && (
        <div className="bg-card rounded-xl border border-border shadow-xs p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
              Active Field Deliveries & Live Fleet Tracking
            </h3>
            <span className="text-xs text-muted-foreground font-mono">SuperSonic Dispatch Dispatcher</span>
          </div>

          <div className="space-y-3">
            {SAMPLE_TRACKING_ORDERS.filter((o) => o.status !== 'DELIVERED').map((order) => (
              <div key={order.id} className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-primary">{order.id}</span>
                    <span className="font-bold text-xs text-foreground">{order.customerName}</span>
                    <span className="text-muted-foreground text-xs">({order.customerAddress})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                      order.status === 'IN_TRANSIT' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      order.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      ETA: {order.scheduledEta}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between pt-2 border-t border-border/60 text-xs text-muted-foreground">
                  <div>
                    <span>Assigned Courier: </span>
                    <span className="font-bold text-foreground">{order.driverName || 'Pending Courier Assignment'}</span>
                    {order.driverPhone && <span className="font-mono text-muted-foreground ml-1">({order.driverPhone})</span>}
                  </div>

                  {order.status === 'IN_TRANSIT' && order.driverLocation && (
                    <button
                      type="button"
                      onClick={() => setSelectedLiveOrder(order)}
                      className="px-3 py-1.5 bg-primary hover:bg-slate-800 text-primary-foreground text-xs font-medium rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <MapPin size={13} />
                      <span>View Live GPS Location</span>
                    </button>
                  )}

                  {(order.status === 'PENDING' || order.status === 'CANCELLED') && (
                    <div className="text-amber-800 font-medium">
                      Note: {order.statusReason}
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* =================================================================== */}
      {/* 3. LIVE GPS LOCATION MAP MODAL POPUP                               */}
      {/* =================================================================== */}
      {selectedLiveOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 select-none">
          <div className="bg-card w-full max-w-lg rounded-xl border border-border shadow-xl overflow-hidden text-left">
            
            <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <h4 className="text-xs font-bold uppercase tracking-wide">
                  Live Dispatch Courier Tracking: {selectedLiveOrder.id}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLiveOrder(null)}
                className="text-primary-foreground/70 hover:text-primary-foreground font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div className="bg-muted p-3 rounded-xl border border-border text-foreground space-y-1">
                <div className="font-bold">Courier: {selectedLiveOrder.driverName}</div>
                <div>Recipient: {selectedLiveOrder.customerName} - {selectedLiveOrder.customerAddress}</div>
                <div className="text-[11px] text-muted-foreground font-mono">Last GPS Ping: {selectedLiveOrder.driverLocation?.lastUpdate}</div>
              </div>

              <div className="w-full h-48 bg-muted/40 rounded-xl border border-border flex flex-col items-center justify-center text-muted-foreground space-y-2 font-mono">
                <Navigation size={28} className="text-primary animate-pulse" />
                <div className="text-xs font-bold text-foreground">Active Corridor Route Coordinates</div>
                <div className="text-[11px] text-muted-foreground">
                  Lat: {selectedLiveOrder.driverLocation?.lat}, Lng: {selectedLiveOrder.driverLocation?.lng}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedLiveOrder(null)}
                  className="px-4 py-2 bg-primary text-primary-foreground hover:bg-slate-800 rounded-lg font-medium text-xs shadow-xs cursor-pointer"
                >
                  Close Live Tracker
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
