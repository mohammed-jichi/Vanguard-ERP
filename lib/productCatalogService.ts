/**
 * Vanguard ERP - Live Product Catalog Service (Supabase `products` table)
 *
 * Core columns that exist on the live table: id, tenant_id (uuid), name, description, sku, barcode,
 * price, unit, stock_quantity, is_active, currency, category_id, created_at, updated_at.
 * Optional `record jsonb` column (see lib/supabase/schema_products_catalog_extension.sql) stores the
 * full rich catalog record. When it is absent, only the core columns are persisted.
 */
import { supabase } from '@/lib/supabaseClient';

export const DEFAULT_TENANT_UUID = '00000000-0000-0000-0000-000000000001';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function resolveTenantUuid(tenant?: any): string {
  const id = tenant?.id;
  return typeof id === 'string' && UUID_RE.test(id) ? id : DEFAULT_TENANT_UUID;
}

export interface CatalogFetchResult {
  rows: any[];
  error?: string;
}

export async function fetchCatalogRows(tenantUuid: string): Promise<CatalogFetchResult> {
  const rows: any[] = [];
  const page = 1000;
  for (let from = 0; from < 100000; from += page) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('tenant_id', tenantUuid)
      .order('created_at', { ascending: true })
      .range(from, from + page - 1);
    if (error) return { rows, error: error.message };
    rows.push(...(data || []));
    if (!data || data.length < page) break;
  }
  return { rows };
}

/** Converts a DB row to a catalog record, layering stored `record` JSON over a blank template. */
export function rowToRecord(row: any, blank: any, index: number, rate: number): any {
  const rec = row?.record && typeof row.record === 'object' ? row.record : {};
  const usd = Number(row?.price) || 0;
  const out: any = {
    ...blank,
    ...rec,
    id: index + 1,
    dbId: row?.id,
    description: row?.description || row?.name || rec.description || '',
    code: row?.sku || rec.code || '',
    barcode: row?.barcode ?? rec.barcode ?? '',
    unit: row?.unit || rec.unit || blank.unit,
    qtyOH: Number(row?.stock_quantity ?? rec.qtyOH ?? 0),
    isDiscontinued: row?.is_active === false || Boolean(rec.isDiscontinued)
  };
  if (!rec.sellingPrice1USD && usd) {
    out.sellingPrice1USD = usd;
    out.sellingPrice1LL = Math.round(usd * rate);
    out.sellingPrice = out.sellingPrice1LL;
  }
  return out;
}

export interface UpsertResult {
  ok: boolean;
  error?: string;
  fullFidelity: boolean;
}

export async function upsertCatalogProduct(tenantUuid: string, p: any, rate: number): Promise<UpsertResult> {
  const priceUsd = Number(p.sellingPrice1USD) || (rate > 0 ? (Number(p.sellingPrice1LL) || 0) / rate : 0);
  const core = {
    tenant_id: tenantUuid,
    name: p.description,
    description: p.description,
    sku: p.code,
    barcode: p.barcode || null,
    price: Number(priceUsd.toFixed(4)),
    unit: p.unit || null,
    stock_quantity: Number(p.qtyOH) || 0,
    is_active: !p.isDiscontinued,
    currency: 'USD',
    updated_at: new Date().toISOString()
  };
  const { dbId, ...recordBody } = p || {};
  try {
    const { data: existing, error: lookupErr } = await supabase
      .from('products')
      .select('id')
      .eq('tenant_id', tenantUuid)
      .eq('sku', p.code)
      .maybeSingle();
    if (lookupErr) return { ok: false, error: lookupErr.message, fullFidelity: false };

    const write = async (payload: any) =>
      existing?.id
        ? supabase.from('products').update(payload).eq('id', existing.id).select('id')
        : supabase.from('products').insert(payload).select('id');

    const noRows = (r: any) => !r.error && (!r.data || r.data.length === 0);
    const rlsMsg = 'No rows were written to public.products (blocked by RLS policy?)';
    let res: any = await write({ ...core, record: recordBody });
    if (noRows(res)) return { ok: false, error: rlsMsg, fullFidelity: false };
    if (!res.error) return { ok: true, fullFidelity: true };
    if (/record/i.test(res.error.message || '')) {
      res = await write(core);
      if (noRows(res)) return { ok: false, error: rlsMsg, fullFidelity: false };
      if (!res.error) return { ok: true, fullFidelity: false };
    }
    return { ok: false, error: res.error.message, fullFidelity: false };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e), fullFidelity: false };
  }
}

export async function upsertCatalogProducts(
  tenantUuid: string,
  list: any[],
  rate: number
): Promise<{ saved: number; failed: number; firstError?: string; fullFidelity: boolean }> {
  let saved = 0;
  let failed = 0;
  let firstError: string | undefined;
  let fullFidelity = true;
  const queue = [...list];
  const worker = async () => {
    while (queue.length) {
      const item = queue.shift();
      const r = await upsertCatalogProduct(tenantUuid, item, rate);
      if (r.ok) {
        saved++;
        if (!r.fullFidelity) fullFidelity = false;
      } else {
        failed++;
        firstError = firstError || r.error;
      }
    }
  };
  await Promise.all([worker(), worker(), worker(), worker()]);
  return { saved, failed, firstError, fullFidelity };
}

export async function deleteCatalogProduct(tenantUuid: string, code: string): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from('products').delete().eq('tenant_id', tenantUuid).eq('sku', code);
  return error ? { ok: false, error: error.message } : { ok: true };
}

