import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseClient';
import { mutateEntity } from '@/lib/dataGateway';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const seasonId = searchParams.get('seasonId');
    const farmerId = searchParams.get('farmerId');
    const status = searchParams.get('status');

    const supabase = getSupabaseServerClient();
    let query = supabase.from('weighbridge_tickets').select('*');

    if (seasonId) query = query.eq('season_id', seasonId);
    if (farmerId) query = query.eq('farmer_id', farmerId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error && error.code !== 'PGRST116' && !error.message?.includes('does not exist') && !error.message?.includes('Could not find the table')) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: 500 }
      );
    }

    const tickets = data || [];
    return NextResponse.json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch weighbridge tickets' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await mutateEntity('weighbridge_tickets', 'INSERT', body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to create weighbridge ticket', details: result.error },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      message: 'Weighbridge ticket created in database',
      data: result.data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Ticket creation error' },
      { status: 500 }
    );
  }
}
