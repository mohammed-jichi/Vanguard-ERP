'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  ArrowUpDown,
  ChevronUp,
  ChevronsUp
} from 'lucide-react';
import { UnitItem, INITIAL_OMEGA_UNITS } from '@/lib/omegaUnitsData';

export default function AuthenticOmegaUnitsView() {
  // ---------------------------------------------------------------------------
  // Units State (synced with localStorage & fallback to authentic Omega data)
  // ---------------------------------------------------------------------------
  const [units, setUnits] = useState<UnitItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('vanguard_omega_units');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.error('Error reading saved units:', e);
      }
    }
    return INITIAL_OMEGA_UNITS;
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('vanguard_omega_units', JSON.stringify(units));
    } catch (e) {
      console.error('Error saving units:', e);
    }
  }, [units]);

  // ---------------------------------------------------------------------------
  // Search & Sorting States
  // ---------------------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'UNITID' | 'UNITNAME' | 'UNIT_DESCRIPTION' | 'UNIT_REMARKS'>('UNITNAME');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // ---------------------------------------------------------------------------
  // Modal States
  // ---------------------------------------------------------------------------
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<UnitItem | null>(null);

  // Form states
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitDescription, setNewUnitDescription] = useState('');
  const [newUnitRemarks, setNewUnitRemarks] = useState('');

  const [editUnitId, setEditUnitId] = useState<number>(0);
  const [editUnitName, setEditUnitName] = useState('');
  const [editUnitDescription, setEditUnitDescription] = useState('');
  const [editUnitRemarks, setEditUnitRemarks] = useState('');

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ---------------------------------------------------------------------------
  // Sort Handler
  // ---------------------------------------------------------------------------
  const handleSort = (field: 'UNITID' | 'UNITNAME' | 'UNIT_DESCRIPTION' | 'UNIT_REMARKS') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // ---------------------------------------------------------------------------
  // Filtered & Sorted Units List
  // ---------------------------------------------------------------------------
  const filteredUnits = useMemo(() => {
    return units
      .filter((u) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return (
          u.UNITNAME.toLowerCase().includes(q) ||
          u.UNIT_DESCRIPTION.toLowerCase().includes(q) ||
          u.UNIT_REMARKS.toLowerCase().includes(q) ||
          String(u.UNITID).includes(q)
        );
      })
      .sort((a, b) => {
        let valA: string | number = a[sortField] || '';
        let valB: string | number = b[sortField] || '';

        if (sortField === 'UNITID') {
          return sortOrder === 'asc' ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
        }

        const comp = String(valA).localeCompare(String(valB), undefined, { numeric: true });
        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [units, searchQuery, sortField, sortOrder]);

  // ---------------------------------------------------------------------------
  // Open Edit Modal
  // ---------------------------------------------------------------------------
  const openEditModal = (u: UnitItem) => {
    setEditingUnit(u);
    setEditUnitId(u.UNITID);
    setEditUnitName(u.UNITNAME);
    setEditUnitDescription(u.UNIT_DESCRIPTION);
    setEditUnitRemarks(u.UNIT_REMARKS);
    setIsEditModalOpen(true);
  };

  // ---------------------------------------------------------------------------
  // Save New Unit
  // ---------------------------------------------------------------------------
  const handleCreateUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitName.trim()) {
      alert('Unit Name is required');
      return;
    }

    const nextUnitId = Math.max(0, ...units.map((u) => u.UNITID)) + 1;
    const nextId = Math.max(0, ...units.map((u) => u.ID)) + 1;

    const newUnit: UnitItem = {
      ID: nextId,
      UNITID: nextUnitId,
      UNITNAME: newUnitName.trim(),
      UNIT_DESCRIPTION: newUnitDescription.trim(),
      UNIT_REMARKS: newUnitRemarks.trim(),
      CREATED_AT: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    setUnits([newUnit, ...units]);
    setIsNewModalOpen(false);
    setNewUnitName('');
    setNewUnitDescription('');
    setNewUnitRemarks('');
    showToast(`Unit "${newUnit.UNITNAME}" saved successfully!`);
  };

  // ---------------------------------------------------------------------------
  // Save Edited Unit
  // ---------------------------------------------------------------------------
  const handleUpdateUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnit) return;
    if (!editUnitName.trim()) {
      alert('Unit Name is required');
      return;
    }

    const updated = units.map((u) => {
      if (u.UNITID === editingUnit.UNITID) {
        return {
          ...u,
          UNITNAME: editUnitName.trim(),
          UNIT_DESCRIPTION: editUnitDescription.trim(),
          UNIT_REMARKS: editUnitRemarks.trim(),
          UPDATED_AT: new Date().toISOString().replace('T', ' ').slice(0, 19)
        };
      }
      return u;
    });

    setUnits(updated);
    setIsEditModalOpen(false);
    setEditingUnit(null);
    showToast(`Unit "${editUnitName.trim()}" updated successfully!`);
  };

  // ---------------------------------------------------------------------------
  // Delete Unit
  // ---------------------------------------------------------------------------
  const handleDeleteUnit = (u: UnitItem) => {
    if (confirm(`Are you sure you want to delete unit "${u.UNITNAME}"?`)) {
      setUnits(units.filter((item) => item.UNITID !== u.UNITID));
      showToast(`Unit "${u.UNITNAME}" deleted`);
    }
  };

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full bg-background text-slate-800 min-h-screen p-4 md:p-6 font-sans select-none relative">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-primary text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Breadcrumb */}
      <div className="mb-4">
        <h1 className="text-[22px] font-normal text-slate-800 tracking-tight">Units</h1>
        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
          <a href="/backoffice/operations" className="text-blue-600 hover:underline">
            Home
          </a>
          <span>/</span>
          <span className="text-slate-500">Units</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white border border-slate-200 rounded-xs shadow-2xs overflow-hidden">
        {/* Toolbar */}
        <div className="p-3 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
          <div className="w-full sm:w-72 relative">
            <input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 bg-white border border-slate-300 rounded-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="w-full sm:w-auto flex items-center justify-end">
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="px-3.5 py-1.5 rounded-sm bg-primary hover:bg-primary/90 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs active:scale-98 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New</span>
            </button>
          </div>
        </div>

        {/* Units Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-white text-slate-700 font-semibold text-[11.5px]">
                <th
                  onClick={() => handleSort('UNITID')}
                  className="px-4 py-2.5 cursor-pointer hover:bg-slate-50 transition w-16"
                >
                  <div className="flex items-center gap-1">
                    <span>#</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('UNITNAME')}
                  className="px-4 py-2.5 cursor-pointer hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('UNIT_DESCRIPTION')}
                  className="px-4 py-2.5 cursor-pointer hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>Description</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('UNIT_REMARKS')}
                  className="px-4 py-2.5 cursor-pointer hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>Remarks</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-2.5 text-right w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredUnits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400 font-mono text-xs">
                    No units found matching &quot;{searchQuery}&quot;
                  </td>
                </tr>
              ) : (
                filteredUnits.map((row, idx) => (
                  <tr
                    key={row.UNITID}
                    className={`transition ${idx % 2 === 0 ? 'bg-white' : 'bg-card'} hover:bg-blue-50/30`}
                  >
                    <td className="px-4 py-2.5 font-normal text-slate-800">{row.UNITID}</td>
                    <td className="px-4 py-2.5 font-normal text-slate-800">{row.UNITNAME}</td>
                    <td className="px-4 py-2.5 font-normal text-slate-800">{row.UNIT_DESCRIPTION}</td>
                    <td className="px-4 py-2.5 font-normal text-slate-500">{row.UNIT_REMARKS}</td>
                    <td className="px-4 py-2.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(row)}
                          title="Edit Unit"
                          className="w-6 h-6 rounded-xs bg-primary hover:bg-primary/90 text-white flex items-center justify-center transition shadow-2xs cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination matching Omega layout */}
        <div className="py-4 border-t border-slate-100 flex items-center justify-center text-xs text-slate-500">
          <div className="inline-flex items-center rounded border border-slate-200 overflow-hidden bg-white shadow-2xs">
            <button className="px-2.5 py-1 text-slate-400 hover:bg-slate-50 cursor-not-allowed">
              «
            </button>
            <button className="px-3 py-1 bg-primary text-white font-bold text-xs">
              1
            </button>
            <button className="px-2.5 py-1 text-slate-400 hover:bg-slate-50 cursor-not-allowed">
              »
            </button>
          </div>
        </div>
      </div>

      {/* Floating Scroll to top chevron matching screenshot */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 p-2 rounded bg-white text-primary border border-slate-200 shadow-md hover:bg-blue-50 transition-all z-30 cursor-pointer"
        title="Scroll to Top"
      >
        <ChevronsUp className="w-5 h-5" />
      </button>

      {/* =======================================================================
          MODAL: NEW UNIT
          ======================================================================= */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white border border-slate-300 w-full text-slate-800 shadow-2xl max-w-lg rounded-sm overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-white">
              <h2 className="text-[17px] font-normal text-slate-800">New Unit</h2>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateUnit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Unit Name*
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  placeholder="Ex: kg"
                  className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Unit Description
                </label>
                <input
                  type="text"
                  value={newUnitDescription}
                  onChange={(e) => setNewUnitDescription(e.target.value)}
                  placeholder="Ex: kilogram"
                  className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Unit Remarks
                </label>
                <input
                  type="text"
                  value={newUnitRemarks}
                  onChange={(e) => setNewUnitRemarks(e.target.value)}
                  placeholder="Ex: 1 kilogram = 2.20462 Pound"
                  className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              {/* Footer with Save button matching screenshot */}
              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-sm bg-primary hover:bg-primary/90 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
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
          MODAL: EDIT UNIT (Matching Screenshot 2 Pixel-by-Pixel)
          ======================================================================= */}
      {isEditModalOpen && editingUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white border border-slate-300 w-full text-slate-800 shadow-2xl max-w-lg rounded-sm overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-white">
              <h2 className="text-[17px] font-normal text-slate-800">Edit Unit</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUpdateUnit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-12 gap-3">
                {/* ID Field (Read-only / disabled matching Screenshot 2) */}
                <div className="col-span-3">
                  <label className="block text-slate-700 font-medium mb-1">
                    ID
                  </label>
                  <input
                    type="text"
                    disabled
                    value={editUnitId}
                    className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 bg-muted text-slate-600 font-mono select-none cursor-not-allowed"
                  />
                </div>

                {/* Unit Name Field (Required text input matching Screenshot 2) */}
                <div className="col-span-9">
                  <label className="block text-slate-700 font-medium mb-1">
                    Unit Name
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={editUnitName}
                    onChange={(e) => setEditUnitName(e.target.value)}
                    placeholder="Ex: kg"
                    className="w-full px-3 py-2 text-xs rounded-sm border border-blue-400 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Unit Description */}
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Unit Description
                  </label>
                  <input
                    type="text"
                    value={editUnitDescription}
                    onChange={(e) => setEditUnitDescription(e.target.value)}
                    placeholder="Ex: kilogram"
                    className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>

                {/* Unit Remarks */}
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Unit Remarks
                  </label>
                  <input
                    type="text"
                    value={editUnitRemarks}
                    onChange={(e) => setEditUnitRemarks(e.target.value)}
                    placeholder="Ex: 1 kilogram = 2.20462 Pound"
                    className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              {/* Footer with Save button matching screenshot */}
              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-sm bg-primary hover:bg-primary/90 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
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
