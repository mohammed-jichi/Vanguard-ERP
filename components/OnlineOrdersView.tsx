'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Receipt,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  Eye,
  X,
  Clock,
  MapPin,
  Building,
  CreditCard,
  User,
  Phone,
  Mail,
  FileText,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import {
  OmegaOnlineOrder,
  INITIAL_ONLINE_ORDERS,
  ONLINE_ORDER_BRANCHES,
  ONLINE_ORDER_STATUSES
} from '@/lib/omegaOnlineOrdersData';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

export default function OnlineOrdersView() {
  const [orders, setOrders] = useState<OmegaOnlineOrder[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('vanguard_online_orders');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_ONLINE_ORDERS;
  });

  // Filter States
  const [selectedBranchId, setSelectedBranchId] = useState<number>(-1);
  const [selectedStatus, setSelectedStatus] = useState<number | string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [orderType, setOrderType] = useState<number>(1); // 1 = External Orders, 2 = Omenu Orders

  // Sync Timer Simulation
  const [lastSyncSeconds, setLastSyncSeconds] = useState<number>(12);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<OmegaOnlineOrder | null>(null);

  // Toast System
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'info' });
  const showToast = (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3500);
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('vanguard_online_orders', JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  // Periodic Timer for Last Sync
  useEffect(() => {
    const timer = setInterval(() => {
      setLastSyncSeconds(prev => (prev < 120 ? prev + 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute Statistics dynamically
  const stats = useMemo(() => {
    const currentTypeOrders = orders.filter(o => o.order_type === orderType);
    const total = currentTypeOrders.length;
    const fully = currentTypeOrders.filter(o => o.status === -1 || o.status === -3).length;
    const partial = currentTypeOrders.filter(o => o.status === -2).length;
    const notReceived = currentTypeOrders.filter(o => o.status === 0).length;

    return {
      total,
      fully,
      partial,
      notReceived
    };
  }, [orders, orderType]);

  // Filtered Orders List
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      // Order Type check
      if (o.order_type !== orderType) return false;

      // Branch filter
      if (selectedBranchId !== -1 && o.branchid !== selectedBranchId) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all') {
        if (Number(selectedStatus) === 100) {
          if (o.order_status !== 100) return false;
        } else if (Number(selectedStatus) === -1) {
          if (o.status !== -1 && o.status !== -3) return false;
        } else if (o.status !== Number(selectedStatus)) {
          return false;
        }
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchOrder = o.orderid.toLowerCase().includes(q);
        const matchCustomer = `${o.customer_fname} ${o.customer_lname}`.toLowerCase().includes(q);
        const matchPhone = o.customer_phone.toLowerCase().includes(q);
        const matchZone = o.zonename.toLowerCase().includes(q);
        if (!matchOrder && !matchCustomer && !matchPhone && !matchZone) return false;
      }

      return true;
    });
  }, [orders, orderType, selectedBranchId, selectedStatus, searchQuery]);

  // Check if there are pending orders for type indicator dot
  const hasPendingOrders = (type: number) => {
    return orders.some(o => o.order_type === type && (o.status === 0 || o.status === -2));
  };

  // Actions
  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastSyncSeconds(0);
      showToast('Online orders data synchronized with POS', 'success');
    }, 600);
  };

  const handleResetFilters = () => {
    setSelectedBranchId(-1);
    setSelectedStatus('all');
    setSearchQuery('');
    showToast('Filters reset', 'info');
  };

  const handleMarkAsFullyReceived = (orderId: number) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            status: -1,
            items: o.items.map(i => ({
              ...i,
              issent: -1,
              linked_items: i.linked_items?.map(li => ({ ...li, issent: -1 }))
            }))
          };
        }
        return o;
      })
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => (prev ? { ...prev, status: -1 } : null));
    }
    showToast('Order marked as fully received in POS', 'success');
  };

  const handleRepushOrder = (orderId: number) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            status: -1
          };
        }
        return o;
      })
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => (prev ? { ...prev, status: -1 } : null));
    }
    showToast('Order pushed successfully to POS register', 'success');
  };

  // Format Helpers
  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr.split(' ')[1] || dateStr;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    } catch {
      return dateStr.split(' ')[0] || dateStr;
    }
  };

  return (
    <div className="w-full bg-[#f8fafc] text-slate-800 font-sans min-h-screen">
      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div className="fixed top-5 right-5 z-[9999] animate-fadeIn">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-xl border text-sm font-medium ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : toast.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-300'
                : 'bg-blue-50 text-blue-800 border-blue-300'
            }`}
          >
            {toast.type === 'success' && <span className="text-emerald-600 font-bold">✓</span>}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600" />}
            {toast.type === 'info' && <span className="text-blue-600 font-bold">ℹ</span>}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="px-6 pt-5 pb-3">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-2">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-1">
              Online Orders Control Center
            </h1>
            <p className="text-xs text-slate-500">
              Monitor online orders and check whether they are fully, partially, or not yet received in POS.
            </p>
          </div>
          <div className="text-end">
            <ul className="flex items-center gap-1.5 text-xs text-slate-500">
              <li>
                <Link href="/backoffice/dashboard" className="hover:text-blue-600 transition-colors">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li className="text-slate-800 font-medium">Online Orders</li>
            </ul>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="px-6 pb-12 space-y-4">
        {/* ========================================================= */}
        {/* 1. 5 KPI METRIC CARDS                                      */}
        {/* ========================================================= */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* Total Orders */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500">Total Orders</div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                {stats.total.toLocaleString()}
              </h3>
            </div>
          </div>

          {/* Fully Received */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500">Fully Received</div>
              <h3 className="text-lg font-bold text-emerald-700 leading-tight">
                {stats.fully.toLocaleString()}
              </h3>
            </div>
          </div>

          {/* Partially Received */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500">Partially Received</div>
              <h3 className="text-lg font-bold text-amber-700 leading-tight">
                {stats.partial.toLocaleString()}
              </h3>
            </div>
          </div>

          {/* Not Received Yet */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500">Not Received Yet</div>
              <h3 className="text-lg font-bold text-rose-700 leading-tight">
                {stats.notReceived.toLocaleString()}
              </h3>
            </div>
          </div>

          {/* Last Sync */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex items-center gap-3">
            <div
              onClick={handleManualRefresh}
              className="w-11 h-11 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 cursor-pointer hover:bg-slate-200 transition-colors"
              title="Click to sync now"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            </div>
            <div className="text-[11px]">
              <div className="font-semibold text-slate-500">Last Sync</div>
              <h4 className="text-xs font-bold text-slate-900 leading-tight">
                {lastSyncSeconds === 0 ? 'Just now' : `${lastSyncSeconds}s ago`}
              </h4>
              <div className="text-[10px] text-slate-400 mt-0.5">Auto reload every 2 min</div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. STICKY TOOLBAR FILTER BAR                               */}
        {/* ========================================================= */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs sticky top-0 z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
            {/* Branch Selector */}
            <div className="col-span-12 md:col-span-3">
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(Number(e.target.value))}
                className="w-full text-xs bg-white border border-slate-300 rounded py-2 px-3 text-slate-800 font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                {ONLINE_ORDER_BRANCHES.map(b => (
                  <option key={b.BRANCHID} value={b.BRANCHID}>
                    {b.BARANCHNAME}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Selector */}
            <div className="col-span-12 md:col-span-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="w-full text-xs bg-white border border-slate-300 rounded py-2 px-3 text-slate-800 font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                {ONLINE_ORDER_STATUSES.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="col-span-12 md:col-span-3 relative">
              <input
                type="search"
                placeholder="Search order no, customer, zone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded py-2 pl-9 pr-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            {/* Order Type Toggle: External Orders vs Omenu Orders */}
            <div className="col-span-12 md:col-span-2 flex items-center justify-center">
              <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-50 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setOrderType(1)}
                  className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                    orderType === 1 ? 'bg-[#3b82f6] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {hasPendingOrders(1) && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  )}
                  <span>External Orders</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType(2)}
                  className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                    orderType === 2 ? 'bg-[#3b82f6] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {hasPendingOrders(2) && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  )}
                  <span>Omenu Orders</span>
                </button>
              </div>
            </div>

            {/* Action Buttons: Filter & Reset */}
            <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => showToast(`Filtered ${filteredOrders.length} orders`, 'info')}
                className="inline-flex items-center gap-1 px-3.5 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-xs font-semibold rounded shadow-xs transition-colors cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filter</span>
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded transition-colors cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. ONLINE ORDERS DATA TABLE                                */}
        {/* ========================================================= */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-200 bg-white flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Online Orders List</h2>
              <p className="text-[11px] text-slate-500">Track receipt progress in POS for each online order.</p>
            </div>
            <span className="text-xs font-medium text-slate-500">
              Showing {filteredOrders.length} of {orders.filter(o => o.order_type === orderType).length} orders
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b-2 border-slate-200 text-slate-800 font-semibold text-[11px]">
                  <th className="py-2.5 px-3">Order No.</th>
                  <th className="py-2.5 px-3">Order Date</th>
                  <th className="py-2.5 px-3">Delivery Date</th>
                  <th className="py-2.5 px-3">Customer Name</th>
                  <th className="py-2.5 px-3">Platform</th>
                  <th className="py-2.5 px-3 text-end">Total Amount</th>
                  <th className="py-2.5 px-3 text-center">POS Receipt Status</th>
                  <th className="py-2.5 px-3">Zone Name</th>
                  <th className="py-2.5 px-3">Branch Name</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-10 text-center text-slate-400 font-medium">
                      No online orders found matching current criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order, idx) => (
                    <tr
                      key={order.id}
                      className={`hover:bg-blue-50/40 transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
                      }`}
                    >
                      {/* Order No */}
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-600">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="hover:underline cursor-pointer focus:outline-none"
                        >
                          {order.orderid}
                        </button>
                      </td>

                      {/* Order Date */}
                      <td className="py-2.5 px-3 font-mono text-[11px]">
                        <div>{formatTime(order.orderdate)}</div>
                        <div className="text-slate-400 text-[10px]">{formatDate(order.orderdate)}</div>
                      </td>

                      {/* Delivery Date */}
                      <td className="py-2.5 px-3 font-mono text-[11px]">
                        <div>{formatTime(order.delivery_time)}</div>
                        <div className="text-slate-400 text-[10px]">{formatDate(order.delivery_time)}</div>
                      </td>

                      {/* Customer Name */}
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        <div>{order.customer_fname} {order.customer_lname}</div>
                        <div className="text-slate-400 font-mono text-[10.5px] font-normal">{order.customer_phone}</div>
                      </td>

                      {/* Platform */}
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10.5px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {order.platform}
                        </span>
                      </td>

                      {/* Total Amount */}
                      <td className="py-2.5 px-3 text-end font-mono font-bold text-slate-900">
                        ${order.totalamount.toFixed(2)}
                      </td>

                      {/* POS Receipt Status */}
                      <td className="py-2.5 px-3 text-center">
                        {order.order_status === 100 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <XCircle className="w-3 h-3" />
                            <span>Cancelled</span>
                          </span>
                        ) : order.status === -1 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle className="w-3 h-3" />
                            <span>Fully Received</span>
                          </span>
                        ) : order.status === -3 ? (
                          <div className="inline-flex items-center gap-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle className="w-3 h-3" />
                              <span>Fully Received</span>
                            </span>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                              Accepted
                            </span>
                          </div>
                        ) : order.status === -2 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Partially Received</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <XCircle className="w-3 h-3" />
                            <span>Not Received Yet</span>
                          </span>
                        )}
                      </td>

                      {/* Zone Name */}
                      <td className="py-2.5 px-3 text-slate-700">
                        {order.zonename}
                      </td>

                      {/* Branch Name */}
                      <td className="py-2.5 px-3 text-slate-700">
                        {order.branchname}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          title="Preview Order"
                          className="p-1 rounded bg-[#3b82f6] hover:bg-[#2563eb] text-white transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* TABLE FOOTER */}
          <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {filteredOrders.length} records</span>
            <span className="font-mono text-[11px]">Page 1 of 1</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. MODAL: PREVIEW ORDER (orderDetailModal)                 */}
      {/* ========================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 bg-black/50 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-scaleUp">
            {/* Header */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold tracking-wide">Preview Order</h3>
                <span className="text-xs font-mono text-blue-300">({selectedOrder.orderid})</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 text-xs">
              {/* 3 Information Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Order Info */}
                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/60 space-y-2">
                  <div className="text-[11px] font-bold text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Order Info</span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Order No:</span>
                      <span className="font-mono font-bold text-slate-800">{selectedOrder.orderid}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Order Date:</span>
                      <span className="font-mono text-slate-700">{selectedOrder.orderdate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Delivery Date:</span>
                      <span className="font-mono text-slate-700">{selectedOrder.delivery_time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Platform:</span>
                      <span className="font-semibold text-slate-800">{selectedOrder.platform}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Branch:</span>
                      <span className="text-slate-700">{selectedOrder.branchname}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Zone:</span>
                      <span className="text-slate-700">{selectedOrder.zonename}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                      <span className="text-slate-500">Status:</span>
                      <div>
                        {selectedOrder.status === -1 ? (
                          <span className="font-bold text-emerald-700">Fully Received</span>
                        ) : selectedOrder.status === -2 ? (
                          <span className="font-bold text-amber-700">Partially Received</span>
                        ) : (
                          <span className="font-bold text-rose-700">Not Received Yet</span>
                        )}
                        {selectedOrder.status === 0 && (
                          <button
                            type="button"
                            onClick={() => handleRepushOrder(selectedOrder.id)}
                            className="ms-2 px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold"
                          >
                            Push Order
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/60 space-y-2">
                  <div className="text-[11px] font-bold text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>Customer Info</span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Name:</span>
                      <span className="font-bold text-slate-800">
                        {selectedOrder.customer_fname} {selectedOrder.customer_lname}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Phone:</span>
                      <span className="font-mono text-slate-700">{selectedOrder.customer_phone}</span>
                    </div>
                    {selectedOrder.customer_email && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Email:</span>
                        <span className="text-slate-700 truncate max-w-[140px]">{selectedOrder.customer_email}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500">Payment:</span>
                      <span className="font-semibold text-slate-800">
                        {selectedOrder.payment_id === 1 ? 'Cash on Delivery' : 'Paid Online'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/60 space-y-2">
                  <div className="text-[11px] font-bold text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>Delivery Address</span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">City:</span>
                      <span className="font-semibold text-slate-800">{selectedOrder.customer_city}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Street:</span>
                      <span className="text-slate-700">{selectedOrder.customer_street}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Notes:</span>
                      <span className="text-slate-700 text-[10.5px] block">{selectedOrder.customer_address}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Remark Note if any */}
              {selectedOrder.remark && (
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span><strong>Customer Note:</strong> {selectedOrder.remark}</span>
                </div>
              )}

              {/* Order Items List */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-100 px-4 py-2 text-xs font-bold text-slate-800 border-b border-slate-200">
                  Order Items
                </div>
                <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                  {selectedOrder.items.map((item, iIdx) => (
                    <div
                      key={iIdx}
                      className={`p-3 text-xs ${
                        item.issent === -2 ? 'bg-rose-50/50 border-l-4 border-l-rose-500' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-slate-900">
                            {item.name} <span className="text-slate-400 font-mono text-[10px]">(#{item.item_id})</span>
                          </div>
                          <div className="text-slate-500 text-[11px]">
                            Qty: <strong className="text-slate-700">{item.quantity}</strong> × ${item.price.toFixed(2)}
                          </div>
                          {item.note && (
                            <div className="text-slate-400 italic text-[10.5px]">Note: {item.note}</div>
                          )}
                        </div>
                        <div className="font-mono font-bold text-slate-900 text-sm">
                          ${(item.quantity * item.price).toFixed(2)}
                        </div>
                      </div>

                      {/* Included Items */}
                      {item.linked_items && item.linked_items.length > 0 && (
                        <div className="mt-2 pl-4 border-l-2 border-slate-300 space-y-1">
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Included Items
                          </div>
                          {item.linked_items.map((linked, lIdx) => (
                            <div key={lIdx} className="flex justify-between text-[11px] text-slate-600">
                              <span>
                                {linked.name} <span className="text-slate-400">(#{linked.item_id})</span> × {linked.quantity}
                              </span>
                              <span className="font-mono font-medium">${(linked.price * linked.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary Bar */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-end gap-6 text-xs">
                {selectedOrder.discount_amount !== undefined && selectedOrder.discount_amount > 0 && (
                  <div className="text-right">
                    <span className="text-slate-500 block text-[11px]">Discount:</span>
                    <span className="font-mono font-bold text-rose-600">-${selectedOrder.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                {selectedOrder.delivery_charge !== undefined && selectedOrder.delivery_charge > 0 && (
                  <div className="text-right">
                    <span className="text-slate-500 block text-[11px]">Delivery Fee:</span>
                    <span className="font-mono font-bold text-slate-700">${selectedOrder.delivery_charge.toFixed(2)}</span>
                  </div>
                )}
                <div className="text-right pl-4 border-l border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Total:</span>
                  <span className="font-mono font-extrabold text-blue-700 text-base">
                    ${selectedOrder.totalamount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <div>
                {selectedOrder.status === -2 && (
                  <button
                    type="button"
                    onClick={() => handleMarkAsFullyReceived(selectedOrder.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow-xs transition-colors cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Mark as Fully Received</span>
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-200 transition-colors font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
