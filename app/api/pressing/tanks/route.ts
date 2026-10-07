import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseClient';
import { mutateEntity } from '@/lib/dataGateway';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.from('storage_tanks').select('*').order('tank_number', { ascending: true });

    if (error && error.code !== 'PGRST116' && !error.message?.includes('does not exist')) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: 500 }
      );
    }

    const tanks = data || [];
    return NextResponse.json({
      success: true,
      count: tanks.length,
      data: tanks,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch storage tanks' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.id || body.tank_id;
    if (!id) {
      return NextResponse.json(
        { error: 'Tank id is required for update' },
        { status: 400 }
      );
    }
    const result = await mutateEntity('storage_tanks', 'UPDATE', body, { field: 'id', value: id });
    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to update tank', details: result.error },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      message: 'Tank state updated in database',
      data: result.data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Tank update error' },
      { status: 500 }
    );
  }
}
