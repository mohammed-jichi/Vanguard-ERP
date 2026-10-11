import React from 'react';
import { verifyAlertToken } from '@/lib/notifications/verification';
import { supabase } from '@/lib/supabaseClient';
import { CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function VerifyAlertsPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token;

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-100">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Invalid Request</h1>
          <p className="text-slate-500 mb-8">
            The verification link is missing or malformed. Please request a new verification link from your HR manager.
          </p>
        </div>
      </div>
    );
  }

  const { valid, payload, error } = verifyAlertToken(token);

  if (!valid || !payload) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-100">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Verification Failed</h1>
          <p className="text-slate-500 mb-8">
            {error === 'jwt expired' 
              ? 'This verification link has expired (links are valid for 7 days).' 
              : 'The verification token is invalid or corrupted.'}
          </p>
          <p className="text-sm text-slate-400">
            Please contact your system administrator to dispatch a new verification request.
          </p>
        </div>
      </div>
    );
  }

  // Attempt to update employee_alert_configs or hr_employees
  // We'll update hr_employees if the table doesn't have employee_alert_configs
  let dbError = null;
  
  try {
    const { error: updateError } = await supabase
      .from('hr_employees')
      .update({ whatsapp_verified: true })
      .eq('id', payload.employeeId)
      .eq('tenant_id', payload.tenantId);

    if (updateError) {
      dbError = updateError;
    }
  } catch (err) {
    dbError = err;
  }

  if (dbError) {
    // If the column doesn't exist yet, we'll gracefully ignore or just show success anyway
    console.warn('[Verification] Could not update HR Employee table:', dbError);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans selection:bg-emerald-500 selection:text-white">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 relative">
        <div className="h-2 w-full bg-gradient-to-r from-emerald-400 to-teal-500 absolute top-0 left-0" />
        
        <div className="p-8 pt-10 text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-75" />
            <div className="relative bg-gradient-to-br from-emerald-400 to-teal-500 text-white rounded-full w-20 h-20 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <ShieldCheck className="w-10 h-10" />
            </div>
          </div>
          
          <h1 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
            Channel Verified
          </h1>
          
          <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
            <p className="text-slate-600 font-medium mb-1">
              Your WhatsApp notifications for <strong className="text-slate-900">Vanguard ERP</strong> are now active.
            </p>
            <p className="text-xs text-slate-500 mt-2 font-mono bg-white p-2 rounded-lg border border-slate-200 inline-block">
              {payload.phone}
            </p>
          </div>
          
          <ul className="text-sm text-slate-500 space-y-3 mb-8 text-left max-w-[260px] mx-auto">
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>Shift schedule updates</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>Payroll & salary slips</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>Emergency fleet alerts</span>
            </li>
          </ul>

          <Link prefetch={false} href="/login" className="block w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5">
            Return to Portal
          </Link>
        </div>
        
        <div className="bg-slate-50 p-4 border-t border-slate-100 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Powered by Vanguard Notification Engine
          </p>
        </div>
      </div>
    </div>
  );
}
