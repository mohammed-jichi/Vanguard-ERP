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
  Check,
  Star,
  AlertCircle
} from 'lucide-react';
import {
  OmegaInvoiceMessage,
  INITIAL_INVOICE_MESSAGES,
  OMEGA_BRANCHES
} from '@/lib/omegaMoreSetupData';
import { useTenant } from '@/lib/TenantContext';
import { supabase } from '@/lib/supabase';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

export default function MessageOnInvoiceView() {
  const { currentTenant } = useTenant();
  const [messages, setMessages] = useState<OmegaInvoiceMessage[]>(INITIAL_INVOICE_MESSAGES);

  // Mount hydration from Supabase
  useEffect(() => {
    async function loadPersistedMessages() {
      try {
        const targetId = (currentTenant?.id && currentTenant.id !== '1300' && !currentTenant.id.startsWith('comp-'))
          ? currentTenant.id
          : '00000000-0000-0000-0000-000000000001';

        const { data, error } = await supabase
          .from('tenants')
          .select('feature_flags')
          .eq('id', targetId)
          .maybeSingle();

        if (data?.feature_flags?.invoice_messages && Array.isArray(data.feature_flags.invoice_messages) && data.feature_flags.invoice_messages.length > 0) {
          setMessages(data.feature_flags.invoice_messages);
        }
      } catch (err) {
        console.warn('Notice loading invoice messages from database:', err);
      }
    }
    loadPersistedMessages();
  }, [currentTenant?.id]);

  const persistMessagesToDatabase = async (newMessages: OmegaInvoiceMessage[]): Promise<{ success: boolean; error?: string }> => {
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
            invoice_messages: newMessages
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
  const [editingMessage, setEditingMessage] = useState<OmegaInvoiceMessage | null>(null);

  // New Message Form State
  const [newMsgId, setNewMsgId] = useState<string>('');
  const [newMsgTitle, setNewMsgTitle] = useState<string>('');
  const [newBranch, setNewBranch] = useState<number | 'ALL'>('ALL');
  const [newMsgText, setNewMsgText] = useState<string>('');

  // Edit Message Form State
  const [editMsgId, setEditMsgId] = useState<string>('');
  const [editMsgTitle, setEditMsgTitle] = useState<string>('');
  const [editBranch, setEditBranch] = useState<number>(1);
  const [editMsgText, setEditMsgText] = useState<string>('');
  const [editDefault, setEditDefault] = useState<boolean>(false);

  // Confirm Modal States
  const [deleteTarget, setDeleteTarget] = useState<OmegaInvoiceMessage | null>(null);
  const [defaultTarget, setDefaultTarget] = useState<OmegaInvoiceMessage | null>(null);

  // Filtered List
  const filteredMessages = useMemo(() => {
    return messages.filter(item => {
      if (selectedBranchId !== 'all' && item.BRANCHID !== selectedBranchId) {
        return false;
      }
      if (searchVal.trim()) {
        const q = searchVal.toLowerCase();
        const matchTitle = item.MESSAGETITLE.toLowerCase().includes(q);
        const matchDesc = item.MESSAGEDESC.toLowerCase().includes(q);
        const matchBranch = item.BARANCHNAME.toLowerCase().includes(q);
        const matchId = item.MESSAGEID.toString().includes(q);
        if (!matchTitle && !matchDesc && !matchBranch && !matchId) return false;
      }
      return true;
    });
  }, [messages, selectedBranchId, searchVal]);

  // Open Add Dialog
  const openAddModal = () => {
    const nextMsgId = Math.max(1000, ...messages.map(m => m.MESSAGEID)) + 1;
    setNewMsgId(nextMsgId.toString());
    setNewMsgTitle('');
    setNewBranch('ALL');
    setNewMsgText('');
    setShowAddModal(true);
  };

  // Save New Message
  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const idNum = parseInt(newMsgId, 10);
    if (isNaN(idNum)) {
      showToast('Please enter a valid message ID', 'error');
      return;
    }
    if (!newMsgTitle.trim()) {
      showToast('Please enter a message title', 'error');
      return;
    }
    if (!newMsgText.trim()) {
      showToast('Please enter message text', 'error');
      return;
    }

    const idExists = messages.some(m => m.MESSAGEID === idNum);
    if (idExists) {
      showToast('Message id already exist, please try again', 'error');
      return;
    }

    const branchName =
      newBranch === 'ALL'
        ? 'All Branches'
        : OMEGA_BRANCHES.find(b => b.BRANCHID === newBranch)?.BARANCHNAME || 'Zeit w zaytoun ljanoub';

    const nextDbId = Math.max(0, ...messages.map(m => m.ID)) + 1;

    const newRecord: OmegaInvoiceMessage = {
      ID: nextDbId,
      MESSAGEID: idNum,
      BRAND_ID: 9606,
      FORBRANCH: newBranch === 'ALL' ? 0 : Number(newBranch),
      BRANCHID: newBranch === 'ALL' ? 1 : Number(newBranch),
      MESSAGETITLE: newMsgTitle.trim(),
      MESSAGEDESC: newMsgText.trim(),
      STATUS: 0,
      BARANCHNAME: branchName,
      MSGID: messages.length + 1
    };

    const updated = [newRecord, ...messages];
    const res = await persistMessagesToDatabase(updated);
    if (!res.success) {
      showToast(`Database persistence failed: ${res.error}`, 'error');
      return;
    }

    setMessages(updated);
    setShowAddModal(false);
    showToast('Message on invoice saved to database', 'success');
  };

  // Open Edit Dialog
  const openEditModal = (row: OmegaInvoiceMessage) => {
    setEditingMessage(row);
    setEditMsgId(row.MESSAGEID.toString());
    setEditMsgTitle(row.MESSAGETITLE);
    setEditBranch(row.BRANCHID);
    setEditMsgText(row.MESSAGEDESC);
    setEditDefault(row.STATUS === -1);
    setShowEditModal(true);
  };

  // Update Message (allBranches = 0 or 1)
  const handleUpdate = async (allBranches: 0 | 1) => {
    if (!editingMessage) return;
    const idNum = parseInt(editMsgId, 10);
    if (isNaN(idNum) || !editMsgTitle.trim() || !editMsgText.trim()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const idConflict = messages.some(
      m => m.ID !== editingMessage.ID && m.MESSAGEID === idNum
    );
    if (idConflict) {
      showToast('Message id already exist, please try again', 'error');
      return;
    }

    const branchName =
      allBranches === 1
        ? 'All Branches'
        : OMEGA_BRANCHES.find(b => b.BRANCHID === editBranch)?.BARANCHNAME || 'Zeit w zaytoun ljanoub';

    const updated = messages.map(m => {
      if (m.ID === editingMessage.ID) {
        return {
          ...m,
          MESSAGEID: idNum,
          MESSAGETITLE: editMsgTitle.trim(),
          MESSAGEDESC: editMsgText.trim(),
          BRANCHID: allBranches === 1 ? 1 : editBranch,
          BARANCHNAME: branchName,
          STATUS: editDefault ? -1 : 0
        };
      }
      if (editDefault && m.BRANCHID === editBranch && m.ID !== editingMessage.ID) {
        return { ...m, STATUS: 0 };
      }
      return m;
    });

    const res = await persistMessagesToDatabase(updated);
    if (!res.success) {
      showToast(`Database persistence failed: ${res.error}`, 'error');
      return;
    }

    setMessages(updated);
    setShowEditModal(false);
    setEditingMessage(null);
    showToast(
      allBranches === 1 ? 'Message saved for all Branches in database' : 'Message saved to database',
      'success'
    );
  };

  // Set As Default Action
  const confirmSetDefault = async () => {
    if (!defaultTarget) return;

    const updated = messages.map(m => {
      if (m.MESSAGEID === defaultTarget.MESSAGEID) {
        return { ...m, STATUS: -1 };
      }
      if (m.BRANCHID === defaultTarget.BRANCHID) {
        return { ...m, STATUS: 0 };
      }
      return m;
    });

    const res = await persistMessagesToDatabase(updated);
    if (!res.success) {
      showToast(`Database persistence failed: ${res.error}`, 'error');
      return;
    }

    setMessages(updated);
    setDefaultTarget(null);
    showToast('Message has been set as default in database', 'success');
  };

  // Confirm Delete Action
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const updated = messages.filter(m => m.MESSAGEID !== deleteTarget.MESSAGEID);

    const res = await persistMessagesToDatabase(updated);
    if (!res.success) {
      showToast(`Database persistence failed: ${res.error}`, 'error');
      return;
    }

    setMessages(updated);
    setDeleteTarget(null);
    showToast('Message on invoice deleted from database', 'success');
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
          Message On Invoice
        </h1>
        <ul className="flex items-center gap-1.5 text-xs text-slate-500">
          <li>
            <Link href="/backoffice" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
          </li>
          <li>/</li>
          <li className="text-slate-800 font-medium">Message On Invoice</li>
        </ul>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="px-6 pb-12">
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
          {/* TOOLBAR FILTER BAR */}
          <div className="p-3 border-b border-slate-200 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
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
                  <th style={{ width: '70px' }} className="py-2.5 px-4 font-semibold">
                    #
                  </th>
                  <th style={{ width: '180px' }} className="py-2.5 px-4 font-semibold">
                    Branch
                  </th>
                  <th style={{ width: '140px' }} className="py-2.5 px-4 font-semibold">
                    Title
                  </th>
                  <th className="py-2.5 px-4 font-semibold">
                    Message
                  </th>
                  <th style={{ width: '100px' }} className="py-2.5 px-4 font-semibold text-center">
                    Status
                  </th>
                  <th className="py-2.5 px-4 font-semibold text-end" style={{ width: '160px' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMessages.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                      No messages on invoice found.
                    </td>
                  </tr>
                ) : (
                  filteredMessages.map((row, idx) => (
                    <tr
                      key={row.MESSAGEID}
                      className={`hover:bg-blue-50/40 transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
                      }`}
                    >
                      <td className="py-2.5 px-4 font-mono text-slate-600">{row.MESSAGEID}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-800">{row.BARANCHNAME}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">{row.MESSAGETITLE}</td>
                      <td className="py-2.5 px-4 text-slate-700 max-w-md break-words">
                        {row.MESSAGEDESC}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {row.STATUS === -1 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <Star className="w-2.5 h-2.5 fill-emerald-600 text-emerald-600" /> Default
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            Normal
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-end">
                        <div className="flex items-center justify-end gap-1">
                          {/* Delete (Hidden for 1000 & 1001 system messages as in Omega ERP) */}
                          {[1000, 1001].indexOf(row.MESSAGEID) === -1 && (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(row)}
                              title="Delete Message"
                              className="p-1 rounded bg-destructive hover:bg-destructive text-white transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Default Action Button */}
                          <button
                            type="button"
                            onClick={() => setDefaultTarget(row)}
                            title="Set as Default"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-semibold transition-colors cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span className="hidden sm:inline">Default</span>
                          </button>

                          {/* Edit Action Button */}
                          <button
                            type="button"
                            onClick={() => openEditModal(row)}
                            title="Edit Message"
                            className="p-1 rounded bg-primary hover:bg-primary text-white transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
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
            <span>Showing {filteredMessages.length} of {messages.length} messages</span>
            <span className="font-mono text-[11px]">Page 1 of 1</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL: NEW MESSAGE ON INVOICE */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/50 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-wide">New Message On Invoice</h2>
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
                <div className="col-span-4">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Message id <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    autoFocus
                    value={newMsgId}
                    onChange={(e) => setNewMsgId(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded py-2 px-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-8">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Message title <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newMsgTitle}
                    onChange={(e) => setNewMsgTitle(e.target.value)}
                    placeholder="e.g. Feedback, MERITS Loyalty..."
                    className="w-full text-xs bg-white border border-slate-300 rounded py-2 px-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Branch</label>
                <select
                  value={newBranch}
                  onChange={(e) => setNewBranch(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                  className="w-full text-xs bg-white border border-slate-300 rounded py-2 px-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="ALL">ALL</option>
                  {OMEGA_BRANCHES.map(b => (
                    <option key={b.BRANCHID} value={b.BRANCHID}>
                      {b.BARANCHNAME}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Message text <span className="text-rose-600">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={newMsgText}
                  onChange={(e) => setNewMsgText(e.target.value)}
                  placeholder="Enter message text printed on the guest invoice..."
                  className="w-full text-xs bg-white border border-slate-300 rounded py-2 px-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
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
      {/* MODAL: EDIT MESSAGE ON INVOICE */}
      {/* ========================================================= */}
      {showEditModal && editingMessage && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/50 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-wide">Edit Message On Invoice</h2>
              <button
                type="button"
                onClick={() => { setShowEditModal(false); setEditingMessage(null); }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleUpdate(0); }} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-4">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Message id <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={editMsgId}
                    onChange={(e) => setEditMsgId(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded py-2 px-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-8">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Message title <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editMsgTitle}
                    onChange={(e) => setEditMsgTitle(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded py-2 px-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Branches</label>
                <select
                  value={editBranch}
                  onChange={(e) => setEditBranch(Number(e.target.value))}
                  className="w-full text-xs bg-white border border-slate-300 rounded py-2 px-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  {OMEGA_BRANCHES.map(b => (
                    <option key={b.BRANCHID} value={b.BRANCHID}>
                      {b.BARANCHNAME}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Message text <span className="text-rose-600">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={editMsgText}
                  onChange={(e) => setEditMsgText(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded py-2 px-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="updateDefaultMessage"
                  checked={editDefault}
                  onChange={(e) => setEditDefault(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
                />
                <label htmlFor="updateDefaultMessage" className="text-slate-700 font-medium cursor-pointer">
                  Default
                </label>
              </div>

              {/* Split Actions: Save and Save for all Branches (Identical to Omega ERP) */}
              <div className="pt-2 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingMessage(null); }}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdate(0)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary hover:bg-primary text-white font-semibold rounded shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdate(1)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1e40af] hover:bg-primary/90 text-white font-semibold rounded shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save for all Branches</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: BOOTBOX CONFIRM SET AS DEFAULT */}
      {/* ========================================================= */}
      {defaultTarget && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-md overflow-hidden animate-scaleUp">
            <div className="p-5">
              <p className="text-sm font-medium text-slate-800">
                Are you sure you want to set this message as default for {defaultTarget.BARANCHNAME}?
              </p>
              <div className="mt-2 text-xs text-slate-500 font-mono">
                {defaultTarget.MESSAGEID} - {defaultTarget.MESSAGETITLE}
              </div>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDefaultTarget(null)}
                className="px-3.5 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-200 transition-colors font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSetDefault}
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-semibold transition-colors cursor-pointer shadow-xs"
              >
                OK
              </button>
            </div>
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
                Are you sure you want to delete this message on invoice?
              </p>
              <div className="mt-2 text-xs text-slate-500 font-mono">
                #{deleteTarget.MESSAGEID} - {deleteTarget.MESSAGETITLE}
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
