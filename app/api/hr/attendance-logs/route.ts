import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getSupabaseServerClient } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

const DEFAULT_TENANT = '00000000-0000-0000-0000-000000000001';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FLAG_KEY = 'hr_attendance_logs';
const MAX_FALLBACK = 20000;

const tenantOf = (raw: any) => (raw && UUID_RE.test(String(raw)) ? String(raw) : DEFAULT_TENANT);
const isMissingTable = (e: any) => !!e && (e.code === '42P01' || e.code === 'PGRST205' || (/does not exist|schema cache/i.test(e.message || '') && !/column/i.test(e.message || '')));

/** Live table uses uuid ids: derive a stable uuid from the punch key. */
const toUuid = (key: string) => {
  const h = createHash('sha1').update(`vanguard-punch:${key}`).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
};

const toCamel = (r: any) => ({
  id: r.id,
  employeeId: r.employee_id,
  employeeName: r.employee_name || '',
  brand: r.brand || '',
  branch: r.branch || '',
  punchIn: r.punch_in,
  punchOut: r.punch_out,
  durationHours: r.duration_minutes != null ? Math.round((Number(r.duration_minutes) / 60) * 100) / 100 : Number(r.duration_hours) || 0,
  source: r.source || ''
});

/** GET ?id=<tenant uuid> -> { logs, storage } (public.hr_attendance_logs, or tenant settings until that table exists) */
export async function GET(request: Request) {
  try {
    const tenantId = tenantOf(new URL(request.url).searchParams.get('id'));
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.from('hr_attendance_logs').select('*').eq('tenant_id', tenantId).order('punch_in', { ascending: false }).limit(MAX_FALLBACK);
    if (!error) return NextResponse.json({ success: true, logs: (data || []).map(toCamel), storage: 'table' });
    if (!isMissingTable(error)) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    const { data: t } = await supabase.from('tenants').select('feature_flags').eq('id', tenantId).maybeSingle();
    const logs = Array.isArray((t?.feature_flags as any)?.[FLAG_KEY]) ? (t!.feature_flags as any)[FLAG_KEY] : [];
    return NextResponse.json({ success: true, logs, storage: 'tenant_settings' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Server error' }, { status: 500 });
  }
}

/** POST { id, rows: [{employeeId, employeeName, brand, branch, punchIn, punchOut, source}] } -> imports punches */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tenantId = tenantOf(body?.id);
    const rows: any[] = Array.isArray(body?.rows) ? body.rows : [];
    if (rows.length === 0) return NextResponse.json({ success: false, error: 'No rows to import' }, { status: 400 });

    const clean = rows
      .map((r, i) => {
        const pin = new Date(r.punchIn);
        const pout = r.punchOut ? new Date(r.punchOut) : null;
        if (!r.employeeId || isNaN(pin.getTime())) return null;
        const hours = pout && !isNaN(pout.getTime()) ? Math.max(0, (pout.getTime() - pin.getTime()) / 3600000) : Number(r.durationHours) || 0;
        return {
          id: `${r.employeeId}-${pin.getTime()}`,
          employeeId: String(r.employeeId),
          employeeName: r.employeeName || '',
          brand: r.brand || '',
          branch: r.branch || '',
          punchIn: pin.toISOString(),
          punchOut: pout && !isNaN(pout.getTime()) ? pout.toISOString() : null,
          durationHours: Math.round(hours * 100) / 100,
          source: r.source || 'import'
        };
      })
      .filter(Boolean) as any[];
    if (clean.length === 0) return NextResponse.json({ success: false, error: 'No valid rows (need an employee and a valid punch-in time)' }, { status: 400 });

    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from('hr_attendance_logs').upsert(
      clean.map((c) => ({ id: toUuid(c.id), tenant_id: tenantId, employee_id: c.employeeId, employee_name: c.employeeName, brand: c.brand, branch: c.branch, work_date: c.punchIn.slice(0, 10), punch_in: c.punchIn, punch_out: c.punchOut, duration_minutes: Math.round(c.durationHours * 60), source: c.source })),
      { onConflict: 'id' }
    );
    if (!error) return NextResponse.json({ success: true, imported: clean.length, storage: 'table' });
    if (!isMissingTable(error)) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    const { data: t, error: readErr } = await supabase.from('tenants').select('feature_flags').eq('id', tenantId).maybeSingle();
    if (readErr || !t) return NextResponse.json({ success: false, error: readErr?.message || 'Tenant not found' }, { status: 500 });
    const flags: Record<string, any> = { ...((t.feature_flags as any) || {}) };
    const existing: any[] = Array.isArray(flags[FLAG_KEY]) ? flags[FLAG_KEY] : [];
    const byId = new Map(existing.map((e) => [e.id, e]));
    clean.forEach((c) => byId.set(c.id, c));
    flags[FLAG_KEY] = Array.from(byId.values()).sort((a, b) => String(b.punchIn).localeCompare(String(a.punchIn))).slice(0, MAX_FALLBACK);
    const { data: upd, error: updErr } = await supabase.from('tenants').update({ feature_flags: flags, updated_at: new Date().toISOString() }).eq('id', tenantId).select('id');
    if (updErr) return NextResponse.json({ success: false, error: updErr.message }, { status: 500 });
    if (!upd || upd.length === 0) return NextResponse.json({ success: false, error: 'No rows were updated (blocked by RLS policy?)' }, { status: 403 });
    return NextResponse.json({ success: true, imported: clean.length, storage: 'tenant_settings' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Server error' }, { status: 500 });
  }
}
