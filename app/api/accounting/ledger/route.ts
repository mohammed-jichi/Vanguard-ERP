import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('accountId');
    const accountNumber = searchParams.get('accountNumber');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    const supabase = getSupabaseServerClient();
    let query = supabase.from('gl_entries').select('*');

    if (accountId) {
      query = query.eq('account_id', accountId);
    }
    if (accountNumber) {
      query = query.eq('account_number', accountNumber);
    }
    if (fromDate) {
      query = query.gte('entry_date', fromDate);
    }
    if (toDate) {
      query = query.lte('entry_date', toDate);
    }

    const { data, error } = await query.order('entry_date', { ascending: true });

    if (error && error.code !== 'PGRST116' && !error.message?.includes('does not exist')) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: 500 }
      );
    }

    const entries = data || [];
    return NextResponse.json({
      success: true,
      count: entries.length,
      data: entries,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch GL entries' },
      { status: 500 }
    );
  }
}
