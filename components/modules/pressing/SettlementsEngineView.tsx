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
import { useLanguage } from '@/lib/LanguageContext';
import { useTenant } from '@/lib/TenantContext';
import { supabase } from '@/lib/supabase';

export default function SettlementsEngineView() {
  const { t } = useLanguage();
  const { currentTenant } = useTenant();
  const [settlements, setSettlements] = useState<SettlementVoucher[]>(INITIAL_SETTLEMENTS);

  // Initial mount hydration from Supabase
  React.useEffect(() => {
    async function loadPersistedSettlements() {
      try {
        const targetId = (currentTenant?.id && currentTenant.id !== '1300' && !currentTenant.id.startsWith('comp-'))
          ? currentTenant.id
          : '00000000-0000-0000-0000-000000000001';

        const { data, error } = await supabase
          .from('tenants')
          .select('feature_flags')
          .eq('id', targetId)
          .maybeSingle();

        if (data?.feature_flags?.olive_mill_settlements && Array.isArray(data.feature_flags.olive_mill_settlements) && data.feature_flags.olive_mill_settlements.length > 0) {
          setSettlements(data.feature_flags.olive_mill_settlements);
        }
      } catch (err) {
        console.warn('Notice loading settlements from database:', err);
      }
    }
    loadPersistedSettlements();
  }, [currentTenant?.id]);

  const persistSettlementsToDatabase = async (newSettlements: SettlementVoucher[]): Promise<{ success: boolean; error?: string }> => {
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
            olive_mill_settlements: newSettlements
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

  const handlePostSettlement = async () => {
    const newVoucher: SettlementVoucher = {
      id: `SV-${Date.now()}`,
      voucherNumber: `SET-2026-${String(settlements.length + 82).padStart(4, '0')}`,
      date: new Date().toISOString().split('T')[0],
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

    const updated = [newVoucher, ...settlements];
    const res = await persistSettlementsToDatabase(updated);
    if (!res.success) {
      showToast(`Database persistence failed: ${res.error}`);
      return;
    }

    setSettlements(updated);
    setSelectedVoucherForPrint(newVoucher);
    showToast(`Settlement voucher ${newVoucher.voucherNumber} created & posted to database.`);
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
            <h2 className="text-base font-bold text-slate-900">
              {t('pm_settlements', 'Triple Payment Settlement Engine')}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('settlements_sub', 'Automated milling fee calculations, in-kind oil retention to mill silos, cash dues, and mixed payment split')}
          </p>
        </div>

        <button
          onClick={() => showToast(t('exported_settlements_msg', 'Exported settlement ledgers to XLSX.'))}
          className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded shadow-xs cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{t('export_ledger_statement', 'Export Ledger Statement')}</span>
        </button>
      </div>

      {/* INTERACTIVE SETTLEMENT ENGINE CONSOLE */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {t('settlement_calc_title', 'Settlement Calculation & Yield Breakdown')}
            </h3>
          </div>

          {/* Triple Settlement Selector */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setCalcMethod('In_Kind')}
              className={`px-3 py-1 rounded font-medium transition cursor-pointer ${
                calcMethod === 'In_Kind'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t('in_kind_retention', 'In-Kind Oil Retention (Retention %)')}
            </button>

            <button
              onClick={() => setCalcMethod('Cash')}
              className={`px-3 py-1 rounded font-medium transition cursor-pointer ${
                calcMethod === 'Cash'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t('cash_milling_fee', 'Cash Milling Fee')}
            </button>

            <button
              onClick={() => setCalcMethod('Mixed')}
              className={`px-3 py-1 rounded font-medium transition cursor-pointer ${
                calcMethod === 'Mixed'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t('mixed_split_cash_oil', 'Mixed Split (Cash + Oil)')}
            </button>
          </div>
        </div>

        {/* Form parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">{t('farmer_grower', 'Grower / Farmer Name')}</label>
            <input
              type="text"
              value={calcGrowerName}
              onChange={(e) => setCalcGrowerName(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">{t('net_olives_weighed_kg', 'Net Olives Weighed (KG)')}</label>
            <input
              type="number"
              value={calcNetOlivesKg}
              onChange={(e) => setCalcNetOlivesKg(Number(e.target.value) || 0)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500 font-semibold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">{t('actual_extraction_yield', 'Actual Extraction Yield (%)')}</label>
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
              <label className="block font-semibold text-slate-700 mb-1">{t('retention_rate_pct', 'Retention Rate (%)')}</label>
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
              <label className="block font-semibold text-slate-700 mb-1">{t('cash_rate_usd_kg', 'Cash Rate ($ USD / KG)')}</label>
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
              <label className="block font-semibold text-slate-700 mb-1">{t('partial_cash_amount_usd', 'Partial Cash Amount ($ USD)')}</label>
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
            <span className="text-slate-400 block text-[10px]">{t('total_oil_produced', 'Total Oil Produced')}</span>
            <span className="text-base font-bold text-slate-900">{calcTotalOilProducedKg.toLocaleString()} KG</span>
            <span className="text-[10px] text-slate-500 block">
              {t('total_label', 'Total:')} ~{calcTotalTins} {t('standard_tins_15kg', 'Standard Tins (15 KG)')}
            </span>
          </div>

          <div className="bg-white p-2.5 rounded border border-slate-200">
            <span className="text-slate-400 block text-[10px]">{t('mill_fee_deduction', 'Mill Fee Deduction')}</span>
            {calcMethod === 'In_Kind' ? (
              <>
                <span className="text-base font-bold text-amber-700">{calcRetainedOilKg} KG {t('oil_word', 'Oil')}</span>
                <span className="text-[10px] text-slate-500 block">({calcRetainedTins} {t('tins_to_mill_silo', 'Tins to Mill Silo')})</span>
              </>
            ) : calcMethod === 'Cash' ? (
              <>
                <span className="text-base font-bold text-emerald-700">${calcCashDueUSD} USD</span>
                <span className="text-[10px] text-slate-500 block">LBP {calcCashDueLBP.toLocaleString()}</span>
              </>
            ) : (
              <>
                <span className="text-base font-bold text-sky-700">${calcMixedCashUSD} + {calcRetainedOilKg} KG</span>
                <span className="text-[10px] text-slate-500 block">{t('mixed_split_paid', 'Mixed Split Paid')}</span>
              </>
            )}
          </div>

          <div className="bg-white p-2.5 rounded border border-slate-200">
            <span className="text-slate-400 block text-[10px]">{t('net_released_to_grower', 'Net Released to Grower')}</span>
            <span className="text-base font-bold text-emerald-800">
              {calcGrowerReleasedTins} {t('tins_word', 'Tins')} ({((calcGrowerReleasedTins * 15)).toFixed(1)} KG)
            </span>
            <span className="text-[10px] text-emerald-600 font-medium block">
              {t('ready_for_gate_pass', 'Ready for immediate gate pass')}
            </span>
          </div>

          <div className="flex items-center justify-center">
            <button
              onClick={handlePostSettlement}
              className="w-full h-full flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-lg shadow-xs transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{t('post_settlement_voucher', 'Post Settlement Voucher')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* VOUCHER HISTORY TABLE */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">{t('settled_milling_ledgers', 'Settled Milling Fee Ledgers')}</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                <th className="py-2.5 px-3">{t('voucher_num', 'Voucher #')}</th>
                <th className="py-2.5 px-3">{t('date', 'Date')}</th>
                <th className="py-2.5 px-3">{t('farmer_grower', 'Grower / Farmer')}</th>
                <th className="py-2.5 px-3">{t('net_olives', 'Net Olives')}</th>
                <th className="py-2.5 px-3">{t('oil_yield', 'Oil Yield')}</th>
                <th className="py-2.5 px-3">{t('settlement_method_label', 'Settlement Method')}</th>
                <th className="py-2.5 px-3">{t('mill_retained_oil', 'Mill Retained Oil')}</th>
                <th className="py-2.5 px-3">{t('grower_released_tins', 'Grower Released Tins')}</th>
                <th className="py-2.5 px-3 text-right">{t('action', 'Action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {settlements.map((sv) => (
                <tr key={sv.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-slate-900 font-mono">{sv.voucherNumber}</td>
                  <td className="py-2.5 px-3 text-slate-500">{sv.date}</td>
                  <td className="py-2.5 px-3 font-medium">{sv.farmerName}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{sv.netOliveKg.toLocaleString()} KG</td>
                  <td className="py-2.5 px-3 text-emerald-700 font-bold">
                    {sv.oilYieldKg} KG ({sv.tinCountTotal} {t('tins_word', 'Tins')})
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      sv.method === 'In_Kind' ? 'bg-amber-100 text-amber-800' :
                      sv.method === 'Cash' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {t(sv.method, sv.method)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold">
                    {sv.retainedOilKg > 0 ? `${sv.retainedOilKg} KG (${sv.retainedTins} ${t('tins_word', 'Tins')})` : '$' + sv.cashAmountDueUSD}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-emerald-700">
                    {sv.growerReleasedTins} {t('tins_word', 'Tins')}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => setSelectedVoucherForPrint(sv)}
                      className="text-slate-700 hover:text-slate-900 font-semibold cursor-pointer"
                    >
                      {t('print_voucher', 'Print Voucher')}
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
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center border-b border-slate-200 pb-3 mb-3">
              <h2 className="text-base font-extrabold text-slate-900 uppercase">
                {t('company_name_long', 'Southern Olive Oil Products S.A.R.L')}
              </h2>
              <p className="text-xs text-slate-500">
                {t('settlement_voucher_subtitle', 'Official Olive Pressing Settlement Voucher')}
              </p>
              <div className="mt-1 font-mono text-xs font-bold">{selectedVoucherForPrint.voucherNumber}</div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('grower_name_label', 'Grower Name:')}</span>
                  <span className="font-bold">{selectedVoucherForPrint.farmerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('net_olive_intake_label', 'Net Olive Intake:')}</span>
                  <span className="font-mono">{selectedVoucherForPrint.netOliveKg.toLocaleString()} KG</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('total_oil_yield_label', 'Total Oil Yield:')}</span>
                  <span className="font-bold text-emerald-700">
                    {selectedVoucherForPrint.oilYieldKg} KG ({selectedVoucherForPrint.tinCountTotal} {t('tins_word', 'Tins')})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('settlement_method_label', 'Settlement Method:')}</span>
                  <span className="font-bold">{t(selectedVoucherForPrint.method, selectedVoucherForPrint.method)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1 font-bold">
                  <span>{t('released_to_grower_label', 'Released to Grower:')}</span>
                  <span className="text-emerald-800 font-mono">
                    {selectedVoucherForPrint.growerReleasedTins} {t('standard_tins_15kg', 'Standard Tins (15 KG / 16L)')}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedVoucherForPrint(null)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded text-xs font-semibold cursor-pointer"
              >
                {t('close', 'Close')}
              </button>
              <button
                onClick={() => {
                  window.print();
                  setSelectedVoucherForPrint(null);
                  showToast(t('voucher_dispatched_printer', 'Settlement voucher dispatched to printer.'));
                }}
                className="flex items-center gap-1.5 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t('print_voucher', 'Print Voucher')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
