'use client';

import React, { useState } from 'react';
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
  Thermometer
} from 'lucide-react';
import { INITIAL_MILL_SETTINGS } from '@/lib/pressingMillData';
import { MillSettingsConfig } from '@/types/pressingMill';

export default function MillSettingsView() {
  const [config, setConfig] = useState<MillSettingsConfig>(INITIAL_MILL_SETTINGS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSave = () => {
    showToast('Mill configuration and operational settings updated successfully.');
  };

  return (
    <div className="space-y-6">
      {/* GLOBAL TOAST */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-700" />
            <h2 className="text-base font-bold text-slate-900">Mill Operational Parameters &amp; Settings</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure line throughput ratings, default retention rates, weighbridge cash fees, and silo farm settings
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded shadow-xs transition"
        >
          <Save className="w-4 h-4" />
          <span>Save Mill Settings</span>
        </button>
      </div>

      {/* CONFIGURATION SECTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SECTION 1: FACILITY & PRODUCTION LINES */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Building className="w-4 h-4 text-sky-600" />
            <span>Facility Identification &amp; Pressing Lines</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Facility Name</label>
              <input
                type="text"
                value={config.facilityName}
                onChange={(e) => setConfig({ ...config, facilityName: e.target.value })}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500 font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Plant Geographic Location</label>
              <input
                type="text"
                value={config.millLocation}
                onChange={(e) => setConfig({ ...config, millLocation: e.target.value })}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Line 1 Capacity (T/hr)</label>
                <input
                  type="number"
                  step="0.1"
                  value={config.line1ThroughputTonsPerHour}
                  onChange={(e) => setConfig({ ...config, line1ThroughputTonsPerHour: Number(e.target.value) || 0 })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Line 2 Capacity (T/hr)</label>
                <input
                  type="number"
                  step="0.1"
                  value={config.line2ThroughputTonsPerHour}
                  onChange={(e) => setConfig({ ...config, line2ThroughputTonsPerHour: Number(e.target.value) || 0 })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500 font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: SETTLEMENTS & FINANCIAL RATES */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Milling Fees &amp; Conversion Standards</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Standard Retention Rate (%)</label>
                <input
                  type="number"
                  value={config.standardRetentionPct}
                  onChange={(e) => setConfig({ ...config, standardRetentionPct: Number(e.target.value) || 0 })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500 font-bold text-amber-700"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Default in-kind oil cut</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Default Cash Fee / KG ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={config.defaultCashFeePerKgUSD}
                  onChange={(e) => setConfig({ ...config, defaultCashFeePerKgUSD: Number(e.target.value) || 0 })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500 font-bold text-emerald-700"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Default cash rate / kg olive</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Standard Tin Weight (KG)</label>
                <input
                  type="number"
                  step="0.1"
                  value={config.standardTinKg}
                  onChange={(e) => setConfig({ ...config, standardTinKg: Number(e.target.value) || 0 })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500 font-semibold"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">15.0 KG = 16L standard tin</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Exchange Rate (USD ➔ LBP)</label>
                <input
                  type="number"
                  value={config.usdToLbpRate}
                  onChange={(e) => setConfig({ ...config, usdToLbpRate: Number(e.target.value) || 0 })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500 font-mono font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Current market rate</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: QUALITY & THERMAL REGULATION */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-rose-600" />
            <span>Cold Pressing &amp; Quality Thresholds</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Cold Press Maximum Temperature (°C)
              </label>
              <input
                type="number"
                step="0.5"
                value={config.coldPressMaxTempC}
                onChange={(e) => setConfig({ ...config, coldPressMaxTempC: Number(e.target.value) || 0 })}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500 font-bold text-rose-700"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                European standard limit for Extra Virgin Cold Extraction is 27.0 °C.
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 4: STORAGE TANK FARM SPECS */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Landmark className="w-4 h-4 text-indigo-600" />
            <span>Stainless Steel Silo Specifications</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Active Stainless Tanks Farm Count
              </label>
              <input
                type="number"
                value={config.totalStainlessTanksCount}
                onChange={(e) => setConfig({ ...config, totalStainlessTanksCount: Number(e.target.value) || 0 })}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500 font-bold"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Total monitored silos in Tanks Matrix (TK-01 through TK-50).
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
