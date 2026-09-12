'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  Edit2,
  Save,
  Trash2,
  RefreshCw,
  Copy,
  Printer,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Package,
  Layers,
  Calendar,
  BarChart2,
  History,
  Image as ImageIcon,
  Video,
  List,
  DollarSign,
  Barcode,
  ExternalLink,
  ShieldAlert,
  SlidersHorizontal,
  FileSpreadsheet,
  Settings
} from 'lucide-react';
import {
  AuthenticProductRecord,
  INITIAL_OMEGA_PRODUCTS,
  OMEGA_PRODUCT_CATEGORIES,
  OMEGA_SELLING_FUNCTIONS,
  OMEGA_LOGICAL_WAREHOUSES,
  OMEGA_ITEM_BRANDS,
  OMEGA_SOURCES
} from '@/lib/omegaProductsData';
import { INITIAL_OMEGA_INV_DIVISIONS } from '@/lib/omegaInventoryDivisionData';
import { INITIAL_OMEGA_INV_GROUPS } from '@/lib/omegaInventoryGroupData';
import { INITIAL_OMEGA_SUPPLIERS, SupplierItem } from '@/lib/omegaSuppliersData';
import { INITIAL_OMEGA_LOCATIONS, LocationItem } from '@/lib/omegaLocationsData';
import { INITIAL_OMEGA_UNITS, UnitItem } from '@/lib/omegaUnitsData';
import { OMEGA_BRANCHES, BranchOption } from '@/lib/omegaDepartmentsData';

