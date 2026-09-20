'use client';

import React, { useState, useMemo } from 'react';
import ProductRequestView from '@/components/ProductRequestView';
import ManageProductRequestsView from '@/components/ManageProductRequestsView';
import ProductReqPreparationView from '@/components/ProductReqPreparationView';
import ReceivingOfGoodsView from '@/components/ReceivingOfGoodsView';
import ProductRequestReportsView from '@/components/ProductRequestReportsView';
import RejectReasonsView from '@/components/RejectReasonsView';
import {
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  Edit2,
  Trash2,
  Send,
  FileText,
  Boxes,
  Truck,
  Layers,
  ArrowRightLeft,
  ChevronDown,
  RefreshCw,
  ShoppingCart,
  DollarSign,
  PackageCheck,
  QrCode,
  CheckSquare,
  Square,
  FileSpreadsheet,
  FileCode,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  Barcode,
  Calendar,
  ClipboardList
} from 'lucide-react';
import Link from 'next/link';
import {
  INITIAL_PRODUCT_REQUESTS,
  INITIAL_MANAGE_REQUESTS,
  INITIAL_REQUEST_PREP,
  INITIAL_RECEIVING_GOODS,
  INITIAL_REJECT_REASONS,
  ProductRequestRecord,
  ManageProductRequestRecord,
  ProductReqPrepRecord,
  ReceivingGoodsRecord,
  RejectReasonRecord,
  INITIAL_PRODUCTS
} from './operationsData';

interface OperationsProductRequestViewsProps {
  section:
    | 'product_request'
    | 'manage_product_requests'
    | 'product_req_prep'
    | 'receiving_goods'
    | 'product_req_reports'
    | 'request_reject_reasons';
}

