'use client';

import React, { useState } from 'react';
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
  CheckSquare
} from 'lucide-react';
import { INITIAL_PRESSING_LINES, INITIAL_SCALE_TICKETS } from '@/lib/pressingMillData';
import { PressingLineState, ScaleTicket } from '@/types/pressingMill';

export default function PressingBatchesView() {
  const [lines, setLines] = useState<PressingLineState[]>(INITIAL_PRESSING_LINES);
  const [tickets, setTickets] = useState<ScaleTicket[]>(INITIAL_SCALE_TICKETS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handlePauseWash = (lineId: string) => {
    setLines(lines.map(l => l.lineId === lineId ? { ...l, status: l.status === 'Running' ? 'Washing' : 'Running' } : l));
    showToast(`Line ${lineId} status updated.`);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-slate-700" />
            <h2 className="text-base font-bold text-slate-900">Active Pressing Lines & Extraction Batches</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time batch progress, malaxing temperature regulation (Cold Press &lt; 27°C), and centrifugation
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            2 Continuous Lines Active
          </span>
        </div>
      </div>

      {/* ACTIVE LINES MONITORS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {lines.map((line) => (
          <div key={line.lineId} className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{line.lineName}</h3>
                <span className="text-[11px] text-slate-500">{line.model} • Capacity {line.maxCapacityTonsPerHour} T/hr</span>
              </div>
              <span className={`px-2.5 py-1 rounded text-xs font-bold border ${
                line.status === 'Running'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {line.status.toUpperCase()}
              </span>
            </div>

            {/* Current Extraction Batch */}
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Active Batch:</span>
                <span className="font-bold text-slate-900">{line.currentFarmerName} ({line.currentBatchId})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Throughput Processed:</span>
                <span className="font-bold text-emerald-700">{line.totalCrushedTodayKg.toLocaleString()} KG today</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${line.batchProgressPct}%` }} />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Phase Progress: {line.batchProgressPct}%</span>
                <span>Est. Remaining: ~18 mins</span>
              </div>
            </div>

            {/* Telemetry Gauge Grid */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <div className="flex items-center justify-center gap-1 text-slate-500 text-[11px] mb-1">
                  <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                  <span>Malaxer Temp</span>
                </div>
                <span className="text-base font-bold text-slate-900">{line.malaxingTemperatureC} °C</span>
                <span className="text-[10px] text-emerald-600 font-semibold block">Cold Press Valid</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <div className="flex items-center justify-center gap-1 text-slate-500 text-[11px] mb-1">
                  <Gauge className="w-3.5 h-3.5 text-blue-500" />
                  <span>Decanter Speed</span>
                </div>
                <span className="text-base font-bold text-slate-900">{line.decanterRpm} RPM</span>
                <span className="text-[10px] text-slate-500 block">Separator: {line.separatorRpm}</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <div className="flex items-center justify-center gap-1 text-slate-500 text-[11px] mb-1">
                  <Droplets className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Flow Rate</span>
                </div>
                <span className="text-base font-bold text-emerald-700">{line.flowRateLitersPerHour} L/hr</span>
                <span className="text-[10px] text-slate-500 block">Yield: ~20.8%</span>
              </div>
            </div>

            {/* Line Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => showToast(`Sample laboratory acidity test scheduled for ${line.lineName}.`)}
                className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded"
              >
                Sample Oil
              </button>
              <button
                onClick={() => handlePauseWash(line.lineId)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded"
              >
                {line.status === 'Running' ? 'Pause for Wash' : 'Resume Pressing'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* WAITING QUEUE IN HOPPER */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900">Olive Reception Hopper Queue</h2>
          </div>
          <span className="text-xs text-slate-500">
            {tickets.filter(t => t.status === 'In_Queue' || t.status === 'Weighed').length} Batches Waiting in Yard
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                <th className="py-2.5 px-3">Ticket</th>
                <th className="py-2.5 px-3">Farmer / Grower</th>
                <th className="py-2.5 px-3">Variety</th>
                <th className="py-2.5 px-3">Net Olives</th>
                <th className="py-2.5 px-3">Est. Yield</th>
                <th className="py-2.5 px-3">Target Tank</th>
                <th className="py-2.5 px-3">Stage Status</th>
                <th className="py-2.5 px-3 text-right">Queue Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-slate-900">{t.ticketNumber}</td>
                  <td className="py-2.5 px-3 font-medium">{t.farmerName}</td>
                  <td className="py-2.5 px-3">{t.variety}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{t.netWeight.toLocaleString()} KG</td>
                  <td className="py-2.5 px-3 text-emerald-700 font-semibold">~{t.estimatedOilKg} KG ({t.tinCountEquivalent} Tins)</td>
                  <td className="py-2.5 px-3 font-mono">{t.targetTankId}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                      {t.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => showToast(`Batch ${t.ticketNumber} promoted in pressing hopper sequence.`)}
                      className="text-sky-700 hover:text-sky-900 font-semibold"
                    >
                      Promote in Hopper
                    </button>
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
