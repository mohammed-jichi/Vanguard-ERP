'use client';

import React, { useState } from 'react';
import {
  DollarSign,
  Percent,
  Split,
  FileText,
  Printer,
  CheckCircle2,
  X,
  Download,
  Calculator,
  Save,
  RotateCcw
} from 'lucide-react';
import { INITIAL_SETTLEMENTS, INITIAL_SCALE_TICKETS } from '@/lib/pressingMillData';
import { SettlementVoucher, SettlementMethod } from '@/types/pressingMill';

export default function SettlementsEngineView() {
  const [settlements, setSettlements] = useState<SettlementVoucher[]>(INITIAL_SETTLEMENTS);
  
  // Interactive Calculator State
  const [calcNetOlivesKg, setCalcNetOlivesKg] = useState<number>(3500);
  const [calcActualYieldPct, setCalcActualYieldPct] = useState<number>(20.5); // %
  const [calcMethod, setCalcMethod] = useState<SettlementMethod>('In_Kind');
  const [calcCashRateUSD, setCalcCashRateUSD] = useState<number>(0.08); // USD / KG
  const [calcRetentionPct, setCalcRetentionPct] = useState<number>(10); // 10%
  const [calcMixedCashUSD, setCalcMixedCashUSD] = useState<number>(140);
  const [calcGrowerName, setCalcGrowerName] = useState<string>('Sleiman Farming Est.');

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedVoucherForPrint, setSelectedVoucherForPrint] = useState<SettlementVoucher | null>(null);

  // Derived yield calculations
  const calcTotalOilProducedKg = Number(((calcNetOlivesKg * calcActualYieldPct) / 100).toFixed(1));
  const calcTotalTins = Number((calcTotalOilProducedKg / 15.0).toFixed(1)); // 15 KG per 16L tin

  // Fee engine outputs
  const calcCashDueUSD = Number((calcNetOlivesKg * calcCashRateUSD).toFixed(2));
  const calcCashDueLBP = Math.round(calcCashDueUSD * 89500);

  const calcRetainedOilKg = calcMethod === 'In_Kind'
    ? Number((calcTotalOilProducedKg * (calcRetentionPct / 100)).toFixed(1))
    : calcMethod === 'Mixed'
    ? Number(Math.max(0, (calcTotalOilProducedKg * (calcRetentionPct / 100)) - (calcMixedCashUSD / 6.0)).toFixed(1))
    : 0;

  const calcRetainedTins = Number((calcRetainedOilKg / 15.0).toFixed(1));
  const calcGrowerReleasedTins = Number(Math.max(0, calcTotalTins - calcRetainedTins).toFixed(1));

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handlePostSettlement = () => {
    const newVoucher: SettlementVoucher = {
      id: `SV-${Date.now()}`,
      voucherNumber: `SET-2026-${String(settlements.length + 82).padStart(4, '0')}`,
      date: '2026-09-22',
      ticketId: `ST-NEW`,
      ticketNumber: `TK-2026-${Math.floor(150 + Math.random() * 50)}`,
      farmerName: calcGrowerName.trim() || 'Grower Account',
      netOliveKg: calcNetOlivesKg,
      oilYieldKg: calcTotalOilProducedKg,
      tinCountTotal: calcTotalTins,
      method: calcMethod,
      cashAmountDueUSD: calcMethod === 'Cash' ? calcCashDueUSD : calcMethod === 'Mixed' ? calcMixedCashUSD : 0,
      cashAmountDueLBP: calcMethod === 'Cash' ? calcCashDueLBP : calcMethod === 'Mixed' ? Math.round(calcMixedCashUSD * 89500) : 0,
      retainedOilKg: calcRetainedOilKg,
      retainedTins: calcRetainedTins,
      growerReleasedTins: calcGrowerReleasedTins,
      paymentStatus: 'Paid'
    };

    setSettlements([newVoucher, ...settlements]);
    setSelectedVoucherForPrint(newVoucher);
    showToast(`Settlement voucher ${newVoucher.voucherNumber} created & posted.`);
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
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Triple Payment Settlement Engine</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated milling fee calculations, in-kind oil retention to mill silos, cash dues, and mixed payment split
          </p>
        </div>

        <button
          onClick={() => showToast('Exported settlement ledgers to XLSX.')}
          className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Export Ledger Statement</span>
        </button>
      </div>

      {/* INTERACTIVE SETTLEMENT ENGINE CONSOLE */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Settlement Calculation &amp; Yield Breakdown
            </h3>
          </div>

          {/* Triple Settlement Selector */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setCalcMethod('In_Kind')}
              className={`px-3 py-1 rounded font-medium transition ${
                calcMethod === 'In_Kind'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              In-Kind Oil Retention (الردة)
            </button>

            <button
              onClick={() => setCalcMethod('Cash')}
              className={`px-3 py-1 rounded font-medium transition ${
                calcMethod === 'Cash'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Cash Milling Fee
            </button>

            <button
              onClick={() => setCalcMethod('Mixed')}
              className={`px-3 py-1 rounded font-medium transition ${
                calcMethod === 'Mixed'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Mixed Split (Cash + Oil)
            </button>
          </div>
        </div>

        {/* Form parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Grower / Farmer Name</label>
            <input
              type="text"
              value={calcGrowerName}
              onChange={(e) => setCalcGrowerName(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Net Olives Weighed (KG)</label>
            <input
              type="number"
              value={calcNetOlivesKg}
              onChange={(e) => setCalcNetOlivesKg(Number(e.target.value) || 0)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500 font-semibold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Actual Extraction Yield (%)</label>
            <input
              type="number"
              step="0.1"
              value={calcActualYieldPct}
              onChange={(e) => setCalcActualYieldPct(Number(e.target.value) || 0)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500 font-semibold text-emerald-700"
            />
          </div>

          {calcMethod === 'In_Kind' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Retention Rate (%)</label>
              <input
                type="number"
                value={calcRetentionPct}
                onChange={(e) => setCalcRetentionPct(Number(e.target.value) || 0)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500"
              />
            </div>
          )}

          {calcMethod === 'Cash' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Cash Rate ($ USD / KG)</label>
              <input
                type="number"
                step="0.01"
                value={calcCashRateUSD}
                onChange={(e) => setCalcCashRateUSD(Number(e.target.value) || 0)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500"
              />
            </div>
          )}

          {calcMethod === 'Mixed' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Partial Cash Amount ($ USD)</label>
              <input
                type="number"
                value={calcMixedCashUSD}
                onChange={(e) => setCalcMixedCashUSD(Number(e.target.value) || 0)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500"
              />
            </div>
          )}
        </div>

        {/* Live Calculation Output Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
          <div className="bg-white p-2.5 rounded border border-slate-200">
            <span className="text-slate-400 block text-[10px]">Total Oil Produced</span>
            <span className="text-base font-bold text-slate-900">{calcTotalOilProducedKg.toLocaleString()} KG</span>
            <span className="text-[10px] text-slate-500 block">Total: ~{calcTotalTins} Standard Tins (15 KG)</span>
          </div>

          <div className="bg-white p-2.5 rounded border border-slate-200">
            <span className="text-slate-400 block text-[10px]">Mill Fee Deduction</span>
            {calcMethod === 'In_Kind' ? (
              <>
                <span className="text-base font-bold text-amber-700">{calcRetainedOilKg} KG Oil</span>
                <span className="text-[10px] text-slate-500 block">({calcRetainedTins} Tins to Mill Silo)</span>
              </>
            ) : calcMethod === 'Cash' ? (
              <>
                <span className="text-base font-bold text-emerald-700">${calcCashDueUSD} USD</span>
                <span className="text-[10px] text-slate-500 block">LBP {calcCashDueLBP.toLocaleString()}</span>
              </>
            ) : (
              <>
                <span className="text-base font-bold text-sky-700">${calcMixedCashUSD} + {calcRetainedOilKg} KG</span>
                <span className="text-[10px] text-slate-500 block">Mixed Split Paid</span>
              </>
            )}
          </div>

          <div className="bg-white p-2.5 rounded border border-slate-200">
            <span className="text-slate-400 block text-[10px]">Net Released to Grower</span>
            <span className="text-base font-bold text-emerald-800">
              {calcGrowerReleasedTins} Tins ({((calcGrowerReleasedTins * 15)).toFixed(1)} KG)
            </span>
            <span className="text-[10px] text-emerald-600 font-medium block">Ready for immediate gate pass</span>
          </div>

          <div className="flex items-center justify-center">
            <button
              onClick={handlePostSettlement}
              className="w-full h-full flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-lg shadow-xs transition"
            >
              <Save className="w-4 h-4" />
              <span>Post Settlement Voucher</span>
            </button>
          </div>
        </div>
      </div>

      {/* VOUCHER HISTORY TABLE */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Settled Milling Fee Ledgers</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                <th className="py-2.5 px-3">Voucher #</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Grower / Farmer</th>
                <th className="py-2.5 px-3">Net Olives</th>
                <th className="py-2.5 px-3">Oil Yield</th>
                <th className="py-2.5 px-3">Settlement Method</th>
                <th className="py-2.5 px-3">Mill Retained Oil</th>
                <th className="py-2.5 px-3">Grower Released Tins</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {settlements.map((sv) => (
                <tr key={sv.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-slate-900 font-mono">{sv.voucherNumber}</td>
                  <td className="py-2.5 px-3 text-slate-500">{sv.date}</td>
                  <td className="py-2.5 px-3 font-medium">{sv.farmerName}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{sv.netOliveKg.toLocaleString()} KG</td>
                  <td className="py-2.5 px-3 text-emerald-700 font-bold">{sv.oilYieldKg} KG ({sv.tinCountTotal} Tins)</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      sv.method === 'In_Kind' ? 'bg-amber-100 text-amber-800' :
                      sv.method === 'Cash' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {sv.method}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold">{sv.retainedOilKg > 0 ? `${sv.retainedOilKg} KG (${sv.retainedTins} Tins)` : '$' + sv.cashAmountDueUSD}</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-700">{sv.growerReleasedTins} Tins</td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => setSelectedVoucherForPrint(sv)}
                      className="text-slate-700 hover:text-slate-900 font-semibold"
                    >
                      Print Voucher
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINT VOUCHER MODAL */}
      {selectedVoucherForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 relative text-slate-800">
            <button
              onClick={() => setSelectedVoucherForPrint(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center border-b border-slate-200 pb-3 mb-3">
              <h2 className="text-base font-extrabold text-slate-900 uppercase">
                Southern Olive Oil Products S.A.R.L
              </h2>
              <p className="text-xs text-slate-500">Official Olive Pressing Settlement Voucher</p>
              <div className="mt-1 font-mono text-xs font-bold">{selectedVoucherForPrint.voucherNumber}</div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Grower Name:</span>
                  <span className="font-bold">{selectedVoucherForPrint.farmerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Net Olive Intake:</span>
                  <span className="font-mono">{selectedVoucherForPrint.netOliveKg.toLocaleString()} KG</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Oil Yield:</span>
                  <span className="font-bold text-emerald-700">{selectedVoucherForPrint.oilYieldKg} KG ({selectedVoucherForPrint.tinCountTotal} Tins)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Settlement Method:</span>
                  <span className="font-bold">{selectedVoucherForPrint.method}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1 font-bold">
                  <span>Released to Grower:</span>
                  <span className="text-emerald-800 font-mono">{selectedVoucherForPrint.growerReleasedTins} Tins (15 KG / 16L)</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedVoucherForPrint(null)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                  setSelectedVoucherForPrint(null);
                  showToast('Settlement voucher dispatched to printer.');
                }}
                className="flex items-center gap-1.5 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Voucher</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
