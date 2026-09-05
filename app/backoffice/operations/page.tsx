'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// --- DATA STRUCTURES (VANGUARD ENTERPRISE ARCHITECTURE) ---

export interface InventoryItem {
  id: string;
  code: string;
  barcode: string;
  description: string;
  group: 'Raw Harvest' | 'Extra Virgin Oil' | 'Virgin Oil' | 'Bottled & Packaged' | 'Bulk Tins' | 'Pomace & Byproducts' | 'Packaging & Glass' | 'Services';
  branch: string;
  unit: 'KG' | 'Liter' | '500ml Bottle' | '750ml Bottle' | '16L Tin' | '10L Tin' | 'Can' | 'Piece' | 'Hours';
  qtyOnHand: number;
  minReorderLevel: number;
  costUsd: number;
  costLbp: number;
  sellingPriceUsd: number;
  sellingPriceLbp: number;
  taxRate: number; // e.g. 11% VAT
  status: 'ACTIVE' | 'DISCONTINUED' | 'LOW_STOCK';
  supplier: string;
  lastUpdated: string;
}

export interface ProductionRun {
  id: string;
  runNo: string;
  date: string;
  facility: string;
  farmerSupplier: string;
  rawOlivesKg: number;
  oliveVariety: 'Sourani' | 'Baladi' | 'Ayrouni' | 'Nabali';
  acidityTestPct: number;
  oilYieldLiters: number;
  yieldRatioPct: number; // e.g. 21.5% (Liters / Kg)
  pomaceKg: number;
  pressingFeeUsd: number;
  settlementType: 'CASH_FEE' | 'OIL_IN_KIND_10PCT';
  operator: string;
  status: 'COMPLETED' | 'IN_PROCESS' | 'QUALITY_HOLD';
}

export interface StockTransfer {
  id: string;
  transferNo: string;
  date: string;
  sourceLocation: string;
  destinationLocation: string;
  itemsCount: number;
  totalQty: number;
  transportedBy: string;
  driverPhone: string;
  vehiclePlate: string;
  status: 'IN_TRANSIT' | 'RECEIVED' | 'PENDING_DISPATCH';
  dispatchedAt: string;
}

export interface StockAdjustment {
  id: string;
  adjustmentNo: string;
  date: string;
  branch: string;
  itemCode: string;
  itemDescription: string;
  systemQty: number;
  countedQty: number;
  varianceQty: number;
  varianceValueUsd: number;
  reason: 'PHYSICAL_COUNT_AUDIT' | 'EVAPORATION_SEDIMENT' | 'PRESSING_TANK_VARIANCE' | 'DAMAGED_SEAL' | 'SPOILAGE';
  approvedBy: string;
}

export interface SupplierRecord {
  id: string;
  code: string;
  name: string;
  regionTown: string;
  contactPerson: string;
  phone: string;
  category: 'Olive Grove Farmer' | 'Glass Bottle Manufacturer' | 'Tin Can Printing' | 'Fuel & Energy' | 'Industrial Press Parts';
  currency: 'USD' | 'LBP';
  outstandingBalanceUsd: number;
  outstandingBalanceLbp: number;
  terms: 'COD_UPON_PRESSING' | 'NET_30' | 'HARVEST_END_SETTLEMENT';
}

// --- INITIAL SEED DATA ---

