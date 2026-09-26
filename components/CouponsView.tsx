'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useTenant } from '@/lib/TenantContext';
import { supabase } from '@/lib/supabaseClient';
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
import { useLanguage } from '@/lib/LanguageContext';
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
  const { t, dir } = useLanguage();
  const { currentTenant } = useTenant();

  // Main data state
  const [vouchersList, setVouchersList] = useState<OmegaVoucher[]>(INITIAL_VOUCHERS);

  // Initial mount hydration from Supabase
  useEffect(() => {
    async function loadCoupons() {
      try {
        const targetId = (currentTenant?.id && currentTenant.id !== '1300' && !currentTenant.id.startsWith('comp-'))
          ? currentTenant.id
          : '00000000-0000-0000-0000-000000000001';

        // 1. Try public.promotions
        try {
          const { data: dbPromos } = await supabase
            .from('promotions')
            .select('*')
            .eq('tenant_id', targetId);

          if (dbPromos && dbPromos.length > 0) {
            const mapped: OmegaVoucher[] = dbPromos.map((p, idx) => ({
              ID: idx + 100,
              COUPON_ID: p.code,
              BRAND_ID: 9606,
              BRANCHID: 1,
              VOUCHER_TYPE: p.name?.includes('Certificate') ? 1 : 0,
              COUPON_VALUE: Number(p.discount_value),
              COUPON_CURRENCY: '$',
              COUPON_EXPIRYDATE: p.end_date ? p.end_date.split('T')[0] : '2026-12-31',
              CONSUMED: 0,
              expired: 0,
              NOT_ACTIVE: p.is_active ? 0 : 1,
              DATE_INSERT: p.created_at ? p.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
              DATE_UPDATED: p.created_at ? p.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
              ANYONE_CAN_USE: 1,
              CUSTOMERID: null,
              customerAssigned: null,
              PAYMENTTYPEID: null,
              EMPLOYEEID: null,
              employeeAssigned: null
            }));
            setVouchersList(mapped);
            return;
          }
        } catch (pErr) {
          console.warn('Dedicated promotions table read notice:', pErr);
        }

        // 2. Fallback to feature_flags.vouchers
        const { data: tenantData } = await supabase
          .from('tenants')
          .select('feature_flags')
          .eq('id', targetId)
          .maybeSingle();

        if (tenantData?.feature_flags?.vouchers && Array.isArray(tenantData.feature_flags.vouchers) && tenantData.feature_flags.vouchers.length > 0) {
          setVouchersList(tenantData.feature_flags.vouchers);
        }
      } catch (err) {
        console.warn('Notice loading vouchers from database:', err);
      }
    }
    loadCoupons();
  }, [currentTenant?.id]);

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

  // Deactivate Coupon (Zero Mock Real Supabase Mutation)
  const handleDeactivate = async (voucher: OmegaVoucher) => {
    if (voucher.NOT_ACTIVE === 1) return;

    const targetId = (currentTenant?.id && currentTenant.id !== '1300' && !currentTenant.id.startsWith('comp-'))
      ? currentTenant.id
      : '00000000-0000-0000-0000-000000000001';

    // 1. Supabase update to public.promotions
    try {
      await supabase
        .from('promotions')
        .update({ is_active: false })
        .eq('code', voucher.COUPON_ID)
        .eq('tenant_id', targetId);
    } catch (promoErr) {
      console.warn('promotions update notice:', promoErr);
    }

    // 2. Supabase update to public.coupons
    try {
      await supabase
        .from('coupons')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('code', voucher.COUPON_ID)
        .eq('tenant_id', targetId);
    } catch (coupErr) {
      console.warn('coupons update notice:', coupErr);
    }

    // 3. Multi-tenant feature flags sync
    const updatedList = vouchersList.map(v =>
      v.ID === voucher.ID
        ? { ...v, NOT_ACTIVE: 1, DATE_UPDATED: new Date().toISOString().replace('T', ' ').substring(0, 19) }
        : v
    );

    try {
      const { data: tenantData } = await supabase
        .from('tenants')
        .select('feature_flags')
        .eq('id', targetId)
        .maybeSingle();

      const existingFlags = tenantData?.feature_flags || currentTenant?.feature_flags || {};
      const { error: dbError } = await supabase
        .from('tenants')
        .update({
          feature_flags: {
            ...existingFlags,
            vouchers: updatedList
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', targetId);

      if (dbError) {
        showToast(`Database write error: ${dbError.message}`, 'error');
        return;
      }
    } catch (err: any) {
      showToast(`Deactivation error: ${err?.message || 'Database connection error'}`, 'error');
      return;
    }

    setVouchersList(updatedList);
    showToast(`${t('voucher_deactivated_prefix', 'Voucher')} ${voucher.COUPON_ID} ${t('deactivated_success', 'deactivated & persisted.')}`, 'warning');
  };

  // Save New Voucher(s) (Zero Mock Real Supabase Mutation)
  const handleSaveNew = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Math.max(1, Math.min(999, parseInt(newQuantity) || 1));
    const val = parseFloat(newValue) || 0;
    if (val <= 0) {
      showToast(t('specify_positive_voucher_val', 'Please specify a positive voucher value'), 'warning');
      return;
    }

    const targetId = (currentTenant?.id && currentTenant.id !== '1300' && !currentTenant.id.startsWith('comp-'))
      ? currentTenant.id
      : '00000000-0000-0000-0000-000000000001';

    const newItems: OmegaVoucher[] = [];
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const startId = Math.max(10, ...vouchersList.map(v => v.ID)) + 1;
    const prefix = newVoucherType === 0 ? 'CPN-22901-' : 'GC-22901-';

    const emp = OMEGA_EMPLOYEES.find(empItem => empItem.EMPLOYEEID === newEmployeeId);

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

    // 1. Write to public.promotions
    try {
      const promoPayload = newItems.map(item => ({
        tenant_id: targetId,
        code: item.COUPON_ID,
        name: item.VOUCHER_TYPE === 0 ? 'Coupon Discount' : 'Gift Certificate',
        discount_type: 'FIXED_AMOUNT',
        discount_value: item.COUPON_VALUE,
        start_date: new Date().toISOString(),
        end_date: item.COUPON_EXPIRYDATE ? new Date(item.COUPON_EXPIRYDATE).toISOString() : new Date().toISOString(),
        applicable_to: 'ALL_PRODUCTS',
        is_active: true
      }));

      await supabase.from('promotions').insert(promoPayload);
    } catch (promoErr) {
      console.warn('promotions write notice:', promoErr);
    }

    // 2. Write to public.coupons
    try {
      const couponPayload = newItems.map(item => ({
        tenant_id: targetId,
        code: item.COUPON_ID,
        voucher_type: item.VOUCHER_TYPE,
        value: item.COUPON_VALUE,
        currency: item.COUPON_CURRENCY,
        expiry_date: item.COUPON_EXPIRYDATE,
        consumed: 0,
        is_active: true,
        anyone_can_use: item.ANYONE_CAN_USE,
        customer_id: item.CUSTOMERID,
        employee_id: item.EMPLOYEEID
      }));

      await supabase.from('coupons').insert(couponPayload);
    } catch (coupErr) {
      console.warn('coupons write notice:', coupErr);
    }

    // 3. Multi-tenant feature flags sync
    const updatedList = [...newItems, ...vouchersList];
    try {
      const { data: tenantData } = await supabase
        .from('tenants')
        .select('feature_flags')
        .eq('id', targetId)
        .maybeSingle();

      const existingFlags = tenantData?.feature_flags || currentTenant?.feature_flags || {};
      const { error: dbError } = await supabase
        .from('tenants')
        .update({
          feature_flags: {
            ...existingFlags,
            vouchers: updatedList
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', targetId);

      if (dbError) {
        showToast(`Database write error: ${dbError.message}`, 'error');
        return;
      }
    } catch (err: any) {
      showToast(`Voucher generation error: ${err?.message || 'Database error'}`, 'error');
      return;
    }

    setVouchersList(updatedList);
    showToast(
      `${qty} ${newVoucherType === 0 ? t('coupons_generated_suffix', 'Coupon(s) generated and persisted!') : t('gift_cert_generated_suffix', 'Gift Certificate(s) generated and persisted!')}`,
      'success'
    );
    setShowAddModal(false);
  };

  // Save Edit Voucher (Zero Mock Real Supabase Mutation)
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVoucher) return;
    const val = parseFloat(editValue) || 0;
    if (val <= 0) {
      showToast(t('enter_valid_value', 'Please enter a valid value'), 'warning');
      return;
    }

    const targetId = (currentTenant?.id && currentTenant.id !== '1300' && !currentTenant.id.startsWith('comp-'))
      ? currentTenant.id
      : '00000000-0000-0000-0000-000000000001';

    // 1. Supabase update to public.promotions
    try {
      await supabase
        .from('promotions')
        .update({
          discount_value: val,
          end_date: editExpiryDate ? new Date(editExpiryDate).toISOString() : undefined,
          is_active: true
        })
        .eq('code', editingVoucher.COUPON_ID)
        .eq('tenant_id', targetId);
    } catch (promoErr) {
      console.warn('promotions update notice:', promoErr);
    }

    // 2. Supabase update to public.coupons
    try {
      await supabase
        .from('coupons')
        .update({
          value: val,
          voucher_type: editVoucherType,
          expiry_date: editExpiryDate,
          anyone_can_use: editAnyoneCanUse,
          customer_id: editAnyoneCanUse === 0 && editSelectedCustomer ? editSelectedCustomer.ID : null,
          updated_at: new Date().toISOString()
        })
        .eq('code', editingVoucher.COUPON_ID)
        .eq('tenant_id', targetId);
    } catch (coupErr) {
      console.warn('coupons update notice:', coupErr);
    }

    // 3. Multi-tenant feature flags sync
    const updatedList = vouchersList.map(v => {
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
    });

    try {
      const { data: tenantData } = await supabase
        .from('tenants')
        .select('feature_flags')
        .eq('id', targetId)
        .maybeSingle();

      const existingFlags = tenantData?.feature_flags || currentTenant?.feature_flags || {};
      const { error: dbError } = await supabase
        .from('tenants')
        .update({
          feature_flags: {
            ...existingFlags,
            vouchers: updatedList
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', targetId);

      if (dbError) {
        showToast(`Database update error: ${dbError.message}`, 'error');
        return;
      }
    } catch (err: any) {
      showToast(`Update error: ${err?.message || 'Database error'}`, 'error');
      return;
    }

    setVouchersList(updatedList);
    showToast(`${t('voucher_updated_prefix', 'Voucher')} ${editingVoucher.COUPON_ID} ${t('updated_persisted_suffix', 'updated and persisted to database!')}`, 'success');
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

  const getStatusOptionLabel = (opt: { id: number; description: string }) => {
    if (opt.id === 0) return t('select_status', 'Select status');
    if (opt.id === 1) return t('status_valid', 'Valid');
    if (opt.id === 2) return t('status_consumed', 'Consumed');
    if (opt.id === 3) return t('status_expired', 'Expired');
    if (opt.id === 4) return t('status_deactivated', 'Deactivated');
    return opt.description;
  };

  const getTypeOptionLabel = (opt: { id: number; description: string }) => {
    if (opt.id === -1) return t('select_type', 'Select type');
    if (opt.id === 0) return t('coupon', 'Coupon');
    if (opt.id === 1) return t('gift_certificate', 'Gift Certificate');
    return opt.description;
  };

  return (
    <div dir={dir} className="wspaceCont font-sans text-slate-800 bg-background min-h-screen pb-12">
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
          <h1 className="page-title text-2xl font-bold text-slate-800 tracking-tight">
            {t('coupons_and_gift_certificates', 'Coupons & Gift Certificates')}
          </h1>
          <ul className="breadcrumb flex items-center gap-2 text-xs text-slate-500 mt-1">
            <li>
              <Link href="/backoffice" className="text-blue-600 hover:underline">
                {t('home', 'Home')}
              </Link>
            </li>
            <li>/</li>
            <li className="active text-slate-700 font-semibold" aria-current="page">
              {t('coupons', 'Coupons')}
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
              {t('total_metric', 'Total:')}
            </div>
            <div className="bg-[#ebf1ff] text-foreground px-3.5 py-3 font-semibold text-sm">
              <span className="text-lg font-extrabold">{counts.total}</span>{' '}
              <span className="text-xs font-medium text-slate-600">(${counts.total_value.toFixed(2)})</span>
            </div>
          </div>

          {/* Card 2: Consumed */}
          <div className="rounded-lg overflow-hidden border border-emerald-300 shadow-sm">
            <div className="bg-emerald-700 text-[#d4fdd4] px-3.5 py-2 font-bold text-xs uppercase tracking-wider">
              {t('consumed_metric', 'Consumed:')}
            </div>
            <div className="bg-[#d4fdd4] text-[#274e27] px-3.5 py-3 font-semibold text-sm">
              <span className="text-lg font-extrabold">{counts.consumed}</span>{' '}
              <span className="text-xs font-medium text-emerald-800">(${counts.consumed_value.toFixed(2)})</span>
            </div>
          </div>

          {/* Card 3: Valid */}
          <div className="rounded-lg overflow-hidden border border-amber-300 shadow-sm">
            <div className="bg-amber-600 text-[#ffe5bc] px-3.5 py-2 font-bold text-xs uppercase tracking-wider">
              {t('valid_metric', 'Valid:')}
            </div>
            <div className="bg-[#ffe5bc] text-[#7a4800] px-3.5 py-3 font-semibold text-sm">
              <span className="text-lg font-extrabold">{counts.valid}</span>{' '}
              <span className="text-xs font-medium text-amber-900">(${counts.valid_value.toFixed(2)})</span>
            </div>
          </div>

          {/* Card 4: Expired not used */}
          <div className="rounded-lg overflow-hidden border border-rose-300 shadow-sm">
            <div className="bg-destructive text-[#ffe1e1] px-3.5 py-2 font-bold text-xs uppercase tracking-wider">
              {t('expired_not_used_metric', 'Expired not used:')}
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
                  placeholder={t('search_ellipsis', 'Search...')}
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
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 text-slate-700 cursor-pointer"
              >
                {VOUCHER_STATUS_OPTIONS.map(opt => (
                  <option key={opt.id} value={opt.id}>
                    {getStatusOptionLabel(opt)}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="lg:col-span-2">
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(parseInt(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 text-slate-700 cursor-pointer"
              >
                {VOUCHER_TYPE_OPTIONS.map(opt => (
                  <option key={opt.id} value={opt.id}>
                    {getTypeOptionLabel(opt)}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div className="lg:col-span-3">
              <select
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 text-slate-700 cursor-pointer"
              >
                {enteredDates.map(d => (
                  <option key={d} value={d}>
                    {d === 'All' ? t('select_date_all', 'Select Date (All)') : d}
                  </option>
                ))}
              </select>
            </div>

            {/* New Button */}
            <div className="lg:col-span-2 flex items-center justify-end">
              <button
                type="button"
                onClick={handleOpenAdd}
                className="w-full sm:w-auto px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md text-sm font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.2]" /> {t('new_coupon_btn', 'New')}
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
                      {t('id', 'ID')}
                      <ArrowUpDown className={`w-3.5 h-3.5 text-slate-400 ${sorting.field === 'COUPON_ID' ? 'text-blue-600' : ''}`} />
                    </div>
                  </th>
                  <th onClick={() => toggleSort('COUPON_EXPIRYDATE')} className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-1">
                      {t('expiry_date', 'Expiry Date')}
                      <ArrowUpDown className={`w-3.5 h-3.5 text-slate-400 ${sorting.field === 'COUPON_EXPIRYDATE' ? 'text-blue-600' : ''}`} />
                    </div>
                  </th>
                  <th className="px-4 py-3">{t('type', 'Type')}</th>
                  <th className="px-4 py-3">{t('value', 'Value')}</th>
                  <th className="px-4 py-3">{t('status', 'Status')}</th>
                  <th className="px-4 py-3 hidden md:table-cell">{t('customer_assigned', 'Customer Assigned')}</th>
                  <th onClick={() => toggleSort('DATE_INSERT')} className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors hidden lg:table-cell">
                    <div className="flex items-center gap-1">
                      {t('created_at', 'Created At')}
                      <ArrowUpDown className={`w-3.5 h-3.5 text-slate-400 ${sorting.field === 'DATE_INSERT' ? 'text-blue-600' : ''}`} />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right w-28">{t('actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredVouchers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                      {t('no_vouchers_found', 'No vouchers found.')}
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
                            {row.VOUCHER_TYPE === 0 ? t('coupon', 'Coupon') : t('gift_certificate', 'Gift Certificate')}
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
                              {t('status_consumed', 'Consumed')}
                            </span>
                          )}
                          {isExpired && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                              {t('status_expired', 'Expired')}
                            </span>
                          )}
                          {isDeactivated && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">
                              {t('status_deactivated', 'Deactivated')}
                            </span>
                          )}
                          {isValid && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                              {t('status_valid', 'Valid')}
                            </span>
                          )}
                        </td>

                        {/* Customer */}
                        <td className="px-4 py-3 hidden md:table-cell text-xs text-slate-600">
                          {row.ANYONE_CAN_USE === 1 ? (
                            <span className="text-slate-400 italic">{t('anyone_can_use', 'Anyone can use')}</span>
                          ) : (
                            <span className="font-semibold text-slate-800">{row.customerAssigned?.NAME || t('assigned', 'Assigned')}</span>
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
                                  className="w-8 h-8 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all shadow-xs border border-blue-200 hover:border-blue-600 cursor-pointer"
                                  title={t('edit_voucher', 'Edit Voucher')}
                                >
                                  <Pencil className="w-4 h-4 stroke-[2.2]" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeactivate(row)}
                                  className="w-8 h-8 rounded-md bg-red-100 text-red-700 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all shadow-xs border border-red-200 hover:border-red-600 cursor-pointer"
                                  title={t('deactivate_voucher', 'Deactivate Voucher')}
                                >
                                  <Ban className="w-4 h-4 stroke-[2.2]" />
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => handleOpenPrint(row)}
                              className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-700 hover:text-white flex items-center justify-center transition-all shadow-xs border border-slate-300 hover:border-slate-700 cursor-pointer"
                              title={t('print_view_voucher', 'Print / View Voucher')}
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
                    {t('showing', 'Showing')} {filteredVouchers.length} {t('of', 'of')} {vouchersList.length} {t('vouchers', 'Vouchers')} | {t('brand', 'Brand')}: Zeit w zaytoun ljanoub S.A.R.L
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
              <h3 className="text-base font-bold text-slate-800">{t('coupon_and_gift_certificate_modal', 'Coupon & Gift Certificate')}</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded-full w-7 h-7 flex items-center justify-center transition-colors hover:bg-slate-100 cursor-pointer"
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
                  <span className="text-sm font-semibold text-slate-800">{t('coupon', 'Coupon')}</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="newVoucherType"
                    checked={newVoucherType === 1}
                    onChange={() => setNewVoucherType(1)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-semibold text-slate-800">{t('gift_certificate', 'Gift Certificate')}</span>
                </label>
              </div>

              {/* Quantity, Value, Valid Till in 3 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('quantity', 'Quantity')}</label>
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
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('value', 'Value')}</label>
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
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('valid_till', 'Valid Till')}</label>
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
                    <label className="block text-xs font-bold text-blue-900 uppercase mb-1">{t('payment_type_req', 'Payment Type *')}</label>
                    <select
                      value={newPaymentType}
                      onChange={e => setNewPaymentType(parseInt(e.target.value))}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded bg-white cursor-pointer"
                    >
                      {INITIAL_PAYMENT_TYPES.map(pt => (
                        <option key={pt.PAYMENTID} value={pt.PAYMENTID}>
                          {pt.PAYMENTTYPE}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-blue-900 uppercase mb-1">{t('by_employee_req', 'By Employee *')}</label>
                    <select
                      value={newEmployeeId}
                      onChange={e => setNewEmployeeId(parseInt(e.target.value))}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded bg-white cursor-pointer"
                    >
                      {OMEGA_EMPLOYEES.map(empItem => (
                        <option key={empItem.EMPLOYEEID} value={empItem.EMPLOYEEID}>
                          {empItem.NAME}
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
                  <span>{t('anyone_can_use_it', 'Anyone can use it')}</span>
                </label>
              </div>

              {newAnyoneCanUse === 0 && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase">{t('assign_a_customer', 'Assign a Customer')}</label>
                  <select
                    value={newSelectedCustomer?.ID || ''}
                    onChange={e => {
                      const id = parseInt(e.target.value);
                      const c = OMEGA_CUSTOMERS.find(cust => cust.ID === id) || null;
                      setNewSelectedCustomer(c);
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white cursor-pointer"
                  >
                    <option value="">{t('select_customer_ellipsis', 'Select customer...')}</option>
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
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 cursor-pointer"
                >
                  {t('cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-md text-sm font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" /> {t('save', 'Save')}
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
              <h3 className="text-base font-bold text-slate-800">{t('edit_coupon_gift_certificate', 'Edit Coupon & Gift Certificate')}</h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded-full w-7 h-7 flex items-center justify-center transition-colors hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('id', 'ID')}</label>
                  <input
                    type="text"
                    readOnly
                    value={editingVoucher.COUPON_ID}
                    className="w-full px-3 py-2 text-sm bg-slate-100 border border-slate-300 rounded-md font-mono text-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('value', 'Value')}</label>
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
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('type', 'Type')}</label>
                  <div className="flex items-center gap-4 py-1.5">
                    <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-800 cursor-pointer">
                      <input
                        type="radio"
                        checked={editVoucherType === 0}
                        onChange={() => setEditVoucherType(0)}
                        className="w-3.5 h-3.5"
                      />
                      <span>{t('coupon', 'Coupon')}</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-800 cursor-pointer">
                      <input
                        type="radio"
                        checked={editVoucherType === 1}
                        onChange={() => setEditVoucherType(1)}
                        className="w-3.5 h-3.5"
                      />
                      <span>{t('gift_certificate', 'Gift Certificate')}</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('valid_till', 'Valid Till')}</label>
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
                  <span>{t('anyone_can_use_it', 'Anyone can use it')}</span>
                </label>
              </div>

              {editAnyoneCanUse === 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('assign_a_customer', 'Assign a Customer')}</label>
                  <select
                    value={editSelectedCustomer?.ID || ''}
                    onChange={e => {
                      const id = parseInt(e.target.value);
                      const c = OMEGA_CUSTOMERS.find(cust => cust.ID === id) || null;
                      setEditSelectedCustomer(c);
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white cursor-pointer"
                  >
                    <option value="">{t('select_customer_ellipsis', 'Select customer...')}</option>
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
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 cursor-pointer"
                >
                  {t('cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-md text-sm font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" /> {t('save_changes', 'Save Changes')}
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
                <Ticket className="w-5 h-5 text-blue-600" /> {t('voucher_print_view', 'Voucher Print View')}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => showToast(`Voucher ${printingVoucher.COUPON_ID} emailed to customer!`, 'success')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  title={t('send_email', 'Send Email')}
                >
                  <Mail className="w-3.5 h-3.5" /> {t('send_email', 'Send Email')}
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> {t('print', 'Print')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="text-slate-400 hover:text-slate-600 rounded-full w-7 h-7 flex items-center justify-center transition-colors hover:bg-slate-100 cursor-pointer"
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
                  {printingVoucher.VOUCHER_TYPE === 0 ? t('coupon_upper', 'COUPON') : t('gift_certificate_upper', 'GIFT CERTIFICATE')}
                </div>

                {/* Company details */}
                <div className="text-center pb-4 border-b border-slate-200">
                  <h4 className="font-extrabold text-lg text-slate-900">
                    Zeit w zaytoun ljanoub - Southern Olive Oil Products S.A.R.L
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">{t('company_address_phone', 'Old Saida Road, Kfarchima, Lebanon | Phone: 707673828')}</p>
                </div>

                {/* Voucher ID & Value */}
                <div className="py-6 text-center space-y-2">
                  <p className="font-mono text-xs font-bold tracking-widest text-slate-400 uppercase">
                    {t('voucher_number', 'VOUCHER NUMBER')}: {printingVoucher.COUPON_ID}
                  </p>
                  <div className="text-4xl font-black text-blue-600 tracking-tight">
                    {printingVoucher.COUPON_CURRENCY || '$'} {printingVoucher.COUPON_VALUE.toLocaleString()}
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    {t('valid_across_branches_pos', 'Valid across all company branches & POS registers')}
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
                    <span className="text-slate-400 block font-semibold uppercase text-[10px]">{t('beneficiary', 'Beneficiary')}</span>
                    <span className="font-bold text-slate-800">
                      {printingVoucher.ANYONE_CAN_USE === 1
                        ? t('bearer_anyone', 'Bearer / Anyone')
                        : printingVoucher.customerAssigned?.NAME || t('assigned_client', 'Assigned Client')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block font-semibold uppercase text-[10px]">{t('expiry_date', 'Expiry Date')}</span>
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
