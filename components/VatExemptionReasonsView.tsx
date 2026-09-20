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
  AlertCircle
} from 'lucide-react';
import {
  OmegaVatExemptionReason,
  INITIAL_VAT_EXEMPTIONS
} from '@/lib/omegaMoreSetupData';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

export default function VatExemptionReasonsView() {
  const [reasons, setReasons] = useState<OmegaVatExemptionReason[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('vanguard_vat_exemptions');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_VAT_EXEMPTIONS;
  });

  const [searchVal, setSearchVal] = useState<string>('');

  // Toast System
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'info' });
  const showToast = (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3500);
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('vanguard_vat_exemptions', JSON.stringify(reasons));
    } catch (e) {
      console.error(e);
    }
  }, [reasons]);

  // Modal States
  const [showModifyModal, setShowModifyModal] = useState<boolean>(false);
  const [editingRow, setEditingRow] = useState<OmegaVatExemptionReason | null>(null);
  const [formDescription, setFormDescription] = useState<string>('');

  // Delete Confirm Modal State
  const [deleteTarget, setDeleteTarget] = useState<OmegaVatExemptionReason | null>(null);

  // Filtered list
  const filteredList = useMemo(() => {
    if (!searchVal.trim()) return reasons;
    const q = searchVal.toLowerCase();
    return reasons.filter(r =>
      r.VATEXEMPTIONREASON.toLowerCase().includes(q) || r.ID.toString().includes(q)
    );
  }, [reasons, searchVal]);

  // Open New Dialog
  const openNewModal = () => {
    setEditingRow(null);
    setFormDescription('');
    setShowModifyModal(true);
  };

  // Open Edit Dialog
  const openEditModal = (row: OmegaVatExemptionReason) => {
    setEditingRow(row);
    setFormDescription(row.VATEXEMPTIONREASON);
    setShowModifyModal(true);
  };

  // Save (New or Edit)
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDescription.trim()) {
      showToast('Please enter a description', 'error');
      return;
    }

    const descTrimmed = formDescription.trim();
    const exists = reasons.some(r =>
      (!editingRow || r.ID !== editingRow.ID) &&
      r.VATEXEMPTIONREASON.trim().toLowerCase() === descTrimmed.toLowerCase()
    );

    if (exists) {
      showToast('Vat Exemption reason already exist', 'error');
      return;
    }

    if (editingRow) {
      // Update
      setReasons(prev =>
        prev.map(r => (r.ID === editingRow.ID ? { ...r, VATEXEMPTIONREASON: descTrimmed } : r))
      );
      showToast('Vat Exemption reason saved', 'success');
    } else {
      // Add
      const nextId = Math.max(0, ...reasons.map(r => r.ID)) + 1;
      const newRecord: OmegaVatExemptionReason = {
        ID: nextId,
        VATEXEMPTIONREASON: descTrimmed
      };
      setReasons(prev => [newRecord, ...prev]);
      showToast('Vat Exemption reason saved', 'success');
    }

    setShowModifyModal(false);
    setEditingRow(null);
    setFormDescription('');
  };

  // Confirm Delete
  const confirmDelete = () => {
    if (!deleteTarget) return;
    setReasons(prev => prev.filter(r => r.ID !== deleteTarget.ID));
    setDeleteTarget(null);
    showToast('Vat Exemption reason deleted', 'success');
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
          Vat Exemption Reasons
        </h1>
        <ul className="flex items-center gap-1.5 text-xs text-slate-500">
          <li>
            <Link href="/backoffice" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
          </li>
          <li>/</li>
          <li className="text-slate-800 font-medium">Vat Exemption Reasons</li>
        </ul>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="px-6 pb-12">
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
          {/* TOOLBAR FILTER BAR */}
          <div className="p-3 border-b border-slate-200 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
              {/* Search input */}
              <div className="col-span-12 md:col-span-6 relative">
                <input
                  type="search"
                  placeholder="Search..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="w-full text-xs font-normal bg-white border border-slate-300 rounded py-2 pl-9 pr-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              </div>

              {/* Actions: + New */}
              <div className="col-span-12 md:col-span-6 text-end">
                <button
                  type="button"
                  onClick={openNewModal}
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
                  <th style={{ width: '70px' }} className="py-2.5 px-4 font-semibold">
                    #
                  </th>
                  <th className="py-2.5 px-4 font-semibold">
                    Vat Exemption Reason
                  </th>
                  <th className="py-2.5 px-4 font-semibold text-end" style={{ width: '110px' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400 font-medium">
                      No vat exemption reasons found.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((row, idx) => (
                    <tr
                      key={row.ID}
                      className={`hover:bg-blue-50/40 transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
                      }`}
                    >
                      <td className="py-2.5 px-4 font-mono text-slate-600">{row.ID}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-900">
                        {row.VATEXEMPTIONREASON}
                      </td>
                      <td className="py-2.5 px-4 text-end">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(row)}
                            title="Edit Reason"
                            className="p-1 rounded bg-primary hover:bg-primary text-white transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(row)}
                            title="Delete Reason"
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
            <span>Showing {filteredList.length} of {reasons.length} records</span>
            <span className="font-mono text-[11px]">Page 1 of 1</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL: MODIFY VAT EXEMPTION REASON (NEW & EDIT) */}
      {/* ========================================================= */}
      {showModifyModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-wide">
                {editingRow ? 'Edit Vat Exemption Reason' : 'New Vat Exemption Reason'}
              </h2>
              <button
                type="button"
                onClick={() => setShowModifyModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Vat Exemption Reason Description <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. Export of goods outside Lebanon (Art. 11)"
                  className="w-full text-xs bg-white border border-slate-300 rounded py-2 px-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Footer Save */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModifyModal(false)}
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
      {/* MODAL: BOOTBOX CONFIRM DELETE */}
      {/* ========================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-md overflow-hidden animate-scaleUp">
            <div className="p-5">
              <p className="text-sm font-medium text-slate-800">
                Are you sure you want to delete this Vat Exemption reason ?
              </p>
              <div className="mt-2 text-xs text-slate-500 font-mono">
                #{deleteTarget.ID} - {deleteTarget.VATEXEMPTIONREASON}
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
