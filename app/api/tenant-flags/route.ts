import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Tenant-scoped configuration keys that Sales setup screens may persist in tenants.feature_flags. */
const ALLOWED_KEYS = new Set([
  'last_end_of_day',
  'last_eod_closing',
  'end_of_day_log',
  'pos_screens',
  'payment_types',
  'discounts',
  'vouchers',
  'price_modes',
  'devices',
  'void_reasons',
  'vat_exemptions',
  'invoice_messages',
  'call_center_zones',
  'devices_printers',
  'closing_checklists',
  'hr_schedules',
  'hr_time_off',
  'hr_departments',
  'hr_designations',
  'hr_roles',
  'hr_schedule_templates',
  'hr_time_off_reasons',
  'hr_payment_settings',
  'hr_earnings_deductions',
  'hr_label_rates',
  'tutorials_url',
  'last_month_closed',
  'eom_log',
  'pos_screen_layouts',
  'currency_setup'
]);

const resolveTenant = (raw: string | null) => (raw && UUID_RE.test(raw) ? raw : DEFAULT_TENANT_ID);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = resolveTenant(searchParams.get('id'));
    const keys = (searchParams.get('keys') || '').split(',').map((k) => k.trim()).filter((k) => ALLOWED_KEYS.has(k));
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.from('tenants').select('feature_flags').eq('id', tenantId).maybeSingle();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    const flags: Record<string, any> = (data?.feature_flags as Record<string, any>) || {};
    const out: Record<string, any> = {};
    keys.forEach((k) => {
      if (flags[k] !== undefined) out[k] = flags[k];
    });
    return NextResponse.json({ success: true, flags: out });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Server error reading tenant flags' }, { status: 500 });
  }
}

/** POST { id, key, value, append? } - sets (or appends to) one allowed key in tenants.feature_flags. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tenantId = resolveTenant(body?.id ?? null);
    const key = String(body?.key || '');
    if (!ALLOWED_KEYS.has(key)) {
      return NextResponse.json({ success: false, error: `Key '${key}' is not allowed` }, { status: 400 });
    }
    const supabase = getSupabaseServerClient();
    const { data: tenant, error: readErr } = await supabase.from('tenants').select('feature_flags').eq('id', tenantId).maybeSingle();
    if (readErr) return NextResponse.json({ success: false, error: readErr.message }, { status: 500 });
    if (!tenant) return NextResponse.json({ success: false, error: `Tenant ${tenantId} not found` }, { status: 404 });

    const flags: Record<string, any> = { ...((tenant.feature_flags as Record<string, any>) || {}) };
    if (body?.append) {
      const list = Array.isArray(flags[key]) ? flags[key] : [];
      flags[key] = [body.value, ...list].slice(0, 500);
    } else {
      flags[key] = body?.value;
    }

    const { data: updated, error: updErr } = await supabase
      .from('tenants')
      .update({ feature_flags: flags, updated_at: new Date().toISOString() })
      .eq('id', tenantId)
      .select('id');
    if (updErr) return NextResponse.json({ success: false, error: updErr.message }, { status: 500 });
    if (!updated || updated.length === 0) {
      return NextResponse.json({ success: false, error: 'No rows were updated (blocked by RLS policy?)' }, { status: 403 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Server error saving tenant flag' }, { status: 500 });
  }
}
