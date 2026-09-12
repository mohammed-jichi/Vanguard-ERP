'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  ChevronDown,
  Edit,
  Trash2,
  Save,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Sliders,
  BookOpen,
  Info
} from 'lucide-react';
import {
  InventoryDivisionItem,
  DivisionCategoryOption,
  INITIAL_OMEGA_INV_DIVISIONS,
  OMEGA_DIVISION_CATEGORIES
} from '@/lib/omegaInventoryDivisionData';
import { InventoryCategoryItem } from '@/lib/omegaInventoryCategoryData';

export default function AuthenticOmegaInventoryDivisionsView() {
  // ---------------------------------------------------------------------------
  // Categories State (synced with localStorage)
  // ---------------------------------------------------------------------------
  const [categories, setCategories] = useState<DivisionCategoryOption[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCats = localStorage.getItem('vanguard_omega_inv_categories');
        if (savedCats) {
          const parsed = JSON.parse(savedCats) as InventoryCategoryItem[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((c) => ({
              CATEGORYID: c.CATEGORYID || c.ID,
              CATEGORYNAME: c.CATEGORYNAME
            }));
          }
        }
      } catch (e) {
        console.error('Error reading saved categories:', e);
      }
    }
    return OMEGA_DIVISION_CATEGORIES;
  });

  // ---------------------------------------------------------------------------
  // Divisions State (synced with localStorage)
  // ---------------------------------------------------------------------------
  const [divisions, setDivisions] = useState<InventoryDivisionItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('vanguard_omega_inv_divisions');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.error('Error reading saved divisions:', e);
      }
    }
    return INITIAL_OMEGA_INV_DIVISIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('vanguard_omega_inv_divisions', JSON.stringify(divisions));
    } catch (e) {
      console.error('Failed to persist divisions:', e);
    }
  }, [divisions]);

  // ---------------------------------------------------------------------------
  // Filters & Sorting
  // ---------------------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortField, setSortField] = useState<'DIVISIONNAME' | 'CATEGORYNAME' | 'SORTING' | 'CREATED_AT' | 'UPDATED_AT'>('CATEGORYNAME');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Actions dropdown
  const [actionsOpen, setActionsOpen] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [isSortingModalOpen, setIsSortingModalOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  // Editing division item
  const [editingDivision, setEditingDivision] = useState<InventoryDivisionItem | null>(null);

  // Forms
  const [newDivisionForm, setNewDivisionForm] = useState({
    name: '',
    categoryName: 'Raw Materials',
    categoryId: 6,
    sorting: 1,
    secondLang: '',
    image: ''
  });

  const [editDivisionForm, setEditDivisionForm] = useState({
    id: 0,
    divisionId: 0,
    name: '',
    categoryName: 'Raw Materials',
    categoryId: 6,
    sorting: 1,
    secondLang: '',
    image: ''
  });

  // New Category on the fly form (opened via + button)
  const [quickCategoryForm, setQuickCategoryForm] = useState({
    name: '',
    secondLang: '',
    sorting: 1,
    image: ''
  });

  // Edit Category form (opened via Edit pen button next to Category*)
  const [editCategoryForm, setEditCategoryForm] = useState({
    id: 0,
    categoryId: 0,
    name: '',
    secondLang: '',
    sorting: 1,
    image: ''
  });

  // Sorting modal items
  const [sortingItems, setSortingItems] = useState<{ id: number; name: string; sorting: number }[]>([]);

  // Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Close Actions on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setActionsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ---------------------------------------------------------------------------
  // Filtered and Sorted Divisions
  // ---------------------------------------------------------------------------
  const filteredDivisions = divisions.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.DIVISIONNAME.toLowerCase().includes(q) ||
      (item.ADIVISIONNAME && item.ADIVISIONNAME.toLowerCase().includes(q)) ||
      item.CATEGORYNAME.toLowerCase().includes(q) ||
      item.SORTING.toString().includes(q);

    const matchesCat =
      selectedCategory === 'All Categories' ||
      item.CATEGORYNAME === selectedCategory;

    return matchesSearch && matchesCat;
  }).sort((a, b) => {
    let comparison = 0;
    if (sortField === 'DIVISIONNAME') {
      comparison = a.DIVISIONNAME.localeCompare(b.DIVISIONNAME);
    } else if (sortField === 'CATEGORYNAME') {
      comparison = a.CATEGORYNAME.localeCompare(b.CATEGORYNAME);
    } else if (sortField === 'SORTING') {
      comparison = a.SORTING - b.SORTING;
    } else if (sortField === 'CREATED_AT') {
      comparison = new Date(a.CREATED_AT).getTime() - new Date(b.CREATED_AT).getTime();
    } else if (sortField === 'UPDATED_AT') {
      comparison = new Date(a.UPDATED_AT).getTime() - new Date(b.UPDATED_AT).getTime();
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const toggleSort = (field: 'DIVISIONNAME' | 'CATEGORYNAME' | 'SORTING' | 'CREATED_AT' | 'UPDATED_AT') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // ---------------------------------------------------------------------------
  // Open New Division Modal
  // ---------------------------------------------------------------------------
  const handleOpenNew = () => {
    const maxSort = divisions.reduce((max, d) => Math.max(max, d.SORTING || 0), 0);
    const defaultCat = categories.length > 0 ? categories[0].CATEGORYNAME : 'Raw Materials';
    const defaultCatId = categories.length > 0 ? categories[0].CATEGORYID : 6;
    setNewDivisionForm({
      name: '',
      categoryName: defaultCat,
      categoryId: defaultCatId,
      sorting: maxSort + 1,
      secondLang: '',
      image: ''
    });
    setIsNewModalOpen(true);
  };

  // ---------------------------------------------------------------------------
  // Open Edit Division Modal
  // ---------------------------------------------------------------------------
  const handleOpenEdit = (item: InventoryDivisionItem) => {
    setEditingDivision(item);
    setEditDivisionForm({
      id: item.ID,
      divisionId: item.DIVISIONID,
      name: item.DIVISIONNAME,
      categoryName: item.CATEGORYNAME,
      categoryId: item.CATEGORYID,
      sorting: item.SORTING,
      secondLang: item.ADIVISIONNAME || '',
      image: item.PIC || ''
    });
    setIsEditModalOpen(true);
  };

  // ---------------------------------------------------------------------------
  // Save New Division
  // ---------------------------------------------------------------------------
  const handleSaveNewDivision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDivisionForm.name.trim()) {
      showToast('Division Name is required', 'error');
      return;
    }

    const exists = divisions.some(
      (d) => d.DIVISIONNAME.trim().toLowerCase() === newDivisionForm.name.trim().toLowerCase()
    );
    if (exists) {
      showToast('This Division already exists, Please choose another name', 'error');
      return;
    }

    const todayStr = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date());

    const nextId = Math.max(0, ...divisions.map((d) => d.ID)) + 1;
    const nextDivId = Math.max(0, ...divisions.map((d) => d.DIVISIONID)) + 1;

    const newDiv: InventoryDivisionItem = {
      ID: nextId,
      DIVISIONID: nextDivId,
      BRAND_ID: 9606,
      BRANCHID: 1,
      DIVISIONNAME: newDivisionForm.name.trim(),
      ADIVISIONNAME: newDivisionForm.secondLang.trim() || null,
      CATEGORYID: newDivisionForm.categoryId,
      CATEGORYNAME: newDivisionForm.categoryName,
      SORTING: Number(newDivisionForm.sorting) || 1,
      PIC: newDivisionForm.image || null,
      PLU: null,
      CREATED_AT: todayStr,
      UPDATED_AT: todayStr,
      UPDATED_BY: 1
    };

    setDivisions([newDiv, ...divisions]);
    setIsNewModalOpen(false);
    showToast('Division saved', 'success');
  };

  // ---------------------------------------------------------------------------
  // Save Edit Division
  // ---------------------------------------------------------------------------
  const handleSaveEditDivision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDivision) return;
    if (!editDivisionForm.name.trim()) {
      showToast('Division Name is required', 'error');
      return;
    }

    const exists = divisions.some(
      (d) =>
        d.ID !== editingDivision.ID &&
        d.DIVISIONNAME.trim().toLowerCase() === editDivisionForm.name.trim().toLowerCase()
    );
    if (exists) {
      showToast('This Division already exists, Please choose another name', 'error');
      return;
    }

    const todayStr = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date());

    const updated = divisions.map((d) => {
      if (d.ID === editingDivision.ID) {
        return {
          ...d,
          DIVISIONNAME: editDivisionForm.name.trim(),
          ADIVISIONNAME: editDivisionForm.secondLang.trim() || null,
          CATEGORYID: editDivisionForm.categoryId,
          CATEGORYNAME: editDivisionForm.categoryName,
          SORTING: Number(editDivisionForm.sorting) || d.SORTING,
          PIC: editDivisionForm.image || null,
          UPDATED_AT: todayStr
        };
      }
      return d;
    });

    setDivisions(updated);
    setIsEditModalOpen(false);
    showToast('Division saved', 'success');
  };

  // ---------------------------------------------------------------------------
  // Delete Division
  // ---------------------------------------------------------------------------
  const handleDeleteDivision = (item: InventoryDivisionItem) => {
    if (window.confirm(`Are you sure you want to delete division "${item.DIVISIONNAME}"?`)) {
      setDivisions(divisions.filter((d) => d.ID !== item.ID));
      showToast('Division deleted', 'success');
    }
  };

  // ---------------------------------------------------------------------------
  // Quick Add Category (triggered by + button next to Category*)
  // ---------------------------------------------------------------------------
  const handleOpenQuickAddCategory = () => {
    const maxSort = categories.length + 1;
    setQuickCategoryForm({
      name: '',
      secondLang: '',
      sorting: maxSort,
      image: ''
    });
    setIsNewCategoryModalOpen(true);
  };

  const handleSaveQuickCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCategoryForm.name.trim()) {
      showToast('Category description is required', 'error');
      return;
    }

    const catName = quickCategoryForm.name.trim();
    const nextCatId = Math.max(0, ...categories.map((c) => c.CATEGORYID)) + 1;
    const newCatOption: DivisionCategoryOption = {
      CATEGORYID: nextCatId,
      CATEGORYNAME: catName
    };

    // Update categories state
    const updatedCats = [...categories, newCatOption];
    setCategories(updatedCats);

    // Also update vanguard_omega_inv_categories in localStorage if present
    try {
      const todayStr = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).format(new Date());

      const saved = localStorage.getItem('vanguard_omega_inv_categories');
      const list = saved ? JSON.parse(saved) : [];
      const newCatItem: InventoryCategoryItem = {
        ID: nextCatId,
        CATEGORYID: nextCatId,
        BRAND_ID: 9606,
        BRANCHID: 1,
        CATEGORYNAME: catName,
        ACATEGORYNAME: quickCategoryForm.secondLang.trim() || null,
        PIC: quickCategoryForm.image || null,
        SORTING: Number(quickCategoryForm.sorting) || nextCatId,
        MENUID: 0,
        CATEGORYLINKID: 1,
        PURCHASE_ACCOUNT: '',
        WASTAGE_ACCOUNT: '',
        ADJUSTMENT_ACCOUNT: '',
        EMPLOYEESMEALS_ACCOUNT: '',
        FREEITEMS_ACCOUNT: '',
        PLU: null,
        CREATED_AT: todayStr,
        UPDATED_AT: todayStr,
        UPDATED_BY: 1,
        OMEGA_ID: null,
        CATEGORYLINKEDNAME: 'General'
      };
      localStorage.setItem('vanguard_omega_inv_categories', JSON.stringify([newCatItem, ...list]));
    } catch (e) {
      console.error('Failed to sync new category to storage:', e);
    }

    // Automatically select newly created category in the active division modal
    if (isNewModalOpen) {
      setNewDivisionForm((prev) => ({
        ...prev,
        categoryName: catName,
        categoryId: nextCatId
      }));
    } else if (isEditModalOpen) {
      setEditDivisionForm((prev) => ({
        ...prev,
        categoryName: catName,
        categoryId: nextCatId
      }));
    }

    setIsNewCategoryModalOpen(false);
    showToast('Category saved', 'success');
  };

  // ---------------------------------------------------------------------------
  // Edit Category (triggered by Edit pen button next to Category*)
  // ---------------------------------------------------------------------------
  const handleOpenEditCategory = (catIdOrName: number | string) => {
    let cat = categories.find((c) => c.CATEGORYID === catIdOrName || c.CATEGORYNAME === catIdOrName);
    if (!cat && categories.length > 0) cat = categories[0];
    if (!cat) return;

    let secondLang = '';
    let sortNum = 1;
    let pic = '';
    try {
      const saved = localStorage.getItem('vanguard_omega_inv_categories');
      if (saved) {
        const list = JSON.parse(saved);
        const detailed = list.find((it: any) => it.CATEGORYID === cat!.CATEGORYID || it.CATEGORYNAME === cat!.CATEGORYNAME);
        if (detailed) {
          secondLang = detailed.ACATEGORYNAME || '';
          sortNum = detailed.SORTING || 1;
          pic = detailed.PIC || '';
        }
      }
    } catch (e) {
      console.error(e);
    }

    setEditCategoryForm({
      id: cat.CATEGORYID,
      categoryId: cat.CATEGORYID,
      name: cat.CATEGORYNAME,
      secondLang,
      sorting: sortNum,
      image: pic
    });
    setIsEditCategoryModalOpen(true);
  };

  const handleSaveEditCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCategoryForm.name.trim()) {
      showToast('Category description is required', 'error');
      return;
    }

    const newName = editCategoryForm.name.trim();
    const oldName = categories.find((c) => c.CATEGORYID === editCategoryForm.categoryId)?.CATEGORYNAME;

    // Update categories
    setCategories((prev) =>
      prev.map((c) =>
        c.CATEGORYID === editCategoryForm.categoryId
          ? { ...c, CATEGORYNAME: newName }
          : c
      )
    );

    // Update divisions referencing this category name
    if (oldName && oldName !== newName) {
      setDivisions((prev) =>
        prev.map((d) =>
          d.CATEGORYID === editCategoryForm.categoryId || d.CATEGORYNAME === oldName
            ? { ...d, CATEGORYNAME: newName }
            : d
        )
      );
      if (newDivisionForm.categoryName === oldName) {
        setNewDivisionForm((prev) => ({ ...prev, categoryName: newName }));
      }
      if (editDivisionForm.categoryName === oldName) {
        setEditDivisionForm((prev) => ({ ...prev, categoryName: newName }));
      }
    }

    // Update localStorage for vanguard_omega_inv_categories
    try {
      const saved = localStorage.getItem('vanguard_omega_inv_categories');
      if (saved) {
        const list = JSON.parse(saved);
        const updated = list.map((it: any) => {
          if (it.CATEGORYID === editCategoryForm.categoryId || it.CATEGORYNAME === oldName) {
            return {
              ...it,
              CATEGORYNAME: newName,
              ACATEGORYNAME: editCategoryForm.secondLang.trim() || null,
              SORTING: Number(editCategoryForm.sorting) || 1,
              PIC: editCategoryForm.image || null
            };
          }
          return it;
        });
        localStorage.setItem('vanguard_omega_inv_categories', JSON.stringify(updated));
      }
    } catch (e) {
      console.error(e);
    }

    setIsEditCategoryModalOpen(false);
    showToast('Category saved', 'success');
  };

  // ---------------------------------------------------------------------------
  // Sorting Modal Handlers
  // ---------------------------------------------------------------------------
  const handleOpenSorting = () => {
    setActionsOpen(false);
    const items = divisions
      .map((d) => ({ id: d.ID, name: d.DIVISIONNAME, sorting: d.SORTING }))
      .sort((a, b) => a.sorting - b.sorting);
    setSortingItems(items);
    setIsSortingModalOpen(true);
  };

  const adjustSortingItem = (id: number, delta: number) => {
    setSortingItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newSort = Math.max(1, item.sorting + delta);
          return { ...item, sorting: newSort };
        }
        return item;
      })
    );
  };

  const handleSaveSorting = () => {
    const sortMap = new Map(sortingItems.map((item) => [item.id, item.sorting]));
    const updated = divisions.map((d) => {
      if (sortMap.has(d.ID)) {
        return { ...d, SORTING: sortMap.get(d.ID)! };
      }
      return d;
    });
    setDivisions(updated);
    setIsSortingModalOpen(false);
    showToast('Sorting Saved Successfully', 'success');
  };

  // ---------------------------------------------------------------------------
  // Image Upload helper
  // ---------------------------------------------------------------------------
  const handleImageUpload = (target: 'new' | 'edit' | 'category' | 'category_edit') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (loadEvt) => {
          const result = loadEvt.target?.result as string;
          if (target === 'new') {
            setNewDivisionForm((prev) => ({ ...prev, image: result }));
          } else if (target === 'edit') {
            setEditDivisionForm((prev) => ({ ...prev, image: result }));
          } else if (target === 'category') {
            setQuickCategoryForm((prev) => ({ ...prev, image: result }));
          } else if (target === 'category_edit') {
            setEditCategoryForm((prev) => ({ ...prev, image: result }));
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className="w-full bg-[#f8fafc] text-slate-800 font-sans min-h-[600px] p-2 sm:p-4">
      {/* Toast alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-xl text-white border text-sm font-semibold transition-all ${
            toastMessage.type === 'success'
              ? 'bg-[#1e7e34] border-[#1c7430]'
              : 'bg-[#bd2130] border-[#b21f2d]'
          }`}
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* =========================================================================
          AUTHENTIC OMEGA HEADER & BREADCRUMB
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-200 gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1f2d3d] tracking-tight">
            Inventory Divisions
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <a href="#home" className="text-[#0d6efd] hover:underline">
              Home
            </a>
            <span>/</span>
            <span className="text-slate-600 font-medium">Inventory Divisions</span>
          </div>
        </div>

        <div>
          <button
            onClick={() => setIsTutorialOpen(true)}
            className="text-xs text-[#0d6efd] hover:underline font-semibold flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Watch Tutorial
          </button>
        </div>
      </div>

      {/* =========================================================================
          TOOLBAR: SEARCH BAR, ALL CATEGORIES DROPDOWN, +NEW, ACTIONS
          ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-md p-3 mb-4 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left search & category dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-800 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#2b3940] focus:ring-1 focus:ring-[#2b3940] transition"
              />
            </div>

            {/* All Categories Dropdown Filter */}
            <div className="w-full sm:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-1.5 text-xs text-slate-700 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#2b3940] cursor-pointer"
              >
                <option value="All Categories">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.CATEGORYID} value={cat.CATEGORYNAME}>
                    {cat.CATEGORYNAME}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right action buttons (+ New and Actions dropdown) */}
          <div className="flex items-center gap-2 self-end lg:self-center">
            {/* + New Button */}
            <button
              onClick={handleOpenNew}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#2b3940] hover:bg-[#1f2937] text-white text-xs font-semibold rounded shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New</span>
            </button>

            {/* Actions Dropdown (ONLY SORTING) */}
            <div className="relative" ref={actionsRef}>
              <button
                onClick={() => setActionsOpen(!actionsOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2b3940] hover:bg-[#1f2937] text-white text-xs font-semibold rounded shadow-xs transition"
              >
                <span>Actions</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {actionsOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded shadow-lg py-1 z-30 animate-in fade-in zoom-in-95 duration-100 text-xs">
                  <button
                    onClick={handleOpenSorting}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-slate-700 hover:bg-slate-100 font-medium"
                  >
                    <Sliders className="w-3.5 h-3.5 text-slate-500" />
                    <span>Sorting</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          DIVISIONS TABLE (CLONED EXACTLY FROM OMEGA ERP)
          ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-2xs mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-700 font-bold bg-[#fafbfc]">
                <th
                  onClick={() => toggleSort('DIVISIONNAME')}
                  className="px-4 py-3 cursor-pointer select-none hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('CATEGORYNAME')}
                  className="px-4 py-3 cursor-pointer select-none hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Category</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('SORTING')}
                  className="px-4 py-3 cursor-pointer select-none hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Sorting</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('CREATED_AT')}
                  className="px-4 py-3 cursor-pointer select-none hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Created At</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('UPDATED_AT')}
                  className="px-4 py-3 cursor-pointer select-none hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Updated At</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredDivisions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 italic">
                    No inventory divisions found.
                  </td>
                </tr>
              ) : (
                filteredDivisions.map((item) => (
                  <tr key={item.ID} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        {item.PIC ? (
                          <img
                            src={item.PIC}
                            alt=""
                            className="w-6 h-6 rounded object-cover border border-slate-200"
                          />
                        ) : null}
                        <span>{item.DIVISIONNAME}</span>
                        {item.ADIVISIONNAME && (
                          <span className="text-slate-400 text-[11px] font-normal">
                            ({item.ADIVISIONNAME})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">
                      {item.CATEGORYNAME}
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-mono">
                      {item.SORTING}
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">
                      {item.CREATED_AT}
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">
                      {item.UPDATED_AT}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Edit button: dark blue/slate square with pencil icon */}
                        <button
                          onClick={() => handleOpenEdit(item)}
                          title="Edit"
                          className="w-7 h-7 flex items-center justify-center rounded bg-[#2b3940] hover:bg-[#1a2328] text-white shadow-2xs transition"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {/* Delete button: maroon/dark red square with trash icon */}
                        <button
                          onClick={() => handleDeleteDivision(item)}
                          title="Delete"
                          className="w-7 h-7 flex items-center justify-center rounded bg-[#782b2b] hover:bg-[#5e2020] text-white shadow-2xs transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 bg-[#fafbfc] border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-700">{filteredDivisions.length}</span> of{' '}
            <span className="font-semibold text-slate-700">{divisions.length}</span> divisions
          </div>
          <div className="flex items-center gap-1 font-mono">
            <button
              disabled
              className="px-2 py-1 border border-slate-200 rounded text-slate-400 bg-white cursor-not-allowed"
            >
              «
            </button>
            <span className="px-3 py-1 bg-[#2b3940] text-white rounded font-bold">1</span>
            <button
              disabled
              className="px-2 py-1 border border-slate-200 rounded text-slate-400 bg-white cursor-not-allowed"
            >
              »
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: NEW INVENTORY DIVISION
          ========================================================================= */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-300 w-full max-w-2xl rounded shadow-2xl overflow-hidden text-slate-800 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200">
              <h2 className="text-base font-semibold text-[#1f2d3d]">New Inventory Division</h2>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSaveNewDivision} className="p-5 space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-6">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Division Name*
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newDivisionForm.name}
                    onChange={(e) => setNewDivisionForm({ ...newDivisionForm, name: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-[#2b3940]"
                  />
                </div>

                {/* Category* with + button */}
                <div className="sm:col-span-6">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category*
                  </label>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={newDivisionForm.categoryName}
                      onChange={(e) => {
                        const selectedName = e.target.value;
                        const found = categories.find((c) => c.CATEGORYNAME === selectedName);
                        setNewDivisionForm({
                          ...newDivisionForm,
                          categoryName: selectedName,
                          categoryId: found ? found.CATEGORYID : 6
                        });
                      }}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-[#2b3940]"
                    >
                      {categories.map((cat) => (
                        <option key={cat.CATEGORYID} value={cat.CATEGORYNAME}>
                          {cat.CATEGORYNAME}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={handleOpenQuickAddCategory}
                      title="Add New Category"
                      className="w-9 h-8 shrink-0 flex items-center justify-center rounded bg-[#2b3940] hover:bg-[#1a2328] text-white transition shadow-2xs"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditCategory(newDivisionForm.categoryId)}
                      title="Edit Category"
                      className="w-8 h-8 shrink-0 flex items-center justify-center rounded bg-[#2b3940] hover:bg-[#1a2328] text-white transition shadow-2xs"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sorting
                  </label>
                  <input
                    type="number"
                    value={newDivisionForm.sorting}
                    onChange={(e) => setNewDivisionForm({ ...newDivisionForm, sorting: Number(e.target.value) || 1 })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-[#2b3940]"
                  />
                </div>

                <div className="sm:col-span-8">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Second Lang Name
                  </label>
                  <input
                    type="text"
                    value={newDivisionForm.secondLang}
                    onChange={(e) => setNewDivisionForm({ ...newDivisionForm, secondLang: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-[#2b3940]"
                  />
                </div>
              </div>

              {/* Image Section Card */}
              <div className="border border-slate-200 rounded overflow-hidden">
                <div className="bg-[#f8fafc] px-4 py-2 border-b border-slate-200 text-xs font-bold text-slate-800">
                  Image
                </div>
                <div className="p-4 flex flex-col items-center">
                  <div className="w-48 h-36 bg-[#f1f3f5] border border-dashed border-slate-300 rounded flex items-center justify-center mb-3 overflow-hidden">
                    {newDivisionForm.image ? (
                      <img
                        src={newDivisionForm.image}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-slate-400 font-semibold text-sm">no-image</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <button
                      type="button"
                      onClick={() => handleImageUpload('new')}
                      className="px-3 py-1 text-xs font-semibold text-white bg-[#2b3940] hover:bg-[#1f2937] rounded transition"
                    >
                      Select image
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewDivisionForm({ ...newDivisionForm, image: '' })}
                      className="px-3 py-1 text-xs font-semibold text-white bg-[#782b2b] hover:bg-[#5e2020] rounded transition"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="text-[11px] text-[#eb231a] font-medium text-center">
                    50 x 50px &nbsp; &nbsp; Max: 10KB
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-[#2b3940] hover:bg-[#1f2937] text-white text-xs font-semibold rounded shadow-xs transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: EDIT INVENTORY DIVISION (IDENTICAL TO SCREENSHOT 1)
          ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-300 w-full max-w-2xl rounded shadow-2xl overflow-hidden text-slate-800 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200">
              <h2 className="text-base font-semibold text-[#1f2d3d]">Edit Inventory Division</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSaveEditDivision} className="p-5 space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* ID */}
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ID</label>
                  <input
                    type="text"
                    disabled
                    value={editDivisionForm.divisionId}
                    className="w-full px-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded text-slate-500 font-mono"
                  />
                </div>

                {/* Division Name* */}
                <div className="sm:col-span-9">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Division Name*
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={editDivisionForm.name}
                    onChange={(e) => setEditDivisionForm({ ...editDivisionForm, name: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-[#2b3940]"
                  />
                </div>

                {/* Category* with + button */}
                <div className="sm:col-span-7">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category*
                  </label>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={editDivisionForm.categoryName}
                      onChange={(e) => {
                        const selectedName = e.target.value;
                        const found = categories.find((c) => c.CATEGORYNAME === selectedName);
                        setEditDivisionForm({
                          ...editDivisionForm,
                          categoryName: selectedName,
                          categoryId: found ? found.CATEGORYID : 6
                        });
                      }}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-[#2b3940]"
                    >
                      {categories.map((cat) => (
                        <option key={cat.CATEGORYID} value={cat.CATEGORYNAME}>
                          {cat.CATEGORYNAME}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={handleOpenQuickAddCategory}
                      title="Add New Category"
                      className="w-9 h-8 shrink-0 flex items-center justify-center rounded bg-[#2b3940] hover:bg-[#1a2328] text-white transition shadow-2xs"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditCategory(editDivisionForm.categoryId)}
                      title="Edit Category"
                      className="w-8 h-8 shrink-0 flex items-center justify-center rounded bg-[#2b3940] hover:bg-[#1a2328] text-white transition shadow-2xs"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sorting */}
                <div className="sm:col-span-5">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sorting
                  </label>
                  <input
                    type="number"
                    value={editDivisionForm.sorting}
                    onChange={(e) => setEditDivisionForm({ ...editDivisionForm, sorting: Number(e.target.value) || 1 })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-[#2b3940]"
                  />
                </div>

                {/* Second Lang Name */}
                <div className="sm:col-span-12">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Second Lang Name
                  </label>
                  <input
                    type="text"
                    value={editDivisionForm.secondLang}
                    onChange={(e) => setEditDivisionForm({ ...editDivisionForm, secondLang: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-[#2b3940]"
                  />
                </div>
              </div>

              {/* Image Section Card */}
              <div className="border border-slate-200 rounded overflow-hidden">
                <div className="bg-[#f8fafc] px-4 py-2 border-b border-slate-200 text-xs font-bold text-slate-800">
                  Image
                </div>
                <div className="p-4 flex flex-col items-center">
                  <div className="w-48 h-36 bg-[#f1f3f5] border border-dashed border-slate-300 rounded flex items-center justify-center mb-3 overflow-hidden">
                    {editDivisionForm.image ? (
                      <img
                        src={editDivisionForm.image}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-slate-400 font-semibold text-sm">no-image</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <button
                      type="button"
                      onClick={() => handleImageUpload('edit')}
                      className="px-3 py-1 text-xs font-semibold text-white bg-[#2b3940] hover:bg-[#1f2937] rounded transition"
                    >
                      Select image
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditDivisionForm({ ...editDivisionForm, image: '' })}
                      className="px-3 py-1 text-xs font-semibold text-white bg-[#782b2b] hover:bg-[#5e2020] rounded transition"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="text-[11px] text-[#eb231a] font-medium text-center">
                    50 x 50px &nbsp; &nbsp; Max: 10KB
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-[#2b3940] hover:bg-[#1f2937] text-white text-xs font-semibold rounded shadow-xs transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: NEW INVENTORY CATEGORY (TRIGGERED BY + BUTTON NEXT TO CATEGORY*)
          ========================================================================= */}
      {isNewCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-300 w-full max-w-xl rounded shadow-2xl overflow-hidden text-slate-800 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200">
              <h2 className="text-base font-semibold text-[#1f2d3d]">New Inventory Category</h2>
              <button
                onClick={() => setIsNewCategoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSaveQuickCategory} className="p-5 space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-6">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category description*
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={quickCategoryForm.name}
                    onChange={(e) => setQuickCategoryForm({ ...quickCategoryForm, name: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-[#2b3940]"
                  />
                </div>

                <div className="sm:col-span-6">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Second Lang Description
                  </label>
                  <input
                    type="text"
                    value={quickCategoryForm.secondLang}
                    onChange={(e) => setQuickCategoryForm({ ...quickCategoryForm, secondLang: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-[#2b3940]"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sorting
                  </label>
                  <input
                    type="number"
                    value={quickCategoryForm.sorting}
                    onChange={(e) => setQuickCategoryForm({ ...quickCategoryForm, sorting: Number(e.target.value) || 1 })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-[#2b3940]"
                  />
                </div>
              </div>

              {/* Image Section Card */}
              <div className="border border-slate-200 rounded overflow-hidden">
                <div className="bg-[#f8fafc] px-4 py-2 border-b border-slate-200 text-xs font-bold text-slate-800">
                  Image
                </div>
                <div className="p-4 flex flex-col items-center">
                  <div className="w-48 h-36 bg-[#f1f3f5] border border-dashed border-slate-300 rounded flex items-center justify-center mb-3 overflow-hidden">
                    {quickCategoryForm.image ? (
                      <img
                        src={quickCategoryForm.image}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-slate-400 font-semibold text-sm">no-image</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <button
                      type="button"
                      onClick={() => handleImageUpload('category')}
                      className="px-3 py-1 text-xs font-semibold text-white bg-[#2b3940] hover:bg-[#1f2937] rounded transition"
                    >
                      Select image
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickCategoryForm({ ...quickCategoryForm, image: '' })}
                      className="px-3 py-1 text-xs font-semibold text-white bg-[#782b2b] hover:bg-[#5e2020] rounded transition"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="text-[11px] text-[#eb231a] font-medium text-center">
                    50 x 50px &nbsp; &nbsp; Max: 10KB
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-[#2b3940] hover:bg-[#1f2937] text-white text-xs font-semibold rounded shadow-xs transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EDIT INVENTORY CATEGORY (TRIGGERED BY EDIT PEN NEXT TO CATEGORY*)
          ========================================================================= */}
      {isEditCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-300 w-full max-w-xl rounded shadow-2xl overflow-hidden text-slate-800 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200">
              <h2 className="text-base font-semibold text-[#1f2d3d]">Edit Inventory Category</h2>
              <button
                onClick={() => setIsEditCategoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSaveEditCategory} className="p-5 space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ID</label>
                  <input
                    type="text"
                    disabled
                    value={editCategoryForm.categoryId}
                    className="w-full px-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded text-slate-500 font-mono"
                  />
                </div>

                <div className="sm:col-span-9">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category description*
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={editCategoryForm.name}
                    onChange={(e) => setEditCategoryForm({ ...editCategoryForm, name: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-[#2b3940]"
                  />
                </div>

                <div className="sm:col-span-8">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Second Lang Description
                  </label>
                  <input
                    type="text"
                    value={editCategoryForm.secondLang}
                    onChange={(e) => setEditCategoryForm({ ...editCategoryForm, secondLang: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-[#2b3940]"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sorting
                  </label>
                  <input
                    type="number"
                    value={editCategoryForm.sorting}
                    onChange={(e) => setEditCategoryForm({ ...editCategoryForm, sorting: Number(e.target.value) || 1 })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-[#2b3940]"
                  />
                </div>
              </div>

              {/* Image Section Card */}
              <div className="border border-slate-200 rounded overflow-hidden">
                <div className="bg-[#f8fafc] px-4 py-2 border-b border-slate-200 text-xs font-bold text-slate-800">
                  Image
                </div>
                <div className="p-4 flex flex-col items-center">
                  <div className="w-48 h-36 bg-[#f1f3f5] border border-dashed border-slate-300 rounded flex items-center justify-center mb-3 overflow-hidden">
                    {editCategoryForm.image ? (
                      <img
                        src={editCategoryForm.image}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-slate-400 font-semibold text-sm">no-image</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <button
                      type="button"
                      onClick={() => handleImageUpload('category_edit')}
                      className="px-3 py-1 text-xs font-semibold text-white bg-[#2b3940] hover:bg-[#1f2937] rounded transition"
                    >
                      Select image
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditCategoryForm({ ...editCategoryForm, image: '' })}
                      className="px-3 py-1 text-xs font-semibold text-white bg-[#782b2b] hover:bg-[#5e2020] rounded transition"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="text-[11px] text-[#eb231a] font-medium text-center">
                    50 x 50px &nbsp; &nbsp; Max: 10KB
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-[#2b3940] hover:bg-[#1f2937] text-white text-xs font-semibold rounded shadow-xs transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: SORTING MODAL (FROM ACTIONS -> SORTING)
          ========================================================================= */}
      {isSortingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-300 w-full max-w-md rounded shadow-2xl overflow-hidden text-slate-800 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
              <h2 className="text-base font-semibold text-[#1f2d3d]">Sorting</h2>
              <button
                onClick={() => setIsSortingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-semibold bg-slate-50">
                    <th className="px-3 py-2 w-1/3">Division</th>
                    <th className="px-3 py-2 w-1/3">Sorting</th>
                    <th className="px-3 py-2 w-1/3 text-right">Reorder</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortingItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2 font-medium text-slate-800">{item.name}</td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.sorting}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 1;
                            setSortingItems((prev) =>
                              prev.map((it) => (it.id === item.id ? { ...it, sorting: val } : it))
                            );
                          }}
                          className="w-20 px-2 py-1 text-xs border border-slate-300 rounded font-mono"
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => adjustSortingItem(item.id, -1)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-[#2b3940]"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => adjustSortingItem(item.id, 1)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-[#2b3940]"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveSorting}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-[#2b3940] hover:bg-[#1f2937] text-white text-xs font-semibold rounded shadow-xs transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: WATCH TUTORIAL GUIDE
          ========================================================================= */}
      {isTutorialOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-300 w-full max-w-xl rounded shadow-2xl overflow-hidden text-slate-800 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-3.5 bg-[#2b3940] text-white">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <h2 className="text-sm font-semibold">Inventory Divisions Tutorial</h2>
              </div>
              <button
                onClick={() => setIsTutorialOpen(false)}
                className="text-slate-300 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-700 max-h-[75vh] overflow-y-auto">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-900 flex gap-2">
                <Info className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-bold mb-1">About Inventory Divisions</div>
                  Inventory Divisions structure and subdivide inventory items within each category (e.g. Assembled Items, Bottles, Demijohns, Jars, and wholesale/retail groupings).
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-sm">Key Capabilities:</h3>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600 leading-relaxed">
                  <li>
                    <strong>Search &amp; Category Filtering:</strong> Use the top search bar to filter by division name, and the category dropdown to filter across categories (مفرق, جملة, عروض, مواد اولية, Raw Materials).
                  </li>
                  <li>
                    <strong>+ New Division:</strong> Creates an inventory division linked to a category with sorting order, secondary language, and an image icon.
                  </li>
                  <li>
                    <strong>+ Button Next To Category*:</strong> Creates a new inventory category on the fly directly from the division modal.
                  </li>
                  <li>
                    <strong>Edit Division:</strong> Opens the division edit modal with division ID, name, category, sorting, and image controls.
                  </li>
                  <li>
                    <strong>Actions &gt; Sorting:</strong> Reorder display priority using the Division Sorting dialog with up/down arrows.
                  </li>
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setIsTutorialOpen(false)}
                  className="px-4 py-1.5 bg-[#2b3940] text-white rounded text-xs font-semibold hover:bg-[#1f2937]"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
