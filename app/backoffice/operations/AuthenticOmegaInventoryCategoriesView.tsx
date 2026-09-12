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
  InventoryCategoryItem,
  INITIAL_OMEGA_INV_CATEGORIES,
  OMEGA_LINKED_CATEGORIES
} from '@/lib/omegaInventoryCategoryData';

// Authentic Searchable Category Select (Omega erp-select pattern with embedded Search Bar)
interface SearchableCategorySelectProps {
  placeholder?: string;
  value: string;
  onChange: (value: string, image?: string) => void;
  categoriesList: InventoryCategoryItem[];
}

function SearchableCategorySelect({
  placeholder = 'Select Predefined Category',
  value,
  onChange,
  categoriesList
}: SearchableCategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCategories = categoriesList.filter((cat) =>
    cat.CATEGORYNAME.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
    (cat.ACATEGORYNAME && cat.ACATEGORYNAME.toLowerCase().includes(searchTerm.toLowerCase().trim()))
  );

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearchTerm('');
        }}
        className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-700 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#2b3940] hover:border-slate-400 transition"
      >
        <span className={value ? 'text-slate-900 font-medium truncate' : 'text-slate-500 truncate'}>
          {value || placeholder}
        </span>
        <span className="text-slate-400 text-[11px] ml-2 shrink-0">▾</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-full min-w-[240px] bg-white border border-slate-200 rounded shadow-lg z-50 p-2 text-xs animate-in fade-in zoom-in-95 duration-100">
          {/* Authentic Search Bar inside dropdown */}
          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-[#2b3940]"
            />
          </div>

          <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((cat) => (
                <button
                  key={cat.ID}
                  type="button"
                  onClick={() => {
                    onChange(cat.CATEGORYNAME, cat.PIC || undefined);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 rounded text-slate-700 font-medium flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    {cat.PIC && (
                      <img src={cat.PIC} alt="" className="w-4 h-4 object-contain rounded" />
                    )}
                    <span>{cat.CATEGORYNAME}</span>
                    {cat.ACATEGORYNAME && (
                      <span className="text-[10px] text-slate-400 font-normal">({cat.ACATEGORYNAME})</span>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="py-3 text-center text-xs text-slate-400 italic">
                {searchTerm ? 'No matching categories found' : 'Type to search categories'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AuthenticOmegaInventoryCategoriesView() {
  // Persistence state
  const [categories, setCategories] = useState<InventoryCategoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('vanguard_omega_inv_categories');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed.map((item: InventoryCategoryItem) => ({
              ...item,
              CATEGORYLINKEDNAME: 'General'
            }));
          }
        }
      } catch (e) {
        console.error('Failed to load saved categories:', e);
      }
    }
    return INITIAL_OMEGA_INV_CATEGORIES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('vanguard_omega_inv_categories', JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to persist categories:', e);
    }
  }, [categories]);

  // Filter and Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLinkedCategory, setSelectedLinkedCategory] = useState('All Linked Categories');
  const [sortField, setSortField] = useState<'CATEGORYNAME' | 'CATEGORYLINKEDNAME' | 'SORTING' | 'CREATED_AT' | 'UPDATED_AT'>('SORTING');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Actions dropdown
  const [actionsOpen, setActionsOpen] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSortingModalOpen, setIsSortingModalOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  // Active item for edit
  const [editingCategory, setEditingCategory] = useState<InventoryCategoryItem | null>(null);

  // Form states for New
  const [newForm, setNewForm] = useState({
    description: '',
    secondLang: '',
    sorting: 1,
    image: '',
    selectedPredefined: ''
  });

  // Form states for Edit
  const [editForm, setEditForm] = useState({
    id: 0,
    categoryId: 0,
    description: '',
    secondLang: '',
    sorting: 1,
    image: '',
    selectedPredefined: ''
  });

  // Sorting modal temporary state
  const [sortingItems, setSortingItems] = useState<{ id: number; name: string; sorting: number }[]>([]);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Close actions dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setActionsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter and sort items
  const filteredCategories = categories.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.CATEGORYNAME.toLowerCase().includes(q) ||
      (item.ACATEGORYNAME && item.ACATEGORYNAME.toLowerCase().includes(q)) ||
      item.SORTING.toString().includes(q) ||
      (item.CATEGORYLINKEDNAME && item.CATEGORYLINKEDNAME.toLowerCase().includes(q));

    const matchesLinked =
      selectedLinkedCategory === 'All Linked Categories' ||
      item.CATEGORYLINKEDNAME === selectedLinkedCategory;

    return matchesSearch && matchesLinked;
  }).sort((a, b) => {
    let comparison = 0;
    if (sortField === 'CATEGORYNAME') {
      comparison = a.CATEGORYNAME.localeCompare(b.CATEGORYNAME);
    } else if (sortField === 'CATEGORYLINKEDNAME') {
      comparison = (a.CATEGORYLINKEDNAME || '').localeCompare(b.CATEGORYLINKEDNAME || '');
    } else if (sortField === 'SORTING') {
      comparison = a.SORTING - b.SORTING;
    } else if (sortField === 'CREATED_AT') {
      comparison = new Date(a.CREATED_AT).getTime() - new Date(b.CREATED_AT).getTime();
    } else if (sortField === 'UPDATED_AT') {
      comparison = new Date(a.UPDATED_AT).getTime() - new Date(b.UPDATED_AT).getTime();
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const toggleSort = (field: 'CATEGORYNAME' | 'CATEGORYLINKEDNAME' | 'SORTING' | 'CREATED_AT' | 'UPDATED_AT') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Open New Modal
  const handleOpenNew = () => {
    const maxSort = categories.reduce((max, c) => Math.max(max, c.SORTING || 0), 0);
    setNewForm({
      description: '',
      secondLang: '',
      sorting: maxSort + 1,
      image: '',
      selectedPredefined: ''
    });
    setIsNewModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: InventoryCategoryItem) => {
    setEditingCategory(item);
    setEditForm({
      id: item.ID,
      categoryId: item.CATEGORYID,
      description: item.CATEGORYNAME,
      secondLang: item.ACATEGORYNAME || '',
      sorting: item.SORTING,
      image: item.PIC || '',
      selectedPredefined: ''
    });
    setIsEditModalOpen(true);
  };

  // Delete Category
  const handleDelete = (item: InventoryCategoryItem) => {
    if (window.confirm(`Are you sure you want to delete this category "${item.CATEGORYNAME}"?`)) {
      setCategories(categories.filter((c) => c.ID !== item.ID));
      showToast('Category deleted', 'success');
    }
  };

  // Save New Category
  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.description.trim()) {
      showToast('Category description is required', 'error');
      return;
    }

    // Check duplicate
    const exists = categories.some(
      (c) => c.CATEGORYNAME.trim().toLowerCase() === newForm.description.trim().toLowerCase()
    );
    if (exists) {
      showToast('This Category already exists, Please choose another name', 'error');
      return;
    }

    const todayStr = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date());

    const nextId = Math.max(0, ...categories.map((c) => c.ID)) + 1;
    const nextCatId = Math.max(0, ...categories.map((c) => c.CATEGORYID)) + 1;

    const newItem: InventoryCategoryItem = {
      ID: nextId,
      CATEGORYID: nextCatId,
      BRAND_ID: 9606,
      BRANCHID: 1,
      CATEGORYNAME: newForm.description.trim(),
      ACATEGORYNAME: newForm.secondLang.trim() || null,
      PIC: newForm.image || null,
      SORTING: Number(newForm.sorting) || 1,
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

    setCategories([newItem, ...categories]);
    setIsNewModalOpen(false);
    showToast('Category saved', 'success');
  };

  // Save Edited Category
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    if (!editForm.description.trim()) {
      showToast('Category description is required', 'error');
      return;
    }

    // Check duplicate with another item
    const exists = categories.some(
      (c) =>
        c.ID !== editingCategory.ID &&
        c.CATEGORYNAME.trim().toLowerCase() === editForm.description.trim().toLowerCase()
    );
    if (exists) {
      showToast('This Category already exists, Please choose another name', 'error');
      return;
    }

    const todayStr = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date());

    const updatedList = categories.map((c) => {
      if (c.ID === editingCategory.ID) {
        return {
          ...c,
          CATEGORYNAME: editForm.description.trim(),
          ACATEGORYNAME: editForm.secondLang.trim() || null,
          SORTING: Number(editForm.sorting) || c.SORTING,
          PIC: editForm.image || null,
          UPDATED_AT: todayStr
        };
      }
      return c;
    });

    setCategories(updatedList);
    setIsEditModalOpen(false);
    showToast('Category saved', 'success');
  };

  // Open Sorting Modal
  const handleOpenSorting = () => {
    setActionsOpen(false);
    const items = categories
      .map((c) => ({ id: c.ID, name: c.CATEGORYNAME, sorting: c.SORTING }))
      .sort((a, b) => a.sorting - b.sorting);
    setSortingItems(items);
    setIsSortingModalOpen(true);
  };

  // Shift sorting in Sorting modal
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

  // Save Sorting
  const handleSaveSorting = () => {
    const sortMap = new Map(sortingItems.map((item) => [item.id, item.sorting]));
    const updated = categories.map((c) => {
      if (sortMap.has(c.ID)) {
        return { ...c, SORTING: sortMap.get(c.ID)! };
      }
      return c;
    });
    setCategories(updated);
    setIsSortingModalOpen(false);
    showToast('Sorting Saved Successfully', 'success');
  };

  // Predefined selection handler for New
  const handleSelectPredefinedForNew = (name: string, image?: string) => {
    setNewForm((prev) => ({
      ...prev,
      selectedPredefined: name,
      description: name,
      image: image || prev.image
    }));
  };

  // Predefined selection handler for Edit
  const handleSelectPredefinedForEdit = (name: string, image?: string) => {
    setEditForm((prev) => ({
      ...prev,
      selectedPredefined: name,
      image: image || prev.image
    }));
  };

  // Simulate image upload
  const handleImageUpload = (isEdit: boolean) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (loadEvt) => {
          const result = loadEvt.target?.result as string;
          if (isEdit) {
            setEditForm((prev) => ({ ...prev, image: result }));
          } else {
            setNewForm((prev) => ({ ...prev, image: result }));
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
            Inventory Categories
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <a href="#home" className="text-[#0d6efd] hover:underline">
              Home
            </a>
            <span>/</span>
            <span className="text-slate-600 font-medium">Inventory Categories</span>
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
          TOOLBAR: SEARCH BAR, ALL LINKED CATEGORIES, +NEW, ACTIONS
          ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-md p-3 mb-4 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left search & dropdown */}
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

            {/* Linked Category Dropdown (EXACTLY 2 OPTIONS: All Linked Categories and General) */}
            <div className="w-full sm:w-64">
              <select
                value={selectedLinkedCategory}
                onChange={(e) => setSelectedLinkedCategory(e.target.value)}
                className="w-full px-3 py-1.5 text-xs text-slate-700 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#2b3940] cursor-pointer"
              >
                {OMEGA_LINKED_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
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
          CATEGORIES TABLE (CLONED EXACTLY FROM OMEGA ERP)
          ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-2xs mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-700 font-bold bg-[#fafbfc]">
                <th
                  onClick={() => toggleSort('CATEGORYNAME')}
                  className="px-4 py-3 cursor-pointer select-none hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('CATEGORYLINKEDNAME')}
                  className="px-4 py-3 cursor-pointer select-none hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Linked Category</span>
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
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 italic">
                    No inventory categories found.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((item) => (
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
                        <span>{item.CATEGORYNAME}</span>
                        {item.ACATEGORYNAME && (
                          <span className="text-slate-400 text-[11px] font-normal">
                            ({item.ACATEGORYNAME})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[11px]">
                        {item.CATEGORYLINKEDNAME || 'General'}
                      </span>
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
                        {/* Edit button */}
                        <button
                          onClick={() => handleOpenEdit(item)}
                          title="Edit"
                          className="w-7 h-7 flex items-center justify-center rounded bg-[#2b3940] hover:bg-[#1a2328] text-white shadow-2xs transition"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {/* Delete button */}
                        <button
                          onClick={() => handleDelete(item)}
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
            Showing <span className="font-semibold text-slate-700">{filteredCategories.length}</span> of{' '}
            <span className="font-semibold text-slate-700">{categories.length}</span> categories
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
          MODAL 1: NEW INVENTORY CATEGORY
          ========================================================================= */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-300 w-full max-w-xl rounded shadow-2xl overflow-hidden text-slate-800 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200">
              <h2 className="text-base font-semibold text-[#1f2d3d]">New Inventory Category</h2>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveNew} className="p-5 space-y-4 max-h-[85vh] overflow-y-auto">
              {/* Top right Predefined dropdown WITH SEARCH BAR */}
              <div className="flex justify-end pb-1 border-b border-slate-100">
                <div className="w-full sm:w-64">
                  <SearchableCategorySelect
                    placeholder="Select Predefined Category"
                    value={newForm.selectedPredefined}
                    onChange={handleSelectPredefinedForNew}
                    categoriesList={categories}
                  />
                </div>
              </div>

              {/* Form fields row */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-5">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category description*
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newForm.description}
                    onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-[#2b3940]"
                  />
                </div>

                <div className="sm:col-span-5">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Second Lang Description
                  </label>
                  <input
                    type="text"
                    value={newForm.secondLang}
                    onChange={(e) => setNewForm({ ...newForm, secondLang: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-[#2b3940]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sorting
                  </label>
                  <input
                    type="number"
                    value={newForm.sorting}
                    onChange={(e) => setNewForm({ ...newForm, sorting: Number(e.target.value) || 1 })}
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
                    {newForm.image ? (
                      <img
                        src={newForm.image}
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
                      onClick={() => handleImageUpload(false)}
                      className="px-3 py-1 text-xs font-semibold text-white bg-[#2b3940] hover:bg-[#1f2937] rounded transition"
                    >
                      Select image
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewForm({ ...newForm, image: '', selectedPredefined: '' })}
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
          MODAL 2: EDIT INVENTORY CATEGORY
          ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-300 w-full max-w-xl rounded shadow-2xl overflow-hidden text-slate-800 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200">
              <h2 className="text-base font-semibold text-[#1f2d3d]">Edit Inventory Category</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ID</label>
                  <input
                    type="text"
                    disabled
                    value={editForm.id}
                    className="w-full px-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded text-slate-500 font-mono"
                  />
                </div>

                <div className="sm:col-span-5">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category description*
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-[#2b3940]"
                  />
                </div>

                <div className="sm:col-span-5">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Second Lang Description
                  </label>
                  <input
                    type="text"
                    value={editForm.secondLang}
                    onChange={(e) => setEditForm({ ...editForm, secondLang: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-[#2b3940]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sorting
                  </label>
                  <input
                    type="number"
                    value={editForm.sorting}
                    onChange={(e) => setEditForm({ ...editForm, sorting: Number(e.target.value) || 1 })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-[#2b3940]"
                  />
                </div>
              </div>

              {/* Image Section Card with Searchable select */}
              <div className="border border-slate-200 rounded overflow-hidden">
                <div className="bg-[#f8fafc] px-4 py-2 border-b border-slate-200 text-xs font-bold text-slate-800">
                  Image
                </div>

                <div className="pt-3 px-4" style={{ maxWidth: '260px' }}>
                  <SearchableCategorySelect
                    placeholder="Select Predefined"
                    value={editForm.selectedPredefined}
                    onChange={handleSelectPredefinedForEdit}
                    categoriesList={categories}
                  />
                </div>

                <div className="p-4 flex flex-col items-center">
                  <div className="w-48 h-36 bg-[#f1f3f5] border border-dashed border-slate-300 rounded flex items-center justify-center mb-3 overflow-hidden">
                    {editForm.image ? (
                      <img
                        src={editForm.image}
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
                      onClick={() => handleImageUpload(true)}
                      className="px-3 py-1 text-xs font-semibold text-white bg-[#2b3940] hover:bg-[#1f2937] rounded transition"
                    >
                      Select image
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, image: '', selectedPredefined: '' })}
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
          MODAL 3: SORTING MODAL (FROM ACTIONS -> SORTING)
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
                    <th className="px-3 py-2 w-1/3">Category</th>
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
          MODAL 4: WATCH TUTORIAL GUIDE
          ========================================================================= */}
      {isTutorialOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-300 w-full max-w-xl rounded shadow-2xl overflow-hidden text-slate-800 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-3.5 bg-[#2b3940] text-white">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <h2 className="text-sm font-semibold">Inventory Categories Tutorial</h2>
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
                  <div className="font-bold mb-1">About Inventory Categories</div>
                  Inventory Categories define the top-level classification of all inventory items, products, ingredients, and raw materials across warehouse storage, purchase receipts, wastage logs, and POS menus.
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-sm">Key Capabilities:</h3>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600 leading-relaxed">
                  <li>
                    <strong>Search &amp; Linked Category Filtering:</strong> Use the top search bar to filter by English or Arabic names, and the dropdown to filter by linked sales category.
                  </li>
                  <li>
                    <strong>+ New Category:</strong> Creates an inventory category with multilingual descriptions, numeric sorting, and a 50x50 icon.
                  </li>
                  <li>
                    <strong>Edit Category:</strong> Click the dark edit pen button on any row to modify descriptions, secondary language, sorting priority, or icon.
                  </li>
                  <li>
                    <strong>Actions &gt; Sorting:</strong> Reorder display priority using the Sorting dialog with up/down arrows or direct numeric entry.
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
