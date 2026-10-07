import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseClient';
import { mutateEntity } from '@/lib/dataGateway';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const driverId = searchParams.get('driverId');

    const supabase = getSupabaseServerClient();
    let query = supabase.from('online_platform_orders').select('*');

    if (status) query = query.eq('delivery_status', status);
    if (driverId) query = query.eq('driver_id', driverId);

    const { data, error } = await query.order('dispatch_date', { ascending: false });

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
      { error: err?.message || 'Failed to fetch dispatch orders' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await mutateEntity('online_platform_orders', 'INSERT', body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to create dispatch order', details: result.error },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      message: 'Dispatch order queued in database',
      data: result.data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Dispatch queue error' },
      { status: 500 }
    );
  }
}
