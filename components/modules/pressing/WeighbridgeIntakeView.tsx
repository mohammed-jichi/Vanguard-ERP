'use client';

import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { ScaleTicket, OliveVariety, SettlementMethod } from '@/types/pressingMill';
import { INITIAL_SCALE_TICKETS, INITIAL_TANKS } from '@/lib/pressingMillData';

export default function WeighbridgeIntakeView() {
  const [tickets, setTickets] = useState<ScaleTicket[]>(INITIAL_SCALE_TICKETS);
  
  // Form fields
  const [intakeDate, setIntakeDate] = useState('2026-09-22');
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
    return {
      id: `ST-${Date.now()}`,
      ticketNumber: nextTicketNum,
      date: intakeDate,
      time: '12:30 PM',
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
      estimatedOilKg,
      tinCountEquivalent,
      pomaceKg,
      status: customStatus
    };
  };

  const handleSaveDraft = () => {
    if (netWeight <= 0) {
      showToast('Please enter valid Gross and Tare weights.');
      return;
    }
    const t = createTicketObject('Weighed');
    setTickets([t, ...tickets]);
    showToast(`Draft Scale Ticket saved: ${t.ticketNumber}`);
  };

  const handleSaveAndPrint = () => {
    if (netWeight <= 0) {
      showToast('Please enter valid Gross and Tare weights.');
      return;
    }
    const t = createTicketObject('Weighed');
    setTickets([t, ...tickets]);
    setSelectedTicketForPrint(t);
    showToast(`Scale ticket recorded & printed: ${t.ticketNumber}`);
  };

  const handleQueueToLine = () => {
    if (netWeight <= 0) {
      showToast('Please enter valid Gross and Tare weights.');
      return;
    }
    const t = createTicketObject('In_Queue');
    setTickets([t, ...tickets]);
    showToast(`Batch queued to active line hopper: ${t.ticketNumber}`);
  };

  return (
    <div className="space-y-6">
      {/* GLOBAL TOAST */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* WEIGHBRIDGE FORM CARD */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">Weighbridge Olive Intake Console</h2>
              <span className="text-[11px] text-slate-500">Gross / Tare / Net weighbridge logging and farmer receipt registration</span>
            </div>
          </div>
          <button
            onClick={() => {
              if (tickets.length > 0) {
                setSelectedTicketForPrint(tickets[0]);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded shadow-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Reprint Last Ticket</span>
          </button>
        </div>

        {/* ROW 1: INTAKE DATE, VARIETY, TARGET TANK, ACIDITY */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Intake Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={intakeDate}
              onChange={(e) => setIntakeDate(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Olive Variety <span className="text-rose-500">*</span>
            </label>
            <select
              value={variety}
              onChange={(e) => setVariety(e.target.value as OliveVariety)}
              className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500"
            >
              <option value="Souri">Souri (Traditional High Phenol)</option>
              <option value="Nabali">Nabali (Mountain Grove)</option>
              <option value="Shami">Shami (Large Fruit)</option>
              <option value="Baladi_Mixed">Commercial Mixed Baladi</option>
              <option value="Grossa">Grossa (Dual Purpose)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Storage Silo
            </label>
            <select
              value={targetTankId}
              onChange={(e) => setTargetTankId(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500"
            >
              {INITIAL_TANKS.slice(0, 15).map((tk) => (
                <option key={tk.id} value={tk.id}>
                  {tk.id} - {tk.title} ({tk.grade.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Laboratory Acidity Test (%)
            </label>
            <input
              type="number"
              step="0.05"
              placeholder="e.g. 0.55"
              value={acidityTestPct}
              onChange={(e) => setAcidityTestPct(Number(e.target.value) || '')}
              className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500"
            />
          </div>
        </div>

        {/* ROW 2: FARMER & VEHICLE DETAILS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Farmer / Client Account Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter grower or supplier name..."
              value={farmerName}
              onChange={(e) => setFarmerName(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contact Phone Number
            </label>
            <input
              type="text"
              placeholder="+961 70 XXXXXX"
              value={farmerPhone}
              onChange={(e) => setFarmerPhone(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Vehicle Plate / Transport Details
            </label>
            <input
              type="text"
              placeholder="e.g. M 21908 (Truck / Pickup)"
              value={vehiclePlate}
              onChange={(e) => setVehiclePlate(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500"
            />
          </div>
        </div>

        {/* ROW 3: WEIGHBRIDGE MEASUREMENTS */}
        <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-600" />
            <span>Digital Scale Measurements (KG)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gross Weight (Loaded Truck - KG) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={grossWeight}
                onChange={(e) => setGrossWeight(Number(e.target.value) || '')}
                className="w-full text-sm font-semibold border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tare Weight (Empty Vehicle/Crates - KG) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={tareWeight}
                onChange={(e) => setTareWeight(Number(e.target.value) || '')}
                className="w-full text-sm font-semibold border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-slate-500"
              />
            </div>

            <div className="bg-white border border-slate-200 rounded p-2.5 flex flex-col justify-center">
              <span className="text-[11px] font-semibold text-slate-500">Net Olive Weight</span>
              <span className="text-lg font-bold text-slate-900">{netWeight.toLocaleString()} KG</span>
            </div>
          </div>
        </div>

        {/* ROW 4: SETTLEMENTS & FEES ENGINE */}
        <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-600" />
              <span>Triple Settlement Engine</span>
            </h3>

            <div className="flex items-center gap-4 text-xs font-medium">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="settlementMethod"
                  checked={settlementMethod === 'In_Kind'}
                  onChange={() => setSettlementMethod('In_Kind')}
                  className="accent-slate-900"
                />
                <span>In-Kind Retention (Oil %)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="settlementMethod"
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
                  value={retentionPct}
                  onChange={(e) => setRetentionPct(Number(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500"
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
                  value={cashFeeRatePerKg}
                  onChange={(e) => setCashFeeRatePerKg(Number(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500"
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
                    value={mixedCashAmount}
                    onChange={(e) => setMixedCashAmount(Number(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded px-2 py-1"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Remainder In-Kind Oil (KG)</label>
                  <input
                    type="number"
                    value={mixedOilKg}
                    onChange={(e) => setMixedOilKg(Number(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded px-2 py-1"
                  />
                </div>
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded p-2.5">
              <span className="text-[11px] font-semibold text-slate-500 block">Est. Virgin Oil Extraction</span>
              <span className="text-base font-bold text-emerald-700">~{estimatedOilKg} KG</span>
              <span className="text-[11px] text-slate-500 block">
                ~{tinCountEquivalent} Standard Tins (15 KG / 16L)
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded p-2.5">
              <span className="text-[11px] font-semibold text-slate-500 block">Subproduct / Pomace (Jift)</span>
              <span className="text-base font-bold text-amber-800">~{pomaceKg} KG</span>
              <span className="text-[11px] text-slate-500 block">Heating fuel & organic fertilizer</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION BAR (WHITE ENTERPRISE THEME) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
        <div className="text-xs">
          <span className="text-slate-500 font-semibold block">Batch Yield Overview:</span>
          <span className="text-sm font-bold text-slate-900">
            {netWeight.toLocaleString()} KG Olives ➔ ~{estimatedOilKg} KG Virgin Olive Oil ({tinCountEquivalent} Tins)
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            onClick={handleClear}
            className="flex items-center gap-1 px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-md text-xs font-semibold text-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          <button
            onClick={handleQueueToLine}
            className="flex items-center gap-1 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md text-xs font-semibold transition shadow-xs"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Queue to Line</span>
          </button>

          <button
            onClick={handleSaveDraft}
            className="flex items-center gap-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-xs font-semibold transition shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>

          <button
            onClick={handleSaveAndPrint}
            className="flex items-center gap-1 px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-md text-xs font-semibold transition shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Save &amp; Print Scale Ticket</span>
          </button>
        </div>
      </div>

      {/* PRINT MODAL */}
      {selectedTicketForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 relative text-slate-800">
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
              <p className="text-xs text-slate-500">Official Weighbridge Olive Reception & Scale Voucher</p>
              <div className="mt-2 inline-flex items-center gap-2 bg-slate-100 px-3 py-1 rounded text-xs font-mono font-bold">
                <span>{selectedTicketForPrint.ticketNumber}</span>
                <span>•</span>
                <span>{selectedTicketForPrint.date}</span>
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
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-md text-xs font-semibold text-slate-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                  setSelectedTicketForPrint(null);
                  showToast('Scale receipt dispatched to thermal barcode printer.');
                }}
                className="flex items-center gap-1.5 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold shadow-xs"
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
