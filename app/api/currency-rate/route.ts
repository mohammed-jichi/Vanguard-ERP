import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * POST { id, rate } - sets the tenant's USD/LBP exchange rate everywhere TenantContext reads it
 * (tenants.exchange_rate when the column exists, feature_flags.corporate_profile.exchange_rate, feature_flags.exchange_rate).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tenantId = body?.id && UUID_RE.test(String(body.id)) ? String(body.id) : DEFAULT_TENANT_ID;
    const rate = Number(body?.rate);
    if (!Number.isFinite(rate) || rate <= 0) {
      return NextResponse.json({ success: false, error: 'rate must be a number greater than 0' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { data: tenant, error: readErr } = await supabase.from('tenants').select('*').eq('id', tenantId).maybeSingle();
    if (readErr) return NextResponse.json({ success: false, error: readErr.message }, { status: 500 });
    if (!tenant) return NextResponse.json({ success: false, error: `Tenant ${tenantId} not found` }, { status: 404 });

    const flags: Record<string, any> = { ...((tenant.feature_flags as Record<string, any>) || {}) };
    flags.exchange_rate = rate;
    flags.corporate_profile = { ...(flags.corporate_profile || {}), exchange_rate: rate };

    const { data: updated, error: updErr } = await supabase
      .from('tenants')
      .update({ feature_flags: flags, updated_at: new Date().toISOString() })
      .eq('id', tenantId)
      .select('id');
    if (updErr) return NextResponse.json({ success: false, error: updErr.message }, { status: 500 });
    if (!updated || updated.length === 0) {
      return NextResponse.json({ success: false, error: 'No rows were updated (blocked by RLS policy?)' }, { status: 403 });
    }

    // Keep the dedicated column in sync when the deployment has one (ignored otherwise).
    if ('exchange_rate' in tenant) {
      await supabase.from('tenants').update({ exchange_rate: rate }).eq('id', tenantId);
    }
    return NextResponse.json({ success: true, rate });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Server error saving exchange rate' }, { status: 500 });
  }
}
