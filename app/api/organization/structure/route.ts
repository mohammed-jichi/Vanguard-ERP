import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseClient';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Persists the brands / branches lists of a tenant into tenants.feature_flags
 * (read back by GET /api/organization).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = String(body?.id || DEFAULT_TENANT_ID);
    const kind = body?.kind;
    const items = body?.items;

    if (!['brands', 'branches'].includes(kind) || !Array.isArray(items)) {
      return NextResponse.json({ success: false, error: "Body must include kind ('brands'|'branches') and items[]" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { data: tenant, error: readErr } = await supabase.from('tenants').select('feature_flags').eq('id', id).maybeSingle();
    if (readErr) return NextResponse.json({ success: false, error: readErr.message }, { status: 500 });
    if (!tenant) return NextResponse.json({ success: false, error: `Tenant ${id} not found` }, { status: 404 });

    const flags = { ...((tenant.feature_flags as Record<string, any>) || {}), [kind]: items };
    const { data: updated, error: updErr } = await supabase
      .from('tenants')
      .update({ feature_flags: flags, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id');

    if (updErr) return NextResponse.json({ success: false, error: updErr.message }, { status: 500 });
    if (!updated || updated.length === 0) {
      return NextResponse.json({ success: false, error: 'No rows were updated (blocked by RLS policy?)' }, { status: 403 });
    }
    return NextResponse.json({ success: true, count: items.length });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Server error saving organization structure' }, { status: 500 });
  }
}
