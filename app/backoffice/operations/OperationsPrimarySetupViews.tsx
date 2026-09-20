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
  Settings,
  Sliders,
  Package,
  Layers,
  Bookmark,
  Tag,
  Scale,
  MapPin,
  Users,
  Building,
  ArrowUpDown,
  FileText,
  ShieldCheck,
  Coins,
  Percent,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  RefreshCw,
  FolderTree,
  Grid,
  Check,
  Utensils,
  Store
} from 'lucide-react';
import {
  INITIAL_PRODUCTS,
  INITIAL_GROUPS,
  INITIAL_DIVISIONS,
  INITIAL_CATEGORIES,
  INITIAL_UNITS,
  INITIAL_LOCATIONS,
  INITIAL_SUPPLIERS,
  INITIAL_DEPARTMENTS,
  ProductItemRecord,
  GroupRecord,
  DivisionRecord,
  CategoryRecord,
  UnitRecord,
  LocationRecord,
  SupplierRecord,
  DepartmentRecord
} from './operationsData';
import AuthenticOmegaQuickSetupWizard from './QuickSetupWizard';
import AuthenticOmegaInventoryCategoriesView from './AuthenticOmegaInventoryCategoriesView';
import AuthenticOmegaInventoryDivisionsView from './AuthenticOmegaInventoryDivisionsView';
import AuthenticOmegaInventoryGroupsView from './AuthenticOmegaInventoryGroupsView';
import AuthenticOmegaUnitsView from './AuthenticOmegaUnitsView';
import AuthenticOmegaLocationsView from './AuthenticOmegaLocationsView';
import AuthenticOmegaSuppliersView from './AuthenticOmegaSuppliersView';
import AuthenticOmegaDepartmentsView from './AuthenticOmegaDepartmentsView';
import AuthenticOmegaProductsServicesView from './AuthenticOmegaProductsServicesView';

export type PrimarySetupSection =
  | 'quick_setup'
  | 'products_services'
  | 'groups'
  | 'divisions'
  | 'categories'
  | 'units'
  | 'locations'
  | 'suppliers'
  | 'departments';

interface OperationsPrimarySetupViewsProps {
  section: PrimarySetupSection;
}

