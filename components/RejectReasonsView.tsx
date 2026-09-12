'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Save,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface RejectReason {
  ID: number;
  DESCRIPTION: string;
  BRAND_ID: number;
}

export default function RejectReasonsView() {
  const [loading, setLoading] = useState<boolean>(true);
  const [reasons, setReasons] = useState<RejectReason[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [sorting, setSorting] = useState<{ value: string; type: 'asc' | 'desc' }>({
    value: 'DESCRIPTION',
    type: 'asc'
  });

  // Modal States
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newDescription, setNewDescription] = useState<string>('');
  const [addSaving, setAddSaving] = useState<boolean>(false);

  const [editRow, setEditRow] = useState<RejectReason | null>(null);
  const [editDescription, setEditDescription] = useState<string>('');
  const [editSaving, setEditSaving] = useState<boolean>(false);

  const [deleteRow, setDeleteRow] = useState<RejectReason | null>(null);
  const [deleteSaving, setDeleteSaving] = useState<boolean>(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchReasons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/getAllRejectReasonsList', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page,
          searchvalue: searchValue,
          sorting
        })
      });
      if (res.ok) {
        const data = await res.json();
        setReasons(data.data || []);
        setTotalPages(data.last_page || 1);
        setTotalCount(data.total || 0);
      }
    } catch (e) {
      console.error('Failed to fetch reject reasons', e);
      showToast('Failed to load reject reasons', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, searchValue, sorting]);

  useEffect(() => {
    fetchReasons();
  }, [fetchReasons]);

  const handleSort = (field: string) => {
    setSorting(prev => ({
      value: field,
      type: prev.value === field && prev.type === 'asc' ? 'desc' : 'asc'
    }));
    setPage(1);
  };

  // Add Reason
  const handleSaveNew = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newDescription.trim()) return;

    setAddSaving(true);
    try {
      const res = await fetch('/api/saveNewReasonService', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reasonDescription: newDescription.trim() })
      });
      if (res.ok) {
        showToast('Reason saved', 'success');
        setShowAddModal(false);
        setNewDescription('');
        fetchReasons();
      } else {
        showToast('Reason not saved', 'error');
      }
    } catch (err) {
      showToast('Error saving reason', 'error');
    } finally {
      setAddSaving(false);
    }
  };

  // Edit Reason
  const handleSaveEdit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editRow || !editDescription.trim()) return;

    setEditSaving(true);
    try {
      const res = await fetch('/api/editReasonService', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reasonid: editRow.ID,
          reasonDescription: editDescription.trim()
        })
      });
      if (res.ok) {
        showToast('Reason saved', 'success');
        setEditRow(null);
        fetchReasons();
      } else {
        showToast('Reason not saved', 'error');
      }
    } catch (err) {
      showToast('Error updating reason', 'error');
    } finally {
      setEditSaving(false);
    }
  };

  // Delete Reason
  const handleConfirmDelete = async () => {
    if (!deleteRow) return;

    setDeleteSaving(true);
    try {
      const res = await fetch('/api/deleteReasonService', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reasonid: deleteRow.ID })
      });
      if (res.ok) {
        showToast('Reason deleted', 'success');
        setDeleteRow(null);
        fetchReasons();
      } else {
        showToast('Reason not deleted', 'error');
      }
    } catch (err) {
      showToast('Error deleting reason', 'error');
    } finally {
      setDeleteSaving(false);
    }
  };

  return (
    <div className="wspaceCont productrequest-rejectreasons-bt5-page bg-[#f3f5f8] min-h-screen text-slate-800">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-white font-medium text-sm animate-fade-in ${
            toast.type === 'success' ? 'bg-[#1ab394] border border-[#18a689]' : 'bg-rose-600 border border-rose-500'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="content p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header matching Omega */}
        <div className="header border-b border-slate-200 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="page-title text-2xl font-bold text-slate-900 tracking-tight">Reject Reasons</h1>
              <ol className="breadcrumb flex items-center gap-2 text-xs text-slate-500 mt-1">
                <li>
                  <a href="/backoffice/operations" className="hover:text-emerald-700 transition">
                    Operations
                  </a>
                </li>
                <li>/</li>
                <li>
                  <a href="/backoffice/operations?section=manage_product_requests" className="hover:text-emerald-700 transition">
                    Product Request
                  </a>
                </li>
                <li>/</li>
                <li className="text-slate-700 font-semibold">Reject Reasons</li>
              </ol>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setPage(1);
                  fetchReasons();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm transition"
                title="Refresh Table"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="main-content bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Toolbar */}
          <div className="rejectreasons-toolbar p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
            <div className="rejectreasons-search w-full sm:w-80 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchValue}
                onChange={e => {
                  setSearchValue(e.target.value);
                  setPage(1);
                }}
                className="form-control search-input w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                placeholder="Search description..."
              />
            </div>

            <div className="rejectreasons-actions flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => {
                  setNewDescription('');
                  setShowAddModal(true);
                }}
                className="btn btn-primary inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#1ab394] hover:bg-[#18a689] rounded-lg shadow-sm transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span className="rejectreasons-desktop-text">New Reason</span>
              </button>
            </div>
          </div>

          {/* Table Wrap */}
          <div className="rejectreasons-table-wrap overflow-x-auto">
            <table className="table table-custom table-striped table-hover rejectreasons-table w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th
                    className="rejectreasons-id-col py-3.5 px-4 cursor-pointer hover:text-slate-900 transition w-24"
                    onClick={() => handleSort('ID')}
                  >
                    <div className="flex items-center gap-1">
                      <span>#</span>
                      {sorting.value === 'ID' ? (
                        sorting.type === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      )}
                    </div>
                  </th>
                  <th
                    className="rejectreasons-description-col py-3.5 px-4 cursor-pointer hover:text-slate-900 transition"
                    onClick={() => handleSort('DESCRIPTION')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Description</span>
                      {sorting.value === 'DESCRIPTION' ? (
                        sorting.type === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      )}
                    </div>
                  </th>
                  <th className="rejectreasons-action-col py-3.5 px-4 text-right w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-slate-400">
                      <div className="inline-flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
                        <span>Loading reject reasons...</span>
                      </div>
                    </td>
                  </tr>
                ) : reasons.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-slate-500">
                      <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-medium">No reject reasons found</p>
                      <p className="text-xs text-slate-400 mt-0.5">Click &quot;New Reason&quot; to configure a standard rejection rationale.</p>
                    </td>
                  </tr>
                ) : (
                  reasons.map((row, idx) => (
                    <tr
                      key={row.ID}
                      className={`hover:bg-slate-50/80 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                    >
                      <td className="rejectreasons-id-col py-3.5 px-4 font-mono text-xs text-slate-500 font-semibold">
                        {row.ID}
                      </td>
                      <td className="rejectreasons-description-col py-3.5 px-4 text-slate-800 font-medium">
                        {row.DESCRIPTION}
                      </td>
                      <td className="rejectreasons-action-col py-3.5 px-4 text-right">
                        <div className="rejectreasons-row-actions inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditRow(row);
                              setEditDescription(row.DESCRIPTION);
                            }}
                            className="p-1.5 text-slate-600 bg-slate-100 hover:bg-[#1ab394] hover:text-white rounded-md transition shadow-xs"
                            title="Edit Reason"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteRow(row)}
                            className="p-1.5 text-slate-600 bg-slate-100 hover:bg-rose-600 hover:text-white rounded-md transition shadow-xs"
                            title="Delete Reason"
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

          {/* Pagination Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing {reasons.length > 0 ? (page - 1) * 15 + 1 : 0} to{' '}
              {Math.min(page * 15, totalCount)} of {totalCount} reasons
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`min-w-[30px] py-1 px-2 text-xs font-semibold rounded border transition ${
                    p === page
                      ? 'bg-[#1ab394] text-white border-[#1ab394]'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ADD REASON MODAL
          ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between px-5 py-4 bg-slate-900 text-white">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>New Reject Reason</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNew} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Reason Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  autoFocus
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="e.g. Out of Stock at Central Warehouse, Budget Exceeded..."
                  className="w-full text-sm p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  id="newReasonBtn"
                  type="submit"
                  disabled={addSaving || !newDescription.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#1ab394] hover:bg-[#18a689] rounded-lg shadow-sm disabled:opacity-50 transition"
                >
                  <Save className="w-4 h-4" />
                  <span>{addSaving ? 'Saving...' : 'Save Reason'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          EDIT REASON MODAL
          ========================================================================= */}
      {editRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between px-5 py-4 bg-slate-900 text-white">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-emerald-400" />
                <span>Edit Reject Reason #{editRow.ID}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditRow(null)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Reason Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  autoFocus
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  className="w-full text-sm p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditRow(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving || !editDescription.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#1ab394] hover:bg-[#18a689] rounded-lg shadow-sm disabled:opacity-50 transition"
                >
                  <Save className="w-4 h-4" />
                  <span>{editSaving ? 'Updating...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          DELETE CONFIRMATION MODAL
          ========================================================================= */}
      {deleteRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-scale-in">
            <div className="p-5 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Delete Reason</h3>
              <p className="text-xs text-slate-600">
                Are you sure you want to delete this reason ?
              </p>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs font-medium text-slate-800 text-left">
                &quot;{deleteRow.DESCRIPTION}&quot;
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-3.5 bg-slate-50 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteRow(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteSaving}
                onClick={handleConfirmDelete}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm disabled:opacity-50 transition"
              >
                {deleteSaving ? 'Deleting...' : 'Delete Reason'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
