'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  OnlineOrder,
  initialOrdersList,
  branchesList,
  FulfillmentStatus,
} from './orders-data';

export default function OnlineOrdersControlCenterPage() {
  const [ordersList] = useState<OnlineOrder[]>(initialOrdersList);
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchOrderNo, setSearchOrderNo] = useState('');
  const [lastSyncSeconds, setLastSyncSeconds] = useState(48);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<OnlineOrder | null>(null);

  // Auto-reload countdown simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setLastSyncSeconds((prev) => (prev > 0 ? prev - 1 : 120));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Metrics Calculation
  const totalOrdersCount = ordersList.length;
  const fullyReceivedCount = ordersList.filter((o) => o.status === 'FULLY_RECEIVED').length;
  const partiallyReceivedCount = ordersList.filter((o) => o.status === 'PARTIALLY_RECEIVED').length;
  const notReceivedYetCount = ordersList.filter((o) => o.status === 'NOT_RECEIVED_YET').length;

  // Filtering Logic
  const filteredOrders = ordersList.filter((order) => {
    const matchesBranch = selectedBranch === 'ALL' || order.branchName.includes(selectedBranch);
    const matchesStatus =
      selectedStatus === 'ALL' ||
      (selectedStatus === 'PARTIALLY_OR_NOT' && order.status !== 'FULLY_RECEIVED') ||
      order.status === selectedStatus;
    const matchesSearch =
      searchOrderNo.trim() === '' ||
      order.orderNo.toLowerCase().includes(searchOrderNo.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchOrderNo.toLowerCase()) ||
      order.zoneName.toLowerCase().includes(searchOrderNo.toLowerCase());

    return matchesBranch && matchesStatus && matchesSearch;
  });

  const handleResetFilters = () => {
    setSelectedBranch('ALL');
    setSelectedStatus('ALL');
    setSearchOrderNo('');
  };

  const getStatusBadge = (status: FulfillmentStatus) => {
    switch (status) {
      case 'FULLY_RECEIVED':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-300 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Fully Received
          </span>
        );
      case 'PARTIALLY_RECEIVED':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px] border border-amber-300 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            Partially Received
          </span>
        );
      case 'NOT_RECEIVED_YET':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px] border border-rose-300 inline-flex items-center gap-1 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
            Not Received Yet
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full flex flex-col min-h-[calc(100vh-100px)] select-none text-left font-sans space-y-4 max-w-[1440px] mx-auto px-2 pb-8">
      
      {/* =================================================================== */}
      {/* 1. TOP TITLE & DESCRIPTION                                          */}
      {/* =================================================================== */}
      <div className="flex flex-wrap items-start justify-between gap-2 pt-1">
        <div>
          <h1 className="text-xl font-extrabold text-[#0f172a] tracking-tight">Online Orders Control Center</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor online orders and check whether they are fully, partially, or not yet received in POS.
          </p>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. TOP 5 METRIC CARDS                                               */}
      {/* =================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
        
        {/* Card 1: Total Orders */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100/70 text-blue-700 flex items-center justify-center font-bold text-lg">
            📦
          </div>
          <div>
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Total Orders</span>
            <span className="text-xl font-extrabold text-slate-900 leading-tight">{totalOrdersCount}</span>
          </div>
        </div>

        {/* Card 2: Fully Received */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100/70 text-emerald-700 flex items-center justify-center font-bold text-lg">
            ✓
          </div>
          <div>
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Fully Received</span>
            <span className="text-xl font-extrabold text-slate-900 leading-tight">{fullyReceivedCount}</span>
          </div>
        </div>

        {/* Card 3: Partially Received */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100/70 text-amber-700 flex items-center justify-center font-bold text-lg">
            ⏳
          </div>
          <div>
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Partially Received</span>
            <span className="text-xl font-extrabold text-slate-900 leading-tight">{partiallyReceivedCount}</span>
          </div>
        </div>

        {/* Card 4: Not Received Yet */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-100/70 text-rose-700 flex items-center justify-center font-bold text-lg">
            ⚠️
          </div>
          <div>
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Not Received Yet</span>
            <span className="text-xl font-extrabold text-slate-900 leading-tight">{notReceivedYetCount}</span>
          </div>
        </div>

        {/* Card 5: Last Sync */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-lg">
            🔄
          </div>
          <div className="text-[10.5px]">
            <span className="font-bold text-slate-400 uppercase tracking-wider block">Last Sync</span>
            <span className="font-extrabold text-slate-800 block leading-tight">{lastSyncSeconds} sec ago</span>
            <span className="text-[9.5px] text-slate-400 font-mono block">Auto reload every 2 min</span>
          </div>
        </div>

      </div>

      {/* =================================================================== */}
      {/* 3. FILTER & SEARCH CONTROL BAR                                      */}
      {/* =================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3 px-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        
        <div className="flex flex-wrap items-center gap-3 flex-1">
          
          {/* Branch Selector */}
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 focus:outline-none min-w-[200px]"
          >
            <option value="ALL">Select Branch (All Branches)</option>
            {branchesList.map((b) => (
              <option key={b.id} value={b.name.split(' - ')[1] || b.name}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 focus:outline-none min-w-[200px]"
          >
            <option value="ALL">All POS Receipt Statuses</option>
            <option value="PARTIALLY_OR_NOT">Partially or Not Received</option>
            <option value="NOT_RECEIVED_YET">Not Received Yet</option>
            <option value="PARTIALLY_RECEIVED">Partially Received</option>
            <option value="FULLY_RECEIVED">Fully Received</option>
          </select>

          {/* Search Input */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 flex-1 max-w-sm">
            <span className="text-slate-400 text-xs">🔍</span>
            <input
              type="text"
              value={searchOrderNo}
              onChange={(e) => setSearchOrderNo(e.target.value)}
              placeholder="Search order no, customer, zone..."
              className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => alert(`Filters Applied: ${filteredOrders.length} matching orders`)}
            className="px-5 py-2 bg-[#334155] hover:bg-[#1e293b] text-white font-bold rounded-xl text-xs shadow-2xs transition-colors"
          >
            Filter
          </button>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs border border-slate-300 transition-colors"
          >
            Reset
          </button>
        </div>

      </div>

      {/* =================================================================== */}
      {/* 4. ONLINE ORDERS LIST TABLE SECTION                                 */}
      {/* =================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
        
        <div>
          <h2 className="text-sm font-bold text-slate-900">Online Orders List</h2>
          <p className="text-[11px] text-slate-400">Track receipt progress in POS for each online order.</p>
        </div>

        <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                <th className="py-2.5 px-3 normal-case">order no.</th>
                <th className="py-2.5 px-3 normal-case">order date</th>
                <th className="py-2.5 px-3 normal-case">delivery date</th>
                <th className="py-2.5 px-3 normal-case">customer name</th>
                <th className="py-2.5 px-3 normal-case text-center">platform</th>
                <th className="py-2.5 px-3 normal-case text-right">total amount</th>
                <th className="py-2.5 px-3 normal-case text-center">pos receipt status</th>
                <th className="py-2.5 px-3 normal-case">zone name</th>
                <th className="py-2.5 px-3 normal-case">branch name</th>
                <th className="py-2.5 px-3 normal-case text-center">actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-[11.5px] text-slate-800">
              {filteredOrders.map((order) => (
                <tr key={order.orderNo} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-[#1e3a2b]">{order.orderNo}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">{order.orderDate}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">{order.deliveryDate}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{order.customerName}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-semibold text-[10.5px]">
                      <span>{order.platformIcon}</span>
                      <span>{order.platform}</span>
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{order.totalAmount}</td>
                  <td className="py-2.5 px-3 text-center">{getStatusBadge(order.status)}</td>
                  <td className="py-2.5 px-3 text-slate-700 font-medium">{order.zoneName}</td>
                  <td className="py-2.5 px-3 text-slate-600 font-mono text-[10.5px]">{order.branchName}</td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => setSelectedOrderDetails(order)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-[#1e3a2b] hover:text-white text-slate-700 rounded-lg text-[10.5px] font-bold border border-slate-300 transition-colors"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-400 font-medium">
                    No online orders matching the selected filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex justify-center items-center gap-1 pt-2">
          <button type="button" disabled className="px-2.5 py-1 rounded bg-slate-100 text-slate-400 text-xs border border-slate-200">«</button>
          <button type="button" className="px-3 py-1 rounded bg-[#1e3a2b] text-white font-bold text-xs shadow-2xs">1</button>
          <button type="button" disabled className="px-2.5 py-1 rounded bg-slate-100 text-slate-400 text-xs border border-slate-200">»</button>
        </div>

      </div>

      {/* =================================================================== */}
      {/* 5. ORDER DETAILS QUICK-VIEW MODAL                                   */}
      {/* =================================================================== */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-[#f8faf8]">
              <div className="flex items-center gap-2">
                <span className="text-base">{selectedOrderDetails.platformIcon}</span>
                <h3 className="text-base font-bold text-slate-900">Order #{selectedOrderDetails.orderNo}</h3>
              </div>
              <button type="button" onClick={() => setSelectedOrderDetails(null)} className="text-slate-400 hover:text-slate-700 font-bold text-sm">✕</button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-800 leading-relaxed">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono">
                <div><span className="text-slate-400 text-[10px] block">CUSTOMER</span><strong className="text-slate-900">{selectedOrderDetails.customerName}</strong></div>
                <div><span className="text-slate-400 text-[10px] block">PLATFORM</span><strong className="text-slate-900">{selectedOrderDetails.platform}</strong></div>
                <div><span className="text-slate-400 text-[10px] block">DELIVERY ZONE</span><strong className="text-slate-900">{selectedOrderDetails.zoneName}</strong></div>
                <div><span className="text-slate-400 text-[10px] block">FULFILLMENT BRANCH</span><strong className="text-slate-900">{selectedOrderDetails.branchName}</strong></div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 text-[10px] font-mono block">ITEMS & PACKING LIST</span>
                <p className="font-semibold text-slate-900 text-xs">{selectedOrderDetails.itemsSummary}</p>
              </div>

              <div className="flex justify-between items-center bg-[#edf2ee] p-3 rounded-xl border border-[#1e3a2b]/30">
                <span className="font-bold text-slate-800">Total Invoice Value:</span>
                <strong className="text-[#1e3a2b] font-mono text-sm font-extrabold">{selectedOrderDetails.totalAmount}</strong>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-200 bg-[#f8faf8] flex justify-between items-center">
              <Link
                href="/backoffice/fleet"
                className="px-3.5 py-1.5 bg-[#1e3a2b] text-white font-bold rounded-lg text-xs hover:bg-[#14281e] transition-colors flex items-center gap-1.5"
              >
                <span>🚚 Dispatch to SuperSonic Van</span>
              </Link>
              <button type="button" onClick={() => setSelectedOrderDetails(null)} className="px-4 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-lg text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
