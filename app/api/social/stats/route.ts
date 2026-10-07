import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const repId = searchParams.get('repId');
    const period = searchParams.get('period');

    const supabase = getSupabaseServerClient();
    let query = supabase.from('social_orders').select('*');

    if (repId && repId !== 'ALL') query = query.eq('rep_id', repId);
    if (period && period !== 'ALL') query = query.eq('period', period);

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error && error.code !== 'PGRST116' && !error.message?.includes('does not exist')) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: 500 }
      );
    }

    const orders = data || [];
    return NextResponse.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch social rep stats' },
      { status: 500 }
    );
  }
}
