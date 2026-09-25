'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import {
  Truck,
  CheckCircle2,
  AlertTriangle,
  Search,
  Calendar,
  Clock,
  Printer,
  Save,
  Check,
  X,
  RefreshCw,
  Eye,
  Boxes,
  PackageCheck,
  RotateCcw,
  FileText
} from 'lucide-react';
import {
  ProductRequestHeader,
  ProductRequestLineItem,
  OMEGA_PR_BRANCHES
} from '@/lib/productRequestData';

export default function ReceivingOfGoodsView() {
  const { t, dir } = useLanguage();
  // Top filter state
  const [filterBranchId, setFilterBranchId] = useState<number>(0);
  const [filterFromBranchId, setFilterFromBranchId] = useState<number>(0);
  const [fromDate, setFromDate] = useState<string>('2026-09-01');
  const [toDate, setToDate] = useState<string>('2026-09-30');
  const [searchPrNb, setSearchPrNb] = useState<string>('');

  // Data state
  const [approvedPrList, setApprovedPrList] = useState<ProductRequestHeader[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Active Receiving Inspection Modal state
  const [activePr, setActivePr] = useState<ProductRequestHeader | null>(null);
  const [showInspectionModal, setShowInspectionModal] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch approved PRs
  const fetchApprovedRequests = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/getAllApprovedProductRequestsService', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: fromDate,
          to: toDate,
          frombranchid: filterBranchId,
          requestedfrombranchid: filterFromBranchId,
          search: searchPrNb
        })
      });
      if (res.ok) {
        const data = await res.json();
        setApprovedPrList(data);
      }
    } catch (e) {
      showToast('Error loading approved requests', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedRequests();
  }, [filterBranchId, filterFromBranchId, fromDate, toDate]);

  // Open Inspection Modal
  const handleOpenInspection = (pr: ProductRequestHeader) => {
    // Clone and ensure QTYREC defaults to QTYAPP if not set
    const cloned = JSON.parse(JSON.stringify(pr));
    cloned.items.forEach((it: ProductRequestLineItem) => {
      if (it.QTYREC === undefined || it.QTYREC === null) {
        it.QTYREC = it.QTYAPP;
      }
    });
    setActivePr(cloned);
    setShowInspectionModal(true);
  };

  // Update Qty Received in modal
  const handleUpdateQtyRec = (itemIdx: number, val: number) => {
    if (!activePr) return;
    const updated = { ...activePr };
    updated.items[itemIdx].QTYREC = Math.max(0, val);
    setActivePr(updated);
  };

  // Update item remark
  const handleUpdateRemark = (itemIdx: number, val: string) => {
    if (!activePr) return;
    const updated = { ...activePr };
    updated.items[itemIdx].REMARK = val;
    setActivePr(updated);
  };

  // Save draft
  const handleSaveDraft = async () => {
    if (!activePr) return;
    try {
      const res = await fetch('/api/saveGoodsReceivingService', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestid: activePr.ID,
          items: activePr.items.map(i => ({
            ITEMID: i.ITEMID,
            QTYREC: i.QTYREC,
            REMARK: i.REMARK
          })),
          remark: activePr.REMARK
        })
      });
      const data = await res.json();
      if (data.status === 1) {
        showToast('Receiving counts saved as draft');
        fetchApprovedRequests();
      }
    } catch (e) {
      showToast('Error saving draft', 'error');
    }
  };

  // Confirm Receiving
  const handleConfirmReceiving = async () => {
    if (!activePr) return;
    try {
      const res = await fetch('/api/confirmGoodsReceivingService', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestid: activePr.ID,
          items: activePr.items.map(i => ({
            ITEMID: i.ITEMID,
            QTYREC: i.QTYREC,
            REMARK: i.REMARK
          })),
          remark: activePr.REMARK
        })
      });
      const data = await res.json();
      if (data.status === 1) {
        showToast(`Receiving confirmed for ${activePr.REQUESTNB}! Inventory successfully updated.`);
        setShowInspectionModal(false);
        fetchApprovedRequests();
      }
    } catch (e) {
      showToast('Failed to confirm goods receiving', 'error');
    }
  };

  // Unconfirm Receiving
  const handleUnconfirmReceiving = async () => {
    if (!activePr) return;
    try {
      const res = await fetch('/api/unconfirmGoodsReceivingService', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestid: activePr.ID })
      });
      const data = await res.json();
      if (data.status === 1) {
        showToast(`Goods receiving unconfirmed for ${activePr.REQUESTNB}`);
        setShowInspectionModal(false);
        fetchApprovedRequests();
      }
    } catch (e) {
      showToast('Failed to unconfirm receiving', 'error');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-slate-800 font-sans">
      {/* TOAST ALERT */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl animate-fade-in border ${
            toastMessage.type === 'error'
              ? 'bg-rose-600 text-white border-rose-400'
              : 'bg-emerald-600 text-white border-emerald-400'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertTriangle className="w-5 h-5" />
          ) : (
            <CheckCircle2 className="w-5 h-5" />
          )}
          <span className="text-sm font-semibold">{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* HEADER BREADCRUMB & TITLE */}
      <div className="bg-white border-b border-border px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
            <span>{t('operations_center', 'Operations Center')}</span>
            <span>/</span>
            <span className="text-teal-600 font-bold">{t('receiving_of_goods', 'Receiving of Goods')}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{t('receiving_of_goods', 'Receiving of goods')}</h1>
            <span className="bg-teal-50 text-teal-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-teal-200 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" />
              <span>{t('inbound_goods_verification', 'Inbound Goods Verification')}</span>
            </span>
          </div>
        </div>

        <button
          onClick={fetchApprovedRequests}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold border border-slate-300 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-600' : ''}`} />
          <span>{t('refresh', 'Refresh')}</span>
        </button>
      </div>

      {/* TOP FILTERS BAR */}
      <div className="p-6 pb-2 max-w-7xl mx-auto w-full">
        <div className="bg-white rounded-lg border border-border shadow-sm p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
            {/* Receiving Branch */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                {t('receiving_branch', 'Receiving Branch')}
              </label>
              <select
                value={filterBranchId}
                onChange={e => setFilterBranchId(Number(e.target.value))}
                className="w-full h-8 px-2.5 bg-white border border-border rounded text-xs font-semibold text-slate-700 focus:outline-none focus:border-teal-500"
              >
                <option value={0}>{t('all_branches', 'All Branches')}</option>
                {OMEGA_PR_BRANCHES.map(b => (
                  <option key={b.BRANCHID} value={b.BRANCHID}>
                    {b.BARANCHNAME}
                  </option>
                ))}
              </select>
            </div>

            {/* Requested From Branch */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                {t('dispatched_from', 'Dispatched From')}
              </label>
              <select
                value={filterFromBranchId}
                onChange={e => setFilterFromBranchId(Number(e.target.value))}
                className="w-full h-8 px-2.5 bg-white border border-border rounded text-xs font-semibold text-slate-700 focus:outline-none focus:border-teal-500"
              >
                <option value={0}>{t('all_branches', 'All Branches')}</option>
                {OMEGA_PR_BRANCHES.map(b => (
                  <option key={b.BRANCHID} value={b.BRANCHID}>
                    {b.BARANCHNAME}
                  </option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                {t('from_date_label', 'From:')}
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="w-full h-8 px-2.5 bg-white border border-border rounded text-xs font-semibold text-slate-700 focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                {t('to_date_label', 'To:')}
              </label>
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="w-full h-8 px-2.5 bg-white border border-border rounded text-xs font-semibold text-slate-700 focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Direct Search */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                {t('search_pr_num', 'Search PR #')}
              </label>
              <div className="relative flex gap-1">
                <input
                  type="text"
                  placeholder={t('search_pr_placeholder', 'PR-1001...')}
                  value={searchPrNb}
                  onChange={e => setSearchPrNb(e.target.value)}
                  className="w-full h-8 px-2.5 bg-white border border-border rounded text-xs text-slate-700 focus:outline-none focus:border-teal-500"
                />
                <button
                  onClick={fetchApprovedRequests}
                  className="px-3 bg-emerald-700 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-sm flex items-center justify-center"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MASTER APPROVED PRs TABLE */}
      <div className="p-6 pt-3 max-w-7xl mx-auto w-full flex-1">
        <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-card text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-border">
                <tr>
                  <th className="py-3 px-3 w-28">{t('pr_number', 'PR #')}</th>
                  <th className="py-3 px-3 min-w-[150px]">{t('requested_by_branch', 'Requested By Branch')}</th>
                  <th className="py-3 px-3 min-w-[150px]">{t('requested_from', 'Requested From')}</th>
                  <th className="py-3 px-3 w-24">{t('date', 'Date')}</th>
                  <th className="py-3 px-3 w-32">{t('delivery_date', 'Delivery Date')}</th>
                  <th className="py-3 px-3 w-28">{t('requested_by', 'Requested By')}</th>
                  <th className="py-3 px-3 w-28">{t('to_location', 'To Location')}</th>
                  <th className="py-3 px-3 min-w-[120px]">{t('remark', 'Remark')}</th>
                  <th className="py-3 px-3 w-28 text-center">{t('confirmed', 'Confirmed')}</th>
                  <th className="py-3 px-3 w-28 text-center">{t('actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {approvedPrList.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400 font-medium">
                      <Truck className="w-10 h-10 text-slate-300 mx-auto mb-2 opacity-50" />
                      <span>{t('no_approved_requests_awaiting', 'No approved requests awaiting receipt found.')}</span>
                    </td>
                  </tr>
                ) : (
                  approvedPrList.map(pr => {
                    const isConfirmed = pr.STATUS === 'Confirmed';

                    return (
                      <tr key={pr.ID} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-teal-700">{pr.REQUESTNB}</td>
                        <td className="py-3 px-3 font-semibold text-slate-800">{pr.TOBRANCH}</td>
                        <td className="py-3 px-3 text-slate-600">{pr.FROMBRANCHNAME}</td>
                        <td className="py-3 px-3 text-slate-600">{pr.CURRENTDATE}</td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-500">{pr.DELIVERYDATE}</td>
                        <td className="py-3 px-3 text-slate-600">{pr.REQUESTEDBY}</td>
                        <td className="py-3 px-3 text-slate-600">{pr.LOCATIONDESCRIPTION}</td>
                        <td className="py-3 px-3 text-slate-500 truncate max-w-[120px]">
                          {pr.REMARK || '-'}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-block ${
                              isConfirmed
                                ? 'bg-cyan-50 text-cyan-700 border-cyan-300'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            }`}
                          >
                            {isConfirmed ? t('confirmed', 'Confirmed') : t('approved', 'Approved')}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleOpenInspection(pr)}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-700 text-white rounded text-[11px] font-bold shadow-sm"
                          >
                            {t('open_details', 'Open Details')}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CONFIRM RECEIVING OF GOODS MODAL (1:1 OMEGA confirmationModal) */}
      {showInspectionModal && activePr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl my-6 flex flex-col overflow-hidden max-h-[92vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-800">
                  {t('confirm_receiving_of_goods', 'Confirm Receiving Of Goods')} &mdash;{' '}
                  <span className="font-mono text-teal-700">{activePr.REQUESTNB}</span>
                </h3>
              </div>
              <button
                onClick={() => setShowInspectionModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Summary Information */}
            <div className="p-5 border-b border-slate-200 bg-white grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-bold block uppercase text-[10px]">{t('receiving_branch_colon', 'Receiving Branch:')}</span>
                <span className="font-bold text-slate-800">{activePr.TOBRANCH}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block uppercase text-[10px]">{t('to_location_colon', 'To Location:')}</span>
                <span className="font-bold text-slate-800">{activePr.LOCATIONDESCRIPTION}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block uppercase text-[10px]">{t('dispatched_from_colon', 'Dispatched From:')}</span>
                <span className="font-bold text-slate-800">{activePr.FROMBRANCHNAME}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block uppercase text-[10px]">{t('delivery_target_colon', 'Delivery Target:')}</span>
                <span className="font-bold text-slate-800">{activePr.DELIVERYDATE}</span>
              </div>
            </div>

            {/* Line Items Receiving Table */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  {t('inspect_record_inbound_qty', 'Inspect & Record Inbound Quantities')}
                </span>
                <span className="text-xs text-slate-400 font-medium italic">
                  {t('verify_physical_count_rec', '* Verify physical count and record actual Qty Rec (Received)')}
                </span>
              </div>

              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">{t('code', 'Code')}</th>
                    <th className="py-2.5 px-3">{t('description', 'Description')}</th>
                    <th className="py-2.5 px-3 text-center">{t('unit', 'Unit')}</th>
                    <th className="py-2.5 px-3 text-center">{t('qty_req', 'Qty Req')}</th>
                    <th className="py-2.5 px-3 text-center">{t('qty_approved', 'Qty Approved')}</th>
                    <th className="py-2.5 px-3 text-center bg-cyan-50/70 text-cyan-800">{t('qty_rec', 'Qty Rec')}</th>
                    <th className="py-2.5 px-3">{t('damage_discrepancy_note', 'Damage / Discrepancy Note')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activePr.items.map((it, idx) => (
                    <tr key={it.ID} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">{it.ITEMCODE}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{it.ITEMDESCRIPTION}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">
                          {it.UNIT}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-600">{it.QTYREQ}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-800">{it.QTYAPP}</td>
                      <td className="py-2.5 px-3 text-center bg-cyan-50/40">
                        <input
                          type="number"
                          min="0"
                          value={it.QTYREC}
                          onChange={e => handleUpdateQtyRec(idx, Number(e.target.value))}
                          className="w-20 h-7 text-center font-extrabold text-cyan-800 bg-white border border-cyan-300 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={it.REMARK || ''}
                          onChange={e => handleUpdateRemark(idx, e.target.value)}
                          placeholder={t('note_discrepancies_ph', 'Note discrepancies...')}
                          className="w-full h-7 px-2 bg-transparent hover:bg-white border border-transparent hover:border-slate-200 focus:border-teal-500 focus:bg-white rounded text-xs text-slate-700"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  {t('overall_receiving_notes', 'Overall Receiving Notes:')}
                </label>
                <input
                  type="text"
                  value={activePr.REMARK || ''}
                  onChange={e => setActivePr({ ...activePr, REMARK: e.target.value })}
                  placeholder={t('receiving_notes_placeholder', 'e.g. All crates received in good condition, seal verified')}
                  className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-teal-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPrintModal(true)}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded text-xs font-semibold border border-slate-300 shadow-sm flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t('print_receipt', 'Print Receipt')}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowInspectionModal(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded"
                >
                  {t('close', 'Close')}
                </button>

                <button
                  onClick={handleSaveDraft}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded text-xs font-bold shadow-sm"
                >
                  {t('save_draft', 'Save Draft')}
                </button>

                {activePr.STATUS === 'Confirmed' ? (
                  <button
                    onClick={handleUnconfirmReceiving}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold shadow-sm flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t('unconfirm', 'UnConfirm')}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleConfirmReceiving}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-sm flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{t('confirm_receiving', 'Confirm Receiving')}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINT RECEIPT MODAL */}
      {showPrintModal && activePr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden">
            <div className="bg-slate-800 text-white px-5 py-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider">
                {t('goods_receipt_slip', 'Goods Receipt Slip')} &mdash; {activePr.REQUESTNB}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-bold flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{t('print', 'Print')}</span>
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 text-slate-800 font-mono text-xs space-y-5">
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h2 className="text-lg font-bold">{t('goods_receipt_note_grn', 'GOODS RECEIPT NOTE (GRN)')}</h2>
                  <p className="text-[11px] text-slate-500">{t('omega_erp_operations', 'Omega ERP Operations')}</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-teal-700">{activePr.REQUESTNB}</span>
                  <p className="text-slate-500 text-[10px]">{t('date', 'Date')}: {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded">
                <div>
                  <span className="text-slate-400 block text-[9px]">{t('received_by_branch_colon', 'RECEIVED BY BRANCH:')}</span>
                  <span className="font-bold">{activePr.TOBRANCH} ({activePr.LOCATIONDESCRIPTION})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">{t('dispatched_from_upper_colon', 'DISPATCHED FROM:')}</span>
                  <span className="font-bold">{activePr.FROMBRANCHNAME}</span>
                </div>
              </div>

              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 font-bold border-b">
                  <tr>
                    <th className="p-2 w-8">#</th>
                    <th className="p-2">{t('item_description', 'Item Description')}</th>
                    <th className="p-2 w-20 text-center">{t('approved', 'Approved')}</th>
                    <th className="p-2 w-20 text-center">{t('received', 'Received')}</th>
                    <th className="p-2 w-14 text-center">{t('unit', 'Unit')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {activePr.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2 text-slate-400">{idx + 1}</td>
                      <td className="p-2 font-semibold">{it.ITEMDESCRIPTION}</td>
                      <td className="p-2 text-center">{it.QTYAPP}</td>
                      <td className="p-2 text-center font-bold text-teal-800">{it.QTYREC}</td>
                      <td className="p-2 text-center">{it.UNIT}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="grid grid-cols-2 gap-8 pt-6 border-t text-center text-[10px]">
                <div>
                  <div className="h-8 border-b border-slate-300 mb-1"></div>
                  <span className="text-slate-400">{t('delivered_by_driver', 'Delivered By Driver')}</span>
                </div>
                <div>
                  <div className="h-8 border-b border-slate-300 mb-1"></div>
                  <span className="text-slate-400">{t('received_by_store_clerk', 'Received By Store Clerk')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
