'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Pencil,
  Ban,
  Printer,
  Plus,
  Search,
  Mail,
  Save,
  X,
  ArrowUpDown,
  Ticket
} from 'lucide-react';
import {
  OmegaVoucher,
  OmegaVoucherCustomer,
  INITIAL_VOUCHERS,
  VOUCHER_STATUS_OPTIONS,
  VOUCHER_TYPE_OPTIONS,
  OMEGA_EMPLOYEES,
  OMEGA_CUSTOMERS
} from '@/lib/omegaCouponData';
import { INITIAL_PAYMENT_TYPES } from '@/lib/omegaPaymentData';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

export default function CouponsView() {
  // Main data state
  const [vouchersList, setVouchersList] = useState<OmegaVoucher[]>(INITIAL_VOUCHERS);

  // Filters & Sorting
  const [searchVal, setSearchVal] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<number>(0); // 0 = All
  const [typeFilter, setTypeFilter] = useState<number>(-1); // -1 = All
  const [dateFilter, setDateFilter] = useState<string>('All');
  const [sorting, setSorting] = useState<{ field: 'COUPON_ID' | 'COUPON_EXPIRYDATE' | 'DATE_INSERT'; dir: 'asc' | 'desc' }>({
    field: 'COUPON_ID',
    dir: 'desc'
  });

  // Toast System
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'info' });
  const showToast = (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3500);
  };

  // Modals state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingVoucher, setEditingVoucher] = useState<OmegaVoucher | null>(null);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [printingVoucher, setPrintingVoucher] = useState<OmegaVoucher | null>(null);

  // New Voucher Form State
  const [newVoucherType, setNewVoucherType] = useState<number>(0); // 0 = Coupon, 1 = Gift Certificate
  const [newQuantity, setNewQuantity] = useState<string>('1');
  const [newValue, setNewValue] = useState<string>('20.00');
  const [newCurrency, setNewCurrency] = useState<string>('$');
  const [newExpiryDate, setNewExpiryDate] = useState<string>('2026-12-31');
  const [newPaymentType, setNewPaymentType] = useState<number>(1);
  const [newEmployeeId, setNewEmployeeId] = useState<number>(1);
  const [newAnyoneCanUse, setNewAnyoneCanUse] = useState<number>(1);
  const [newCustomerSearch, setNewCustomerSearch] = useState<string>('');
  const [newSelectedCustomer, setNewSelectedCustomer] = useState<OmegaVoucherCustomer | null>(null);

  // Edit Voucher Form State
  const [editValue, setEditValue] = useState<string>('');
  const [editVoucherType, setEditVoucherType] = useState<number>(0);
  const [editExpiryDate, setEditExpiryDate] = useState<string>('');
  const [editAnyoneCanUse, setEditAnyoneCanUse] = useState<number>(1);
  const [editCustomerSearch, setEditCustomerSearch] = useState<string>('');
  const [editSelectedCustomer, setEditSelectedCustomer] = useState<OmegaVoucherCustomer | null>(null);

  // Dynamic Metrics Calculation
  const counts = useMemo(() => {
    let total = 0;
    let total_val = 0;
    let consumed = 0;
    let consumed_val = 0;
    let expiredNotConsumed = 0;
    let expired_val = 0;
    let valid = 0;
    let valid_val = 0;

    vouchersList.forEach(v => {
      total++;
      total_val += v.COUPON_VALUE;

      if (v.CONSUMED === -1) {
        consumed++;
        consumed_val += v.COUPON_VALUE;
      } else if (v.CONSUMED === 0 && v.expired === 1) {
        expiredNotConsumed++;
        expired_val += v.COUPON_VALUE;
      } else if (v.NOT_ACTIVE !== 1) {
        valid++;
        valid_val += v.COUPON_VALUE;
      }
    });

    return {
      total,
      total_value: total_val,
      consumed,
      consumed_value: consumed_val,
      expiredNotConsumed,
      expiredNotConsumed_value: expired_val,
      valid,
      valid_value: valid_val
    };
  }, [vouchersList]);

  // Distinct entered dates
  const enteredDates = useMemo(() => {
    const dates = new Set<string>();
    vouchersList.forEach(v => {
      if (v.DATE_INSERT) {
        dates.add(v.DATE_INSERT.split(' ')[0]);
      }
    });
    return ['All', ...Array.from(dates)];
  }, [vouchersList]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setNewVoucherType(0);
    setNewQuantity('1');
    setNewValue('25.00');
    setNewCurrency('$');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 90);
    setNewExpiryDate(futureDate.toISOString().split('T')[0]);
    setNewPaymentType(1);
    setNewEmployeeId(1);
    setNewAnyoneCanUse(1);
    setNewCustomerSearch('');
    setNewSelectedCustomer(null);
    setShowAddModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (voucher: OmegaVoucher) => {
    setEditingVoucher(voucher);
    setEditValue(String(voucher.COUPON_VALUE));
    setEditVoucherType(voucher.VOUCHER_TYPE);
    setEditExpiryDate(voucher.COUPON_EXPIRYDATE);
    setEditAnyoneCanUse(voucher.ANYONE_CAN_USE);
    setEditSelectedCustomer(voucher.customerAssigned || null);
    setEditCustomerSearch(voucher.customerAssigned?.NAME || '');
    setShowEditModal(true);
  };

  // Open Print / View Modal
  const handleOpenPrint = (voucher: OmegaVoucher) => {
    setPrintingVoucher(voucher);
    setShowPrintModal(true);
  };

  // Deactivate Coupon
  const handleDeactivate = (voucher: OmegaVoucher) => {
    if (voucher.NOT_ACTIVE === 1) return;
    setVouchersList(prev =>
      prev.map(v => (v.ID === voucher.ID ? { ...v, NOT_ACTIVE: 1, DATE_UPDATED: new Date().toISOString().replace('T', ' ').substring(0, 19) } : v))
    );
    showToast(`Voucher ${voucher.COUPON_ID} deactivated!`, 'warning');
  };

  // Save New Voucher(s)
  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Math.max(1, Math.min(999, parseInt(newQuantity) || 1));
    const val = parseFloat(newValue) || 0;
    if (val <= 0) {
      showToast('Please specify a positive voucher value', 'warning');
      return;
    }

    const newItems: OmegaVoucher[] = [];
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const startId = Math.max(10, ...vouchersList.map(v => v.ID)) + 1;
    const prefix = newVoucherType === 0 ? 'CPN-22901-' : 'GC-22901-';

    const emp = OMEGA_EMPLOYEES.find(e => e.EMPLOYEEID === newEmployeeId);

    for (let i = 0; i < qty; i++) {
      const codeSuffix = 1000 + startId + i;
      newItems.push({
        ID: startId + i,
        COUPON_ID: `${prefix}${codeSuffix}`,
        BRAND_ID: 9606,
        BRANCHID: 1,
        VOUCHER_TYPE: newVoucherType,
        COUPON_VALUE: val,
        COUPON_CURRENCY: newCurrency,
        COUPON_EXPIRYDATE: newExpiryDate,
        CONSUMED: 0,
        expired: 0,
        NOT_ACTIVE: 0,
        DATE_INSERT: nowStr,
        DATE_UPDATED: nowStr,
        ANYONE_CAN_USE: newAnyoneCanUse,
        CUSTOMERID: newAnyoneCanUse === 0 && newSelectedCustomer ? newSelectedCustomer.ID : null,
        customerAssigned: newAnyoneCanUse === 0 ? newSelectedCustomer : null,
        PAYMENTTYPEID: newVoucherType === 1 ? newPaymentType : null,
        EMPLOYEEID: newVoucherType === 1 ? newEmployeeId : null,
        employeeAssigned: newVoucherType === 1 && emp ? emp.NAME : null
      });
    }

    setVouchersList(prev => [...newItems, ...prev]);
    showToast(
      `${qty} ${newVoucherType === 0 ? 'Coupon(s)' : 'Gift Certificate(s)'} generated successfully!`,
      'success'
    );
    setShowAddModal(false);
  };

  // Save Edit Voucher
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVoucher) return;
    const val = parseFloat(editValue) || 0;
    if (val <= 0) {
      showToast('Please enter a valid value', 'warning');
      return;
    }

    setVouchersList(prev =>
      prev.map(v => {
        if (v.ID === editingVoucher.ID) {
          return {
            ...v,
            COUPON_VALUE: val,
            VOUCHER_TYPE: editVoucherType,
            COUPON_EXPIRYDATE: editExpiryDate,
            ANYONE_CAN_USE: editAnyoneCanUse,
            CUSTOMERID: editAnyoneCanUse === 0 && editSelectedCustomer ? editSelectedCustomer.ID : null,
            customerAssigned: editAnyoneCanUse === 0 ? editSelectedCustomer : null,
            DATE_UPDATED: new Date().toISOString().replace('T', ' ').substring(0, 19)
          };
        }
        return v;
      })
    );

    showToast(`Voucher ${editingVoucher.COUPON_ID} updated!`, 'success');
    setShowEditModal(false);
  };

  // Filtered & Sorted Vouchers
  const filteredVouchers = useMemo(() => {
    return vouchersList
      .filter(v => {
        // Search
        const q = searchVal.toLowerCase().trim();
        const matchesSearch =
          !q ||
          v.COUPON_ID.toLowerCase().includes(q) ||
          (v.customerAssigned && v.customerAssigned.NAME.toLowerCase().includes(q)) ||
          v.COUPON_VALUE.toString().includes(q);

        // Status Filter: 0: All, 1: Valid, 2: Consumed, 3: Expired, 4: Deactivated
        let matchesStatus = true;
        if (statusFilter === 1) {
          matchesStatus = v.CONSUMED !== -1 && v.expired !== 1 && v.NOT_ACTIVE !== 1;
        } else if (statusFilter === 2) {
          matchesStatus = v.CONSUMED === -1;
        } else if (statusFilter === 3) {
          matchesStatus = v.CONSUMED === 0 && v.expired === 1;
        } else if (statusFilter === 4) {
          matchesStatus = v.NOT_ACTIVE === 1;
        }

        // Type Filter: -1 = All, 0 = Coupon, 1 = Gift Certificate
        const matchesType = typeFilter === -1 || v.VOUCHER_TYPE === typeFilter;

        // Date Filter
        const matchesDate = dateFilter === 'All' || (v.DATE_INSERT && v.DATE_INSERT.startsWith(dateFilter));

        return matchesSearch && matchesStatus && matchesType && matchesDate;
      })
      .sort((a, b) => {
        const valA = a[sorting.field];
        const valB = b[sorting.field];
        return sorting.dir === 'asc' ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
      });
  }, [vouchersList, searchVal, statusFilter, typeFilter, dateFilter, sorting]);

  const toggleSort = (field: 'COUPON_ID' | 'COUPON_EXPIRYDATE' | 'DATE_INSERT') => {
    setSorting(prev => ({
      field,
      dir: prev.field === field && prev.dir === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <div className="wspaceCont font-sans text-slate-800 bg-background min-h-screen pb-12">
      {/* Toast Popup */}
      {toast.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-xl text-white font-medium text-sm flex items-center gap-3 transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-emerald-600'
              : toast.type === 'error'
              ? 'bg-red-600'
              : toast.type === 'warning'
              ? 'bg-amber-600'
              : 'bg-blue-600'
          }`}
        >
          <span>{toast.message}</span>
          <button onClick={() => setToast(prev => ({ ...prev, show: false }))} className="text-white hover:opacity-80">
            ×
          </button>
        </div>
      )}

      <div className="content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* Header & Breadcrumb matching Omega ERP */}
        <div className="header mb-4 pb-2 border-b border-slate-200">
          <h1 className="page-title text-2xl font-bold text-slate-800 tracking-tight">Coupons & Gift Certificates</h1>
          <ul className="breadcrumb flex items-center gap-2 text-xs text-slate-500 mt-1">
            <li>
              <Link href="/backoffice" className="text-blue-600 hover:underline">
                Home
              </Link>
            </li>
            <li>/</li>
            <li className="active text-slate-700 font-semibold" aria-current="page">
              Coupons
            </li>
          </ul>
        </div>

        {/* ========================================================================= */}
        {/* DASHBOARD SUMMARY CARDS (Exact Omega Theme: 4 Metric Cards) */}
        {/* ========================================================================= */}
        <div className="dashboard grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {/* Card 1: Total */}
          <div className="rounded-lg overflow-hidden border border-slate-300 shadow-sm">
            <div className="bg-primary text-[#ebf1ff] px-3.5 py-2 font-bold text-xs uppercase tracking-wider">
              Total:
            </div>
            <div className="bg-[#ebf1ff] text-foreground px-3.5 py-3 font-semibold text-sm">
              <span className="text-lg font-extrabold">{counts.total}</span>{' '}
              <span className="text-xs font-medium text-slate-600">(${counts.total_value.toFixed(2)})</span>
            </div>
          </div>

          {/* Card 2: Consumed */}
          <div className="rounded-lg overflow-hidden border border-emerald-300 shadow-sm">
            <div className="bg-emerald-700 text-[#d4fdd4] px-3.5 py-2 font-bold text-xs uppercase tracking-wider">
              Consumed:
            </div>
            <div className="bg-[#d4fdd4] text-[#274e27] px-3.5 py-3 font-semibold text-sm">
              <span className="text-lg font-extrabold">{counts.consumed}</span>{' '}
              <span className="text-xs font-medium text-emerald-800">(${counts.consumed_value.toFixed(2)})</span>
            </div>
          </div>

          {/* Card 3: Valid */}
          <div className="rounded-lg overflow-hidden border border-amber-300 shadow-sm">
            <div className="bg-amber-600 text-[#ffe5bc] px-3.5 py-2 font-bold text-xs uppercase tracking-wider">
              Valid:
            </div>
            <div className="bg-[#ffe5bc] text-[#7a4800] px-3.5 py-3 font-semibold text-sm">
              <span className="text-lg font-extrabold">{counts.valid}</span>{' '}
              <span className="text-xs font-medium text-amber-900">(${counts.valid_value.toFixed(2)})</span>
            </div>
          </div>

          {/* Card 4: Expired not used */}
          <div className="rounded-lg overflow-hidden border border-rose-300 shadow-sm">
            <div className="bg-destructive text-[#ffe1e1] px-3.5 py-2 font-bold text-xs uppercase tracking-wider">
              Expired not used:
            </div>
            <div className="bg-[#ffe1e1] text-[#631e1d] px-3.5 py-3 font-semibold text-sm">
              <span className="text-lg font-extrabold">{counts.expiredNotConsumed}</span>{' '}
              <span className="text-xs font-medium text-rose-900">(${counts.expiredNotConsumed_value.toFixed(2)})</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FILTER TOOLBAR */}
        {/* ========================================================================= */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            {/* Search */}
            <div className="lg:col-span-3">
              <div className="relative">
                <input
                  type="search"
                  enterKeyHint="search"
                  value={searchVal}
                  onChange={e => setSearchVal(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Search..."
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Status Filter */}
            <div className="lg:col-span-2">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(parseInt(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 text-slate-700"
              >
                {VOUCHER_STATUS_OPTIONS.map(opt => (
                  <option key={opt.id} value={opt.id}>
                    {opt.id === 0 ? 'Select status' : opt.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="lg:col-span-2">
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(parseInt(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 text-slate-700"
              >
                {VOUCHER_TYPE_OPTIONS.map(opt => (
                  <option key={opt.id} value={opt.id}>
                    {opt.id === -1 ? 'Select type' : opt.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div className="lg:col-span-3">
              <select
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 text-slate-700"
              >
                {enteredDates.map(d => (
                  <option key={d} value={d}>
                    {d === 'All' ? 'Select Date (All)' : d}
                  </option>
                ))}
              </select>
            </div>

            {/* New Button */}
            <div className="lg:col-span-2 flex items-center justify-end">
              <button
                type="button"
                onClick={handleOpenAdd}
                className="w-full sm:w-auto px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md text-sm font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4 stroke-[2.2]" /> New
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DATA TABLE */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 divide-y divide-slate-200">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider select-none">
                <tr>
                  <th onClick={() => toggleSort('COUPON_ID')} className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-1">
                      ID
                      <ArrowUpDown className={`w-3.5 h-3.5 text-slate-400 ${sorting.field === 'COUPON_ID' ? 'text-blue-600' : ''}`} />
                    </div>
                  </th>
                  <th onClick={() => toggleSort('COUPON_EXPIRYDATE')} className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-1">
                      Expiry Date
                      <ArrowUpDown className={`w-3.5 h-3.5 text-slate-400 ${sorting.field === 'COUPON_EXPIRYDATE' ? 'text-blue-600' : ''}`} />
                    </div>
                  </th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 hidden md:table-cell">Customer Assigned</th>
                  <th onClick={() => toggleSort('DATE_INSERT')} className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors hidden lg:table-cell">
                    <div className="flex items-center gap-1">
                      Created At
                      <ArrowUpDown className={`w-3.5 h-3.5 text-slate-400 ${sorting.field === 'DATE_INSERT' ? 'text-blue-600' : ''}`} />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredVouchers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                      No vouchers found.
                    </td>
                  </tr>
                ) : (
                  filteredVouchers.map(row => {
                    const isConsumed = row.CONSUMED === -1;
                    const isExpired = row.CONSUMED === 0 && row.expired === 1;
                    const isDeactivated = row.NOT_ACTIVE === 1;
                    const isValid = !isConsumed && !isExpired && !isDeactivated;

                    return (
                      <tr key={row.ID} className="hover:bg-slate-50/80 transition-colors">
                        {/* ID */}
                        <td className="px-4 py-3 font-mono text-xs font-bold text-slate-800">{row.COUPON_ID}</td>

                        {/* Expiry Date */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-medium text-slate-700">{row.COUPON_EXPIRYDATE}</span>
                        </td>

                        {/* Type */}
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                              row.VOUCHER_TYPE === 0
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {row.VOUCHER_TYPE === 0 ? 'Coupon' : 'Gift Certificate'}
                          </span>
                        </td>

                        {/* Value */}
                        <td className="px-4 py-3 font-bold text-slate-900">
                          {row.COUPON_CURRENCY || '$'} {row.COUPON_VALUE.toLocaleString()}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          {isConsumed && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                              Consumed
                            </span>
                          )}
                          {isExpired && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                              Expired
                            </span>
                          )}
                          {isDeactivated && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">
                              Deactivated
                            </span>
                          )}
                          {isValid && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                              Valid
                            </span>
                          )}
                        </td>

                        {/* Customer */}
                        <td className="px-4 py-3 hidden md:table-cell text-xs text-slate-600">
                          {row.ANYONE_CAN_USE === 1 ? (
                            <span className="text-slate-400 italic">Anyone can use</span>
                          ) : (
                            <span className="font-semibold text-slate-800">{row.customerAssigned?.NAME || 'Assigned'}</span>
                          )}
                        </td>

                        {/* Created At */}
                        <td className="px-4 py-3 hidden lg:table-cell text-xs text-slate-500 font-mono">
                          {row.DATE_INSERT ? row.DATE_INSERT.split(' ')[0] : '—'}
                        </td>

                        {/* Actions: Edit, Deactivate, Print */}
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {isValid && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(row)}
                                  className="w-8 h-8 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all shadow-xs border border-blue-200 hover:border-blue-600"
                                  title="Edit Voucher"
                                >
                                  <Pencil className="w-4 h-4 stroke-[2.2]" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeactivate(row)}
                                  className="w-8 h-8 rounded-md bg-red-100 text-red-700 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all shadow-xs border border-red-200 hover:border-red-600"
                                  title="Deactivate Voucher"
                                >
                                  <Ban className="w-4 h-4 stroke-[2.2]" />
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => handleOpenPrint(row)}
                              className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-700 hover:text-white flex items-center justify-center transition-all shadow-xs border border-slate-300 hover:border-slate-700"
                              title="Print / View Voucher"
                            >
                              <Printer className="w-4 h-4 stroke-[2.2]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200">
                <tr>
                  <td colSpan={8} className="px-4 py-2.5 text-xs text-slate-500 text-center">
                    Showing {filteredVouchers.length} of {vouchersList.length} Vouchers | Brand: Zeit w zaytoun ljanoub S.A.R.L
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: NEW COUPON & GIFT CERTIFICATE (Exact Omega template) */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">Coupon & Gift Certificate</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded-full w-7 h-7 flex items-center justify-center transition-colors hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNew} className="p-5 space-y-4">
              {/* Radio Selector: Coupon vs Gift Certificate */}
              <div className="flex items-center gap-6">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="newVoucherType"
                    checked={newVoucherType === 0}
                    onChange={() => setNewVoucherType(0)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-semibold text-slate-800">Coupon</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="newVoucherType"
                    checked={newVoucherType === 1}
                    onChange={() => setNewVoucherType(1)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-semibold text-slate-800">Gift Certificate</span>
                </label>
              </div>

              {/* Quantity, Value, Valid Till in 3 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    required
                    value={newQuantity}
                    onChange={e => setNewQuantity(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Value</label>
                  <div className="flex">
                    <input
                      type="number"
                      step="any"
                      required
                      value={newValue}
                      onChange={e => setNewValue(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-l-md focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="inline-flex items-center px-2.5 bg-slate-100 border border-l-0 border-slate-300 rounded-r-md text-xs font-bold text-slate-700">
                      {newCurrency}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Valid Till</label>
                  <input
                    type="date"
                    required
                    value={newExpiryDate}
                    onChange={e => setNewExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Gift Certificate fields */}
              {newVoucherType === 1 && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-md space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-blue-900 uppercase mb-1">Payment Type *</label>
                    <select
                      value={newPaymentType}
                      onChange={e => setNewPaymentType(parseInt(e.target.value))}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded bg-white"
                    >
                      {INITIAL_PAYMENT_TYPES.map(pt => (
                        <option key={pt.PAYMENTID} value={pt.PAYMENTID}>
                          {pt.PAYMENTTYPE}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-blue-900 uppercase mb-1">By Employee *</label>
                    <select
                      value={newEmployeeId}
                      onChange={e => setNewEmployeeId(parseInt(e.target.value))}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded bg-white"
                    >
                      {OMEGA_EMPLOYEES.map(emp => (
                        <option key={emp.EMPLOYEEID} value={emp.EMPLOYEEID}>
                          {emp.NAME}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Anyone can use checkbox */}
              <div>
                <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={newAnyoneCanUse === 1}
                    onChange={e => setNewAnyoneCanUse(e.target.checked ? 1 : 0)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                  />
                  <span>Anyone can use it</span>
                </label>
              </div>

              {/* Assign Customer if Anyone Can Use is unchecked */}
              {newAnyoneCanUse === 0 && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Assign a Customer</label>
                  <select
                    value={newSelectedCustomer?.ID || ''}
                    onChange={e => {
                      const id = parseInt(e.target.value);
                      const c = OMEGA_CUSTOMERS.find(cust => cust.ID === id) || null;
                      setNewSelectedCustomer(c);
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white"
                  >
                    <option value="">Select customer...</option>
                    {OMEGA_CUSTOMERS.map(c => (
                      <option key={c.ID} value={c.ID}>
                        {c.NAME} ({c.PHONE})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Footer Save Button */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-md text-sm font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Save className="w-4 h-4" /> Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT COUPON (Exact Omega template) */}
      {/* ========================================================================= */}
      {showEditModal && editingVoucher && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">Edit Coupon & Gift Certificate</h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded-full w-7 h-7 flex items-center justify-center transition-colors hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">ID</label>
                  <input
                    type="text"
                    readOnly
                    value={editingVoucher.COUPON_ID}
                    className="w-full px-3 py-2 text-sm bg-slate-100 border border-slate-300 rounded-md font-mono text-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Value</label>
                  <div className="flex">
                    <input
                      type="number"
                      step="any"
                      required
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-l-md"
                    />
                    <span className="inline-flex items-center px-2.5 bg-slate-100 border border-l-0 border-slate-300 rounded-r-md text-xs font-bold text-slate-700">
                      {editingVoucher.COUPON_CURRENCY || '$'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Type</label>
                  <div className="flex items-center gap-4 py-1.5">
                    <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-800">
                      <input
                        type="radio"
                        checked={editVoucherType === 0}
                        onChange={() => setEditVoucherType(0)}
                        className="w-3.5 h-3.5"
                      />
                      <span>Coupon</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-800">
                      <input
                        type="radio"
                        checked={editVoucherType === 1}
                        onChange={() => setEditVoucherType(1)}
                        className="w-3.5 h-3.5"
                      />
                      <span>Gift Certificate</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Valid Till</label>
                  <input
                    type="date"
                    required
                    value={editExpiryDate}
                    onChange={e => setEditExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={editAnyoneCanUse === 1}
                    onChange={e => setEditAnyoneCanUse(e.target.checked ? 1 : 0)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                  />
                  <span>Anyone can use it</span>
                </label>
              </div>

              {editAnyoneCanUse === 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Assign a Customer</label>
                  <select
                    value={editSelectedCustomer?.ID || ''}
                    onChange={e => {
                      const id = parseInt(e.target.value);
                      const c = OMEGA_CUSTOMERS.find(cust => cust.ID === id) || null;
                      setEditSelectedCustomer(c);
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white"
                  >
                    <option value="">Select customer...</option>
                    {OMEGA_CUSTOMERS.map(c => (
                      <option key={c.ID} value={c.ID}>
                        {c.NAME} ({c.PHONE})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-md text-sm font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: VIEW & PRINT VOUCHER CERTIFICATE */}
      {/* ========================================================================= */}
      {showPrintModal && printingVoucher && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header with actions */}
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-blue-600" /> Voucher Print View
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => showToast(`Voucher ${printingVoucher.COUPON_ID} emailed to customer!`, 'success')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                  title="Send via Email"
                >
                  <Mail className="w-3.5 h-3.5" /> Send Email
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="text-slate-400 hover:text-slate-600 rounded-full w-7 h-7 flex items-center justify-center transition-colors hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Voucher Card Canvas */}
            <div className="p-6 bg-gradient-to-br from-slate-100 to-slate-200 flex justify-center">
              <div className="w-full max-w-lg bg-white border-2 border-dashed border-slate-300 rounded-2xl p-6 shadow-md relative overflow-hidden">
                {/* Decorative banner */}
                <div className="absolute top-0 right-0 bg-blue-600 text-white px-8 py-1 transform rotate-45 translate-x-7 translate-y-3 shadow text-[10px] font-extrabold tracking-widest uppercase">
                  {printingVoucher.VOUCHER_TYPE === 0 ? 'COUPON' : 'GIFT CERTIFICATE'}
                </div>

                {/* Company details */}
                <div className="text-center pb-4 border-b border-slate-200">
                  <h4 className="font-extrabold text-lg text-slate-900">
                    Zeit w zaytoun ljanoub - Southern Olive Oil Products S.A.R.L
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">Old Saida Road, Kfarchima, Lebanon | Phone: 707673828</p>
                </div>

                {/* Voucher ID & Value */}
                <div className="py-6 text-center space-y-2">
                  <p className="font-mono text-xs font-bold tracking-widest text-slate-400 uppercase">
                    VOUCHER NUMBER: {printingVoucher.COUPON_ID}
                  </p>
                  <div className="text-4xl font-black text-blue-600 tracking-tight">
                    {printingVoucher.COUPON_CURRENCY || '$'} {printingVoucher.COUPON_VALUE.toLocaleString()}
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    Valid across all company branches & POS registers
                  </p>
                </div>

                {/* Simulated Barcode */}
                <div className="py-2 flex flex-col items-center justify-center">
                  <div className="h-10 flex items-center gap-[3px] opacity-85">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-slate-900 h-full"
                        style={{ width: i % 3 === 0 ? '3px' : i % 2 === 0 ? '1px' : '2px' }}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-[10px] text-slate-500 mt-1 tracking-widest">
                    *{printingVoucher.COUPON_ID}*
                  </span>
                </div>

                {/* Details Footer */}
                <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block font-semibold uppercase text-[10px]">Beneficiary</span>
                    <span className="font-bold text-slate-800">
                      {printingVoucher.ANYONE_CAN_USE === 1
                        ? 'Bearer / Anyone'
                        : printingVoucher.customerAssigned?.NAME || 'Assigned Client'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block font-semibold uppercase text-[10px]">Expiry Date</span>
                    <span className="font-bold text-red-600">{printingVoucher.COUPON_EXPIRYDATE}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