const initialInventory: InventoryItem[] = [
  {
    id: 'ITEM-001',
    code: 'EVOO-B-750ML',
    barcode: '5280010920012',
    description: 'Extra Virgin Olive Oil (Cold Pressed) 750ml Dark Glass Bottle',
    group: 'Bottled & Packaged',
    branch: 'Beirut Central Warehouse',
    unit: '750ml Bottle',
    qtyOnHand: 1420,
    minReorderLevel: 250,
    costUsd: 4.80,
    costLbp: 429600,
    sellingPriceUsd: 8.50,
    sellingPriceLbp: 760750,
    taxRate: 11,
    status: 'ACTIVE',
    supplier: 'Southern Olive Oil Press Mill - Marjeyoun',
    lastUpdated: '2026-09-04 18:20',
  },
  {
    id: 'ITEM-002',
    code: 'EVOO-T-16L',
    barcode: '5280010920029',
    description: 'Extra Virgin Olive Oil 16-Liter Sealed Tin (Tanakeh Souri)',
    group: 'Bulk Tins',
    branch: 'Marjeyoun Press Mill',
    unit: '16L Tin',
    qtyOnHand: 345,
    minReorderLevel: 60,
    costUsd: 85.00,
    costLbp: 7607500,
    sellingPriceUsd: 125.00,
    sellingPriceLbp: 11187500,
    taxRate: 0, // Agricultural VAT exempt
    status: 'ACTIVE',
    supplier: 'Southern Olive Harvest Estates',
    lastUpdated: '2026-09-05 09:15',
  },
  {
    id: 'ITEM-003',
    code: 'EVOO-T-10L',
    barcode: '5280010920036',
    description: 'Extra Virgin Olive Oil 10-Liter Metal Container with Spout',
    group: 'Bulk Tins',
    branch: 'Choueifat POS Store',
    unit: '10L Tin',
    qtyOnHand: 84,
    minReorderLevel: 20,
    costUsd: 55.00,
    costLbp: 4922500,
    sellingPriceUsd: 82.00,
    sellingPriceLbp: 7339000,
    taxRate: 0,
    status: 'ACTIVE',
    supplier: 'Southern Olive Harvest Estates',
    lastUpdated: '2026-09-04 14:00',
  },
  {
    id: 'ITEM-004',
    code: 'EVOO-B-500ML',
    barcode: '5280010920043',
    description: 'Extra Virgin Olive Oil 500ml Marasca Square Bottle with Pourer',
    group: 'Bottled & Packaged',
    branch: 'Beirut Central Warehouse',
    unit: '500ml Bottle',
    qtyOnHand: 890,
    minReorderLevel: 200,
    costUsd: 3.40,
    costLbp: 304300,
    sellingPriceUsd: 6.00,
    sellingPriceLbp: 537000,
    taxRate: 11,
    status: 'ACTIVE',
    supplier: 'Southern Olive Oil Press Mill - Marjeyoun',
    lastUpdated: '2026-09-03 11:30',
  },
  {
    id: 'ITEM-005',
    code: 'RAW-OLV-SOURANI',
    barcode: '5280010920050',
    description: 'Raw Black & Green Sourani Harvesting Olives (Bulk Inward)',
    group: 'Raw Harvest',
    branch: 'Marjeyoun Press Mill',
    unit: 'KG',
    qtyOnHand: 14850,
    minReorderLevel: 2000,
    costUsd: 1.15,
    costLbp: 102925,
    sellingPriceUsd: 1.50,
    sellingPriceLbp: 134250,
    taxRate: 0,
    status: 'ACTIVE',
    supplier: 'Hasbaya & Marjeyoun Farmers Cooperative',
    lastUpdated: '2026-09-05 08:30',
  },
  {
    id: 'ITEM-006',
    code: 'PKG-GLS-750',
    barcode: '5280010920067',
    description: 'UV-Protected Dark Green Antique Glass Bottles 750ml (Palletized)',
    group: 'Packaging & Glass',
    branch: 'Marjeyoun Press Mill',
    unit: 'Piece',
    qtyOnHand: 4800,
    minReorderLevel: 1000,
    costUsd: 0.65,
    costLbp: 58175,
    sellingPriceUsd: 0.90,
    sellingPriceLbp: 80550,
    taxRate: 11,
    status: 'ACTIVE',
    supplier: 'Mediterranean Glass Industries S.A.L',
    lastUpdated: '2026-09-01 16:00',
  },
  {
    id: 'ITEM-007',
    code: 'POMACE-DRY',
    barcode: '5280010920074',
    description: 'Pressed Olive Pomace Cakes (Jift) for Biomass & Biofuel Heating',
    group: 'Pomace & Byproducts',
    branch: 'Marjeyoun Press Mill',
    unit: 'KG',
    qtyOnHand: 6800,
    minReorderLevel: 500,
    costUsd: 0.08,
    costLbp: 7160,
    sellingPriceUsd: 0.15,
    sellingPriceLbp: 13425,
    taxRate: 0,
    status: 'ACTIVE',
    supplier: 'Internal Press Mill Byproduct',
    lastUpdated: '2026-09-05 11:00',
  },
  {
    id: 'ITEM-008',
    code: 'PKG-TIN-16L',
    barcode: '5280010920081',
    description: 'Food-Grade Varnished Olive Oil Tin 16L with Telescopic Handle',
    group: 'Packaging & Glass',
    branch: 'Marjeyoun Press Mill',
    unit: 'Piece',
    qtyOnHand: 620,
    minReorderLevel: 150,
    costUsd: 3.10,
    costLbp: 277450,
    sellingPriceUsd: 4.20,
    sellingPriceLbp: 375900,
    taxRate: 11,
    status: 'ACTIVE',
    supplier: 'Levant Tinplate Packaging Co.',
    lastUpdated: '2026-09-02 12:45',
  },
];

const initialProductionRuns: ProductionRun[] = [
  {
    id: 'PR-2026-089',
    runNo: 'PRESS-MJ-26-089',
    date: '2026-09-05',
    facility: 'Continuous Pieralisi Line 1 - Marjeyoun',
    farmerSupplier: 'Cooperative Growers of Rachaya Al-Foukhar',
    rawOlivesKg: 4250,
    oliveVariety: 'Sourani',
    acidityTestPct: 0.38, // Ultra Premium Extra Virgin (<0.5%)
    oilYieldLiters: 935,
    yieldRatioPct: 22.0,
    pomaceKg: 1840,
    pressingFeeUsd: 212.50,
    settlementType: 'CASH_FEE',
    operator: 'Eng. Fadi Tannous',
    status: 'COMPLETED',
  },
  {
    id: 'PR-2026-088',
    runNo: 'PRESS-MJ-26-088',
    date: '2026-09-04',
    facility: 'Continuous Pieralisi Line 2 - Marjeyoun',
    farmerSupplier: 'Kfar Kila Olive Orchards',
    rawOlivesKg: 3100,
    oliveVariety: 'Baladi',
    acidityTestPct: 0.44,
    oilYieldLiters: 651,
    yieldRatioPct: 21.0,
    pomaceKg: 1360,
    pressingFeeUsd: 155.00,
    settlementType: 'OIL_IN_KIND_10PCT',
    operator: 'Maher Barakat',
    status: 'COMPLETED',
  },
];

