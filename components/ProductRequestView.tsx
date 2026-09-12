'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  Save,
  Trash2,
  Printer,
  FileSpreadsheet,
  Download,
  Calendar,
  Clock,
  Boxes,
  CheckCircle2,
  AlertTriangle,
  X,
  ChevronDown,
  RefreshCw,
  Eye,
  Sparkles,
  ArrowRight,
  HelpCircle,
  FileText,
  SlidersHorizontal,
  BookmarkPlus,
  FolderOpen
} from 'lucide-react';
import {
  ProductRequestHeader,
  ProductRequestLineItem,
  InventorySearchItem,
  RecurringPRTemplate,
  OMEGA_PR_BRANCHES,
  OMEGA_PR_LOCATIONS
} from '@/lib/productRequestData';

export default function ProductRequestView() {
  // Master selection & form state
  const [currentPrId, setCurrentPrId] = useState<number | null>(null);
  const [prNumber, setPrNumber] = useState<string>('New Request');
  const [branchId, setBranchId] = useState<number>(1);
  const [locationId, setLocationId] = useState<number>(1);
  const [fromBranchId, setFromBranchId] = useState<number>(2);
  const [deliveryDate, setDeliveryDate] = useState<string>(
    () => new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [deliveryTime, setDeliveryTime] = useState<string>('08:00');
  const [remark, setRemark] = useState<string>('');
  const [status, setStatus] = useState<'Pending' | 'Approved' | 'Rejected' | 'Confirmed'>('Pending');

  // Line items for current PR
  const [items, setItems] = useState<ProductRequestLineItem[]>([]);

  // Modals state
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [showRecommendedModal, setShowRecommendedModal] = useState<boolean>(false);
  const [showBelowMinModal, setShowBelowMinModal] = useState<boolean>(false);
  const [showStoreTemplateModal, setShowStoreTemplateModal] = useState<boolean>(false);
  const [showRecallTemplateModal, setShowRecallTemplateModal] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  // Data lists from API
  const [catalogItems, setCatalogItems] = useState<InventorySearchItem[]>([]);
  const [previewList, setPreviewList] = useState<ProductRequestHeader[]>([]);
  const [templates, setTemplates] = useState<RecurringPRTemplate[]>([]);
  const [recommendedItems, setRecommendedItems] = useState<InventorySearchItem[]>([]);
  const [belowMinItems, setBelowMinItems] = useState<InventorySearchItem[]>([]);

  // Search & Filter within modals
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [selectedCatalogItemIds, setSelectedCatalogItemIds] = useState<number[]>([]);
  const [selectedRecItemIds, setSelectedRecItemIds] = useState<number[]>([]);
  const [selectedBelowMinIds, setSelectedBelowMinIds] = useState<number[]>([]);
  const [templateNameInput, setTemplateNameInput] = useState<string>('');

  // UI status
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch initial preview list and catalog items
  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch catalog
      const catRes = await fetch('/api/searchInvItemsByBranchByLocationService', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (catRes.ok) {
        const catData = await catRes.json();
        setCatalogItems(catData);
      }

      // 2. Fetch preview PRs
      const prRes = await fetch('/api/getAllProductRequestsService', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (prRes.ok) {
        const prData = await prRes.json();
        setPreviewList(prData);
      }

      // 3. Fetch templates
      const tmplRes = await fetch('/api/getproductrequestsRecureService', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branchid: branchId })
      });
      if (tmplRes.ok) {
        const tmplData = await tmplRes.json();
        setTemplates(tmplData);
      }
    } catch (e) {
      console.error('Error loading initial PR data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Filtered locations based on selected branch
  const availableLocations = useMemo(() => {
    return OMEGA_PR_LOCATIONS.filter(l => l.FORBRANCH === branchId || l.BRANCHID === branchId);
  }, [branchId]);

  // Totals calculations
  const totalQtyRequested = useMemo(() => {
    return items.reduce((acc, it) => acc + (Number(it.QTYREQ) || 0), 0);
  }, [items]);

  const totalCost = useMemo(() => {
    return items.reduce((acc, it) => acc + (Number(it.QTYREQ) || 0) * (Number(it.COST) || 0), 0);
  }, [items]);

  // Reset form for New Request
  const handleNewRequest = () => {
    setCurrentPrId(null);
    setPrNumber('New Request');
    setItems([]);
    setRemark('');
    setStatus('Pending');
    showToast('New Product Request initialized', 'success');
  };

  // Load an existing PR into workstation
  const handleLoadPr = async (pr: ProductRequestHeader) => {
    setCurrentPrId(pr.ID);
    setPrNumber(pr.REQUESTNB);
    setBranchId(pr.BRANCHID);
    setLocationId(pr.LOCATIONID);
    setFromBranchId(pr.FROMBRANCHID);
    if (pr.DELIVERYDATE) {
      const parts = pr.DELIVERYDATE.split(' ');
      setDeliveryDate(parts[0] || '');
      setDeliveryTime(parts[1] || '08:00');
    }
    setRemark(pr.REMARK || '');
    setStatus(pr.STATUS);
    setItems(pr.items || []);
    setShowPreviewModal(false);
    showToast(`Loaded request ${pr.REQUESTNB}`, 'success');
  };

  // Save (Create or Update)
  const handleSavePr = async () => {
    if (items.length === 0) {
      showToast('Please add at least one item to the product request', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        frombranchid: branchId,
        tolocationid: locationId,
        requestedfrombranchid: fromBranchId,
        retrievalDate: `${deliveryDate} ${deliveryTime}`,
        remark,
        items: items.map(it => ({
          ITEMID: it.ITEMID,
          ITEMCODE: it.ITEMCODE,
          ITEMDESCRIPTION: it.ITEMDESCRIPTION,
          UNIT: it.UNIT,
          QTYREQ: Number(it.QTYREQ) || 1,
          COST: it.COST,
          LOCID: it.LOCID || locationId,
          REMARK: it.REMARK
        }))
      };

      if (currentPrId) {
        // Update
        const res = await fetch('/api/updaterequestedproductService', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: currentPrId, ...payload })
        });
        const data = await res.json();
        if (data.status === 1) {
          showToast(`Product Request ${prNumber} updated successfully`, 'success');
          loadInitialData();
        } else {
          showToast(data.message || 'Failed to update request', 'error');
        }
      } else {
        // Create new
        const res = await fetch('/api/postrequestedproductService', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.status === 1) {
          setCurrentPrId(data.id);
          setPrNumber(data.request_nb);
          showToast(`Product Request ${data.request_nb} created successfully!`, 'success');
          loadInitialData();
        } else {
          showToast(data.message || 'Failed to save request', 'error');
        }
      }
    } catch (e: any) {
      showToast(e.message || 'Error communicating with server', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete current PR
  const handleDeletePr = async () => {
    if (!currentPrId) {
      showToast('Cannot delete an unsaved request', 'error');
      return;
    }
    if (!confirm(`Are you sure you want to delete ${prNumber}?`)) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/deleteproductrequestService', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentPrId })
      });
      const data = await res.json();
      if (data.status === 1) {
        showToast(`Request ${prNumber} deleted successfully`, 'success');
        handleNewRequest();
        loadInitialData();
      } else {
        showToast(data.message || 'Failed to delete request', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Line item manipulation
  const handleUpdateItemQty = (index: number, newQty: number) => {
    const updated = [...items];
    updated[index].QTYREQ = Math.max(0, newQty);
    updated[index].QTYAPP = Math.max(0, newQty);
    setItems(updated);
  };

  const handleUpdateItemRemark = (index: number, newRemark: string) => {
    const updated = [...items];
    updated[index].REMARK = newRemark;
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    showToast('Item removed from request');
  };

  // Add items from Catalog Search
  const handleAddItemsFromCatalog = (selectedItems: InventorySearchItem[]) => {
    const newLines: ProductRequestLineItem[] = selectedItems.map((cat, i) => ({
      ID: items.length + i + 1,
      ITEMID: cat.ITEMID,
      ITEMCODE: cat.ITEMCODE,
      ITEMDESCRIPTION: cat.ITEMDESCRIPTION,
      UNIT: cat.UNIT,
      QTYREQ: 1,
      QTYAPP: 1,
      QTYREC: 0,
      QTYOH: cat.QTYOH,
      COST: cat.COST,
      LOCID: locationId,
      LOCATIONDESCRIPTION: availableLocations[0]?.LOCATIONDESCRIPTION || 'Main Kitchen',
      FROMBRANCHIDDETAILS: fromBranchId,
      SUPPLIER: cat.SUPPLIER,
      REMARK: '',
      checked: true
    }));

    // Avoid duplicates by merging or appending
    const existingIds = new Set(items.map(it => it.ITEMID));
    const toAdd = newLines.filter(it => !existingIds.has(it.ITEMID));

    if (toAdd.length === 0) {
      showToast('Items already present in current request', 'error');
    } else {
      setItems([...items, ...toAdd]);
      showToast(`Added ${toAdd.length} items to request`);
    }

    setShowSearchModal(false);
    setSelectedCatalogItemIds([]);
  };

  // Open Recommended Items modal
  const handleOpenRecommended = async () => {
    try {
      const res = await fetch('/api/getProductRequestItemRecommendation');
      if (res.ok) {
        const data = await res.json();
        setRecommendedItems(data);
        setShowRecommendedModal(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Open Below Minimum modal
  const handleOpenBelowMin = async () => {
    try {
      const res = await fetch('/api/getProductRequestBelowMinimumItems');
      if (res.ok) {
        const data = await res.json();
        setBelowMinItems(data);
        setShowBelowMinModal(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Save Recurring Template
  const handleSaveTemplate = async () => {
    if (!templateNameInput.trim()) {
      showToast('Please provide a template name', 'error');
      return;
    }
    if (items.length === 0) {
      showToast('No items to store in template', 'error');
      return;
    }

    try {
      const res = await fetch('/api/postProductRequestRecureService', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templatename: templateNameInput,
          branchid: branchId,
          locationid: locationId,
          remark,
          items: items.map(it => ({
            ITEMID: it.ITEMID,
            ITEMCODE: it.ITEMCODE,
            ITEMDESCRIPTION: it.ITEMDESCRIPTION,
            UNIT: it.UNIT,
            QTYREQ: it.QTYREQ,
            COST: it.COST,
            REMARK: it.REMARK
          }))
        })
      });
      const data = await res.json();
      if (data.status === 1) {
        showToast(`Template "${templateNameInput}" stored successfully!`);
        setShowStoreTemplateModal(false);
        setTemplateNameInput('');
        loadInitialData();
      }
    } catch (e) {
      showToast('Error storing template', 'error');
    }
  };

  // Recall Template
  const handleRecallTemplate = (tmpl: RecurringPRTemplate) => {
    const recalledLines: ProductRequestLineItem[] = tmpl.items.map((it, i) => ({
      ID: i + 1,
      ITEMID: it.ITEMID,
      ITEMCODE: it.ITEMCODE,
      ITEMDESCRIPTION: it.ITEMDESCRIPTION,
      UNIT: it.UNIT,
      QTYREQ: it.QTYREQ,
      QTYAPP: it.QTYREQ,
      QTYREC: 0,
      QTYOH: 100,
      COST: it.COST,
      LOCID: tmpl.LOCATIONID || locationId,
      LOCATIONDESCRIPTION: availableLocations[0]?.LOCATIONDESCRIPTION || 'Main Kitchen',
      FROMBRANCHIDDETAILS: fromBranchId,
      SUPPLIER: '',
      REMARK: it.REMARK || '',
      checked: true
    }));

    setItems(recalledLines);
    if (tmpl.REMARK) setRemark(tmpl.REMARK);
    setShowRecallTemplateModal(false);
    showToast(`Recalled template "${tmpl.TEMPLATENAME}" with ${recalledLines.length} items`);
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
            <span className="text-teal-600 font-bold">Product Request</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Product Request</h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                status === 'Approved'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : status === 'Confirmed'
                  ? 'bg-cyan-50 text-cyan-700 border-cyan-300'
                  : status === 'Rejected'
                  ? 'bg-rose-50 text-rose-700 border-rose-300'
                  : 'bg-amber-50 text-amber-700 border-amber-300'
              }`}
            >
              {prNumber} &bull; {status}
            </span>
          </div>
        </div>

        {/* PRIMARY ACTIONS BAR */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Direct Search / Preview button */}
          <button
            onClick={() => setShowPreviewModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold transition-all border border-slate-300 shadow-sm"
            title="Browse and Recall existing Product Requests"
          >
            <Eye className="w-3.5 h-3.5 text-slate-600" />
            <span>Preview PRs</span>
          </button>

          {/* Items button */}
          <button
            onClick={() => setShowSearchModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1ab394] hover:bg-[#18a689] text-white rounded-md text-xs font-semibold transition-all shadow-sm"
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Items</span>
          </button>

          {/* Recommended Request button */}
          <button
            onClick={handleOpenRecommended}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1c84c6] hover:bg-[#1a7bb9] text-white rounded-md text-xs font-semibold transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Recommended Request</span>
          </button>

          {/* Below Minimum button */}
          <button
            onClick={handleOpenBelowMin}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#f8ac59] hover:bg-[#f7a54a] text-white rounded-md text-xs font-semibold transition-all shadow-sm"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Below Minimum Items</span>
          </button>

          {/* Save button */}
          <button
            onClick={handleSavePr}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1ab394] hover:bg-[#18a689] text-white rounded-md text-xs font-bold transition-all shadow-sm disabled:opacity-50"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save</span>
          </button>

          {/* Print button */}
          <button
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold transition-all border border-slate-300 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print</span>
          </button>

          {/* Template & More Actions Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold transition-all border border-slate-300 shadow-sm">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>Actions</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-1 hidden group-hover:block z-30 animate-in fade-in slide-in-from-top-1">
              <button
                onClick={handleNewRequest}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5 text-teal-600" />
                <span>New Request</span>
              </button>
              <button
                onClick={() => setShowStoreTemplateModal(true)}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <BookmarkPlus className="w-3.5 h-3.5 text-indigo-600" />
                <span>Store Template</span>
              </button>
              <button
                onClick={() => setShowRecallTemplateModal(true)}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <FolderOpen className="w-3.5 h-3.5 text-amber-600" />
                <span>Recall Template</span>
              </button>
              <button
                onClick={() => setShowExportModal(true)}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export to Excel/CSV</span>
              </button>
              {currentPrId && (
                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    onClick={handleDeletePr}
                    className="w-full text-left px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Delete Request</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* WORKSTATION CONTENT */}
      <div className="flex-1 p-6 space-y-5 max-w-7xl mx-auto w-full">
        {/* HEADER CONTROLS CARD */}
        <div className="bg-white rounded-lg border border-[#e7eaec] shadow-sm p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            {/* Requested By Branch */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Requested By Branch *
              </label>
              <select
                value={branchId}
                onChange={e => {
                  const bId = Number(e.target.value);
                  setBranchId(bId);
                  const firstLoc = OMEGA_PR_LOCATIONS.find(l => l.FORBRANCH === bId || l.BRANCHID === bId);
                  if (firstLoc) setLocationId(firstLoc.LOCATIONID);
                }}
                className="w-full h-9 px-3 bg-white border border-[#e5e6e7] rounded-md text-xs font-semibold text-slate-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              >
                {OMEGA_PR_BRANCHES.map(b => (
                  <option key={b.BRANCHID} value={b.BRANCHID}>
                    {b.BARANCHNAME}
                  </option>
                ))}
              </select>
            </div>

            {/* To Location */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                To Location *
              </label>
              <select
                value={locationId}
                onChange={e => setLocationId(Number(e.target.value))}
                className="w-full h-9 px-3 bg-white border border-[#e5e6e7] rounded-md text-xs font-semibold text-slate-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              >
                {availableLocations.map(l => (
                  <option key={l.LOCATIONID} value={l.LOCATIONID}>
                    {l.LOCATIONDESCRIPTION}
                  </option>
                ))}
              </select>
            </div>

            {/* Requested From Branch */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Requested From Branch *
              </label>
              <select
                value={fromBranchId}
                onChange={e => setFromBranchId(Number(e.target.value))}
                className="w-full h-9 px-3 bg-white border border-[#e5e6e7] rounded-md text-xs font-semibold text-slate-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              >
                {OMEGA_PR_BRANCHES.map(b => (
                  <option key={b.BRANCHID} value={b.BRANCHID}>
                    {b.BARANCHNAME}
                  </option>
                ))}
              </select>
            </div>

            {/* Retrieval / Delivery Date */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Delivery Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={e => setDeliveryDate(e.target.value)}
                  className="w-full h-9 px-3 pl-8 bg-white border border-[#e5e6e7] rounded-md text-xs font-semibold text-slate-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Delivery Time */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Delivery Time
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={deliveryTime}
                  onChange={e => setDeliveryTime(e.target.value)}
                  className="w-full h-9 px-3 pl-8 bg-white border border-[#e5e6e7] rounded-md text-xs font-semibold text-slate-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
                <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Remark row */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">
              Remark / Note:
            </label>
            <input
              type="text"
              value={remark}
              onChange={e => setRemark(e.target.value)}
              placeholder="Enter special instructions or notes for kitchen / dispatch..."
              className="flex-1 h-9 px-3 bg-white border border-[#e5e6e7] rounded-md text-xs text-slate-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* MAIN ITEMS TABLE */}
        <div className="bg-white rounded-lg border border-[#e7eaec] shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-50/70 border-b border-[#e7eaec] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Boxes className="w-4 h-4 text-teal-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Requested Items</span>
              <span className="bg-teal-100 text-teal-800 text-[11px] font-bold px-2 py-0.5 rounded-full ml-1">
                {items.length} items
              </span>
            </div>

            <button
              onClick={() => setShowSearchModal(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 px-2.5 py-1 rounded border border-teal-200 transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Add Items</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f9fafb] text-slate-500 font-bold uppercase tracking-wider border-b border-[#e7eaec]">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4 min-w-[220px]">Description</th>
                  <th className="py-3 px-4 w-32">Code</th>
                  <th className="py-3 px-4 w-32 text-center">Qty Req</th>
                  <th className="py-3 px-4 w-28 text-right">Cost</th>
                  <th className="py-3 px-4 w-24 text-center">Unit</th>
                  <th className="py-3 px-4 min-w-[180px]">Remark</th>
                  <th className="py-3 px-4 w-16 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                      <Boxes className="w-10 h-10 text-slate-300 mx-auto mb-2 opacity-50" />
                      <span>No items added yet. Click &ldquo;Items&rdquo; above to select products.</span>
                    </td>
                  </tr>
                ) : (
                  items.map((it, idx) => (
                    <tr key={it.ITEMID + '-' + idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{it.ITEMDESCRIPTION}</td>
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{it.ITEMCODE}</td>
                      <td className="py-3 px-4 text-center">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={it.QTYREQ}
                          onChange={e => handleUpdateItemQty(idx, Number(e.target.value))}
                          className="w-20 h-7 text-center font-bold text-slate-800 bg-white border border-[#e5e6e7] rounded focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                        />
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600">
                        ${(Number(it.COST) || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">
                          {it.UNIT}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={it.REMARK}
                          onChange={e => handleUpdateItemRemark(idx, e.target.value)}
                          placeholder="Line note..."
                          className="w-full h-7 px-2 bg-transparent hover:bg-white border border-transparent hover:border-slate-200 focus:border-teal-500 focus:bg-white rounded text-xs text-slate-700 transition-all focus:outline-none"
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Remove line item"
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

          {/* TABLE FOOTER SUMMARY */}
          {items.length > 0 && (
            <div className="bg-[#f9fafb] px-6 py-4 border-t border-[#e7eaec] flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-slate-700">
              <div className="flex items-center gap-6">
                <span>
                  Total Items: <span className="text-teal-700">{items.length}</span>
                </span>
                <span>
                  Total Qty Requested: <span className="text-teal-700">{totalQtyRequested}</span>
                </span>
              </div>
              <div className="text-sm">
                Est. Total Cost:{' '}
                <span className="font-mono text-emerald-700 text-base font-extrabold ml-1">
                  ${totalCost.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: SEARCH INVENTORY ITEMS MODAL
          ========================================================================= */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-800">Search & Add Inventory Items</h3>
              </div>
              <button
                onClick={() => setShowSearchModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filters Bar */}
            <div className="p-4 border-b border-slate-200 bg-white grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative md:col-span-2">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search item name, code, barcode..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(Number(e.target.value))}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-teal-500 focus:bg-white"
                >
                  <option value={0}>All Categories</option>
                  <option value={1}>Fresh Produce</option>
                  <option value={2}>Herbs & Spices</option>
                  <option value={3}>Oils & Fats</option>
                  <option value={4}>Dairy Products</option>
                  <option value={5}>Bakery & Flour</option>
                  <option value={6}>Poultry & Meat</option>
                  <option value={7}>Packaging Materials</option>
                  <option value={8}>Beverages</option>
                  <option value={9}>Condiments & Pickles</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto p-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          selectedCatalogItemIds.length > 0 &&
                          selectedCatalogItemIds.length === catalogItems.length
                        }
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedCatalogItemIds(catalogItems.map(c => c.ITEMID));
                          } else {
                            setSelectedCatalogItemIds([]);
                          }
                        }}
                        className="rounded text-teal-600 focus:ring-0"
                      />
                    </th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Cost</th>
                    <th className="py-2.5 px-3 text-center">Unit</th>
                    <th className="py-2.5 px-3 text-center">Qty OH</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {catalogItems
                    .filter(c => {
                      if (selectedCategory && selectedCategory !== 0 && c.CATEGORYID !== selectedCategory)
                        return false;
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      return (
                        c.ITEMDESCRIPTION.toLowerCase().includes(q) ||
                        c.ITEMCODE.toLowerCase().includes(q) ||
                        c.BARCODE.toLowerCase().includes(q)
                      );
                    })
                    .map(cat => {
                      const isChecked = selectedCatalogItemIds.includes(cat.ITEMID);
                      return (
                        <tr key={cat.ITEMID} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setSelectedCatalogItemIds(selectedCatalogItemIds.filter(id => id !== cat.ITEMID));
                                } else {
                                  setSelectedCatalogItemIds([...selectedCatalogItemIds, cat.ITEMID]);
                                }
                              }}
                              className="rounded text-teal-600 focus:ring-0"
                            />
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">{cat.ITEMDESCRIPTION}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">{cat.ITEMCODE}</td>
                          <td className="py-2.5 px-3 text-slate-600">{cat.CATEGORY}</td>
                          <td className="py-2.5 px-3 text-right font-mono">${cat.COST.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">
                              {cat.UNIT}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-teal-700">{cat.QTYOH}</td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => handleAddItemsFromCatalog([cat])}
                              className="px-2.5 py-1 bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white rounded text-[11px] font-bold border border-teal-200 transition-colors"
                            >
                              Add
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                {selectedCatalogItemIds.length} item(s) selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSearchModal(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const selected = catalogItems.filter(c => selectedCatalogItemIds.includes(c.ITEMID));
                    handleAddItemsFromCatalog(selected);
                  }}
                  disabled={selectedCatalogItemIds.length === 0}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm disabled:opacity-50"
                >
                  Add Selected ({selectedCatalogItemIds.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: PREVIEW PRODUCT REQUESTS MODAL (RECALL ANY PR)
          ========================================================================= */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-800">Preview Product Requests</h3>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">PR #</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Requested By</th>
                    <th className="py-2.5 px-3">Branch</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Delivery Date</th>
                    <th className="py-2.5 px-3 text-center">Items</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewList.map(pr => (
                    <tr key={pr.ID} className="hover:bg-teal-50/40 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-teal-700 font-mono">{pr.REQUESTNB}</td>
                      <td className="py-2.5 px-3 text-slate-600">{pr.CURRENTDATE}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{pr.REQUESTEDBY}</td>
                      <td className="py-2.5 px-3 text-slate-600">{pr.TOBRANCH}</td>
                      <td className="py-2.5 px-3 text-slate-600">{pr.LOCATIONDESCRIPTION}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
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
                      <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{pr.DELIVERYDATE}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-700">{pr.ITEMS_COUNT}</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleLoadPr(pr)}
                          className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-[11px] font-bold shadow-sm"
                        >
                          Recall
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: RECOMMENDED REQUEST MODAL
          ========================================================================= */}
      {showRecommendedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-800">Recommended Products for Request</h3>
              </div>
              <button
                onClick={() => setShowRecommendedModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">Select</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3 text-center">Suggested Qty</th>
                    <th className="py-2.5 px-3 text-center">Unit</th>
                    <th className="py-2.5 px-3 text-right">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recommendedItems.map(it => {
                    const isChecked = selectedRecItemIds.includes(it.ITEMID);
                    return (
                      <tr key={it.ITEMID} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setSelectedRecItemIds(selectedRecItemIds.filter(id => id !== it.ITEMID));
                              } else {
                                setSelectedRecItemIds([...selectedRecItemIds, it.ITEMID]);
                              }
                            }}
                            className="rounded text-indigo-600 focus:ring-0"
                          />
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{it.ITEMDESCRIPTION}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">{it.ITEMCODE}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-indigo-700">
                          {it.RECOMMENDED_QTY || 10}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-600">{it.UNIT}</td>
                        <td className="py-2.5 px-3 text-right font-mono">${it.COST.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {selectedRecItemIds.length} recommended item(s) selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowRecommendedModal(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const selected = recommendedItems.filter(i => selectedRecItemIds.includes(i.ITEMID));
                    handleAddItemsFromCatalog(selected);
                    setShowRecommendedModal(false);
                    setSelectedRecItemIds([]);
                  }}
                  disabled={selectedRecItemIds.length === 0}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm disabled:opacity-50"
                >
                  Add Items to PR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: BELOW MINIMUM ITEMS MODAL
          ========================================================================= */}
      {showBelowMinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-800">Items Below Minimum Stock</h3>
              </div>
              <button
                onClick={() => setShowBelowMinModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">Select</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3 text-center">Current Qty OH</th>
                    <th className="py-2.5 px-3 text-center">Restock Qty</th>
                    <th className="py-2.5 px-3 text-center">Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {belowMinItems.map(it => {
                    const isChecked = selectedBelowMinIds.includes(it.ITEMID);
                    return (
                      <tr key={it.ITEMID} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setSelectedBelowMinIds(selectedBelowMinIds.filter(id => id !== it.ITEMID));
                              } else {
                                setSelectedBelowMinIds([...selectedBelowMinIds, it.ITEMID]);
                              }
                            }}
                            className="rounded text-amber-600 focus:ring-0"
                          />
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{it.ITEMDESCRIPTION}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">{it.ITEMCODE}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-rose-600">{it.QTYOH}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-teal-700">
                          {it.RECOMMENDED_QTY || 25}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-600">{it.UNIT}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {selectedBelowMinIds.length} item(s) below minimum selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowBelowMinModal(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const selected = belowMinItems.filter(i => selectedBelowMinIds.includes(i.ITEMID));
                    handleAddItemsFromCatalog(selected);
                    setShowBelowMinModal(false);
                    setSelectedBelowMinIds([]);
                  }}
                  disabled={selectedBelowMinIds.length === 0}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm disabled:opacity-50"
                >
                  Add Items to PR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: STORE RECURRING TEMPLATE MODAL
          ========================================================================= */}
      {showStoreTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookmarkPlus className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-800">Store PR Template</h3>
              </div>
              <button
                onClick={() => setShowStoreTemplateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Save the current {items.length} items as a reusable template for regular restock orders.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={templateNameInput}
                  onChange={e => setTemplateNameInput(e.target.value)}
                  placeholder="e.g., Weekly Produce Standard Kit"
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-teal-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowStoreTemplateModal(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTemplate}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Save Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 6: RECALL RECURRING TEMPLATE MODAL
          ========================================================================= */}
      {showRecallTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-800">Recall Saved PR Template</h3>
              </div>
              <button
                onClick={() => setShowRecallTemplateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {templates.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">No stored templates found.</div>
              ) : (
                templates.map(tmpl => (
                  <div
                    key={tmpl.TEMPLATEID}
                    className="p-4 rounded-lg border border-slate-200 hover:border-teal-400 hover:shadow-sm transition-all flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{tmpl.TEMPLATENAME}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{tmpl.REMARK || 'No description'}</p>
                      <span className="inline-block mt-2 px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">
                        {tmpl.items?.length || 0} items included
                      </span>
                    </div>

                    <button
                      onClick={() => handleRecallTemplate(tmpl)}
                      className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-bold shadow-sm"
                    >
                      Load Template
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowRecallTemplateModal(false)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 7: EXPORT MODAL
          ========================================================================= */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 text-center">
            <FileSpreadsheet className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">Export Product Request</h3>
            <p className="text-xs text-slate-500 mb-5">
              Export {prNumber} with {items.length} line items to your preferred format.
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  showToast('Exporting to Excel (.xlsx)...');
                  setShowExportModal(false);
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Export as Excel (.xlsx)</span>
              </button>

              <button
                onClick={() => {
                  showToast('Exporting to CSV...');
                  setShowExportModal(false);
                }}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Export as CSV (.csv)</span>
              </button>
            </div>

            <button
              onClick={() => setShowExportModal(false)}
              className="mt-4 text-xs text-slate-400 hover:text-slate-600 font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 8: PRINT VIEW MODAL (1:1 AUTHENTIC OMEGA VOUCHER)
          ========================================================================= */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl my-8 overflow-hidden">
            {/* Action header */}
            <div className="bg-slate-800 text-white px-6 py-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider">Print Preview - {prNumber}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Body */}
            <div className="p-8 text-slate-800 font-sans text-xs">
              {/* Header */}
              <div className="flex items-start justify-between border-b pb-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">PRODUCT REQUISITION</h2>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">Omega ERP &bull; Operations Center</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold font-mono text-teal-700">{prNumber}</span>
                  <p className="text-slate-500 text-[11px]">Date: {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {/* Meta information */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Requested By Branch:</span>
                  <span className="font-bold text-slate-800">
                    {OMEGA_PR_BRANCHES.find(b => b.BRANCHID === branchId)?.BARANCHNAME}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">To Location:</span>
                  <span className="font-bold text-slate-800">
                    {availableLocations.find(l => l.LOCATIONID === locationId)?.LOCATIONDESCRIPTION}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Requested From:</span>
                  <span className="font-bold text-slate-800">
                    {OMEGA_PR_BRANCHES.find(b => b.BRANCHID === fromBranchId)?.BARANCHNAME}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Delivery Target:</span>
                  <span className="font-bold text-slate-800">
                    {deliveryDate} &bull; {deliveryTime}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-xs mb-6 border border-slate-200">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3 w-8">#</th>
                    <th className="py-2 px-3">Description</th>
                    <th className="py-2 px-3 w-28">Code</th>
                    <th className="py-2 px-3 w-20 text-center">Qty Req</th>
                    <th className="py-2 px-3 w-16 text-center">Unit</th>
                    <th className="py-2 px-3">Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 text-slate-400">{idx + 1}</td>
                      <td className="py-2 px-3 font-semibold">{it.ITEMDESCRIPTION}</td>
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-600">{it.ITEMCODE}</td>
                      <td className="py-2 px-3 text-center font-bold">{it.QTYREQ}</td>
                      <td className="py-2 px-3 text-center">{it.UNIT}</td>
                      <td className="py-2 px-3 text-slate-500 italic">{it.REMARK || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Signatures */}
              <div className="grid grid-cols-3 gap-6 pt-8 mt-12 border-t border-slate-200 text-center">
                <div>
                  <div className="h-10 border-b border-slate-300 mb-2"></div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Requested By</span>
                </div>
                <div>
                  <div className="h-10 border-b border-slate-300 mb-2"></div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Approved By</span>
                </div>
                <div>
                  <div className="h-10 border-b border-slate-300 mb-2"></div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Received By</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
