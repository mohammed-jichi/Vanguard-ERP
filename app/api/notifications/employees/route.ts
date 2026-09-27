import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseClient';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const INITIAL_FACILITY_STAFF = [
  {
    id: 'emp-101',
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
    id: 'emp-102',
    name: 'Sarah Khoury',
    department: 'Accounting',
    email: 's.khoury@southernolive-lb.com',
    emailVerified: true,
    emailApproved: true,
    phone: '+961 71 882 110',
    phoneVerified: true,
    phoneApproved: true,
    receiveEmailAlerts: true,
    receiveWhatsAppAlerts: false,
    alertEndOfDay: true,
    alertItemExpiry: false,
    alertLowStock: false,
  },
  {
    id: 'emp-103',
    name: 'Ali Hassan',
    department: 'Production',
    email: 'ali.hassan@southernolive-lb.com',
    emailVerified: true,
    emailApproved: true,
    phone: '+961 70 882 101',
    phoneVerified: true,
    phoneApproved: true,
    receiveEmailAlerts: true,
    receiveWhatsAppAlerts: true,
    alertEndOfDay: true,
    alertItemExpiry: true,
    alertLowStock: true,
  },
  {
    id: 'emp-104',
    name: 'Youssef Abboud',
    department: 'Production',
    email: 'y.abboud@southernolive-lb.com',
    emailVerified: false,
    emailApproved: false,
    phone: '+961 70 112 233',
    phoneVerified: true,
    phoneApproved: false,
    receiveEmailAlerts: false,
    receiveWhatsAppAlerts: false,
    alertEndOfDay: true,
    alertItemExpiry: true,
    alertLowStock: true,
  },
  {
    id: 'emp-105',
    name: 'Laila Harb',
    department: 'Accounting',
    email: 'laila.harb@southernolive-lb.com',
    emailVerified: true,
    emailApproved: false,
    phone: '+961 71 556 677',
    phoneVerified: false,
    phoneApproved: false,
    receiveEmailAlerts: false,
    receiveWhatsAppAlerts: false,
    alertEndOfDay: true,
    alertItemExpiry: false,
    alertLowStock: false,
  },
  {
    id: 'emp-106',
    name: 'Rami Haddad',
    department: 'Sales',
    email: 'rami.h@southernolive-lb.com',
    emailVerified: false,
    emailApproved: false,
    phone: '+961 70 998 877',
    phoneVerified: false,
    phoneApproved: false,
    receiveEmailAlerts: false,
    receiveWhatsAppAlerts: false,
    alertEndOfDay: false,
    alertItemExpiry: false,
    alertLowStock: true,
  },
  {
    id: 'emp-107',
    name: 'Karim Daher',
    department: 'Stores',
    email: 'k.daher@southernolive-lb.com',
    emailVerified: true,
    emailApproved: true,
    phone: '+961 71 556 677',
    phoneVerified: false,
    phoneApproved: false,
    receiveEmailAlerts: true,
    receiveWhatsAppAlerts: false,
    alertEndOfDay: true,
    alertItemExpiry: true,
    alertLowStock: true,
  },
  {
    id: 'emp-108',
    name: 'Samir Mansour',
    department: 'Maintenance',
    email: 'samir.m@southernolive-lb.com',
    emailVerified: false,
    emailApproved: false,
    phone: '+961 70 778 899',
    phoneVerified: true,
    phoneApproved: true,
    receiveEmailAlerts: false,
    receiveWhatsAppAlerts: true,
    alertEndOfDay: false,
    alertItemExpiry: false,
    alertLowStock: true,
  },
  {
    id: 'emp-109',
    name: 'Nadine Ahmar',
    department: 'Distribution',
    email: 'n.ahmar@southernolive-lb.com',
    emailVerified: true,
    emailApproved: true,
    phone: '+961 70 882 101',
    phoneVerified: true,
    phoneApproved: true,
    receiveEmailAlerts: true,
    receiveWhatsAppAlerts: true,
    alertEndOfDay: true,
    alertItemExpiry: true,
    alertLowStock: true,
  },
  {
    id: 'emp-110',
    name: 'Rana Jichi',
    department: 'Customer Care',
    email: 'rana.jichi@southernolive-lb.com',
    emailVerified: true,
    emailApproved: true,
    phone: '+961 71 553 490',
    phoneVerified: true,
    phoneApproved: true,
    receiveEmailAlerts: true,
    receiveWhatsAppAlerts: true,
    alertEndOfDay: true,
    alertItemExpiry: false,
    alertLowStock: false,
  },
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

    // 2. Initialize in Supabase if not yet seeded
    if (!Array.isArray(staffList) || staffList.length === 0) {
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