export default function AuthenticOmegaProductsServicesView() {
  // Master Products State (synced with localStorage)
  const [products, setProducts] = useState<AuthenticProductRecord[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('vanguard_omega_products_catalog');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.error('Error reading saved products:', e);
      }
    }
    return INITIAL_OMEGA_PRODUCTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('vanguard_omega_products_catalog', JSON.stringify(products));
    } catch (e) {
      console.error('Error saving products:', e);
    }
  }, [products]);

  // Hierarchy Navigation States
  const [selectedCategory, setSelectedCategory] = useState<string>('مفرق');
  const [selectedDivision, setSelectedDivision] = useState<string>('مقطرات ومدبسات مفرق');
  const [selectedGroups, setSelectedGroups] = useState<string[]>(['مقطرات مفرق 250مل']);
  const [isMultiGroup, setIsMultiGroup] = useState<boolean>(false);

  // Toolbar Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<string>('All');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('All');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [selectedSource, setSelectedSource] = useState<string>('All');
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState<boolean>(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState<boolean>(false);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState<boolean>(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);

  // More Filter Checkboxes
  const [showDiscontinuedOnly, setShowDiscontinuedOnly] = useState<boolean>(false);
  const [showAssemblyOnly, setShowAssemblyOnly] = useState<boolean>(false);
  const [showBelowReorderOnly, setShowBelowReorderOnly] = useState<boolean>(false);
  const [showWithoutBarcodeOnly, setShowWithoutBarcodeOnly] = useState<boolean>(false);

  // Sorting
  const [sortField, setSortField] = useState<keyof AuthenticProductRecord>('id');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 15;

  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [activeModalTab, setActiveModalTab] = useState<
    'main' | 'stock' | 'media' | 'assembly' | 'included' | 'history' | 'sales' | 'more'
  >('main');
  const [historySubTab, setHistorySubTab] = useState<'movements' | 'priceLogs' | 'audit'>('movements');
  const [moreSubTab, setMoreSubTab] = useState<'accounts' | 'taxes' | 'advanced'>('accounts');

  // Active product being edited
  const [editingProduct, setEditingProduct] = useState<AuthenticProductRecord | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Refs for dropdown closing
  const moreRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setIsActionsMenuOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Divisions matching current category
  const availableDivisions = useMemo(() => {
    const divs = INITIAL_OMEGA_INV_DIVISIONS.filter(
      (d) => d.CATEGORYNAME === selectedCategory || (selectedCategory === 'Raw Materials' && d.CATEGORYNAME === 'Raw Materials')
    );
    const uniqueNames: string[] = [];
    divs.forEach((d) => {
      if (!uniqueNames.includes(d.DIVISIONNAME)) uniqueNames.push(d.DIVISIONNAME);
    });
    return uniqueNames;
  }, [selectedCategory]);

  // Groups matching current division
  const availableGroups = useMemo(() => {
    return INITIAL_OMEGA_INV_GROUPS.filter((g) => g.DIVISIONNAME === selectedDivision);
  }, [selectedDivision]);

  // Update selectedDivision when category changes if needed
  useEffect(() => {
    if (availableDivisions.length > 0 && !availableDivisions.includes(selectedDivision)) {
      setSelectedDivision(availableDivisions[0]);
    }
  }, [availableDivisions, selectedDivision]);

  // Update selectedGroups when division changes if needed
  useEffect(() => {
    if (availableGroups.length > 0) {
      if (!isMultiGroup || selectedGroups.length === 0) {
        setSelectedGroups([availableGroups[0].GROUPNAME]);
      }
    } else {
      setSelectedGroups([]);
    }
  }, [availableGroups, isMultiGroup]);

  // Handle group tab click
  const handleGroupClick = (groupName: string) => {
    if (isMultiGroup) {
      if (selectedGroups.includes(groupName)) {
        if (selectedGroups.length > 1) {
          setSelectedGroups(selectedGroups.filter((g) => g !== groupName));
        }
      } else {
        setSelectedGroups([...selectedGroups, groupName]);
      }
    } else {
      setSelectedGroups([groupName]);
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedBranch('All');
    setSelectedSupplier('All');
    setSelectedBrand('All');
    setSelectedSource('All');
    setShowDiscontinuedOnly(false);
    setShowAssemblyOnly(false);
    setShowBelowReorderOnly(false);
    setShowWithoutBarcodeOnly(false);
    showToast('Filters reset to default');
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchDesc = item.description?.toLowerCase().includes(q);
        const matchCode = item.code?.toLowerCase().includes(q);
        const matchBarcode = item.barcode?.toLowerCase().includes(q);
        if (!matchDesc && !matchCode && !matchBarcode) return false;
      }

      // Hierarchy match (if not searching globally)
      if (!searchQuery.trim()) {
        if (selectedCategory && item.categoryName !== selectedCategory) return false;
        if (selectedDivision && item.divisionName !== selectedDivision) return false;
        if (selectedGroups.length > 0 && !selectedGroups.includes(item.groupName)) return false;
      }

      // Supplier
      if (selectedSupplier !== 'All' && item.mainSupplierName !== selectedSupplier) return false;

      // Brand
      if (selectedBrand !== 'All' && item.itemBrand !== selectedBrand) return false;

      // Source
      if (selectedSource !== 'All' && (item.source || 'Local') !== selectedSource) return false;

      // More Filters
      if (showDiscontinuedOnly && !item.isDiscontinued) return false;
      if (showAssemblyOnly && (!item.assemblyItems || item.assemblyItems.length === 0)) return false;
      if (showBelowReorderOnly && item.qtyOH > 0) return false;
      if (showWithoutBarcodeOnly && item.barcode) return false;

      return true;
    });
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedDivision,
    selectedGroups,
    selectedSupplier,
    selectedBrand,
    selectedSource,
    showDiscontinuedOnly,
    showAssemblyOnly,
    showBelowReorderOnly,
    showWithoutBarcodeOnly
  ]);

  // Sorted Products
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (valA === undefined || valB === undefined) return 0;
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredProducts, sortField, sortAsc]);

  // Paginated Products
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(start, start + itemsPerPage);
  }, [sortedProducts, currentPage]);

  const handleSort = (field: keyof AuthenticProductRecord) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Open New Modal
  const openNewModal = () => {
    const newRecord: AuthenticProductRecord = {
      id: Math.max(...products.map((p) => p.id), 0) + 1,
      description: '',
      code: `ITEM-${Math.floor(1000 + Math.random() * 9000)}`,
      otherDescription: '',
      itemComment: '',
      secondLangDescription: '',
      secondLangItemComment: '',
      internalNote: '',
      categoryId: 2,
      categoryName: selectedCategory || 'مفرق',
      divisionId: 5,
      divisionName: selectedDivision || 'مقطرات ومدبسات مفرق',
      groupId: 14,
      groupName: selectedGroups[0] || 'مقطرات مفرق 250مل',
      sellingFunction: 'Revenue',
      defaultLocationId: 12,
      defaultLocationName: 'Showroom',
      logicalWarehouseId: 1,
      logicalWarehouseName: 'Main Store',
      mainSupplierId: 5,
      mainSupplierName: 'SOOL',
      lastSupplierName: 'SOOL',
      itemBrand: 'زيت و زيتون الجنوب',
      itemLeadTime: '2 Days',
      source: 'Local',
      buyingFormat: 'UNIT',
      inventoryFormat: 'UNIT',
      usageFormat: 'UNIT',
      qtyInBuyingFormat: 1,
      qtyInInventoryFormat: 1,
      packingProduction: 'Standard',
      qtyInPackingFormat: 1,
      unitCostLL: 0,
      averageCostLL: 0,
      unitCostUSD: 0,
      averageCostUSD: 0,
      additionalCostLL: 0,
      markupPct: 30,
      recommendedPriceLL: 0,
      sellingPrice1LL: 0,
      beforeTax1LL: 0,
      profit1Pct: 0,
      sellingPrice1USD: 0,
      sellingPrice2LL: 0,
      beforeTax2LL: 0,
      qtyPrice2: 1,
      profit2Pct: 0,
      sellingPrice2USD: 0,
      sellingPrice3LL: 0,
      beforeTax3LL: 0,
      qtyPrice3: 1,
      profit3Pct: 0,
      sellingPrice3USD: 0,
      sellingPrice4LL: 0,
      beforeTax4LL: 0,
      qtyPrice4: 1,
      profit4Pct: 0,
      sellingPrice4USD: 0,
      secondCurrencyRate: 90000,
      barcode: `${Math.floor(5280000000000 + Math.random() * 9999999999)}`,
      alternativeBarcode2: '',
      alternativeBarcode3: '',
      applySp2Qty2: false,
      rfidt1: '',
      rfidt2: '',
      qtyOH: 0.0,
      unit: 'UNIT',
      sellingPrice: 0,
      cost: 0,
      function: 'Revenue',
      updatedAt: '12 Sep, 2026',
      isDiscontinued: false,
      stockRecords: [
        { branchId: 1, branchName: 'Zeit w zaytoun ljanoub', warehouseId: 1, warehouseName: 'Main Store', locationId: 12, locationName: 'Showroom', qtyOH: 0, reorderLevel: 10, maxStock: 100, reservedQty: 0, availableQty: 0 }
      ],
      imageUrl: '',
      videoUrl: '',
      assemblyCalculationMethod: 'Automatic',
      assemblyItems: [],
      includedItems: [],
      movements: [],
      priceLogs: [],
      auditLogs: [],
      salesPerformance: [
        { month: 'Jan', monthIndex: 1, qtyThisYear: 0, salesThisYearLL: 0, qtyLastYear: 0, salesLastYearLL: 0 }
      ],
      assetAccount: '120101',
      expenseAccount: '510101',
      revenueAccount: '410101',
      stockVariationAccount: '510301',
      tax1: false,
      tax2: false,
      tax3: false,
      tax4: false,
      tax5: false,
      tax6: false,
      autoDiscount: 0
    };
    setEditingProduct(newRecord);
    setActiveModalTab('main');
    setIsNewModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (prod: AuthenticProductRecord) => {
    setEditingProduct(JSON.parse(JSON.stringify(prod)));
    setActiveModalTab('main');
    setIsEditModalOpen(true);
  };

  // Save Handlers
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (!editingProduct.description.trim()) {
      alert('Description is required');
      return;
    }

    if (isNewModalOpen) {
      setProducts([editingProduct, ...products]);
      setIsNewModalOpen(false);
      showToast(`Product "${editingProduct.description}" created successfully`);
    } else {
      setProducts(products.map((p) => (p.id === editingProduct.id ? editingProduct : p)));
      setIsEditModalOpen(false);
      showToast(`Product "${editingProduct.description}" updated successfully`);
    }
  };

  // Recalculate Prices / Margin
  const handleRecalculateCost = () => {
    if (!editingProduct) return;
    const markup = editingProduct.markupPct || 30;
    const costLL = editingProduct.unitCostLL || 0;
    const recommended = Math.round(costLL * (1 + markup / 100));
    const profitPct = recommended > 0 ? Number((((recommended - costLL) / recommended) * 100).toFixed(2)) : 0;

    setEditingProduct({
      ...editingProduct,
      recommendedPriceLL: recommended,
      sellingPrice1LL: editingProduct.sellingPrice1LL || recommended,
      profit1Pct: profitPct
    });
    showToast('Costs and recommended selling price recalculated');
  };

  // Refresh Sales Performance
  const handleRefreshPerformance = () => {
    showToast('Sales performance telemetry refreshed from live POS journals');
  };

  return (
    <div className="space-y-4 text-xs font-sans text-slate-800">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2.5 bg-[#323f4b] text-white px-4 py-2.5 rounded-sm shadow-xl animate-fade-in border border-slate-600 text-xs">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="hover:opacity-75 cursor-pointer ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header & Breadcrumbs (Matching Screenshot 1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
        <div>
          <h1 className="text-[20px] font-normal text-[#4d5b76]">Products & Services</h1>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
            <span className="text-[#195a96] hover:underline cursor-pointer">Home</span>
            <span>/</span>
            <span>Products & Services</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="#tutorial"
            onClick={(e) => {
              e.preventDefault();
              showToast('Opening Omega Products Tutorial Video');
            }}
            className="text-[12px] text-[#195a96] hover:underline cursor-pointer flex items-center gap-1 font-medium"
          >
            <span>Watch Tutorial</span>
          </a>
        </div>
      </div>

      {/* Toolbar Row 1: Search, Branch, and Action Buttons (Matching Screenshot 1) */}
      <div className="bg-white border border-slate-200 rounded-sm p-3 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-1 flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by description, code or barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-sm border border-slate-300 bg-white text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Select Branch */}
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full sm:w-64 px-3 py-1.5 rounded-sm border border-slate-300 bg-white text-xs text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="All">Select Branch</option>
              {OMEGA_BRANCHES.map((b: BranchOption) => (
                <option key={b.BRANCHID} value={b.BARANCHNAME}>
                  {b.BARANCHNAME}
                </option>
              ))}
            </select>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 self-end lg:self-auto">
            {/* + New Button */}
            <button
              type="button"
              onClick={openNewModal}
              className="px-3.5 py-1.5 rounded-sm bg-[#323f4b] hover:bg-[#28323c] text-white text-xs font-semibold flex items-center gap-1 shadow-2xs cursor-pointer transition"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New</span>
            </button>

            {/* Filters Button */}
            <button
              type="button"
              onClick={() => setIsFilterModalOpen(true)}
              className="px-3 py-1.5 rounded-sm bg-[#323f4b] hover:bg-[#28323c] text-white text-xs font-semibold flex items-center gap-1 shadow-2xs cursor-pointer transition"
            >
              <Filter className="w-3 h-3" />
              <span>Filters</span>
            </button>

            {/* Sorting Button */}
            <div className="relative" ref={sortRef}>
              <button
                type="button"
                onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                className="px-3 py-1.5 rounded-sm bg-[#323f4b] hover:bg-[#28323c] text-white text-xs font-semibold flex items-center gap-1 shadow-2xs cursor-pointer transition"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Sorting</span>
              </button>

              {isSortMenuOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-sm shadow-xl py-1 z-30 text-xs animate-fade-in">
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400">Sort By</div>
                  <button
                    type="button"
                    onClick={() => {
                      handleSort('description');
                      setIsSortMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-slate-100 flex items-center justify-between"
                  >
                    <span>Description (A-Z)</span>
                    {sortField === 'description' && <Check className="w-3 h-3 text-blue-600" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleSort('code');
                      setIsSortMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-slate-100 flex items-center justify-between"
                  >
                    <span>Product Code</span>
                    {sortField === 'code' && <Check className="w-3 h-3 text-blue-600" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleSort('sellingPrice');
                      setIsSortMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-slate-100 flex items-center justify-between"
                  >
                    <span>Selling Price</span>
                    {sortField === 'sellingPrice' && <Check className="w-3 h-3 text-blue-600" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleSort('cost');
                      setIsSortMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-slate-100 flex items-center justify-between"
                  >
                    <span>Cost LL</span>
                    {sortField === 'cost' && <Check className="w-3 h-3 text-blue-600" />}
                  </button>
                </div>
              )}
            </div>

            {/* Actions Dropdown */}
            <div className="relative" ref={actionsRef}>
              <button
                type="button"
                onClick={() => setIsActionsMenuOpen(!isActionsMenuOpen)}
                className="px-3 py-1.5 rounded-sm bg-[#323f4b] hover:bg-[#28323c] text-white text-xs font-semibold flex items-center gap-1 shadow-2xs cursor-pointer transition"
              >
                <span>Actions</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {isActionsMenuOpen && (
                <div className="absolute right-0 mt-1 w-52 bg-white border border-slate-200 rounded-sm shadow-xl py-1 z-30 text-xs animate-fade-in">
                  <button
                    type="button"
                    onClick={() => {
                      setIsActionsMenuOpen(false);
                      showToast('Exporting 1,289 items to Excel / CSV format');
                    }}
                    className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
                    <span>Export to Excel / CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsActionsMenuOpen(false);
                      showToast('Opening Barcode Labels Printing Dialog');
                    }}
                    className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                  >
                    <Barcode className="w-3.5 h-3.5 text-slate-500" />
                    <span>Print Barcodes / Labels</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsActionsMenuOpen(false);
                      showToast('Bulk Price Adjustment Wizard Ready');
                    }}
                    className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                  >
                    <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                    <span>Bulk Price Adjustment</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Toolbar Row 2: Secondary Dropdowns & Multi-Group Selection (Matching Screenshot 1) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            {/* All Suppliers Dropdown */}
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="px-2.5 py-1 rounded-sm border border-slate-300 bg-white text-xs text-slate-700 focus:outline-none focus:border-blue-500 min-w-[130px]"
            >
              <option value="All">All Suppliers</option>
              {INITIAL_OMEGA_SUPPLIERS.map((s: SupplierItem) => (
                <option key={s.SUPPLIERID} value={s.SUPPLIERNAME}>
                  {s.SUPPLIERNAME}
                </option>
              ))}
            </select>

            {/* All Item Brands Dropdown */}
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="px-2.5 py-1 rounded-sm border border-slate-300 bg-white text-xs text-slate-700 focus:outline-none focus:border-blue-500 min-w-[130px]"
            >
              <option value="All">All Item Brands</option>
              {OMEGA_ITEM_BRANDS.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>

            {/* All Sources Dropdown */}
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="px-2.5 py-1 rounded-sm border border-slate-300 bg-white text-xs text-slate-700 focus:outline-none focus:border-blue-500 min-w-[120px]"
            >
              <option value="All">All Sources</option>
              {OMEGA_SOURCES.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* More Menu Dropdown */}
            <div className="relative" ref={moreRef}>
              <button
                type="button"
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className="px-3 py-1 rounded-sm border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-normal flex items-center gap-1 cursor-pointer transition"
              >
                <span>More</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isMoreMenuOpen && (
                <div className="absolute left-0 mt-1 w-64 bg-white border border-slate-200 rounded-sm shadow-xl p-3 z-30 space-y-2 text-xs animate-fade-in">
                  <div className="font-semibold text-slate-700 border-b border-slate-100 pb-1 mb-2">
                    Advanced Filters
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showDiscontinuedOnly}
                      onChange={(e) => setShowDiscontinuedOnly(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600"
                    />
                    <span>Show Discontinued Only</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showAssemblyOnly}
                      onChange={(e) => setShowAssemblyOnly(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600"
                    />
                    <span>Assembly / Recipes Only</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showBelowReorderOnly}
                      onChange={(e) => setShowBelowReorderOnly(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600"
                    />
                    <span>Below Reorder Level Only</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showWithoutBarcodeOnly}
                      onChange={(e) => setShowWithoutBarcodeOnly(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600"
                    />
                    <span>Items Without Barcode Only</span>
                  </label>
                </div>
              )}
            </div>

            {/* Clear Button [ ✖ ] (Dark Red #5c2828) */}
            <button
              type="button"
              onClick={handleClearFilters}
              title="Reset all filters"
              className="p-1.5 bg-[#5c2828] hover:bg-[#481e1e] text-white rounded-xs cursor-pointer transition shadow-2xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Multi-Group Selection Checkbox */}
            <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer select-none ml-2">
              <input
                type="checkbox"
                checked={isMultiGroup}
                onChange={(e) => setIsMultiGroup(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <span className="font-medium">Multi-Group Selection</span>
            </label>
          </div>

          {/* Right Statistics Text */}
          <div className="text-right text-[11px] text-slate-600 font-medium">
            <div>Total Nb. of Items: <span className="text-slate-900 font-bold">1289</span></div>
            <div className="text-slate-500">Discontinued: <span className="text-red-700 font-semibold">92</span></div>
          </div>
        </div>
      </div>

      {/* =======================================================================
          3-TIER HIERARCHICAL NAVIGATION (Matching Screenshot 1)
          ======================================================================= */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden">
        {/* Tier 1: Categories */}
        <div className="bg-[#f8fafc] border-b border-slate-200 px-2 py-1 flex items-center gap-1 overflow-x-auto">
          <button
            type="button"
            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
            title="Scroll Left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-1.5 flex-1 overflow-x-auto">
            {OMEGA_PRODUCT_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.name);
                }}
                className={`px-3.5 py-1 text-xs font-semibold rounded-xs transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.name
                    ? 'bg-white text-slate-900 border border-slate-300 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
            title="Scroll Right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tier 2: Divisions */}
        <div className="bg-[#f1f5f9] border-b border-slate-200 px-2 py-1 flex items-center gap-1 overflow-x-auto">
          <button
            type="button"
            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
            title="Scroll Left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-1 flex-1 overflow-x-auto">
            {availableDivisions.map((divName) => (
              <button
                key={divName}
                type="button"
                onClick={() => setSelectedDivision(divName)}
                className={`px-3 py-1 text-[11px] font-medium rounded-xs transition-colors cursor-pointer whitespace-nowrap ${
                  selectedDivision === divName
                    ? 'bg-white text-slate-900 border border-slate-300 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {divName}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
            title="Scroll Right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tier 3: Groups with Item Count Badges */}
        <div className="bg-white px-2 py-1 flex items-center gap-1 overflow-x-auto">
          <button
            type="button"
            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
            title="Scroll Left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-1.5 flex-1 overflow-x-auto">
            {availableGroups.map((grp) => {
              const isSelected = selectedGroups.includes(grp.GROUPNAME);
              return (
                <button
                  key={grp.ID}
                  type="button"
                  onClick={() => handleGroupClick(grp.GROUPNAME)}
                  className={`px-3 py-1 text-[11px] rounded-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#e2e8f0] text-slate-900 font-bold border border-slate-400 shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-100 font-medium'
                  }`}
                >
                  <span>{grp.GROUPNAME}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {grp.itemsCount}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
            title="Scroll Right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* =======================================================================
          PRODUCTS & SERVICES DATA TABLE (Matching Screenshot 1)
          ======================================================================= */}
      <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#f8fafc] text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th
                  onClick={() => handleSort('description')}
                  className="px-3 py-2.5 cursor-pointer hover:bg-slate-100 select-none min-w-[160px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Description</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('code')}
                  className="px-3 py-2.5 cursor-pointer hover:bg-slate-100 select-none min-w-[120px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Code</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('groupName')}
                  className="px-3 py-2.5 cursor-pointer hover:bg-slate-100 select-none min-w-[130px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Group</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('qtyOH')}
                  className="px-3 py-2.5 cursor-pointer hover:bg-slate-100 select-none min-w-[70px] text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Qty OH</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('unit')}
                  className="px-3 py-2.5 cursor-pointer hover:bg-slate-100 select-none min-w-[60px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Unit</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('sellingPrice')}
                  className="px-3 py-2.5 cursor-pointer hover:bg-slate-100 select-none min-w-[90px] text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Selling Price</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('cost')}
                  className="px-3 py-2.5 cursor-pointer hover:bg-slate-100 select-none min-w-[80px] text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Cost</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('buyingFormat')}
                  className="px-3 py-2.5 cursor-pointer hover:bg-slate-100 select-none min-w-[80px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Buying Format</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('function')}
                  className="px-3 py-2.5 cursor-pointer hover:bg-slate-100 select-none min-w-[80px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Function</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('updatedAt')}
                  className="px-3 py-2.5 cursor-pointer hover:bg-slate-100 select-none min-w-[90px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Updated At</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-3 py-2.5 w-16 text-center">
                  <span className="bg-[#195a96] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-xs">
                    {filteredProducts.length}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2 font-medium text-slate-900">{prod.description}</td>
                    <td className="px-3 py-2 font-mono text-slate-600 text-[11px]">{prod.code}</td>
                    <td className="px-3 py-2 text-slate-700">{prod.groupName}</td>
                    <td className="px-3 py-2 text-right font-medium">
                      <span className={prod.qtyOH <= 0 ? 'text-red-600 font-bold' : 'text-slate-800'}>
                        {Number(prod.qtyOH).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-700 font-medium">{prod.unit}</td>
                    <td className="px-3 py-2 text-right text-slate-900 font-semibold">
                      {Number(prod.sellingPrice).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-600">
                      {Number(prod.cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 py-2 text-slate-700">{prod.buyingFormat}</td>
                    <td className="px-3 py-2 text-slate-700">{prod.function}</td>
                    <td className="px-3 py-2 text-slate-500 text-[11px]">{prod.updatedAt}</td>
                    <td className="px-3 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => openEditModal(prod)}
                        className="bg-[#323f4b] hover:bg-[#28323c] text-white p-1 rounded-xs cursor-pointer shadow-2xs transition"
                        title="Edit Product"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="px-3 py-8 text-center text-slate-400">
                    No items found matching the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-4 py-2.5 border-t border-slate-200 flex items-center justify-between text-xs bg-[#f8fafc]">
          <span className="text-slate-500">
            Showing {filteredProducts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} entries
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="px-2 py-1 rounded-sm border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              «
            </button>
            <span className="px-3 py-1 font-semibold text-slate-700 bg-white border border-slate-300 rounded-sm">
              {currentPage}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-2 py-1 rounded-sm border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              »
            </button>
          </div>
        </div>
      </div>

      {/* =======================================================================
          MODAL 1: NEW INVENTORY ITEM (Matching Screenshot 4)
          Only 3 tabs: Main, More, Pictures & Videos
          ======================================================================= */}
      {isNewModalOpen && editingProduct && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-fade-in overflow-y-auto"
          style={{ zIndex: 60000 }}
        >
          <div
            className="bg-white border border-slate-300 w-full text-slate-800 shadow-2xl max-w-4xl rounded-sm overflow-hidden my-6 relative flex flex-col max-h-[90vh]"
            style={{ zIndex: 60001 }}
          >
            {/* Header */}
            <div className="px-6 py-3.5 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
              <h2 className="text-[18px] font-normal text-[#4d5b76]">New Inventory Item</h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveProduct}
                  className="px-4 py-1.5 rounded-sm bg-[#323f4b] hover:bg-[#28323c] text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 text-xl leading-none cursor-pointer"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Navigation Tabs on New Item: Exactly Main, More, Pictures & Videos */}
            <div className="px-6 border-b border-slate-200 flex items-center gap-4 text-xs font-medium bg-[#f8fafc] shrink-0">
              <button
                type="button"
                onClick={() => setActiveModalTab('main')}
                className={`py-2.5 border-b-2 transition-colors cursor-pointer ${
                  activeModalTab === 'main'
                    ? 'border-[#195a96] text-[#195a96] font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Main
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('more')}
                className={`py-2.5 border-b-2 transition-colors cursor-pointer ${
                  activeModalTab === 'more'
                    ? 'border-[#195a96] text-[#195a96] font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                More
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('media')}
                className={`py-2.5 border-b-2 transition-colors cursor-pointer ${
                  activeModalTab === 'media'
                    ? 'border-[#195a96] text-[#195a96] font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Pictures & Videos
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {activeModalTab === 'main' && (
                <>
                  {/* Card: General */}
                  <div className="border border-slate-200 rounded-sm overflow-hidden">
                    <div className="bg-[#f8fafc] px-4 py-2 border-b border-slate-200 font-semibold text-slate-800">
                      General
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-slate-700 font-medium mb-1">Description*</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              required
                              placeholder="Search in Omega Marketplace"
                              value={editingProduct.description}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, description: e.target.value })
                              }
                              className="flex-1 px-3 py-1.5 text-xs rounded-sm border border-blue-400 bg-white focus:outline-none focus:border-blue-500"
                            />
                            <button
                              type="button"
                              title="Search in Omega Marketplace"
                              className="px-2.5 py-1.5 bg-[#23783a] hover:bg-[#1b602e] text-white rounded-sm cursor-pointer"
                            >
                              <Search className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-700 font-medium mb-1">Product Code*</label>
                          <input
                            type="text"
                            required
                            value={editingProduct.code}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, code: e.target.value })
                            }
                            className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-medium mb-1">
                            Other Description || Supplier Item Code
                          </label>
                          <input
                            type="text"
                            value={editingProduct.otherDescription}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, otherDescription: e.target.value })
                            }
                            className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-700 font-medium mb-1">Second Lang Description</label>
                          <input
                            type="text"
                            value={editingProduct.secondLangDescription}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, secondLangDescription: e.target.value })
                            }
                            className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-medium mb-1">Second Lang Item Comment</label>
                          <input
                            type="text"
                            value={editingProduct.secondLangItemComment}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, secondLangItemComment: e.target.value })
                            }
                            className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-medium mb-1">Item Comment</label>
                        <input
                          type="text"
                          value={editingProduct.itemComment}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, itemComment: e.target.value })
                          }
                          className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-medium mb-1">Internal Note</label>
                        <input
                          type="text"
                          value={editingProduct.internalNote}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, internalNote: e.target.value })
                          }
                          className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-700 font-medium mb-1">Group*</label>
                          <div className="flex">
                            <select
                              value={editingProduct.groupName}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, groupName: e.target.value })
                              }
                              className="flex-1 px-3 py-1.5 text-xs rounded-l-sm rounded-r-none border border-r-0 border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                            >
                              <option value="">Select group</option>
                              {INITIAL_OMEGA_INV_GROUPS.map((g) => (
                                <option key={g.ID} value={g.GROUPNAME}>
                                  {g.GROUPNAME}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              title="Add Group"
                              className="px-2.5 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-r-sm cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-700 font-medium mb-1">Selling Function</label>
                          <select
                            value={editingProduct.sellingFunction}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, sellingFunction: e.target.value })
                            }
                            className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                          >
                            {OMEGA_SELLING_FUNCTIONS.map((f) => (
                              <option key={f.id} value={f.name}>
                                {f.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-700 font-medium mb-1">Default Location</label>
                          <div className="flex">
                            <select
                              value={editingProduct.defaultLocationName}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, defaultLocationName: e.target.value })
                              }
                              className="flex-1 px-3 py-1.5 text-xs rounded-l-sm rounded-r-none border border-r-0 border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                            >
                              <option value="">Select location</option>
                              {INITIAL_OMEGA_LOCATIONS.map((l: LocationItem) => (
                                <option key={l.LOCATIONID} value={l.LOCATIONDESCRIPTION}>
                                  {l.LOCATIONDESCRIPTION}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              title="Add Location"
                              className="px-2.5 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-r-sm cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-700 font-medium mb-1">Logical Warehouse *</label>
                          <select
                            value={editingProduct.logicalWarehouseName}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, logicalWarehouseName: e.target.value })
                            }
                            className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                          >
                            {OMEGA_LOGICAL_WAREHOUSES.map((w) => (
                              <option key={w.id} value={w.name}>
                                {w.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-slate-700 font-medium mb-1">Main Supplier*</label>
                          <div className="flex">
                            <select
                              value={editingProduct.mainSupplierName}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, mainSupplierName: e.target.value })
                              }
                              className="flex-1 px-3 py-1.5 text-xs rounded-l-sm rounded-r-none border border-r-0 border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                            >
                              {INITIAL_OMEGA_SUPPLIERS.map((s: SupplierItem) => (
                                <option key={s.SUPPLIERID} value={s.SUPPLIERNAME}>
                                  {s.SUPPLIERNAME}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              title="Add Supplier"
                              className="px-2.5 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-r-sm cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-700 font-medium mb-1">Item Brand</label>
                          <div className="flex">
                            <select
                              value={editingProduct.itemBrand}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, itemBrand: e.target.value })
                              }
                              className="flex-1 px-3 py-1.5 text-xs rounded-l-sm rounded-r-none border border-r-0 border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                            >
                              <option value="">Select Item Brand</option>
                              {OMEGA_ITEM_BRANDS.map((b) => (
                                <option key={b.id} value={b.name}>
                                  {b.name}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              title="Add Brand"
                              className="px-2.5 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-r-sm cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-700 font-medium mb-1">Source</label>
                          <div className="flex">
                            <select
                              value={editingProduct.source || 'Local'}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, source: e.target.value })
                              }
                              className="flex-1 px-3 py-1.5 text-xs rounded-l-sm rounded-r-none border border-r-0 border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                            >
                              <option value="">Select Source</option>
                              {OMEGA_SOURCES.map((s) => (
                                <option key={s.id} value={s.name}>
                                  {s.name}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              title="Add Source"
                              className="px-2.5 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-r-sm cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-700 font-medium mb-1">Item Lead Time</label>
                          <input
                            type="text"
                            value={editingProduct.itemLeadTime}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, itemLeadTime: e.target.value })
                            }
                            className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card: Unit Format */}
                  <div className="border border-slate-200 rounded-sm overflow-hidden">
                    <div className="bg-[#f8fafc] px-4 py-2 border-b border-slate-200 font-semibold text-slate-800 flex items-center justify-between">
                      <span>Unit Format</span>
                      <button
                        type="button"
                        className="bg-[#323f4b] text-white p-1 rounded-xs cursor-pointer shadow-2xs"
                        title="Add Unit Format"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-slate-700 font-medium mb-1">Buying Format*</label>
                            <select
                              value={editingProduct.buyingFormat}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, buyingFormat: e.target.value })
                              }
                              className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                            >
                              {INITIAL_OMEGA_UNITS.map((u: UnitItem) => (
                                <option key={u.UNITID} value={u.UNITNAME}>
                                  {u.UNITNAME}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-slate-700 font-medium mb-1">Inventory Format*</label>
                              <select
                                value={editingProduct.inventoryFormat}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, inventoryFormat: e.target.value })
                                }
                                className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                              >
                                {INITIAL_OMEGA_UNITS.map((u: UnitItem) => (
                                  <option key={u.UNITID} value={u.UNITNAME}>
                                    {u.UNITNAME}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-slate-700 font-medium mb-1">Qty In Buying Format*</label>
                              <input
                                type="number"
                                value={editingProduct.qtyInBuyingFormat}
                                onChange={(e) =>
                                  setEditingProduct({
                                    ...editingProduct,
                                    qtyInBuyingFormat: Number(e.target.value)
                                  })
                                }
                                className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-slate-700 font-medium mb-1">Usage Format*</label>
                              <select
                                value={editingProduct.usageFormat}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, usageFormat: e.target.value })
                                }
                                className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                              >
                                {INITIAL_OMEGA_UNITS.map((u: UnitItem) => (
                                  <option key={u.UNITID} value={u.UNITNAME}>
                                    {u.UNITNAME}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-slate-700 font-medium mb-1">Qty In Inventory Format*</label>
                              <input
                                type="number"
                                value={editingProduct.qtyInInventoryFormat}
                                onChange={(e) =>
                                  setEditingProduct({
                                    ...editingProduct,
                                    qtyInInventoryFormat: Number(e.target.value)
                                  })
                                }
                                className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-slate-700 font-medium mb-1">Packing/Production</label>
                            <select
                              value={editingProduct.packingProduction}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, packingProduction: e.target.value })
                              }
                              className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                            >
                              <option value="">Select packing</option>
                              <option value="Standard Bottle">Standard Bottle</option>
                              <option value="Carton Box">Carton Box</option>
                              <option value="Plastic Wrap">Plastic Wrap</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-slate-700 font-medium mb-1">Qty In Packing format</label>
                            <input
                              type="number"
                              value={editingProduct.qtyInPackingFormat}
                              onChange={(e) =>
                                setEditingProduct({
                                  ...editingProduct,
                                  qtyInPackingFormat: Number(e.target.value)
                                })
                              }
                              className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeModalTab === 'more' && (
                <div className="space-y-4">
                  <div className="border border-slate-200 rounded-sm p-4 space-y-3">
                    <h3 className="font-semibold text-slate-800 text-xs border-b border-slate-100 pb-2">
                      Accounting Accounts
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-medium mb-1">Asset Account</label>
                        <input
                          type="text"
                          value={editingProduct.assetAccount}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, assetAccount: e.target.value })
                          }
                          className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-medium mb-1">Revenue Account</label>
                        <input
                          type="text"
                          value={editingProduct.revenueAccount}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, revenueAccount: e.target.value })
                          }
                          className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-medium mb-1">Expense Account</label>
                        <input
                          type="text"
                          value={editingProduct.expenseAccount}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, expenseAccount: e.target.value })
                          }
                          className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-medium mb-1">Stock Variation Account</label>
                        <input
                          type="text"
                          value={editingProduct.stockVariationAccount}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, stockVariationAccount: e.target.value })
                          }
                          className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-sm p-4 space-y-3">
                    <h3 className="font-semibold text-slate-800 text-xs border-b border-slate-100 pb-2">
                      Taxes & Options
                    </h3>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      {[1, 2, 3, 4, 5, 6].map((num) => {
                        const key = `tax${num}` as keyof AuthenticProductRecord;
                        return (
                          <label key={num} className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(editingProduct[key])}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, [key]: e.target.checked })
                              }
                              className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600"
                            />
                            <span>Tax {num}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeModalTab === 'media' && (
                <div className="border border-slate-200 rounded-sm p-6 space-y-4 text-center">
                  <div className="w-32 h-32 mx-auto bg-slate-100 border border-slate-300 rounded-sm flex items-center justify-center text-slate-400">
                    <ImageIcon className="w-12 h-12 stroke-[1.5]" />
                  </div>
                  <div className="flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => showToast('Image selector opened')}
                      className="px-4 py-1.5 bg-[#323f4b] text-white rounded-sm font-semibold cursor-pointer shadow-xs"
                    >
                      Select Image
                    </button>
                    <button
                      type="button"
                      className="px-4 py-1.5 bg-[#5c2828] text-white rounded-sm font-semibold cursor-pointer shadow-xs"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="max-w-md mx-auto text-left pt-3">
                    <label className="block text-slate-700 font-medium mb-1">Video Link (YouTube / Vimeo / MP4)</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={editingProduct.videoUrl}
                      onChange={(e) => setEditingProduct({ ...editingProduct, videoUrl: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL 2: EDIT INVENTORY ITEM (Matching Screenshots 2, 3, 5)
          Full 8 Tabs: Main, Stock, Media, Assembly, Included, History, Sales, More
          ======================================================================= */}
      {isEditModalOpen && editingProduct && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-fade-in overflow-y-auto"
          style={{ zIndex: 60000 }}
        >
          <div
            className="bg-white border border-slate-300 w-full text-slate-800 shadow-2xl max-w-5xl rounded-sm overflow-hidden my-6 relative flex flex-col max-h-[92vh]"
            style={{ zIndex: 60001 }}
          >
            {/* Header (Screenshot 5) */}
            <div className="px-6 py-3.5 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
              <div>
                <h2 className="text-[17px] font-normal text-[#4d5b76]">Edit Inventory Item</h2>
                <div className="text-[13px] font-medium text-slate-700 mt-0.5">
                  {editingProduct.id} : ID - {editingProduct.description}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-sm bg-[#323f4b] hover:bg-[#28323c] text-white font-semibold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <span>Actions</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={handleSaveProduct}
                  className="px-4 py-1.5 rounded-sm bg-[#323f4b] hover:bg-[#28323c] text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 text-xl leading-none cursor-pointer ml-1"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Navigation Tabs (Screenshot 5: Main, Stock, Pictures & Videos, Item Assembly, Included Items, History, Sales Performance, More) */}
            <div className="px-6 border-b border-slate-200 flex items-center gap-4 text-xs font-medium bg-[#f8fafc] shrink-0 overflow-x-auto">
              {[
                { key: 'main', label: 'Main' },
                { key: 'stock', label: 'Stock' },
                { key: 'media', label: 'Pictures & Videos' },
                { key: 'assembly', label: 'Item Assembly' },
                { key: 'included', label: 'Included Items' },
                { key: 'history', label: 'History' },
                { key: 'sales', label: 'Sales Performance' },
                { key: 'more', label: 'More' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveModalTab(tab.key as any)}
                  className={`py-2.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                    activeModalTab === tab.key
                      ? 'border-[#195a96] text-[#195a96] font-bold'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* TAB 1: MAIN */}
              {activeModalTab === 'main' && (
                <>
                  {/* Card 1: General (Screenshot 5) */}
                  <div className="border border-slate-200 rounded-sm overflow-hidden">
                    <div className="bg-[#f8fafc] px-4 py-2 border-b border-slate-200 font-semibold text-slate-800">
                      General
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-700 font-medium mb-1">Description*</label>
                          <input
                            type="text"
                            required
                            value={editingProduct.description}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, description: e.target.value })
                            }
                            className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-medium mb-1">Product Code*</label>
                          <input
                            type="text"
                            required
                            value={editingProduct.code}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, code: e.target.value })
                            }
                            className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-700 font-medium mb-1">Item Comment</label>
                          <input
                            type="text"
                            value={editingProduct.itemComment}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, itemComment: e.target.value })
                            }
                            className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-medium mb-1">
                            Other Description || Supplier Item Code
                          </label>
                          <input
                            type="text"
                            value={editingProduct.otherDescription}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, otherDescription: e.target.value })
                            }
                            className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-700 font-medium mb-1">Second Lang Description</label>
                          <input
                            type="text"
                            value={editingProduct.secondLangDescription}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, secondLangDescription: e.target.value })
                            }
                            className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-medium mb-1">Second Lang Item Comment</label>
                          <input
                            type="text"
                            value={editingProduct.secondLangItemComment}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, secondLangItemComment: e.target.value })
                            }
                            className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-medium mb-1">Internal Note</label>
                        <input
                          type="text"
                          value={editingProduct.internalNote}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, internalNote: e.target.value })
                          }
                          className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-700 font-medium mb-1">Group*</label>
                          <div className="flex">
                            <select
                              value={editingProduct.groupName}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, groupName: e.target.value })
                              }
                              className="flex-1 px-3 py-1.5 text-xs rounded-l-sm rounded-r-none border border-r-0 border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                            >
                              {INITIAL_OMEGA_INV_GROUPS.map((g) => (
                                <option key={g.ID} value={g.GROUPNAME}>
                                  {g.GROUPNAME}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              className="px-2.5 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-r-sm cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-700 font-medium mb-1">Selling Function</label>
                          <div className="flex gap-2">
                            <select
                              value={editingProduct.sellingFunction}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, sellingFunction: e.target.value })
                              }
                              className="flex-1 px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                            >
                              {OMEGA_SELLING_FUNCTIONS.map((f) => (
                                <option key={f.id} value={f.name}>
                                  {f.name}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              title="Copy value"
                              className="px-2 py-1.5 bg-[#23783a] text-white rounded-sm cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-700 font-medium mb-1">Default Location</label>
                          <div className="flex">
                            <select
                              value={editingProduct.defaultLocationName}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, defaultLocationName: e.target.value })
                              }
                              className="flex-1 px-3 py-1.5 text-xs rounded-l-sm rounded-r-none border border-r-0 border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                            >
                              {INITIAL_OMEGA_LOCATIONS.map((l: LocationItem) => (
                                <option key={l.LOCATIONID} value={l.LOCATIONDESCRIPTION}>
                                  {l.LOCATIONDESCRIPTION}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              title="Copy"
                              className="px-2 py-1.5 bg-[#23783a] text-white cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              title="Add Location"
                              className="px-2.5 py-1.5 bg-[#323f4b] text-white cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              title="More"
                              className="px-2.5 py-1.5 bg-[#323f4b] text-white rounded-r-sm cursor-pointer"
                            >
                              <span>...</span>
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-700 font-medium mb-1">Logical Warehouse *</label>
                          <div className="flex gap-2">
                            <select
                              value={editingProduct.logicalWarehouseName}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, logicalWarehouseName: e.target.value })
                              }
                              className="flex-1 px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                            >
                              {OMEGA_LOGICAL_WAREHOUSES.map((w) => (
                                <option key={w.id} value={w.name}>
                                  {w.name}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              title="Copy"
                              className="px-2 py-1.5 bg-[#23783a] text-white rounded-sm cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-slate-700 font-medium mb-1">Main Supplier*</label>
                          <div className="flex">
                            <select
                              value={editingProduct.mainSupplierName}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, mainSupplierName: e.target.value })
                              }
                              className="flex-1 px-3 py-1.5 text-xs rounded-l-sm rounded-r-none border border-r-0 border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                            >
                              {INITIAL_OMEGA_SUPPLIERS.map((s: SupplierItem) => (
                                <option key={s.SUPPLIERID} value={s.SUPPLIERNAME}>
                                  {s.SUPPLIERNAME}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              title="Add Supplier"
                              className="px-2.5 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-r-sm cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-700 font-medium mb-1">Item Brand</label>
                          <div className="flex">
                            <select
                              value={editingProduct.itemBrand}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, itemBrand: e.target.value })
                              }
                              className="flex-1 px-3 py-1.5 text-xs rounded-l-sm rounded-r-none border border-r-0 border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                            >
                              <option value="">Select Item Brand</option>
                              {OMEGA_ITEM_BRANDS.map((b) => (
                                <option key={b.id} value={b.name}>
                                  {b.name}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              title="Add Brand"
                              className="px-2.5 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-r-sm cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-700 font-medium mb-1">Source</label>
                          <div className="flex">
                            <select
                              value={editingProduct.source || 'Local'}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, source: e.target.value })
                              }
                              className="flex-1 px-3 py-1.5 text-xs rounded-l-sm rounded-r-none border border-r-0 border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                            >
                              <option value="">Select Source</option>
                              {OMEGA_SOURCES.map((s) => (
                                <option key={s.id} value={s.name}>
                                  {s.name}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              title="Add Source"
                              className="px-2.5 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-r-sm cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-700 font-medium mb-1">Item Lead Time</label>
                          <input
                            type="text"
                            value={editingProduct.itemLeadTime}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, itemLeadTime: e.target.value })
                            }
                            placeholder="e.g. 2 Days"
                            className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Unit Format (Screenshot 2) */}
                  <div className="border border-slate-200 rounded-sm overflow-hidden">
                    <div className="bg-[#f8fafc] px-4 py-2 border-b border-slate-200 font-semibold text-slate-800 flex items-center justify-between">
                      <span>Unit Format</span>
                      <button
                        type="button"
                        className="bg-[#323f4b] text-white p-1 rounded-xs cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-slate-700 font-medium mb-1">Buying Format*</label>
                            <select
                              value={editingProduct.buyingFormat}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, buyingFormat: e.target.value })
                              }
                              className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                            >
                              {INITIAL_OMEGA_UNITS.map((u: UnitItem) => (
                                <option key={u.UNITID} value={u.UNITNAME}>
                                  {u.UNITNAME}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-slate-700 font-medium mb-1">Inventory Format*</label>
                              <select
                                value={editingProduct.inventoryFormat}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, inventoryFormat: e.target.value })
                                }
                                className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                              >
                                {INITIAL_OMEGA_UNITS.map((u: UnitItem) => (
                                  <option key={u.UNITID} value={u.UNITNAME}>
                                    {u.UNITNAME}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-slate-700 font-medium mb-1">Qty In Buying Format*</label>
                              <input
                                type="number"
                                value={editingProduct.qtyInBuyingFormat}
                                onChange={(e) =>
                                  setEditingProduct({
                                    ...editingProduct,
                                    qtyInBuyingFormat: Number(e.target.value)
                                  })
                                }
                                className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-slate-700 font-medium mb-1">Usage Format*</label>
                              <select
                                value={editingProduct.usageFormat}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, usageFormat: e.target.value })
                                }
                                className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                              >
                                {INITIAL_OMEGA_UNITS.map((u: UnitItem) => (
                                  <option key={u.UNITID} value={u.UNITNAME}>
                                    {u.UNITNAME}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-slate-700 font-medium mb-1">Qty In Inventory Format*</label>
                              <input
                                type="number"
                                value={editingProduct.qtyInInventoryFormat}
                                onChange={(e) =>
                                  setEditingProduct({
                                    ...editingProduct,
                                    qtyInInventoryFormat: Number(e.target.value)
                                  })
                                }
                                className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-slate-700 font-medium mb-1">Packing/Production</label>
                            <select
                              value={editingProduct.packingProduction}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, packingProduction: e.target.value })
                              }
                              className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                            >
                              <option value="">Select packing</option>
                              <option value="Standard Bottle">Standard Bottle</option>
                              <option value="Box">Box</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-slate-700 font-medium mb-1">Qty In Packing format</label>
                            <input
                              type="number"
                              value={editingProduct.qtyInPackingFormat}
                              onChange={(e) =>
                                setEditingProduct({
                                  ...editingProduct,
                                  qtyInPackingFormat: Number(e.target.value)
                                })
                              }
                              className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Cost (Screenshot 2) */}
                  <div className="border border-slate-200 rounded-sm overflow-hidden">
                    <div className="bg-[#f8fafc] px-4 py-2 border-b border-slate-200 font-semibold text-slate-800">
                      Cost
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Col 1 & 2 */}
                        <div className="md:col-span-2 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-slate-700 font-medium mb-1">Unit Cost LL</label>
                              <input
                                type="number"
                                value={editingProduct.unitCostLL}
                                onChange={(e) =>
                                  setEditingProduct({
                                    ...editingProduct,
                                    unitCostLL: Number(e.target.value),
                                    cost: Number(e.target.value)
                                  })
                                }
                                className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-700 font-medium mb-1">Average Cost LL</label>
                              <input
                                type="number"
                                value={editingProduct.averageCostLL}
                                onChange={(e) =>
                                  setEditingProduct({
                                    ...editingProduct,
                                    averageCostLL: Number(e.target.value)
                                  })
                                }
                                className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-slate-700 font-medium mb-1">Unit Cost $.</label>
                              <input
                                type="number"
                                step="0.000001"
                                value={editingProduct.unitCostUSD}
                                onChange={(e) =>
                                  setEditingProduct({
                                    ...editingProduct,
                                    unitCostUSD: Number(e.target.value)
                                  })
                                }
                                className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-700 font-medium mb-1">Average Cost $</label>
                              <input
                                type="number"
                                step="0.000001"
                                value={editingProduct.averageCostUSD}
                                onChange={(e) =>
                                  setEditingProduct({
                                    ...editingProduct,
                                    averageCostUSD: Number(e.target.value)
                                  })
                                }
                                className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Col 3: Additional Cost & Recalculate */}
                        <div className="space-y-3 border-l border-slate-200 pl-4">
                          <div>
                            <label className="block text-slate-700 font-medium mb-1">Additional Cost LL</label>
                            <input
                              type="number"
                              value={editingProduct.additionalCostLL}
                              onChange={(e) =>
                                setEditingProduct({
                                  ...editingProduct,
                                  additionalCostLL: Number(e.target.value)
                                })
                              }
                              className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-slate-700 font-medium mb-1">Markup %</label>
                              <div className="flex gap-1">
                                <input
                                  type="number"
                                  value={editingProduct.markupPct}
                                  onChange={(e) =>
                                    setEditingProduct({
                                      ...editingProduct,
                                      markupPct: Number(e.target.value)
                                    })
                                  }
                                  className="flex-1 px-2 py-1.5 text-xs rounded-sm border border-slate-300 bg-white"
                                />
                                <button
                                  type="button"
                                  title="Copy"
                                  className="px-2 py-1 bg-[#23783a] text-white rounded-xs cursor-pointer"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <div>
                              <label className="block text-slate-700 font-medium mb-1">Recommended Price</label>
                              <div className="flex gap-1">
                                <input
                                  type="number"
                                  value={editingProduct.recommendedPriceLL}
                                  onChange={(e) =>
                                    setEditingProduct({
                                      ...editingProduct,
                                      recommendedPriceLL: Number(e.target.value)
                                    })
                                  }
                                  className="flex-1 px-2 py-1.5 text-xs rounded-sm border border-slate-300 bg-white"
                                />
                                <button
                                  type="button"
                                  title="Copy"
                                  className="px-2 py-1 bg-[#23783a] text-white rounded-xs cursor-pointer"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleRecalculateCost}
                            className="w-full py-2 bg-[#323f4b] hover:bg-[#28323c] text-white font-semibold text-xs rounded-sm flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Recalculate Production Item Cost</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Selling Price (Screenshot 2 & 3) */}
                  <div className="border border-slate-200 rounded-sm overflow-hidden">
                    <div className="bg-[#f8fafc] px-4 py-2 border-b border-slate-200 font-semibold text-slate-800 flex items-center justify-between">
                      <span>Selling Price</span>
                      <div className="flex items-center gap-4 text-xs">
                        <button type="button" className="text-[#195a96] hover:underline font-medium">
                          Price Variations
                        </button>
                        <button type="button" className="text-[#195a96] hover:underline font-medium">
                          Last Prices
                        </button>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-800">Selling price in Second currency</span>
                          <button
                            type="button"
                            className="p-1 bg-[#23783a] text-white rounded-xs cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      {[1, 2, 3, 4].map((num) => {
                        const spKey = `sellingPrice${num}LL` as keyof AuthenticProductRecord;
                        const btKey = `beforeTax${num}LL` as keyof AuthenticProductRecord;
                        const pfKey = `profit${num}Pct` as keyof AuthenticProductRecord;
                        const usdKey = `sellingPrice${num}USD` as keyof AuthenticProductRecord;
                        const qtyKey = `qtyPrice${num}` as keyof AuthenticProductRecord;

                        return (
                          <div
                            key={num}
                            className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center border-b border-slate-100 pb-2.5"
                          >
                            <div className="md:col-span-3">
                              <label className="block text-slate-700 font-medium mb-1">
                                Selling Price {num} LL
                              </label>
                              <input
                                type="number"
                                value={Number(editingProduct[spKey])}
                                onChange={(e) =>
                                  setEditingProduct({
                                    ...editingProduct,
                                    [spKey]: Number(e.target.value),
                                    ...(num === 1 ? { sellingPrice: Number(e.target.value) } : {})
                                  })
                                }
                                className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white"
                              />
                            </div>

                            <div className="md:col-span-3">
                              <label className="block text-slate-700 font-medium mb-1">Before Tax LL</label>
                              <input
                                type="number"
                                value={Number(editingProduct[btKey])}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, [btKey]: Number(e.target.value) })
                                }
                                className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-[#e9ecef]"
                              />
                            </div>

                            {num > 1 ? (
                              <div className="md:col-span-2">
                                <label className="block text-slate-700 font-medium mb-1">
                                  Qty for Selling Price {num} 🛈
                                </label>
                                <input
                                  type="number"
                                  value={Number(editingProduct[qtyKey] || 1)}
                                  onChange={(e) =>
                                    setEditingProduct({ ...editingProduct, [qtyKey]: Number(e.target.value) })
                                  }
                                  className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white"
                                />
                              </div>
                            ) : (
                              <div className="md:col-span-2"></div>
                            )}

                            <div className="md:col-span-2">
                              <label className="block text-slate-700 font-medium mb-1">Profit %</label>
                              <input
                                type="number"
                                step="0.01"
                                value={Number(editingProduct[pfKey])}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, [pfKey]: Number(e.target.value) })
                                }
                                className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-[#e9ecef]"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-slate-700 font-medium mb-1">Selling Price {num} $</label>
                              <input
                                type="number"
                                step="0.01"
                                value={Number(editingProduct[usdKey])}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, [usdKey]: Number(e.target.value) })
                                }
                                className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white"
                              />
                            </div>
                          </div>
                        );
                      })}

                      {/* Second Currency Rate (Screenshot 3) */}
                      <div className="flex justify-end pt-1">
                        <div className="w-64">
                          <label className="block text-slate-700 font-medium mb-1">Second Currency Rate</label>
                          <input
                            type="number"
                            value={editingProduct.secondCurrencyRate}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                secondCurrencyRate: Number(e.target.value)
                              })
                            }
                            className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 5: Barcodes (Screenshot 3) */}
                  <div className="border border-slate-200 rounded-sm overflow-hidden">
                    <div className="bg-[#f8fafc] px-4 py-2 border-b border-slate-200 font-semibold text-slate-800">
                      Barcodes
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        <div className="md:col-span-5">
                          <label className="block text-slate-700 font-medium mb-1">Barcode</label>
                          <div className="flex">
                            <input
                              type="text"
                              value={editingProduct.barcode}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, barcode: e.target.value })
                              }
                              className="flex-1 px-3 py-1.5 text-xs rounded-l-sm rounded-r-none border border-r-0 border-slate-300 bg-white"
                            />
                            <button
                              type="button"
                              title="Barcode"
                              className="px-2.5 py-1.5 bg-[#4c5c7a] text-white rounded-r-sm"
                            >
                              <Barcode className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="md:col-span-4">
                          <label className="block text-slate-700 font-medium mb-1">Alternative Barcode 2</label>
                          <input
                            type="text"
                            value={editingProduct.alternativeBarcode2}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, alternativeBarcode2: e.target.value })
                            }
                            className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white"
                          />
                        </div>

                        <div className="md:col-span-3">
                          <label className="block text-slate-700 font-medium mb-1">RFIDT 1</label>
                          <input
                            type="text"
                            value={editingProduct.rfidt1}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, rfidt1: e.target.value })
                            }
                            className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                        <div className="md:col-span-5">
                          <label className="block text-slate-700 font-medium mb-1">Alternative Barcode 3</label>
                          <input
                            type="text"
                            value={editingProduct.alternativeBarcode3}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, alternativeBarcode3: e.target.value })
                            }
                            className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white"
                          />
                        </div>

                        <div className="md:col-span-4 pt-4">
                          <label className="inline-flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editingProduct.applySp2Qty2}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, applySp2Qty2: e.target.checked })
                              }
                              className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600"
                            />
                            <span className="font-medium text-slate-700">Apply sp2 qty2</span>
                          </label>
                        </div>

                        <div className="md:col-span-3">
                          <label className="block text-slate-700 font-medium mb-1">RFIDT 2</label>
                          <input
                            type="text"
                            value={editingProduct.rfidt2}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, rfidt2: e.target.value })
                            }
                            className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white"
                          />
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          className="px-3.5 py-1.5 bg-[#23783a] hover:bg-[#1b602e] text-white font-semibold text-xs rounded-sm shadow-2xs flex items-center gap-1 cursor-pointer transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>More Barcodes</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card 6: Supplier (Screenshot 3) */}
                  <div className="border border-slate-200 rounded-sm overflow-hidden">
                    <div className="bg-[#f8fafc] px-4 py-2 border-b border-slate-200 font-semibold text-slate-800">
                      Supplier
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-slate-700 font-medium mb-1">Main Supplier*</label>
                          <div className="flex">
                            <select
                              value={editingProduct.mainSupplierName}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, mainSupplierName: e.target.value })
                              }
                              className="flex-1 px-3 py-1.5 text-xs rounded-l-sm rounded-r-none border border-r-0 border-slate-300 bg-white"
                            >
                              {INITIAL_OMEGA_SUPPLIERS.map((s: SupplierItem) => (
                                <option key={s.SUPPLIERID} value={s.SUPPLIERNAME}>
                                  {s.SUPPLIERNAME}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              title="Copy"
                              className="px-2 py-1.5 bg-[#23783a] text-white cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              title="Print"
                              className="px-2 py-1.5 bg-[#323f4b] text-white rounded-r-sm cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-700 font-medium mb-1">Other Supplier</label>
                          <div className="flex">
                            <select
                              value={editingProduct.otherSupplierName || ''}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, otherSupplierName: e.target.value })
                              }
                              className="flex-1 px-3 py-1.5 text-xs rounded-l-sm rounded-r-none border border-r-0 border-slate-300 bg-white"
                            >
                              <option value="">Select other supplier</option>
                              {INITIAL_OMEGA_SUPPLIERS.map((s: SupplierItem) => (
                                <option key={s.SUPPLIERID} value={s.SUPPLIERNAME}>
                                  {s.SUPPLIERNAME}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              className="px-2.5 py-1.5 bg-[#323f4b] text-white rounded-r-sm cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-700 font-medium mb-1">Last Supplier</label>
                          <select
                            value={editingProduct.lastSupplierName}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, lastSupplierName: e.target.value })
                            }
                            className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-[#e9ecef]"
                          >
                            {INITIAL_OMEGA_SUPPLIERS.map((s: SupplierItem) => (
                              <option key={s.SUPPLIERID} value={s.SUPPLIERNAME}>
                                {s.SUPPLIERNAME}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-slate-700 font-medium mb-1">Item Brand</label>
                          <div className="flex">
                            <select
                              value={editingProduct.itemBrand}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, itemBrand: e.target.value })
                              }
                              className="flex-1 px-3 py-1.5 text-xs rounded-l-sm rounded-r-none border border-r-0 border-slate-300 bg-white"
                            >
                              <option value="">Select Item Brand</option>
                              {OMEGA_ITEM_BRANDS.map((b) => (
                                <option key={b.id} value={b.name}>
                                  {b.name}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              className="px-2.5 py-1.5 bg-[#323f4b] text-white rounded-r-sm cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-700 font-medium mb-1">Source</label>
                          <div className="flex">
                            <select
                              value={editingProduct.source || 'Local'}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, source: e.target.value })
                              }
                              className="flex-1 px-3 py-1.5 text-xs rounded-l-sm rounded-r-none border border-r-0 border-slate-300 bg-white"
                            >
                              <option value="">Select Source</option>
                              {OMEGA_SOURCES.map((s) => (
                                <option key={s.id} value={s.name}>
                                  {s.name}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              className="px-2.5 py-1.5 bg-[#323f4b] text-white rounded-r-sm cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-700 font-medium mb-1">Item Lead Time</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editingProduct.itemLeadTime}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, itemLeadTime: e.target.value })
                              }
                              className="flex-1 px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white"
                            />
                            <button
                              type="button"
                              title="Copy"
                              className="px-2 py-1.5 bg-[#23783a] text-white rounded-sm cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* TAB 2: STOCK & REORDER LEVELS */}
              {activeModalTab === 'stock' && (
                <div className="space-y-4">
                  <div className="border border-slate-200 rounded-sm overflow-hidden">
                    <div className="bg-[#f8fafc] px-4 py-2 border-b border-slate-200 font-semibold text-slate-800 flex items-center justify-between">
                      <span>Stock On Hand & Warehouses</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => showToast('Stock adjustment form opened')}
                          className="px-3 py-1 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-sm font-semibold cursor-pointer"
                        >
                          + Adjust Stock
                        </button>
                        <button
                          type="button"
                          onClick={() => showToast('Inter-warehouse transfer opened')}
                          className="px-3 py-1 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-sm font-semibold cursor-pointer"
                        >
                          Transfer Stock
                        </button>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="px-3 py-2">Branch</th>
                            <th className="px-3 py-2">Warehouse</th>
                            <th className="px-3 py-2">Location</th>
                            <th className="px-3 py-2 text-right">Qty OH</th>
                            <th className="px-3 py-2 text-right">Reorder Level</th>
                            <th className="px-3 py-2 text-right">Max Stock</th>
                            <th className="px-3 py-2 text-right">Available</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {editingProduct.stockRecords && editingProduct.stockRecords.length > 0 ? (
                            editingProduct.stockRecords.map((st, idx) => (
                              <tr key={idx} className="hover:bg-slate-50">
                                <td className="px-3 py-2 font-medium">{st.branchName}</td>
                                <td className="px-3 py-2">{st.warehouseName}</td>
                                <td className="px-3 py-2">{st.locationName}</td>
                                <td className="px-3 py-2 text-right font-bold text-red-600">
                                  {Number(st.qtyOH).toFixed(2)}
                                </td>
                                <td className="px-3 py-2 text-right">{st.reorderLevel}</td>
                                <td className="px-3 py-2 text-right">{st.maxStock}</td>
                                <td className="px-3 py-2 text-right font-semibold">
                                  {Number(st.availableQty).toFixed(2)}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="px-3 py-6 text-center text-slate-400">
                                No specific warehouse records configured.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PICTURES & VIDEOS */}
              {activeModalTab === 'media' && (
                <div className="border border-slate-200 rounded-sm p-6 space-y-4 text-center">
                  <div className="w-36 h-36 mx-auto bg-slate-100 border border-slate-300 rounded-sm flex items-center justify-center text-slate-400">
                    <ImageIcon className="w-14 h-14 stroke-[1.5]" />
                  </div>
                  <div className="flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => showToast('Image selector opened')}
                      className="px-4 py-1.5 bg-[#323f4b] text-white rounded-sm font-semibold cursor-pointer shadow-xs"
                    >
                      Select Image
                    </button>
                    <button
                      type="button"
                      className="px-4 py-1.5 bg-[#5c2828] text-white rounded-sm font-semibold cursor-pointer shadow-xs"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="max-w-md mx-auto text-left pt-3">
                    <label className="block text-slate-700 font-medium mb-1">Video Link (YouTube / Vimeo / MP4)</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={editingProduct.videoUrl}
                      onChange={(e) => setEditingProduct({ ...editingProduct, videoUrl: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: ITEM ASSEMBLY (BOM / RECIPES) */}
              {activeModalTab === 'assembly' && (
                <div className="space-y-4">
                  <div className="border border-slate-200 rounded-sm overflow-hidden">
                    <div className="bg-[#f8fafc] px-4 py-2.5 border-b border-slate-200 font-semibold text-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span>Assembly Recipe / Components (BOM)</span>
                        <span className="text-xs font-normal text-slate-500">
                          Calculation Method: <strong>{editingProduct.assemblyCalculationMethod}</strong>
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => showToast('New component added to recipe')}
                          className="px-3 py-1 bg-[#323f4b] text-white rounded-sm font-semibold cursor-pointer"
                        >
                          + Add Component
                        </button>
                        <button
                          type="button"
                          onClick={() => showToast('Recalculated bill of materials cost')}
                          className="px-3 py-1 bg-[#23783a] text-white rounded-sm font-semibold cursor-pointer"
                        >
                          Recalculate Cost
                        </button>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="px-3 py-2">Raw Material</th>
                            <th className="px-3 py-2">Code</th>
                            <th className="px-3 py-2 text-right">Qty Needed</th>
                            <th className="px-3 py-2">Unit</th>
                            <th className="px-3 py-2 text-right">Unit Cost LL</th>
                            <th className="px-3 py-2 text-right">Total Cost LL</th>
                            <th className="px-3 py-2 text-center w-12"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {editingProduct.assemblyItems && editingProduct.assemblyItems.length > 0 ? (
                            editingProduct.assemblyItems.map((asm) => (
                              <tr key={asm.id} className="hover:bg-slate-50">
                                <td className="px-3 py-2 font-medium">{asm.rawMaterialName}</td>
                                <td className="px-3 py-2 font-mono text-[11px]">{asm.rawMaterialCode}</td>
                                <td className="px-3 py-2 text-right font-bold">{asm.qtyNeeded}</td>
                                <td className="px-3 py-2">{asm.unit}</td>
                                <td className="px-3 py-2 text-right">{asm.unitCostLL.toLocaleString()}</td>
                                <td className="px-3 py-2 text-right font-semibold">
                                  {asm.totalCostLL.toLocaleString()}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <button
                                    type="button"
                                    className="text-red-700 hover:text-red-900 cursor-pointer"
                                    title="Remove"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="px-3 py-6 text-center text-slate-400">
                                No raw materials attached. Click + Add Component to build a recipe.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: INCLUDED ITEMS (PACKAGES / COMBOS) */}
              {activeModalTab === 'included' && (
                <div className="border border-slate-200 rounded-sm overflow-hidden">
                  <div className="bg-[#f8fafc] px-4 py-2.5 border-b border-slate-200 font-semibold text-slate-800 flex items-center justify-between">
                    <span>Included Combo Products</span>
                    <button
                      type="button"
                      onClick={() => showToast('Select product to include in combo')}
                      className="px-3 py-1 bg-[#323f4b] text-white rounded-sm font-semibold cursor-pointer"
                    >
                      + Add Included Item
                    </button>
                  </div>
                  <div className="p-6 text-center text-slate-400">
                    No bundled items configured for this inventory product.
                  </div>
                </div>
              )}

              {/* TAB 6: HISTORY (3 Sub-Pages: Movements, Price Log, Audit Trail) */}
              {activeModalTab === 'history' && (
                <div className="space-y-4">
                  <div className="flex gap-2 border-b border-slate-200 pb-2">
                    <button
                      type="button"
                      onClick={() => setHistorySubTab('movements')}
                      className={`px-3 py-1 rounded-sm text-xs font-semibold cursor-pointer transition ${
                        historySubTab === 'movements'
                          ? 'bg-[#323f4b] text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Inventory Movements
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistorySubTab('priceLogs')}
                      className={`px-3 py-1 rounded-sm text-xs font-semibold cursor-pointer transition ${
                        historySubTab === 'priceLogs'
                          ? 'bg-[#323f4b] text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Cost & Price Log
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistorySubTab('audit')}
                      className={`px-3 py-1 rounded-sm text-xs font-semibold cursor-pointer transition ${
                        historySubTab === 'audit'
                          ? 'bg-[#323f4b] text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Audit Trail
                    </button>
                  </div>

                  {historySubTab === 'movements' && (
                    <div className="border border-slate-200 rounded-sm overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="px-3 py-2">Date</th>
                            <th className="px-3 py-2">Type</th>
                            <th className="px-3 py-2">Reference</th>
                            <th className="px-3 py-2 text-right">Qty Change</th>
                            <th className="px-3 py-2 text-right">Balance</th>
                            <th className="px-3 py-2">Location</th>
                            <th className="px-3 py-2">User</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {editingProduct.movements && editingProduct.movements.length > 0 ? (
                            editingProduct.movements.map((m) => (
                              <tr key={m.id} className="hover:bg-slate-50">
                                <td className="px-3 py-2">{m.date}</td>
                                <td className="px-3 py-2 font-medium">{m.type}</td>
                                <td className="px-3 py-2 font-mono text-[11px]">{m.reference}</td>
                                <td
                                  className={`px-3 py-2 text-right font-bold ${
                                    m.qtyChange < 0 ? 'text-red-600' : 'text-emerald-700'
                                  }`}
                                >
                                  {m.qtyChange > 0 ? `+${m.qtyChange}` : m.qtyChange}
                                </td>
                                <td className="px-3 py-2 text-right font-semibold">{m.balanceAfter}</td>
                                <td className="px-3 py-2">{m.location}</td>
                                <td className="px-3 py-2 text-slate-500">{m.user}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="px-3 py-6 text-center text-slate-400">
                                No movements recorded yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {historySubTab === 'priceLogs' && (
                    <div className="border border-slate-200 rounded-sm overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="px-3 py-2">Date</th>
                            <th className="px-3 py-2 text-right">Old Cost</th>
                            <th className="px-3 py-2 text-right">New Cost</th>
                            <th className="px-3 py-2 text-right">Old Price</th>
                            <th className="px-3 py-2 text-right">New Price</th>
                            <th className="px-3 py-2">Changed By</th>
                            <th className="px-3 py-2">Reason</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {editingProduct.priceLogs && editingProduct.priceLogs.length > 0 ? (
                            editingProduct.priceLogs.map((p) => (
                              <tr key={p.id} className="hover:bg-slate-50">
                                <td className="px-3 py-2">{p.date}</td>
                                <td className="px-3 py-2 text-right">{p.oldCostLL.toLocaleString()}</td>
                                <td className="px-3 py-2 text-right font-bold">{p.newCostLL.toLocaleString()}</td>
                                <td className="px-3 py-2 text-right">{p.oldPriceLL.toLocaleString()}</td>
                                <td className="px-3 py-2 text-right font-bold text-emerald-700">
                                  {p.newPriceLL.toLocaleString()}
                                </td>
                                <td className="px-3 py-2">{p.changedBy}</td>
                                <td className="px-3 py-2 text-slate-500">{p.reason}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="px-3 py-6 text-center text-slate-400">
                                No price changes recorded.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {historySubTab === 'audit' && (
                    <div className="border border-slate-200 rounded-sm overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="px-3 py-2">Timestamp</th>
                            <th className="px-3 py-2">Action</th>
                            <th className="px-3 py-2">Field</th>
                            <th className="px-3 py-2">Old Value</th>
                            <th className="px-3 py-2">New Value</th>
                            <th className="px-3 py-2">User</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {editingProduct.auditLogs && editingProduct.auditLogs.length > 0 ? (
                            editingProduct.auditLogs.map((a) => (
                              <tr key={a.id} className="hover:bg-slate-50">
                                <td className="px-3 py-2 text-slate-500">{a.timestamp}</td>
                                <td className="px-3 py-2 font-medium">{a.action}</td>
                                <td className="px-3 py-2">{a.field}</td>
                                <td className="px-3 py-2 text-slate-500">{a.oldValue}</td>
                                <td className="px-3 py-2 font-bold text-blue-700">{a.newValue}</td>
                                <td className="px-3 py-2">{a.user}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="px-3 py-6 text-center text-slate-400">
                                No audit events logged.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 7: SALES PERFORMANCE */}
              {activeModalTab === 'sales' && (
                <div className="space-y-4">
                  {/* Top Bar with KPI cards & Round Flash Refresh button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#f8fafc] p-3 rounded-sm border border-slate-200">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span className="font-semibold text-slate-800">Sales Performance Overview: Year 2026</span>
                      <button
                        type="button"
                        onClick={handleRefreshPerformance}
                        title="Autogenerate and refresh live sales telemetry"
                        className="p-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-full cursor-pointer shadow-xs transition"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Period:</span>
                      <select className="px-2.5 py-1 text-xs border border-slate-300 rounded-sm bg-white">
                        <option value="2026">Year 2026</option>
                        <option value="2025">Year 2025</option>
                        <option value="12m">Last 12 Months</option>
                      </select>
                    </div>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white border border-slate-200 rounded-sm p-3">
                      <div className="text-[11px] text-slate-500">Units Sold This Year</div>
                      <div className="text-lg font-bold text-slate-900 mt-1">2,180 BOT</div>
                      <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">↑ +14.5% vs 2025</div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-sm p-3">
                      <div className="text-[11px] text-slate-500">Revenue (LL)</div>
                      <div className="text-lg font-bold text-slate-900 mt-1">98,100,000</div>
                      <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">↑ +18.2% vs 2025</div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-sm p-3">
                      <div className="text-[11px] text-slate-500">Gross Margin</div>
                      <div className="text-lg font-bold text-emerald-700 mt-1">39,944,750</div>
                      <div className="text-[10px] text-slate-500 font-medium mt-0.5">Profit Margin</div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-sm p-3">
                      <div className="text-[11px] text-slate-500">Average Markup</div>
                      <div className="text-lg font-bold text-blue-700 mt-1">68.7%</div>
                      <div className="text-[10px] text-slate-500 font-medium mt-0.5">Target: 65%</div>
                    </div>
                  </div>

                  {/* Comparative Chart (This Year vs Last Year) */}
                  <div className="border border-slate-200 rounded-sm p-4 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-slate-800 text-xs">
                        Monthly Sales Comparison (This Year vs Last Year)
                      </h4>
                      <div className="flex items-center gap-4 text-[11px]">
                        <div className="flex items-center gap-1">
                          <span className="w-3 h-3 bg-[#195a96] rounded-xs inline-block"></span>
                          <span>2026 (This Year)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-3 h-3 bg-slate-300 rounded-xs inline-block"></span>
                          <span>2025 (Last Year)</span>
                        </div>
                      </div>
                    </div>

                    {/* Chart Bars */}
                    <div className="pt-4 flex items-end justify-between gap-2 h-44 border-b border-slate-200 px-2">
                      {editingProduct.salesPerformance?.map((sp) => {
                        const maxVal = 300;
                        const heightThis = Math.min(100, Math.round((sp.qtyThisYear / maxVal) * 100));
                        const heightLast = Math.min(100, Math.round((sp.qtyLastYear / maxVal) * 100));

                        return (
                          <div key={sp.month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                            <div className="w-full flex items-end justify-center gap-1 h-full">
                              <div
                                style={{ height: `${heightThis}%` }}
                                title={`2026: ${sp.qtyThisYear} units`}
                                className="w-3 bg-[#195a96] hover:bg-[#144777] rounded-t-xs transition-all cursor-pointer"
                              ></div>
                              <div
                                style={{ height: `${heightLast}%` }}
                                title={`2025: ${sp.qtyLastYear} units`}
                                className="w-3 bg-slate-300 hover:bg-slate-400 rounded-t-xs transition-all cursor-pointer"
                              ></div>
                            </div>
                            <span className="text-[10px] text-slate-500 font-medium">{sp.month}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Monthly Table */}
                  <div className="border border-slate-200 rounded-sm overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2">Month</th>
                          <th className="px-3 py-2 text-right">Qty (2026)</th>
                          <th className="px-3 py-2 text-right">Sales LL (2026)</th>
                          <th className="px-3 py-2 text-right">Qty (2025)</th>
                          <th className="px-3 py-2 text-right">Sales LL (2025)</th>
                          <th className="px-3 py-2 text-right">Growth</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {editingProduct.salesPerformance?.map((sp) => {
                          const diff = sp.qtyThisYear - sp.qtyLastYear;
                          const pct = sp.qtyLastYear > 0 ? ((diff / sp.qtyLastYear) * 100).toFixed(1) : '0';
                          return (
                            <tr key={sp.month} className="hover:bg-slate-50">
                              <td className="px-3 py-1.5 font-medium">{sp.month} 2026</td>
                              <td className="px-3 py-1.5 text-right font-bold text-slate-900">{sp.qtyThisYear}</td>
                              <td className="px-3 py-1.5 text-right text-slate-700 font-mono">
                                {sp.salesThisYearLL.toLocaleString()}
                              </td>
                              <td className="px-3 py-1.5 text-right text-slate-500">{sp.qtyLastYear}</td>
                              <td className="px-3 py-1.5 text-right text-slate-500 font-mono">
                                {sp.salesLastYearLL.toLocaleString()}
                              </td>
                              <td
                                className={`px-3 py-1.5 text-right font-semibold ${
                                  diff >= 0 ? 'text-emerald-600' : 'text-red-600'
                                }`}
                              >
                                {diff >= 0 ? `+${pct}%` : `${pct}%`}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 8: MORE (3 Sub-Sections: Accounts, Taxes, Advanced) */}
              {activeModalTab === 'more' && (
                <div className="space-y-4">
                  <div className="flex gap-2 border-b border-slate-200 pb-2">
                    <button
                      type="button"
                      onClick={() => setMoreSubTab('accounts')}
                      className={`px-3 py-1 rounded-sm text-xs font-semibold cursor-pointer transition ${
                        moreSubTab === 'accounts'
                          ? 'bg-[#323f4b] text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Accounts & Financials
                    </button>
                    <button
                      type="button"
                      onClick={() => setMoreSubTab('taxes')}
                      className={`px-3 py-1 rounded-sm text-xs font-semibold cursor-pointer transition ${
                        moreSubTab === 'taxes'
                          ? 'bg-[#323f4b] text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Taxes & Discounts
                    </button>
                    <button
                      type="button"
                      onClick={() => setMoreSubTab('advanced')}
                      className={`px-3 py-1 rounded-sm text-xs font-semibold cursor-pointer transition ${
                        moreSubTab === 'advanced'
                          ? 'bg-[#323f4b] text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Advanced Attributes
                    </button>
                  </div>

                  {moreSubTab === 'accounts' && (
                    <div className="border border-slate-200 rounded-sm p-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-700 font-medium mb-1">Asset Account</label>
                          <input
                            type="text"
                            value={editingProduct.assetAccount}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, assetAccount: e.target.value })
                            }
                            className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-medium mb-1">Revenue Account</label>
                          <input
                            type="text"
                            value={editingProduct.revenueAccount}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, revenueAccount: e.target.value })
                            }
                            className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-medium mb-1">Expense Account</label>
                          <input
                            type="text"
                            value={editingProduct.expenseAccount}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, expenseAccount: e.target.value })
                            }
                            className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-medium mb-1">Stock Variation Account</label>
                          <input
                            type="text"
                            value={editingProduct.stockVariationAccount}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, stockVariationAccount: e.target.value })
                            }
                            className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {moreSubTab === 'taxes' && (
                    <div className="border border-slate-200 rounded-sm p-4 space-y-4">
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                        {[1, 2, 3, 4, 5, 6].map((num) => {
                          const key = `tax${num}` as keyof AuthenticProductRecord;
                          return (
                            <label key={num} className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={Boolean(editingProduct[key])}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, [key]: e.target.checked })
                                }
                                className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600"
                              />
                              <span className="font-medium">Tax {num}</span>
                            </label>
                          );
                        })}
                      </div>
                      <div className="pt-2">
                        <label className="block text-slate-700 font-medium mb-1">Auto Discount %</label>
                        <input
                          type="number"
                          value={editingProduct.autoDiscount}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, autoDiscount: Number(e.target.value) })
                          }
                          className="w-48 px-3 py-1.5 text-xs rounded-sm border border-slate-300"
                        />
                      </div>
                    </div>
                  )}

                  {moreSubTab === 'advanced' && (
                    <div className="border border-slate-200 rounded-sm p-4 space-y-3">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={editingProduct.isDiscontinued}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, isDiscontinued: e.target.checked })
                          }
                          className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="font-semibold text-slate-800">Item Discontinued / Inactive</span>
                      </label>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-200 flex justify-end gap-2 bg-slate-50 shrink-0">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-1.5 rounded-sm border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProduct}
                className="px-5 py-1.5 rounded-sm bg-[#323f4b] hover:bg-[#28323c] text-white font-bold cursor-pointer shadow-xs"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL 3: ADVANCED FILTERS MODAL
          ======================================================================= */}
      {isFilterModalOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-fade-in"
          style={{ zIndex: 70000 }}
        >
          <div
            className="bg-white border border-slate-300 w-full text-slate-800 shadow-2xl max-w-md rounded-sm overflow-hidden"
            style={{ zIndex: 70001 }}
          >
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-white">
              <h3 className="text-[16px] font-normal text-[#4d5b76]">Filter Products & Services</h3>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xl leading-none cursor-pointer"
              >
                ×
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDiscontinuedOnly}
                  onChange={(e) => setShowDiscontinuedOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600"
                />
                <span className="text-slate-700 font-medium">Show Discontinued Items Only</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAssemblyOnly}
                  onChange={(e) => setShowAssemblyOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600"
                />
                <span className="text-slate-700 font-medium">Show Assembly & Recipe Items Only</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBelowReorderOnly}
                  onChange={(e) => setShowBelowReorderOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600"
                />
                <span className="text-slate-700 font-medium">Show Items Below Reorder Level Only</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showWithoutBarcodeOnly}
                  onChange={(e) => setShowWithoutBarcodeOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600"
                />
                <span className="text-slate-700 font-medium">Show Items Without Barcode Only</span>
              </label>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-4 py-1.5 border border-slate-300 rounded-sm bg-white hover:bg-slate-50 cursor-pointer"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="px-5 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white font-bold rounded-sm cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
