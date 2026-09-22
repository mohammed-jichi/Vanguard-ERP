'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Lock,
  Unlock,
  AlertTriangle,
  FileText,
  Printer,
  Download,
  Plus,
  RefreshCw,
  Scale,
  Droplets,
  Layers,
  Coins,
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { INITIAL_SEASONS } from '@/lib/pressingMillData';
import { HarvestSeason, SeasonStatus } from '@/types/pressingMill';
import { useLanguage } from '@/lib/LanguageContext';

export default function SeasonManagementView() {
  const { t } = useLanguage();
  const [seasons, setSeasons] = useState<HarvestSeason[]>(INITIAL_SEASONS);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>(INITIAL_SEASONS[0].id);

  // Form states for creating / editing season
  const [seasonName, setSeasonName] = useState('Season 2026/2027 (Active Campaign)');
  const [startDateTime, setStartDateTime] = useState('2026-09-15T06:00');
  const [endDateTime, setEndDateTime] = useState('2027-01-31T20:00');
  const [status, setStatus] = useState<SeasonStatus>('Active');
  const [notes, setNotes] = useState('Primary winter pressing campaign across Mount Lebanon, Hasbaya, and Chouf.');

  // UI Modals
  const [showEndSeasonModal, setShowEndSeasonModal] = useState(false);
  const [showAuditReportModal, setShowAuditReportModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedSeason = seasons.find((s) => s.id === selectedSeasonId) || seasons[0];
  const isSelectedActive = selectedSeason.status === 'Active';

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSelectSeason = (season: HarvestSeason) => {
    setSelectedSeasonId(season.id);
    setSeasonName(season.seasonName);
    setStartDateTime(season.startDateTime);
    setEndDateTime(season.endDateTime);
    setStatus(season.status);
    setNotes(season.notes || '');
  };

  const handleCreateNew = () => {
    const nextYear = new Date().getFullYear() + 1;
    const newId = `SEASON-${nextYear}-${nextYear + 1}`;
    const newSeason: HarvestSeason = {
      id: newId,
      seasonName: `Season ${nextYear}/${nextYear + 1}`,
      startDateTime: `${nextYear}-09-15T06:00`,
      endDateTime: `${nextYear + 1}-01-31T20:00`,
      status: 'Planned',
      notes: 'New planned harvest campaign.',
      totalOliveIntakeKg: 0,
      totalVirginOilKg: 0,
      totalTinsYield: 0,
      overallYieldPct: 0,
      totalPomaceKg: 0,
      retainedOilKg: 0,
      deliveredOilKg: 0,
      totalCashFeesUSD: 0,
      createdAt: new Date().toISOString()
    };
    setSeasons((prev) => [newSeason, ...prev]);
    handleSelectSeason(newSeason);
    triggerToast('New planned season initialized.');
  };

  const handleSaveSeason = () => {
    setSeasons((prev) =>
      prev.map((s) => {
        if (s.id === selectedSeasonId) {
          return {
            ...s,
            seasonName,
            startDateTime,
            endDateTime,
            status,
            notes
          };
        }
        // If this season is activated, deactivate others
        if (status === 'Active' && s.id !== selectedSeasonId && s.status === 'Active') {
          return { ...s, status: 'Closed' as SeasonStatus };
        }
        return s;
      })
    );
    triggerToast('Season configuration updated successfully.');
  };

  const handleEndSeasonConfirm = () => {
    setSeasons((prev) =>
      prev.map((s) => {
        if (s.id === selectedSeasonId) {
          return {
            ...s,
            status: 'Closed' as SeasonStatus,
            endDateTime: new Date().toISOString().slice(0, 16)
          };
        }
        return s;
      })
    );
    setStatus('Closed');
    setShowEndSeasonModal(false);
    triggerToast('Season officially closed. Intake & pressing lines locked into read-only mode.');
  };

  return (
    <div className="space-y-6">
      {/* Toast feedback */}
      {toastMessage && (
        <div className="bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-lg flex items-center justify-between animate-fadeIn">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Header Banner with Active Campaign Indicator */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <h1 className="text-lg font-bold text-slate-900">
                {t('pm_seasons', 'Season Lifecycle Management')}
              </h1>
              <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded">
                Annual Harvest Campaigns
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Configure explicit start &amp; end dates, manage intake operational freeze triggers, and generate certified season audit reports.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded shadow-2xs transition"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Create New Season</span>
            </button>
            <button
              onClick={() => setShowAuditReportModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded shadow-xs transition"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Consolidated Audit Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Operational Season Freeze Notice */}
      {!isSelectedActive && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-amber-900 flex items-start gap-3">
          <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">
              Operational Freeze Active for Selected Campaign ({selectedSeason.seasonName})
            </p>
            <p className="text-amber-800 leading-relaxed">
              Weighbridge intake scale logging and pressing line batch queues are locked into read-only mode for this campaign.
              All year-round modules (Tanks Matrix, Direct POS, Dispatch, and Client Ledgers) remain fully active.
            </p>
          </div>
        </div>
      )}

      {/* Main Grid: Season Selector on Left, Config & Metrics on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Campaigns List */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Harvest Campaigns
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">
                {seasons.length} Campaigns Recorded
              </span>
            </div>

            <div className="space-y-2">
              {seasons.map((season) => {
                const isCurrent = season.id === selectedSeasonId;
                const isActive = season.status === 'Active';
                return (
                  <div
                    key={season.id}
                    onClick={() => handleSelectSeason(season)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition ${
                      isCurrent
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-900">{season.seasonName}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : season.status === 'Planned'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {season.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 space-y-0.5">
                      <div>
                        Start: <span className="font-medium text-slate-700">{season.startDateTime.replace('T', ' ')}</span>
                      </div>
                      <div>
                        End: <span className="font-medium text-slate-700">{season.endDateTime.replace('T', ' ')}</span>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">
                        Intake: {(season.totalOliveIntakeKg / 1000).toFixed(1)} T
                      </span>
                      <span className="font-semibold text-emerald-700">
                        {season.totalTinsYield} Tins
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <div className="text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">Audit Rule:</span> Each scale ticket and batch automatically tags the active season ID.
            </div>
          </div>
        </div>

        {/* Middle & Right: Configuration Form & Audit KPI Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Season Configuration Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Campaign Parameters &amp; Boundaries
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {isSelectedActive ? (
                  <button
                    onClick={() => setShowEndSeasonModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold rounded transition cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-rose-600" />
                    <span>End Campaign (Freeze Intake)</span>
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Campaign Closed</span>
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Season Name &amp; Label
                </label>
                <input
                  type="text"
                  value={seasonName}
                  onChange={(e) => setSeasonName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-slate-800 font-medium focus:bg-white focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Campaign Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as SeasonStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-slate-800 font-medium focus:bg-white focus:outline-emerald-600"
                >
                  <option value="Active">Active (Intake &amp; Pressing Open)</option>
                  <option value="Planned">Planned (Pre-Season Setup)</option>
                  <option value="Closed">Closed / Frozen (Read-Only Intake)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Start Date &amp; Time
                </label>
                <input
                  type="datetime-local"
                  value={startDateTime}
                  onChange={(e) => setStartDateTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-slate-800 font-medium focus:bg-white focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  End Date &amp; Time
                </label>
                <input
                  type="datetime-local"
                  value={endDateTime}
                  onChange={(e) => setEndDateTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-slate-800 font-medium focus:bg-white focus:outline-emerald-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-600 font-medium mb-1">
                  Campaign Description &amp; Agronomic Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-slate-800 font-medium focus:bg-white focus:outline-emerald-600"
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => handleSelectSeason(selectedSeason)}
                className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded shadow-2xs transition"
              >
                Revert Changes
              </button>
              <button
                onClick={handleSaveSeason}
                className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded shadow-xs transition"
              >
                Save Campaign Parameters
              </button>
            </div>
          </div>

          {/* Consolidated Seasonal Audit Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Seasonal Audit Summary ({selectedSeason.seasonName})
                </h3>
              </div>
              <span className="text-[11px] text-slate-500">
                Period: {selectedSeason.startDateTime.slice(0, 10)} to {selectedSeason.endDateTime.slice(0, 10)}
              </span>
            </div>

            {/* 6 Metric KPI Panels */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded p-3">
                <span className="text-slate-500 font-medium block mb-0.5">Total Olive Intake</span>
                <span className="text-base font-bold text-slate-900">
                  {(selectedSeason.totalOliveIntakeKg / 1000).toFixed(1)} MT
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {selectedSeason.totalOliveIntakeKg.toLocaleString()} KG Gross
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded p-3">
                <span className="text-slate-500 font-medium block mb-0.5">Total Virgin Oil</span>
                <span className="text-base font-bold text-emerald-800">
                  {selectedSeason.totalTinsYield.toLocaleString()} Tins
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {selectedSeason.totalVirginOilKg.toLocaleString()} KG Extracted
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded p-3">
                <span className="text-slate-500 font-medium block mb-0.5">Overall Yield Ratio</span>
                <span className="text-base font-bold text-blue-700">
                  {selectedSeason.overallYieldPct}%
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Weighted Mill Yield Avg
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded p-3">
                <span className="text-slate-500 font-medium block mb-0.5">Total Pomace (Jift)</span>
                <span className="text-base font-bold text-amber-800">
                  {(selectedSeason.totalPomaceKg / 1000).toFixed(1)} Tons
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Heating / Biomass Stock
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded p-3">
                <span className="text-slate-500 font-medium block mb-0.5">In-Kind Oil Retained</span>
                <span className="text-base font-bold text-emerald-700">
                  {selectedSeason.retainedOilKg.toLocaleString()} KG
                </span>
                <span className="text-[10px] text-slate-400 block">
                  vs {selectedSeason.deliveredOilKg.toLocaleString()} KG Dispatched
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded p-3">
                <span className="text-slate-500 font-medium block mb-0.5">Cash Fees Collected</span>
                <span className="text-base font-bold text-slate-900">
                  ${selectedSeason.totalCashFeesUSD.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {(selectedSeason.totalCashFeesUSD * 89500).toLocaleString()} LBP
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowAuditReportModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>View &amp; Print Audit Certificate</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* End Season Confirmation Modal */}
      {showEndSeasonModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900">
                Confirm Season Closure &amp; Operational Freeze
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Ending the harvest season will lock the <span className="font-bold text-slate-900">Weighbridge Intake</span> scale logging and <span className="font-bold text-slate-900">Pressing Lines</span> into read-only mode to prevent new batch creation outside the official dates.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 space-y-1">
              <div>Campaign: <span className="font-bold">{selectedSeason.seasonName}</span></div>
              <div>Effective Freeze Date: <span className="font-semibold">{new Date().toLocaleString()}</span></div>
              <div className="text-emerald-700">✓ Tank Matrix, POS Sales &amp; Ledgers remain permanently accessible.</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowEndSeasonModal(false)}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleEndSeasonConfirm}
                className="px-4 py-1.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded shadow-xs"
              >
                Confirm End of Season
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Consolidated Audit Certificate Modal */}
      {showAuditReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-700" />
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Consolidated Seasonal Harvest &amp; Production Audit Report
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Vanguard ERP Official Mill Operations Statement
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAuditReportModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Certificate Details */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-3 font-mono">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Facility:</span>
                <span className="font-bold text-slate-900">Southern Olive Oil Products S.A.R.L - Choueifat Plant</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Campaign ID:</span>
                <span className="font-bold text-slate-900">{selectedSeason.id} ({selectedSeason.seasonName})</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Operational Window:</span>
                <span className="font-bold text-slate-900">{selectedSeason.startDateTime.replace('T', ' ')} &rarr; {selectedSeason.endDateTime.replace('T', ' ')}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-emerald-800">{selectedSeason.status.toUpperCase()}</span>
              </div>

              {/* Data Table */}
              <div className="pt-2 space-y-1.5 font-sans">
                <div className="flex justify-between text-slate-700">
                  <span>1. Net Olive Intake Weight:</span>
                  <span className="font-bold">{selectedSeason.totalOliveIntakeKg.toLocaleString()} KG ({(selectedSeason.totalOliveIntakeKg / 1000).toFixed(2)} Metric Tons)</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>2. Total Virgin Olive Oil Extracted:</span>
                  <span className="font-bold text-emerald-800">{selectedSeason.totalVirginOilKg.toLocaleString()} KG ({selectedSeason.totalTinsYield} Standard 16L Tins)</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>3. Overall Season Extraction Ratio:</span>
                  <span className="font-bold text-blue-700">{selectedSeason.overallYieldPct}% Yield Average</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>4. Olive Pomace (Jift Biomass):</span>
                  <span className="font-bold">{selectedSeason.totalPomaceKg.toLocaleString()} KG ({(selectedSeason.totalPomaceKg / 1000).toFixed(2)} Metric Tons)</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>5. In-Kind Retained Oil (Mill Ownership):</span>
                  <span className="font-bold text-emerald-700">{selectedSeason.retainedOilKg.toLocaleString()} KG ({(selectedSeason.retainedOilKg / 15).toFixed(1)} Tins)</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>6. Grower Released / Handed Over Oil:</span>
                  <span className="font-bold">{selectedSeason.deliveredOilKg.toLocaleString()} KG ({(selectedSeason.deliveredOilKg / 15).toFixed(1)} Tins)</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold pt-2 border-t border-slate-300">
                  <span>7. Total Milling Cash Fees Audited:</span>
                  <span className="text-emerald-800">${selectedSeason.totalCashFeesUSD.toLocaleString()} USD ({(selectedSeason.totalCashFeesUSD * 89500).toLocaleString()} LBP)</span>
                </div>
              </div>
            </div>

            {/* Signature Block */}
            <div className="grid grid-cols-2 gap-6 pt-4 text-xs text-slate-600 border-t border-slate-200">
              <div className="space-y-6">
                <div>Plant Operations Manager Signature:</div>
                <div className="border-b border-slate-400 w-48"></div>
              </div>
              <div className="space-y-6 text-right">
                <div>Certified Weighbridge Scale Inspector:</div>
                <div className="border-b border-slate-400 w-48 ml-auto"></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Certificate</span>
              </button>
              <button
                onClick={() => setShowAuditReportModal(false)}
                className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
