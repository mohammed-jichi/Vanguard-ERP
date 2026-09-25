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
                {t('annual_harvest_campaigns', 'Annual Harvest Campaigns')}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {t('season_management_desc', 'Configure explicit start & end dates, manage intake operational freeze triggers, and generate certified season audit reports.')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded shadow-2xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('create_new_season', 'Create New Season')}</span>
            </button>
            <button
              onClick={() => setShowAuditReportModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded shadow-xs transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('consolidated_audit_report', 'Consolidated Audit Report')}</span>
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
              {t('operational_freeze_active', 'Operational Freeze Active for Selected Campaign')} ({selectedSeason.seasonName})
            </p>
            <p className="text-amber-800 leading-relaxed">
              {t('operational_freeze_desc', 'Weighbridge intake scale logging and pressing line batch queues are locked into read-only mode for this campaign. All year-round modules (Tanks Matrix, Direct POS, Dispatch, and Client Ledgers) remain fully active.')}
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
                {t('harvest_campaigns', 'Harvest Campaigns')}
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">
                {seasons.length} {t('campaigns_recorded', 'Campaigns Recorded')}
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
                        {t(season.status.toLowerCase(), season.status)}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 space-y-0.5">
                      <div>
                        {t('start_date', 'Start')}: <span className="font-medium text-slate-700">{season.startDateTime.replace('T', ' ')}</span>
                      </div>
                      <div>
                        {t('end_date', 'End')}: <span className="font-medium text-slate-700">{season.endDateTime.replace('T', ' ')}</span>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">
                        {t('intake', 'Intake')}: {(season.totalOliveIntakeKg / 1000).toFixed(1)} {t('unit_mt', 'T')}
                      </span>
                      <span className="font-semibold text-emerald-700">
                        {season.totalTinsYield} {t('tins', 'Tins')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <div className="text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">{t('audit_rule_label', 'Audit Rule:')}</span> {t('audit_rule_desc', 'Each scale ticket and batch automatically tags the active season ID.')}
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
                  {t('campaign_parameters_boundaries', 'Campaign Parameters & Boundaries')}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {isSelectedActive ? (
                  <button
                    onClick={() => setShowEndSeasonModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold rounded transition cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-rose-600" />
                    <span>{t('end_campaign_freeze', 'End Campaign (Freeze Intake)')}</span>
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                    <Lock className="w-3.5 h-3.5" />
                    <span>{t('campaign_closed', 'Campaign Closed')}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  {t('season_name_label', 'Season Name & Label')}
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
                  {t('campaign_status', 'Campaign Status')}
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as SeasonStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-slate-800 font-medium focus:bg-white focus:outline-emerald-600"
                >
                  <option value="Active">{t('status_active_desc', 'Active (Intake & Pressing Open)')}</option>
                  <option value="Planned">{t('status_planned_desc', 'Planned (Pre-Season Setup)')}</option>
                  <option value="Closed">{t('status_closed_desc', 'Closed / Frozen (Read-Only Intake)')}</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  {t('start_date_time', 'Start Date & Time')}
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
                  {t('end_date_time', 'End Date & Time')}
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
                  {t('campaign_notes_label', 'Campaign Description & Agronomic Notes')}
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
                {t('revert_changes', 'Revert Changes')}
              </button>
              <button
                onClick={handleSaveSeason}
                className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded shadow-xs transition"
              >
                {t('save_campaign_parameters', 'Save Campaign Parameters')}
              </button>
            </div>
          </div>

          {/* Consolidated Seasonal Audit Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  {t('seasonal_audit_summary', 'Seasonal Audit Summary')} ({selectedSeason.seasonName})
                </h3>
              </div>
              <span className="text-[11px] text-slate-500">
                {t('period', 'Period')}: {selectedSeason.startDateTime.slice(0, 10)} {t('to', 'to')} {selectedSeason.endDateTime.slice(0, 10)}
              </span>
            </div>

            {/* 6 Metric KPI Panels */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded p-3">
                <span className="text-slate-500 font-medium block mb-0.5">{t('total_olive_intake', 'Total Olive Intake')}</span>
                <span className="text-base font-bold text-slate-900">
                  {(selectedSeason.totalOliveIntakeKg / 1000).toFixed(1)} {t('unit_mt', 'MT')}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {selectedSeason.totalOliveIntakeKg.toLocaleString()} {t('unit_kg', 'KG')} {t('gross', 'Gross')}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded p-3">
                <span className="text-slate-500 font-medium block mb-0.5">{t('total_virgin_oil', 'Total Virgin Oil')}</span>
                <span className="text-base font-bold text-emerald-800">
                  {selectedSeason.totalTinsYield.toLocaleString()} {t('tins', 'Tins')}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {selectedSeason.totalVirginOilKg.toLocaleString()} {t('unit_kg', 'KG')} {t('extracted', 'Extracted')}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded p-3">
                <span className="text-slate-500 font-medium block mb-0.5">{t('overall_yield_ratio', 'Overall Yield Ratio')}</span>
                <span className="text-base font-bold text-blue-700">
                  {selectedSeason.overallYieldPct}%
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {t('weighted_yield_avg', 'Weighted Mill Yield Avg')}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded p-3">
                <span className="text-slate-500 font-medium block mb-0.5">{t('total_pomace_jift', 'Total Pomace (Jift)')}</span>
                <span className="text-base font-bold text-amber-800">
                  {(selectedSeason.totalPomaceKg / 1000).toFixed(1)} {t('unit_mt', 'Tons')}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {t('heating_biomass_stock', 'Heating / Biomass Stock')}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded p-3">
                <span className="text-slate-500 font-medium block mb-0.5">{t('in_kind_retained_oil', 'In-Kind Oil Retained')}</span>
                <span className="text-base font-bold text-emerald-700">
                  {selectedSeason.retainedOilKg.toLocaleString()} {t('unit_kg', 'KG')}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {t('vs', 'vs')} {selectedSeason.deliveredOilKg.toLocaleString()} {t('unit_kg', 'KG')} {t('dispatched', 'Dispatched')}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded p-3">
                <span className="text-slate-500 font-medium block mb-0.5">{t('cash_fees_collected', 'Cash Fees Collected')}</span>
                <span className="text-base font-bold text-slate-900">
                  ${selectedSeason.totalCashFeesUSD.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {(selectedSeason.totalCashFeesUSD * 89500).toLocaleString()} {t('currency_lbp', 'LBP')}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowAuditReportModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>{t('view_print_audit_cert', 'View & Print Audit Certificate')}</span>
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
                {t('confirm_season_closure', 'Confirm Season Closure & Operational Freeze')}
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {t('confirm_season_closure_desc', 'Ending the harvest season will lock the Weighbridge Intake scale logging and Pressing Lines into read-only mode to prevent new batch creation outside the official dates.')}
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 space-y-1">
              <div>{t('campaign', 'Campaign')}: <span className="font-bold">{selectedSeason.seasonName}</span></div>
              <div>{t('effective_freeze_date', 'Effective Freeze Date')}: <span className="font-semibold">{new Date().toLocaleString()}</span></div>
              <div className="text-emerald-700">✓ {t('freeze_safe_modules', 'Tank Matrix, POS Sales & Ledgers remain permanently accessible.')}</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowEndSeasonModal(false)}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded"
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                onClick={handleEndSeasonConfirm}
                className="px-4 py-1.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded shadow-xs"
              >
                {t('confirm_end_season', 'Confirm End of Season')}
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
                    {t('audit_report_modal_title', 'Consolidated Seasonal Harvest & Production Audit Report')}
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    {t('audit_report_modal_subtitle', 'Vanguard ERP Official Mill Operations Statement')}
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
                <span className="text-slate-500">{t('facility_label', 'Facility')}:</span>
                <span className="font-bold text-slate-900">{t('facility_name_val', 'Southern Olive Oil Products S.A.R.L - Choueifat Plant')}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">{t('campaign_id_label', 'Campaign ID')}:</span>
                <span className="font-bold text-slate-900">{selectedSeason.id} ({selectedSeason.seasonName})</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">{t('operational_window', 'Operational Window')}:</span>
                <span className="font-bold text-slate-900">{selectedSeason.startDateTime.replace('T', ' ')} &rarr; {selectedSeason.endDateTime.replace('T', ' ')}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">{t('status', 'Status')}:</span>
                <span className="font-bold text-emerald-800">{t(selectedSeason.status.toLowerCase(), selectedSeason.status).toUpperCase()}</span>
              </div>

              {/* Data Table */}
              <div className="pt-2 space-y-1.5 font-sans">
                <div className="flex justify-between text-slate-700">
                  <span>1. {t('cert_net_olive_intake', 'Net Olive Intake Weight')}:</span>
                  <span className="font-bold">{selectedSeason.totalOliveIntakeKg.toLocaleString()} {t('unit_kg', 'KG')} ({(selectedSeason.totalOliveIntakeKg / 1000).toFixed(2)} {t('metric_tons', 'Metric Tons')})</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>2. {t('cert_total_virgin_oil', 'Total Virgin Olive Oil Extracted')}:</span>
                  <span className="font-bold text-emerald-800">{selectedSeason.totalVirginOilKg.toLocaleString()} {t('unit_kg', 'KG')} ({selectedSeason.totalTinsYield} {t('cert_standard_tins', 'Standard 16L Tins')})</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>3. {t('cert_extraction_ratio', 'Overall Season Extraction Ratio')}:</span>
                  <span className="font-bold text-blue-700">{selectedSeason.overallYieldPct}% {t('cert_yield_average', 'Yield Average')}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>4. {t('cert_pomace_biomass', 'Olive Pomace (Jift Biomass)')}:</span>
                  <span className="font-bold">{selectedSeason.totalPomaceKg.toLocaleString()} {t('unit_kg', 'KG')} ({(selectedSeason.totalPomaceKg / 1000).toFixed(2)} {t('metric_tons', 'Metric Tons')})</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>5. {t('cert_in_kind_retained', 'In-Kind Retained Oil (Mill Ownership)')}:</span>
                  <span className="font-bold text-emerald-700">{selectedSeason.retainedOilKg.toLocaleString()} {t('unit_kg', 'KG')} ({(selectedSeason.retainedOilKg / 15).toFixed(1)} {t('tins', 'Tins')})</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>6. {t('cert_grower_released', 'Grower Released / Handed Over Oil')}:</span>
                  <span className="font-bold">{selectedSeason.deliveredOilKg.toLocaleString()} {t('unit_kg', 'KG')} ({(selectedSeason.deliveredOilKg / 15).toFixed(1)} {t('tins', 'Tins')})</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold pt-2 border-t border-slate-300">
                  <span>7. {t('cert_cash_fees_audited', 'Total Milling Cash Fees Audited')}:</span>
                  <span className="text-emerald-800">${selectedSeason.totalCashFeesUSD.toLocaleString()} USD ({(selectedSeason.totalCashFeesUSD * 89500).toLocaleString()} {t('currency_lbp', 'LBP')})</span>
                </div>
              </div>
            </div>

            {/* Signature Block */}
            <div className="grid grid-cols-2 gap-6 pt-4 text-xs text-slate-600 border-t border-slate-200">
              <div className="space-y-6">
                <div>{t('manager_signature_label', 'Plant Operations Manager Signature:')}</div>
                <div className="border-b border-slate-400 w-48"></div>
              </div>
              <div className="space-y-6 text-right">
                <div>{t('inspector_signature_label', 'Certified Weighbridge Scale Inspector:')}</div>
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
                <span>{t('print_official_certificate', 'Print Official Certificate')}</span>
              </button>
              <button
                onClick={() => setShowAuditReportModal(false)}
                className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded"
              >
                {t('close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
