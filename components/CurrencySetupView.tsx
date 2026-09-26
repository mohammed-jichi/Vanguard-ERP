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
  AlertCircle
} from 'lucide-react';
import {
  OmegaCurrency,
  INITIAL_CURRENCIES
} from '@/lib/omegaZoneAndCurrencyData';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

export default function CurrencySetupView() {
  const { t } = useLanguage();
  const [currencies, setCurrencies] = useState<OmegaCurrency[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('vanguard_currencies');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_CURRENCIES;
  });

  const [searchVal, setSearchVal] = useState<string>('');
  const [sorting, setSorting] = useState<{ field: 'DESCRIPTION' | 'maincurrency'; dir: 'asc' | 'desc' }>({
    field: 'maincurrency',
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

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('vanguard_currencies', JSON.stringify(currencies));
    } catch (e) {
      console.error(e);
    }
  }, [currencies]);

  // Modal States
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingRow, setEditingRow] = useState<OmegaCurrency | null>(null);

  // New Currency Form State
  const [newDesc, setNewDesc] = useState<string>('');
  const [newSymbol, setNewSymbol] = useState<string>('');
  const [newPosRate, setNewPosRate] = useState<string>('');
  const [newBackRate, setNewBackRate] = useState<string>('');
  const [newDecimalNo, setNewDecimalNo] = useState<string>('2');
  const [newInvDecimalNo, setNewInvDecimalNo] = useState<string>('0');

  // Edit Currency Form State
  const [editDesc, setEditDesc] = useState<string>('');
  const [editSymbol, setEditSymbol] = useState<string>('');
  const [editASymbol, setEditASymbol] = useState<string>('');
  const [editBackRate, setEditBackRate] = useState<string>('');
  const [editPosRate, setEditPosRate] = useState<string>('');
  const [editDecimalNo, setEditDecimalNo] = useState<string>('2');
  const [editInvDecimalNo, setEditInvDecimalNo] = useState<string>('0');

  // Delete Confirm Modal State
  const [deleteTarget, setDeleteTarget] = useState<OmegaCurrency | null>(null);

  // Sorting Handler
  const toggleSort = (field: 'DESCRIPTION' | 'maincurrency') => {
    setSorting(prev => ({
      field,
      dir: prev.field === field && prev.dir === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Filtered and Sorted list
  const filteredList = useMemo(() => {
    return currencies
      .filter(item => {
        if (!searchVal.trim()) return true;
        const q = searchVal.toLowerCase();
        return (
          item.DESCRIPTION.toLowerCase().includes(q) ||
          item.SYNBOL.toLowerCase().includes(q) ||
          item.RATE.toString().includes(q)
        );
      })
      .sort((a, b) => {
        if (sorting.field === 'DESCRIPTION') {
          const comp = a.DESCRIPTION.localeCompare(b.DESCRIPTION);
          return sorting.dir === 'asc' ? comp : -comp;
        } else {
          return sorting.dir === 'asc' ? a.maincurrency - b.maincurrency : b.maincurrency - a.maincurrency;
        }
      });
  }, [currencies, searchVal, sorting]);

  // Open Add Dialog
  const openAddModal = () => {
    setNewDesc('');
    setNewSymbol('');
    setNewPosRate('');
    setNewBackRate('');
    setNewDecimalNo('2');
    setNewInvDecimalNo('0');
    setShowAddModal(true);
  };

  // Save New Currency
  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim()) {
      showToast('Please enter a currency description', 'error');
      return;
    }
    if (!newSymbol.trim()) {
      showToast('Please enter a currency symbol', 'error');
      return;
    }

    const posRateNum = parseFloat(newPosRate);
    const backRateNum = parseFloat(newBackRate);
    if (isNaN(posRateNum) || posRateNum <= 0) {
      showToast('Rate should be greater than 0', 'error');
      return;
    }
    if (isNaN(backRateNum) || backRateNum <= 0) {
      showToast('Back Rate should be greater than 0', 'error');
      return;
    }

    const exists = currencies.some(
      c => c.DESCRIPTION.trim().toLowerCase() === newDesc.trim().toLowerCase()
    );
    if (exists) {
      showToast('This currency description already exists, please choose another', 'error');
      return;
    }

    const nextId = Math.max(100, ...currencies.map(c => c.ID)) + 1;
    const newRecord: OmegaCurrency = {
      ID: nextId,
      BRAND_ID: 9606,
      BRANCHID: 1,
      DESCRIPTION: newDesc.trim(),
      RATE: posRateNum,
      SYNBOL: newSymbol.trim(),
      ASYNBOL: newSymbol.trim(),
      DIGITNUMBER: parseInt(newDecimalNo, 10) || 0,
      BACKRATE: backRateNum,
      DECIMALNBRINV: parseInt(newInvDecimalNo, 10) || 0,
      maincurrency: 3
    };

    setCurrencies(prev => [...prev, newRecord]);
    setShowAddModal(false);
    showToast('Currency saved', 'success');
  };

  // Open Edit Dialog
  const openEditModal = (row: OmegaCurrency) => {
    setEditingRow(row);
    setEditDesc(row.DESCRIPTION);
    setEditSymbol(row.SYNBOL);
    setEditASymbol(row.ASYNBOL);
    setEditBackRate(row.BACKRATE.toString());
    setEditPosRate(row.RATE.toString());
    setEditDecimalNo(row.DIGITNUMBER.toString());
    setEditInvDecimalNo(row.DECIMALNBRINV !== null && row.DECIMALNBRINV !== undefined ? row.DECIMALNBRINV.toString() : '0');
    setShowEditModal(true);
  };

  // Save Edit Currency
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRow) return;

    if (!editDesc.trim()) {
      showToast('Please enter a currency description', 'error');
      return;
    }

    const posRateNum = parseFloat(editPosRate);
    const backRateNum = parseFloat(editBackRate);
    if (isNaN(posRateNum) || posRateNum <= 0) {
      showToast('Rate should be greater than 0', 'error');
      return;
    }
    if (isNaN(backRateNum) || backRateNum <= 0) {
      showToast('Back Rate should be greater than 0', 'error');
      return;
    }

    const exists = currencies.some(
      c => c.ID !== editingRow.ID && c.DESCRIPTION.trim().toLowerCase() === editDesc.trim().toLowerCase()
    );
    if (exists) {
      showToast('This currency description already exists, please choose another', 'error');
      return;
    }

    setCurrencies(prev =>
      prev.map(c => {
        if (c.ID === editingRow.ID) {
          return {
            ...c,
            DESCRIPTION: editDesc.trim(),
            SYNBOL: editSymbol.trim(),
            ASYNBOL: editASymbol.trim(),
            RATE: posRateNum,
            BACKRATE: backRateNum,
            DIGITNUMBER: parseInt(editDecimalNo, 10) || 0,
            DECIMALNBRINV: parseInt(editInvDecimalNo, 10) || 0
          };
        }
        return c;
      })
    );

    setShowEditModal(false);
    setEditingRow(null);
    showToast('Currency saved', 'success');
  };

  // Confirm Delete
  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.maincurrency === 1 || deleteTarget.maincurrency === 2) {
      showToast('You are not allowed to delete primary/secondary currency', 'error');
      setDeleteTarget(null);
      return;
    }
    setCurrencies(prev => prev.filter(c => c.ID !== deleteTarget.ID));
    setDeleteTarget(null);
    showToast('Currency deleted', 'success');
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
          {t('currency_setup', 'Currency Setup')}
        </h1>
        <ul className="flex items-center gap-1.5 text-xs text-slate-500">
          <li>
            <Link href="/backoffice" className="hover:text-blue-600 transition-colors">
              {t('home', 'Home')}
            </Link>
          </li>
          <li>/</li>
          <li className="text-slate-800 font-medium">{t('currency_setup', 'Currency Setup')}</li>
        </ul>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="px-6 pb-12">
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
          {/* TOOLBAR FILTER BAR */}
          <div className="p-3 border-b border-slate-200 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
              {/* Search Input */}
              <div className="col-span-10 md:col-span-4 relative">
                <input
                  type="search"
                  placeholder={t('search', 'Search...')}
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="w-full text-xs font-normal bg-white border border-slate-300 rounded py-2 pl-9 pr-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              </div>

              {/* Actions: + New */}
              <div className="col-span-2 md:col-span-8 text-end">
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
                    onClick={() => toggleSort('DESCRIPTION')}
                    className="py-2.5 px-4 font-semibold cursor-pointer hover:bg-slate-50 transition-colors select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>{t('description', 'Description')}</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th style={{ width: '140px' }} className="py-2.5 px-4 font-semibold text-center">
                    {t('type', 'Type')}
                  </th>
                  <th style={{ width: '160px' }} className="py-2.5 px-4 font-semibold text-end">
                    Rate (POS / BackOffice)
                  </th>
                  <th style={{ width: '110px' }} className="py-2.5 px-4 font-semibold text-end">
                    {t('actions', 'Actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 font-medium">
                      {t('no_currencies_found', 'No currencies found.')}
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
                      <td className="py-2.5 px-4 font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{row.DESCRIPTION}</span>
                          <span className="text-slate-400 font-mono text-[11px]">({row.SYNBOL})</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {row.maincurrency === 1 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            {t('main', 'MAIN')}
                          </span>
                        )}
                        {row.maincurrency === 2 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            {t('second', 'SECOND')}
                          </span>
                        )}
                        {row.maincurrency === 3 && (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-end font-mono text-slate-700">
                        <span>{row.RATE.toLocaleString()}</span>
                        {row.RATE !== row.BACKRATE && (
                          <span className="text-slate-400 text-[10px] block">Back: {row.BACKRATE.toLocaleString()}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-end">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(row)}
                            title={t('edit_currency', 'Edit Currency')}
                            className="p-1 rounded bg-primary hover:bg-primary text-white transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(row)}
                            title={t('delete_currency', 'Delete Currency')}
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
            <span>Showing {filteredList.length} of {currencies.length} currencies</span>
            <span className="font-mono text-[11px]">{t('page_1_of_1', 'Page 1 of 1')}</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL: NEW CURRENCY */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/50 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-wide">{t('new_currency', 'New Currency')}</h2>
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
                <div className="col-span-6">
                  <label className="block text-slate-700 font-semibold mb-1">
                    {t('description', 'Description')} <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder={t('eg_sar_qar_gbp', 'e.g. SAR, QAR, GBP...')}
                    className="w-full text-xs bg-white border border-slate-300 rounded py-2 px-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-6">
                  <label className="block text-slate-700 font-semibold mb-1">
                    {t('symbol', 'Symbol')} <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newSymbol}
                    onChange={(e) => setNewSymbol(e.target.value)}
                    placeholder={t('eg_sr_qr', 'e.g. SR, QR, £...')}
                    className="w-full text-xs bg-white border border-slate-300 rounded py-2 px-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-6">
                  <label className="block text-slate-700 font-semibold mb-1">
                    {t('pos_rate', 'POS Rate')} <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newPosRate}
                    onChange={(e) => setNewPosRate(e.target.value)}
                    placeholder={t('eg_24000', 'e.g. 24000')}
                    className="w-full text-xs bg-white border border-slate-300 rounded py-2 px-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-6">
                  <label className="block text-slate-700 font-semibold mb-1">
                    {t('backoffice_rate', 'BackOffice Rate')} <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newBackRate}
                    onChange={(e) => setNewBackRate(e.target.value)}
                    placeholder={t('eg_24000', 'e.g. 24000')}
                    className="w-full text-xs bg-white border border-slate-300 rounded py-2 px-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-6">
                  <label className="block text-slate-700 font-semibold mb-1">
                    {t('decimal_number', 'Decimal Number')} <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="9"
                    required
                    value={newDecimalNo}
                    onChange={(e) => setNewDecimalNo(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded py-2 px-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-6">
                  <label className="block text-slate-700 font-semibold mb-1">
                    {t('inv_decimal_number', 'Inv. Decimal Number')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="9"
                    value={newInvDecimalNo}
                    onChange={(e) => setNewInvDecimalNo(e.target.value)}
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
      {/* MODAL: EDIT CURRENCY */}
      {/* ========================================================= */}
      {showEditModal && editingRow && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/50 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold tracking-wide">{t('edit_currency', 'Edit Currency')}</h2>
                {editingRow.maincurrency === 1 && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500 text-white">
                    {t('main_currency', 'Main Currency')}
                  </span>
                )}
                {editingRow.maincurrency === 2 && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white">
                    {t('second_currency', 'Second Currency')}
                  </span>
                )}
              </div>
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
                  <label className="block text-slate-700 font-semibold mb-1">{t('id', 'ID')}</label>
                  <input
                    type="text"
                    disabled
                    value={editingRow.ID}
                    className="w-full text-xs bg-slate-100 border border-slate-300 rounded py-2 px-3 text-slate-500 cursor-not-allowed"
                  />
                </div>
                <div className="col-span-9">
                  <label className="block text-slate-700 font-semibold mb-1">
                    {t('description', 'Description')} <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded py-2 px-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-6">
                  <label className="block text-slate-700 font-semibold mb-1">
                    {t('symbol', 'Symbol')} <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editSymbol}
                    onChange={(e) => setEditSymbol(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded py-2 px-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-6">
                  <label className="block text-slate-700 font-semibold mb-1">
                    {t('symbol_sc', 'Symbol SC')} <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={editASymbol}
                    onChange={(e) => setEditASymbol(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded py-2 px-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-6">
                  <label className="block text-slate-700 font-semibold mb-1">
                    {t('backoffice_rate', 'BackOffice Rate')} <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editBackRate}
                    onChange={(e) => setEditBackRate(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded py-2 px-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-6">
                  <label className="block text-slate-700 font-semibold mb-1">
                    {t('pos_rate', 'POS Rate')} <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editPosRate}
                    onChange={(e) => setEditPosRate(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded py-2 px-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-6">
                  <label className="block text-slate-700 font-semibold mb-1">
                    {t('decimal_number', 'Decimal Number')} <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="9"
                    required
                    value={editDecimalNo}
                    onChange={(e) => setEditDecimalNo(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded py-2 px-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-6">
                  <label className="block text-slate-700 font-semibold mb-1">
                    {t('inv_decimal_number', 'Inv. Decimal Number')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="9"
                    value={editInvDecimalNo}
                    onChange={(e) => setEditInvDecimalNo(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded py-2 px-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
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
                {t('are_you_sure_that_you_want_to_delete', 'Are you sure that you want to delete this currency?')}
              </p>
              <div className="mt-2 text-xs text-slate-500 font-mono">
                #{deleteTarget.ID} - {deleteTarget.DESCRIPTION} ({deleteTarget.SYNBOL})
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
