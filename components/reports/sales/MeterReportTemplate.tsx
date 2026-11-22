'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useTenant } from '@/lib/TenantContext';
import MasterReportDocument from '@/components/reports/MasterReportDocument';
import { ReportMetadata, ReportColumn, ReportSection, GrandTotal } from '@/types/reports';
import { resolveActiveCurrencyFromFilters } from '@/lib/reportFilterEngine';
import { convertCurrency, formatCurrencyAmount } from '@/lib/currencyEngine';
import { parseDateToIso } from '@/lib/duplicateInvoicesQueryEngine';
import { CheckCircle2, AlertCircle, Hash, DollarSign, Layers, Printer, FileDown, ArrowUpDown } from 'lucide-react';

/**
 * ============================================================================
 * METER AUDIT REGISTER DATA CONTRACT (REP_S_00189)
 * ============================================================================
 */
export interface MeterAuditRecord {
  id: string;
  terminal: string; // e.g., 'POS-01'
  terminalName: string; // e.g., 'Front Register'
  shiftBatch: string; // 'SHIFT_1' | 'SHIFT_2' | 'SHIFT_3' | 'Z_FINAL' | 'X_READING'
  shiftBatchLabel: string; // 'Shift 1 (#101)' | 'Z-Final (#Z-9042)'
  date: string; // '2026-09-06'
  dateFormatted: string; // '06-Sep-2026'
  meterCode: string; // 'MTR_INV_COUNT' | 'MTR_DRAWER_POPS' | 'MTR_VOIDS' | 'MTR_REFUNDS' | 'MTR_CUMULATIVE_SALES' | ...
  meterDescription: string; // Display description
  meterCategory: 'transaction' | 'security' | 'financial' | 'tax';
  startReading: number; // Opening reading
  endReading: number; // Closing reading
  delta: number; // endReading - startReading
  isCurrency: boolean; // Whether start/end are currency values
  amountValue?: number; // Associated financial value in USD where applicable
  currency?: string;
  branch: string;
  notes?: string;
}

export interface MeterReportTemplateProps {
  hideToolbar?: boolean;
  dynamicPeriodText?: string;
  executionDate?: string;
  branch?: string;
  fromDate?: string;
  toDate?: string;
  filterValues?: Record<string, any>;
  reportTitle?: string;
  code?: string;
}

/**
 * Live meter audit register derived from POSTED sales invoices of the active tenant
 * (invoice counter + cumulative sales meters per terminal/day/branch).
 */
