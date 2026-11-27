/**
 * Shared, framework-free helpers for live sales / End-of-Day math.
 * Source of truth: tenants.feature_flags
 *   - sales_invoices_directory / sales_invoices  (posted when is_posted === true)
 *   - last_end_of_day, last_eod_closing, end_of_day_log, active_pos_shift
 *   - exchange_rate (LBP per USD)
 * All monetary output of `toLL` is in LBP so a single conversion (LL / rate) is applied at display time.
 */

export interface PostedInvoice {
  id: string;
  ts: number;
  sign: 1 | -1;
  ccy: 'USD' | 'LBP';
  total: number; // native currency, unsigned
  subtotal: number;
  tax: number;
  discount: number;
  salesman: string;
  customer: string;
  branch: string;
  cats: Record<string, number>; // native currency, unsigned
  pays: { method: string; amount: number; ccy: 'USD' | 'LBP' }[];
}

export interface VoidedInvoice {
  id: string;
  ts: number;
  ccy: 'USD' | 'LBP';
  total: number;
}

const num = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export const parseInvoiceTs = (inv: any): number => {
  const raw = inv?.createdAtIso || inv?.createdAt || inv?.date;
  const t = new Date(raw).getTime();
  return Number.isFinite(t) ? t : NaN;
};

const normCcy = (c: any): 'USD' | 'LBP' => {
  const s = String(c || 'USD').toUpperCase();
  return s === 'LBP' || s === 'LL' ? 'LBP' : 'USD';
};

export function extractInvoices(flags: any): { posted: PostedInvoice[]; voided: VoidedInvoice[] } {
  const raw: any[] = [...(flags?.sales_invoices_directory || []), ...(flags?.sales_invoices || [])];
  const seen = new Set<string>();
  const posted: PostedInvoice[] = [];
  const voided: VoidedInvoice[] = [];
  // Directory rows carry the full body; sales_invoices rows may be a posting stub -> merge by id
  const byId = new Map<string, any>();
  raw.forEach((inv) => {
    const key = String(inv?.id || inv?.invoiceNumber || inv?.invoice_number || '');
    if (!key) {
      byId.set(`__${byId.size}`, inv);
      return;
    }
    byId.set(key, { ...(byId.get(key) || {}), ...inv });
  });
  byId.forEach((inv, key) => {
    if (seen.has(key)) return;
    seen.add(key);
    const ts = parseInvoiceTs(inv);
    if (isNaN(ts)) return;
    const ccy = normCcy(inv.currency);
    const status = String(inv.status || '').toLowerCase();
    const total = num(inv.total_amount ?? inv.grandTotal ?? inv.total);
    if (/void|cancel/.test(status)) {
      voided.push({ id: key, ts, ccy, total });
      return;
    }
    if (!(inv.is_posted === true)) return;
    const isCredit = inv.docType === 'CREDIT_NOTE' || inv.doc_type === 'CREDIT_NOTE';
    const tax = num(inv.tax_amount ?? inv.tax);
    const discount = num(inv.discount_amount ?? inv.discount);
    const subtotal = inv.subtotal_amount != null || inv.subtotal != null ? num(inv.subtotal_amount ?? inv.subtotal) : total - tax + discount;
    const cats: Record<string, number> = {};
    (inv.items || []).forEach((l: any) => {
      const name = l.category || l.categoryName || l.group || l.groupName;
      if (name) cats[name] = (cats[name] || 0) + Math.abs(num(l.total ?? num(l.qty) * num(l.unitPrice)));
    });
    const pays: PostedInvoice['pays'] = [];
    (Array.isArray(inv.payments) ? inv.payments : []).forEach((p: any) => {
      const amount = Math.abs(num(p.amount ?? p.value));
      if (amount > 0) pays.push({ method: String(p.method || p.type || p.paymentType || p.name || 'CASH').toUpperCase(), amount, ccy: normCcy(p.currency || inv.currency) });
    });
    if (!pays.length) pays.push({ method: String(inv.payment_method || inv.paymentType || 'CASH').toUpperCase(), amount: Math.abs(total), ccy });
    posted.push({
      id: key,
      ts,
      sign: isCredit ? -1 : 1,
      ccy,
      total: Math.abs(total),
      subtotal: Math.abs(subtotal),
      tax: Math.abs(tax),
      discount: Math.abs(discount),
      salesman: String(inv.salesman || inv.salesperson || inv.createdBy || '').trim(),
      customer: String(inv.customerId || inv.customerName || '').trim(),
      branch: String(inv.branch || ''),
      cats,
      pays
    });
  });
  return { posted, voided };
}

