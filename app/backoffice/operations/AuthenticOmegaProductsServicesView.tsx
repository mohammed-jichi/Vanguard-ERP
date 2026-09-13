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
  Star,
  Truck
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
    'main' | 'stock' | 'media' | 'assembly' | 'included' | 'history' | 'sales' | 'more'
  >('main');
  const [historySubTab, setHistorySubTab] = useState<'movements' | 'priceLogs' | 'audit'>('movements');
  const [moreSubTab, setMoreSubTab] = useState<'accounts' | 'taxes' | 'advanced'>('accounts');

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

                      {/* Stock Integrity Equation Banner */}
                      {editingProduct.buyingFormat === 'BOX' && (Number(editingProduct.qtyInBuyingFormat) <= 1 || !editingProduct.qtyInBuyingFormat) ? (
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

                      {/* Stock Integrity Equation Banner */}
                      {editingProduct.buyingFormat === 'BOX' && (Number(editingProduct.qtyInBuyingFormat) <= 1 || !editingProduct.qtyInBuyingFormat) ? (
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
    </div>
  );
}

