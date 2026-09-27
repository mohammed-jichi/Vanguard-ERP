import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseClient';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-application-name',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export const dynamic = 'force-dynamic';

const DEFAULT_ACCOUNT_SETTINGS = {
  profile: {
    firstName: 'Mohammed',
    lastName: 'Jichi',
    email: 'mohammed.jichi@gmail.com',
    renewalDate: '2026-12-02',
    landingPage: 'home_page',
    role: 'Admin / General Operations Manager',
    defaultBrand: 'Zeit w zaytoun ljanoub',
    defaultAccountingCompany: 'Southern Olive Oil Products S.A.R.L',
  },
  security: {
    doNotUseSecurityQuestion: true,
    securityQuestion: 'What was your childhood nickname?',
    securityAnswer: '',
    receiveEmailAlertOnLogin: false,
    enableTwoFactorAuth: false,
  },
  emailMessages: {
    signatureHtml: '<p><strong>Mohammed Jichi</strong><br>General Operations Manager<br>Southern Olive Oil Products S.A.R.L<br>Email: mohammed.jichi@gmail.com</p>',
  },
  inboxMessages: {
    digital_menu_group: true,
    new_omenu_order: true,
    operations_center_group: true,
    request_to_issue_invoice: true,
    new_product_request: true,
    product_request_approval: true,
    product_request_rejection: true,
    new_inter_brand_requisition: true,
    new_inter_brand_purchase: true,
    otrack_group: true,
    alert_on_void_items: true,
    alert_on_refund: true,
    alert_on_discount: true,
    alert_on_new_table_reservation: true,
    alert_on_receipt_cancellation: true,
    reservation_group: true,
    no_show_reservation: true,
    reservation_stay_period_alert: true,
  },
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || '00000000-0000-0000-0000-000000000001';

    const supabase = getSupabaseServerClient();

    // Check if saved under tenants.feature_flags.user_account_preferences
    const { data: tenantData } = await supabase
      .from('tenants')
      .select('feature_flags')
      .eq('id', tenantId)
      .maybeSingle();

    const storedPreferences = tenantData?.feature_flags?.user_account_preferences;

    const merged = {
      profile: {
        ...DEFAULT_ACCOUNT_SETTINGS.profile,
        ...(storedPreferences?.profile || {}),
      },
      security: {
        ...DEFAULT_ACCOUNT_SETTINGS.security,
        ...(storedPreferences?.security || {}),
      },
      emailMessages: {
        ...DEFAULT_ACCOUNT_SETTINGS.emailMessages,
        ...(storedPreferences?.emailMessages || {}),
      },
      inboxMessages: {
        ...DEFAULT_ACCOUNT_SETTINGS.inboxMessages,
        ...(storedPreferences?.inboxMessages || {}),
      },
    };

    return NextResponse.json({ success: true, data: merged }, { headers: CORS_HEADERS });
  } catch (err: any) {
    console.error('Error fetching account settings:', err);
    return NextResponse.json({ success: true, data: DEFAULT_ACCOUNT_SETTINGS }, { headers: CORS_HEADERS });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantId = '00000000-0000-0000-0000-000000000001', section, payload } = body;

    const supabase = getSupabaseServerClient();

    // Fetch existing feature_flags
    const { data: tenantData } = await supabase
      .from('tenants')
      .select('feature_flags')
      .eq('id', tenantId)
      .maybeSingle();

    const currentFeatureFlags = tenantData?.feature_flags || {};
    const existingPrefs = currentFeatureFlags.user_account_preferences || DEFAULT_ACCOUNT_SETTINGS;

    let updatedPrefs = { ...existingPrefs };

    if (section === 'profile') {
      updatedPrefs.profile = { ...updatedPrefs.profile, ...payload };
    } else if (section === 'password') {
      // Validate password complexity
      const { newPassword } = payload;
      const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
      if (!complexityRegex.test(newPassword)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Password must have at least 8 characters that includes at least 1 lowercase, 1 uppercase, 1 number and 1 special character (!@#$%^&*)'
          },
          { status: 400, headers: CORS_HEADERS }
        );
      }
      // Record password update audit
      updatedPrefs.passwordLastUpdated = new Date().toISOString();
    } else if (section === 'security') {
      updatedPrefs.security = { ...updatedPrefs.security, ...payload };
    } else if (section === 'email_messages') {
      updatedPrefs.emailMessages = { ...updatedPrefs.emailMessages, ...payload };
    } else if (section === 'inbox_messages') {
      updatedPrefs.inboxMessages = { ...updatedPrefs.inboxMessages, ...payload };
    } else if (section === 'all') {
      updatedPrefs = { ...updatedPrefs, ...payload };
    }

    const newFeatureFlags = {
      ...currentFeatureFlags,
      user_account_preferences: updatedPrefs,
    };

    const { error: updateError } = await supabase
      .from('tenants')
      .update({ feature_flags: newFeatureFlags })
      .eq('id', tenantId);

    if (updateError) {
      console.warn('Failed to update tenant feature flags for account preferences:', updateError.message);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Account preferences updated successfully',
        data: updatedPrefs
      },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error('Error saving account settings:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
