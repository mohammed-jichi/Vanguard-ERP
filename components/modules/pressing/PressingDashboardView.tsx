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
  Plus
} from 'lucide-react';
import { INITIAL_PRESSING_LINES, INITIAL_SCALE_TICKETS, INITIAL_TANKS } from '@/lib/pressingMillData';

export default function PressingDashboardView() {
  const totalTanksCap = INITIAL_TANKS.reduce((acc, t) => acc + t.capacityLiters, 0);
  const totalTanksCurrent = INITIAL_TANKS.reduce((acc, t) => acc + t.currentLevelLiters, 0);
  const tanksFillPct = Math.round((totalTanksCurrent / totalTanksCap) * 100);

  const totalCrushedToday = INITIAL_PRESSING_LINES.reduce((acc, l) => acc + l.totalCrushedTodayKg, 0);
  const totalOilExtractedEst = Math.round(totalCrushedToday * 0.205);
  const totalTinsToday = (totalOilExtractedEst / 15.0).toFixed(1);

  return (
    <div className="space-y-6">
      {/* 1. TOP METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Daily Olive Intake</span>
            <Scale className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900">{totalCrushedToday.toLocaleString()} KG</span>
            <span className="text-[11px] text-emerald-600 font-medium block mt-0.5">
              +14.2% vs yesterday (Weighbridge active)
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Crushing Throughput</span>
            <Activity className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-sky-900">7.7 T/hr</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Lines 01 & 02 continuous capacity
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Stainless Tanks Level (1-50)</span>
            <Landmark className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900">{tanksFillPct}%</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              {totalTanksCurrent.toLocaleString()} / {totalTanksCap.toLocaleString()} L
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Dispatch & Release Summary</span>
            <Truck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-amber-800">104 Tins</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              1,664 Liters released today
            </span>
          </div>
        </div>
      </div>

      {/* 2. ACTIVE PRESSING LINES LIVE TELEMETRY */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">Continuous Pressing Lines Telemetry</h2>
          </div>
          <Link
            href="/pressing-mill/batches"
            className="text-xs text-sky-700 hover:text-sky-900 font-semibold flex items-center gap-1"
          >
            <span>Manage Line Queues</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {INITIAL_PRESSING_LINES.map((line) => (
            <div key={line.lineId} className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{line.lineName}</h3>
                  <span className="text-[11px] text-slate-500">{line.model}</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  {line.status.toUpperCase()}
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
                  <span className="font-bold text-slate-800 flex items-center justify-center gap-1">
                    <Thermometer className="w-3 h-3 text-rose-500" /> {line.malaxingTemperatureC}°C
                  </span>
                  <span className="text-[9px] text-emerald-600 font-semibold">Cold Press OK</span>
                </div>

                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Decanter RPM</span>
                  <span className="font-bold text-slate-800 flex items-center justify-center gap-1">
                    <Gauge className="w-3 h-3 text-blue-500" /> {line.decanterRpm}
                  </span>
                  <span className="text-[9px] text-slate-500">Separation Optimal</span>
                </div>

                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Oil Flow Rate</span>
                  <span className="font-bold text-emerald-700 flex items-center justify-center gap-1">
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
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900">Recent Weighbridge Scale Tickets</h2>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/pressing-mill/intake"
              className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Intake Scale</span>
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                <th className="py-2.5 px-3">Ticket #</th>
                <th className="py-2.5 px-3">Farmer / Grower</th>
                <th className="py-2.5 px-3">Vehicle Plate</th>
                <th className="py-2.5 px-3">Variety</th>
                <th className="py-2.5 px-3">Net Olive Weight</th>
                <th className="py-2.5 px-3">Target Silo</th>
                <th className="py-2.5 px-3">Settlement</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {INITIAL_SCALE_TICKETS.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-slate-900">{t.ticketNumber}</td>
                  <td className="py-2.5 px-3 font-medium">{t.farmerName}</td>
                  <td className="py-2.5 px-3 text-slate-500">{t.vehiclePlate}</td>
                  <td className="py-2.5 px-3">{t.variety}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{t.netWeight.toLocaleString()} KG</td>
                  <td className="py-2.5 px-3 text-slate-600">{t.targetTankId}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.settlementMethod === 'In_Kind' ? 'bg-amber-100 text-amber-800' :
                      t.settlementMethod === 'Cash' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {t.settlementMethod}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
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
