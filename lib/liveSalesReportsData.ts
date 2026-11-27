'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTenantFlag } from '@/lib/useTenantFlag';
import { useTenant } from '@/lib/TenantContext';
import { fetchCatalogRows, resolveTenantUuid } from '@/lib/productCatalogService';
import { convertCurrency } from '@/lib/currencyEngine';

/**
 * Live sales-report data layer.
 * Source of truth: tenants.feature_flags.sales_invoices_directory (posted invoices) and the tenant `products` catalog.
 * All money is normalised to USD (the ERP base currency).
 */

export interface LiveInvoice {
  id: string;
  day: string; // YYYY-MM-DD ('' when unparseable)
  branch: string;
  customer: string;
  salesman: string;
  currency: string;
  subtotalUsd: number;
  discountUsd: number;
  taxUsd: number;
  grandTotalUsd: number;
  isRefund: boolean;
  items: LiveInvoiceItem[];
  payments: { type: string; amountUsd: number }[];
  raw: any;
}

export interface LiveInvoiceItem {
  code: string;
  name: string;
  qty: number;
  unitPriceUsd: number;
  totalUsd: number;
  discountUsd: number;
  category: string;
}

const MONTHS: Record<string, number> = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
const pad = (n: number) => String(n).padStart(2, '0');
const num = (v: any) => {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
};

