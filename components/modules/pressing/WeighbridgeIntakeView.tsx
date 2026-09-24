'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Scale,
  DollarSign,
  Layers,
  Save,
  CheckCircle2,
  RotateCcw,
  Printer,
  X,
  FileText,
  User,
  Phone,
  Truck,
  Building,
  AlertCircle,
  Calendar,
  Lock,
  Unlock,
  Clock,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { ScaleTicket, OliveVariety, SettlementMethod } from '@/types/pressingMill';
import {
  INITIAL_SCALE_TICKETS,
  INITIAL_TANKS,
  INITIAL_SEASONS,
  INITIAL_DYNAMIC_LINES
} from '@/lib/pressingMillData';
import { useLanguage } from '@/lib/LanguageContext';

export default function WeighbridgeIntakeView() {
  const { t } = useLanguage();
  const [tickets, setTickets] = useState<ScaleTicket[]>(INITIAL_SCALE_TICKETS);
  
  // Season & Line assignment
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>(INITIAL_SEASONS[0].id);
  const activeLines = INITIAL_DYNAMIC_LINES.filter((l) => l.status === 'Active');
  const [selectedLineId, setSelectedLineId] = useState<string>(activeLines[0]?.id || 'LINE-01');

  // Selected season state
  const selectedSeason = INITIAL_SEASONS.find((s) => s.id === selectedSeasonId) || INITIAL_SEASONS[0];
  const isSeasonActive = selectedSeason.status === 'Active';

  // Form fields
  const [intakeDate, setIntakeDate] = useState('2026-09-22');
  const [intakeTime, setIntakeTime] = useState('12:30 PM');
  const [farmerName, setFarmerName] = useState('');
  const [farmerPhone, setFarmerPhone] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [variety, setVariety] = useState<OliveVariety>('Souri');
  const [grossWeight, setGrossWeight] = useState<number | ''>('');
  const [tareWeight, setTareWeight] = useState<number | ''>('');
  const [acidityTestPct, setAcidityTestPct] = useState<number | ''>('');
  const [targetTankId, setTargetTankId] = useState('TK-01');
  
  // Settlement method & fees
  const [settlementMethod, setSettlementMethod] = useState<SettlementMethod>('In_Kind');
  const [retentionPct, setRetentionPct] = useState<number>(10); // 10%
  const [cashFeeRatePerKg, setCashFeeRatePerKg] = useState<number>(0.08); // $0.08 / kg
  const [mixedCashAmount, setMixedCashAmount] = useState<number>(50.00);
  const [mixedOilKg, setMixedOilKg] = useState<number>(15.0);

  // Modals & toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedTicketForPrint, setSelectedTicketForPrint] = useState<ScaleTicket | null>(null);

  // Calculations
  const netWeight = typeof grossWeight === 'number' && typeof tareWeight === 'number'
    ? Math.max(0, grossWeight - tareWeight)
    : 0;

  // Standard Yield Estimation (20%)
  const estimatedYieldPct = 20.0;
  const estimatedOilKg = Math.round(netWeight * (estimatedYieldPct / 100));
  const tinCountEquivalent = Number((estimatedOilKg / 15.0).toFixed(1)); // 15 KG per standard 16L tin
  const pomaceKg = Math.round(netWeight * 0.40); // 40% pomace / jift

  // Milling Fee calculations
  const calculatedFeeCash = (netWeight * cashFeeRatePerKg).toFixed(2);
  const calculatedFeeOilKg = (estimatedOilKg * (retentionPct / 100)).toFixed(1);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleClear = () => {
    setGrossWeight('');
    setTareWeight('');
    setFarmerName('');
    setFarmerPhone('');
    setVehiclePlate('');
    setAcidityTestPct('');
    showToast('Weighbridge scale form cleared.');
  };

  const createTicketObject = (customStatus: ScaleTicket['status'] = 'Weighed'): ScaleTicket => {
    const nextTicketNum = `TK-2026-${String(tickets.length + 145).padStart(4, '0')}`;
    const assignedLine = INITIAL_DYNAMIC_LINES.find((l) => l.id === selectedLineId);

    return {
      id: `ST-${Date.now()}`,
      ticketNumber: nextTicketNum,
      date: intakeDate,
      time: intakeTime,
      seasonId: selectedSeason.id,
      seasonName: selectedSeason.seasonName,
      lineId: selectedLineId,
      lineName: assignedLine?.name || 'Line 01',
      farmerId: `FRM-${Math.floor(10 + Math.random() * 90)}`,
      farmerName: farmerName.trim() || 'General Grower Intake',
      farmerPhone: farmerPhone.trim() || 'Not Provided',
      vehiclePlate: vehiclePlate.trim() || 'General Transport',
      variety,
      grossWeight: Number(grossWeight) || 0,
      tareWeight: Number(tareWeight) || 0,
      netWeight,
      acidityTestPct: Number(acidityTestPct) || 0.60,
      targetTankId,
      settlementMethod,
      cashFeeRatePerKg,
      inKindRetentionPct: retentionPct,
      mixedCashAmount: settlementMethod === 'Mixed' ? mixedCashAmount : undefined,
      mixedOilDeductionKg: settlementMethod === 'Mixed' ? mixedOilKg : undefined,
      estimatedYieldPct,
      actualYieldPct: Number((estimatedYieldPct + 0.5).toFixed(1)),
      estimatedOilKg,
      actualOilKg: Math.round(estimatedOilKg * 1.02),
      tinCountEquivalent,
      pomaceKg,
      status: customStatus,
      notes: `Intake tagged to ${selectedSeason.seasonName} via ${assignedLine?.name || selectedLineId}.`
    };
  };

  const handleSaveDraft = () => {
    if (!isSeasonActive) {
      showToast('Cannot save ticket: Harvest campaign is closed.');
      return;
    }
    const t = createTicketObject('Weighed');
    setTickets([t, ...tickets]);
    showToast(`Intake scale ticket saved as draft: ${t.ticketNumber}`);
  };

  const handleSaveAndPrint = () => {
    if (!isSeasonActive) {
      showToast('Cannot save ticket: Harvest campaign is closed.');
      return;
    }
    if (netWeight <= 0) {
      showToast('Please enter valid Gross and Tare scale weights.');
      return;
    }
    const t = createTicketObject('Weighed');
    setTickets([t, ...tickets]);
    setSelectedTicketForPrint(t);
  };

  const handleQueueToLine = () => {
    if (!isSeasonActive) {
      showToast('Cannot queue batch: Harvest campaign is closed.');
      return;
    }
    if (netWeight <= 0) {
      showToast('Please enter valid Gross and Tare scale weights.');
      return;
    }
    const t = createTicketObject('In_Queue');
    setTickets([t, ...tickets]);
    showToast(`Batch queued to ${t.lineName || 'active line'}: ${t.ticketNumber}`);
  };

  return (
    <div className="space-y-6">
      {/* GLOBAL TOAST */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* OPERATIONAL FREEZE BANNER IF SEASON CLOSED */}
      {!isSeasonActive && (
        <div className="bg-amber-50 border border-amber-300 text-amber-950 rounded-lg p-4 text-xs flex items-start justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-slate-900">
                Operational Freeze Active ({selectedSeason.seasonName}):
              </span>
              <p className="text-amber-900 leading-relaxed">
                The selected harvest season is closed or out-of-season. Weighbridge scale logging and pressing lines batch entry are locked into read-only mode to preserve seasonal audit integrity.
              </p>
            </div>
          </div>
          <Link
            href="/pressing-mill/seasons"
            className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 hover:text-amber-950 underline shrink-0"
          >
            <span>Manage Seasons</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* WEIGHBRIDGE FORM CARD */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-6">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-600" />
            <div>
              <h1 className="text-sm font-bold text-slate-900">
                {t('pm_intake', 'Weighbridge & Olive Intake Console')}
              </h1>
              <span className="text-[11px] text-slate-500">
                Gross / Tare / Net weighbridge scale logging, farmer receipts, and dynamic line dispatching
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              if (tickets.length > 0) {
                setSelectedTicketForPrint(tickets[0]);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Reprint Last Scale Ticket</span>
          </button>
        </div>

        {/* CAMPAIGN & DYNAMIC LINE SELECTORS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/80 p-3.5 rounded-lg border border-slate-200 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Active Harvest Season</span>
            </label>
            <select
              value={selectedSeasonId}
              onChange={(e) => setSelectedSeasonId(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-bold text-slate-800 bg-white focus:outline-none"
            >
              {INITIAL_SEASONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.seasonName} [{s.status}]
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sky-600" />
              <span>Assigned Active Line (Dynamic)</span>
            </label>
            <select
              disabled={!isSeasonActive || activeLines.length === 0}
              value={selectedLineId}
              onChange={(e) => setSelectedLineId(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-bold text-emerald-800 bg-white focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
            >
              {activeLines.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({(l.hourlyThroughputKg / 1000).toFixed(1)} T/hr)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Intake Date &amp; Timestamp</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                disabled={!isSeasonActive}
                value={intakeDate}
                onChange={(e) => setIntakeDate(e.target.value)}
                className="w-full border border-slate-300 rounded px-2 py-1.5 bg-white font-medium focus:outline-none disabled:bg-slate-100"
              />
              <input
                type="text"
                disabled={!isSeasonActive}
                value={intakeTime}
                onChange={(e) => setIntakeTime(e.target.value)}
                className="w-full border border-slate-300 rounded px-2 py-1.5 bg-white font-medium focus:outline-none disabled:bg-slate-100"
              />
            </div>
          </div>
        </div>

        {/* ROW 1: VARIETY, TARGET TANK, ACIDITY */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Olive Variety <span className="text-rose-500">*</span>
            </label>
            <select
              disabled={!isSeasonActive}
              value={variety}
              onChange={(e) => setVariety(e.target.value as OliveVariety)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500 disabled:bg-slate-100"
            >
              <option value="Souri">Souri Heritage (High Polyphenol)</option>
              <option value="Nabali">Nabali (Mountain Grove)</option>
              <option value="Shami">Shami (Large Table &amp; Pressing)</option>
              <option value="Baladi_Mixed">Commercial Mixed Baladi</option>
              <option value="Grossa">Grossa (Dual Purpose)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Target Storage Silo Tank
            </label>
            <select
              disabled={!isSeasonActive}
              value={targetTankId}
              onChange={(e) => setTargetTankId(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500 disabled:bg-slate-100"
            >
              {INITIAL_TANKS.slice(0, 15).map((tk) => (
                <option key={tk.id} value={tk.id}>
                  {tk.id} - {tk.title} ({tk.grade.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Laboratory Acidity Test (%)
            </label>
            <input
              type="number"
              step="0.05"
              disabled={!isSeasonActive}
              placeholder="e.g. 0.55"
              value={acidityTestPct}
              onChange={(e) => setAcidityTestPct(Number(e.target.value) || '')}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500 disabled:bg-slate-100"
            />
          </div>
        </div>

        {/* ROW 2: FARMER & VEHICLE DETAILS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Farmer / Client Account Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              disabled={!isSeasonActive}
              placeholder="Enter grower or supplier name..."
              value={farmerName}
              onChange={(e) => setFarmerName(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Contact Phone Number
            </label>
            <input
              type="text"
              disabled={!isSeasonActive}
              placeholder="+961 70 XXXXXX"
              value={farmerPhone}
              onChange={(e) => setFarmerPhone(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Vehicle Plate / Transport Details
            </label>
            <input
              type="text"
              disabled={!isSeasonActive}
              placeholder="e.g. M 21908 (Pickup / Truck)"
              value={vehiclePlate}
              onChange={(e) => setVehiclePlate(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500 disabled:bg-slate-100"
            />
          </div>
        </div>

        {/* ROW 3: SCALE WEIGHT MEASUREMENTS */}
        <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-4 space-y-3">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Weighbridge Scale Readings (Digital Indicator)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Gross Weight (KG) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                disabled={!isSeasonActive}
                placeholder="0"
                value={grossWeight}
                onChange={(e) => setGrossWeight(Number(e.target.value) || '')}
                className="w-full border border-slate-300 rounded px-3 py-2 font-mono text-base font-bold text-slate-900 bg-white focus:outline-none disabled:bg-slate-100"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Vehicle + Full Olive Load</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tare Weight (KG) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                disabled={!isSeasonActive}
                placeholder="0"
                value={tareWeight}
                onChange={(e) => setTareWeight(Number(e.target.value) || '')}
                className="w-full border border-slate-300 rounded px-3 py-2 font-mono text-base font-bold text-slate-900 bg-white focus:outline-none disabled:bg-slate-100"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Empty Vehicle Weight</span>
            </div>

            <div>
              <label className="block font-semibold text-emerald-800 mb-1">
                Net Olive Weight (KG)
              </label>
              <div className="w-full border-2 border-emerald-600 bg-white rounded px-3 py-2 font-mono text-base font-extrabold text-emerald-800 flex items-center justify-between">
                <span>{netWeight.toLocaleString()} KG</span>
                <span className="text-xs text-emerald-600 font-sans font-normal">{(netWeight / 1000).toFixed(2)} MT</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Gross minus Tare</span>
            </div>
          </div>
        </div>

        {/* ROW 4: SETTLEMENT METHOD SELECTOR */}
        <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Settlement Agreement &amp; Retention Formula
            </span>

            <div className="flex items-center gap-3 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="settlementMethod"
                  disabled={!isSeasonActive}
                  checked={settlementMethod === 'In_Kind'}
                  onChange={() => setSettlementMethod('In_Kind')}
                  className="accent-slate-900"
                />
                <span className="font-semibold">In-Kind Oil Retention (Al-Raddah)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="settlementMethod"
                  disabled={!isSeasonActive}
                  checked={settlementMethod === 'Cash'}
                  onChange={() => setSettlementMethod('Cash')}
                  className="accent-slate-900"
                />
                <span>Cash Fee</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="settlementMethod"
                  disabled={!isSeasonActive}
                  checked={settlementMethod === 'Mixed'}
                  onChange={() => setSettlementMethod('Mixed')}
                  className="accent-slate-900"
                />
                <span>Mixed (Split)</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {settlementMethod === 'In_Kind' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mill Retention Percentage (%)
                </label>
                <input
                  type="number"
                  disabled={!isSeasonActive}
                  value={retentionPct}
                  onChange={(e) => setRetentionPct(Number(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500 disabled:bg-slate-100"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Mill Retained Oil: ~{calculatedFeeOilKg} KG
                </span>
              </div>
            )}

            {settlementMethod === 'Cash' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Cash Rate ($ USD per Olive KG)
                </label>
                <input
                  type="number"
                  step="0.01"
                  disabled={!isSeasonActive}
                  value={cashFeeRatePerKg}
                  onChange={(e) => setCashFeeRatePerKg(Number(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500 disabled:bg-slate-100"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Total Cash Milling Fee: ${calculatedFeeCash} USD
                </span>
              </div>
            )}

            {settlementMethod === 'Mixed' && (
              <div className="space-y-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Partial Cash Due (USD)</label>
                  <input
                    type="number"
                    disabled={!isSeasonActive}
                    value={mixedCashAmount}
                    onChange={(e) => setMixedCashAmount(Number(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded px-2 py-1 disabled:bg-slate-100"
                  />
                </div>
              </div>
            )}

            <div className="bg-slate-50 border border-slate-200 rounded p-2.5">
              <span className="text-[11px] font-semibold text-slate-500 block">Est. Virgin Oil Extraction</span>
              <span className="text-base font-bold text-emerald-700">~{estimatedOilKg} KG</span>
              <span className="text-[11px] text-slate-500 block">
                ~{tinCountEquivalent} Standard Tins (15 KG / 16L)
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded p-2.5">
              <span className="text-[11px] font-semibold text-slate-500 block">Subproduct / Pomace (Jift)</span>
              <span className="text-base font-bold text-amber-800">~{pomaceKg} KG</span>
              <span className="text-[11px] text-slate-500 block">Heating fuel &amp; biomass</span>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="text-xs">
            <span className="text-slate-500 font-semibold block">Batch Yield Summary:</span>
            <span className="text-sm font-bold text-slate-900">
              {netWeight.toLocaleString()} KG Olives ➔ ~{estimatedOilKg} KG Virgin Olive Oil ({tinCountEquivalent} Tins)
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              onClick={handleClear}
              className="flex items-center gap-1 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 rounded text-xs font-semibold text-slate-700 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>

            <button
              disabled={!isSeasonActive}
              onClick={handleQueueToLine}
              className="flex items-center gap-1 px-4 py-2 bg-sky-700 hover:bg-sky-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded text-xs font-semibold transition shadow-xs"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Queue to Line</span>
            </button>

            <button
              disabled={!isSeasonActive}
              onClick={handleSaveDraft}
              className="flex items-center gap-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded text-xs font-semibold transition shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>

            <button
              disabled={!isSeasonActive}
              onClick={handleSaveAndPrint}
              className="flex items-center gap-1 px-5 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded text-xs font-semibold transition shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Save &amp; Print Scale Ticket</span>
            </button>
          </div>
        </div>
      </div>

      {/* RECENT INTAKE SCALE TICKETS TABLE */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Recent Weighbridge Intake Scale Tickets
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {tickets.length} Scale Tickets Recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">{t('ticket_num', 'Ticket #')}</th>
                <th className="py-2.5 px-3">Date &amp; Time</th>
                <th className="py-2.5 px-3">{t('campaign_season', 'Campaign Season')}</th>
                <th className="py-2.5 px-3">{t('assigned_line', 'Assigned Line')}</th>
                <th className="py-2.5 px-3">{t('farmer_grower', 'Farmer / Grower')}</th>
                <th className="py-2.5 px-3 text-right">{t('net_olive_weight', 'Net KG')}</th>
                <th className="py-2.5 px-3 text-right">Acidity</th>
                <th className="py-2.5 px-3">{t('target_silo', 'Target Tank')}</th>
                <th className="py-2.5 px-3">{t('status', 'Status')}</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{t.ticketNumber}</td>
                  <td className="py-2.5 px-3 text-slate-600">{t.date} {t.time}</td>
                  <td className="py-2.5 px-3">
                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                      {t.seasonName || 'Season 2026/2027'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 font-medium">
                    {t.lineName || 'Line 01 - Pieralisi Leopard'}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{t.farmerName}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">
                    {t.netWeight.toLocaleString()} KG
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">{t.acidityTestPct}%</td>
                  <td className="py-2.5 px-3 text-slate-700 font-mono">{t.targetTankId}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        t.status === 'Crushing'
                          ? 'bg-amber-100 text-amber-800'
                          : t.status === 'Malaxing'
                          ? 'bg-sky-100 text-sky-800'
                          : t.status === 'In_Queue'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => setSelectedTicketForPrint(t)}
                      className="text-xs text-slate-600 hover:text-slate-900 font-medium hover:underline inline-flex items-center gap-1"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Print</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINT SCALE TICKET MODAL */}
      {selectedTicketForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 relative text-slate-800 animate-scaleUp">
            <button
              onClick={() => setSelectedTicketForPrint(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center border-b border-slate-200 pb-3 mb-3">
              <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">
                Southern Olive Oil Products S.A.R.L
              </h2>
              <p className="text-xs text-slate-500">Official Weighbridge Olive Reception &amp; Scale Voucher</p>
              <div className="mt-2 inline-flex items-center gap-2 bg-slate-100 px-3 py-1 rounded text-xs font-mono font-bold">
                <span>{selectedTicketForPrint.ticketNumber}</span>
                <span>•</span>
                <span>{selectedTicketForPrint.date} {selectedTicketForPrint.time}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">Farmer / Client</span>
                  <span className="font-bold text-slate-900">{selectedTicketForPrint.farmerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Vehicle / Plate</span>
                  <span className="font-semibold text-slate-800">{selectedTicketForPrint.vehiclePlate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Variety</span>
                  <span className="font-semibold text-slate-800">{selectedTicketForPrint.variety}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Target Storage Tank</span>
                  <span className="font-semibold text-slate-800">{selectedTicketForPrint.targetTankId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Campaign Season</span>
                  <span className="font-semibold text-slate-800">{selectedTicketForPrint.seasonName || 'Season 2026/2027'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Assigned Pressing Line</span>
                  <span className="font-semibold text-slate-800">{selectedTicketForPrint.lineName || 'Line 01'}</span>
                </div>
              </div>

              <div className="border border-slate-200 rounded p-2.5 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Gross Weight:</span>
                  <span className="font-mono font-semibold">{selectedTicketForPrint.grossWeight.toLocaleString()} KG</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tare Weight:</span>
                  <span className="font-mono font-semibold">{selectedTicketForPrint.tareWeight.toLocaleString()} KG</span>
                </div>
                <div className="flex justify-between font-bold border-t border-slate-100 pt-1 text-slate-900">
                  <span>Net Olive Weight:</span>
                  <span className="text-emerald-700 font-mono">{selectedTicketForPrint.netWeight.toLocaleString()} KG</span>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded p-2.5 space-y-1 text-emerald-900">
                <div className="flex justify-between">
                  <span>Est. Oil Yield:</span>
                  <span className="font-bold">~{selectedTicketForPrint.estimatedOilKg} KG ({selectedTicketForPrint.tinCountEquivalent} Tins)</span>
                </div>
                <div className="flex justify-between">
                  <span>Settlement Method:</span>
                  <span className="font-bold">{selectedTicketForPrint.settlementMethod}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedTicketForPrint(null)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded text-xs font-semibold text-slate-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                  setSelectedTicketForPrint(null);
                  showToast('Scale receipt dispatched to thermal printer.');
                }}
                className="flex items-center gap-1.5 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Scale Ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
