import { NextResponse } from 'next/server';
import { updateUserInLocalDb, syncSupabaseUserAuth } from '@/lib/authSync';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, email, newPassword } = body || {};

    if (!newPassword || typeof newPassword !== 'string' || !newPassword.trim()) {
      return NextResponse.json(
        { success: false, error: 'New password is required.' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (!email && !userId) {
      return NextResponse.json(
        { success: false, error: 'User identifier (email or userId) is required.' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const cleanPass = newPassword.trim();
    const cleanEmail = (email || '').trim().toLowerCase();

    // 1. Update local database persistence (vanguard_accounting_db.json)
    const localResult = updateUserInLocalDb(cleanEmail, cleanPass, userId);
    if (!localResult.success) {
      return NextResponse.json(
        { success: false, error: 'Failed to update local user credentials.' },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    // 2. Synchronize live Supabase Auth Admin & custom database tables
    const syncResult = await syncSupabaseUserAuth(cleanEmail, cleanPass, {
      userId,
      name: localResult.user?.name,
      tenant_id: localResult.user?.tenant_id || '1300',
      pin: cleanPass,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Password reset successfully.',
        user: localResult.user,
        supabaseAuthUpdated: syncResult.updatedAuth,
        supabaseDbUpdated: syncResult.updatedDb,
      },
      { headers: CORS_HEADERS }
    );
  } catch (error: any) {
    console.error('[API /api/users/reset-password] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to reset password.' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
