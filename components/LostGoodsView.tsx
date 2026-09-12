'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Plus,
  Search,
  Printer,
  X,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Trash2,
  Save,
  RotateCcw,
  Check,
  Download,
  Upload,
  Calendar,
  ChevronDown,
  Edit2,
  Eraser,
  Tag,
  ExternalLink,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';
import SearchInventoryItemsModal, { SelectedTransferItemPayload } from '@/components/SearchInventoryItemsModal';

// ============================================================================
// AUTHENTIC OMEGA SEED DATA & INTERFACES
// ============================================================================

export interface LostGoodsItem {
  id: string;
  productId?: number;
  code: string;
  description: string;
  qty: number;
  unitCost: number;
  totalCost: number;
  unit: string;
  remark: string;
  barcode?: string;
}

export interface LostGoodsVoucher {
  ser: number;
  waistId: number;
  branchId: number;
  branchName: string;
  date: string;
  locationId: number;
  locationDescription: string;
  employee: string;
  reasonId: number;
  reasonDesc: string;
  posted: number; // -1 = posted, 0 = draft/unposted
  items: LostGoodsItem[];
  createdAt?: string;
}

const AUTHENTIC_BRANCHES = [
  { id: 1, name: 'Zeit w zaytoun ljanoub' },
  { id: 2, name: 'Choueifat Main Facility' }
];

const AUTHENTIC_LOCATIONS = [
  { id: 2, name: 'Showroom' },
  { id: 1, name: 'Main Store' },
  { id: 3, name: 'Delivery' },
  { id: 4, name: 'Manufacture Warehouse' }
];

const AUTHENTIC_REASONS = [
  { id: 1, name: 'Product Expiry' },
  { id: 2, name: 'Broken' },
  { id: 3, name: 'Damaged in Transit' },
  { id: 4, name: 'Quality Rejection' },
  { id: 5, name: 'Inventory Variance / Missing' }
];

// 11 authentic vouchers directly extracted from live Omega ERP
const INITIAL_OMEGA_VOUCHERS: LostGoodsVoucher[] = [
  {
    ser: 132,
    waistId: 11,
    branchId: 1,
    branchName: 'Zeit w zaytoun ljanoub',
    date: '2026-07-06',
    locationId: 2,
    locationDescription: 'Showroom',
    employee: 'Mohammed Jichi',
    reasonId: 1,
    reasonDesc: 'Product Expiry',
    posted: -1,
    items: [
      {
        id: '132-1',
        productId: 1009,
        code: 'دونات شوكولا',
        description: 'دونات شوكولا',
        qty: 1,
        unitCost: 52200,
        totalCost: 52200,
        unit: 'Piece',
        remark: 'Automatically generated as expiry items on: 0000-00-00 00:00:00'
      }
    ]
  },
  {
    ser: 120,
    waistId: 10,
    branchId: 1,
    branchName: 'Zeit w zaytoun ljanoub',
    date: '2026-07-03',
    locationId: 2,
    locationDescription: 'Showroom',
    employee: 'Mohammed Jichi',
    reasonId: 1,
    reasonDesc: 'Product Expiry',
    posted: -1,
    items: [
      {
        id: '120-1',
        productId: 1010,
        code: 'مرطبان شطة حارة 650غ',
        description: 'مرطبان شطة حارة 650غ',
        qty: 1,
        unitCost: 102665,
        totalCost: 102665,
        unit: 'Jar',
        remark: 'Automatically generated as expiry items on: 0000-00-00 00:00:00'
      }
    ]
  },
  {
    ser: 118,
    waistId: 9,
    branchId: 1,
    branchName: 'Zeit w zaytoun ljanoub',
    date: '2026-06-22',
    locationId: 2,
    locationDescription: 'Showroom',
    employee: 'Mohammed Jichi',
    reasonId: 1,
    reasonDesc: 'Product Expiry',
    posted: -1,
    items: [
      {
        id: '118-1',
        productId: 1011,
        code: 'مرطبان زيتون اخضر بو شوكة 350غ',
        description: 'مرطبان زيتون اخضر بو شوكة 350غ',
        qty: 2,
        unitCost: 127800,
        totalCost: 255600,
        unit: 'Jar',
        remark: 'Automatically generated as expiry items on: 0228-03-03 00:00:00'
      }
    ]
  },
  {
    ser: 116,
    waistId: 8,
    branchId: 1,
    branchName: 'Zeit w zaytoun ljanoub',
    date: '2026-06-22',
    locationId: 1,
    locationDescription: 'Main Store',
    employee: 'Mohammed Jichi',
    reasonId: 1,
    reasonDesc: 'Product Expiry',
    posted: -1,
    items: [
      {
        id: '116-1',
        productId: 1009,
        code: 'دونات شوكولا',
        description: 'دونات شوكولا',
        qty: 1,
        unitCost: 52200,
        totalCost: 52200,
        unit: 'Piece',
        remark: 'Automatically generated as expiry items on: 0000-00-00 00:00:00'
      }
    ]
  },
  {
    ser: 109,
    waistId: 7,
    branchId: 1,
    branchName: 'Zeit w zaytoun ljanoub',
    date: '2026-06-18',
    locationId: 1,
    locationDescription: 'Main Store',
    employee: 'Mohammed Jichi',
    reasonId: 1,
    reasonDesc: 'Product Expiry',
    posted: -1,
    items: [
      {
        id: '109-1',
        productId: 1012,
        code: 'عرض الكرم',
        description: 'عرض الكرم',
        qty: 62,
        unitCost: 9790875,
        totalCost: 607034250,
        unit: 'Set',
        remark: 'Automatically generated as expiry items on: 0000-00-00 00:00:00'
      }
    ]
  },
  {
    ser: 87,
    waistId: 6,
    branchId: 1,
    branchName: 'Zeit w zaytoun ljanoub',
    date: '2026-04-03',
    locationId: 2,
    locationDescription: 'Showroom',
    employee: 'Mohammed Jichi',
    reasonId: 2,
    reasonDesc: 'Broken',
    posted: -1,
    items: [
      {
        id: '87-1',
        productId: 1013,
        code: 'تمر',
        description: 'تمر',
        qty: 30,
        unitCost: 0,
        totalCost: 0,
        unit: 'KG',
        remark: 'Broken packages during stocking'
      }
    ]
  },
  {
    ser: 86,
    waistId: 5,
    branchId: 1,
    branchName: 'Zeit w zaytoun ljanoub',
    date: '2026-03-24',
    locationId: 2,
    locationDescription: 'Showroom',
    employee: 'Mohammed Jichi',
    reasonId: 2,
    reasonDesc: 'Broken',
    posted: -1,
    items: [
      {
        id: '86-1',
        productId: 1014,
        code: 'حامض الليمون',
        description: 'حامض الليمون',
        qty: 5,
        unitCost: 126000,
        totalCost: 630000,
        unit: 'KG',
        remark: 'Broken container'
      }
    ]
  },
  {
    ser: 44,
    waistId: 4,
    branchId: 1,
    branchName: 'Zeit w zaytoun ljanoub',
    date: '2025-12-29',
    locationId: 2,
    locationDescription: 'Showroom',
    employee: 'Mohammed Jichi',
    reasonId: 1,
    reasonDesc: 'Product Expiry',
    posted: -1,
    items: [
      {
        id: '44-1',
        productId: 1015,
        code: 'أمور قشقوان بقري 300 غ',
        description: 'أمور قشقوان بقري 300 غ',
        qty: 2,
        unitCost: 337500,
        totalCost: 675000,
        unit: 'Pack',
        remark: 'Automatically generated as expiry items on: 0000-00-00 00:00:00'
      }
    ]
  },
  {
    ser: 34,
    waistId: 3,
    branchId: 1,
    branchName: 'Zeit w zaytoun ljanoub',
    date: '2025-12-21',
    locationId: 2,
    locationDescription: 'Showroom',
    employee: 'Mohammed Jichi',
    reasonId: 2,
    reasonDesc: 'Broken',
    posted: -1,
    items: [
      {
        id: '34-1',
        productId: 1016,
        code: 'صابون زيت زيتون بلدي',
        description: 'صابون زيت زيتون بلدي',
        qty: 41,
        unitCost: 450000,
        totalCost: 18450000,
        unit: 'Bar',
        remark: 'Damaged packaging during handling'
      }
    ]
  },
  {
    ser: 2,
    waistId: 2,
    branchId: 1,
    branchName: 'Zeit w zaytoun ljanoub',
    date: '2025-12-21',
    locationId: 1,
    locationDescription: 'Main Store',
    employee: 'Mohammed Jichi',
    reasonId: 1,
    reasonDesc: 'Product Expiry',
    posted: -1,
    items: [
      {
        id: '2-1',
        productId: 1001,
        code: 'صندوق زعتر أحمر حلبي 300غ*12',
        description: 'صندوق زعتر أحمر حلبي 300غ*12',
        qty: 20,
        unitCost: 1422000,
        totalCost: 28440000,
        unit: 'Box',
        remark: 'Automatically generated as expiry items on: 1970-01-01 00:00:00'
      }
    ]
  },
  {
    ser: 1,
    waistId: 1,
    branchId: 1,
    branchName: 'Zeit w zaytoun ljanoub',
    date: '2025-12-19',
    locationId: 2,
    locationDescription: 'Showroom',
    employee: 'Mohammed Jichi',
    reasonId: 1,
    reasonDesc: 'Product Expiry',
    posted: -1,
    items: [
      {
        id: '1-1',
        productId: 1017,
        code: 'فواكه مشكلة في شراب 400 غ',
        description: 'فواكه مشكلة في شراب 400 غ',
        qty: 12,
        unitCost: 135000,
        totalCost: 1620000,
        unit: 'Can',
        remark: 'Automatically generated as expiry items on: 0000-00-00 00:00:00'
      }
    ]
  }
];

