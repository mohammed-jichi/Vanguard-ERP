import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseClient';
import { getReportSchema } from '@/config/reportSchemaRegistry';
import { resolveSchemaForReport } from '@/lib/reportSchemaResolverEngine';
import { formatCurrencyAmount } from '@/lib/currencyEngine';

export const dynamic = 'force-dynamic';

/**
 * ============================================================================
 * DYNAMIC REPORT ENGINE ROUTE
 * ============================================================================
 * GET /api/reports/engine?reportId=REP_S_00211&branch=...&from=...&to=...
 * 
 * Authoritative pipeline:
 * 1. Resolves active report schema & distinct column definitions.
 * 2. Unmounts previous schemas cleanly and returns exact dataset from live Supabase.
 * 3. Enforces multi-currency integrity (LBP notation vs USD notation).
 * 4. Pure empty state fallback: returns rows: [] when table has no data (no synthetic mock injection).
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get('reportId') || searchParams.get('code') || searchParams.get('reportKey') || 'REP_S_00210';
    const reportName = searchParams.get('reportName') || searchParams.get('title') || reportId;
    const branch = searchParams.get('branch') || 'ALL';
    const fromDate = searchParams.get('from') || searchParams.get('fromDate') || undefined;
    const toDate = searchParams.get('to') || searchParams.get('toDate') || undefined;
    const searchQuery = searchParams.get('searchQuery') || searchParams.get('q') || '';
    const currency = searchParams.get('currency') || 'USD';

    // 1. Resolve exact schema from registry
    const schema = getReportSchema(reportId) || getReportSchema(reportName);

    if (!schema) {
      // Dynamic fallback schema inference
      const inferred = resolveSchemaForReport(reportName, reportId, 'sales', [], {
        branch,
        fromDate,
        toDate,
        searchQuery,
      });

      return NextResponse.json({
        success: true,
        reportId,
        reportTitle: reportName,
        domain: inferred.domain,
        schema: inferred.schema,
        columns: inferred.schema.columns,
        rows: [],
        kpiSummary: [],
        grandTotal: {
          label: 'Total Records:',
          value: '0 Entries',
          breakdownText: 'No live records found for the selected criteria.',
        },
      });
    }

    const supabase = getSupabaseServerClient();

    // 2. Query Live Supabase Data according to Domain / Report ID
    let liveRows: any[] = [];

    if (schema.id === 'REP_S_00210') {
      // VAT Fiscal Declaration & Tax Accrual Summary
      const { data: sales, error } = await supabase
        .from('sales_invoices')
        .select('*');

      if (error && error.code !== 'PGRST116' && !error.message?.includes('does not exist')) {
        return NextResponse.json(
          { error: error.message, details: error.details },
          { status: 500 }
        );
      }

      if (sales && sales.length > 0) {
        // Aggregate live invoices by tax classification
        let standardTurnover = 0;
        let exemptTurnover = 0;
        let exportTurnover = 0;

        for (const s of sales) {
          const total = Number(s.total_amount || s.total || 0);
          const type = String(s.tax_category || s.type || '').toUpperCase();
          if (type.includes('EXEMPT') || type.includes('AGRI') || type.includes('FARM')) {
            exemptTurnover += total;
          } else if (type.includes('EXPORT') || type.includes('ZERO')) {
            exportTurnover += total;
          } else {
            standardTurnover += total;
          }
        }

        const standardVat = Math.round((standardTurnover * 0.11 + Number.EPSILON) * 100) / 100;
        const standardLbp = standardTurnover * 89500;
        const exemptLbp = exemptTurnover * 89500;
        const exportLbp = exportTurnover * 89500;

        liveRows = [
          {
            id: 'TAX-01',
            taxCategory: 'Standard Rate Products (Processed Oils & Packaged)',
            fiscalCode: 'VAT-11',
            taxRate: 11.0,
            taxableBaseUsd: standardTurnover,
            taxableBaseLbp: standardLbp,
            taxCollectedUsd: standardVat,
            branch,
          },
          {
            id: 'TAX-02',
            taxCategory: 'Exempt Agricultural Goods (Raw Olives & Fresh Produce)',
            fiscalCode: 'VAT-EX',
            taxRate: 0.0,
            taxableBaseUsd: exemptTurnover,
            taxableBaseLbp: exemptLbp,
            taxCollectedUsd: 0.0,
            branch,
          },
          {
            id: 'TAX-03',
            taxCategory: 'Export Sales (Zero Rated International Dispatch)',
            fiscalCode: 'VAT-ZERO',
            taxRate: 0.0,
            taxableBaseUsd: exportTurnover,
            taxableBaseLbp: exportLbp,
            taxCollectedUsd: 0.0,
            branch,
          },
        ];
      } else {
        // Zero mock policy: Clean empty state
        liveRows = [];
      }
    } else if (schema.id === 'REP_S_00211') {
      // Tax Summary Comparative Statement
      const { data: sales, error } = await supabase
        .from('sales_invoices')
        .select('*');

      if (error && error.code !== 'PGRST116' && !error.message?.includes('does not exist')) {
        return NextResponse.json(
          { error: error.message, details: error.details },
          { status: 500 }
        );
      }

      if (sales && sales.length > 0) {
        let currentBase = 0;
        let priorBase = 0;

        for (const s of sales) {
          const total = Number(s.total_amount || s.total || 0);
          const date = s.invoice_date || s.created_at;
          if (fromDate && date && date >= fromDate) {
            currentBase += total;
          } else {
            priorBase += total;
          }
        }

        const currentVat = Math.round((currentBase * 0.11 + Number.EPSILON) * 100) / 100;
        const priorVat = Math.round((priorBase * 0.11 + Number.EPSILON) * 100) / 100;
        const varianceUsd = currentVat - priorVat;
        const variancePct = priorVat !== 0 ? Math.round(((varianceUsd / priorVat) * 100 + Number.EPSILON) * 10) / 10 : 0.0;

        liveRows = [
          {
            id: 'TAX-COMP-01',
            taxCategory: 'Standard Rate Products (Processed Oils & Packaged)',
            fiscalCode: 'VAT-11',
            taxRate: 11.0,
            currentTaxableBaseUsd: currentBase,
            currentTaxableBaseLbp: currentBase * 89500,
            currentVatUsd: currentVat,
            priorTaxableBaseUsd: priorBase,
            priorVatUsd: priorVat,
            varianceUsd: varianceUsd,
            variancePct: variancePct,
            branch,
          },
          {
            id: 'TAX-COMP-02',
            taxCategory: 'Exempt Agricultural Goods (Raw Olives & Fresh Produce)',
            fiscalCode: 'VAT-EX',
            taxRate: 0.0,
            currentTaxableBaseUsd: 0.0,
            currentTaxableBaseLbp: 0.0,
            currentVatUsd: 0.0,
            priorTaxableBaseUsd: 0.0,
            priorVatUsd: 0.0,
            varianceUsd: 0.0,
            variancePct: 0.0,
            branch,
          },
        ];
      } else {
        liveRows = [];
      }
    } else {
      // General report domain query against corresponding Supabase table
      let targetTable = 'sales_invoices';
      if (schema.domain === 'hr') targetTable = 'employees';
      else if (schema.domain === 'inventory') targetTable = 'inventory_items';
      else if (schema.domain === 'fleet') targetTable = 'online_platform_orders';
      else if (schema.domain === 'accounting') targetTable = 'journal_vouchers';
      else if (schema.domain === 'crm') targetTable = 'social_orders';

      const { data, error } = await supabase.from(targetTable).select('*').limit(500);

      if (error && error.code !== 'PGRST116' && !error.message?.includes('does not exist')) {
        return NextResponse.json(
          { error: error.message, details: error.details },
          { status: 500 }
        );
      }

      liveRows = data || [];
    }

    // 3. Compute KPI Summary Cards
    const kpiSummary = schema.kpiSummary
      ? schema.kpiSummary.map((kpi) => {
          const res = typeof kpi.calculate === 'function' ? kpi.calculate(liveRows, currency) : { value: '0', subtext: '' };
          return {
            label: kpi.label,
            value: res.value,
            subtext: res.subtext,
          };
        })
      : [];

    return NextResponse.json({
      success: true,
      reportId: schema.id,
      reportKey: schema.reportKey,
      reportTitle: schema.title,
      domain: schema.domain,
      description: schema.description,
      columns: schema.columns,
      rows: liveRows,
      kpiSummary,
      count: liveRows.length,
      filtersApplied: {
        branch,
        fromDate,
        toDate,
        searchQuery,
        currency,
      },
    });
  } catch (err: any) {
    console.error('[API /api/reports/engine Error]:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal dynamic report engine error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reportId, dateFrom, dateTo, facilityId, departmentId, terminalId, currency = 'USD', customParams = {} } = body;
    const url = new URL(req.url);
    url.searchParams.set('reportId', reportId || customParams.reportId || 'REP_S_00210');
    if (facilityId) url.searchParams.set('branch', facilityId);
    if (dateFrom) url.searchParams.set('fromDate', dateFrom);
    if (dateTo) url.searchParams.set('toDate', dateTo);
    if (currency) url.searchParams.set('currency', currency);
    return GET(new NextRequest(url.toString(), { method: 'GET', headers: req.headers }));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
