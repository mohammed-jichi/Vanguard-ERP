'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Menu,
  FileText,
  Filter,
  Calendar,
  Building2,
  Package,
  Layers,
  Search,
  ZoomIn,
  ZoomOut,
  Printer,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Eye,
  FileSpreadsheet,
  X,
  FileCode
} from 'lucide-react';

interface ReportItem {
  REPORTID: number;
  REPORTNAME: string;
  CATEGORYNAME?: string;
  SCREEN_CATEGORYNAME?: string;
  SCREEN_GROUPNAME?: string;
}

interface Branch {
  BRANCHID: number;
  BARANCHNAME: string;
}

interface ItemType {
  id: number | string;
  description: string;
}

interface ReportGroup {
  ID: number;
  GROUPNAME: string;
  DIVISIONID?: number;
}

export default function ProductRequestReportsView() {
  // Sidebar state
  const [hideReportsMenu, setHideReportsMenu] = useState<boolean>(false);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>({
    REPORTID: 405,
    REPORTNAME: 'Qty requested by item'
  });

  // Metadata lists
  const [reportCategories, setReportCategories] = useState<any[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
  const [groups, setGroups] = useState<ReportGroup[]>([]);

  // Filter form state
  const [form, setForm] = useState({
    reportBranch: '0', // Requested By
    reportFromBranch: '2', // Requested From (Central Kitchen)
    prstatus: '-1', // -1: Approved, 0: Pending, -3: Confirmed, 2: Rejected, All: All
    itemType: '0',
    sd_group: 0,
    dateByDelivery: true,
    from: '2026-01-01',
    to: '2026-12-31'
  });

  // Report execution & view states
  const [loading, setLoading] = useState<boolean>(false);
  const [reportData, setReportData] = useState<any | null>(null);
  const [reportHtml, setReportHtml] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [activeTab, setActiveTab] = useState<'grid' | 'document'>('grid');

  // Export Modal
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<string>('csv');

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const reportFrameRef = useRef<HTMLIFrameElement>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 1. Initial Load of Metadata
  useEffect(() => {
    // Fetch reports list
    fetch('/api/getProductRequestReportList', { method: 'POST' })
      .then(r => r.json())
      .then(res => {
        if (res.reports) setReportCategories(res.reports);
      })
      .catch(console.error);

    // Fetch branches
    fetch('/api/getBranchAccessService', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'inventory', all: true })
    })
      .then(r => r.json())
      .then(res => {
        if (Array.isArray(res)) setBranches(res);
      })
      .catch(console.error);

    // Fetch item types
    fetch('/api/getItemTypesService', { method: 'POST' })
      .then(r => r.json())
      .then(res => {
        if (Array.isArray(res)) setItemTypes(res);
      })
      .catch(console.error);

    // Fetch report groups
    fetch('/api/getReportIdGroups')
      .then(r => r.json())
      .then(res => {
        if (Array.isArray(res)) setGroups(res);
      })
      .catch(console.error);
  }, []);

  // 2. Generate Report
  const handleGenerateReport = useCallback(
    async (repItem?: ReportItem) => {
      const rep = repItem || selectedReport;
      if (!rep) return;

      setLoading(true);
      try {
        const res = await fetch('/api/generateProductRequestReport', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reportId: rep.REPORTID,
            from: form.from,
            to: form.to,
            dateByDelivery: form.dateByDelivery,
            itemType: form.itemType,
            reportFromBranch: form.reportFromBranch,
            reportBranch: form.reportBranch,
            prstatus: form.prstatus,
            sd_groupId: form.sd_group
          })
        });

        if (res.ok) {
          const result = await res.json();
          setReportData(result.data);
          setReportHtml(result.html);
          showToast(`Report '${rep.REPORTNAME}' generated successfully`, 'success');
        } else {
          showToast('Failed to generate report', 'error');
        }
      } catch (err) {
        console.error('Report error', err);
        showToast('Error generating report', 'error');
      } finally {
        setLoading(false);
      }
    },
    [selectedReport, form]
  );

  // Generate on initial selection
  useEffect(() => {
    if (selectedReport) {
      handleGenerateReport(selectedReport);
    }
  }, [selectedReport, handleGenerateReport]);

  const handleResetFilters = () => {
    setForm({
      reportBranch: '0',
      reportFromBranch: '2',
      prstatus: '-1',
      itemType: '0',
      sd_group: 0,
      dateByDelivery: true,
      from: '2026-01-01',
      to: '2026-12-31'
    });
    showToast('Filters reset to default', 'success');
  };

  // Zoom controls
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 10, 160));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 10, 60));

  // Print Report
  const handlePrintReport = () => {
    if (activeTab === 'document' && reportFrameRef.current) {
      reportFrameRef.current.contentWindow?.focus();
      reportFrameRef.current.contentWindow?.print();
    } else {
      window.print();
    }
  };

  // Export Report
  const handleDownloadExport = () => {
    if (!selectedReport) return;
    const url = `/api/getPrReportQtyRequestedByItem/${exportFormat}&${form.from}&${form.to}&${form.dateByDelivery}&${form.itemType}&${form.reportFromBranch}&${form.reportBranch}&${form.prstatus}&${form.sd_group}`;
    window.open(url, '_blank');
    setShowExportModal(false);
    showToast(`Downloading report as ${exportFormat.toUpperCase()}...`, 'success');
  };

  return (
    <div className="wspaceCont productrequests-reports-page bg-[#f3f5f8] min-h-screen text-slate-800">
      {/* Global Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-white font-medium text-sm animate-fade-in ${
            toast.type === 'success' ? 'bg-[#1ab394] border border-[#18a689]' : 'bg-rose-600 border border-rose-500'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="content p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header matching Omega */}
        <div className="header border-b border-slate-200 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title text-2xl font-bold text-slate-900 tracking-tight">Product Request Reports</h1>
              <ol className="breadcrumb flex items-center gap-2 text-xs text-slate-500 mt-1">
                <li>
                  <a href="/backoffice/operations" className="hover:text-emerald-700 transition">
                    Operations
                  </a>
                </li>
                <li>/</li>
                <li>
                  <a href="/backoffice/operations?section=manage_product_requests" className="hover:text-emerald-700 transition">
                    Product Request
                  </a>
                </li>
                <li>/</li>
                <li className="text-slate-700 font-semibold">Reports</li>
              </ol>
            </div>

            <button
              type="button"
              onClick={() => setHideReportsMenu(prev => !prev)}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm transition"
            >
              <Menu className="w-4 h-4 text-slate-600" />
              <span>{hideReportsMenu ? 'Show Reports Menu' : 'Hide Reports Menu'}</span>
            </button>
          </div>
        </div>

        {/* Main Grid: Sidebar + Reports Shell */}
        <div className="main-content">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Sidebar Reports Menu */}
            {!hideReportsMenu && (
              <div className="xl:col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Reports Menu</span>
                  </div>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800">
                    5 Available
                  </span>
                </div>

                <div className="reports-sidebar p-3 space-y-4 text-xs">
                  {reportCategories.map(cat => (
                    <div key={cat.REPORTID} className="sidebar-section space-y-1">
                      <div className="font-bold text-slate-700 uppercase tracking-wider px-2 py-1 text-[11px] bg-slate-50 rounded">
                        {cat.SCREEN_CATEGORYNAME || cat.CATEGORYNAME}
                      </div>
                      <div className="space-y-0.5 mt-1">
                        {(cat.childs?.[0]?.childs || []).map((row: ReportItem) => {
                          const isSel = selectedReport?.REPORTID === row.REPORTID;
                          return (
                            <button
                              key={row.REPORTID}
                              type="button"
                              onClick={() => setSelectedReport(row)}
                              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between font-medium transition ${
                                isSel
                                  ? 'bg-[#1ab394] text-white shadow-xs'
                                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                              }`}
                            >
                              <span className="truncate pr-2">{row.REPORTNAME}</span>
                              <ChevronRight className={`w-3.5 h-3.5 opacity-70 ${isSel ? 'text-white' : ''}`} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reports Workspace */}
            <div className={hideReportsMenu ? 'xl:col-span-12 space-y-6' : 'xl:col-span-9 space-y-6'}>
              {!selectedReport ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-400">
                  <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-slate-700">No Report Selected</h3>
                  <p className="text-sm mt-1 text-slate-500">Please select a report from the menu on the left to generate results.</p>
                </div>
              ) : (
                <>
                  {/* FILTERS CARD */}
                  <div className="report-card report-card-filters bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-emerald-600" />
                        <h2 className="font-bold text-slate-900 text-base">Report Filters</h2>
                        <span className="text-xs text-slate-500 font-normal">({selectedReport.REPORTNAME})</span>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Requested By Branch */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                            Requested By Branch
                          </label>
                          <select
                            value={form.reportBranch}
                            onChange={e => setForm(f => ({ ...f, reportBranch: e.target.value }))}
                            className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          >
                            <option value="0">All Branches</option>
                            {branches.map(b => (
                              <option key={b.BRANCHID} value={b.BRANCHID}>
                                {b.BARANCHNAME}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Requested From Branch */}
                        {selectedReport.REPORTID !== 406 && selectedReport.REPORTID !== 408 && (
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                              Requested From Branch
                            </label>
                            <select
                              value={form.reportFromBranch}
                              onChange={e => setForm(f => ({ ...f, reportFromBranch: e.target.value }))}
                              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            >
                              <option value="0">All Branches</option>
                              {branches.map(b => (
                                <option key={b.BRANCHID} value={b.BRANCHID}>
                                  {b.BARANCHNAME}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* PR Status */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                            Status
                          </label>
                          <select
                            value={form.prstatus}
                            onChange={e => setForm(f => ({ ...f, prstatus: e.target.value }))}
                            className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          >
                            <option value="All">All Statuses</option>
                            <option value="-1">Approved / Confirmed</option>
                            <option value="0">Pending</option>
                            <option value="-3">Confirmed Only</option>
                            <option value="2">Rejected Only</option>
                          </select>
                        </div>

                        {/* Item Type */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                            Item Type
                          </label>
                          <select
                            value={form.itemType}
                            onChange={e => setForm(f => ({ ...f, itemType: e.target.value }))}
                            className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          >
                            <option value="0">All Item Types</option>
                            {itemTypes.map(it => (
                              <option key={it.id} value={it.id}>
                                {it.description}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Group Selection (For Report 405) */}
                        {selectedReport.REPORTID === 405 && (
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                              Item Group
                            </label>
                            <select
                              value={form.sd_group}
                              onChange={e => setForm(f => ({ ...f, sd_group: Number(e.target.value) }))}
                              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            >
                              {groups.map(g => (
                                <option key={g.ID} value={g.ID}>
                                  {g.GROUPNAME}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Date From */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                            From Date
                          </label>
                          <input
                            type="date"
                            value={form.from}
                            onChange={e => setForm(f => ({ ...f, from: e.target.value }))}
                            className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>

                        {/* Date To */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                            To Date
                          </label>
                          <input
                            type="date"
                            value={form.to}
                            onChange={e => setForm(f => ({ ...f, to: e.target.value }))}
                            className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>

                        {/* Date Type Radios */}
                        <div className="md:col-span-2 lg:col-span-3 flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-6">
                            <span className="text-xs font-semibold text-slate-600">Date Type:</span>
                            <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                              <input
                                type="radio"
                                name="dateByDelivery"
                                checked={form.dateByDelivery === true}
                                onChange={() => setForm(f => ({ ...f, dateByDelivery: true }))}
                                className="text-emerald-600 focus:ring-emerald-500"
                              />
                              <span>By Delivery Date</span>
                            </label>
                            <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                              <input
                                type="radio"
                                name="dateByDelivery"
                                checked={form.dateByDelivery === false}
                                onChange={() => setForm(f => ({ ...f, dateByDelivery: false }))}
                                className="text-emerald-600 focus:ring-emerald-500"
                              />
                              <span>By Creation Date</span>
                            </label>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleResetFilters}
                              className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                            >
                              Reset Filters
                            </button>
                            <button
                              type="button"
                              onClick={() => handleGenerateReport()}
                              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#1ab394] hover:bg-[#18a689] rounded-lg shadow-sm transition"
                            >
                              Filter Report
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* REPORT VIEWER CARD */}
                  <div
                    id="productRequestsReportFrameSection"
                    className="report-card report-frame-card bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
                  >
                    {/* Header + Action Bar */}
                    <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
                      <div>
                        <h2 className="font-bold text-slate-900 text-lg">{selectedReport.REPORTNAME}</h2>
                        <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
                          <span>
                            Range: {form.from} to {form.to}
                          </span>
                          <span>&bull;</span>
                          <span>{form.dateByDelivery ? 'Delivery Date' : 'Creation Date'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Tab Switcher: Grid vs Document */}
                        <div className="bg-slate-200 p-0.5 rounded-lg flex items-center text-xs font-semibold mr-2">
                          <button
                            type="button"
                            onClick={() => setActiveTab('grid')}
                            className={`px-3 py-1.5 rounded-md transition ${
                              activeTab === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Interactive Grid
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveTab('document')}
                            className={`px-3 py-1.5 rounded-md transition ${
                              activeTab === 'document' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Document Preview
                          </button>
                        </div>

                        {/* Zoom buttons */}
                        <button
                          type="button"
                          onClick={handleZoomIn}
                          className="p-2 text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition"
                          title="Zoom In"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleZoomOut}
                          className="p-2 text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition"
                          title="Zoom Out"
                        >
                          <ZoomOut className="w-3.5 h-3.5" />
                        </button>

                        {/* Print */}
                        <button
                          type="button"
                          onClick={handlePrintReport}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg shadow-sm transition"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print</span>
                        </button>

                        {/* Export */}
                        <button
                          type="button"
                          onClick={() => setShowExportModal(true)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#1ab394] hover:bg-[#18a689] rounded-lg shadow-sm transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Export</span>
                        </button>
                      </div>
                    </div>

                    {/* Report Content Body */}
                    <div className="p-5">
                      {loading ? (
                        <div className="py-20 text-center text-slate-500">
                          <RotateCcw className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-2" />
                          <p className="font-semibold text-sm">Generating Report Data...</p>
                          <p className="text-xs text-slate-400 mt-0.5">Please wait while Vanguard compiles transactions.</p>
                        </div>
                      ) : !reportData ? (
                        <div className="py-16 text-center text-slate-400">
                          <p>Click &quot;Filter Report&quot; to generate output.</p>
                        </div>
                      ) : activeTab === 'document' ? (
                        /* Authentic Jasper HTML Document Preview */
                        <div
                          className="bg-slate-200 p-4 sm:p-6 rounded-lg overflow-auto max-h-[700px] flex justify-center"
                          style={{ zoom: `${zoomLevel}%` }}
                        >
                          <iframe
                            ref={reportFrameRef}
                            srcDoc={reportHtml}
                            title="Jasper Report Document"
                            className="w-[960px] min-h-[750px] bg-white rounded shadow-lg border-0"
                          />
                        </div>
                      ) : (
                        /* Rich Interactive Grid */
                        <div className="space-y-6" style={{ zoom: `${zoomLevel}%` }}>
                          {/* Corporate Topper */}
                          <div className="text-center pt-2">
                            <h2 className="font-bold text-blue-700 text-[15px] tracking-wide uppercase font-sans">
                              Zeit w zaytoun ljanoub
                            </h2>
                            <div className="text-[11px] font-semibold text-slate-600 tracking-normal mt-0.5 font-sans">
                              Southern Olive Oil Products S.A.R.L
                            </div>
                            <div className="text-center font-bold text-slate-900 text-[13.5px] mt-2 mb-1 font-sans">
                              {selectedReport?.REPORTNAME || 'Product Request Report'}
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-800 font-mono mt-2 mb-1">
                              <span>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                              <span className="font-bold">Period: {form.from} to {form.to}</span>
                              <span>Page 1 of 1</span>
                            </div>
                            <div className="border-b-2 border-slate-900 mb-2"></div>
                            <div className="flex items-center justify-between text-[10.5px] font-semibold text-slate-700 mb-3 font-sans">
                              <span>Branch: Zeit w zaytoun ljanoub - Central Plant</span>
                              <span className="font-mono text-slate-500">System Source: Vanguard ERP Live Ledger</span>
                            </div>
                          </div>

                          {/* KPI Summary Strip */}
                          {reportData.summary && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                              {reportData.summary.totalItemsCount !== undefined && (
                                <div>
                                  <span className="block text-[11px] font-bold text-slate-500 uppercase">Items Total</span>
                                  <span className="text-lg font-bold text-slate-800">
                                    {reportData.summary.totalItemsCount}
                                  </span>
                                </div>
                              )}
                              {reportData.summary.totalQtyReq !== undefined && (
                                <div>
                                  <span className="block text-[11px] font-bold text-slate-500 uppercase">Requested Qty</span>
                                  <span className="text-lg font-bold text-slate-800">
                                    {reportData.summary.totalQtyReq}
                                  </span>
                                </div>
                              )}
                              {reportData.summary.totalQtyApp !== undefined && (
                                <div>
                                  <span className="block text-[11px] font-bold text-slate-500 uppercase">Approved Qty</span>
                                  <span className="text-lg font-bold text-[#1ab394]">
                                    {reportData.summary.totalQtyApp}
                                  </span>
                                </div>
                              )}
                              {reportData.summary.totalAmount !== undefined && (
                                <div>
                                  <span className="block text-[11px] font-bold text-slate-500 uppercase">Total Value</span>
                                  <span className="text-lg font-bold text-[#1c84c6]">
                                    ${reportData.summary.totalAmount.toFixed(2)}
                                  </span>
                                </div>
                              )}
                              {reportData.summary.totalCategories !== undefined && (
                                <div>
                                  <span className="block text-[11px] font-bold text-slate-500 uppercase">Categories</span>
                                  <span className="text-lg font-bold text-slate-800">
                                    {reportData.summary.totalCategories}
                                  </span>
                                </div>
                              )}
                              {reportData.summary.totalUnitsNeeded !== undefined && (
                                <div>
                                  <span className="block text-[11px] font-bold text-slate-500 uppercase">Units Needed</span>
                                  <span className="text-lg font-bold text-[#1ab394]">
                                    {reportData.summary.totalUnitsNeeded}
                                  </span>
                                </div>
                              )}
                              {reportData.summary.totalFlaggedItems !== undefined && (
                                <div>
                                  <span className="block text-[11px] font-bold text-slate-500 uppercase">Flagged Items</span>
                                  <span className="text-lg font-bold text-amber-600">
                                    {reportData.summary.totalFlaggedItems}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Data Table by Report Type */}
                          {selectedReport.REPORTID === 405 && reportData.rows && (
                            <div className="overflow-x-auto border border-slate-200 rounded-lg">
                              <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                                  <tr>
                                    <th className="py-3 px-3">#</th>
                                    <th className="py-3 px-3">Item Code</th>
                                    <th className="py-3 px-3">Description</th>
                                    <th className="py-3 px-3 text-center">Unit</th>
                                    <th className="py-3 px-3 text-right">Req Qty</th>
                                    <th className="py-3 px-3 text-right">App Qty</th>
                                    <th className="py-3 px-3 text-right">Rec Qty</th>
                                    <th className="py-3 px-3 text-right">Cost</th>
                                    <th className="py-3 px-3 text-right">Total ($)</th>
                                    <th className="py-3 px-3">Branches</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {reportData.rows.map((row: any, idx: number) => (
                                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                      <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>
                                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{row.ITEMCODE}</td>
                                      <td className="py-2.5 px-3 font-medium text-slate-800">{row.ITEMDESCRIPTION}</td>
                                      <td className="py-2.5 px-3 text-center text-slate-600">{row.UNIT}</td>
                                      <td className="py-2.5 px-3 text-right font-bold text-slate-800">{row.QTYREQ}</td>
                                      <td className="py-2.5 px-3 text-right font-bold text-[#1ab394]">{row.QTYAPP}</td>
                                      <td className="py-2.5 px-3 text-right text-slate-600">{row.QTYREC}</td>
                                      <td className="py-2.5 px-3 text-right text-slate-600">${row.COST.toFixed(2)}</td>
                                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                                        ${row.TOTAL_COST.toFixed(2)}
                                      </td>
                                      <td className="py-2.5 px-3 text-slate-500 text-[11px]">{row.BRANCHES}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {selectedReport.REPORTID === 406 && reportData.groups && (
                            <div className="space-y-4">
                              {reportData.groups.map((grp: any, gIdx: number) => (
                                <div key={gIdx} className="border border-slate-200 rounded-lg overflow-hidden">
                                  <div className="bg-slate-100 px-4 py-2.5 font-bold text-slate-800 text-xs border-b border-slate-200 flex items-center justify-between">
                                    <span>{grp.category}</span>
                                    <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                                      {grp.items.length} Production Line Items
                                    </span>
                                  </div>
                                  <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                                      <tr>
                                        <th className="py-2.5 px-3">Item Code</th>
                                        <th className="py-2.5 px-3">Description</th>
                                        <th className="py-2.5 px-3 text-center">Unit</th>
                                        <th className="py-2.5 px-3 text-right">Total Needed</th>
                                        <th className="py-2.5 px-3">Branch Distribution</th>
                                        <th className="py-2.5 px-3 text-center">Target Date</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {grp.items.map((it: any, iIdx: number) => (
                                        <tr key={iIdx} className="hover:bg-slate-50">
                                          <td className="py-2 px-3 font-mono font-bold text-slate-900">{it.ITEMCODE}</td>
                                          <td className="py-2 px-3 text-slate-800 font-medium">{it.ITEMDESCRIPTION}</td>
                                          <td className="py-2 px-3 text-center text-slate-600">{it.UNIT}</td>
                                          <td className="py-2 px-3 text-right font-bold text-[#1ab394]">{it.TOTAL_REQUIRED}</td>
                                          <td className="py-2 px-3 text-slate-600 text-[11px]">{it.branchSummary}</td>
                                          <td className="py-2 px-3 text-center text-slate-500 font-mono text-[11px]">
                                            {it.TARGET_DATE}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ))}
                            </div>
                          )}

                          {selectedReport.REPORTID === 407 && reportData.rows && (
                            <div className="overflow-x-auto border border-slate-200 rounded-lg">
                              <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                                  <tr>
                                    <th className="py-3 px-3">PR #</th>
                                    <th className="py-3 px-3">Date</th>
                                    <th className="py-3 px-3">Branch</th>
                                    <th className="py-3 px-3">From</th>
                                    <th className="py-3 px-3">Item Code</th>
                                    <th className="py-3 px-3">Description</th>
                                    <th className="py-3 px-3 text-center">Unit</th>
                                    <th className="py-3 px-3 text-right">Req</th>
                                    <th className="py-3 px-3 text-right">App</th>
                                    <th className="py-3 px-3 text-right">Cost</th>
                                    <th className="py-3 px-3 text-right">Total ($)</th>
                                    <th className="py-3 px-3 text-center">Status</th>
                                    <th className="py-3 px-3">Remark</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {reportData.rows.map((row: any, idx: number) => (
                                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{row.REQUESTNB}</td>
                                      <td className="py-2.5 px-3 text-slate-600">{row.DATE}</td>
                                      <td className="py-2.5 px-3 text-slate-800">{row.BRANCH}</td>
                                      <td className="py-2.5 px-3 text-slate-500 text-[11px]">{row.FROMBRANCH}</td>
                                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{row.ITEMCODE}</td>
                                      <td className="py-2.5 px-3 font-medium text-slate-800">{row.ITEMDESCRIPTION}</td>
                                      <td className="py-2.5 px-3 text-center text-slate-600">{row.UNIT}</td>
                                      <td className="py-2.5 px-3 text-right font-bold text-slate-800">{row.QTYREQ}</td>
                                      <td className="py-2.5 px-3 text-right font-bold text-[#1ab394]">{row.QTYAPP}</td>
                                      <td className="py-2.5 px-3 text-right text-slate-600">${row.COST.toFixed(2)}</td>
                                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                                        ${row.TOTAL_COST.toFixed(2)}
                                      </td>
                                      <td className="py-2.5 px-3 text-center">
                                        <span
                                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                            row.STATUS === 'Approved'
                                              ? 'bg-emerald-100 text-emerald-800'
                                              : row.STATUS === 'Confirmed'
                                              ? 'bg-blue-100 text-blue-800'
                                              : row.STATUS === 'Rejected'
                                              ? 'bg-rose-100 text-rose-800'
                                              : 'bg-amber-100 text-amber-800'
                                          }`}
                                        >
                                          {row.STATUS}
                                        </span>
                                      </td>
                                      <td className="py-2.5 px-3 text-slate-500 text-[11px]">{row.REMARK}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {selectedReport.REPORTID === 408 && reportData.divisions && (
                            <div className="space-y-4">
                              {reportData.divisions.map((div: any, dIdx: number) => (
                                <div key={dIdx} className="border border-slate-200 rounded-lg overflow-hidden">
                                  <div className="bg-slate-900 text-white px-4 py-3 font-bold text-sm">
                                    {div.divisionName}
                                  </div>
                                  <div className="p-4 space-y-4">
                                    {div.groups.map((grp: any, gIdx: number) => (
                                      <div key={gIdx} className="border border-slate-200 rounded-lg overflow-hidden">
                                        <div className="bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 flex justify-between">
                                          <span>Group: {grp.groupName}</span>
                                          <span>Total Value: ${grp.groupTotalValue.toFixed(2)}</span>
                                        </div>
                                        <table className="w-full text-left text-xs">
                                          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                                            <tr>
                                              <th className="py-2 px-3">Item Code</th>
                                              <th className="py-2 px-3">Description</th>
                                              <th className="py-2 px-3 text-center">Unit</th>
                                              <th className="py-2 px-3 text-right">Req Qty</th>
                                              <th className="py-2 px-3 text-right">App Qty</th>
                                              <th className="py-2 px-3 text-right">Unit Cost</th>
                                              <th className="py-2 px-3 text-right">Total ($)</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-100">
                                            {grp.items.map((it: any, iIdx: number) => (
                                              <tr key={iIdx} className="hover:bg-slate-50">
                                                <td className="py-2 px-3 font-mono font-bold text-slate-900">{it.ITEMCODE}</td>
                                                <td className="py-2 px-3 font-medium text-slate-800">{it.ITEMDESCRIPTION}</td>
                                                <td className="py-2 px-3 text-center text-slate-600">{it.UNIT}</td>
                                                <td className="py-2 px-3 text-right text-slate-700">{it.QTYREQ}</td>
                                                <td className="py-2 px-3 text-right font-bold text-[#1ab394]">{it.QTYAPP}</td>
                                                <td className="py-2 px-3 text-right text-slate-600">${it.COST.toFixed(2)}</td>
                                                <td className="py-2 px-3 text-right font-bold text-slate-900">
                                                  ${it.TOTAL_COST.toFixed(2)}
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {selectedReport.REPORTID === 409 && reportData.rows && (
                            <div className="overflow-x-auto border border-slate-200 rounded-lg">
                              <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                                  <tr>
                                    <th className="py-3 px-3">PR #</th>
                                    <th className="py-3 px-3">Branch</th>
                                    <th className="py-3 px-3">Item Code</th>
                                    <th className="py-3 px-3">Description</th>
                                    <th className="py-3 px-3 text-center">Unit</th>
                                    <th className="py-3 px-3 text-right">Req</th>
                                    <th className="py-3 px-3 text-right">App</th>
                                    <th className="py-3 px-3 text-right">Discrepancy</th>
                                    <th className="py-3 px-3 text-center">Status</th>
                                    <th className="py-3 px-3">Item Remark</th>
                                    <th className="py-3 px-3">PR Remark</th>
                                    <th className="py-3 px-3">Reject Reason</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {reportData.rows.map((row: any, idx: number) => (
                                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{row.REQUESTNB}</td>
                                      <td className="py-2.5 px-3 text-slate-800">{row.BRANCH}</td>
                                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{row.ITEMCODE}</td>
                                      <td className="py-2.5 px-3 font-medium text-slate-800">{row.ITEMDESCRIPTION}</td>
                                      <td className="py-2.5 px-3 text-center text-slate-600">{row.UNIT}</td>
                                      <td className="py-2.5 px-3 text-right text-slate-700">{row.QTYREQ}</td>
                                      <td className="py-2.5 px-3 text-right font-bold text-[#1ab394]">{row.QTYAPP}</td>
                                      <td className="py-2.5 px-3 text-right font-bold text-rose-600">
                                        {row.DIFF > 0 ? `-${row.DIFF}` : '0'}
                                      </td>
                                      <td className="py-2.5 px-3 text-center">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                                          {row.STATUS}
                                        </span>
                                      </td>
                                      <td className="py-2.5 px-3 text-slate-700 font-medium">{row.ITEM_REMARK}</td>
                                      <td className="py-2.5 px-3 text-slate-500 text-[11px]">{row.PR_REMARK}</td>
                                      <td className="py-2.5 px-3 text-rose-700 font-medium text-[11px]">
                                        {row.REJECT_REASON}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {/* Corporate Standard Footer */}
                          <div className="border-t-2 border-slate-900 pt-2.5 mt-6 flex items-center justify-between text-[10px] text-slate-600 font-sans select-none">
                            <div className="font-mono font-bold text-slate-800 tracking-wider">
                              REP_OP_003
                            </div>
                            <div className="font-medium text-slate-500">
                              Copyright © 2026 Vanguard ERP. All Rights Reserved.
                            </div>
                            <div>
                              <a
                                href="https://www.vanguarderp.com"
                                target="_blank"
                                rel="noreferrer"
                                className="font-mono text-blue-700 hover:underline"
                              >
                                &quot;www.vanguarderp.com&quot;
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          EXPORT MODAL (matching Omega bootbox export)
          ========================================================================= */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-scale-in">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Export Report to</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Select Target Format
                </label>
                <select
                  value={exportFormat}
                  onChange={e => setExportFormat(e.target.value)}
                  className="w-full text-sm p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                >
                  <option value="csv">CSV (Comma-Separated Values)</option>
                  <option value="xlsx">Excel (.xlsx)</option>
                  <option value="pdf">PDF (Printable Document)</option>
                  <option value="docx">Word (.docx)</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                Exports live dataset for <strong>{selectedReport?.REPORTNAME}</strong> matching selected branch and date filters.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-3.5 bg-slate-50 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDownloadExport}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#1ab394] hover:bg-[#18a689] rounded-lg shadow-sm transition"
              >
                Download File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
