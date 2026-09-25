'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Settings,
  Save,
  RotateCcw,
  CheckCircle2,
  Building,
  Activity,
  DollarSign,
  Droplets,
  Landmark,
  Thermometer,
  Layers,
  Plus,
  Trash2,
  ShieldCheck,
  Calendar,
  AlertCircle
} from 'lucide-react';
import {
  INITIAL_MILL_SETTINGS,
  INITIAL_DYNAMIC_LINES,
  DEFAULT_LICENSE_QUOTA,
  INITIAL_SEASONS
} from '@/lib/pressingMillData';
import {
  MillSettingsConfig,
  DynamicPressingLine,
  LineOperationalStatus,
  PressingLinesLicenseQuota
} from '@/types/pressingMill';
import { useLanguage } from '@/lib/LanguageContext';

export default function MillSettingsView() {
  const { t } = useLanguage();
  const [config, setConfig] = useState<MillSettingsConfig>(INITIAL_MILL_SETTINGS);
  const [lines, setLines] = useState<DynamicPressingLine[]>(INITIAL_DYNAMIC_LINES);
  const [licenseQuota] = useState<PressingLinesLicenseQuota>(DEFAULT_LICENSE_QUOTA);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleUpdateLine = (id: string, updates: Partial<DynamicPressingLine>) => {
    setLines((prev) =>
      prev.map((line) => (line.id === id ? { ...line, ...updates } : line))
    );
  };

  const handleAddLine = () => {
    if (lines.length >= licenseQuota.maxAllowedLines) {
      showToast(`Admin License Quota Limit Reached (${licenseQuota.maxAllowedLines} max lines allowed).`);
      return;
    }
    const nextIndex = lines.length + 1;
    const newLineId = `LINE-0${nextIndex}`;
    const newLine: DynamicPressingLine = {
      id: newLineId,
      name: `Line 0${nextIndex} - Cold Extraction Unit`,
      model: 'Continuous 3-Phase Decanter Extractor',
      hourlyThroughputKg: 4000,
      malaxerBatchLimitKg: 2000,
      status: 'Active',
      batchProgressPct: 0,
      malaxingTempC: 25.0,
      decanterRpm: 3200,
      separatorRpm: 6500,
      flowRateLitersPerHour: 650,
      totalCrushedTodayKg: 0
    };
    setLines([...lines, newLine]);
    showToast(`${t('new_line_provisioned', 'New extraction line')} ${newLineId} ${t('within_license_quota', 'provisioned within license quota.')}`);
  };

  const handleDeleteLine = (id: string) => {
    if (lines.length <= 1) {
      showToast(t('facility_must_maintain_line', 'Facility must maintain at least one operational pressing line.'));
      return;
    }
    setLines((prev) => prev.filter((l) => l.id !== id));
    showToast(`${t('extraction_line', 'Extraction line')} ${id} ${t('removed', 'removed.')}`);
  };

  const handleSave = () => {
    showToast(t('mill_settings_saved_success', 'Mill settings, line configurations, and operational quotas saved successfully.'));
  };

  const isAtQuota = lines.length >= licenseQuota.maxAllowedLines;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-700" />
            <h1 className="text-base font-bold text-slate-900">
              {t('pm_setup', 'Mill Settings & Line Configuration')}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('pm_setup_sub', 'Manage dynamic pressing lines, admin license quotas, default milling retention rates, and facility standards.')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setConfig(INITIAL_MILL_SETTINGS);
              setLines(INITIAL_DYNAMIC_LINES);
              showToast(t('config_reverted_defaults', 'Configuration reverted to initial system defaults.'));
            }}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded shadow-2xs transition cursor-pointer"
          >
            {t('clear_revert', 'Clear / Revert')}
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded shadow-xs transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{t('save_apply_changes', 'Save & Apply Changes')}</span>
          </button>
        </div>
      </div>

      {/* ADMIN LICENSE QUOTA & DYNAMIC LINES SECTION */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              {t('dynamic_lines_license_title', 'Dynamic Pressing Lines & License Quota Architecture')}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs px-2.5 py-1 rounded font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {t('license_quota_label', 'License Quota:')} <strong className="font-bold">{lines.length} {t('of', 'of')} {licenseQuota.maxAllowedLines} {t('lines_provisioned', 'Lines Provisioned')}</strong>
              </span>
            </div>

            <button
              onClick={handleAddLine}
              disabled={isAtQuota}
              className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded transition shadow-2xs ${
                isAtQuota
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('add_pressing_line', 'Add Pressing Line')}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Lines List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lines.map((line, idx) => (
            <div
              key={line.id}
              className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3 text-xs"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-slate-900">{line.id}</span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={line.status}
                    onChange={(e) =>
                      handleUpdateLine(line.id, {
                        status: e.target.value as LineOperationalStatus
                      })
                    }
                    className={`text-[11px] font-bold px-2 py-0.5 rounded border focus:outline-none cursor-pointer ${
                      line.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : line.status === 'Cleaning'
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : line.status === 'Maintenance'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-slate-200 text-slate-700 border-slate-300'
                    }`}
                  >
                    <option value="Active">{t('Active', 'Active')}</option>
                    <option value="Cleaning">{t('Cleaning', 'Cleaning')}</option>
                    <option value="Maintenance">{t('Maintenance', 'Maintenance')}</option>
                    <option value="Inactive">{t('Inactive', 'Inactive')}</option>
                  </select>

                  {lines.length > 1 && (
                    <button
                      onClick={() => handleDeleteLine(line.id)}
                      title={t('remove_line', 'Remove Line')}
                      className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Line Config Fields */}
              <div className="space-y-2">
                <div>
                  <label className="block text-slate-600 font-medium mb-0.5">{t('custom_line_display_name', 'Custom Line Display Name')}</label>
                  <input
                    type="text"
                    value={line.name}
                    onChange={(e) => handleUpdateLine(line.id, { name: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-0.5">{t('machine_brand_model', 'Machine Brand & Model')}</label>
                  <input
                    type="text"
                    value={line.model}
                    onChange={(e) => handleUpdateLine(line.id, { model: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-slate-600 font-medium mb-0.5">{t('throughput_kg_hour', 'Throughput (KG / Hour)')}</label>
                    <input
                      type="number"
                      step="100"
                      value={line.hourlyThroughputKg}
                      onChange={(e) =>
                        handleUpdateLine(line.id, {
                          hourlyThroughputKg: Number(e.target.value) || 0
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-bold text-slate-800"
                    />
                    <span className="text-[10px] text-slate-400">
                      {(line.hourlyThroughputKg / 1000).toFixed(1)} {t('tons_per_hr', 'Tons/hr')}
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-0.5">{t('malaxer_limit_kg_batch', 'Malaxer Limit (KG Batch)')}</label>
                    <input
                      type="number"
                      step="100"
                      value={line.malaxerBatchLimitKg}
                      onChange={(e) =>
                        handleUpdateLine(line.id, {
                          malaxerBatchLimitKg: Number(e.target.value) || 0
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-bold text-slate-800"
                    />
                    <span className="text-[10px] text-slate-400">{t('batch_hopper_max', 'Batch hopper max')}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FACILITY & ACTIVE CAMPAIGN CONFIGURATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Facility Info & Active Season */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Building className="w-4 h-4 text-sky-600" />
            <span>{t('facility_info_active_campaign', 'Facility Info & Active Campaign')}</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t('facility_official_name', 'Facility Official Name')}</label>
              <input
                type="text"
                value={config.facilityName}
                onChange={(e) => setConfig({ ...config, facilityName: e.target.value })}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t('facility_physical_location', 'Facility Physical Location')}</label>
              <input
                type="text"
                value={config.millLocation}
                onChange={(e) => setConfig({ ...config, millLocation: e.target.value })}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none text-slate-700"
              />
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="block font-semibold text-slate-700 mb-1">{t('assigned_active_season', 'Assigned Active Season')}</label>
              <div className="flex items-center gap-2">
                <select
                  value={config.activeSeasonId}
                  onChange={(e) => setConfig({ ...config, activeSeasonId: e.target.value })}
                  className="flex-1 border border-slate-300 rounded px-2.5 py-1.5 font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  {INITIAL_SEASONS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.seasonName} ({t(s.status, s.status)})
                    </option>
                  ))}
                </select>
                <Link
                  href="/pressing-mill/seasons"
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-[11px] whitespace-nowrap transition cursor-pointer"
                >
                  {t('manage_seasons', 'Manage Seasons')}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Milling Fees & Financial Rates */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>{t('standard_milling_fees_retentions', 'Standard Milling Fees & Retentions')}</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('standard_retention_rate_pct', 'Standard Retention Rate (%)')}</label>
                <input
                  type="number"
                  value={config.standardRetentionPct}
                  onChange={(e) => setConfig({ ...config, standardRetentionPct: Number(e.target.value) || 0 })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none font-bold text-amber-700"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">{t('default_in_kind_oil_cut', 'Default in-kind oil cut (Al-Raddah retention)')}</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('default_cash_fee_per_kg', 'Default Cash Fee / KG ($)')}</label>
                <input
                  type="number"
                  step="0.01"
                  value={config.defaultCashFeePerKgUSD}
                  onChange={(e) => setConfig({ ...config, defaultCashFeePerKgUSD: Number(e.target.value) || 0 })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none font-bold text-emerald-700"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">{t('cash_fee_per_net_kg', 'Cash fee per net kg olive')}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('standard_tin_weight_kg', 'Standard Tin Weight (KG)')}</label>
                <input
                  type="number"
                  step="0.1"
                  value={config.standardTinKg}
                  onChange={(e) => setConfig({ ...config, standardTinKg: Number(e.target.value) || 0 })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none font-semibold text-slate-800"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">{t('standard_tin_weight_desc', '15.0 KG = standard 16L tin')}</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('exchange_rate_usd_lbp', 'Exchange Rate (USD ➔ LBP)')}</label>
                <input
                  type="number"
                  value={config.usdToLbpRate}
                  onChange={(e) => setConfig({ ...config, usdToLbpRate: Number(e.target.value) || 0 })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none font-mono font-bold text-slate-800"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">{t('current_lebanese_rate', 'Current Lebanese market rate')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
