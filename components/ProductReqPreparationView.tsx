'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Boxes,
  CheckCircle2,
  Clock,
  Printer,
  Save,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  X,
  ChevronDown,
  Layers,
  ChefHat,
  Check,
  PackageCheck
} from 'lucide-react';
import {
  ProductRequestHeader,
  ProductRequestLineItem,
  OMEGA_PR_BRANCHES
} from '@/lib/productRequestData';

interface PrepItem extends ProductRequestLineItem {
  isPrepared?: boolean;
}

interface PrepRequest extends ProductRequestHeader {
  items: PrepItem[];
}

export default function ProductReqPreparationView() {
  // Top filter state
  const [prepDate, setPrepDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [fromBranchId, setFromBranchId] = useState<number>(2); // Default Central Kitchen
  const [selectedItemTypeId, setSelectedItemTypeId] = useState<number>(0);

  // Master preparation requests
  const [requestsList, setRequestsList] = useState<PrepRequest[]>([]);
  const [itemTypes, setItemTypes] = useState<Array<{ ID: number; NAME: string }>>([]);

  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [printingPr, setPrintingPr] = useState<PrepRequest | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch item types and initial requests
  const fetchItemTypes = async () => {
    try {
      const res = await fetch('/api/getItemTypesService');
      if (res.ok) {
        const data = await res.json();
        setItemTypes(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPreparationRequests = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/getRequestsByBranchByItemType', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: prepDate,
          frombranchid: fromBranchId,
          itemtypeid: selectedItemTypeId
        })
      });
      if (res.ok) {
        const data: ProductRequestHeader[] = await res.json();
        // Initialize isPrepared state
        const prepData: PrepRequest[] = data.map(pr => ({
          ...pr,
          items: pr.items.map(it => ({
            ...it,
            isPrepared: it.QTYREC > 0 || pr.STATUS === 'Confirmed'
          }))
        }));
        setRequestsList(prepData);
      }
    } catch (e) {
      showToast('Error fetching preparation requests', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItemTypes();
  }, []);

  useEffect(() => {
    fetchPreparationRequests();
  }, [prepDate, fromBranchId, selectedItemTypeId]);

  // Toggle item prepared status
  const handleTogglePrepared = (prIndex: number, itemIndex: number) => {
    const updated = [...requestsList];
    const it = updated[prIndex].items[itemIndex];
    it.isPrepared = !it.isPrepared;
    setRequestsList(updated);
  };

  // Mark all items prepared in card
  const handleMarkAllPrepared = (prIndex: number) => {
    const updated = [...requestsList];
    const allPrep = updated[prIndex].items.every(i => i.isPrepared);
    updated[prIndex].items.forEach(i => {
      i.isPrepared = !allPrep;
    });
    setRequestsList(updated);
    showToast(allPrep ? 'Marked items as pending' : 'All items marked as prepared');
  };

  // Update item Qty App (to prepare)
  const handleUpdateQtyApp = (prIndex: number, itemIndex: number, newQty: number) => {
    const updated = [...requestsList];
    updated[prIndex].items[itemIndex].QTYAPP = Math.max(0, newQty);
    setRequestsList(updated);
  };

  // Save preparation card
  const handleSavePreparation = async (pr: PrepRequest) => {
    try {
      const res = await fetch('/api/savePrByItemType', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: pr.ID,
          items: pr.items.map(it => ({
            ITEMID: it.ITEMID,
            QTYAPP: it.QTYAPP,
            REMARK: it.REMARK,
            isPrepared: it.isPrepared
          }))
        })
      });
      const data = await res.json();
      if (data.status === 1) {
        showToast(`Preparation saved for ${pr.REQUESTNB}!`);
      } else {
        showToast('Failed to save preparation', 'error');
      }
    } catch (e) {
      showToast('Error communicating with server', 'error');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f3f5f8] text-slate-800 font-sans">
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
      <div className="bg-white border-b border-[#e7eaec] px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
            <span>Operations Center</span>
            <span>/</span>
            <span className="text-teal-600 font-bold">Product Req. Preparation</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Product Request Preparation</h1>
            <span className="bg-amber-50 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1.5">
              <ChefHat className="w-3.5 h-3.5" />
              <span>Kitchen Prep Workstation</span>
            </span>
          </div>
        </div>

        <button
          onClick={fetchPreparationRequests}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold border border-slate-300 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-600' : ''}`} />
          <span>Refresh Station</span>
        </button>
      </div>

      {/* TOP FILTERS BAR */}
      <div className="p-6 pb-2 max-w-7xl mx-auto w-full">
        <div className="bg-white rounded-lg border border-[#e7eaec] shadow-sm p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
            {/* Product Request Date */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Product Request Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={prepDate}
                  onChange={e => setPrepDate(e.target.value)}
                  className="w-full h-9 px-3 pl-8 bg-white border border-[#e5e6e7] rounded-md text-xs font-semibold text-slate-700 focus:outline-none focus:border-teal-500"
                />
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Preparation Station / From Branch */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Preparation Station / From Branch *
              </label>
              <select
                value={fromBranchId}
                onChange={e => setFromBranchId(Number(e.target.value))}
                className="w-full h-9 px-3 bg-white border border-[#e5e6e7] rounded-md text-xs font-semibold text-slate-700 focus:outline-none focus:border-teal-500"
              >
                {OMEGA_PR_BRANCHES.map(b => (
                  <option key={b.BRANCHID} value={b.BRANCHID}>
                    {b.BARANCHNAME}
                  </option>
                ))}
              </select>
            </div>

            {/* By Item Type */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                By Item Type
              </label>
              <select
                value={selectedItemTypeId}
                onChange={e => setSelectedItemTypeId(Number(e.target.value))}
                className="w-full h-9 px-3 bg-white border border-[#e5e6e7] rounded-md text-xs font-semibold text-slate-700 focus:outline-none focus:border-teal-500"
              >
                {itemTypes.map(t => (
                  <option key={t.ID} value={t.ID}>
                    {t.NAME}
                  </option>
                ))}
              </select>
            </div>

            {/* Get Requests Button */}
            <div>
              <button
                onClick={fetchPreparationRequests}
                disabled={isLoading}
                className="w-full h-9 bg-[#1ab394] hover:bg-[#18a689] text-white rounded-md text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Boxes className="w-3.5 h-3.5" />
                <span>Get Requests</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DEMAND CARDS WORKSTATION */}
      <div className="p-6 pt-3 max-w-7xl mx-auto w-full flex-1 space-y-5">
        {requestsList.length === 0 ? (
          <div className="bg-white rounded-lg border border-[#e7eaec] p-12 text-center text-slate-400">
            <ChefHat className="w-12 h-12 text-slate-300 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-slate-700">No Preparation Demands Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              There are no pending or approved product requests requiring preparation for the selected date.
            </p>
          </div>
        ) : (
          requestsList.map((pr, prIdx) => {
            const preparedCount = pr.items.filter(i => i.isPrepared).length;
            const isAllPrepared = pr.items.length > 0 && preparedCount === pr.items.length;

            return (
              <div
                key={pr.ID}
                className="bg-white rounded-lg border border-[#e7eaec] shadow-sm overflow-hidden"
              >
                {/* CARD HEADER */}
                <div className="px-5 py-3.5 bg-slate-50 border-b border-[#e7eaec] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-teal-700 text-sm bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {pr.REQUESTNB}
                    </span>
                    <h3 className="text-sm font-bold text-slate-800">
                      Deliver To: {pr.TOBRANCH} &mdash;{' '}
                      <span className="text-slate-500 font-normal">{pr.LOCATIONDESCRIPTION}</span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{pr.DELIVERYDATE}</span>
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        isAllPrepared
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-amber-50 text-amber-700 border-amber-300'
                      }`}
                    >
                      {preparedCount} / {pr.items.length} Prepared
                    </span>
                  </div>
                </div>

                {/* ITEMS PREPARATION TABLE */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#f9fafb] text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-[#e7eaec]">
                      <tr>
                        <th className="py-2.5 px-3 w-16 text-center">Status</th>
                        <th className="py-2.5 px-3">Item Description</th>
                        <th className="py-2.5 px-3 w-28">Code</th>
                        <th className="py-2.5 px-3 w-24 text-center">Unit</th>
                        <th className="py-2.5 px-3 w-24 text-center">Qty Req</th>
                        <th className="py-2.5 px-3 w-24 text-center">Qty OH</th>
                        <th className="py-2.5 px-3 w-28 text-center bg-teal-50/60 text-teal-800">
                          Qty App
                        </th>
                        <th className="py-2.5 px-3 w-24 text-center">Processed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {pr.items.map((it, itemIdx) => (
                        <tr
                          key={it.ITEMID}
                          className={`hover:bg-slate-50/70 transition-colors ${
                            it.isPrepared ? 'bg-emerald-50/20' : ''
                          }`}
                        >
                          {/* Status */}
                          <td className="py-2.5 px-3 text-center">
                            {it.isPrepared ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                <Check className="w-3 h-3" />
                                <span>Ready</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                Pending
                              </span>
                            )}
                          </td>

                          {/* Description */}
                          <td className="py-2.5 px-3 font-semibold text-slate-800">
                            {it.ITEMDESCRIPTION}
                          </td>

                          {/* Code */}
                          <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                            {it.ITEMCODE}
                          </td>

                          {/* Unit */}
                          <td className="py-2.5 px-3 text-center text-slate-500">{it.UNIT}</td>

                          {/* Qty Req */}
                          <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                            {it.QTYREQ}
                          </td>

                          {/* Qty OH */}
                          <td className="py-2.5 px-3 text-center font-mono text-slate-500">
                            {it.QTYOH}
                          </td>

                          {/* Qty App */}
                          <td className="py-2.5 px-3 text-center bg-teal-50/30">
                            <input
                              type="number"
                              min="0"
                              value={it.QTYAPP}
                              onChange={e =>
                                handleUpdateQtyApp(prIdx, itemIdx, Number(e.target.value))
                              }
                              className="w-16 h-7 text-center font-bold text-teal-800 bg-white border border-teal-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                            />
                          </td>

                          {/* Processed Checkbox */}
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => handleTogglePrepared(prIdx, itemIdx)}
                              className={`w-6 h-6 rounded flex items-center justify-center mx-auto transition-all ${
                                it.isPrepared
                                  ? 'bg-emerald-600 text-white'
                                  : 'border-2 border-slate-300 hover:border-teal-500 text-transparent'
                              }`}
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* CARD FOOTER ACTIONS */}
                <div className="px-5 py-3 bg-[#f9fafb] border-t border-[#e7eaec] flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-slate-500 italic">
                    {pr.REMARK ? `Note: "${pr.REMARK}"` : 'No special note'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMarkAllPrepared(prIdx)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold border border-slate-300 shadow-sm"
                    >
                      {isAllPrepared ? 'Unmark All' : 'Mark All Prepared'}
                    </button>

                    <button
                      onClick={() => setPrintingPr(pr)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold border border-slate-300 shadow-sm flex items-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                      <span>Print Ticket</span>
                    </button>

                    <button
                      onClick={() => handleSavePreparation(pr)}
                      className="px-4 py-1.5 bg-[#1ab394] hover:bg-[#18a689] text-white rounded text-xs font-bold shadow-sm flex items-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* PRINT TICKET MODAL */}
      {printingPr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg my-8 overflow-hidden">
            <div className="bg-slate-800 text-white px-5 py-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider">
                Kitchen Prep Ticket &mdash; {printingPr.REQUESTNB}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-bold flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setPrintingPr(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 font-mono text-xs text-slate-900 space-y-4">
              <div className="text-center border-b pb-3">
                <h3 className="text-base font-bold">KITCHEN PREPARATION TICKET</h3>
                <p className="text-[11px] text-slate-500">Omega ERP Operations</p>
                <div className="text-lg font-extrabold text-teal-700 mt-1">{printingPr.REQUESTNB}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded">
                <div>
                  <span className="text-slate-400 block text-[9px]">TARGET DESTINATION:</span>
                  <span className="font-bold">{printingPr.TOBRANCH}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">PREP STATION:</span>
                  <span className="font-bold">{printingPr.FROMBRANCHNAME}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">DELIVERY TIME:</span>
                  <span className="font-bold">{printingPr.DELIVERYDATE}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">ITEMS COUNT:</span>
                  <span className="font-bold">{printingPr.items.length} items</span>
                </div>
              </div>

              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 font-bold border-b">
                  <tr>
                    <th className="p-1.5 w-6">#</th>
                    <th className="p-1.5">Item</th>
                    <th className="p-1.5 w-16 text-center">To Prep</th>
                    <th className="p-1.5 w-12 text-center">Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {printingPr.items.map((it, i) => (
                    <tr key={i}>
                      <td className="p-1.5 text-slate-400">{i + 1}</td>
                      <td className="p-1.5 font-bold">{it.ITEMDESCRIPTION}</td>
                      <td className="p-1.5 text-center font-extrabold text-base">{it.QTYAPP}</td>
                      <td className="p-1.5 text-center">{it.UNIT}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pt-4 border-t text-center text-[10px] text-slate-400">
                Prepared By Cook Signature: _______________________
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
