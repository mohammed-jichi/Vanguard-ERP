'use client';

import React, { useState, useEffect } from 'react';
import { useTenant } from '@/lib/TenantContext';
import { supabase } from '@/lib/supabaseClient';
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
  const { currentTenant } = useTenant();
  const [tanks, setTanks] = useState<StainlessTank[]>(INITIAL_TANKS);
  const [selectedGrade, setSelectedGrade] = useState<'All' | OilGrade | 'Empty'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedTankForSample, setSelectedTankForSample] = useState<StainlessTank | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [sourceTankId, setSourceTankId] = useState('TK-01');
  const [destTankId, setDestTankId] = useState('TK-02');
  const [transferVolume, setTransferVolume] = useState<number>(500);
  const [transferNotes, setTransferNotes] = useState('Routine settling & decanter transfer');
  const [isTransferring, setIsTransferring] = useState(false);

  useEffect(() => {
    async function loadPersistedTanks() {
      try {
        const targetId = (currentTenant?.id && currentTenant.id !== '1300' && !currentTenant.id.startsWith('comp-'))
          ? currentTenant.id
          : '00000000-0000-0000-0000-000000000001';

        // 1. Try public.mill_tanks
        try {
          const { data: dbTanks } = await supabase
            .from('mill_tanks')
            .select('*')
            .eq('tenant_id', targetId);

          if (dbTanks && dbTanks.length > 0) {
            setTanks(prev => prev.map(t => {
              const match = dbTanks.find(d => d.id === t.id);
              if (match) {
                return {
                  ...t,
                  currentLevelLiters: Number(match.current_level_liters),
                  acidityPct: Number(match.acidity_pct),
                  grade: match.grade || t.grade,
                  title: match.title || t.title
                };
              }
              return t;
            }));
            return;
          }
        } catch (dbErr) {
          console.warn('mill_tanks table query notice:', dbErr);
        }

        // 2. Fallback to feature_flags.mill_tanks
        const { data: tenantData } = await supabase
          .from('tenants')
          .select('feature_flags')
          .eq('id', targetId)
          .maybeSingle();

        if (tenantData?.feature_flags?.mill_tanks && Array.isArray(tenantData.feature_flags.mill_tanks) && tenantData.feature_flags.mill_tanks.length > 0) {
          setTanks(tenantData.feature_flags.mill_tanks);
        }
      } catch (err) {
        console.warn('Notice loading tanks from database:', err);
      }
    }
    loadPersistedTanks();
  }, [currentTenant?.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleExecuteTransfer = async () => {
    if (sourceTankId === destTankId) {
      alert('Source and destination tank cannot be the same!');
      return;
    }
    const source = tanks.find(t => t.id === sourceTankId);
    const dest = tanks.find(t => t.id === destTankId);
    if (!source || !dest) return;

    if (transferVolume <= 0) {
      alert('Please enter a valid transfer volume greater than 0.');
      return;
    }
    if (transferVolume > source.currentLevelLiters) {
      alert(`Source tank ${sourceTankId} only has ${source.currentLevelLiters.toLocaleString()} L available.`);
      return;
    }
    const destHeadspace = dest.capacityLiters - dest.currentLevelLiters;
    if (transferVolume > destHeadspace) {
      alert(`Destination tank ${destTankId} only has ${destHeadspace.toLocaleString()} L free headspace.`);
      return;
    }

    setIsTransferring(true);
    try {
      // Calculate blended acidity in destination tank
      const destCurrentVol = dest.currentLevelLiters;
      const newDestVol = destCurrentVol + transferVolume;
      const blendedAcidity = newDestVol > 0
        ? Number(((destCurrentVol * (dest.acidityPct || 0.4) + transferVolume * (source.acidityPct || 0.4)) / newDestVol).toFixed(2))
        : source.acidityPct;

      const newSourceVol = source.currentLevelLiters - transferVolume;

      const updatedTanks = tanks.map(t => {
        if (t.id === sourceTankId) {
          return {
            ...t,
            currentLevelLiters: newSourceVol,
            status: newSourceVol === 0 ? ('Sanitized_Empty' as const) : t.status
          };
        }
        if (t.id === destTankId) {
          return {
            ...t,
            currentLevelLiters: newDestVol,
            acidityPct: blendedAcidity,
            status: 'Active_Filling' as const
          };
        }
        return t;
      });

      setTanks(updatedTanks);

      // Persist to Supabase
      const targetId = (currentTenant?.id && currentTenant.id !== '1300' && !currentTenant.id.startsWith('comp-'))
        ? currentTenant.id
        : '00000000-0000-0000-0000-000000000001';

      try {
        await supabase.from('mill_tanks').upsert([
          { id: sourceTankId, tenant_id: targetId, current_level_liters: newSourceVol },
          { id: destTankId, tenant_id: targetId, current_level_liters: newDestVol, acidity_pct: blendedAcidity }
        ]);
      } catch (e) {}

      try {
        const { data: tenantData } = await supabase
          .from('tenants')
          .select('feature_flags')
          .eq('id', targetId)
          .maybeSingle();

        const flags = tenantData?.feature_flags || {};
        await supabase
          .from('tenants')
          .update({
            feature_flags: {
              ...flags,
              mill_tanks: updatedTanks
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', targetId);
      } catch (e) {}

      setShowTransferModal(false);
      showToast(`✓ Transferred ${transferVolume.toLocaleString()} L from ${sourceTankId} to ${destTankId}. Blended acidity: ${blendedAcidity}%`);
    } catch (err: any) {
      alert(`Transfer failed: ${err.message}`);
    } finally {
      setIsTransferring(false);
    }
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

        <div className="flex items-center gap-3 text-xs font-medium">
          <div className="text-right">
            <span className="text-slate-400 block text-[10px]">{t('total_tank_capacity', 'Total Tank Capacity')}</span>
            <span className="font-bold text-slate-900">{totalOccupiedLiters.toLocaleString()} / {totalCapacityLiters.toLocaleString()} L ({overallOccupancyPct}%)</span>
          </div>

          <button
            type="button"
            onClick={() => setShowTransferModal(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>{t('tank_transfer_btn', 'Tank-to-Tank Transfer & Mixing')}</span>
          </button>
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

      {/* TANK-TO-TANK TRANSFER & MIXING MODAL */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 relative text-slate-800">
            <button
              onClick={() => setShowTransferModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-200 pb-3 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                <ArrowLeftRight className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {t('tank_transfer_modal_title', 'Tank-to-Tank Oil Transfer & Mixing Engine')}
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">
                  {t('tank_transfer_modal_sub', 'Internal pipeline transfer, blending, and batch acidity recalculation')}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Source & Destination Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Source Tank */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    {t('source_tank_label', 'Source Tank (من الخزان):')}
                  </label>
                  <select
                    value={sourceTankId}
                    onChange={(e) => setSourceTankId(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded font-semibold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none"
                  >
                    {tanks.filter(t => t.currentLevelLiters > 0).map(t => (
                      <option key={t.id} value={t.id}>
                        {t.id} — {t.title} ({t.currentLevelLiters.toLocaleString()} L | {t.acidityPct}%)
                      </option>
                    ))}
                  </select>
                  {(() => {
                    const src = tanks.find(t => t.id === sourceTankId);
                    return src ? (
                      <div className="text-[10px] text-slate-500 mt-1 font-mono">
                        Available: <strong className="text-slate-800">{src.currentLevelLiters.toLocaleString()} L</strong> • Acidity: {src.acidityPct}%
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* Destination Tank */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    {t('dest_tank_label', 'Target Tank (إلى الخزان):')}
                  </label>
                  <select
                    value={destTankId}
                    onChange={(e) => setDestTankId(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded font-semibold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none"
                  >
                    {tanks.filter(t => t.id !== sourceTankId).map(t => (
                      <option key={t.id} value={t.id}>
                        {t.id} — {t.title} ({t.currentLevelLiters.toLocaleString()} / {t.capacityLiters.toLocaleString()} L)
                      </option>
                    ))}
                  </select>
                  {(() => {
                    const dst = tanks.find(t => t.id === destTankId);
                    return dst ? (
                      <div className="text-[10px] text-slate-500 mt-1 font-mono">
                        Headspace: <strong className="text-emerald-700">{(dst.capacityLiters - dst.currentLevelLiters).toLocaleString()} L</strong> • Cur Acidity: {dst.acidityPct}%
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>

              {/* Transfer Volume */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  {t('transfer_volume_liters', 'Transfer Volume (الكمية المنقولة باللتر):')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    value={transferVolume}
                    onChange={(e) => setTransferVolume(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 border border-slate-300 rounded font-bold font-mono text-sm text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">Liters (L)</span>
                </div>
              </div>

              {/* Blending & Quality Simulation Preview */}
              {(() => {
                const src = tanks.find(t => t.id === sourceTankId);
                const dst = tanks.find(t => t.id === destTankId);
                if (!src || !dst) return null;

                const destCurrentVol = dst.currentLevelLiters;
                const newDestVol = destCurrentVol + transferVolume;
                const blendedAcidity = newDestVol > 0
                  ? ((destCurrentVol * (dst.acidityPct || 0.4) + transferVolume * (src.acidityPct || 0.4)) / newDestVol).toFixed(2)
                  : src.acidityPct;

                return (
                  <div className="bg-indigo-50/70 border border-indigo-200 rounded-lg p-3 space-y-1.5 font-mono text-[11px]">
                    <div className="font-bold text-indigo-900 flex items-center justify-between border-b border-indigo-200 pb-1">
                      <span>🧪 {t('blended_acidity_calc', 'Blended Quality Simulation:')}</span>
                      <span className="text-indigo-800 text-xs font-black">{blendedAcidity}% {t('acidity', 'Acidity')}</span>
                    </div>
                    <div className="flex justify-between text-indigo-800">
                      <span>{sourceTankId} Remaining:</span>
                      <strong>{Math.max(0, src.currentLevelLiters - transferVolume).toLocaleString()} L</strong>
                    </div>
                    <div className="flex justify-between text-indigo-800">
                      <span>{destTankId} Final Volume:</span>
                      <strong>{newDestVol.toLocaleString()} / {dst.capacityLiters.toLocaleString()} L</strong>
                    </div>
                  </div>
                );
              })()}

              {/* Notes */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">{t('transfer_reason_notes', 'Transfer Reason / Operation Notes:')}</label>
                <input
                  type="text"
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none"
                  placeholder="e.g. Decanting settling sediment to clarify extra virgin batch"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setShowTransferModal(false)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded text-xs font-semibold cursor-pointer"
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                type="button"
                disabled={isTransferring}
                onClick={handleExecuteTransfer}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm disabled:opacity-50"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>{isTransferring ? t('transferring', 'Transferring...') : t('execute_transfer', 'Execute Pipeline Transfer')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