export default function LostGoodsView() {
  // ==========================================================================
  // MAIN FORM STATE
  // ==========================================================================
  const [branches] = useState(AUTHENTIC_BRANCHES);
  const [selectedBranchId, setSelectedBranchId] = useState<number>(1);
  const [locations, setLocations] = useState(AUTHENTIC_LOCATIONS);
  const [selectedLocationId, setSelectedLocationId] = useState<number | ''>('');
  const [reasons, setReasons] = useState(AUTHENTIC_REASONS);
  const [selectedReasonId, setSelectedReasonId] = useState<number | ''>('');
  
  // Date in YYYY-MM-DD for native input, displayed nicely
  const [dateValue, setDateValue] = useState<string>('2026-09-11');
  const employeeName = 'Mohammed Jichi';

  // Table items
  const [items, setItems] = useState<LostGoodsItem[]>([]);

  // Current record meta (null = new draft)
  const [activeVoucher, setActiveVoucher] = useState<LostGoodsVoucher | null>(null);

  // Vouchers registry
  const [vouchers, setVouchers] = useState<LostGoodsVoucher[]>(INITIAL_OMEGA_VOUCHERS);

  // Search input inside details card
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
  const [isAddLocationModalOpen, setIsAddLocationModalOpen] = useState<boolean>(false);
  const [isAddReasonModalOpen, setIsAddReasonModalOpen] = useState<boolean>(false);
  const [isImportCsvModalOpen, setIsImportCsvModalOpen] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Format date helper: 2026-09-11 -> 11-Sep-2026
  const formatDisplayDate = (isoStr: string) => {
    try {
      const parts = isoStr.split('-');
      if (parts.length === 3) {
        const year = parts[0];
        const monthIndex = parseInt(parts[1], 10) - 1;
        const day = parts[2];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${day}-${months[monthIndex] || 'Sep'}-${year}`;
      }
    } catch {
      // fallback
    }
    return isoStr;
  };

  // Currency helper
  const formatCost = (cost: number) => {
    return cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Calculate totals
  const totalCostSum = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.totalCost || 0), 0);
  }, [items]);

  const totalQtySum = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.qty || 0), 0);
  }, [items]);

  // ==========================================================================
  // ACTION HANDLERS
  // ==========================================================================

  // Reset to brand new form (+ New)
  const handleNew = () => {
    setActiveVoucher(null);
    setDateValue('2026-09-11');
    setSelectedLocationId('');
    setSelectedReasonId('');
    setItems([]);
    setSearchQuery('');
    showToast('Started new Lost Goods voucher.', 'info');
  };

  // Update line item quantity
  const handleQuantityChange = (id: string, newQty: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const validQty = isNaN(newQty) || newQty < 0 ? 0 : newQty;
          return {
            ...item,
            qty: validQty,
            totalCost: validQty * item.unitCost
          };
        }
        return item;
      })
    );
  };

  // Update line item remark
  const handleRemarkChange = (id: string, newRemark: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, remark: newRemark } : item))
    );
  };

  // Clear line item remark (eraser button)
  const handleClearRemark = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, remark: '' } : item))
    );
  };

  // Set row remark from current reason
  const handleSetRowReason = (id: string) => {
    const activeReason = reasons.find((r) => r.id === selectedReasonId);
    const reasonText = activeReason ? activeReason.name : 'Product Expiry';
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, remark: reasonText } : item))
    );
  };

  // Delete line item
  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Receive items selected from SearchInventoryItemsModal
  const handleAddItemsFromModal = (selectedPayloads: SelectedTransferItemPayload[]) => {
    if (!selectedPayloads || selectedPayloads.length === 0) return;

    const currentReason = reasons.find((r) => r.id === selectedReasonId)?.name || '';

    const newItems: LostGoodsItem[] = selectedPayloads.map((payload, index) => {
      const qty = payload.qtyTransfered && payload.qtyTransfered > 0 ? payload.qtyTransfered : 1;
      // unitCost: use LBP if large, or convert USD using standard rate 89500 LBP
      const unitCost = payload.unitCostUsd ? Math.round(payload.unitCostUsd * 89500) : 100000;
      return {
        id: `LG-ITEM-${Date.now()}-${index}`,
        code: payload.code,
        description: payload.description,
        barcode: payload.barcode,
        qty: qty,
        unitCost: unitCost,
        totalCost: qty * unitCost,
        unit: payload.unit || 'Piece',
        remark: payload.remark || currentReason || 'Product Expiry'
      };
    });

    setItems((prev) => [...prev, ...newItems]);
    setIsSearchModalOpen(false);
    setSearchQuery('');
    showToast(`Added ${newItems.length} inventory item(s) to Lost Goods table.`);
  };

  // Save voucher as draft (Orange Save button)
  const handleSave = (postImmediately = false) => {
    if (!selectedLocationId) {
      showToast('Please select a Location first.', 'error');
      return;
    }
    if (items.length === 0) {
      showToast('Please add at least one item to Lost Goods details.', 'error');
      return;
    }

    const branch = branches.find((b) => b.id === selectedBranchId)?.name || 'Zeit w zaytoun ljanoub';
    const location = locations.find((l) => l.id === selectedLocationId)?.name || 'Showroom';
    const reason = reasons.find((r) => r.id === selectedReasonId)?.name || 'Product Expiry';

    if (activeVoucher) {
      // Update existing
      const updatedVoucher: LostGoodsVoucher = {
        ...activeVoucher,
        branchId: selectedBranchId,
        branchName: branch,
        date: dateValue,
        locationId: Number(selectedLocationId),
        locationDescription: location,
        reasonId: Number(selectedReasonId) || 1,
        reasonDesc: reason,
        posted: postImmediately ? -1 : activeVoucher.posted,
        items: [...items]
      };

      setVouchers((prev) =>
        prev.map((v) => (v.ser === activeVoucher.ser ? updatedVoucher : v))
      );
      setActiveVoucher(updatedVoucher);
      showToast(
        postImmediately
          ? `Voucher #${updatedVoucher.ser} saved and posted to inventory ledger!`
          : `Voucher #${updatedVoucher.ser} updated successfully.`
      );
    } else {
      // Create new voucher
      const nextSer = Math.max(...vouchers.map((v) => v.ser), 132) + 1;
      const newVoucher: LostGoodsVoucher = {
        ser: nextSer,
        waistId: vouchers.length + 1,
        branchId: selectedBranchId,
        branchName: branch,
        date: dateValue,
        locationId: Number(selectedLocationId),
        locationDescription: location,
        employee: employeeName,
        reasonId: Number(selectedReasonId) || 1,
        reasonDesc: reason,
        posted: postImmediately ? -1 : 0,
        items: [...items]
      };

      setVouchers([newVoucher, ...vouchers]);
      setActiveVoucher(newVoucher);
      showToast(
        postImmediately
          ? `Voucher #${nextSer} created and posted to inventory ledger!`
          : `Voucher #${nextSer} saved as draft.`
      );
    }
  };

  // Post loaded voucher
  const handlePost = () => {
    if (!activeVoucher) return;
    const updated = { ...activeVoucher, posted: -1, items: [...items] };
    setActiveVoucher(updated);
    setVouchers((prev) => prev.map((v) => (v.ser === updated.ser ? updated : v)));
    showToast(`Voucher #${updated.ser} posted to inventory ledger.`);
  };

  // Unpost loaded voucher
  const handleUnpost = () => {
    if (!activeVoucher) return;
    const updated = { ...activeVoucher, posted: 0, items: [...items] };
    setActiveVoucher(updated);
    setVouchers((prev) => prev.map((v) => (v.ser === updated.ser ? updated : v)));
    showToast(`Voucher #${updated.ser} unposted.`);
  };

  // Delete loaded voucher
  const handleDeleteVoucher = () => {
    if (!activeVoucher) return;
    if (confirm(`Are you sure you want to delete Lost Goods voucher #${activeVoucher.ser}?`)) {
      setVouchers((prev) => prev.filter((v) => v.ser !== activeVoucher.ser));
      handleNew();
      showToast(`Voucher #${activeVoucher.ser} deleted.`, 'info');
    }
  };

  // Load voucher from Preview modal
  const handleOpenVoucherFromPreview = (voucher: LostGoodsVoucher) => {
    setActiveVoucher(voucher);
    setSelectedBranchId(voucher.branchId || 1);
    setDateValue(voucher.date);
    setSelectedLocationId(voucher.locationId);
    setSelectedReasonId(voucher.reasonId);
    setItems([...voucher.items]);
    setIsPreviewModalOpen(false);
    showToast(`Loaded Lost Goods voucher #${voucher.ser}.`, 'info');
  };

  return (
    <div className="w-full bg-[#f8fafc] min-h-screen text-slate-800 font-sans p-4 md:p-6 select-text">
      {/* GLOBAL TOAST NOTIFICATION */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-xl text-white text-sm font-medium transition-all ${
            toastMessage.type === 'error'
              ? 'bg-rose-600'
              : toastMessage.type === 'info'
              ? 'bg-sky-700'
              : 'bg-emerald-600'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-white" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-white" />
          )}
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOP HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 mb-2">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-[#2c3e50] tracking-tight">
            Lost Goods
          </h1>
          <nav className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 font-medium">
            <span className="text-[#337ab7] hover:underline cursor-pointer">Home</span>
            <span>/</span>
            <span className="text-slate-500">Lost Goods</span>
            {activeVoucher && (
              <>
                <span>/</span>
                <span className="text-amber-700 font-mono font-semibold">
                  #{activeVoucher.ser} {activeVoucher.posted === -1 ? '(Posted)' : '(Draft)'}
                </span>
              </>
            )}
          </nav>
        </div>

        <div className="mt-2 md:mt-0">
          <a
            href="#tutorial"
            onClick={(e) => {
              e.preventDefault();
              showToast('Tutorial: Add lost/damaged goods to adjust inventory ledger.', 'info');
            }}
            className="text-xs text-[#337ab7] hover:underline font-medium flex items-center gap-1"
          >
            Watch Tutorial
          </a>
        </div>
      </div>

      {/* TOOLBAR: BRANCH SELECTOR & ACTIONS (NEW, PREVIEW, PRINT) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 mb-4 border-b border-dotted border-slate-300">
        {/* Branch Dropdown */}
        <div className="w-full md:w-72">
          <div className="relative">
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(Number(e.target.value))}
              className="w-full h-[34px] px-3 pr-8 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded shadow-xs focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 cursor-pointer"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Top Right Action Buttons: + New, Preview, Print */}
        <div className="flex items-center gap-1.5 self-end md:self-auto">
          {/* + New Button */}
          <button
            onClick={handleNew}
            className="h-[32px] px-3.5 bg-[#2c3e50] hover:bg-[#1a252f] active:bg-[#111920] text-white text-xs font-semibold rounded shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>

          {/* Preview Button */}
          <button
            onClick={() => setIsPreviewModalOpen(true)}
            className="h-[32px] px-3.5 bg-[#2c3e50] hover:bg-[#1a252f] active:bg-[#111920] text-white text-xs font-semibold rounded shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>

          {/* Print Button */}
          <button
            onClick={() => setIsPrintModalOpen(true)}
            disabled={items.length === 0}
            className="h-[32px] px-3.5 bg-[#2c3e50] hover:bg-[#1a252f] active:bg-[#111920] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER: TWO CARDS */}
      <div className="space-y-4">
        {/* ====================================================================
            CARD 1: INVENTORY ITEMS LOST GOODS
            ==================================================================== */}
        <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
          <div className="bg-[#f8fafc] px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xs font-semibold text-slate-700 tracking-wide">
              Inventory Items Lost Goods
            </h2>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Date
                </label>
                <div className="relative flex items-center">
                  <input
                    type="date"
                    value={dateValue}
                    onChange={(e) => setDateValue(e.target.value)}
                    className="w-full h-[34px] px-3 text-xs text-slate-700 bg-white border border-slate-300 rounded shadow-xs focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 font-mono"
                  />
                </div>
              </div>

              {/* 2. Location (with + button) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Location
                </label>
                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <select
                      value={selectedLocationId}
                      onChange={(e) => setSelectedLocationId(Number(e.target.value) || '')}
                      className="w-full h-[34px] px-3 pr-7 text-xs text-slate-700 bg-white border border-slate-300 rounded shadow-xs focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 cursor-pointer"
                    >
                      <option value="">Select location</option>
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddLocationModalOpen(true)}
                    title="Add Location"
                    className="w-[34px] h-[34px] bg-[#2c3e50] hover:bg-[#1a252f] text-white rounded flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 3. Reported By Employee* */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Reported By Employee*
                </label>
                <input
                  type="text"
                  disabled
                  value={employeeName}
                  className="w-full h-[34px] px-3 text-xs text-slate-700 bg-[#eef2f7] border border-slate-300 rounded shadow-xs cursor-not-allowed font-medium"
                />
              </div>

              {/* 4. Lost Goods Reason (with + button) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Lost Goods Reason
                </label>
                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <select
                      value={selectedReasonId}
                      onChange={(e) => {
                        const newReasonId = Number(e.target.value) || '';
                        setSelectedReasonId(newReasonId);
                        // Cascade reason to all existing item remarks if wanted
                        const reasonObj = reasons.find((r) => r.id === newReasonId);
                        if (reasonObj) {
                          setItems((prev) =>
                            prev.map((item) => ({
                              ...item,
                              remark: item.remark || reasonObj.name
                            }))
                          );
                        }
                      }}
                      className="w-full h-[34px] px-3 pr-7 text-xs text-slate-700 bg-white border border-slate-300 rounded shadow-xs focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 cursor-pointer"
                    >
                      <option value="">Select Reason</option>
                      {reasons.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddReasonModalOpen(true)}
                    title="Add Reason"
                    className="w-[34px] h-[34px] bg-[#2c3e50] hover:bg-[#1a252f] text-white rounded flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================================
            CARD 2: DETAILS (SEARCH ITEMS, IMPORT CSV, TABLE, SAVE/POST)
            ==================================================================== */}
        <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
          <div className="bg-[#f8fafc] px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xs font-semibold text-slate-700 tracking-wide">
              Details
            </h2>
          </div>

          <div className="p-4">
            {/* SEARCH ITEMS INPUT & IMPORT CSV BUTTON */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              {/* Search items... input */}
              <div className="w-full sm:w-80">
                <div className="relative">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setIsSearchModalOpen(true);
                      }
                    }}
                    onClick={() => setIsSearchModalOpen(true)}
                    placeholder="Search items..."
                    className="w-full h-[34px] px-3.5 text-xs text-slate-700 bg-white border border-[#66afe9] rounded-md shadow-[0_0_8px_rgba(102,175,233,0.4)] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all cursor-pointer"
                  />
                  <Search
                    onClick={() => setIsSearchModalOpen(true)}
                    className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 cursor-pointer hover:text-blue-500"
                  />
                </div>
              </div>

              {/* Import CSV button */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsImportCsvModalOpen(true)}
                  className="h-[34px] px-4 bg-[#2c3e50] hover:bg-[#1a252f] text-white text-xs font-medium rounded shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import CSV</span>
                </button>
              </div>
            </div>

            {/* DETAILS TABLE */}
            <div className="overflow-x-auto border border-slate-200 rounded mb-4">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f8fafc] text-slate-700 border-b border-slate-200 font-semibold">
                    <th className="py-2.5 px-3 w-[30%]">Description</th>
                    <th className="py-2.5 px-3 w-[10%] text-right">Qty</th>
                    <th className="py-2.5 px-3 w-[12%] text-right">Unit Cost</th>
                    <th className="py-2.5 px-3 w-[12%] text-right">Total Cost</th>
                    <th className="py-2.5 px-3 w-[10%]">Unit</th>
                    <th className="py-2.5 px-3 w-[22%]">Remark</th>
                    <th className="py-2.5 px-3 w-[4%] text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Search className="w-8 h-8 text-slate-300" />
                          <p className="text-xs text-slate-500 font-medium">
                            No items added yet. Click{' '}
                            <button
                              onClick={() => setIsSearchModalOpen(true)}
                              className="text-blue-600 underline font-semibold"
                            >
                              Search items...
                            </button>{' '}
                            or{' '}
                            <button
                              onClick={() => setIsImportCsvModalOpen(true)}
                              className="text-blue-600 underline font-semibold"
                            >
                              Import CSV
                            </button>{' '}
                            to add lost goods.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr
                        key={item.id}
                        className={index % 2 === 1 ? 'bg-slate-50/50 hover:bg-blue-50/30' : 'hover:bg-blue-50/30'}
                      >
                        {/* Description */}
                        <td className="py-2 px-3 font-medium text-slate-800">
                          <div>{item.description}</div>
                          {item.code !== item.description && (
                            <div className="text-[10px] text-slate-400 font-mono">
                              {item.code}
                            </div>
                          )}
                        </td>

                        {/* Qty Input */}
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.qty}
                            onChange={(e) => handleQuantityChange(item.id, parseFloat(e.target.value))}
                            className="w-20 h-6 px-1.5 text-right font-mono text-xs border border-slate-300 rounded focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white"
                          />
                        </td>

                        {/* Unit Cost */}
                        <td className="py-2 px-3 text-right font-mono text-slate-600">
                          {formatCost(item.unitCost)}
                        </td>

                        {/* Total Cost */}
                        <td className="py-2 px-3 text-right font-mono font-semibold text-slate-800">
                          {formatCost(item.totalCost)}
                        </td>

                        {/* Unit */}
                        <td className="py-2 px-3 text-slate-600">{item.unit}</td>

                        {/* Remark */}
                        <td className="py-2 px-3">
                          <div className="relative flex items-center">
                            <input
                              type="text"
                              value={item.remark}
                              onChange={(e) => handleRemarkChange(item.id, e.target.value)}
                              placeholder="Add remark..."
                              className="w-full h-6 px-2 pr-14 text-xs border border-slate-300 rounded focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white"
                            />
                            <div className="absolute right-1 flex items-center gap-0.5">
                              <button
                                type="button"
                                onClick={() => handleSetRowReason(item.id)}
                                title="Set current reason"
                                className="w-5 h-5 bg-[#337ab7] hover:bg-[#286090] text-white rounded text-[10px] flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-2.5 h-2.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleClearRemark(item.id)}
                                title="Clear remark"
                                className="w-5 h-5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <Eraser className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Delete row action */}
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            title="Remove item"
                            className="w-6 h-6 bg-rose-500 hover:bg-rose-600 text-white rounded flex items-center justify-center transition-colors cursor-pointer mx-auto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {items.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-100 font-semibold text-slate-800 border-t-2 border-slate-300 text-xs">
                      <td className="py-2.5 px-3">Total ({items.length} Items)</td>
                      <td className="py-2.5 px-3 text-right font-mono">{totalQtySum}</td>
                      <td className="py-2.5 px-3 text-right"></td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-[#2c3e50]">
                        {formatCost(totalCostSum)} LBP
                      </td>
                      <td colSpan={3}></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* BOTTOM ACTION BUTTONS */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
              {activeVoucher ? (
                <>
                  {/* Saved voucher actions */}
                  <button
                    type="button"
                    onClick={() => handleSave(false)}
                    className="h-[34px] px-4 bg-[#fb8205] hover:bg-[#e07502] text-white text-xs font-semibold rounded shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>

                  {activeVoucher.posted !== -1 ? (
                    <button
                      type="button"
                      onClick={handlePost}
                      className="h-[34px] px-4 bg-[#27ae60] hover:bg-[#219653] text-white text-xs font-semibold rounded shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Tag className="w-3.5 h-3.5" />
                      <span>Post</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleUnpost}
                      className="h-[34px] px-4 bg-[#3498db] hover:bg-[#2980b9] text-white text-xs font-semibold rounded shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Unpost</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleDeleteVoucher}
                    className="h-[34px] px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </>
              ) : (
                <>
                  {/* New draft buttons (matching screenshot exact styling) */}
                  <button
                    type="button"
                    onClick={() => handleSave(false)}
                    className="h-[34px] px-4 bg-[#fb8205] hover:bg-[#e07502] active:bg-[#c96902] text-white text-xs font-semibold rounded shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSave(true)}
                    className="h-[34px] px-4 bg-[#27ae60] hover:bg-[#219653] active:bg-[#1e824c] text-white text-xs font-semibold rounded shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save And Post</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================================
          MODAL 1: SEARCH INVENTORY ITEMS MODAL (SAME AS REORDER GUIDE)
          ====================================================================== */}
      <SearchInventoryItemsModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        initialSearch={searchQuery}
        onAddItems={handleAddItemsFromModal}
      />

      {/* ======================================================================
          MODAL 2: PREVIEW LOST GOODS MODAL (CLONED FROM OMEGA LIVE)
          ====================================================================== */}
      {isPreviewModalOpen && (
        <PreviewLostGoodsModal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          vouchers={vouchers}
          onOpenVoucher={handleOpenVoucherFromPreview}
          onDeleteVoucher={(ser) => {
            setVouchers((prev) => prev.filter((v) => v.ser !== ser));
            showToast(`Voucher #${ser} deleted.`, 'info');
          }}
          onPostVoucher={(ser) => {
            setVouchers((prev) =>
              prev.map((v) => (v.ser === ser ? { ...v, posted: -1 } : v))
            );
            showToast(`Voucher #${ser} posted.`, 'success');
          }}
        />
      )}

      {/* ======================================================================
          MODAL 3: ADD LOCATION MODAL
          ====================================================================== */}
      {isAddLocationModalOpen && (
        <AddLocationModal
          isOpen={isAddLocationModalOpen}
          onClose={() => setIsAddLocationModalOpen(false)}
          onAdd={(newLocName) => {
            const nextId = Math.max(...locations.map((l) => l.id), 0) + 1;
            const newLoc = { id: nextId, name: newLocName };
            setLocations([...locations, newLoc]);
            setSelectedLocationId(nextId);
            setIsAddLocationModalOpen(false);
            showToast(`Location "${newLocName}" added successfully.`);
          }}
        />
      )}

      {/* ======================================================================
          MODAL 4: ADD REASON MODAL
          ====================================================================== */}
      {isAddReasonModalOpen && (
        <AddReasonModal
          isOpen={isAddReasonModalOpen}
          onClose={() => setIsAddReasonModalOpen(false)}
          onAdd={(newReasonName) => {
            const nextId = Math.max(...reasons.map((r) => r.id), 0) + 1;
            const newR = { id: nextId, name: newReasonName };
            setReasons([...reasons, newR]);
            setSelectedReasonId(nextId);
            setIsAddReasonModalOpen(false);
            showToast(`Reason "${newReasonName}" added successfully.`);
          }}
        />
      )}

      {/* ======================================================================
          MODAL 5: IMPORT CSV MODAL
          ====================================================================== */}
      {isImportCsvModalOpen && (
        <ImportCsvModal
          isOpen={isImportCsvModalOpen}
          onClose={() => setIsImportCsvModalOpen(false)}
          onImport={(importedItems) => {
            setItems((prev) => [...prev, ...importedItems]);
            setIsImportCsvModalOpen(false);
            showToast(`Successfully imported ${importedItems.length} item(s) from CSV.`);
          }}
        />
      )}

      {/* ======================================================================
          MODAL 6: PRINT VOUCHER MODAL
          ====================================================================== */}
      {isPrintModalOpen && (
        <PrintVoucherModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          branch={branches.find((b) => b.id === selectedBranchId)?.name || 'Zeit w zaytoun ljanoub'}
          location={locations.find((l) => l.id === selectedLocationId)?.name || 'Showroom'}
          reason={reasons.find((r) => r.id === selectedReasonId)?.name || 'Product Expiry'}
          date={dateValue}
          employee={employeeName}
          voucherNumber={activeVoucher?.ser || 133}
          items={items}
          totalSum={totalCostSum}
        />
      )}
    </div>
  );
}

// ============================================================================
// SUB-MODAL 1: PREVIEW LOST GOODS MODAL (OMEGA CLONE)
// ============================================================================

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  vouchers: LostGoodsVoucher[];
  onOpenVoucher: (v: LostGoodsVoucher) => void;
  onDeleteVoucher: (ser: number) => void;
  onPostVoucher: (ser: number) => void;
}

