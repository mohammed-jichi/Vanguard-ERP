import { NextResponse } from 'next/server';
import { getSupabaseServerClient, SUPABASE_URL } from '@/lib/supabaseClient';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-application-name',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fetchAll = searchParams.get('all') === 'true';
    const rawId = searchParams.get('id');

    const supabase = getSupabaseServerClient();

    if (fetchAll) {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[API /api/organization] GET all error:', error);
        return NextResponse.json(
          { success: false, error: error.message, targetUrl: SUPABASE_URL },
          { status: 500, headers: CORS_HEADERS }
        );
      }

      return NextResponse.json({ success: true, data }, { headers: CORS_HEADERS });
    }

    const targetId = (rawId && rawId !== '1300' && !String(rawId).startsWith('comp-'))
      ? String(rawId)
      : '00000000-0000-0000-0000-000000000001';

    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', targetId)
      .maybeSingle();

    if (error) {
      console.error('[API /api/organization] GET tenant error:', error);
      return NextResponse.json(
        { success: false, error: error.message, targetUrl: SUPABASE_URL },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: `Tenant #${targetId} not found in database.` },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json({ success: true, data }, { headers: CORS_HEADERS });
  } catch (err: any) {
    console.error('[API /api/organization] Unexpected GET error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error fetching tenant organization profile.' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function POST(request: Request) {
  return handleUpdate(request);
}

export async function PUT(request: Request) {
  return handleUpdate(request);
}

export async function PATCH(request: Request) {
  return handleUpdate(request);
}

async function handleUpdate(request: Request) {
  try {
    const body = await request.json();
    const rawId = body.targetId || body.id;
    const targetId = (rawId && rawId !== '1300' && !String(rawId).startsWith('comp-'))
      ? String(rawId)
      : '00000000-0000-0000-0000-000000000001';

    const inputData = body.payload || body.updates || body.settings || body;
    const supabase = getSupabaseServerClient();

    // 1. Fetch existing tenant to safely preserve all existing feature_flags and columns
    const { data: existingTenant, error: fetchErr } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', targetId)
      .maybeSingle();

    if (fetchErr) {
      console.warn('[API /api/organization] Notice fetching existing tenant for merge:', fetchErr.message);
    }

    const existingFlags = existingTenant?.feature_flags || {};
    const inputFlags = inputData.feature_flags || {};

    const name = inputData.name || inputData.brandNameAr || inputData.brand_name_ar || existingTenant?.name || 'Vanguard Enterprise Client';
    const brand_name_ar = inputData.brandNameAr || inputData.brand_name_ar || inputData.name || existingTenant?.brand_name_ar;
    const brand_name_en = inputData.brandNameEn || inputData.brand_name_en || inputData.name || existingTenant?.brand_name_en;
    const logo_url = inputData.logoUrl !== undefined ? inputData.logoUrl : (inputData.logo_url !== undefined ? inputData.logo_url : existingTenant?.logo_url);
    const cr_number = inputData.companyRegistrationNumber || inputData.cr_number || inputData.crn || existingTenant?.cr_number;
    const tax_id = inputData.taxIdentificationNumber || inputData.tax_id || inputData.tin || existingTenant?.tax_id;
    const address = inputData.headquartersAddress || inputData.address || inputData.headquarters_address || existingTenant?.headquarters_address;
    const city = inputData.city !== undefined ? inputData.city : existingTenant?.city;
    const country = inputData.country !== undefined ? inputData.country : existingTenant?.country;
    const phone = inputData.phoneNumber || inputData.phone || inputData.phone_number || existingTenant?.phone_number;
    const billing_email = inputData.billingEmail || inputData.billing_email || inputData.email || existingTenant?.billing_email;
    const base_currency = inputData.baseCurrency || inputData.base_currency || existingTenant?.base_currency || 'USD';
    const secondary_currency = inputData.secondaryCurrency || inputData.secondary_currency || existingTenant?.secondary_currency || 'LBP';
    const exchange_rate_policy = inputData.exchangeRatePolicy || inputData.exchange_rate_policy || existingTenant?.exchange_rate_policy || 'PLATFORM_FIXED';
    const nowIso = new Date().toISOString();

    // Deeply merged feature_flags preserving all operational modules
    const mergedFeatureFlags = {
      ...existingFlags,
      ...inputFlags,
      corporate_profile: {
        ...(existingFlags.corporate_profile || {}),
        ...(inputFlags.corporate_profile || {}),
        legal_entity_name: name,
        trade_name_ar: brand_name_ar,
        trade_name_en: brand_name_en,
        cr_number: cr_number || 'CR-104928-LB',
        tax_id: tax_id || 'MOF-7489201',
        headquarters_address: address || 'Choueifat Industrial District, Mount Lebanon',
        city: city || 'Choueifat',
        country: country || 'Lebanon',
        phone_number: phone || '+961 5 430 890',
        billing_email: billing_email || 'operations@southernolive-lb.com',
        base_currency: base_currency,
        secondary_currency: secondary_currency,
        exchange_rate_policy: exchange_rate_policy,
        updated_at: nowIso
      }
    };

    if (inputData.enabledModules || inputData.enabled_modules) {
      mergedFeatureFlags.enabled_modules = inputData.enabledModules || inputData.enabled_modules;
    }

    const dbUpdates: Record<string, any> = {
      name,
      brand_name_ar,
      brand_name_en,
      logo_url,
      cr_number,
      tax_id,
      address,
      headquarters_address: address,
      city,
      country,
      phone,
      phone_number: phone,
      billing_email,
      base_currency,
      secondary_currency,
      exchange_rate_policy,
      feature_flags: mergedFeatureFlags,
      updated_at: nowIso
    };

    if (inputData.enabledModules || inputData.enabled_modules) {
      dbUpdates.enabled_modules = inputData.enabledModules || inputData.enabled_modules;
    }
    if (inputData.primaryColor || inputData.primary_color) {
      dbUpdates.primary_color = inputData.primaryColor || inputData.primary_color;
    }
    if (inputData.themeColor || inputData.theme_color) {
      dbUpdates.theme_color = inputData.themeColor || inputData.theme_color;
    }

    const { data: updatedData, error: updateErr } = await supabase
      .from('tenants')
      .update(dbUpdates)
      .eq('id', targetId)
      .select('*');

    if (updateErr) {
      console.error('[API /api/organization] Database update failed:', updateErr);
      return NextResponse.json(
        {
          success: false,
          error: updateErr.message,
          code: updateErr.code,
          details: updateErr.details || updateErr.message,
          targetUrl: SUPABASE_URL
        },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    if (!updatedData || updatedData.length === 0) {
      console.error('[API /api/organization] 0 rows matched for tenant ID:', targetId);
      return NextResponse.json(
        {
          success: false,
          error: `Tenant #${targetId} was not found in database. Changes were not persisted.`
        },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    console.log('[API /api/organization] Successfully updated tenant:', targetId);
    return NextResponse.json(
      {
        success: true,
        data: updatedData[0],
        message: 'Organization profile updated and persisted successfully to Supabase database.'
      },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error('[API /api/organization] Unexpected update error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Server error processing organization profile update.'
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
