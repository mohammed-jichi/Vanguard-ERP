'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Check,
  X,
  Printer,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  FileText,
  Boxes,
  Truck,
  DollarSign,
  ArrowRightLeft,
  Settings,
  Plus,
  Trash2,
  Sparkles,
  Download,
  SlidersHorizontal,
  Edit2,
  Share2,
  ClipboardList,
  PackageCheck
} from 'lucide-react';
import Link from 'next/link';
import {
  ProductRequestHeader,
  ProductRequestLineItem,
  RejectReasonRecord,
  InventorySearchItem,
  OMEGA_PR_BRANCHES,
  OMEGA_PR_LOCATIONS
} from '@/lib/productRequestData';

export default function ManageProductRequestsView() {
  // Master PR listing state
  const [prList, setPrList] = useState<ProductRequestHeader[]>([]);
  const [rejectReasons, setRejectReasons] = useState<RejectReasonRecord[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventorySearchItem[]>([]);

  // Filter Bar state
  const [filterBranchId, setFilterBranchId] = useState<number>(0);
  const [filterFromBranchId, setFilterFromBranchId] = useState<number>(0);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterFromDate, setFilterFromDate] = useState<string>('2026-09-01');
  const [filterToDate, setFilterToDate] = useState<string>('2026-09-30');
  const [filterSearch, setFilterSearch] = useState<string>('');

  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [expandedRowIds, setExpandedRowIds] = useState<number[]>([]);
  const [selectedPrIds, setSelectedPrIds] = useState<number[]>([]);
  const [isMultipleActionsActive, setIsMultipleActionsActive] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Active Modals state
  const [activePrForDetail, setActivePrForDetail] = useState<ProductRequestHeader | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [rejectingPrId, setRejectingPrId] = useState<number | null>(null);
  const [selectedRejectReason, setSelectedRejectReason] = useState<string>('Out of Stock at Central Warehouse');
  const [customRejectNote, setCustomRejectNote] = useState<string>('');
  const [showSubstituteModal, setShowSubstituteModal] = useState<boolean>(false);
  const [substituteOldItemId, setSubstituteOldItemId] = useState<number>(101);
  const [substituteNewItemId, setSubstituteNewItemId] = useState<number>(102);
  const [showProductionsModal, setShowProductionsModal] = useState<boolean>(false);
  const [productionOrders, setProductionOrders] = useState<any[]>([]);
  const [showStatusReportModal, setShowStatusReportModal] = useState<boolean>(false);
  const [statusReportData, setStatusReportData] = useState<any[]>([]);
  const [showDeliveryNotesModal, setShowDeliveryNotesModal] = useState<boolean>(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch PR records from API
  const fetchAllRequests = async () => {
    setIsLoading(true);
    try {
      // 1. All Product Requests
      const res = await fetch('/api/getAllProductRequestsService', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: filterFromDate,
          to: filterToDate,
          frombranchid: filterBranchId,
          requestedfrombranchid: filterFromBranchId,
          status: filterStatus === 'All' ? undefined : filterStatus,
          search: filterSearch
        })
      });
      if (res.ok) {
        const data = await res.json();
        setPrList(data);
      }

      // 2. Reject Reasons
      const rrRes = await fetch('/api/getAllRejectReasonsService');
      if (rrRes.ok) {
        const rrData = await rrRes.json();
        setRejectReasons(rrData);
      }

      // 3. Master Inventory Items
      const invRes = await fetch('/api/searchInvItemsByBranchByLocationService', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (invRes.ok) {
        const invData = await invRes.json();
        setInventoryItems(invData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRequests();
  }, [filterFromDate, filterToDate, filterBranchId, filterFromBranchId, filterStatus]);

  // Client-side search & filtering
  const filteredRequests = useMemo(() => {
    let list = [...prList];
    if (filterSearch.trim()) {
      const q = filterSearch.toLowerCase().trim();
      list = list.filter(
        r =>
          r.REQUESTNB.toLowerCase().includes(q) ||
          r.TOBRANCH.toLowerCase().includes(q) ||
          r.REQUESTEDBY.toLowerCase().includes(q) ||
          r.REMARK.toLowerCase().includes(q) ||
          r.items.some(i => i.ITEMDESCRIPTION.toLowerCase().includes(q) || i.ITEMCODE.toLowerCase().includes(q))
      );
    }
    return list;
  }, [prList, filterSearch]);

  // Toggle inline row expansion
  const toggleRowExpansion = (id: number) => {
    setExpandedRowIds(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  // Toggle selection for multiple actions
  const toggleSelectPr = (id: number) => {
    setSelectedPrIds(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedPrIds.length === filteredRequests.length) {
      setSelectedPrIds([]);
    } else {
      setSelectedPrIds(filteredRequests.map(r => r.ID));
    }
  };

  // Single Approve
  const handleApproveSingle = async (prId: number) => {
    try {
      const res = await fetch('/api/approveProductRequestService', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestid: prId })
      });
      const data = await res.json();
      if (data.status === 1) {
        showToast(`Request #${prId} approved successfully!`);
        fetchAllRequests();
      }
    } catch (e) {
      showToast('Failed to approve request', 'error');
    }
  };

  // Open Reject Modal
  const handleOpenReject = (prId: number) => {
    setRejectingPrId(prId);
    setShowRejectModal(true);
  };

  // Confirm Reject
  const handleConfirmReject = async () => {
    if (!rejectingPrId) return;
    try {
      const reasonToSubmit = customRejectNote.trim() || selectedRejectReason;
      const res = await fetch('/api/rejectProductRequestService', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestid: rejectingPrId,
          reason: reasonToSubmit
        })
      });
      const data = await res.json();
      if (data.status === 1) {
        showToast(`Request #${rejectingPrId} rejected`);
        setShowRejectModal(false);
        setRejectingPrId(null);
        setCustomRejectNote('');
        fetchAllRequests();
      }
    } catch (e) {
      showToast('Failed to reject request', 'error');
    }
  };

  // Multiple Actions: Approve Checked
  const handleApproveMultiple = async (convertToTransaction: boolean = false) => {
    if (selectedPrIds.length === 0) {
      showToast('Please select at least one request', 'error');
      return;
    }

    try {
      const res = await fetch('/api/approveProductRequestService', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedPrIds,
          convert: convertToTransaction
        })
      });
      const data = await res.json();
      if (data.status === 1) {
        showToast(data.message || `${data.count} requests approved!`);
        setSelectedPrIds([]);
        fetchAllRequests();
      }
    } catch (e) {
      showToast('Error approving requests', 'error');
    }
  };

  // Multiple Actions: UnApprove
  const handleUnapproveMultiple = async () => {
    if (selectedPrIds.length === 0) {
      showToast('Please select at least one request', 'error');
      return;
    }

    try {
      const res = await fetch('/api/unapproveProductRequestService', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedPrIds })
      });
      const data = await res.json();
      if (data.status === 1) {
        showToast(data.message || 'Requests reverted to pending');
        setSelectedPrIds([]);
        fetchAllRequests();
      }
    } catch (e) {
      showToast('Error unapproving requests', 'error');
    }
  };

  // Open PR Details Modal
  const handleOpenDetails = (pr: ProductRequestHeader) => {
    setActivePrForDetail(JSON.parse(JSON.stringify(pr)));
    setShowDetailModal(true);
  };

  // Save changes inside PR Details Modal
  const handleSavePrDetails = async () => {
    if (!activePrForDetail) return;
    try {
      const res = await fetch('/api/updaterequestedproductService', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activePrForDetail.ID,
          remark: activePrForDetail.REMARK,
          items: activePrForDetail.items
        })
      });
      const data = await res.json();
      if (data.status === 1) {
        showToast('Request details saved successfully');
        setShowDetailModal(false);
        fetchAllRequests();
      }
    } catch (e) {
      showToast('Error saving request details', 'error');
    }
  };

  // Open Productions Report Modal
  const handleOpenProductions = async () => {
    try {
      const res = await fetch('/api/getProductRequestProductionDates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: filterFromDate })
      });
      if (res.ok) {
        const data = await res.json();
        setProductionOrders(data.productionItems || []);
        setShowProductionsModal(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Open PR Status Report Modal
  const handleOpenStatusReport = async () => {
    try {
      const branchSummary = OMEGA_PR_BRANCHES.map(b => {
        const branchPrs = prList.filter(r => r.BRANCHID === b.BRANCHID);
        return {
          branchName: b.BARANCHNAME,
          total: branchPrs.length,
          pending: branchPrs.filter(r => r.STATUS === 'Pending').length,
          approved: branchPrs.filter(r => r.STATUS === 'Approved').length,
          confirmed: branchPrs.filter(r => r.STATUS === 'Confirmed').length,
          rejected: branchPrs.filter(r => r.STATUS === 'Rejected').length,
          totalQty: branchPrs.reduce((acc, r) => acc + r.TOTAL_QTY, 0)
        };
      });
      setStatusReportData(branchSummary);
      setShowStatusReportModal(true);
    } catch (e) {
      console.error(e);
    }
  };

  // Substitute Item Across Requests
  const handleExecuteSubstitution = async () => {
    try {
      const res = await fetch('/api/saveSubstituteProductRequestsItem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          olditemid: substituteOldItemId,
          newitemid: substituteNewItemId,
          checkedPrIds: selectedPrIds.length > 0 ? selectedPrIds : undefined
        })
      });
      const data = await res.json();
      if (data.status === 1) {
        showToast(`Item substituted successfully across ${data.count} line items!`);
        setShowSubstituteModal(false);
        fetchAllRequests();
      }
    } catch (e) {
      showToast('Failed to substitute item', 'error');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f3f5f8] text-slate-800 font-sans">
      {/* GLOBAL TOAST */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl animate-fade-in border ${
            toastMessage.type === 'error'
              ? 'bg-rose-600 text-white border-rose-400'
              : 'bg-emerald-600 text-white border-emerald-400'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-rose-100" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-100" />
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
            <span className="text-teal-600 font-bold">Manage Product Requests</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Manage Product Requests</h1>
            <span className="bg-teal-50 text-teal-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-teal-200">
              {filteredRequests.length} Requests
            </span>
          </div>
        </div>

        {/* TOP TOOLBAR BUTTONS */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Substitute Button */}
          <button
            onClick={() => setShowSubstituteModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1c84c6] hover:bg-[#1a7bb9] text-white rounded-md text-xs font-semibold transition-all shadow-sm"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Substitute</span>
          </button>

          {/* Productions Button */}
          <button
            onClick={handleOpenProductions}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#23c6c8] hover:bg-[#21b9bb] text-white rounded-md text-xs font-semibold transition-all shadow-sm"
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Productions</span>
          </button>

          {/* PR Status Report Button */}
          <button
            onClick={handleOpenStatusReport}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-md text-xs font-semibold transition-all shadow-sm"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>PR Status</span>
          </button>

          {/* Product Req. Preparation Button */}
          <Link
            href="/backoffice/operations?section=product_req_prep"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-xs font-semibold transition-all shadow-sm"
            title="Open Product Req. Preparation Workstation"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Product Req. Preparation</span>
          </Link>

          {/* Multiple Actions Toggle */}
          <button
            onClick={() => setIsMultipleActionsActive(!isMultipleActionsActive)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-bold transition-all shadow-sm ${
              isMultipleActionsActive
                ? 'bg-[#1ab394] text-white'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Multiple Actions</span>
          </button>

          {/* Refresh button */}
          <button
            onClick={fetchAllRequests}
            disabled={isLoading}
            className="p-2 bg-white hover:bg-slate-50 text-slate-700 rounded-md border border-slate-300 shadow-sm"
            title="Reload Requests"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* BATCH ACTIONS TOOLBAR (Appears when Multiple Actions is toggled) */}
      {isMultipleActionsActive && (
        <div className="bg-teal-50/90 border-b border-teal-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-teal-900">
              Batch Selection: <span className="underline">{selectedPrIds.length}</span> checked
            </span>
            <button
              onClick={handleSelectAll}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 underline"
            >
              {selectedPrIds.length === filteredRequests.length ? 'Deselect All' : 'Select All on Page'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleApproveMultiple(false)}
              className="px-3 py-1.5 bg-[#1ab394] hover:bg-[#18a689] text-white rounded text-xs font-bold shadow-sm flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              <span>Approve Checked</span>
            </button>

            <Link
              href="/backoffice/operations?section=product_req_prep"
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold shadow-sm flex items-center gap-1"
              title="Open Preparation Workstation for Approved Requests"
            >
              <ClipboardList className="w-3 h-3" />
              <span>Send to Preparation</span>
            </Link>

            <button
              onClick={handleUnapproveMultiple}
              className="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white rounded text-xs font-bold shadow-sm flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>UnApprove</span>
            </button>

            <button
              onClick={() => handleApproveMultiple(true)}
              className="px-3 py-1.5 bg-[#1c84c6] hover:bg-[#1a7bb9] text-white rounded text-xs font-bold shadow-sm flex items-center gap-1"
            >
              <Truck className="w-3 h-3" />
              <span>Convert to Transaction</span>
            </button>

            <button
              onClick={() => setShowDeliveryNotesModal(true)}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded text-xs font-bold border border-slate-300 shadow-sm flex items-center gap-1"
            >
              <Printer className="w-3 h-3 text-slate-500" />
              <span>Print Delivery Notes</span>
            </button>
          </div>
        </div>
      )}

      {/* FILTER BAR CARD */}
      <div className="p-6 pb-2 max-w-7xl mx-auto w-full">
        <div className="bg-white rounded-lg border border-[#e7eaec] shadow-sm p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
            {/* Requested By Branch */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Requested By
              </label>
              <select
                value={filterBranchId}
                onChange={e => setFilterBranchId(Number(e.target.value))}
                className="w-full h-8 px-2.5 bg-white border border-[#e5e6e7] rounded text-xs font-semibold text-slate-700 focus:outline-none focus:border-teal-500"
              >
                <option value={0}>All Branches</option>
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
                Requested From
              </label>
              <select
                value={filterFromBranchId}
                onChange={e => setFilterFromBranchId(Number(e.target.value))}
                className="w-full h-8 px-2.5 bg-white border border-[#e5e6e7] rounded text-xs font-semibold text-slate-700 focus:outline-none focus:border-teal-500"
              >
                <option value={0}>All Branches</option>
                {OMEGA_PR_BRANCHES.map(b => (
                  <option key={b.BRANCHID} value={b.BRANCHID}>
                    {b.BARANCHNAME}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="w-full h-8 px-2.5 bg-white border border-[#e5e6e7] rounded text-xs font-semibold text-slate-700 focus:outline-none focus:border-teal-500"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending (0)</option>
                <option value="Approved">Approved (-1)</option>
                <option value="Rejected">Rejected (-2)</option>
                <option value="Confirmed">Confirmed (-3)</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                From:
              </label>
              <input
                type="date"
                value={filterFromDate}
                onChange={e => setFilterFromDate(e.target.value)}
                className="w-full h-8 px-2.5 bg-white border border-[#e5e6e7] rounded text-xs font-semibold text-slate-700 focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                To:
              </label>
              <input
                type="date"
                value={filterToDate}
                onChange={e => setFilterToDate(e.target.value)}
                className="w-full h-8 px-2.5 bg-white border border-[#e5e6e7] rounded text-xs font-semibold text-slate-700 focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Search Input */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="PR #, Item, User..."
                  value={filterSearch}
                  onChange={e => setFilterSearch(e.target.value)}
                  className="w-full h-8 pl-7 pr-2.5 bg-white border border-[#e5e6e7] rounded text-xs text-slate-700 focus:outline-none focus:border-teal-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MASTER PR LISTING TABLE */}
      <div className="p-6 pt-3 max-w-7xl mx-auto w-full flex-1">
        <div className="bg-white rounded-lg border border-[#e7eaec] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f9fafb] text-slate-500 uppercase font-bold tracking-wider border-b border-[#e7eaec]">
                <tr>
                  {isMultipleActionsActive && <th className="py-3 px-3 w-10 text-center"></th>}
                  <th className="py-3 px-3 w-10 text-center"></th>
                  <th className="py-3 px-3 w-28">PR #</th>
                  <th className="py-3 px-3 min-w-[160px]">Requested By Branch</th>
                  <th className="py-3 px-3 w-28">Date</th>
                  <th className="py-3 px-3 min-w-[160px]">Requested From</th>
                  <th className="py-3 px-3 w-32">Requested By</th>
                  <th className="py-3 px-3 w-28">Status</th>
                  <th className="py-3 px-3 w-36">Delivery Date</th>
                  <th className="py-3 px-3 min-w-[140px]">Remark</th>
                  <th className="py-3 px-3 w-40 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isMultipleActionsActive ? 11 : 10}
                      className="py-12 text-center text-slate-400 font-medium"
                    >
                      <Boxes className="w-10 h-10 text-slate-300 mx-auto mb-2 opacity-50" />
                      <span>No product requests found matching criteria.</span>
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map(pr => {
                    const isExpanded = expandedRowIds.includes(pr.ID);
                    const isSelected = selectedPrIds.includes(pr.ID);

                    return (
                      <React.Fragment key={pr.ID}>
                        <tr
                          className={`hover:bg-slate-50/70 transition-colors ${
                            isSelected ? 'bg-teal-50/30' : ''
                          }`}
                        >
                          {/* Selection Checkbox */}
                          {isMultipleActionsActive && (
                            <td className="py-3 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectPr(pr.ID)}
                                className="rounded text-teal-600 focus:ring-0"
                              />
                            </td>
                          )}

                          {/* Expand chevron */}
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => toggleRowExpansion(pr.ID)}
                              className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                              title="Expand items"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-teal-600" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                          </td>

                          {/* PR # (Clickable) */}
                          <td className="py-3 px-3 font-mono font-bold text-teal-700">
                            <button
                              onClick={() => handleOpenDetails(pr)}
                              className="hover:underline flex items-center gap-1"
                            >
                              <span>{pr.REQUESTNB}</span>
                            </button>
                          </td>

                          {/* Requested By Branch */}
                          <td className="py-3 px-3 font-semibold text-slate-800">{pr.TOBRANCH}</td>

                          {/* Date */}
                          <td className="py-3 px-3 text-slate-600">{pr.CURRENTDATE}</td>

                          {/* Requested From */}
                          <td className="py-3 px-3 text-slate-700 font-medium">{pr.FROMBRANCHNAME}</td>

                          {/* Requested By User */}
                          <td className="py-3 px-3 text-slate-600">{pr.REQUESTEDBY}</td>

                          {/* Status badge */}
                          <td className="py-3 px-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-block ${
                                pr.STATUS === 'Approved'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                  : pr.STATUS === 'Confirmed'
                                  ? 'bg-cyan-50 text-cyan-700 border-cyan-300'
                                  : pr.STATUS === 'Rejected'
                                  ? 'bg-rose-50 text-rose-700 border-rose-300'
                                  : 'bg-amber-50 text-amber-700 border-amber-300'
                              }`}
                            >
                              {pr.STATUS}
                            </span>
                          </td>

                          {/* Delivery Date */}
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                            {pr.DELIVERYDATE}
                          </td>

                          {/* Remark */}
                          <td className="py-3 px-3 text-slate-500 truncate max-w-[140px]">
                            {pr.REMARK || '-'}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {/* Quick Approve button if pending */}
                              {pr.STATUS === 'Pending' && (
                                <button
                                  onClick={() => handleApproveSingle(pr.ID)}
                                  className="px-2 py-1 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded text-[11px] font-bold border border-emerald-300 transition-colors"
                                  title="Approve"
                                >
                                  <Check className="w-3 h-3 inline mr-0.5" />
                                  <span>Approve</span>
                                </button>
                              )}

                              {/* Quick Reject button if pending */}
                              {pr.STATUS === 'Pending' && (
                                <button
                                  onClick={() => handleOpenReject(pr.ID)}
                                  className="px-2 py-1 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white rounded text-[11px] font-bold border border-rose-300 transition-colors"
                                  title="Reject"
                                >
                                  <X className="w-3 h-3 inline mr-0.5" />
                                  <span>Reject</span>
                                </button>
                              )}

                              {/* Product Req. Preparation link if Approved */}
                              {pr.STATUS === 'Approved' && (
                                <Link
                                  href="/backoffice/operations?section=product_req_prep"
                                  className="px-2 py-1 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded text-[11px] font-bold border border-emerald-300 transition-colors flex items-center gap-0.5"
                                  title="Product Req. Preparation (Picking & Fulfillment)"
                                >
                                  <ClipboardList className="w-3 h-3" />
                                  <span>Prep</span>
                                </Link>
                              )}

                              {/* Details / Edit button */}
                              <button
                                onClick={() => handleOpenDetails(pr)}
                                className="p-1 rounded text-slate-500 hover:text-teal-700 hover:bg-slate-100"
                                title="View Details / Edit Quantities"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* EXPANDED INLINE SUB-TABLE FOR ITEMS */}
                        {isExpanded && (
                          <tr className="bg-slate-50/80 border-b border-slate-200">
                            <td colSpan={isMultipleActionsActive ? 11 : 10} className="p-4 pl-12">
                              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 space-y-3">
                                <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b pb-2">
                                  <span>Requested Items Breakdown ({pr.items?.length || 0})</span>
                                  <span className="text-slate-500 font-mono">
                                    Target Location: {pr.LOCATIONDESCRIPTION}
                                  </span>
                                </div>

                                <table className="w-full text-left text-xs">
                                  <thead className="text-slate-400 uppercase text-[10px] font-bold border-b">
                                    <tr>
                                      <th className="py-1.5 px-2">Code</th>
                                      <th className="py-1.5 px-2">Description</th>
                                      <th className="py-1.5 px-2 text-center">Unit</th>
                                      <th className="py-1.5 px-2 text-center">Qty Req</th>
                                      <th className="py-1.5 px-2 text-center">Qty App</th>
                                      <th className="py-1.5 px-2 text-center">Qty OH (Source)</th>
                                      <th className="py-1.5 px-2">Supplier</th>
                                      <th className="py-1.5 px-2">Remark</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {pr.items.map(it => (
                                      <tr key={it.ID} className="hover:bg-slate-50">
                                        <td className="py-2 px-2 font-mono text-slate-500 text-[11px]">
                                          {it.ITEMCODE}
                                        </td>
                                        <td className="py-2 px-2 font-semibold text-slate-800">
                                          {it.ITEMDESCRIPTION}
                                        </td>
                                        <td className="py-2 px-2 text-center">
                                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">
                                            {it.UNIT}
                                          </span>
                                        </td>
                                        <td className="py-2 px-2 text-center font-bold text-slate-800">
                                          {it.QTYREQ}
                                        </td>
                                        <td className="py-2 px-2 text-center font-bold text-emerald-700">
                                          {it.QTYAPP}
                                        </td>
                                        <td className="py-2 px-2 text-center font-mono text-teal-700">
                                          {it.QTYOH}
                                        </td>
                                        <td className="py-2 px-2 text-slate-500">{it.SUPPLIER || '-'}</td>
                                        <td className="py-2 px-2 text-slate-500 italic">{it.REMARK || '-'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: PR DETAILS & APPROVAL MODAL (1:1 AUTHENTIC OMEGA prDetailsModal)
          ========================================================================= */}
      {showDetailModal && activePrForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl my-6 flex flex-col overflow-hidden max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-800">
                  Product Request Details &mdash;{' '}
                  <span className="font-mono text-teal-700">{activePrForDetail.REQUESTNB}</span>
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    activePrForDetail.STATUS === 'Approved'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : activePrForDetail.STATUS === 'Confirmed'
                      ? 'bg-cyan-50 text-cyan-700 border-cyan-300'
                      : activePrForDetail.STATUS === 'Rejected'
                      ? 'bg-rose-50 text-rose-700 border-rose-300'
                      : 'bg-amber-50 text-amber-700 border-amber-300'
                  }`}
                >
                  {activePrForDetail.STATUS}
                </span>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Meta information summary */}
            <div className="p-5 border-b border-slate-200 bg-white grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-bold block uppercase text-[10px]">Requested By Branch:</span>
                <span className="font-bold text-slate-800">{activePrForDetail.TOBRANCH}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block uppercase text-[10px]">To Location:</span>
                <span className="font-bold text-slate-800">{activePrForDetail.LOCATIONDESCRIPTION}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block uppercase text-[10px]">Requested From:</span>
                <span className="font-bold text-slate-800">{activePrForDetail.FROMBRANCHNAME}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block uppercase text-[10px]">Target Delivery:</span>
                <span className="font-bold text-slate-800">{activePrForDetail.DELIVERYDATE}</span>
              </div>
            </div>

            {/* Line items table with editable Approved Quantity */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Item Approval & Dispatch Quantities
                </span>
                <span className="text-xs text-slate-400 font-medium italic">
                  * Managers can adjust Qty App (Approved) prior to dispatch
                </span>
              </div>

              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-center">Unit</th>
                    <th className="py-2.5 px-3 text-center">Qty Req</th>
                    <th className="py-2.5 px-3 text-center bg-teal-50/70 text-teal-800">Qty App</th>
                    <th className="py-2.5 px-3 text-center">Qty OH</th>
                    <th className="py-2.5 px-3">Supplier</th>
                    <th className="py-2.5 px-3">Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activePrForDetail.items.map((it, idx) => (
                    <tr key={it.ID} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">{it.ITEMCODE}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{it.ITEMDESCRIPTION}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">
                          {it.UNIT}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-700">{it.QTYREQ}</td>
                      <td className="py-2.5 px-3 text-center bg-teal-50/40">
                        <input
                          type="number"
                          min="0"
                          value={it.QTYAPP}
                          onChange={e => {
                            const val = Number(e.target.value);
                            const updatedPr = { ...activePrForDetail };
                            updatedPr.items[idx].QTYAPP = val;
                            setActivePrForDetail(updatedPr);
                          }}
                          className="w-20 h-7 text-center font-extrabold text-teal-800 bg-white border border-teal-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-600">{it.QTYOH}</td>
                      <td className="py-2.5 px-3 text-slate-500">{it.SUPPLIER || '-'}</td>
                      <td className="py-2.5 px-3 text-slate-500 italic">{it.REMARK || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Note input */}
              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Manager Remark / Resolution Note:
                </label>
                <input
                  type="text"
                  value={activePrForDetail.REMARK || ''}
                  onChange={e =>
                    setActivePrForDetail({ ...activePrForDetail, REMARK: e.target.value })
                  }
                  className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-teal-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {activePrForDetail.STATUS === 'Pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleApproveSingle(activePrForDetail.ID);
                        setShowDetailModal(false);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-sm flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve Request</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        handleOpenReject(activePrForDetail.ID);
                      }}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold shadow-sm flex items-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded"
                >
                  Close
                </button>
                <button
                  onClick={handleSavePrDetails}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: REJECT REASON MODAL (1:1 MATCH OF OMEGA rejectReasonsModal)
          ========================================================================= */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-slate-800">Reject Product Request</h3>
              </div>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Select a standardized reason or provide a custom justification for rejecting request #{rejectingPrId}.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Standard Reason *
                </label>
                <select
                  value={selectedRejectReason}
                  onChange={e => setSelectedRejectReason(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-rose-500 focus:bg-white"
                >
                  {rejectReasons.map(r => (
                    <option key={r.ID} value={r.DESCRIPTION}>
                      {r.DESCRIPTION}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Custom Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={customRejectNote}
                  onChange={e => setCustomRejectNote(e.target.value)}
                  placeholder="Provide additional details for the requesting branch..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-rose-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReject}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: SUBSTITUTE ITEM MODAL (1:1 OMEGA substituteProductRequestsItemModal)
          ========================================================================= */}
      {showSubstituteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-800">Substitute Product Request Item</h3>
              </div>
              <button
                onClick={() => setShowSubstituteModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Replace an out-of-stock or discontinued item across pending product requests with an approved alternative.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Original Item to Replace *
                </label>
                <select
                  value={substituteOldItemId}
                  onChange={e => setSubstituteOldItemId(Number(e.target.value))}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white"
                >
                  {inventoryItems.map(i => (
                    <option key={i.ITEMID} value={i.ITEMID}>
                      {i.ITEMCODE} &mdash; {i.ITEMDESCRIPTION} ({i.UNIT})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Substitute With *
                </label>
                <select
                  value={substituteNewItemId}
                  onChange={e => setSubstituteNewItemId(Number(e.target.value))}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white"
                >
                  {inventoryItems.map(i => (
                    <option key={i.ITEMID} value={i.ITEMID}>
                      {i.ITEMCODE} &mdash; {i.ITEMDESCRIPTION} (Stock: {i.QTYOH} {i.UNIT})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowSubstituteModal(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteSubstitution}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Execute Substitution
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: PRODUCTIONS REPORT MODAL (1:1 OMEGA productionReportsModal)
          ========================================================================= */}
      {showProductionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-800">
                  Central Kitchen Production Demands
                </h3>
              </div>
              <button
                onClick={() => setShowProductionsModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b">
                  <tr>
                    <th className="py-2.5 px-3">Product Code</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-center">Unit</th>
                    <th className="py-2.5 px-3 text-center">Total Qty Needed</th>
                    <th className="py-2.5 px-3 text-center">Requests Count</th>
                    <th className="py-2.5 px-3">Destination Branches</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {productionOrders.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">{p.code}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{p.desc}</td>
                      <td className="py-2.5 px-3 text-center">{p.unit}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-teal-700">{p.totalQty}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-600">
                        {p.requestsCount}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                        {p.branches?.join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Aggregated from all active approved & pending requests
              </span>
              <button
                onClick={async () => {
                  await fetch('/api/produceProductRequestItemsByDate', { method: 'POST' });
                  showToast('Production orders scheduled for Central Kitchen');
                  setShowProductionsModal(false);
                }}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-bold shadow-sm"
              >
                Dispatch to Production
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: PR STATUS BY BRANCH REPORT MODAL
          ========================================================================= */}
      {showStatusReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-800">PR Status Breakdown by Branch</h3>
              </div>
              <button
                onClick={() => setShowStatusReportModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b">
                  <tr>
                    <th className="py-2.5 px-3">Branch Name</th>
                    <th className="py-2.5 px-3 text-center">Total PRs</th>
                    <th className="py-2.5 px-3 text-center text-amber-600">Pending</th>
                    <th className="py-2.5 px-3 text-center text-emerald-600">Approved</th>
                    <th className="py-2.5 px-3 text-center text-cyan-600">Confirmed</th>
                    <th className="py-2.5 px-3 text-center text-rose-600">Rejected</th>
                    <th className="py-2.5 px-3 text-right">Total Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {statusReportData.map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{s.branchName}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-800">{s.total}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-amber-600">{s.pending}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-emerald-600">{s.approved}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-cyan-600">{s.confirmed}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-rose-600">{s.rejected}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-700">
                        {s.totalQty}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowStatusReportModal(false)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 6: MULTI-DELIVERY NOTES MODAL
          ========================================================================= */}
      {showDeliveryNotesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl my-8 overflow-hidden">
            <div className="bg-slate-800 text-white px-6 py-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider">
                Multi-Delivery Notes Print Preview ({selectedPrIds.length} Requests)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print All Delivery Notes</span>
                </button>
                <button
                  onClick={() => setShowDeliveryNotesModal(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 text-slate-800 font-sans text-xs space-y-8">
              {filteredRequests
                .filter(pr => selectedPrIds.includes(pr.ID))
                .map(pr => (
                  <div key={pr.ID} className="border border-slate-200 p-6 rounded-lg page-break-after">
                    <div className="flex justify-between items-center border-b pb-3 mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">DISPATCH & DELIVERY NOTE</h3>
                        <span className="text-xs text-slate-500">Omega ERP Operations</span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-base font-extrabold text-teal-700">{pr.REQUESTNB}</span>
                        <p className="text-slate-500 text-[10px]">{pr.DELIVERYDATE}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded mb-4 text-[11px]">
                      <div>
                        <span className="text-slate-400 font-bold block uppercase text-[9px]">Deliver To:</span>
                        <span className="font-bold">{pr.TOBRANCH} ({pr.LOCATIONDESCRIPTION})</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block uppercase text-[9px]">Dispatched From:</span>
                        <span className="font-bold">{pr.FROMBRANCHNAME}</span>
                      </div>
                    </div>

                    <table className="w-full text-left text-xs border border-slate-200 mb-4">
                      <thead className="bg-slate-100 font-bold border-b">
                        <tr>
                          <th className="p-2 w-8">#</th>
                          <th className="p-2">Item</th>
                          <th className="p-2 w-24">Code</th>
                          <th className="p-2 w-16 text-center">Unit</th>
                          <th className="p-2 w-20 text-center">Qty App</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {pr.items.map((it, idx) => (
                          <tr key={idx}>
                            <td className="p-2 text-slate-400">{idx + 1}</td>
                            <td className="p-2 font-semibold">{it.ITEMDESCRIPTION}</td>
                            <td className="p-2 font-mono text-[11px]">{it.ITEMCODE}</td>
                            <td className="p-2 text-center">{it.UNIT}</td>
                            <td className="p-2 text-center font-bold">{it.QTYAPP}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="grid grid-cols-2 gap-8 pt-4 border-t text-center text-[10px]">
                      <div>
                        <div className="h-8 border-b border-slate-300 mb-1"></div>
                        <span className="uppercase text-slate-400 font-bold">Driver / Dispatcher Signature</span>
                      </div>
                      <div>
                        <div className="h-8 border-b border-slate-300 mb-1"></div>
                        <span className="uppercase text-slate-400 font-bold">Branch Receiver Signature</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
