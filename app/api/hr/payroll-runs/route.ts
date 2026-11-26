import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getSupabaseServerClient } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

const DEFAULT_TENANT = '00000000-0000-0000-0000-000000000001';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FLAG_KEY = 'hr_payroll_runs';

const tenantOf = (raw: any) => (raw && UUID_RE.test(String(raw)) ? String(raw) : DEFAULT_TENANT);
const isMissingTable = (e: any) => !!e && (e.code === '42P01' || e.code === 'PGRST205' || /does not exist|schema cache/i.test(e.message || '') && !/column/i.test(e.message || ''));

/** Live table uses uuid ids: keep real uuids, map any legacy id (e.g. "run-123") to a stable uuid. */
const toUuid = (id: string) => {
  if (UUID_RE.test(id)) return id;
  const h = createHash('sha1').update(`vanguard-payroll-run:${id}`).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
};

const toCamel = (r: any) => ({
  id: r.id,
  year: r.year,
  month: r.month,
  brand: r.brand || '',
  branch: r.branch || '',
  label: r.processing_label || '',
  totalSalary: Number(r.total_salary) || 0,
  currency: r.currency || 'USD',
  status: r.status || 'Draft',
  lines: Array.isArray(r.line_items) && r.line_items.length ? r.line_items : Array.isArray(r.items) ? r.items : [],
  savedAt: r.saved_at
});

/** Maps a UI run onto the live public.hr_payroll_runs columns. */
const toRow = (run: any, tenantId: string, rate: number) => {
  const lines: any[] = Array.isArray(run.lines) ? run.lines : [];
  const num = (v: any) => Number(v) || 0;
  const gross = lines.filter((l) => l.labelType === 'Earning').reduce((s, l) => s + num(l.amount), 0);
  const ded = lines.filter((l) => l.labelType === 'Deduction' && !l.employer).reduce((s, l) => s + num(l.amount), 0);
  const employer = lines.filter((l) => l.employer).reduce((s, l) => s + num(l.amount), 0);
  const now = new Date().toISOString();
  const status = run.status === 'Posted' ? 'Posted' : 'Draft';
  return {
    id: toUuid(String(run.id)),
    tenant_id: tenantId,
    year: Number(run.year),
    month: Number(run.month),
    brand: run.brand || '',
    branch: run.branch || '',
    processing_label: run.label || `Salary ${run.month}/${run.year}`,
    currency: run.currency || 'USD',
    exchange_rate: rate,
    total_salary: num(run.totalSalary) || gross - ded,
    total_gross: gross,
    total_deductions: ded,
    total_net: gross - ded,
    employer_burden: employer,
    status,
    items: lines,
    line_items: lines,
    saved_at: now,
    posted_at: status === 'Posted' ? now : null
  };
};

async function readFlags(supabase: any, tenantId: string) {
  const { data, error } = await supabase.from('tenants').select('feature_flags').eq('id', tenantId).maybeSingle();
  if (error || !data) throw new Error(error?.message || 'Tenant not found');
  return { ...((data.feature_flags as any) || {}) } as Record<string, any>;
}

async function writeFlags(supabase: any, tenantId: string, flags: Record<string, any>) {
  const { data, error } = await supabase.from('tenants').update({ feature_flags: flags, updated_at: new Date().toISOString() }).eq('id', tenantId).select('id');
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('No rows were updated (blocked by RLS policy?)');
}

const rateOf = (flags: Record<string, any>) => Number(flags?.exchange_rate ?? flags?.usd_lbp_rate ?? flags?.lbp_rate) || 89500;

/** GET ?id=<tenant uuid> -> { runs, storage }. Runs previously kept in tenant settings are moved into the table once. */
export async function GET(request: Request) {
  try {
    const tenantId = tenantOf(new URL(request.url).searchParams.get('id'));
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.from('hr_payroll_runs').select('*').eq('tenant_id', tenantId).order('saved_at', { ascending: false });
    if (!error) {
      if ((data || []).length === 0) {
        // One-time migration of legacy runs saved while the table did not exist.
        try {
          const flags = await readFlags(supabase, tenantId);
          const legacy: any[] = Array.isArray(flags[FLAG_KEY]) ? flags[FLAG_KEY] : [];
          if (legacy.length) {
            const rows = legacy.filter((r) => r?.id && r.year && r.month).map((r) => toRow(r, tenantId, rateOf(flags)));
            const up = await supabase.from('hr_payroll_runs').upsert(rows, { onConflict: 'id' });
            if (!up.error) {
              const again = await supabase.from('hr_payroll_runs').select('*').eq('tenant_id', tenantId).order('saved_at', { ascending: false });
              return NextResponse.json({ success: true, runs: (again.data || []).map(toCamel), storage: 'table' });
            }
          }
        } catch {
          /* migration is best-effort */
        }
      }
      return NextResponse.json({ success: true, runs: (data || []).map(toCamel), storage: 'table' });
    }
    if (!isMissingTable(error)) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    const flags = await readFlags(supabase, tenantId);
    return NextResponse.json({ success: true, runs: Array.isArray(flags[FLAG_KEY]) ? flags[FLAG_KEY] : [], storage: 'tenant_settings' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Server error' }, { status: 500 });
  }
}

/** POST { id, run } upserts one payroll run (status Draft or Posted). */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tenantId = tenantOf(body?.id);
    const run = body?.run;
    if (!run?.id || !run.year || !run.month) return NextResponse.json({ success: false, error: 'run.id, year and month are required' }, { status: 400 });
    const supabase = getSupabaseServerClient();
    let rate = 89500;
    try {
      rate = rateOf(await readFlags(supabase, tenantId));
    } catch {
      /* default rate */
    }
    const row = toRow(run, tenantId, rate);
    const { error } = await supabase.from('hr_payroll_runs').upsert(row, { onConflict: 'id' });
    if (!error) return NextResponse.json({ success: true, storage: 'table', id: row.id });
    if (!isMissingTable(error)) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    const flags = await readFlags(supabase, tenantId);
    const list: any[] = Array.isArray(flags[FLAG_KEY]) ? flags[FLAG_KEY] : [];
    const saved = { ...run, savedAt: row.saved_at };
    flags[FLAG_KEY] = [saved, ...list.filter((r) => r.id !== run.id)];
    await writeFlags(supabase, tenantId, flags);
    return NextResponse.json({ success: true, storage: 'tenant_settings' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Server error' }, { status: 500 });
  }
}

/** DELETE ?id=<tenant uuid>&runId=<run id> */
export async function DELETE(request: Request) {
  try {
    const sp = new URL(request.url).searchParams;
    const tenantId = tenantOf(sp.get('id'));
    const runId = sp.get('runId');
    if (!runId) return NextResponse.json({ success: false, error: 'runId is required' }, { status: 400 });
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from('hr_payroll_runs').delete().eq('tenant_id', tenantId).eq('id', toUuid(runId));
    if (!error) return NextResponse.json({ success: true });
    if (!isMissingTable(error)) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    const flags = await readFlags(supabase, tenantId);
    const list: any[] = Array.isArray(flags[FLAG_KEY]) ? flags[FLAG_KEY] : [];
    flags[FLAG_KEY] = list.filter((r) => r.id !== runId);
    await writeFlags(supabase, tenantId, flags);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Server error' }, { status: 500 });
  }
}
