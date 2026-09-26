'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTenant } from '@/lib/TenantContext';
import { supabase } from '@/lib/supabaseClient';
import {
  Layers,
  Thermometer,
  Gauge,
  Droplets,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Filter,
  CheckSquare,
  Lock,
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import {
  INITIAL_DYNAMIC_LINES,
  INITIAL_SCALE_TICKETS,
  INITIAL_SEASONS
} from '@/lib/pressingMillData';
import { DynamicPressingLine, ScaleTicket, LineOperationalStatus } from '@/types/pressingMill';
import { useLanguage } from '@/lib/LanguageContext';

export default function PressingBatchesView() {
  const { currentTenant } = useTenant();
  const { t } = useLanguage();
  const [lines, setLines] = useState<DynamicPressingLine[]>(INITIAL_DYNAMIC_LINES);
  const [tickets, setTickets] = useState<ScaleTicket[]>(INITIAL_SCALE_TICKETS);
  const [selectedSeason] = useState(INITIAL_SEASONS[0]); // Active season
  const isSeasonActive = selectedSeason.status === 'Active';
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadPersistedLines() {
      try {
        const targetId = (currentTenant?.id && currentTenant.id !== '1300' && !currentTenant.id.startsWith('comp-'))
          ? currentTenant.id
          : '00000000-0000-0000-0000-000000000001';

        const { data } = await supabase
          .from('tenants')
          .select('feature_flags')
          .eq('id', targetId)
          .maybeSingle();

        if (data?.feature_flags?.pressing_lines && Array.isArray(data.feature_flags.pressing_lines) && data.feature_flags.pressing_lines.length > 0) {
          setLines(data.feature_flags.pressing_lines);
        }
        if (data?.feature_flags?.weighbridge_tickets && Array.isArray(data.feature_flags.weighbridge_tickets) && data.feature_flags.weighbridge_tickets.length > 0) {
          setTickets(data.feature_flags.weighbridge_tickets);
        }
      } catch (err) {
        console.warn('Notice loading pressing lines from database:', err);
      }
    }
    loadPersistedLines();
  }, [currentTenant?.id]);

  const persistLinesToDatabase = async (newLines: DynamicPressingLine[]): Promise<{ success: boolean; error?: string }> => {
    try {
      const targetId = (currentTenant?.id && currentTenant.id !== '1300' && !currentTenant.id.startsWith('comp-'))
        ? currentTenant.id
        : '00000000-0000-0000-0000-000000000001';

      const { data: tenantData } = await supabase
        .from('tenants')
        .select('feature_flags')
        .eq('id', targetId)
        .maybeSingle();

      const existingFlags = tenantData?.feature_flags || currentTenant?.feature_flags || {};
      const { error: dbError } = await supabase
        .from('tenants')
        .update({
          feature_flags: {
            ...existingFlags,
            pressing_lines: newLines
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', targetId);

      if (dbError) {
        return { success: false, error: dbError.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Database connection error' };
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleToggleLineStatus = async (lineId: string) => {
    if (!isSeasonActive) {
      showToast(t('cannot_modify_line_campaign_closed', 'Cannot modify line operations: Campaign is currently frozen/closed.'));
      return;
    }
    const updatedLines = lines.map((l) => {
      if (l.id === lineId) {
        const nextStatus: LineOperationalStatus =
          l.status === 'Active' ? 'Cleaning' : 'Active';
        return { ...l, status: nextStatus };
      }
      return l;
    });

    const res = await persistLinesToDatabase(updatedLines);
    if (!res.success) {
      showToast(`Database write error: ${res.error}`);
      return;
    }

    setLines(updatedLines);
    showToast(`${t('extraction_line', 'Extraction line')} ${lineId} ${t('status_updated', 'status updated and persisted.')}`);
  };

  const handleAdvanceBatch = async (lineId: string) => {
    if (!isSeasonActive) {
      showToast(t('cannot_advance_batch_campaign_closed', 'Cannot advance batch: Campaign is currently frozen/closed.'));
      return;
    }
    const updatedLines = lines.map((l) => {
      if (l.id === lineId) {
        const nextProgress = Math.min(100, l.batchProgressPct + 15);
        return { ...l, batchProgressPct: nextProgress };
      }
      return l;
    });

    const res = await persistLinesToDatabase(updatedLines);
    if (!res.success) {
      showToast(`Database write error: ${res.error}`);
      return;
    }

    setLines(updatedLines);
    showToast(`${t('extraction_progress_updated', 'Extraction progress updated and persisted for')} ${lineId}.`);
  };

  return (
    <div className="space-y-6">
      {/* GLOBAL TOAST */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* OPERATIONAL FREEZE NOTICE IF SEASON CLOSED */}
      {!isSeasonActive && (
        <div className="bg-amber-50 border border-amber-300 text-amber-950 rounded-lg p-4 text-xs flex items-start justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-slate-900">
                {t('operational_freeze_active', 'Operational Season Freeze Active')} ({selectedSeason.seasonName}):
              </span>
              <p className="text-amber-900 leading-relaxed">
                {t('batches_freeze_msg', 'Pressing line batch queues and decanter starters are locked into read-only mode to prevent out-of-season batch creation.')}
              </p>
            </div>
          </div>
          <Link
            href="/pressing-mill/seasons"
            className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 hover:text-amber-950 underline shrink-0"
          >
            <span>{t('manage_seasons', 'Manage Seasons')}</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-slate-700" />
            <h1 className="text-base font-bold text-slate-900">
              {t('pm_batches', 'Pressing Lines & Extraction Batches')}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('pm_batches_sub', 'Real-time batch progress across provisioned continuous lines, malaxing temperature regulation (< 27°C), and separation centrifugation.')}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{lines.filter((l) => l.status === 'Active').length} {t('active_extraction_lines', 'Active Extraction Lines')}</span>
          </span>
          <Link
            href="/pressing-mill/setup"
            className="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-50 rounded text-slate-700 font-semibold transition"
          >
            {t('configure_lines', 'Configure Lines')}
          </Link>
        </div>
      </div>

      {/* DYNAMIC PRESSING LINES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {lines.map((line) => {
          const isColdPressCertified = line.malaxingTempC <= 27.0;

          return (
            <div
              key={line.id}
              className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4"
            >
              {/* Line Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{line.name}</h3>
                  <span className="text-[11px] text-slate-500">
                    {line.model} • {t('rating_label', 'Rating')} {(line.hourlyThroughputKg / 1000).toFixed(1)} {t('ton_per_hr', 'T/hr')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                      line.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : line.status === 'Cleaning'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {t(line.status, line.status)}
                  </span>
                  <button
                    disabled={!isSeasonActive}
                    onClick={() => handleToggleLineStatus(line.id)}
                    className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition disabled:opacity-40 cursor-pointer"
                    title={t('toggle_maintenance', 'Toggle Washing / Maintenance')}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Current Extraction Batch Progress */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">{t('active_extraction_lot', 'Active Extraction Lot')}:</span>
                  <span className="font-bold text-slate-900">
                    {line.currentFarmerName} ({line.currentBatchId})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">{t('crushed_volume_today', 'Crushed Volume Today')}:</span>
                  <span className="font-bold text-emerald-800">
                    {line.totalCrushedTodayKg.toLocaleString()} KG
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1 pt-1">
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${line.batchProgressPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>{t('extraction_progress', 'Extraction Progress')}: {line.batchProgressPct}%</span>
                    <span>{t('remaining_time', 'Remaining')}: ~{Math.max(0, Math.round((100 - line.batchProgressPct) * 0.35))} {t('minutes_abbrev', 'mins')}</span>
                  </div>
                </div>
              </div>

              {/* Real-time Telemetry Gauges */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                {/* Malaxing Temp Gauge */}
                <div className="bg-slate-50 border border-slate-200 rounded p-3 text-center space-y-0.5">
                  <div className="flex items-center justify-center gap-1 text-slate-500">
                    <Thermometer className="w-3.5 h-3.5 text-rose-600" />
                    <span className="text-[10px] font-semibold uppercase">{t('malaxer_temp', 'Malaxer Temp')}</span>
                  </div>
                  <span className="text-base font-bold text-slate-900 block font-mono">
                    {line.malaxingTempC}°C
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded inline-block ${
                      isColdPressCertified
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isColdPressCertified ? t('cold_press_certified', 'Cold Press (< 27°C)') : t('temp_warning', 'Warning (> 27°C)')}
                  </span>
                </div>

                {/* Decanter RPM */}
                <div className="bg-slate-50 border border-slate-200 rounded p-3 text-center space-y-0.5">
                  <div className="flex items-center justify-center gap-1 text-slate-500">
                    <Gauge className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-[10px] font-semibold uppercase">{t('decanter_rpm', 'Decanter RPM')}</span>
                  </div>
                  <span className="text-base font-bold text-slate-900 block font-mono">
                    {line.decanterRpm}
                  </span>
                  <span className="text-[9px] text-slate-400 block font-sans">
                    {t('centrifuge_g_force', 'Centrifuge G-Force')}
                  </span>
                </div>

                {/* Separator Flow Rate */}
                <div className="bg-slate-50 border border-slate-200 rounded p-3 text-center space-y-0.5">
                  <div className="flex items-center justify-center gap-1 text-slate-500">
                    <Droplets className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[10px] font-semibold uppercase">{t('oil_flow_rate', 'Oil Flow Rate')}</span>
                  </div>
                  <span className="text-base font-bold text-emerald-800 block font-mono">
                    {line.flowRateLitersPerHour} L/h
                  </span>
                  <span className="text-[9px] text-slate-400 block font-sans">
                    {t('active_separator', 'Active Separator')}
                  </span>
                </div>
              </div>

              {/* Control Action Bar */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                <span className="text-slate-400 text-[11px]">
                  {t('hopper_batch_limit', 'Hopper Batch Limit')}: {line.malaxerBatchLimitKg.toLocaleString()} KG
                </span>
                <button
                  disabled={!isSeasonActive || line.batchProgressPct >= 100}
                  onClick={() => handleAdvanceBatch(line.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-semibold rounded shadow-xs transition cursor-pointer"
                >
                  <Play className="w-3 h-3 text-emerald-400" />
                  <span>{t('advance_extraction_step', 'Advance Extraction Step')}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* QUEUED HOPPER BATCHES WAITING FOR PROCESSING */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              {t('hopper_staging_queue', 'Hopper Staging Queue (Batches Awaiting Line Assignment)')}
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {tickets.filter((t) => t.status === 'In_Queue').length} {t('batches_in_hopper', 'Batches in Line Hopper')}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">{t('queue_num', 'Queue #')}</th>
                <th className="py-2.5 px-3">{t('ticket_num', 'Ticket Ref')}</th>
                <th className="py-2.5 px-3">{t('farmer_grower', 'Farmer / Grower')}</th>
                <th className="py-2.5 px-3">{t('variety', 'Variety')}</th>
                <th className="py-2.5 px-3 text-right">{t('net_olive_weight', 'Net Olive Weight')}</th>
                <th className="py-2.5 px-3">{t('target_silo', 'Target Tank')}</th>
                <th className="py-2.5 px-3">{t('assigned_line', 'Target Line')}</th>
                <th className="py-2.5 px-3 text-right">{t('action', 'Action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets
                .filter((t) => t.status === 'In_Queue' || t.status === 'Crushing' || t.status === 'Malaxing')
                .map((tItem, idx) => (
                  <tr key={tItem.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-700">Q-0{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">{tItem.ticketNumber}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{tItem.farmerName}</td>
                    <td className="py-2.5 px-3 text-slate-600">{t(tItem.variety, tItem.variety)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">
                      {tItem.netWeight.toLocaleString()} KG
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{tItem.targetTankId}</td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium">
                      {tItem.lineName || 'Line 01 - Pieralisi Leopard'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-amber-100 text-amber-800">
                        {t(tItem.status, tItem.status)}
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