async function loadLiveMeterRecords(tenantId: string): Promise<MeterAuditRecord[]> {
  try {
    const { data, error } = await supabase
      .from('sales_invoices')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_posted', true)
      .order('created_at', { ascending: true })
      .limit(5000);
    if (error || !Array.isArray(data)) return [];

    const groups = new Map<string, any[]>();
    for (const inv of data) {
      const iso = String(inv.date || inv.created_at || new Date().toISOString()).slice(0, 10);
      const branch = inv.branch || inv.branch_name || 'Main Branch';
      const terminal = inv.terminal || inv.workstation || 'POS-01';
      const key = `${iso}|${branch}|${terminal}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(inv);
    }

    const records: MeterAuditRecord[] = [];
    let cumulativeCount = 0;
    let cumulativeSales = 0;
    let idx = 0;
    for (const [key, invs] of groups) {
      const [iso, branch, terminal] = key.split('|');
      const dayTotal = invs.reduce((s, i) => s + (Number(i.amount_usd ?? i.total_amount ?? i.grand_total ?? 0) || 0), 0);
      const d = new Date(iso + 'T00:00:00');
      const dateFormatted = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
      const base = {
        terminal,
        terminalName: terminal,
        shiftBatch: 'Z_FINAL',
        shiftBatchLabel: `Z-Final (${iso})`,
        date: iso,
        dateFormatted,
        branch,
        currency: 'USD',
      };
      records.push({
        ...base,
        id: `MTR-LIVE-${++idx}`,
        meterCode: 'MTR_INV_COUNT',
        meterDescription: 'Invoices Issued',
        meterCategory: 'transaction',
        startReading: cumulativeCount,
        endReading: cumulativeCount + invs.length,
        delta: invs.length,
        isCurrency: false,
        amountValue: Math.round(dayTotal * 100) / 100,
      });
      cumulativeCount += invs.length;
      records.push({
        ...base,
        id: `MTR-LIVE-${++idx}`,
        meterCode: 'MTR_CUMULATIVE_SALES',
        meterDescription: 'Cumulative Posted Sales',
        meterCategory: 'financial',
        startReading: Math.round(cumulativeSales * 100) / 100,
        endReading: Math.round((cumulativeSales + dayTotal) * 100) / 100,
        delta: Math.round(dayTotal * 100) / 100,
        isCurrency: true,
        amountValue: Math.round(dayTotal * 100) / 100,
      });
      cumulativeSales += dayTotal;
    }
    return records;
  } catch {
    return [];
  }
}


/**
 * ============================================================================
 * METER REPORT REGISTER COMPONENT (REP_S_00189)
 * ============================================================================
 */
export const MeterReportTemplate: React.FC<MeterReportTemplateProps> = ({
  hideToolbar = false,
  dynamicPeriodText,
  executionDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
  branch = 'Southern Olive and Oil Products - Main',
  fromDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
  toDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
  filterValues = {},
  reportTitle = 'Meter & Shift Reading Register (Z-Report Audit)',
  code = 'REP_S_00189',
}) => {
  const [viewMode, setViewMode] = useState<'grouped' | 'flat'>('grouped');
  const { currentTenant } = useTenant();
  const [liveRecords, setLiveRecords] = useState<MeterAuditRecord[]>([]);
  const meterTenantId = (currentTenant?.id && currentTenant.id !== '1300' && !String(currentTenant.id).startsWith('comp-')) ? currentTenant.id : '00000000-0000-0000-0000-000000000001';
  useEffect(() => {
    let cancelled = false;
    loadLiveMeterRecords(meterTenantId).then((rows) => { if (!cancelled) setLiveRecords(rows); });
    return () => { cancelled = true; };
  }, [meterTenantId]);

  const cleanPeriod = useMemo(() => {
    if (dynamicPeriodText) {
      return dynamicPeriodText
        .replace(/^Audit Window:\s*/i, '')
        .replace(/^Period:\s*/i, '')
        .replace(/^Date:\s*/i, '');
    }
    return `${fromDate} to ${toDate}`;
  }, [dynamicPeriodText, fromDate, toDate]);

  const activeCurrency = useMemo(() => {
    return resolveActiveCurrencyFromFilters(filterValues, 'USD');
  }, [filterValues]);

  const secondaryCurrency = activeCurrency === 'LBP' ? 'USD' : 'LBP';

  // Dynamic filter summary
  const filterSummary = useMemo(() => {
    const parts: string[] = [];
    const b = filterValues.branch || branch;
    if (b && b !== 'ALL' && b !== 'All Branches') parts.push(`Branch: ${b}`);
    if (filterValues.workstation && filterValues.workstation !== 'ALL') {
      parts.push(`Terminal: ${filterValues.workstation}`);
    }
    if (filterValues.shiftBatch && filterValues.shiftBatch !== 'ALL') {
      parts.push(`Shift: ${filterValues.shiftBatch}`);
    }
    if (filterValues.currency && filterValues.currency !== 'ALL') {
      parts.push(`Cur: ${filterValues.currency}`);
    }
    return parts.length > 0 ? parts.join(' | ') : undefined;
  }, [filterValues, branch]);

  // Global Filter Pipeline
  const filteredRows = useMemo(() => {
    return liveRecords.filter((rec) => {
      // 1. Branch filter
      const activeBranch = filterValues.branch || branch;
      if (activeBranch && activeBranch !== 'ALL' && activeBranch !== 'All Branches') {
        const matchBranch =
          rec.branch.toLowerCase().includes(activeBranch.toLowerCase()) ||
          activeBranch.toLowerCase().includes(rec.branch.toLowerCase());
        if (!matchBranch) return false;
      }

      // 2. Terminal / Workstation filter
      const activeWs = filterValues.workstation;
      if (activeWs && activeWs !== 'ALL') {
        const matchesTerminal =
          rec.terminal.toLowerCase() === activeWs.toLowerCase() ||
          rec.terminalName.toLowerCase().includes(activeWs.toLowerCase());
        if (!matchesTerminal) return false;
      }

      // 3. Shift / Batch filter
      const activeShift = filterValues.shiftBatch;
      if (activeShift && activeShift !== 'ALL') {
        const matchesShift =
          rec.shiftBatch.toLowerCase() === activeShift.toLowerCase() ||
          rec.shiftBatchLabel.toLowerCase().includes(activeShift.toLowerCase());
        if (!matchesShift) return false;
      }

      // 4. Date Range filter
      const recIso = parseDateToIso(rec.date);
      if (fromDate && recIso) {
        const fromIso = parseDateToIso(fromDate);
        if (fromIso && recIso < fromIso) return false;
      }
      if (toDate && recIso) {
        const toIso = parseDateToIso(toDate);
        if (toIso && recIso > toIso) return false;
      }

      // 5. Search Query
      const q = (filterValues.searchQuery || '').toLowerCase().trim();
      if (q) {
        const matchQuery =
          rec.terminal.toLowerCase().includes(q) ||
          rec.terminalName.toLowerCase().includes(q) ||
          rec.shiftBatchLabel.toLowerCase().includes(q) ||
          rec.meterDescription.toLowerCase().includes(q) ||
          rec.meterCode.toLowerCase().includes(q) ||
          rec.branch.toLowerCase().includes(q);
        if (!matchQuery) return false;
      }

      return true;
    });
  }, [liveRecords, filterValues, branch, fromDate, toDate]);

  // Aggregate Key Metrics for Meter Summary
  const { totalDeltaEvents, totalMonetaryDelta, totalInvoicesIssued, totalDrawerPops, totalVoids } = useMemo(() => {
    return filteredRows.reduce(
      (acc, r) => {
        if (!r.isCurrency) {
          acc.totalDeltaEvents += r.delta;
        }
        if (r.amountValue) {
          acc.totalMonetaryDelta += r.amountValue;
        }
        if (r.meterCode === 'MTR_INV_COUNT') {
          acc.totalInvoicesIssued += r.delta;
        }
        if (r.meterCode === 'MTR_DRAWER_POPS') {
          acc.totalDrawerPops += r.delta;
        }
        if (r.meterCode === 'MTR_VOIDS') {
          acc.totalVoids += r.delta;
        }
        return acc;
      },
      {
        totalDeltaEvents: 0,
        totalMonetaryDelta: 0,
        totalInvoicesIssued: 0,
        totalDrawerPops: 0,
        totalVoids: 0,
      }
    );
  }, [filteredRows]);

  // Report Document Metadata
  const meta: ReportMetadata = useMemo(() => ({
    companyName: 'Southern Olive Oil S.A.R.L.',
    subtitle: 'Fiscal Cash Register Reading Log & Shift Audit',
    reportTitle,
    code,
    dateRange: cleanPeriod,
    generatedDate: executionDate,
    branch: branch,
    filterSummary,
    systemSource: 'Vanguard ERP Fiscal Security Kernel (REP_S_00189)',
    pageNumber: 1,
    totalPages: 1,
  }), [reportTitle, code, cleanPeriod, executionDate, branch, filterSummary]);

  /**
   * ==========================================================================
   * MANDATORY 7 COLUMNS SCHEMA FOR REP_S_00189:
   * 1. Terminal / POS#
   * 2. Shift / Batch#
   * 3. Meter Description
   * 4. Start Reading (Opening)
   * 5. End Reading (Closing)
   * 6. Delta / Activity (End - Start)
   * 7. Amount / Value (where applicable)
   * ==========================================================================
   */
  const columns: ReportColumn<MeterAuditRecord>[] = useMemo(() => [
    {
      key: 'terminal',
      label: 'Terminal / POS#',
      align: 'left',
      width: '13%',
      isMonospace: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-mono font-bold text-slate-900 text-xs">
            {row.terminal}
          </span>
          <span className="text-[10.5px] text-slate-500 font-sans leading-tight">
            {row.terminalName}
          </span>
        </div>
      ),
    },
    {
      key: 'shiftBatch',
      label: 'Shift / Batch#',
      align: 'left',
      width: '15%',
      render: (row) => (
        <div className="flex flex-col">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200 w-fit">
            {row.shiftBatchLabel}
          </span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5">
            {row.dateFormatted}
          </span>
        </div>
      ),
    },
    {
      key: 'meterDescription',
      label: 'Meter Description',
      align: 'left',
      width: '24%',
      render: (row) => {
        let badgeColor = 'text-slate-800';
        let subBadge = null;

        if (row.meterCode === 'MTR_INV_COUNT') {
          badgeColor = 'text-blue-900 font-bold';
          subBadge = (
            <span className="ml-1.5 px-1.5 py-0.2 rounded text-[9.5px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
              Tax Invoice
            </span>
          );
        } else if (row.meterCode === 'MTR_DRAWER_POPS') {
          badgeColor = 'text-amber-900 font-bold';
          subBadge = (
            <span className="ml-1.5 px-1.5 py-0.2 rounded text-[9.5px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
              Security
            </span>
          );
        } else if (row.meterCode === 'MTR_VOIDS') {
          badgeColor = 'text-rose-900 font-bold';
          subBadge = (
            <span className="ml-1.5 px-1.5 py-0.2 rounded text-[9.5px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200">
              Void
            </span>
          );
        } else if (row.meterCode === 'MTR_REFUNDS') {
          badgeColor = 'text-purple-900 font-bold';
          subBadge = (
            <span className="ml-1.5 px-1.5 py-0.2 rounded text-[9.5px] font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200">
              Return
            </span>
          );
        } else if (row.meterCode === 'MTR_CUMULATIVE_SALES') {
          badgeColor = 'text-emerald-950 font-black';
          subBadge = (
            <span className="ml-1.5 px-1.5 py-0.2 rounded text-[9.5px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
              Grand Totalizer
            </span>
          );
        }

        return (
          <div className="flex flex-col">
            <div className="flex items-center flex-wrap">
              <span className={`text-xs ${badgeColor}`}>{row.meterDescription}</span>
              {subBadge}
            </div>
            {row.notes && (
              <span className="text-[10px] text-slate-500 font-sans italic mt-0.5">
                {row.notes}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'startReading',
      label: 'Start Reading (Opening)',
      align: 'right',
      width: '12%',
      isMonospace: true,
      render: (row) => (
        <span className="font-mono text-xs text-slate-700 tabular-nums">
          {row.isCurrency
            ? formatCurrencyAmount(
                convertCurrency(row.startReading, row.currency || 'USD', activeCurrency),
                activeCurrency,
                true
              )
            : row.startReading.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'endReading',
      label: 'End Reading (Closing)',
      align: 'right',
      width: '12%',
      isMonospace: true,
      render: (row) => (
        <span className="font-mono text-xs font-bold text-slate-950 tabular-nums">
          {row.isCurrency
            ? formatCurrencyAmount(
                convertCurrency(row.endReading, row.currency || 'USD', activeCurrency),
                activeCurrency,
                true
              )
            : row.endReading.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'delta',
      label: 'Delta / Activity',
      align: 'right',
      width: '12%',
      isMonospace: true,
      render: (row) => {
        const isPositive = row.delta > 0;
        const colorClass =
          row.meterCategory === 'security' && isPositive
            ? 'text-amber-700 bg-amber-50/70 px-1.5 py-0.5 rounded border border-amber-200'
            : isPositive
            ? 'text-emerald-700 font-bold bg-emerald-50/70 px-1.5 py-0.5 rounded border border-emerald-200'
            : 'text-slate-600';

        return (
          <span className={`font-mono text-xs tabular-nums ${colorClass}`}>
            {isPositive ? '+' : ''}
            {row.isCurrency
              ? formatCurrencyAmount(
                  convertCurrency(row.delta, row.currency || 'USD', activeCurrency),
                  activeCurrency,
                  true
                )
              : row.delta.toLocaleString()}
          </span>
        );
      },
    },
    {
      key: 'amountValue',
      label: 'Amount / Value',
      align: 'right',
      width: '12%',
      isMonospace: true,
      render: (row) => {
        if (row.amountValue === undefined || row.amountValue === null) {
          return <span className="text-slate-400 font-sans font-normal">â€”</span>;
        }

        const converted = convertCurrency(row.amountValue, row.currency || 'USD', activeCurrency);
        return (
          <div className="flex flex-col items-end">
            <span className="font-mono text-xs font-extrabold text-slate-950 tabular-nums">
              {formatCurrencyAmount(converted, activeCurrency, true)}
            </span>
            {activeCurrency === 'LBP' && (
              <span className="text-[9.5px] font-mono text-slate-500">
                (${row.amountValue.toFixed(2)})
              </span>
            )}
          </div>
        );
      },
    },
  ], [activeCurrency]);

  // Section Grouping: Grouped by Terminal / Workstation
  const sections: ReportSection<MeterAuditRecord>[] = useMemo(() => {
    if (viewMode !== 'grouped') return [];

    const map: Record<string, MeterAuditRecord[]> = {};
    filteredRows.forEach((row) => {
      const key = `${row.terminal} (${row.terminalName})`;
      if (!map[key]) map[key] = [];
      map[key].push(row);
    });

    return Object.entries(map).map(([terminalLabel, rows]) => {
      const terminalRevenue = rows.reduce((sum, r) => sum + (r.amountValue || 0), 0);
      const convertedRev = convertCurrency(terminalRevenue, 'USD', activeCurrency);

      return {
        title: `Workstation Terminal: ${terminalLabel} â€¢ ${rows.length} Audited Meter Counters`,
        type: 'revenue',
        rows,
        subtotal: {
          label: `Subtotal for ${terminalLabel} [Total Audited Financial Activity]`,
          value: formatCurrencyAmount(convertedRev, activeCurrency, true),
        },
      };
    });
  }, [filteredRows, viewMode, activeCurrency]);

  // Grand Total Summary
  const grandTotal: GrandTotal = useMemo(() => {
    const convertedGrand = convertCurrency(totalMonetaryDelta, 'USD', activeCurrency);
    const convertedSecondary = convertCurrency(totalMonetaryDelta, 'USD', secondaryCurrency);

    return {
      label: `Grand Total - Meter & Shift Audit Register (${filteredRows.length} Totalizers Audited)`,
      value: formatCurrencyAmount(convertedGrand, activeCurrency, true),
      targetCurrency: activeCurrency,
      breakdownText: `${totalInvoicesIssued} Invoices Issued â€¢ ${totalDrawerPops} No-Sale Drawer Pops â€¢ ${totalVoids} Voids â€¢ ${totalDeltaEvents} Non-Monetary Meter Ticks`,
      convertedSubtext: `Secondary Consolidated Valuation: ${formatCurrencyAmount(convertedSecondary, secondaryCurrency, true)}`,
    };
  }, [filteredRows.length, totalMonetaryDelta, totalInvoicesIssued, totalDrawerPops, totalVoids, totalDeltaEvents, activeCurrency, secondaryCurrency]);

  return (
    <div className="w-full space-y-4">
      {/* Interactive Controls & View Mode Selector */}
      {!hideToolbar && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Display Mode:
            </span>
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
              <button
                onClick={() => setViewMode('grouped')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  viewMode === 'grouped'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Grouped by Terminal
              </button>
              <button
                onClick={() => setViewMode('flat')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  viewMode === 'flat'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Flat Chronological
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600 font-mono">
            <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">
              Active Meters: {filteredRows.length}
            </span>
            <span className="bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded border border-blue-200">
              Invoices: {totalInvoicesIssued}
            </span>
            <span className="bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-200">
              No-Sale Pops: {totalDrawerPops}
            </span>
          </div>
        </div>
      )}

      {/* Official Vanguard Master Report Document */}
      <MasterReportDocument
        meta={meta}
        columns={columns}
        sections={viewMode === 'grouped' ? sections : undefined}
        flatRows={viewMode === 'flat' ? filteredRows : undefined}
        grandTotal={grandTotal}
        orientation="landscape"
      />
    </div>
  );
};

export default MeterReportTemplate;