export function todayIso(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Resolves an invoice's calendar day (YYYY-MM-DD) from createdAt/date/posted_at in any format used in the tenant data. */
export function invoiceDay(inv: any): string {
  for (const cand of [inv?.createdAt, inv?.date, inv?.posted_at]) {
    if (!cand) continue;
    const s = String(cand).trim();
    let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
    m = s.match(/^(\d{1,2})[\s-]+([A-Za-z]{3})[a-z]*,?[\s-]+(\d{4})/);
    if (m && MONTHS[m[2].toLowerCase()]) return `${m[3]}-${pad(MONTHS[m[2].toLowerCase()])}-${pad(parseInt(m[1], 10))}`;
    const t = Date.parse(s);
    if (!Number.isNaN(t)) return todayIso(new Date(t));
  }
  return '';
}

const toUsd = (amount: number, currency: string) => (currency && currency.toUpperCase() !== 'USD' ? convertCurrency(amount, currency, 'USD') : amount);

export function normalizeInvoice(inv: any, categoryByCode: Map<string, string>): LiveInvoice {
  const currency = String(inv?.currency || 'USD').toUpperCase();
  const kind = `${inv?.invoiceType || ''} ${inv?.transactionType || ''} ${inv?.status || ''}`.toLowerCase();
  const isRefund = /refund|return|credit note/.test(kind);
  const items: LiveInvoiceItem[] = (Array.isArray(inv?.items) ? inv.items : []).map((it: any) => {
    const qty = num(it?.qty ?? it?.quantity);
    const unit = num(it?.unitPrice ?? it?.price);
    const total = it?.total !== undefined ? num(it.total) : qty * unit;
    const code = String(it?.code || it?.itemId || '');
    const category = String(it?.category || it?.categoryName || it?.group || categoryByCode.get(code) || 'Uncategorized');
    return {
      code,
      name: String(it?.name || it?.description || code),
      qty,
      unitPriceUsd: toUsd(unit, currency),
      totalUsd: toUsd(total, currency),
      discountUsd: toUsd(num(it?.discount), currency),
      category
    };
  });
  return {
    id: String(inv?.invoiceNumber || inv?.id || ''),
    day: invoiceDay(inv),
    branch: String(inv?.branch || inv?.location || 'Main Branch'),
    customer: String(inv?.customerName || inv?.company || ''),
    salesman: String(inv?.salesman || inv?.createdBy || 'Unassigned'),
    currency,
    subtotalUsd: toUsd(num(inv?.subtotal), currency),
    discountUsd: toUsd(num(inv?.discount), currency),
    taxUsd: toUsd(num(inv?.tax), currency),
    grandTotalUsd: toUsd(num(inv?.grandTotal), currency),
    isRefund,
    items,
    payments: (Array.isArray(inv?.payments) ? inv.payments : []).map((p: any) => ({
      type: String(p?.type || p?.method || 'Unspecified'),
      amountUsd: toUsd(num(p?.amount), String(p?.currency || currency).toUpperCase())
    })),
    raw: inv
  };
}

/** Category name lookup (item code -> catalog category) from the tenant product catalog. */
export function useCatalogCategoryMap(): Map<string, string> {
  const { currentTenant } = useTenant();
  const tenantUuid = resolveTenantUuid(currentTenant);
  const [map, setMap] = useState<Map<string, string>>(new Map());
  useEffect(() => {
    let cancelled = false;
    fetchCatalogRows(tenantUuid)
      .then(({ rows }) => {
        if (cancelled) return;
        const m = new Map<string, string>();
        for (const r of rows) {
          const rec = r?.record && typeof r.record === 'object' ? r.record : {};
          const cat = rec.category || rec.categoryName || rec.categoryDescription || rec.category_name || r?.category;
          if (r?.sku && cat) m.set(String(r.sku), String(cat));
        }
        setMap(m);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [tenantUuid]);
  return map;
}

/** Live POSTED invoices for the active tenant. */
export function useLivePostedInvoices(): { invoices: LiveInvoice[]; loading: boolean; error: string | null } {
  const [raw, , status] = useTenantFlag<any[]>('sales_invoices_directory', []);
  const categoryByCode = useCatalogCategoryMap();
  const invoices = useMemo(
    () =>
      (Array.isArray(raw) ? raw : [])
        .filter((i) => i && (i.posted === true || i.is_posted === true || String(i.status).toLowerCase() === 'posted'))
        .map((i) => normalizeInvoice(i, categoryByCode)),
    [raw, categoryByCode]
  );
  return { invoices, loading: status.loading, error: status.error };
}

export function filterByRange(invoices: LiveInvoice[], fromIso?: string, toIso?: string, branch?: string): LiveInvoice[] {
  return invoices.filter((i) => {
    if (!i.day) return false;
    if (fromIso && i.day < fromIso) return false;
    if (toIso && i.day > toIso) return false;
    if (branch && branch !== 'ALL' && branch !== 'All Branches' && i.branch !== branch) return false;
    return true;
  });
}

/** First/last day (ISO) of the month containing the most recent posted invoice, or null if none. */
export function latestInvoiceMonthRange(invoices: LiveInvoice[]): { fromDate: string; toDate: string } | null {
  const days = invoices.map((i) => i.day).filter(Boolean).sort();
  if (days.length === 0) return null;
  const last = days[days.length - 1];
  const [y, m] = last.split('-').map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  return { fromDate: `${y}-${pad(m)}-01`, toDate: `${y}-${pad(m)}-${pad(lastDay)}` };
}

/* ---------------- Aggregations ---------------- */

export interface DiscountRow {
  invoice: string;
  day: string;
  branch: string;
  customer: string;
  salesman: string;
  subtotalUsd: number;
  discountUsd: number;
}

export function aggregateDiscounts(invoices: LiveInvoice[]): DiscountRow[] {
  return invoices
    .filter((i) => i.discountUsd > 0)
    .map((i) => ({ invoice: i.id, day: i.day, branch: i.branch, customer: i.customer, salesman: i.salesman, subtotalUsd: i.subtotalUsd, discountUsd: i.discountUsd }))
    .sort((a, b) => a.branch.localeCompare(b.branch) || a.day.localeCompare(b.day));
}

export interface CategoryRow {
  category: string;
  itemsSold: number;
  grossUsd: number;
  discountUsd: number;
  netUsd: number;
  sharePct: number;
}

/** Category aggregation from invoice line items. Invoice-level discount is allocated pro-rata to line totals. */
export function aggregateCategories(invoices: LiveInvoice[]): { rows: CategoryRow[]; invoicesWithoutLines: number } {
  const acc = new Map<string, { itemsSold: number; grossUsd: number; discountUsd: number }>();
  let invoicesWithoutLines = 0;
  for (const inv of invoices) {
    if (inv.items.length === 0) {
      invoicesWithoutLines += 1;
      continue;
    }
    const lineSum = inv.items.reduce((s, it) => s + it.totalUsd, 0);
    for (const it of inv.items) {
      const alloc = it.discountUsd > 0 ? it.discountUsd : lineSum > 0 ? (inv.discountUsd * it.totalUsd) / lineSum : 0;
      const sign = inv.isRefund ? -1 : 1;
      const cur = acc.get(it.category) || { itemsSold: 0, grossUsd: 0, discountUsd: 0 };
      cur.itemsSold += sign * it.qty;
      cur.grossUsd += sign * it.totalUsd;
      cur.discountUsd += sign * alloc;
      acc.set(it.category, cur);
    }
  }
  const totalNet = Array.from(acc.values()).reduce((s, v) => s + (v.grossUsd - v.discountUsd), 0);
  const rows = Array.from(acc.entries())
    .map(([category, v]) => ({
      category,
      itemsSold: v.itemsSold,
      grossUsd: v.grossUsd,
      discountUsd: v.discountUsd,
      netUsd: v.grossUsd - v.discountUsd,
      sharePct: totalNet !== 0 ? ((v.grossUsd - v.discountUsd) / totalNet) * 100 : 0
    }))
    .sort((a, b) => b.netUsd - a.netUsd);
  return { rows, invoicesWithoutLines };
}

export interface ItemRow {
  code: string;
  name: string;
  category: string;
  qty: number;
  totalUsd: number;
  avgUnitUsd: number;
}

/** Item aggregation strictly from posted invoice line items (qty x unit price = total). */
export function aggregateItems(invoices: LiveInvoice[]): ItemRow[] {
  const acc = new Map<string, ItemRow>();
  for (const inv of invoices) {
    const sign = inv.isRefund ? -1 : 1;
    for (const it of inv.items) {
      const key = it.code || it.name;
      const cur = acc.get(key) || { code: it.code, name: it.name, category: it.category, qty: 0, totalUsd: 0, avgUnitUsd: 0 };
      cur.qty += sign * it.qty;
      cur.totalUsd += sign * it.totalUsd;
      acc.set(key, cur);
    }
  }
  return Array.from(acc.values())
    .map((r) => ({ ...r, avgUnitUsd: r.qty !== 0 ? r.totalUsd / r.qty : 0 }))
    .sort((a, b) => b.totalUsd - a.totalUsd);
}

export interface TodayStats {
  invoiceCount: number;
  refundCount: number;
  grossUsd: number;
  discountUsd: number;
  refundsUsd: number;
  netUsd: number;
  taxUsd: number;
  byPayment: { method: string; txCount: number; amountUsd: number }[];
  byEmployee: { name: string; invoices: number; grossUsd: number; netUsd: number }[];
}

export function aggregateToday(invoices: LiveInvoice[], dayIso: string = todayIso()): TodayStats {
  const today = invoices.filter((i) => i.day === dayIso);
  const sales = today.filter((i) => !i.isRefund);
  const refunds = today.filter((i) => i.isRefund);
  const grossUsd = sales.reduce((s, i) => s + i.subtotalUsd, 0);
  const discountUsd = sales.reduce((s, i) => s + i.discountUsd, 0);
  const refundsUsd = refunds.reduce((s, i) => s + Math.abs(i.grandTotalUsd || i.subtotalUsd), 0);
  const taxUsd = sales.reduce((s, i) => s + i.taxUsd, 0);
  const pay = new Map<string, { txCount: number; amountUsd: number }>();
  for (const inv of sales) {
    let paid = 0;
    for (const p of inv.payments) {
      const c = pay.get(p.type) || { txCount: 0, amountUsd: 0 };
      c.txCount += 1;
      c.amountUsd += p.amountUsd;
      pay.set(p.type, c);
      paid += p.amountUsd;
    }
    const open = inv.grandTotalUsd - paid;
    if (open > 0.005) {
      const c = pay.get('On Account / Unpaid') || { txCount: 0, amountUsd: 0 };
      c.txCount += 1;
      c.amountUsd += open;
      pay.set('On Account / Unpaid', c);
    }
  }
  const emp = new Map<string, { invoices: number; grossUsd: number; netUsd: number }>();
  for (const inv of sales) {
    const c = emp.get(inv.salesman) || { invoices: 0, grossUsd: 0, netUsd: 0 };
    c.invoices += 1;
    c.grossUsd += inv.subtotalUsd;
    c.netUsd += inv.subtotalUsd - inv.discountUsd;
    emp.set(inv.salesman, c);
  }
  return {
    invoiceCount: sales.length,
    refundCount: refunds.length,
    grossUsd,
    discountUsd,
    refundsUsd,
    netUsd: grossUsd - discountUsd - refundsUsd,
    taxUsd,
    byPayment: Array.from(pay.entries()).map(([method, v]) => ({ method, ...v })),
    byEmployee: Array.from(emp.entries()).map(([name, v]) => ({ name, ...v }))
  };
}
