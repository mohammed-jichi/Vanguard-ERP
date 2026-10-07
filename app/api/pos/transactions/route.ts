import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseClient';
import { mutateEntity } from '@/lib/dataGateway';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const branch = searchParams.get('branch');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const cashierId = searchParams.get('cashierId');

    const supabase = getSupabaseServerClient();
    let query = supabase.from('pos_transactions').select('*');

    if (branch && branch !== 'ALL') query = query.eq('branch', branch);
    if (cashierId) query = query.eq('cashier_id', cashierId);
    if (fromDate) query = query.gte('transaction_date', fromDate);
    if (toDate) query = query.lte('transaction_date', toDate);

    const { data, error } = await query.order('transaction_date', { ascending: false }).limit(200);

    if (error && error.code !== 'PGRST116' && !error.message?.includes('does not exist')) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: 500 }
      );
    }

    const txs = data || [];
    return NextResponse.json({
      success: true,
      count: txs.length,
      data: txs,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await mutateEntity('pos_transactions', 'INSERT', body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to record transaction', details: result.error },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      message: 'Transaction saved to database',
      data: result.data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Transaction error' },
      { status: 500 }
    );
  }
}