export interface StockReconcileResult {
  ok: boolean;
  error?: string;
  ledgerRows: number;
  adjustments: { code: string; from: number; to: number }[];
}

/** Compares products.stock_quantity against signed sums from the stock_transactions ledger. */
export async function reconcileStockFromLedger(tenantUuid: string, products: any[]): Promise<StockReconcileResult> {
  const { data, error } = await supabase.from('stock_transactions').select('*').eq('tenant_id', tenantUuid).limit(50000);
  if (error) return { ok: false, error: error.message, ledgerRows: 0, adjustments: [] };
  const sums = new Map<string, number>();
  (data || []).forEach((row: any) => {
    if (row.is_reversed) return;
    const key = String(row.sku ?? row.product_code ?? row.item_code ?? row.code ?? row.product_id ?? '').trim().toLowerCase();
    if (!key) return;
    let q = Number(row.quantity ?? row.qty ?? row.qty_change ?? 0) || 0;
    const type = String(row.movement_type ?? row.transaction_type ?? row.type ?? row.direction ?? '').toLowerCase();
    if (/out|sale|issue|deduct|dispatch|consum/.test(type)) q = -Math.abs(q);
    else if (/in|receipt|purchase|receive|return/.test(type)) q = Math.abs(q);
    sums.set(key, (sums.get(key) || 0) + q);
  });
  const adjustments: { code: string; from: number; to: number }[] = [];
  products.forEach((p) => {
    const key = String(p.code || '').trim().toLowerCase();
    if (!sums.has(key)) return;
    const to = Number((sums.get(key) as number).toFixed(4));
    const from = Number(p.qtyOH) || 0;
    if (Math.abs(to - from) > 0.0001) adjustments.push({ code: p.code, from, to });
  });
  return { ok: true, ledgerRows: (data || []).length, adjustments };
}

export interface ItemSalesMonth {
  month: string;
  monthIndex: number;
  qtyThisYear: number;
  salesThisYearLL: number;
  qtyLastYear: number;
  salesLastYearLL: number;
}

export interface ItemSalesPerformance {
  months: ItemSalesMonth[];
  totalQty: number;
  totalRevenueLL: number;
  invoicesCount: number;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function emptyItemSalesPerformance(): ItemSalesPerformance {
  return {
    months: MONTHS.map((m, i) => ({ month: m, monthIndex: i + 1, qtyThisYear: 0, salesThisYearLL: 0, qtyLastYear: 0, salesLastYearLL: 0 })),
    totalQty: 0,
    totalRevenueLL: 0,
    invoicesCount: 0
  };
}

/** Aggregates POSTED sales invoices (is_posted === true) persisted in tenants.feature_flags for one item. */
export async function fetchItemSalesPerformance(tenantUuid: string, product: any, rate: number): Promise<ItemSalesPerformance> {
  const result = emptyItemSalesPerformance();
  try {
    const { data } = await supabase.from('tenants').select('feature_flags').eq('id', tenantUuid).maybeSingle();
    const flags: any = data?.feature_flags || {};
    const invoices: any[] = [
      ...(Array.isArray(flags.sales_invoices) ? flags.sales_invoices : []),
      ...(Array.isArray(flags.sales_invoices_directory) ? flags.sales_invoices_directory : [])
    ];
    const seen = new Set<string>();
    const year = new Date().getFullYear();
    const code = String(product.code || '').trim().toLowerCase();
    const barcode = String(product.barcode || '').trim().toLowerCase();
    const desc = String(product.description || '').trim().toLowerCase();
    invoices.forEach((inv) => {
      if (!(inv?.is_posted === true || inv?.posted === true)) return;
      const key = String(inv.id || inv.invoiceNumber || '');
      if (key && seen.has(key)) return;
      if (key) seen.add(key);
      const d = new Date(inv.createdAtIso || inv.date || inv.createdAt);
      if (isNaN(d.getTime())) return;
      const y = d.getFullYear();
      if (y !== year && y !== year - 1) return;
      const invRate = Number(inv.exchange_rate) || rate;
      const isCredit = inv.docType === 'CREDIT_NOTE' || inv.doc_type === 'CREDIT_NOTE';
      let counted = false;
      (inv.items || []).forEach((line: any) => {
        const lc = String(line.code || line.itemCode || '').trim().toLowerCase();
        const lb = String(line.barcode || '').trim().toLowerCase();
        const ln = String(line.name || line.description || '').trim().toLowerCase();
        const match = (code && lc === code) || (barcode && lb === barcode) || (!lc && desc && ln === desc);
        if (!match) return;
        const sign = isCredit ? -1 : 1;
        const qty = (Number(line.qty) || 0) * sign;
        const total = Number(line.total ?? (Number(line.qty) || 0) * (Number(line.unitPrice) || 0)) * sign;
        const ll = String(inv.currency || 'USD').toUpperCase() === 'USD' ? total * invRate : total;
        const m = result.months[d.getMonth()];
        if (y === year) {
          m.qtyThisYear += qty;
          m.salesThisYearLL += ll;
          result.totalQty += qty;
          result.totalRevenueLL += ll;
        } else {
          m.qtyLastYear += qty;
          m.salesLastYearLL += ll;
        }
        counted = true;
      });
      if (counted && y === year) result.invoicesCount++;
    });
  } catch (e) {
    console.error('fetchItemSalesPerformance failed:', e);
  }
  return result;
}
