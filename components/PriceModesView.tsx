'use client';
import { useLanguage } from '@/lib/LanguageContext';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Save,
  Check,
  AlertCircle,
  Clock,
  Layers,
  Calendar
} from 'lucide-react';
import {
  OmegaPriceMode,
  INITIAL_PRICE_MODES
} from '@/lib/omegaPriceModeData';
import { OMEGA_BRANCHES } from '@/lib/omegaDiscountData';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

export default function PriceModesView() {
  const { t } = useLanguage();
  const [modes, setModes] = useState<OmegaPriceMode[]>(INITIAL_PRICE_MODES);
  const [selectedBranchId, setSelectedBranchId] = useState<number>(1);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Toast Notification System
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'info' });
  const showToast = (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3500);
  };

  // Update description
  const handleDescriptionChange = (index: number, val: string) => {
    setModes(prev => {
      const next = [...prev];
      next[index] = { ...next[index], MODEDESCRIPTION: val };
      return next;
    });
  };

  // Update time for a day
  const handleTimeChange = (
    index: number,
    field: 'TIMEOFDAY' | 'TIMEOFDAY1' | 'TIMEOFDAY2' | 'TIMEOFDAY3' | 'TIMEOFDAY4' | 'TIMEOFDAY5' | 'TIMEOFDAY6',
    val: string
  ) => {
    setModes(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  // Toggle "Disable All" for Mode 3 or Mode 4
  const handleToggleDisableAll = (index: number, checked: boolean) => {
    setModes(prev => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        disableAll: checked,
        disabledDays: {
          monday: checked,
          tuesday: checked,
          wednesday: checked,
          thursday: checked,
          friday: checked,
          saturday: checked,
          sunday: checked
        }
      };
      return next;
    });
  };

  // Toggle single day disable for Mode 3 or Mode 4
  const handleToggleDayDisable = (
    index: number,
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday',
    checked: boolean
  ) => {
    setModes(prev => {
      const next = [...prev];
      const curDays = next[index].disabledDays || {};
      const newDays = { ...curDays, [day]: checked };
      const allDisabled = Object.values(newDays).filter(Boolean).length === 7;
      next[index] = {
        ...next[index],
        disabledDays: newDays,
        disableAll: allDisabled
      };
      return next;
    });
  };

  // Save for Current Branch
  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast('Price Modes configuration saved successfully for Zeit w zaytoun ljanoub.', 'success');
    }, 400);
  };

  // Save For All Branches
  const handleSaveAllBranches = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast('Price Modes configuration successfully broadcasted and saved to ALL branches!', 'success');
    }, 600);
  };

  const days: Array<{
    key: 'TIMEOFDAY' | 'TIMEOFDAY1' | 'TIMEOFDAY2' | 'TIMEOFDAY3' | 'TIMEOFDAY4' | 'TIMEOFDAY5' | 'TIMEOFDAY6';
    dayKey: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    label: string;
  }> = [
    { key: 'TIMEOFDAY', dayKey: 'monday', label: 'Monday' },
    { key: 'TIMEOFDAY1', dayKey: 'tuesday', label: 'Tuesday' },
    { key: 'TIMEOFDAY2', dayKey: 'wednesday', label: 'Wednesday' },
    { key: 'TIMEOFDAY3', dayKey: 'thursday', label: 'Thursday' },
    { key: 'TIMEOFDAY4', dayKey: 'friday', label: 'Friday' },
    { key: 'TIMEOFDAY5', dayKey: 'saturday', label: 'Saturday' },
    { key: 'TIMEOFDAY6', dayKey: 'sunday', label: 'Sunday' }
  ];

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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{t('modes', 'Modes')}</h1>
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-1">
            <Link href="/backoffice" className="hover:text-blue-600 transition-colors">
              {t('home', 'Home')}
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">{t('modes', 'Modes')}</span>
          </nav>
        </div>

        {/* Toolbar matching Omega exact markup */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:w-80">
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                {t('branch_selection', 'Branch Selection')}
              </label>
              <select
                value={selectedBranchId}
                onChange={e => setSelectedBranchId(parseInt(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-700 font-medium"
              >
                {OMEGA_BRANCHES.map(b => (
                  <option key={b.BRANCHID} value={b.BRANCHID}>
                    {b.BARANCHNAME}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-slate-500 italic hidden md:block">
              {t('time_scheduled_price_shifts_automate', 'Time scheduled price shifts automate happy hour, night pricing, and dynamic margins.')}
            </div>
          </div>
        </div>

        {/* Weekly Time Matrix Table matching Omega ModesView */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 divide-y divide-slate-200">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider select-none">
                <tr>
                  <th className="px-4 py-3.5 min-w-[200px]">{t('description', 'Description')}</th>
                  {days.map(d => (
                    <th key={d.dayKey} className="px-3 py-3.5 text-center min-w-[115px]">
                      <div className="flex items-center justify-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{d.label}</span>
                      </div>
                    </th>
                  ))}
                  <th className="w-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {modes.map((modeRow, idx) => {
                  const isOptionalMode = idx >= 2; // Mode 3 & Mode 4 can be disabled
                  return (
                    <tr key={modeRow.ID} className="hover:bg-slate-50/60 transition-colors">
                      {/* Description & Disable All */}
                      <td className="px-4 py-4 align-top">
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={modeRow.MODEDESCRIPTION}
                            onChange={e => handleDescriptionChange(idx, e.target.value)}
                            placeholder={`Mode ${idx + 1} description`}
                            className="w-full px-3 py-1.5 text-sm font-semibold text-slate-800 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          />

                          {isOptionalMode && (
                            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600">
                              <input
                                type="checkbox"
                                checked={!!modeRow.disableAll}
                                onChange={e => handleToggleDisableAll(idx, e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded border-slate-300"
                              />
                              <span>{t('disable_all', 'Disable All')}</span>
                            </label>
                          )}
                        </div>
                      </td>

                      {/* Day Columns */}
                      {days.map(d => {
                        const isDayDisabled = isOptionalMode && !!modeRow.disabledDays?.[d.dayKey];

                        return (
                          <td key={d.dayKey} className="px-3 py-4 text-center align-top">
                            <div className="flex flex-col items-center gap-2">
                              <div className="relative w-full">
                                <input
                                  type="time"
                                  disabled={isDayDisabled}
                                  value={modeRow[d.key] || '00:00'}
                                  onChange={e => handleTimeChange(idx, d.key, e.target.value)}
                                  className={`w-full text-center px-2 py-1.5 text-sm border rounded-md font-mono transition-colors ${
                                    isDayDisabled
                                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                      : 'bg-white text-slate-900 border-slate-300 focus:ring-2 focus:ring-blue-500 font-bold'
                                  }`}
                                />
                              </div>

                              {isOptionalMode && (
                                <label
                                  className="inline-flex items-center gap-1 text-[11px] text-slate-500 cursor-pointer"
                                  title={`Disable for ${d.label}`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isDayDisabled}
                                    onChange={e => handleToggleDayDisable(idx, d.dayKey, e.target.checked)}
                                    className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300"
                                  />
                                  <span className="text-[10px]">{t('off', 'Off')}</span>
                                </label>
                              )}
                            </div>
                          </td>
                        );
                      })}

                      <td className="w-6"></td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200">
                <tr>
                  <td colSpan={9} className="px-4 py-3.5">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="text-xs text-slate-500 font-medium">
                        Active Price Modes: {modes.length} (Standard, Lunch, Happy Hour, Late Night)
                      </div>

                      <div className="flex items-center gap-2.5 w-full sm:w-auto">
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={handleSave}
                          className="flex-1 sm:flex-none px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md text-sm font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                        >
                          <Save className="w-4 h-4" /> {t('save', 'Save')}
                        </button>

                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={handleSaveAllBranches}
                          className="flex-1 sm:flex-none px-4 py-2 bg-primary hover:bg-primary text-white rounded-md text-sm font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                        >
                          <Save className="w-4 h-4" /> {t('save_for_all_branches', 'Save For All Branches')}
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
