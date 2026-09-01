'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  OnlineOrder,
  initialOrdersList,
  branchesList,
  OrderStatus,
  FulfillmentType,
} from './orders-data';

export default function OnlineOrdersControlCenterPage() {
  const [ordersList, setOrdersList] = useState<OnlineOrder[]>(initialOrdersList);
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [selectedFulfillment, setSelectedFulfillment] = useState('ALL');
  const [searchOrderNo, setSearchOrderNo] = useState('');
  const [lastSyncSeconds, setLastSyncSeconds] = useState(48);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<OnlineOrder | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setLastSyncSeconds((prev) => (prev > 0 ? prev - 1 : 120));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalOrdersCount = ordersList.length;
  const inStorePickupCount = ordersList.filter((o) => o.fulfillmentType === 'IN_STORE_PICKUP').length;
  const pendingPickupCount = ordersList.filter((o) => o.status === 'PENDING_PICKUP_POS').length;
  const deliveryFleetCount = ordersList.filter((o) => o.fulfillmentType === 'DELIVERY').length;

  const filteredOrders = ordersList.filter((order) => {
    const matchesBranch = selectedBranch === 'ALL' || order.branchName.includes(selectedBranch);
    const matchesFulfillment =
      selectedFulfillment === 'ALL' || order.fulfillmentType === selectedFulfillment;
    const matchesSearch =
      searchOrderNo.trim() === '' ||
      order.orderNo.toLowerCase().includes(searchOrderNo.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchOrderNo.toLowerCase()) ||
      order.repAccount.toLowerCase().includes(searchOrderNo.toLowerCase()) ||
      order.zoneName.toLowerCase().includes(searchOrderNo.toLowerCase());

    return matchesBranch && matchesFulfillment && matchesSearch;
  });

  // Action: Pick Up & Credit Commission
  const handleMarkAsPickedUp = (orderNo: string) => {
    setOrdersList((prev) =>
      prev.map((o) => {
        if (o.orderNo === orderNo) {
          return {
            ...o,
            status: 'PICKED_UP_AND_CREDITED',
            commissionCredited: true,
          };
        }
        return o;
      })
    );
    const found = ordersList.find((o) => o.orderNo === orderNo);
    if (found) {
      alert(`✓ Order ${orderNo} Picked Up!\nCommission of ${found.commissionAmount} was automatically credited to ${found.repAccount}.`);
    }
    setSelectedOrderDetails(null);
  };

  const handleResetFilters = () => {
    setSelectedBranch('ALL');
    setSelectedFulfillment('ALL');
    setSearchOrderNo('');
  };

  const getFulfillmentBadge = (type: FulfillmentType) => {
    if (type === 'IN_STORE_PICKUP') {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-[10.5px] border border-purple-300 inline-flex items-center gap-1">
          <span>🏪</span>
          In-Store Pickup (POS)
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10.5px] border border-blue-300 inline-flex items-center gap-1">
        <span>🚚</span>
        SuperSonic Fleet Delivery
      </span>
    );
  };

  const getStatusBadge = (status: OrderStatus, credited: boolean) => {
    switch (status) {
      case 'PENDING_PICKUP_POS':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10.5px] border border-amber-300 inline-flex items-center gap-1 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            Pending Pickup at POS (% Pending)
          </span>
        );
      case 'PICKED_UP_AND_CREDITED':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10.5px] border border-emerald-300 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Picked Up (% Credited to Rep)
          </span>
        );
      case 'DISPATCHED_FLEET':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold text-[10.5px] border border-indigo-300 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
            Loaded on Fleet Van
          </span>
        );
      case 'DELIVERED_COD':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10.5px] border border-emerald-300 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Delivered & Paid (COD)
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full flex flex-col min-h-[calc(100vh-100px)] select-none text-left font-sans space-y-4 max-w-[1440px] mx-auto px-2 pb-8">
      
      {/* 1. TOP TITLE */}
      <div className="flex flex-wrap items-start justify-between gap-2 pt-1">
        <div>
          <h1 className="text-xl font-extrabold text-[#0f172a] tracking-tight">Online Orders Control Center</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Omnichannel order dispatch & showroom pickup center: Real-time rep commission crediting on pickup.
          </p>
        </div>
      </div>

      {/* 2. TOP 5 METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100/70 text-blue-700 flex items-center justify-center font-bold text-lg">📦</div>
          <div>
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Total Orders</span>
            <span className="text-xl font-extrabold text-slate-900 leading-tight">{totalOrdersCount}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-100/70 text-purple-700 flex items-center justify-center font-bold text-lg">🏪</div>
          <div>
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Showroom Pickups</span>
            <span className="text-xl font-extrabold text-slate-900 leading-tight">{inStorePickupCount}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100/70 text-amber-700 flex items-center justify-center font-bold text-lg">⏳</div>
          <div>
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Pending at POS</span>
            <span className="text-xl font-extrabold text-slate-900 leading-tight">{pendingPickupCount}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100/70 text-blue-700 flex items-center justify-center font-bold text-lg">🚚</div>
          <div>
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Fleet Deliveries</span>
            <span className="text-xl font-extrabold text-slate-900 leading-tight">{deliveryFleetCount}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-lg">🔄</div>
          <div className="text-[10.5px]">
            <span className="font-bold text-slate-400 uppercase tracking-wider block">Last Sync</span>
            <span className="font-extrabold text-slate-800 block leading-tight">{lastSyncSeconds} sec ago</span>
            <span className="text-[9.5px] text-slate-400 font-mono block">Auto reload every 2 min</span>
          </div>
        </div>
      </div>

      {/* 3. FILTER & SEARCH CONTROL BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3 px-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
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

          <select
            value={selectedFulfillment}
            onChange={(e) => setSelectedFulfillment(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 focus:outline-none min-w-[220px]"
          >
            <option value="ALL">All Fulfillment Types</option>
            <option value="IN_STORE_PICKUP">🏪 In-Store Showroom Pickups (POS)</option>
            <option value="DELIVERY">🚚 SuperSonic Fleet Deliveries</option>
          </select>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 flex-1 max-w-sm">
            <span className="text-slate-400 text-xs">🔍</span>
            <input
              type="text"
              value={searchOrderNo}
              onChange={(e) => setSearchOrderNo(e.target.value)}
              placeholder="Search order no, rep, customer, zone..."
              className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={() => alert(`Filters Applied: ${filteredOrders.length} matching orders`)} className="px-5 py-2 bg-[#334155] hover:bg-[#1e293b] text-white font-bold rounded-xl text-xs shadow-2xs transition-colors">
            Filter
          </button>
          <button type="button" onClick={handleResetFilters} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs border border-slate-300 transition-colors">
            Reset
          </button>
        </div>
      </div>

      {/* 4. ONLINE ORDERS LIST TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Online Orders Dispatch & Pickup Matrix</h2>
          <p className="text-[11px] text-slate-400">Track orders routed to showroom POS registers with automated sales commission crediting.</p>
        </div>

        <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                <th className="py-2.5 px-3 normal-case">order no.</th>
                <th className="py-2.5 px-3 normal-case">order date</th>
                <th className="py-2.5 px-3 normal-case">customer name</th>
                <th className="py-2.5 px-3 normal-case">originating rep</th>
                <th className="py-2.5 px-3 normal-case text-center">fulfillment type</th>
                <th className="py-2.5 px-3 normal-case text-right">total amount</th>
                <th className="py-2.5 px-3 normal-case text-right">rep commission</th>
                <th className="py-2.5 px-3 normal-case text-center">status</th>
                <th className="py-2.5 px-3 normal-case">branch / zone</th>
                <th className="py-2.5 px-3 normal-case text-center">action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-[11.5px] text-slate-800">
              {filteredOrders.map((order) => (
                <tr key={order.orderNo} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-[#1e3a2b]">{order.orderNo}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">{order.orderDate}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{order.customerName}</td>
                  <td className="py-2.5 px-3 text-slate-700 font-semibold">{order.repAccount}</td>
                  <td className="py-2.5 px-3 text-center">{getFulfillmentBadge(order.fulfillmentType)}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{order.totalAmount}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-purple-700">
                    <div>{order.commissionAmount}</div>
                    <span className="text-[9.5px] text-slate-400 font-normal">({order.commissionRate * 100}%)</span>
                  </td>
                  <td className="py-2.5 px-3 text-center">{getStatusBadge(order.status, order.commissionCredited)}</td>
                  <td className="py-2.5 px-3 text-slate-600 font-mono text-[10.5px]">
                    <div>{order.branchName.split(' - ')[0] || order.branchName}</div>
                    <span className="text-[10px] text-slate-400">{order.zoneName}</span>
                  </td>
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
            </tbody>
          </table>
        </div>

        <div className="flex justify-center items-center gap-1 pt-2">
          <button type="button" disabled className="px-2.5 py-1 rounded bg-slate-100 text-slate-400 text-xs border border-slate-200">«</button>
          <button type="button" className="px-3 py-1 rounded bg-[#1e3a2b] text-white font-bold text-xs shadow-2xs">1</button>
          <button type="button" disabled className="px-2.5 py-1 rounded bg-slate-100 text-slate-400 text-xs border border-slate-200">»</button>
        </div>
      </div>

      {/* 5. ORDER DETAILS QUICK-VIEW MODAL */}
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
                <div><span className="text-slate-400 text-[10px] block">ORIGINATING REP</span><strong className="text-purple-900">{selectedOrderDetails.repAccount}</strong></div>
                <div><span className="text-slate-400 text-[10px] block">FULFILLMENT</span><strong className="text-slate-900">{selectedOrderDetails.fulfillmentType === 'IN_STORE_PICKUP' ? '🏪 Showroom Pickup (POS)' : '🚚 SuperSonic Delivery'}</strong></div>
                <div><span className="text-slate-400 text-[10px] block">TARGET BRANCH</span><strong className="text-slate-900">{selectedOrderDetails.branchName}</strong></div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 text-[10px] font-mono block">ORDER ITEMS</span>
                <p className="font-semibold text-slate-900 text-xs">{selectedOrderDetails.itemsSummary}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-[#edf2ee] p-3 rounded-xl border border-[#1e3a2b]/30 font-mono">
                <div>
                  <span className="text-slate-500 text-[10px] block">INVOICE TOTAL</span>
                  <strong className="text-[#1e3a2b] text-sm font-extrabold">{selectedOrderDetails.totalAmount}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">REP COMMISSION ({selectedOrderDetails.commissionRate * 100}%)</span>
                  <strong className="text-purple-800 text-sm font-extrabold">{selectedOrderDetails.commissionAmount}</strong>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-200 bg-[#f8faf8] flex justify-between items-center">
              {selectedOrderDetails.fulfillmentType === 'IN_STORE_PICKUP' && selectedOrderDetails.status === 'PENDING_PICKUP_POS' ? (
                <button
                  type="button"
                  onClick={() => handleMarkAsPickedUp(selectedOrderDetails.orderNo)}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <span>🏪 Customer Picked Up ➔ Credit Commission</span>
                </button>
              ) : selectedOrderDetails.fulfillmentType === 'DELIVERY' ? (
                <Link
                  href="/backoffice/fleet"
                  className="px-3.5 py-1.5 bg-[#1e3a2b] text-white font-bold rounded-lg text-xs hover:bg-[#14281e] transition-colors flex items-center gap-1.5"
                >
                  <span>🚚 Dispatch to SuperSonic Van</span>
                </Link>
              ) : (
                <span className="text-xs font-bold text-emerald-700">✓ Order Completed & Commission Credited</span>
              )}
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
