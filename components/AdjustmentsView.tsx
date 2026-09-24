'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import {
  Search,
  Plus,
  Printer,
  FileText,
  RotateCcw,
  Check,
  Trash2,
  X,
  Upload,
  Download,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Eye,
  Sliders,
  PlayCircle,
  HelpCircle,
  Calculator,
  RefreshCw,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  AdjustmentHeaderRecord,
  AdjustmentItemRecord,
  BranchRecord,
  LocationRecord,
  OMEGA_BRANCHES,
  OMEGA_LOCATIONS,
  OMEGA_CATEGORIES,
  OMEGA_DIVISIONS,
  OMEGA_GROUPS,
  SEED_ADJUSTMENT_ITEMS,
  INITIAL_SAVED_ADJUSTMENTS
} from '@/lib/adjustmentsData';
import { getDefaultInitialDateRange } from '@/lib/dateRangeEngine';

export default function AdjustmentsView() {
  const { t, dir } = useLanguage();
  // --------------------------------------------------------------------------
  // STATE MANAGEMENT
  // --------------------------------------------------------------------------
  const [branches, setBranches] = useState<BranchRecord[]>(OMEGA_BRANCHES);
  const [selectedBranchId, setSelectedBranchId] = useState<number>(1); // 1 = Zeit w zaytoun ljanoub
  const [locations, setLocations] = useState<LocationRecord[]>(OMEGA_LOCATIONS.filter(l => l.BRANCHID === 1));
  const [selectedLocationId, setSelectedLocationId] = useState<number>(1); // 1 = Main Store

  // Header parameters
  const [adjustmentDate, setAdjustmentDate] = useState<string>('2026-09-11');
  const [isEditingDate, setIsEditingDate] = useState<boolean>(false);
  const [includeFilter, setIncludeFilter] = useState<number>(0); // 0 = All, 1 = Daily adjustment, 2 = Weekly adjustment
  const [sortBy, setSortBy] = useState<string>('PRODUCTCODE');
  const [sortType, setSortType] = useState<string>('asc');
  const [searchBy, setSearchBy] = useState<number>(0); // 0 = Select, 1 = Category, 2 = Division, 3 = Group
  const [comboValue, setComboValue] = useState<number>(0);
  const [showNegQtyOnly, setShowNegQtyOnly] = useState<boolean>(false);
  const [hide0Qty, setHide0Qty] = useState<boolean>(false);

  // Active adjustment record & details
  const [adjustmentId, setAdjustmentId] = useState<number | null>(null);
  const [isPosted, setIsPosted] = useState<boolean>(false);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [createdBy, setCreatedBy] = useState<{ firstname: string; lastname: string }>({
    firstname: 'Mohammed',
    lastname: 'Jichi'
  });
  const [voucherId, setVoucherId] = useState<string | null>(null);

  // Table items & search
  const [items, setItems] = useState<AdjustmentItemRecord[]>([]);
  const [tableSearchText, setTableSearchText] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // View switch: Editor (report = 0) vs Report (report = 1)
  const [reportView, setReportView] = useState<boolean>(false);
  const [reportExportType, setReportExportType] = useState<string>('html');

  // Modals state
  const [recallModalOpen, setRecallModalOpen] = useState<boolean>(false);
  const [importModalOpen, setImportModalOpen] = useState<boolean>(false);
  const [addLocationModalOpen, setAddLocationModalOpen] = useState<boolean>(false);
  const [addItemsModalOpen, setAddItemsModalOpen] = useState<boolean>(false);
  const [tutorialModalOpen, setTutorialModalOpen] = useState<boolean>(false);
  const [confirmZeroModalOpen, setConfirmZeroModalOpen] = useState<boolean>(false);
  const [newLocationName, setNewLocationName] = useState<string>('');

  // Recall adjustments filters & list
  const [savedList, setSavedList] = useState<AdjustmentHeaderRecord[]>(INITIAL_SAVED_ADJUSTMENTS);
  const [recallSearch, setRecallSearch] = useState<string>('');
  const [recallBranchId, setRecallBranchId] = useState<number>(1);
  const [recallStatus, setRecallStatus] = useState<number>(3); // 1 = posted, 2 = unposted, 3 = all
  const initialRecallRange = getDefaultInitialDateRange('This Month');
  const [recallFromDate, setRecallFromDate] = useState<string>(initialRecallRange.fromDate);
  const [recallToDate, setRecallToDate] = useState<string>(initialRecallRange.toDate);
  const [recallAllDates, setRecallAllDates] = useState<boolean>(true);

  // CSV Import
  const [csvContent, setCsvContent] = useState<string>('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Toast helper
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --------------------------------------------------------------------------
  // INITIAL DATA LOADING & LOCATION SELECTION
  // --------------------------------------------------------------------------
  useEffect(() => {
    loadBranchLocations(selectedBranchId);
  }, [selectedBranchId]);

  useEffect(() => {
    if (!isPreviewMode) {
      loadLocationItems(selectedBranchId, selectedLocationId);
    }
  }, [selectedBranchId, selectedLocationId]);

  const loadBranchLocations = (bId: number) => {
    const bLocs = OMEGA_LOCATIONS.filter(l => l.BRANCHID === bId);
    setLocations(bLocs);
    if (bLocs.length > 0 && !bLocs.some(l => l.LOCATIONID === selectedLocationId)) {
      setSelectedLocationId(bLocs[0].LOCATIONID);
    }
  };

  const loadLocationItems = (bId: number, locId: number) => {
    setIsLoading(true);
    setTimeout(() => {
      const seeded = SEED_ADJUSTMENT_ITEMS.map(item => {
        let qoh = item.QTYOH;
        if (locId === 2) qoh = Math.round(qoh * 0.4);
        if (locId === 3) qoh = Math.round(qoh * 0.2);
        return {
          ...item,
          QTYOH: qoh,
          NEWQTY: qoh,
          VARIANCE: 0,
          REMARK: ''
        };
      });
      setItems(seeded);
      setIsLoading(false);
    }, 150);
  };

  // --------------------------------------------------------------------------
  // TABLE FILTERING & COMPUTATION
  // --------------------------------------------------------------------------
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Include filter (0 = All, 1 = Daily adjustment, 2 = Weekly adjustment)
    if (includeFilter === 1) {
      result = result.filter(i => i.INCLDAILYADJ === -1);
    } else if (includeFilter === 2) {
      result = result.filter(i => i.INCLWEEKLADJ === -1);
    }

    // Search input in Details toolbar
    if (tableSearchText.trim()) {
      const q = tableSearchText.toLowerCase().trim();
      result = result.filter(
        i =>
          i.PRODUCTCODE.toLowerCase().includes(q) ||
          i.PRODUCTDESCRIPTION.toLowerCase().includes(q) ||
          (i.BARCODE && i.BARCODE.toLowerCase().includes(q))
      );
    }

    // Secondary searchBy dropdown
    if (searchBy > 0 && comboValue > 0) {
      if (searchBy === 1) result = result.filter(i => i.CATEGORYID === comboValue);
      if (searchBy === 2) result = result.filter(i => i.DIVISIONID === comboValue);
      if (searchBy === 3) result = result.filter(i => i.GROUPID === comboValue);
    }

    // Checkbox: Show neg. Qty only
    if (showNegQtyOnly) {
      result = result.filter(i => i.QTYOH < 0 || i.NEWQTY < 0);
    }

    // Checkbox: Hide items with 0 Qty
    if (hide0Qty) {
      result = result.filter(i => i.QTYOH !== 0 || i.NEWQTY !== 0);
    }

    // Sorting
    result.sort((a, b) => {
      const field = (sortBy === 'PRODUCTDESCRIPTION' || sortBy === 'description') ? 'PRODUCTDESCRIPTION' : 'PRODUCTCODE';
      const valA = a[field] ?? '';
      const valB = b[field] ?? '';

      if (sortType === 'desc') {
        return valA < valB ? 1 : valA > valB ? -1 : 0;
      }
      return valA > valB ? 1 : valA < valB ? -1 : 0;
    });

    return result;
  }, [items, includeFilter, tableSearchText, searchBy, comboValue, showNegQtyOnly, hide0Qty, sortBy, sortType]);

  // Paginated items
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;

  // Summary totals
  const totals = useMemo(() => {
    const totalQOH = filteredItems.reduce((acc, i) => acc + (Number(i.QTYOH) || 0), 0);
    const totalNewQty = filteredItems.reduce((acc, i) => acc + (Number(i.NEWQTY) || 0), 0);
    const totalVariance = filteredItems.reduce((acc, i) => acc + (Number(i.VARIANCE) || 0), 0);
    const totalVarianceCost = filteredItems.reduce((acc, i) => acc + (Number(i.VARIANCE) || 0) * (Number(i.AVERAGECOST) || 0), 0);
    return {
      totalItems: filteredItems.length,
      totalQOH,
      totalNewQty,
      totalVariance,
      totalVarianceCost
    };
  }, [filteredItems]);

  // --------------------------------------------------------------------------
  // USER ACTIONS & HANDLERS
  // --------------------------------------------------------------------------
  const handleNewQtyChange = (productId: number, valStr: string) => {
    const num = valStr === '' ? 0 : parseFloat(valStr) || 0;
    setItems(prev =>
      prev.map(i => {
        if (i.PRODUCTID === productId) {
          const variance = num - i.QTYOH;
          return {
            ...i,
            NEWQTY: num,
            VARIANCE: variance
          };
        }
        return i;
      })
    );
  };

  const handleRemarkChange = (productId: number, remark: string) => {
    setItems(prev =>
      prev.map(i => (i.PRODUCTID === productId ? { ...i, REMARK: remark } : i))
    );
  };

  const handleRemoveRow = (productId: number) => {
    setItems(prev => prev.filter(i => i.PRODUCTID !== productId));
    showToast('Item removed from adjustment table.', 'info');
  };

  const handleNewAdjustmentClick = () => {
    setAdjustmentId(null);
    setIsPosted(false);
    setIsPreviewMode(false);
    setVoucherId(null);
    setCreatedBy({ firstname: 'Mohammed', lastname: 'Jichi' });
    setTableSearchText('');
    loadLocationItems(selectedBranchId, selectedLocationId);
    showToast('Started fresh adjustment workspace.', 'info');
  };

  // Actions dropdown: Set All Qty to 0
  const handleSetAllQtyZero = () => {
    setConfirmZeroModalOpen(false);
    setItems(prev =>
      prev.map(i => ({
        ...i,
        NEWQTY: 0,
        VARIANCE: 0 - i.QTYOH
      }))
    );
    showToast('All item quantities set to 0.', 'success');
  };

  // Actions dropdown: Set All negative QTY to Zero
  const handleSetAllNegativeQtyZero = () => {
    setItems(prev =>
      prev.map(i => {
        if (i.QTYOH < 0) {
          return {
            ...i,
            NEWQTY: 0,
            VARIANCE: 0 - i.QTYOH
          };
        }
        return i;
      })
    );
    showToast('All negative quantities set to 0.', 'success');
  };

  // Save as Draft
  const handleSaveAdjustment = () => {
    const newId = adjustmentId || Math.floor(Math.random() * 900) + 50;
    const branchName = branches.find(b => b.BRANCHID === selectedBranchId)?.BARANCHNAME || 'Zeit w zaytoun ljanoub';
    const locName = locations.find(l => l.LOCATIONID === selectedLocationId)?.LOCATIONDESCRIPTION || 'Main Store';

    const savedRecord: AdjustmentHeaderRecord = {
      ADJUSTID: newId,
      ID: 2000 + newId,
      ADATE: adjustmentDate,
      BRANCHID: selectedBranchId,
      BARANCHNAME: branchName,
      LOCID: selectedLocationId,
      LOCATIONDESCRIPTION: locName,
      POSTED: 0,
      STATUS: 'False',
      VOUCHER_ID: null,
      firstname: createdBy.firstname,
      lastname: createdBy.lastname,
      has_acctransfer: false,
      items: [...items]
    };

    setSavedList(prev => [savedRecord, ...prev.filter(a => a.ADJUSTID !== newId)]);
    setAdjustmentId(newId);
    setIsPreviewMode(true);
    setIsPosted(false);
    showToast(`Adjustment #${newId} saved as draft successfully!`, 'success');
  };

  // Save & Post immediately
  const handleSaveAndPostAdjustment = () => {
    const newId = adjustmentId || Math.floor(Math.random() * 900) + 50;
    const branchName = branches.find(b => b.BRANCHID === selectedBranchId)?.BARANCHNAME || 'Zeit w zaytoun ljanoub';
    const locName = locations.find(l => l.LOCATIONID === selectedLocationId)?.LOCATIONDESCRIPTION || 'Main Store';
    const vId = `JV-2026-${String(newId).padStart(3, '0')}`;

    const postedRecord: AdjustmentHeaderRecord = {
      ADJUSTID: newId,
      ID: 2000 + newId,
      ADATE: adjustmentDate,
      BRANCHID: selectedBranchId,
      BARANCHNAME: branchName,
      LOCID: selectedLocationId,
      LOCATIONDESCRIPTION: locName,
      POSTED: -1,
      STATUS: 'True',
      VOUCHER_ID: vId,
      firstname: createdBy.firstname,
      lastname: createdBy.lastname,
      has_acctransfer: true,
      items: [...items]
    };

    setSavedList(prev => [postedRecord, ...prev.filter(a => a.ADJUSTID !== newId)]);
    setAdjustmentId(newId);
    setIsPreviewMode(true);
    setIsPosted(true);
    setVoucherId(vId);
    showToast(`Adjustment #${newId} saved & posted to ledger (Voucher: ${vId})!`, 'success');
  };

  // Delete current unposted adjustment
  const handleDeleteCurrentAdjustment = () => {
    if (!adjustmentId) return;
    setSavedList(prev => prev.filter(a => a.ADJUSTID !== adjustmentId));
    handleNewAdjustmentClick();
    showToast(`Adjustment #${adjustmentId} deleted successfully.`, 'info');
  };

  // Transfer To Accounting
  const handleTransferToAccounting = () => {
    if (!adjustmentId) return;
    const accVoucher = `JV-ACC-${String(adjustmentId).padStart(4, '0')}`;
    setVoucherId(accVoucher);
    setSavedList(prev =>
      prev.map(a =>
        a.ADJUSTID === adjustmentId
          ? { ...a, VOUCHER_ID: accVoucher, has_acctransfer: false }
          : a
      )
    );
    showToast(`Transferred to accounting journal with voucher ${accVoucher}!`, 'success');
  };

  // Recall Modal: Load record
  const handleLoadRecallAdjustment = (rec: AdjustmentHeaderRecord) => {
    setSelectedBranchId(rec.BRANCHID);
    loadBranchLocations(rec.BRANCHID);
    setSelectedLocationId(rec.LOCID);
    setAdjustmentDate(rec.ADATE.split(' ')[0]);
    setAdjustmentId(rec.ADJUSTID);
    setIsPosted(rec.POSTED === -1);
    setIsPreviewMode(true);
    setVoucherId(rec.VOUCHER_ID || null);
    setCreatedBy({ firstname: rec.firstname, lastname: rec.lastname });
    setItems([...rec.items]);
    setRecallModalOpen(false);
    showToast(`Loaded Adjustment #${rec.ADJUSTID} (${rec.POSTED === -1 ? 'Posted' : 'Unposted Draft'})`, 'info');
  };

  // Recall Modal: Delete row
  const handleDeleteRecallRow = (adjustId: number) => {
    setSavedList(prev => prev.filter(a => a.ADJUSTID !== adjustId));
    if (adjustmentId === adjustId) {
      handleNewAdjustmentClick();
    }
    showToast(`Deleted Adjustment #${adjustId}`, 'info');
  };

  // Recall Modal: Delete all unposted
  const handleDeleteAllUnposted = () => {
    setSavedList(prev => prev.filter(a => a.POSTED === -1));
    showToast('Deleted all unposted adjustments.', 'info');
  };

  // Add Location Modal
  const handleAddLocationSubmit = () => {
    if (!newLocationName.trim()) return;
    const newId = Math.max(0, ...locations.map(l => l.LOCATIONID)) + 1;
    const newLoc: LocationRecord = {
      LOCATIONID: newId,
      BRANCHID: selectedBranchId,
      LOCATIONDESCRIPTION: newLocationName.trim()
    };
    setLocations(prev => [...prev, newLoc]);
    setSelectedLocationId(newId);
    setNewLocationName('');
    setAddLocationModalOpen(false);
    showToast(`Added location "${newLoc.LOCATIONDESCRIPTION}"!`, 'success');
  };

  // CSV Import
  const handleCsvImportSubmit = () => {
    if (!csvContent.trim()) return;
    const lines = csvContent.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const itemMap = new Map(items.map(i => [i.PRODUCTCODE.toLowerCase(), i]));
    let count = 0;

    const updated = items.map(item => {
      for (let i = 0; i < lines.length; i++) {
        if (i === 0 && (lines[i].toLowerCase().includes('code') || lines[i].toLowerCase().includes('item'))) continue;
        const [code, qty, remark] = lines[i].split(',').map(s => s.trim());
        if (code && code.toLowerCase() === item.PRODUCTCODE.toLowerCase()) {
          count++;
          const newQ = parseFloat(qty) || 0;
          return {
            ...item,
            NEWQTY: newQ,
            VARIANCE: newQ - item.QTYOH,
            REMARK: remark || 'Imported via CSV'
          };
        }
      }
      return item;
    });

    setItems(updated);
    setImportModalOpen(false);
    setCsvContent('');
    showToast(`Imported count values for ${count} items!`, 'success');
  };

  // CSV Export
  const handleExportCsv = () => {
    const headers = ['Code', 'Description', 'Barcode', 'QOH', 'NewQty', 'Variance', 'Unit', 'UnitCost', 'Remark'];
    const rows = filteredItems.map(i => [
      `"${i.PRODUCTCODE}"`,
      `"${i.PRODUCTDESCRIPTION}"`,
      `"${i.BARCODE || ''}"`,
      i.QTYOH,
      i.NEWQTY,
      i.VARIANCE,
      `"${i.UNITNAME}"`,
      i.UNITCOST,
      `"${i.REMARK || ''}"`
    ]);
    const csvStr = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Adjustments_${adjustmentDate}_Loc${selectedLocationId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported adjustment items to CSV.', 'success');
  };

  // Sample CSV Template Download
  const handleDownloadTemplate = () => {
    const template = 'Code,NewQty,Remark\nART300G*12JAR509,25,Stock count batch A\nVOO17.5L16KGWS,15,Verified pallet\nCWV250ML*24B103,18,Regular check';
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Adjustment_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --------------------------------------------------------------------------
  // RENDER: REPORT SCREEN (report === true)
  // --------------------------------------------------------------------------
  if (reportView) {
    const branchName = branches.find(b => b.BRANCHID === selectedBranchId)?.BARANCHNAME || 'Zeit w zaytoun ljanoub';
    const locName = locations.find(l => l.LOCATIONID === selectedLocationId)?.LOCATIONDESCRIPTION || 'Main Store';

    return (
      <div className="w-full bg-[#f3f5f8] min-h-screen p-4 sm:p-6 font-sans text-slate-800 animate-fade-in">
        {/* Top Report Controls */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4 shadow-sm flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-slate-600 uppercase">Export Format:</label>
            <select
              value={reportExportType}
              onChange={e => setReportExportType(e.target.value)}
              className="px-3 py-1.5 text-sm border border-slate-300 rounded bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="html">Preview (HTML)</option>
              <option value="pdf">PDF Document</option>
              <option value="csv">CSV Spreadsheet</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => showToast('Report generated successfully.', 'info')}
              className="px-4 py-2 bg-[#2b3442] hover:bg-slate-800 text-white rounded text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <FileText className="w-4 h-4" /> Generate
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-[#2b3442] hover:bg-slate-800 text-white rounded text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
            <button
              onClick={() => setReportView(false)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <X className="w-4 h-4" /> Close
            </button>
          </div>
        </div>

        {/* Printable Document Paper */}
        <div className="max-w-4xl mx-auto bg-white border border-slate-300 rounded-lg p-8 sm:p-10 shadow-lg text-slate-900 print:border-none print:shadow-none print:p-0">
          {/* Company Document Header */}
          <div className="border-b-2 border-slate-900 pb-5 mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Vanguard ERP Systems</h1>
              <p className="text-xs text-slate-600 font-medium mt-0.5">Zeit w zaytoun ljanoub • Operational Control Center</p>
              <p className="text-xs text-slate-500">Facility: {branchName} — Location: {locName}</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-slate-100 text-slate-800 border border-slate-300 rounded text-xs font-bold uppercase tracking-wider">
                {isPosted ? 'POSTED ADJUSTMENT' : 'DRAFT ADJUSTMENT'}
              </span>
              <p className="text-xs text-slate-500 mt-1 font-mono">Ref #: ADJ-{adjustmentId || 'NEW'}</p>
              <p className="text-xs text-slate-500 font-mono">Date: {adjustmentDate}</p>
            </div>
          </div>

          <div className="text-center my-4">
            <h2 className="text-lg font-bold uppercase tracking-wide text-slate-800">Inventory Stock Count & Adjustment Summary</h2>
          </div>

          {/* Metadata Block */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded border border-slate-200 mb-6 text-xs">
            <div>
              <span className="text-slate-500 block">Adjustment #:</span>
              <span className="font-bold text-slate-800">#{adjustmentId || 'Unsaved'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Adjustment Date:</span>
              <span className="font-bold text-slate-800">{adjustmentDate}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Branch & Location:</span>
              <span className="font-bold text-slate-800">{locName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Created By:</span>
              <span className="font-bold text-slate-800">{createdBy.firstname} {createdBy.lastname}</span>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-xs border-collapse border border-slate-300 mb-6">
            <thead>
              <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 font-bold">
                <th className="p-2 border-r border-slate-300 text-left">Code</th>
                <th className="p-2 border-r border-slate-300 text-left">Description</th>
                <th className="p-2 border-r border-slate-300 text-center">Unit</th>
                <th className="p-2 border-r border-slate-300 text-right">QOH</th>
                <th className="p-2 border-r border-slate-300 text-right">Counted (New)</th>
                <th className="p-2 border-r border-slate-300 text-right text-rose-700">Variance</th>
                <th className="p-2 text-left">Remark</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, idx) => (
                <tr key={item.PRODUCTID} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                  <td className="p-2 border-r border-slate-200 font-mono text-slate-700">{item.PRODUCTCODE}</td>
                  <td className="p-2 border-r border-slate-200 font-medium text-slate-900">{item.PRODUCTDESCRIPTION}</td>
                  <td className="p-2 border-r border-slate-200 text-center text-slate-600">{item.UNITNAME}</td>
                  <td className="p-2 border-r border-slate-200 text-right font-mono text-slate-700">{Number(item.QTYOH).toFixed(3)}</td>
                  <td className="p-2 border-r border-slate-200 text-right font-mono font-bold text-slate-900">{Number(item.NEWQTY).toFixed(3)}</td>
                  <td className={`p-2 border-r border-slate-200 text-right font-mono font-bold ${item.VARIANCE < 0 ? 'text-rose-600' : item.VARIANCE > 0 ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {item.VARIANCE > 0 ? `+${Number(item.VARIANCE).toFixed(3)}` : Number(item.VARIANCE).toFixed(3)}
                  </td>
                  <td className="p-2 text-slate-600 italic">{item.REMARK || '-'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold border-t-2 border-slate-400 text-slate-900">
                <td colSpan={3} className="p-2 text-right">Totals:</td>
                <td className="p-2 text-right font-mono">{totals.totalQOH.toFixed(3)}</td>
                <td className="p-2 text-right font-mono">{totals.totalNewQty.toFixed(3)}</td>
                <td className="p-2 text-right font-mono text-rose-700">{totals.totalVariance.toFixed(3)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-6 pt-10 border-t border-slate-300 text-center text-xs">
            <div>
              <div className="border-b border-slate-400 pb-8 mb-2"></div>
              <p className="font-bold text-slate-800">Inventory Count Controller</p>
              <p className="text-[10px] text-slate-500">Name & Signature</p>
            </div>
            <div>
              <div className="border-b border-slate-400 pb-8 mb-2"></div>
              <p className="font-bold text-slate-800">Warehouse Manager</p>
              <p className="text-[10px] text-slate-500">Verification & Approval</p>
            </div>
            <div>
              <div className="border-b border-slate-400 pb-8 mb-2"></div>
              <p className="font-bold text-slate-800">Financial Auditor</p>
              <p className="text-[10px] text-slate-500">General Ledger Posting</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: MAIN EDITOR WORKSTATION (report === false)
  // --------------------------------------------------------------------------
  return (
    <div className="w-full bg-[#f8fafc] text-slate-800 font-sans p-3 sm:p-5 text-sm min-h-screen">
      {/* GLOBAL TOAST NOTIFICATION */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-xl text-white font-medium animate-fade-in ${
            toastMessage.type === 'error'
              ? 'bg-rose-600'
              : toastMessage.type === 'info'
              ? 'bg-blue-600'
              : 'bg-emerald-600'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertTriangle className="w-5 h-5" />
          ) : (
            <CheckCircle2 className="w-5 h-5" />
          )}
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOP HEADER & BREADCRUMBS */}
      <div className="mb-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Adjustments</h1>
            <nav className="flex items-center gap-1.5 text-xs text-slate-500">
              <a href="/inventory" className="text-blue-600 hover:underline">Home</a>
              <span>/</span>
              <span className="text-slate-600">Adjustments</span>
            </nav>
          </div>
          <button
            type="button"
            onClick={() => setTutorialModalOpen(true)}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <b>Watch Tutorial</b>
          </button>
        </div>
      </div>

      {/* TOP TOOLBAR ROW: BRANCH SELECTOR + DESKTOP ACTION BUTTONS */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-dotted border-slate-300">
        <div className="w-full sm:w-80">
          <select
            id="branch"
            value={selectedBranchId}
            onChange={e => {
              setSelectedBranchId(Number(e.target.value));
              handleNewAdjustmentClick();
            }}
            className="w-full px-3 py-2 text-sm font-medium bg-white border border-slate-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            {branches.map(b => (
              <option key={b.BRANCHID} value={b.BRANCHID}>
                {b.BARANCHNAME}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRecallModalOpen(true)}
            className="px-4 py-2 bg-[#2b3442] hover:bg-slate-800 text-white rounded text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <Search className="w-4 h-4" /> Preview
          </button>
          <button
            type="button"
            onClick={handleNewAdjustmentClick}
            className="px-4 py-2 bg-[#2b3442] hover:bg-slate-800 text-white rounded text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> New
          </button>
          <button
            type="button"
            onClick={() => setReportView(true)}
            className="px-4 py-2 bg-[#475569] hover:bg-slate-700 text-white rounded text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print Report
          </button>
        </div>
      </div>

      {/* =========================================================================
          CARD 1: ADJUSTMENT PARAMETERS & LOGISTICS
          ========================================================================= */}
      <div className="bg-white rounded-lg border border-[#dfe5ee] mb-4 shadow-none">
        <div className="bg-[#f8fafc] border-b border-[#dfe5ee] font-semibold text-slate-800 px-4 py-2.5">
          Adjustment
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
            {/* Location* + Add Location button */}
            <div className="col-span-12 md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Location<span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-1.5">
                <select
                  id="location"
                  value={selectedLocationId}
                  onChange={e => setSelectedLocationId(Number(e.target.value))}
                  className="flex-1 px-3 py-1.5 text-sm bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-400"
                >
                  <option value={0}>Select location</option>
                  {locations.map(loc => (
                    <option key={loc.LOCATIONID} value={loc.LOCATIONID}>
                      {loc.LOCATIONDESCRIPTION}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  title="Add new storage/warehouse location"
                  onClick={() => setAddLocationModalOpen(true)}
                  className="px-2.5 py-1.5 bg-[#2b3442] hover:bg-slate-800 text-white rounded font-bold text-sm transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Include */}
            <div className="col-span-12 md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Include</label>
              <select
                id="includeFilter"
                value={includeFilter}
                onChange={e => setIncludeFilter(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-400"
              >
                <option value={0}>All</option>
                <option value={1}>Daily adjustment</option>
                <option value={2}>Weekly adjustment</option>
              </select>
            </div>

            {/* Sort by */}
            <div className="col-span-12 md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Sort by</label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-400"
              >
                <option value="PRODUCTCODE">Product code</option>
                <option value="PRODUCTDESCRIPTION">Product description</option>
              </select>
            </div>

            {/* Sort Type */}
            <div className="col-span-12 md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Sort Type</label>
              <select
                value={sortType}
                onChange={e => setSortType(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-400"
              >
                <option value="asc">Select Type</option>
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>

            {/* Search (with subcategory trigger) */}
            <div className="col-span-12 md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Search</label>
              <select
                value={searchBy}
                onChange={e => {
                  setSearchBy(Number(e.target.value));
                  setComboValue(0);
                }}
                className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-400"
              >
                <option value={0}>Select</option>
                <option value={1}>Category</option>
                <option value={2}>Division</option>
                <option value={3}>Group</option>
              </select>

              {/* Dynamic subcategory dropdown */}
              {searchBy === 1 && (
                <select
                  value={comboValue}
                  onChange={e => setComboValue(Number(e.target.value))}
                  className="w-full mt-2 px-3 py-1.5 text-sm bg-white border border-slate-300 rounded"
                >
                  <option value={0}>Select Category</option>
                  {OMEGA_CATEGORIES.map(c => (
                    <option key={c.CATEGORYID} value={c.CATEGORYID}>
                      {c.CATEGORYNAME}
                    </option>
                  ))}
                </select>
              )}
              {searchBy === 2 && (
                <select
                  value={comboValue}
                  onChange={e => setComboValue(Number(e.target.value))}
                  className="w-full mt-2 px-3 py-1.5 text-sm bg-white border border-slate-300 rounded"
                >
                  <option value={0}>Select Division</option>
                  {OMEGA_DIVISIONS.map(d => (
                    <option key={d.DIVISIONID} value={d.DIVISIONID}>
                      {d.DIVISIONNAME}
                    </option>
                  ))}
                </select>
              )}
              {searchBy === 3 && (
                <select
                  value={comboValue}
                  onChange={e => setComboValue(Number(e.target.value))}
                  className="w-full mt-2 px-3 py-1.5 text-sm bg-white border border-slate-300 rounded"
                >
                  <option value={0}>Select Group</option>
                  {OMEGA_GROUPS.map(g => (
                    <option key={g.GROUPID} value={g.GROUPID}>
                      {g.GROUPNAME}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Sub row: Adjustment Date + Checkboxes + Preview Status Details */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center mt-3 pt-3 border-t border-slate-100">
            {/* Adjustment Date */}
            <div className="col-span-12 md:col-span-4">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1">
                Adjustment Date
                <button
                  type="button"
                  onClick={() => setIsEditingDate(!isEditingDate)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Edit Date"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </label>
              {isEditingDate ? (
                <input
                  type="date"
                  value={adjustmentDate}
                  onChange={e => setAdjustmentDate(e.target.value)}
                  onBlur={() => setIsEditingDate(false)}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-blue-400 rounded focus:outline-none"
                />
              ) : (
                <input
                  type="text"
                  disabled
                  value={adjustmentDate}
                  className="w-full px-3 py-1.5 text-sm bg-slate-100 border border-slate-200 rounded text-slate-700 cursor-not-allowed font-mono"
                />
              )}
            </div>

            {/* Checkboxes: Show neg. Qty only & Hide items with 0 Qty */}
            <div className="col-span-12 md:col-span-4 flex flex-col gap-1.5 justify-center">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={showNegQtyOnly}
                  onChange={e => setShowNegQtyOnly(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span>Show neg. Qty only</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={hide0Qty}
                  onChange={e => setHide0Qty(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span>Hide items with 0 Qty</span>
              </label>
            </div>

            {/* If in preview mode: show Reference & Created By */}
            {isPreviewMode && (
              <div className="col-span-12 md:col-span-4 text-xs bg-slate-50 border border-slate-200 rounded p-2 text-right">
                <p className="text-slate-600 font-mono">
                  Reference: <b>#{adjustmentId}</b> {isPosted ? <span className="ml-1 text-emerald-600 font-bold">(POSTED)</span> : <span className="ml-1 text-amber-600 font-bold">(DRAFT)</span>}
                </p>
                <p className="text-slate-500 mt-0.5">
                  Created by: {createdBy.firstname} {createdBy.lastname}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          CARD 2: DETAILS & ITEMS TABLE
          ========================================================================= */}
      <div className="bg-white rounded-lg border border-[#dfe5ee] mb-4 shadow-none">
        <div className="bg-[#f8fafc] border-b border-[#dfe5ee] font-semibold text-slate-800 px-4 py-2.5">
          Details
        </div>

        <div className="p-4">
          {/* Details Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            {/* Search items bar */}
            <div className="w-full sm:w-96">
              <div className="flex items-center">
                <input
                  type="search"
                  value={tableSearchText}
                  onChange={e => {
                    setTableSearchText(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search item by code, description or barcodes..."
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-l focus:outline-none focus:ring-1 focus:ring-slate-400 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  className="px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-r text-sm transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Buttons: [+ Add Items] and [Actions v] */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAddItemsModalOpen(true)}
                className="px-3 py-1.5 bg-[#475569] hover:bg-slate-700 text-white rounded text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Items
              </button>

              {/* Actions Dropdown */}
              <div className="relative group">
                <button
                  type="button"
                  className="px-3.5 py-1.5 bg-[#2b3442] hover:bg-slate-800 text-white rounded text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  Actions <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <div className="absolute right-0 mt-1 w-56 bg-white border border-slate-200 rounded-lg shadow-xl hidden group-hover:block z-30 py-1 text-xs">
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-100 flex items-center gap-2 font-medium"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" /> Export Items
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportModalOpen(true)}
                    className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-100 flex items-center gap-2 font-medium"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-500" /> Import Items
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button
                    type="button"
                    onClick={() => setConfirmZeroModalOpen(true)}
                    className="w-full px-4 py-2 text-left text-red-700 hover:bg-red-50 flex items-center gap-2 font-bold"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-red-600" /> Set All Qty to 0
                  </button>
                  <button
                    type="button"
                    onClick={handleSetAllNegativeQtyZero}
                    className="w-full px-4 py-2 text-left text-red-700 hover:bg-red-50 flex items-center gap-2 font-bold"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-red-600" /> Set All negative QTY to Zero
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Details Table */}
          <div className="border border-slate-200 rounded overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3 w-[15%]">Code</th>
                  <th className="py-2.5 px-3 w-[25%]">Description</th>
                  <th className="py-2.5 px-3 w-[10%] text-right">QOH</th>
                  <th className="py-2.5 px-3 w-[15%] text-right whitespace-nowrap">New Qty</th>
                  <th className="py-2.5 px-3 w-[10%] text-right text-red-700">Variance</th>
                  <th className="py-2.5 px-3 w-[15%]">Units</th>
                  <th className="py-2.5 px-3 w-[20%]">Remark</th>
                  <th className="py-2.5 px-2 w-[5%] text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-1 text-slate-400" />
                      Loading inventory adjustment items...
                    </td>
                  </tr>
                ) : paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No inventory items found matching your filters.
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item, idx) => (
                    <tr
                      key={item.PRODUCTID}
                      className={`hover:bg-slate-50 transition-colors ${
                        idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'
                      }`}
                    >
                      {/* Code */}
                      <td className="py-2 px-3 font-mono font-medium text-slate-700 whitespace-nowrap">
                        {item.PRODUCTCODE}
                      </td>

                      {/* Description */}
                      <td className="py-2 px-3 text-slate-900 font-medium">
                        {item.PRODUCTDESCRIPTION}
                      </td>

                      {/* QOH */}
                      <td className="py-2 px-3 text-right font-mono text-slate-600">
                        {Number(item.QTYOH).toFixed(3)}
                      </td>

                      {/* New Qty (Inline editable number input) */}
                      <td className="py-1.5 px-3 text-right">
                        <input
                          type="number"
                          step="any"
                          value={item.NEWQTY}
                          onFocus={e => e.target.select()}
                          onChange={e => handleNewQtyChange(item.PRODUCTID, e.target.value)}
                          className="w-28 px-2 py-1 text-xs text-right font-mono font-bold bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>

                      {/* Variance */}
                      <td className={`py-2 px-3 text-right font-mono font-bold ${item.VARIANCE < 0 ? 'text-red-700' : item.VARIANCE > 0 ? 'text-emerald-700' : 'text-slate-500'}`}>
                        {item.VARIANCE > 0 ? `+${Number(item.VARIANCE).toFixed(3)}` : Number(item.VARIANCE).toFixed(3)}
                      </td>

                      {/* Units */}
                      <td className="py-2 px-3 text-slate-600">
                        {item.UNITNAME}
                      </td>

                      {/* Remark (Inline editable text input) */}
                      <td className="py-1.5 px-3">
                        <input
                          type="text"
                          value={item.REMARK || ''}
                          onChange={e => handleRemarkChange(item.PRODUCTID, e.target.value)}
                          placeholder="Remark..."
                          className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 placeholder:text-slate-300"
                        />
                      </td>

                      {/* Remove Row */}
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(item.PRODUCTID)}
                          title="Remove item"
                          className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination & Summary Footers */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-2 text-xs text-slate-600">
            <div>
              Showing {filteredItems.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredItems.length)} of {filteredItems.length} items
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-2.5 py-1 border border-slate-300 rounded bg-white hover:bg-slate-50 disabled:opacity-50"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-2.5 py-1 border rounded ${
                      currentPage === pageNum
                        ? 'bg-slate-800 text-white border-slate-800 font-bold'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 border border-slate-300 rounded bg-white hover:bg-slate-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>

          {/* =========================================================================
              BOTTOM SAVE & POST TOOLBAR (AUTHENTIC OMEGA BUTTONS)
              ========================================================================= */}
          <div className="flex flex-wrap items-center justify-end gap-2.5 mt-5 pt-4 border-t border-slate-200">
            {/* When fresh / unsaved */}
            {!isPreviewMode && (
              <>
                <button
                  type="button"
                  onClick={handleSaveAdjustment}
                  style={{ backgroundColor: '#fb8205', borderColor: '#da6f00' }}
                  className="px-5 py-2 text-white font-bold rounded shadow-sm hover:brightness-95 flex items-center gap-1.5 text-sm transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Save
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndPostAdjustment}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow-sm flex items-center gap-1.5 text-sm transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Save &amp; Post
                </button>
              </>
            )}

            {/* When previewing an unposted draft */}
            {isPreviewMode && !isPosted && (
              <>
                <button
                  type="button"
                  onClick={handleSaveAdjustment}
                  style={{ backgroundColor: '#fb8205', borderColor: '#da6f00' }}
                  className="px-5 py-2 text-white font-bold rounded shadow-sm hover:brightness-95 flex items-center gap-1.5 text-sm transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Save
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndPostAdjustment}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow-sm flex items-center gap-1.5 text-sm transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Post
                </button>
                <button
                  type="button"
                  onClick={handleDeleteCurrentAdjustment}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded shadow-sm flex items-center gap-1.5 text-sm transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </>
            )}

            {/* When posted */}
            {isPreviewMode && isPosted && (
              <>
                <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded font-bold text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Posted to Ledger ({voucherId || `JV-${adjustmentId}`})
                </div>
                <button
                  type="button"
                  onClick={handleTransferToAccounting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow-sm flex items-center gap-1.5 text-sm transition-all cursor-pointer"
                >
                  <Calculator className="w-4 h-4" /> Transfer To Accounting
                </button>
              </>
            )}
          </div>

          {/* =========================================================================
              STOCK APP PROMO FOOTER
              ========================================================================= */}
          <hr className="my-6 border-slate-200" />
          <div className="text-center text-xs text-slate-500 py-2">
            <p className="mb-2">Download the Omega Stock App to take your stock count from your mobile device.</p>
            <a
              href="https://play.google.com/store/apps/details?id=com.omegasoftware.ostock"
              target="_blank"
              rel="noreferrer"
              className="inline-block"
            >
              <img
                src="https://www.omegapos.com/images/icons/googleplay.png"
                alt="Get it on Google Play"
                className="w-36 mx-auto hover:opacity-90 transition-opacity"
              />
            </a>
          </div>
        </div>
      </div>

      {/* =========================================================================
          COPYRIGHT FOOTER
          ========================================================================= */}
      <footer className="text-center text-[11px] text-slate-400 py-6 border-t border-slate-200">
        <span>{t('copyright_vanguard', '© 2026 Vanguard ERP. All rights reserved.')}</span> &nbsp;|&nbsp; 
        <a href="#privacy" className="hover:underline">{t('privacy_policy', 'Privacy Policy')}</a> &nbsp;|&nbsp; 
        <a href="#terms" className="hover:underline">{t('terms_conditions', 'Terms and Conditions')}</a> &nbsp;|&nbsp; 
        <a href="#support" className="hover:underline">{t('support', 'Support')}</a> &nbsp;|&nbsp; 
        <a href="#feedback" className="hover:underline">{t('feedback', 'Feedback')}</a>
      </footer>

      {/* =========================================================================
          MODAL 1: RECALL ADJUSTMENTS MODAL (#recallAdjustment)
          ========================================================================= */}
      {recallModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-200">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
              <h5 className="font-bold text-slate-800 text-base">Recall Adjustments</h5>
              <button
                type="button"
                onClick={() => setRecallModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Recall Filter Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="col-span-12 sm:col-span-4">
                  <input
                    type="search"
                    value={recallSearch}
                    onChange={e => setRecallSearch(e.target.value)}
                    placeholder="Search adjustment ID, branch, creator..."
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded"
                  />
                </div>

                <div className="col-span-12 sm:col-span-4">
                  <select
                    value={recallBranchId}
                    onChange={e => setRecallBranchId(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded"
                  >
                    {branches.map(b => (
                      <option key={b.BRANCHID} value={b.BRANCHID}>
                        {b.BARANCHNAME}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-12 sm:col-span-4 flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-slate-700">
                    <input
                      type="radio"
                      name="recall_status"
                      checked={recallStatus === 3}
                      onChange={() => setRecallStatus(3)}
                    />
                    <span>All</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-slate-700">
                    <input
                      type="radio"
                      name="recall_status"
                      checked={recallStatus === 1}
                      onChange={() => setRecallStatus(1)}
                    />
                    <span>Posted</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-slate-700">
                    <input
                      type="radio"
                      name="recall_status"
                      checked={recallStatus === 2}
                      onChange={() => setRecallStatus(2)}
                    />
                    <span>Unposted</span>
                  </label>
                </div>
              </div>

              {/* Date range & All Dates toggle */}
              <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-2 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={recallAllDates}
                      onChange={e => setRecallAllDates(e.target.checked)}
                      className="rounded"
                    />
                    <span>All Dates</span>
                  </label>
                  {!recallAllDates && (
                    <div className="flex items-center gap-1.5 ml-2">
                      <input
                        type="date"
                        value={recallFromDate}
                        onChange={e => setRecallFromDate(e.target.value)}
                        className="px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                      />
                      <span>to</span>
                      <input
                        type="date"
                        value={recallToDate}
                        onChange={e => setRecallToDate(e.target.value)}
                        className="px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                      />
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleDeleteAllUnposted}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold text-xs flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete all unposted Adjustments
                </button>
              </div>
            </div>

            {/* Adjustments Table */}
            <div className="p-4 overflow-y-auto flex-1">
              <table className="w-full text-xs text-left border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                    <th className="p-2 border-r border-slate-200">Adjust #</th>
                    <th className="p-2 border-r border-slate-200">Date</th>
                    <th className="p-2 border-r border-slate-200">Branch</th>
                    <th className="p-2 border-r border-slate-200">Location</th>
                    <th className="p-2 border-r border-slate-200">Status</th>
                    <th className="p-2 border-r border-slate-200">Created By</th>
                    <th className="p-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {savedList
                    .filter(a => {
                      if (recallBranchId && a.BRANCHID !== recallBranchId) return false;
                      if (recallStatus === 1 && a.POSTED !== -1) return false;
                      if (recallStatus === 2 && a.POSTED !== 0) return false;
                      if (recallSearch.trim()) {
                        const q = recallSearch.toLowerCase().trim();
                        return (
                          a.ADJUSTID.toString().includes(q) ||
                          a.LOCATIONDESCRIPTION.toLowerCase().includes(q) ||
                          `${a.firstname} ${a.lastname}`.toLowerCase().includes(q)
                        );
                      }
                      return true;
                    })
                    .map(row => (
                      <tr key={row.ADJUSTID} className="hover:bg-slate-50 transition-colors">
                        <td className="p-2 border-r border-slate-200 font-mono font-bold text-slate-800">
                          #{row.ADJUSTID}
                        </td>
                        <td className="p-2 border-r border-slate-200 text-slate-600">
                          {row.ADATE.split(' ')[0]}
                        </td>
                        <td className="p-2 border-r border-slate-200 text-slate-700">
                          {row.BARANCHNAME}
                        </td>
                        <td className="p-2 border-r border-slate-200 font-medium text-slate-900">
                          {row.LOCATIONDESCRIPTION}
                        </td>
                        <td className="p-2 border-r border-slate-200">
                          {row.POSTED === -1 ? (
                            <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-300 text-emerald-700 rounded font-bold">
                              Posted
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-amber-50 border border-amber-300 text-amber-700 rounded font-bold">
                              Unposted
                            </span>
                          )}
                        </td>
                        <td className="p-2 border-r border-slate-200 text-slate-600">
                          {row.firstname} {row.lastname}
                        </td>
                        <td className="p-2 text-center flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleLoadRecallAdjustment(row)}
                            className="px-2.5 py-1 bg-[#2b3442] hover:bg-slate-800 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <Eye className="w-3 h-3" /> Load
                          </button>
                          {row.POSTED === 0 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteRecallRow(row.ADJUSTID)}
                              title="Delete Draft"
                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setRecallModalOpen(false)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: IMPORT ADJUSTMENT ITEMS MODAL (#importItems)
          ========================================================================= */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg border border-slate-200">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
              <h5 className="font-bold text-slate-800 text-base">Import Adjustment Items</h5>
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 text-xs text-slate-700 space-y-4">
              <div className="flex items-center justify-between bg-blue-50 p-3 rounded border border-blue-200">
                <span className="text-blue-800">CSV format: <b>Code, NewQty, Remark</b></span>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="text-blue-700 font-bold hover:underline flex items-center gap-1 text-xs"
                >
                  <Download className="w-3.5 h-3.5" /> Download Template
                </button>
              </div>

              <div>
                <label className="block font-semibold mb-1">Paste CSV Contents or Drop File:</label>
                <textarea
                  rows={6}
                  value={csvContent}
                  onChange={e => setCsvContent(e.target.value)}
                  placeholder={`Code,NewQty,Remark\nART300G*12JAR509,25,Stock count batch\nVOO17.5L16KGWS,14,Damaged can removed`}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded font-mono text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
                ></textarea>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCsvImportSubmit}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-xs flex items-center gap-1"
              >
                <Upload className="w-3.5 h-3.5" /> Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: ADD LOCATION MODAL
          ========================================================================= */}
      {addLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md border border-slate-200">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
              <h5 className="font-bold text-slate-800 text-base">Add New Location</h5>
              <button
                type="button"
                onClick={() => setAddLocationModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 text-xs text-slate-700 space-y-3">
              <div>
                <label className="block font-semibold mb-1">Branch:</label>
                <input
                  type="text"
                  disabled
                  value={branches.find(b => b.BRANCHID === selectedBranchId)?.BARANCHNAME || ''}
                  className="w-full px-3 py-1.5 bg-slate-100 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Location Name / Description:</label>
                <input
                  type="text"
                  value={newLocationName}
                  onChange={e => setNewLocationName(e.target.value)}
                  placeholder="e.g. Cold Storage Room B, Olive Tank 4..."
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAddLocationModalOpen(false)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddLocationSubmit}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Save Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: ADD ITEMS MODAL
          ========================================================================= */}
      {addItemsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-slate-200">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
              <h5 className="font-bold text-slate-800 text-base">Add Items to Location</h5>
              <button
                type="button"
                onClick={() => setAddItemsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 text-xs">
              <p className="text-slate-500 mb-3">Click on any inventory item below to insert it into the current adjustment table:</p>
              <div className="space-y-1.5">
                {SEED_ADJUSTMENT_ITEMS.filter(i => !items.some(x => x.PRODUCTID === i.PRODUCTID)).map(item => (
                  <div
                    key={item.PRODUCTID}
                    onClick={() => {
                      setItems(prev => [
                        { ...item, QTYOH: 0, NEWQTY: 0, VARIANCE: 0, REMARK: 'Added manually' },
                        ...prev
                      ]);
                      setAddItemsModalOpen(false);
                      showToast(`Added ${item.PRODUCTCODE} to adjustment list.`, 'success');
                    }}
                    className="p-2.5 rounded border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="font-mono font-bold text-slate-800 mr-2">{item.PRODUCTCODE}</span>
                      <span className="text-slate-700">{item.PRODUCTDESCRIPTION}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-bold text-[11px]">
                      + Add
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setAddItemsModalOpen(false)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded font-semibold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: CONFIRM SET ALL TO ZERO MODAL
          ========================================================================= */}
      {confirmZeroModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md border border-slate-200 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-2">Confirm Zeroing All Quantities</h4>
            <p className="text-xs text-slate-600 mb-5">
              This action will set all items in this location to zero. Do you want to proceed?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setConfirmZeroModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSetAllQtyZero}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold transition-colors shadow-sm"
              >
                Yes, Set to Zero
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 6: WATCH TUTORIAL MODAL
          ========================================================================= */}
      {tutorialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-900 text-white">
              <h5 className="font-bold text-sm flex items-center gap-2">
                <PlayCircle className="w-4 h-4 text-emerald-400" /> Omega Stock Adjustments Tutorial
              </h5>
              <button
                type="button"
                onClick={() => setTutorialModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-slate-950 flex items-center justify-center">
              <iframe
                width="100%"
                height="340"
                src="https://www.youtube.com/embed/xmlMuGFimfA"
                title="Adjustments Tutorial"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded border border-slate-800 shadow"
              ></iframe>
            </div>
            <div className="p-4 bg-slate-50 text-xs text-slate-600 flex justify-between items-center">
              <span>Learn how to perform stock takes, cycle counts, variance resolution, and posting.</span>
              <button
                type="button"
                onClick={() => setTutorialModalOpen(false)}
                className="px-3 py-1 bg-slate-800 text-white rounded font-bold"
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
