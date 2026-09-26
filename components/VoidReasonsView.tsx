'use client';
import { useLanguage } from '@/lib/LanguageContext';

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
  AlertCircle,
  Ban
} from 'lucide-react';
import {
  OmegaVoidReason,
  INITIAL_VOID_REASONS,
  OMEGA_BRANCHES
} from '@/lib/omegaMoreSetupData';
import { useTenant } from '@/lib/TenantContext';
import { supabase } from '@/lib/supabase';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

export default function VoidReasonsView() {
  const { t } = useLanguage();
  const { currentTenant } = useTenant();
  const [voidReasons, setVoidReasons] = useState<OmegaVoidReason[]>(INITIAL_VOID_REASONS);

  // Mount hydration from Supabase
  useEffect(() => {
    async function loadPersistedVoidReasons() {
      try {
        const targetId = (currentTenant?.id && currentTenant.id !== '1300' && !currentTenant.id.startsWith('comp-'))
          ? currentTenant.id
          : '00000000-0000-0000-0000-000000000001';

        const { data, error } = await supabase
          .from('tenants')
          .select('feature_flags')
          .eq('id', targetId)
          .maybeSingle();

        if (data?.feature_flags?.void_reasons && Array.isArray(data.feature_flags.void_reasons) && data.feature_flags.void_reasons.length > 0) {
          setVoidReasons(data.feature_flags.void_reasons);
        }
      } catch (err) {
        console.warn('Notice loading void reasons from database:', err);
      }
    }
    loadPersistedVoidReasons();
  }, [currentTenant?.id]);

  const persistVoidReasonsToDatabase = async (newReasons: OmegaVoidReason[]): Promise<{ success: boolean; error?: string }> => {
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
            void_reasons: newReasons
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
  const [sorting, setSorting] = useState<{ field: 'VOIDID' | 'VOIDDESCRIPTION'; dir: 'asc' | 'desc' }>({
    field: 'VOIDDESCRIPTION',
    dir: 'asc'
  });

  // Toast notifications
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
  const [editingRow, setEditingRow] = useState<OmegaVoidReason | null>(null);

  // Form states - Add
  const [newDescription, setNewDescription] = useState<string>('');
  const [newDiscontinued, setNewDiscontinued] = useState<boolean>(false);
  const [newBranchChecks, setNewBranchChecks] = useState<{ [branchId: number]: boolean }>({});

  // Form states - Edit
  const [editDescription, setEditDescription] = useState<string>('');
  const [editDiscontinued, setEditDiscontinued] = useState<boolean>(false);
  const [editBranchChecks, setEditBranchChecks] = useState<{ [branchId: number]: boolean }>({});

  // Delete Confirm Modal State
  const [deleteTarget, setDeleteTarget] = useState<OmegaVoidReason | null>(null);

  // Sorting Handler
  const toggleSort = (field: 'VOIDID' | 'VOIDDESCRIPTION') => {
    setSorting(prev => ({
      field,
      dir: prev.field === field && prev.dir === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Filter & Sort
  const filteredList = useMemo(() => {
    return voidReasons
      .filter(item => {
        if (selectedBranchId !== 'all' && item.BRANCHID !== selectedBranchId) {
          return false;
        }
        if (searchVal.trim()) {
          const q = searchVal.toLowerCase();
          const matchDesc = item.VOIDDESCRIPTION.toLowerCase().includes(q);
          const matchId = item.VOIDID.toString().includes(q);
          if (!matchDesc && !matchId) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sorting.field === 'VOIDID') {
          return sorting.dir === 'asc' ? a.VOIDID - b.VOIDID : b.VOIDID - a.VOIDID;
        } else {
          const comp = a.VOIDDESCRIPTION.localeCompare(b.VOIDDESCRIPTION);
          return sorting.dir === 'asc' ? comp : -comp;
        }
      });
  }, [voidReasons, selectedBranchId, searchVal, sorting]);

  // Open Add Dialog
  const openAddModal = () => {
    setNewDescription('');
    setNewDiscontinued(false);
    setNewBranchChecks({});
    setShowAddModal(true);
  };

  // Save New Void Reason
  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescription.trim()) {
      showToast('Please enter a void description', 'error');
      return;
    }

    const exists = voidReasons.some(
      v => v.VOIDDESCRIPTION.trim().toLowerCase() === newDescription.trim().toLowerCase()
    );
    if (exists) {
      showToast('Void reason already exists', 'error');
      return;
    }

    const nextVoidId = Math.max(0, ...voidReasons.map(v => v.VOIDID)) + 1;
    const nextId = Math.max(0, ...voidReasons.map(v => v.ID)) + 1;

    const restrictedBranches = OMEGA_BRANCHES.filter(
      b => newBranchChecks[Number(b.BRANCHID)]
    ).map(b => ({ BRANCHID: Number(b.BRANCHID), BARANCHNAME: b.BARANCHNAME }));

    const newRecord: OmegaVoidReason = {
      ID: nextId,
      VOIDID: nextVoidId,
      BRAND_ID: 9606,
      BRANCHID: 1,
      VOIDDESCRIPTION: newDescription.trim(),
      DISCONTINUED: newDiscontinued ? -1 : 0,
      branch_excp: restrictedBranches
    };

    const updated = [newRecord, ...voidReasons];
    const res = await persistVoidReasonsToDatabase(updated);
    if (!res.success) {
      showToast(`Database persistence failed: ${res.error}`, 'error');
      return;
    }

    setVoidReasons(updated);
    setShowAddModal(false);
    showToast('Void reason saved to database', 'success');
  };

  // Open Edit Dialog
  const openEditModal = (row: OmegaVoidReason) => {
    setEditingRow(row);
    setEditDescription(row.VOIDDESCRIPTION);
    setEditDiscontinued(row.DISCONTINUED === -1);
    const checks: { [branchId: number]: boolean } = {};
    if (row.branch_excp) {
      row.branch_excp.forEach(b => {
        checks[b.BRANCHID] = true;
      });
    }
    setEditBranchChecks(checks);
    setShowEditModal(true);
  };

  // Save Edit Void Reason
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRow) return;
    if (!editDescription.trim()) {
      showToast('Please enter a void description', 'error');
      return;
    }

    const exists = voidReasons.some(
      v => v.VOIDID !== editingRow.VOIDID &&
           v.VOIDDESCRIPTION.trim().toLowerCase() === editDescription.trim().toLowerCase()
    );
    if (exists) {
      showToast('Void reason already exists', 'error');
      return;
    }

    const restrictedBranches = OMEGA_BRANCHES.filter(
      b => editBranchChecks[Number(b.BRANCHID)]
    ).map(b => ({ BRANCHID: Number(b.BRANCHID), BARANCHNAME: b.BARANCHNAME }));

    const updated = voidReasons.map(item => {
      if (item.VOIDID === editingRow.VOIDID) {
        return {
          ...item,
          VOIDDESCRIPTION: editDescription.trim(),
          DISCONTINUED: editDiscontinued ? -1 : 0,
          branch_excp: restrictedBranches
        };
      }
      return item;
    });

    const res = await persistVoidReasonsToDatabase(updated);
    if (!res.success) {
      showToast(`Database persistence failed: ${res.error}`, 'error');
      return;
    }

    setVoidReasons(updated);
    setShowEditModal(false);
    setEditingRow(null);
    showToast('Void reason saved to database', 'success');
  };

  // Confirm Delete
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const updated = voidReasons.filter(item => item.VOIDID !== deleteTarget.VOIDID);

    const res = await persistVoidReasonsToDatabase(updated);
    if (!res.success) {
      showToast(`Database persistence failed: ${res.error}`, 'error');
      return;
    }

    setVoidReasons(updated);
    setDeleteTarget(null);
    showToast('Void reason deleted from database', 'success');
  };

  return (
    <div className="w-full bg-background text-slate-800 font-sans min-h-screen">
      {/* TOAST POPUP */}
      {toast.show && (
        <div className="fixed top-5 right-5 z-[9999] animate-fadeIn">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-xl border text-sm font-medium ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : toast.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-300'
                : toast.type === 'warning'
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-blue-50 text-blue-800 border-blue-300'
            }`}
          >
            {toast.type === 'success' && <span className="text-emerald-600 font-bold">✓</span>}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600" />}
            {toast.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-600" />}
            {toast.type === 'info' && <span className="text-blue-600 font-bold">ℹ</span>}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="px-6 pt-5 pb-3">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-1">
          {t('void_reasons', 'Void Reasons')}
        </h1>
        <ul className="flex items-center gap-1.5 text-xs text-slate-500">
          <li>
            <Link href="/backoffice" className="hover:text-blue-600 transition-colors">
              {t('home', 'Home')}
            </Link>
          </li>
          <li>/</li>
          <li className="text-slate-800 font-medium">{t('void_reasons', 'Void Reasons')}</li>
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
                  placeholder={t('search', 'Search...')}
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
                  <option value="all">{t('all_branches', 'All Branches')}</option>
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
                  <span>{t('new', 'New')}</span>
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
                    onClick={() => toggleSort('VOIDID')}
                    className="py-2.5 px-4 font-semibold cursor-pointer hover:bg-slate-50 transition-colors select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>#</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('VOIDDESCRIPTION')}
                    className="py-2.5 px-4 font-semibold cursor-pointer hover:bg-slate-50 transition-colors select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>{t('description', 'Description')}</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-2.5 px-4 font-semibold text-center" style={{ width: '160px' }}>
                    {t('branch_restrictions', 'Branch Restrictions')}
                  </th>
                  <th className="py-2.5 px-4 font-semibold text-center" style={{ width: '120px' }}>
                    {t('status', 'Status')}
                  </th>
                  <th className="py-2.5 px-4 font-semibold text-end" style={{ width: '110px' }}>
                    {t('actions', 'Actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                      {t('no_void_reasons_found', 'No void reasons found.')}
                    </td>
                  </tr>
                ) : (
                  filteredList.map((row, idx) => (
                    <tr
                      key={row.VOIDID}
                      className={`hover:bg-blue-50/40 transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
                      }`}
                    >
                      <td className="py-2.5 px-4 font-mono text-slate-600">{row.VOIDID}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-900">
                        {row.VOIDDESCRIPTION || <span className="text-slate-400 italic">{t('no_description', 'No description')}</span>}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {row.branch_excp && row.branch_excp.length > 0 ? (
                          <span
                            className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200"
                            title={t('branch_restrictions', 'Branch Restrictions')}
                          >
                            {row.branch_excp.length} Restricted
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {row.DISCONTINUED === -1 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                            <Ban className="w-2.5 h-2.5" /> {t('discontinued', 'Discontinued')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {t('active', 'Active')}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-end">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(row)}
                            title={t('edit_void_reason', 'Edit Void Reason')}
                            className="p-1 rounded bg-primary hover:bg-primary text-white transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(row)}
                            title={t('delete_void_reason', 'Delete Void Reason')}
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
            <span>Showing {filteredList.length} of {voidReasons.length} void reasons</span>
            <span className="font-mono text-[11px]">{t('page_1_of_1', 'Page 1 of 1')}</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL: NEW VOID REASON */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-wide">{t('new_void_reason', 'New Void Reason')}</h2>
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
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  {t('void_description', 'Void Description')} <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder={t('eg_cold_delay_change_his_mind', 'e.g. COLD, DELAY, CHANGE HIS MIND...')}
                  className="w-full text-xs bg-white border border-slate-300 rounded py-2 px-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="newVoidDiscontinued"
                  checked={newDiscontinued}
                  onChange={(e) => setNewDiscontinued(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
                />
                <label htmlFor="newVoidDiscontinued" className="text-slate-700 font-medium cursor-pointer">
                  {t('discontinued', 'Discontinued')}
                </label>
              </div>

              {/* Branch Restrictions */}
              <div className="border border-slate-200 rounded p-3 bg-slate-50/50">
                <div className="font-semibold text-slate-800 mb-2">{t('branch_restrictions', 'Branch Restrictions')}</div>
                <div className="space-y-1.5">
                  {OMEGA_BRANCHES.map(branch => (
                    <label key={branch.BRANCHID} className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={!!newBranchChecks[Number(branch.BRANCHID)]}
                        onChange={(e) =>
                          setNewBranchChecks(prev => ({
                            ...prev,
                            [Number(branch.BRANCHID)]: e.target.checked
                          }))
                        }
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                      />
                      <span>{branch.BARANCHNAME}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Footer Save */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-medium transition-colors cursor-pointer"
                >
                  {t('cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary hover:bg-primary text-white font-semibold rounded shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{t('save', 'Save')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: EDIT VOID REASON */}
      {/* ========================================================= */}
      {showEditModal && editingRow && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-wide">{t('edit_void_reason', 'Edit Void Reason')}</h2>
              <button
                type="button"
                onClick={() => { setShowEditModal(false); setEditingRow(null); }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-3">
                  <label className="block text-slate-700 font-semibold mb-1">{t('id', 'Id')}</label>
                  <input
                    type="text"
                    disabled
                    value={editingRow.VOIDID}
                    className="w-full text-xs bg-slate-100 border border-slate-300 rounded py-2 px-3 text-slate-500 cursor-not-allowed"
                  />
                </div>
                <div className="col-span-9">
                  <label className="block text-slate-700 font-semibold mb-1">
                    {t('void_description', 'Void Description')} <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded py-2 px-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editVoidDiscontinued"
                  checked={editDiscontinued}
                  onChange={(e) => setEditDiscontinued(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
                />
                <label htmlFor="editVoidDiscontinued" className="text-slate-700 font-medium cursor-pointer">
                  {t('discontinued', 'Discontinued')}
                </label>
              </div>

              {/* Branch Restrictions */}
              <div className="border border-slate-200 rounded p-3 bg-slate-50/50">
                <div className="font-semibold text-slate-800 mb-2">{t('branch_restrictions', 'Branch Restrictions')}</div>
                <div className="space-y-1.5">
                  {OMEGA_BRANCHES.map(branch => (
                    <label key={branch.BRANCHID} className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={!!editBranchChecks[Number(branch.BRANCHID)]}
                        onChange={(e) =>
                          setEditBranchChecks(prev => ({
                            ...prev,
                            [Number(branch.BRANCHID)]: e.target.checked
                          }))
                        }
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                      />
                      <span>{branch.BARANCHNAME}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Footer Save */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingRow(null); }}
                  className="px-3.5 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-medium transition-colors cursor-pointer"
                >
                  {t('cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary hover:bg-primary text-white font-semibold rounded shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{t('save', 'Save')}</span>
                </button>
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
                {t('are_you_sure_you_want_to_delete_this', 'Are you sure you want to delete this void reason ?')}
              </p>
              <div className="mt-2 text-xs text-slate-500 font-mono">
                {deleteTarget.VOIDID} - {deleteTarget.VOIDDESCRIPTION}
              </div>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-200 transition-colors font-medium cursor-pointer"
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-1.5 bg-primary hover:bg-primary text-white rounded font-semibold transition-colors cursor-pointer shadow-xs"
              >
                {t('ok', 'OK')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
