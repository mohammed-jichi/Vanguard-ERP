'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  OmegaScreen,
  OmegaGroup,
  OmegaScreenItem,
  OmegaPredefinedCategory,
  OMEGA_INITIAL_SCREENS,
  OMEGA_GROUPS,
  OMEGA_INITIAL_SHOWLABELS_SCREEN1,
  OMEGA_PREDEFINED_CATEGORIES,
  OMEGA_COLORS,
  isDarkColor,
  hexToRgb
} from '@/lib/omegaScreenData';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

export default function ScreensView() {
  // Navigation & View Mode
  const [viewMode, setViewMode] = useState<'list' | 'setup'>('list');
  const [screensList, setScreensList] = useState<OmegaScreen[]>(OMEGA_INITIAL_SCREENS);
  const [selectedScreenId, setSelectedScreenId] = useState<number>(1);

  // Layout storage for all screens: Map from screenId to 40-cell array
  const [screensLayoutMap, setScreensLayoutMap] = useState<Record<number, OmegaScreenItem[]>>({
    1: OMEGA_INITIAL_SHOWLABELS_SCREEN1,
    2: Array.from({ length: 40 }, (_, idx) => ({
      LABELNUMBER: idx + 1,
      LABELNAME: idx < 12 ? `جبنة صنف ${idx + 1}` : '',
      STATUS: idx < 12 ? -1 : 0,
      COLOR: '15395833',
      PIC: null,
      PRODUCTID: 900 + idx,
      VBRED: 249,
      VBGREEN: 235,
      VBBLUE: 234,
      SCREEN_DET_ID: 2
    })),
    3: Array.from({ length: 40 }, (_, idx) => ({
      LABELNUMBER: idx + 1,
      LABELNAME: idx < 15 ? `زيتون صنف ${idx + 1}` : '',
      STATUS: idx < 15 ? -1 : 0,
      COLOR: '15395833',
      PIC: null,
      PRODUCTID: 100 + idx,
      VBRED: 235,
      VBGREEN: 245,
      VBBLUE: 234,
      SCREEN_DET_ID: 3
    }))
  });

  // Current Screen Designer 40 Cells
  const currentShowlabels = useMemo(() => {
    if (screensLayoutMap[selectedScreenId]) {
      return screensLayoutMap[selectedScreenId];
    }
    // Return empty 40 cells
    return Array.from({ length: 40 }, (_, idx) => ({
      LABELNUMBER: idx + 1,
      LABELNAME: '',
      STATUS: 0,
      COLOR: '15395833',
      PIC: null,
      PRODUCTID: 0,
      VBRED: 240,
      VBGREEN: 240,
      VBBLUE: 240,
      SCREEN_DET_ID: selectedScreenId
    }));
  }, [screensLayoutMap, selectedScreenId]);

  // Designer Active Selection
  const [activePickerCellIndex, setActivePickerCellIndex] = useState<number | null>(null);
  const [leftPanelMode, setLeftPanelMode] = useState<'screens' | 'groups' | 'items' | 'groupsWithItems'>('groups');
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [leftPanelSearch, setLeftPanelSearch] = useState<string>('');

  // Screens List Filters & Sorting
  const [listSearch, setListSearch] = useState<string>('');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [sorting, setSorting] = useState<{ field: 'SCRBRANCHID' | 'SCREENNAME'; dir: 'asc' | 'desc' }>({
    field: 'SCRBRANCHID',
    dir: 'asc'
  });

  // Toast System
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'info' });
  const showToast = (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3500);
  };

  // Modals state
  const [isGroupScreensModalOpen, setIsGroupScreensModalOpen] = useState(false);
  const [isNewScreenModalOpen, setIsNewScreenModalOpen] = useState(false);
  const [isEditScreenModalOpen, setIsEditScreenModalOpen] = useState(false);
  const [isColorPickerModalOpen, setIsColorPickerModalOpen] = useState(false);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);

  // Group Screens Modal Selection
  const [selectedGroupsForScreens, setSelectedGroupsForScreens] = useState<Record<number, boolean>>({});
  const [groupModalSearch, setGroupModalSearch] = useState('');

  // New Screen Form State
  const [newScreenName, setNewScreenName] = useState('');
  const [newScreenImage, setNewScreenImage] = useState<string | null>(null);
  const [newScreenPredefined, setNewScreenPredefined] = useState<string>('');
  const [newScreenBranches, setNewScreenBranches] = useState<Record<string, boolean>>({
    'branch_1': false,
    'branch_2': false,
    'branch_3': false
  });
  const [newScreenImageCollapsed, setNewScreenImageCollapsed] = useState(false);
  const [newScreenBranchCollapsed, setNewScreenBranchCollapsed] = useState(false);

  // Edit Screen Form State
  const [editScreenTarget, setEditScreenTarget] = useState<OmegaScreen | null>(null);
  const [editScreenName, setEditScreenName] = useState('');
  const [editScreenImage, setEditScreenImage] = useState<string | null>(null);
  const [editScreenBranches, setEditScreenBranches] = useState<Record<string, boolean>>({
    'branch_1': false,
    'branch_2': false,
    'branch_3': false
  });
  const [editScreenImageCollapsed, setEditScreenImageCollapsed] = useState(false);
  const [editScreenBranchCollapsed, setEditScreenBranchCollapsed] = useState(false);

  // Color Picker State
  const [applyColorToAll, setApplyColorToAll] = useState(false);

  // Copy Screen State
  const [copySourceScreenId, setCopySourceScreenId] = useState<number>(1);

  // Filtered Screens in List View
  const filteredScreens = useMemo(() => {
    let result = [...screensList];
    if (listSearch.trim()) {
      const q = listSearch.toLowerCase();
      result = result.filter(s => s.SCREENNAME.toLowerCase().includes(q));
    }
    if (branchFilter !== 'all') {
      const bId = parseInt(branchFilter, 10);
      result = result.filter(s => s.BRANCHID === bId || s.BRANCHID === 1);
    }
    result.sort((a, b) => {
      if (sorting.field === 'SCRBRANCHID') {
        return sorting.dir === 'asc' ? a.SCRBRANCHID - b.SCRBRANCHID : b.SCRBRANCHID - a.SCRBRANCHID;
      } else {
        return sorting.dir === 'asc'
          ? a.SCREENNAME.localeCompare(b.SCREENNAME)
          : b.SCREENNAME.localeCompare(a.SCREENNAME);
      }
    });
    return result;
  }, [screensList, listSearch, branchFilter, sorting]);

  // Autocomplete Suggestions for New Screen
  const groupAutocompleteSuggestions = useMemo(() => {
    if (!newScreenName.trim() || newScreenName.length < 2) return [];
    const q = newScreenName.toLowerCase();
    return OMEGA_GROUPS.filter(g => g.GROUPNAME.toLowerCase().includes(q)).slice(0, 5);
  }, [newScreenName]);

  // Left Panel Items (filtered)
  const leftPanelFilteredGroups = useMemo(() => {
    if (!leftPanelSearch.trim()) return OMEGA_GROUPS;
    const q = leftPanelSearch.toLowerCase();
    return OMEGA_GROUPS.filter(g => g.GROUPNAME.toLowerCase().includes(q));
  }, [leftPanelSearch]);

  // Derived items from the active group or screen
  const leftPanelItemsForGroup = useMemo(() => {
    if (!selectedGroupId) return [];
    const grp = OMEGA_GROUPS.find(g => g.GRIDBRANCHID === selectedGroupId);
    const grpName = grp ? grp.GROUPNAME : 'Item';
    // Generate realistic sub-items for this group
    return [
      { id: selectedGroupId * 100 + 1, name: `${grpName} - صنف أول`, pic: null },
      { id: selectedGroupId * 100 + 2, name: `${grpName} - صنف ممتاز`, pic: null },
      { id: selectedGroupId * 100 + 3, name: `${grpName} - عبوة عائلية`, pic: null },
      { id: selectedGroupId * 100 + 4, name: `${grpName} - عبوة صغيرة`, pic: null },
      { id: selectedGroupId * 100 + 5, name: `${grpName} - بالوزن (كيلو)`, pic: null },
      { id: selectedGroupId * 100 + 6, name: `${grpName} - نصف كيلو`, pic: null },
      { id: selectedGroupId * 100 + 7, name: `${grpName} - قطبة حبة كاملة`, pic: null },
      { id: selectedGroupId * 100 + 8, name: `${grpName} - معبأ بلدي`, pic: null }
    ].filter(it => !leftPanelSearch.trim() || it.name.toLowerCase().includes(leftPanelSearch.toLowerCase()));
  }, [selectedGroupId, leftPanelSearch]);

  // Map 40 cells into Omega visual order (5 cols x 8 rows)
  const touchGridCells = useMemo(() => {
    // Formula from Omega ERP:
    // for i = 0 to 40: if (i % 5 == 0) { line++; vlcc = line; } else { vlcc = vlcc + 8; }
    // Cell index in showlabels is vlcc - 1 (1-indexed in Omega showlabels)
    const grid: { cellNumber: number; item: OmegaScreenItem | null }[] = [];
    let line = 0;
    let vlcc = 0;

    for (let i = 0; i < 40; i++) {
      if (i % 5 === 0) {
        line++;
        vlcc = line;
      } else {
        vlcc = vlcc + 8;
      }
      const item = currentShowlabels.find(sl => sl.LABELNUMBER === vlcc) || null;
      grid.push({
        cellNumber: vlcc,
        item
      });
    }
    return grid;
  }, [currentShowlabels]);

  // Handlers for List Actions
  const handleOpenSetup = (screen: OmegaScreen) => {
    setSelectedScreenId(screen.SCRBRANCHID);
    setViewMode('setup');
    setActivePickerCellIndex(null);
  };

  const handleOpenEdit = (screen: OmegaScreen) => {
    setEditScreenTarget(screen);
    setEditScreenName(screen.SCREENNAME);
    setEditScreenImage(screen.SCPICTURE || null);
    setIsEditScreenModalOpen(true);
  };

  const handleDeleteScreen = (screen: OmegaScreen) => {
    if (screensList.length <= 1) {
      showToast('Cannot delete the only remaining screen.', 'warning');
      return;
    }
    if (confirm(`Are you sure you want to delete screen: "${screen.SCREENNAME}"?`)) {
      setScreensList(prev => prev.filter(s => s.SCRBRANCHID !== screen.SCRBRANCHID));
      if (selectedScreenId === screen.SCRBRANCHID) {
        setSelectedScreenId(screensList[0]?.SCRBRANCHID || 1);
      }
      showToast(`Screen "${screen.SCREENNAME}" deleted.`, 'success');
    }
  };

  // Handlers for Touch Designer Grid & Action Toolbar
  const handleSelectCell = (cellNumber: number) => {
    setActivePickerCellIndex(cellNumber);
  };

  const handleAssignItemToActiveCell = (name: string, productId: number) => {
    if (activePickerCellIndex === null) {
      showToast('Select a target box on the right first.', 'warning');
      return;
    }
    // Update active cell with item name
    const updated = [...currentShowlabels];
    const cellIdx = updated.findIndex(c => c.LABELNUMBER === activePickerCellIndex);
    if (cellIdx !== -1) {
      updated[cellIdx] = {
        ...updated[cellIdx],
        LABELNAME: name,
        PRODUCTID: productId,
        STATUS: -1
      };
    } else {
      updated.push({
        LABELNUMBER: activePickerCellIndex,
        LABELNAME: name,
        STATUS: -1,
        COLOR: '15395833',
        PIC: null,
        PRODUCTID: productId,
        VBRED: 249,
        VBGREEN: 235,
        VBBLUE: 234,
        SCREEN_DET_ID: selectedScreenId
      });
    }
    setScreensLayoutMap(prev => ({
      ...prev,
      [selectedScreenId]: updated
    }));
    showToast(`Assigned "${name}" to cell #${activePickerCellIndex}`, 'info');
  };

  const handleApplyColor = (colorHex: string) => {
    const [r, g, b] = hexToRgb(colorHex);
    const updated = [...currentShowlabels];

    if (applyColorToAll) {
      // Color all 40 items
      for (let i = 0; i < updated.length; i++) {
        updated[i] = {
          ...updated[i],
          COLOR: colorHex,
          VBRED: r,
          VBGREEN: g,
          VBBLUE: b
        };
      }
      setScreensLayoutMap(prev => ({
        ...prev,
        [selectedScreenId]: updated
      }));
      showToast('Applied color to all items on this screen', 'success');
    } else {
      if (activePickerCellIndex === null) {
        showToast('Nothing is selected!', 'warning');
        return;
      }
      const cellIdx = updated.findIndex(c => c.LABELNUMBER === activePickerCellIndex);
      if (cellIdx !== -1) {
        updated[cellIdx] = {
          ...updated[cellIdx],
          COLOR: colorHex,
          VBRED: r,
          VBGREEN: g,
          VBBLUE: b
        };
        setScreensLayoutMap(prev => ({
          ...prev,
          [selectedScreenId]: updated
        }));
        showToast(`Color updated for cell #${activePickerCellIndex}`, 'success');
      }
    }
    setIsColorPickerModalOpen(false);
  };

  const handleClearScreen = () => {
    if (confirm('This option will erase this screen. Are you sure you want to delete it?')) {
      const cleared = Array.from({ length: 40 }, (_, idx) => ({
        LABELNUMBER: idx + 1,
        LABELNAME: '',
        STATUS: 0,
        COLOR: '15395833',
        PIC: null,
        PRODUCTID: 0,
        VBRED: 240,
        VBGREEN: 240,
        VBBLUE: 240,
        SCREEN_DET_ID: selectedScreenId
      }));
      setScreensLayoutMap(prev => ({
        ...prev,
        [selectedScreenId]: cleared
      }));
      showToast('Screen layout cleared', 'info');
    }
  };

  const handleClearItem = () => {
    if (activePickerCellIndex === null) {
      showToast('Select an item to clear first!', 'warning');
      return;
    }
    const updated = [...currentShowlabels];
    const cellIdx = updated.findIndex(c => c.LABELNUMBER === activePickerCellIndex);
    if (cellIdx !== -1) {
      updated[cellIdx] = {
        ...updated[cellIdx],
        LABELNAME: '',
        PRODUCTID: 0,
        STATUS: 0,
        PIC: null
      };
      setScreensLayoutMap(prev => ({
        ...prev,
        [selectedScreenId]: updated
      }));
      showToast(`Cell #${activePickerCellIndex} cleared`, 'info');
    }
  };

  const handleClearAllPictures = () => {
    if (confirm('Delete all pictures from this screen?')) {
      const updated = currentShowlabels.map(c => ({ ...c, PIC: null }));
      setScreensLayoutMap(prev => ({
        ...prev,
        [selectedScreenId]: updated
      }));
      showToast('Pictures removed from screen', 'info');
    }
  };

  const handleAutomaticSetup = () => {
    // Fill first 40 items from active group or default catalog
    const grp = OMEGA_GROUPS.find(g => g.GRIDBRANCHID === (selectedGroupId || 50));
    const prefix = grp ? grp.GROUPNAME : 'منتج زهرة';
    const updated = [...currentShowlabels];

    for (let i = 0; i < 40; i++) {
      const cellNum = i + 1;
      const cellIdx = updated.findIndex(c => c.LABELNUMBER === cellNum);
      const newLabel = `${prefix} #${i + 1}`;
      if (cellIdx !== -1) {
        updated[cellIdx] = {
          ...updated[cellIdx],
          LABELNAME: newLabel,
          PRODUCTID: 5000 + i,
          STATUS: -1,
          VBRED: 249,
          VBGREEN: 235,
          VBBLUE: 234
        };
      }
    }
    setScreensLayoutMap(prev => ({
      ...prev,
      [selectedScreenId]: updated
    }));
    showToast('Automatic setup filled 40 cells from group items', 'success');
  };

  const handleExecCopyScreen = () => {
    if (!screensLayoutMap[copySourceScreenId]) {
      showToast('Source screen has no data to copy.', 'warning');
      return;
    }
    const sourceData = screensLayoutMap[copySourceScreenId];
    const copied = sourceData.map(c => ({
      ...c,
      SCREEN_DET_ID: selectedScreenId
    }));
    setScreensLayoutMap(prev => ({
      ...prev,
      [selectedScreenId]: copied
    }));
    setIsCopyModalOpen(false);
    showToast(`Copied layout from screen #${copySourceScreenId}`, 'success');
  };

  const handleSaveScreenSetup = () => {
    showToast('Screen Saved! Layout and buttons committed to workstation POS.', 'success');
  };

  // Modals Save Handlers
  const handleSaveNewScreen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScreenName.trim()) {
      showToast('Screen name is required', 'error');
      return;
    }
    const exists = screensList.some(s => s.SCREENNAME.toLowerCase() === newScreenName.trim().toLowerCase());
    if (exists) {
      showToast('Screen Name already exists', 'error');
      return;
    }
    const newId = Math.max(...screensList.map(s => s.SCRBRANCHID), 0) + 1;
    const newScr: OmegaScreen = {
      ID: 7350 + newId,
      SCRBRANCHID: newId,
      BRAND_ID: 9606,
      BRANCHID: 1,
      SCREENNUMBER: newId,
      SCREENNAME: newScreenName.trim(),
      SCPICTURE: newScreenImage || '',
      TOTALEXCEPTIONS: 0,
      sd_screens_branch_exception: []
    };
    setScreensList(prev => [...prev, newScr]);
    setIsNewScreenModalOpen(false);
    setNewScreenName('');
    setNewScreenImage(null);
    showToast('Screen saved successfully', 'success');
  };

  const handleSaveEditScreen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editScreenTarget || !editScreenName.trim()) return;
    setScreensList(prev =>
      prev.map(s =>
        s.SCRBRANCHID === editScreenTarget.SCRBRANCHID
          ? { ...s, SCREENNAME: editScreenName.trim(), SCPICTURE: editScreenImage || '' }
          : s
      )
    );
    setIsEditScreenModalOpen(false);
    showToast('Screen updated successfully', 'success');
  };

  const handleCreateScreensFromGroups = () => {
    const selectedIds = Object.keys(selectedGroupsForScreens)
      .filter(id => selectedGroupsForScreens[parseInt(id, 10)])
      .map(id => parseInt(id, 10));

    if (selectedIds.length === 0) {
      showToast('Please select at least one group.', 'warning');
      return;
    }

    let nextId = Math.max(...screensList.map(s => s.SCRBRANCHID), 0) + 1;
    const newScreens: OmegaScreen[] = [];

    for (const gid of selectedIds) {
      const grp = OMEGA_GROUPS.find(g => g.GRIDBRANCHID === gid);
      if (grp) {
        newScreens.push({
          ID: 7350 + nextId,
          SCRBRANCHID: nextId,
          BRAND_ID: 9606,
          BRANCHID: 1,
          SCREENNUMBER: nextId,
          SCREENNAME: grp.GROUPNAME,
          SCPICTURE: grp.GRPICTURE || '',
          TOTALEXCEPTIONS: 0,
          sd_screens_branch_exception: []
        });
        nextId++;
      }
    }

    setScreensList(prev => [...prev, ...newScreens]);
    setIsGroupScreensModalOpen(false);
    setSelectedGroupsForScreens({});
    showToast(`Created ${newScreens.length} screens from selected groups!`, 'success');
  };

  return (
    <div className="w-full min-h-screen bg-background text-slate-800 p-4 font-sans antialiased text-left relative">
      {/* Toast Banner */}
      {toast.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-xl border flex items-center gap-3 transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-700'
              : toast.type === 'error'
              ? 'bg-rose-600 text-white border-rose-700'
              : toast.type === 'warning'
              ? 'bg-amber-500 text-white border-amber-600'
              : 'bg-blue-600 text-white border-blue-700'
          }`}
        >
          <span className="text-sm font-semibold">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(prev => ({ ...prev, show: false }))}
            className="text-white/80 hover:text-white ml-2 text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. SCREENS LIST VIEW (Omega ScreensView)                                   */}
      {/* ========================================================================= */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {/* Header & Breadcrumb */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[#1e3a2b] flex items-center gap-2">
                <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Screens
              </h1>
              <nav className="text-xs text-slate-500 flex items-center gap-1.5 mt-1 font-medium">
                <Link href="/backoffice" className="text-blue-600 hover:underline">
                  Home
                </Link>
                <span>/</span>
                <span className="text-slate-700 font-semibold">Screens</span>
              </nav>
            </div>

            {/* Quick Actions (Screen Setup Direct Jump) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('setup')}
                className="px-4 py-2 bg-primary hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Screen Setup Designer
              </button>
            </div>
          </div>

          {/* Filter & Toolbar Row */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* Search */}
              <div className="md:col-span-4 relative">
                <input
                  type="search"
                  value={listSearch}
                  onChange={e => setListSearch(e.target.value)}
                  placeholder="Search screens..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
                />
                <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Branch Filter Dropdown */}
              <div className="md:col-span-3">
                <select
                  value={branchFilter}
                  onChange={e => setBranchFilter(e.target.value)}
                  className="w-full py-2 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white text-slate-700 font-medium"
                >
                  <option value="1">00001 - Main Branch</option>
                </select>
              </div>

              {/* Action Toolbar */}
              <div className="md:col-span-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGroupScreensModalOpen(true)}
                  className="px-3 py-2 bg-primary hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap"
                >
                  Create Screens Based On Groups
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNewScreenName('');
                    setNewScreenImage(null);
                    setIsNewScreenModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-primary hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span className="text-sm leading-none">+</span>
                  <span>New</span>
                </button>
              </div>
            </div>
          </div>

          {/* Screens Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
                    <th
                      className="py-3 px-4 w-16 cursor-pointer hover:bg-slate-200 transition-colors select-none"
                      onClick={() =>
                        setSorting(prev => ({
                          field: 'SCRBRANCHID',
                          dir: prev.field === 'SCRBRANCHID' && prev.dir === 'asc' ? 'desc' : 'asc'
                        }))
                      }
                    >
                      <div className="flex items-center gap-1">
                        <span>#</span>
                        {sorting.field === 'SCRBRANCHID' && (
                          <span className="text-blue-600">{sorting.dir === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th
                      className="py-3 px-4 cursor-pointer hover:bg-slate-200 transition-colors select-none"
                      onClick={() =>
                        setSorting(prev => ({
                          field: 'SCREENNAME',
                          dir: prev.field === 'SCREENNAME' && prev.dir === 'asc' ? 'desc' : 'asc'
                        }))
                      }
                    >
                      <div className="flex items-center gap-1">
                        <span>Name</span>
                        {sorting.field === 'SCREENNAME' && (
                          <span className="text-blue-600">{sorting.dir === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th className="py-3 px-4 w-32 text-center">Restrictions</th>
                    <th className="py-3 px-4 w-36 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
                  {filteredScreens.map(row => (
                    <tr key={row.SCRBRANCHID} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-500">{row.SCRBRANCHID}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-500 font-bold">
                          {row.SCREENNAME.charAt(0)}
                        </div>
                        <span>{row.SCREENNAME}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {row.TOTALEXCEPTIONS > 0 ? (
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700 border border-red-200"
                            title="This screen is excluded from some branches."
                          >
                            {row.TOTALEXCEPTIONS} Exception
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Eye / Setup */}
                          <button
                            type="button"
                            onClick={() => handleOpenSetup(row)}
                            title="Screen Setup"
                            className="p-1.5 bg-primary hover:bg-blue-700 text-white rounded shadow-2xs transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>

                          {/* Pencil / Edit */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(row)}
                            title="Edit Screen Properties"
                            className="p-1.5 bg-primary hover:bg-blue-700 text-white rounded shadow-2xs transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>

                          {/* Trash / Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteScreen(row)}
                            title="Delete Screen"
                            className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded shadow-2xs transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredScreens.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 font-medium">
                        No screens match your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
              <span>
                Showing <strong className="text-slate-800">1</strong> to{' '}
                <strong className="text-slate-800">{filteredScreens.length}</strong> of{' '}
                <strong className="text-slate-800">{screensList.length}</strong> screens
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled
                  className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-400 cursor-not-allowed text-[11px]"
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="px-2.5 py-1 rounded border border-blue-500 bg-blue-600 text-white font-bold text-[11px]"
                >
                  1
                </button>
                <button
                  type="button"
                  disabled
                  className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-400 cursor-not-allowed text-[11px]"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SCREEN SETUP DESIGNER VIEW (Omega ScreenSetup)                          */}
      {/* ========================================================================= */}
      {viewMode === 'setup' && (
        <div className="space-y-4">
          {/* Header & Breadcrumb */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[#1e3a2b] flex items-center gap-2">
                <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Screen Setup Designer
              </h1>
              <nav className="text-xs text-slate-500 flex items-center gap-1.5 mt-1 font-medium">
                <Link href="/backoffice" className="text-blue-600 hover:underline">
                  Home
                </Link>
                <span>/</span>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Screens
                </button>
                <span>/</span>
                <span className="text-slate-700 font-semibold">Screen Setup</span>
              </nav>
            </div>

            <button
              type="button"
              onClick={() => setViewMode('list')}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 shadow-2xs transition-colors flex items-center gap-1.5"
            >
              ← Back to Screens List
            </button>
          </div>

          {/* Screen Selection Dropdown */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
            <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Active Screen:</label>
            <div className="w-72">
              <select
                value={selectedScreenId}
                onChange={e => {
                  setSelectedScreenId(parseInt(e.target.value, 10));
                  setActivePickerCellIndex(null);
                }}
                className="w-full py-2 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-bold text-slate-900"
              >
                {screensList.map(s => (
                  <option key={s.SCRBRANCHID} value={s.SCRBRANCHID}>
                    {s.SCRBRANCHID} — {s.SCREENNAME}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Workarea Container (#f6f6f6) */}
          <div className="bg-[#f6f6f6] rounded-xl border-2 border-slate-300 p-4 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Left Panel (Groups / Items / Screens list) */}
              <div className="lg:col-span-3 bg-white rounded-lg border border-slate-200 p-3 shadow-2xs flex flex-col h-[680px]">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-600">
                    {leftPanelMode === 'screens' && 'Screens List'}
                    {leftPanelMode === 'groups' && 'Groups Catalog'}
                    {leftPanelMode === 'groupsWithItems' && (selectedGroupId ? 'Group Items' : 'Select Group')}
                    {leftPanelMode === 'items' && 'Search Items'}
                  </span>
                  {leftPanelMode === 'groupsWithItems' && selectedGroupId && (
                    <button
                      type="button"
                      onClick={() => setSelectedGroupId(null)}
                      className="text-[11px] text-blue-600 hover:underline font-bold"
                    >
                      ← All Groups
                    </button>
                  )}
                </div>

                {/* Search Input for Left Panel */}
                {(leftPanelMode === 'groups' || leftPanelMode === 'items' || (leftPanelMode === 'groupsWithItems' && selectedGroupId)) && (
                  <div className="mb-2">
                    <input
                      type="search"
                      value={leftPanelSearch}
                      onChange={e => setLeftPanelSearch(e.target.value)}
                      placeholder={leftPanelMode === 'groups' ? 'Search Group...' : 'Search Item...'}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none"
                    />
                  </div>
                )}

                {/* Left Panel List Content */}
                <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {/* Mode: SCREENS */}
                  {leftPanelMode === 'screens' &&
                    screensList.map(scr => (
                      <button
                        key={scr.SCRBRANCHID}
                        type="button"
                        onClick={() => {
                          setSelectedScreenId(scr.SCRBRANCHID);
                          setActivePickerCellIndex(null);
                        }}
                        className={`w-full text-left px-3 py-2 rounded text-xs font-semibold transition-colors border ${
                          selectedScreenId === scr.SCRBRANCHID
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {scr.SCREENNAME}
                      </button>
                    ))}

                  {/* Mode: GROUPS */}
                  {leftPanelMode === 'groups' &&
                    leftPanelFilteredGroups.map(grp => (
                      <button
                        key={grp.GRIDBRANCHID}
                        type="button"
                        onClick={() => {
                          handleAssignItemToActiveCell(grp.GROUPNAME, grp.GRIDBRANCHID);
                        }}
                        className="w-full text-left px-3 py-2 rounded text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300 transition-colors"
                      >
                        {grp.GROUPNAME}
                      </button>
                    ))}

                  {/* Mode: GROUPS WITH ITEMS - Drilldown */}
                  {leftPanelMode === 'groupsWithItems' && !selectedGroupId &&
                    leftPanelFilteredGroups.map(grp => (
                      <button
                        key={grp.GRIDBRANCHID}
                        type="button"
                        onClick={() => setSelectedGroupId(grp.GRIDBRANCHID)}
                        className="w-full text-left px-3 py-2 rounded text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 hover:bg-blue-50 hover:text-blue-800 transition-colors flex items-center justify-between"
                      >
                        <span>{grp.GROUPNAME}</span>
                        <span className="text-slate-400">→</span>
                      </button>
                    ))}

                  {leftPanelMode === 'groupsWithItems' && selectedGroupId &&
                    leftPanelItemsForGroup.map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleAssignItemToActiveCell(item.name, item.id)}
                        className="w-full text-left px-3 py-2 rounded text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300 transition-colors"
                      >
                        {item.name}
                      </button>
                    ))}
                </div>
              </div>

              {/* Right Panel (40-Cell Touch Screen Grid & Action Toolbar) */}
              <div className="lg:col-span-9 flex flex-col items-center">
                {/* Visual Touch Screen Grid (40 Cells: 5 cols x 8 rows) */}
                <div
                  id="firstRightPanel"
                  className="w-full max-w-4xl bg-slate-200/60 p-3.5 rounded-xl border border-slate-300 shadow-inner"
                >
                  <div className="grid grid-cols-5 gap-1.5">
                    {touchGridCells.map(({ cellNumber, item }) => {
                      const isSelected = activePickerCellIndex === cellNumber;
                      const hasText = item && item.LABELNAME.trim().length > 0;
                      const bgColor = hasText
                        ? `rgb(${item.VBRED}, ${item.VBGREEN}, ${item.VBBLUE})`
                        : '#e2e8f0';
                      const isDark = hasText ? isDarkColor(bgColor) : false;
                      const textColor = isDark ? '#ffffff' : hasText ? '#0f172a' : '#94a3b8';

                      return (
                        <button
                          key={`picker-${cellNumber}`}
                          id={`picker${cellNumber}`}
                          type="button"
                          onClick={() => handleSelectCell(cellNumber)}
                          style={{
                            backgroundColor: bgColor,
                            color: textColor,
                            height: '52px',
                            outline: isSelected ? '3px solid #7b4f2f' : 'none',
                            outlineOffset: isSelected ? '1px' : '0',
                            boxShadow: isSelected
                              ? '0 0 0 2px rgba(255,255,255,0.7), 0 4px 6px -1px rgba(0,0,0,0.1)'
                              : '0 1px 2px rgba(0,0,0,0.05)'
                          }}
                          className={`p-1.5 rounded text-[11px] font-bold transition-all duration-150 relative select-none flex flex-col items-center justify-center text-center overflow-hidden hover:opacity-95 ${
                            isSelected ? 'z-10 scale-[1.02]' : ''
                          }`}
                        >
                          <span className="line-clamp-2 leading-tight">
                            {hasText ? item.LABELNAME : ''}
                          </span>
                          {!hasText && (
                            <span className="text-[9px] font-mono text-slate-400 opacity-60">
                              #{cellNumber}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Action Toolbar (`secondRightPanel`) */}
                <div id="secondRightPanel" className="w-full max-w-4xl mt-5 space-y-2 text-center">
                  {/* Row 1: Panels and Clears */}
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      id="screens"
                      type="button"
                      onClick={() => setLeftPanelMode('screens')}
                      className={`px-4 py-2 text-xs font-bold rounded shadow-xs transition-colors h-[42px] ${
                        leftPanelMode === 'screens'
                          ? 'bg-blue-800 text-white'
                          : 'bg-primary hover:bg-blue-700 text-white'
                      }`}
                    >
                      Screens
                    </button>

                    <button
                      id="groups"
                      type="button"
                      onClick={() => {
                        setLeftPanelMode('groups');
                        setSelectedGroupId(null);
                      }}
                      className={`px-4 py-2 text-xs font-bold rounded shadow-xs transition-colors h-[42px] ${
                        leftPanelMode === 'groups'
                          ? 'bg-blue-800 text-white'
                          : 'bg-primary hover:bg-blue-700 text-white'
                      }`}
                    >
                      Groups
                    </button>

                    <button
                      id="items"
                      type="button"
                      onClick={() => {
                        setLeftPanelMode('groupsWithItems');
                        setSelectedGroupId(null);
                      }}
                      className={`px-4 py-2 text-xs font-bold rounded shadow-xs transition-colors h-[42px] ${
                        leftPanelMode === 'groupsWithItems'
                          ? 'bg-blue-800 text-white'
                          : 'bg-primary hover:bg-blue-700 text-white'
                      }`}
                    >
                      Items
                    </button>

                    <button
                      id="clear"
                      type="button"
                      onClick={handleClearScreen}
                      className="px-4 py-2 bg-primary hover:bg-blue-700 text-white text-xs font-bold rounded shadow-xs transition-colors h-[42px]"
                    >
                      Clear Screen
                    </button>

                    <button
                      id="clearItem"
                      type="button"
                      onClick={handleClearItem}
                      className="px-4 py-2 bg-primary hover:bg-blue-700 text-white text-xs font-bold rounded shadow-xs transition-colors h-[42px]"
                    >
                      Clear Item
                    </button>

                    <button
                      id="automaticSetup"
                      type="button"
                      onClick={handleClearAllPictures}
                      className="px-4 py-2 bg-primary hover:bg-blue-700 text-white text-xs font-bold rounded shadow-xs transition-colors h-[42px]"
                    >
                      Clear Pictures
                    </button>
                  </div>

                  {/* Row 2: Color, Create Like, Automatic, Save */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <button
                      id="setcolorforitem"
                      type="button"
                      onClick={() => {
                        if (activePickerCellIndex === null) {
                          showToast('Select a target box on the right first.', 'warning');
                          return;
                        }
                        setApplyColorToAll(false);
                        setIsColorPickerModalOpen(true);
                      }}
                      className="px-4 py-2 bg-primary hover:bg-blue-700 text-white text-xs font-bold rounded shadow-xs transition-colors h-[42px]"
                    >
                      Color
                    </button>

                    <button
                      id="sameColor"
                      type="button"
                      onClick={() => {
                        setApplyColorToAll(true);
                        setIsColorPickerModalOpen(true);
                      }}
                      className="px-4 py-2 bg-primary hover:bg-blue-700 text-white text-xs font-bold rounded shadow-xs transition-colors h-[42px]"
                    >
                      Same Color
                    </button>

                    <button
                      id="copyScreen"
                      type="button"
                      onClick={() => setIsCopyModalOpen(true)}
                      className="px-4 py-2 bg-primary hover:bg-blue-700 text-white text-xs font-bold rounded shadow-xs transition-colors h-[42px]"
                    >
                      Create Like
                    </button>

                    <button
                      id="automaticSetupBtn"
                      type="button"
                      onClick={handleAutomaticSetup}
                      className="px-4 py-2 bg-primary hover:bg-blue-700 text-white text-xs font-bold rounded shadow-xs transition-colors h-[42px]"
                    >
                      Automatic Setup
                    </button>

                    {/* Authentic Green Save Button (#47995E, border #326132) */}
                    <button
                      id="save"
                      type="button"
                      onClick={handleSaveScreenSetup}
                      style={{
                        backgroundColor: '#47995E',
                        borderColor: '#326132'
                      }}
                      className="px-6 py-2 text-white text-xs font-bold rounded border shadow-sm hover:brightness-105 transition-all h-[42px] flex items-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MODALS SYSTEM                                                          */}
      {/* ========================================================================= */}

      {/* MODAL 1: Create Screens Based On Groups */}
      {isGroupScreensModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl border-2 border-border max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-white">
              <h5 className="font-bold text-muted-foreground text-base">Create Screens Based On Groups</h5>
              <button
                type="button"
                onClick={() => setIsGroupScreensModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Filter */}
              <input
                type="search"
                value={groupModalSearch}
                onChange={e => setGroupModalSearch(e.target.value)}
                placeholder="Filter groups..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none"
              />

              {/* Quick Select All */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Select groups to generate screens for:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const all: Record<number, boolean> = {};
                      OMEGA_GROUPS.forEach(g => (all[g.GRIDBRANCHID] = true));
                      setSelectedGroupsForScreens(all);
                    }}
                    className="text-blue-600 hover:underline font-bold"
                  >
                    Select All
                  </button>
                  <span>|</span>
                  <button
                    type="button"
                    onClick={() => setSelectedGroupsForScreens({})}
                    className="text-slate-500 hover:underline"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Groups Checkbox Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 p-2 bg-slate-50 rounded-lg border border-slate-200 max-h-80 overflow-y-auto">
                {OMEGA_GROUPS.filter(g => !groupModalSearch.trim() || g.GROUPNAME.toLowerCase().includes(groupModalSearch.toLowerCase())).map(grp => {
                  const checked = !!selectedGroupsForScreens[grp.GRIDBRANCHID];
                  return (
                    <label
                      key={grp.GRIDBRANCHID}
                      className="flex items-center gap-2.5 p-2 rounded hover:bg-white cursor-pointer select-none text-xs font-semibold text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={e => {
                          setSelectedGroupsForScreens(prev => ({
                            ...prev,
                            [grp.GRIDBRANCHID]: e.target.checked
                          }));
                        }}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span>{grp.GROUPNAME}</span>
                    </label>
                  );
                })}
              </div>

              {/* Footer action */}
              <div className="text-right pt-2">
                <button
                  type="button"
                  onClick={handleCreateScreensFromGroups}
                  className="px-5 py-2.5 bg-primary hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                >
                  Create Screens
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: New Screen */}
      {isNewScreenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl border border-slate-300 max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="font-bold text-slate-800 text-base">New Screen</h2>
              <button
                type="button"
                onClick={() => setIsNewScreenModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveNewScreen} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Predefined Screen Selector */}
              <div className="pb-3 border-b border-dashed border-slate-200">
                <label className="text-xs font-bold text-slate-700 block mb-1">Predefined Screen Template</label>
                <select
                  value={newScreenPredefined}
                  onChange={e => {
                    const sel = e.target.value;
                    setNewScreenPredefined(sel);
                    if (sel) {
                      const cat = OMEGA_PREDEFINED_CATEGORIES.find(c => c.name === sel);
                      if (cat) {
                        setNewScreenName(cat.name);
                        setNewScreenImage(cat.imageurl);
                      }
                    }
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-slate-50 focus:bg-white text-slate-800"
                >
                  <option value="">Select Predefined Screen (Optional)</option>
                  {OMEGA_PREDEFINED_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Screen Name Input & Group Autocomplete */}
              <div className="relative">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Screen Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newScreenName}
                  onChange={e => setNewScreenName(e.target.value)}
                  placeholder="e.g. زيتون بلدي أو عسل"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-slate-50 focus:bg-white text-slate-800 font-semibold"
                />

                {/* Autocomplete list */}
                {groupAutocompleteSuggestions.length > 0 && (
                  <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 overflow-hidden divide-y divide-slate-100">
                    {groupAutocompleteSuggestions.map(grp => (
                      <li
                        key={grp.GRIDBRANCHID}
                        onClick={() => setNewScreenName(grp.GROUPNAME)}
                        className="px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer font-medium"
                      >
                        {grp.GROUPNAME}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Collapsible Image Panel */}
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setNewScreenImageCollapsed(!newScreenImageCollapsed)}
                  className="w-full px-3.5 py-2.5 bg-slate-100 text-left text-xs font-bold text-slate-700 flex items-center justify-between"
                >
                  <span>Image</span>
                  <span>{newScreenImageCollapsed ? '▼' : '▲'}</span>
                </button>
                {!newScreenImageCollapsed && (
                  <div className="p-4 text-center bg-white space-y-3">
                    <div className="w-32 h-32 mx-auto rounded border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                      {newScreenImage ? (
                        <img src={newScreenImage} alt="Screen Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">No Image</span>
                      )}
                    </div>
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setNewScreenImage(
                            'https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/menu_categories/appetizers.png'
                          )
                        }
                        className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[11px] font-semibold"
                      >
                        Sample Icon
                      </button>
                      {newScreenImage && (
                        <button
                          type="button"
                          onClick={() => setNewScreenImage(null)}
                          className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-[11px] font-semibold"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Collapsible Branches Restriction */}
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setNewScreenBranchCollapsed(!newScreenBranchCollapsed)}
                  className="w-full px-3.5 py-2.5 bg-slate-100 text-left text-xs font-bold text-slate-700 flex items-center justify-between"
                >
                  <span>Branches Restriction</span>
                  <span>{newScreenBranchCollapsed ? '▼' : '▲'}</span>
                </button>
                {!newScreenBranchCollapsed && (
                  <div className="p-3 bg-white space-y-2 text-xs">
                    <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newScreenBranches['branch_1']}
                        onChange={e =>
                          setNewScreenBranches(prev => ({ ...prev, branch_1: e.target.checked }))
                        }
                        className="rounded text-blue-600"
                      />
                      <span>001 - Choueifat Main Facility</span>
                    </label>
                    <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newScreenBranches['branch_2']}
                        onChange={e =>
                          setNewScreenBranches(prev => ({ ...prev, branch_2: e.target.checked }))
                        }
                        className="rounded text-blue-600"
                      />
                      <span>002 - Beirut Distribution Hub</span>
                    </label>
                    <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newScreenBranches['branch_3']}
                        onChange={e =>
                          setNewScreenBranches(prev => ({ ...prev, branch_3: e.target.checked }))
                        }
                        className="rounded text-blue-600"
                      />
                      <span>003 - Saida Southern Center</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Save Button */}
              <div className="text-right pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 ml-auto"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Edit Screen */}
      {isEditScreenModalOpen && editScreenTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl border border-slate-300 max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="font-bold text-slate-800 text-base">Edit Screen</h2>
              <button
                type="button"
                onClick={() => setIsEditScreenModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveEditScreen} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Id & Screen Name */}
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-4">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Id</label>
                  <input
                    type="text"
                    disabled
                    value={editScreenTarget.SCRBRANCHID}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-slate-100 text-slate-500 font-mono font-bold"
                  />
                </div>
                <div className="col-span-8">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Screen Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editScreenName}
                    onChange={e => setEditScreenName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-slate-50 focus:bg-white text-slate-800 font-semibold"
                  />
                </div>
              </div>

              {/* Collapsible Image */}
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setEditScreenImageCollapsed(!editScreenImageCollapsed)}
                  className="w-full px-3.5 py-2.5 bg-slate-100 text-left text-xs font-bold text-slate-700 flex items-center justify-between"
                >
                  <span>Image</span>
                  <span>{editScreenImageCollapsed ? '▼' : '▲'}</span>
                </button>
                {!editScreenImageCollapsed && (
                  <div className="p-4 text-center bg-white space-y-3">
                    <div className="w-32 h-32 mx-auto rounded border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                      {editScreenImage ? (
                        <img src={editScreenImage} alt="Screen" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">No Image</span>
                      )}
                    </div>
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setEditScreenImage(
                            'https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/menu_categories/appetizers.png'
                          )
                        }
                        className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[11px] font-semibold"
                      >
                        Sample Icon
                      </button>
                      {editScreenImage && (
                        <button
                          type="button"
                          onClick={() => setEditScreenImage(null)}
                          className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-[11px] font-semibold"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Collapsible Branches Restriction */}
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setEditScreenBranchCollapsed(!editScreenBranchCollapsed)}
                  className="w-full px-3.5 py-2.5 bg-slate-100 text-left text-xs font-bold text-slate-700 flex items-center justify-between"
                >
                  <span>Branches Restriction</span>
                  <span>{editScreenBranchCollapsed ? '▼' : '▲'}</span>
                </button>
                {!editScreenBranchCollapsed && (
                  <div className="p-3 bg-white space-y-2 text-xs">
                    <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editScreenBranches['branch_1']}
                        onChange={e =>
                          setEditScreenBranches(prev => ({ ...prev, branch_1: e.target.checked }))
                        }
                        className="rounded text-blue-600"
                      />
                      <span>001 - Choueifat Main Facility</span>
                    </label>
                    <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editScreenBranches['branch_2']}
                        onChange={e =>
                          setEditScreenBranches(prev => ({ ...prev, branch_2: e.target.checked }))
                        }
                        className="rounded text-blue-600"
                      />
                      <span>002 - Beirut Distribution Hub</span>
                    </label>
                    <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editScreenBranches['branch_3']}
                        onChange={e =>
                          setEditScreenBranches(prev => ({ ...prev, branch_3: e.target.checked }))
                        }
                        className="rounded text-blue-600"
                      />
                      <span>003 - Saida Southern Center</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Save Button */}
              <div className="text-right pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 ml-auto"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Color Picker Modal (Authentic 160 Swatches Grid) */}
      {isColorPickerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl border border-slate-300 max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h5 className="font-bold text-slate-800 text-sm">Choose a color</h5>
              <button
                type="button"
                onClick={() => setIsColorPickerModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Swatches Grid: 16 rows of 10 columns */}
              <div className="grid grid-cols-10 gap-1.5 p-2 bg-slate-50 rounded-lg border border-slate-200 max-h-[380px] overflow-y-auto">
                {OMEGA_COLORS.map(colorHex => (
                  <button
                    key={colorHex}
                    type="button"
                    onClick={() => handleApplyColor(colorHex)}
                    style={{ backgroundColor: colorHex }}
                    className="w-full h-7 rounded border border-black/15 shadow-2xs hover:scale-115 hover:z-10 transition-transform active:scale-95"
                    title={colorHex}
                  />
                ))}
              </div>

              {/* Checkbox for applying to all items */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={applyColorToAll}
                    onChange={e => setApplyColorToAll(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Use this color for all items on this screen</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Copy From Another Screen Modal */}
      {isCopyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl border-2 border-border max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="font-bold text-slate-800 text-base">Copy From Another Screen</h2>
              <button
                type="button"
                onClick={() => setIsCopyModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Select Source Screen:</label>
                <select
                  value={copySourceScreenId}
                  onChange={e => setCopySourceScreenId(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-slate-50 font-semibold text-slate-800 focus:bg-white"
                >
                  {screensList
                    .filter(s => s.SCRBRANCHID !== selectedScreenId)
                    .map(s => (
                      <option key={s.SCRBRANCHID} value={s.SCRBRANCHID}>
                        {s.SCRBRANCHID} — {s.SCREENNAME}
                      </option>
                    ))}
                </select>
              </div>

              <div className="text-right pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleExecCopyScreen}
                  className="px-5 py-2 bg-primary hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 ml-auto"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Layout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