export default function OperationsPrimarySetupViews({ section }: OperationsPrimarySetupViewsProps) {
  // Datasets
  const [products, setProducts] = useState<ProductItemRecord[]>(INITIAL_PRODUCTS);
  const [groups, setGroups] = useState<GroupRecord[]>(INITIAL_GROUPS);
  const [divisions, setDivisions] = useState<DivisionRecord[]>(INITIAL_DIVISIONS);
  const [categories, setCategories] = useState<CategoryRecord[]>(INITIAL_CATEGORIES);
  const [units, setUnits] = useState<UnitRecord[]>(INITIAL_UNITS);
  const [locations, setLocations] = useState<LocationRecord[]>(INITIAL_LOCATIONS);
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>(INITIAL_SUPPLIERS);
  const [departments, setDepartments] = useState<DepartmentRecord[]>(INITIAL_DEPARTMENTS);

  // Common UI State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [groupFilter, setGroupFilter] = useState<string>('All');
  const [gradeFilter, setGradeFilter] = useState<string>('All');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick Setup Wizard State (V-Live Restaurant vs V-Market Retail)
  const [quickSetupStep, setQuickSetupStep] = useState<number>(1);
  const [quickSetupCompleted, setQuickSetupCompleted] = useState<boolean>(false);
  const [quickSetupMode, setQuickSetupMode] = useState<'v-live' | 'v-market'>('v-live');

  // Form States
  const [newProductForm, setNewProductForm] = useState({
    code: `ITEM-${Math.floor(100 + Math.random() * 900)}`,
    barcode: `52800109${Math.floor(10000 + Math.random() * 90000)}`,
    description: 'Extra Virgin Olive Oil Reserve 1L Green Glass Bottle',
    group: 'Extra Virgin Olive Oil (EVOO)',
    division: 'Cold Pressed Premium Bottled',
    category: 'Olive Oils & Culinary Liquids',
    qtyOnHand: 450,
    unit: '750ml Bottle',
    sellingPriceSp: 18.50,
    cost: 11.20,
    buyingFormat: 'Carton of 12',
    function: 'Finished Bottled Product',
    brand: 'Southern Olive Gold Reserve',
    location: 'Beirut Central Distribution Depot'
  });

  const [newGroupForm, setNewGroupForm] = useState({
    name: 'Single Estate Cold Pressed EVOO',
    division: 'Cold Pressed Premium Bottled',
    sorting: groups.length + 1,
    tax1: 0,
    tax2: 0,
    tax3: 0,
    itemsCount: 0
  });

  const [newDivisionForm, setNewDivisionForm] = useState({
    name: 'Artisan Glassware & Decanters',
    category: 'Bottling & Packaging Consumables',
    sorting: divisions.length + 1
  });

  const [newCategoryForm, setNewCategoryForm] = useState({
    name: 'Agricultural Fertilizers & Soil Nutrients',
    linkedCategory: 'Grove Care Supplies',
    sorting: categories.length + 1
  });

  const [newUnitForm, setNewUnitForm] = useState({
    name: '250ml Dorica Slim',
    description: 'Dark UV Dorica Bottle 250ml with anti-drip insert',
    remarks: 'Gourmet gift standard packaging'
  });

  const [newLocationForm, setNewLocationForm] = useState({
    code: `LOC-${Math.floor(10 + Math.random() * 90)}`,
    name: 'Nabatieh Secondary Press Depot',
    description: 'Regional storage depot & field receiving scales',
    zone: 'South Governorate'
  });

  const [mergeLocationForm, setMergeLocationForm] = useState({
    sourceLocation: locations[0]?.name || '',
    targetLocation: locations[1]?.name || ''
  });

  const [newSupplierForm, setNewSupplierForm] = useState({
    name: 'Jabal Amel Organic Farmers Union',
    contactPerson: 'Adnan Bazzi',
    phone: '+961 7 760 341',
    grade: 'A+',
    country: 'Lebanon',
    notes: 'Certified organic certified groves in Bint Jbeil district',
    balanceUsd: 1500.00
  });

  const [newDepartmentForm, setNewDepartmentForm] = useState({
    description: 'Cold Extraction Milling Floor',
    menuType: 'Production',
    itemsCount: 8
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered Datasets
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.includes(searchQuery) ||
        p.group.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGroup = groupFilter === 'All' || p.group === groupFilter;
      return matchesSearch && matchesGroup;
    });
  }, [products, searchQuery, groupFilter]);

  const filteredGroups = useMemo(() => {
    return groups.filter(
      (g) =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.division.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [groups, searchQuery]);

  const filteredDivisions = useMemo(() => {
    return divisions.filter(
      (d) =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [divisions, searchQuery]);

  const filteredCategories = useMemo(() => {
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.linkedCategory.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  const filteredUnits = useMemo(() => {
    return units.filter(
      (u) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.remarks.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [units, searchQuery]);

  const filteredLocations = useMemo(() => {
    return locations.filter(
      (l) =>
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.zone.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [locations, searchQuery]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.country.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGrade = gradeFilter === 'All' || s.grade === gradeFilter;
      return matchesSearch && matchesGrade;
    });
  }, [suppliers, searchQuery, gradeFilter]);

  const filteredDepartments = useMemo(() => {
    return departments.filter(
      (d) =>
        d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.menuType.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [departments, searchQuery]);

  // Actions
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const newProd: ProductItemRecord = {
      id: `ITEM-0${products.length + 1}`,
      code: newProductForm.code,
      barcode: newProductForm.barcode,
      description: newProductForm.description,
      group: newProductForm.group,
      division: newProductForm.division,
      category: newProductForm.category,
      qtyOnHand: Number(newProductForm.qtyOnHand) || 0,
      unit: newProductForm.unit,
      sellingPriceSp: Number(newProductForm.sellingPriceSp) || 0,
      sellingPriceLbp: (Number(newProductForm.sellingPriceSp) || 0) * 89500,
      cost: Number(newProductForm.cost) || 0,
      costLbp: (Number(newProductForm.cost) || 0) * 89500,
      buyingFormat: newProductForm.buyingFormat,
      function: newProductForm.function,
      brand: newProductForm.brand,
      location: newProductForm.location,
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setProducts([newProd, ...products]);
    setActiveModal(null);
    showToast(`Product "${newProd.description}" added successfully!`);
  };

  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    const newGrp: GroupRecord = {
      id: `GRP-0${groups.length + 1}`,
      name: newGroupForm.name,
      division: newGroupForm.division,
      sorting: Number(newGroupForm.sorting) || groups.length + 1,
      tax1: Number(newGroupForm.tax1) || 0,
      tax2: Number(newGroupForm.tax2) || 0,
      tax3: Number(newGroupForm.tax3) || 0,
      tax4: 0,
      tax5: 0,
      tax6: 0,
      itemsCount: 0,
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10)
    };
    setGroups([...groups, newGrp]);
    setActiveModal(null);
    showToast(`Group "${newGrp.name}" created!`);
  };

  const handleAddDivision = (e: React.FormEvent) => {
    e.preventDefault();
    const newDiv: DivisionRecord = {
      id: `DIV-0${divisions.length + 1}`,
      name: newDivisionForm.name,
      category: newDivisionForm.category,
      sorting: Number(newDivisionForm.sorting) || divisions.length + 1,
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10)
    };
    setDivisions([...divisions, newDiv]);
    setActiveModal(null);
    showToast(`Division "${newDiv.name}" created!`);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const newCat: CategoryRecord = {
      id: `CAT-0${categories.length + 1}`,
      name: newCategoryForm.name,
      linkedCategory: newCategoryForm.linkedCategory,
      sorting: Number(newCategoryForm.sorting) || categories.length + 1,
      divisionsCount: 0,
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10)
    };
    setCategories([...categories, newCat]);
    setActiveModal(null);
    showToast(`Category "${newCat.name}" created!`);
  };

  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    const newU: UnitRecord = {
      id: `UNT-0${units.length + 1}`,
      name: newUnitForm.name,
      description: newUnitForm.description,
      remarks: newUnitForm.remarks
    };
    setUnits([...units, newU]);
    setActiveModal(null);
    showToast(`Unit "${newU.name}" created!`);
  };

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    const newLoc: LocationRecord = {
      id: `LOC-0${locations.length + 1}`,
      code: newLocationForm.code,
      name: newLocationForm.name,
      description: newLocationForm.description,
      zone: newLocationForm.zone
    };
    setLocations([...locations, newLoc]);
    setActiveModal(null);
    showToast(`Location "${newLoc.name}" added!`);
  };

  const handleMergeLocations = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveModal(null);
    showToast(`Locations merged: "${mergeLocationForm.sourceLocation}" into "${mergeLocationForm.targetLocation}"`);
  };

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    const newSup: SupplierRecord = {
      id: `SUP-0${suppliers.length + 1}`,
      name: newSupplierForm.name,
      contactPerson: newSupplierForm.contactPerson,
      phone: newSupplierForm.phone,
      grade: newSupplierForm.grade,
      country: newSupplierForm.country,
      notes: newSupplierForm.notes,
      balanceUsd: Number(newSupplierForm.balanceUsd) || 0,
      balanceLbp: (Number(newSupplierForm.balanceUsd) || 0) * 89500,
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10)
    };
    setSuppliers([...suppliers, newSup]);
    setActiveModal(null);
    showToast(`Supplier "${newSup.name}" created!`);
  };

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    const newDept: DepartmentRecord = {
      id: `DEP-0${departments.length + 1}`,
      description: newDepartmentForm.description,
      menuType: newDepartmentForm.menuType,
      itemsCount: Number(newDepartmentForm.itemsCount) || 0
    };
    setDepartments([...departments, newDept]);
    setActiveModal(null);
    showToast(`Department "${newDept.description}" created!`);
  };

  const handleExport = () => {
    let data: any = [];
    if (section === 'products_services') data = products;
    if (section === 'groups') data = groups;
    if (section === 'divisions') data = divisions;
    if (section === 'categories') data = categories;
    if (section === 'units') data = units;
    if (section === 'locations') data = locations;
    if (section === 'suppliers') data = suppliers;
    if (section === 'departments') data = departments;

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vanguard_setup_${section}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    showToast(`Exported ${section} configurations!`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
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
          VIEW 1: QUICK SETUP (100% AUTHENTIC OMEGA CLOUDPOS ONBOARDING WIZARD)
          ========================================================================= */}
      {section === 'quick_setup' && <AuthenticOmegaQuickSetupWizard />}

      {/* =========================================================================
          VIEW 5: INVENTORY CATEGORIES (100% AUTHENTIC OMEGA CLONED VIEW)
          ========================================================================= */}
      {section === 'categories' && <AuthenticOmegaInventoryCategoriesView />}

      {/* =========================================================================
          VIEW 4: INVENTORY DIVISIONS (100% AUTHENTIC OMEGA CLONED VIEW)
          ========================================================================= */}
      {section === 'divisions' && <AuthenticOmegaInventoryDivisionsView />}

      {/* =========================================================================
          VIEW 3: INVENTORY GROUPS (100% AUTHENTIC OMEGA CLONED VIEW)
          ========================================================================= */}
      {section === 'groups' && <AuthenticOmegaInventoryGroupsView />}

      {/* =========================================================================
          VIEW 6: UNITS (100% AUTHENTIC OMEGA CLONED VIEW)
          ========================================================================= */}
      {section === 'units' && <AuthenticOmegaUnitsView />}

      {/* =========================================================================
          VIEW 7: LOCATIONS (100% AUTHENTIC OMEGA CLONED VIEW)
          ========================================================================= */}
      {section === 'locations' && <AuthenticOmegaLocationsView />}

      {/* =========================================================================
          VIEW 8: SUPPLIERS (100% AUTHENTIC OMEGA CLONED VIEW)
          ========================================================================= */}
      {section === 'suppliers' && <AuthenticOmegaSuppliersView />}

      {/* =========================================================================
          VIEW 9: DEPARTMENTS (100% AUTHENTIC OMEGA CLONED VIEW)
          ========================================================================= */}
      {section === 'departments' && <AuthenticOmegaDepartmentsView />}

      {/* =========================================================================
          VIEW 1: PRODUCTS & SERVICES (100% AUTHENTIC OMEGA CLONED VIEW)
          ========================================================================= */}
      {section === 'products_services' && <AuthenticOmegaProductsServicesView />}

      {/* =========================================================================
          COMMON TOOLBAR FOR TABULAR SECTIONS
          ========================================================================= */}
      {section !== 'quick_setup' && section !== 'categories' && section !== 'divisions' && section !== 'groups' && section !== 'units' && section !== 'locations' && section !== 'suppliers' && section !== 'departments' && section !== 'products_services' && (
        <div className="bg-white border border-slate-200 p-5 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-primary border border-blue-200">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 capitalize">
                Inventory Catalog
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Omega ERP System Setup • Southern Olive Oil Products S.A.R.L
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleExport}
              title="Export JSON"
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* (Legacy products table replaced by AuthenticOmegaProductsServicesView) */}

      {/* (Legacy groups table replaced by AuthenticOmegaInventoryGroupsView) */}

      {/* (Legacy units table replaced by AuthenticOmegaUnitsView) */}

      {/* (Legacy locations table replaced by AuthenticOmegaLocationsView) */}

      {/* (Legacy suppliers table replaced by AuthenticOmegaSuppliersView) */}

      {/* (Legacy departments table replaced by AuthenticOmegaDepartmentsView) */}

      {/* =========================================================================
          MODALS FOR CREATING RECORDS
          ========================================================================= */}
      {/* MODAL: NEW PRODUCT */}
      {activeModal === 'new_product' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 w-full text-slate-800 shadow-2xl max-w-2xl rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Package className="w-5 h-5" />
                <span>Add New Product &amp; Service</span>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Item Code *</label>
                  <input
                    type="text"
                    required
                    value={newProductForm.code}
                    onChange={(e) => setNewProductForm({ ...newProductForm, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-xs focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Barcode</label>
                  <input
                    type="text"
                    value={newProductForm.barcode}
                    onChange={(e) => setNewProductForm({ ...newProductForm, barcode: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-xs focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Description *</label>
                <input
                  type="text"
                  required
                  value={newProductForm.description}
                  onChange={(e) => setNewProductForm({ ...newProductForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Group *</label>
                  <select
                    value={newProductForm.group}
                    onChange={(e) => setNewProductForm({ ...newProductForm, group: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                  >
                    {groups.map((g) => (
                      <option key={g.id} value={g.name}>{g.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Unit</label>
                  <select
                    value={newProductForm.unit}
                    onChange={(e) => setNewProductForm({ ...newProductForm, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.name}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Initial Qty OH</label>
                  <input
                    type="number"
                    value={newProductForm.qtyOnHand}
                    onChange={(e) => setNewProductForm({ ...newProductForm, qtyOnHand: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Selling Price ($ USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProductForm.sellingPriceSp}
                    onChange={(e) => setNewProductForm({ ...newProductForm, sellingPriceSp: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Unit Cost ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProductForm.cost}
                    onChange={(e) => setNewProductForm({ ...newProductForm, cost: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NEW GROUP */}
      {activeModal === 'new_group' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 w-full text-slate-800 shadow-2xl max-w-md rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Layers className="w-5 h-5" />
                <span>Create Inventory Group</span>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddGroup} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Group Name *</label>
                <input
                  type="text"
                  required
                  value={newGroupForm.name}
                  onChange={(e) => setNewGroupForm({ ...newGroupForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Division *</label>
                <select
                  value={newGroupForm.division}
                  onChange={(e) => setNewGroupForm({ ...newGroupForm, division: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                >
                  {divisions.map((d) => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Tax 1 (%)</label>
                  <input
                    type="number"
                    value={newGroupForm.tax1}
                    onChange={(e) => setNewGroupForm({ ...newGroupForm, tax1: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Sorting</label>
                  <input
                    type="number"
                    value={newGroupForm.sorting}
                    onChange={(e) => setNewGroupForm({ ...newGroupForm, sorting: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs"
                >
                  Save Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NEW DIVISION */}
      {activeModal === 'new_division' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 w-full text-slate-800 shadow-2xl max-w-md rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Bookmark className="w-5 h-5" />
                <span>Create Inventory Division</span>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddDivision} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Division Name *</label>
                <input
                  type="text"
                  required
                  value={newDivisionForm.name}
                  onChange={(e) => setNewDivisionForm({ ...newDivisionForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Category *</label>
                <select
                  value={newDivisionForm.category}
                  onChange={(e) => setNewDivisionForm({ ...newDivisionForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Sorting Index</label>
                <input
                  type="number"
                  value={newDivisionForm.sorting}
                  onChange={(e) => setNewDivisionForm({ ...newDivisionForm, sorting: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono"
                />
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs"
                >
                  Save Division
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NEW CATEGORY */}
      {activeModal === 'new_category' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 w-full text-slate-800 shadow-2xl max-w-md rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Tag className="w-5 h-5" />
                <span>Create Inventory Category</span>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddCategory} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={newCategoryForm.name}
                  onChange={(e) => setNewCategoryForm({ ...newCategoryForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Linked Category</label>
                <input
                  type="text"
                  value={newCategoryForm.linkedCategory}
                  onChange={(e) => setNewCategoryForm({ ...newCategoryForm, linkedCategory: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Sorting Index</label>
                <input
                  type="number"
                  value={newCategoryForm.sorting}
                  onChange={(e) => setNewCategoryForm({ ...newCategoryForm, sorting: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono"
                />
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NEW UNIT */}
      {activeModal === 'new_unit' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 w-full text-slate-800 shadow-2xl max-w-md rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Scale className="w-5 h-5" />
                <span>Create Unit of Measure</span>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddUnit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Unit Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 500ml Bottle"
                  value={newUnitForm.name}
                  onChange={(e) => setNewUnitForm({ ...newUnitForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Description</label>
                <input
                  type="text"
                  value={newUnitForm.description}
                  onChange={(e) => setNewUnitForm({ ...newUnitForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Remarks</label>
                <input
                  type="text"
                  value={newUnitForm.remarks}
                  onChange={(e) => setNewUnitForm({ ...newUnitForm, remarks: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs"
                >
                  Save Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NEW LOCATION */}
      {activeModal === 'new_location' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 w-full text-slate-800 shadow-2xl max-w-md rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-bold">
                <MapPin className="w-5 h-5" />
                <span>Create Location / Warehouse</span>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddLocation} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Location Code *</label>
                  <input
                    type="text"
                    required
                    value={newLocationForm.code}
                    onChange={(e) => setNewLocationForm({ ...newLocationForm, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Zone</label>
                  <input
                    type="text"
                    value={newLocationForm.zone}
                    onChange={(e) => setNewLocationForm({ ...newLocationForm, zone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Location Name *</label>
                <input
                  type="text"
                  required
                  value={newLocationForm.name}
                  onChange={(e) => setNewLocationForm({ ...newLocationForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Description</label>
                <input
                  type="text"
                  value={newLocationForm.description}
                  onChange={(e) => setNewLocationForm({ ...newLocationForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MERGE LOCATIONS */}
      {activeModal === 'merge_locations' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 w-full text-slate-800 shadow-2xl max-w-md rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-600 font-bold">
                <RefreshCw className="w-5 h-5" />
                <span>Merge Locations (Omega ERP Authentic)</span>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleMergeLocations} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px]">
                Merging will re-point all historical movements, physical inventory, and transactions from the Source Location to the Destination Location.
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Source Location *</label>
                <select
                  value={mergeLocationForm.sourceLocation}
                  onChange={(e) => setMergeLocationForm({ ...mergeLocationForm, sourceLocation: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                >
                  {locations.map((l) => (
                    <option key={l.id} value={l.name}>{l.name} ({l.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Destination Location *</label>
                <select
                  value={mergeLocationForm.targetLocation}
                  onChange={(e) => setMergeLocationForm({ ...mergeLocationForm, targetLocation: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                >
                  {locations.map((l) => (
                    <option key={l.id} value={l.name}>{l.name} ({l.code})</option>
                  ))}
                </select>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                >
                  Confirm Merge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NEW SUPPLIER */}
      {activeModal === 'new_supplier' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 w-full text-slate-800 shadow-2xl max-w-md rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Users className="w-5 h-5" />
                <span>Create Supplier &amp; Vendor</span>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSupplier} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Supplier Name *</label>
                <input
                  type="text"
                  required
                  value={newSupplierForm.name}
                  onChange={(e) => setNewSupplierForm({ ...newSupplierForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={newSupplierForm.contactPerson}
                    onChange={(e) => setNewSupplierForm({ ...newSupplierForm, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Phone</label>
                  <input
                    type="text"
                    value={newSupplierForm.phone}
                    onChange={(e) => setNewSupplierForm({ ...newSupplierForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Grade</label>
                  <select
                    value={newSupplierForm.grade}
                    onChange={(e) => setNewSupplierForm({ ...newSupplierForm, grade: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                  >
                    <option value="A+">A+ (Premium Certified)</option>
                    <option value="A">A (Standard)</option>
                    <option value="B">B (Secondary)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Country</label>
                  <input
                    type="text"
                    value={newSupplierForm.country}
                    onChange={(e) => setNewSupplierForm({ ...newSupplierForm, country: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Opening Balance ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newSupplierForm.balanceUsd}
                  onChange={(e) => setNewSupplierForm({ ...newSupplierForm, balanceUsd: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={newSupplierForm.notes}
                  onChange={(e) => setNewSupplierForm({ ...newSupplierForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NEW DEPARTMENT */}
      {activeModal === 'new_department' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 w-full text-slate-800 shadow-2xl max-w-md rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Building className="w-5 h-5" />
                <span>Create Menu / Department</span>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddDepartment} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Description / Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bottling & Packaging Line"
                  value={newDepartmentForm.description}
                  onChange={(e) => setNewDepartmentForm({ ...newDepartmentForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Menu Type</label>
                <select
                  value={newDepartmentForm.menuType}
                  onChange={(e) => setNewDepartmentForm({ ...newDepartmentForm, menuType: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                >
                  <option value="Production">Production</option>
                  <option value="Packaging">Packaging</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Retail">Retail</option>
                  <option value="Distribution">Distribution</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Items Count</label>
                <input
                  type="number"
                  value={newDepartmentForm.itemsCount}
                  onChange={(e) => setNewDepartmentForm({ ...newDepartmentForm, itemsCount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-xs"
                />
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
