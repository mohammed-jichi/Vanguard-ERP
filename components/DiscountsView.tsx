'use client';
import { useLanguage } from '@/lib/LanguageContext';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Pencil,
  Trash2,
  Plus,
  Search,
  Save,
  X,
  ArrowUpDown,
  Tag,
  Check,
  AlertCircle
} from 'lucide-react';
import {
  OmegaDiscount,
  INITIAL_DISCOUNTS,
  DISCOUNT_TYPE_OPTIONS,
  OPEN_FIX_OPTIONS,
  INVOICE_MESSAGES,
  OMEGA_BRANCHES,
  DEFAULT_PRODUCT_GROUPS
} from '@/lib/omegaDiscountData';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

export default function DiscountsView() {
  const { t } = useLanguage();
  // Main state
  const [discountsList, setDiscountsList] = useState<OmegaDiscount[]>(INITIAL_DISCOUNTS);
  const [searchVal, setSearchVal] = useState<string>('');
  const [selectedBranchId, setSelectedBranchId] = useState<number | 'all'>('all');
  const [sorting, setSorting] = useState<{ field: 'DISCBRANCHID' | 'DISCDESCRIPTION'; dir: 'asc' | 'desc' }>({
    field: 'DISCBRANCHID',
    dir: 'asc'
  });

  // Toast Notification System
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'info' });
  const showToast = (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3500);
  };

  // Modals state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingDiscount, setEditingDiscount] = useState<OmegaDiscount | null>(null);

  // New Discount Form State
  const [newDescription, setNewDescription] = useState<string>('');
  const [newType, setNewType] = useState<number>(1);
  const [newPercentAmount, setNewPercentAmount] = useState<string>('0');
  const [newOpenFix, setNewOpenFix] = useState<number>(0);
  const [newMsgId, setNewMsgId] = useState<string>('');
  const [newIsTaxable, setNewIsTaxable] = useState<boolean>(false);
  const [newNotActive, setNewNotActive] = useState<boolean>(false);
  const [newBranchRestrictions, setNewBranchRestrictions] = useState<{ [branchId: number]: boolean }>({});

  // Edit Discount Form State
  const [editDescription, setEditDescription] = useState<string>('');
  const [editType, setEditType] = useState<number>(1);
  const [editPercentAmount, setEditPercentAmount] = useState<string>('0');
  const [editOpenFix, setEditOpenFix] = useState<number>(0);
  const [editMsgId, setEditMsgId] = useState<string>('');
  const [editIsTaxable, setEditIsTaxable] = useState<boolean>(false);
  const [editNotActive, setEditNotActive] = useState<boolean>(false);
  const [editBranchRestrictions, setEditBranchRestrictions] = useState<{ [branchId: number]: boolean }>({});
  const [groupRestrictions, setGroupRestrictions] = useState<{ [groupId: number]: boolean }>({
    5: true, // Lebanese Pickles restricted by default
    8: true  // Artisanal Tapenade
  });

  // Sorting Handler
  const toggleSort = (field: 'DISCBRANCHID' | 'DISCDESCRIPTION') => {
    setSorting(prev => ({
      field,
      dir: prev.field === field && prev.dir === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Filtered and Sorted Discounts
  const filteredDiscounts = useMemo(() => {
    return discountsList
      .filter(item => {
        if (selectedBranchId !== 'all' && item.BRANCHID !== selectedBranchId) {
          return false;
        }
        if (searchVal.trim()) {
          const q = searchVal.toLowerCase();
          const matchDesc = item.DISCDESCRIPTION.toLowerCase().includes(q);
          const matchId = item.DISCBRANCHID.toString().includes(q);
          if (!matchDesc && !matchId) return false;
        }
        return true;
      })
      .sort((a, b) => {
        let compare = 0;
        if (sorting.field === 'DISCBRANCHID') {
          compare = a.DISCBRANCHID - b.DISCBRANCHID;
        } else {
          compare = a.DISCDESCRIPTION.localeCompare(b.DISCDESCRIPTION);
        }
        return sorting.dir === 'asc' ? compare : -compare;
      });
  }, [discountsList, searchVal, selectedBranchId, sorting]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setNewDescription('');
    setNewType(1);
    setNewPercentAmount('0');
    setNewOpenFix(0);
    setNewMsgId('');
    setNewIsTaxable(false);
    setNewNotActive(false);
    setNewBranchRestrictions({});
    setShowAddModal(true);
  };

  // Save New Discount
  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescription.trim()) {
      showToast('Discount Description is required.', 'warning');
      return;
    }

    const nextId = discountsList.length > 0 ? Math.max(...discountsList.map(d => d.ID)) + 1 : 4520;
    const nextDiscBranchId = discountsList.length > 0 ? Math.max(...discountsList.map(d => d.DISCBRANCHID)) + 1 : 1;

    const branchExcp = Object.keys(newBranchRestrictions)
      .filter(k => newBranchRestrictions[parseInt(k)])
      .map(k => ({ BRANCHID: parseInt(k) }));

    const newDiscount: OmegaDiscount = {
      ID: nextId,
      DISCBRANCHID: nextDiscBranchId,
      BRAND_ID: 9606,
      BRANCHID: 1,
      DISCDESCRIPTION: newDescription.trim(),
      PERCENT: newPercentAmount ? parseFloat(newPercentAmount) : 0,
      DISCOUNTTAX: newIsTaxable ? 1 : 0,
      DISCOUNTSERVICE: null,
      TYPEDISCOUNT: newType,
      OPENORFIX: newOpenFix,
      MESSAGEONINVID: newMsgId ? parseInt(newMsgId) : null,
      DISCFIDELITY: null,
      NOTACTIVE: newNotActive ? -1 : 0,
      branch_excp: branchExcp
    };

    setDiscountsList(prev => [newDiscount, ...prev]);
    setShowAddModal(false);
    showToast(`Discount "${newDiscount.DISCDESCRIPTION}" created successfully.`, 'success');
  };

  // Open Edit Modal
  const handleOpenEdit = (row: OmegaDiscount) => {
    setEditingDiscount(row);
    setEditDescription(row.DISCDESCRIPTION);
    setEditType(row.TYPEDISCOUNT);
    setEditPercentAmount(row.PERCENT !== null ? row.PERCENT.toString() : '');
    setEditOpenFix(row.OPENORFIX);
    setEditMsgId(row.MESSAGEONINVID ? row.MESSAGEONINVID.toString() : '');
    setEditIsTaxable(row.DISCOUNTTAX === 1);
    setEditNotActive(row.NOTACTIVE === -1);

    const branchMap: { [bId: number]: boolean } = {};
    row.branch_excp.forEach(ex => {
      branchMap[ex.BRANCHID] = true;
    });
    setEditBranchRestrictions(branchMap);

    setShowEditModal(true);
  };

  // Save Edit Discount
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDiscount) return;
    if (!editDescription.trim()) {
      showToast('Discount Description is required.', 'warning');
      return;
    }

    const branchExcp = Object.keys(editBranchRestrictions)
      .filter(k => editBranchRestrictions[parseInt(k)])
      .map(k => ({ BRANCHID: parseInt(k) }));

    setDiscountsList(prev =>
      prev.map(d => {
        if (d.ID === editingDiscount.ID) {
          return {
            ...d,
            DISCDESCRIPTION: editDescription.trim(),
            TYPEDISCOUNT: editType,
            PERCENT: editPercentAmount ? parseFloat(editPercentAmount) : 0,
            OPENORFIX: editOpenFix,
            MESSAGEONINVID: editMsgId ? parseInt(editMsgId) : null,
            DISCOUNTTAX: editIsTaxable ? 1 : 0,
            NOTACTIVE: editNotActive ? -1 : 0,
            branch_excp: branchExcp
          };
        }
        return d;
      })
    );

    setShowEditModal(false);
    showToast(`Discount "${editDescription}" updated successfully.`, 'success');
  };

  // Save Group Restrictions
  const handleSaveGroupRestrictions = (e: React.FormEvent) => {
    e.preventDefault();
    const count = Object.values(groupRestrictions).filter(Boolean).length;
    showToast(`${count} group restrictions saved for this discount.`, 'success');
  };

  // Delete Discount
  const handleDeleteDiscount = (row: OmegaDiscount) => {
    if (confirm(`Are you sure you want to delete discount "${row.DISCDESCRIPTION}"?`)) {
      setDiscountsList(prev => prev.filter(d => d.ID !== row.ID));
      showToast(`Discount "${row.DISCDESCRIPTION}" deleted.`, 'warning');
    }
  };

  return (
    <div className="w-full min-h-screen bg-background p-4 sm:p-6 lg:p-8 font-sans select-none text-slate-800">
      {/* Toast Alert */}
      {toast.show && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 transition-all transform animate-in slide-in-from-top-2 border ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : toast.type === 'warning'
              ? 'bg-amber-50 border-amber-300 text-amber-800'
              : toast.type === 'error'
              ? 'bg-red-50 border-red-300 text-red-800'
              : 'bg-blue-50 border-blue-300 text-blue-800'
          }`}
        >
          {toast.type === 'success' ? (
            <Check className="w-5 h-5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-600" />
          )}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Title and Breadcrumb */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{t('discounts', 'Discounts')}</h1>
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-1">
            <Link href="/backoffice" className="hover:text-blue-600 transition-colors">
              {t('home', 'Home')}
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">{t('discounts', 'Discounts')}</span>
          </nav>
        </div>

        {/* Filter Toolbar matching Omega exact markup */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="lg:col-span-4">
              <div className="relative">
                <input
                  type="search"
                  enterKeyHint="search"
                  value={searchVal}
                  onChange={e => setSearchVal(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder={t('search', 'Search...')}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Branch Selector */}
            <div className="lg:col-span-4">
              <select
                value={selectedBranchId}
                onChange={e => setSelectedBranchId(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-700"
              >
                <option value="all">{t('all_branches', 'All Branches')}</option>
                {OMEGA_BRANCHES.map(b => (
                  <option key={b.BRANCHID} value={b.BRANCHID}>
                    {b.BARANCHNAME}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Toolbar with New Button */}
            <div className="lg:col-span-4 flex items-center justify-end">
              <button
                type="button"
                onClick={handleOpenAdd}
                className="w-full sm:w-auto px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md text-sm font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4 stroke-[2.2]" /> {t('new', 'New')}
              </button>
            </div>
          </div>
        </div>

        {/* Data Table Container */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 divide-y divide-slate-200">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider select-none">
                <tr>
                  <th
                    onClick={() => toggleSort('DISCBRANCHID')}
                    className="px-4 py-3 w-16 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      #
                      <ArrowUpDown
                        className={`w-3.5 h-3.5 text-slate-400 ${
                          sorting.field === 'DISCBRANCHID' ? 'text-blue-600' : ''
                        }`}
                      />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('DISCDESCRIPTION')}
                    className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      {t('description', 'Description')}
                      <ArrowUpDown
                        className={`w-3.5 h-3.5 text-slate-400 ${
                          sorting.field === 'DISCDESCRIPTION' ? 'text-blue-600' : ''
                        }`}
                      />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center w-32">{t('type_value', 'Type / Value')}</th>
                  <th className="px-4 py-3 text-center w-28">{t('restrictions', 'Restrictions')}</th>
                  <th className="px-4 py-3 text-right w-28">{t('actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredDiscounts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                      {t('no_discounts_found', 'No discounts found.')}
                    </td>
                  </tr>
                ) : (
                  filteredDiscounts.map(row => (
                    <tr key={row.ID} className="hover:bg-slate-50/80 transition-colors">
                      {/* ID */}
                      <td className="px-4 py-3 font-semibold text-slate-500">{row.DISCBRANCHID}</td>

                      {/* Description & Attributes */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{row.DISCDESCRIPTION}</span>
                          {row.NOTACTIVE === -1 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">
                              {t('inactive', 'Inactive')}
                            </span>
                          )}
                          {row.OPENORFIX === 1 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                              {t('fix', 'Fix')}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Type & Value */}
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          {row.TYPEDISCOUNT === 1
                            ? `${row.PERCENT !== null ? row.PERCENT : 0}%`
                            : `$${row.PERCENT !== null ? row.PERCENT : 0}`}
                        </span>
                      </td>

                      {/* Branch Restrictions Badge */}
                      <td className="px-4 py-3 text-center">
                        {row.branch_excp && row.branch_excp.length > 0 ? (
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700"
                            title={t('branch_restrictions_active', 'Branch Restrictions active')}
                          >
                            {row.branch_excp.length}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">0</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(row)}
                            className="w-8 h-8 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all shadow-2xs border border-blue-200 hover:border-blue-600"
                            title={t('edit_discount', 'Edit Discount')}
                          >
                            <Pencil className="w-4 h-4 stroke-[2.2]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteDiscount(row)}
                            className="w-8 h-8 rounded-md bg-red-100 text-red-700 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all shadow-2xs border border-red-200 hover:border-red-600"
                            title={t('delete_discount', 'Delete Discount')}
                          >
                            <Trash2 className="w-4 h-4 stroke-[2.2]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200">
                <tr>
                  <td colSpan={5} className="px-4 py-2.5 text-xs text-slate-500 text-center">
                    Showing {filteredDiscounts.length} of {discountsList.length} Discounts | Brand: Zeit w zaytoun ljanoub S.A.R.L
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: NEW DISCOUNT (Exact Omega Template) */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-600" /> {t('new_discount', 'New Discount')}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded-full w-7 h-7 flex items-center justify-center hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNew} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* Description */}
                <div className="sm:col-span-7">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {t('discount_description', 'Discount Description *')}
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newDescription}
                    onChange={e => setNewDescription(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder={t('eg_special_10', 'e.g. SPECIAL 10%')}
                  />
                </div>

                {/* Type Of Discount */}
                <div className="sm:col-span-5">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {t('type_of_discount', 'Type of Discount')}
                  </label>
                  <select
                    value={newType}
                    onChange={e => setNewType(parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {DISCOUNT_TYPE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* Percent/Amount */}
                <div className="sm:col-span-6">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {t('percent_amount', 'Percent / Amount')}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newPercentAmount}
                    onChange={e => setNewPercentAmount(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Open/Fix */}
                <div className="sm:col-span-6">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {t('open_fix', 'Open / Fix *')}
                  </label>
                  <select
                    value={newOpenFix}
                    onChange={e => setNewOpenFix(parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {OPEN_FIX_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Message on Invoice */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t('message_on_invoice', 'Message On Invoice')}
                </label>
                <select
                  value={newMsgId}
                  onChange={e => setNewMsgId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">{t('select_message', 'Select message...')}</option>
                  {INVOICE_MESSAGES.map(msg => (
                    <option key={msg.MESSAGEID} value={msg.MESSAGEID}>
                      {msg.MESSAGETITLE} - {msg.MESSAGEDESC}
                    </option>
                  ))}
                </select>
              </div>

              {/* Checkboxes */}
              <div className="space-y-2 pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={newIsTaxable}
                    onChange={e => setNewIsTaxable(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                  />
                  <span>{t('discount_is_taxable', 'Discount Is Taxable')}</span>
                </label>

                <div className="block">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-slate-700 font-medium">
                    <input
                      type="checkbox"
                      checked={newNotActive}
                      onChange={e => setNewNotActive(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300"
                    />
                    <span>{t('not_active', 'Not Active')}</span>
                  </label>
                </div>
              </div>

              {/* Branch Restrictions Panel */}
              <div className="border border-slate-200 rounded-md overflow-hidden">
                <div className="bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 border-b border-slate-200">
                  {t('branch_restrictions', 'Branch Restrictions')}
                </div>
                <div className="p-3 space-y-2">
                  {OMEGA_BRANCHES.map(b => (
                    <label key={b.BRANCHID} className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!newBranchRestrictions[b.BRANCHID]}
                        onChange={e =>
                          setNewBranchRestrictions(prev => ({
                            ...prev,
                            [b.BRANCHID]: e.target.checked
                          }))
                        }
                        className="w-4 h-4 text-blue-600 rounded border-slate-300"
                      />
                      <span>{b.BARANCHNAME}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  {t('cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-md text-sm font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Save className="w-4 h-4" /> {t('save', 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT DISCOUNT (Exact Omega Template) */}
      {/* ========================================================================= */}
      {showEditModal && editingDiscount && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-600" /> {t('edit_discount', 'Edit Discount')}
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded-full w-7 h-7 flex items-center justify-center hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  {/* ID (Disabled) */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('id', 'Id')}</label>
                    <input
                      type="text"
                      disabled
                      value={editingDiscount.DISCBRANCHID}
                      className="w-full px-3 py-2 text-sm bg-slate-100 border border-slate-300 rounded-md text-slate-500 font-mono"
                    />
                  </div>

                  {/* Description */}
                  <div className="sm:col-span-6">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      {t('discount_description', 'Discount Description *')}
                    </label>
                    <input
                      type="text"
                      required
                      value={editDescription}
                      onChange={e => setEditDescription(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Type of Discount */}
                  <div className="sm:col-span-4">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      {t('type_of_discount', 'Type of Discount')}
                    </label>
                    <select
                      value={editType}
                      onChange={e => setEditType(parseInt(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white"
                    >
                      {DISCOUNT_TYPE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.description}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  {/* Percent/Amount */}
                  <div className="sm:col-span-6">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      {t('percent_amount', 'Percent / Amount')}
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={editPercentAmount}
                      onChange={e => setEditPercentAmount(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                    />
                  </div>

                  {/* Open/Fix */}
                  <div className="sm:col-span-6">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      {t('open_fix', 'Open / Fix *')}
                    </label>
                    <select
                      value={editOpenFix}
                      onChange={e => setEditOpenFix(parseInt(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white"
                    >
                      {OPEN_FIX_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.description}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Message on Invoice */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {t('message_on_invoice', 'Message On Invoice')}
                  </label>
                  <select
                    value={editMsgId}
                    onChange={e => setEditMsgId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white"
                  >
                    <option value="">{t('select_message', 'Select message...')}</option>
                    {INVOICE_MESSAGES.map(msg => (
                      <option key={msg.MESSAGEID} value={msg.MESSAGEID}>
                        {msg.MESSAGETITLE} - {msg.MESSAGEDESC}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Checkboxes */}
                <div className="space-y-2">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-slate-700 font-medium">
                    <input
                      type="checkbox"
                      checked={editIsTaxable}
                      onChange={e => setEditIsTaxable(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300"
                    />
                    <span>{t('discount_is_taxable', 'Discount Is Taxable')}</span>
                  </label>

                  <div className="block">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-slate-700 font-medium">
                      <input
                        type="checkbox"
                        checked={editNotActive}
                        onChange={e => setEditNotActive(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300"
                      />
                      <span>{t('not_active', 'Not Active')}</span>
                    </label>
                  </div>
                </div>

                {/* Branch Restrictions Panel */}
                <div className="border border-slate-200 rounded-md overflow-hidden">
                  <div className="bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 border-b border-slate-200">
                    {t('branch_restrictions', 'Branch Restrictions')}
                  </div>
                  <div className="p-3 space-y-2">
                    {OMEGA_BRANCHES.map(b => (
                      <label key={b.BRANCHID} className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!editBranchRestrictions[b.BRANCHID]}
                          onChange={e =>
                            setEditBranchRestrictions(prev => ({
                              ...prev,
                              [b.BRANCHID]: e.target.checked
                            }))
                          }
                          className="w-4 h-4 text-blue-600 rounded border-slate-300"
                        />
                        <span>{b.BARANCHNAME}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Save Main Details */}
                <div className="text-right">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-md text-sm font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Save className="w-4 h-4" /> {t('save_discount_details', 'Save Discount Details')}
                  </button>
                </div>
              </form>

              {/* ========================================================= */}
              {/* GROUPS RESTRICTION SECTION (From Omega fetched template) */}
              {/* ========================================================= */}
              <div className="pt-4 border-t border-slate-200">
                <form onSubmit={handleSaveGroupRestrictions} className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50">
                  <div className="bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-800 uppercase tracking-wide border-b border-slate-200 flex items-center justify-between">
                    <span>{t('groups_restriction', 'Groups Restriction')}</span>
                    <span className="text-[11px] font-normal text-slate-500">
                      {t('check_items_that_cannot_receive_this', 'Check items that cannot receive this discount')}
                    </span>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {DEFAULT_PRODUCT_GROUPS.map(group => (
                        <label
                          key={group.GRIDBRANCHID}
                          className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer p-1.5 rounded hover:bg-slate-100 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={!!groupRestrictions[group.GRIDBRANCHID]}
                            onChange={e =>
                              setGroupRestrictions(prev => ({
                                ...prev,
                                [group.GRIDBRANCHID]: e.target.checked
                              }))
                            }
                            className="w-4 h-4 text-blue-600 rounded border-slate-300"
                          />
                          <span>{group.GROUPNAME}</span>
                        </label>
                      ))}
                    </div>

                    <div className="text-right pt-2 border-t border-slate-200">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-primary hover:bg-primary text-white rounded-md text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Save className="w-3.5 h-3.5" /> {t('save_restrictions', 'Save Restrictions')}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
