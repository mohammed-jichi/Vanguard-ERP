'use client';

import React, { useState, useMemo } from 'react';
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
  RotateCcw,
  Check,
  Tag,
  Archive,
  History,
  Undo,
  Upload,
  MessageSquare,
  Barcode
} from 'lucide-react';
import SearchInventoryItemsModal, { SelectedTransferItemPayload } from '@/components/SearchInventoryItemsModal';
import { OMEGA_ITEM_BRANDS } from '@/lib/omegaProductsData';

export interface TransferItem {
  id: string;
  code: string;
  description: string;
  barcode: string;
  qtyTransfered: number;
  qtyReceived: number;
  unit: string;
  unitCostUsd: number;
  avgCostUsd: number;
  qtyOnHand: number;
  remark: string;
  expDate: string;
  showRemark: boolean;
  serials: string[];
}

export interface SavedTransferRecord {
  id: string;
  reqNo: string;
  reqDate: string;
  branchSource: string;
  locSource: string;
  branchDest: string;
  locDest: string;
  status: 'POSTED' | 'UNPOSTED' | 'IN_TRANSIT';
  posted: boolean;
  fromReqNo?: string;
  prNumber?: string;
  items: TransferItem[];
  totalCostUsd: number;
  selected?: boolean;
}

export interface RecurringTransfer {
  id: string;
  date: string;
  description: string;
  src: string;
  dest: string;
}

const INITIAL_TRANSFER_ITEMS: TransferItem[] = [
  {
    id: 'TI-1',
    code: 'EVOO-B-750ML',
    description: 'Extra Virgin Olive Oil 750ml Dark Glass',
    barcode: '5280010920012',
    qtyTransfered: 120,
    qtyReceived: 120,
    unit: 'Bottle',
    unitCostUsd: 7.80,
    avgCostUsd: 7.80,
    qtyOnHand: 1420,
    remark: 'Batch 2026-A1 Sealed pallet',
    expDate: '2027-12-31',
    showRemark: false,
    serials: ['EVOO-SN-8901', 'EVOO-SN-8902']
  },
  {
    id: 'TI-2',
    code: 'SOAP-BAR-150G',
    description: 'Pure Olive Oil & Laurel Aleppo-Style Soap Bar',
    barcode: '5280010970017',
    qtyTransfered: 250,
    qtyReceived: 250,
    unit: 'Bar',
    unitCostUsd: 1.15,
    avgCostUsd: 1.15,
    qtyOnHand: 3200,
    remark: '',
    expDate: '2028-06-30',
    showRemark: false,
    serials: []
  },
  {
    id: 'TI-3',
    code: 'OLV-KAL-500G',
    description: 'Cured Kalamata-Style Black Olives in Brine 500g',
    barcode: '5280010940027',
    qtyTransfered: 80,
    qtyReceived: 0,
    unit: 'Jar',
    unitCostUsd: 3.40,
    avgCostUsd: 3.40,
    qtyOnHand: 890,
    remark: 'Keep upright, sealed containers',
    expDate: '2027-04-15',
    showRemark: false,
    serials: []
  }
];

const INITIAL_SAVED_TRANSFERS: SavedTransferRecord[] = [
  {
    id: 'TRN-201',
    reqNo: 'REQ-2026-201',
    reqDate: '2026-09-05',
    branchSource: 'Main Branch',
    locSource: 'Choueifat Main Facility',
    branchDest: 'Main Branch',
    locDest: 'Choueifat Main Facility',
    status: 'POSTED',
    posted: true,
    prNumber: 'PR-890',
    items: [
      {
        id: 'TI-201-1',
        code: 'EVOO-B-750ML',
        description: 'Extra Virgin Olive Oil 750ml Dark Glass',
        barcode: '5280010920012',
        qtyTransfered: 600,
        qtyReceived: 600,
        unit: 'Bottle',
        unitCostUsd: 7.80,
        avgCostUsd: 7.80,
        qtyOnHand: 1420,
        remark: '',
        expDate: '2027-12-31',
        showRemark: false,
        serials: []
      }
    ],
    totalCostUsd: 4680.00
  },
  {
    id: 'TRN-202',
    reqNo: 'REQ-2026-202',
    reqDate: '2026-09-06',
    branchSource: 'Main Branch',
    locSource: 'Choueifat Main Facility',
    branchDest: 'Main Branch',
    locDest: 'Choueifat Main Facility',
    status: 'POSTED',
    posted: true,
    fromReqNo: 'REQ-2026-201',
    items: [
      {
        id: 'TI-202-1',
        code: 'SOAP-BAR-150G',
        description: 'Pure Olive Oil & Laurel Aleppo-Style Soap Bar',
        barcode: '5280010970017',
        qtyTransfered: 300,
        qtyReceived: 300,
        unit: 'Bar',
        unitCostUsd: 1.15,
        avgCostUsd: 1.15,
        qtyOnHand: 3200,
        remark: '',
        expDate: '2028-06-30',
        showRemark: false,
        serials: []
      }
    ],
    totalCostUsd: 345.00
  },
  {
    id: 'TRN-203',
    reqNo: 'REQ-2026-203',
    reqDate: '2026-09-09',
    branchSource: 'Main Branch',
    locSource: 'Choueifat Main Facility',
    branchDest: 'Main Branch',
    locDest: 'Choueifat Main Facility',
    status: 'IN_TRANSIT',
    posted: false,
    prNumber: 'PR-904',
    items: [
      {
        id: 'TI-203-1',
        code: 'OLV-KAL-500G',
        description: 'Cured Kalamata-Style Black Olives in Brine 500g',
        barcode: '5280010940027',
        qtyTransfered: 150,
        qtyReceived: 0,
        unit: 'Jar',
        unitCostUsd: 3.40,
        avgCostUsd: 3.40,
        qtyOnHand: 890,
        remark: 'En route via Truck #14',
        expDate: '2027-04-15',
        showRemark: false,
        serials: []
      }
    ],
    totalCostUsd: 510.00
  }
];

const INITIAL_RECURRING: RecurringTransfer[] = [
  {
    id: 'REC-1',
    date: '2026-09-01',
    description: 'Bi-Weekly Central EVOO Replenishment',
    src: 'Main Branch',
    dest: 'Main Branch'
  },
  {
    id: 'REC-2',
    date: '2026-09-03',
    description: 'Weekly Retail Soap & Pantry Restock',
    src: 'Main Branch',
    dest: 'Main Branch'
  }
];