const initialTransfers: StockTransfer[] = [
  {
    id: 'TR-1082',
    transferNo: 'TRN-SO-2026-1082',
    date: '2026-09-05 07:30',
    sourceLocation: 'Marjeyoun Press Mill (Tank Battery 3)',
    destinationLocation: 'Beirut Central Hub & Distribution Depot',
    itemsCount: 140,
    totalQty: 2240, // Liters (140 Tins of 16L)
    transportedBy: 'Hassan Sleiman (SuperSonic Truck)',
    driverPhone: '03-912831',
    vehiclePlate: 'B-492102',
    status: 'IN_TRANSIT',
    dispatchedAt: '07:45 AM',
  },
  {
    id: 'TR-1081',
    transferNo: 'TRN-SO-2026-1081',
    date: '2026-09-04 15:00',
    sourceLocation: 'Beirut Central Hub & Distribution Depot',
    destinationLocation: 'Choueifat POS Store Front',
    itemsCount: 35,
    totalQty: 180, // Assorted 750ml & 500ml bottles
    transportedBy: 'Tony Khoury (HiAce Van)',
    driverPhone: '71-332901',
    vehiclePlate: 'B-310892',
    status: 'RECEIVED',
    dispatchedAt: '03:15 PM',
  },
];

const initialAdjustments: StockAdjustment[] = [
  {
    id: 'ADJ-044',
    adjustmentNo: 'VAR-2026-044',
    date: '2026-09-04',
    branch: 'Marjeyoun Press Mill',
    itemCode: 'EVOO-T-16L',
    itemDescription: 'Extra Virgin Olive Oil 16-Liter Sealed Tin',
    systemQty: 347,
    countedQty: 345,
    varianceQty: -2,
    varianceValueUsd: -170.00,
    reason: 'DAMAGED_SEAL',
    approvedBy: 'Jichi Mohammed (Operations Director)',
  },
];

const initialSuppliers: SupplierRecord[] = [
  {
    id: 'SUP-01',
    code: 'FARM-HAS-01',
    name: 'Hasbaya & Marjeyoun Farmers Cooperative',
    regionTown: 'Hasbaya / Nabatieh Governorate',
    contactPerson: 'Hajj Rida Abou Hamdan',
    phone: '07-550123',
    category: 'Olive Grove Farmer',
    currency: 'USD',
    outstandingBalanceUsd: 4850.00,
    outstandingBalanceLbp: 0,
    terms: 'HARVEST_END_SETTLEMENT',
  },
  {
    id: 'SUP-02',
    code: 'PKG-MED-02',
    name: 'Mediterranean Glass Industries S.A.L',
    regionTown: 'Choueifat Industrial Zone',
    contactPerson: 'Karim Haddad',
    phone: '01-432890',
    category: 'Glass Bottle Manufacturer',
    currency: 'USD',
    outstandingBalanceUsd: 1240.00,
    outstandingBalanceLbp: 110980000,
    terms: 'NET_30',
  },
  {
    id: 'SUP-03',
    code: 'TIN-LEV-03',
    name: 'Levant Tinplate Packaging Co.',
    regionTown: 'Mkalles Industrial Strip',
    contactPerson: 'Sami Salameh',
    phone: '01-689201',
    category: 'Tin Can Printing',
    currency: 'USD',
    outstandingBalanceUsd: 0.00,
    outstandingBalanceLbp: 0,
    terms: 'COD_UPON_PRESSING',
  },
];

function OperationsCenterContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as 'catalog' | 'pressing' | 'transfers' | 'adjustments' | 'suppliers' | 'reorder' | null;
  const [activeTab, setActiveTab] = useState<'catalog' | 'pressing' | 'transfers' | 'adjustments' | 'suppliers' | 'reorder'>(tabParam || 'catalog');
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [productionRuns, setProductionRuns] = useState<ProductionRun[]>(initialProductionRuns);
  const [transfers, setTransfers] = useState<StockTransfer[]>(initialTransfers);
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>(initialAdjustments);
  const [suppliers] = useState<SupplierRecord[]>(initialSuppliers);

  // Filter States
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals State
  const [showNewItemModal, setShowNewItemModal] = useState<boolean>(false);
  const [showNewPressingModal, setShowNewPressingModal] = useState<boolean>(false);
  const [showNewTransferModal, setShowNewTransferModal] = useState<boolean>(false);

  // New Item Form State
  const [newItem, setNewItem] = useState({
    code: '',
    barcode: '',
    description: '',
    group: 'Extra Virgin Oil' as InventoryItem['group'],
    branch: 'Marjeyoun Press Mill',
    unit: '750ml Bottle' as InventoryItem['unit'],
    qtyOnHand: 0,
    minReorderLevel: 20,
    costUsd: 0,
    sellingPriceUsd: 0,
    supplier: 'Southern Olive Oil Products S.A.R.L',
  });

  // Filtered Catalog
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchBranch = selectedBranch === 'ALL' || item.branch === selectedBranch;
      const matchGroup = selectedGroup === 'ALL' || item.group === selectedGroup;
      const matchSearch =
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.barcode.includes(searchQuery);
      return matchBranch && matchGroup && matchSearch;
    });
  }, [inventory, selectedBranch, selectedGroup, searchQuery]);

  // Aggregate Metrics
  const totalStockValueUsd = useMemo(() => {
    return inventory.reduce((sum, item) => sum + item.qtyOnHand * item.costUsd, 0);
  }, [inventory]);

  const totalLowStockAlerts = useMemo(() => {
    return inventory.filter((item) => item.qtyOnHand <= item.minReorderLevel).length;
  }, [inventory]);

  // Handle Save New Item
  const handleCreateNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.code || !newItem.description) {
      alert('Please fill in Item Code and Description!');
      return;
    }

    const created: InventoryItem = {
      id: `ITEM-${Date.now().toString().slice(-4)}`,
      code: newItem.code.trim().toUpperCase(),
      barcode: newItem.barcode || `52800109${Math.floor(10000 + Math.random() * 90000)}`,
      description: newItem.description.trim(),
      group: newItem.group,
      branch: newItem.branch,
      unit: newItem.unit,
      qtyOnHand: Number(newItem.qtyOnHand) || 0,
      minReorderLevel: Number(newItem.minReorderLevel) || 10,
      costUsd: Number(newItem.costUsd) || 0,
      costLbp: (Number(newItem.costUsd) || 0) * 89500,
      sellingPriceUsd: Number(newItem.sellingPriceUsd) || 0,
      sellingPriceLbp: (Number(newItem.sellingPriceUsd) || 0) * 89500,
      taxRate: 11,
      status: Number(newItem.qtyOnHand) <= Number(newItem.minReorderLevel) ? 'LOW_STOCK' : 'ACTIVE',
      supplier: newItem.supplier,
      lastUpdated: 'Just Now',
    };

    setInventory((prev) => [created, ...prev]);
    setShowNewItemModal(false);
    setNewItem({
      code: '',
      barcode: '',
      description: '',
      group: 'Extra Virgin Oil',
      branch: 'Marjeyoun Press Mill',
      unit: '750ml Bottle',
      qtyOnHand: 0,
      minReorderLevel: 20,
      costUsd: 0,
      sellingPriceUsd: 0,
      supplier: 'Southern Olive Oil Products S.A.R.L',
    });
    alert(`✓ Product ${created.code} successfully added to Master Catalog!`);
  };

  return (
    <div className="p-4 space-y-4 max-w-[1550px] mx-auto text-slate-800 font-sans">
      
      {/* 1. TOP MODULE TITLE & METRIC SUMMARY */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-lg">
              ⚙️
            </span>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
                4. Operations Center & Inventory Management
              </h1>
              <span className="text-[11px] text-slate-500 font-medium">
                Southern Olive Oil Products S.A.R.L — Industrial Pressing, Bottling, Warehousing & Stock Matrix
              </span>
            </div>
          </div>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 transition-colors flex items-center gap-1"
          >
            <span>🖨️ A4 Inventory Sheet</span>
          </button>

          <button
            type="button"
            onClick={() => setShowNewItemModal(true)}
            className="px-3.5 py-1.5 bg-[#1e3a2b] hover:bg-[#14281e] text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>+ Add Product / Item</span>
          </button>
        </div>
      </div>

      {/* 2. KPI MATRIX METRIC TILES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-slate-400 font-mono text-[10px] uppercase block font-bold">Total Catalog SKUs</span>
          <div className="text-lg font-mono font-bold text-slate-900 mt-0.5">{inventory.length} Items</div>
          <span className="text-[10px] text-emerald-700 font-medium">Across 4 Facilities</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-slate-400 font-mono text-[10px] uppercase block font-bold">Total Inventory Valuation</span>
          <div className="text-lg font-mono font-bold text-slate-900 mt-0.5">
            ${totalStockValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-500 font-mono font-semibold">
            ≈ {(totalStockValueUsd * 89500).toLocaleString()} LBP
          </span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-slate-400 font-mono text-[10px] uppercase block font-bold">Low Stock Reorder Alerts</span>
          <div className="text-lg font-mono font-bold text-amber-700 mt-0.5">{totalLowStockAlerts} Warnings</div>
          <span className="text-[10px] text-amber-600 font-medium">Under Safety Buffer</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-slate-400 font-mono text-[10px] uppercase block font-bold">Active Pressing Season</span>
          <div className="text-lg font-mono font-bold text-emerald-800 mt-0.5">Sourani / Baladi 2026</div>
          <span className="text-[10px] text-slate-500 font-medium">Yield Efficiency: 21.8%</span>
        </div>
      </div>

      {/* 3. MULTI-TAB WORKSPACE NAVIGATION */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-2xs flex flex-wrap items-center gap-1.5 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`px-3.5 py-1.5 rounded-xl transition-all ${
            activeTab === 'catalog'
              ? 'bg-[#1e3a2b] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          📦 Products & Catalog ({inventory.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pressing')}
          className={`px-3.5 py-1.5 rounded-xl transition-all ${
            activeTab === 'pressing'
              ? 'bg-[#1e3a2b] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          🫒 Olive Pressing & Harvest Runs ({productionRuns.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('transfers')}
          className={`px-3.5 py-1.5 rounded-xl transition-all ${
            activeTab === 'transfers'
              ? 'bg-[#1e3a2b] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          🔄 Stock Transfers & Requisitions ({transfers.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('adjustments')}
          className={`px-3.5 py-1.5 rounded-xl transition-all ${
            activeTab === 'adjustments'
              ? 'bg-[#1e3a2b] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          ⚖️ Physical Count & Adjustments ({adjustments.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('suppliers')}
          className={`px-3.5 py-1.5 rounded-xl transition-all ${
            activeTab === 'suppliers'
              ? 'bg-[#1e3a2b] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          🤝 Suppliers & Farmers Directory ({suppliers.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reorder')}
          className={`px-3.5 py-1.5 rounded-xl transition-all ${
            activeTab === 'reorder'
              ? 'bg-[#1e3a2b] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          🔔 Reorder Guide & Alerts ({totalLowStockAlerts})
        </button>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: MASTER PRODUCTS & SERVICES CATALOG MATRIX                   */}
      {/* =================================================================== */}
      {activeTab === 'catalog' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          
          {/* Controls Bar: Branch Filter + Group Filter + Fast Search */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <label className="font-bold text-slate-700">Facility / Branch:</label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 text-xs focus:outline-none"
                >
                  <option value="ALL">All Branches (Global Inventory)</option>
                  <option value="Marjeyoun Press Mill">Marjeyoun Press Mill (Main Plant)</option>
                  <option value="Beirut Central Warehouse">Beirut Central Warehouse & Logistics</option>
                  <option value="Choueifat POS Store">Choueifat POS Store Front</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <label className="font-bold text-slate-700">Group:</label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 text-xs focus:outline-none"
                >
                  <option value="ALL">All Groups</option>
                  <option value="Raw Harvest">Raw Harvest</option>
                  <option value="Extra Virgin Oil">Extra Virgin Oil</option>
                  <option value="Bulk Tins">Bulk Tins (Tanakeh)</option>
                  <option value="Bottled & Packaged">Bottled & Packaged</option>
                  <option value="Packaging & Glass">Packaging & Glass</option>
                  <option value="Pomace & Byproducts">Pomace & Byproducts (Jift)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by SKU, Barcode, Description..."
                className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs w-64 focus:outline-none focus:border-slate-500"
              />
              <span className="font-mono text-slate-500 text-[11px]">
                Showing {filteredInventory.length} of {inventory.length}
              </span>
            </div>
          </div>

          {/* Master Condensed Matrix Table */}
          <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                  <th className="py-2.5 px-3 normal-case font-bold">branch</th>
                  <th className="py-2.5 px-3 normal-case font-bold">code / sku</th>
                  <th className="py-2.5 px-3 normal-case font-bold">barcode</th>
                  <th className="py-2.5 px-3 normal-case font-bold">item description</th>
                  <th className="py-2.5 px-3 normal-case font-bold">category group</th>
                  <th className="py-2.5 px-3 normal-case font-bold text-center">unit</th>
                  <th className="py-2.5 px-3 normal-case font-bold text-right">qty on hand</th>
                  <th className="py-2.5 px-3 normal-case font-bold text-right">unit cost ($)</th>
                  <th className="py-2.5 px-3 normal-case font-bold text-right">selling price ($)</th>
                  <th className="py-2.5 px-3 normal-case font-bold text-right">vat (%)</th>
                  <th className="py-2.5 px-3 normal-case font-bold text-center">status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11.5px] font-medium text-slate-800">
                {filteredInventory.map((item) => {
                  const isLow = item.qtyOnHand <= item.minReorderLevel;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-700">{item.branch}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-[#1e3a2b]">{item.code}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500 text-[10.5px]">{item.barcode}</td>
                      <td className="py-2.5 px-3">
                        <strong className="text-slate-900 block">{item.description}</strong>
                        <span className="text-[10px] text-slate-400 font-mono block">Supplier: {item.supplier}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold">
                          {item.group}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-600">{item.unit}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">
                        <span className={isLow ? 'text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200' : 'text-slate-900'}>
                          {item.qtyOnHand.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-700">
                        ${item.costUsd.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-[#1e3a2b]">
                        ${item.sellingPriceUsd.toFixed(2)}
                        <span className="text-[9.5px] text-slate-400 block font-normal">
                          {(item.sellingPriceLbp).toLocaleString()} LBP
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-500">{item.taxRate}%</td>
                      <td className="py-2.5 px-3 text-center">
                        {isLow ? (
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold">
                            ⚠️ Low Stock
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                            ✓ In Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredInventory.length === 0 && (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-slate-400 font-mono text-xs">
                      No inventory items match the current filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: OLIVE PRESSING & HARVEST PRODUCTION RUNS                    */}
      {/* =================================================================== */}
      {activeTab === 'pressing' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Industrial Press Mill Runs — Pieralisi Continuous Extraction
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Cold-pressing logs, acidity laboratory tests, yield percentage ratios, and pomace byproducts.
              </p>
            </div>
            <button
              type="button"
              onClick={() => alert('New Harvest Press Run record creation initiated.')}
              className="px-3 py-1.5 bg-[#1e3a2b] hover:bg-[#14281e] text-white rounded-xl text-xs font-bold shadow-xs"
            >
              + Log New Pressing Run
            </button>
          </div>

          <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                  <th className="py-2.5 px-3 normal-case font-bold">run no.</th>
                  <th className="py-2.5 px-3 normal-case font-bold">date</th>
                  <th className="py-2.5 px-3 normal-case font-bold">facility line</th>
                  <th className="py-2.5 px-3 normal-case font-bold">grower / cooperative</th>
                  <th className="py-2.5 px-3 normal-case font-bold text-center">variety</th>
                  <th className="py-2.5 px-3 normal-case font-bold text-right">raw olives (kg)</th>
                  <th className="py-2.5 px-3 normal-case font-bold text-right">acidity (%)</th>
                  <th className="py-2.5 px-3 normal-case font-bold text-right">oil yield (l)</th>
                  <th className="py-2.5 px-3 normal-case font-bold text-right">efficiency (%)</th>
                  <th className="py-2.5 px-3 normal-case font-bold text-center">settlement</th>
                  <th className="py-2.5 px-3 normal-case font-bold text-center">status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11.5px] font-medium text-slate-800">
                {productionRuns.map((run) => (
                  <tr key={run.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#1e3a2b]">{run.runNo}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{run.date}</td>
                    <td className="py-2.5 px-3 text-slate-700">{run.facility}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{run.farmerSupplier}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                        {run.oliveVariety}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {run.rawOlivesKg.toLocaleString()} KG
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">
                      {run.acidityTestPct}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">
                      {run.oilYieldLiters.toLocaleString()} Liters
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-extrabold text-[#1e3a2b]">
                      {run.yieldRatioPct}%
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold">
                        {run.settlementType === 'CASH_FEE' ? `$${run.pressingFeeUsd} Fee` : '10% Oil in Kind'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold">
                        ✓ {run.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: STOCK TRANSFERS & INTER-BRANCH REQUISITIONS                  */}
      {/* =================================================================== */}
      {activeTab === 'transfers' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Inter-Facility Stock Transfers & Hub Requisitions
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Live logistics tracking between Press Mill, Beirut Central Warehouse, and Choueifat POS.
              </p>
            </div>
            <button
              type="button"
              onClick={() => alert('New Inter-Facility Stock Transfer requisition initiated.')}
              className="px-3 py-1.5 bg-[#1e3a2b] hover:bg-[#14281e] text-white rounded-xl text-xs font-bold shadow-xs"
            >
              + Create Transfer Requisition
            </button>
          </div>

          <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                  <th className="py-2.5 px-3 normal-case font-bold">transfer no.</th>
                  <th className="py-2.5 px-3 normal-case font-bold">dispatch timestamp</th>
                  <th className="py-2.5 px-3 normal-case font-bold">source facility</th>
                  <th className="py-2.5 px-3 normal-case font-bold">destination depot</th>
                  <th className="py-2.5 px-3 normal-case font-bold text-center">items</th>
                  <th className="py-2.5 px-3 normal-case font-bold text-right">total volume</th>
                  <th className="py-2.5 px-3 normal-case font-bold">assigned courier</th>
                  <th className="py-2.5 px-3 normal-case font-bold text-center">vehicle plate</th>
                  <th className="py-2.5 px-3 normal-case font-bold text-center">status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11.5px] font-medium text-slate-800">
                {transfers.map((tr) => (
                  <tr key={tr.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#1e3a2b]">{tr.transferNo}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{tr.date}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{tr.sourceLocation}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{tr.destinationLocation}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold">{tr.itemsCount}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{tr.totalQty.toLocaleString()} units</td>
                    <td className="py-2.5 px-3 text-slate-700">{tr.transportedBy}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-600">{tr.vehiclePlate}</td>
                    <td className="py-2.5 px-3 text-center">
                      {tr.status === 'IN_TRANSIT' ? (
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-300 text-[10px] font-bold">
                          🚚 In Transit
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold">
                          ✓ Received
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 4: PHYSICAL INVENTORY COUNT & VARIANCE ADJUSTMENTS             */}
      {/* =================================================================== */}
      {activeTab === 'adjustments' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Physical Inventory Reconciliation & Loss Adjustments
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                System ledger vs. physical warehouse count with authorized variance adjustments and reason codes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => alert('New Physical Inventory Count Audit initialized.')}
              className="px-3 py-1.5 bg-[#1e3a2b] hover:bg-[#14281e] text-white rounded-xl text-xs font-bold shadow-xs"
            >
              + Log Variance Adjustment
            </button>
          </div>

          <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                  <th className="py-2.5 px-3 normal-case font-bold">adjustment no.</th>
                  <th className="py-2.5 px-3 normal-case font-bold">date</th>
                  <th className="py-2.5 px-3 normal-case font-bold">branch</th>
                  <th className="py-2.5 px-3 normal-case font-bold">sku & item description</th>
                  <th className="py-2.5 px-3 normal-case font-bold text-right">system qty</th>
                  <th className="py-2.5 px-3 normal-case font-bold text-right">counted qty</th>
                  <th className="py-2.5 px-3 normal-case font-bold text-right">variance</th>
                  <th className="py-2.5 px-3 normal-case font-bold text-right">loss value ($)</th>
                  <th className="py-2.5 px-3 normal-case font-bold">reason code</th>
                  <th className="py-2.5 px-3 normal-case font-bold">authorized by</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11.5px] font-medium text-slate-800">
                {adjustments.map((adj) => (
                  <tr key={adj.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#1e3a2b]">{adj.adjustmentNo}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{adj.date}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{adj.branch}</td>
                    <td className="py-2.5 px-3">
                      <strong className="text-slate-900 block font-mono">{adj.itemCode}</strong>
                      <span className="text-[10px] text-slate-500 block">{adj.itemDescription}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold">{adj.systemQty}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{adj.countedQty}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-700">
                      {adj.varianceQty > 0 ? `+${adj.varianceQty}` : adj.varianceQty}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-700">
                      ${adj.varianceValueUsd.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-900 border border-rose-200 text-[10px] font-bold">
                        {adj.reason}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 text-[11px] font-medium">{adj.approvedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 5: SUPPLIERS & FARMERS DIRECTORY                               */}
      {/* =================================================================== */}
      {activeTab === 'suppliers' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Master Suppliers & Olive Grove Farmers Directory
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Agricultural suppliers, glass packaging manufacturers, and tinplate can providers with ledger balances.
              </p>
            </div>
            <button
              type="button"
              onClick={() => alert('New Supplier Onboarding modal opened.')}
              className="px-3 py-1.5 bg-[#1e3a2b] hover:bg-[#14281e] text-white rounded-xl text-xs font-bold shadow-xs"
            >
              + Onboard New Supplier
            </button>
          </div>

          <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                  <th className="py-2.5 px-3 normal-case font-bold">code</th>
                  <th className="py-2.5 px-3 normal-case font-bold">supplier name</th>
                  <th className="py-2.5 px-3 normal-case font-bold">region / origin</th>
                  <th className="py-2.5 px-3 normal-case font-bold">category</th>
                  <th className="py-2.5 px-3 normal-case font-bold">contact person</th>
                  <th className="py-2.5 px-3 normal-case font-bold">phone</th>
                  <th className="py-2.5 px-3 normal-case font-bold text-center">payment terms</th>
                  <th className="py-2.5 px-3 normal-case font-bold text-right">outstanding balance ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11.5px] font-medium text-slate-800">
                {suppliers.map((sup) => (
                  <tr key={sup.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#1e3a2b]">{sup.code}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{sup.name}</td>
                    <td className="py-2.5 px-3 text-slate-600">{sup.regionTown}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold">
                        {sup.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">{sup.contactPerson}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">{sup.phone}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200 text-[10px] font-bold">
                        {sup.terms}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      ${sup.outstandingBalanceUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 6: REORDER GUIDE & LOW STOCK ALERT BUFFER                      */}
      {/* =================================================================== */}
      {activeTab === 'reorder' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Automated Reorder Guide & Safety Stock Threshold Warnings
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Items currently at or below minimum threshold levels requiring immediate purchase order requisition.
              </p>
            </div>
            <button
              type="button"
              onClick={() => alert('Automated Purchase Orders generated for all low stock items.')}
              className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold shadow-xs"
            >
              ⚡ Generate Batch Purchase Orders
            </button>
          </div>

          <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                  <th className="py-2.5 px-3 normal-case font-bold">branch</th>
                  <th className="py-2.5 px-3 normal-case font-bold">code / sku</th>
                  <th className="py-2.5 px-3 normal-case font-bold">description</th>
                  <th className="py-2.5 px-3 normal-case font-bold text-center">unit</th>
                  <th className="py-2.5 px-3 normal-case font-bold text-right">current stock</th>
                  <th className="py-2.5 px-3 normal-case font-bold text-right">min safety buffer</th>
                  <th className="py-2.5 px-3 normal-case font-bold text-right">recommended order</th>
                  <th className="py-2.5 px-3 normal-case font-bold">primary supplier</th>
                  <th className="py-2.5 px-3 normal-case font-bold text-center">action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11.5px] font-medium text-slate-800">
                {inventory
                  .filter((item) => item.qtyOnHand <= item.minReorderLevel)
                  .map((item) => {
                    const recommendedOrder = item.minReorderLevel * 2 - item.qtyOnHand;
                    return (
                      <tr key={item.id} className="bg-amber-50/40 hover:bg-amber-50">
                        <td className="py-2.5 px-3 font-semibold text-slate-700">{item.branch}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-amber-900">{item.code}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{item.description}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-600">{item.unit}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-extrabold text-amber-700">
                          {item.qtyOnHand}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-700">
                          {item.minReorderLevel}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">
                          +{recommendedOrder > 0 ? recommendedOrder : item.minReorderLevel}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 text-[11px]">{item.supplier}</td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => alert(`Purchase Order Draft created for ${item.code}!`)}
                            className="px-2.5 py-1 bg-[#1e3a2b] hover:bg-[#14281e] text-white rounded-lg text-[10px] font-bold"
                          >
                            + Draft PO
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                {inventory.filter((item) => item.qtyOnHand <= item.minReorderLevel).length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400 font-mono text-xs">
                      ✓ All products are currently stocked above their minimum safety thresholds.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: ADD NEW INVENTORY PRODUCT / RAW MATERIAL                     */}
      {/* =================================================================== */}
      {showNewItemModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Add New Product or Inventory Material</h3>
                <span className="text-[11px] text-slate-500 font-mono">Southern Olive Oil Products S.A.R.L Master Catalog</span>
              </div>
              <button
                type="button"
                onClick={() => setShowNewItemModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewItem} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Item Code / SKU *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EVOO-B-250ML"
                    value={newItem.code}
                    onChange={(e) => setNewItem({ ...newItem, code: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-mono uppercase font-bold focus:outline-none focus:border-slate-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Barcode (EAN-13)</label>
                  <input
                    type="text"
                    placeholder="e.g. 528001092..."
                    value={newItem.barcode}
                    onChange={(e) => setNewItem({ ...newItem, barcode: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-mono focus:outline-none focus:border-slate-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Item Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Extra Virgin Olive Oil 250ml Glass Bottle"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-medium focus:outline-none focus:border-slate-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category Group</label>
                  <select
                    value={newItem.group}
                    onChange={(e) => setNewItem({ ...newItem, group: e.target.value as any })}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-xl font-bold bg-white text-xs focus:outline-none"
                  >
                    <option value="Extra Virgin Oil">Extra Virgin Oil</option>
                    <option value="Virgin Oil">Virgin Oil</option>
                    <option value="Bulk Tins">Bulk Tins (Tanakeh)</option>
                    <option value="Bottled & Packaged">Bottled & Packaged</option>
                    <option value="Raw Harvest">Raw Harvest</option>
                    <option value="Packaging & Glass">Packaging & Glass</option>
                    <option value="Pomace & Byproducts">Pomace & Byproducts</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Primary Facility</label>
                  <select
                    value={newItem.branch}
                    onChange={(e) => setNewItem({ ...newItem, branch: e.target.value })}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-xl font-bold bg-white text-xs focus:outline-none"
                  >
                    <option value="Marjeyoun Press Mill">Marjeyoun Press Mill</option>
                    <option value="Beirut Central Warehouse">Beirut Central Warehouse</option>
                    <option value="Choueifat POS Store">Choueifat POS Store</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit of Measure</label>
                  <select
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value as any })}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-xl font-bold bg-white text-xs focus:outline-none"
                  >
                    <option value="750ml Bottle">750ml Bottle</option>
                    <option value="500ml Bottle">500ml Bottle</option>
                    <option value="16L Tin">16L Tin</option>
                    <option value="10L Tin">10L Tin</option>
                    <option value="KG">KG</option>
                    <option value="Liter">Liter</option>
                    <option value="Piece">Piece</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Qty</label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.qtyOnHand}
                    onChange={(e) => setNewItem({ ...newItem, qtyOnHand: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl font-mono text-right text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Reorder Level</label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.minReorderLevel}
                    onChange={(e) => setNewItem({ ...newItem, minReorderLevel: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl font-mono text-right text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cost Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newItem.costUsd}
                    onChange={(e) => setNewItem({ ...newItem, costUsd: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl font-mono text-right text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Selling Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newItem.sellingPriceUsd}
                    onChange={(e) => setNewItem({ ...newItem, sellingPriceUsd: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl font-mono text-right font-bold text-[#1e3a2b] text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewItemModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1e3a2b] hover:bg-[#14281e] text-white font-bold rounded-xl text-xs shadow-md"
                >
                  Save to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function OperationsCenterPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-mono text-slate-400">Loading Operations Center...</div>}>
      <OperationsCenterContent />
    </Suspense>
  );
}
