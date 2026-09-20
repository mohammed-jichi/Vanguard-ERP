'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import {
  DepartmentItem,
  OMEGA_BRANCHES,
  INITIAL_OMEGA_DEPARTMENTS,
  COLOR_PALETTE
} from '@/lib/omegaDepartmentsData';

export default function AuthenticOmegaDepartmentsView() {
  // ---------------------------------------------------------------------------
  // Departments State (synced with localStorage & fallback to initial Omega data)
  // ---------------------------------------------------------------------------
  const [departments, setDepartments] = useState<DepartmentItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('vanguard_omega_departments');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.error('Error reading saved departments:', e);
      }
    }
    return INITIAL_OMEGA_DEPARTMENTS;
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('vanguard_omega_departments', JSON.stringify(departments));
    } catch (e) {
      console.error('Error saving departments:', e);
    }
  }, [departments]);

  // ---------------------------------------------------------------------------
  // Toolbar Filters: Search & Branch Filter
  // ---------------------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('allbranch');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ---------------------------------------------------------------------------
  // Modal States
  // ---------------------------------------------------------------------------
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [colorPickerTarget, setColorPickerTarget] = useState<'new' | 'edit'>('new');

  // Form States - New Department
  const [newDescription, setNewDescription] = useState('');
  const [newSorting, setNewSorting] = useState<string>('');
  const [newColor, setNewColor] = useState<string>('');
  const [newAccDept, setNewAccDept] = useState<string>('');
  const [newImage, setNewImage] = useState<string>('');
  const [newBranchRestrictions, setNewBranchRestrictions] = useState<Record<string, boolean>>({
    'Zeit w zaytoun ljanoub': false
  });

  // Form States - Edit Department
  const [editingDepartment, setEditingDepartment] = useState<DepartmentItem | null>(null);
  const [editId, setEditId] = useState<number>(0);
  const [editDescription, setEditDescription] = useState('');
  const [editSorting, setEditSorting] = useState<string>('');
  const [editColor, setEditColor] = useState<string>('');
  const [editAccDept, setEditAccDept] = useState<string>('');
  const [editImage, setEditImage] = useState<string>('');
  const [editBranchRestrictions, setEditBranchRestrictions] = useState<Record<string, boolean>>({
    'Zeit w zaytoun ljanoub': false
  });

  // Hidden File Inputs
  const newFileInputRef = useRef<HTMLInputElement | null>(null);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ---------------------------------------------------------------------------
  // Filtered Departments
  // ---------------------------------------------------------------------------
  const filteredDepartments = useMemo(() => {
    return departments.filter((d) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = d.MENUDESC.toLowerCase().includes(q);
        const matchesId = String(d.MENUIDBRANCHID).includes(q);
        if (!matchesName && !matchesId) return false;
      }
      // Branch filter
      if (selectedBranch !== 'allbranch') {
        const branchObj = OMEGA_BRANCHES.find((b) => b.BRANCHID === selectedBranch);
        if (branchObj && d.BRANCH_RESTRICTIONS?.includes(branchObj.BARANCHNAME)) {
          return false; // Restricted from this branch
        }
      }
      return true;
    });
  }, [departments, searchQuery, selectedBranch]);

  // Paginated List
  const totalPages = Math.max(1, Math.ceil(filteredDepartments.length / itemsPerPage));
  const paginatedDepartments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDepartments.slice(start, start + itemsPerPage);
  }, [filteredDepartments, currentPage]);

  // ---------------------------------------------------------------------------
  // Open New Modal
  // ---------------------------------------------------------------------------
  const openNewModal = () => {
    setNewDescription('');
    setNewSorting('');
    setNewColor('');
    setNewAccDept('');
    setNewImage('');
    setNewBranchRestrictions({
      'Zeit w zaytoun ljanoub': false
    });
    setIsNewModalOpen(true);
  };

  // ---------------------------------------------------------------------------
  // Open Edit Modal
  // ---------------------------------------------------------------------------
  const openEditModal = (d: DepartmentItem) => {
    setEditingDepartment(d);
    setEditId(d.MENUIDBRANCHID);
    setEditDescription(d.MENUDESC);
    setEditSorting(d.SORTING !== undefined && d.SORTING !== null ? String(d.SORTING) : '');
    setEditColor(d.COLOR || '');
    setEditAccDept(d.ACCOUNTDEP !== undefined && d.ACCOUNTDEP !== null ? String(d.ACCOUNTDEP) : '0');
    setEditImage(d.PICTURE || '');
    setEditBranchRestrictions({
      'Zeit w zaytoun ljanoub': d.BRANCH_RESTRICTIONS?.includes('Zeit w zaytoun ljanoub') || false
    });
    setIsEditModalOpen(true);
  };

  // ---------------------------------------------------------------------------
  // Handle Save New Department
  // ---------------------------------------------------------------------------
  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescription.trim()) {
      alert('Menu Description is required');
      return;
    }

    const nextId = Math.max(0, ...departments.map((d) => d.MENUIDBRANCHID)) + 1;
    const selectedRestrictions = Object.entries(newBranchRestrictions)
      .filter(([_, checked]) => checked)
      .map(([branchName]) => branchName);

    const newDept: DepartmentItem = {
      ID: nextId,
      MENUIDBRANCHID: nextId,
      MENUDESC: newDescription.trim(),
      SORTING: newSorting ? Number(newSorting) : 0,
      COLOR: newColor,
      ACCOUNTDEP: newAccDept || '0',
      PICTURE: newImage,
      BRANCH_RESTRICTIONS: selectedRestrictions,
      TOTALEXCEPTIONS: selectedRestrictions.length,
      CREATED_AT: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    setDepartments((prev) => [newDept, ...prev]);
    setIsNewModalOpen(false);
    showToast(`Department "${newDept.MENUDESC}" saved successfully`);
  };

  // ---------------------------------------------------------------------------
  // Handle Save Edit Department
  // ---------------------------------------------------------------------------
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDescription.trim()) {
      alert('Menu Description is required');
      return;
    }

    const selectedRestrictions = Object.entries(editBranchRestrictions)
      .filter(([_, checked]) => checked)
      .map(([branchName]) => branchName);

    setDepartments((prev) =>
      prev.map((d) => {
        if (d.MENUIDBRANCHID === editId) {
          return {
            ...d,
            MENUDESC: editDescription.trim(),
            SORTING: editSorting ? Number(editSorting) : 0,
            COLOR: editColor,
            ACCOUNTDEP: editAccDept || '0',
            PICTURE: editImage,
            BRANCH_RESTRICTIONS: selectedRestrictions,
            TOTALEXCEPTIONS: selectedRestrictions.length
          };
        }
        return d;
      })
    );

    setIsEditModalOpen(false);
    showToast(`Department "${editDescription.trim()}" updated successfully`);
  };

  // ---------------------------------------------------------------------------
  // Image Upload Handlers
  // ---------------------------------------------------------------------------
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'new' | 'edit') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        if (target === 'new') setNewImage(result);
        else setEditImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // ---------------------------------------------------------------------------
  // Color Picker Selection
  // ---------------------------------------------------------------------------
  const handleSelectColor = (hex: string) => {
    if (colorPickerTarget === 'new') {
      setNewColor(hex);
    } else {
      setEditColor(hex);
    }
    setIsColorPickerOpen(false);
  };

  return (
    <div className="min-h-[700px] w-full bg-background text-foreground font-sans pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-primary text-white px-5 py-3 rounded shadow-2xl animate-fade-in border border-slate-600">
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* =======================================================================
          HEADER SECTION (Matching Screenshot 1)
          ======================================================================= */}
      <div className="px-6 pt-5 pb-3">
        <h1 className="text-[22px] font-normal text-muted-foreground tracking-tight mb-1">
          Menus / Departments
        </h1>
        <div className="flex items-center text-xs text-muted-foreground gap-1.5">
          <a href="/backoffice" className="text-primary hover:underline">
            Home
          </a>
          <span>/</span>
          <span>Menus / Departments</span>
        </div>
      </div>

      {/* =======================================================================
          MAIN CONTAINER / TABLE CARD (Matching Screenshot 1)
          ======================================================================= */}
      <div className="px-6 mt-3">
        <div className="bg-white border border-border shadow-xs rounded-xs overflow-hidden">
          {/* Top Filter Bar: Search, All Branches, + New */}
          <div className="p-4 border-b border-border">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                {/* Search Input */}
                <div className="relative w-full md:w-72">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400">
                    <Search className="w-3.5 h-3.5 text-slate-400" />
                  </span>
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs text-slate-800 border border-border rounded-xs bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* All Branches Dropdown */}
                <div className="w-full md:w-64">
                  <select
                    value={selectedBranch}
                    onChange={(e) => {
                      setSelectedBranch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-1.5 text-xs text-slate-800 border border-border rounded-xs bg-white focus:outline-none focus:border-blue-400 transition-all cursor-pointer"
                  >
                    {OMEGA_BRANCHES.map((b) => (
                      <option key={b.BRANCHID} value={b.BRANCHID}>
                        {b.BARANCHNAME}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* + New Button */}
              <div className="w-full md:w-auto flex justify-end">
                <button
                  type="button"
                  onClick={openNewModal}
                  className="bg-primary hover:bg-primary/90 text-white px-3.5 py-1.5 rounded-xs text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New</span>
                </button>
              </div>
            </div>
          </div>

          {/* Departments Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead>
                <tr className="border-b border-border bg-white text-slate-800 font-bold text-[13px]">
                  <th className="py-3 px-4 w-16 font-semibold">#</th>
                  <th className="py-3 px-4 font-semibold">Description</th>
                  <th className="py-3 px-4 w-16 text-end"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedDepartments.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400 text-xs">
                      No departments found
                    </td>
                  </tr>
                ) : (
                  paginatedDepartments.map((d, index) => (
                    <tr
                      key={d.MENUIDBRANCHID}
                      className={`hover:bg-muted/50 transition-colors ${
                        index % 2 === 1 ? 'bg-background' : 'bg-white'
                      }`}
                    >
                      <td className="py-3 px-4 font-normal text-slate-800">
                        {d.MENUIDBRANCHID}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        <div className="flex items-center gap-2">
                          {d.COLOR && (
                            <span
                              className="w-3 h-3 rounded-full border border-slate-300 inline-block shrink-0"
                              style={{ backgroundColor: d.COLOR }}
                            />
                          )}
                          <span>{d.MENUDESC}</span>
                          {d.TOTALEXCEPTIONS && d.TOTALEXCEPTIONS > 0 ? (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-rose-600 text-white font-semibold">
                              {d.TOTALEXCEPTIONS}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-end">
                        <button
                          type="button"
                          onClick={() => openEditModal(d)}
                          className="bg-primary hover:bg-primary/90 text-white p-1.5 rounded-xs transition-colors inline-flex items-center justify-center cursor-pointer shadow-xs"
                          title="Edit Department"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Centered Pagination (Matching Screenshot 1: < 1 >) */}
          <div className="py-4 border-t border-border flex items-center justify-center">
            <div className="inline-flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-7 h-7 flex items-center justify-center border border-border rounded-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-default"
              >
                &laquo;
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 flex items-center justify-center border rounded-xs font-medium cursor-pointer transition-colors ${
                    currentPage === pageNum
                      ? 'border-primary bg-primary text-white'
                      : 'border-border text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-7 h-7 flex items-center justify-center border border-border rounded-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-default"
              >
                &raquo;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =======================================================================
          MODAL: NEW MENU / DEPARTMENT (Matching Screenshot 2 Pixel-by-Pixel)
          ======================================================================= */}
      {isNewModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-fade-in overflow-y-auto"
          style={{ zIndex: 50000 }}
        >
          <div
            className="bg-white border border-border w-full text-slate-800 shadow-2xl max-w-2xl rounded-xs overflow-hidden my-6 relative"
            style={{ zIndex: 50001 }}
          >
            {/* Header */}
            <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-white">
              <h2 className="text-[18px] font-normal text-muted-foreground">
                New Menu / Department
              </h2>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xl leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveNew} className="p-6 space-y-4 text-xs">
              {/* Row 1: Menu Description*, Sorting, Color */}
              <div className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-12 md:col-span-5">
                  <label className="block text-slate-700 font-normal mb-1">
                    Menu Description*
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xs border border-border bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>

                <div className="col-span-8 md:col-span-4">
                  <label className="block text-slate-700 font-normal mb-1">
                    Sorting
                  </label>
                  <input
                    type="number"
                    value={newSorting}
                    onChange={(e) => setNewSorting(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xs border border-border bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>

                <div className="col-span-4 md:col-span-3">
                  <button
                    type="button"
                    onClick={() => {
                      setColorPickerTarget('new');
                      setIsColorPickerOpen(true);
                    }}
                    style={{ backgroundColor: newColor || '#fff' }}
                    className={`w-full h-[32px] px-3 border border-border rounded-xs text-xs font-normal cursor-pointer hover:bg-slate-50 transition-colors ${
                      newColor ? 'text-white drop-shadow-xs font-medium' : 'text-slate-700 bg-white'
                    }`}
                  >
                    Color
                  </button>
                </div>
              </div>

              {/* Row 2: Acc. Department */}
              <div className="w-full md:w-1/2">
                <label className="block text-slate-700 font-normal mb-1">
                  Acc. Department
                </label>
                <input
                  type="text"
                  value={newAccDept}
                  onChange={(e) => setNewAccDept(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xs border border-border bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              {/* Row 3: Image Card */}
              <div className="border border-border rounded-xs overflow-hidden">
                <div className="bg-muted px-4 py-2 border-b border-border font-bold text-slate-800 text-[12px]">
                  Image
                </div>
                <div className="p-4 flex flex-col items-center justify-center">
                  {/* Image Preview Box */}
                  <div className="w-[280px] h-[160px] bg-muted flex items-center justify-center overflow-hidden border border-slate-200 mb-3">
                    {newImage ? (
                      <img
                        src={newImage}
                        alt="Department Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-muted-foreground font-bold text-2xl tracking-wide select-none">
                        no-image
                      </span>
                    )}
                  </div>

                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={newFileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageFileChange(e, 'new')}
                  />

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => newFileInputRef.current?.click()}
                      className="bg-primary hover:bg-primary/90 text-white px-3.5 py-1.5 rounded-xs text-xs font-normal cursor-pointer transition-colors"
                    >
                      Select image
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewImage('')}
                      className="bg-destructive hover:bg-destructive/90 text-white px-3.5 py-1.5 rounded-xs text-xs font-normal cursor-pointer transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 4: Branches restriction Card */}
              <div className="border border-border rounded-xs overflow-hidden">
                <div className="bg-muted px-4 py-2 border-b border-border font-bold text-slate-800 text-[12px]">
                  Branches restriction
                </div>
                <div className="p-4">
                  <label className="inline-flex items-center gap-2 text-slate-700 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={!!newBranchRestrictions['Zeit w zaytoun ljanoub']}
                      onChange={(e) =>
                        setNewBranchRestrictions({
                          ...newBranchRestrictions,
                          'Zeit w zaytoun ljanoub': e.target.checked
                        })
                      }
                      className="rounded-xs border-border text-primary focus:ring-0 cursor-pointer"
                    />
                    <span>Zeit w zaytoun ljanoub</span>
                  </label>
                </div>
              </div>

              {/* Footer with Save button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xs text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL: EDIT MENU / DEPARTMENT (Matching Screenshot 3 Pixel-by-Pixel)
          ======================================================================= */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-fade-in overflow-y-auto"
          style={{ zIndex: 50000 }}
        >
          <div
            className="bg-white border border-border w-full text-slate-800 shadow-2xl max-w-2xl rounded-xs overflow-hidden my-6 relative"
            style={{ zIndex: 50001 }}
          >
            {/* Header */}
            <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-white">
              <h2 className="text-[18px] font-normal text-muted-foreground">
                Edit Menu / Department
              </h2>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xl leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              {/* Row 1: Id (disabled), Menu Description*, Sorting, Color */}
              <div className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-3 md:col-span-2">
                  <label className="block text-slate-700 font-normal mb-1">
                    Id
                  </label>
                  <input
                    type="text"
                    disabled
                    value={editId}
                    className="w-full px-3 py-1.5 text-xs rounded-xs border border-border bg-muted text-slate-600 cursor-not-allowed"
                  />
                </div>

                <div className="col-span-9 md:col-span-5">
                  <label className="block text-slate-700 font-normal mb-1">
                    Menu Description*
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xs border border-border bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>

                <div className="col-span-6 md:col-span-2">
                  <label className="block text-slate-700 font-normal mb-1">
                    Sorting
                  </label>
                  <input
                    type="number"
                    value={editSorting}
                    onChange={(e) => setEditSorting(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xs border border-border bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>

                <div className="col-span-6 md:col-span-3">
                  <button
                    type="button"
                    onClick={() => {
                      setColorPickerTarget('edit');
                      setIsColorPickerOpen(true);
                    }}
                    style={{ backgroundColor: editColor || '#fff' }}
                    className={`w-full h-[32px] px-3 border border-border rounded-xs text-xs font-normal cursor-pointer hover:bg-slate-50 transition-colors ${
                      editColor ? 'text-white drop-shadow-xs font-medium' : 'text-slate-700 bg-white'
                    }`}
                  >
                    Color
                  </button>
                </div>
              </div>

              {/* Row 2: Acc. Department */}
              <div className="w-full md:w-1/2">
                <label className="block text-slate-700 font-normal mb-1">
                  Acc. Department
                </label>
                <input
                  type="text"
                  value={editAccDept}
                  onChange={(e) => setEditAccDept(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xs border border-border bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              {/* Row 3: Image Card */}
              <div className="border border-border rounded-xs overflow-hidden">
                <div className="bg-muted px-4 py-2 border-b border-border font-bold text-slate-800 text-[12px]">
                  Image
                </div>
                <div className="p-4 flex flex-col items-center justify-center">
                  {/* Image Preview Box */}
                  <div className="w-[280px] h-[160px] bg-muted flex items-center justify-center overflow-hidden border border-slate-200 mb-3">
                    {editImage ? (
                      <img
                        src={editImage}
                        alt="Department Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-muted-foreground font-bold text-2xl tracking-wide select-none">
                        no-image
                      </span>
                    )}
                  </div>

                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={editFileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageFileChange(e, 'edit')}
                  />

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => editFileInputRef.current?.click()}
                      className="bg-primary hover:bg-primary/90 text-white px-3.5 py-1.5 rounded-xs text-xs font-normal cursor-pointer transition-colors"
                    >
                      Select image
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditImage('')}
                      className="bg-destructive hover:bg-destructive/90 text-white px-3.5 py-1.5 rounded-xs text-xs font-normal cursor-pointer transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 4: Branches restriction Card */}
              <div className="border border-border rounded-xs overflow-hidden">
                <div className="bg-muted px-4 py-2 border-b border-border font-bold text-slate-800 text-[12px]">
                  Branches restriction
                </div>
                <div className="p-4">
                  <label className="inline-flex items-center gap-2 text-slate-700 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={!!editBranchRestrictions['Zeit w zaytoun ljanoub']}
                      onChange={(e) =>
                        setEditBranchRestrictions({
                          ...editBranchRestrictions,
                          'Zeit w zaytoun ljanoub': e.target.checked
                        })
                      }
                      className="rounded-xs border-border text-primary focus:ring-0 cursor-pointer"
                    />
                    <span>Zeit w zaytoun ljanoub</span>
                  </label>
                </div>
              </div>

              {/* Footer with Save button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xs text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL: COLOR PICKER (48 Colors Palette from Omega Template)
          ======================================================================= */}
      {isColorPickerOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-fade-in"
          style={{ zIndex: 99999 }}
        >
          <div
            className="bg-white border-2 border-border w-full max-w-[620px] rounded-[10px] shadow-2xl overflow-hidden relative"
            style={{ zIndex: 100000 }}
          >
            {/* Header */}
            <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-white">
              <h3 className="text-[17px] font-normal text-muted-foreground">
                Choose Color
              </h3>
              <button
                type="button"
                onClick={() => setIsColorPickerOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xl leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Body with 6x8 Color Grid */}
            <div className="p-5">
              <div className="grid grid-cols-8 gap-2.5">
                {COLOR_PALETTE.flat().map((color, index) => (
                  <button
                    key={`${color}-${index}`}
                    type="button"
                    onClick={() => handleSelectColor(color)}
                    style={{ backgroundColor: color }}
                    className="w-12 h-12 rounded-lg border border-slate-300 shadow-xs hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