function PreviewLostGoodsModal({
  isOpen,
  onClose,
  vouchers,
  onOpenVoucher,
  onDeleteVoucher,
  onPostVoucher
}: PreviewModalProps) {
  const [filterSearch, setFilterSearch] = useState('');
  const [filterBranch, setFilterBranch] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, POSTED, UNPOSTED
  const [postAllEnabled, setPostAllEnabled] = useState(false);
  const [allDatesChecked, setAllDatesChecked] = useState(true);
  const [selectedSers, setSelectedSers] = useState<Record<number, boolean>>({});

  if (!isOpen) return null;

  const filtered = vouchers.filter((v) => {
    if (filterBranch !== 'ALL' && v.branchName !== filterBranch) return false;
    if (filterStatus === 'POSTED' && v.posted !== -1) return false;
    if (filterStatus === 'UNPOSTED' && v.posted === -1) return false;

    if (filterSearch.trim()) {
      const q = filterSearch.toLowerCase();
      const matchSer = String(v.ser).includes(q);
      const matchLoc = v.locationDescription.toLowerCase().includes(q);
      const matchEmp = v.employee.toLowerCase().includes(q);
      const matchItem = v.items.some((it) => it.description.toLowerCase().includes(q));
      if (!matchSer && !matchLoc && !matchEmp && !matchItem) return false;
    }

    return true;
  });

  const toggleSelect = (ser: number) => {
    setSelectedSers((prev) => ({ ...prev, [ser]: !prev[ser] }));
  };

  const handlePostSelected = () => {
    const sersToPost = Object.keys(selectedSers)
      .filter((k) => selectedSers[Number(k)])
      .map(Number);
    sersToPost.forEach((ser) => onPostVoucher(ser));
    setSelectedSers({});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-[#f8fafc] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Preview Lost Goods Inventory Items
            </h3>
            <p className="text-xs text-slate-500">
              Preview Lost Goods Inventory Item records from Omega ERP database
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 text-slate-400 hover:text-slate-600 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search */}
            <div>
              <input
                type="search"
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                placeholder="Search..."
                className="w-full h-8 px-3 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              />
            </div>

            {/* Branch */}
            <div>
              <select
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
                className="w-full h-8 px-2 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-400"
              >
                <option value="ALL">Select branch (All)</option>
                <option value="Zeit w zaytoun ljanoub">Zeit w zaytoun ljanoub</option>
                <option value="Choueifat Main Facility">Choueifat Main Facility</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full h-8 px-2 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-400"
              >
                <option value="ALL">Select status (All)</option>
                <option value="POSTED">Posted</option>
                <option value="UNPOSTED">Unposted (Draft)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 gap-3 pt-1">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={postAllEnabled}
                  onChange={(e) => setPostAllEnabled(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Multiple Posting</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allDatesChecked}
                  onChange={(e) => setAllDatesChecked(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>All Dates</span>
              </label>
            </div>

            {postAllEnabled && (
              <button
                type="button"
                onClick={handlePostSelected}
                className="h-7 px-3 bg-[#27ae60] hover:bg-[#219653] text-white rounded text-xs font-medium flex items-center gap-1"
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Post Selected Transactions</span>
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold">
                {postAllEnabled && <th className="py-2 px-2 w-8"></th>}
                <th className="py-2 px-3 w-16">#</th>
                <th className="py-2 px-3">Branch</th>
                <th className="py-2 px-3">Requisitions (Date)</th>
                <th className="py-2 px-3">Employee</th>
                <th className="py-2 px-3">Location</th>
                <th className="py-2 px-3">Reason</th>
                <th className="py-2 px-3 text-center">Posted</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((v) => (
                <tr key={v.ser} className="hover:bg-blue-50/40 transition-colors">
                  {postAllEnabled && (
                    <td className="py-2 px-2">
                      {v.posted !== -1 && (
                        <input
                          type="checkbox"
                          checked={!!selectedSers[v.ser]}
                          onChange={() => toggleSelect(v.ser)}
                          className="rounded text-blue-600"
                        />
                      )}
                    </td>
                  )}
                  <td className="py-2 px-3 font-mono font-bold text-slate-800">
                    {v.ser}
                  </td>
                  <td className="py-2 px-3 text-slate-600">{v.branchName}</td>
                  <td className="py-2 px-3 text-slate-700 font-mono">
                    {v.date}
                    <span className="text-slate-400 text-[10px] ml-1">#{v.waistId}</span>
                  </td>
                  <td className="py-2 px-3 text-slate-600">{v.employee}</td>
                  <td className="py-2 px-3 text-slate-700 font-medium">
                    {v.locationDescription}
                  </td>
                  <td className="py-2 px-3 text-slate-600">{v.reasonDesc}</td>
                  <td className="py-2 px-3 text-center">
                    {v.posted === -1 ? (
                      <span className="inline-block px-2 py-0.5 text-[10px] font-semibold text-emerald-800 bg-emerald-100 rounded-full">
                        Posted
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 text-[10px] font-semibold text-amber-800 bg-amber-100 rounded-full">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Open / Edit */}
                      <button
                        onClick={() => onOpenVoucher(v)}
                        title="Open Voucher"
                        className="w-6 h-6 bg-[#337ab7] hover:bg-[#286090] text-white rounded flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>

                      {/* Post */}
                      {v.posted !== -1 && (
                        <button
                          onClick={() => onPostVoucher(v.ser)}
                          title="Post Voucher"
                          className="w-6 h-6 bg-[#27ae60] hover:bg-[#219653] text-white rounded flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Tag className="w-3 h-3" />
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() => onDeleteVoucher(v.ser)}
                        title="Delete Voucher"
                        className="w-6 h-6 bg-rose-500 hover:bg-rose-600 text-white rounded flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filtered.length} vouchers</span>
          <button
            onClick={onClose}
            className="h-8 px-4 bg-slate-300 hover:bg-slate-400 text-slate-800 rounded font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-MODAL 2: ADD LOCATION MODAL
// ============================================================================

interface AddLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
}

function AddLocationModal({ isOpen, onClose, onAdd }: AddLocationModalProps) {
  const [locationName, setLocationName] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="bg-white w-full max-w-sm rounded-lg shadow-xl overflow-hidden border border-slate-200">
        <div className="px-4 py-3 bg-[#f8fafc] border-b border-slate-200 flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800">Add Inventory Location</h4>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Location Description
            </label>
            <input
              type="text"
              autoFocus
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g. Refrigerated Room 2"
              className="w-full h-8 px-3 text-xs border border-slate-300 rounded focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
          </div>
        </div>
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3 text-xs text-slate-600 hover:bg-slate-200 rounded font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!locationName.trim()}
            onClick={() => onAdd(locationName.trim())}
            className="h-8 px-4 text-xs bg-[#2c3e50] hover:bg-[#1a252f] disabled:opacity-50 text-white rounded font-medium"
          >
            Save Location
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-MODAL 3: ADD REASON MODAL
// ============================================================================

interface AddReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
}

function AddReasonModal({ isOpen, onClose, onAdd }: AddReasonModalProps) {
  const [reasonName, setReasonName] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="bg-white w-full max-w-sm rounded-lg shadow-xl overflow-hidden border border-slate-200">
        <div className="px-4 py-3 bg-[#f8fafc] border-b border-slate-200 flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800">Add Lost Goods Reason</h4>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Reason Description
            </label>
            <input
              type="text"
              autoFocus
              value={reasonName}
              onChange={(e) => setReasonName(e.target.value)}
              placeholder="e.g. Temperature Spoilage"
              className="w-full h-8 px-3 text-xs border border-slate-300 rounded focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
          </div>
        </div>
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3 text-xs text-slate-600 hover:bg-slate-200 rounded font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!reasonName.trim()}
            onClick={() => onAdd(reasonName.trim())}
            className="h-8 px-4 text-xs bg-[#2c3e50] hover:bg-[#1a252f] disabled:opacity-50 text-white rounded font-medium"
          >
            Save Reason
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-MODAL 4: IMPORT CSV MODAL (MATCHING OMEGA #importWastage)
// ============================================================================

interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: LostGoodsItem[]) => void;
}

function ImportCsvModal({ isOpen, onClose, onImport }: ImportCsvModalProps) {
  const [fileName, setFileName] = useState('');
  const [csvContent, setCsvContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const header = 'PRODUCTCODE,QUANTITY,UNITCOST,REMARK\n';
    const sample =
      'دونات شوكولا,1,52200,Product Expiry\nمرطبان شطة حارة 650غ,2,102665,Broken\nصندوق زعتر أحمر حلبي 300غ*12,5,1422000,Damaged\n';
    const blob = new Blob([header + sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'TemplateWastageInvItems.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setCsvContent((ev.target?.result as string) || '');
      };
      reader.readAsText(file);
    }
  };

  const handleParseAndUpload = () => {
    if (!csvContent) return;
    setIsProcessing(true);

    try {
      const lines = csvContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
      const parsedItems: LostGoodsItem[] = [];

      // skip header if line 0 contains letters
      const startIndex = lines[0].toLowerCase().includes('quantity') || lines[0].toLowerCase().includes('product') ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const parts = lines[i].split(',');
        if (parts.length >= 2) {
          const code = parts[0].trim();
          const qty = parseFloat(parts[1]) || 1;
          const cost = parts[2] ? parseFloat(parts[2]) : 50000;
          const remark = parts[3] ? parts[3].trim() : 'Imported via CSV';

          parsedItems.push({
            id: `CSV-${Date.now()}-${i}`,
            code: code,
            description: code,
            qty: qty,
            unitCost: cost,
            totalCost: qty * cost,
            unit: 'Piece',
            remark: remark
          });
        }
      }

      setTimeout(() => {
        setIsProcessing(false);
        onImport(parsedItems);
      }, 400);
    } catch {
      setIsProcessing(false);
      alert('Error parsing CSV file. Please check format.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl overflow-hidden border border-slate-200">
        <div className="px-5 py-3.5 bg-[#f8fafc] border-b border-slate-200 flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-800">Import Wastage</h4>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-center">
          <div className="text-right">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="text-xs text-[#337ab7] hover:underline flex items-center gap-1 ml-auto font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Template</span>
            </button>
          </div>

          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 hover:bg-slate-50 transition-colors">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <div className="text-xs text-slate-600 font-medium mb-2">
              {fileName || 'Click to select or drop CSV file here'}
            </div>
            <label className="inline-block px-4 py-2 bg-[#2c3e50] hover:bg-[#1a252f] text-white text-xs font-semibold rounded cursor-pointer transition-colors">
              <span>Browse CSV</span>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>

          <p className="text-[11px] text-slate-400">
            Supported columns: PRODUCTCODE, QUANTITY, UNITCOST, REMARK
          </p>
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-4 text-xs text-slate-600 hover:bg-slate-200 rounded font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!csvContent || isProcessing}
            onClick={handleParseAndUpload}
            className="h-8 px-4 text-xs bg-[#27ae60] hover:bg-[#219653] disabled:opacity-50 text-white rounded font-medium flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isProcessing ? 'Importing...' : 'Upload & Import'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-MODAL 5: PRINT VOUCHER MODAL
// ============================================================================

interface PrintVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: string;
  location: string;
  reason: string;
  date: string;
  employee: string;
  voucherNumber: number;
  items: LostGoodsItem[];
  totalSum: number;
}

function PrintVoucherModal({
  isOpen,
  onClose,
  branch,
  location,
  reason,
  date,
  employee,
  voucherNumber,
  items,
  totalSum
}: PrintVoucherModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-2xl overflow-hidden border border-slate-300 flex flex-col max-h-[92vh]">
        <div className="px-5 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between print:hidden">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print Preview - Lost Goods Voucher #{voucherNumber}</span>
          </h4>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="h-7 px-3 bg-[#2c3e50] hover:bg-[#1a252f] text-white text-xs font-medium rounded flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Now</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="p-8 overflow-y-auto flex-1 font-serif text-slate-900 bg-white">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-wider uppercase font-sans">
                VANGUARD ERP
              </h1>
              <p className="text-xs text-slate-500 font-sans">
                Inventory & Lost Goods Adjustment Note
              </p>
            </div>
            <div className="text-right font-sans">
              <div className="text-base font-bold text-slate-800">
                LOST GOODS VOUCHER
              </div>
              <div className="text-sm font-mono text-slate-600">
                #{voucherNumber}
              </div>
              <div className="text-xs text-slate-500">{date}</div>
            </div>
          </div>

          {/* Meta Information */}
          <div className="grid grid-cols-2 gap-4 font-sans text-xs mb-6 border p-3 rounded bg-slate-50">
            <div>
              <span className="font-semibold text-slate-500">Branch: </span>
              <span className="font-bold text-slate-800">{branch}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-500">Location: </span>
              <span className="font-bold text-slate-800">{location}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-500">Reported By: </span>
              <span className="font-bold text-slate-800">{employee}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-500">Reason: </span>
              <span className="font-bold text-slate-800">{reason}</span>
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-left font-sans text-xs border-collapse mb-6">
            <thead>
              <tr className="border-b-2 border-slate-800 bg-slate-100 font-bold">
                <th className="py-2 px-2">#</th>
                <th className="py-2 px-2">Description</th>
                <th className="py-2 px-2 text-right">Qty</th>
                <th className="py-2 px-2">Unit</th>
                <th className="py-2 px-2 text-right">Unit Cost (LBP)</th>
                <th className="py-2 px-2 text-right">Total Cost (LBP)</th>
                <th className="py-2 px-2">Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.map((it, idx) => (
                <tr key={it.id}>
                  <td className="py-2 px-2 font-mono text-slate-500">{idx + 1}</td>
                  <td className="py-2 px-2 font-medium">{it.description}</td>
                  <td className="py-2 px-2 text-right font-mono font-bold">{it.qty}</td>
                  <td className="py-2 px-2">{it.unit}</td>
                  <td className="py-2 px-2 text-right font-mono">
                    {it.unitCost.toLocaleString()}
                  </td>
                  <td className="py-2 px-2 text-right font-mono font-bold">
                    {it.totalCost.toLocaleString()}
                  </td>
                  <td className="py-2 px-2 text-slate-600">{it.remark}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-800 font-bold text-sm bg-slate-50">
                <td colSpan={2} className="py-2.5 px-2">
                  Total Lost Goods
                </td>
                <td className="py-2.5 px-2 text-right font-mono">
                  {items.reduce((acc, it) => acc + it.qty, 0)}
                </td>
                <td></td>
                <td></td>
                <td className="py-2.5 px-2 text-right font-mono text-emerald-800 font-bold">
                  {totalSum.toLocaleString()} LBP
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-6 pt-12 text-center font-sans text-xs">
            <div className="border-t border-slate-400 pt-2">
              <p className="font-semibold">Prepared By</p>
              <p className="text-slate-500 mt-1">{employee}</p>
            </div>
            <div className="border-t border-slate-400 pt-2">
              <p className="font-semibold">Warehouse Supervisor</p>
              <p className="text-slate-500 mt-1">Signature</p>
            </div>
            <div className="border-t border-slate-400 pt-2">
              <p className="font-semibold">Internal Audit / Approval</p>
              <p className="text-slate-500 mt-1">Signature</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
