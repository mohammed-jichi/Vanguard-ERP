'use client';

import React from 'react';
import UnifiedPrintableReportSheet, { StandardReportFooter } from '../UnifiedPrintableReportSheet';
import { formatCurrencyAmount } from '@/lib/currencyEngine';
import { aggregateCategories, aggregateDiscounts, LiveInvoice } from '@/lib/liveSalesReportsData';

const usd = (n: number) => formatCurrencyAmount(n, 'USD', false);

interface BlockProps {
  invoices: LiveInvoice[];
  loading?: boolean;
  periodText?: string;
  executionDate?: string;
}

/** Summary of Discount: strictly aggregated from live POSTED invoices with discount > 0. */
export const LiveSummaryOfDiscount: React.FC<BlockProps> = ({ invoices, loading, periodText, executionDate }) => {
  const rows = React.useMemo(() => aggregateDiscounts(invoices), [invoices]);
  const branches = Array.from(new Set(rows.map((r) => r.branch)));
  const grand = rows.reduce((s, r) => s + r.discountUsd, 0);

  return (
    <div className="w-full max-w-5xl mx-auto p-4 bg-white font-sans text-black">
      <div className="text-center font-bold text-[12px] mb-4">Summary of Discount</div>
      <div className="flex justify-between items-center text-[11px] font-bold mb-1">
        <div>{executionDate}</div>
        <div className="text-center">{periodText}</div>
        <div className="text-right">Page 1 of 1</div>
      </div>
      <div className="border-t-[2px] border-b-[2px] border-black py-1.5 mb-2">
        <div className="grid grid-cols-[1.4fr_0.9fr_1.6fr_1fr_1fr_1fr] gap-2 text-[11px] font-bold">
          <div>Invoice</div>
          <div>Date</div>
          <div>Customer</div>
          <div className="text-right">Subtotal (USD)</div>
          <div className="text-right">Discount (USD)</div>
          <div className="text-right">Discount %</div>
        </div>
      </div>

      {rows.length === 0 && (
        <div className="py-6 text-center text-[11px] text-slate-500 italic">
          {loading ? 'Loading posted invoices...' : 'No posted invoices with a discount in the selected period.'}
        </div>
      )}

      {branches.map((b) => {
        const br = rows.filter((r) => r.branch === b);
        return (
          <div key={b} className="mb-3">
            <div className="text-[11px] mb-1 font-bold">Branch: {b}</div>
            {br.map((r) => (
              <div key={r.invoice} className="grid grid-cols-[1.4fr_0.9fr_1.6fr_1fr_1fr_1fr] gap-2 text-[11px] mb-0.5 font-mono">
                <div className="font-bold">{r.invoice}</div>
                <div>{r.day}</div>
                <div className="font-sans">{r.customer || '-'}</div>
                <div className="text-right">{usd(r.subtotalUsd)}</div>
                <div className="text-right font-bold">{usd(r.discountUsd)}</div>
                <div className="text-right">{r.subtotalUsd > 0 ? ((r.discountUsd / r.subtotalUsd) * 100).toFixed(2) : '0.00'}%</div>
              </div>
            ))}
            <div className="flex justify-between text-[11px] font-bold border-t border-black mt-1 pt-1">
              <div>Total By Branch</div>
              <div className="font-mono">{usd(br.reduce((s, r) => s + r.discountUsd, 0))}</div>
            </div>
          </div>
        );
      })}

      <div className="flex justify-between text-[12px] font-bold border-t-2 border-black mt-3 pt-1.5">
        <div>Grand Total ({rows.length} invoices)</div>
        <div className="font-mono">{usd(grand)} USD</div>
      </div>
      <div className="border-t-2 border-slate-900 pt-2.5 mt-8 flex items-center justify-between text-[10px] text-slate-600 select-none">
        <div className="font-mono font-bold text-slate-800 tracking-wider">REP_S_00214</div>
        <div className="font-medium text-slate-500">Copyright © 2026 Vanguard ERP. All Rights Reserved.</div>
        <div className="font-mono">www.vanguard-erp.net</div>
      </div>
    </div>
  );
};

/** Sales By Category: true category aggregation from live POSTED invoice line items. */
export const LiveSalesByCategory: React.FC<BlockProps> = ({ invoices, loading, periodText, executionDate }) => {
  const { rows, invoicesWithoutLines } = React.useMemo(() => aggregateCategories(invoices), [invoices]);
  const tot = rows.reduce(
    (a, r) => ({ items: a.items + r.itemsSold, gross: a.gross + r.grossUsd, disc: a.disc + r.discountUsd, net: a.net + r.netUsd }),
    { items: 0, gross: 0, disc: 0, net: 0 }
  );

  return (
    <UnifiedPrintableReportSheet
      reportTitle="Sales By Category"
      reportCode="REP_S_00266"
      executionDate={executionDate || ''}
      periodText={periodText || ''}
      pageInfo="Page 1 of 1"
      branchInfo="Live posted invoices"
      hideToolbar={true}
    >
      <table className="w-full table-fixed text-left border-collapse text-[11px]">
        <thead>
          <tr className="border-b-2 border-slate-900 font-bold text-black leading-tight bg-slate-50">
            <th className="py-2 px-2 normal-case w-[30%] font-sans">category name</th>
            <th className="py-2 px-2 normal-case w-[12%] font-sans text-right">items sold</th>
            <th className="py-2 px-2 normal-case w-[18%] font-sans text-right">gross sales (USD)</th>
            <th className="py-2 px-2 normal-case w-[15%] font-sans text-right">discounts (USD)</th>
            <th className="py-2 px-2 normal-case w-[15%] font-sans text-right">net sales (USD)</th>
            <th className="py-2 px-2 normal-case w-[10%] font-sans text-right">% share</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-medium text-[10.5px]">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-slate-500 italic">
                {loading ? 'Loading posted invoices...' : 'No posted invoice line items in the selected period.'}
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r.category} className="hover:bg-slate-50">
                <td className="py-2 px-2 font-bold text-slate-900 font-sans">{r.category}</td>
                <td className="py-2 px-2 text-right font-mono">{r.itemsSold.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
                <td className="py-2 px-2 text-right font-mono">{usd(r.grossUsd)}</td>
                <td className="py-2 px-2 text-right font-mono text-red-700">{usd(r.discountUsd)}</td>
                <td className="py-2 px-2 text-right font-mono font-bold">{usd(r.netUsd)}</td>
                <td className="py-2 px-2 text-right font-mono text-blue-700">{r.sharePct.toFixed(1)}%</td>
              </tr>
            ))
          )}
          {rows.length > 0 && (
            <tr className="bg-blue-50 font-bold border-t-2 border-black">
              <td className="py-2 px-2 font-sans">Total</td>
              <td className="py-2 px-2 text-right font-mono">{tot.items.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
              <td className="py-2 px-2 text-right font-mono">{usd(tot.gross)}</td>
              <td className="py-2 px-2 text-right font-mono text-red-700">{usd(tot.disc)}</td>
              <td className="py-2 px-2 text-right font-mono">{usd(tot.net)}</td>
              <td className="py-2 px-2 text-right font-mono">{rows.length > 0 ? '100.0%' : ''}</td>
            </tr>
          )}
        </tbody>
      </table>
      {invoicesWithoutLines > 0 && (
        <div className="mt-2 text-[10px] text-slate-500 italic">
          {invoicesWithoutLines} posted invoice(s) carry no line items and are excluded from category totals.
        </div>
      )}
    </UnifiedPrintableReportSheet>
  );
};
