'use client';

import React, { useState } from 'react';
import {
  Landmark,
  Droplets,
  Search,
  Filter,
  ShieldCheck,
  Thermometer,
  Percent,
  CheckCircle2,
  X,
  ArrowLeftRight
} from 'lucide-react';
import { INITIAL_TANKS } from '@/lib/pressingMillData';
import { StainlessTank, OilGrade } from '@/types/pressingMill';
import { useLanguage } from '@/lib/LanguageContext';

export default function TanksMatrixView() {
  const { t } = useLanguage();
  const [tanks, setTanks] = useState<StainlessTank[]>(INITIAL_TANKS);
  const [selectedGrade, setSelectedGrade] = useState<'All' | OilGrade | 'Empty'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedTankForSample, setSelectedTankForSample] = useState<StainlessTank | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredTanks = tanks.filter(tank => {
    if (selectedGrade === 'Empty') {
      if (tank.status !== 'Sanitized_Empty') return false;
    } else if (selectedGrade !== 'All') {
      if (tank.grade !== selectedGrade) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        tank.id.toLowerCase().includes(q) ||
        tank.title.toLowerCase().includes(q) ||
        (tank.allocatedFarmerOrBatch && tank.allocatedFarmerOrBatch.toLowerCase().includes(q))
      );
    }

    return true;
  });

  const totalCapacityLiters = tanks.reduce((acc, t) => acc + t.capacityLiters, 0);
  const totalOccupiedLiters = tanks.reduce((acc, t) => acc + t.currentLevelLiters, 0);
  const overallOccupancyPct = Math.round((totalOccupiedLiters / totalCapacityLiters) * 100);

  return (
    <div className="space-y-6">
      {/* GLOBAL TOAST */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* HEADER & SUMMARY */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              {t('tank_farm_title', 'Stainless Steel Tank Farm (50 Storage Silos)')}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('tank_farm_sub', 'Bulk olive oil storage monitoring, nitrogen blanketed hermetic silos, and laboratory quality grades')}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="text-right">
            <span className="text-slate-400 block text-[10px]">{t('total_tank_capacity', 'Total Tank Capacity')}</span>
            <span className="font-bold text-slate-900">{totalOccupiedLiters.toLocaleString()} / {totalCapacityLiters.toLocaleString()} L ({overallOccupancyPct}%)</span>
          </div>
        </div>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={t('search_tank_placeholder', 'Search Tank ID (e.g. TK-01, Extra Virgin, batch)...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-slate-500"
          />
        </div>

        {/* Grade Pills */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <button
            onClick={() => setSelectedGrade('All')}
            className={`px-3 py-1 rounded font-medium transition cursor-pointer ${
              selectedGrade === 'All'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t('all_tanks_50', 'All Tanks (50)')}
          </button>

          <button
            onClick={() => setSelectedGrade('Extra_Virgin')}
            className={`px-3 py-1 rounded font-medium transition cursor-pointer ${
              selectedGrade === 'Extra_Virgin'
                ? 'bg-emerald-800 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            {t('extra_virgin_15', 'Extra Virgin (15)')}
          </button>

          <button
            onClick={() => setSelectedGrade('Virgin')}
            className={`px-3 py-1 rounded font-medium transition cursor-pointer ${
              selectedGrade === 'Virgin'
                ? 'bg-blue-800 text-white'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
          >
            {t('virgin_15', 'Virgin (15)')}
          </button>

          <button
            onClick={() => setSelectedGrade('Settling_Raw')}
            className={`px-3 py-1 rounded font-medium transition cursor-pointer ${
              selectedGrade === 'Settling_Raw'
                ? 'bg-amber-800 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            {t('settling_tanks_10', 'Settling Tanks (10)')}
          </button>

          <button
            onClick={() => setSelectedGrade('Empty')}
            className={`px-3 py-1 rounded font-medium transition cursor-pointer ${
              selectedGrade === 'Empty'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t('sanitized_empty_10', 'Sanitized Empty (10)')}
          </button>
        </div>
      </div>

      {/* 50 TANKS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {filteredTanks.map((tank) => {
          const fillPct = Math.round((tank.currentLevelLiters / tank.capacityLiters) * 100);

          return (
            <div
              key={tank.id}
              className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs space-y-2.5 relative hover:border-slate-400 transition"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 font-mono">{tank.id}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  tank.grade === 'Extra_Virgin' ? 'bg-emerald-100 text-emerald-800' :
                  tank.grade === 'Virgin' ? 'bg-blue-100 text-blue-800' :
                  tank.grade === 'Settling_Raw' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  {tank.grade.replace('_', ' ')}
                </span>
              </div>

              {/* Title & Level */}
              <div>
                <h3 className="text-[11px] font-semibold text-slate-800 truncate" title={tank.title}>
                  {tank.title}
                </h3>
                <span className="text-[10px] text-slate-500 block">
                  {tank.currentLevelLiters.toLocaleString()} / {tank.capacityLiters.toLocaleString()} L ({fillPct}%)
                </span>
              </div>

              {/* Visual Level Gauge */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    tank.currentLevelLiters === 0 ? 'bg-slate-300' :
                    fillPct > 90 ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${fillPct}%` }}
                />
              </div>

              {/* Telemetry Metrics */}
              <div className="grid grid-cols-2 gap-1 pt-1.5 border-t border-slate-100 text-[10px]">
                <div>
                  <span className="text-slate-400 block">{t('acidity', 'Acidity')}</span>
                  <span className="font-bold text-slate-800">
                    {tank.acidityPct > 0 ? `${tank.acidityPct}%` : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">{t('internal_temp', 'Internal Temp')}</span>
                  <span className="font-bold text-slate-800">{tank.internalTempC}°C</span>
                </div>
              </div>

              {/* Footer status & sample action */}
              <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
                <span>{tank.nitrogenBlanketed ? t('n2_hermetic', '🛡️ N₂ Hermetic') : t('atmospheric', 'Atmospheric')}</span>
                <button
                  onClick={() => setSelectedTankForSample(tank)}
                  className="text-slate-700 hover:text-slate-900 font-semibold underline cursor-pointer"
                >
                  {t('inspect_sample', 'Inspect / Sample')}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* TANK SAMPLE MODAL */}
      {selectedTankForSample && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 relative text-slate-800">
            <button
              onClick={() => setSelectedTankForSample(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center border-b border-slate-200 pb-3 mb-3">
              <h3 className="text-sm font-bold text-slate-900">{selectedTankForSample.title}</h3>
              <span className="text-xs text-slate-500 font-mono">
                {selectedTankForSample.id} • {t('food_grade_ss316', 'Stainless Steel 316 Food Grade')}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('current_volume', 'Current Volume:')}</span>
                  <span className="font-bold">{selectedTankForSample.currentLevelLiters.toLocaleString()} {t('liters_word', 'Liters')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('free_headspace', 'Free Headspace:')}</span>
                  <span className="font-bold">{(selectedTankForSample.capacityLiters - selectedTankForSample.currentLevelLiters).toLocaleString()} {t('liters_word', 'Liters')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('acidity_reading', 'Acidity Reading:')}</span>
                  <span className="font-bold text-emerald-700">{selectedTankForSample.acidityPct}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('harvest_year', 'Harvest Year:')}</span>
                  <span className="font-bold">{selectedTankForSample.harvestYear}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('allocated_lot', 'Allocated Lot:')}</span>
                  <span className="font-bold">{selectedTankForSample.allocatedFarmerOrBatch || t('general_mill_silo', 'General Mill Silo')}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedTankForSample(null)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded text-xs font-semibold cursor-pointer"
              >
                {t('close', 'Close')}
              </button>
              <button
                onClick={() => {
                  setSelectedTankForSample(null);
                  showToast(`${t('lab_sample_extracted', 'Laboratory sample extracted from')} ${selectedTankForSample.id}.`);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold cursor-pointer"
              >
                {t('dispatch_quality_sample', 'Dispatch Quality Sample')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
