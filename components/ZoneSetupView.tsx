'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Pencil,
  Trash2,
  Plus,
  Search,
  Save,
  X,
  ArrowUpDown,
  MapPin,
  AlertCircle
} from 'lucide-react';
import {
  OmegaCallCenterZone,
  INITIAL_ZONES,
  LEBANON_CITIES,
  OMEGA_BRANCHES
} from '@/lib/omegaZoneAndCurrencyData';
import { useTenant } from '@/lib/TenantContext';
import { supabase } from '@/lib/supabase';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

export default function ZoneSetupView() {
  const { currentTenant } = useTenant();
  const [zones, setZones] = useState<OmegaCallCenterZone[]>(INITIAL_ZONES);

  // Mount hydration from Supabase
  useEffect(() => {
    async function loadPersistedZones() {
      try {
        const targetId = (currentTenant?.id && currentTenant.id !== '1300' && !currentTenant.id.startsWith('comp-'))
          ? currentTenant.id
          : '00000000-0000-0000-0000-000000000001';

        const { data, error } = await supabase
          .from('tenants')
          .select('feature_flags')
          .eq('id', targetId)
          .maybeSingle();

        if (data?.feature_flags?.callcenter_zones && Array.isArray(data.feature_flags.callcenter_zones) && data.feature_flags.callcenter_zones.length > 0) {
          setZones(data.feature_flags.callcenter_zones);
        }
      } catch (err) {
        console.warn('Notice loading call center zones from database:', err);
      }
    }
    loadPersistedZones();
  }, [currentTenant?.id]);

  const persistZonesToDatabase = async (newZones: OmegaCallCenterZone[]): Promise<{ success: boolean; error?: string }> => {
    try {
      const targetId = (currentTenant?.id && currentTenant.id !== '1300' && !currentTenant.id.startsWith('comp-'))
        ? currentTenant.id
        : '00000000-0000-0000-0000-000000000001';

      const { data: tenantData } = await supabase
        .from('tenants')
        .select('feature_flags')
        .eq('id', targetId)
        .maybeSingle();

      const existingFlags = tenantData?.feature_flags || currentTenant?.feature_flags || {};
      const { error: dbError } = await supabase
        .from('tenants')
        .update({
          feature_flags: {
            ...existingFlags,
            callcenter_zones: newZones
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', targetId);

      if (dbError) {
        return { success: false, error: dbError.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Database connection error' };
    }
  };

  const [searchVal, setSearchVal] = useState<string>('');
  const [selectedBranchId, setSelectedBranchId] = useState<number | 'all'>('all');
  const [sorting, setSorting] = useState<{ field: 'ID' | 'ZONE' | 'AREACODE' | 'TOBRANCH'; dir: 'asc' | 'desc' }>({
    field: 'ZONE',
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

  // Modal States
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showCitiesModal, setShowCitiesModal] = useState<boolean>(false);
  const [editingZone, setEditingZone] = useState<OmegaCallCenterZone | null>(null);

  // New Zone Form State
  const [newZoneName, setNewZoneName] = useState<string>('');
  const [newAreaCode, setNewAreaCode] = useState<string>('');
  const [newBranchId, setNewBranchId] = useState<number>(1);
  const [newPrinterName, setNewPrinterName] = useState<string>('');
  const [newDeliveryCharge, setNewDeliveryCharge] = useState<string>('');

  // Edit Zone Form State
  const [editZoneName, setEditZoneName] = useState<string>('');
  const [editAreaCode, setEditAreaCode] = useState<string>('');
  const [editBranchId, setEditBranchId] = useState<number>(1);
  const [editPrinterName, setEditPrinterName] = useState<string>('');
  const [editDeliveryCharge, setEditDeliveryCharge] = useState<string>('');

  // Link Cities Form State
  const [citySearch, setCitySearch] = useState<string>('');
  const [linkedCitiesMap, setLinkedCitiesMap] = useState<{ [cityId: number]: boolean }>({});

  // Delete Confirm Modal State
  const [deleteTarget, setDeleteTarget] = useState<OmegaCallCenterZone | null>(null);

  // Sorting Handler
  const toggleSort = (field: 'ID' | 'ZONE' | 'AREACODE' | 'TOBRANCH') => {
    setSorting(prev => ({
      field,
      dir: prev.field === field && prev.dir === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Filtered and Sorted Zones
  const filteredZones = useMemo(() => {
    return zones
      .filter(item => {
        if (selectedBranchId !== 'all' && item.TOBRANCH !== selectedBranchId) {
          return false;
        }
        if (searchVal.trim()) {
          const q = searchVal.toLowerCase();
          const matchZone = item.ZONE.toLowerCase().includes(q);
          const matchArea = item.AREACODE.toLowerCase().includes(q);
          const matchBranch = item.BARANCHNAME.toLowerCase().includes(q);
          const matchId = item.ID.toString().includes(q);
          if (!matchZone && !matchArea && !matchBranch && !matchId) return false;
        }
        return true;
      })
      .sort((a, b) => {
        let valA: string | number = a[sorting.field];
        let valB: string | number = b[sorting.field];
        if (typeof valA === 'string') {
          const comp = valA.localeCompare(valB as string);
          return sorting.dir === 'asc' ? comp : -comp;
        } else {
          return sorting.dir === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
        }
      });
  }, [zones, selectedBranchId, searchVal, sorting]);

  // Open Add Dialog
  const openAddModal = () => {
    setNewZoneName('');
    setNewAreaCode('');
    setNewBranchId(1);
    setNewPrinterName('');
    setNewDeliveryCharge('');
    setShowAddModal(true);
  };

  // Save New Zone
  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName.trim()) {
      showToast('Please enter a zone name', 'error');
      return;
    }
    if (!newAreaCode.trim()) {
      showToast('Please enter an area code', 'error');
      return;
    }

    const exists = zones.some(
      z => z.ZONE.trim().toLowerCase() === newZoneName.trim().toLowerCase() && z.TOBRANCH === newBranchId
    );
    if (exists) {
      showToast('Zone already exist', 'error');
      return;
    }

    const nextId = Math.max(0, ...zones.map(z => z.ID)) + 1;
    const branchName =
      OMEGA_BRANCHES.find(b => b.BRANCHID === newBranchId)?.BARANCHNAME || 'Zeit w zaytoun ljanoub';

    const newRecord: OmegaCallCenterZone = {
      ID: nextId,
      ZONE: newZoneName.trim(),
      AREACODE: newAreaCode.trim(),
      TOBRANCH: newBranchId,
      BARANCHNAME: branchName,
      PRINTERNAME: newPrinterName.trim() || 'Cashier Thermal',
      DELIVERYCHARGE: newDeliveryCharge.trim() || '0.00',
      cities: []
    };

    const updated = [...zones, newRecord];
    const res = await persistZonesToDatabase(updated);
    if (!res.success) {
      showToast(`Database persistence failed: ${res.error}`, 'error');
      return;
    }

    setZones(updated);
    setShowAddModal(false);
    showToast('Zone saved to database', 'success');
  };

  // Open Edit Dialog
  const openEditModal = (row: OmegaCallCenterZone) => {
    setEditingZone(row);
    setEditZoneName(row.ZONE);
    setEditAreaCode(row.AREACODE);
    setEditBranchId(row.TOBRANCH);
    setEditPrinterName(row.PRINTERNAME);
    setEditDeliveryCharge(row.DELIVERYCHARGE);
    setShowEditModal(true);
  };

  // Save Edit Zone
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingZone) return;
    if (!editZoneName.trim() || !editAreaCode.trim()) {
      showToast('Please fill in required fields', 'error');
      return;
    }

    const exists = zones.some(
      z =>
        z.ID !== editingZone.ID &&
        z.ZONE.trim().toLowerCase() === editZoneName.trim().toLowerCase() &&
        z.TOBRANCH === editBranchId
    );
    if (exists) {
      showToast('Zone already exist', 'error');
      return;
    }

    const branchName =
      OMEGA_BRANCHES.find(b => b.BRANCHID === editBranchId)?.BARANCHNAME || 'Zeit w zaytoun ljanoub';

    const updated = zones.map(z => {
      if (z.ID === editingZone.ID) {
        return {
          ...z,
          ZONE: editZoneName.trim(),
          AREACODE: editAreaCode.trim(),
          TOBRANCH: editBranchId,
          BARANCHNAME: branchName,
          PRINTERNAME: editPrinterName.trim(),
          DELIVERYCHARGE: editDeliveryCharge.trim()
        };
      }
      return z;
    });

    const res = await persistZonesToDatabase(updated);
    if (!res.success) {
      showToast(`Database persistence failed: ${res.error}`, 'error');
      return;
    }

    setZones(updated);
    setShowEditModal(false);
    setEditingZone(null);
    showToast('Zone updated in database', 'success');
  };

  // Open Link Cities Dialog
  const openCitiesModal = () => {
    if (!editingZone) return;
    const map: { [cityId: number]: boolean } = {};
    if (editingZone.cities) {
      editingZone.cities.forEach(c => {
        map[c.CITYID] = true;
      });
    }
    setLinkedCitiesMap(map);
    setCitySearch('');
    setShowCitiesModal(true);
  };

  // Save Linked Cities
  const handleSaveLinkedCities = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingZone) return;

    const selectedCityObjects = LEBANON_CITIES.filter(c => linkedCitiesMap[c.id]).map(c => ({
      CITYID: c.id,
      name: c.name
    }));

    const updated = zones.map(z => {
      if (z.ID === editingZone.ID) {
        return {
          ...z,
          cities: selectedCityObjects
        };
      }
      return z;
    });

    const res = await persistZonesToDatabase(updated);
    if (!res.success) {
      showToast(`Database persistence failed: ${res.error}`, 'error');
      return;
    }

    setZones(updated);
    // Update current editingZone local reference
    setEditingZone(prev => (prev ? { ...prev, cities: selectedCityObjects } : null));

    setShowCitiesModal(false);
    showToast('Cities Linked To This Zone in database.', 'success');
  };

  // Filter cities for Link Cities modal
  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return LEBANON_CITIES;
    const q = citySearch.toLowerCase();
    return LEBANON_CITIES.filter(c => c.name.toLowerCase().includes(q));
  }, [citySearch]);

  // Confirm Delete
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const updated = zones.filter(z => z.ID !== deleteTarget.ID);

    const res = await persistZonesToDatabase(updated);
    if (!res.success) {
      showToast(`Database persistence failed: ${res.error}`, 'error');
      return;
    }

    setZones(updated);
    setDeleteTarget(null);
    showToast('Zone deleted from database', 'success');
  };

  return (
    <div className="w-full bg-background text-slate-800 font-sans min-h-screen">
      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div className="fixed top-5 right-5 z-[9999] animate-fadeIn">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-xl border text-sm font-medium ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : toast.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-300'
                : 'bg-blue-50 text-blue-800 border-blue-300'
            }`}
          >
            {toast.type === 'success' && <span className="text-emerald-600 font-bold">✓</span>}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600" />}
            {toast.type === 'info' && <span className="text-blue-600 font-bold">ℹ</span>}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="px-6 pt-5 pb-3">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-1">
          Call Center Zone Setup
        </h1>
        <ul className="flex items-center gap-1.5 text-xs text-slate-500">
          <li>
            <Link href="/backoffice" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
          </li>
          <li>/</li>
          <li className="text-slate-800 font-medium">Call Center Zone Setup</li>
        </ul>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="px-6 pb-12">
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
          {/* TOOLBAR FILTER BAR */}
          <div className="p-3 border-b border-slate-200 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
              {/* Search input */}
              <div className="col-span-12 md:col-span-4 relative">
                <input
                  type="search"
                  placeholder="Search..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="w-full text-xs font-normal bg-white border border-slate-300 rounded py-2 pl-9 pr-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              </div>

              {/* Branch select */}
              <div className="col-span-12 md:col-span-4">
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="w-full text-xs font-normal bg-white border border-slate-300 rounded py-2 px-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                >
                  <option value="all">All Branches</option>
                  {OMEGA_BRANCHES.map(b => (
                    <option key={b.BRANCHID} value={b.BRANCHID}>
                      {b.BARANCHNAME}
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions: + New */}
              <div className="col-span-12 md:col-span-4 text-end">
                <button
                  type="button"
                  onClick={openAddModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary text-white text-xs font-semibold rounded shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New</span>
                </button>
              </div>
            </div>
          </div>

          {/* TABLE CONTAINER */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <thead>
                <tr className="bg-white border-b-2 border-slate-200 text-slate-800">
                  <th
                    style={{ width: '70px' }}
                    onClick={() => toggleSort('ID')}
                    className="py-2.5 px-4 font-semibold cursor-pointer hover:bg-slate-50 transition-colors select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>#</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('ZONE')}
                    className="py-2.5 px-4 font-semibold cursor-pointer hover:bg-slate-50 transition-colors select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>Zone</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    style={{ width: '120px' }}
                    onClick={() => toggleSort('AREACODE')}
                    className="py-2.5 px-4 font-semibold cursor-pointer hover:bg-slate-50 transition-colors select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>Area Code</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    style={{ width: '200px' }}
                    onClick={() => toggleSort('TOBRANCH')}
                    className="py-2.5 px-4 font-semibold cursor-pointer hover:bg-slate-50 transition-colors select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>Branch</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th style={{ width: '130px' }} className="py-2.5 px-4 font-semibold text-center">
                    Linked Cities
                  </th>
                  <th style={{ width: '110px' }} className="py-2.5 px-4 font-semibold text-end">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredZones.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                      No call center zones found.
                    </td>
                  </tr>
                ) : (
                  filteredZones.map((row, idx) => (
                    <tr
                      key={row.ID}
                      className={`hover:bg-blue-50/40 transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
                      }`}
                    >
                      <td className="py-2.5 px-4 font-mono text-slate-600">{row.ID}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-900">
                        {row.ZONE}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-700">{row.AREACODE}</td>
                      <td className="py-2.5 px-4 text-slate-800">{row.BARANCHNAME}</td>
                      <td className="py-2.5 px-4 text-center">
                        {row.cities && row.cities.length > 0 ? (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200"
                            title={row.cities.map(c => c.name).join(', ')}
                          >
                            <MapPin className="w-2.5 h-2.5" />
                            <span>{row.cities.length} Cities</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-end">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(row)}
                            title="Edit Zone"
                            className="p-1 rounded bg-primary hover:bg-primary text-white transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(row)}
                            title="Delete Zone"
                            className="p-1 rounded bg-destructive hover:bg-destructive text-white transition-colors cursor-pointer"
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

          {/* FOOTER PAGINATOR INFO */}
          <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {filteredZones.length} of {zones.length} zones</span>
            <span className="font-mono text-[11px]">Page 1 of 1</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL: NEW CALL CENTER ZONE */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/50 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-wide">New Call Center Zone</h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveAdd} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-12 md:col-span-4">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Zone <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newZoneName}
                    onChange={(e) => setNewZoneName(e.target.value)}
                    placeholder="e.g. Beirut Central"
                    className="w-full text-xs bg-white border border-slate-300 rounded py-2 px-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-12 md:col-span-4">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Area Code <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newAreaCode}
                    onChange={(e) => setNewAreaCode(e.target.value)}
                    placeholder="e.g. 01"
                    className="w-full text-xs bg-white border border-slate-300 rounded py-2 px-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-12 md:col-span-4">
                  <label className="block text-slate-700 font-semibold mb-1">Branch</label>
                  <select
                    value={newBranchId}
                    onChange={(e) => setNewBranchId(Number(e.target.value))}
                    className="w-full text-xs bg-white border border-slate-300 rounded py-2 px-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    {OMEGA_BRANCHES.map(b => (
                      <option key={b.BRANCHID} value={b.BRANCHID}>
                        {b.BARANCHNAME}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-12 md:col-span-6">
                  <label className="block text-slate-700 font-semibold mb-1">Branch Printer Name</label>
                  <input
                    type="text"
                    value={newPrinterName}
                    onChange={(e) => setNewPrinterName(e.target.value)}
                    placeholder="e.g. Cashier Thermal"
                    className="w-full text-xs bg-white border border-slate-300 rounded py-2 px-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-12 md:col-span-6">
                  <label className="block text-slate-700 font-semibold mb-1">Delivery Charge Item ID</label>
                  <input
                    type="text"
                    value={newDeliveryCharge}
                    onChange={(e) => setNewDeliveryCharge(e.target.value)}
                    placeholder="e.g. 3.00"
                    className="w-full text-xs bg-white border border-slate-300 rounded py-2 px-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Footer Save */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary hover:bg-primary text-white font-semibold rounded shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: EDIT CALL CENTER ZONE */}
      {/* ========================================================= */}
      {showEditModal && editingZone && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/50 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-wide">Edit Call Center Zone</h2>
              <button
                type="button"
                onClick={() => { setShowEditModal(false); setEditingZone(null); }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 text-xs">
              {/* TOP ACTION: LINK CITIES TO ZONE */}
              <div className="text-end pb-1">
                <button
                  type="button"
                  onClick={openCitiesModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1e40af] hover:bg-primary/90 text-white font-semibold rounded shadow-xs transition-colors cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Link Cities To Zone</span>
                </button>
              </div>

              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-12 md:col-span-4">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Zone <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editZoneName}
                    onChange={(e) => setEditZoneName(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded py-2 px-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-12 md:col-span-4">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Area Code <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editAreaCode}
                    onChange={(e) => setEditAreaCode(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded py-2 px-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-12 md:col-span-4">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Branch <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={editBranchId}
                    onChange={(e) => setEditBranchId(Number(e.target.value))}
                    className="w-full text-xs bg-white border border-slate-300 rounded py-2 px-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    {OMEGA_BRANCHES.map(b => (
                      <option key={b.BRANCHID} value={b.BRANCHID}>
                        {b.BARANCHNAME}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-12 md:col-span-6">
                  <label className="block text-slate-700 font-semibold mb-1">Branch Printer Name</label>
                  <input
                    type="text"
                    value={editPrinterName}
                    onChange={(e) => setEditPrinterName(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded py-2 px-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-12 md:col-span-6">
                  <label className="block text-slate-700 font-semibold mb-1">Delivery Charge Item ID</label>
                  <input
                    type="text"
                    value={editDeliveryCharge}
                    onChange={(e) => setEditDeliveryCharge(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded py-2 px-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Footer Save */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingZone(null); }}
                  className="px-3.5 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary hover:bg-primary text-white font-semibold rounded shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: LINK CITIES TO ZONE */}
      {/* ========================================================= */}
      {showCitiesModal && editingZone && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-16 bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold tracking-wide">Link Cities To Zone</h2>
                <span className="text-xs text-blue-300 font-mono">({editingZone.ZONE})</span>
              </div>
              <button
                type="button"
                onClick={() => setShowCitiesModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSaveLinkedCities} className="p-5 space-y-4 text-xs">
              {/* Search input with Save icon button */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="search"
                    placeholder="Search cities..."
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded py-2 pl-9 pr-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
                <button
                  type="submit"
                  title="Save Cities"
                  className="p-2 bg-primary hover:bg-primary text-white rounded transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                </button>
              </div>

              {/* Cities Grid List with Checkboxes */}
              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 max-h-72 overflow-y-auto space-y-1.5 custom-scrollbar">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {filteredCities.map(city => (
                    <label
                      key={city.id}
                      className={`flex items-center gap-2 p-1.5 rounded text-xs cursor-pointer select-none transition-colors ${
                        linkedCitiesMap[city.id]
                          ? 'bg-blue-50 text-blue-900 font-medium'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!!linkedCitiesMap[city.id]}
                        onChange={(e) =>
                          setLinkedCitiesMap(prev => ({
                            ...prev,
                            [city.id]: e.target.checked
                          }))
                        }
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span className="truncate">{city.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Footer Save */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-slate-500 text-[11px]">
                  {Object.values(linkedCitiesMap).filter(Boolean).length} cities selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCitiesModal(false)}
                    className="px-3.5 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-medium transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary hover:bg-primary text-white font-semibold rounded shadow-xs transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: BOOTBOX CONFIRM DELETE */}
      {/* ========================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-md overflow-hidden animate-scaleUp">
            <div className="p-5">
              <p className="text-sm font-medium text-slate-800">
                Do you want to delete this call center zone ?
              </p>
              <div className="mt-2 text-xs text-slate-500 font-mono">
                #{deleteTarget.ID} - {deleteTarget.ZONE} ({deleteTarget.BARANCHNAME})
              </div>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-200 transition-colors font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-1.5 bg-primary hover:bg-primary text-white rounded font-semibold transition-colors cursor-pointer shadow-xs"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
