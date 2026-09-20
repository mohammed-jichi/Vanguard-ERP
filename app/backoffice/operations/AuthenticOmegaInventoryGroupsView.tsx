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
  InventoryGroupItem,
  GroupDivisionOption,
  INITIAL_OMEGA_INV_GROUPS,
  OMEGA_GROUP_DIVISIONS
} from '@/lib/omegaInventoryGroupData';
import {
  InventoryDivisionItem,
  INITIAL_OMEGA_INV_DIVISIONS,
  OMEGA_DIVISION_CATEGORIES
} from '@/lib/omegaInventoryDivisionData';

export default function AuthenticOmegaInventoryGroupsView() {
  // ---------------------------------------------------------------------------
  // Divisions State (synced with localStorage & fallback to authentic data)
  // ---------------------------------------------------------------------------
  const [divisions, setDivisions] = useState<GroupDivisionOption[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedDivs = localStorage.getItem('vanguard_omega_inv_divisions');
        if (savedDivs) {
          const parsed = JSON.parse(savedDivs) as InventoryDivisionItem[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((d) => ({
              DIVISIONID: d.DIVISIONID || d.ID,
              DIVISIONNAME: d.DIVISIONNAME
            }));
          }
        }
      } catch (e) {
        console.error('Error reading saved divisions:', e);
      }
    }
    return OMEGA_GROUP_DIVISIONS;
  });

  // ---------------------------------------------------------------------------
  // Groups State (synced with localStorage)
  // ---------------------------------------------------------------------------
  const [groups, setGroups] = useState<InventoryGroupItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('vanguard_omega_inv_groups');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.error('Error reading saved groups:', e);
      }
    }
    return INITIAL_OMEGA_INV_GROUPS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('vanguard_omega_inv_groups', JSON.stringify(groups));
    } catch (e) {
      console.error('Failed to persist groups:', e);
    }
  }, [groups]);

  // ---------------------------------------------------------------------------
  // Filters & Sorting
  // ---------------------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('All Divisions');
  const [sortField, setSortField] = useState<
    'GROUPID' | 'GROUPNAME' | 'DIVISIONNAME' | 'SORTING' | 'itemsCount' | 'CREATED_AT' | 'UPDATED_AT'
  >('GROUPID');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Actions dropdown
  const [actionsOpen, setActionsOpen] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewDivisionModalOpen, setIsNewDivisionModalOpen] = useState(false);
  const [isEditDivisionModalOpen, setIsEditDivisionModalOpen] = useState(false);
  const [isSortingModalOpen, setIsSortingModalOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  // Active editing items
  const [editingGroup, setEditingGroup] = useState<InventoryGroupItem | null>(null);

  // Forms
  const [newGroupForm, setNewGroupForm] = useState({
    name: '',
    otherDesc: '',
    divisionName: 'Jars',
    divisionId: 40,
    sorting: 1,
    secondLang: '',
    discount: 0,
    masterItem: false,
    assetAccount: 0,
    revenueAccount: 0,
    expenseAccount: 0,
    adjustmentAccount: 0,
    tax1: true,
    tax2: false,
    tax3: false,
    tax4: false,
    tax5: false,
    tax6: false,
    image: ''
  });

  const [editGroupForm, setEditGroupForm] = useState({
    id: 0,
    groupId: 0,
    name: '',
    otherDesc: '',
    divisionName: 'Jars',
    divisionId: 40,
    sorting: 1,
    secondLang: '',
    discount: 0,
    masterItem: false,
    assetAccount: 0,
    revenueAccount: 0,
    expenseAccount: 0,
    adjustmentAccount: 0,
    tax1: true,
    tax2: false,
    tax3: false,
    tax4: false,
    tax5: false,
    tax6: false,
    image: ''
  });

  // Quick Division forms (on the fly)
  const [quickDivisionForm, setQuickDivisionForm] = useState({
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
  // Filtered and Sorted Groups
  // ---------------------------------------------------------------------------
  const filteredGroups = groups
    .filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.GROUPNAME.toLowerCase().includes(q) ||
        (item.AGROUPNAME && item.AGROUPNAME.toLowerCase().includes(q)) ||
        (item.OTHERDESC && item.OTHERDESC.toLowerCase().includes(q)) ||
        item.DIVISIONNAME.toLowerCase().includes(q) ||
        item.GROUPID.toString().includes(q) ||
        item.SORTING.toString().includes(q);

      const matchesDiv =
        selectedDivision === 'All Divisions' || item.DIVISIONNAME === selectedDivision;

      return matchesSearch && matchesDiv;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'GROUPID') {
        comparison = a.GROUPID - b.GROUPID;
      } else if (sortField === 'GROUPNAME') {
        comparison = a.GROUPNAME.localeCompare(b.GROUPNAME);
      } else if (sortField === 'DIVISIONNAME') {
        comparison = a.DIVISIONNAME.localeCompare(b.DIVISIONNAME);
      } else if (sortField === 'SORTING') {
        comparison = a.SORTING - b.SORTING;
      } else if (sortField === 'itemsCount') {
        comparison = a.itemsCount - b.itemsCount;
      } else if (sortField === 'CREATED_AT') {
        comparison = new Date(a.CREATED_AT).getTime() - new Date(b.CREATED_AT).getTime();
      } else if (sortField === 'UPDATED_AT') {
        comparison = new Date(a.UPDATED_AT).getTime() - new Date(b.UPDATED_AT).getTime();
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const toggleSort = (
    field: 'GROUPID' | 'GROUPNAME' | 'DIVISIONNAME' | 'SORTING' | 'itemsCount' | 'CREATED_AT' | 'UPDATED_AT'
  ) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // ---------------------------------------------------------------------------
  // Open New Group Modal
  // ---------------------------------------------------------------------------
  const handleOpenNew = () => {
    const maxSort = groups.reduce((max, g) => Math.max(max, g.SORTING || 0), 0);
    const defaultDiv = divisions.length > 0 ? divisions[0].DIVISIONNAME : 'Jars';
    const defaultDivId = divisions.length > 0 ? divisions[0].DIVISIONID : 40;

    setNewGroupForm({
      name: '',
      otherDesc: '',
      divisionName: defaultDiv,
      divisionId: defaultDivId,
      sorting: maxSort + 1,
      secondLang: '',
      discount: 0,
      masterItem: false,
      assetAccount: 0,
      revenueAccount: 0,
      expenseAccount: 0,
      adjustmentAccount: 0,
      tax1: true,
      tax2: false,
      tax3: false,
      tax4: false,
      tax5: false,
      tax6: false,
      image: ''
    });
    setIsNewModalOpen(true);
  };

  // ---------------------------------------------------------------------------
  // Open Edit Group Modal
  // ---------------------------------------------------------------------------
  const handleOpenEdit = (item: InventoryGroupItem) => {
    setEditingGroup(item);
    setEditGroupForm({
      id: item.ID,
      groupId: item.GROUPID,
      name: item.GROUPNAME,
      otherDesc: item.OTHERDESC || item.GROUPNAME,
      divisionName: item.DIVISIONNAME,
      divisionId: item.DIVISIONID,
      sorting: item.SORTING,
      secondLang: item.AGROUPNAME || '',
      discount: item.AUTDISC || 0,
      masterItem: item.MASTER_ITEM === -1,
      assetAccount: item.ASSETACCOUNT || 0,
      revenueAccount: item.REVENUEACCOUNT || 0,
      expenseAccount: item.EXPENSEACCOUNT || 0,
      adjustmentAccount: item.STOCKVARIATIONACC || 0,
      tax1: item.TAX1,
      tax2: item.TAX2,
      tax3: item.TAX3,
      tax4: item.TAX4,
      tax5: item.TAX5,
      tax6: item.TAX6,
      image: item.ECOM_PIC || ''
    });
    setIsEditModalOpen(true);
  };

  // ---------------------------------------------------------------------------
  // Save New Group
  // ---------------------------------------------------------------------------
  const handleSaveNewGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupForm.name.trim()) {
      showToast('Group name is required', 'error');
      return;
    }

    const exists = groups.some(
      (g) => g.GROUPNAME.trim().toLowerCase() === newGroupForm.name.trim().toLowerCase()
    );
    if (exists) {
      showToast('This group name already exists, Please choose another name.', 'error');
      return;
    }

    const todayStr = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date());

    const nextId = Math.max(0, ...groups.map((g) => g.ID)) + 1;
    const nextGroupId = Math.max(0, ...groups.map((g) => g.GROUPID)) + 1;

    const newGrp: InventoryGroupItem = {
      ID: nextId,
      GROUPID: nextGroupId,
      BRAND_ID: 9606,
      BRANCHID: 1,
      GROUPNAME: newGroupForm.name.trim(),
      AGROUPNAME: newGroupForm.secondLang.trim() || null,
      OTHERDESC: newGroupForm.otherDesc.trim() || newGroupForm.name.trim(),
      DIVISIONID: newGroupForm.divisionId,
      DIVISIONNAME: newGroupForm.divisionName,
      SORTING: Number(newGroupForm.sorting) || 1,
      itemsCount: 0,
      ECOM_PIC: newGroupForm.image || null,
      MASTER_ITEM: newGroupForm.masterItem ? -1 : 0,
      TAX1: newGroupForm.tax1,
      TAX2: newGroupForm.tax2,
      TAX3: newGroupForm.tax3,
      TAX4: newGroupForm.tax4,
      TAX5: newGroupForm.tax5,
      TAX6: newGroupForm.tax6,
      ASSETACCOUNT: Number(newGroupForm.assetAccount) || 0,
      REVENUEACCOUNT: Number(newGroupForm.revenueAccount) || 0,
      EXPENSEACCOUNT: Number(newGroupForm.expenseAccount) || 0,
      STOCKVARIATIONACC: Number(newGroupForm.adjustmentAccount) || 0,
      AUTDISC: Number(newGroupForm.discount) || 0,
      CREATED_AT: todayStr,
      UPDATED_AT: todayStr,
      UPDATED_BY: 1
    };

    setGroups([newGrp, ...groups]);
    setIsNewModalOpen(false);
    showToast('Group saved', 'success');
  };

  // ---------------------------------------------------------------------------
  // Save Edit Group
  // ---------------------------------------------------------------------------
  const handleSaveEditGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup) return;
    if (!editGroupForm.name.trim()) {
      showToast('Group name is required', 'error');
      return;
    }

    const exists = groups.some(
      (g) =>
        g.ID !== editingGroup.ID &&
        g.GROUPNAME.trim().toLowerCase() === editGroupForm.name.trim().toLowerCase()
    );
    if (exists) {
      showToast('This group name already exists, Please choose another name.', 'error');
      return;
    }

    const todayStr = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date());

    const updated = groups.map((g) => {
      if (g.ID === editingGroup.ID) {
        return {
          ...g,
          GROUPNAME: editGroupForm.name.trim(),
          AGROUPNAME: editGroupForm.secondLang.trim() || null,
          OTHERDESC: editGroupForm.otherDesc.trim() || editGroupForm.name.trim(),
          DIVISIONID: editGroupForm.divisionId,
          DIVISIONNAME: editGroupForm.divisionName,
          SORTING: Number(editGroupForm.sorting) || g.SORTING,
          AUTDISC: Number(editGroupForm.discount) || 0,
          MASTER_ITEM: editGroupForm.masterItem ? -1 : 0,
          ASSETACCOUNT: Number(editGroupForm.assetAccount) || 0,
          REVENUEACCOUNT: Number(editGroupForm.revenueAccount) || 0,
          EXPENSEACCOUNT: Number(editGroupForm.expenseAccount) || 0,
          STOCKVARIATIONACC: Number(editGroupForm.adjustmentAccount) || 0,
          TAX1: editGroupForm.tax1,
          TAX2: editGroupForm.tax2,
          TAX3: editGroupForm.tax3,
          TAX4: editGroupForm.tax4,
          TAX5: editGroupForm.tax5,
          TAX6: editGroupForm.tax6,
          ECOM_PIC: editGroupForm.image || null,
          UPDATED_AT: todayStr
        };
      }
      return g;
    });

    setGroups(updated);
    setIsEditModalOpen(false);
    showToast('Group saved', 'success');
  };

  // ---------------------------------------------------------------------------
  // Delete Group
  // ---------------------------------------------------------------------------
  const handleDeleteGroup = (item: InventoryGroupItem) => {
    if (window.confirm(`Are you sure you want to delete this group "${item.GROUPNAME}"?`)) {
      setGroups(groups.filter((g) => g.ID !== item.ID));
      showToast('Group deleted', 'success');
    }
  };

  // ---------------------------------------------------------------------------
  // Quick Add Division (triggered by + button next to Division*)
  // ---------------------------------------------------------------------------
  const handleOpenQuickAddDivision = () => {
    const maxSort = divisions.length + 1;
    setQuickDivisionForm({
      name: '',
      categoryName: 'Raw Materials',
      categoryId: 6,
      sorting: maxSort,
      secondLang: '',
      image: ''
    });
    setIsNewDivisionModalOpen(true);
  };

  const handleSaveQuickDivision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickDivisionForm.name.trim()) {
      showToast('Division Name is required', 'error');
      return;
    }

    const divName = quickDivisionForm.name.trim();
    const nextDivId = Math.max(0, ...divisions.map((d) => d.DIVISIONID)) + 1;
    const newDivOption: GroupDivisionOption = {
      DIVISIONID: nextDivId,
      DIVISIONNAME: divName
    };

    // Update divisions state
    const updatedDivs = [...divisions, newDivOption];
    setDivisions(updatedDivs);

    // Sync with vanguard_omega_inv_divisions in localStorage
    try {
      const todayStr = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).format(new Date());

      const saved = localStorage.getItem('vanguard_omega_inv_divisions');
      const list = saved ? JSON.parse(saved) : [];
      const newDivItem: InventoryDivisionItem = {
        ID: nextDivId,
        DIVISIONID: nextDivId,
        BRAND_ID: 9606,
        BRANCHID: 1,
        DIVISIONNAME: divName,
        ADIVISIONNAME: quickDivisionForm.secondLang.trim() || null,
        CATEGORYID: quickDivisionForm.categoryId,
        CATEGORYNAME: quickDivisionForm.categoryName,
        SORTING: Number(quickDivisionForm.sorting) || nextDivId,
        PIC: quickDivisionForm.image || null,
        PLU: null,
        CREATED_AT: todayStr,
        UPDATED_AT: todayStr,
        UPDATED_BY: 1
      };
      localStorage.setItem('vanguard_omega_inv_divisions', JSON.stringify([newDivItem, ...list]));
    } catch (e) {
      console.error('Failed to sync new division to storage:', e);
    }

    // Automatically select newly created division in the active group modal
    if (isNewModalOpen) {
      setNewGroupForm((prev) => ({
        ...prev,
        divisionName: divName,
        divisionId: nextDivId
      }));
    } else if (isEditModalOpen) {
      setEditGroupForm((prev) => ({
        ...prev,
        divisionName: divName,
        divisionId: nextDivId
      }));
    }

    setIsNewDivisionModalOpen(false);
    showToast('Division saved', 'success');
  };

  // ---------------------------------------------------------------------------
  // Quick Edit Division (triggered by edit pen next to Division*)
  // ---------------------------------------------------------------------------
  const handleOpenEditDivision = (divIdOrName: number | string) => {
    let div = divisions.find((d) => d.DIVISIONID === divIdOrName || d.DIVISIONNAME === divIdOrName);
    if (!div && divisions.length > 0) div = divisions[0];
    if (!div) return;

    let secondLang = '';
    let sortNum = 1;
    let pic = '';
    let catName = 'Raw Materials';
    let catId = 6;

    try {
      const saved = localStorage.getItem('vanguard_omega_inv_divisions');
      if (saved) {
        const list = JSON.parse(saved);
        const detailed = list.find(
          (it: any) => it.DIVISIONID === div!.DIVISIONID || it.DIVISIONNAME === div!.DIVISIONNAME
        );
        if (detailed) {
          secondLang = detailed.ADIVISIONNAME || '';
          sortNum = detailed.SORTING || 1;
          pic = detailed.PIC || '';
          catName = detailed.CATEGORYNAME || 'Raw Materials';
          catId = detailed.CATEGORYID || 6;
        }
      }
    } catch (e) {
      console.error(e);
    }

    setEditDivisionForm({
      id: div.DIVISIONID,
      divisionId: div.DIVISIONID,
      name: div.DIVISIONNAME,
      categoryName: catName,
      categoryId: catId,
      sorting: sortNum,
      secondLang: secondLang,
      image: pic
    });
    setIsEditDivisionModalOpen(true);
  };

  const handleSaveEditDivision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDivisionForm.name.trim()) {
      showToast('Division Name is required', 'error');
      return;
    }

    const newName = editDivisionForm.name.trim();
    const oldName = divisions.find((d) => d.DIVISIONID === editDivisionForm.divisionId)?.DIVISIONNAME;

    // Update divisions
    setDivisions((prev) =>
      prev.map((d) =>
        d.DIVISIONID === editDivisionForm.divisionId ? { ...d, DIVISIONNAME: newName } : d
      )
    );

    // Update groups referencing this division
    if (oldName && oldName !== newName) {
      setGroups((prev) =>
        prev.map((g) =>
          g.DIVISIONID === editDivisionForm.divisionId || g.DIVISIONNAME === oldName
            ? { ...g, DIVISIONNAME: newName }
            : g
        )
      );
      if (newGroupForm.divisionName === oldName) {
        setNewGroupForm((prev) => ({ ...prev, divisionName: newName }));
      }
      if (editGroupForm.divisionName === oldName) {
        setEditGroupForm((prev) => ({ ...prev, divisionName: newName }));
      }
    }

    // Update localStorage for vanguard_omega_inv_divisions
    try {
      const saved = localStorage.getItem('vanguard_omega_inv_divisions');
      if (saved) {
        const list = JSON.parse(saved);
        const updated = list.map((it: any) => {
          if (it.DIVISIONID === editDivisionForm.divisionId || it.DIVISIONNAME === oldName) {
            return {
              ...it,
              DIVISIONNAME: newName,
              ADIVISIONNAME: editDivisionForm.secondLang.trim() || null,
              CATEGORYNAME: editDivisionForm.categoryName,
              CATEGORYID: editDivisionForm.categoryId,
              SORTING: Number(editDivisionForm.sorting) || 1,
              PIC: editDivisionForm.image || null
            };
          }
          return it;
        });
        localStorage.setItem('vanguard_omega_inv_divisions', JSON.stringify(updated));
      }
    } catch (e) {
      console.error(e);
    }

    setIsEditDivisionModalOpen(false);
    showToast('Division saved', 'success');
  };

  // ---------------------------------------------------------------------------
  // Sorting Modal Handlers
  // ---------------------------------------------------------------------------
  const handleOpenSorting = () => {
    setActionsOpen(false);
    const items = groups
      .map((g) => ({ id: g.ID, name: g.GROUPNAME, sorting: g.SORTING }))
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
    const updated = groups.map((g) => {
      if (sortMap.has(g.ID)) {
        return { ...g, SORTING: sortMap.get(g.ID)! };
      }
      return g;
    });
    setGroups(updated);
    setIsSortingModalOpen(false);
    showToast('Sorting Saved Successfully', 'success');
  };

  // ---------------------------------------------------------------------------
  // Image Upload helper
  // ---------------------------------------------------------------------------
  const handleImageUpload = (target: 'new' | 'edit' | 'division' | 'division_edit') => {
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
            setNewGroupForm((prev) => ({ ...prev, image: result }));
          } else if (target === 'edit') {
            setEditGroupForm((prev) => ({ ...prev, image: result }));
          } else if (target === 'division') {
            setQuickDivisionForm((prev) => ({ ...prev, image: result }));
          } else if (target === 'division_edit') {
            setEditDivisionForm((prev) => ({ ...prev, image: result }));
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className="w-full bg-background text-slate-800 font-sans min-h-[600px] p-2 sm:p-4">
      {/* Toast alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-xl text-white border text-sm font-semibold transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-700 border-emerald-800'
              : 'bg-destructive border-destructive'
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
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Inventory Groups
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <a href="#home" className="text-primary hover:underline">
              Home
            </a>
            <span>/</span>
            <span className="text-slate-600 font-medium">Inventory Groups</span>
          </div>
        </div>

        <div>
          <button
            onClick={() => setIsTutorialOpen(true)}
            className="text-xs text-primary hover:underline font-semibold flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Watch Tutorial
          </button>
        </div>
      </div>

      {/* =========================================================================
          TOOLBAR: SEARCH BAR, ALL DIVISIONS DROPDOWN, +NEW, ACTIONS
          ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-md p-3 mb-4 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left search & division dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-800 bg-white border border-slate-300 rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
              />
            </div>

            {/* All Divisions Dropdown Filter */}
            <div className="w-full sm:w-64">
              <select
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
                className="w-full px-3 py-1.5 text-xs text-slate-700 bg-white border border-slate-300 rounded focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="All Divisions">All Divisions</option>
                {divisions.map((div) => (
                  <option key={div.DIVISIONID} value={div.DIVISIONNAME}>
                    {div.DIVISIONNAME}
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
              className="flex items-center gap-1.5 px-4 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-semibold rounded shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New</span>
            </button>

            {/* Actions Dropdown */}
            <div className="relative" ref={actionsRef}>
              <button
                onClick={() => setActionsOpen(!actionsOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-semibold rounded shadow-xs transition"
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
          INVENTORY GROUPS TABLE (MATCHING SCREENSHOTS 1, 2, 3)
          ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-2xs mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-700 font-bold bg-card">
                <th
                  onClick={() => toggleSort('GROUPID')}
                  className="px-3 py-3 w-12 cursor-pointer select-none hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>#</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('GROUPNAME')}
                  className="px-4 py-3 cursor-pointer select-none hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('DIVISIONNAME')}
                  className="px-4 py-3 cursor-pointer select-none hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Division</span>
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
                  onClick={() => toggleSort('itemsCount')}
                  className="px-4 py-3 cursor-pointer select-none hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Items #</span>
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
              {filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400 italic">
                    No inventory groups found.
                  </td>
                </tr>
              ) : (
                filteredGroups.map((item) => (
                  <tr key={item.ID} className="hover:bg-slate-50/80 transition">
                    <td className="px-3 py-3 text-slate-700 font-mono text-[11px]">
                      {item.GROUPID}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        {item.ECOM_PIC ? (
                          <img
                            src={item.ECOM_PIC}
                            alt=""
                            className="w-6 h-6 rounded object-cover border border-slate-200"
                          />
                        ) : null}
                        <span>{item.GROUPNAME}</span>
                        {item.AGROUPNAME && (
                          <span className="text-slate-400 text-[11px] font-normal">
                            ({item.AGROUPNAME})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">
                      {item.DIVISIONNAME}
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-mono">
                      {item.SORTING}
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-mono font-semibold">
                      {item.itemsCount}
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
                          className="w-7 h-7 flex items-center justify-center rounded bg-primary hover:bg-primary/90 text-white shadow-2xs transition"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {/* Delete button: maroon/dark red square with trash icon */}
                        <button
                          onClick={() => handleDeleteGroup(item)}
                          title="Delete"
                          className="w-7 h-7 flex items-center justify-center rounded bg-destructive hover:bg-destructive/90 text-white shadow-2xs transition"
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
        <div className="px-4 py-3 bg-card border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-700">{filteredGroups.length}</span> of{' '}
            <span className="font-semibold text-slate-700">{groups.length}</span> groups
          </div>
          <div className="flex items-center gap-1 font-mono">
            <button
              disabled
              className="px-2 py-1 border border-slate-200 rounded text-slate-400 bg-white cursor-not-allowed"
            >
              «
            </button>
            <span className="px-3 py-1 bg-primary text-white rounded font-bold">1</span>
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
          MODAL 1: NEW INVENTORY GROUP (IDENTICAL TO SCREENSHOT 4)
          ========================================================================= */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-300 w-full max-w-2xl rounded shadow-2xl overflow-hidden text-slate-800 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200">
              <h2 className="text-base font-semibold text-foreground">New Inventory Group</h2>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSaveNewGroup} className="p-5 space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* Group name* */}
                <div className="sm:col-span-6">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Group name*
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newGroupForm.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewGroupForm((prev) => ({
                        ...prev,
                        name: val,
                        otherDesc: prev.otherDesc === prev.name || prev.otherDesc === '' ? val : prev.otherDesc
                      }));
                    }}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Other description */}
                <div className="sm:col-span-6">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Other description
                  </label>
                  <input
                    type="text"
                    value={newGroupForm.otherDesc}
                    onChange={(e) => setNewGroupForm({ ...newGroupForm, otherDesc: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Division* with + and edit pen buttons */}
                <div className="sm:col-span-6">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Division*
                  </label>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={newGroupForm.divisionName}
                      onChange={(e) => {
                        const selectedName = e.target.value;
                        const found = divisions.find((d) => d.DIVISIONNAME === selectedName);
                        setNewGroupForm({
                          ...newGroupForm,
                          divisionName: selectedName,
                          divisionId: found ? found.DIVISIONID : 40
                        });
                      }}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-primary"
                    >
                      {divisions.map((div) => (
                        <option key={div.DIVISIONID} value={div.DIVISIONNAME}>
                          {div.DIVISIONNAME}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={handleOpenQuickAddDivision}
                      title="Add New Division"
                      className="w-9 h-8 shrink-0 flex items-center justify-center rounded bg-primary hover:bg-primary/90 text-white transition shadow-2xs"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditDivision(newGroupForm.divisionId)}
                      title="Edit Division"
                      className="w-8 h-8 shrink-0 flex items-center justify-center rounded bg-primary hover:bg-primary/90 text-white transition shadow-2xs"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Second Lang Name */}
                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Second Lang Name
                  </label>
                  <input
                    type="text"
                    value={newGroupForm.secondLang}
                    onChange={(e) => setNewGroupForm({ ...newGroupForm, secondLang: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Sorting */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sorting
                  </label>
                  <input
                    type="number"
                    value={newGroupForm.sorting}
                    onChange={(e) =>
                      setNewGroupForm({ ...newGroupForm, sorting: Number(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Discount Percentage */}
                <div className="sm:col-span-6">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Discount Percentage
                  </label>
                  <input
                    type="number"
                    value={newGroupForm.discount}
                    onChange={(e) =>
                      setNewGroupForm({ ...newGroupForm, discount: Number(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Use as Master in E-Commerce */}
                <div className="sm:col-span-6 flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none">
                    <input
                      type="checkbox"
                      checked={newGroupForm.masterItem}
                      onChange={(e) =>
                        setNewGroupForm({ ...newGroupForm, masterItem: e.target.checked })
                      }
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-0 cursor-pointer"
                    />
                    <span>Use as Master in E-Commerce</span>
                  </label>
                </div>
              </div>

              {/* Accounting Section Panel */}
              <div className="border border-slate-200 rounded overflow-hidden">
                <div className="bg-background px-4 py-2 border-b border-slate-200 text-xs font-bold text-slate-800">
                  Accounting
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Asset account</label>
                    <input
                      type="number"
                      value={newGroupForm.assetAccount}
                      onChange={(e) =>
                        setNewGroupForm({ ...newGroupForm, assetAccount: Number(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Revenue account</label>
                    <input
                      type="number"
                      value={newGroupForm.revenueAccount}
                      onChange={(e) =>
                        setNewGroupForm({ ...newGroupForm, revenueAccount: Number(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Expense account</label>
                    <input
                      type="number"
                      value={newGroupForm.expenseAccount}
                      onChange={(e) =>
                        setNewGroupForm({ ...newGroupForm, expenseAccount: Number(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Adjustment account</label>
                    <input
                      type="number"
                      value={newGroupForm.adjustmentAccount}
                      onChange={(e) =>
                        setNewGroupForm({
                          ...newGroupForm,
                          adjustmentAccount: Number(e.target.value) || 0
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Tax Section Panel */}
              <div className="border border-slate-200 rounded overflow-hidden">
                <div className="bg-background px-4 py-2 border-b border-slate-200 text-xs font-bold text-slate-800">
                  Tax
                </div>
                <div className="p-4 grid grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newGroupForm.tax1}
                      onChange={(e) => setNewGroupForm({ ...newGroupForm, tax1: e.target.checked })}
                      className="rounded border-slate-300 text-primary"
                    />
                    <span>Tax1</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newGroupForm.tax2}
                      onChange={(e) => setNewGroupForm({ ...newGroupForm, tax2: e.target.checked })}
                      className="rounded border-slate-300 text-primary"
                    />
                    <span>Tax2</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newGroupForm.tax3}
                      onChange={(e) => setNewGroupForm({ ...newGroupForm, tax3: e.target.checked })}
                      className="rounded border-slate-300 text-primary"
                    />
                    <span>Tax3</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newGroupForm.tax4}
                      onChange={(e) => setNewGroupForm({ ...newGroupForm, tax4: e.target.checked })}
                      className="rounded border-slate-300 text-primary"
                    />
                    <span>Tax4</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newGroupForm.tax5}
                      onChange={(e) => setNewGroupForm({ ...newGroupForm, tax5: e.target.checked })}
                      className="rounded border-slate-300 text-primary"
                    />
                    <span>Tax5</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newGroupForm.tax6}
                      onChange={(e) => setNewGroupForm({ ...newGroupForm, tax6: e.target.checked })}
                      className="rounded border-slate-300 text-primary"
                    />
                    <span>Tax6</span>
                  </label>
                </div>
              </div>

              {/* E-Commerce Image Section Card */}
              <div className="border border-slate-200 rounded overflow-hidden">
                <div className="bg-background px-4 py-2 border-b border-slate-200 text-xs font-bold text-slate-800">
                  E-Commerce Image
                </div>
                <div className="p-4 flex flex-col items-center">
                  <div className="w-48 h-36 bg-muted border border-dashed border-slate-300 rounded flex items-center justify-center mb-3 overflow-hidden">
                    {newGroupForm.image ? (
                      <img
                        src={newGroupForm.image}
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
                      className="px-3 py-1 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded transition"
                    >
                      Select image
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewGroupForm({ ...newGroupForm, image: '' })}
                      className="px-3 py-1 text-xs font-semibold text-white bg-destructive hover:bg-destructive/90 rounded transition"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="text-[11px] text-destructive font-medium text-center">
                    50 x 50px &nbsp; &nbsp; Max: 10KB
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-semibold rounded shadow-xs transition"
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
          MODAL 2: EDIT INVENTORY GROUP (IDENTICAL TO SCREENSHOT 5)
          ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-300 w-full max-w-2xl rounded shadow-2xl overflow-hidden text-slate-800 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200">
              <h2 className="text-base font-semibold text-foreground">Edit Inventory Group</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSaveEditGroup} className="p-5 space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* ID */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ID</label>
                  <input
                    type="text"
                    disabled
                    value={editGroupForm.groupId}
                    className="w-full px-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded text-slate-500 font-mono"
                  />
                </div>

                {/* Group name* */}
                <div className="sm:col-span-5">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Group name*
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={editGroupForm.name}
                    onChange={(e) =>
                      setEditGroupForm({ ...editGroupForm, name: e.target.value })
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Other description */}
                <div className="sm:col-span-5">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Other description
                  </label>
                  <input
                    type="text"
                    value={editGroupForm.otherDesc}
                    onChange={(e) =>
                      setEditGroupForm({ ...editGroupForm, otherDesc: e.target.value })
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Division* with + and edit pen buttons */}
                <div className="sm:col-span-6">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Division*
                  </label>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={editGroupForm.divisionName}
                      onChange={(e) => {
                        const selectedName = e.target.value;
                        const found = divisions.find((d) => d.DIVISIONNAME === selectedName);
                        setEditGroupForm({
                          ...editGroupForm,
                          divisionName: selectedName,
                          divisionId: found ? found.DIVISIONID : 40
                        });
                      }}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-primary"
                    >
                      {divisions.map((div) => (
                        <option key={div.DIVISIONID} value={div.DIVISIONNAME}>
                          {div.DIVISIONNAME}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={handleOpenQuickAddDivision}
                      title="Add New Division"
                      className="w-9 h-8 shrink-0 flex items-center justify-center rounded bg-primary hover:bg-primary/90 text-white transition shadow-2xs"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditDivision(editGroupForm.divisionId)}
                      title="Edit Division"
                      className="w-8 h-8 shrink-0 flex items-center justify-center rounded bg-primary hover:bg-primary/90 text-white transition shadow-2xs"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Second Lang Name */}
                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Second Lang Name
                  </label>
                  <input
                    type="text"
                    value={editGroupForm.secondLang}
                    onChange={(e) =>
                      setEditGroupForm({ ...editGroupForm, secondLang: e.target.value })
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Sorting */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sorting
                  </label>
                  <input
                    type="number"
                    value={editGroupForm.sorting}
                    onChange={(e) =>
                      setEditGroupForm({ ...editGroupForm, sorting: Number(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Discount Percentage */}
                <div className="sm:col-span-6">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Discount Percentage
                  </label>
                  <input
                    type="number"
                    value={editGroupForm.discount}
                    onChange={(e) =>
                      setEditGroupForm({ ...editGroupForm, discount: Number(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Use as Master in E-Commerce */}
                <div className="sm:col-span-6 flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none">
                    <input
                      type="checkbox"
                      checked={editGroupForm.masterItem}
                      onChange={(e) =>
                        setEditGroupForm({ ...editGroupForm, masterItem: e.target.checked })
                      }
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-0 cursor-pointer"
                    />
                    <span>Use as Master in E-Commerce</span>
                  </label>
                </div>
              </div>

              {/* Accounting Section Panel */}
              <div className="border border-slate-200 rounded overflow-hidden">
                <div className="bg-background px-4 py-2 border-b border-slate-200 text-xs font-bold text-slate-800">
                  Accounting
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Asset account</label>
                    <input
                      type="number"
                      value={editGroupForm.assetAccount}
                      onChange={(e) =>
                        setEditGroupForm({ ...editGroupForm, assetAccount: Number(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Revenue account</label>
                    <input
                      type="number"
                      value={editGroupForm.revenueAccount}
                      onChange={(e) =>
                        setEditGroupForm({
                          ...editGroupForm,
                          revenueAccount: Number(e.target.value) || 0
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Expense account</label>
                    <input
                      type="number"
                      value={editGroupForm.expenseAccount}
                      onChange={(e) =>
                        setEditGroupForm({
                          ...editGroupForm,
                          expenseAccount: Number(e.target.value) || 0
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Adjustment account</label>
                    <input
                      type="number"
                      value={editGroupForm.adjustmentAccount}
                      onChange={(e) =>
                        setEditGroupForm({
                          ...editGroupForm,
                          adjustmentAccount: Number(e.target.value) || 0
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Tax Section Panel */}
              <div className="border border-slate-200 rounded overflow-hidden">
                <div className="bg-background px-4 py-2 border-b border-slate-200 text-xs font-bold text-slate-800">
                  Tax
                </div>
                <div className="p-4 grid grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editGroupForm.tax1}
                      onChange={(e) => setEditGroupForm({ ...editGroupForm, tax1: e.target.checked })}
                      className="rounded border-slate-300 text-primary"
                    />
                    <span>Tax1</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editGroupForm.tax2}
                      onChange={(e) => setEditGroupForm({ ...editGroupForm, tax2: e.target.checked })}
                      className="rounded border-slate-300 text-primary"
                    />
                    <span>Tax2</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editGroupForm.tax3}
                      onChange={(e) => setEditGroupForm({ ...editGroupForm, tax3: e.target.checked })}
                      className="rounded border-slate-300 text-primary"
                    />
                    <span>Tax3</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editGroupForm.tax4}
                      onChange={(e) => setEditGroupForm({ ...editGroupForm, tax4: e.target.checked })}
                      className="rounded border-slate-300 text-primary"
                    />
                    <span>Tax4</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editGroupForm.tax5}
                      onChange={(e) => setEditGroupForm({ ...editGroupForm, tax5: e.target.checked })}
                      className="rounded border-slate-300 text-primary"
                    />
                    <span>Tax5</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editGroupForm.tax6}
                      onChange={(e) => setEditGroupForm({ ...editGroupForm, tax6: e.target.checked })}
                      className="rounded border-slate-300 text-primary"
                    />
                    <span>Tax6</span>
                  </label>
                </div>
              </div>

              {/* E-Commerce Image Section Card */}
              <div className="border border-slate-200 rounded overflow-hidden">
                <div className="bg-background px-4 py-2 border-b border-slate-200 text-xs font-bold text-slate-800">
                  E-Commerce Image
                </div>
                <div className="p-4 flex flex-col items-center">
                  <div className="w-48 h-36 bg-muted border border-dashed border-slate-300 rounded flex items-center justify-center mb-3 overflow-hidden">
                    {editGroupForm.image ? (
                      <img
                        src={editGroupForm.image}
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
                      className="px-3 py-1 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded transition"
                    >
                      Select image
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditGroupForm({ ...editGroupForm, image: '' })}
                      className="px-3 py-1 text-xs font-semibold text-white bg-destructive hover:bg-destructive/90 rounded transition"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="text-[11px] text-destructive font-medium text-center">
                    50 x 50px &nbsp; &nbsp; Max: 10KB
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-semibold rounded shadow-xs transition"
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
          MODAL 3: NEW INVENTORY DIVISION (TRIGGERED BY + NEXT TO DIVISION*)
          ========================================================================= */}
      {isNewDivisionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-300 w-full max-w-xl rounded shadow-2xl overflow-hidden text-slate-800 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200">
              <h2 className="text-base font-semibold text-foreground">New Inventory Division</h2>
              <button
                onClick={() => setIsNewDivisionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSaveQuickDivision} className="p-5 space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-6">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Division Name*
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={quickDivisionForm.name}
                    onChange={(e) =>
                      setQuickDivisionForm({ ...quickDivisionForm, name: e.target.value })
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="sm:col-span-6">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category*
                  </label>
                  <select
                    value={quickDivisionForm.categoryName}
                    onChange={(e) => {
                      const sel = e.target.value;
                      const c = OMEGA_DIVISION_CATEGORIES.find((it) => it.CATEGORYNAME === sel);
                      setQuickDivisionForm({
                        ...quickDivisionForm,
                        categoryName: sel,
                        categoryId: c ? c.CATEGORYID : 6
                      });
                    }}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-primary"
                  >
                    {OMEGA_DIVISION_CATEGORIES.map((c) => (
                      <option key={c.CATEGORYID} value={c.CATEGORYNAME}>
                        {c.CATEGORYNAME}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sorting
                  </label>
                  <input
                    type="number"
                    value={quickDivisionForm.sorting}
                    onChange={(e) =>
                      setQuickDivisionForm({
                        ...quickDivisionForm,
                        sorting: Number(e.target.value) || 1
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="sm:col-span-8">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Second Lang Name
                  </label>
                  <input
                    type="text"
                    value={quickDivisionForm.secondLang}
                    onChange={(e) =>
                      setQuickDivisionForm({ ...quickDivisionForm, secondLang: e.target.value })
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Image Section Card */}
              <div className="border border-slate-200 rounded overflow-hidden">
                <div className="bg-background px-4 py-2 border-b border-slate-200 text-xs font-bold text-slate-800">
                  Image
                </div>
                <div className="p-4 flex flex-col items-center">
                  <div className="w-48 h-36 bg-muted border border-dashed border-slate-300 rounded flex items-center justify-center mb-3 overflow-hidden">
                    {quickDivisionForm.image ? (
                      <img
                        src={quickDivisionForm.image}
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
                      onClick={() => handleImageUpload('division')}
                      className="px-3 py-1 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded transition"
                    >
                      Select image
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDivisionForm({ ...quickDivisionForm, image: '' })}
                      className="px-3 py-1 text-xs font-semibold text-white bg-destructive hover:bg-destructive/90 rounded transition"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="text-[11px] text-destructive font-medium text-center">
                    50 x 50px &nbsp; &nbsp; Max: 10KB
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-semibold rounded shadow-xs transition"
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
          MODAL 4: EDIT INVENTORY DIVISION (TRIGGERED BY EDIT PEN NEXT TO DIVISION*)
          ========================================================================= */}
      {isEditDivisionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-300 w-full max-w-xl rounded shadow-2xl overflow-hidden text-slate-800 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200">
              <h2 className="text-base font-semibold text-foreground">Edit Inventory Division</h2>
              <button
                onClick={() => setIsEditDivisionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSaveEditDivision} className="p-5 space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ID</label>
                  <input
                    type="text"
                    disabled
                    value={editDivisionForm.divisionId}
                    className="w-full px-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded text-slate-500 font-mono"
                  />
                </div>

                <div className="sm:col-span-9">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Division Name*
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={editDivisionForm.name}
                    onChange={(e) =>
                      setEditDivisionForm({ ...editDivisionForm, name: e.target.value })
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="sm:col-span-6">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category*
                  </label>
                  <select
                    value={editDivisionForm.categoryName}
                    onChange={(e) => {
                      const sel = e.target.value;
                      const c = OMEGA_DIVISION_CATEGORIES.find((it) => it.CATEGORYNAME === sel);
                      setEditDivisionForm({
                        ...editDivisionForm,
                        categoryName: sel,
                        categoryId: c ? c.CATEGORYID : 6
                      });
                    }}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-primary"
                  >
                    {OMEGA_DIVISION_CATEGORIES.map((c) => (
                      <option key={c.CATEGORYID} value={c.CATEGORYNAME}>
                        {c.CATEGORYNAME}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-6">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sorting
                  </label>
                  <input
                    type="number"
                    value={editDivisionForm.sorting}
                    onChange={(e) =>
                      setEditDivisionForm({
                        ...editDivisionForm,
                        sorting: Number(e.target.value) || 1
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="sm:col-span-12">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Second Lang Name
                  </label>
                  <input
                    type="text"
                    value={editDivisionForm.secondLang}
                    onChange={(e) =>
                      setEditDivisionForm({ ...editDivisionForm, secondLang: e.target.value })
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Image Section Card */}
              <div className="border border-slate-200 rounded overflow-hidden">
                <div className="bg-background px-4 py-2 border-b border-slate-200 text-xs font-bold text-slate-800">
                  Image
                </div>
                <div className="p-4 flex flex-col items-center">
                  <div className="w-48 h-36 bg-muted border border-dashed border-slate-300 rounded flex items-center justify-center mb-3 overflow-hidden">
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
                      onClick={() => handleImageUpload('division_edit')}
                      className="px-3 py-1 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded transition"
                    >
                      Select image
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditDivisionForm({ ...editDivisionForm, image: '' })}
                      className="px-3 py-1 text-xs font-semibold text-white bg-destructive hover:bg-destructive/90 rounded transition"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="text-[11px] text-destructive font-medium text-center">
                    50 x 50px &nbsp; &nbsp; Max: 10KB
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-semibold rounded shadow-xs transition"
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
          MODAL 5: GROUP SORTING MODAL (FROM ACTIONS -> SORTING)
          ========================================================================= */}
      {isSortingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-300 w-full max-w-md rounded shadow-2xl overflow-hidden text-slate-800 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
              <h2 className="text-base font-semibold text-foreground">Sorting</h2>
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
                    <th className="px-3 py-2 w-1/3">Group</th>
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
                            className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-primary"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => adjustSortingItem(item.id, 1)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-primary"
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
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-semibold rounded shadow-xs transition"
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
          MODAL 6: WATCH TUTORIAL GUIDE
          ========================================================================= */}
      {isTutorialOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-300 w-full max-w-xl rounded shadow-2xl overflow-hidden text-slate-800 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-3.5 bg-primary text-white">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <h2 className="text-sm font-semibold">Inventory Groups Tutorial</h2>
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
                  <div className="font-bold mb-1">About Inventory Groups</div>
                  Inventory Groups structure items within divisions (e.g. Jars 509, Assembled Items Per 1, Bottles, CLASSIC-C/R, Demijohn, JAR, Plastic Bottles, etc.) and define their default accounting accounts, tax assignments, and e-commerce configurations.
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-sm">Key Capabilities:</h3>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600 leading-relaxed">
                  <li>
                    <strong>Search &amp; Division Filtering:</strong> Live filter across group names, other descriptions, and filter by any of the 35 inventory divisions.
                  </li>
                  <li>
                    <strong>+ New Group:</strong> Creates an inventory group linked to a division with other description, secondary language, accounting accounts, tax selections, and e-commerce image.
                  </li>
                  <li>
                    <strong>+ Button Next To Division*:</strong> Creates a new inventory division on the fly without leaving the group modal.
                  </li>
                  <li>
                    <strong>Edit Pen Next To Division*:</strong> Edits the selected division directly on the fly.
                  </li>
                  <li>
                    <strong>Edit Group:</strong> Opens the complete group edit modal matching the authentic Omega CloudPOS system with ID, accounting, tax, and image controls.
                  </li>
                  <li>
                    <strong>Actions &gt; Sorting:</strong> Reorder group display sorting with numeric values or up/down shift controls.
                  </li>
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setIsTutorialOpen(false)}
                  className="px-4 py-1.5 bg-primary text-white rounded text-xs font-semibold hover:bg-primary/90"
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