export default function TransfersView() {
  // Currency Toggle (LBP / USD)
  const [activeCurrency, setActiveCurrency] = useState<'USD' | 'LBP'>('USD');
  const currSymbol = activeCurrency === 'USD' ? '$' : 'LBP';
  const exchangeRate = 89500;

  const formatMoney = (usdVal: number) => {
    if (activeCurrency === 'LBP') {
      return `${Math.round(usdVal * exchangeRate).toLocaleString()} LBP`;
    }
    return `$${usdVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Form State
  const [transferDate, setTransferDate] = useState('2026-09-10');
  const [transferNumber, setTransferNumber] = useState<string>(() => 'TRN-2026-0204');
  const [fromReqNo, setFromReqNo] = useState('');
  const [isReversed, setIsReversed] = useState(false);
  const [prNumber, setPrNumber] = useState('');
  
  const [fromBranch, setFromBranch] = useState('Main Branch');
  const [fromLocation, setFromLocation] = useState('Choueifat Main Facility');
  const [toBrand, setToBrand] = useState('زيت و زيتون الجنوب');
  const [toBranch, setToBranch] = useState('Main Branch');
  const [toLocation, setToLocation] = useState('Choueifat Main Facility');
  const [isInterBrand, setIsInterBrand] = useState(false);

  // Table items & details
  const [items, setItems] = useState<TransferItem[]>(INITIAL_TRANSFER_ITEMS);
  const [searchItemVal, setSearchItemVal] = useState('');
  const [showBarcode, setShowBarcode] = useState(true);
  const [hideCost, setHideCost] = useState(false);
  const [previewReq, setPreviewReq] = useState(false); // whether viewing an existing saved transfer

  // Modals & Sub-Reports
  const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false);
  const [requisitionReportView, setRequisitionReportView] = useState(false);
  const [reportExportType, setReportExportType] = useState('html');
  const [reportShowCost, setReportShowCost] = useState(true);

  // Preview Search Modal (#previewSearchModel)
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [savedTransfers, setSavedTransfers] = useState<SavedTransferRecord[]>(INITIAL_SAVED_TRANSFERS);
  const [previewSearchText, setPreviewSearchText] = useState('');
  const [previewBranchFilter, setPreviewBranchFilter] = useState('ALL');
  const [previewStatusFilter, setPreviewStatusFilter] = useState('ALL');
  const [previewItemTypeFilter, setPreviewItemTypeFilter] = useState('ALL');
  const [multiplePosting, setMultiplePosting] = useState(false);
  const [allDates, setAllDates] = useState(true);
  const [fromDate, setFromDate] = useState('2026-09-01');
  const [toDate, setToDate] = useState('2026-09-10');
  const [fromBranchFilter, setFromBranchFilter] = useState('ALL');
  const [toBranchFilter, setToBranchFilter] = useState('ALL');

  // Other Modals
  const [storeModalOpen, setStoreModalOpen] = useState(false);
  const [storeDescription, setStoreDescription] = useState('');
  const [recallModalOpen, setRecallModalOpen] = useState(false);
  const [recurringList, setRecurringList] = useState<RecurringTransfer[]>(INITIAL_RECURRING);
  const [recallSearchText, setRecallSearchText] = useState('');
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [addLocationModalOpen, setAddLocationModalOpen] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationCode, setNewLocationCode] = useState('');
  const [newLocationBranch, setNewLocationBranch] = useState('Main Branch');

  // Serial Numbers Modal (#itemsSerialNumbersModal)
  const [serialModalOpen, setSerialModalOpen] = useState(false);
  const [activeSerialItem, setActiveSerialItem] = useState<TransferItem | null>(null);
  const [availableSerials, setAvailableSerials] = useState<string[]>([
    'EVOO-SN-8903',
    'EVOO-SN-8904',
    'EVOO-SN-8905',
    'EVOO-SN-8906'
  ]);
  const [selectedSerials, setSelectedSerials] = useState<string[]>([]);

  // Search Inventory Items Modal State
  const [isSearchInventoryModalOpen, setIsSearchInventoryModalOpen] = useState(false);
  const [modalSearchInitial, setModalSearchInitial] = useState('');

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Calculations
  const totalItemsCount = items.length;
  const totalQtyTransfered = items.reduce((acc, it) => acc + (Number(it.qtyTransfered) || 0), 0);
  const totalQtyReceived = items.reduce((acc, it) => acc + (Number(it.qtyReceived) || 0), 0);
  const totalUnitCostUsd = items.reduce((acc, it) => acc + (Number(it.qtyTransfered) || 0) * it.unitCostUsd, 0);
  const totalAvgCostUsd = items.reduce((acc, it) => acc + (Number(it.qtyTransfered) || 0) * it.avgCostUsd, 0);

  // New Transfer Form Reset
  const handleNewTransfer = () => {
    setPreviewReq(false);
    const nextSeq = Math.floor(205 + Math.random() * 800);
    setTransferNumber(`TRN-2026-${String(nextSeq).padStart(4, '0')}`);
    setTransferDate(new Date().toISOString().split('T')[0]);
    setFromReqNo('');
    setIsReversed(false);
    setPrNumber('');
    setItems([
      {
        id: 'TI-NEW-1',
        code: 'EVOO-B-750ML',
        description: 'Extra Virgin Olive Oil 750ml Dark Glass',
        barcode: '5280010920012',
        qtyTransfered: 50,
        qtyReceived: 0,
        unit: 'Bottle',
        unitCostUsd: 7.80,
        avgCostUsd: 7.80,
        qtyOnHand: 1420,
        remark: '',
        expDate: '2027-12-31',
        showRemark: false,
        serials: []
      }
    ]);
    showToast('New Transfer initialized.');
  };

  // Inline Item Update
  const updateItem = (id: string, field: keyof TransferItem, value: any) => {
    setItems(items.map(it => it.id === id ? { ...it, [field]: value } : it));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(it => it.id !== id));
    showToast('Item removed from transfer.');
  };

  const handleOpenSearchModal = (initialQuery?: string) => {
    setModalSearchInitial(initialQuery !== undefined ? initialQuery : searchItemVal);
    setIsSearchInventoryModalOpen(true);
  };

  const handleAddItemsFromModal = (selectedItems: SelectedTransferItemPayload[]) => {
    const newItems: TransferItem[] = selectedItems.map((sel) => ({
      id: `TI-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      code: sel.code,
      description: sel.description,
      barcode: sel.barcode || `52800109${Math.floor(10000 + Math.random() * 90000)}`,
      qtyTransfered: sel.qtyTransfered,
      qtyReceived: 0,
      unit: sel.unit,
      unitCostUsd: sel.unitCostUsd,
      avgCostUsd: sel.avgCostUsd,
      qtyOnHand: sel.qtyOnHand,
      remark: sel.remark,
      expDate: '2027-12-31',
      showRemark: !!sel.remark,
      serials: []
    }));

    setItems((prev) => [...prev, ...newItems]);
    setSearchItemVal('');
    showToast(`Added ${newItems.length} item(s) to Cargo Manifest.`);
  };

  const addItemFromSearch = () => {
    handleOpenSearchModal(searchItemVal);
  };

  // Actions Dropdown Commands
  const handleReverseTransfer = () => {
    setIsReversed(!isReversed);
    showToast(isReversed ? 'Transfer reversal cleared' : 'Transfer flagged as REVERSED');
    setIsActionsDropdownOpen(false);
  };

  const handleOpenReport = () => {
    setRequisitionReportView(true);
    setIsActionsDropdownOpen(false);
  };

  // Save / Post Actions
  const handleSaveTransfer = (postImmediately: boolean) => {
    const statusVal: 'POSTED' | 'UNPOSTED' = postImmediately ? 'POSTED' : 'UNPOSTED';
    const newRecord: SavedTransferRecord = {
      id: `TRN-${Date.now()}`,
      reqNo: transferNumber,
      reqDate: transferDate,
      branchSource: fromBranch,
      locSource: fromLocation,
      branchDest: toBranch,
      locDest: toLocation,
      status: statusVal,
      posted: postImmediately,
      fromReqNo: fromReqNo || undefined,
      prNumber: prNumber || undefined,
      items: [...items],
      totalCostUsd: totalUnitCostUsd
    };

    setSavedTransfers([newRecord, ...savedTransfers]);
    setPreviewReq(true);
    showToast(postImmediately ? `Transfer ${transferNumber} Saved & Posted successfully!` : `Transfer ${transferNumber} Saved (Draft).`);
  };

  const handlePostCurrentTransfer = () => {
    setSavedTransfers(savedTransfers.map(tr => tr.reqNo === transferNumber ? { ...tr, status: 'POSTED', posted: true } : tr));
    showToast(`Transfer ${transferNumber} Posted!`);
  };

  const handleDeleteCurrentTransfer = () => {
    setSavedTransfers(savedTransfers.filter(tr => tr.reqNo !== transferNumber));
    handleNewTransfer();
    showToast(`Transfer ${transferNumber} Deleted.`);
  };

  // Load Transfer from Preview modal
  const handleLoadTransfer = (tr: SavedTransferRecord) => {
    setPreviewReq(true);
    setTransferNumber(tr.reqNo);
    setTransferDate(tr.reqDate);
    setFromBranch(tr.branchSource);
    setFromLocation(tr.locSource);
    setToBranch(tr.branchDest);
    setToLocation(tr.locDest);
    setFromReqNo(tr.fromReqNo || '');
    setPrNumber(tr.prNumber || '');
    setItems(tr.items && tr.items.length > 0 ? tr.items : INITIAL_TRANSFER_ITEMS);
    setPreviewModalOpen(false);
    showToast(`Loaded Transfer ${tr.reqNo}`);
  };

  // Post Transfer from Preview Modal Table
  const handlePostFromPreview = (trId: string) => {
    setSavedTransfers(savedTransfers.map(tr => tr.id === trId ? { ...tr, status: 'POSTED', posted: true } : tr));
    showToast('Transfer posted.');
  };

  // Delete Transfer from Preview Modal Table
  const handleDeleteFromPreview = (trId: string) => {
    setSavedTransfers(savedTransfers.filter(tr => tr.id !== trId));
    showToast('Transfer deleted.');
  };

  // Delete All Unposted Transfers
  const handleDeleteAllUnposted = () => {
    const unpostedCount = savedTransfers.filter(tr => !tr.posted).length;
    if (unpostedCount === 0) {
      showToast('No unposted transfers found.');
      return;
    }
    setSavedTransfers(savedTransfers.filter(tr => tr.posted));
    showToast(`Deleted ${unpostedCount} unposted transfer(s).`);
  };

  // Post Selected in Multiple Posting Mode
  const handlePostSelectedTransactions = () => {
    const selectedCount = savedTransfers.filter(tr => tr.selected && !tr.posted).length;
    if (selectedCount === 0) {
      showToast('No unposted transfers selected.');
      return;
    }
    setSavedTransfers(savedTransfers.map(tr => tr.selected ? { ...tr, status: 'POSTED', posted: true, selected: false } : tr));
    showToast(`Posted ${selectedCount} selected transfer(s).`);
  };

  // Filtered Saved Transfers in Preview Modal
  const filteredSavedTransfers = useMemo(() => {
    return savedTransfers.filter(tr => {
      const matchSearch =
        tr.reqNo.toLowerCase().includes(previewSearchText.toLowerCase()) ||
        tr.branchSource.toLowerCase().includes(previewSearchText.toLowerCase()) ||
        tr.branchDest.toLowerCase().includes(previewSearchText.toLowerCase());

      const matchBranch = previewBranchFilter === 'ALL' || tr.branchSource === previewBranchFilter || tr.branchDest === previewBranchFilter;
      const matchFrom = fromBranchFilter === 'ALL' || tr.branchSource === fromBranchFilter;
      const matchTo = toBranchFilter === 'ALL' || tr.branchDest === toBranchFilter;

      const matchStatus =
        previewStatusFilter === 'ALL' ||
        (previewStatusFilter === 'POSTED' && tr.posted) ||
        (previewStatusFilter === 'UNPOSTED' && !tr.posted) ||
        (previewStatusFilter === 'IN_TRANSIT' && tr.status === 'IN_TRANSIT');

      const matchDate = allDates || (tr.reqDate >= fromDate && tr.reqDate <= toDate);

      return matchSearch && matchBranch && matchFrom && matchTo && matchStatus && matchDate;
    });
  }, [savedTransfers, previewSearchText, previewBranchFilter, fromBranchFilter, toBranchFilter, previewStatusFilter, allDates, fromDate, toDate]);

  // Serial Numbers modal handlers
  const openSerialModal = (item: TransferItem) => {
    setActiveSerialItem(item);
    setSelectedSerials([...(item.serials || [])]);
    setSerialModalOpen(true);
  };

  const handleAddSerial = (sn: string) => {
    setAvailableSerials(availableSerials.filter(s => s !== sn));
    setSelectedSerials([...selectedSerials, sn]);
  };

  const handleRemoveSerial = (sn: string) => {
    setSelectedSerials(selectedSerials.filter(s => s !== sn));
    setAvailableSerials([...availableSerials, sn]);
  };

  const handleSaveSerials = () => {
    if (activeSerialItem) {
      updateItem(activeSerialItem.id, 'serials', selectedSerials);
      showToast(`Assigned ${selectedSerials.length} serials to ${activeSerialItem.code}`);
    }
    setSerialModalOpen(false);
  };

  // Add Location quick handler
  const handleSaveLocation = () => {
    if (!newLocationName.trim()) return;
    setFromLocation(newLocationName.trim());
    setAddLocationModalOpen(false);
    setNewLocationName('');
    showToast(`Added location: ${newLocationName}`);
  };

  // Store Requisition handler
  const handleSaveStoredRequisition = () => {
    if (!storeDescription.trim()) return;
    const newRec: RecurringTransfer = {
      id: `REC-${Date.now()}`,
      date: transferDate,
      description: storeDescription.trim(),
      src: fromBranch,
      dest: toBranch
    };
    setRecurringList([newRec, ...recurringList]);
    setStoreModalOpen(false);
    setStoreDescription('');
    showToast('Transfer template stored for recurring recall.');
  };

  // Import Items handler
  const handleStartImport = () => {
    setImportProgress(25);
    setTimeout(() => setImportProgress(70), 300);
    setTimeout(() => {
      setImportProgress(100);
      const importedItem: TransferItem = {
        id: `TI-IMP-${Date.now()}`,
        code: 'FIG-JAM-370G',
        description: 'Wild Mountain Fig Jam with Roasted Walnuts 370g',
        barcode: '5280010980031',
        qtyTransfered: 90,
        qtyReceived: 0,
        unit: 'Jar',
        unitCostUsd: 4.20,
        avgCostUsd: 4.20,
        qtyOnHand: 410,
        remark: 'Imported from Requisition CSV',
        expDate: '2027-08-31',
        showRemark: false,
        serials: []
      };
      setItems([...items, importedItem]);
      setImportModalOpen(false);
      setImportFile(null);
      setImportProgress(0);
      showToast('Imported 1 new item row from CSV!');
    }, 650);
  };

  return (
    <div className="space-y-4">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#195a96] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 animate-fade-in border border-blue-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          VIEW MODE A: AUTHENTIC TRANSFER REPORT SCREEN (requisitionReportView == true)
          ========================================================================= */}
      {requisitionReportView ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          {/* Report Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700">Format:</span>
              <select
                value={reportExportType}
                onChange={(e) => setReportExportType(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#195a96]"
              >
                <option value="html">Preview (HTML)</option>
                <option value="pdf">PDF Document</option>
                <option value="csv">CSV Spreadsheet</option>
              </select>

              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={reportShowCost}
                  onChange={(e) => setReportShowCost(e.target.checked)}
                  className="rounded text-[#195a96] focus:ring-0"
                />
                <span>Show Cost</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => showToast('Transfer Report generated fresh.')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#195a96] hover:bg-[#154676] text-white text-xs font-bold rounded-lg shadow-sm transition"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Generate</span>
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg shadow-sm transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                onClick={() => setRequisitionReportView(false)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg shadow-sm transition"
              >
                <X className="w-3.5 h-3.5" />
                <span>Close</span>
              </button>
            </div>
          </div>

          {/* Printable Report Document */}
          <div className="bg-slate-50 border border-slate-300 rounded-lg p-8 shadow-inner font-sans max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-[#195a96] pb-4">
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">VANGUARD ARTISAN FOODS SAL</h1>
                <p className="text-xs text-slate-600 font-medium">Operations Center • Inter-Branch Logistics & Inventory Transfer</p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">Commercial Registry: 1049281 • VAT: 601-829103</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded bg-[#195a96] text-white text-xs font-black tracking-wider uppercase">
                  TRANSFER NOTE
                </span>
                <p className="text-sm font-mono font-bold text-slate-800 mt-1">{transferNumber}</p>
                <p className="text-xs text-slate-500 font-mono">Date: {transferDate}</p>
              </div>
            </div>

            {/* Metadata Logistics Grid */}
            <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-lg border border-slate-200 text-xs">
              <div>
                <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">SOURCE (FROM)</p>
                <p className="font-bold text-slate-900 mt-0.5">{fromBranch}</p>
                <p className="text-slate-600 font-medium">{fromLocation}</p>
              </div>
              <div>
                <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">DESTINATION (TO)</p>
                <p className="font-bold text-slate-900 mt-0.5">{toBranch}</p>
                <p className="text-slate-600 font-medium">{toLocation}</p>
                {isInterBrand && (
                  <p className="text-[11px] font-bold text-amber-700 mt-0.5">Target Brand: {toBrand}</p>
                )}
              </div>
            </div>

            {/* Report Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse bg-white border border-slate-200">
                <thead>
                  <tr className="bg-[#24344d] text-white text-[11px] font-bold">
                    <th className="py-2 px-3">Code</th>
                    <th className="py-2 px-3">Description</th>
                    <th className="py-2 px-3">Barcode</th>
                    <th className="py-2 px-3 text-right">Qty Transferred</th>
                    <th className="py-2 px-3 text-right">Qty Received</th>
                    <th className="py-2 px-3">Unit</th>
                    {reportShowCost && (
                      <>
                        <th className="py-2 px-3 text-right">Unit Cost ({currSymbol})</th>
                        <th className="py-2 px-3 text-right">Avg. Cost ({currSymbol})</th>
                        <th className="py-2 px-3 text-right">Total U.Cost ({currSymbol})</th>
                        <th className="py-2 px-3 text-right">Total Avg. Cost ({currSymbol})</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                  {items.map((it) => (
                    <tr key={it.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono font-bold text-[#195a96]">{it.code}</td>
                      <td className="py-2 px-3 font-medium">{it.description}</td>
                      <td className="py-2 px-3 font-mono text-slate-500">{it.barcode}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{it.qtyTransfered.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">{it.qtyReceived.toLocaleString()}</td>
                      <td className="py-2 px-3">{it.unit}</td>
                      {reportShowCost && (
                        <>
                          <td className="py-2 px-3 text-right font-mono">{formatMoney(it.unitCostUsd)}</td>
                          <td className="py-2 px-3 text-right font-mono">{formatMoney(it.avgCostUsd)}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold">{formatMoney(it.qtyTransfered * it.unitCostUsd)}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold">{formatMoney(it.qtyTransfered * it.avgCostUsd)}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300">
                  <tr>
                    <td colSpan={3} className="py-2.5 px-3 text-right uppercase text-slate-700">Totals:</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-900 font-black">{totalQtyTransfered.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-700 font-black">{totalQtyReceived.toLocaleString()}</td>
                    <td></td>
                    {reportShowCost && (
                      <>
                        <td colSpan={2}></td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">{formatMoney(totalUnitCostUsd)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">{formatMoney(totalAvgCostUsd)}</td>
                      </>
                    )}
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-300 text-center text-xs">
              <div>
                <p className="font-bold text-slate-800">Prepared & Approved By</p>
                <div className="h-12 border-b border-dashed border-slate-400 mt-2"></div>
                <p className="text-[10px] text-slate-500 mt-1">Warehouse Supervisor Signature</p>
              </div>
              <div>
                <p className="font-bold text-slate-800">Driver / Dispatcher</p>
                <div className="h-12 border-b border-dashed border-slate-400 mt-2"></div>
                <p className="text-[10px] text-slate-500 mt-1">Carrier / Truck Vehicle License</p>
              </div>
              <div>
                <p className="font-bold text-slate-800">Received & Confirmed By</p>
                <div className="h-12 border-b border-dashed border-slate-400 mt-2"></div>
                <p className="text-[10px] text-slate-500 mt-1">Destination Branch Manager</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* =========================================================================
            VIEW MODE B: MAIN TRANSFERS WORKSTATION
            ========================================================================= */
        <div className="space-y-4">
          {/* TOP TOOLBAR: Title, Breadcrumb, New, Actions Dropdown, Currency Switcher */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🔄</span>
                <h1 className="text-base font-bold text-slate-900">Transfers & Stock Requisitions</h1>
                {isReversed && (
                  <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-bold border border-red-200">
                    ( Reversed )
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Operations / Actions / Transfers • Inter-Branch Movements & Requisition Fulfillment
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {/* + New Button */}
              <button
                onClick={handleNewTransfer}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#195a96] hover:bg-[#154676] text-white text-xs font-bold rounded-lg shadow-xs transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </button>

              {/* Actions Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsActionsDropdownOpen(!isActionsDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg shadow-xs transition cursor-pointer"
                >
                  <span>Actions</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {isActionsDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-1.5 text-xs text-slate-700">
                    <button
                      onClick={() => {
                        setPreviewModalOpen(true);
                        setIsActionsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-100 font-medium text-left"
                    >
                      <Search className="w-3.5 h-3.5 text-[#195a96]" />
                      <span>Preview Transfers</span>
                    </button>
                    <button
                      onClick={() => {
                        setAddLocationModalOpen(true);
                        setIsActionsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-100 font-medium text-left"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Add Location</span>
                    </button>
                    <button
                      onClick={handleOpenReport}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-100 font-medium text-left"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-700" />
                      <span>Print / Report</span>
                    </button>
                    <div className="my-1 border-t border-slate-100"></div>
                    <button
                      onClick={() => {
                        setStoreModalOpen(true);
                        setIsActionsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-100 font-medium text-left"
                    >
                      <Archive className="w-3.5 h-3.5 text-amber-600" />
                      <span>Store Transfer</span>
                    </button>
                    <button
                      onClick={() => {
                        setRecallModalOpen(true);
                        setIsActionsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-100 font-medium text-left"
                    >
                      <History className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Recall Transfer</span>
                    </button>
                    <button
                      onClick={handleReverseTransfer}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-100 font-medium text-left"
                    >
                      <Undo className="w-3.5 h-3.5 text-red-600" />
                      <span>Reverse Transfer</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsInterBrand(!isInterBrand);
                        setIsActionsDropdownOpen(false);
                        showToast(`Inter-Brand mode ${!isInterBrand ? 'Activated' : 'Deactivated'}`);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-100 font-medium text-left"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-teal-600" />
                      <span>{isInterBrand ? 'Disable Inter-Brand' : 'Inter-Brand Transfer'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Currency Switcher */}
              <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs font-bold">
                <button
                  onClick={() => setActiveCurrency('USD')}
                  className={`px-2.5 py-1.5 transition ${
                    activeCurrency === 'USD' ? 'bg-[#195a96] text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  USD ($)
                </button>
                <button
                  onClick={() => setActiveCurrency('LBP')}
                  className={`px-2.5 py-1.5 transition ${
                    activeCurrency === 'LBP' ? 'bg-[#195a96] text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  LBP
                </button>
              </div>
            </div>
          </div>

          {/* CARD 1: TRANSFER HEADER (Date, Number, From Branch/Location, To Branch/Location) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="bg-[#24344d] text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between">
              <span>Transfer / Requisition Details</span>
              <span className="text-[11px] text-blue-200 font-mono">{transferNumber}</span>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-6 text-xs">
              {/* Left Column: Date & Transfer Number & PR Number */}
              <div className="md:col-span-4 space-y-3.5 md:border-r md:border-slate-200 md:pr-6">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Transfer Date *</label>
                  <input
                    type="date"
                    value={transferDate}
                    onChange={(e) => setTransferDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono focus:outline-none focus:border-[#195a96]"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-1.5">
                      <label className="font-bold text-slate-700">Transfer Number</label>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-300">
                        Auto Generated
                      </span>
                    </div>
                    {fromReqNo && (
                      <span className="text-[11px] font-bold text-red-800 font-mono">From Req #: {fromReqNo}</span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={transferNumber}
                      readOnly
                      title="Transfer number is automatically generated"
                      className="w-full bg-slate-100/90 border border-slate-300 rounded-lg pl-3 pr-8 py-1.5 text-slate-900 font-mono font-bold cursor-not-allowed select-all focus:outline-none shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newNum = `TRN-2026-${String(Math.floor(205 + Math.random() * 800)).padStart(4, '0')}`;
                        setTransferNumber(newNum);
                        showToast(`Regenerated Transfer #: ${newNum}`);
                      }}
                      className="absolute right-2 top-2 text-slate-400 hover:text-[#195a96] transition cursor-pointer"
                      title="Regenerate Transfer Number"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Sequential ID generated automatically by system (non-manual)</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Product Request # (Optional)</label>
                  <input
                    type="text"
                    placeholder="PR Reference..."
                    value={prNumber}
                    onChange={(e) => setPrNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono focus:outline-none focus:border-[#195a96]"
                  />
                </div>
              </div>

              {/* Right Column: Source & Destination Branches/Locations */}
              <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Source Branch */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">From Branch</label>
                  <select
                    value={fromBranch}
                    onChange={(e) => setFromBranch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-medium focus:outline-none focus:border-[#195a96]"
                  >
                    <option value="Main Branch">Main Branch (الفرع الرئيسي)</option>
                  </select>
                </div>

                {/* Source Location with [+] Add Location button */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">From Location</label>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={fromLocation}
                      onChange={(e) => setFromLocation(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-medium focus:outline-none focus:border-[#195a96]"
                    >
                      <option value="All Locations">All Locations</option>
                      <option value="Choueifat Main Facility">Choueifat Main Facility</option>
                    </select>
                    <button
                      onClick={() => setAddLocationModalOpen(true)}
                      className="p-2 bg-[#195a96] hover:bg-[#154676] text-white rounded-lg shadow-2xs transition"
                      title="Add Location"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* If Inter-Brand, show To Brand */}
                {isInterBrand && (
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-amber-800 mb-1">To Brand (Inter-Brand Transfer)</label>
                    <select
                      value={toBrand}
                      onChange={(e) => setToBrand(e.target.value)}
                      className="w-full bg-amber-50 border border-amber-300 text-amber-950 rounded-lg px-3 py-1.5 font-bold focus:outline-none focus:border-amber-600"
                    >
                      {OMEGA_ITEM_BRANDS.map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Destination Branch */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">To Branch</label>
                  <select
                    value={toBranch}
                    onChange={(e) => setToBranch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-medium focus:outline-none focus:border-[#195a96]"
                  >
                    <option value="Main Branch">Main Branch (الفرع الرئيسي)</option>
                  </select>
                </div>

                {/* Destination Location */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">To Location</label>
                  <select
                    value={toLocation}
                    onChange={(e) => setToLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-medium focus:outline-none focus:border-[#195a96]"
                  >
                    <option value="All Locations">All Locations</option>
                    <option value="Choueifat Main Facility">Choueifat Main Facility</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: TRANSFER DETAILS (Items Search, Import, Dynamic Table with Cost Filters, Save/Post) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="bg-[#2f3b52] text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between">
              <span>Transfer Items & Cargo Manifest</span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showBarcode}
                    onChange={(e) => setShowBarcode(e.target.checked)}
                    className="rounded text-[#195a96]"
                  />
                  <span>Barcode</span>
                </label>
                <label className="flex items-center gap-1 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hideCost}
                    onChange={(e) => setHideCost(e.target.checked)}
                    className="rounded text-[#195a96]"
                  />
                  <span>Hide Cost</span>
                </label>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Search & Import Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Type item name/code & press Enter..."
                      value={searchItemVal}
                      onChange={(e) => setSearchItemVal(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleOpenSearchModal(searchItemVal);
                        }
                      }}
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#195a96]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenSearchModal(searchItemVal)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#195a96] hover:bg-[#154676] text-white text-xs font-bold rounded-lg shadow-2xs transition cursor-pointer"
                    title="Search Inventory Items"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Search</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenSearchModal('')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 shadow-2xs transition cursor-pointer"
                  >
                    <Boxes className="w-3.5 h-3.5 text-[#195a96]" />
                    <span>Browse Inventory Items</span>
                  </button>
                  <button
                    onClick={() => setImportModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#195a96]" />
                    <span>Import Items (CSV)</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Items Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                      <th className="py-2.5 px-3">Code</th>
                      <th className="py-2.5 px-3">Description</th>
                      {showBarcode && <th className="py-2.5 px-3">Barcode</th>}
                      <th className="py-2.5 px-3 text-right">Qty Transfered</th>
                      {previewReq && <th className="py-2.5 px-3 text-right text-emerald-700">Qty Received</th>}
                      <th className="py-2.5 px-3">Unit</th>
                      {!hideCost && (
                        <>
                          <th className="py-2.5 px-3 text-right font-black">Unit Cost ({currSymbol})</th>
                          <th className="py-2.5 px-3 text-right font-black">Avg. Cost ({currSymbol})</th>
                        </>
                      )}
                      <th className="py-2.5 px-3 text-right text-slate-500">Qty OH</th>
                      {!hideCost && (
                        <>
                          <th className="py-2.5 px-3 text-right font-black">Total U.Cost ({currSymbol})</th>
                          <th className="py-2.5 px-3 text-right font-black">Total Avg. Cost ({currSymbol})</th>
                        </>
                      )}
                      <th className="py-2.5 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {items.map((row) => (
                      <React.Fragment key={row.id}>
                        <tr className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2 px-3 font-mono font-bold text-[#195a96]">{row.code}</td>
                          <td className="py-2 px-3 font-bold text-slate-900">{row.description}</td>
                          {showBarcode && (
                            <td className="py-2 px-3 font-mono text-slate-500">{row.barcode}</td>
                          )}
                          <td className="py-2 px-3 text-right">
                            <input
                              type="number"
                              step="any"
                              value={row.qtyTransfered}
                              onChange={(e) => updateItem(row.id, 'qtyTransfered', parseFloat(e.target.value) || 0)}
                              onFocus={(e) => e.target.select()}
                              className="w-20 px-2 py-1 text-right bg-white border border-slate-300 rounded font-mono font-bold text-slate-900 focus:outline-none focus:border-[#195a96]"
                            />
                          </td>
                          {previewReq && (
                            <td className="py-2 px-3 text-right">
                              <input
                                type="number"
                                step="any"
                                value={row.qtyReceived}
                                onChange={(e) => updateItem(row.id, 'qtyReceived', parseFloat(e.target.value) || 0)}
                                onFocus={(e) => e.target.select()}
                                className="w-20 px-2 py-1 text-right bg-emerald-50 border border-emerald-300 rounded font-mono font-bold text-emerald-800 focus:outline-none focus:border-emerald-600"
                              />
                            </td>
                          )}
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold">
                              {row.unit}
                            </span>
                          </td>
                          {!hideCost && (
                            <>
                              <td className="py-2 px-3 text-right font-mono text-slate-700">{formatMoney(row.unitCostUsd)}</td>
                              <td className="py-2 px-3 text-right font-mono text-slate-700">{formatMoney(row.avgCostUsd)}</td>
                            </>
                          )}
                          <td className="py-2 px-3 text-right font-mono text-slate-500">{row.qtyOnHand.toLocaleString()}</td>
                          {!hideCost && (
                            <>
                              <td className="py-2 px-3 text-right font-mono font-black text-slate-900">
                                {formatMoney(row.qtyTransfered * row.unitCostUsd)}
                              </td>
                              <td className="py-2 px-3 text-right font-mono font-black text-slate-900">
                                {formatMoney(row.qtyTransfered * row.avgCostUsd)}
                              </td>
                            </>
                          )}
                          <td className="py-2 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {/* Remark / Expiration Toggle */}
                              <button
                                onClick={() => updateItem(row.id, 'showRemark', !row.showRemark)}
                                className={`p-1.5 rounded transition ${
                                  row.showRemark || row.remark ? 'bg-blue-100 text-[#195a96]' : 'hover:bg-slate-200 text-slate-500'
                                }`}
                                title="Remark & Expiration"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>

                              {/* Serial Numbers Button */}
                              <button
                                onClick={() => openSerialModal(row)}
                                className={`p-1.5 rounded transition ${
                                  row.serials && row.serials.length > 0
                                    ? 'bg-emerald-100 text-emerald-800 font-bold'
                                    : 'hover:bg-slate-200 text-slate-500'
                                }`}
                                title="Serial Numbers"
                              >
                                <Barcode className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Row Button */}
                              <button
                                onClick={() => removeItem(row.id)}
                                className="p-1.5 hover:bg-red-50 text-red-600 rounded transition"
                                title="Remove Item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Inline Remark and Expiration Expandable Row */}
                        {row.showRemark && (
                          <tr className="bg-blue-50/40 border-b border-blue-100 text-xs">
                            <td colSpan={12} className="p-2.5">
                              <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                                  <span className="font-bold text-slate-700">Remark:</span>
                                  <input
                                    type="text"
                                    placeholder="Enter item dispatch note or handling instructions..."
                                    value={row.remark}
                                    onChange={(e) => updateItem(row.id, 'remark', e.target.value)}
                                    className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-800 focus:outline-none focus:border-[#195a96]"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-700">Exp. Date:</span>
                                  <input
                                    type="date"
                                    value={row.expDate}
                                    onChange={(e) => updateItem(row.id, 'expDate', e.target.value)}
                                    className="bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 font-mono focus:outline-none focus:border-[#195a96]"
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* BOTTOM SAVE TOOLBAR & STATS */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-200">
                {/* Stats */}
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-slate-500">Items: </span>
                    <span className="font-bold text-slate-800">{totalItemsCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Total Qty Transferred: </span>
                    <span className="font-bold text-[#195a96] font-mono">{totalQtyTransfered.toLocaleString()}</span>
                  </div>
                  {!hideCost && (
                    <div>
                      <span className="text-slate-500">Total Cost ({currSymbol}): </span>
                      <span className="font-bold text-slate-900 font-mono">{formatMoney(totalUnitCostUsd)}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2.5">
                  {!previewReq ? (
                    <>
                      <button
                        onClick={() => handleSaveTransfer(false)}
                        className="px-4 py-2 bg-[#fb8205] hover:bg-[#e07300] text-white text-xs font-bold rounded-lg shadow-sm transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => handleSaveTransfer(true)}
                        className="px-4 py-2 bg-[#10b981] hover:bg-[#059669] text-white text-xs font-bold rounded-lg shadow-sm transition"
                      >
                        Save &amp; Post
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleSaveTransfer(false)}
                        className="px-4 py-2 bg-[#fb8205] hover:bg-[#e07300] text-white text-xs font-bold rounded-lg shadow-sm transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={handlePostCurrentTransfer}
                        className="px-4 py-2 bg-[#10b981] hover:bg-[#059669] text-white text-xs font-bold rounded-lg shadow-sm transition"
                      >
                        Post
                      </button>
                      <button
                        onClick={handleDeleteCurrentTransfer}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-REPORT / MODAL 1: PREVIEW TRANSFERS MODAL (#previewSearchModel)
          ========================================================================= */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border-4 border-[#4c5c7a] w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-[#24344d] text-white p-4 flex items-center justify-between border-b border-slate-700">
              <div>
                <h2 className="text-base font-bold">Preview Transfers &amp; Requisitions</h2>
                <p className="text-xs text-slate-300 font-mono">Registry Search, Multi-Posting &amp; Cargo Verification</p>
              </div>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Bar Rows */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3 text-xs">
              {/* Row 1: Search, Branch, Status, Item Type */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-4 relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by Req #, Branch, Destination..."
                    value={previewSearchText}
                    onChange={(e) => setPreviewSearchText(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#195a96]"
                  />
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={previewBranchFilter}
                    onChange={(e) => setPreviewBranchFilter(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#195a96]"
                  >
                    <option value="ALL">All Branches</option>
                    <option value="Main Branch">Main Branch (الفرع الرئيسي)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <select
                    value={previewStatusFilter}
                    onChange={(e) => setPreviewStatusFilter(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#195a96]"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="POSTED">Posted</option>
                    <option value="UNPOSTED">Unposted</option>
                    <option value="IN_TRANSIT">In-Transit</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={previewItemTypeFilter}
                    onChange={(e) => setPreviewItemTypeFilter(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#195a96]"
                  >
                    <option value="ALL">All Item Types</option>
                    <option value="INVENTORY">Inventory Items</option>
                    <option value="RAW">Raw Materials</option>
                    <option value="PACKAGING">Bottles &amp; Packaging</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Multiple Posting Checkbox, Date Range, Filter Button, Post Selected */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 font-bold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={multiplePosting}
                      onChange={(e) => setMultiplePosting(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-0"
                    />
                    <span>Multiple Posting</span>
                  </label>

                  <label className="flex items-center gap-1.5 font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allDates}
                      onChange={(e) => setAllDates(e.target.checked)}
                      className="rounded text-[#195a96] focus:ring-0"
                    />
                    <span>All Dates</span>
                  </label>

                  {!allDates && (
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-800 font-mono"
                      />
                      <span className="text-slate-500">to</span>
                      <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-800 font-mono"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {multiplePosting && (
                    <button
                      onClick={handlePostSelectedTransactions}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-sm transition"
                    >
                      <Tag className="w-3.5 h-3.5" />
                      <span>Post Selected Transactions</span>
                    </button>
                  )}
                  <button
                    onClick={() => showToast('Applied transfer filters.')}
                    className="px-4 py-1.5 bg-[#195a96] hover:bg-[#154676] text-white font-bold rounded-lg shadow-sm transition"
                  >
                    Filter
                  </button>
                </div>
              </div>

              {/* Row 3: From Branch & To Branch specific selects */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-slate-600 font-bold whitespace-nowrap">From Branch:</span>
                  <select
                    value={fromBranchFilter}
                    onChange={(e) => setFromBranchFilter(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800"
                  >
                    <option value="ALL">All Source Branches</option>
                    <option value="Marjeyoun Press Mill & Silos">Marjeyoun Press Mill & Silos</option>
                    <option value="Beirut Central Distribution Depot">Beirut Central Distribution Depot</option>
                    <option value="Saida Coastal Logistics Hub">Saida Coastal Logistics Hub</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-600 font-bold whitespace-nowrap">To Branch:</span>
                  <select
                    value={toBranchFilter}
                    onChange={(e) => setToBranchFilter(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800"
                  >
                    <option value="ALL">All Destination Branches</option>
                    <option value="Beirut Central Distribution Depot">Beirut Central Distribution Depot</option>
                    <option value="Choueifat POS Store Front & Showroom">Choueifat POS Store Front & Showroom</option>
                    <option value="Marjeyoun Press Mill & Silos">Marjeyoun Press Mill & Silos</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto p-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#24344d] text-white font-bold">
                    {multiplePosting && <th className="py-2.5 px-3 w-8"></th>}
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Req. #</th>
                    <th className="py-2.5 px-3">Source (Branch / Loc)</th>
                    <th className="py-2.5 px-3">Destination (Branch / Loc)</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Total Cost ({currSymbol})</th>
                    <th className="py-2.5 px-3 text-center">
                      <button
                        onClick={handleDeleteAllUnposted}
                        className="p-1 hover:bg-red-600 text-white rounded transition"
                        title="Delete All Unposted Transfers"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                  {filteredSavedTransfers.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition">
                      {multiplePosting && (
                        <td className="py-2 px-3 text-center">
                          {!row.posted && (
                            <input
                              type="checkbox"
                              checked={!!row.selected}
                              onChange={(e) => {
                                const val = e.target.checked;
                                setSavedTransfers(savedTransfers.map(tr => tr.id === row.id ? { ...tr, selected: val } : tr));
                              }}
                              className="rounded text-emerald-600"
                            />
                          )}
                        </td>
                      )}
                      <td className="py-2 px-3 font-mono text-slate-600">{row.reqDate}</td>
                      <td className="py-2 px-3 font-mono font-bold text-[#195a96]">
                        {row.reqNo}
                        {row.fromReqNo && (
                          <span className="block text-[10px] text-red-700">From: {row.fromReqNo}</span>
                        )}
                        {row.prNumber && (
                          <span className="block text-[10px] text-blue-600 font-mono">PR#: {row.prNumber}</span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-bold text-slate-900">{row.branchSource}</div>
                        <div className="text-[11px] text-slate-500">{row.locSource}</div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-bold text-slate-900">{row.branchDest}</div>
                        <div className="text-[11px] text-slate-500">{row.locDest}</div>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.posted
                            ? 'bg-emerald-100 text-emerald-800'
                            : row.status === 'IN_TRANSIT'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {row.posted ? 'Posted' : row.status === 'IN_TRANSIT' ? 'In-Transit' : 'Unposted'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                        {formatMoney(row.totalCostUsd)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* [+] Load into editor */}
                          <button
                            onClick={() => handleLoadTransfer(row)}
                            className="p-1.5 bg-[#195a96] hover:bg-[#154676] text-white rounded transition shadow-2xs"
                            title="Load into Editor"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>

                          {/* [Tag] Post Transfer */}
                          {!row.posted && (
                            <button
                              onClick={() => handlePostFromPreview(row.id)}
                              className="p-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded transition shadow-2xs"
                              title="Post Transfer"
                            >
                              <Tag className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* [Trash] Delete */}
                          <button
                            onClick={() => handleDeleteFromPreview(row.id)}
                            className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded transition shadow-2xs"
                            title="Delete Transfer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredSavedTransfers.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                        No transfer records match your current filter parameters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Showing {filteredSavedTransfers.length} registered transfers</span>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition"
              >
                Close Registry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-REPORT / MODAL 2: STORE TRANSFERS MODAL (#enterReqDescriptionModel)
          ========================================================================= */}
      {storeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border-2 border-[#4c5c7a] w-full max-w-md overflow-hidden">
            <div className="bg-[#24344d] text-white p-3.5 flex items-center justify-between">
              <h3 className="font-bold text-sm">Store Requisition / Transfer Template</h3>
              <button onClick={() => setStoreModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Enter a description for this stored requisition:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Weekly EVOO 750ml Depot Replenishment"
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-[#195a96]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setStoreModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveStoredRequisition}
                  className="px-4 py-1.5 bg-[#195a96] hover:bg-[#154676] text-white font-bold rounded-lg shadow-sm"
                >
                  Save Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-REPORT / MODAL 3: RECALL TRANSFERS MODAL (#listRecureRequisitionsModel)
          ========================================================================= */}
      {recallModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border-2 border-[#4c5c7a] w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-[#24344d] text-white p-3.5 flex items-center justify-between">
              <h3 className="font-bold text-sm">Recall Stored / Recurring Transfers</h3>
              <button onClick={() => setRecallModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs flex-1 overflow-y-auto">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search stored templates..."
                  value={recallSearchText}
                  onChange={(e) => setRecallSearchText(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#195a96]"
                />
              </div>

              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Req Description</th>
                    <th className="py-2 px-3">Source</th>
                    <th className="py-2 px-3">Destination</th>
                    <th className="py-2 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {recurringList
                    .filter(r => r.description.toLowerCase().includes(recallSearchText.toLowerCase()))
                    .map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-mono text-slate-500">{rec.date}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">{rec.description}</td>
                        <td className="py-2 px-3 text-slate-600">{rec.src}</td>
                        <td className="py-2 px-3 text-slate-600">{rec.dest}</td>
                        <td className="py-2 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setFromBranch(rec.src.includes('Marjeyoun') ? 'Marjeyoun Press Mill & Silos' : 'Beirut Central Distribution Depot');
                                setToBranch(rec.dest.includes('Beirut') ? 'Beirut Central Distribution Depot' : 'Choueifat POS Store Front & Showroom');
                                setRecallModalOpen(false);
                                showToast(`Recalled template: ${rec.description}`);
                              }}
                              className="p-1 bg-[#195a96] hover:bg-[#154676] text-white rounded"
                              title="Load Stored Requisition"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setRecurringList(recurringList.filter(r => r.id !== rec.id));
                                showToast('Template removed.');
                              }}
                              className="p-1 bg-red-600 hover:bg-red-700 text-white rounded"
                              title="Delete Template"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setRecallModalOpen(false)}
                className="px-4 py-1.5 bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-REPORT / MODAL 4: IMPORT ITEMS MODAL (#importItems)
          ========================================================================= */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border-2 border-[#4c5c7a] w-full max-w-md overflow-hidden text-xs">
            <div className="bg-[#24344d] text-white p-3.5 flex items-center justify-between">
              <h3 className="font-bold text-sm">Import Transfer Items</h3>
              <button onClick={() => setImportModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex justify-end">
                <a
                  href="#download"
                  onClick={(e) => {
                    e.preventDefault();
                    showToast('Requisition.csv template downloaded.');
                  }}
                  className="text-[#195a96] hover:underline font-bold text-[11px]"
                >
                  Download Template (Requisition.csv)
                </a>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center space-y-2 hover:border-[#195a96] transition">
                <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="font-bold text-slate-700">
                  {importFile ? importFile : 'Choose or drag & drop Requisition CSV file'}
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setImportFile(e.target.files[0].name);
                    }
                  }}
                  className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#195a96] file:text-white hover:file:bg-[#154676]"
                />
              </div>

              {importProgress > 0 && (
                <div className="space-y-1">
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#195a96] h-full transition-all duration-300"
                      style={{ width: `${importProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-right font-mono text-slate-500">{importProgress}%</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  onClick={() => setImportModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartImport}
                  disabled={!importFile}
                  className="px-4 py-1.5 bg-[#195a96] hover:bg-[#154676] disabled:opacity-50 text-white font-bold rounded-lg shadow-sm"
                >
                  Import Items
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-REPORT / MODAL 5: SERIAL NUMBERS MODAL (#itemsSerialNumbersModal)
          ========================================================================= */}
      {serialModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border-2 border-[#4c5c7a] w-full max-w-xl overflow-hidden flex flex-col text-xs">
            <div className="bg-[#24344d] text-white p-3.5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Items Serial Numbers</h3>
                <p className="text-[11px] text-slate-300">{activeSerialItem?.description}</p>
              </div>
              <button onClick={() => setSerialModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 grid grid-cols-2 gap-4">
              {/* Available Serials */}
              <div className="border border-slate-200 rounded-lg p-3 space-y-2">
                <p className="font-bold text-slate-800 border-b pb-1">Available Serial Numbers</p>
                <div className="space-y-1 max-h-48 overflow-y-auto font-mono">
                  {availableSerials.map((sn) => (
                    <div
                      key={sn}
                      onClick={() => handleAddSerial(sn)}
                      className="p-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded cursor-pointer flex justify-between items-center transition"
                    >
                      <span>{sn}</span>
                      <Plus className="w-3.5 h-3.5 text-[#195a96]" />
                    </div>
                  ))}
                  {availableSerials.length === 0 && (
                    <p className="text-slate-400 italic text-[11px]">No serials available.</p>
                  )}
                </div>
              </div>

              {/* Selected Serials */}
              <div className="border border-slate-200 rounded-lg p-3 space-y-2">
                <p className="font-bold text-emerald-800 border-b pb-1">Selected Serial Numbers</p>
                <div className="space-y-1 max-h-48 overflow-y-auto font-mono">
                  {selectedSerials.map((sn) => (
                    <div
                      key={sn}
                      onClick={() => handleRemoveSerial(sn)}
                      className="p-1.5 bg-emerald-50 hover:bg-red-50 border border-emerald-200 rounded cursor-pointer flex justify-between items-center transition"
                    >
                      <span className="font-bold text-emerald-900">{sn}</span>
                      <X className="w-3.5 h-3.5 text-red-600" />
                    </div>
                  ))}
                  {selectedSerials.length === 0 && (
                    <p className="text-slate-400 italic text-[11px]">Click available serial to add.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setSerialModalOpen(false)}
                className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSerials}
                className="px-4 py-1.5 bg-[#195a96] hover:bg-[#154676] text-white font-bold rounded-lg shadow-sm"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-REPORT / MODAL 6: ADD LOCATION MODAL (#addLocationModal)
          ========================================================================= */}
      {addLocationModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border-2 border-[#4c5c7a] w-full max-w-md overflow-hidden text-xs">
            <div className="bg-[#24344d] text-white p-3.5 flex items-center justify-between">
              <h3 className="font-bold text-sm">Add Warehouse / Branch Location</h3>
              <button onClick={() => setAddLocationModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Branch</label>
                <select
                  value={newLocationBranch}
                  onChange={(e) => setNewLocationBranch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
                >
                  <option value="Marjeyoun Press Mill & Silos">Marjeyoun Press Mill & Silos</option>
                  <option value="Beirut Central Distribution Depot">Beirut Central Distribution Depot</option>
                  <option value="Choueifat POS Store Front & Showroom">Choueifat POS Store Front & Showroom</option>
                  <option value="Saida Coastal Logistics Hub">Saida Coastal Logistics Hub</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Location Code</label>
                <input
                  type="text"
                  placeholder="e.g. LOC-SL-03"
                  value={newLocationCode}
                  onChange={(e) => setNewLocationCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-900 focus:outline-none focus:border-[#195a96]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Location Description *</label>
                <input
                  type="text"
                  placeholder="e.g. Silo Tank #4 Bottling Line"
                  value={newLocationName}
                  onChange={(e) => setNewLocationName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-[#195a96]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  onClick={() => setAddLocationModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveLocation}
                  disabled={!newLocationName.trim()}
                  className="px-4 py-1.5 bg-[#195a96] hover:bg-[#154676] disabled:opacity-50 text-white font-bold rounded-lg shadow-sm"
                >
                  Save Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 6: SEARCH INVENTORY ITEMS (100% AUTHENTIC OMEGA CLONE)
          ========================================================================= */}
      <SearchInventoryItemsModal
        isOpen={isSearchInventoryModalOpen}
        onClose={() => setIsSearchInventoryModalOpen(false)}
        initialSearch={modalSearchInitial}
        onAddItems={handleAddItemsFromModal}
      />
    </div>
  );
}
