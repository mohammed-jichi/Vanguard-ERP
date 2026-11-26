import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

const DEFAULT_TENANT = '00000000-0000-0000-0000-000000000001';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FLAG_KEY = 'hr_payroll_runs';

const tenantOf = (raw: any) => (raw && UUID_RE.test(String(raw)) ? String(raw) : DEFAULT_TENANT);
const isMissingTable = (e: any) => !!e && (e.code === '42P01' || e.code === 'PGRST205' || /does not exist|schema cache/i.test(e.message || ''));

const toCamel = (r: any) => ({
  id: r.id,
  year: r.year,
  month: r.month,
  brand: r.brand || '',
  branch: r.branch || '',
  label: r.label || '',
  totalSalary: Number(r.total_salary) || 0,
  currency: r.currency || 'USD',
  status: r.status || 'Draft',
  lines: Array.isArray(r.lines) ? r.lines : [],
  savedAt: r.saved_at
});

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

/** GET ?id=<tenant uuid> -> { runs, storage } */
export async function GET(request: Request) {
  try {
    const tenantId = tenantOf(new URL(request.url).searchParams.get('id'));
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.from('hr_payroll_runs').select('*').eq('tenant_id', tenantId).order('saved_at', { ascending: false });
    if (!error) return NextResponse.json({ success: true, runs: (data || []).map(toCamel), storage: 'table' });
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
    const row = { id: run.id, tenant_id: tenantId, year: run.year, month: run.month, brand: run.brand || '', branch: run.branch || '', label: run.label || '', total_salary: Number(run.totalSalary) || 0, currency: run.currency || 'USD', status: run.status || 'Draft', lines: run.lines || [], saved_at: new Date().toISOString() };
    const { error } = await supabase.from('hr_payroll_runs').upsert(row, { onConflict: 'id' });
    if (!error) return NextResponse.json({ success: true, storage: 'table' });
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
    const { error } = await supabase.from('hr_payroll_runs').delete().eq('tenant_id', tenantId).eq('id', runId);
    if (!error) return NextResponse.json({ success: true });
    if (!isMissingTable(error)) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    const flags = await readFlags(supabase, tenantId);
    flags[FLAG_KEY] = (Array.isArray(flags[FLAG_KEY]) ? flags[FLAG_KEY] : []).filter((r: any) => r.id !== runId);
    await writeFlags(supabase, tenantId, flags);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Server error' }, { status: 500 });
  }
}
