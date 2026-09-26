import { NextResponse } from 'next/server';
import { getSupabaseServerClient, supabase, SUPABASE_URL } from '@/lib/supabaseClient';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || '00000000-0000-0000-0000-000000000001';

    // 1. Check if public.employee_notification_preferences table exists in Supabase
    try {
      const { data: tableData, error: tableError } = await supabase
        .from('employee_notification_preferences')
        .select('*');

      if (!tableError && tableData && tableData.length > 0) {
        return NextResponse.json({ success: true, data: tableData }, { headers: CORS_HEADERS });
      }
    } catch (e) {
      // table might not exist in schema cache
    }

    // 2. Fallback to tenant feature_flags JSON store
    const { data: tenant, error: tenantErr } = await supabase
      .from('tenants')
      .select('feature_flags')
      .eq('id', tenantId)
      .maybeSingle();

    if (!tenantErr && tenant?.feature_flags?.employee_notification_preferences) {
      return NextResponse.json(
        {
          success: true,
          data: tenant.feature_flags.employee_notification_preferences,
          source: 'tenant_feature_flags',
        },
        { headers: CORS_HEADERS }
      );
    }

    return NextResponse.json({ success: true, data: null }, { headers: CORS_HEADERS });
  } catch (err: any) {
    console.warn('[API /api/notifications/preferences] GET error:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const preferences = body.preferences || body;
    const tenantId = body.tenantId || '00000000-0000-0000-0000-000000000001';

    // 1. Try persisting to public.employee_notification_preferences if available
    try {
      if (Array.isArray(preferences)) {
        await supabase
          .from('employee_notification_preferences')
          .upsert(preferences);
      }
    } catch (e) {
      // ignore table schema errors
    }

    // 2. Persist to tenant feature_flags in Supabase
    const { data: tenantData } = await supabase
      .from('tenants')
      .select('feature_flags')
      .eq('id', tenantId)
      .maybeSingle();

    const existingFlags = tenantData?.feature_flags || {};
    const updatedFlags = {
      ...existingFlags,
      employee_notification_preferences: preferences,
      employee_notification_preferences_updated_at: new Date().toISOString(),
    };

    const { error: updateErr } = await supabase
      .from('tenants')
      .update({ feature_flags: updatedFlags })
      .eq('id', tenantId);

    if (updateErr) {
      console.warn('[API /api/notifications/preferences] Supabase update warning:', updateErr.message);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Employee alert data updated successfully',
        timestamp: new Date().toISOString(),
      },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error('[API /api/notifications/preferences] POST error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}