export default function OperationsProductRequestViews({ section }: OperationsProductRequestViewsProps) {
  const activeSectionStr = section as string;
  if (activeSectionStr === 'product_request') {
    return <ProductRequestView />;
  }
  if (activeSectionStr === 'manage_product_requests') {
    return <ManageProductRequestsView />;
  }
  if (activeSectionStr === 'product_req_prep') {
    return <ProductReqPreparationView />;
  }
  if (activeSectionStr === 'receiving_goods') {
    return <ReceivingOfGoodsView />;
  }
  if (activeSectionStr === 'product_req_reports') {
    return <ProductRequestReportsView />;
  }
  if (activeSectionStr === 'request_reject_reasons') {
    return <RejectReasonsView />;
  }

  // Master Datasets
  const [productRequests, setProductRequests] = useState<ProductRequestRecord[]>(INITIAL_PRODUCT_REQUESTS);
  const [manageRequests, setManageRequests] = useState<ManageProductRequestRecord[]>(INITIAL_MANAGE_REQUESTS);
  const [prepRequests, setPrepRequests] = useState<ProductReqPrepRecord[]>(INITIAL_REQUEST_PREP);
  const [receivingGoods, setReceivingGoods] = useState<ReceivingGoodsRecord[]>(INITIAL_RECEIVING_GOODS);
  const [rejectReasons, setRejectReasons] = useState<RejectReasonRecord[]>(INITIAL_REJECT_REASONS);

  // Common UI states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterBranch, setFilterBranch] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Selection & Multi-actions
  const [selectedPRIds, setSelectedPRIds] = useState<string[]>([]);
  const [expandedPRId, setExpandedPRId] = useState<string | null>(null);
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<any | null>(null);

  // Dynamic Reports Filter State
  const [reportGroupBy, setReportGroupBy] = useState<'branch' | 'date' | 'category' | 'item'>('branch');
  const [reportStartDate, setReportStartDate] = useState<string>('2026-09-01');
  const [reportEndDate, setReportEndDate] = useState<string>('2026-09-30');
  const [dateByDelivery, setDateByDelivery] = useState<boolean>(false);
  const [reportBranch, setReportBranch] = useState<string>('All Branches');
  const [reportFromBranch, setReportFromBranch] = useState<string>('All Branches');
  const [reportStatus, setReportStatus] = useState<string>('All Statuses');
  const [reportItemType, setReportItemType] = useState<string>('All Types');
  const [isFilteringReport, setIsFilteringReport] = useState<boolean>(false);

  const resetReportFilters = () => {
    setReportGroupBy('branch');
    setReportBranch('All Branches');
    setReportFromBranch('All Branches');
    setReportStatus('All Statuses');
    setReportItemType('All Types');
    setReportStartDate('2026-09-01');
    setReportEndDate('2026-09-30');
    setDateByDelivery(false);
    showToast('Filters reset to default.');
  };

  const handleFilterReport = () => {
    setIsFilteringReport(true);
    setTimeout(() => {
      setIsFilteringReport(false);
      showToast(`Filtered report by [${reportGroupBy.toUpperCase()}] matching active criteria.`);
    }, 350);
  };

  // Forms
  const [newPRForm, setNewPRForm] = useState({
    prNo: `PR-2026-${Math.floor(700 + Math.random() * 200)}`,
    date: new Date().toISOString().split('T')[0],
    deliveryDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    requestedByBranch: 'Choueifat POS Store Front & Showroom',
    destinationBranch: 'Beirut Central Distribution Depot',
    requestedBy: 'Fadi Haddad (Store Mgr)',
    location: 'Choueifat POS Store Front & Showroom',
    itemCode: 'EVOO-B-750ML',
    description: 'Extra Virgin Olive Oil (Cold Pressed) 750ml Dark Glass Bottle',
    qtyReq: 60,
    unit: '750ml Bottle',
    costUsd: 7.80,
    remark: 'Restock seasonal display shelf'
  });

  const [newRejectReasonForm, setNewRejectReasonForm] = useState({
    code: 'CUSTOM-REJECT',
    description: 'Special stock reservation for priority commercial tier',
    active: true
  });

  const [substituteForm, setSubstituteForm] = useState({
    prNo: '',
    originalItem: '',
    substituteItem: 'EVOO-B-500ML',
    substituteQty: 100,
    reason: 'Temporary stockout of 750ml bottles, substituting with 500ml Dorica units'
  });

  const [confirmReceiveForm, setConfirmReceiveForm] = useState({
    prNo: '',
    verifiedQty: 120,
    conditionOk: true,
    receiverNotes: 'All seal caps intact. Verified batch code.'
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Branch list
  const branches = [
    'All',
    'Choueifat POS Store Front & Showroom',
    'Beirut Central Distribution Depot',
    'Marjeyoun Press Mill & Silos',
    'Hasbaya Grove Intake Station'
  ];

  // =========================================================================
  // SECTION 1: PRODUCT REQUEST
  // =========================================================================
  const filteredProductRequests = useMemo(() => {
    return productRequests.filter((pr) => {
      const matchesSearch =
        pr.prNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pr.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pr.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pr.requestedBy.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBranch = filterBranch === 'All' || pr.requestedByBranch === filterBranch;
      const matchesStatus = filterStatus === 'All' || pr.status === filterStatus;
      return matchesSearch && matchesBranch && matchesStatus;
    });
  }, [productRequests, searchQuery, filterBranch, filterStatus]);

  const handleCreatePR = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: ProductRequestRecord = {
      id: `PR-${Date.now().toString().slice(-4)}`,
      prNo: newPRForm.prNo,
      date: newPRForm.date,
      deliveryDate: newPRForm.deliveryDate,
      requestedByBranch: newPRForm.requestedByBranch,
      destinationBranch: newPRForm.destinationBranch,
      requestedBy: newPRForm.requestedBy,
      location: newPRForm.location,
      itemCode: newPRForm.itemCode,
      description: newPRForm.description,
      qtyReq: Number(newPRForm.qtyReq),
      qtyOh: 1420,
      costUsd: Number(newPRForm.costUsd),
      unit: newPRForm.unit,
      status: 'PENDING',
      approvedBy: 'Pending Review',
      approvedDate: '-',
      remark: newPRForm.remark
    };

    setProductRequests([newRecord, ...productRequests]);
    // Also push to Manage Product Requests
    const newMPR: ManageProductRequestRecord = {
      id: `MPR-${Date.now().toString().slice(-4)}`,
      prNo: newRecord.prNo,
      date: newRecord.date,
      requestedByBranch: newRecord.requestedByBranch,
      requestedFromBranch: newRecord.destinationBranch,
      requestedBy: newRecord.requestedBy,
      itemCode: newRecord.itemCode,
      description: newRecord.description,
      qtyReq: newRecord.qtyReq,
      qtyApproved: 0,
      qtyOh: newRecord.qtyOh,
      status: 'PENDING_REVIEW',
      location: newRecord.destinationBranch,
      deliveryDate: newRecord.deliveryDate,
      remark: newRecord.remark
    };
    setManageRequests([newMPR, ...manageRequests]);

    setActiveModal(null);
    showToast(`Product Request ${newRecord.prNo} generated and submitted for management review!`);
  };

  // =========================================================================
  // SECTION 2: MANAGE PRODUCT REQUESTS
  // =========================================================================
  const filteredManageRequests = useMemo(() => {
    return manageRequests.filter((mpr) => {
      const matchesSearch =
        mpr.prNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mpr.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mpr.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mpr.requestedBy.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBranch = filterBranch === 'All' || mpr.requestedByBranch === filterBranch;
      return matchesSearch && matchesBranch;
    });
  }, [manageRequests, searchQuery, filterBranch]);

  const handleSelectPR = (prNo: string) => {
    if (selectedPRIds.includes(prNo)) {
      setSelectedPRIds(selectedPRIds.filter((id) => id !== prNo));
    } else {
      setSelectedPRIds([...selectedPRIds, prNo]);
    }
  };

  const handleSelectAllPRs = () => {
    if (selectedPRIds.length === filteredManageRequests.length) {
      setSelectedPRIds([]);
    } else {
      setSelectedPRIds(filteredManageRequests.map((m) => m.prNo));
    }
  };

  const handleBatchApprove = () => {
    if (selectedPRIds.length === 0) {
      showToast('Please select at least one PR to approve.');
      return;
    }
    setManageRequests((prev) =>
      prev.map((item) =>
        selectedPRIds.includes(item.prNo)
          ? { ...item, status: 'ALLOCATED', qtyApproved: item.qtyReq }
          : item
      )
    );
    setProductRequests((prev) =>
      prev.map((item) =>
        selectedPRIds.includes(item.prNo)
          ? {
              ...item,
              status: 'APPROVED',
              approvedBy: 'Jichi Mohammed',
              approvedDate: new Date().toISOString().replace('T', ' ').slice(0, 16)
            }
          : item
      )
    );
    // Push into Prep Queue
    selectedPRIds.forEach((prNo) => {
      const pr = manageRequests.find((m) => m.prNo === prNo);
      if (pr) {
        setPrepRequests((prevPrep) => [
          {
            id: `PREP-${Date.now()}-${Math.floor(Math.random() * 100)}`,
            ticketNo: `PREP-${pr.prNo.replace('PR-', '')}-1`,
            status: 'QUEUED',
            itemCode: pr.itemCode,
            description: pr.description,
            qtyReq: pr.qtyReq,
            qtyOh: pr.qtyOh,
            qtyApp: pr.qtyReq,
            pickerName: 'Hassan Sleiman (Tablet 02)',
            processedPct: 0
          },
          ...prevPrep
        ]);
      }
    });

    showToast(`Approved ${selectedPRIds.length} Product Requests & Dispatched to Tablet Picker Prep Queue!`);
    setSelectedPRIds([]);
  };

  const handleBatchUnapprove = () => {
    if (selectedPRIds.length === 0) {
      showToast('Please select at least one PR to un-approve.');
      return;
    }
    setManageRequests((prev) =>
      prev.map((item) =>
        selectedPRIds.includes(item.prNo)
          ? { ...item, status: 'PENDING_REVIEW', qtyApproved: 0 }
          : item
      )
    );
    setProductRequests((prev) =>
      prev.map((item) =>
        selectedPRIds.includes(item.prNo)
          ? { ...item, status: 'PENDING', approvedBy: 'Pending Review', approvedDate: '-' }
          : item
      )
    );
    showToast(`Reset ${selectedPRIds.length} Product Requests back to Pending Review.`);
    setSelectedPRIds([]);
  };

  // =========================================================================
  // SECTION 3: PRODUCT REQ. PREPARATION (TABLET MANAGER)
  // =========================================================================
  const handleUpdatePrepProgress = (id: string, newPct: number) => {
    setPrepRequests((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newStatus = newPct === 100 ? 'PACKED' : newPct > 0 ? 'PICKING' : 'QUEUED';
          return { ...p, processedPct: newPct, status: newStatus };
        }
        return p;
      })
    );
    showToast(`Preparation ticket updated to ${newPct}% complete!`);
  };

  // =========================================================================
  // SECTION 4: RECEIVING OF GOODS
  // =========================================================================
  const handleConfirmReceiving = (e: React.FormEvent) => {
    e.preventDefault();
    setReceivingGoods((prev) =>
      prev.map((r) =>
        r.prNo === confirmReceiveForm.prNo
          ? {
              ...r,
              confirmed: true,
              receivedBy: 'Fadi Haddad (Store Mgr)',
              remark: confirmReceiveForm.receiverNotes
            }
          : r
      )
    );
    setActiveModal(null);
    showToast(`Goods Receipt for ${confirmReceiveForm.prNo} confirmed and posted to branch inventory!`);
  };

  // =========================================================================
  // SECTION 5: DYNAMIC REPORT AGGREGATIONS
  // =========================================================================
  const reportData = useMemo(() => {
    if (reportGroupBy === 'branch') {
      const map: Record<
        string,
        { branch: string; count: number; totalReq: number; totalApp: number; cost: number }
      > = {};
      productRequests.forEach((pr) => {
        if (!map[pr.requestedByBranch]) {
          map[pr.requestedByBranch] = {
            branch: pr.requestedByBranch,
            count: 0,
            totalReq: 0,
            totalApp: 0,
            cost: 0
          };
        }
        map[pr.requestedByBranch].count += 1;
        map[pr.requestedByBranch].totalReq += pr.qtyReq;
        map[pr.requestedByBranch].totalApp += pr.status === 'APPROVED' ? pr.qtyReq : 0;
        map[pr.requestedByBranch].cost += pr.qtyReq * pr.costUsd;
      });
      return Object.values(map);
    } else if (reportGroupBy === 'item') {
      const map: Record<
        string,
        { itemCode: string; description: string; unit: string; totalReq: number; totalCost: number; count: number }
      > = {};
      productRequests.forEach((pr) => {
        if (!map[pr.itemCode]) {
          map[pr.itemCode] = {
            itemCode: pr.itemCode,
            description: pr.description,
            unit: pr.unit,
            totalReq: 0,
            totalCost: 0,
            count: 0
          };
        }
        map[pr.itemCode].totalReq += pr.qtyReq;
        map[pr.itemCode].totalCost += pr.qtyReq * pr.costUsd;
        map[pr.itemCode].count += 1;
      });
      return Object.values(map);
    } else if (reportGroupBy === 'category') {
      return [
        { category: 'Olive Oils & Culinary Liquids', items: 3, totalReq: 210, totalCost: 3876.00, fulfillmentRate: '92%' },
        { category: 'Bottling & Packaging Consumables', items: 2, totalReq: 450, totalCost: 1102.50, fulfillmentRate: '100%' },
        { category: 'Olive By-Products & Organic Soap', items: 1, totalReq: 300, totalCost: 345.00, fulfillmentRate: '100%' }
      ];
    } else {
      // Group by Date
      const map: Record<string, { date: string; count: number; totalQty: number; status: string }> = {};
      productRequests.forEach((pr) => {
        const d = dateByDelivery ? pr.deliveryDate : pr.date;
        if (!map[d]) {
          map[d] = { date: d, count: 0, totalQty: 0, status: 'Active' };
        }
        map[d].count += 1;
        map[d].totalQty += pr.qtyReq;
      });
      return Object.values(map);
    }
  }, [productRequests, reportGroupBy, dateByDelivery]);

  // Export & Print utility
  const handleExport = (format: 'csv' | 'json') => {
    let content = '';
    let filename = `vanguard_export_${section}_${new Date().toISOString().slice(0, 10)}`;
    if (format === 'csv') {
      content = 'PR #,Date,Branch,Item,Qty,Status\n' + productRequests.map(p => `${p.prNo},${p.date},"${p.requestedByBranch}","${p.itemCode}",${p.qtyReq},${p.status}`).join('\n');
      filename += '.csv';
    } else {
      content = JSON.stringify(productRequests, null, 2);
      filename += '.json';
    }
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    showToast(`Exported ${section} report to ${format.toUpperCase()} successfully!`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl animate-fade-in border border-emerald-400">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* =========================================================================
          TOP ACTION BAR & TITLE (MATCHING OMEGA ERP / VANGUARD HYBRID)
          ========================================================================= */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              {section === 'product_request' && <ShoppingCart className="w-6 h-6" />}
              {section === 'manage_product_requests' && <PackageCheck className="w-6 h-6" />}
              {section === 'receiving_goods' && <Truck className="w-6 h-6" />}
              {section === 'product_req_reports' && <FileSpreadsheet className="w-6 h-6" />}
              {section === 'request_reject_reasons' && <AlertTriangle className="w-6 h-6" />}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 capitalize">
                {section === 'product_request' && 'Product Request Workstation'}
                {section === 'manage_product_requests' && 'Manage Product Requests'}
                {section === 'receiving_goods' && 'Receiving of Goods'}
                {section === 'product_req_reports' && 'Product Request Dynamic Reports'}
                {section === 'request_reject_reasons' && 'Request Reject Reasons'}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Authentic Omega ERP Operations Module • Southern Olive Oil Products S.A.R.L
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar Buttons per Section */}
        <div className="flex flex-wrap items-center gap-2">
          {section === 'product_request' && (
            <>
              <button
                onClick={() => setActiveModal('new_pr')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition shadow-md shadow-emerald-900/20"
              >
                <Plus className="w-4 h-4" />
                <span>New Request</span>
              </button>
              <button
                onClick={() => {
                  showToast('Auto-generated request based on items below safety minimums!');
                }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-sm font-semibold transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>Below Minimum Items</span>
              </button>
            </>
          )}

          {section === 'manage_product_requests' && (
            <>
              <button
                onClick={handleBatchApprove}
                disabled={selectedPRIds.length === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition shadow-md ${
                  selectedPRIds.length > 0
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                    : 'bg-slate-100 text-slate-500 cursor-not-allowed border border-slate-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Checked ({selectedPRIds.length})</span>
              </button>
              <button
                onClick={handleBatchUnapprove}
                disabled={selectedPRIds.length === 0}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition ${
                  selectedPRIds.length > 0
                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300'
                    : 'bg-slate-100 text-slate-500 cursor-not-allowed border border-slate-200'
                }`}
              >
                <X className="w-4 h-4" />
                <span>UnApprove</span>
              </button>
              <button
                onClick={() => {
                  if (selectedPRIds.length === 0) {
                    showToast('Select requests to generate delivery notes.');
                    return;
                  }
                  setActiveModal('delivery_notes');
                }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 text-sm font-semibold transition"
              >
                <FileText className="w-4 h-4" />
                <span>Delivery Notes</span>
              </button>
            </>
          )}



          {section === 'receiving_goods' && (
            <>
              <button
                onClick={() => {
                  setConfirmReceiveForm({
                    prNo: receivingGoods[0]?.prNo || 'PR-2026-701',
                    verifiedQty: 120,
                    conditionOk: true,
                    receiverNotes: 'All seal caps intact. Quality verified.'
                  });
                  setActiveModal('confirm_receive');
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Receipt</span>
              </button>
            </>
          )}

          {section === 'request_reject_reasons' && (
            <button
              onClick={() => setActiveModal('new_reject_reason')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold transition shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>New Reject Reason</span>
            </button>
          )}

          {/* Global Tools: Export & Print */}
          <div className="flex items-center gap-1.5 ml-2 border-l border-slate-300 pl-3">
            <button
              onClick={() => handleExport('csv')}
              title="Export CSV"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrint}
              title="Print Workstation"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SEARCH & FILTER BAR (IF APPLICABLE)
          ========================================================================= */}
      {section !== 'product_req_reports' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by Request #, Item Code, Description, Requester..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary transition"
            />
          </div>

          <div>
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-primary transition"
            >
              {branches.map((b) => (
                <option key={b} value={b}>
                  {b === 'All' ? 'All Requesting Branches' : b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-primary transition"
            >
              <option value="All">All Statuses</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
              <option value="ALLOCATED">Allocated</option>
            </select>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 1: PRODUCT REQUEST (AUTHENTIC OMEGA TABLE)
          ========================================================================= */}
      {section === 'product_request' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-primary text-xs uppercase font-bold text-white border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">PR #</th>
                  <th className="px-4 py-3.5">Date PR</th>
                  <th className="px-4 py-3.5">Delivery Date</th>
                  <th className="px-4 py-3.5">Requested By</th>
                  <th className="px-4 py-3.5">From Branch / Location</th>
                  <th className="px-4 py-3.5">Item Requested</th>
                  <th className="px-4 py-3.5 text-right">Qty Req</th>
                  <th className="px-4 py-3.5 text-right">Qty OH</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5">Approved By</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-xs">
                {filteredProductRequests.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-12 text-center text-slate-500 font-sans">
                      No Product Requests matching current filters.
                    </td>
                  </tr>
                ) : (
                  filteredProductRequests.map((pr) => (
                    <tr key={pr.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-bold text-amber-400">{pr.prNo}</td>
                      <td className="px-4 py-3 text-slate-700 font-sans">{pr.date}</td>
                      <td className="px-4 py-3 text-slate-700 font-sans">{pr.deliveryDate}</td>
                      <td className="px-4 py-3 text-slate-800 font-sans">{pr.requestedBy}</td>
                      <td className="px-4 py-3 text-slate-500 font-sans text-xs truncate max-w-[160px]">
                        {pr.requestedByBranch}
                      </td>
                      <td className="px-4 py-3 font-sans">
                        <div className="font-semibold text-slate-800">{pr.itemCode}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                          {pr.description}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-100">
                        {pr.qtyReq}{' '}
                        <span className="text-[10px] text-slate-500 font-normal font-sans">{pr.unit}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500">{pr.qtyOh}</td>
                      <td className="px-4 py-3 text-center font-sans">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            pr.status === 'APPROVED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : pr.status === 'PENDING'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {pr.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-sans text-xs">{pr.approvedBy}</td>
                      <td className="px-4 py-3 text-right font-sans">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedRecordForDetail(pr);
                              setActiveModal('pr_detail');
                            }}
                            title="View Details"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {pr.status === 'PENDING' && (
                            <button
                              onClick={() => {
                                setProductRequests((prev) =>
                                  prev.map((item) =>
                                    item.id === pr.id
                                      ? {
                                          ...item,
                                          status: 'APPROVED',
                                          approvedBy: 'Jichi Mohammed',
                                          approvedDate: new Date().toISOString().slice(0, 10)
                                        }
                                      : item
                                  )
                                );
                                showToast(`Product Request ${pr.prNo} Approved directly!`);
                              }}
                              title="Direct Approve"
                              className="p-1.5 rounded-lg bg-emerald-900/30 hover:bg-emerald-800/50 text-emerald-400 border border-emerald-500/30 transition"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {pr.status === 'APPROVED' && (
                            <Link
                              href="/backoffice/operations?section=product_req_prep"
                              title="Product Req. Preparation Workstation"
                              className="p-1.5 rounded-lg bg-teal-900/30 hover:bg-teal-800/50 text-teal-400 border border-teal-500/30 transition"
                            >
                              <ClipboardList className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: MANAGE PRODUCT REQUESTS (CHECKBOXES, BATCH APPROVAL, SUBSTITUTES)
          ========================================================================= */}
      {section === 'manage_product_requests' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-primary text-xs uppercase font-bold text-white border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5 text-center w-12">
                    <button
                      onClick={handleSelectAllPRs}
                      className="text-slate-500 hover:text-amber-400 transition"
                    >
                      {selectedPRIds.length === filteredManageRequests.length &&
                      filteredManageRequests.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3.5">PR #</th>
                  <th className="px-4 py-3.5">Request Date</th>
                  <th className="px-4 py-3.5">Req. Branch</th>
                  <th className="px-4 py-3.5">Fulfilling Location</th>
                  <th className="px-4 py-3.5">Product Code & Description</th>
                  <th className="px-4 py-3.5 text-right">Qty Req</th>
                  <th className="px-4 py-3.5 text-right">Qty App</th>
                  <th className="px-4 py-3.5 text-right">Qty OH</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-xs">
                {filteredManageRequests.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-12 text-center text-slate-500 font-sans">
                      No Manageable Requests found.
                    </td>
                  </tr>
                ) : (
                  filteredManageRequests.map((mpr) => {
                    const isSelected = selectedPRIds.includes(mpr.prNo);
                    return (
                      <tr
                        key={mpr.id}
                        className={`hover:bg-slate-50 transition ${
                          isSelected ? 'bg-amber-500/5' : ''
                        }`}
                      >
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleSelectPR(mpr.prNo)}
                            className="text-slate-500 hover:text-amber-400 transition"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-amber-400" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-3 font-bold text-amber-400">{mpr.prNo}</td>
                        <td className="px-4 py-3 text-slate-700 font-sans">{mpr.date}</td>
                        <td className="px-4 py-3 text-slate-700 font-sans text-xs truncate max-w-[150px]">
                          {mpr.requestedByBranch}
                        </td>
                        <td className="px-4 py-3 text-slate-500 font-sans text-xs truncate max-w-[150px]">
                          {mpr.requestedFromBranch}
                        </td>
                        <td className="px-4 py-3 font-sans">
                          <div className="font-semibold text-slate-800">{mpr.itemCode}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                            {mpr.description}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-slate-100">{mpr.qtyReq}</td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-400">
                          {mpr.qtyApproved}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-500">{mpr.qtyOh}</td>
                        <td className="px-4 py-3 text-center font-sans">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              mpr.status === 'ALLOCATED'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : mpr.status === 'SUBSTITUTED'
                                ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {mpr.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-sans">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSubstituteForm({
                                  prNo: mpr.prNo,
                                  originalItem: mpr.itemCode,
                                  substituteItem: 'EVOO-B-500ML',
                                  substituteQty: mpr.qtyReq,
                                  reason: 'Stockout of 750ml, substitute with 500ml'
                                });
                                setActiveModal('substitute_modal');
                              }}
                              title="Substitute Item"
                              className="px-2 py-1 rounded-lg bg-sky-950 text-sky-400 border border-sky-700/50 hover:bg-sky-900 transition text-[11px] font-medium"
                            >
                              Substitute
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRecordForDetail(mpr);
                                setActiveModal('reject_modal');
                              }}
                              title="Reject Request"
                              className="p-1 rounded-lg bg-rose-950 text-rose-400 border border-rose-700/50 hover:bg-rose-900 transition"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}



      {/* =========================================================================
          VIEW 4: RECEIVING OF GOODS
          ========================================================================= */}
      {section === 'receiving_goods' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-primary text-xs uppercase font-bold text-white border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">PR #</th>
                  <th className="px-4 py-3.5">Request Date</th>
                  <th className="px-4 py-3.5">Delivery Date</th>
                  <th className="px-4 py-3.5">Requesting Branch</th>
                  <th className="px-4 py-3.5">Fulfilling Location</th>
                  <th className="px-4 py-3.5">Items Summary</th>
                  <th className="px-4 py-3.5">Received By</th>
                  <th className="px-4 py-3.5 text-center">Confirmed</th>
                  <th className="px-4 py-3.5">Remark</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-xs">
                {receivingGoods.map((rcv) => (
                  <tr key={rcv.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-bold text-amber-400">{rcv.prNo}</td>
                    <td className="px-4 py-3 text-slate-700 font-sans">{rcv.date}</td>
                    <td className="px-4 py-3 text-slate-700 font-sans">{rcv.deliveryDate}</td>
                    <td className="px-4 py-3 text-slate-700 font-sans text-xs truncate max-w-[150px]">
                      {rcv.requestedByBranch}
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-sans text-xs truncate max-w-[150px]">
                      {rcv.requestedFromBranch}
                    </td>
                    <td className="px-4 py-3 font-sans font-semibold text-slate-800">
                      {rcv.itemsSummary}
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-sans text-xs">{rcv.receivedBy}</td>
                    <td className="px-4 py-3 text-center font-sans">
                      {rcv.confirmed ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-400 font-semibold text-[11px] bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                          <Clock className="w-3.5 h-3.5" /> Awaiting Inspection
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-sans text-xs truncate max-w-[180px]">
                      {rcv.remark}
                    </td>
                    <td className="px-4 py-3 text-right font-sans">
                      <button
                        onClick={() => {
                          setConfirmReceiveForm({
                            prNo: rcv.prNo,
                            verifiedQty: 120,
                            conditionOk: true,
                            receiverNotes: rcv.remark
                          });
                          setActiveModal('confirm_receive');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition"
                      >
                        Details & Verify
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 5: PRODUCT REQUEST REPORTS (DYNAMIC HEADERS DEPENDING ON GROUP BY)
          ========================================================================= */}
      {section === 'product_req_reports' && (
        <div className="space-y-4">
          {/* Dynamic Filter Controls (Exact Omega ERP Match) */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                {/* Group Report By */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Group Report By
                  </label>
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      onClick={() => setReportGroupBy('branch')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        reportGroupBy === 'branch'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-slate-500 hover:text-white'
                      }`}
                    >
                      Branch
                    </button>
                    <button
                      onClick={() => setReportGroupBy('item')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        reportGroupBy === 'item'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-slate-500 hover:text-white'
                      }`}
                    >
                      Item
                    </button>
                    <button
                      onClick={() => setReportGroupBy('category')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        reportGroupBy === 'category'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-slate-500 hover:text-white'
                      }`}
                    >
                      Category
                    </button>
                    <button
                      onClick={() => setReportGroupBy('date')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        reportGroupBy === 'date'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-slate-500 hover:text-white'
                      }`}
                    >
                      Date
                    </button>
                  </div>
                </div>

                {/* Branch Selection */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Branch
                  </label>
                  <select
                    value={reportBranch}
                    onChange={(e) => setReportBranch(e.target.value)}
                    className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-primary"
                  >
                    <option>All Branches</option>
                    <option>Beirut Central Distribution Depot</option>
                    <option>Choueifat POS Store Front & Showroom</option>
                    <option>Sidon Retail & Storage Outlet</option>
                    <option>Tyre Regional Warehouse Hub</option>
                  </select>
                </div>

                {/* Status Selection */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Status
                  </label>
                  <select
                    value={reportStatus}
                    onChange={(e) => setReportStatus(e.target.value)}
                    className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-primary"
                  >
                    <option>All Statuses</option>
                    <option>Pending</option>
                    <option>Approved</option>
                    <option>Transferred</option>
                    <option>Rejected</option>
                  </select>
                </div>

                {/* Item Type Selection */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Item Type
                  </label>
                  <select
                    value={reportItemType}
                    onChange={(e) => setReportItemType(e.target.value)}
                    className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-primary"
                  >
                    <option>All Types</option>
                    <option>Extra Virgin Olive Oil</option>
                    <option>Olives & Pickles</option>
                    <option>Raw Materials</option>
                    <option>Packaging</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleFilterReport}
                  disabled={isFilteringReport}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isFilteringReport ? 'animate-spin' : ''}`} />
                  <span>Filter Report</span>
                </button>
                <button
                  onClick={resetReportFilters}
                  className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-semibold border border-rose-500/30 transition cursor-pointer"
                >
                  Reset Filters
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                  title="Print Report"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Report</span>
                </button>
              </div>
            </div>

            {/* Date Type & Range */}
            <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-200 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Date Type:</span>
                <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="dateByDeliveryRadio"
                    checked={dateByDelivery}
                    onChange={() => setDateByDelivery(true)}
                    className="text-amber-500 focus:ring-amber-500"
                  />
                  <span>By Delivery Date</span>
                </label>
                <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="dateByDeliveryRadio"
                    checked={!dateByDelivery}
                    onChange={() => setDateByDelivery(false)}
                    className="text-amber-500 focus:ring-amber-500"
                  />
                  <span>By Creation Date</span>
                </label>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <span className="text-slate-500 text-xs font-medium">From:</span>
                <input
                  type="date"
                  value={reportStartDate}
                  onChange={(e) => setReportStartDate(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-xs text-slate-800"
                />
                <span className="text-slate-500 text-xs font-medium">To:</span>
                <input
                  type="date"
                  value={reportEndDate}
                  onChange={(e) => setReportEndDate(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-xs text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* DYNAMIC REPORT TABLE: Headers shift based on reportGroupBy */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 text-slate-900 flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Grouping Mode: <span className="text-white">{reportGroupBy.toUpperCase()}</span>
              </div>
              <div className="text-xs text-slate-500">
                Period: {reportStartDate} to {reportEndDate}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-primary text-xs uppercase font-bold text-white border-b border-slate-200">
                  {reportGroupBy === 'branch' && (
                    <tr>
                      <th className="px-4 py-3.5">Branch Name</th>
                      <th className="px-4 py-3.5 text-center">PR Count</th>
                      <th className="px-4 py-3.5 text-right">Total Qty Requested</th>
                      <th className="px-4 py-3.5 text-right">Total Qty Approved</th>
                      <th className="px-4 py-3.5 text-right">Total Valuation ($)</th>
                      <th className="px-4 py-3.5 text-center">Fulfillment Status</th>
                    </tr>
                  )}

                  {reportGroupBy === 'item' && (
                    <tr>
                      <th className="px-4 py-3.5">Item Code</th>
                      <th className="px-4 py-3.5">Description</th>
                      <th className="px-4 py-3.5">Unit</th>
                      <th className="px-4 py-3.5 text-center">Request Occurrences</th>
                      <th className="px-4 py-3.5 text-right">Aggregated Qty</th>
                      <th className="px-4 py-3.5 text-right">Total Cost ($)</th>
                    </tr>
                  )}

                  {reportGroupBy === 'category' && (
                    <tr>
                      <th className="px-4 py-3.5">Product Category</th>
                      <th className="px-4 py-3.5 text-center">Unique Items</th>
                      <th className="px-4 py-3.5 text-right">Total Requested Units</th>
                      <th className="px-4 py-3.5 text-right">Estimated Cost ($)</th>
                      <th className="px-4 py-3.5 text-center">Safety Fulfillment %</th>
                    </tr>
                  )}

                  {reportGroupBy === 'date' && (
                    <tr>
                      <th className="px-4 py-3.5">
                        {dateByDelivery ? 'Required Delivery Date' : 'Request Creation Date'}
                      </th>
                      <th className="px-4 py-3.5 text-center">Requests Filed</th>
                      <th className="px-4 py-3.5 text-right">Total Units Requested</th>
                      <th className="px-4 py-3.5 text-center">Batch Status</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-xs">
                  {reportData.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      {reportGroupBy === 'branch' && (
                        <>
                          <td className="px-4 py-3 font-sans font-semibold text-slate-800">
                            {row.branch}
                          </td>
                          <td className="px-4 py-3 text-center text-amber-400 font-bold">{row.count}</td>
                          <td className="px-4 py-3 text-right text-slate-800 font-bold">{row.totalReq}</td>
                          <td className="px-4 py-3 text-right text-emerald-400 font-bold">
                            {row.totalApp}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-slate-100">
                            ${row.cost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 text-center font-sans">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              Active Pipeline
                            </span>
                          </td>
                        </>
                      )}

                      {reportGroupBy === 'item' && (
                        <>
                          <td className="px-4 py-3 font-bold text-amber-400">{row.itemCode}</td>
                          <td className="px-4 py-3 font-sans text-slate-800">{row.description}</td>
                          <td className="px-4 py-3 font-sans text-slate-500">{row.unit}</td>
                          <td className="px-4 py-3 text-center text-slate-700">{row.count}</td>
                          <td className="px-4 py-3 text-right font-bold text-slate-100">
                            {row.totalReq}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-slate-100">
                            ${row.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                        </>
                      )}

                      {reportGroupBy === 'category' && (
                        <>
                          <td className="px-4 py-3 font-sans font-semibold text-slate-800">
                            {row.category}
                          </td>
                          <td className="px-4 py-3 text-center text-amber-400 font-bold">{row.items}</td>
                          <td className="px-4 py-3 text-right text-slate-800 font-bold">{row.totalReq}</td>
                          <td className="px-4 py-3 text-right font-bold text-slate-100">
                            ${row.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 text-center text-emerald-400 font-bold">
                            {row.fulfillmentRate}
                          </td>
                        </>
                      )}

                      {reportGroupBy === 'date' && (
                        <>
                          <td className="px-4 py-3 text-slate-800 font-bold">{row.date}</td>
                          <td className="px-4 py-3 text-center text-amber-400 font-bold">{row.count}</td>
                          <td className="px-4 py-3 text-right text-slate-800 font-bold">{row.totalQty}</td>
                          <td className="px-4 py-3 text-center font-sans text-emerald-400">
                            {row.status}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 6: REQUEST REJECT REASONS
          ========================================================================= */}
      {section === 'request_reject_reasons' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-primary text-xs uppercase font-bold text-white border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">#</th>
                  <th className="px-4 py-3.5">Reason Code</th>
                  <th className="px-4 py-3.5">Reason Description</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-xs">
                {rejectReasons.map((reason, idx) => (
                  <tr key={reason.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-slate-500 font-bold">{idx + 1}</td>
                    <td className="px-4 py-3 font-bold text-amber-400">{reason.code}</td>
                    <td className="px-4 py-3 font-sans text-slate-800 text-sm">{reason.description}</td>
                    <td className="px-4 py-3 text-center font-sans">
                      {reason.active ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Active
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-700/50 text-slate-500">
                          Disabled
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-sans">
                      <button
                        onClick={() => {
                          setRejectReasons(
                            rejectReasons.map((r) =>
                              r.id === reason.id ? { ...r, active: !r.active } : r
                            )
                          );
                          showToast(`Toggled status for reason ${reason.code}`);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold transition"
                      >
                        Toggle Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: NEW PRODUCT REQUEST
          ========================================================================= */}
      {activeModal === 'new_pr' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 w-full text-slate-800 shadow-2xl max-w-2xl rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 text-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <ShoppingCart className="w-5 h-5" />
                <span>Create New Product Request (PR)</span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-500 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePR} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Request Number (PR #)
                  </label>
                  <input
                    type="text"
                    required
                    value={newPRForm.prNo}
                    onChange={(e) => setNewPRForm({ ...newPRForm, prNo: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl text-slate-800 px-3 py-2 text-sm text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Requesting Branch
                  </label>
                  <select
                    value={newPRForm.requestedByBranch}
                    onChange={(e) =>
                      setNewPRForm({
                        ...newPRForm,
                        requestedByBranch: e.target.value,
                        location: e.target.value
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-xl text-slate-800 px-3 py-2 text-sm text-slate-800"
                  >
                    {branches
                      .filter((b) => b !== 'All')
                      .map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Destination Fulfilling Branch
                  </label>
                  <select
                    value={newPRForm.destinationBranch}
                    onChange={(e) =>
                      setNewPRForm({ ...newPRForm, destinationBranch: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded-xl text-slate-800 px-3 py-2 text-sm text-slate-800"
                  >
                    {branches
                      .filter((b) => b !== 'All')
                      .map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Delivery Required By
                  </label>
                  <input
                    type="date"
                    required
                    value={newPRForm.deliveryDate}
                    onChange={(e) => setNewPRForm({ ...newPRForm, deliveryDate: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl text-slate-800 px-3 py-2 text-sm text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Item / Inventory Product
                  </label>
                  <select
                    value={newPRForm.itemCode}
                    onChange={(e) => {
                      const selectedProd = INITIAL_PRODUCTS.find((p) => p.code === e.target.value);
                      setNewPRForm({
                        ...newPRForm,
                        itemCode: e.target.value,
                        description: selectedProd?.description || newPRForm.description,
                        unit: selectedProd?.unit || newPRForm.unit,
                        costUsd: selectedProd?.cost || newPRForm.costUsd
                      });
                    }}
                    className="w-full bg-white border border-slate-300 rounded-xl text-slate-800 px-3 py-2 text-sm text-slate-800"
                  >
                    {INITIAL_PRODUCTS.map((prod) => (
                      <option key={prod.code} value={prod.code}>
                        {prod.code} - {prod.description}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quantity to Request
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newPRForm.qtyReq}
                    onChange={(e) => setNewPRForm({ ...newPRForm, qtyReq: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-xl text-slate-800 px-3 py-2 text-sm text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Remark / Justification
                </label>
                <textarea
                  rows={2}
                  value={newPRForm.remark}
                  onChange={(e) => setNewPRForm({ ...newPRForm, remark: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl text-slate-800 px-3 py-2 text-sm text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition shadow-lg"
                >
                  Submit Product Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: SUBSTITUTE ITEM
          ========================================================================= */}
      {activeModal === 'substitute_modal' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 w-full text-slate-800 shadow-2xl max-w-lg rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 text-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sky-400 font-bold">
                <ArrowRightLeft className="w-5 h-5" />
                <span>Substitute Product Request Item</span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-500 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="text-slate-500">
                  Target PR: <span className="font-mono text-amber-400">{substituteForm.prNo}</span>
                </div>
                <div className="text-slate-500">
                  Original Item Code:{' '}
                  <span className="font-mono text-slate-800">{substituteForm.originalItem}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Substitute Item
                </label>
                <select
                  value={substituteForm.substituteItem}
                  onChange={(e) =>
                    setSubstituteForm({ ...substituteForm, substituteItem: e.target.value })
                  }
                  className="w-full bg-white border border-slate-300 rounded-xl text-slate-800 px-3 py-2 text-sm text-slate-800"
                >
                  {INITIAL_PRODUCTS.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.code} - {p.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Substitute Quantity
                </label>
                <input
                  type="number"
                  value={substituteForm.substituteQty}
                  onChange={(e) =>
                    setSubstituteForm({
                      ...substituteForm,
                      substituteQty: Number(e.target.value)
                    })
                  }
                  className="w-full bg-white border border-slate-300 rounded-xl text-slate-800 px-3 py-2 text-sm text-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Substitution
                </label>
                <textarea
                  rows={2}
                  value={substituteForm.reason}
                  onChange={(e) =>
                    setSubstituteForm({ ...substituteForm, reason: e.target.value })
                  }
                  className="w-full bg-white border border-slate-300 rounded-xl text-slate-800 px-3 py-2 text-sm text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setManageRequests((prev) =>
                      prev.map((item) =>
                        item.prNo === substituteForm.prNo
                          ? {
                              ...item,
                              status: 'SUBSTITUTED',
                              itemCode: substituteForm.substituteItem,
                              qtyApproved: substituteForm.substituteQty,
                              remark: `[Substituted] ${substituteForm.reason}`
                            }
                          : item
                      )
                    );
                    setActiveModal(null);
                    showToast(
                      `Item substituted for PR ${substituteForm.prNo} with ${substituteForm.substituteItem}!`
                    );
                  }}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold transition"
                >
                  Apply Substitution
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: CONFIRM GOODS RECEIPT
          ========================================================================= */}
      {activeModal === 'confirm_receive' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 w-full text-slate-800 shadow-2xl max-w-md rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 text-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <PackageCheck className="w-5 h-5" />
                <span>Confirm Receiving of Goods</span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-500 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReceiving} className="p-6 space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500">Fulfilling PR:</span>{' '}
                <span className="font-mono text-amber-400 font-bold">
                  {confirmReceiveForm.prNo}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Physical Verified Quantity
                </label>
                <input
                  type="number"
                  required
                  value={confirmReceiveForm.verifiedQty}
                  onChange={(e) =>
                    setConfirmReceiveForm({
                      ...confirmReceiveForm,
                      verifiedQty: Number(e.target.value)
                    })
                  }
                  className="w-full bg-white border border-slate-300 rounded-xl text-slate-800 px-3 py-2 text-sm text-slate-800 font-mono"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="condCheck"
                  checked={confirmReceiveForm.conditionOk}
                  onChange={(e) =>
                    setConfirmReceiveForm({
                      ...confirmReceiveForm,
                      conditionOk: e.target.checked
                    })
                  }
                  className="rounded border-slate-300 bg-white text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="condCheck" className="text-xs text-slate-700 font-medium cursor-pointer">
                  All carton security seals & bottle integrity verified intact
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Receiving Inspector Notes
                </label>
                <textarea
                  rows={2}
                  value={confirmReceiveForm.receiverNotes}
                  onChange={(e) =>
                    setConfirmReceiveForm({
                      ...confirmReceiveForm,
                      receiverNotes: e.target.value
                    })
                  }
                  className="w-full bg-white border border-slate-300 rounded-xl text-slate-800 px-3 py-2 text-sm text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition"
                >
                  Post & Confirm Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: NEW REJECT REASON
          ========================================================================= */}
      {activeModal === 'new_reject_reason' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 w-full text-slate-800 shadow-2xl max-w-md rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 text-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <AlertTriangle className="w-5 h-5" />
                <span>Add Request Reject Reason</span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-500 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason Code
                </label>
                <input
                  type="text"
                  required
                  value={newRejectReasonForm.code}
                  onChange={(e) =>
                    setNewRejectReasonForm({ ...newRejectReasonForm, code: e.target.value })
                  }
                  className="w-full bg-white border border-slate-300 rounded-xl text-slate-800 px-3 py-2 text-sm text-slate-800 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={newRejectReasonForm.description}
                  onChange={(e) =>
                    setNewRejectReasonForm({
                      ...newRejectReasonForm,
                      description: e.target.value
                    })
                  }
                  className="w-full bg-white border border-slate-300 rounded-xl text-slate-800 px-3 py-2 text-sm text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRejectReasons([
                      ...rejectReasons,
                      {
                        id: `RR-${Date.now().toString().slice(-4)}`,
                        code: newRejectReasonForm.code,
                        description: newRejectReasonForm.description,
                        active: true
                      }
                    ]);
                    setActiveModal(null);
                    showToast(`Added reject reason "${newRejectReasonForm.code}"!`);
                  }}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold transition"
                >
                  Save Reason
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: DELIVERY NOTES PREVIEW
          ========================================================================= */}
      {activeModal === 'delivery_notes' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 w-full text-slate-800 shadow-2xl max-w-xl rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 text-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sky-400 font-bold">
                <FileText className="w-5 h-5" />
                <span>Product Request Delivery Notes (Batch Manifest)</span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-500 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-xs space-y-2">
                <div className="text-amber-400 font-bold">
                  MANIFEST REF: DN-PR-BATCH-{new Date().toISOString().slice(0, 10)}
                </div>
                <div className="text-slate-700">
                  Carrier: SuperSonic Fleet Management Van #B-310892
                </div>
                <div className="text-slate-500">
                  Total PRs included in this trip: {selectedPRIds.length}
                </div>
                <div className="border-t border-slate-200 pt-2 space-y-1">
                  {selectedPRIds.map((id) => (
                    <div key={id} className="flex justify-between text-slate-800">
                      <span>{id}</span>
                      <span className="text-emerald-400">Ready for Transit</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-sm font-semibold transition"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handlePrint();
                    setActiveModal(null);
                  }}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Manifest</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
