import { getSupabaseServerClient } from '@/lib/supabaseClient';
import { verifyAlertToken } from '@/lib/notifications/verification';
import { CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default async function VerifyAlertsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const token = searchParams.token as string;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 font-sans p-6">
        <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center max-w-md w-full shadow-xl">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold mb-2">Invalid Request</h1>
          <p className="text-sm text-slate-500">Missing verification token.</p>
        </div>
      </div>
    );
  }

  const { payload, valid } = verifyAlertToken(token);

  if (!valid || !payload) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 font-sans p-6">
        <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center max-w-md w-full shadow-xl">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold mb-2">Expired or Corrupt Link</h1>
          <p className="text-sm text-slate-500">
            This verification link has expired or is invalid. Please ask your administrator to resend the verification.
          </p>
        </div>
      </div>
    );
  }

  const { tenantId, employeeId, channel, recipient, name } = payload;
  const isEmail = channel === 'email';

  try {
    const supabase = getSupabaseServerClient();
    const { data: tenant } = await supabase
      .from('tenants')
      .select('feature_flags')
      .eq('id', tenantId)
      .maybeSingle();

    const existingFlags = tenant?.feature_flags || {};
    const prefsList = Array.isArray(existingFlags.employee_notification_preferences)
      ? [...existingFlags.employee_notification_preferences]
      : [];

    let found = false;
    const updatedPrefs = prefsList.map((emp: any) => {
      if (emp.id === employeeId || emp.email === recipient || emp.phone === recipient) {
        found = true;
        if (isEmail) {
          return {
            ...emp,
            emailVerified: true,
            emailApproved: true,
            verified: true,
            approved: true,
          };
        } else {
          return {
            ...emp,
            phoneVerified: true,
            phoneApproved: true,
            verified: true,
            approved: true,
          };
        }
      }
      return emp;
    });

    if (!found) {
      updatedPrefs.push({
        id: employeeId,
        name: name || 'Verified Employee',
        department: 'Management',
        email: isEmail ? recipient : '',
        emailVerified: isEmail,
        emailApproved: isEmail,
        phone: !isEmail ? recipient : '',
        phoneVerified: !isEmail,
        phoneApproved: !isEmail,
        receiveEmailAlerts: isEmail,
        receiveWhatsAppAlerts: !isEmail,
        alertEndOfDay: true,
        alertItemExpiry: true,
        alertLowStock: true,
        verified: true,
        approved: true,
      });
    }

    await supabase
      .from('tenants')
      .update({
        feature_flags: {
          ...existingFlags,
          employee_notification_preferences: updatedPrefs,
          last_verification_event: {
            empId: employeeId,
            type: channel,
            recipient,
            timestamp: new Date().toISOString(),
          },
        },
      })
      .eq('id', tenantId);

    // Also attempt update in public.employees if table exists
    try {
      if (isEmail) {
        await supabase.from('employees').update({ verified: true, approved: true }).eq('email', recipient);
      } else {
        await supabase.from('employees').update({ verified: true, approved: true }).eq('phone', recipient);
      }
    } catch (e) {}
  } catch (err) {
    console.warn('[Verify Alerts] Database update warning:', err);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 font-sans p-6">
      <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center max-w-md w-full shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 to-emerald-500"></div>
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-inner">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-extrabold mb-3 text-slate-800">Alerts Activated Successfully</h1>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed">
          Your Vanguard ERP notification profile is now active. You will receive automated alerts and reports to this {channel}.
        </p>
        <Link
          href="/"
          className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
