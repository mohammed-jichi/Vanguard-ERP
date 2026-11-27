'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Clock, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  FileText, 
  Printer, 
  DollarSign, 
  CreditCard, 
  Receipt, 
  Layers, 
  ShieldCheck, 
  X,
  ChevronRight,
  TrendingUp,
  Download,
  AlertCircle
} from 'lucide-react';
import { useTenant } from '@/lib/TenantContext';
import { useLanguage } from '@/lib/LanguageContext';
import { supabase } from '@/lib/supabaseClient';
import { OmegaBranchEod, INITIAL_EOD_BRANCHES } from '@/lib/omegaEndOfDayData';
import { resolveTenantUuid } from '@/lib/productCatalogService';
import { createPortal } from 'react-dom';
import { saveActiveShift } from '@/lib/posShiftService';
import { computeEodState, extractInvoices, eodTotals, liveRateFrom, fmtEodDate as fmtEodDateShared, EodState } from '@/lib/eodLive';

export default function EndOfDayPage() {
  const { currentTenant } = useTenant();
  const { t, dir } = useLanguage();
  const [branches, setBranches] = useState<OmegaBranchEod[]>(INITIAL_EOD_BRANCHES);
  const [selectedBranchId, setSelectedBranchId] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [statusModalOpen, setStatusModalOpen] = useState<boolean>(false);
  const [zReportModalOpen, setZReportModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; title: string; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'closing' | 'matrix' | 'reconciliation' | 'history'>('closing');
  const [eodLog, setEodLog] = useState<any[]>([]);
  const [lastZReference, setLastZReference] = useState<string>('');
  const fmtEodDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

  const { currentUser } = useTenant();
  const [eodState, setEodState] = useState<EodState | null>(null);
  const [eodRate, setEodRate] = useState<number>(90000);
  const [lastEntry, setLastEntry] = useState<any>(null);
  const [activeShift, setActiveShift] = useState<any>(null);
  const [startingShift, setStartingShift] = useState<boolean>(false);
  const [methodTotals, setMethodTotals] = useState<Record<string, number>>({});
  const [eservicesCount, setEservicesCount] = useState<number>(0);
  const signedInName = currentUser?.fullName || currentUser?.email || '';

  useEffect(() => {
    let isMounted = true;

    async function loadLiveRegisterData() {
      try {
        const tenantId = resolveTenantUuid(currentTenant);
        const { data: tenantData } = await supabase.from('tenants').select('name, feature_flags').eq('id', tenantId).maybeSingle();
        const flags: any = tenantData?.feature_flags || {};

        // Unified working date / Open-vs-Closed (shared with the Sales Dashboard status card)
        const st = computeEodState(flags);
        const rate = liveRateFrom(flags);
        const log: any[] = Array.isArray(flags.end_of_day_log) ? flags.end_of_day_log : [];
        const { posted, voided } = extractInvoices(flags);
        const tot = eodTotals(posted, voided, st.lastClosedMs, rate);
        const r2 = (n: number) => Math.round(n * 100) / 100;

        if (!isMounted) return;
        setEodLog([...log].reverse());
        setEodState(st);
        setEodRate(rate);
        setLastEntry(flags.last_eod_closing || null);
        setActiveShift(flags.active_pos_shift || null);
        setMethodTotals(tot.byMethod);
        setEservicesCount(posted.filter((p) => p.ts > st.lastClosedMs && p.pays.some((x) => /WHISH|ONLINE|OMT|WALLET|PARTNER|E-?SERVICE|TRANSFER/.test(x.method))).length);
        if (st.lastReference) setLastZReference(st.lastReference);

        setBranches((prev) =>
          prev.map((b) =>
            b.BRANCHID === 1
              ? {
                  ...b,
                  BARANCHNAME: tenantData?.name ? `${tenantData.name} - Main` : b.BARANCHNAME,
                  OMEGA_CUSTID: Number(currentTenant?.companyId) || b.OMEGA_CUSTID,
                  end_of_day: st.workingDate,
                  status: st.status === 'Closed' ? 'Closed' : 'In Shift',
                  invoicesCount: tot.count,
                  grossSales: r2(tot.gross),
                  netSales: r2(tot.net),
                  taxVat: r2(tot.tax),
                  discounts: r2(tot.discounts),
                  cashUsd: r2(tot.cashUsd),
                  cashLbp: Math.round(tot.cashLbp),
                  cardPayments: r2(tot.card),
                  omnichannel: r2(tot.eservices),
                  voidsCount: tot.voids,
                  cashier: signedInName || flags.active_pos_shift?.cashierName || '\u2014'
                }
              : b
          )
        );
      } catch (err) {
        console.warn('[EndOfDayPage] Live register data sync error:', err);
      }
    }

    loadLiveRegisterData();
    return () => {
      isMounted = false;
    };
  }, [currentTenant?.id, signedInName]);
  const selectedBranch = branches.find(b => b.BRANCHID === selectedBranchId) || branches[0];

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value, 10);
    setSelectedBranchId(id);
  };

  const showToast = (type: 'success' | 'error', title: string, text: string) => {
    setToastMessage({ type, title, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleExecuteEodClick = () => {
    if (!selectedBranch) return;
    setConfirmModalOpen(true);
  };

  const postTenantFlag = async (key: string, value: any, append = false) => {
    const res = await fetch('/api/tenant-flags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: resolveTenantUuid(currentTenant), key, value, append })
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) throw new Error(json.error || `Could not save ${key}`);
  };

  /** Opens the next working day: writes a fresh OPEN shift (opened after the last closing) via the existing POS shift service. */
  const startNewWorkday = async () => {
    setStartingShift(true);
    try {
      const now = new Date();
      const ymdNow = now.toISOString().slice(0, 10).replace(/-/g, '');
      const nextNumber = (Number(activeShift?.shiftNumber) || 0) + 1;
      const shift = {
        id: `SH-${ymdNow}-${nextNumber}`,
        shiftNumber: nextNumber,
        branch: selectedBranch.BARANCHNAME,
        workstation: activeShift?.workstation || 'POS-01 (Main Counter)',
        cashierName: signedInName || activeShift?.cashierName || 'Cashier',
        openedAt: now.toISOString(),
        closedAt: null,
        openingCashUsd: 0,
        openingCashLbp: 0,
        status: 'OPEN' as const,
        notes: `Shift #${nextNumber} opened after Z-Report ${eodState?.lastReference || ''}`.trim()
      };
      await postTenantFlag('active_pos_shift', shift);
      await saveActiveShift(shift, resolveTenantUuid(currentTenant));
      setActiveShift(shift);
      setEodState((prev) => (prev ? { ...prev, status: 'Open', shiftOpenedMs: now.getTime(), workingDate: fmtEodDateShared(now) } : prev));
      setBranches((prev) =>
        prev.map((b) =>
          b.BRANCHID === selectedBranchId
            ? { ...b, end_of_day: fmtEodDateShared(now), status: 'In Shift', cashier: signedInName || b.cashier }
            : b
        )
      );
      showToast('success', 'New workday opened', `Shift #${nextNumber} started for ${fmtEodDateShared(now)}.`);
    } catch (err: any) {
      showToast('error', 'Could not start shift', err?.message || 'Shift could not be saved.');
    } finally {
      setStartingShift(false);
    }
  };

  const isClosed = selectedBranch?.status === 'Closed';

  const executeEndOfDay = async () => {
    setConfirmModalOpen(false);
    setLoading(true);

    try {
      const closedAt = new Date();
      const closedIso = closedAt.toISOString();
      const closedDate = fmtEodDate(closedAt);
      const ymd = closedIso.slice(0, 10).replace(/-/g, '');
      const seq = String(eodLog.filter((e) => String(e.reference || '').includes(ymd)).length + 1).padStart(2, '0');
      const entry = {
        reference: `Z-${ymd}-${seq}`,
        closed_at: closedIso,
        closed_date: closedDate,
        status: 'Finalized',
        branch_id: selectedBranchId,
        branch_name: selectedBranch.BARANCHNAME,
        closed_by: signedInName || 'Unknown user',
        invoices_count: selectedBranch.invoicesCount,
        net_sales: selectedBranch.netSales,
        tax_vat: selectedBranch.taxVat,
        gross_sales: selectedBranch.grossSales,
        discounts: selectedBranch.discounts,
        cash_usd: selectedBranch.cashUsd,
        cash_lbp: selectedBranch.cashLbp,
        card_payments: selectedBranch.cardPayments,
        eservices: selectedBranch.omnichannel,
        voids_count: selectedBranch.voidsCount,
        by_method: methodTotals,
        exchange_rate: eodRate
      };

      // Persist to tenants.feature_flags first; only update the screen once saved.
      await postTenantFlag('last_end_of_day', closedIso);
      await postTenantFlag('last_eod_closing', entry);
      await postTenantFlag('end_of_day_log', entry, true);

      setEodLog((prev) => [entry, ...prev]);
      setLastEntry(entry);
      setEodState((prev) => (prev ? { ...prev, status: 'Closed', lastClosedIso: closedIso, lastClosedMs: closedAt.getTime(), workingDate: closedDate, lastReference: entry.reference } : prev));
      setLastZReference(entry.reference);
      setBranches((prev) =>
        prev.map((b) =>
          b.BRANCHID === selectedBranchId
            ? { ...b, end_of_day: closedDate, status: 'Closed', invoicesCount: 0, grossSales: 0, netSales: 0, taxVat: 0, discounts: 0, cashUsd: 0, cashLbp: 0, cardPayments: 0, omnichannel: 0, voidsCount: 0 }
            : b
        )
      );
      showToast('success', 'Success', 'End of day done successfully!');
      setZReportModalOpen(true);
    } catch (err: any) {
      console.error('[executeEndOfDay] Persistence error:', err);
      showToast('error', 'End of Day failed', err?.message || 'Could not save the closing to the database.');
    } finally {
      setLoading(false);
    }
  };
  const nz = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : 0);
  const showEntry = isClosed && lastEntry;
  const legacyOperator = (n: any) => !n || String(n) === 'Vanguard Operator';
  const zData = showEntry
    ? {
        ref: String(lastEntry.reference || lastZReference || ''),
        closedAt: lastEntry.closed_at ? new Date(lastEntry.closed_at).toLocaleString('en-GB') : String(lastEntry.closed_date || ''),
        count: nz(lastEntry.invoices_count),
        gross: nz(lastEntry.gross_sales),
        net: nz(lastEntry.net_sales),
        tax: nz(lastEntry.tax_vat),
        discounts: nz(lastEntry.discounts),
        voids: nz(lastEntry.voids_count),
        cashUsd: nz(lastEntry.cash_usd),
        cashLbp: nz(lastEntry.cash_lbp),
        card: nz(lastEntry.card_payments),
        eservices: nz(lastEntry.eservices),
        cashier: legacyOperator(lastEntry.closed_by) ? signedInName || '\u2014' : String(lastEntry.closed_by),
        provisional: false
      }
    : {
        ref: lastZReference,
        closedAt: new Date().toLocaleString('en-GB'),
        count: selectedBranch.invoicesCount,
        gross: selectedBranch.grossSales,
        net: selectedBranch.netSales,
        tax: selectedBranch.taxVat,
        discounts: selectedBranch.discounts,
        voids: selectedBranch.voidsCount,
        cashUsd: selectedBranch.cashUsd,
        cashLbp: selectedBranch.cashLbp,
        card: selectedBranch.cardPayments,
        eservices: selectedBranch.omnichannel,
        cashier: signedInName || selectedBranch.cashier,
        provisional: true
      };
  const tenderedUsd = selectedBranch.cashUsd + selectedBranch.cashLbp / (eodRate || 1) + selectedBranch.cardPayments + selectedBranch.omnichannel;
  const drawerVariance = Math.round((tenderedUsd - selectedBranch.grossSales) * 100) / 100;

  const renderZSlip = () => (
    <div className="p-5 bg-white border border-dashed border-slate-300 rounded-lg font-mono text-xs text-slate-800 space-y-2">
      <div className="text-center pb-2 border-b border-dashed border-slate-300">
        <div className="font-black text-sm">{selectedBranch.BARANCHNAME}</div>
        <div className="font-bold text-xs mt-1.5">*** {t('FISCAL END OF DAY (Z-REPORT)', 'FISCAL END OF DAY (Z-REPORT)')} ***</div>
        <div className="text-[10.5px] text-slate-600">{zData.provisional ? t('PROVISIONAL \u2013 OPEN WORKDAY', 'PROVISIONAL \u2013 OPEN WORKDAY') : t('FINALIZED', 'FINALIZED')}</div>
        <div className="text-[10.5px] text-slate-600">{t('Z-Report Reference:', 'Z-Report Reference:')} {zData.ref ? `#${zData.ref}` : '\u2014'}</div>
        <div className="text-[10.5px] text-slate-600">{zData.provisional ? t('Printed:', 'Printed:') : t('Closing Timestamp:', 'Closing Timestamp:')} {zData.closedAt}</div>
        <div className="text-[10.5px] text-slate-600">{t('Cashier:', 'Cashier:')} {zData.cashier}</div>
      </div>

      <div className="pt-2 space-y-1.5">
        <div className="flex justify-between"><span>{t('TRANSACTION COUNT:', 'TRANSACTION COUNT:')}</span><span className="font-bold">{zData.count} {t('Invoices', 'Invoices')}</span></div>
        <div className="flex justify-between"><span>{t('GROSS REGISTER SALES:', 'GROSS REGISTER SALES:')}</span><span className="font-bold">${zData.gross.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>{t('TOTAL DISCOUNTS APPLIED:', 'TOTAL DISCOUNTS APPLIED:')}</span><span>-${zData.discounts.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>{t('VOIDED TICKETS', 'VOIDED TICKETS')}:</span><span>{zData.voids}</span></div>
        <div className="flex justify-between font-bold pt-1 border-t border-dashed border-slate-300"><span>{t('NET TAXABLE SALES:', 'NET TAXABLE SALES:')}</span><span>${zData.net.toFixed(2)}</span></div>
        <div className="flex justify-between font-bold"><span>{t('TOTAL VAT COLLECTED:', 'TOTAL VAT COLLECTED:')}</span><span>+${zData.tax.toFixed(2)}</span></div>
        <div className="flex justify-between font-black pt-1 border-t border-dashed border-slate-300 text-[13px]"><span>{t('FINAL NET RECONCILED:', 'FINAL NET RECONCILED:')}</span><span>${zData.gross.toFixed(2)}</span></div>
      </div>

      <div className="pt-2 border-t border-dashed border-slate-300 space-y-1">
        <div className="font-bold text-[11px]">{t('PAYMENT TENDER BREAKDOWN:', 'PAYMENT TENDER BREAKDOWN:')}</div>
        <div className="flex justify-between text-[11px]"><span>{'\u2022 '}{t('CASH USD:', 'CASH USD:')}</span><span>${zData.cashUsd.toFixed(2)}</span></div>
        <div className="flex justify-between text-[11px]"><span>{'\u2022 '}{t('CASH LBP:', 'CASH LBP:')}</span><span>{zData.cashLbp.toLocaleString()} LBP</span></div>
        <div className="flex justify-between text-[11px]"><span>{'\u2022 '}{t('CREDIT CARDS:', 'CREDIT CARDS:')}</span><span>${zData.card.toFixed(2)}</span></div>
        <div className="flex justify-between text-[11px]"><span>{'\u2022 '}{t('E-SERVICES / PARTNERS:', 'E-SERVICES / PARTNERS:')}</span><span>${zData.eservices.toFixed(2)}</span></div>
      </div>

      <div className="text-center pt-3 border-t border-dashed border-slate-300 text-[10.5px] text-slate-500">
        <div>{t('Cashier Signature:', 'Cashier Signature:')} ______________________</div>
        <div className="mt-1">{t('Manager Signature:', 'Manager Signature:')} ______________________</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-16">
      <style jsx global>{`
        /* Authentic Vanguard End of Day Styles */
        .end-of-day-card {
          background: #fff;
          border: 1px solid #dfe5ef;
          border-radius: 18px;
          box-shadow: 0 12px 30px rgba(22, 34, 57, 0.08);
          padding: 1.25rem;
        }
        .end-of-day-note {
          color: #6c7a92;
          font-size: 0.95rem;
          margin: 0;
        }
        .end-of-day-loader {
          padding: 1rem 0 0.25rem;
          text-align: center;
        }
        @media (max-width: 767.98px) {
          .end-of-day-card {
            border-radius: 16px;
            padding: 1rem;
          }
        }
        .vanguard-table th {
          background-color: #3e3e3e;
          color: #ffffff;
          font-size: 12px;
          font-weight: 700;
          padding: 7px 10px;
          border: 1px solid #555;
          text-align: left;
        }
        .vanguard-table td {
          font-size: 12px;
          padding: 7px 10px;
          border: 1px solid #e2e8f0;
        }
      `}</style>

      {/* Toastr notification matching Vanguard toastr */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-bounce transition-all">
          <div className={`flex items-start gap-3 p-4 rounded-xl shadow-2xl text-white min-w-[320px] ${toastMessage.type === 'success' ? 'bg-emerald-700 border border-emerald-400' : 'bg-destructive border border-red-400'}`}>
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-bold text-sm">{toastMessage.title}</div>
              <div className="text-xs text-white/90 mt-0.5">{toastMessage.text}</div>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Breadcrumb & Header matching Vanguard EndOfDayView */}
      <div className="px-4 lg:px-6 pt-5 pb-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t('End of Day', 'End of Day')}</h1>
            <ul className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <li>
                <Link prefetch={false} href="/backoffice" className="hover:text-blue-600 transition">{t('Home', 'Home')}</Link>
              </li>
              <li>/</li>
              <li>
                <Link prefetch={false} href="/dashboard/sales" className="hover:text-blue-600 transition">{t('Sales', 'Sales')}</Link>
              </li>
              <li>/</li>
              <li className="text-slate-800 font-semibold">{t('End of Day', 'End of Day')}</li>
            </ul>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStatusModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm transition"
              title={t('View Branches Last EOD Matrix', 'View Branches Last EOD Matrix')}
            >
              <Clock className="w-4 h-4 text-amber-600" />
              <span>{t('Branches Status Matrix', 'Branches Status Matrix')}</span>
            </button>

            <Link prefetch={false}
              href="/dashboard/sales"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm transition"
            >
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              <span>{t('Sales Dashboard', 'Sales Dashboard')}</span>
            </Link>
          </div>
        </div>

        {/* Navigation Tabs to explore the full matrix / connection */}
        <div className="flex items-center gap-2 mt-4 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('closing')}
            className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 ${activeTab === 'closing' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            {t('Daily Register Closing', 'Daily Register Closing')}
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 ${activeTab === 'matrix' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            {t('Branches EOD Status Matrix', 'Branches EOD Status Matrix')}
          </button>
          <button
            onClick={() => setActiveTab('reconciliation')}
            className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 ${activeTab === 'reconciliation' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            {t('Sales & Drawer Reconciliation Connection', 'Sales & Drawer Reconciliation Connection')}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 ${activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            {t('Historical Z-Reports Log', 'Historical Z-Reports Log')}
          </button>
        </div>
      </div>

      <div className="px-4 lg:px-6 mt-4 max-w-7xl">
        {/* TAB 1: EXACT VANGUARD END OF DAY VIEW */}
        {activeTab === 'closing' && (
          <div className="space-y-6">
            {/* VANGUARD AUTHENTIC END OF DAY CARD */}
            <div className="end-of-day-card">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                {/* Branch Selection Field */}
                <div className="md:col-span-5 lg:col-span-5">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('Branch', 'Branch')}</label>
                  <select
                    value={selectedBranchId}
                    onChange={handleBranchChange}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  >
                    {branches.map(b => (
                      <option key={b.BRANCHID} value={b.BRANCHID}>
                        {t(b.BARANCHNAME, b.BARANCHNAME)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Last End of Day Input (Disabled) */}
                <div className="md:col-span-4 lg:col-span-4">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('Last End of Day', 'Last End of Day')}</label>
                  <input
                    type="text"
                    disabled
                    value={selectedBranch?.end_of_day || t('No branch selected', 'No branch selected')}
                    className="w-full bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 cursor-not-allowed shadow-inner"
                    placeholder={t('No branch selected', 'No branch selected')}
                  />
                </div>

                {/* Execute End of Day Button */}
                <div className="md:col-span-3 lg:col-span-3 flex justify-end">
                  {isClosed ? (
                    <button
                      type="button"
                      disabled={startingShift}
                      onClick={startNewWorkday}
                      className={`w-full md:w-auto px-6 py-2 rounded-lg font-bold text-xs text-white shadow-md transition-all flex items-center justify-center gap-2 ${startingShift ? 'bg-emerald-400 cursor-wait' : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'}`}
                    >
                      {startingShift ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                      <span>{t('Open New Workday / Start Shift', 'Open New Workday / Start Shift')}</span>
                    </button>
                  ) : (
                  <button
                    type="button"
                    disabled={loading || !selectedBranch}
                    onClick={handleExecuteEodClick}
                    className={`w-full md:w-auto px-6 py-2 rounded-lg font-bold text-xs text-white shadow-md transition-all flex items-center justify-center gap-2 ${loading ? 'bg-blue-400 cursor-wait' : 'bg-primary hover:bg-blue-700 active:scale-95'}`}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{t('Processing...', 'Processing...')}</span>
                      </>
                    ) : (
                      <span>{t('End Of Day', 'End Of Day')}</span>
                    )}
                  </button>
                  )}
                </div>
              </div>

              {/* Informational note */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <p className="end-of-day-note">
                  {t('Select a branch to review its latest end-of-day status before running the process.', 'Select a branch to review its latest end-of-day status before running the process.')}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-500">{t('Current Status:', 'Current Status:')}</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${isClosed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {isClosed ? t('Closed', 'Closed') : t('Open', 'Open')}
                  </span>
                </div>
              </div>

              {/* Animated loading bar if active */}
              {loading && (
                <div className="end-of-day-loader">
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-600">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{t('Communicating with Vanguard POS Engine & Finalizing Register Ledger...', 'Communicating with Vanguard POS Engine & Finalizing Register Ledger...')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* QUICK HIGHLIGHT MATRIX CARDS FOR THE SELECTED BRANCH */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>{t('Invoices Processed', 'Invoices Processed')}</span>
                  <Receipt className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-xl font-bold text-slate-900 mt-2 font-mono">
                  {selectedBranch.invoicesCount} {t('Invoices', 'Invoices')}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {t('Cashier:', 'Cashier:')} <span className="font-semibold text-slate-700">{selectedBranch.cashier}</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>{t('Gross Sales', 'Gross Sales')}</span>
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-xl font-bold text-slate-900 mt-2 font-mono">
                  ${selectedBranch.grossSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                  {t('Net:', 'Net:')} ${selectedBranch.netSales.toLocaleString('en-US', { minimumFractionDigits: 2 })} {t('(excl. VAT)', '(excl. VAT)')}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>{t('Cash Collections', 'Cash Collections')}</span>
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-xl font-bold text-slate-900 mt-2 font-mono">
                  ${selectedBranch.cashUsd.toLocaleString()} + {selectedBranch.cashLbp.toLocaleString()} LBP
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {t('Cards:', 'Cards:')} ${selectedBranch.cardPayments.toFixed(2)} | {t('Online:', 'Online:')} ${selectedBranch.omnichannel.toFixed(2)}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>{t('Audit & Voids', 'Audit & Voids')}</span>
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-xl font-bold text-slate-900 mt-2 font-mono">
                  {selectedBranch.voidsCount} {t('Voids', 'Voids')} (${selectedBranch.discounts.toFixed(2)} {t('Disc', 'Disc')})
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {t('VAT 11%:', 'VAT 11%:')} ${selectedBranch.taxVat.toFixed(2)} {t('Reconciled', 'Reconciled')}
                </div>
              </div>
            </div>

            {/* DIRECT ACTION PANEL: VIEW LAST Z-REPORT */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{t('Official Fiscal Z-Report Summary Available', 'Official Fiscal Z-Report Summary Available')}</h4>
                  <p className="text-[11px] text-slate-500">{t('Last closed batch reference for', 'Last closed batch reference for')} {t(selectedBranch.BARANCHNAME, selectedBranch.BARANCHNAME)} {t('as of', 'as of')} {selectedBranch.end_of_day}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setZReportModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white shadow-sm transition flex items-center gap-2"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t('View Full Z-Report Matrix', 'View Full Z-Report Matrix')}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: BRANCHES EOD STATUS MATRIX TABLE */}
        {activeTab === 'matrix' && (
          <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{t('Branches End of Day Status Matrix', 'Branches End of Day Status Matrix')}</h3>
                <p className="text-xs text-slate-500">{t('Live synchronization with Vanguard POS API', 'Live synchronization with Vanguard POS API')} (`getBranchesLastEodate`)</p>
              </div>
              <button
                onClick={() => setStatusModalOpen(true)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm cursor-pointer"
              >
                {t('Open Vanguard Status Matrix', 'Open Vanguard Status Matrix')}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full vanguard-table">
                <thead>
                  <tr>
                    <th>{t('Branch ID', 'Branch ID')}</th>
                    <th>{t('Branch Name', 'Branch Name')}</th>
                    <th>{t('Customer ID', 'Customer ID')}</th>
                    <th>{t('Last EOD Date', 'Last EOD Date')}</th>
                    <th>{t('Status', 'Status')}</th>
                    <th>{t('Assigned Cashier', 'Assigned Cashier')}</th>
                    <th>{t('Invoices', 'Invoices')}</th>
                    <th>{t('Gross Volume', 'Gross Volume')}</th>
                    <th>{t('Action', 'Action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {branches.map((b, idx) => (
                    <tr key={b.BRANCHID} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                      <td className="font-mono font-bold text-blue-700">{b.BRANCHID}</td>
                      <td className="font-semibold text-slate-900">{b.BARANCHNAME}</td>
                      <td className="font-mono text-slate-600">{b.OMEGA_CUSTID}</td>
                      <td className="font-semibold font-mono text-slate-700">{b.end_of_day}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold ${b.status === 'Closed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'}`}>
                          {b.status === 'Closed' ? t('Closed', 'Closed') : t('Open', 'Open')}
                        </span>
                      </td>
                      <td className="text-slate-600">{b.cashier}</td>
                      <td className="font-mono text-right">{b.invoicesCount}</td>
                      <td className="font-mono font-bold text-right text-emerald-800">
                        ${b.grossSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBranchId(b.BRANCHID);
                            setZReportModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-900 text-white hover:bg-slate-700 text-[11px] font-bold transition mr-1.5"
                        >
                          {t('View Z-Slip', 'View Z-Slip')}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBranchId(b.BRANCHID);
                            setActiveTab('closing');
                          }}
                          className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-[11px] font-bold transition"
                        >
                          {b.status === 'Closed' ? t('Open Workday', 'Open Workday') : t('Select & Close', 'Select & Close')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: SALES & RECONCILIATION CONNECTION MATRIX (live posted invoices + payment methods) */}
        {activeTab === 'reconciliation' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* 1. Real Net Revenue Matrix */}
            <div className="lg:col-span-4 bg-white border border-slate-300 rounded-xl overflow-hidden shadow-sm">
              <div className="p-3.5 bg-primary text-white font-bold text-xs flex items-center justify-between gap-2">
                <span>{t('1. Real Net Revenue Matrix', '1. Real Net Revenue Matrix')}</span>
                <span className="text-[11px] text-slate-300 font-mono">{lastZReference || '\u2014'}</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-xs">
                  <span className="text-slate-600 font-medium">{t('Gross Product Sales (before discounts)', 'Gross Product Sales (before discounts)')}</span>
                  <span className="font-mono font-bold text-slate-900">${(selectedBranch.netSales + selectedBranch.discounts).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-xs">
                  <span className="text-slate-600 font-medium">{t('Line Discounts & Promotions', 'Line Discounts & Promotions')}</span>
                  <span className="font-mono font-semibold text-red-600">-${selectedBranch.discounts.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-xs font-bold bg-slate-50 px-2 rounded">
                  <span className="text-slate-900">{t('Net Sales Volume (Excl. Tax)', 'Net Sales Volume (Excl. Tax)')}</span>
                  <span className="font-mono text-blue-700">${selectedBranch.netSales.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-xs">
                  <span className="text-slate-600 font-medium">{t('VAT / Sales Tax', 'VAT / Sales Tax')}</span>
                  <span className="font-mono font-bold text-emerald-700">+${selectedBranch.taxVat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-xs">
                  <span className="text-slate-600 font-medium">{t('Voided / Cancelled Documents', 'Voided / Cancelled Documents')}</span>
                  <span className="font-mono font-semibold text-slate-700">{selectedBranch.voidsCount}</span>
                </div>
                <div className="flex justify-between items-center py-2 bg-emerald-50 border border-emerald-200 px-3 rounded-lg text-xs font-black text-emerald-900">
                  <span>{t('TOTAL REGISTER SETTLEMENT', 'TOTAL REGISTER SETTLEMENT')}</span>
                  <span className="font-mono text-sm">${selectedBranch.grossSales.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* 2. Cash Drawer & Settlement Methods Matrix */}
            <div className="lg:col-span-4 bg-white border border-slate-300 rounded-xl overflow-hidden shadow-sm">
              <div className="p-3.5 bg-primary text-white font-bold text-xs flex items-center justify-between gap-2">
                <span>{t('2. Cash Drawer & Settlement Methods Matrix', '2. Cash Drawer & Settlement Methods Matrix')}</span>
                <span className="text-[11px] text-slate-300 font-mono whitespace-nowrap">1 USD = {eodRate.toLocaleString()} LBP</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-xs">
                  <span className="text-slate-600 font-medium">{t('Cash Drawer USD ($)', 'Cash Drawer USD ($)')}</span>
                  <span className="font-mono font-bold text-slate-900">${selectedBranch.cashUsd.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-xs">
                  <span className="text-slate-600 font-medium">{t('Cash Drawer LBP (Local Currency)', 'Cash Drawer LBP (Local Currency)')}</span>
                  <span className="font-mono font-bold text-slate-900">{selectedBranch.cashLbp.toLocaleString()} LBP</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-xs">
                  <span className="text-slate-600 font-medium">{t('Credit / Debit Card Terminals', 'Credit / Debit Card Terminals')}</span>
                  <span className="font-mono font-bold text-slate-900">${selectedBranch.cardPayments.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-xs">
                  <span className="text-slate-600 font-medium">{t('E-Services & Digital Wallets', 'E-Services & Digital Wallets')}</span>
                  <span className="font-mono font-bold text-slate-900">${selectedBranch.omnichannel.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-xs">
                  <span className="text-slate-600 font-medium">{t('Drawer Over / Short Variance', 'Drawer Over / Short Variance')}</span>
                  <span className={`font-mono font-bold ${Math.abs(drawerVariance) < 0.01 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    ${drawerVariance.toFixed(2)} ({Math.abs(drawerVariance) < 0.01 ? t('Balanced', 'Balanced') : t('Review', 'Review')})
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 bg-blue-50 border border-blue-200 px-3 rounded-lg text-xs font-bold text-blue-900">
                  <span>{t('Drawer Reconciliation Audit', 'Drawer Reconciliation Audit')}</span>
                  <span className="font-mono text-xs flex items-center gap-1">
                    <CheckCircle2 className={`w-4 h-4 ${Math.abs(drawerVariance) < 0.01 ? 'text-emerald-600' : 'text-amber-600'}`} />
                    <span>{Math.abs(drawerVariance) < 0.01 ? t('DRAWER VERIFIED', 'DRAWER VERIFIED') : t('VARIANCE DETECTED', 'VARIANCE DETECTED')}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* 3. E-Services & Partner Settlements */}
            <div className="lg:col-span-4 bg-white border border-slate-300 rounded-xl overflow-hidden shadow-sm">
              <div className="p-3.5 bg-primary text-white font-bold text-xs flex items-center justify-between gap-2">
                <span className="whitespace-normal">{t('3. E-Services & Partner Settlements', '3. E-Services & Partner Settlements')}</span>
                <span className="text-[11px] text-slate-300 font-mono whitespace-nowrap">{eservicesCount} {t('Invoices', 'Invoices')}</span>
              </div>
              <div className="p-4 space-y-3">
                {Object.keys(methodTotals).length === 0 && (
                  <div className="text-xs text-slate-500 py-1.5">{t('No posted payments in the open workday.', 'No posted payments in the open workday.')}</div>
                )}
                {Object.entries(methodTotals).map(([m, v]) => (
                  <div key={m} className="flex justify-between items-center py-1.5 border-b border-slate-100 text-xs">
                    <span className="text-slate-600 font-medium">
                      {m} {/WHISH|ONLINE|OMT|WALLET|PARTNER|E-?SERVICE|TRANSFER/.test(m) ? '\u00b7 E-Service' : ''}
                    </span>
                    <span className="font-mono font-bold text-slate-900">${v.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-2 bg-indigo-50 border border-indigo-200 px-3 rounded-lg text-xs font-black text-indigo-900">
                  <span>{t('PARTNER / E-SERVICE SETTLEMENT', 'PARTNER / E-SERVICE SETTLEMENT')}</span>
                  <span className="font-mono text-sm">${selectedBranch.omnichannel.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: HISTORICAL Z-REPORTS */}
        {activeTab === 'history' && (
          <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{t('Historical End-of-Day Z-Reports Archive', 'Historical End-of-Day Z-Reports Archive')}</h3>
                <p className="text-xs text-slate-500">{t('Archived daily registers, tax audit trails, and signed closing slips', 'Archived daily registers, tax audit trails, and signed closing slips')}</p>
              </div>
              <button
                onClick={() => setZReportModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-sm"
              >
                {t('Print Current Batch', 'Print Current Batch')}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full vanguard-table">
                <thead>
                  <tr>
                    <th>{t('Z-Report #', 'Z-Report #')}</th>
                    <th>{t('Date Closed', 'Date Closed')}</th>
                    <th>{t('Branch', 'Branch')}</th>
                    <th>{t('Closed By', 'Closed By')}</th>
                    <th>{t('Total Invoices', 'Total Invoices')}</th>
                    <th>{t('Total Net ($)', 'Total Net ($)')}</th>
                    <th>{t('VAT 11% ($)', 'VAT 11% ($)')}</th>
                    <th>{t('Gross Settled ($)', 'Gross Settled ($)')}</th>
                    <th>{t('Status', 'Status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {eodLog.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center text-slate-500 py-6">{t('No end-of-day closings recorded yet.', 'No end-of-day closings recorded yet.')}</td>
                    </tr>
                  )}
                  {eodLog.map((e, i) => (
                    <tr key={e.reference || i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                      <td className="font-mono font-bold text-blue-700">{e.reference}</td>
                      <td className="font-mono">{e.closed_at ? new Date(e.closed_at).toLocaleString('en-GB') : e.closed_date}</td>
                      <td className="font-semibold">{e.branch_name}</td>
                      <td>{!e.closed_by || e.closed_by === 'Vanguard Operator' ? signedInName || e.closed_by : e.closed_by}</td>
                      <td className="font-mono text-right">{e.invoices_count}</td>
                      <td className="font-mono text-right font-semibold">${Number(e.net_sales || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="font-mono text-right text-emerald-700">${Number(e.tax_vat || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="font-mono text-right font-black text-slate-900">${Number(e.gross_sales || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">{t(e.status || 'Finalized', e.status || 'Finalized')}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. AUTHENTIC VANGUARD CONFIRMATION POPUP (BOOTBOX CONFIRM)                   */}
      {/* ========================================================================= */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-300 rounded-xl max-w-md w-full p-6 text-slate-800 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {t('Are you sure you want to execute end of day?', 'Are you sure you want to execute end of day?')}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {t('Executing End of Day for', 'Executing End of Day for')} <span className="font-bold text-slate-800">{selectedBranch.BARANCHNAME}</span> {t('will lock daily transactions, balance cash drawers, generate the Z-Report audit sequence, and advance the register to the next operating business day.', 'will lock daily transactions, balance cash drawers, generate the Z-Report audit sequence, and advance the register to the next operating business day.')}
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">{t('Current EOD Date:', 'Current EOD Date:')}</span>
                <span className="font-mono font-bold text-slate-800">{selectedBranch.end_of_day}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t('Invoices to Finalize:', 'Invoices to Finalize:')}</span>
                <span className="font-mono font-bold text-slate-800">{selectedBranch.invoicesCount} {t('Invoices', 'Invoices')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t('Total Settlement:', 'Total Settlement:')}</span>
                <span className="font-mono font-bold text-emerald-700">${selectedBranch.grossSales.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition"
              >
                {t('Cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={executeEndOfDay}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-xs font-bold text-white shadow-md transition"
              >
                {t('OK', 'OK')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. AUTHENTIC VANGUARD EOD STATUS MATRIX MODAL (`getBranchesLastEodate`)     */}
      {/* ========================================================================= */}
      {statusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-300 rounded-lg max-w-lg w-full p-4 text-slate-800 shadow-2xl">
            {/* Authentic Vanguard Status Table layout matching BackofficeDashboardController.js */}
            <div style={{ padding: '4px', background: '#ffffff', borderRadius: '6px' }}>
              <table className="w-full" style={{ marginBottom: 0, color: '#0f172a', background: '#ffffff', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #d7dee8' }}>
                    <th colSpan={2} style={{ textAlign: 'center', color: '#dc2626', fontSize: '16px', padding: '8px', fontWeight: 800 }}>
                      {t('End of Day Status', 'End of Day Status')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {branches.map((b, idx) => {
                    const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
                    return (
                      <tr key={b.BRANCHID}>
                        <th style={{ borderTop: 0, borderBottom: '1px solid #e5e7eb', fontSize: '12px', fontWeight: 'normal', color: '#1f2937', background: rowBg, padding: '10px 12px', textAlign: 'left' }}>
                          {b.BARANCHNAME} :
                        </th>
                        <td style={{ borderTop: 0, borderBottom: '1px solid #e5e7eb', fontSize: '12px', textAlign: 'center', color: '#475569', background: rowBg, padding: '10px 12px', fontWeight: 600 }}>
                          {b.end_of_day}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">{t('Synchronized with Vanguard Sales Control Core', 'Synchronized with Vanguard Sales Control Core')}</span>
              <button
                type="button"
                onClick={() => setStatusModalOpen(false)}
                className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition"
              >
                {t('OK', 'OK')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. FISCAL Z-REPORT DETAIL POPUP                                           */}
      {/* ========================================================================= */}
      {zReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-300 rounded-xl max-w-xl w-full p-6 text-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">{t('Fiscal Z-Report Slip & Reconciliation', 'Fiscal Z-Report Slip & Reconciliation')}</h3>
              </div>
              <button onClick={() => setZReportModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thermal Register Slip Preview */}
            <div className="mt-4">{renderZSlip()}</div>

            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t('Print Z-Slip', 'Print Z-Slip')}</span>
              </button>
              <button
                type="button"
                onClick={() => setZReportModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white transition"
              >
                {t('Done', 'Done')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Isolated print harness: mounted on <body> while the Z-Slip is open; @media print hides everything else. */}
      {zReportModalOpen && typeof document !== 'undefined' &&
        createPortal(
          <div className="z-slip-print-harness">
            <style>{`
              .z-slip-print-harness { display: none; }
              @media print {
                @page { margin: 8mm; }
                html, body { background: #fff !important; height: auto !important; overflow: visible !important; }
                body > *:not(.z-slip-print-harness) { display: none !important; }
                .z-slip-print-harness { display: block !important; position: static !important; width: 100% !important; max-width: 100mm; margin: 0 auto; color: #000; background: #fff; }
                .z-slip-print-harness * { color: #000 !important; background: transparent !important; box-shadow: none !important; }
              }
            `}</style>
            {renderZSlip()}
          </div>,
          document.body
        )}

    </div>
  );
}
