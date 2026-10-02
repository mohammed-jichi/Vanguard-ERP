import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseClient';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const INITIAL_FACILITY_STAFF = [
  {
    id: '641',
    name: 'Jichi Mohammed',
    department: 'Management',
    email: 'mohammed.jichi@gmail.com',
    emailVerified: true,
    emailApproved: true,
    phone: '+961 70 767 3828',
    phoneVerified: true,
    phoneApproved: true,
    receiveEmailAlerts: true,
    receiveWhatsAppAlerts: true,
    alertEndOfDay: true,
    alertItemExpiry: true,
    alertLowStock: true,
  },
  {
    id: '642',
    name: 'Hussien Jichi',
    department: 'Owners',
    email: 'jamaljichihusseinmahdi@gmail.com',
    emailVerified: true,
    emailApproved: true,
    phone: '+961 71 390 241',
    phoneVerified: true,
    phoneApproved: true,
    receiveEmailAlerts: true,
    receiveWhatsAppAlerts: true,
    alertEndOfDay: true,
    alertItemExpiry: true,
    alertLowStock: true,
  },
  {
    id: '644',
    name: 'Hussein Jichi',
    department: 'Accounting',
    email: 'hussein.jichi@southernolive-lb.com',
    emailVerified: true,
    emailApproved: true,
    phone: '+961 81 958 823',
    phoneVerified: true,
    phoneApproved: true,
    receiveEmailAlerts: true,
    receiveWhatsAppAlerts: true,
    alertEndOfDay: true,
    alertItemExpiry: true,
    alertLowStock: true,
  },
  {
    id: '649',
    name: 'Hiba Aloulou',
    department: 'Sales',
    email: 'hiba.aloulou@southernolive-lb.com',
    emailVerified: true,
    emailApproved: true,
    phone: '+961 78 846 247',
    phoneVerified: true,
    phoneApproved: true,
    receiveEmailAlerts: true,
    receiveWhatsAppAlerts: true,
    alertEndOfDay: true,
    alertItemExpiry: false,
    alertLowStock: false,
  },
];

const DUMMY_STAFF_NAMES = [
  'Sarah Khoury',
  'Ali Hassan',
  'Youssef Abboud',
  'Laila Harb',
  'Rami Haddad',
  'Karim Daher',
  'Samir Mansour',
  'Nadine Ahmar',
  'Rana Jichi',
];

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get('search') || '').trim().toLowerCase();
    const department = searchParams.get('department') || 'All Departments';
    const status = searchParams.get('status') || 'All Statuses';
    const tenantId = searchParams.get('tenantId') || '00000000-0000-0000-0000-000000000001';

    const supabase = getSupabaseServerClient();

    // 1. Fetch current tenant feature flags containing employee notification preferences
    const { data: tenant, error: fetchErr } = await supabase
      .from('tenants')
      .select('feature_flags')
      .eq('id', tenantId)
      .maybeSingle();

    let staffList = tenant?.feature_flags?.employee_notification_preferences;

    // 2. Initialize in Supabase if not yet seeded or if dummy employees detected
    const hasLegacyMock =
      !Array.isArray(staffList) ||
      staffList.length === 0 ||
      staffList.length > 4 ||
      staffList.some((emp: any) => DUMMY_STAFF_NAMES.includes(emp.name));

    if (hasLegacyMock) {
      staffList = INITIAL_FACILITY_STAFF;
      try {
        const existingFlags = tenant?.feature_flags || {};
        await supabase
          .from('tenants')
          .update({
            feature_flags: {
              ...existingFlags,
              employee_notification_preferences: INITIAL_FACILITY_STAFF,
            },
          })
          .eq('id', tenantId);
      } catch (seedErr) {
        console.warn('[API /api/notifications/employees] Auto-seed warning:', seedErr);
      }
    }

    // 3. Apply live query filtering
    let results = [...staffList];

    if (department && department !== 'All Departments') {
      results = results.filter((emp: any) =>
        emp.department?.toLowerCase() === department.toLowerCase()
      );
    }

    if (search) {
      results = results.filter((emp: any) => {
        const nameMatch = emp.name?.toLowerCase().includes(search);
        const emailMatch = emp.email?.toLowerCase().includes(search);
        const phoneMatch = emp.phone?.toLowerCase().includes(search);
        return nameMatch || emailMatch || phoneMatch;
      });
    }

    if (status === 'Approved, Not Verified') {
      results = results.filter((emp: any) =>
        (emp.emailApproved && !emp.emailVerified) || (emp.phoneApproved && !emp.phoneVerified)
      );
    } else if (status === 'Verified, Not Approved') {
      results = results.filter((emp: any) =>
        (emp.emailVerified && !emp.emailApproved) || (emp.phoneVerified && !emp.phoneApproved)
      );
    } else if (status === 'Notification Type Assigned') {
      results = results.filter((emp: any) =>
        emp.alertEndOfDay ||
        emp.alertItemExpiry ||
        emp.alertLowStock ||
        emp.receiveEmailAlerts ||
        emp.receiveWhatsAppAlerts
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: results,
        total: results.length,
      },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error('[API /api/notifications/employees] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