/** Convert a native-currency amount to signed LBP with the single live rate. */
export const toLL = (inv: { ccy: 'USD' | 'LBP'; sign?: 1 | -1 }, v: number, rate: number) => (inv.ccy === 'USD' ? v * rate : v) * (inv.sign ?? 1);
export const ccyToLL = (ccy: 'USD' | 'LBP', v: number, rate: number) => (ccy === 'USD' ? v * rate : v);

export const liveRateFrom = (flags: any, fallback = 90000): number => {
  const r = Number(flags?.exchange_rate ?? flags?.corporate_profile?.exchange_rate);
  if (Number.isFinite(r) && r > 0) return r;
  const usd = Array.isArray(flags?.currency_setup) ? flags.currency_setup.find((c: any) => String(c.DESCRIPTION).toUpperCase() === 'USD') : null;
  const r2 = Number(usd?.RATE);
  return Number.isFinite(r2) && r2 > 1 ? r2 : fallback;
};

export const fmtEodDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

export interface EodState {
  status: 'Open' | 'Closed';
  lastClosedIso: string | null;
  lastClosedMs: number;
  shiftOpenedMs: number;
  /** Date shown on every EOD surface (open workday date, or the date of the last closing when closed). */
  workingDate: string;
  lastReference: string;
}

/**
 * Single source of truth for working date + Open/Closed.
 * Closed  = a closing exists and no shift has been (re)opened after it.
 * Open    = otherwise (never closed, or active_pos_shift opened after the last closing).
 */
export function computeEodState(flags: any, now = new Date()): EodState {
  const lastClosedIso: string | null = flags?.last_end_of_day || flags?.last_eod_closing?.closed_at || null;
  const lastClosedMs = lastClosedIso ? new Date(lastClosedIso).getTime() : 0;
  const shift = flags?.active_pos_shift;
  const shiftOpenedMs = shift?.openedAt ? new Date(shift.openedAt).getTime() : 0;
  const shiftOpenAfterClose = shift?.status === 'OPEN' && shiftOpenedMs > lastClosedMs;
  const closed = lastClosedMs > 0 && !shiftOpenAfterClose;
  const workingDate = closed
    ? fmtEodDate(new Date(lastClosedMs))
    : fmtEodDate(shiftOpenAfterClose ? new Date(shiftOpenedMs) : now);
  return {
    status: closed ? 'Closed' : 'Open',
    lastClosedIso,
    lastClosedMs,
    shiftOpenedMs,
    workingDate,
    lastReference: String(flags?.last_eod_closing?.reference || '')
  };
}

export interface EodTotals {
  count: number;
  gross: number; // settled total (incl. tax) in USD
  net: number; // excl. tax
  tax: number;
  discounts: number;
  cashUsd: number;
  cashLbp: number;
  card: number; // USD
  eservices: number; // USD (wallets / OMT / Whish / partner settlements)
  voids: number;
  byMethod: Record<string, number>; // USD
}

const isCard = (m: string) => /CARD|VISA|MASTER|POS/.test(m);
const isEService = (m: string) => /WHISH|ONLINE|OMT|WALLET|PARTNER|E-?SERVICE|TRANSFER|CHEQUE_ONLINE/.test(m);

/** Totals in USD for posted invoices strictly after `sinceMs` (0 = all). */
export function eodTotals(posted: PostedInvoice[], voided: VoidedInvoice[], sinceMs: number, rate: number): EodTotals {
  const t: EodTotals = { count: 0, gross: 0, net: 0, tax: 0, discounts: 0, cashUsd: 0, cashLbp: 0, card: 0, eservices: 0, voids: 0, byMethod: {} };
  const usd = (inv: PostedInvoice, v: number) => (inv.ccy === 'USD' ? v : v / rate) * inv.sign;
  posted.forEach((inv) => {
    if (sinceMs && !(inv.ts > sinceMs)) return;
    t.count++;
    t.gross += usd(inv, inv.total);
    t.tax += usd(inv, inv.tax);
    t.net += usd(inv, inv.total - inv.tax);
    t.discounts += usd(inv, inv.discount);
    inv.pays.forEach((p) => {
      const v = (p.ccy === 'USD' ? p.amount : p.amount / rate) * inv.sign;
      t.byMethod[p.method] = (t.byMethod[p.method] || 0) + v;
      if (isEService(p.method)) t.eservices += v;
      else if (isCard(p.method)) t.card += v;
      else if (p.ccy === 'LBP') t.cashLbp += p.amount * inv.sign;
      else t.cashUsd += v;
    });
  });
  voided.forEach((v) => {
    if (!sinceMs || v.ts > sinceMs) t.voids++;
  });
  return t;
}
