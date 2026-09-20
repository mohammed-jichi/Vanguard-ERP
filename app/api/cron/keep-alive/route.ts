import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { ServerAccountingStorage } from '@/lib/serverAccountingStorage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Vanguard ERP - Database Activity & Cron Keep-Alive Endpoint
 * Ensures regular interaction with Supabase Postgres instance to prevent
 * inactivity timeouts and idle project auto-pause during quiet operational periods.
 * Supports both GET (standard cron / browser ping) and POST (webhook triggers).
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now();
  let supabaseConnected = false;
  let supabaseLatencyMs = 0;
  let tenantInfo: any = null;
  let supabaseError: string | null = null;

  try {
    // 1. Live touch to Supabase tenants & accounting tables
    const pingStart = Date.now();
    const { data: tenantData, error: tErr } = await supabase
      .from('tenants')
      .select('id, name, subscription_tier, subscription_status')
      .limit(1);

    // Also touch acc_accounts to keep accounting tables warm
    const { data: accData, error: accErr } = await supabase
      .from('acc_accounts')
      .select('id, code, name')
      .limit(3);

    supabaseLatencyMs = Date.now() - pingStart;

    if (tErr && accErr) {
      supabaseError = `${tErr?.message || ''}; ${accErr?.message || ''}`.trim();
    } else {
      supabaseConnected = true;
      if (tenantData && tenantData.length > 0) {
        tenantInfo = tenantData[0];
      } else {
        tenantInfo = { note: 'Connected to Supabase (empty tenant list)' };
      }
      if (accData) {
        tenantInfo.cachedAccountsSample = accData.length;
      }
    }
  } catch (err: any) {
    supabaseError = err.message || 'Unknown network error';
  }

  // 2. Touch local persistent accounting storage
  let localDbStats: any = null;
  try {
    const vouchers = await ServerAccountingStorage.getVouchers();
    const expenses = await ServerAccountingStorage.getExpenses();
    const accounts = await ServerAccountingStorage.getAccounts();
    const activities = await ServerAccountingStorage.getSystemActivities(1);

    localDbStats = {
      status: 'SYNCHRONIZED',
      totalAccounts: accounts.length,
      totalVouchers: vouchers.length,
      totalExpenses: expenses.length,
      latestActivity: activities.length > 0 ? activities[0].description : 'Idle'
    };
  } catch (dbErr: any) {
    localDbStats = { status: 'DEGRADED', error: dbErr.message };
  }

  const totalDurationMs = Date.now() - startTime;

  return NextResponse.json({
    success: true,
    status: supabaseConnected ? 'HEALTHY' : 'DEGRADED',
    message: supabaseConnected
      ? 'Supabase instance successfully touched and kept alive.'
      : `Supabase ping failed: ${supabaseError}. Local database resilient.`,
    supabase: {
      connected: supabaseConnected,
      latencyMs: supabaseLatencyMs,
      endpoint: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cmntrzsaqapybfhngmdv.supabase.co',
      activeTenantId: tenantInfo?.id || '00000000-0000-0000-0000-000000000001',
      tenantName: tenantInfo?.name || 'Vanguard Master Enterprise',
      error: supabaseError
    },
    localLedger: localDbStats,
    timestamp: new Date().toISOString(),
    executionDurationMs: totalDurationMs
  });
}

export async function POST(req: NextRequest) {
  return GET(req);
}
