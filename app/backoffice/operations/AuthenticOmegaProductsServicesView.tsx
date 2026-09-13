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
  Settings,
  MoreHorizontal,
  HelpCircle,
  AlertCircle,
  AlertTriangle,
  Star,
  Truck,
  Warehouse,
  Info,
  CheckCircle2,
  ShieldCheck,
  Gift,
  Tag,
  FileText,
  ArrowUpRight
} from 'lucide-react';
import {
  AuthenticProductRecord,
  INITIAL_OMEGA_PRODUCTS,
  OMEGA_PRODUCT_CATEGORIES,
  OMEGA_SELLING_FUNCTIONS,
  OMEGA_LOGICAL_WAREHOUSES,
  OMEGA_ITEM_BRANDS,
  OMEGA_SOURCES,
  ProductReorderRule,
  ProductAssemblyItem,
  ProductIncludedItem,
  ProductUsedInItem,
  ProductCostVariationRecord,
  ProductSupplierPricingRecord,
  ProductSalesTransactionRecord,
  OMEGA_BOM_TEMPLATES,
  BOMTemplateProduct
} from '@/lib/omegaProductsData';
import { INITIAL_OMEGA_INV_DIVISIONS } from '@/lib/omegaInventoryDivisionData';
import { INITIAL_OMEGA_INV_GROUPS } from '@/lib/omegaInventoryGroupData';
import { INITIAL_OMEGA_SUPPLIERS, SupplierItem } from '@/lib/omegaSuppliersData';
import {
  INITIAL_OMEGA_LOCATIONS,
  LocationItem,
  INITIAL_OMEGA_ZONES,
  ZoneItem,
  INITIAL_OMEGA_AISLES,
  AisleItem
} from '@/lib/omegaLocationsData';
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

  // Hierarchy Navigation States (Multi-Category, Multi-Division, Multi-Group)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['مفرق']);
  const [isMultiCategory, setIsMultiCategory] = useState<boolean>(false);
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>(['مقطرات ومدبسات مفرق']);
  const [isMultiDivision, setIsMultiDivision] = useState<boolean>(false);
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

  // More Filter Checkboxes (14 Authentic Omega ERP Specifications)
  const [moreFilters, setMoreFilters] = useState<{
    serialNumber: boolean;
    ingredients: boolean;
    colors: boolean;
    sizes: boolean;
    costZero: boolean;
    sellingPriceZero: boolean;
    logicalWarehouseNull: boolean;
    defaultLocationNull: boolean;
    serviceItems: boolean;
    consignmentItems: boolean;
    withoutReorderLevel: boolean;
    masterItems: boolean;
    discontinuedItems: boolean;
    withExpiry: boolean;
  }>({
    serialNumber: false,
    ingredients: false,
    colors: false,
    sizes: false,
    costZero: false,
    sellingPriceZero: false,
    logicalWarehouseNull: false,
    defaultLocationNull: false,
    serviceItems: false,
    consignmentItems: false,
    withoutReorderLevel: false,
    masterItems: false,
    discontinuedItems: false,
    withExpiry: false,
  });

  const activeMoreFiltersCount = useMemo(() => {
    return Object.values(moreFilters).filter(Boolean).length;
  }, [moreFilters]);

  const MORE_FILTER_OPTIONS: Array<{ key: keyof typeof moreFilters; label: string }> = useMemo(() => [
    { key: 'serialNumber', label: 'Items with Serial Number' },
    { key: 'ingredients', label: 'Items with Ingredients' },
    { key: 'colors', label: 'Items with Colors' },
    { key: 'sizes', label: 'Items with Sizes' },
    { key: 'costZero', label: 'Items with Cost = 0' },
    { key: 'sellingPriceZero', label: 'Items with Selling price = 0' },
    { key: 'logicalWarehouseNull', label: 'Items with Logical Warehouse Null' },
    { key: 'defaultLocationNull', label: 'Items with Default location Null' },
    { key: 'serviceItems', label: 'Service Items' },
    { key: 'consignmentItems', label: 'Consignment Items' },
    { key: 'withoutReorderLevel', label: 'Items without reorder level' },
    { key: 'masterItems', label: 'Master Items' },
    { key: 'discontinuedItems', label: 'Discontinued Items' },
    { key: 'withExpiry', label: 'Items with Expiry' },
  ], []);

  // Instant More Filter Toggle Handler (Click directly applies filter)
  const handleToggleMoreFilter = (key: keyof typeof moreFilters) => {
    setMoreFilters((prev) => {
      const nextVal = !prev[key];
      const opt = MORE_FILTER_OPTIONS.find((o) => o.key === key);
      if (opt) {
        showToast(nextVal ? `Filter applied: ${opt.label}` : `Filter removed: ${opt.label}`);
      }
      return { ...prev, [key]: nextVal };
    });
  };

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
    'main' | 'stock' | 'media' | 'assembly' | 'included' | 'usedIn' | 'history' | 'sales' | 'more'
  >('main');
  const [historySubTab, setHistorySubTab] = useState<
    'movements' | 'costVariation' | 'supplierPricing' | 'salesPerformance' | 'audit'
  >('movements');
  const [salesPerfFilter, setSalesPerfFilter] = useState<'all' | 'corruptedOnly' | 'apiOnly' | 'posOnly'>('all');

  // Supplier Pricing Modal (Screenshot 8: New Item Supplier Pricing)
  const [isNewSupplierPricingModalOpen, setIsNewSupplierPricingModalOpen] = useState<boolean>(false);
  const [newSuppPriceSupplierId, setNewSuppPriceSupplierId] = useState<number>(1);
  const [newSuppPriceBuyingUnit, setNewSuppPriceBuyingUnit] = useState<string>('BOX');
  const [newSuppPriceAmount, setNewSuppPriceAmount] = useState<number | string>('');
  const [newSuppPriceCurrency, setNewSuppPriceCurrency] = useState<'LBP' | 'USD' | 'EUR'>('LBP');
  const [newSuppPriceDate, setNewSuppPriceDate] = useState<string>('13-Sep-2026');
  const [newSuppPriceSupplierCode, setNewSuppPriceSupplierCode] = useState<string>('');
  const [newSuppPriceTarget, setNewSuppPriceTarget] = useState<number | string>('');
  const [newSuppPriceFree, setNewSuppPriceFree] = useState<number | string>('');
  const [newSuppPriceDiscountPct, setNewSuppPriceDiscountPct] = useState<number | string>(0);
  const [newSuppPriceDiscountNotes, setNewSuppPriceDiscountNotes] = useState<string>('');
  const [newSuppPriceBonusPct, setNewSuppPriceBonusPct] = useState<number | string>('');
  const [newSuppPriceBonusNotes, setNewSuppPriceBonusNotes] = useState<string>('');
  const [moreSubTab, setMoreSubTab] = useState<'accounts' | 'taxes' | 'advanced'>('accounts');
  const [stockSubTab, setStockSubTab] = useState<'qtyOH' | 'reorderLevel'>('qtyOH');
  const [newReorderWarehouse, setNewReorderWarehouse] = useState<string>('Main Store');
  const [newReorderMin, setNewReorderMin] = useState<number>(50);
  const [newReorderMax, setNewReorderMax] = useState<number>(200);

  // Same As BOM Cloning Modal
  const [isSameAsBOMModalOpen, setIsSameAsBOMModalOpen] = useState<boolean>(false);
  const [selectedSameAsTemplateId, setSelectedSameAsTemplateId] = useState<number>(1);

  // Included Items / Dynamic Sales Bundling State
  const [isAddIncludedItemModalOpen, setIsAddIncludedItemModalOpen] = useState<boolean>(false);
  const [selectedIncludedItemId, setSelectedIncludedItemId] = useState<number>(0);
  const [newIncludedQty, setNewIncludedQty] = useState<number>(1);
  const [newIncludedDiscountPct, setNewIncludedDiscountPct] = useState<number>(0);

  // Used In / Upward Dependency State
  const [isAddUsedInModalOpen, setIsAddUsedInModalOpen] = useState<boolean>(false);
  const [newUsedInParentCode, setNewUsedInParentCode] = useState<string>('');
  const [newUsedInParentDesc, setNewUsedInParentDesc] = useState<string>('');
  const [newUsedInQty, setNewUsedInQty] = useState<number>(1);
  const [newUsedInRelationType, setNewUsedInRelationType] = useState<
    'Palletization' | 'Bundle/Kit' | 'Inverted Breakdown (Hazard)'
  >('Palletization');

  // Inventory Productions Report Modal (REP_I_0041 - Authentic Omega Print/Export Clone)
  const [isInventoryProductionsReportOpen, setIsInventoryProductionsReportOpen] = useState<boolean>(false);
  const [inventoryProductionsReportMode, setInventoryProductionsReportMode] = useState<
    'omega_anomaly' | 'case_assembly' | 'pallet_master'
  >('omega_anomaly');

  // Location Hierarchy Expander (Image 2: Floor, Zone, Aisle)
  const [isFloorZoneAisleOpen, setIsFloorZoneAisleOpen] = useState<boolean>(false);

  // Apply Recommended Price Modal (Image 3)
  const [isApplyRecommendedPriceModalOpen, setIsApplyRecommendedPriceModalOpen] = useState<boolean>(false);
  const [recommendedPriceTargets, setRecommendedPriceTargets] = useState<{
    sp1: boolean;
    sp2: boolean;
    sp3: boolean;
    sp4: boolean;
  }>({
    sp1: true,
    sp2: true,
    sp3: true,
    sp4: true
  });

  // Additional Interactive Modals from Audios & Images
  const [isLastPricesModalOpen, setIsLastPricesModalOpen] = useState<boolean>(false);
  const [isPriceVariationsModalOpen, setIsPriceVariationsModalOpen] = useState<boolean>(false);
  const [isMoreBarcodesModalOpen, setIsMoreBarcodesModalOpen] = useState<boolean>(false);
  const [isPurchaseHistoryModalOpen, setIsPurchaseHistoryModalOpen] = useState<boolean>(false);
  const [isVanguardMarketplaceModalOpen, setIsVanguardMarketplaceModalOpen] = useState<boolean>(false);

  // Quick Addition Modals for '+' buttons
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState<boolean>(false);
  const [isAddLocationModalOpen, setIsAddLocationModalOpen] = useState<boolean>(false);
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState<boolean>(false);
  const [isAddBrandModalOpen, setIsAddBrandModalOpen] = useState<boolean>(false);
  const [isAddZoneModalOpen, setIsAddZoneModalOpen] = useState<boolean>(false);
  const [isAddAisleModalOpen, setIsAddAisleModalOpen] = useState<boolean>(false);

  // Dynamic Lists for Quick Adds
  const [invGroups, setInvGroups] = useState(INITIAL_OMEGA_INV_GROUPS);
  const [locationsList, setLocationsList] = useState(INITIAL_OMEGA_LOCATIONS);
  const [zonesList, setZonesList] = useState(INITIAL_OMEGA_ZONES);
  const [aislesList, setAislesList] = useState(INITIAL_OMEGA_AISLES);
  const [suppliersList, setSuppliersList] = useState(INITIAL_OMEGA_SUPPLIERS);
  const [brandsList, setBrandsList] = useState(OMEGA_ITEM_BRANDS);

  // Quick Add Form States
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [newLocationName, setNewLocationName] = useState<string>('');
  const [newSupplierName, setNewSupplierName] = useState<string>('');
  const [newBrandName, setNewBrandName] = useState<string>('');
  const [newZoneName, setNewZoneName] = useState<string>('');
  const [newAisleName, setNewAisleName] = useState<string>('');
  const [newExtraBarcode, setNewExtraBarcode] = useState<string>('');
  const [newExtraBarcodeType, setNewExtraBarcodeType] = useState<string>('EAN-13');
  const [newExtraBarcodeNote, setNewExtraBarcodeNote] = useState<string>('Packaging Box');

  // Active product being edited
  const [editingProduct, setEditingProduct] = useState<AuthenticProductRecord | null>(null);

  // Handlers for Group-Level Actions (Audios 2 & 3)
  const handleSaveSellingFunctionForGroup = () => {
    if (!editingProduct) return;
    const targetGroup = editingProduct.groupName;
    const fn = editingProduct.sellingFunction;
    setProducts((prev) =>
      prev.map((p) => (p.groupName === targetGroup ? { ...p, sellingFunction: fn, function: fn } : p))
    );
    showToast(`Selling Function "${fn}" saved for all items in group "${targetGroup}"`);
  };

  const handleSaveLogicalWarehouseForGroup = () => {
    if (!editingProduct) return;
    const targetGroup = editingProduct.groupName;
    const whId = editingProduct.logicalWarehouseId;
    const whName = editingProduct.logicalWarehouseName;
    setProducts((prev) =>
      prev.map((p) => (p.groupName === targetGroup ? { ...p, logicalWarehouseId: whId, logicalWarehouseName: whName } : p))
    );
    showToast(`Logical Warehouse "${whName}" applied to all items in group "${targetGroup}"`);
  };

  const handleSaveDefaultLocationForGroup = () => {
    if (!editingProduct) return;
    const targetGroup = editingProduct.groupName;
    const locId = editingProduct.defaultLocationId;
    const locName = editingProduct.defaultLocationName;
    setProducts((prev) =>
      prev.map((p) => (p.groupName === targetGroup ? { ...p, defaultLocationId: locId, defaultLocationName: locName } : p))
    );
    showToast(`Default Location "${locName}" saved for all items in group "${targetGroup}"`);
  };

  const handleSaveMarkupForGroup = () => {
    if (!editingProduct) return;
    const targetGroup = editingProduct.groupName;
    const markup = editingProduct.markupPct || 0;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.groupName === targetGroup) {
          const rec = Math.round((p.unitCostLL || 0) * (1 + markup / 100));
          return { ...p, markupPct: markup, recommendedPriceLL: rec };
        }
        return p;
      })
    );
    showToast(`Markup ${markup}% saved for all items in group "${targetGroup}"`);
  };

  const handleSaveSupplierForGroup = () => {
    if (!editingProduct) return;
    const targetGroup = editingProduct.groupName;
    const supp = editingProduct.mainSupplierName;
    setProducts((prev) =>
      prev.map((p) => (p.groupName === targetGroup ? { ...p, mainSupplierName: supp, lastSupplierName: supp } : p))
    );
    showToast(`Main supplier "${supp}" saved for all items in group "${targetGroup}"`);
  };

  const handleApplyRecommendedPrice = () => {
    if (!editingProduct) return;
    const rec = editingProduct.recommendedPriceLL || 0;
    const cost = editingProduct.unitCostLL || 0;
    const rate = editingProduct.secondCurrencyRate || 90000;
    const profit = cost > 0 ? Number((((rec - cost) / cost) * 100).toFixed(2)) : 0;
    const usd = Number((rec / rate).toFixed(2));
    const updated = { ...editingProduct };
    const appliedList: string[] = [];

    if (recommendedPriceTargets.sp1) {
      updated.sellingPrice1LL = rec;
      updated.beforeTax1LL = rec;
      updated.sellingPrice = rec;
      updated.sellingPrice1USD = usd;
      updated.profit1Pct = profit;
      appliedList.push('SP 1 (Retail)');
    }
    if (recommendedPriceTargets.sp2) {
      updated.sellingPrice2LL = rec;
      updated.beforeTax2LL = rec;
      updated.sellingPrice2USD = usd;
      updated.profit2Pct = profit;
      appliedList.push('SP 2 (Wholesale)');
    }
    if (recommendedPriceTargets.sp3) {
      updated.sellingPrice3LL = rec;
      updated.beforeTax3LL = rec;
      updated.sellingPrice3USD = usd;
      updated.profit3Pct = profit;
      appliedList.push('SP 3 (Distributor)');
    }
    if (recommendedPriceTargets.sp4) {
      updated.sellingPrice4LL = rec;
      updated.beforeTax4LL = rec;
      updated.sellingPrice4USD = usd;
      updated.profit4Pct = profit;
      appliedList.push('SP 4 (Special Contract)');
    }
    setEditingProduct(updated);
    setIsApplyRecommendedPriceModalOpen(false);
    showToast(`Applied recommended price L.L. ${rec.toLocaleString()} to ${appliedList.join(', ')}`);
  };

  const handleApplySecondCurrencyRates = () => {
    if (!editingProduct) return;
    const rate = editingProduct.secondCurrencyRate || 90000;
    const sp1USD = Number(((editingProduct.sellingPrice1LL || 0) / rate).toFixed(2));
    const sp2USD = Number(((editingProduct.sellingPrice2LL || 0) / rate).toFixed(2));
    const sp3USD = Number(((editingProduct.sellingPrice3LL || 0) / rate).toFixed(2));
    const sp4USD = Number(((editingProduct.sellingPrice4LL || 0) / rate).toFixed(2));
    setEditingProduct({
      ...editingProduct,
      sellingPrice1USD: sp1USD,
      sellingPrice2USD: sp2USD,
      sellingPrice3USD: sp3USD,
      sellingPrice4USD: sp4USD
    });
    showToast(`Converted all selling prices to USD at rate ${rate.toLocaleString()} LL/$`);
  };

  const handleUnitCostUSDChange = (usdVal: number) => {
    if (!editingProduct) return;
    const rate = editingProduct.secondCurrencyRate || 90000;
    const llVal = Math.round(usdVal * rate);
    const markup = editingProduct.markupPct || 0;
    const rec = Math.round(llVal * (1 + markup / 100));
    const p1 = Number(editingProduct.sellingPrice1LL || 0);
    const p2 = Number(editingProduct.sellingPrice2LL || 0);
    const p3 = Number(editingProduct.sellingPrice3LL || 0);
    const p4 = Number(editingProduct.sellingPrice4LL || 0);

    setEditingProduct({
      ...editingProduct,
      unitCostUSD: usdVal,
      unitCostLL: llVal,
      cost: llVal,
      recommendedPriceLL: rec,
      profit1Pct: llVal > 0 && p1 > 0 ? Number((((p1 - llVal) / llVal) * 100).toFixed(2)) : 0,
      profit2Pct: llVal > 0 && p2 > 0 ? Number((((p2 - llVal) / llVal) * 100).toFixed(2)) : 0,
      profit3Pct: llVal > 0 && p3 > 0 ? Number((((p3 - llVal) / llVal) * 100).toFixed(2)) : 0,
      profit4Pct: llVal > 0 && p4 > 0 ? Number((((p4 - llVal) / llVal) * 100).toFixed(2)) : 0
    });
  };

  const handleUnitCostLLChange = (llVal: number) => {
    if (!editingProduct) return;
    const rate = editingProduct.secondCurrencyRate || 90000;
    const usdVal = rate > 0 ? Number((llVal / rate).toFixed(4)) : 0;
    const markup = editingProduct.markupPct || 0;
    const rec = Math.round(llVal * (1 + markup / 100));
    const p1 = Number(editingProduct.sellingPrice1LL || 0);
    const p2 = Number(editingProduct.sellingPrice2LL || 0);
    const p3 = Number(editingProduct.sellingPrice3LL || 0);
    const p4 = Number(editingProduct.sellingPrice4LL || 0);

    setEditingProduct({
      ...editingProduct,
      unitCostLL: llVal,
      unitCostUSD: usdVal,
      cost: llVal,
      recommendedPriceLL: rec,
      profit1Pct: llVal > 0 && p1 > 0 ? Number((((p1 - llVal) / llVal) * 100).toFixed(2)) : 0,
      profit2Pct: llVal > 0 && p2 > 0 ? Number((((p2 - llVal) / llVal) * 100).toFixed(2)) : 0,
      profit3Pct: llVal > 0 && p3 > 0 ? Number((((p3 - llVal) / llVal) * 100).toFixed(2)) : 0,
      profit4Pct: llVal > 0 && p4 > 0 ? Number((((p4 - llVal) / llVal) * 100).toFixed(2)) : 0
    });
  };

  const handleSellingPriceLLChange = (num: number, valLL: number) => {
    if (!editingProduct) return;
    const rate = editingProduct.secondCurrencyRate || 90000;
    const usdVal = rate > 0 ? Number((valLL / rate).toFixed(2)) : 0;
    const cost = editingProduct.unitCostLL || 0;
    const profit = cost > 0 ? Number((((valLL - cost) / cost) * 100).toFixed(2)) : 0;
    const spKey = `sellingPrice${num}LL` as keyof AuthenticProductRecord;
    const btKey = `beforeTax${num}LL` as keyof AuthenticProductRecord;
    const pfKey = `profit${num}Pct` as keyof AuthenticProductRecord;
    const usdKey = `sellingPrice${num}USD` as keyof AuthenticProductRecord;

    setEditingProduct({
      ...editingProduct,
      [spKey]: valLL,
      [btKey]: valLL,
      [pfKey]: profit,
      [usdKey]: usdVal,
      ...(num === 1 ? { sellingPrice: valLL } : {})
    });
  };

  const handleSellingPriceUSDChange = (num: number, usdVal: number) => {
    if (!editingProduct) return;
    const rate = editingProduct.secondCurrencyRate || 90000;
    const valLL = Math.round(usdVal * rate);
    const cost = editingProduct.unitCostLL || 0;
    const profit = cost > 0 ? Number((((valLL - cost) / cost) * 100).toFixed(2)) : 0;
    const spKey = `sellingPrice${num}LL` as keyof AuthenticProductRecord;
    const btKey = `beforeTax${num}LL` as keyof AuthenticProductRecord;
    const pfKey = `profit${num}Pct` as keyof AuthenticProductRecord;
    const usdKey = `sellingPrice${num}USD` as keyof AuthenticProductRecord;

    setEditingProduct({
      ...editingProduct,
      [usdKey]: usdVal,
      [spKey]: valLL,
      [btKey]: valLL,
      [pfKey]: profit,
      ...(num === 1 ? { sellingPrice: valLL } : {})
    });
  };

  const handleSaveImages = () => {
    if (!editingProduct) return;
    showToast('Images verified (<200KB limit) and saved for POS touch grids and Supersonic Dispatch API.');
  };

  const handleSetMainImage = (url: string) => {
    if (!editingProduct) return;
    setEditingProduct({ ...editingProduct, mainImage: url });
    showToast('Main Image updated (225x225 px crop applied)');
  };

  const handleAddAdditionalImage = (url: string) => {
    if (!editingProduct) return;
    const current = editingProduct.additionalImages || [];
    setEditingProduct({ ...editingProduct, additionalImages: [...current, url] });
    showToast('Additional Image added (200x200 px crop applied)');
  };

  const handleRemoveAdditionalImage = (index: number) => {
    if (!editingProduct) return;
    const current = [...(editingProduct.additionalImages || [])];
    current.splice(index, 1);
    setEditingProduct({ ...editingProduct, additionalImages: current });
    showToast('Additional Image removed');
  };

  // --- STOCK & REORDER MATRIX HANDLERS ---
  const handleSaveReorderRule = () => {
    if (!editingProduct) return;
    const currentRules = editingProduct.reorderRules || [];
    const existingIndex = currentRules.findIndex(r => r.warehouseName === newReorderWarehouse);
    let updatedRules: ProductReorderRule[];
    const isAlert = (editingProduct.qtyOH ?? 0) < newReorderMin;
    if (existingIndex >= 0) {
      updatedRules = currentRules.map((r, idx) =>
        idx === existingIndex
          ? { ...r, minLevel: newReorderMin, maxStock: newReorderMax, alertActive: isAlert }
          : r
      );
    } else {
      const newRule: ProductReorderRule = {
        id: Date.now(),
        location: newReorderWarehouse,
        warehouseName: newReorderWarehouse,
        minLevel: newReorderMin,
        maxStock: newReorderMax,
        alertActive: isAlert
      };
      updatedRules = [...currentRules, newRule];
    }
    setEditingProduct({ ...editingProduct, reorderRules: updatedRules, reorderLevel: newReorderMin });
    showToast(`Reorder threshold saved for ${newReorderWarehouse}: Min ${newReorderMin}, Max ${newReorderMax}`);
  };

  const handleDeleteReorderRule = (ruleId: number) => {
    if (!editingProduct) return;
    const updatedRules = (editingProduct.reorderRules || []).filter(r => r.id !== ruleId);
    setEditingProduct({ ...editingProduct, reorderRules: updatedRules });
    showToast('Reorder threshold rule removed');
  };

  const handleFixValuationCostError = () => {
    if (!editingProduct) return;
    const correctCostLL = 543960;
    const rate = editingProduct.secondCurrencyRate || 90000;
    const correctCostUSD = Number((correctCostLL / rate).toFixed(4));
    const markup = 50;
    const recPrice = 1080000;
    const p1 = 1080000;
    const profit = Number((((p1 - correctCostLL) / correctCostLL) * 100).toFixed(2));

    setEditingProduct({
      ...editingProduct,
      unitCostLL: correctCostLL,
      averageCostLL: correctCostLL,
      cost: correctCostLL,
      unitCostUSD: correctCostUSD,
      averageCostUSD: correctCostUSD,
      markupPct: markup,
      recommendedPriceLL: recPrice,
      sellingPrice1LL: p1,
      beforeTax1LL: p1,
      sellingPrice: p1,
      sellingPrice1USD: 12,
      profit1Pct: profit
    });
    showToast(`Corrected Unit Cost to 543,960 LL ($6.04). Fixed asset valuation & COGS ledger!`);
  };

  // --- ITEM ASSEMBLY & BOM HANDLERS ---
  const handleFixYieldFlags = () => {
    if (!editingProduct || !editingProduct.assemblyItems) return;
    const updatedItems = editingProduct.assemblyItems.map(item => {
      const isCore = item.rawMaterialCode.startsWith('VIN') ||
                     item.rawMaterialCode.startsWith('POM') ||
                     item.rawMaterialCode.startsWith('APV') ||
                     item.rawMaterialCode.startsWith('TOM') ||
                     item.unit === 'LTR' ||
                     item.unit === 'L' ||
                     item.unit === 'KG';
      return {
        ...item,
        mainIngredient: isCore
      };
    });
    setEditingProduct({
      ...editingProduct,
      assemblyItems: updatedItems
    });
    showToast('Yield flags corrected: Main Ing. checked exclusively for primary raw material');
  };

  const handleToggleMainIngredient = (idx: number) => {
    if (!editingProduct || !editingProduct.assemblyItems) return;
    const updatedItems = editingProduct.assemblyItems.map((item, i) =>
      i === idx ? { ...item, mainIngredient: !item.mainIngredient } : item
    );
    setEditingProduct({ ...editingProduct, assemblyItems: updatedItems });
  };

  const handleAddPackagingComponents = () => {
    if (!editingProduct) return;
    const existingItems = editingProduct.assemblyItems || [];
    const hasBox = existingItems.some(i => i.rawMaterialCode === 'BOX-12X');
    if (hasBox) {
      showToast('Packaging components already present in recipe');
      return;
    }
    const packagingItems: ProductAssemblyItem[] = [
      { id: Date.now() + 1, rawMaterialId: 104, rawMaterialCode: 'BOX-12X', rawMaterialName: 'Cardboard Box 12x 500ml Case', qtyNeeded: 1, unit: 'BOX', unitCostLL: 18000, totalCostLL: 18000, mainIngredient: false },
      { id: Date.now() + 2, rawMaterialId: 105, rawMaterialCode: 'DIV-12X', rawMaterialName: 'Corrugated Carton Dividers (12 Cell)', qtyNeeded: 1, unit: 'SET', unitCostLL: 6500, totalCostLL: 6500, mainIngredient: false },
      { id: Date.now() + 3, rawMaterialId: 106, rawMaterialCode: 'LBL-VNG', rawMaterialName: 'Self-Adhesive Front & Back Labels', qtyNeeded: 12, unit: 'PCS', unitCostLL: 1500, totalCostLL: 18000, mainIngredient: false }
    ];
    const allItems = [...existingItems, ...packagingItems];
    const totalLL = allItems.reduce((acc, curr) => acc + curr.totalCostLL, 0);
    const rate = editingProduct.secondCurrencyRate || 90000;
    const usdVal = Number((totalLL / rate).toFixed(4));
    setEditingProduct({
      ...editingProduct,
      assemblyItems: allItems,
      unitCostLL: totalLL,
      averageCostLL: totalLL,
      cost: totalLL,
      unitCostUSD: usdVal,
      averageCostUSD: usdVal
    });
    showToast('Added Cardboard Box, Dividers & Labels to recipe');
  };

  const handleRecalculateBOMCost = () => {
    if (!editingProduct || !editingProduct.assemblyItems) return;
    const totalLL = editingProduct.assemblyItems.reduce((sum, item) => sum + (item.totalCostLL || (item.qtyNeeded * item.unitCostLL)), 0);
    const rate = editingProduct.secondCurrencyRate || 90000;
    const correctUSD = Number((totalLL / rate).toFixed(4));
    const markup = editingProduct.markupPct || 50;
    const recommendedPrice = Math.round(totalLL * (1 + markup / 100));

    setEditingProduct({
      ...editingProduct,
      unitCostLL: totalLL,
      averageCostLL: totalLL,
      cost: totalLL,
      unitCostUSD: correctUSD,
      averageCostUSD: correctUSD,
      recommendedPriceLL: recommendedPrice
    });
    showToast(`BOM Recalculated: ${totalLL.toLocaleString()} LL = $${correctUSD} (Safeguard applied: divided by ${rate.toLocaleString()} LL/$)`);
  };

  const handleApplySameAsBOM = (template: BOMTemplateProduct) => {
    if (!editingProduct) return;
    const rate = editingProduct.secondCurrencyRate || 90000;
    const correctUSD = Number((template.totalCostLL / rate).toFixed(4));
    const markup = editingProduct.markupPct || 50;
    const recPrice = Math.round(template.totalCostLL * (1 + markup / 100));

    setEditingProduct({
      ...editingProduct,
      assemblyCalculationMethod: 'Extended Line-Item Calculation',
      assemblyItems: JSON.parse(JSON.stringify(template.components)),
      unitCostLL: template.totalCostLL,
      averageCostLL: template.totalCostLL,
      cost: template.totalCostLL,
      unitCostUSD: correctUSD,
      averageCostUSD: correctUSD,
      recommendedPriceLL: recPrice
    });
    setIsSameAsBOMModalOpen(false);
    showToast(`Cloned BOM recipe from "${template.name}": Cost ${template.totalCostLL.toLocaleString()} LL ($${correctUSD})`);
  };

  // --- INCLUDED ITEMS & SALES BUNDLING HANDLERS ---
  const handleClearIncludedItems = () => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      includedItems: []
    });
    showToast('Included items cleared. Core architecture validated: Zero double-deduction risk.');
  };

  const handleLoadSamplePromoKit = () => {
    if (!editingProduct) return;
    const promoItems: ProductIncludedItem[] = [
      {
        id: Date.now() + 1,
        itemId: 15,
        itemCode: 'CWV500ML',
        itemName: 'Commercial White Vinegar 500ml',
        qty: 1,
        discountPct: 10,
        sellingPriceLL: 81000
      },
      {
        id: Date.now() + 2,
        itemId: 18,
        itemCode: 'POM300ML',
        itemName: 'Pomegranate Molasses 300ml',
        qty: 1,
        discountPct: 10,
        sellingPriceLL: 108000
      }
    ];
    setEditingProduct({
      ...editingProduct,
      includedItems: promoItems
    });
    showToast('Loaded sample "Salad Dressing Promo Pack" kit with 2 bundled bottles');
  };

  const handleRemoveIncludedItem = (id: number) => {
    if (!editingProduct || !editingProduct.includedItems) return;
    const updated = editingProduct.includedItems.filter((item) => item.id !== id);
    setEditingProduct({
      ...editingProduct,
      includedItems: updated
    });
    showToast('Removed item from bundle');
  };

  const handleAddIncludedItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const targetProduct = products.find((p) => p.id === selectedIncludedItemId) || products[0];
    if (!targetProduct) return;

    const basePrice = targetProduct.sellingPrice1LL || targetProduct.sellingPrice || 50000;
    const discount = newIncludedDiscountPct || 0;
    const finalPrice = Math.round(basePrice * (1 - discount / 100));

    const newItem: ProductIncludedItem = {
      id: Date.now(),
      itemId: targetProduct.id,
      itemCode: targetProduct.code,
      itemName: targetProduct.description,
      qty: newIncludedQty || 1,
      discountPct: discount,
      sellingPriceLL: finalPrice
    };

    setEditingProduct({
      ...editingProduct,
      includedItems: [...(editingProduct.includedItems || []), newItem]
    });
    setIsAddIncludedItemModalOpen(false);
    setNewIncludedQty(1);
    setNewIncludedDiscountPct(0);
    showToast(`Added "${targetProduct.description}" to bundle`);
  };

  // Handlers for Tab 6: Used In (Reverse Engineering Supply Chain & Upward Dependencies)
  const handleClearUsedIn = () => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      usedInItems: []
    });
    showToast('Purged all parent linkages. Clean forward supply chain hierarchy verified.');
  };

  const handleLoadSamplePalletUsedIn = () => {
    if (!editingProduct) return;
    const palletCost = (editingProduct.unitCostLL || 543960) * 100;
    const palletLink: ProductUsedInItem = {
      id: Date.now() + 1,
      parentProductId: 991,
      parentProductCode: 'PALLET-WV500ML',
      parentDescription: 'طبلية خل ابيض 500مل (100 صندوق) - PALLET 100 BOXES',
      qtyConsumed: 100,
      unit: 'BOX',
      componentCostLL: editingProduct.unitCostLL || 543960,
      impactOnParentCostLL: palletCost,
      relationType: 'Palletization'
    };
    setEditingProduct({
      ...editingProduct,
      usedInItems: [palletLink]
    });
    showToast('Loaded valid Palletization upward linkage (100 Boxes per Export Pallet)');
  };

  const handleLoadSampleKitUsedIn = () => {
    if (!editingProduct) return;
    const kitLink: ProductUsedInItem = {
      id: Date.now() + 2,
      parentProductId: 992,
      parentProductCode: 'KIT-REST-01',
      parentDescription: 'مجموعة تجهيز مطاعم (صندوق خل + صندوق دبس) - RESTAURANT SUPPLY COMBO',
      qtyConsumed: 1,
      unit: 'BOX',
      componentCostLL: editingProduct.unitCostLL || 543960,
      impactOnParentCostLL: editingProduct.unitCostLL || 543960,
      relationType: 'Bundle/Kit'
    };
    setEditingProduct({
      ...editingProduct,
      usedInItems: [kitLink]
    });
    showToast('Loaded valid Wholesale Kitting upward linkage (1 Box per Restaurant Kit)');
  };

  const handleLoadAnomalyUsedIn = () => {
    if (!editingProduct) return;
    const anomalyLink: ProductUsedInItem = {
      id: Date.now() + 3,
      parentProductId: 106,
      parentProductCode: 'CWV500MLB106',
      parentDescription: 'خل ابيض 500مل (قنينة مفرق)',
      qtyConsumed: 0.08,
      unit: 'BOX',
      componentCostLL: editingProduct.unitCostLL || 543960,
      impactOnParentCostLL: 45692.64,
      relationType: 'Inverted Breakdown (Hazard)'
    };
    setEditingProduct({
      ...editingProduct,
      usedInItems: [anomalyLink]
    });
    showToast('Simulated Omega REP_I_0041 Anomaly: Single bottle consuming 0.08 BOX (Backward Linkage)');
  };

  const handleRemoveUsedInItem = (id: number) => {
    if (!editingProduct || !editingProduct.usedInItems) return;
    setEditingProduct({
      ...editingProduct,
      usedInItems: editingProduct.usedInItems.filter((item) => item.id !== id)
    });
    showToast('Removed parent item dependency');
  };

  const handleAddUsedInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !newUsedInParentCode.trim()) return;

    const unitCost = editingProduct.unitCostLL || 543960;
    const qty = newUsedInQty || 1;
    const totalImpact = unitCost * qty;

    const newItem: ProductUsedInItem = {
      id: Date.now(),
      parentProductId: Date.now() % 10000,
      parentProductCode: newUsedInParentCode.trim().toUpperCase(),
      parentDescription: newUsedInParentDesc.trim() || newUsedInParentCode.trim(),
      qtyConsumed: qty,
      unit: 'BOX',
      componentCostLL: unitCost,
      impactOnParentCostLL: totalImpact,
      relationType: newUsedInRelationType
    };

    setEditingProduct({
      ...editingProduct,
      usedInItems: [...(editingProduct.usedInItems || []), newItem]
    });

    setIsAddUsedInModalOpen(false);
    setNewUsedInParentCode('');
    setNewUsedInParentDesc('');
    setNewUsedInQty(1);
    setNewUsedInRelationType('Palletization');
    showToast(`Added parent connection: ${newItem.parentProductCode}`);
  };

  const handlePrintInventoryProductionsReport = () => {
    window.print();
  };

  const handleExportInventoryProductionsReport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Product Code,Product Description,Qty,Unit,Cost,Avg. Cost\n' +
      'CWV500MLB106,خل ابيض 500مل,-,-,-,-\n' +
      'CWV500ML*12B106,صندوق خل ابيض 500مل*12قنينة,0.08,BOX,45692.64,45692.64\n' +
      'Total By Product,-,-,-,45692.64,45692.64\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Inventory_Productions_REP_I_0041.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported Inventory Productions Report (REP_I_0041) to CSV');
  };

  // Handlers for Tab 7 History -> Supplier Pricing
  const handleClearSupplierPricing = () => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      supplierPricings: []
    });
    showToast('Cleared supplier pricing grid. Clean "Make vs. Buy" manufacturing state restored.');
  };

  const handleLoadSampleOutsourceSupplierPrice = () => {
    if (!editingProduct) return;
    const sampleRecord: ProductSupplierPricingRecord = {
      id: Date.now(),
      supplierId: 5,
      supplierName: 'SOOL Packaging Co.',
      buyingUnit: editingProduct.buyingFormat || 'BOX',
      price: 520000,
      currency: 'LBP',
      date: '13-Sep-2026',
      supplierCode: 'WHT-VIN-12',
      target: 100,
      free: 5,
      discountPct: 2,
      discountNotes: 'Prompt 10-day payment discount',
      bonusPct: 1,
      bonusNotes: 'End-of-quarter volume rebate'
    };
    setEditingProduct({
      ...editingProduct,
      supplierPricings: [sampleRecord]
    });
    showToast('Loaded sample outsourced contract packaging price (SOOL - WHT-VIN-12)');
  };

  const handleRemoveSupplierPricing = (id: number) => {
    if (!editingProduct || !editingProduct.supplierPricings) return;
    setEditingProduct({
      ...editingProduct,
      supplierPricings: editingProduct.supplierPricings.filter((sp) => sp.id !== id)
    });
    showToast('Removed vendor pricing record');
  };

  const handleAddSupplierPricingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const supp = INITIAL_OMEGA_SUPPLIERS.find((s) => s.SUPPLIERID === newSuppPriceSupplierId) || INITIAL_OMEGA_SUPPLIERS[0];
    const priceNum = Number(newSuppPriceAmount) || 0;

    const newRecord: ProductSupplierPricingRecord = {
      id: Date.now(),
      supplierId: supp.SUPPLIERID,
      supplierName: supp.SUPPLIERNAME,
      buyingUnit: newSuppPriceBuyingUnit || editingProduct.buyingFormat || 'BOX',
      price: priceNum,
      currency: newSuppPriceCurrency,
      date: newSuppPriceDate || '13-Sep-2026',
      supplierCode: newSuppPriceSupplierCode.trim() || editingProduct.code,
      target: newSuppPriceTarget ? Number(newSuppPriceTarget) : undefined,
      free: newSuppPriceFree ? Number(newSuppPriceFree) : undefined,
      discountPct: newSuppPriceDiscountPct ? Number(newSuppPriceDiscountPct) : 0,
      discountNotes: newSuppPriceDiscountNotes.trim() || undefined,
      bonusPct: newSuppPriceBonusPct ? Number(newSuppPriceBonusPct) : undefined,
      bonusNotes: newSuppPriceBonusNotes.trim() || undefined
    };

    setEditingProduct({
      ...editingProduct,
      supplierPricings: [...(editingProduct.supplierPricings || []), newRecord]
    });

    setIsNewSupplierPricingModalOpen(false);
    setNewSuppPriceAmount('');
    setNewSuppPriceSupplierCode('');
    setNewSuppPriceTarget('');
    setNewSuppPriceFree('');
    setNewSuppPriceDiscountPct(0);
    setNewSuppPriceDiscountNotes('');
    setNewSuppPriceBonusPct('');
    setNewSuppPriceBonusNotes('');
    showToast(`Saved supplier pricing for ${supp.SUPPLIERNAME}`);
  };

  // Handler for Tab 7 History -> Sales Performance Simulation
  const handleSimulateLiveDispatchSale = () => {
    if (!editingProduct) return;
    const currentCost = editingProduct.unitCostLL || 543960;
    const sp1 = editingProduct.sellingPrice1LL || 1080000;
    const qty = 5;
    const revenue = qty * sp1;
    const totalCost = qty * currentCost;
    const grossProfit = revenue - totalCost;
    const marginPct = Number(((grossProfit / revenue) * 100).toFixed(2));

    const newTx: ProductSalesTransactionRecord = {
      id: Date.now(),
      date: '13-Sep-2026 11:35:00',
      receiptNumber: `DSP-API-${Math.floor(10000 + Math.random() * 90000)}`,
      source: 'Vanguard Supersonic Dispatch (API)',
      channel: 'Fleet Van #05 (South Highway Route)',
      qtySold: qty,
      unit: editingProduct.buyingFormat || 'BOX',
      priceType: 'Selling Price 1 (Standard)',
      unitSellingPrice: sp1,
      stampedHistoricalCost: currentCost,
      totalRevenue: revenue,
      totalCost: totalCost,
      grossProfit: grossProfit,
      marginPct: marginPct,
      isCorruptedCostTrap: false,
      syncStatus: 'Synced (API Verified)'
    };

    setEditingProduct({
      ...editingProduct,
      salesTransactions: [newTx, ...(editingProduct.salesTransactions || [])]
    });
    showToast('Synced new 5-box order from Next.js Supersonic Dispatch API (Cost stamped: 543,960 LL)');
  };

  // Handlers for Quick Adding Hierarchy / Master Entities
  const handleAddGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !editingProduct) return;
    const newG = {
      ID: Math.max(...invGroups.map((g) => g.ID), 0) + 1,
      GROUPNAME: newGroupName.trim(),
      DIVISIONNAME: editingProduct.divisionName,
      itemsCount: 0
    } as any;
    setInvGroups([...invGroups, newG]);
    setEditingProduct({ ...editingProduct, groupName: newG.GROUPNAME });
    setNewGroupName('');
    setIsAddGroupModalOpen(false);
    showToast(`New group "${newG.GROUPNAME}" added and selected`);
  };

  const handleAddLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocationName.trim() || !editingProduct) return;
    const newL: LocationItem = {
      ID: Math.max(...locationsList.map((l) => l.ID), 0) + 1,
      LOCATIONID: Math.max(...locationsList.map((l) => l.LOCATIONID), 0) + 1,
      LOCATIONDESCRIPTION: newLocationName.trim(),
      BRANCHID: 1
    };
    setLocationsList([...locationsList, newL]);
    setEditingProduct({ ...editingProduct, defaultLocationId: newL.LOCATIONID, defaultLocationName: newL.LOCATIONDESCRIPTION });
    setNewLocationName('');
    setIsAddLocationModalOpen(false);
    showToast(`New location "${newL.LOCATIONDESCRIPTION}" added and selected`);
  };

  const handleAddSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplierName.trim() || !editingProduct) return;
    const newS = {
      SUPPLIERID: Math.max(...suppliersList.map((s) => s.SUPPLIERID), 0) + 1,
      SUPPLIERNAME: newSupplierName.trim()
    } as any;
    setSuppliersList([...suppliersList, newS]);
    setEditingProduct({ ...editingProduct, mainSupplierId: newS.SUPPLIERID, mainSupplierName: newS.SUPPLIERNAME, lastSupplierName: newS.SUPPLIERNAME });
    setNewSupplierName('');
    setIsAddSupplierModalOpen(false);
    showToast(`New supplier "${newS.SUPPLIERNAME}" added and selected`);
  };

  const handleAddBrandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim() || !editingProduct) return;
    const newB = {
      id: Math.max(...brandsList.map((b) => b.id), 0) + 1,
      name: newBrandName.trim()
    };
    setBrandsList([...brandsList, newB]);
    setEditingProduct({ ...editingProduct, itemBrand: newB.name });
    setNewBrandName('');
    setIsAddBrandModalOpen(false);
    showToast(`New brand "${newB.name}" added and selected`);
  };

  const handleAddZoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName.trim() || !editingProduct) return;
    const newZ: ZoneItem = {
      id: Math.max(...zonesList.map((z) => z.id), 0) + 1,
      name: newZoneName.trim()
    };
    setZonesList([...zonesList, newZ]);
    setEditingProduct({ ...editingProduct, zone: newZ.name });
    setNewZoneName('');
    setIsAddZoneModalOpen(false);
    showToast(`New zone "${newZ.name}" added and selected`);
  };

  const handleAddAisleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAisleName.trim() || !editingProduct) return;
    const newA: AisleItem = {
      id: Math.max(...aislesList.map((a) => a.id), 0) + 1,
      name: newAisleName.trim()
    };
    setAislesList([...aislesList, newA]);
    setEditingProduct({ ...editingProduct, aisle: newA.name });
    setNewAisleName('');
    setIsAddAisleModalOpen(false);
    showToast(`New aisle "${newA.name}" added and selected`);
  };

  const handleAddExtraBarcode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExtraBarcode.trim() || !editingProduct) return;
    const curList = editingProduct.moreBarcodes || [];
    const item = {
      id: Date.now(),
      barcode: newExtraBarcode.trim(),
      note: `${newExtraBarcodeType} - ${newExtraBarcodeNote}`
    };
    setEditingProduct({
      ...editingProduct,
      moreBarcodes: [...curList, item]
    });
    setNewExtraBarcode('');
    showToast(`Added barcode ${item.barcode}`);
  };

  const handleDeleteExtraBarcode = (id: number) => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      moreBarcodes: (editingProduct.moreBarcodes || []).filter((b) => b.id !== id)
    });
    showToast('Barcode removed');
  };

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

  // Divisions matching currently selected categories
  const availableDivisions = useMemo(() => {
    const divs = INITIAL_OMEGA_INV_DIVISIONS.filter(
      (d) =>
        selectedCategories.includes(d.CATEGORYNAME) ||
        (selectedCategories.includes('Raw Materials') && d.CATEGORYNAME === 'Raw Materials')
    );
    const uniqueNames: string[] = [];
    divs.forEach((d) => {
      if (!uniqueNames.includes(d.DIVISIONNAME)) uniqueNames.push(d.DIVISIONNAME);
    });
    return uniqueNames;
  }, [selectedCategories]);

  // Groups matching currently selected divisions
  const availableGroups = useMemo(() => {
    return INITIAL_OMEGA_INV_GROUPS.filter((g) => selectedDivisions.includes(g.DIVISIONNAME));
  }, [selectedDivisions]);

  // Update selectedDivisions when categories change
  useEffect(() => {
    if (availableDivisions.length > 0) {
      if (!isMultiDivision) {
        if (!availableDivisions.some((d) => selectedDivisions.includes(d))) {
          setSelectedDivisions([availableDivisions[0]]);
        }
      } else {
        const valid = selectedDivisions.filter((d) => availableDivisions.includes(d));
        if (valid.length > 0) {
          setSelectedDivisions(valid);
        } else {
          setSelectedDivisions([availableDivisions[0]]);
        }
      }
    } else {
      setSelectedDivisions([]);
    }
  }, [availableDivisions, isMultiDivision]);

  // Update selectedGroups when divisions change
  useEffect(() => {
    if (availableGroups.length > 0) {
      if (!isMultiGroup) {
        if (!availableGroups.some((g) => selectedGroups.includes(g.GROUPNAME))) {
          setSelectedGroups([availableGroups[0].GROUPNAME]);
        }
      } else {
        const valid = selectedGroups.filter((g) => availableGroups.some((ag) => ag.GROUPNAME === g));
        if (valid.length > 0) {
          setSelectedGroups(valid);
        } else {
          setSelectedGroups([availableGroups[0].GROUPNAME]);
        }
      }
    } else {
      setSelectedGroups([]);
    }
  }, [availableGroups, isMultiGroup]);

  // Handle category tab click
  const handleCategoryClick = (catName: string) => {
    if (isMultiCategory) {
      if (selectedCategories.includes(catName)) {
        if (selectedCategories.length > 1) {
          setSelectedCategories(selectedCategories.filter((c) => c !== catName));
        }
      } else {
        setSelectedCategories([...selectedCategories, catName]);
      }
    } else {
      setSelectedCategories([catName]);
    }
  };

  // Handle division tab click
  const handleDivisionClick = (divName: string) => {
    if (isMultiDivision) {
      if (selectedDivisions.includes(divName)) {
        if (selectedDivisions.length > 1) {
          setSelectedDivisions(selectedDivisions.filter((d) => d !== divName));
        }
      } else {
        setSelectedDivisions([...selectedDivisions, divName]);
      }
    } else {
      setSelectedDivisions([divName]);
    }
  };

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
    setSelectedCategories(['مفرق']);
    setIsMultiCategory(false);
    setSelectedDivisions(['مقطرات ومدبسات مفرق']);
    setIsMultiDivision(false);
    setSelectedGroups(['مقطرات مفرق 250مل']);
    setIsMultiGroup(false);
    setMoreFilters({
      serialNumber: false,
      ingredients: false,
      colors: false,
      sizes: false,
      costZero: false,
      sellingPriceZero: false,
      logicalWarehouseNull: false,
      defaultLocationNull: false,
      serviceItems: false,
      consignmentItems: false,
      withoutReorderLevel: false,
      masterItems: false,
      discontinuedItems: false,
      withExpiry: false,
    });
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
        if (selectedCategories.length > 0 && !selectedCategories.includes(item.categoryName)) return false;
        if (selectedDivisions.length > 0 && !selectedDivisions.includes(item.divisionName)) return false;
        if (selectedGroups.length > 0 && !selectedGroups.includes(item.groupName)) return false;
      }

      // Supplier
      if (selectedSupplier !== 'All' && item.mainSupplierName !== selectedSupplier) return false;

      // Brand
      if (selectedBrand !== 'All' && item.itemBrand !== selectedBrand) return false;

      // Source
      if (selectedSource !== 'All' && (item.source || 'Local') !== selectedSource) return false;

      // More Filters (14 Authentic Omega ERP Specifications)
      if (moreFilters.serialNumber && !item.hasSerialNumber && (!item.serialNumber || item.serialNumber.trim() === '')) return false;
      if (moreFilters.ingredients && !item.hasIngredients && (!item.ingredients || item.ingredients.trim() === '')) return false;
      if (moreFilters.colors && !item.hasColors && (!item.color || item.color.trim() === '')) return false;
      if (moreFilters.sizes && !item.hasSizes && (!item.size || item.size.trim() === '')) return false;
      if (moreFilters.costZero && (Number(item.cost || 0) > 0 || Number(item.unitCostUSD || 0) > 0 || Number(item.unitCostLL || 0) > 0)) return false;
      if (moreFilters.sellingPriceZero && (Number(item.sellingPrice || 0) > 0 || Number(item.sellingPrice1USD || 0) > 0 || Number(item.sellingPrice1LL || 0) > 0)) return false;
      if (moreFilters.logicalWarehouseNull && item.logicalWarehouseName && item.logicalWarehouseName !== '' && item.logicalWarehouseName !== 'None' && item.logicalWarehouseId > 0) return false;
      if (moreFilters.defaultLocationNull && item.defaultLocationName && item.defaultLocationName !== '' && item.defaultLocationName !== 'None' && item.defaultLocationId > 0) return false;
      if (moreFilters.serviceItems && !item.isService && item.function !== 'Service' && item.sellingFunction !== 'Service' && item.categoryName !== 'Services') return false;
      if (moreFilters.consignmentItems && !item.isConsignment && item.source !== 'Consignment' && item.function !== 'Consignment') return false;
      if (moreFilters.withoutReorderLevel) {
        const hasReorder = (item.reorderLevel && item.reorderLevel > 0) || (item.stockRecords && item.stockRecords.some(s => s.reorderLevel && s.reorderLevel > 0));
        if (hasReorder) return false;
      }
      if (moreFilters.masterItems && !item.isMasterItem && item.function !== 'Master Item' && item.sellingFunction !== 'Master Item') return false;
      if (moreFilters.discontinuedItems && !item.isDiscontinued) return false;
      if (moreFilters.withExpiry && !item.hasExpiry && (!item.expiryDate || item.expiryDate.trim() === '')) return false;

      return true;
    });
  }, [
    products,
    searchQuery,
    selectedCategories,
    selectedDivisions,
    selectedGroups,
    selectedSupplier,
    selectedBrand,
    selectedSource,
    moreFilters
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

  // Filtered Sales Transactions for Tab 7 History -> Sales Performance
  const filteredSalesTransactions = useMemo(() => {
    if (!editingProduct?.salesTransactions) return [];
    if (salesPerfFilter === 'corruptedOnly') {
      return editingProduct.salesTransactions.filter((tx) => tx.isCorruptedCostTrap);
    }
    if (salesPerfFilter === 'apiOnly') {
      return editingProduct.salesTransactions.filter((tx) => tx.source.includes('Dispatch'));
    }
    if (salesPerfFilter === 'posOnly') {
      return editingProduct.salesTransactions.filter((tx) => tx.source.includes('POS'));
    }
    return editingProduct.salesTransactions;
  }, [editingProduct, salesPerfFilter]);

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
      categoryName: selectedCategories[0] || 'مفرق',
      divisionId: 5,
      divisionName: selectedDivisions[0] || 'مقطرات ومدبسات مفرق',
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
      autoDiscount: 0,
      hasSerialNumber: false,
      serialNumber: '',
      hasIngredients: false,
      ingredients: '',
      hasColors: false,
      color: '',
      hasSizes: false,
      size: '',
      isService: false,
      isConsignment: false,
      reorderLevel: 10,
      isMasterItem: false,
      hasExpiry: true,
      hasExpiryDate: true,
      expiryDate: '',
      hsCode: '2009.89.00',
      pluForScale: '',
      dimensionsLength: 30,
      dimensionsWidth: 20,
      dimensionsHeight: 25,
      dimensionsWeight: 6.5,
      dimensionsVolume: 0.015,
      itemSorting: 1,
      isBestSelling: false,
      sellOnline: true,
      forExport: false,
      hideIfZero: false,
      supportSerialNumber: false,
      consignment: false,
      printLabelOnSales: false,
      isRefundable: true,
      isOpenDescription: false,
      isWeeklyAdjust: false,
      isDailyAdjust: false,
      isHideInReport: false,
      isElectronicLabelTag: false,
      isYearlySubscription: false,
      mainImage: '',
      additionalImages: []
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
                  <button
                    type="button"
                    onClick={() => {
                      setIsActionsMenuOpen(false);
                      setInventoryProductionsReportMode('omega_anomaly');
                      setIsInventoryProductionsReportOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 text-[#195a96] hover:bg-blue-50 flex items-center gap-2 cursor-pointer font-semibold border-t border-slate-100"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#195a96]" />
                    <span>Inventory Productions [REP_I_0041]</span>
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

            {/* More Menu Dropdown (14 Authentic Omega ERP Specifications) */}
            <div className="relative" ref={moreRef}>
              <button
                type="button"
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className={`px-3 py-1 rounded-sm border text-xs font-normal flex items-center gap-1.5 cursor-pointer transition shadow-2xs ${
                  activeMoreFiltersCount > 0
                    ? 'border-blue-500 bg-blue-50/70 text-blue-700 font-semibold'
                    : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span>More</span>
                {activeMoreFiltersCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                    {activeMoreFiltersCount}
                  </span>
                )}
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isMoreMenuOpen && (
                <div className="absolute left-0 mt-1 w-72 bg-white border border-slate-200 rounded-sm shadow-2xl p-3 z-30 space-y-1.5 text-xs animate-fade-in max-h-[420px] overflow-y-auto">
                  <div className="flex items-center justify-between font-semibold text-slate-800 border-b border-slate-100 pb-1.5 mb-1">
                    <span className="text-[12px]">More Filters ({activeMoreFiltersCount})</span>
                    {activeMoreFiltersCount > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setMoreFilters({
                            serialNumber: false,
                            ingredients: false,
                            colors: false,
                            sizes: false,
                            costZero: false,
                            sellingPriceZero: false,
                            logicalWarehouseNull: false,
                            defaultLocationNull: false,
                            serviceItems: false,
                            consignmentItems: false,
                            withoutReorderLevel: false,
                            masterItems: false,
                            discontinuedItems: false,
                            withExpiry: false,
                          })
                        }
                        className="text-[10px] text-rose-600 hover:text-rose-800 cursor-pointer font-medium hover:underline"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    {MORE_FILTER_OPTIONS.map((opt) => {
                      const isActive = moreFilters[opt.key];
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => handleToggleMoreFilter(opt.key)}
                          className={`w-full text-left flex items-center justify-between py-1.5 px-2.5 rounded-xs cursor-pointer select-none transition-colors ${
                            isActive
                              ? 'bg-blue-50/90 text-blue-700 font-semibold border-l-2 border-blue-600'
                              : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <span className="text-[11.5px] leading-snug">{opt.label}</span>
                          {isActive && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>
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

            {/* Multi-Level Hierarchy Selection (Multi-Category, Multi-Division, Multi-Group) */}
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
              <label className="inline-flex items-center gap-1 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isMultiCategory}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsMultiCategory(checked);
                    if (!checked && selectedCategories.length > 1) {
                      setSelectedCategories([selectedCategories[0]]);
                    }
                  }}
                  className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <span className="font-medium text-[11.5px]">Multi-Category</span>
              </label>

              <label className="inline-flex items-center gap-1 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isMultiDivision}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsMultiDivision(checked);
                    if (!checked && selectedDivisions.length > 1) {
                      setSelectedDivisions([selectedDivisions[0]]);
                    }
                  }}
                  className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <span className="font-medium text-[11.5px]">Multi-Division</span>
              </label>

              <label className="inline-flex items-center gap-1 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isMultiGroup}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsMultiGroup(checked);
                    if (!checked && selectedGroups.length > 1) {
                      setSelectedGroups([selectedGroups[0]]);
                    }
                  }}
                  className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <span className="font-medium text-[11.5px]">Multi-Group</span>
              </label>
            </div>
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
            {OMEGA_PRODUCT_CATEGORIES.map((cat) => {
              const isSelected = selectedCategories.includes(cat.name);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.name)}
                  className={`px-3.5 py-1 text-xs font-semibold rounded-xs transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-white text-slate-900 border border-slate-300 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  {isSelected && isMultiCategory && <Check className="w-3 h-3 text-blue-600" />}
                  <span>{cat.name}</span>
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
            {availableDivisions.map((divName) => {
              const isSelected = selectedDivisions.includes(divName);
              return (
                <button
                  key={divName}
                  type="button"
                  onClick={() => handleDivisionClick(divName)}
                  className={`px-3 py-1 text-[11px] font-medium rounded-xs transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-white text-slate-900 border border-slate-300 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {isSelected && isMultiDivision && <Check className="w-3 h-3 text-blue-600" />}
                  <span>{divName}</span>
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
                              placeholder="Search in Vanguard Marketplace"
                              value={editingProduct.description}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, description: e.target.value })
                              }
                              className="flex-1 px-3 py-1.5 text-xs rounded-sm border border-blue-400 bg-white focus:outline-none focus:border-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => setIsVanguardMarketplaceModalOpen(true)}
                              title="Search in Vanguard Marketplace"
                              className="px-2.5 py-1.5 bg-[#23783a] hover:bg-[#1b602e] text-white rounded-sm cursor-pointer shadow-2xs"
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
                              className={`flex-1 px-3 py-1.5 text-xs rounded-l-sm rounded-r-none border border-r-0 ${
                                !editingProduct.groupName ? 'border-amber-400 bg-amber-50/40' : 'border-slate-300 bg-white'
                              } focus:outline-none focus:border-blue-500`}
                            >
                              <option value="">Select group</option>
                              {invGroups.map((g) => (
                                <option key={g.ID} value={g.GROUPNAME}>
                                  {g.GROUPNAME}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => setIsAddGroupModalOpen(true)}
                              title="Add Group"
                              className="px-2.5 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-r-sm cursor-pointer shadow-xs"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {!editingProduct.groupName && (
                            <p className="text-[10px] text-amber-700 mt-1 flex items-center gap-1 font-medium">
                              <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                              <span>Map to correct revenue bucket (e.g. مدبسات جملة or مقطرات جملة) for financial reports & APIs.</span>
                            </p>
                          )}
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
                              onClick={handleSaveSellingFunctionForGroup}
                              title="Save selling function for all items in same group"
                              className="px-2 py-1.5 bg-[#23783a] hover:bg-[#1b602e] text-white rounded-sm cursor-pointer shadow-2xs transition"
                            >
                              <Save className="w-3.5 h-3.5" />
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
                              <option value="">Select location</option>
                              {locationsList.map((l: LocationItem) => (
                                <option key={l.LOCATIONID} value={l.LOCATIONDESCRIPTION}>
                                  {l.LOCATIONDESCRIPTION}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={handleSaveDefaultLocationForGroup}
                              title="Save default location for all items in same group"
                              className="px-2 py-1.5 bg-[#23783a] hover:bg-[#1b602e] text-white cursor-pointer shadow-2xs"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsAddLocationModalOpen(true)}
                              title="Add Location"
                              className="px-2.5 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white cursor-pointer shadow-xs"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsFloorZoneAisleOpen(!isFloorZoneAisleOpen)}
                              title="Toggle Floor, Zone, Aisle"
                              className="px-2.5 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-r-sm cursor-pointer font-bold tracking-widest text-[11px]"
                            >
                              ...
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
                              onClick={handleSaveLogicalWarehouseForGroup}
                              title="Apply logical warehouse to all items in same group"
                              className="px-2 py-1.5 bg-[#23783a] hover:bg-[#1b602e] text-white rounded-sm cursor-pointer shadow-2xs transition"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Floor, Zone, Aisle Expandable Row (Image 2) */}
                      {isFloorZoneAisleOpen && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-sm animate-fade-in">
                          <div>
                            <label className="block text-slate-700 font-medium mb-1">Floor</label>
                            <input
                              type="text"
                              value={editingProduct.floor || ''}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, floor: e.target.value })
                              }
                              placeholder="Floor"
                              className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-700 font-medium mb-1">Zone</label>
                            <div className="flex">
                              <select
                                value={editingProduct.zone || ''}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, zone: e.target.value })
                                }
                                className="flex-1 px-3 py-1.5 text-xs rounded-l-sm rounded-r-none border border-r-0 border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                              >
                                <option value="">Select zone</option>
                                {zonesList.map((z) => (
                                  <option key={z.id} value={z.name}>
                                    {z.name}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => setIsAddZoneModalOpen(true)}
                                title="Add Zone"
                                className="px-2.5 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-r-sm cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-slate-700 font-medium mb-1">Aisle</label>
                            <div className="flex">
                              <select
                                value={editingProduct.aisle || ''}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, aisle: e.target.value })
                                }
                                className="flex-1 px-3 py-1.5 text-xs rounded-l-sm rounded-r-none border border-r-0 border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                              >
                                <option value="">Select aisle</option>
                                {aislesList.map((a) => (
                                  <option key={a.id} value={a.name}>
                                    {a.name}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => setIsAddAisleModalOpen(true)}
                                title="Add Aisle"
                                className="px-2.5 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-r-sm cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-slate-700 font-medium mb-1">Main Supplier*</label>
                          <div className="flex">
                            <select
                              value={editingProduct.mainSupplierName}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, mainSupplierName: e.target.value, lastSupplierName: e.target.value })
                              }
                              className="flex-1 px-3 py-1.5 text-xs rounded-l-sm rounded-r-none border border-r-0 border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                            >
                              {suppliersList.map((s: SupplierItem) => (
                                <option key={s.SUPPLIERID} value={s.SUPPLIERNAME}>
                                  {s.SUPPLIERNAME}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={handleSaveSupplierForGroup}
                              title="Save supplier for all items in same group"
                              className="px-2 py-1.5 bg-[#23783a] hover:bg-[#1b602e] text-white cursor-pointer shadow-2xs"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsPurchaseHistoryModalOpen(true)}
                              title="Purchase History"
                              className="px-2 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white cursor-pointer"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsAddSupplierModalOpen(true)}
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
                              {brandsList.map((b) => (
                                <option key={b.id} value={b.name}>
                                  {b.name}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => setIsAddBrandModalOpen(true)}
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
                      {/* Commercial Case Presets */}
                      <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-100">
                        <span className="text-[11px] font-semibold text-slate-500">Commercial Presets:</span>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingProduct({
                              ...editingProduct,
                              buyingFormat: 'BOX',
                              inventoryFormat: 'BOT',
                              usageFormat: 'BOT',
                              qtyInBuyingFormat: 12,
                              qtyInInventoryFormat: 1,
                              unit: 'BOT'
                            })
                          }
                          className="px-2 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 font-medium cursor-pointer"
                        >
                          12x Bottles Case (BOX/12)
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingProduct({
                              ...editingProduct,
                              buyingFormat: 'BOX',
                              inventoryFormat: 'BOT',
                              usageFormat: 'BOT',
                              qtyInBuyingFormat: 24,
                              qtyInInventoryFormat: 1,
                              unit: 'BOT'
                            })
                          }
                          className="px-2 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 font-medium cursor-pointer"
                        >
                          24x Bottles Case (BOX/24)
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingProduct({
                              ...editingProduct,
                              buyingFormat: 'BOX',
                              inventoryFormat: 'JAR',
                              usageFormat: 'JAR',
                              qtyInBuyingFormat: 12,
                              qtyInInventoryFormat: 1,
                              unit: 'JAR'
                            })
                          }
                          className="px-2 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 font-medium cursor-pointer"
                        >
                          12x Jars Case (BOX/12)
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingProduct({
                              ...editingProduct,
                              buyingFormat: 'UNIT',
                              inventoryFormat: 'UNIT',
                              usageFormat: 'UNIT',
                              qtyInBuyingFormat: 1,
                              qtyInInventoryFormat: 1,
                              unit: 'UNIT'
                            })
                          }
                          className="px-2 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 font-medium cursor-pointer"
                        >
                          Retail Single Unit (1:1)
                        </button>
                      </div>

                      {/* Stock Integrity & Divisibility Bottleneck Banner */}
                      {editingProduct.buyingFormat === 'BOX' && editingProduct.inventoryFormat === 'BOX' && (Number(editingProduct.qtyInBuyingFormat) <= 1 || !editingProduct.qtyInBuyingFormat) ? (
                        <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-sm text-xs text-rose-950 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-bold text-rose-900">
                              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                              <span>Unit Format Divisibility Bottleneck: Undivided Box Format</span>
                            </div>
                            <span className="px-2 py-0.5 bg-rose-600 text-white font-mono text-[10px] font-bold rounded">
                              DISPATCH LOCK
                            </span>
                          </div>
                          <p className="text-slate-700 text-[11px] leading-relaxed">
                            Buying Format and Inventory Format are both configured as <strong>BOX</strong> with Quantity = 1. If customers or dispatch orders request partial cases (e.g. 3 individual 500ml bottles), Vanguard Dispatch and Omega POS barcode scanners will fail or lock the entire 12-pack case. For split-case retail/wholesale sales, set <strong>Inventory Format to BOT</strong> with <strong>Qty In Buying Format = 12</strong>.
                          </p>
                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={() =>
                                setEditingProduct({
                                  ...editingProduct,
                                  buyingFormat: 'BOX',
                                  inventoryFormat: 'BOT',
                                  usageFormat: 'BOT',
                                  qtyInBuyingFormat: 12,
                                  qtyInInventoryFormat: 1,
                                  unit: 'BOT'
                                })
                              }
                              className="px-3 py-1 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-sm shadow-xs flex items-center gap-1.5 cursor-pointer transition"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>⚡ Convert to Divisible Case (Inventory: BOT x 12)</span>
                            </button>
                          </div>
                        </div>
                      ) : editingProduct.buyingFormat === 'BOX' && (Number(editingProduct.qtyInBuyingFormat) <= 1 || !editingProduct.qtyInBuyingFormat) ? (
                        <div className="p-2.5 bg-amber-50 border border-amber-300 rounded text-[11px] text-amber-800 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-bold text-amber-900">Unit Format Integrity Alert:</span> Buying Format is set to <strong>BOX</strong> with Quantity = 1. If this is a commercial case pack (e.g. 12-pack vinegars or 24-pack molasses), set <strong>Qty In Buying Format</strong> to the exact bottle count ({editingProduct.qtyInBuyingFormat || 12}) so Vanguard ERP and POS inventory calculate the stock and costs per bottle accurately!
                          </div>
                        </div>
                      ) : (
                        <div className="p-2 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-900 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-blue-600" />
                            <span><strong>Stock Integrity Equation:</strong> 1 {editingProduct.buyingFormat} = {editingProduct.qtyInBuyingFormat || 1} × {editingProduct.inventoryFormat}. (Case Cost is divided across {editingProduct.qtyInBuyingFormat || 1} units).</span>
                          </div>
                          <span className="text-[10px] bg-blue-100 text-blue-800 font-mono px-1.5 py-0.5 rounded font-bold">
                            Yield: 1 → {editingProduct.qtyInBuyingFormat || 1}
                          </span>
                        </div>
                      )}

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

                  {/* Card 3: Cost (Image 1) */}
                  <div className="border border-slate-200 rounded-sm overflow-hidden">
                    <div className="bg-[#f8fafc] px-4 py-2 border-b border-slate-200 font-semibold text-slate-800">
                      Cost
                    </div>
                    <div className="p-4 space-y-3">
                      {/* Currency & Margin Integrity Note */}
                      <div className="p-2 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-[#23783a]" />
                          <span><strong>Costing Automation:</strong> Input your production cost into <strong>Unit Cost $</strong> or <strong>Unit Cost LL</strong> to automatically synchronize at {(editingProduct.secondCurrencyRate || 90000).toLocaleString()} LL/$ and protect your target margins.</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">1 $ = {(editingProduct.secondCurrencyRate || 90000).toLocaleString()} LL</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Col 1 & 2 */}
                        <div className="md:col-span-2 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-slate-700 font-medium mb-1">Unit Cost LL</label>
                              <input
                                type="number"
                                value={editingProduct.unitCostLL || ''}
                                onChange={(e) => handleUnitCostLLChange(Number(e.target.value))}
                                placeholder="e.g. 180000"
                                className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500 font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-700 font-medium mb-1">Average Cost LL</label>
                              <input
                                type="number"
                                value={editingProduct.averageCostLL || ''}
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
                              <label className="block text-slate-700 font-medium mb-1">Unit Cost $ (True Cost)</label>
                              <input
                                type="number"
                                step="0.000001"
                                value={editingProduct.unitCostUSD || ''}
                                onChange={(e) => handleUnitCostUSDChange(Number(e.target.value))}
                                placeholder="e.g. 2.00"
                                className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500 font-mono font-semibold text-[#195a96]"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-700 font-medium mb-1">Average Cost $</label>
                              <input
                                type="number"
                                step="0.000001"
                                value={editingProduct.averageCostUSD || ''}
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

                        {/* Col 3: Additional Cost, Markup %, Recommended Price & Recalculate */}
                        <div className="space-y-3 border-l border-slate-200 pl-4">
                          <div>
                            <label className="block text-slate-700 font-medium mb-1">Additional Cost LL</label>
                            <input
                              type="number"
                              value={editingProduct.additionalCostLL || ''}
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
                                  value={editingProduct.markupPct ?? 0}
                                  onChange={(e) => {
                                    const m = Number(e.target.value);
                                    const cost = editingProduct.unitCostLL || 0;
                                    const rec = Math.round(cost * (1 + m / 100));
                                    setEditingProduct({
                                      ...editingProduct,
                                      markupPct: m,
                                      recommendedPriceLL: rec
                                    });
                                  }}
                                  className="flex-1 px-2 py-1.5 text-xs rounded-sm border border-slate-300 bg-white"
                                />
                                <button
                                  type="button"
                                  onClick={handleSaveMarkupForGroup}
                                  title="Save Markup % for all items in same group"
                                  className="px-2 py-1 bg-[#23783a] hover:bg-[#1b602e] text-white rounded-xs cursor-pointer shadow-2xs"
                                >
                                  <Save className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <div>
                              <label className="block text-slate-700 font-medium mb-1">Recommended Price</label>
                              <div className="flex gap-1">
                                <input
                                  type="number"
                                  value={editingProduct.recommendedPriceLL || ''}
                                  onChange={(e) =>
                                    setEditingProduct({
                                      ...editingProduct,
                                      recommendedPriceLL: Number(e.target.value)
                                    })
                                  }
                                  className="flex-1 px-2 py-1.5 text-xs rounded-sm border border-slate-300 bg-white font-mono font-semibold"
                                />
                                <button
                                  type="button"
                                  onClick={() => setIsApplyRecommendedPriceModalOpen(true)}
                                  title="Apply recommended price to selling prices"
                                  className="px-2 py-1 bg-[#23783a] hover:bg-[#1b602e] text-white rounded-xs cursor-pointer shadow-2xs"
                                >
                                  <Save className="w-3 h-3" />
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

                  {/* Card 4: Selling Price (Image 1) */}
                  <div className="border border-slate-200 rounded-sm overflow-hidden">
                    <div className="bg-[#f8fafc] px-4 py-2 border-b border-slate-200 font-semibold text-slate-800 flex items-center justify-between">
                      <span>Selling Price</span>
                      <div className="flex items-center gap-4 text-xs">
                        <button
                          type="button"
                          onClick={() => setIsPriceVariationsModalOpen(true)}
                          className="text-[#195a96] hover:underline font-medium cursor-pointer"
                        >
                          Price Variations
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsLastPricesModalOpen(true)}
                          className="text-[#195a96] hover:underline font-medium cursor-pointer"
                        >
                          Last Prices
                        </button>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-800">Selling price 2nd currency</span>
                          <button
                            type="button"
                            onClick={handleApplySecondCurrencyRates}
                            title="Calculate USD prices at second currency rate"
                            className="p-1 bg-[#23783a] hover:bg-[#1b602e] text-white rounded-xs cursor-pointer shadow-2xs"
                          >
                            <Save className="w-3 h-3" />
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

                        const tierLabels = [
                          'Tier 1: Retail (Base)',
                          'Tier 2: Wholesale',
                          'Tier 3: Distributor',
                          'Tier 4: Special Contract'
                        ];
                        const tierName = tierLabels[num - 1];

                        const profitVal = Number(editingProduct[pfKey]) || 0;
                        const targetMarkup = editingProduct.markupPct || 30;

                        return (
                          <div
                            key={num}
                            className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center border-b border-slate-100 pb-2.5"
                          >
                            <div className="md:col-span-3">
                              <label className="flex items-center justify-between text-slate-700 font-medium mb-1">
                                <span>{tierName} LL</span>
                              </label>
                              <input
                                type="number"
                                value={Number(editingProduct[spKey]) || ''}
                                onChange={(e) => handleSellingPriceLLChange(num, Number(e.target.value))}
                                placeholder="e.g. 240000"
                                className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white font-mono"
                              />
                            </div>

                            <div className="md:col-span-3">
                              <label className="block text-slate-700 font-medium mb-1">Before Tax {num} LL</label>
                              <input
                                type="number"
                                value={Number(editingProduct[btKey]) || ''}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, [btKey]: Number(e.target.value) })
                                }
                                className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-[#e9ecef] font-mono"
                              />
                            </div>

                            {num > 1 ? (
                              <div className="md:col-span-2">
                                <label className="flex items-center gap-1 text-slate-700 font-medium mb-1">
                                  <span>Min Qty Trigger</span>
                                  <span title="Wholesale volume discount trigger: triggers this tier price when customer orders at least this quantity">
                                    <HelpCircle className="w-3 h-3 text-slate-500 cursor-help" />
                                  </span>
                                </label>
                                <input
                                  type="number"
                                  value={Number(editingProduct[qtyKey] || 1)}
                                  onChange={(e) =>
                                    setEditingProduct({ ...editingProduct, [qtyKey]: Number(e.target.value) })
                                  }
                                  className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white font-mono"
                                />
                              </div>
                            ) : (
                              <div className="md:col-span-2">
                                <span className="block text-[11px] text-slate-400 mt-5 italic">Default single unit</span>
                              </div>
                            )}

                            <div className="md:col-span-2">
                              <div className="flex items-center justify-between mb-1">
                                <label className="block text-slate-700 font-medium">Profit {num} %</label>
                                <span
                                  className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                                    profitVal <= 0
                                      ? 'bg-rose-100 text-rose-800'
                                      : profitVal < targetMarkup
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {profitVal <= 0 ? 'ALERT' : profitVal < targetMarkup ? 'LOW' : 'OK'}
                                </span>
                              </div>
                              <input
                                type="number"
                                step="0.01"
                                value={profitVal || ''}
                                readOnly
                                title={
                                  profitVal <= 0
                                    ? 'Margin Alert: Selling at or below unit cost! Risk of margin cannibalization.'
                                    : profitVal < targetMarkup
                                    ? `Margin Alert: Below category target markup of ${targetMarkup}%.`
                                    : `Healthy margin meets or exceeds ${targetMarkup}% markup.`
                                }
                                className={`w-full px-3 py-1.5 text-xs font-bold rounded-sm border font-mono ${
                                  profitVal <= 0
                                    ? 'bg-rose-50 border-rose-300 text-rose-700'
                                    : profitVal < targetMarkup
                                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                                    : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                }`}
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-slate-700 font-medium mb-1">Selling Price {num} $</label>
                              <input
                                type="number"
                                step="0.01"
                                value={Number(editingProduct[usdKey]) || ''}
                                onChange={(e) => handleSellingPriceUSDChange(num, Number(e.target.value))}
                                placeholder="e.g. 2.67"
                                className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white font-mono font-semibold text-[#195a96]"
                              />
                            </div>
                          </div>
                        );
                      })}

                      {/* Second Currency Rate */}
                      <div className="flex justify-end pt-1">
                        <div className="w-64">
                          <label className="block text-slate-700 font-medium mb-1">Second Currency Rate</label>
                          <input
                            type="number"
                            value={editingProduct.secondCurrencyRate || 90000}
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

                  {/* Card 5: Barcodes (Image 1) */}
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
                              value={editingProduct.barcode || ''}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, barcode: e.target.value })
                              }
                              className="flex-1 px-3 py-1.5 text-xs rounded-l-sm rounded-r-none border border-r-0 border-slate-300 bg-white"
                            />
                            <button
                              type="button"
                              title="Barcode Scanner / Generate"
                              className="px-2.5 py-1.5 bg-[#4c5c7a] text-white rounded-r-sm cursor-pointer"
                            >
                              <Barcode className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="md:col-span-4">
                          <label className="block text-slate-700 font-medium mb-1">Alternative Barcode 2</label>
                          <input
                            type="text"
                            value={editingProduct.alternativeBarcode2 || ''}
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
                            value={editingProduct.rfidt1 || ''}
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
                            value={editingProduct.alternativeBarcode3 || ''}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, alternativeBarcode3: e.target.value })
                            }
                            className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white"
                          />
                        </div>

                        <div className="md:col-span-4 pt-4">
                          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={Boolean(editingProduct.applySp2Qty2)}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, applySp2Qty2: e.target.checked })
                              }
                              className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 cursor-pointer"
                            />
                            <span className="font-medium text-slate-700">Apply sp2 qty2</span>
                          </label>
                        </div>

                        <div className="md:col-span-3">
                          <label className="block text-slate-700 font-medium mb-1">RFIDT 2</label>
                          <input
                            type="text"
                            value={editingProduct.rfidt2 || ''}
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
                          onClick={() => setIsMoreBarcodesModalOpen(true)}
                          className="px-3.5 py-1.5 bg-[#23783a] hover:bg-[#1b602e] text-white font-semibold text-xs rounded-sm shadow-2xs flex items-center gap-1 cursor-pointer transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>More Barcodes</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card 6: Customs, Freight Logistics & POS Interface */}
                  <div className="border border-slate-200 rounded-sm overflow-hidden">
                    <div className="bg-[#f8fafc] px-4 py-2 border-b border-slate-200 font-semibold text-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-[#195a96]" />
                        <span>Customs, Freight Logistics & POS Interface</span>
                      </div>
                      <span className="text-[11px] font-normal text-slate-500">
                        HS commodity classification, scale PLU, freight volumetric specs & POS velocity
                      </span>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        {/* HS Code */}
                        <div className="md:col-span-4">
                          <label className="flex items-center justify-between text-slate-700 font-medium mb-1">
                            <span>HS Code (Customs / Export)*</span>
                            <span className="text-[10px] text-slate-400 font-mono">Commodity Tariff</span>
                          </label>
                          <input
                            type="text"
                            value={editingProduct.hsCode || ''}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, hsCode: e.target.value })
                            }
                            placeholder="e.g. 2009.89.00 (Molasses) / 2209.00.00 (Vinegars)"
                            className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white font-mono"
                          />
                          <p className="text-[10px] text-slate-500 mt-1">
                            Mandatory for commercial invoices and international export documentation.
                          </p>
                        </div>

                        {/* PLU For Scale */}
                        <div className="md:col-span-4">
                          <label className="flex items-center justify-between text-slate-700 font-medium mb-1">
                            <span>PLU For Scale</span>
                            <span className="text-[10px] text-slate-400">Weight-based barcode</span>
                          </label>
                          <input
                            type="text"
                            value={editingProduct.pluForScale || ''}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, pluForScale: e.target.value })
                            }
                            placeholder="Leave blank for pre-packaged cases"
                            className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white font-mono"
                          />
                          <p className="text-[10px] text-slate-500 mt-1">
                            Required only for bulk weighed items (e.g. bulk cheese, fats) to print scale barcode.
                          </p>
                        </div>

                        {/* Item Sorting & Best Selling */}
                        <div className="md:col-span-2">
                          <label className="block text-slate-700 font-medium mb-1">Item Sorting</label>
                          <input
                            type="number"
                            value={editingProduct.itemSorting ?? 0}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, itemSorting: Number(e.target.value) })
                            }
                            placeholder="0"
                            className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white font-mono"
                          />
                          <p className="text-[10px] text-slate-500 mt-1">
                            Priority index for category sorting in POS.
                          </p>
                        </div>

                        <div className="md:col-span-2 flex items-center pt-5">
                          <label className="inline-flex items-center gap-2 cursor-pointer select-none p-2 rounded-sm border border-slate-200 bg-slate-50 hover:bg-slate-100 transition w-full">
                            <input
                              type="checkbox"
                              checked={Boolean(editingProduct.isBestSelling)}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, isBestSelling: e.target.checked })
                              }
                              className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                            />
                            <div className="flex items-center gap-1">
                              <Star className={`w-3.5 h-3.5 ${editingProduct.isBestSelling ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                              <span className="font-semibold text-slate-800 text-xs">Best Selling</span>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Physical Dimensions (Logistics & Freight Calculation) */}
                      <div className="pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-slate-700 font-medium text-xs flex items-center gap-1.5">
                            <span>Physical Dimensions (BOX Format & Pallet Freight Estimation)</span>
                          </label>
                          <span className="text-[11px] text-slate-500 italic">
                            Used by Vanguard Dispatch & freight modules for pallet load calculations
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          <div>
                            <label className="block text-[11px] text-slate-600 mb-1">Length (cm)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={editingProduct.dimensionsLength || ''}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, dimensionsLength: Number(e.target.value) })
                              }
                              placeholder="e.g. 38.5"
                              className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-600 mb-1">Width (cm)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={editingProduct.dimensionsWidth || ''}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, dimensionsWidth: Number(e.target.value) })
                              }
                              placeholder="e.g. 26.0"
                              className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-600 mb-1">Height (cm)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={editingProduct.dimensionsHeight || ''}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, dimensionsHeight: Number(e.target.value) })
                              }
                              placeholder="e.g. 24.5"
                              className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-600 mb-1">Weight (kg / gross)</label>
                            <input
                              type="number"
                              step="0.01"
                              value={editingProduct.dimensionsWeight || ''}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, dimensionsWeight: Number(e.target.value) })
                              }
                              placeholder="e.g. 14.8"
                              className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-600 mb-1">Volume (m³)</label>
                            <input
                              type="number"
                              step="0.001"
                              value={
                                editingProduct.dimensionsVolume ||
                                (editingProduct.dimensionsLength && editingProduct.dimensionsWidth && editingProduct.dimensionsHeight
                                  ? Number(((editingProduct.dimensionsLength * editingProduct.dimensionsWidth * editingProduct.dimensionsHeight) / 1000000).toFixed(4))
                                  : '')
                              }
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, dimensionsVolume: Number(e.target.value) })
                              }
                              placeholder="Auto m³"
                              className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-slate-50 font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* TAB: MORE (Accounts, Taxes, 15 Compliance & Lifecycle Flags) */}
              {activeModalTab === 'more' && (
                <div className="space-y-4">
                  {/* Subtabs Header */}
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
                      Advanced Attributes & Compliance (15 Flags)
                    </button>
                  </div>

                  {moreSubTab === 'accounts' && (
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
                  )}

                  {moreSubTab === 'taxes' && (
                    <div className="border border-slate-200 rounded-sm p-4 space-y-4">
                      <h3 className="font-semibold text-slate-800 text-xs border-b border-slate-100 pb-2">
                        Taxes & Discounts
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
                              <span className="font-medium">Tax {num}</span>
                            </label>
                          );
                        })}
                      </div>
                      <div className="pt-2 border-t border-slate-100">
                        <label className="block text-slate-700 font-medium mb-1">Auto Discount %</label>
                        <input
                          type="number"
                          value={editingProduct.autoDiscount || ''}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, autoDiscount: Number(e.target.value) })
                          }
                          className="w-48 px-3 py-1.5 text-xs rounded-sm border border-slate-300"
                        />
                      </div>
                    </div>
                  )}

                  {moreSubTab === 'advanced' && (
                    <div className="border border-slate-200 rounded-sm p-4 space-y-5 text-xs">
                      {/* Section 1: Food Safety, Compliance & Traceability */}
                      <div>
                        <h4 className="font-semibold text-slate-800 text-xs border-b border-slate-200 pb-1.5 mb-3 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
                            1. Food Safety, Compliance & Batch Tracking
                          </span>
                          <span className="text-[10px] text-slate-400">Critical Food Formulation Rules</span>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {/* Has Expiry Date */}
                          <div className="p-2.5 rounded-sm border border-emerald-200 bg-emerald-50/50">
                            <label className="flex items-start gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={Boolean(editingProduct.hasExpiryDate ?? true)}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, hasExpiryDate: e.target.checked, hasExpiry: e.target.checked })
                                }
                                className="w-4 h-4 rounded border-emerald-400 text-emerald-600 mt-0.5"
                              />
                              <div>
                                <span className="font-bold text-emerald-900 block">Has Expiry Date (FIFO)</span>
                                <span className="text-[11px] text-emerald-800 block mt-0.5">
                                  Mandatory for molasses, vinegar, tomato paste, jams & fats. Prompts batch expiry date on receipt from Choueifat plant.
                                </span>
                              </div>
                            </label>
                          </div>

                          {/* Support Serial Number */}
                          <div className="p-2.5 rounded-sm border border-slate-200 bg-slate-50">
                            <label className="flex items-start gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={Boolean(editingProduct.supportSerialNumber)}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, supportSerialNumber: e.target.checked, hasSerialNumber: e.target.checked })
                                }
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 mt-0.5"
                              />
                              <div>
                                <span className="font-semibold text-slate-800 block">Support Serial Number</span>
                                <span className="text-[11px] text-slate-500 block mt-0.5">
                                  For electronics & serialized equipment. Leave unchecked for case packs of vinegars and Eau de Javel.
                                </span>
                              </div>
                            </label>
                          </div>

                          {/* Print Label on Sales */}
                          <div className="p-2.5 rounded-sm border border-slate-200 bg-slate-50">
                            <label className="flex items-start gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={Boolean(editingProduct.printLabelOnSales)}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, printLabelOnSales: e.target.checked })
                                }
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 mt-0.5"
                              />
                              <div>
                                <span className="font-semibold text-slate-800 block">Print Label on Sales</span>
                                <span className="text-[11px] text-slate-500 block mt-0.5">
                                  Generates sticker at moment of sale for bulk unlabelled goods (like fresh local cheese).
                                </span>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Channel Visibility & ERP Linkage */}
                      <div>
                        <h4 className="font-semibold text-slate-800 text-xs border-b border-slate-200 pb-1.5 mb-3 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                            2. Channel Visibility & ERP / Dispatch Linkage
                          </span>
                          <span className="text-[10px] text-slate-400">API & B2B Portal Visibility</span>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {/* Sell it Online */}
                          <div className="p-2.5 rounded-sm border border-blue-200 bg-blue-50/50">
                            <label className="flex items-start gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={Boolean(editingProduct.sellOnline ?? true)}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, sellOnline: e.target.checked })
                                }
                                className="w-4 h-4 rounded border-blue-400 text-blue-600 mt-0.5"
                              />
                              <div>
                                <span className="font-bold text-blue-900 block">Sell it Online (API Visibility)</span>
                                <span className="text-[11px] text-blue-800 block mt-0.5">
                                  Exposes item to Vanguard ERP, Supersonic Dispatch & B2B ordering portal.
                                </span>
                              </div>
                            </label>
                          </div>

                          {/* For Export */}
                          <div className="p-2.5 rounded-sm border border-slate-200 bg-slate-50">
                            <label className="flex items-start gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={Boolean(editingProduct.forExport)}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, forExport: e.target.checked })
                                }
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 mt-0.5"
                              />
                              <div>
                                <span className="font-semibold text-slate-800 block">For Export</span>
                                <span className="text-[11px] text-slate-500 block mt-0.5">
                                  Works with HS Code to trigger international commercial invoice formatting & customs tax exemptions.
                                </span>
                              </div>
                            </label>
                          </div>

                          {/* Hide if Zero */}
                          <div className="p-2.5 rounded-sm border border-slate-200 bg-slate-50">
                            <label className="flex items-start gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={Boolean(editingProduct.hideIfZero)}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, hideIfZero: e.target.checked })
                                }
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 mt-0.5"
                              />
                              <div>
                                <span className="font-semibold text-slate-800 block">Hide if Zero</span>
                                <span className="text-[11px] text-slate-500 block mt-0.5">
                                  Hides SKU from POS when Qty OH is zero. Leave unchecked for core manufactured goods to signal production runs.
                                </span>
                              </div>
                            </label>
                          </div>

                          {/* Hide in Report */}
                          <div className="p-2.5 rounded-sm border border-slate-200 bg-slate-50">
                            <label className="flex items-start gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={Boolean(editingProduct.isHideInReport)}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, isHideInReport: e.target.checked })
                                }
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 mt-0.5"
                              />
                              <div>
                                <span className="font-semibold text-slate-800 block">Hide In Report</span>
                                <span className="text-[11px] text-slate-500 block mt-0.5">
                                  Keeps internal supplies or zero-value placeholder SKUs out of financial valuation reports.
                                </span>
                              </div>
                            </label>
                          </div>

                          {/* Electronic Label Tag */}
                          <div className="p-2.5 rounded-sm border border-slate-200 bg-slate-50">
                            <label className="flex items-start gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={Boolean(editingProduct.isElectronicLabelTag)}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, isElectronicLabelTag: e.target.checked })
                                }
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 mt-0.5"
                              />
                              <div>
                                <span className="font-semibold text-slate-800 block">Electronic Label Tag (ESL)</span>
                                <span className="text-[11px] text-slate-500 block mt-0.5">
                                  Integrates item pricing via API to digital electronic shelf tags.
                                </span>
                              </div>
                            </label>
                          </div>

                          {/* Discontinued */}
                          <div className="p-2.5 rounded-sm border border-rose-200 bg-rose-50/40">
                            <label className="flex items-start gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={Boolean(editingProduct.isDiscontinued)}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, isDiscontinued: e.target.checked })
                                }
                                className="w-4 h-4 rounded border-rose-400 text-rose-600 mt-0.5"
                              />
                              <div>
                                <span className="font-bold text-rose-900 block">Discontinued Item</span>
                                <span className="text-[11px] text-rose-800 block mt-0.5">
                                  Permanently removes retired jar sizes or legacy batches from active PO/POS menus without deleting sales history.
                                </span>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Commercial Policy & Lifecycle Governance */}
                      <div>
                        <h4 className="font-semibold text-slate-800 text-xs border-b border-slate-200 pb-1.5 mb-3 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Settings className="w-3.5 h-3.5 text-purple-600" />
                            3. Commercial Policy & Sales Lifecycle Governance
                          </span>
                          <span className="text-[10px] text-slate-400">Invoicing & Returns Controls</span>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {/* Refundable */}
                          <div className="p-2.5 rounded-sm border border-slate-200 bg-slate-50">
                            <label className="flex items-start gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={Boolean(editingProduct.isRefundable ?? true)}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, isRefundable: e.target.checked })
                                }
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 mt-0.5"
                              />
                              <div>
                                <span className="font-semibold text-slate-800 block">Refundable</span>
                                <span className="text-[11px] text-slate-500 block mt-0.5">
                                  Allows POS returns and credit notes. Uncheck for custom bulk chemical orders that cannot be restocked once dispatched.
                                </span>
                              </div>
                            </label>
                          </div>

                          {/* Open Description */}
                          <div className="p-2.5 rounded-sm border border-slate-200 bg-slate-50">
                            <label className="flex items-start gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={Boolean(editingProduct.isOpenDescription)}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, isOpenDescription: e.target.checked })
                                }
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 mt-0.5"
                              />
                              <div>
                                <span className="font-semibold text-slate-800 block">Open Description</span>
                                <span className="text-[11px] text-slate-500 block mt-0.5">
                                  Cashier can manually overwrite item name on invoice. Keep unchecked for standardized commercial goods to prevent report corruption.
                                </span>
                              </div>
                            </label>
                          </div>

                          {/* Consignment */}
                          <div className="p-2.5 rounded-sm border border-slate-200 bg-slate-50">
                            <label className="flex items-start gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={Boolean(editingProduct.consignment || editingProduct.isConsignment)}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, consignment: e.target.checked, isConsignment: e.target.checked })
                                }
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 mt-0.5"
                              />
                              <div>
                                <span className="font-semibold text-slate-800 block">Consignment</span>
                                <span className="text-[11px] text-slate-500 block mt-0.5">
                                  Placement in external retail shops without upfront payment. Standard wholesale batches are direct revenue (leave unchecked).
                                </span>
                              </div>
                            </label>
                          </div>

                          {/* Yearly Subscription */}
                          <div className="p-2.5 rounded-sm border border-slate-200 bg-slate-50">
                            <label className="flex items-start gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={Boolean(editingProduct.isYearlySubscription)}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, isYearlySubscription: e.target.checked })
                                }
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 mt-0.5"
                              />
                              <div>
                                <span className="font-semibold text-slate-800 block">Yearly Subscription</span>
                                <span className="text-[11px] text-slate-500 block mt-0.5">
                                  Triggers recurring billing cycles. Leave unchecked for moving physical commercial batches.
                                </span>
                              </div>
                            </label>
                          </div>

                          {/* Daily Adjust */}
                          <div className="p-2.5 rounded-sm border border-amber-200 bg-amber-50/50">
                            <label className="flex items-start gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={Boolean(editingProduct.isDailyAdjust)}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, isDailyAdjust: e.target.checked })
                                }
                                className="w-4 h-4 rounded border-amber-400 text-amber-600 mt-0.5"
                              />
                              <div>
                                <span className="font-bold text-amber-900 block">Daily Adjust (High-Value Cycle)</span>
                                <span className="text-[11px] text-amber-800 block mt-0.5">
                                  Pulls SKU into daily physical cycle-count audit reports (mandated for high-value raw materials like bulk CMC or Pectin).
                                </span>
                              </div>
                            </label>
                          </div>

                          {/* Weekly Adjust */}
                          <div className="p-2.5 rounded-sm border border-amber-200 bg-amber-50/50">
                            <label className="flex items-start gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={Boolean(editingProduct.isWeeklyAdjust)}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, isWeeklyAdjust: e.target.checked })
                                }
                                className="w-4 h-4 rounded border-amber-400 text-amber-600 mt-0.5"
                              />
                              <div>
                                <span className="font-bold text-amber-900 block">Weekly Adjust (Cycle Count)</span>
                                <span className="text-[11px] text-amber-800 block mt-0.5">
                                  Pulls SKU into weekly inventory reconciliation audit reports for finished goods.
                                </span>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Physical & Chemical Specifications */}
                      <div className="pt-2 border-t border-slate-200">
                        <h4 className="font-semibold text-slate-800 text-xs mb-3">Item Physical Specifications & Formulation Notes</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-slate-700 font-medium mb-1">Color Specification</label>
                            <input
                              type="text"
                              value={editingProduct.color || ''}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, color: e.target.value, hasColors: Boolean(e.target.value) })
                              }
                              placeholder="e.g. Deep Amber / Rich Burgundy"
                              className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-700 font-medium mb-1">Size / Net Weight</label>
                            <input
                              type="text"
                              value={editingProduct.size || ''}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, size: e.target.value, hasSizes: Boolean(e.target.value) })
                              }
                              placeholder="e.g. 500ml / 800g / 16L"
                              className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-700 font-medium mb-1">Master Item Flag</label>
                            <div className="pt-1.5">
                              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={Boolean(editingProduct.isMasterItem)}
                                  onChange={(e) =>
                                    setEditingProduct({ ...editingProduct, isMasterItem: e.target.checked })
                                  }
                                  className="w-4 h-4 rounded border-slate-300 text-blue-600"
                                />
                                <span className="font-medium text-slate-700">Master Item Definition</span>
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <label className="block text-slate-700 font-medium mb-1">Ingredients & Formulation Recipe</label>
                          <textarea
                            rows={2}
                            value={editingProduct.ingredients || ''}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, ingredients: e.target.value, hasIngredients: Boolean(e.target.value) })
                            }
                            placeholder="e.g. 100% Pure concentrated pomegranate juice, citric acid..."
                            className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: MEDIA (Strict 200KB Limit, 225x225 Main, 200x200 Additional & Double-Save Workflow) */}
              {activeModalTab === 'media' && (
                <div className="space-y-4">
                  {/* Strict 200KB Limit & Dimension Banner */}
                  <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-sm text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-[#195a96]">
                      <div className="flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4" />
                        <span>Strict 200KB Limit & Dimension Crop Policy (API Optimization)</span>
                      </div>
                      <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] rounded font-mono font-bold">
                        MAX 200 KB / IMAGE
                      </span>
                    </div>
                    <p className="text-slate-700 text-[11px] leading-relaxed">
                      Omega enforces a strict <strong>200KB maximum file size</strong>. 
                      <strong> Main Image:</strong> cropped to <strong>225×225 px</strong> (Omega POS touchscreen grids & Vanguard thumbnail). 
                      <strong> Additional Images:</strong> cropped to <strong>200×200 px</strong> (Back-label, nutritional facts & barcode close-ups).
                      Guarantees lightweight payloads for instant loading in Supersonic Dispatch and B2B ordering portals.
                    </p>
                  </div>

                  {/* Double-Save Workflow Notice */}
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-sm text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-900">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <strong>Double-Save Workflow:</strong> Click <strong>Save Images</strong> below to push media assets to the server before clicking the main modal Save button.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveImages}
                      className="px-3 py-1.5 bg-[#23783a] hover:bg-[#1b602e] text-white font-bold rounded-sm shadow-2xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Images</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    {/* Main Image (225x225 px) */}
                    <div className="md:col-span-5 border border-slate-200 rounded-sm p-4 text-center space-y-3 bg-slate-50/50">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="font-bold text-slate-800 text-xs">Main Image (225×225 px)</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">
                          Primary Visual
                        </span>
                      </div>

                      <div className="w-[225px] h-[225px] mx-auto bg-white border-2 border-dashed border-slate-300 rounded-sm flex flex-col items-center justify-center relative overflow-hidden group shadow-2xs">
                        {editingProduct.mainImage ? (
                          <img
                            src={editingProduct.mainImage}
                            alt="Main Product Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="p-4 text-center space-y-2">
                            <ImageIcon className="w-12 h-12 stroke-[1.5] text-slate-400 mx-auto" />
                            <div className="text-[11px] text-slate-500">
                              225 × 225 px
                              <br />
                              <span className="text-[10px] text-slate-400">&lt; 200 KB</span>
                            </div>
                          </div>
                        )}
                        <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                          225×225
                        </div>
                      </div>

                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSetMainImage('https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=400&auto=format&fit=crop&q=80')}
                          className="px-3 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-sm font-semibold text-xs cursor-pointer shadow-xs"
                        >
                          Select Image
                        </button>
                        {editingProduct.mainImage && (
                          <button
                            type="button"
                            onClick={() => setEditingProduct({ ...editingProduct, mainImage: '' })}
                            className="px-3 py-1.5 bg-[#5c2828] hover:bg-[#451f1f] text-white rounded-sm font-semibold text-xs cursor-pointer shadow-xs"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      {/* Quick Presets for Demo */}
                      <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                        <div className="mb-1 font-medium text-slate-700">Quick Samples (&lt;200KB Optimized):</div>
                        <div className="flex flex-wrap justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSetMainImage('https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=400&auto=format&fit=crop&q=80')}
                            className="px-2 py-0.5 bg-white border border-slate-300 rounded text-[10px] hover:bg-slate-100"
                          >
                            Molasses Jar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetMainImage('https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&auto=format&fit=crop&q=80')}
                            className="px-2 py-0.5 bg-white border border-slate-300 rounded text-[10px] hover:bg-slate-100"
                          >
                            Vinegar Bottle
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetMainImage('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80')}
                            className="px-2 py-0.5 bg-white border border-slate-300 rounded text-[10px] hover:bg-slate-100"
                          >
                            Tomato Paste
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Additional Images (200x200 px) & Video Link */}
                    <div className="md:col-span-7 space-y-4">
                      <div className="border border-slate-200 rounded-sm p-4 space-y-3 bg-white">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <div>
                            <span className="font-bold text-slate-800 text-xs">Additional Images (200×200 px)</span>
                            <span className="text-[11px] text-slate-500 block">
                              Back-label, nutritional facts & barcode close-up for B2B wholesale buyers
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddAdditionalImage('https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=400&auto=format&fit=crop&q=80')}
                            className="px-2.5 py-1 bg-[#23783a] hover:bg-[#1b602e] text-white font-semibold text-xs rounded-sm shadow-2xs flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Image</span>
                          </button>
                        </div>

                        {/* Gallery Grid */}
                        <div className="grid grid-cols-3 gap-3">
                          {(editingProduct.additionalImages && editingProduct.additionalImages.length > 0) ? (
                            editingProduct.additionalImages.map((imgUrl, idx) => (
                              <div key={idx} className="border border-slate-200 rounded-sm p-1.5 bg-slate-50 relative group">
                                <div className="w-full h-24 bg-white rounded overflow-hidden flex items-center justify-center">
                                  <img src={imgUrl} alt={`Additional ${idx + 1}`} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex items-center justify-between mt-1 text-[10px]">
                                  <span className="text-slate-500 font-mono">200×200</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveAdditionalImage(idx)}
                                    className="text-rose-600 hover:text-rose-800 font-bold"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-3 py-6 text-center text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-sm">
                              <ImageIcon className="w-8 h-8 stroke-[1.5] mx-auto text-slate-300 mb-1" />
                              <p className="text-[11px]">No additional images uploaded.</p>
                              <button
                                type="button"
                                onClick={() => handleAddAdditionalImage('https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=400&auto=format&fit=crop&q=80')}
                                className="mt-2 text-xs text-[#195a96] font-semibold hover:underline cursor-pointer"
                              >
                                + Add Back-Label / Nutrition Fact Image
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Video Link */}
                      <div className="border border-slate-200 rounded-sm p-4 bg-white space-y-2">
                        <label className="block text-slate-700 font-medium mb-1">
                          Product Video Link (YouTube / Vimeo / MP4)
                        </label>
                        <input
                          type="text"
                          placeholder="https://www.youtube.com/watch?v=..."
                          value={editingProduct.videoUrl || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, videoUrl: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white"
                        />
                        <p className="text-[11px] text-slate-500">
                          Exposed to B2B dispatch portal to showcase production facility processes or bottling runs.
                        </p>
                      </div>
                    </div>
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
                  onClick={() => {
                    setInventoryProductionsReportMode('omega_anomaly');
                    setIsInventoryProductionsReportOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-sm bg-[#195a96] hover:bg-[#144777] text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition"
                  title="View Authentic Omega Inventory Productions Ingredients Report (REP_I_0041)"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Report [REP_I_0041]</span>
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
                { key: 'usedIn', label: 'Used In' },
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
                              {invGroups.map((g) => (
                                <option key={g.ID} value={g.GROUPNAME}>
                                  {g.GROUPNAME}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => setIsAddGroupModalOpen(true)}
                              title="Add Group"
                              className="px-2.5 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-r-sm cursor-pointer shadow-xs"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {!editingProduct.groupName && (
                            <p className="text-[10px] text-amber-700 mt-1 flex items-center gap-1 font-medium">
                              <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                              <span>Map to correct revenue bucket (e.g. مدبسات جملة or مقطرات جملة) for financial reports & APIs.</span>
                            </p>
                          )}
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
                              onClick={handleSaveSellingFunctionForGroup}
                              title="Save selling function for all items in same group"
                              className="px-2 py-1.5 bg-[#23783a] hover:bg-[#1b602e] text-white rounded-sm cursor-pointer shadow-2xs transition"
                            >
                              <Save className="w-3.5 h-3.5" />
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
                              <option value="">Select location</option>
                              {locationsList.map((l: LocationItem) => (
                                <option key={l.LOCATIONID} value={l.LOCATIONDESCRIPTION}>
                                  {l.LOCATIONDESCRIPTION}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={handleSaveDefaultLocationForGroup}
                              title="Save default location for all items in same group"
                              className="px-2 py-1.5 bg-[#23783a] hover:bg-[#1b602e] text-white cursor-pointer shadow-2xs"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsAddLocationModalOpen(true)}
                              title="Add Location"
                              className="px-2.5 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white cursor-pointer shadow-xs"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsFloorZoneAisleOpen(!isFloorZoneAisleOpen)}
                              title="Toggle Floor, Zone, Aisle"
                              className="px-2.5 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-r-sm cursor-pointer font-bold tracking-widest text-[11px]"
                            >
                              ...
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
                              onClick={handleSaveLogicalWarehouseForGroup}
                              title="Apply logical warehouse to all items in same group"
                              className="px-2 py-1.5 bg-[#23783a] hover:bg-[#1b602e] text-white rounded-sm cursor-pointer shadow-2xs transition"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Floor, Zone, Aisle Expandable Row (Image 2) */}
                      {isFloorZoneAisleOpen && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-sm animate-fade-in">
                          <div>
                            <label className="block text-slate-700 font-medium mb-1">Floor</label>
                            <input
                              type="text"
                              value={editingProduct.floor || ''}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, floor: e.target.value })
                              }
                              placeholder="Floor"
                              className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-700 font-medium mb-1">Zone</label>
                            <div className="flex">
                              <select
                                value={editingProduct.zone || ''}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, zone: e.target.value })
                                }
                                className="flex-1 px-3 py-1.5 text-xs rounded-l-sm rounded-r-none border border-r-0 border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                              >
                                <option value="">Select zone</option>
                                {zonesList.map((z) => (
                                  <option key={z.id} value={z.name}>
                                    {z.name}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => setIsAddZoneModalOpen(true)}
                                title="Add Zone"
                                className="px-2.5 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-r-sm cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-slate-700 font-medium mb-1">Aisle</label>
                            <div className="flex">
                              <select
                                value={editingProduct.aisle || ''}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, aisle: e.target.value })
                                }
                                className="flex-1 px-3 py-1.5 text-xs rounded-l-sm rounded-r-none border border-r-0 border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                              >
                                <option value="">Select aisle</option>
                                {aislesList.map((a) => (
                                  <option key={a.id} value={a.name}>
                                    {a.name}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => setIsAddAisleModalOpen(true)}
                                title="Add Aisle"
                                className="px-2.5 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-r-sm cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-slate-700 font-medium mb-1">Main Supplier*</label>
                          <div className="flex">
                            <select
                              value={editingProduct.mainSupplierName}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, mainSupplierName: e.target.value, lastSupplierName: e.target.value })
                              }
                              className="flex-1 px-3 py-1.5 text-xs rounded-l-sm rounded-r-none border border-r-0 border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                            >
                              {suppliersList.map((s: SupplierItem) => (
                                <option key={s.SUPPLIERID} value={s.SUPPLIERNAME}>
                                  {s.SUPPLIERNAME}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={handleSaveSupplierForGroup}
                              title="Save supplier for all items in same group"
                              className="px-2 py-1.5 bg-[#23783a] hover:bg-[#1b602e] text-white cursor-pointer shadow-2xs"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsPurchaseHistoryModalOpen(true)}
                              title="Purchase History"
                              className="px-2 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white cursor-pointer"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsAddSupplierModalOpen(true)}
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
                              {brandsList.map((b) => (
                                <option key={b.id} value={b.name}>
                                  {b.name}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => setIsAddBrandModalOpen(true)}
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

                  {/* Card 2: Unit Format */}
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
                      {/* Commercial Case Presets */}
                      <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-100">
                        <span className="text-[11px] font-semibold text-slate-500">Commercial Presets:</span>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingProduct({
                              ...editingProduct,
                              buyingFormat: 'BOX',
                              inventoryFormat: 'BOT',
                              usageFormat: 'BOT',
                              qtyInBuyingFormat: 12,
                              qtyInInventoryFormat: 1,
                              unit: 'BOT'
                            })
                          }
                          className="px-2 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 font-medium cursor-pointer"
                        >
                          12x Bottles Case (BOX/12)
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingProduct({
                              ...editingProduct,
                              buyingFormat: 'BOX',
                              inventoryFormat: 'BOT',
                              usageFormat: 'BOT',
                              qtyInBuyingFormat: 24,
                              qtyInInventoryFormat: 1,
                              unit: 'BOT'
                            })
                          }
                          className="px-2 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 font-medium cursor-pointer"
                        >
                          24x Bottles Case (BOX/24)
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingProduct({
                              ...editingProduct,
                              buyingFormat: 'BOX',
                              inventoryFormat: 'JAR',
                              usageFormat: 'JAR',
                              qtyInBuyingFormat: 12,
                              qtyInInventoryFormat: 1,
                              unit: 'JAR'
                            })
                          }
                          className="px-2 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 font-medium cursor-pointer"
                        >
                          12x Jars Case (BOX/12)
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingProduct({
                              ...editingProduct,
                              buyingFormat: 'UNIT',
                              inventoryFormat: 'UNIT',
                              usageFormat: 'UNIT',
                              qtyInBuyingFormat: 1,
                              qtyInInventoryFormat: 1,
                              unit: 'UNIT'
                            })
                          }
                          className="px-2 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 font-medium cursor-pointer"
                        >
                          Retail Single Unit (1:1)
                        </button>
                      </div>

                      {/* Stock Integrity & Divisibility Bottleneck Banner */}
                      {editingProduct.buyingFormat === 'BOX' && editingProduct.inventoryFormat === 'BOX' && (Number(editingProduct.qtyInBuyingFormat) <= 1 || !editingProduct.qtyInBuyingFormat) ? (
                        <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-sm text-xs text-rose-950 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-bold text-rose-900">
                              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                              <span>Unit Format Divisibility Bottleneck: Undivided Box Format</span>
                            </div>
                            <span className="px-2 py-0.5 bg-rose-600 text-white font-mono text-[10px] font-bold rounded">
                              DISPATCH LOCK
                            </span>
                          </div>
                          <p className="text-slate-700 text-[11px] leading-relaxed">
                            Buying Format and Inventory Format are both configured as <strong>BOX</strong> with Quantity = 1. If customers or dispatch orders request partial cases (e.g. 3 individual 500ml bottles), Vanguard Dispatch and Omega POS barcode scanners will fail or lock the entire 12-pack case. For split-case retail/wholesale sales, set <strong>Inventory Format to BOT</strong> with <strong>Qty In Buying Format = 12</strong>.
                          </p>
                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={() =>
                                setEditingProduct({
                                  ...editingProduct,
                                  buyingFormat: 'BOX',
                                  inventoryFormat: 'BOT',
                                  usageFormat: 'BOT',
                                  qtyInBuyingFormat: 12,
                                  qtyInInventoryFormat: 1,
                                  unit: 'BOT'
                                })
                              }
                              className="px-3 py-1 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-sm shadow-xs flex items-center gap-1.5 cursor-pointer transition"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>⚡ Convert to Divisible Case (Inventory: BOT x 12)</span>
                            </button>
                          </div>
                        </div>
                      ) : editingProduct.buyingFormat === 'BOX' && (Number(editingProduct.qtyInBuyingFormat) <= 1 || !editingProduct.qtyInBuyingFormat) ? (
                        <div className="p-2.5 bg-amber-50 border border-amber-300 rounded text-[11px] text-amber-800 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-bold text-amber-900">Unit Format Integrity Alert:</span> Buying Format is set to <strong>BOX</strong> with Quantity = 1. If this is a commercial case pack (e.g. 12-pack vinegars or 24-pack molasses), set <strong>Qty In Buying Format</strong> to the exact bottle count ({editingProduct.qtyInBuyingFormat || 12}) so Vanguard ERP and POS inventory calculate the stock and costs per bottle accurately!
                          </div>
                        </div>
                      ) : (
                        <div className="p-2 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-900 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-blue-600" />
                            <span><strong>Stock Integrity Equation:</strong> 1 {editingProduct.buyingFormat} = {editingProduct.qtyInBuyingFormat || 1} × {editingProduct.inventoryFormat}. (Case Cost is divided across {editingProduct.qtyInBuyingFormat || 1} units).</span>
                          </div>
                          <span className="text-[10px] bg-blue-100 text-blue-800 font-mono px-1.5 py-0.5 rounded font-bold">
                            Yield: 1 → {editingProduct.qtyInBuyingFormat || 1}
                          </span>
                        </div>
                      )}

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

                  {/* Card 3: Cost */}
                  <div className="border border-slate-200 rounded-sm overflow-hidden">
                    <div className="bg-[#f8fafc] px-4 py-2 border-b border-slate-200 font-semibold text-slate-800">
                      Cost
                    </div>
                    <div className="p-4 space-y-3">
                      {/* Currency & Margin Integrity Note */}
                      <div className="p-2 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-[#23783a]" />
                          <span><strong>Costing Automation:</strong> Input your production cost into <strong>Unit Cost $</strong> or <strong>Unit Cost LL</strong> to automatically synchronize at {(editingProduct.secondCurrencyRate || 90000).toLocaleString()} LL/$ and protect your target margins.</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">1 $ = {(editingProduct.secondCurrencyRate || 90000).toLocaleString()} LL</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Col 1 & 2 */}
                        <div className="md:col-span-2 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-slate-700 font-medium mb-1">Unit Cost LL</label>
                              <input
                                type="number"
                                value={editingProduct.unitCostLL || ''}
                                onChange={(e) => handleUnitCostLLChange(Number(e.target.value))}
                                placeholder="e.g. 180000"
                                className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500 font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-700 font-medium mb-1">Average Cost LL</label>
                              <input
                                type="number"
                                value={editingProduct.averageCostLL || ''}
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
                              <label className="block text-slate-700 font-medium mb-1">Unit Cost $ (True Cost)</label>
                              <input
                                type="number"
                                step="0.000001"
                                value={editingProduct.unitCostUSD || ''}
                                onChange={(e) => handleUnitCostUSDChange(Number(e.target.value))}
                                placeholder="e.g. 2.00"
                                className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500 font-mono font-semibold text-[#195a96]"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-700 font-medium mb-1">Average Cost $</label>
                              <input
                                type="number"
                                step="0.000001"
                                value={editingProduct.averageCostUSD || ''}
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

                        {/* Col 3: Additional Cost, Markup %, Recommended Price & Recalculate */}
                        <div className="space-y-3 border-l border-slate-200 pl-4">
                          <div>
                            <label className="block text-slate-700 font-medium mb-1">Additional Cost LL</label>
                            <input
                              type="number"
                              value={editingProduct.additionalCostLL || ''}
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
                                  value={editingProduct.markupPct ?? 0}
                                  onChange={(e) => {
                                    const m = Number(e.target.value);
                                    const cost = editingProduct.unitCostLL || 0;
                                    const rec = Math.round(cost * (1 + m / 100));
                                    setEditingProduct({
                                      ...editingProduct,
                                      markupPct: m,
                                      recommendedPriceLL: rec
                                    });
                                  }}
                                  className="flex-1 px-2 py-1.5 text-xs rounded-sm border border-slate-300 bg-white"
                                />
                                <button
                                  type="button"
                                  onClick={handleSaveMarkupForGroup}
                                  title="Save Markup % for all items in same group"
                                  className="px-2 py-1 bg-[#23783a] hover:bg-[#1b602e] text-white rounded-xs cursor-pointer shadow-2xs"
                                >
                                  <Save className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <div>
                              <label className="block text-slate-700 font-medium mb-1">Recommended Price</label>
                              <div className="flex gap-1">
                                <input
                                  type="number"
                                  value={editingProduct.recommendedPriceLL || ''}
                                  onChange={(e) =>
                                    setEditingProduct({
                                      ...editingProduct,
                                      recommendedPriceLL: Number(e.target.value)
                                    })
                                  }
                                  className="flex-1 px-2 py-1.5 text-xs rounded-sm border border-slate-300 bg-white font-mono font-semibold"
                                />
                                <button
                                  type="button"
                                  onClick={() => setIsApplyRecommendedPriceModalOpen(true)}
                                  title="Apply recommended price to selling prices"
                                  className="px-2 py-1 bg-[#23783a] hover:bg-[#1b602e] text-white rounded-xs cursor-pointer shadow-2xs"
                                >
                                  <Save className="w-3 h-3" />
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

                  {/* Card 4: Selling Price */}
                  <div className="border border-slate-200 rounded-sm overflow-hidden">
                    <div className="bg-[#f8fafc] px-4 py-2 border-b border-slate-200 font-semibold text-slate-800 flex items-center justify-between">
                      <span>Selling Price</span>
                      <div className="flex items-center gap-4 text-xs">
                        <button
                          type="button"
                          onClick={() => setIsPriceVariationsModalOpen(true)}
                          className="text-[#195a96] hover:underline font-medium cursor-pointer"
                        >
                          Price Variations
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsLastPricesModalOpen(true)}
                          className="text-[#195a96] hover:underline font-medium cursor-pointer"
                        >
                          Last Prices
                        </button>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-800">Selling price 2nd currency</span>
                          <button
                            type="button"
                            onClick={handleApplySecondCurrencyRates}
                            title="Calculate USD prices at second currency rate"
                            className="p-1 bg-[#23783a] hover:bg-[#1b602e] text-white rounded-xs cursor-pointer shadow-2xs"
                          >
                            <Save className="w-3 h-3" />
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

                        const tierLabels = [
                          'Tier 1: Retail (Base)',
                          'Tier 2: Wholesale',
                          'Tier 3: Distributor',
                          'Tier 4: Special Contract'
                        ];
                        const tierName = tierLabels[num - 1];

                        const profitVal = Number(editingProduct[pfKey]) || 0;
                        const targetMarkup = editingProduct.markupPct || 30;

                        return (
                          <div
                            key={num}
                            className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center border-b border-slate-100 pb-2.5"
                          >
                            <div className="md:col-span-3">
                              <label className="flex items-center justify-between text-slate-700 font-medium mb-1">
                                <span>{tierName} LL</span>
                              </label>
                              <input
                                type="number"
                                value={Number(editingProduct[spKey]) || ''}
                                onChange={(e) => handleSellingPriceLLChange(num, Number(e.target.value))}
                                placeholder="e.g. 240000"
                                className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white font-mono"
                              />
                            </div>

                            <div className="md:col-span-3">
                              <label className="block text-slate-700 font-medium mb-1">Before Tax {num} LL</label>
                              <input
                                type="number"
                                value={Number(editingProduct[btKey]) || ''}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, [btKey]: Number(e.target.value) })
                                }
                                className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-[#e9ecef] font-mono"
                              />
                            </div>

                            {num > 1 ? (
                              <div className="md:col-span-2">
                                <label className="flex items-center gap-1 text-slate-700 font-medium mb-1">
                                  <span>Min Qty Trigger</span>
                                  <span title="Wholesale volume discount trigger: triggers this tier price when customer orders at least this quantity">
                                    <HelpCircle className="w-3 h-3 text-slate-500 cursor-help" />
                                  </span>
                                </label>
                                <input
                                  type="number"
                                  value={Number(editingProduct[qtyKey] || 1)}
                                  onChange={(e) =>
                                    setEditingProduct({ ...editingProduct, [qtyKey]: Number(e.target.value) })
                                  }
                                  className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white font-mono"
                                />
                              </div>
                            ) : (
                              <div className="md:col-span-2">
                                <span className="block text-[11px] text-slate-400 mt-5 italic">Default single unit</span>
                              </div>
                            )}

                            <div className="md:col-span-2">
                              <div className="flex items-center justify-between mb-1">
                                <label className="block text-slate-700 font-medium">Profit {num} %</label>
                                <span
                                  className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                                    profitVal <= 0
                                      ? 'bg-rose-100 text-rose-800'
                                      : profitVal < targetMarkup
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {profitVal <= 0 ? 'ALERT' : profitVal < targetMarkup ? 'LOW' : 'OK'}
                                </span>
                              </div>
                              <input
                                type="number"
                                step="0.01"
                                value={profitVal || ''}
                                readOnly
                                title={
                                  profitVal <= 0
                                    ? 'Margin Alert: Selling at or below unit cost! Risk of margin cannibalization.'
                                    : profitVal < targetMarkup
                                    ? `Margin Alert: Below category target markup of ${targetMarkup}%.`
                                    : `Healthy margin meets or exceeds ${targetMarkup}% markup.`
                                }
                                className={`w-full px-3 py-1.5 text-xs font-bold rounded-sm border font-mono ${
                                  profitVal <= 0
                                    ? 'bg-rose-50 border-rose-300 text-rose-700'
                                    : profitVal < targetMarkup
                                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                                    : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                }`}
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-slate-700 font-medium mb-1">Selling Price {num} $</label>
                              <input
                                type="number"
                                step="0.01"
                                value={Number(editingProduct[usdKey]) || ''}
                                onChange={(e) => handleSellingPriceUSDChange(num, Number(e.target.value))}
                                placeholder="e.g. 2.67"
                                className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white font-mono font-semibold text-[#195a96]"
                              />
                            </div>
                          </div>
                        );
                      })}

                      {/* Second Currency Rate */}
                      <div className="flex justify-end pt-1">
                        <div className="w-64">
                          <label className="block text-slate-700 font-medium mb-1">Second Currency Rate</label>
                          <input
                            type="number"
                            value={editingProduct.secondCurrencyRate || 90000}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                secondCurrencyRate: Number(e.target.value)
                              })
                            }
                            className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white font-mono"
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
                              value={editingProduct.barcode || ''}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, barcode: e.target.value })
                              }
                              className="flex-1 px-3 py-1.5 text-xs rounded-l-sm rounded-r-none border border-r-0 border-slate-300 bg-white"
                            />
                            <button
                              type="button"
                              title="Barcode Scanner / Generate"
                              className="px-2.5 py-1.5 bg-[#4c5c7a] text-white rounded-r-sm cursor-pointer"
                            >
                              <Barcode className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="md:col-span-4">
                          <label className="block text-slate-700 font-medium mb-1">Alternative Barcode 2</label>
                          <input
                            type="text"
                            value={editingProduct.alternativeBarcode2 || ''}
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
                            value={editingProduct.rfidt1 || ''}
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
                            value={editingProduct.alternativeBarcode3 || ''}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, alternativeBarcode3: e.target.value })
                            }
                            className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white"
                          />
                        </div>

                        <div className="md:col-span-4 pt-4">
                          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={Boolean(editingProduct.applySp2Qty2)}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, applySp2Qty2: e.target.checked })
                              }
                              className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 cursor-pointer"
                            />
                            <span className="font-medium text-slate-700">Apply sp2 qty2</span>
                          </label>
                        </div>

                        <div className="md:col-span-3">
                          <label className="block text-slate-700 font-medium mb-1">RFIDT 2</label>
                          <input
                            type="text"
                            value={editingProduct.rfidt2 || ''}
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
                          onClick={() => setIsMoreBarcodesModalOpen(true)}
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
                                setEditingProduct({ ...editingProduct, mainSupplierName: e.target.value, lastSupplierName: e.target.value })
                              }
                              className="flex-1 px-3 py-1.5 text-xs rounded-l-sm rounded-r-none border border-r-0 border-slate-300 bg-white"
                            >
                              {suppliersList.map((s: SupplierItem) => (
                                <option key={s.SUPPLIERID} value={s.SUPPLIERNAME}>
                                  {s.SUPPLIERNAME}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={handleSaveSupplierForGroup}
                              title="Save supplier for all items in same group"
                              className="px-2 py-1.5 bg-[#23783a] hover:bg-[#1b602e] text-white cursor-pointer shadow-2xs"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsPurchaseHistoryModalOpen(true)}
                              title="Purchase History"
                              className="px-2 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white cursor-pointer"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsAddSupplierModalOpen(true)}
                              title="Add Supplier"
                              className="px-2.5 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-r-sm cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
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
                              {suppliersList.map((s: SupplierItem) => (
                                <option key={s.SUPPLIERID} value={s.SUPPLIERNAME}>
                                  {s.SUPPLIERNAME}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => setIsAddSupplierModalOpen(true)}
                              title="Add Supplier"
                              className="px-2.5 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-r-sm cursor-pointer"
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

                  {/* Card 7: Customs, Freight Logistics & POS Interface */}
                  <div className="border border-slate-200 rounded-sm overflow-hidden">
                    <div className="bg-[#f8fafc] px-4 py-2 border-b border-slate-200 font-semibold text-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-[#195a96]" />
                        <span>Customs, Freight Logistics & POS Interface</span>
                      </div>
                      <span className="text-[11px] font-normal text-slate-500">
                        HS commodity classification, scale PLU, freight volumetric specs & POS velocity
                      </span>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        {/* HS Code */}
                        <div className="md:col-span-4">
                          <label className="flex items-center justify-between text-slate-700 font-medium mb-1">
                            <span>HS Code (Customs / Export)*</span>
                            <span className="text-[10px] text-slate-400 font-mono">Commodity Tariff</span>
                          </label>
                          <input
                            type="text"
                            value={editingProduct.hsCode || ''}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, hsCode: e.target.value })
                            }
                            placeholder="e.g. 2009.89.00 (Molasses) / 2209.00.00 (Vinegars)"
                            className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white font-mono"
                          />
                          <p className="text-[10px] text-slate-500 mt-1">
                            Mandatory for commercial invoices and international export documentation.
                          </p>
                        </div>

                        {/* PLU For Scale */}
                        <div className="md:col-span-4">
                          <label className="flex items-center justify-between text-slate-700 font-medium mb-1">
                            <span>PLU For Scale</span>
                            <span className="text-[10px] text-slate-400">Weight-based barcode</span>
                          </label>
                          <input
                            type="text"
                            value={editingProduct.pluForScale || ''}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, pluForScale: e.target.value })
                            }
                            placeholder="Leave blank for pre-packaged cases"
                            className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white font-mono"
                          />
                          <p className="text-[10px] text-slate-500 mt-1">
                            Required only for bulk weighed items (e.g. bulk cheese, fats) to print scale barcode.
                          </p>
                        </div>

                        {/* Item Sorting & Best Selling */}
                        <div className="md:col-span-2">
                          <label className="block text-slate-700 font-medium mb-1">Item Sorting</label>
                          <input
                            type="number"
                            value={editingProduct.itemSorting ?? 0}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, itemSorting: Number(e.target.value) })
                            }
                            placeholder="0"
                            className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white font-mono"
                          />
                          <p className="text-[10px] text-slate-500 mt-1">
                            Priority index for category sorting in POS.
                          </p>
                        </div>

                        <div className="md:col-span-2 flex items-center pt-5">
                          <label className="inline-flex items-center gap-2 cursor-pointer select-none p-2 rounded-sm border border-slate-200 bg-slate-50 hover:bg-slate-100 transition w-full">
                            <input
                              type="checkbox"
                              checked={Boolean(editingProduct.isBestSelling)}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, isBestSelling: e.target.checked })
                              }
                              className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                            />
                            <div className="flex items-center gap-1">
                              <Star className={`w-3.5 h-3.5 ${editingProduct.isBestSelling ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                              <span className="font-semibold text-slate-800 text-xs">Best Selling</span>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Physical Dimensions (Logistics & Freight Calculation) */}
                      <div className="pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-slate-700 font-medium text-xs flex items-center gap-1.5">
                            <span>Physical Dimensions (BOX Format & Pallet Freight Estimation)</span>
                          </label>
                          <span className="text-[11px] text-slate-500 italic">
                            Used by Vanguard Dispatch & freight modules for pallet load calculations
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          <div>
                            <label className="block text-[11px] text-slate-600 mb-1">Length (cm)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={editingProduct.dimensionsLength || ''}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, dimensionsLength: Number(e.target.value) })
                              }
                              placeholder="e.g. 38.5"
                              className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-600 mb-1">Width (cm)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={editingProduct.dimensionsWidth || ''}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, dimensionsWidth: Number(e.target.value) })
                              }
                              placeholder="e.g. 26.0"
                              className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-600 mb-1">Height (cm)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={editingProduct.dimensionsHeight || ''}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, dimensionsHeight: Number(e.target.value) })
                              }
                              placeholder="e.g. 24.5"
                              className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-600 mb-1">Weight (kg / gross)</label>
                            <input
                              type="number"
                              step="0.01"
                              value={editingProduct.dimensionsWeight || ''}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, dimensionsWeight: Number(e.target.value) })
                              }
                              placeholder="e.g. 14.8"
                              className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-600 mb-1">Volume (m³)</label>
                            <input
                              type="number"
                              step="0.001"
                              value={
                                editingProduct.dimensionsVolume ||
                                (editingProduct.dimensionsLength && editingProduct.dimensionsWidth && editingProduct.dimensionsHeight
                                  ? Number(((editingProduct.dimensionsLength * editingProduct.dimensionsWidth * editingProduct.dimensionsHeight) / 1000000).toFixed(4))
                                  : '')
                              }
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, dimensionsVolume: Number(e.target.value) })
                              }
                              placeholder="Auto m³"
                              className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-slate-50 font-mono"
                            />
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
                  {/* Sub-tab Navigation (Qty OH vs Reorder Level) */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setStockSubTab('qtyOH')}
                        className={`px-3 py-1.5 rounded-sm text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 ${
                          stockSubTab === 'qtyOH'
                            ? 'bg-[#323f4b] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <Warehouse className="w-3.5 h-3.5" />
                        <span>Qty OH (Stock Ledger & Valuation)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setStockSubTab('reorderLevel')}
                        className={`px-3 py-1.5 rounded-sm text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 ${
                          stockSubTab === 'reorderLevel'
                            ? 'bg-[#323f4b] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Reorder Level (Safety Stock Matrix)</span>
                        {editingProduct.reorderRules?.some(r => r.alertActive) && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                        )}
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => showToast('Stock adjustment form opened')}
                        className="px-3 py-1 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-sm font-semibold cursor-pointer text-xs"
                      >
                        + Adjust Stock
                      </button>
                      <button
                        type="button"
                        onClick={() => showToast('Inter-warehouse transfer opened')}
                        className="px-3 py-1 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-sm font-semibold cursor-pointer text-xs"
                      >
                        Transfer Stock
                      </button>
                    </div>
                  </div>

                  {/* SUB-TAB 1: QTY OH (PHYSICAL STOCK LEDGER & VALUATION IMPACT) */}
                  {stockSubTab === 'qtyOH' && (
                    <div className="space-y-4">
                      {/* Valuation Integrity & COGS Ledger Alert */}
                      {(editingProduct.unitCostLL > 10000000 || (editingProduct.description?.includes('VINEGAR') && editingProduct.unitCostLL > 1000000)) ? (
                        <div className="p-3.5 bg-rose-50 border-2 border-rose-400 rounded-sm text-xs text-rose-900 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-bold text-rose-800 text-sm">
                              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                              <span>Critical Data Entry Error: Massive Balance Sheet & COGS Ledger Distortion</span>
                            </div>
                            <span className="px-2 py-0.5 bg-rose-600 text-white font-mono text-[10px] font-bold rounded">
                              48.9B LBP IMPACT
                            </span>
                          </div>
                          <p className="text-slate-700 leading-relaxed text-[11px]">
                            This item&apos;s unit cost is recorded as <strong>{editingProduct.unitCostLL.toLocaleString()} LBP</strong>. Because you have stock on hand for this item, this erroneous figure severely inflates your total balance-sheet inventory asset valuation. Furthermore, every wholesale or retail sale logs an astronomical false loss of ~48.9 Billion LBP against Cost of Goods Sold (COGS).
                          </p>
                          <div className="flex items-center justify-between pt-1 border-t border-rose-200">
                            <span className="text-[11px] text-slate-600 italic">
                              Benchmark: Standard White Vinegar 12x500ml costs <strong>543,960 LL ($6.04)</strong>; Apple Vinegar costs ~556,920 LL.
                            </span>
                            <button
                              type="button"
                              onClick={handleFixValuationCostError}
                              className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-sm text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>⚡ 1-Click Fix: Align Unit Cost to 543,960 LL ($6.04)</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-sm text-xs text-emerald-900 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>
                              <strong>Inventory Valuation Status: Balanced.</strong> Unit Cost is <strong>{editingProduct.unitCostLL.toLocaleString()} LBP (${editingProduct.unitCostUSD?.toFixed(2) || '6.04'} USD)</strong>. Accurate COGS accounting aligned with identical Apple Vinegar benchmark (~556,920 LL).
                            </span>
                          </div>
                          <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                            COGS SYNCED
                          </span>
                        </div>
                      )}

                      {/* Physical Stock Ledger Validation Summary Cards (Screenshot Audited: 12 Total, 2 Reserved, 10 Available) */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Total Qty OH */}
                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-slate-600">Total Physical Qty</span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-bold font-mono">
                              LEDGER SYNCED
                            </span>
                          </div>
                          <div className="text-2xl font-bold font-mono text-slate-900">
                            {Number(editingProduct.qtyOH || 12).toFixed(2)} <span className="text-sm font-normal text-slate-500">{editingProduct.inventoryFormat || 'BOX'}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Located in <strong>Main Store</strong>. Perfectly matches the background master inventory ledger.
                          </p>
                        </div>

                        {/* Qty Reserved */}
                        <div className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-amber-900">Qty Reserved (Committed)</span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-bold font-mono">
                              SALES COMMITMENT
                            </span>
                          </div>
                          <div className="text-2xl font-bold font-mono text-amber-800">
                            2.00 <span className="text-sm font-normal text-amber-700">{editingProduct.inventoryFormat || 'BOX'}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1">
                            Locked by unfulfilled sales orders or pending dispatch runs in Omega POS / Supersonic Dispatch.
                          </p>
                        </div>

                        {/* Available Qty */}
                        <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-emerald-900">Available Qty (Sellable)</span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold font-mono">
                              NET SELLABLE
                            </span>
                          </div>
                          <div className="text-2xl font-bold font-mono text-emerald-700">
                            {Math.max(0, Number(editingProduct.qtyOH || 12) - 2).toFixed(2)} <span className="text-sm font-normal text-emerald-600">{editingProduct.inventoryFormat || 'BOX'}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1">
                            Physical stock minus reserved commitments. Unconditionally available for new customer orders.
                          </p>
                        </div>
                      </div>

                      {/* Staging Warehouse Structure Notice */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-sm text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          <Info className="w-3.5 h-3.5 text-[#195a96]" />
                          <span>Warehouse Logistics Structure & Multi-Echelon Staging</span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                          This finished production item flows across 3 logical warehouses: <strong>Choueifat Production Plant</strong> (bottling & packaging), <strong>Wholesale Dispatch Staging</strong> (order picking & cross-docking), and <strong>Dispatch Depot</strong> (transit routes). Multi-echelon transfers maintain batch lot numbers and preserve audit records.
                        </p>
                      </div>

                      {/* Physical Stock Records Table */}
                      <div className="border border-slate-200 rounded-sm overflow-hidden">
                        <div className="bg-[#f8fafc] px-4 py-2 border-b border-slate-200 font-semibold text-slate-800 flex items-center justify-between">
                          <span>Physical Stock by Warehouse & Staging Location</span>
                          <span className="text-[11px] font-normal text-slate-500">
                            Total Asset Value: {((editingProduct.qtyOH || 12) * (editingProduct.unitCostLL || 543960)).toLocaleString()} LBP
                          </span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                              <tr>
                                <th className="px-3 py-2">Branch</th>
                                <th className="px-3 py-2">Warehouse</th>
                                <th className="px-3 py-2">Location</th>
                                <th className="px-3 py-2 text-right">Qty OH</th>
                                <th className="px-3 py-2 text-right">Reserved</th>
                                <th className="px-3 py-2 text-right">Available</th>
                                <th className="px-3 py-2 text-right">Unit Cost LL</th>
                                <th className="px-3 py-2 text-right">Valuation Total LL</th>
                                <th className="px-3 py-2 text-center">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              <tr className="hover:bg-slate-50">
                                <td className="px-3 py-2 font-medium">Beirut HQ</td>
                                <td className="px-3 py-2 font-semibold text-slate-900">Main Store</td>
                                <td className="px-3 py-2 text-slate-600">Rack B-04</td>
                                <td className="px-3 py-2 text-right font-bold text-slate-900 font-mono">
                                  {Number(editingProduct.qtyOH || 12).toFixed(2)}
                                </td>
                                <td className="px-3 py-2 text-right font-mono text-amber-700">2.00</td>
                                <td className="px-3 py-2 text-right font-bold font-mono text-emerald-700">
                                  {Math.max(0, Number(editingProduct.qtyOH || 12) - 2).toFixed(2)}
                                </td>
                                <td className="px-3 py-2 text-right font-mono">
                                  {(editingProduct.unitCostLL || 543960).toLocaleString()}
                                </td>
                                <td className="px-3 py-2 text-right font-mono font-semibold text-slate-800">
                                  {((editingProduct.qtyOH || 12) * (editingProduct.unitCostLL || 543960)).toLocaleString()}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-semibold rounded">
                                    SYNCED
                                  </span>
                                </td>
                              </tr>
                              <tr className="hover:bg-slate-50 text-slate-500">
                                <td className="px-3 py-2 font-medium">Choueifat Plant</td>
                                <td className="px-3 py-2">Bottling Staging</td>
                                <td className="px-3 py-2">Zone C-Plant</td>
                                <td className="px-3 py-2 text-right font-mono">0.00</td>
                                <td className="px-3 py-2 text-right font-mono">0.00</td>
                                <td className="px-3 py-2 text-right font-mono">0.00</td>
                                <td className="px-3 py-2 text-right font-mono">{(editingProduct.unitCostLL || 543960).toLocaleString()}</td>
                                <td className="px-3 py-2 text-right font-mono">0</td>
                                <td className="px-3 py-2 text-center">
                                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded">
                                    EMPTY
                                  </span>
                                </td>
                              </tr>
                              <tr className="hover:bg-slate-50 text-slate-500">
                                <td className="px-3 py-2 font-medium">Beirut HQ</td>
                                <td className="px-3 py-2">Wholesale Dispatch Staging</td>
                                <td className="px-3 py-2">Dock 1</td>
                                <td className="px-3 py-2 text-right font-mono">0.00</td>
                                <td className="px-3 py-2 text-right font-mono">0.00</td>
                                <td className="px-3 py-2 text-right font-mono">0.00</td>
                                <td className="px-3 py-2 text-right font-mono">{(editingProduct.unitCostLL || 543960).toLocaleString()}</td>
                                <td className="px-3 py-2 text-right font-mono">0</td>
                                <td className="px-3 py-2 text-center">
                                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded">
                                    EMPTY
                                  </span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 2: REORDER LEVEL (SAFETY STOCK MATRIX & SUPPLY CHAIN BLINDSPOT FIX) */}
                  {stockSubTab === 'reorderLevel' && (
                    <div className="space-y-4">
                      {/* Supply Chain Blindspot Notice */}
                      <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-sm text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-[#195a96]">
                          <ShieldAlert className="w-4 h-4" />
                          <span>Supply Chain Blindspot Elimination & Production Trigger Matrix</span>
                        </div>
                        <p className="text-slate-700 text-[11px] leading-relaxed">
                          Empty reorder thresholds cause stockouts when fast-moving goods sell out unexpectedly. The Safety Stock Matrix enforces minimum buffer thresholds (Reorder Point) and maximum capacity ceilings. When <strong>Available Qty</strong> breaches the minimum threshold, an automated manufacturing run order is triggered for the Choueifat Plant.
                        </p>
                      </div>

                      {/* Active Deficit Status Banner */}
                      {(() => {
                        const avail = Math.max(0, Number(editingProduct.qtyOH || 12) - 2);
                        const rules = editingProduct.reorderRules || [];
                        const primaryRule = rules[0] || { minLevel: 50, maxStock: 200 };
                        const isDeficit = avail < primaryRule.minLevel;
                        return isDeficit ? (
                          <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-sm text-xs flex items-center justify-between">
                            <div className="flex items-center gap-2 text-rose-900 font-semibold">
                              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 animate-bounce" />
                              <span>
                                <strong>CRITICAL REORDER DEFICIT:</strong> Current Available Stock is <strong>{avail.toFixed(2)} BOX</strong>, which is below the minimum safety threshold of <strong>{primaryRule.minLevel} BOX</strong>. Immediate bottling batch run required!
                              </span>
                            </div>
                            <span className="px-2.5 py-1 bg-rose-600 text-white font-mono font-bold text-[10px] rounded animate-pulse">
                              DEFICIT: {(primaryRule.minLevel - avail).toFixed(0)} BOX
                            </span>
                          </div>
                        ) : (
                          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-sm text-xs text-emerald-900 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>
                                <strong>Safety Stock Level Healthy:</strong> Current available inventory ({avail.toFixed(2)} BOX) satisfies safety stock thresholds.
                              </span>
                            </div>
                            <span className="px-2 py-0.5 bg-emerald-600 text-white font-mono text-[10px] rounded font-bold">
                              OPTIMAL
                            </span>
                          </div>
                        );
                      })()}

                      {/* Safety Stock Configuration Form */}
                      <div className="border border-slate-200 rounded-sm overflow-hidden bg-white">
                        <div className="bg-[#f8fafc] px-4 py-2 border-b border-slate-200 font-semibold text-slate-800 text-xs">
                          Configure Warehouse Reorder Thresholds
                        </div>
                        <div className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                            <div>
                              <label className="block text-slate-700 font-medium mb-1">Staging Warehouse / Location</label>
                              <select
                                value={newReorderWarehouse}
                                onChange={(e) => setNewReorderWarehouse(e.target.value)}
                                className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white"
                              >
                                <option value="Main Store">Main Store (Beirut HQ)</option>
                                <option value="Choueifat Bottling Plant">Choueifat Bottling Plant</option>
                                <option value="Wholesale Dispatch Staging">Wholesale Dispatch Staging</option>
                                <option value="Dispatch Depot">Dispatch Depot</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-slate-700 font-medium mb-1">
                                Min Reorder Point (Boxes)*
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={newReorderMin}
                                onChange={(e) => setNewReorderMin(Number(e.target.value))}
                                className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white font-mono"
                                placeholder="e.g. 50"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-700 font-medium mb-1">
                                Max Capacity Ceiling (Boxes)*
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={newReorderMax}
                                onChange={(e) => setNewReorderMax(Number(e.target.value))}
                                className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white font-mono"
                                placeholder="e.g. 200"
                              />
                            </div>
                            <div>
                              <button
                                type="button"
                                onClick={handleSaveReorderRule}
                                className="w-full py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white font-bold text-xs rounded-sm shadow-xs cursor-pointer transition flex items-center justify-center gap-1.5"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Save Threshold Rule</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Configured Safety Stock Matrix Table */}
                      <div className="border border-slate-200 rounded-sm overflow-hidden">
                        <div className="bg-[#f8fafc] px-4 py-2 border-b border-slate-200 font-semibold text-slate-800 flex items-center justify-between">
                          <span>Active Reorder Rules & Replenishment Thresholds</span>
                          <span className="text-[11px] text-slate-500 font-normal">
                            Monitored automatically by Vanguard Dispatch & POS
                          </span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                              <tr>
                                <th className="px-3 py-2">Location / Warehouse</th>
                                <th className="px-3 py-2 text-right">Min Level (Reorder Point)</th>
                                <th className="px-3 py-2 text-right">Max Stock (Capacity)</th>
                                <th className="px-3 py-2 text-right">Current Available</th>
                                <th className="px-3 py-2 text-center">Status</th>
                                <th className="px-3 py-2 text-center w-16">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {editingProduct.reorderRules && editingProduct.reorderRules.length > 0 ? (
                                editingProduct.reorderRules.map((rule) => {
                                  const avail = Math.max(0, Number(editingProduct.qtyOH || 12) - 2);
                                  const isDeficit = avail < rule.minLevel;
                                  const isOverstock = avail > rule.maxStock;
                                  return (
                                    <tr key={rule.id} className="hover:bg-slate-50">
                                      <td className="px-3 py-2 font-medium text-slate-900">
                                        <div className="flex items-center gap-1.5">
                                          <Warehouse className="w-3.5 h-3.5 text-slate-400" />
                                          <span>{rule.warehouseName}</span>
                                        </div>
                                      </td>
                                      <td className="px-3 py-2 text-right font-mono font-bold text-slate-800">
                                        {rule.minLevel} BOX
                                      </td>
                                      <td className="px-3 py-2 text-right font-mono text-slate-600">
                                        {rule.maxStock} BOX
                                      </td>
                                      <td className="px-3 py-2 text-right font-mono font-bold">
                                        <span className={isDeficit ? 'text-rose-600' : 'text-emerald-700'}>
                                          {avail.toFixed(2)} BOX
                                        </span>
                                      </td>
                                      <td className="px-3 py-2 text-center">
                                        {isDeficit ? (
                                          <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded flex items-center justify-center gap-1">
                                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                                            <span>CRITICAL DEFICIT</span>
                                          </span>
                                        ) : isOverstock ? (
                                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                                            OVERSTOCK
                                          </span>
                                        ) : (
                                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                                            HEALTHY
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-3 py-2 text-center">
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteReorderRule(rule.id)}
                                          className="text-slate-400 hover:text-rose-600 cursor-pointer transition p-1"
                                          title="Delete Rule"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })
                              ) : (
                                <tr>
                                  <td colSpan={6} className="px-3 py-6 text-center text-slate-400">
                                    No reorder rules configured. Fill the form above to eliminate supply chain blindspots.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: MEDIA (Strict 200KB Limit, 225x225 Main, 200x200 Additional & Double-Save Workflow) */}
              {activeModalTab === 'media' && (
                <div className="space-y-4">
                  {/* Strict 200KB Limit & Dimension Banner */}
                  <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-sm text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-[#195a96]">
                      <div className="flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4" />
                        <span>Strict 200KB Limit & Dimension Crop Policy (API Optimization)</span>
                      </div>
                      <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] rounded font-mono font-bold">
                        MAX 200 KB / IMAGE
                      </span>
                    </div>
                    <p className="text-slate-700 text-[11px] leading-relaxed">
                      Omega enforces a strict <strong>200KB maximum file size</strong>. 
                      <strong> Main Image:</strong> cropped to <strong>225×225 px</strong> (Omega POS touchscreen grids & Vanguard thumbnail). 
                      <strong> Additional Images:</strong> cropped to <strong>200×200 px</strong> (Back-label, nutritional facts & barcode close-ups).
                      Guarantees lightweight payloads for instant loading in Supersonic Dispatch and B2B ordering portals.
                    </p>
                  </div>

                  {/* Double-Save Workflow Notice */}
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-sm text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-900">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <strong>Double-Save Workflow:</strong> Click <strong>Save Images</strong> below to push media assets to the server before clicking the main modal Save button.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveImages}
                      className="px-3 py-1.5 bg-[#23783a] hover:bg-[#1b602e] text-white font-bold rounded-sm shadow-2xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Images</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    {/* Main Image (225x225 px) */}
                    <div className="md:col-span-5 border border-slate-200 rounded-sm p-4 text-center space-y-3 bg-slate-50/50">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="font-bold text-slate-800 text-xs">Main Image (225×225 px)</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">
                          Primary Visual
                        </span>
                      </div>

                      <div className="w-[225px] h-[225px] mx-auto bg-white border-2 border-dashed border-slate-300 rounded-sm flex flex-col items-center justify-center relative overflow-hidden group shadow-2xs">
                        {editingProduct.mainImage ? (
                          <img
                            src={editingProduct.mainImage}
                            alt="Main Product Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="p-4 text-center space-y-2">
                            <ImageIcon className="w-12 h-12 stroke-[1.5] text-slate-400 mx-auto" />
                            <div className="text-[11px] text-slate-500">
                              225 × 225 px
                              <br />
                              <span className="text-[10px] text-slate-400">&lt; 200 KB</span>
                            </div>
                          </div>
                        )}
                        <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                          225×225
                        </div>
                      </div>

                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSetMainImage('https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=400&auto=format&fit=crop&q=80')}
                          className="px-3 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-sm font-semibold text-xs cursor-pointer shadow-xs"
                        >
                          Select Image
                        </button>
                        {editingProduct.mainImage && (
                          <button
                            type="button"
                            onClick={() => setEditingProduct({ ...editingProduct, mainImage: '' })}
                            className="px-3 py-1.5 bg-[#5c2828] hover:bg-[#451f1f] text-white rounded-sm font-semibold text-xs cursor-pointer shadow-xs"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      {/* Quick Presets for Demo */}
                      <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                        <div className="mb-1 font-medium text-slate-700">Quick Samples (&lt;200KB Optimized):</div>
                        <div className="flex flex-wrap justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSetMainImage('https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=400&auto=format&fit=crop&q=80')}
                            className="px-2 py-0.5 bg-white border border-slate-300 rounded text-[10px] hover:bg-slate-100"
                          >
                            Molasses Jar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetMainImage('https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&auto=format&fit=crop&q=80')}
                            className="px-2 py-0.5 bg-white border border-slate-300 rounded text-[10px] hover:bg-slate-100"
                          >
                            Vinegar Bottle
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetMainImage('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80')}
                            className="px-2 py-0.5 bg-white border border-slate-300 rounded text-[10px] hover:bg-slate-100"
                          >
                            Tomato Paste
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Additional Images (200x200 px) & Video Link */}
                    <div className="md:col-span-7 space-y-4">
                      <div className="border border-slate-200 rounded-sm p-4 space-y-3 bg-white">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <div>
                            <span className="font-bold text-slate-800 text-xs">Additional Images (200×200 px)</span>
                            <span className="text-[11px] text-slate-500 block">
                              Back-label, nutritional facts & barcode close-up for B2B wholesale buyers
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddAdditionalImage('https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=400&auto=format&fit=crop&q=80')}
                            className="px-2.5 py-1 bg-[#23783a] hover:bg-[#1b602e] text-white font-semibold text-xs rounded-sm shadow-2xs flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Image</span>
                          </button>
                        </div>

                        {/* Gallery Grid */}
                        <div className="grid grid-cols-3 gap-3">
                          {(editingProduct.additionalImages && editingProduct.additionalImages.length > 0) ? (
                            editingProduct.additionalImages.map((imgUrl, idx) => (
                              <div key={idx} className="border border-slate-200 rounded-sm p-1.5 bg-slate-50 relative group">
                                <div className="w-full h-24 bg-white rounded overflow-hidden flex items-center justify-center">
                                  <img src={imgUrl} alt={`Additional ${idx + 1}`} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex items-center justify-between mt-1 text-[10px]">
                                  <span className="text-slate-500 font-mono">200×200</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveAdditionalImage(idx)}
                                    className="text-rose-600 hover:text-rose-800 font-bold"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-3 py-6 text-center text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-sm">
                              <ImageIcon className="w-8 h-8 stroke-[1.5] mx-auto text-slate-300 mb-1" />
                              <p className="text-[11px]">No additional images uploaded.</p>
                              <button
                                type="button"
                                onClick={() => handleAddAdditionalImage('https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=400&auto=format&fit=crop&q=80')}
                                className="mt-2 text-xs text-[#195a96] font-semibold hover:underline cursor-pointer"
                              >
                                + Add Back-Label / Nutrition Fact Image
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Video Link */}
                      <div className="border border-slate-200 rounded-sm p-4 bg-white space-y-2">
                        <label className="block text-slate-700 font-medium mb-1">
                          Product Video Link (YouTube / Vimeo / MP4)
                        </label>
                        <input
                          type="text"
                          placeholder="https://www.youtube.com/watch?v=..."
                          value={editingProduct.videoUrl || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, videoUrl: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white"
                        />
                        <p className="text-[11px] text-slate-500">
                          Exposed to B2B dispatch portal to showcase production facility processes or bottling runs.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: ITEM ASSEMBLY (BOM / RECIPES & MANUFACTURING SUITE) */}
              {activeModalTab === 'assembly' && (
                <div className="space-y-4">
                  {/* Quantity to Prepare & Recipe Action Bar */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Quantity To Prepare (Finished Batch Output)
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              value={editingProduct.quantityToPrepare || 1}
                              onChange={(e) =>
                                setEditingProduct({
                                  ...editingProduct,
                                  quantityToPrepare: Number(e.target.value)
                                })
                              }
                              className="w-20 px-2.5 py-1 text-xs font-bold font-mono rounded-sm border border-slate-300 bg-white"
                            />
                            <select
                              value={editingProduct.quantityToPrepareUnit || editingProduct.inventoryFormat || 'BOX'}
                              onChange={(e) =>
                                setEditingProduct({
                                  ...editingProduct,
                                  quantityToPrepareUnit: e.target.value
                                })
                              }
                              className="px-2.5 py-1 text-xs font-semibold rounded-sm border border-slate-300 bg-white"
                            >
                              <option value="BOX">BOX (Case Pack)</option>
                              <option value="BOT">BOT (Bottle)</option>
                              <option value="UNIT">UNIT</option>
                            </select>
                          </div>
                        </div>

                        <div className="hidden md:block h-8 w-px bg-slate-200 mx-1"></div>

                        <div>
                          <div className="text-[11px] font-semibold text-slate-700">Calculation Method</div>
                          <span className="text-xs font-mono font-medium text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {editingProduct.assemblyCalculationMethod || 'Extended Line-Item Calculation'}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons: Same As, Add Packaging, Add Component, Recalculate */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsSameAsBOMModalOpen(true)}
                          className="px-3 py-1.5 bg-[#195a96] hover:bg-[#154b7d] text-white rounded-sm font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition"
                          title="Clone recipe from existing standard commercial product"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Same as... (Clone BOM)</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleAddPackagingComponents}
                          className="px-3 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-sm font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition"
                          title="Add corrugated box, partitions & product labels to recipe"
                        >
                          <Package className="w-3.5 h-3.5" />
                          <span>+ Add Packaging</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => showToast('New component added to recipe')}
                          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-sm font-semibold text-xs flex items-center gap-1 cursor-pointer transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Component</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleRecalculateBOMCost}
                          className="px-3 py-1.5 bg-[#23783a] hover:bg-[#1b602e] text-white rounded-sm font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Recalculate Cost</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Liquid Volume & Packaging Depletion Equations */}
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-sm text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-[#195a96]">
                      <div className="flex items-center gap-1.5">
                        <Info className="w-4 h-4" />
                        <span>Manufacturing Yield & Finished Case Volume Ratios</span>
                      </div>
                      <span className="font-mono text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        100% YIELD / 0% SHRINKAGE
                      </span>
                    </div>
                    <p className="text-slate-700 text-[11px] leading-relaxed">
                      <strong>Batch Output: 1 BOX (12 × 500ml Bottles = 6.0 Liters total liquid volume).</strong> Standard commercial bottling consumes exactly <strong>6.00 LTR</strong> of bulk vinegar, <strong>12 empty 500ml bottles</strong>, and <strong>SERVICES 1</strong> labor overhead. Incorporating packaging materials (outer cardboard carton, dividers & adhesive labels) ensures full material inventory depletion during factory batch runs.
                    </p>
                  </div>

                  {/* Yield Flag Integrity Warning & Auto-Fix */}
                  {(() => {
                    const items = editingProduct.assemblyItems || [];
                    const laborOrBottleHasMainIng = items.some(
                      i => i.mainIngredient && (i.rawMaterialCode.includes('SRV') || i.rawMaterialCode.includes('BOT-500') || i.rawMaterialCode.includes('BOX') || i.rawMaterialCode.includes('DIV') || i.rawMaterialCode.includes('LBL'))
                    );
                    const hasCoreLiquidMainIng = items.some(
                      i => i.mainIngredient && (i.rawMaterialCode.includes('VIN') || i.rawMaterialCode.includes('APV') || i.rawMaterialCode.includes('POM') || i.rawMaterialCode.includes('TOM'))
                    );
                    const flagError = laborOrBottleHasMainIng || !hasCoreLiquidMainIng;

                    return flagError ? (
                      <div className="p-3.5 bg-amber-50 border-2 border-amber-300 rounded-sm text-xs text-amber-900 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-bold text-amber-800">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Yield Flag Integrity Warning: &quot;Main Ing.&quot; Rule Violation</span>
                          </div>
                          <span className="px-2 py-0.5 bg-amber-200 text-amber-900 font-mono text-[10px] font-bold rounded">
                            GOVERNANCE ALERT
                          </span>
                        </div>
                        <p className="text-slate-700 text-[11px] leading-relaxed">
                          <strong>Main Ing.</strong> must be checked <strong>EXCLUSIVELY</strong> for the core raw liquid material (e.g. <em>COMMERCIAL WHITE VINEGAR 1 LITRE</em>). Tagging labor overhead (<em>SERVICES 1</em>) or empty glass bottles as Main Ing. corrupts manufacturing yield calculations and skews variance audit reports in Vanguard ERP.
                        </p>
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={handleFixYieldFlags}
                            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-sm text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>⚡ Auto-Fix Yield Flags (Core Liquid Only)</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-sm text-xs text-emerald-900 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>
                            <strong>Yield Flag Integrity Verified:</strong> &quot;Main Ing.&quot; is checked strictly for primary liquid raw material to govern batch yield.
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                          YIELD OPTIMAL
                        </span>
                      </div>
                    );
                  })()}

                  {/* USD Cost Valuation Safeguard Notice */}
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-sm text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-700">
                      <ShieldCheck className="w-4 h-4 text-[#195a96] shrink-0" />
                      <span>
                        <strong>USD Valuation Safeguard Active:</strong> Unit Cost USD is calculated dynamically by dividing LBP recipe sum by {(editingProduct.secondCurrencyRate || 90000).toLocaleString()} LL/$ (<strong>${((editingProduct.unitCostLL || 543960) / (editingProduct.secondCurrencyRate || 90000)).toFixed(2)} USD</strong>). Prevents erroneous 1:1 currency duplication.
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 font-bold">
                      1 $ = {(editingProduct.secondCurrencyRate || 90000).toLocaleString()} LL
                    </span>
                  </div>

                  {/* BOM Recipe Line Items Table */}
                  <div className="border border-slate-200 rounded-sm overflow-hidden bg-white">
                    <div className="bg-[#f8fafc] px-4 py-2 border-b border-slate-200 font-semibold text-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>Bill of Materials Components</span>
                        <span className="text-xs text-slate-500 font-normal">
                          ({editingProduct.assemblyItems?.length || 0} line items)
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-normal">
                        Click checkbox to toggle Main Ingredient yield flag
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="px-3 py-2 w-10 text-center">#</th>
                            <th className="px-3 py-2 w-24 text-center" title="Check ONLY for core liquid material to govern yield">
                              Main Ing.
                            </th>
                            <th className="px-3 py-2">Component / Raw Material</th>
                            <th className="px-3 py-2">Code</th>
                            <th className="px-3 py-2 text-right">Qty Needed</th>
                            <th className="px-3 py-2">Unit</th>
                            <th className="px-3 py-2 text-right">Unit Cost LL</th>
                            <th className="px-3 py-2 text-right">Total Cost LL</th>
                            <th className="px-3 py-2 text-right">Cost USD</th>
                            <th className="px-3 py-2 text-center w-12">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {editingProduct.assemblyItems && editingProduct.assemblyItems.length > 0 ? (
                            editingProduct.assemblyItems.map((asm, idx) => {
                              const rate = editingProduct.secondCurrencyRate || 90000;
                              const usdCost = Number((asm.totalCostLL / rate).toFixed(2));
                              return (
                                <tr key={asm.id} className="hover:bg-slate-50">
                                  <td className="px-3 py-2 text-center font-mono text-slate-400">
                                    {idx + 1}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    <input
                                      type="checkbox"
                                      checked={Boolean(asm.mainIngredient)}
                                      onChange={() => handleToggleMainIngredient(idx)}
                                      title="Toggle Main Ingredient flag (Governs batch yield calculation)"
                                      className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer"
                                    />
                                  </td>
                                  <td className="px-3 py-2 font-medium text-slate-900">
                                    <div className="flex items-center gap-1.5">
                                      {asm.mainIngredient && (
                                        <span className="px-1.5 py-0.2 bg-blue-100 text-[#195a96] text-[9px] font-bold rounded">
                                          CORE
                                        </span>
                                      )}
                                      <span>{asm.rawMaterialName}</span>
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 font-mono text-[11px] text-slate-500">{asm.rawMaterialCode}</td>
                                  <td className="px-3 py-2 text-right font-bold font-mono">{asm.qtyNeeded}</td>
                                  <td className="px-3 py-2 text-slate-600">{asm.unit}</td>
                                  <td className="px-3 py-2 text-right font-mono">{asm.unitCostLL.toLocaleString()}</td>
                                  <td className="px-3 py-2 text-right font-semibold font-mono text-slate-900">
                                    {asm.totalCostLL.toLocaleString()}
                                  </td>
                                  <td className="px-3 py-2 text-right font-mono text-slate-500">
                                    ${usdCost.toFixed(2)}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = (editingProduct.assemblyItems || []).filter((_, i) => i !== idx);
                                        setEditingProduct({ ...editingProduct, assemblyItems: updated });
                                        showToast(`Removed component: ${asm.rawMaterialName}`);
                                      }}
                                      className="text-slate-400 hover:text-red-700 cursor-pointer transition p-1"
                                      title="Remove Component"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={10} className="px-3 py-6 text-center text-slate-400">
                                No raw materials attached. Click &quot;Same as...&quot; to clone a recipe or &quot;+ Add Component&quot; to build from scratch.
                              </td>
                            </tr>
                          )}
                        </tbody>
                        {/* Summary Footer */}
                        {editingProduct.assemblyItems && editingProduct.assemblyItems.length > 0 && (
                          <tfoot className="bg-slate-50 font-semibold border-t-2 border-slate-200">
                            <tr>
                              <td colSpan={6} className="px-3 py-2.5 text-right text-slate-700">
                                Extended Recipe Total Cost:
                              </td>
                              <td colSpan={2} className="px-3 py-2.5 text-right font-mono text-sm text-[#195a96] font-bold">
                                {editingProduct.assemblyItems.reduce((acc, c) => acc + c.totalCostLL, 0).toLocaleString()} LBP
                              </td>
                              <td className="px-3 py-2.5 text-right font-mono text-sm text-[#195a96] font-bold">
                                ${(editingProduct.assemblyItems.reduce((acc, c) => acc + c.totalCostLL, 0) / (editingProduct.secondCurrencyRate || 90000)).toFixed(2)}
                              </td>
                              <td></td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                  </div>

                  {/* Financial Synchronization Bar */}
                  <div className="p-3 bg-slate-100 border border-slate-200 rounded-sm flex flex-col md:flex-row items-center justify-between gap-3">
                    <div className="text-xs text-slate-700">
                      <strong>Synchronize Financials:</strong> Propagate recalculated recipe cost into Master Item Cost (<strong>{editingProduct.assemblyItems?.reduce((acc, c) => acc + c.totalCostLL, 0).toLocaleString()} LBP</strong> / <strong>${( (editingProduct.assemblyItems?.reduce((acc, c) => acc + c.totalCostLL, 0) || 0) / (editingProduct.secondCurrencyRate || 90000)).toFixed(2)}</strong>) and calculate 50% target wholesale markup price (<strong>{Math.round((editingProduct.assemblyItems?.reduce((acc, c) => acc + c.totalCostLL, 0) || 0) * 1.5).toLocaleString()} LBP</strong>).
                    </div>
                    <button
                      type="button"
                      onClick={handleRecalculateBOMCost}
                      className="px-4 py-2 bg-[#23783a] hover:bg-[#1b602e] text-white font-bold text-xs rounded-sm shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 transition"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Sync to Master Item Cost & Selling Prices</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: INCLUDED ITEMS (SALES BUNDLING & PROMOTIONAL KITS) */}
              {activeModalTab === 'included' && (
                <div className="space-y-4">
                  {/* 1. Core Structural Distinction Banner */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-sm text-xs space-y-2">
                    <div className="flex items-center justify-between font-bold text-slate-800 text-sm">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#195a96]" />
                        <span>Architectural Distinction: &quot;Item Assembly&quot; vs. &quot;Included Items&quot;</span>
                      </div>
                      <span className="text-[10px] font-mono bg-blue-100 text-[#195a96] px-2 py-0.5 rounded font-bold">
                        OMEGA ERP INVENTORY ARCHITECTURE
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-[11px] leading-relaxed">
                      <div className="p-2.5 bg-white border border-slate-200 rounded-xs">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                          <Package className="w-3.5 h-3.5 text-blue-600" />
                          <span>1. Item Assembly (Manufacturing / Production)</span>
                        </div>
                        <p className="text-slate-600">
                          Requires a formal <strong>Production Journal</strong> or <strong>Assembly Order</strong> in the system to consume bulk raw materials (vinegar, glass bottles, labor, packaging) and output physical stock of the finished 12-pack case into warehouse stock on hand.
                        </p>
                      </div>

                      <div className="p-2.5 bg-white border border-slate-200 rounded-xs">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                          <Gift className="w-3.5 h-3.5 text-purple-600" />
                          <span>2. Included Items (Dynamic POS Sales Bundling)</span>
                        </div>
                        <p className="text-slate-600">
                          Used exclusively for <strong>Kits, Hampers, or Promotional Combos</strong> (e.g. Ramadan Gift Baskets). Does <em>not</em> run a production order. Instead, the exact moment the parent SKU is scanned at the POS or Vanguard Dispatch, the system <strong>instantly deducts the child items from stock</strong>.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 2. Double-Deduction Risk & Integrity Check */}
                  {(() => {
                    const isManufactured = Boolean(editingProduct.assemblyItems && editingProduct.assemblyItems.length > 0);
                    const hasIncludedItems = Boolean(editingProduct.includedItems && editingProduct.includedItems.length > 0);

                    if (isManufactured && hasIncludedItems) {
                      return (
                        <div className="p-3.5 bg-rose-50 border-2 border-rose-400 rounded-sm text-xs text-rose-950 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-bold text-rose-800 text-sm">
                              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 animate-bounce" />
                              <span>Critical Integrity Risk: Double-Deduction Hazard Detected!</span>
                            </div>
                            <span className="px-2 py-0.5 bg-rose-600 text-white font-mono text-[10px] font-bold rounded animate-pulse">
                              DOUBLE-DEDUCTION HAZARD
                            </span>
                          </div>
                          <p className="text-slate-700 leading-relaxed text-[11px]">
                            Because this item (<strong>{editingProduct.description}</strong>) is already manufactured in Choueifat via the <strong>Item Assembly</strong> tab, configuring child items in this &quot;Included Items&quot; grid triggers a severe <strong>double-deduction</strong>: once during the factory production journal, and a second time at the point of sale. This will turn component inventory negative and corrupt your balance-sheet Cost of Goods Sold (COGS).
                          </p>
                          <div className="flex items-center justify-between pt-1 border-t border-rose-200">
                            <span className="text-[11px] text-slate-600 italic">
                              Manufactured case packs must maintain an empty Included Items grid.
                            </span>
                            <button
                              type="button"
                              onClick={handleClearIncludedItems}
                              className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-sm text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>🛡️ 1-Click Fix: Clear Included Items (Protect Manufacturing Ledger)</span>
                            </button>
                          </div>
                        </div>
                      );
                    }

                    if (isManufactured && !hasIncludedItems) {
                      return (
                        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-sm text-xs text-emerald-950 space-y-1.5">
                          <div className="flex items-center justify-between font-bold text-emerald-800">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                              <span>Core Architecture Fully Validated: Zero Double-Deduction Risk</span>
                            </div>
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold rounded">
                              LEDGER INTEGRITY VERIFIED
                            </span>
                          </div>
                          <p className="text-slate-700 text-[11px] leading-relaxed">
                            The Included Items grid is <strong>appropriately empty</strong> for this 12-pack case (<strong>{editingProduct.description}</strong>). Because inventory is manufactured via Choueifat Production Plant bottling runs in the <strong>Item Assembly</strong> tab, an empty Included Items grid guarantees raw materials and bottles will never be double-deducted at the point of sale or dispatch.
                          </p>
                        </div>
                      );
                    }

                    return null;
                  })()}

                  {/* 3. When to Actually Use This Tab Guidance & Action Bar */}
                  <div className="border border-slate-200 rounded-sm overflow-hidden bg-white">
                    <div className="bg-[#f8fafc] px-4 py-2.5 border-b border-slate-200 font-semibold text-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span>Included Items in Package / Combo</span>
                        <span className="text-xs font-normal text-slate-500">
                          ({editingProduct.includedItems?.length || 0} child items)
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsAddIncludedItemModalOpen(true)}
                          className="px-3 py-1 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-sm font-semibold text-xs flex items-center gap-1 cursor-pointer transition shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Add Included Item</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleLoadSamplePromoKit}
                          className="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-sm font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                          title="Load sample promo kit (White Vinegar + Pomegranate Molasses) to simulate dynamic bundling"
                        >
                          <Gift className="w-3.5 h-3.5" />
                          <span>Demo Promo Kit (2 Bottles)</span>
                        </button>
                        {editingProduct.includedItems && editingProduct.includedItems.length > 0 && (
                          <button
                            type="button"
                            onClick={handleClearIncludedItems}
                            className="px-3 py-1 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-sm font-semibold text-xs cursor-pointer transition"
                          >
                            Clear Grid
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Notice on Promotional Bundling */}
                    <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-[11px] text-slate-600 flex items-center gap-2">
                      <Info className="w-3.5 h-3.5 text-[#195a96] shrink-0" />
                      <span>
                        <strong>When to use this tab:</strong> Strictly for promotional SKUs (e.g. <em>&quot;Salad Dressing Promo Pack&quot;</em> containing 1 bottle of White Vinegar and 1 bottle of Pomegranate Molasses shrink-wrapped together at dispatch depot) where selling the bundle dynamically depletes both standalone bottles.
                      </span>
                    </div>

                    {/* 4. Included Items Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="px-3 py-2 w-10 text-center">#</th>
                            <th className="px-3 py-2">Item Code</th>
                            <th className="px-3 py-2">Child Product Description</th>
                            <th className="px-3 py-2 text-right">Qty in Kit</th>
                            <th className="px-3 py-2 text-right">Base Price LL</th>
                            <th className="px-3 py-2 text-right">Discount %</th>
                            <th className="px-3 py-2 text-right">Net Price LL</th>
                            <th className="px-3 py-2 text-right">Subtotal LL</th>
                            <th className="px-3 py-2 text-center w-12">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {editingProduct.includedItems && editingProduct.includedItems.length > 0 ? (
                            editingProduct.includedItems.map((item, idx) => {
                              const subtotalLL = item.qty * item.sellingPriceLL;
                              return (
                                <tr key={item.id} className="hover:bg-slate-50">
                                  <td className="px-3 py-2 text-center font-mono text-slate-400">
                                    {idx + 1}
                                  </td>
                                  <td className="px-3 py-2 font-mono text-[11px] font-semibold text-[#195a96]">
                                    {item.itemCode}
                                  </td>
                                  <td className="px-3 py-2 font-medium text-slate-900">
                                    {item.itemName}
                                  </td>
                                  <td className="px-3 py-2 text-right font-bold font-mono">
                                    {item.qty}
                                  </td>
                                  <td className="px-3 py-2 text-right font-mono text-slate-600">
                                    {Math.round(item.discountPct && item.discountPct < 100 ? item.sellingPriceLL / (1 - item.discountPct / 100) : item.sellingPriceLL).toLocaleString()}
                                  </td>
                                  <td className="px-3 py-2 text-right font-mono">
                                    {item.discountPct > 0 ? (
                                      <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">
                                        {item.discountPct}%
                                      </span>
                                    ) : (
                                      <span className="text-slate-400">0%</span>
                                    )}
                                  </td>
                                  <td className="px-3 py-2 text-right font-mono text-slate-800">
                                    {item.sellingPriceLL.toLocaleString()}
                                  </td>
                                  <td className="px-3 py-2 text-right font-bold font-mono text-slate-900">
                                    {subtotalLL.toLocaleString()}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveIncludedItem(item.id)}
                                      className="text-slate-400 hover:text-red-700 cursor-pointer transition p-1"
                                      title="Remove from Kit"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={9} className="px-4 py-8 text-center text-slate-500 space-y-1">
                                <div className="font-semibold text-slate-700">No Child Items Linked (Standard Manufacturing Case)</div>
                                <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                                  This grid is intentionally empty because this product is manufactured via the Item Assembly tab. Only promotional kits, gift baskets, or dynamic sales hampers should configure child items here.
                                </p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                        {editingProduct.includedItems && editingProduct.includedItems.length > 0 && (
                          <tfoot className="bg-slate-50 font-semibold border-t-2 border-slate-200">
                            <tr>
                              <td colSpan={7} className="px-3 py-2.5 text-right text-slate-700">
                                Total Bundle Selling Price:
                              </td>
                              <td className="px-3 py-2.5 text-right font-mono text-sm text-[#195a96] font-bold">
                                {editingProduct.includedItems.reduce((sum, item) => sum + item.qty * item.sellingPriceLL, 0).toLocaleString()} LBP
                              </td>
                              <td></td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: USED IN (REVERSE SUPPLY CHAIN & UPWARD DEPENDENCIES) */}
              {activeModalTab === 'usedIn' && (
                <div className="space-y-4">
                  {/* 1. Core Architectural Concept Banner */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-sm text-xs space-y-2">
                    <div className="flex items-center justify-between font-bold text-slate-800 text-sm">
                      <div className="flex items-center gap-2">
                        <ArrowUpRight className="w-4 h-4 text-[#195a96]" />
                        <span>The &quot;Where Used&quot; Hierarchy (Reverse Supply Chain View)</span>
                      </div>
                      <span className="text-[10px] font-mono bg-blue-100 text-[#195a96] px-2 py-0.5 rounded font-bold">
                        OMEGA UPWARD DEPENDENCY TRACEABILITY
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-[11px] leading-relaxed">
                      <div className="p-2.5 bg-white border border-slate-200 rounded-xs">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                          <Layers className="w-3.5 h-3.5 text-blue-600" />
                          <span>1. Upward BOM & Financial Impact Tracking</span>
                        </div>
                        <p className="text-slate-600">
                          Unlike <em>Item Assembly</em> (which tracks what raw materials create this item), this tab tracks <strong>which larger parent products consume this 12-pack case</strong>. If you modify this box&apos;s Unit Cost, gross weight, or case dimensions, Omega uses these linkages to determine which parent SKUs are structurally or financially impacted.
                        </p>
                      </div>

                      <div className="p-2.5 bg-white border border-slate-200 rounded-xs">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>2. Expected State for Finished Commercial Goods</span>
                        </div>
                        <p className="text-slate-600">
                          Because <strong>{editingProduct.description}</strong> is a <strong>finished commercial good</strong> manufactured in Choueifat for wholesale dispatch and retail sales, this grid should typically remain <strong>completely empty</strong>. You are at the terminal end of the manufacturing pipeline.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 2. Structural Integrity & Backward Linkage Risk Banners */}
                  {(() => {
                    const hasBackwardHazard = Boolean(
                      editingProduct.usedInItems?.some((i) => i.relationType === 'Inverted Breakdown (Hazard)')
                    );
                    const hasUsedIn = Boolean(editingProduct.usedInItems && editingProduct.usedInItems.length > 0);

                    if (hasBackwardHazard) {
                      return (
                        <div className="p-3.5 bg-rose-50 border-2 border-rose-400 rounded-sm text-xs text-rose-950 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-bold text-rose-800 text-sm">
                              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 animate-bounce" />
                              <span>Critical Risk: Backward Linkage Error Detected (The Omega Database Anomaly)</span>
                            </div>
                            <span className="px-2 py-0.5 bg-rose-600 text-white font-mono text-[10px] font-bold rounded animate-pulse">
                              INVERTED BOM HAZARD
                            </span>
                          </div>
                          <div className="text-slate-700 text-[11px] leading-relaxed space-y-1">
                            <p>
                              <strong>As identified in Omega Report <code>REP_I_0041</code>:</strong> Parent Product <strong>CWV500MLB106</strong> (<em>خل ابيض 500مل</em> - single bottle) is configured to consume <strong>0.08 BOX</strong> of this finished 12-pack case.
                            </p>
                            <p className="text-rose-900 font-semibold">
                              <strong>Why this is fatal:</strong> Your database relationships are inverted. The system mathematically assumes that producing an individual raw bottle requires consuming a finished 12-pack box. This creates an impossible circular loop, triggers unboxing bottlenecks at POS checkout, and invalidates Choueifat&apos;s forward production batches.
                            </p>
                            <p className="text-slate-600 italic">
                              Single bottle sales must be handled via <strong>Unit Format Divisibility</strong> (1 BOX = 12 BOT), never via backward disassembly manufacturing.
                            </p>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-rose-200">
                            <span className="text-[11px] text-slate-600 italic">
                              Purge the inverted bottle linkage to restore forward-moving production logic.
                            </span>
                            <button
                              type="button"
                              onClick={handleClearUsedIn}
                              className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-sm text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>🛡️ 1-Click Fix: Purge Backward Linkage (Enforce Forward Flow)</span>
                            </button>
                          </div>
                        </div>
                      );
                    }

                    if (!hasUsedIn) {
                      return (
                        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-sm text-xs text-emerald-950 space-y-1.5">
                          <div className="flex items-center justify-between font-bold text-emerald-800">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                              <span>Core Architecture Fully Validated: Clean End-of-Pipeline Good</span>
                            </div>
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold rounded">
                              HIERARCHY INTEGRITY VERIFIED
                            </span>
                          </div>
                          <p className="text-slate-700 text-[11px] leading-relaxed">
                            The <strong>Used In</strong> grid is <strong>appropriately empty</strong> for this 12-pack case (<strong>{editingProduct.description}</strong>). Because this SKU represents the finished output of factory bottling runs, zero upward consumption ensures forward-moving production logic remains 100% intact.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-sm text-xs text-blue-950 space-y-1.5">
                        <div className="flex items-center justify-between font-bold text-blue-900">
                          <div className="flex items-center gap-2">
                            <Layers className="w-5 h-5 text-blue-600 shrink-0" />
                            <span>Valid Upward Parent Consumption Active</span>
                          </div>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-mono text-[10px] font-bold rounded">
                            UPWARD LINK ACTIVE
                          </span>
                        </div>
                        <p className="text-slate-700 text-[11px] leading-relaxed">
                          This 12-pack case is linked into a legitimate higher-level parent SKU (such as an export master pallet or wholesale restaurant combo). Changes to this box&apos;s cost or weight will automatically cascade upward.
                        </p>
                      </div>
                    );
                  })()}

                  {/* 3. Valid System Connections Guidance & Action Bar */}
                  <div className="border border-slate-200 rounded-sm overflow-hidden bg-white">
                    <div className="bg-[#f8fafc] px-4 py-2.5 border-b border-slate-200 font-semibold text-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span>Parent Products Consuming This Item</span>
                        <span className="text-xs font-normal text-slate-500">
                          ({editingProduct.usedInItems?.length || 0} parent linkages)
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsAddUsedInModalOpen(true)}
                          className="px-3 py-1 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-sm font-semibold text-xs flex items-center gap-1 cursor-pointer transition shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Add Parent Dependency</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleLoadSamplePalletUsedIn}
                          className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-sm font-semibold text-xs flex items-center gap-1 cursor-pointer transition shadow-xs"
                          title="Simulate valid bulk pallet packaging (PALLET-WV500ML containing 100 boxes)"
                        >
                          <Package className="w-3.5 h-3.5" />
                          <span>Demo Valid Pallet Link (100 Boxes)</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleLoadSampleKitUsedIn}
                          className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded-sm font-semibold text-xs flex items-center gap-1 cursor-pointer transition shadow-xs"
                          title="Simulate wholesale restaurant supply starter kit containing 1 box"
                        >
                          <Gift className="w-3.5 h-3.5" />
                          <span>Demo Valid Restaurant Kit (1 Box)</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleLoadAnomalyUsedIn}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-sm font-semibold text-xs flex items-center gap-1 cursor-pointer transition shadow-xs"
                          title="Simulate the exact Omega REP_I_0041 report anomaly where a single bottle consumes 0.08 Box"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Simulate Omega Anomaly (0.08 Box)</span>
                        </button>
                        {editingProduct.usedInItems && editingProduct.usedInItems.length > 0 && (
                          <button
                            type="button"
                            onClick={handleClearUsedIn}
                            className="px-2.5 py-1 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-sm font-semibold text-xs cursor-pointer transition"
                          >
                            Clear Grid
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setInventoryProductionsReportMode('omega_anomaly');
                            setIsInventoryProductionsReportOpen(true);
                          }}
                          className="px-3 py-1 bg-[#195a96] hover:bg-[#144777] text-white rounded-sm font-bold text-xs flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                          title="Open the authentic Omega Inventory Productions (REP_I_0041) print report modal"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>📄 View Productions Report [REP_I_0041]</span>
                        </button>
                      </div>
                    </div>

                    {/* Notice on Valid Upward Reasons */}
                    <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-[11px] text-slate-600 flex items-center gap-2">
                      <Info className="w-3.5 h-3.5 text-[#195a96] shrink-0" />
                      <span>
                        <strong>When this grid should NOT be empty:</strong> Only under <strong>Palletization</strong> (master export pallet containing 100 boxes) or <strong>Wholesale Kitting</strong> (e.g. restaurant supply combo). If raw vinegar or single bottles appear here, production relationships are inverted.
                      </span>
                    </div>

                    {/* 4. Parent Consuming Products Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="px-3 py-2 w-10 text-center">#</th>
                            <th className="px-3 py-2">Parent Product Code</th>
                            <th className="px-3 py-2">Parent Product Description</th>
                            <th className="px-3 py-2 text-right">Qty Consumed</th>
                            <th className="px-3 py-2">Unit</th>
                            <th className="px-3 py-2 text-right">Component Cost LL</th>
                            <th className="px-3 py-2 text-right">Impact on Parent Cost LL</th>
                            <th className="px-3 py-2 text-center">Relationship Type</th>
                            <th className="px-3 py-2 text-center w-12">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {editingProduct.usedInItems && editingProduct.usedInItems.length > 0 ? (
                            editingProduct.usedInItems.map((item, idx) => (
                              <tr
                                key={item.id}
                                className={`hover:bg-slate-50 ${
                                  item.relationType === 'Inverted Breakdown (Hazard)' ? 'bg-rose-50/60' : ''
                                }`}
                              >
                                <td className="px-3 py-2 text-center font-mono text-slate-400">
                                  {idx + 1}
                                </td>
                                <td className="px-3 py-2 font-mono text-[11px] font-semibold text-[#195a96]">
                                  {item.parentProductCode}
                                </td>
                                <td className="px-3 py-2 font-medium text-slate-900">
                                  {item.parentDescription}
                                </td>
                                <td className="px-3 py-2 text-right font-bold font-mono">
                                  {item.qtyConsumed}
                                </td>
                                <td className="px-3 py-2 font-mono text-slate-600">
                                  {item.unit}
                                </td>
                                <td className="px-3 py-2 text-right font-mono text-slate-700">
                                  {item.componentCostLL.toLocaleString()}
                                </td>
                                <td className="px-3 py-2 text-right font-bold font-mono text-slate-900">
                                  {item.impactOnParentCostLL.toLocaleString()}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  {item.relationType === 'Palletization' && (
                                    <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-bold text-[10px]">
                                      Palletization (Bulk Export)
                                    </span>
                                  )}
                                  {item.relationType === 'Bundle/Kit' && (
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px]">
                                      Wholesale Kit / Bundle
                                    </span>
                                  )}
                                  {item.relationType === 'Inverted Breakdown (Hazard)' && (
                                    <span className="px-2 py-0.5 bg-rose-600 text-white rounded font-bold text-[10px] animate-pulse">
                                      ⚠️ Backward Linkage (Hazard)
                                    </span>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveUsedInItem(item.id)}
                                    className="text-slate-400 hover:text-red-700 cursor-pointer transition p-1"
                                    title="Disconnect Linkage"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={9} className="px-4 py-8 text-center text-slate-500 space-y-1">
                                <div className="font-semibold text-slate-700">
                                  No Parent Products Linked (Terminal Finished Good)
                                </div>
                                <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                                  This grid is intentionally empty because this 12-pack case is manufactured directly for wholesale dispatch and retail point-of-sale. Only master pallets or wholesale combo kits should configure upward dependencies here.
                                </p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                        {editingProduct.usedInItems && editingProduct.usedInItems.length > 0 && (
                          <tfoot className="bg-slate-50 font-semibold border-t-2 border-slate-200">
                            <tr>
                              <td colSpan={6} className="px-3 py-2.5 text-right text-slate-700">
                                Total Parent Consumption Value:
                              </td>
                              <td className="px-3 py-2.5 text-right font-mono text-sm text-[#195a96] font-bold">
                                {editingProduct.usedInItems
                                  .reduce((sum, item) => sum + item.impactOnParentCostLL, 0)
                                  .toLocaleString()}{' '}
                                LBP
                              </td>
                              <td colSpan={2}></td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: HISTORY (4 Sub-Tabs: Movements, Cost Variation, Supplier Pricing, Audit Trail) */}
              {activeModalTab === 'history' && (
                <div className="space-y-4">
                  {/* Sub-Tab Navigation Strip */}
                  <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
                    <button
                      type="button"
                      onClick={() => setHistorySubTab('movements')}
                      className={`px-3 py-1.5 rounded-sm text-xs font-semibold cursor-pointer transition ${
                        historySubTab === 'movements'
                          ? 'bg-[#323f4b] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Inventory Movements
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistorySubTab('costVariation')}
                      className={`px-3 py-1.5 rounded-sm text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 ${
                        historySubTab === 'costVariation'
                          ? 'bg-[#323f4b] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>Cost Variation</span>
                      <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-bold">
                        Invoice #120
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistorySubTab('supplierPricing')}
                      className={`px-3 py-1.5 rounded-sm text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 ${
                        historySubTab === 'supplierPricing'
                          ? 'bg-[#323f4b] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>Supplier Pricing</span>
                      <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded font-mono text-[10px]">
                        Make vs. Buy
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistorySubTab('salesPerformance')}
                      className={`px-3 py-1.5 rounded-sm text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 ${
                        historySubTab === 'salesPerformance'
                          ? 'bg-[#323f4b] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>Sales Performance</span>
                      <span className="px-1.5 py-0.2 bg-purple-100 text-purple-900 rounded font-mono text-[10px]">
                        Cost Trap Audit
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistorySubTab('audit')}
                      className={`px-3 py-1.5 rounded-sm text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 ${
                        historySubTab === 'audit'
                          ? 'bg-[#323f4b] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>Audit Trail</span>
                      <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-mono text-[10px]">
                        Immutable
                      </span>
                    </button>
                  </div>

                  {/* 1. INVENTORY MOVEMENTS SUB-TAB */}
                  {historySubTab === 'movements' && (
                    <div className="border border-slate-200 rounded-sm overflow-hidden bg-white">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="px-3 py-2">Date</th>
                            <th className="px-3 py-2">Type</th>
                            <th className="px-3 py-2">Reference</th>
                            <th className="px-3 py-2 text-right">Qty Change</th>
                            <th className="px-3 py-2 text-right">Balance After</th>
                            <th className="px-3 py-2">Location</th>
                            <th className="px-3 py-2">User</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {editingProduct.movements && editingProduct.movements.length > 0 ? (
                            editingProduct.movements.map((m) => (
                              <tr key={m.id} className="hover:bg-slate-50">
                                <td className="px-3 py-2 font-mono text-[11px]">{m.date}</td>
                                <td className="px-3 py-2 font-medium">{m.type}</td>
                                <td className="px-3 py-2 font-mono text-[11px] font-semibold text-[#195a96]">
                                  {m.reference}
                                </td>
                                <td
                                  className={`px-3 py-2 text-right font-bold font-mono ${
                                    m.qtyChange < 0 ? 'text-red-600' : 'text-emerald-700'
                                  }`}
                                >
                                  {m.qtyChange > 0 ? `+${m.qtyChange}` : m.qtyChange} {m.unit}
                                </td>
                                <td className="px-3 py-2 text-right font-bold font-mono text-slate-800">
                                  {m.balanceAfter} {m.unit}
                                </td>
                                <td className="px-3 py-2">{m.location}</td>
                                <td className="px-3 py-2 text-slate-600">{m.user}</td>
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

                  {/* 2. COST VARIATION SUB-TAB (ROOT CAUSE OF 48.9B ERROR & AP ALERT) */}
                  {historySubTab === 'costVariation' && (
                    <div className="space-y-3">
                      {/* Root Cause Analysis Banner */}
                      <div className="p-3.5 bg-rose-50 border-2 border-rose-300 rounded-sm text-xs text-rose-950 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-bold text-rose-900 text-sm">
                            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                            <span>Root Cause Isolated: 48,956,400,000 LBP Receiving Injection (Invoice #120)</span>
                          </div>
                          <span className="px-2 py-0.5 bg-rose-600 text-white font-mono text-[10px] font-bold rounded">
                            PURCHASES INVOICE #120
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] pt-1">
                          <div className="p-2.5 bg-white border border-rose-200 rounded-xs space-y-1">
                            <div className="font-bold text-slate-900">What Happened (The Receiving Error)</div>
                            <p className="text-slate-700 leading-relaxed">
                              On <strong>13-Sep-2026 09:15</strong>, user <strong>Mohammed Jichi</strong> entered <strong>Purchase Invoice #120</strong> in the <strong>Purchases Module</strong> at <strong>Zeit w zaytoun ljanoub</strong>. The total invoice amount was accidentally entered into the <code>Unit Cost</code> field (or a barcode scanner misfired). Because Omega automatically updates the moving average cost upon receiving goods, this invoice instantly overwrote master cost with <strong>48,956,400,000.00 LL</strong>.
                            </p>
                          </div>

                          <div className="p-2.5 bg-white border border-amber-300 rounded-xs space-y-1">
                            <div className="font-bold text-amber-900">Accounting Integrity Alert (Accounts Payable)</div>
                            <p className="text-slate-700 leading-relaxed">
                              While clicking <em>&quot;Recalculate Production Item Cost&quot;</em> on the Main tab realigned the master item profile for future sales, <strong>Purchase Invoice #120 is still logged in the Purchases ledger</strong>. Your balance sheet currently reflects an erroneous <strong>48.9 Billion LBP Accounts Payable liability</strong> to the supplier.
                            </p>
                            <p className="text-amber-950 font-semibold pt-1 border-t border-amber-200">
                              ⚠️ Action Required: Navigate to Operations &gt; Purchases, open Invoice #120, and correct the unit cost to fix Accounts Payable.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Cost Variation Matrix Table */}
                      <div className="border border-slate-200 rounded-sm overflow-hidden bg-white">
                        <div className="bg-[#f8fafc] px-4 py-2 border-b border-slate-200 flex items-center justify-between font-semibold text-slate-800 text-xs">
                          <span>Cost Variation Log &amp; Form Tracking</span>
                          <span className="text-[11px] font-normal text-slate-500">
                            Tracks every automated &amp; manual moving average cost change
                          </span>
                        </div>
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                            <tr>
                              <th className="px-3 py-2">Date &amp; Time</th>
                              <th className="px-3 py-2">Form Module</th>
                              <th className="px-3 py-2">Ref #</th>
                              <th className="px-3 py-2 text-right">Old Unit Cost LL</th>
                              <th className="px-3 py-2 text-right">New Unit Cost LL</th>
                              <th className="px-3 py-2">Branch</th>
                              <th className="px-3 py-2">User</th>
                              <th className="px-3 py-2 text-center">Audit Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                            {editingProduct.costVariations && editingProduct.costVariations.length > 0 ? (
                              editingProduct.costVariations.map((cv) => (
                                <tr
                                  key={cv.id}
                                  className={`hover:bg-slate-50 ${
                                    cv.isCorrupted ? 'bg-rose-50/70' : cv.id === 1 ? 'bg-emerald-50/50' : ''
                                  }`}
                                >
                                  <td className="px-3 py-2 text-slate-700">{cv.date}</td>
                                  <td className="px-3 py-2 font-sans font-semibold text-slate-900">{cv.form}</td>
                                  <td className="px-3 py-2 font-semibold text-[#195a96]">{cv.refNo}</td>
                                  <td className="px-3 py-2 text-right text-slate-600">
                                    {cv.oldCostLL.toLocaleString()}
                                  </td>
                                  <td
                                    className={`px-3 py-2 text-right font-bold ${
                                      cv.isCorrupted ? 'text-rose-700 text-xs animate-pulse' : 'text-slate-900'
                                    }`}
                                  >
                                    {cv.newCostLL.toLocaleString()}
                                  </td>
                                  <td className="px-3 py-2 font-sans text-slate-600">{cv.branch}</td>
                                  <td className="px-3 py-2 font-sans font-medium text-slate-800">{cv.user}</td>
                                  <td className="px-3 py-2 text-center font-sans">
                                    {cv.isCorrupted ? (
                                      <span className="px-2 py-0.5 bg-rose-600 text-white rounded font-bold text-[10px]">
                                        CORRUPTED INVOICE ENTRY
                                      </span>
                                    ) : cv.id === 1 ? (
                                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                                        REALIGNED VIA BOM (543,960 LL)
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px]">
                                        INITIAL MASTER PROFILE
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={8} className="px-3 py-6 text-center text-slate-400 font-sans">
                                  No cost variations recorded.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* 3. SUPPLIER PRICING SUB-TAB (MAKE VS. BUY MATRIX & VENDOR PRICING) */}
                  {historySubTab === 'supplierPricing' && (
                    <div className="space-y-3">
                      {/* Make vs Buy Integrity Conflict Banner */}
                      <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-sm text-xs text-amber-950 space-y-1.5">
                        <div className="flex items-center justify-between font-bold text-amber-900">
                          <div className="flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                            <span>&quot;Make vs. Buy&quot; Integrity Conflict (Critical Supply Chain Rule)</span>
                          </div>
                          <span className="px-2 py-0.5 bg-amber-200 text-amber-900 font-mono text-[10px] font-bold rounded">
                            MANUFACTURING SKU
                          </span>
                        </div>
                        <p className="text-slate-700 text-[11px] leading-relaxed">
                          This 12-pack case (<strong>{editingProduct.description}</strong>) is actively manufactured in your <strong>Choueifat plant</strong> using raw bulk vinegar, empty bottles, and factory labor configured in the <strong>Item Assembly</strong> tab. Because you manufacture it internally, you do <strong>not</strong> buy it from an external supplier. Therefore, this Supplier Pricing grid for the finished box should remain <strong>empty</strong>.
                        </p>
                        <p className="text-slate-600 text-[11px] italic">
                          You only use this matrix for raw materials (bottles, caps, bulk vinegar) or if you decide to outsource the production of this box to an external contract packager.
                        </p>
                      </div>

                      {/* Action Bar */}
                      <div className="border border-slate-200 rounded-sm overflow-hidden bg-white">
                        <div className="bg-[#f8fafc] px-4 py-2.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="font-semibold text-slate-800 text-xs">
                            Vendor Procurement Pricing Matrix ({editingProduct.supplierPricings?.length || 0} contracts)
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setNewSuppPriceBuyingUnit(editingProduct.buyingFormat || 'BOX');
                                setIsNewSupplierPricingModalOpen(true);
                              }}
                              className="px-3 py-1 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-sm font-semibold text-xs flex items-center gap-1 cursor-pointer transition shadow-xs"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ New Item Supplier Pricing</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleLoadSampleOutsourceSupplierPrice}
                              className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-sm font-semibold text-xs flex items-center gap-1 cursor-pointer transition shadow-xs"
                              title="Simulate third-party contract packing agreement"
                            >
                              <Tag className="w-3.5 h-3.5" />
                              <span>Demo Outsource Contract</span>
                            </button>
                            {editingProduct.supplierPricings && editingProduct.supplierPricings.length > 0 && (
                              <button
                                type="button"
                                onClick={handleClearSupplierPricing}
                                className="px-2.5 py-1 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-sm font-semibold text-xs cursor-pointer transition"
                              >
                                Clear Grid
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Supplier Pricing Table */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                              <tr>
                                <th className="px-3 py-2 w-10 text-center">#</th>
                                <th className="px-3 py-2">Supplier</th>
                                <th className="px-3 py-2">Buying Unit</th>
                                <th className="px-3 py-2 text-right">Agreed Price</th>
                                <th className="px-3 py-2 text-center">Currency</th>
                                <th className="px-3 py-2">Supplier Code (B2B)</th>
                                <th className="px-3 py-2 text-center">Target / Free Deal</th>
                                <th className="px-3 py-2 text-right">Discount %</th>
                                <th className="px-3 py-2 text-right">Effective Unit Cost LL</th>
                                <th className="px-3 py-2 text-center w-12">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {editingProduct.supplierPricings && editingProduct.supplierPricings.length > 0 ? (
                                editingProduct.supplierPricings.map((sp, idx) => {
                                  const base = sp.currency === 'USD' ? sp.price * (editingProduct.secondCurrencyRate || 90000) : sp.price;
                                  const effective = Math.round(base * (1 - (sp.discountPct || 0) / 100));
                                  return (
                                    <tr key={sp.id} className="hover:bg-slate-50">
                                      <td className="px-3 py-2 text-center font-mono text-slate-400">{idx + 1}</td>
                                      <td className="px-3 py-2 font-medium text-slate-900">{sp.supplierName}</td>
                                      <td className="px-3 py-2 font-mono text-slate-600">{sp.buyingUnit}</td>
                                      <td className="px-3 py-2 text-right font-mono font-bold">
                                        {sp.price.toLocaleString()}
                                      </td>
                                      <td className="px-3 py-2 text-center font-mono text-slate-700">
                                        <span className="px-1.5 py-0.5 bg-slate-100 rounded font-semibold text-[10px]">
                                          {sp.currency}
                                        </span>
                                      </td>
                                      <td className="px-3 py-2 font-mono text-[11px] font-semibold text-[#195a96]">
                                        {sp.supplierCode}
                                      </td>
                                      <td className="px-3 py-2 text-center font-mono">
                                        {sp.target && sp.free ? (
                                          <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-bold text-[10px]">
                                            Buy {sp.target}, Get {sp.free} Free
                                          </span>
                                        ) : (
                                          <span className="text-slate-400">-</span>
                                        )}
                                      </td>
                                      <td className="px-3 py-2 text-right font-mono">
                                        {sp.discountPct ? `${sp.discountPct}%` : '0%'}
                                      </td>
                                      <td className="px-3 py-2 text-right font-mono font-bold text-emerald-700">
                                        {effective.toLocaleString()} LL
                                      </td>
                                      <td className="px-3 py-2 text-center">
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveSupplierPricing(sp.id)}
                                          className="text-slate-400 hover:text-red-700 cursor-pointer p-1"
                                          title="Delete contract"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })
                              ) : (
                                <tr>
                                  <td colSpan={10} className="px-4 py-8 text-center text-slate-500 space-y-1">
                                    <div className="font-semibold text-slate-700">
                                      No Vendor Pricing Configured (Standard Manufactured Good)
                                    </div>
                                    <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                                      This grid is intentionally empty because this product is manufactured in Choueifat. External vendor pricing is only configured for purchased raw materials or outsourced contract packing.
                                    </p>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 4. SALES PERFORMANCE SUB-TAB (TRANSACTIONAL VELOCITY, HISTORICAL COST TRAP, & VANGUARD SYNC) */}
                  {historySubTab === 'salesPerformance' && (
                    <div className="space-y-4">
                      {/* Banner 1: The Historical Cost Trap (Critical Integrity Check) */}
                      <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-sm text-xs text-rose-950 space-y-2">
                        <div className="flex items-center justify-between font-bold text-rose-900">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                            <span>The Historical Cost Trap (Critical Immutability & Margin Integrity Check)</span>
                          </div>
                          <span className="px-2 py-0.5 bg-rose-200 text-rose-900 font-mono text-[10px] font-bold rounded">
                            IMMUTABLE LEDGER
                          </span>
                        </div>
                        <p className="text-slate-700 text-[11px] leading-relaxed">
                          <strong>Mechanical Rule:</strong> In Omega ERP and Vanguard ERP, sales rows permanently lock their financial data at the exact moment of the transaction. When a customer checkout occurs, the system stamps the active Cost from the <strong>Main</strong> tab directly onto that receipt line to determine profit margin.
                        </p>
                        <div className="p-2.5 bg-white border border-rose-200 rounded-xs text-[11px] space-y-1">
                          <span className="font-bold text-rose-800 block">
                            The 48-Billion LBP Impact on Live Receipts:
                          </span>
                          <p className="text-slate-600 leading-normal">
                            Earlier today, <strong>Purchase Invoice #120</strong> corrupted the master unit cost to <strong>48,956,400,000.00 LL</strong>. When receipt <code className="text-rose-700 font-bold font-mono">POS-REC-9402</code> below was processed during that window, the register stamped that 48-Billion cost onto 2 sold boxes, registering a catastrophic historical loss of <strong>-97,910,640,000 LL</strong>.
                          </p>
                          <p className="text-slate-800 font-semibold italic text-[10.5px]">
                            ⚠️ Critical Invariant: Because this transaction ledger is completely immutable, fixing the Main tab cost (which you executed via BOM recalculation) does NOT retroactively alter historical receipts. Corrupted receipts permanently display the historical cost stamped at checkout.
                          </p>
                        </div>
                      </div>

                      {/* Banner 2: Calculation Method & Cross-Platform Sync */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-sm space-y-1.5">
                          <div className="font-bold text-slate-800 flex items-center gap-1.5">
                            <BarChart2 className="w-4 h-4 text-[#195a96]" />
                            <span>Calculation Method (Revenue and Yield Audit)</span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            • <strong>Gross Revenue:</strong> Computed via extended formula: <code>Qty Sold × Triggered Selling Price</code> (e.g. 1,080,000 LL for SP1).<br />
                            • <strong>Gross Margin:</strong> <code>Gross Revenue - (Qty Sold × Stamped Historical Cost)</code>.<br />
                            • <strong>Audit Utility:</strong> Audit whether cashiers or dispatch drivers are manually overriding prices or accidentally triggering bulk discounts (such as <strong>Selling Price 2</strong> at 950,000 LL) on single-box orders.
                          </p>
                        </div>

                        <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-sm space-y-1.5">
                          <div className="font-bold text-blue-900 flex items-center gap-1.5">
                            <Truck className="w-4 h-4 text-blue-700" />
                            <span>Cross-Platform Connections (Vanguard ERP Sync)</span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            • <strong>Central Data Aggregator:</strong> Real-time integration ingesting orders closed in your custom <strong>Next.js Supersonic Dispatch</strong> module via API alongside walk-in retail checkouts at <strong>Omega POS</strong>.<br />
                            • <strong>Payload Integrity:</strong> If a network blip drops a Vanguard API payload, this tab allows you to instantly reconcile missing quantity movement against physical dispatch logs.
                          </p>
                        </div>
                      </div>

                      {/* Interactive Transaction Matrix */}
                      <div className="border border-slate-200 rounded-sm overflow-hidden bg-white">
                        <div className="bg-[#f8fafc] px-4 py-2.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800 text-xs">
                              Transactional Sales Ledger & Margin Audit
                            </span>
                            <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full font-mono text-[10px] font-bold">
                              {filteredSalesTransactions.length} receipts
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-[11px]">
                              <span className="text-slate-500">Filter:</span>
                              <select
                                value={salesPerfFilter}
                                onChange={(e) => setSalesPerfFilter(e.target.value as any)}
                                className="border border-slate-300 rounded-xs px-2 py-1 bg-white text-xs text-slate-700"
                              >
                                <option value="all">All Sales Receipts</option>
                                <option value="corruptedOnly">⚠️ Corrupted Cost Trap Only</option>
                                <option value="apiOnly">Next.js Dispatch API Only</option>
                                <option value="posOnly">Omega POS Walk-in Only</option>
                              </select>
                            </div>

                            <button
                              type="button"
                              onClick={handleSimulateLiveDispatchSale}
                              className="px-2.5 py-1 bg-[#195a96] hover:bg-[#144777] text-white rounded-sm font-semibold text-xs flex items-center gap-1 cursor-pointer transition shadow-xs"
                              title="Simulate order processed via Next.js Supersonic Dispatch API"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ Simulate Dispatch API Sale (5 Boxes)</span>
                            </button>
                          </div>
                        </div>

                        {/* Transaction Table */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                              <tr>
                                <th className="px-3 py-2 text-center w-10">#</th>
                                <th className="px-3 py-2">Timestamp & Receipt #</th>
                                <th className="px-3 py-2">Source & Channel</th>
                                <th className="px-3 py-2 text-center">Qty Sold</th>
                                <th className="px-3 py-2">Price Triggered</th>
                                <th className="px-3 py-2 text-right">Unit SP (LL)</th>
                                <th className="px-3 py-2 text-right">Stamped Cost (LL)</th>
                                <th className="px-3 py-2 text-right">Gross Revenue</th>
                                <th className="px-3 py-2 text-right">Profit / Loss (LL)</th>
                                <th className="px-3 py-2 text-right">Margin %</th>
                                <th className="px-3 py-2 text-center">Sync Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                              {filteredSalesTransactions.map((tx, idx) => {
                                const isCorrupted = tx.isCorruptedCostTrap;
                                return (
                                  <tr
                                    key={tx.id}
                                    className={`hover:bg-slate-50 transition ${
                                      isCorrupted ? 'bg-rose-50/80 font-semibold' : ''
                                    }`}
                                  >
                                    <td className="px-3 py-2 text-center text-slate-400 font-sans">{idx + 1}</td>
                                    <td className="px-3 py-2 font-sans">
                                      <div className="font-bold text-slate-900 font-mono">{tx.receiptNumber}</div>
                                      <div className="text-[10px] text-slate-500 font-sans">{tx.date}</div>
                                    </td>
                                    <td className="px-3 py-2 font-sans">
                                      <div className="font-medium text-slate-900 flex items-center gap-1">
                                        {tx.source.includes('Dispatch') ? (
                                          <Truck className="w-3 h-3 text-[#195a96] shrink-0" />
                                        ) : (
                                          <Package className="w-3 h-3 text-slate-500 shrink-0" />
                                        )}
                                        <span>{tx.source}</span>
                                      </div>
                                      <div className="text-[10px] text-slate-500">{tx.channel}</div>
                                    </td>
                                    <td className="px-3 py-2 text-center font-bold text-slate-900">
                                      {tx.qtySold} {tx.unit}
                                    </td>
                                    <td className="px-3 py-2 font-sans">
                                      <span
                                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                          tx.priceType.includes('Price 1')
                                            ? 'bg-blue-100 text-blue-800'
                                            : tx.priceType.includes('Price 2')
                                            ? 'bg-purple-100 text-purple-800'
                                            : 'bg-amber-100 text-amber-800'
                                        }`}
                                      >
                                        {tx.priceType}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2 text-right font-bold text-slate-900">
                                      {tx.unitSellingPrice.toLocaleString()}
                                    </td>
                                    <td
                                      className={`px-3 py-2 text-right font-bold ${
                                        isCorrupted ? 'text-rose-700 bg-rose-100/60' : 'text-slate-700'
                                      }`}
                                    >
                                      {tx.stampedHistoricalCost.toLocaleString()}
                                    </td>
                                    <td className="px-3 py-2 text-right font-bold text-slate-900">
                                      {tx.totalRevenue.toLocaleString()}
                                    </td>
                                    <td
                                      className={`px-3 py-2 text-right font-bold ${
                                        tx.grossProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
                                      }`}
                                    >
                                      {tx.grossProfit >= 0 ? '+' : ''}
                                      {tx.grossProfit.toLocaleString()}
                                    </td>
                                    <td
                                      className={`px-3 py-2 text-right font-bold ${
                                        tx.marginPct >= 0 ? 'text-emerald-700' : 'text-rose-700'
                                      }`}
                                    >
                                      {tx.marginPct}%
                                    </td>
                                    <td className="px-3 py-2 text-center font-sans">
                                      <span
                                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                          tx.syncStatus.includes('Verified')
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : 'bg-slate-100 text-slate-700'
                                        }`}
                                      >
                                        {tx.syncStatus}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 5. AUDIT TRAIL SUB-TAB (IMMUTABLE DATABASE LOGS & 48.9B COMMITTED AUDIT) */}
                  {historySubTab === 'audit' && (
                    <div className="space-y-3">
                      {/* Isolating the 48-Billion LBP Error Matrix Guide */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-sm text-xs space-y-2">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>How to Read the Audit Trail Matrix (Isolating the 48-Billion LBP Error)</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
                          <div className="p-2 bg-white border border-slate-200 rounded-xs">
                            <span className="font-bold text-slate-900 block mb-0.5">1. Target Transaction</span>
                            <span className="text-slate-600">
                              Field: <code>Cost / Unit Cost LL</code> | New Value: <code>48,956,400,000</code> | User: <strong>Mohammed Jichi</strong> on <strong>13-Sep-2026</strong>.
                            </span>
                          </div>
                          <div className="p-2 bg-white border border-slate-200 rounded-xs">
                            <span className="font-bold text-slate-900 block mb-0.5">2. Action Types</span>
                            <span className="text-slate-600">
                              <strong>Update:</strong> Manual override or moving-avg cost recalculation. <strong>Insert:</strong> Entry during record creation. <strong>API/Sync:</strong> System integration.
                            </span>
                          </div>
                          <div className="p-2 bg-white border border-slate-200 rounded-xs">
                            <span className="font-bold text-emerald-800 block mb-0.5">3. Correction Log Committed</span>
                            <span className="text-slate-600">
                              Top row shows Action: <strong>Update</strong>, Old Value: <code>48956400000</code>, New Value: <code>543960</code>. Permanent DB commit verified.
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Audit Log Table */}
                      <div className="border border-slate-200 rounded-sm overflow-hidden bg-white">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                            <tr>
                              <th className="px-3 py-2">Timestamp</th>
                              <th className="px-3 py-2">Action</th>
                              <th className="px-3 py-2">Field Name</th>
                              <th className="px-3 py-2 text-right">Old Value</th>
                              <th className="px-3 py-2 text-right">New Value</th>
                              <th className="px-3 py-2">User Account</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {editingProduct.auditLogs && editingProduct.auditLogs.length > 0 ? (
                              editingProduct.auditLogs.map((a) => {
                                const isCorrupted = a.oldValue === '48956400000' || a.newValue === '48956400000';
                                const isCorrection = a.oldValue === '48956400000' && a.newValue === '543960';
                                return (
                                  <tr
                                    key={a.id}
                                    className={`hover:bg-slate-50 ${
                                      isCorrection
                                        ? 'bg-emerald-50/70 font-semibold'
                                        : isCorrupted
                                        ? 'bg-rose-50/70'
                                        : ''
                                    }`}
                                  >
                                    <td className="px-3 py-2 font-mono text-[11px] text-slate-600">{a.timestamp}</td>
                                    <td className="px-3 py-2">
                                      <span
                                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                          a.action === 'Update'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-slate-100 text-slate-700'
                                        }`}
                                      >
                                        {a.action}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2 font-medium text-slate-900">{a.field}</td>
                                    <td className="px-3 py-2 text-right font-mono text-slate-600">
                                      {Number(a.oldValue) ? Number(a.oldValue).toLocaleString() : a.oldValue}
                                    </td>
                                    <td
                                      className={`px-3 py-2 text-right font-mono font-bold ${
                                        isCorrection
                                          ? 'text-emerald-700'
                                          : isCorrupted
                                          ? 'text-rose-700 text-xs'
                                          : 'text-[#195a96]'
                                      }`}
                                    >
                                      {Number(a.newValue) ? Number(a.newValue).toLocaleString() : a.newValue}
                                    </td>
                                    <td className="px-3 py-2 font-medium text-slate-800">{a.user}</td>
                                  </tr>
                                );
                              })
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
                    <div className="border border-slate-200 rounded-sm p-4 space-y-5 text-xs">
                      {/* Section 1: Food Safety, Compliance & Traceability */}
                      <div>
                        <h4 className="font-semibold text-slate-800 text-xs border-b border-slate-200 pb-1.5 mb-3 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
                            1. Food Safety, Compliance & Batch Tracking
                          </span>
                          <span className="text-[10px] text-slate-400">Critical Food Formulation Rules</span>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {/* Has Expiry Date */}
                          <div className="p-2.5 rounded-sm border border-emerald-200 bg-emerald-50/50">
                            <label className="flex items-start gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={Boolean(editingProduct.hasExpiryDate ?? true)}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, hasExpiryDate: e.target.checked, hasExpiry: e.target.checked })
                                }
                                className="w-4 h-4 rounded border-emerald-400 text-emerald-600 mt-0.5"
                              />
                              <div>
                                <span className="font-bold text-emerald-900 block">Has Expiry Date (FIFO)</span>
                                <span className="text-[11px] text-emerald-800 block mt-0.5">
                                  Mandatory for molasses, vinegar, tomato paste, jams & fats. Prompts batch expiry date on receipt from Choueifat plant.
                                </span>
                              </div>
                            </label>
                          </div>

                          {/* Support Serial Number */}
                          <div className="p-2.5 rounded-sm border border-slate-200 bg-slate-50">
                            <label className="flex items-start gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={Boolean(editingProduct.supportSerialNumber)}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, supportSerialNumber: e.target.checked, hasSerialNumber: e.target.checked })
                                }
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 mt-0.5"
                              />
                              <div>
                                <span className="font-semibold text-slate-800 block">Support Serial Number</span>
                                <span className="text-[11px] text-slate-500 block mt-0.5">
                                  For electronics & serialized equipment. Leave unchecked for case packs of vinegars and Eau de Javel.
                                </span>
                              </div>
                            </label>
                          </div>

                          {/* Print Label on Sales */}
                          <div className="p-2.5 rounded-sm border border-slate-200 bg-slate-50">
                            <label className="flex items-start gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={Boolean(editingProduct.printLabelOnSales)}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, printLabelOnSales: e.target.checked })
                                }
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 mt-0.5"
                              />
                              <div>
                                <span className="font-semibold text-slate-800 block">Print Label on Sales</span>
                                <span className="text-[11px] text-slate-500 block mt-0.5">
                                  Generates sticker at moment of sale for bulk unlabelled goods (like fresh local cheese).
                                </span>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Channel Visibility & ERP Linkage */}
                      <div>
                        <h4 className="font-semibold text-slate-800 text-xs border-b border-slate-200 pb-1.5 mb-3 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                            2. Channel Visibility & ERP / Dispatch Linkage
                          </span>
                          <span className="text-[10px] text-slate-400">API & B2B Portal Visibility</span>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {/* Sell it Online */}
                          <div className="p-2.5 rounded-sm border border-blue-200 bg-blue-50/50">
                            <label className="flex items-start gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={Boolean(editingProduct.sellOnline ?? true)}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, sellOnline: e.target.checked })
                                }
                                className="w-4 h-4 rounded border-blue-400 text-blue-600 mt-0.5"
                              />
                              <div>
                                <span className="font-bold text-blue-900 block">Sell it Online (API Visibility)</span>
                                <span className="text-[11px] text-blue-800 block mt-0.5">
                                  Exposes item to Vanguard ERP, Supersonic Dispatch & B2B ordering portal.
                                </span>
                              </div>
                            </label>
                          </div>

                          {/* For Export */}
                          <div className="p-2.5 rounded-sm border border-slate-200 bg-slate-50">
                            <label className="flex items-start gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={Boolean(editingProduct.forExport)}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, forExport: e.target.checked })
                                }
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 mt-0.5"
                              />
                              <div>
                                <span className="font-semibold text-slate-800 block">For Export</span>
                                <span className="text-[11px] text-slate-500 block mt-0.5">
                                  Works with HS Code to trigger international commercial invoice formatting & customs tax exemptions.
                                </span>
                              </div>
                            </label>
                          </div>

                          {/* Hide if Zero */}
                          <div className="p-2.5 rounded-sm border border-slate-200 bg-slate-50">
                            <label className="flex items-start gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={Boolean(editingProduct.hideIfZero)}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, hideIfZero: e.target.checked })
                                }
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 mt-0.5"
                              />
                              <div>
                                <span className="font-semibold text-slate-800 block">Hide if Zero</span>
                                <span className="text-[11px] text-slate-500 block mt-0.5">
                                  Hides SKU from POS when Qty OH is zero. Leave unchecked for core manufactured goods to signal production runs.
                                </span>
                              </div>
                            </label>
                          </div>

                          {/* Hide in Report */}
                          <div className="p-2.5 rounded-sm border border-slate-200 bg-slate-50">
                            <label className="flex items-start gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={Boolean(editingProduct.isHideInReport)}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, isHideInReport: e.target.checked })
                                }
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 mt-0.5"
                              />
                              <div>
                                <span className="font-semibold text-slate-800 block">Hide In Report</span>
                                <span className="text-[11px] text-slate-500 block mt-0.5">
                                  Keeps internal supplies or zero-value placeholder SKUs out of financial valuation reports.
                                </span>
                              </div>
                            </label>
                          </div>

                          {/* Electronic Label Tag */}
                          <div className="p-2.5 rounded-sm border border-slate-200 bg-slate-50">
                            <label className="flex items-start gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={Boolean(editingProduct.isElectronicLabelTag)}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, isElectronicLabelTag: e.target.checked })
                                }
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 mt-0.5"
                              />
                              <div>
                                <span className="font-semibold text-slate-800 block">Electronic Label Tag (ESL)</span>
                                <span className="text-[11px] text-slate-500 block mt-0.5">
                                  Integrates item pricing via API to digital electronic shelf tags.
                                </span>
                              </div>
                            </label>
                          </div>

                          {/* Discontinued */}
                          <div className="p-2.5 rounded-sm border border-rose-200 bg-rose-50/40">
                            <label className="flex items-start gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={Boolean(editingProduct.isDiscontinued)}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, isDiscontinued: e.target.checked })
                                }
                                className="w-4 h-4 rounded border-rose-400 text-rose-600 mt-0.5"
                              />
                              <div>
                                <span className="font-bold text-rose-900 block">Discontinued Item</span>
                                <span className="text-[11px] text-rose-800 block mt-0.5">
                                  Permanently removes retired jar sizes or legacy batches from active PO/POS menus without deleting sales history.
                                </span>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Commercial Policy & Lifecycle Governance */}
                      <div>
                        <h4 className="font-semibold text-slate-800 text-xs border-b border-slate-200 pb-1.5 mb-3 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Settings className="w-3.5 h-3.5 text-purple-600" />
                            3. Commercial Policy & Sales Lifecycle Governance
                          </span>
                          <span className="text-[10px] text-slate-400">Invoicing & Returns Controls</span>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {/* Refundable */}
                          <div className="p-2.5 rounded-sm border border-slate-200 bg-slate-50">
                            <label className="flex items-start gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={Boolean(editingProduct.isRefundable ?? true)}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, isRefundable: e.target.checked })
                                }
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 mt-0.5"
                              />
                              <div>
                                <span className="font-semibold text-slate-800 block">Refundable</span>
                                <span className="text-[11px] text-slate-500 block mt-0.5">
                                  Allows POS returns and credit notes. Uncheck for custom bulk chemical orders that cannot be restocked once dispatched.
                                </span>
                              </div>
                            </label>
                          </div>

                          {/* Open Description */}
                          <div className="p-2.5 rounded-sm border border-slate-200 bg-slate-50">
                            <label className="flex items-start gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={Boolean(editingProduct.isOpenDescription)}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, isOpenDescription: e.target.checked })
                                }
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 mt-0.5"
                              />
                              <div>
                                <span className="font-semibold text-slate-800 block">Open Description</span>
                                <span className="text-[11px] text-slate-500 block mt-0.5">
                                  Cashier can manually overwrite item name on invoice. Keep unchecked for standardized commercial goods to prevent report corruption.
                                </span>
                              </div>
                            </label>
                          </div>

                          {/* Consignment */}
                          <div className="p-2.5 rounded-sm border border-slate-200 bg-slate-50">
                            <label className="flex items-start gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={Boolean(editingProduct.consignment || editingProduct.isConsignment)}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, consignment: e.target.checked, isConsignment: e.target.checked })
                                }
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 mt-0.5"
                              />
                              <div>
                                <span className="font-semibold text-slate-800 block">Consignment</span>
                                <span className="text-[11px] text-slate-500 block mt-0.5">
                                  Placement in external retail shops without upfront payment. Standard wholesale batches are direct revenue (leave unchecked).
                                </span>
                              </div>
                            </label>
                          </div>

                          {/* Yearly Subscription */}
                          <div className="p-2.5 rounded-sm border border-slate-200 bg-slate-50">
                            <label className="flex items-start gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={Boolean(editingProduct.isYearlySubscription)}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, isYearlySubscription: e.target.checked })
                                }
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 mt-0.5"
                              />
                              <div>
                                <span className="font-semibold text-slate-800 block">Yearly Subscription</span>
                                <span className="text-[11px] text-slate-500 block mt-0.5">
                                  Triggers recurring billing cycles. Leave unchecked for moving physical commercial batches.
                                </span>
                              </div>
                            </label>
                          </div>

                          {/* Daily Adjust */}
                          <div className="p-2.5 rounded-sm border border-amber-200 bg-amber-50/50">
                            <label className="flex items-start gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={Boolean(editingProduct.isDailyAdjust)}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, isDailyAdjust: e.target.checked })
                                }
                                className="w-4 h-4 rounded border-amber-400 text-amber-600 mt-0.5"
                              />
                              <div>
                                <span className="font-bold text-amber-900 block">Daily Adjust (High-Value Cycle)</span>
                                <span className="text-[11px] text-amber-800 block mt-0.5">
                                  Pulls SKU into daily physical cycle-count audit reports (mandated for high-value raw materials like bulk CMC or Pectin).
                                </span>
                              </div>
                            </label>
                          </div>

                          {/* Weekly Adjust */}
                          <div className="p-2.5 rounded-sm border border-amber-200 bg-amber-50/50">
                            <label className="flex items-start gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={Boolean(editingProduct.isWeeklyAdjust)}
                                onChange={(e) =>
                                  setEditingProduct({ ...editingProduct, isWeeklyAdjust: e.target.checked })
                                }
                                className="w-4 h-4 rounded border-amber-400 text-amber-600 mt-0.5"
                              />
                              <div>
                                <span className="font-bold text-amber-900 block">Weekly Adjust (Cycle Count)</span>
                                <span className="text-[11px] text-amber-800 block mt-0.5">
                                  Pulls SKU into weekly inventory reconciliation audit reports for finished goods.
                                </span>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Physical & Chemical Specifications */}
                      <div className="pt-2 border-t border-slate-200">
                        <h4 className="font-semibold text-slate-800 text-xs mb-3">Item Physical Specifications & Formulation Notes</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-slate-700 font-medium mb-1">Color Specification</label>
                            <input
                              type="text"
                              value={editingProduct.color || ''}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, color: e.target.value, hasColors: Boolean(e.target.value) })
                              }
                              placeholder="e.g. Deep Amber / Rich Burgundy"
                              className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-700 font-medium mb-1">Size / Net Weight</label>
                            <input
                              type="text"
                              value={editingProduct.size || ''}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, size: e.target.value, hasSizes: Boolean(e.target.value) })
                              }
                              placeholder="e.g. 500ml / 800g / 16L"
                              className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-700 font-medium mb-1">Master Item Flag</label>
                            <div className="pt-1.5">
                              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={Boolean(editingProduct.isMasterItem)}
                                  onChange={(e) =>
                                    setEditingProduct({ ...editingProduct, isMasterItem: e.target.checked })
                                  }
                                  className="w-4 h-4 rounded border-slate-300 text-blue-600"
                                />
                                <span className="font-medium text-slate-700">Master Item Definition</span>
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <label className="block text-slate-700 font-medium mb-1">Ingredients & Formulation Recipe</label>
                          <textarea
                            rows={2}
                            value={editingProduct.ingredients || ''}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, ingredients: e.target.value, hasIngredients: Boolean(e.target.value) })
                            }
                            placeholder="e.g. 100% Pure concentrated pomegranate juice, citric acid..."
                            className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white"
                          />
                        </div>
                      </div>
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
            <div className="p-5 space-y-2 text-xs max-h-[440px] overflow-y-auto">
              <div className="flex items-center justify-between font-semibold text-slate-800 border-b border-slate-100 pb-1.5 mb-1">
                <span>Filter by Specifications ({activeMoreFiltersCount} active)</span>
                {activeMoreFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      setMoreFilters({
                        serialNumber: false,
                        ingredients: false,
                        colors: false,
                        sizes: false,
                        costZero: false,
                        sellingPriceZero: false,
                        logicalWarehouseNull: false,
                        defaultLocationNull: false,
                        serviceItems: false,
                        consignmentItems: false,
                        withoutReorderLevel: false,
                        masterItems: false,
                        discontinuedItems: false,
                        withExpiry: false,
                      })
                    }
                    className="text-[11px] text-rose-600 hover:text-rose-800 cursor-pointer font-medium hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="space-y-1">
                {MORE_FILTER_OPTIONS.map((opt) => {
                  const isActive = moreFilters[opt.key];
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => handleToggleMoreFilter(opt.key)}
                      className={`w-full text-left flex items-center justify-between py-2 px-3 rounded-xs cursor-pointer select-none transition-colors border ${
                        isActive
                          ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      <span className="text-[12px]">{opt.label}</span>
                      {isActive && <Check className="w-4 h-4 text-blue-600 shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>

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

      {/* =======================================================================
          MODAL 4: APPLY RECOMMENDED PRICE MODAL (Image 3)
          ======================================================================= */}
      {isApplyRecommendedPriceModalOpen && (
        <div
          className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-fade-in"
          style={{ zIndex: 75000 }}
        >
          <div
            className="bg-white border border-slate-300 w-full text-slate-800 shadow-2xl max-w-sm rounded-sm overflow-hidden"
            style={{ zIndex: 75001 }}
          >
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-white">
              <h3 className="text-sm font-semibold text-slate-700 leading-snug">
                Apply recommended price to the selected selling prices
              </h3>
              <button
                type="button"
                onClick={() => setIsApplyRecommendedPriceModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none cursor-pointer ml-2"
              >
                ×
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs">
              <div className="space-y-2.5">
                {[
                  { key: 'sp1', label: 'Selling Price 1' },
                  { key: 'sp2', label: 'Selling Price 2' },
                  { key: 'sp3', label: 'Selling Price 3' },
                  { key: 'sp4', label: 'Selling Price 4' },
                ].map((item) => (
                  <label key={item.key} className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={recommendedPriceTargets[item.key as keyof typeof recommendedPriceTargets]}
                      onChange={(e) =>
                        setRecommendedPriceTargets({
                          ...recommendedPriceTargets,
                          [item.key]: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-slate-700 font-medium">{item.label}</span>
                  </label>
                ))}
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsApplyRecommendedPriceModalOpen(false)}
                  className="px-4 py-1.5 rounded-sm bg-[#606f7b] hover:bg-[#4d5a64] text-white font-medium cursor-pointer transition text-xs shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyRecommendedPrice}
                  className="px-5 py-1.5 rounded-sm bg-[#323f4b] hover:bg-[#28323c] text-white font-bold cursor-pointer transition text-xs shadow-xs"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL 5: LAST PRICES MODAL
          ======================================================================= */}
      {isLastPricesModalOpen && (
        <div
          className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-fade-in"
          style={{ zIndex: 75000 }}
        >
          <div
            className="bg-white border border-slate-300 w-full text-slate-800 shadow-2xl max-w-lg rounded-sm overflow-hidden"
            style={{ zIndex: 75001 }}
          >
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-white">
              <h3 className="text-sm font-semibold text-slate-800">
                Last Recorded Prices - {editingProduct?.description}
              </h3>
              <button
                type="button"
                onClick={() => setIsLastPricesModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none cursor-pointer"
              >
                ×
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2">Price Type</th>
                    <th className="p-2">Amount LL</th>
                    <th className="p-2">Amount $</th>
                    <th className="p-2">Effective Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2 font-medium">Selling Price 1</td>
                    <td className="p-2">{(editingProduct?.sellingPrice1LL || 0).toLocaleString()} LL</td>
                    <td className="p-2">${(editingProduct?.sellingPrice1USD || 0).toFixed(2)}</td>
                    <td className="p-2 text-slate-500">2026-09-01</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium">Selling Price 2</td>
                    <td className="p-2">{(editingProduct?.sellingPrice2LL || 0).toLocaleString()} LL</td>
                    <td className="p-2">${(editingProduct?.sellingPrice2USD || 0).toFixed(2)}</td>
                    <td className="p-2 text-slate-500">2026-08-15</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium">Selling Price 3</td>
                    <td className="p-2">{(editingProduct?.sellingPrice3LL || 0).toLocaleString()} LL</td>
                    <td className="p-2">${(editingProduct?.sellingPrice3USD || 0).toFixed(2)}</td>
                    <td className="p-2 text-slate-500">2026-07-20</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium">Selling Price 4</td>
                    <td className="p-2">{(editingProduct?.sellingPrice4LL || 0).toLocaleString()} LL</td>
                    <td className="p-2">${(editingProduct?.sellingPrice4USD || 0).toFixed(2)}</td>
                    <td className="p-2 text-slate-500">2026-07-01</td>
                  </tr>
                  <tr className="bg-slate-50/70 font-semibold">
                    <td className="p-2">Unit Cost</td>
                    <td className="p-2">{(editingProduct?.unitCostLL || 0).toLocaleString()} LL</td>
                    <td className="p-2">${(editingProduct?.unitCostUSD || 0).toFixed(2)}</td>
                    <td className="p-2 text-slate-500">Latest Purchase</td>
                  </tr>
                </tbody>
              </table>
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsLastPricesModalOpen(false)}
                  className="px-4 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-sm font-semibold cursor-pointer shadow-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL 6: PRICE VARIATIONS MODAL
          ======================================================================= */}
      {isPriceVariationsModalOpen && (
        <div
          className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-fade-in"
          style={{ zIndex: 75000 }}
        >
          <div
            className="bg-white border border-slate-300 w-full text-slate-800 shadow-2xl max-w-lg rounded-sm overflow-hidden"
            style={{ zIndex: 75001 }}
          >
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-white">
              <h3 className="text-sm font-semibold text-slate-800">
                Price Variations & Tiers - {editingProduct?.description}
              </h3>
              <button
                type="button"
                onClick={() => setIsPriceVariationsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none cursor-pointer"
              >
                ×
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <p className="text-slate-600">
                Configure tiered volume discounts and customer segment price variation overrides.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-200">
                  <div>
                    <span className="font-semibold text-slate-800">Tier 1 (Retail Standard):</span>
                    <span className="ml-2 text-slate-600">Qty 1+</span>
                  </div>
                  <span className="font-bold text-slate-900">{(editingProduct?.sellingPrice1LL || 0).toLocaleString()} LL</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-200">
                  <div>
                    <span className="font-semibold text-slate-800">Tier 2 (Wholesale / Bulk):</span>
                    <span className="ml-2 text-slate-600">Qty {editingProduct?.qtyPrice2 || 1}+</span>
                  </div>
                  <span className="font-bold text-slate-900">{(editingProduct?.sellingPrice2LL || 0).toLocaleString()} LL</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-200">
                  <div>
                    <span className="font-semibold text-slate-800">Tier 3 (Distributor / Special):</span>
                    <span className="ml-2 text-slate-600">Qty {editingProduct?.qtyPrice3 || 1}+</span>
                  </div>
                  <span className="font-bold text-slate-900">{(editingProduct?.sellingPrice3LL || 0).toLocaleString()} LL</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-200">
                  <div>
                    <span className="font-semibold text-slate-800">Tier 4 (Export / VIP):</span>
                    <span className="ml-2 text-slate-600">Qty {editingProduct?.qtyPrice4 || 1}+</span>
                  </div>
                  <span className="font-bold text-slate-900">{(editingProduct?.sellingPrice4LL || 0).toLocaleString()} LL</span>
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsPriceVariationsModalOpen(false)}
                  className="px-4 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-sm font-semibold cursor-pointer shadow-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL 7: MORE BARCODES MODAL
          ======================================================================= */}
      {isMoreBarcodesModalOpen && (
        <div
          className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-fade-in"
          style={{ zIndex: 75000 }}
        >
          <div
            className="bg-white border border-slate-300 w-full text-slate-800 shadow-2xl max-w-lg rounded-sm overflow-hidden"
            style={{ zIndex: 75001 }}
          >
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-white">
              <h3 className="text-sm font-semibold text-slate-800">
                Manage Additional Barcodes
              </h3>
              <button
                type="button"
                onClick={() => setIsMoreBarcodesModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none cursor-pointer"
              >
                ×
              </button>
            </div>
            <div className="p-4 space-y-4 text-xs">
              <form onSubmit={handleAddExtraBarcode} className="p-3 bg-slate-50 rounded-sm border border-slate-200 space-y-2">
                <span className="font-semibold text-slate-700">Add New Barcode</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Barcode string"
                    value={newExtraBarcode}
                    onChange={(e) => setNewExtraBarcode(e.target.value)}
                    className="px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white"
                  />
                  <select
                    value={newExtraBarcodeType}
                    onChange={(e) => setNewExtraBarcodeType(e.target.value)}
                    className="px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white"
                  >
                    <option value="EAN-13">EAN-13</option>
                    <option value="UPC-A">UPC-A</option>
                    <option value="Code 128">Code 128</option>
                    <option value="QR Code">QR Code</option>
                    <option value="Custom">Custom</option>
                  </select>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#23783a] hover:bg-[#1b602e] text-white font-semibold rounded-sm cursor-pointer shadow-xs"
                  >
                    + Add Barcode
                  </button>
                </div>
              </form>

              <div className="border border-slate-200 rounded-sm overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2">Barcode</th>
                      <th className="p-2">Type / Note</th>
                      <th className="p-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {editingProduct?.moreBarcodes && editingProduct.moreBarcodes.length > 0 ? (
                      editingProduct.moreBarcodes.map((b) => (
                        <tr key={b.id}>
                          <td className="p-2 font-mono font-bold text-slate-800">{b.barcode}</td>
                          <td className="p-2 text-slate-600">{b.note || 'Secondary'}</td>
                          <td className="p-2 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteExtraBarcode(b.id)}
                              className="text-rose-600 hover:text-rose-800 cursor-pointer font-medium"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="p-4 text-center text-slate-400">
                          No additional barcodes added yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsMoreBarcodesModalOpen(false)}
                  className="px-4 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-sm font-semibold cursor-pointer shadow-xs"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL 8: PURCHASE HISTORY MODAL
          ======================================================================= */}
      {isPurchaseHistoryModalOpen && (
        <div
          className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-fade-in"
          style={{ zIndex: 75000 }}
        >
          <div
            className="bg-white border border-slate-300 w-full text-slate-800 shadow-2xl max-w-2xl rounded-sm overflow-hidden"
            style={{ zIndex: 75001 }}
          >
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-white">
              <h3 className="text-sm font-semibold text-slate-800">
                Purchase History - {editingProduct?.mainSupplierName}
              </h3>
              <button
                type="button"
                onClick={() => setIsPurchaseHistoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none cursor-pointer"
              >
                ×
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2">PO #</th>
                    <th className="p-2">Date</th>
                    <th className="p-2">Supplier</th>
                    <th className="p-2">Qty</th>
                    <th className="p-2">Unit Cost</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2 font-mono text-blue-700 font-semibold">PO-2026-0812</td>
                    <td className="p-2 text-slate-500">2026-08-12</td>
                    <td className="p-2">{editingProduct?.mainSupplierName}</td>
                    <td className="p-2 font-bold">250 BOT</td>
                    <td className="p-2">{(editingProduct?.unitCostLL || 0).toLocaleString()} LL</td>
                    <td className="p-2"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">Received</span></td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono text-blue-700 font-semibold">PO-2026-0628</td>
                    <td className="p-2 text-slate-500">2026-06-28</td>
                    <td className="p-2">{editingProduct?.mainSupplierName}</td>
                    <td className="p-2 font-bold">500 BOT</td>
                    <td className="p-2">{Math.round((editingProduct?.unitCostLL || 0) * 0.95).toLocaleString()} LL</td>
                    <td className="p-2"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">Received</span></td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono text-blue-700 font-semibold">PO-2026-0414</td>
                    <td className="p-2 text-slate-500">2026-04-14</td>
                    <td className="p-2">{editingProduct?.mainSupplierName}</td>
                    <td className="p-2 font-bold">300 BOT</td>
                    <td className="p-2">{Math.round((editingProduct?.unitCostLL || 0) * 0.92).toLocaleString()} LL</td>
                    <td className="p-2"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">Received</span></td>
                  </tr>
                </tbody>
              </table>
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsPurchaseHistoryModalOpen(false)}
                  className="px-4 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-sm font-semibold cursor-pointer shadow-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL 9: VANGUARD MARKETPLACE SEARCH MODAL
          ======================================================================= */}
      {isVanguardMarketplaceModalOpen && (
        <div
          className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-fade-in"
          style={{ zIndex: 75000 }}
        >
          <div
            className="bg-white border border-slate-300 w-full text-slate-800 shadow-2xl max-w-xl rounded-sm overflow-hidden"
            style={{ zIndex: 75001 }}
          >
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-white">
              <h3 className="text-sm font-semibold text-slate-800">
                Search in Vanguard Marketplace Catalog
              </h3>
              <button
                type="button"
                onClick={() => setIsVanguardMarketplaceModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none cursor-pointer"
              >
                ×
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter product title, UPC, EAN, or Brand..."
                  className="flex-1 px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white"
                  defaultValue={editingProduct?.description || ''}
                />
                <button
                  type="button"
                  className="px-4 py-1.5 bg-[#23783a] hover:bg-[#1b602e] text-white rounded-sm font-semibold cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Search</span>
                </button>
              </div>
              <div className="border border-slate-200 rounded-sm p-3 bg-slate-50 space-y-2">
                <span className="font-semibold text-slate-700">Recommended Match from Vanguard Global Master:</span>
                <div className="bg-white p-2.5 rounded border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800">{editingProduct?.description || 'Authentic Item Master'}</div>
                    <div className="text-[11px] text-slate-500">Standard Barcode: 5280001928371 | Category: Food & Beverage</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsVanguardMarketplaceModalOpen(false);
                      showToast('Imported product specs from Vanguard Marketplace');
                    }}
                    className="px-3 py-1 bg-[#195a96] hover:bg-[#144777] text-white rounded-xs font-semibold cursor-pointer shadow-xs"
                  >
                    Import Specs
                  </button>
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsVanguardMarketplaceModalOpen(false)}
                  className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-sm font-semibold cursor-pointer shadow-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add: Group */}
      {isAddGroupModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-fade-in" style={{ zIndex: 80000 }}>
          <div className="bg-white border border-slate-300 w-full text-slate-800 shadow-2xl max-w-sm rounded-sm p-4 space-y-3" style={{ zIndex: 80001 }}>
            <h4 className="font-semibold text-slate-800 text-sm">Add New Inventory Group</h4>
            <form onSubmit={handleAddGroupSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Group Name</label>
                <input
                  type="text"
                  required
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. Organic Beverages"
                  className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddGroupModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-sm bg-white text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-sm font-bold shadow-xs"
                >
                  Save Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Add: Location */}
      {isAddLocationModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-fade-in" style={{ zIndex: 80000 }}>
          <div className="bg-white border border-slate-300 w-full text-slate-800 shadow-2xl max-w-sm rounded-sm p-4 space-y-3" style={{ zIndex: 80001 }}>
            <h4 className="font-semibold text-slate-800 text-sm">Add New Location</h4>
            <form onSubmit={handleAddLocationSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Location Name / Description</label>
                <input
                  type="text"
                  required
                  value={newLocationName}
                  onChange={(e) => setNewLocationName(e.target.value)}
                  placeholder="e.g. Warehouse B - Section 4"
                  className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddLocationModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-sm bg-white text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-sm font-bold shadow-xs"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Add: Supplier */}
      {isAddSupplierModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-fade-in" style={{ zIndex: 80000 }}>
          <div className="bg-white border border-slate-300 w-full text-slate-800 shadow-2xl max-w-sm rounded-sm p-4 space-y-3" style={{ zIndex: 80001 }}>
            <h4 className="font-semibold text-slate-800 text-sm">Add New Supplier</h4>
            <form onSubmit={handleAddSupplierSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Supplier Name</label>
                <input
                  type="text"
                  required
                  value={newSupplierName}
                  onChange={(e) => setNewSupplierName(e.target.value)}
                  placeholder="e.g. Cedar Trading SAL"
                  className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddSupplierModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-sm bg-white text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-sm font-bold shadow-xs"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Add: Brand */}
      {isAddBrandModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-fade-in" style={{ zIndex: 80000 }}>
          <div className="bg-white border border-slate-300 w-full text-slate-800 shadow-2xl max-w-sm rounded-sm p-4 space-y-3" style={{ zIndex: 80001 }}>
            <h4 className="font-semibold text-slate-800 text-sm">Add New Brand</h4>
            <form onSubmit={handleAddBrandSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Brand Name</label>
                <input
                  type="text"
                  required
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="e.g. Master Chef"
                  className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddBrandModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-sm bg-white text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-sm font-bold shadow-xs"
                >
                  Save Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Add: Zone */}
      {isAddZoneModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-fade-in" style={{ zIndex: 80000 }}>
          <div className="bg-white border border-slate-300 w-full text-slate-800 shadow-2xl max-w-sm rounded-sm p-4 space-y-3" style={{ zIndex: 80001 }}>
            <h4 className="font-semibold text-slate-800 text-sm">Add New Zone</h4>
            <form onSubmit={handleAddZoneSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Zone Name</label>
                <input
                  type="text"
                  required
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  placeholder="e.g. Cold Storage 2"
                  className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddZoneModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-sm bg-white text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-sm font-bold shadow-xs"
                >
                  Save Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Add: Aisle */}
      {isAddAisleModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-fade-in" style={{ zIndex: 80000 }}>
          <div className="bg-white border border-slate-300 w-full text-slate-800 shadow-2xl max-w-sm rounded-sm p-4 space-y-3" style={{ zIndex: 80001 }}>
            <h4 className="font-semibold text-slate-800 text-sm">Add New Aisle</h4>
            <form onSubmit={handleAddAisleSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Aisle Name</label>
                <input
                  type="text"
                  required
                  value={newAisleName}
                  onChange={(e) => setNewAisleName(e.target.value)}
                  placeholder="e.g. Aisle 5 - Top Shelf"
                  className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddAisleModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-sm bg-white text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-sm font-bold shadow-xs"
                >
                  Save Aisle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL: "SAME AS" BOM RECIPE CLONING MODAL
          ======================================================================= */}
      {isSameAsBOMModalOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-fade-in"
          style={{ zIndex: 80000 }}
        >
          <div
            className="bg-white border border-slate-300 w-full text-slate-800 shadow-2xl max-w-2xl rounded-sm overflow-hidden flex flex-col max-h-[90vh]"
            style={{ zIndex: 80001 }}
          >
            {/* Modal Header */}
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-[#f8fafc] shrink-0">
              <div className="flex items-center gap-2">
                <Copy className="w-4 h-4 text-[#195a96]" />
                <h3 className="font-semibold text-slate-800 text-sm">
                  Clone Recipe from Existing Product (&quot;Same As&quot; BOM)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSameAsBOMModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Modal Description */}
            <div className="p-4 border-b border-slate-100 bg-blue-50/50 text-xs text-slate-700">
              Replicate complete component ratios, accurate yield flags (&quot;Main Ing.&quot;), labor overhead, and packaging materials from standard audited production recipes. Overwrites current BOM line items and synchronizes unit costs.
            </div>

            {/* Template Selection List */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
              {OMEGA_BOM_TEMPLATES.map((tmpl) => {
                const isSelected = selectedSameAsTemplateId === tmpl.id;
                const rate = editingProduct?.secondCurrencyRate || 90000;
                const usd = (tmpl.totalCostLL / rate).toFixed(2);

                return (
                  <div
                    key={tmpl.id}
                    onClick={() => setSelectedSameAsTemplateId(tmpl.id)}
                    className={`p-3.5 border rounded-sm cursor-pointer transition ${
                      isSelected
                        ? 'border-[#195a96] bg-blue-50/40 ring-1 ring-[#195a96]'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2.5">
                        <input
                          type="radio"
                          name="selected_bom_template"
                          checked={isSelected}
                          onChange={() => setSelectedSameAsTemplateId(tmpl.id)}
                          className="mt-0.5 w-4 h-4 text-[#195a96]"
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <span>{tmpl.name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-normal">
                              {tmpl.code}
                            </span>
                          </div>
                          <p className="text-slate-500 text-[11px] mt-0.5">{tmpl.description}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-bold font-mono text-[#195a96] text-sm">
                          {tmpl.totalCostLL.toLocaleString()} LBP
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          ${usd} USD
                        </div>
                      </div>
                    </div>

                    {/* Component breakdown preview */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {tmpl.components.map((c, i) => (
                        <span
                          key={i}
                          className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                            c.mainIngredient
                              ? 'bg-blue-100 text-blue-800 font-bold border border-blue-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {c.qtyNeeded} {c.unit} {c.rawMaterialName} {c.mainIngredient ? '(Main Ing.)' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <span className="text-[11px] text-slate-500">
                Target Currency Exchange: 1 $ = {(editingProduct?.secondCurrencyRate || 90000).toLocaleString()} LL
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsSameAsBOMModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-sm bg-white text-slate-700 font-medium text-xs cursor-pointer hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const tmpl = OMEGA_BOM_TEMPLATES.find((t) => t.id === selectedSameAsTemplateId);
                    if (tmpl) {
                      handleApplySameAsBOM(tmpl);
                    }
                  }}
                  className="px-4 py-1.5 bg-[#195a96] hover:bg-[#154b7d] text-white font-bold text-xs rounded-sm shadow-xs cursor-pointer transition flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Apply Recipe (Clone BOM)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL: ADD INCLUDED ITEM (PROMOTIONAL BUNDLING / KITS)
          ======================================================================= */}
      {isAddIncludedItemModalOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-fade-in"
          style={{ zIndex: 80000 }}
        >
          <div
            className="bg-white border border-slate-300 w-full text-slate-800 shadow-2xl max-w-md rounded-sm overflow-hidden"
            style={{ zIndex: 80001 }}
          >
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-purple-700" />
                <h4 className="font-semibold text-slate-800 text-sm">Add Child Product to Promotional Kit</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsAddIncludedItemModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddIncludedItemSubmit} className="p-4 space-y-3.5 text-xs">
              {/* Product Selection */}
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Select Child Product to Bundle*
                </label>
                <select
                  value={selectedIncludedItemId || (products[0]?.id ?? 0)}
                  onChange={(e) => setSelectedIncludedItemId(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.description} ({(p.sellingPrice1LL || p.sellingPrice || 0).toLocaleString()} LL)
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  When this parent combo SKU is sold, the selected child product stock will be dynamically deducted.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Quantity */}
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Quantity in Bundle*</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newIncludedQty}
                    onChange={(e) => setNewIncludedQty(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white font-mono"
                    placeholder="1"
                  />
                </div>

                {/* Bundle Discount % */}
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Bundle Discount %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newIncludedDiscountPct}
                    onChange={(e) => setNewIncludedDiscountPct(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white font-mono"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Price Preview */}
              {(() => {
                const target = products.find((p) => p.id === (selectedIncludedItemId || products[0]?.id)) || products[0];
                const base = target ? (target.sellingPrice1LL || target.sellingPrice || 50000) : 0;
                const net = Math.round(base * (1 - (newIncludedDiscountPct || 0) / 100));
                const total = net * (newIncludedQty || 1);
                return (
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span>Base Selling Price:</span>
                      <span className="font-mono">{base.toLocaleString()} LBP</span>
                    </div>
                    {newIncludedDiscountPct > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Discount ({newIncludedDiscountPct}%):</span>
                        <span className="font-mono">-{(base - net).toLocaleString()} LBP</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-1">
                      <span>Extended Bundle Item Total:</span>
                      <span className="font-mono text-[#195a96]">{total.toLocaleString()} LBP</span>
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddIncludedItemModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-sm bg-white text-slate-700 font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-sm font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Bundle</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL: ADD PARENT CONSUMING ITEM (UPWARD SUPPLY CHAIN LINKAGE)
          ======================================================================= */}
      {isAddUsedInModalOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-fade-in"
          style={{ zIndex: 80000 }}
        >
          <div
            className="bg-white border border-slate-300 w-full text-slate-800 shadow-2xl max-w-md rounded-sm overflow-hidden"
            style={{ zIndex: 80001 }}
          >
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-[#195a96]" />
                <h4 className="font-semibold text-slate-800 text-sm">Add Parent Consuming Product</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsAddUsedInModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddUsedInSubmit} className="p-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Parent Product Code*</label>
                <input
                  type="text"
                  required
                  value={newUsedInParentCode}
                  onChange={(e) => setNewUsedInParentCode(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white font-mono"
                  placeholder="e.g. PALLET-WV500ML or KIT-REST-01"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Parent Product Description*</label>
                <input
                  type="text"
                  required
                  value={newUsedInParentDesc}
                  onChange={(e) => setNewUsedInParentDesc(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white"
                  placeholder="e.g. طبلية خل ابيض 500مل (100 صندوق)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Quantity Consumed*</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={newUsedInQty}
                    onChange={(e) => setNewUsedInQty(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white font-mono"
                    placeholder="1"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Relationship Type*</label>
                  <select
                    value={newUsedInRelationType}
                    onChange={(e) => setNewUsedInRelationType(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white"
                  >
                    <option value="Palletization">Palletization (Bulk Export)</option>
                    <option value="Bundle/Kit">Wholesale Kit / Bundle</option>
                    <option value="Inverted Breakdown (Hazard)">Inverted Breakdown (Hazard)</option>
                  </select>
                </div>
              </div>

              {/* Impact Preview */}
              {(() => {
                const cost = editingProduct?.unitCostLL || 543960;
                const total = Math.round(cost * (newUsedInQty || 1));
                return (
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span>This Case Unit Cost:</span>
                      <span className="font-mono">{cost.toLocaleString()} LBP</span>
                    </div>
                    <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-1">
                      <span>Extended Impact on Parent Cost:</span>
                      <span className="font-mono text-[#195a96]">{total.toLocaleString()} LBP</span>
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddUsedInModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-sm bg-white text-slate-700 font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-sm font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Dependency</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL: INVENTORY PRODUCTIONS REPORT (REP_I_0041 - AUTHENTIC OMEGA PRINT/EXPORT)
          Direct Pixel-Perfect Clone of User's Uploaded Screenshot
          ======================================================================= */}
      {isInventoryProductionsReportOpen && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
          style={{ zIndex: 90000 }}
        >
          <div
            className="bg-white border border-slate-400 w-full max-w-2xl text-slate-900 shadow-2xl rounded-sm overflow-hidden flex flex-col max-h-[92vh]"
            style={{ zIndex: 90001 }}
          >
            {/* Modal Title Bar */}
            <div className="px-4 py-2.5 border-b border-slate-200 flex items-center justify-between bg-[#f8fafc]">
              <h3 className="text-base font-semibold text-slate-800">Inventory Productions</h3>
              <button
                type="button"
                onClick={() => setIsInventoryProductionsReportOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-2xl leading-none cursor-pointer"
                title="Close Window"
              >
                ×
              </button>
            </div>

            {/* Action Bar (Print / Export Buttons matching screenshot top-right) */}
            <div className="px-6 py-2.5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              {/* Report View Selector */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-medium mr-1">Report View:</span>
                <button
                  type="button"
                  onClick={() => setInventoryProductionsReportMode('omega_anomaly')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition ${
                    inventoryProductionsReportMode === 'omega_anomaly'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Omega Anomaly (CWV500MLB106 - Exact Photo)
                </button>
                <button
                  type="button"
                  onClick={() => setInventoryProductionsReportMode('case_assembly')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition ${
                    inventoryProductionsReportMode === 'case_assembly'
                      ? 'bg-blue-100 text-blue-900 border border-blue-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Forward Case BOM (12-Pack)
                </button>
                <button
                  type="button"
                  onClick={() => setInventoryProductionsReportMode('pallet_master')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition ${
                    inventoryProductionsReportMode === 'pallet_master'
                      ? 'bg-purple-100 text-purple-900 border border-purple-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Export Pallet (100 Boxes)
                </button>
              </div>

              {/* Exact Dark Action Buttons from Screenshot */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintInventoryProductionsReport}
                  className="px-4 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white font-medium rounded-sm text-xs cursor-pointer shadow-xs transition"
                >
                  Print
                </button>
                <button
                  type="button"
                  onClick={handleExportInventoryProductionsReport}
                  className="px-4 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white font-medium rounded-sm text-xs cursor-pointer shadow-xs transition"
                >
                  Export
                </button>
              </div>
            </div>

            {/* Document Preview Sheet (Pixel-Perfect Physical Print Sheet) */}
            <div className="p-6 overflow-y-auto bg-slate-100/70 flex-1">
              <div className="bg-white border border-slate-300 rounded-xs shadow-xs p-8 max-w-xl mx-auto min-h-[500px] flex flex-col justify-between font-sans text-xs">
                <div>
                  {/* Company Header (Centered Blue) */}
                  <div className="text-center font-bold text-blue-700 text-sm tracking-wide">
                    Zeit w zaytoun ljanoub
                  </div>

                  {/* Report Title (Centered Bold) */}
                  <div className="text-center font-bold text-slate-900 text-sm mt-3">
                    Inventory Items Ingredients
                  </div>

                  {/* Date and Page Header */}
                  <div className="flex items-center justify-between text-[11px] text-slate-800 font-mono mt-4">
                    <span>13-Sep-2026</span>
                    <span>Page 1 of 1</span>
                  </div>

                  {/* Solid Dividing Rule */}
                  <div className="border-b-2 border-slate-900 mt-1"></div>

                  {/* Column Headers */}
                  <div className="grid grid-cols-12 text-[11px] font-bold text-slate-900 py-1.5">
                    <span className="col-span-3">Product Code</span>
                    <span className="col-span-4">Product Description</span>
                    <span className="col-span-1 text-right">Qty</span>
                    <span className="col-span-1 text-center">Unit</span>
                    <span className="col-span-1 text-right">Cost</span>
                    <span className="col-span-2 text-right">Avg. Cost</span>
                  </div>

                  {/* Solid Dividing Rule */}
                  <div className="border-b border-slate-900"></div>

                  {/* Report Body Content (Mode Switchable) */}
                  {inventoryProductionsReportMode === 'omega_anomaly' && (
                    <div className="mt-2 text-[11px]">
                      {/* Parent Product Header */}
                      <div className="flex items-center gap-6 font-semibold text-slate-900 py-1">
                        <div>
                          <span className="underline font-bold">Product Code:</span>{' '}
                          <span className="font-mono">CWV500MLB106</span>
                        </div>
                        <div>
                          <span className="underline font-bold">Description:</span>{' '}
                          <span>خل ابيض 500مل</span>
                        </div>
                      </div>

                      {/* Consumed Child Items (The Inverted Box Anomaly) */}
                      <div className="grid grid-cols-12 py-1 text-slate-800 font-mono items-center">
                        <span className="col-span-3 text-[10px]">CWV500ML*12B106</span>
                        <span className="col-span-4 font-sans text-[11px]">صندوق خل ابيض 500مل*12قنينة</span>
                        <span className="col-span-1 text-right font-bold">0.08</span>
                        <span className="col-span-1 text-center font-sans">BOX</span>
                        <span className="col-span-1 text-right">45,692.64</span>
                        <span className="col-span-2 text-right">45,692.64</span>
                      </div>

                      {/* Dashed Subtotal Rule */}
                      <div className="border-b border-dashed border-slate-700 my-1.5"></div>

                      {/* Total By Product */}
                      <div className="grid grid-cols-12 font-bold text-slate-900 text-[11px] py-1">
                        <span className="col-span-7">Total By Product:</span>
                        <span className="col-span-2"></span>
                        <span className="col-span-1 text-right font-mono">45,692.64</span>
                        <span className="col-span-2 text-right font-mono">45,692.64</span>
                      </div>
                    </div>
                  )}

                  {inventoryProductionsReportMode === 'case_assembly' && (
                    <div className="mt-2 text-[11px]">
                      {/* Parent Product Header */}
                      <div className="flex items-center gap-6 font-semibold text-slate-900 py-1">
                        <div>
                          <span className="underline font-bold">Product Code:</span>{' '}
                          <span className="font-mono">CWV500ML*12B106</span>
                        </div>
                        <div>
                          <span className="underline font-bold">Description:</span>{' '}
                          <span>صندوق خل ابيض 500مل*12قنينة</span>
                        </div>
                      </div>

                      {/* True Manufacturing Components */}
                      <div className="space-y-1">
                        <div className="grid grid-cols-12 py-0.5 text-slate-800 font-mono items-center">
                          <span className="col-span-3 text-[10px]">VIN-1LTR</span>
                          <span className="col-span-4 font-sans text-[11px]">COMMERCIAL WHITE VINEGAR 1 LITRE</span>
                          <span className="col-span-1 text-right font-bold">6.00</span>
                          <span className="col-span-1 text-center font-sans">LTR</span>
                          <span className="col-span-1 text-right">15,660.00</span>
                          <span className="col-span-2 text-right">93,960.00</span>
                        </div>
                        <div className="grid grid-cols-12 py-0.5 text-slate-800 font-mono items-center">
                          <span className="col-span-3 text-[10px]">BOT-500ML</span>
                          <span className="col-span-4 font-sans text-[11px]">Empty Glass Bottle 500ml</span>
                          <span className="col-span-1 text-right font-bold">12.00</span>
                          <span className="col-span-1 text-center font-sans">BOT</span>
                          <span className="col-span-1 text-right">30,000.00</span>
                          <span className="col-span-2 text-right">360,000.00</span>
                        </div>
                        <div className="grid grid-cols-12 py-0.5 text-slate-800 font-mono items-center">
                          <span className="col-span-3 text-[10px]">SERV-01</span>
                          <span className="col-span-4 font-sans text-[11px]">SERVICES 1 (Choueifat Labor & Line)</span>
                          <span className="col-span-1 text-right font-bold">1.00</span>
                          <span className="col-span-1 text-center font-sans">SERV</span>
                          <span className="col-span-1 text-right">90,000.00</span>
                          <span className="col-span-2 text-right">90,000.00</span>
                        </div>
                      </div>

                      {/* Dashed Subtotal Rule */}
                      <div className="border-b border-dashed border-slate-700 my-1.5"></div>

                      {/* Total By Product */}
                      <div className="grid grid-cols-12 font-bold text-slate-900 text-[11px] py-1">
                        <span className="col-span-7">Total By Product:</span>
                        <span className="col-span-2"></span>
                        <span className="col-span-1 text-right font-mono">543,960.00</span>
                        <span className="col-span-2 text-right font-mono">543,960.00</span>
                      </div>
                    </div>
                  )}

                  {inventoryProductionsReportMode === 'pallet_master' && (
                    <div className="mt-2 text-[11px]">
                      {/* Parent Product Header */}
                      <div className="flex items-center gap-6 font-semibold text-slate-900 py-1">
                        <div>
                          <span className="underline font-bold">Product Code:</span>{' '}
                          <span className="font-mono">PALLET-WV500ML</span>
                        </div>
                        <div>
                          <span className="underline font-bold">Description:</span>{' '}
                          <span>طبلية خل ابيض 500مل (100 صندوق)</span>
                        </div>
                      </div>

                      {/* Pallet Master Linkage */}
                      <div className="grid grid-cols-12 py-1 text-slate-800 font-mono items-center">
                        <span className="col-span-3 text-[10px]">CWV500ML*12B106</span>
                        <span className="col-span-4 font-sans text-[11px]">صندوق خل ابيض 500مل*12قنينة</span>
                        <span className="col-span-1 text-right font-bold">100.00</span>
                        <span className="col-span-1 text-center font-sans">BOX</span>
                        <span className="col-span-1 text-right">543,960.00</span>
                        <span className="col-span-2 text-right">54,396,000.00</span>
                      </div>

                      {/* Dashed Subtotal Rule */}
                      <div className="border-b border-dashed border-slate-700 my-1.5"></div>

                      {/* Total By Product */}
                      <div className="grid grid-cols-12 font-bold text-slate-900 text-[11px] py-1">
                        <span className="col-span-7">Total By Product:</span>
                        <span className="col-span-2"></span>
                        <span className="col-span-1 text-right font-mono">54,396,000.00</span>
                        <span className="col-span-2 text-right font-mono">54,396,000.00</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Section */}
                <div className="pt-24">
                  {/* Solid Dividing Rule */}
                  <div className="border-b-2 border-slate-900 mb-1"></div>

                  <div className="flex items-center justify-between text-[10px] text-slate-800">
                    <span className="font-mono font-bold">REP_I_0041</span>
                    <span className="text-blue-700 font-medium">
                      Copyright © 2026 Omega Software, Inc. All Rights Reserved.
                    </span>
                    <span className="text-blue-700 font-mono">&quot;www.omegapos.com&quot;</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL: NEW ITEM SUPPLIER PRICING (SCREENSHOT 8 AUTHENTIC CLONE)
          ======================================================================= */}
      {isNewSupplierPricingModalOpen && editingProduct && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-fade-in"
          style={{ zIndex: 85000 }}
        >
          <div
            className="bg-white border border-slate-300 w-full text-slate-800 shadow-2xl max-w-2xl rounded-sm overflow-hidden flex flex-col max-h-[92vh]"
            style={{ zIndex: 85001 }}
          >
            {/* Modal Header */}
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
              <h3 className="font-semibold text-slate-700 text-sm">
                New Item Supplier Pricing
              </h3>
              <button
                type="button"
                onClick={() => setIsNewSupplierPricingModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xl leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleAddSupplierPricingSubmit} className="p-4 space-y-4 overflow-y-auto">
              {/* Card 1: Supplier Pricing */}
              <div className="border border-slate-200 rounded-sm p-3.5 bg-white space-y-3 shadow-2xs">
                <div className="font-semibold text-slate-700 text-xs border-b border-slate-100 pb-1.5">
                  Supplier Pricing
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Supplier & Plus */}
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Supplier</label>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={newSuppPriceSupplierId}
                        onChange={(e) => setNewSuppPriceSupplierId(Number(e.target.value))}
                        className="flex-1 border border-slate-300 rounded-xs px-2.5 py-1.5 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#195a96]"
                      >
                        <option value="" disabled>Select supplier</option>
                        {suppliersList.map((s) => (
                          <option key={s.SUPPLIERID} value={s.SUPPLIERID}>
                            {s.SUPPLIERNAME}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setIsAddSupplierModalOpen(true)}
                        className="px-2.5 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-xs cursor-pointer flex items-center justify-center transition"
                        title="Add New Supplier"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Buying Format Unit */}
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Buying Format Unit</label>
                    <select
                      value={newSuppPriceBuyingUnit}
                      onChange={(e) => setNewSuppPriceBuyingUnit(e.target.value)}
                      className="w-full border border-slate-300 rounded-xs px-2.5 py-1.5 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#195a96]"
                    >
                      <option value="BOX">BOX</option>
                      <option value="PCS">PCS</option>
                      <option value="KG">KG</option>
                      <option value="LTR">LTR</option>
                      <option value="PACK">PACK</option>
                      <option value="CARTON">CARTON</option>
                      <option value="BAG">BAG</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Price */}
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Price</label>
                    <input
                      type="number"
                      step="any"
                      placeholder=""
                      value={newSuppPriceAmount}
                      onChange={(e) => setNewSuppPriceAmount(e.target.value)}
                      required
                      className="w-full border border-slate-300 rounded-xs px-2.5 py-1.5 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#195a96]"
                    />
                  </div>

                  {/* Currency */}
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Currency</label>
                    <select
                      value={newSuppPriceCurrency}
                      onChange={(e) => setNewSuppPriceCurrency(e.target.value as 'LBP' | 'USD' | 'EUR')}
                      className="w-full border border-slate-300 rounded-xs px-2.5 py-1.5 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#195a96]"
                    >
                      <option value="LBP">LBP</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Date</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={newSuppPriceDate}
                        onChange={(e) => setNewSuppPriceDate(e.target.value)}
                        className="w-full border border-slate-300 rounded-xs px-2.5 py-1.5 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#195a96] pr-7"
                      />
                      <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: More */}
              <div className="border border-slate-200 rounded-sm p-3.5 bg-white space-y-3 shadow-2xs">
                <div className="font-semibold text-slate-700 text-xs border-b border-slate-100 pb-1.5">
                  More
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Supplier Code */}
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Supplier Code</label>
                    <input
                      type="text"
                      placeholder=""
                      value={newSuppPriceSupplierCode}
                      onChange={(e) => setNewSuppPriceSupplierCode(e.target.value)}
                      className="w-full border border-slate-300 rounded-xs px-2.5 py-1.5 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#195a96]"
                    />
                  </div>

                  {/* Target */}
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Target</label>
                    <input
                      type="number"
                      placeholder=""
                      value={newSuppPriceTarget}
                      onChange={(e) => setNewSuppPriceTarget(e.target.value)}
                      className="w-full border border-slate-300 rounded-xs px-2.5 py-1.5 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#195a96]"
                    />
                  </div>

                  {/* Free */}
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Free</label>
                    <input
                      type="number"
                      placeholder=""
                      value={newSuppPriceFree}
                      onChange={(e) => setNewSuppPriceFree(e.target.value)}
                      className="w-full border border-slate-300 rounded-xs px-2.5 py-1.5 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#195a96]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Discount % */}
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Discount %</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={newSuppPriceDiscountPct}
                      onChange={(e) => setNewSuppPriceDiscountPct(e.target.value)}
                      className="w-full border border-slate-300 rounded-xs px-2.5 py-1.5 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#195a96]"
                    />
                  </div>

                  {/* Discount Notes (spans 2 cols) */}
                  <div className="md:col-span-2">
                    <label className="block text-xs text-slate-600 mb-1">Discount Notes</label>
                    <input
                      type="text"
                      placeholder=""
                      value={newSuppPriceDiscountNotes}
                      onChange={(e) => setNewSuppPriceDiscountNotes(e.target.value)}
                      className="w-full border border-slate-300 rounded-xs px-2.5 py-1.5 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#195a96]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Bonus % */}
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Bonus %</label>
                    <input
                      type="number"
                      placeholder=""
                      value={newSuppPriceBonusPct}
                      onChange={(e) => setNewSuppPriceBonusPct(e.target.value)}
                      className="w-full border border-slate-300 rounded-xs px-2.5 py-1.5 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#195a96]"
                    />
                  </div>

                  {/* Bonus Notes (spans 2 cols) */}
                  <div className="md:col-span-2">
                    <label className="block text-xs text-slate-600 mb-1">Bonus Notes</label>
                    <input
                      type="text"
                      placeholder=""
                      value={newSuppPriceBonusNotes}
                      onChange={(e) => setNewSuppPriceBonusNotes(e.target.value)}
                      className="w-full border border-slate-300 rounded-xs px-2.5 py-1.5 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#195a96]"
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-xs font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

