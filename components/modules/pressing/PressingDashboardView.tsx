'use client';

import React from 'react';
import Link from 'next/link';
import {
  Scale,
  Activity,
  Droplets,
  Truck,
  TrendingUp,
  Landmark,
  Layers,
  Thermometer,
  Gauge,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Plus,
  Calendar,
  ShieldCheck,
  ShoppingCart,
  DollarSign
} from 'lucide-react';
import {
  INITIAL_DYNAMIC_LINES,
  INITIAL_SCALE_TICKETS,
  INITIAL_TANKS,
  INITIAL_SEASONS
} from '@/lib/pressingMillData';
import { useLanguage } from '@/lib/LanguageContext';

export default function PressingDashboardView() {
  const { t } = useLanguage();
  const activeSeason = INITIAL_SEASONS.find((s) => s.status === 'Active') || INITIAL_SEASONS[0];

  const totalTanksCap = INITIAL_TANKS.reduce((acc, t) => acc + t.capacityLiters, 0);
  const totalTanksCurrent = INITIAL_TANKS.reduce((acc, t) => acc + t.currentLevelLiters, 0);
  const tanksFillPct = Math.round((totalTanksCurrent / totalTanksCap) * 100);

  const totalCrushedToday = INITIAL_DYNAMIC_LINES.reduce((acc, l) => acc + l.totalCrushedTodayKg, 0);
  const totalOilExtractedEst = Math.round(totalCrushedToday * 0.205);
  const totalTinsToday = (totalOilExtractedEst / 15.0).toFixed(1);

  return (
    <div className="space-y-6">
      {/* 0. ACTIVE HARVEST SEASON BANNER */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">{activeSeason.seasonName}</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                {activeSeason.status}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Campaign Window: {activeSeason.startDateTime.slice(0, 10)} &rarr; {activeSeason.endDateTime.slice(0, 10)} • Operational intake scale active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/pressing-mill/seasons"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold rounded transition"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('season_lifecycle', 'Season Lifecycle')}</span>
          </Link>
          <Link
            href="/pressing-mill/intake"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('new_weighbridge_intake', 'New Weighbridge Intake')}</span>
          </Link>
        </div>
      </div>

      {/* 1. TOP METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>{t('daily_olive_intake', 'Daily Olive Intake')}</span>
            <Scale className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900">{totalCrushedToday.toLocaleString()} KG</span>
            <span className="text-[11px] text-emerald-700 font-medium block mt-0.5">
              {(totalCrushedToday / 1000).toFixed(2)} Metric Tons Received
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>{t('crushing_throughput', 'Crushing Throughput')}</span>
            <Activity className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-sky-900">
              {(INITIAL_DYNAMIC_LINES.reduce((a, b) => a + b.hourlyThroughputKg, 0) / 1000).toFixed(1)} T/hr
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Across {INITIAL_DYNAMIC_LINES.length} provisioned continuous lines
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>{t('stainless_tanks_level', 'Stainless Tanks Level')} (1-50)</span>
            <Landmark className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900">{tanksFillPct}%</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              {totalTanksCurrent.toLocaleString()} / {totalTanksCap.toLocaleString()} L in farm
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>{t('dispatch_release_summary', 'Dispatch & Release Summary')}</span>
            <Truck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-amber-800">104 Tins</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              1,560 KG oil released to growers
            </span>
          </div>
        </div>
      </div>

      {/* 2. ACTIVE PRESSING LINES LIVE TELEMETRY */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">{t('dynamic_lines_telemetry', 'Dynamic Continuous Pressing Lines Telemetry')}</h2>
          </div>
          <Link
            href="/pressing-mill/batches"
            className="text-xs text-sky-700 hover:text-sky-900 font-semibold flex items-center gap-1"
          >
            <span>{t('manage_batches_queues', 'Manage Batches & Queues')}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {INITIAL_DYNAMIC_LINES.map((line) => (
            <div key={line.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{line.name}</h3>
                  <span className="text-[11px] text-slate-500">{line.model} • {(line.hourlyThroughputKg / 1000).toFixed(1)} T/hr</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                  {line.status}
                </span>
              </div>

              {/* Progress */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">{line.currentFarmerName}</span>
                  <span className="font-bold text-slate-900">{line.batchProgressPct}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${line.batchProgressPct}%` }} />
                </div>
              </div>

              {/* Telemetry row */}
              <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Malaxer Temp</span>
                  <span className="font-bold text-slate-800 flex items-center justify-center gap-1 font-mono">
                    <Thermometer className="w-3 h-3 text-rose-500" /> {line.malaxingTempC}°C
                  </span>
                  <span className="text-[9px] text-emerald-600 font-semibold">Cold Press OK</span>
                </div>

                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Decanter RPM</span>
                  <span className="font-bold text-slate-800 flex items-center justify-center gap-1 font-mono">
                    <Gauge className="w-3 h-3 text-blue-500" /> {line.decanterRpm}
                  </span>
                  <span className="text-[9px] text-slate-500">Centrifuge Optimal</span>
                </div>

                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Oil Flow Rate</span>
                  <span className="font-bold text-emerald-700 flex items-center justify-center gap-1 font-mono">
                    <Droplets className="w-3 h-3 text-emerald-600" /> {line.flowRateLitersPerHour} L/h
                  </span>
                  <span className="text-[9px] text-slate-500">Into Silo Tank</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. RECENT WEIGHBRIDGE INTAKE LOG */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900">{t('recent_weighbridge_tickets', 'Recent Weighbridge Scale Tickets')}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/pressing-mill/intake"
              className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('new_intake_scale', 'New Intake Scale')}</span>
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                <th className="py-2.5 px-3">{t('ticket_num', 'Ticket #')}</th>
                <th className="py-2.5 px-3">{t('campaign_season', 'Campaign Season')}</th>
                <th className="py-2.5 px-3">{t('assigned_line', 'Assigned Line')}</th>
                <th className="py-2.5 px-3">{t('farmer_grower', 'Farmer / Grower')}</th>
                <th className="py-2.5 px-3">{t('variety', 'Variety')}</th>
                <th className="py-2.5 px-3 text-right">{t('net_olive_weight', 'Net Olive Weight')}</th>
                <th className="py-2.5 px-3">{t('target_silo', 'Target Silo')}</th>
                <th className="py-2.5 px-3">{t('settlement', 'Settlement')}</th>
                <th className="py-2.5 px-3">{t('status', 'Status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {INITIAL_SCALE_TICKETS.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{t.ticketNumber}</td>
                  <td className="py-2.5 px-3 text-[11px] text-slate-500">{t.seasonName || 'Season 2026/2027'}</td>
                  <td className="py-2.5 px-3 text-slate-700 font-medium">{t.lineName || 'Line 01'}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{t.farmerName}</td>
                  <td className="py-2.5 px-3 text-slate-600">{t.variety}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-800 text-right">
                    {t.netWeight.toLocaleString()} KG
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-mono">{t.targetTankId}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.settlementMethod === 'In_Kind'
                          ? 'bg-amber-100 text-amber-800'
                          : t.settlementMethod === 'Cash'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {t.settlementMethod}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
