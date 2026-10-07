import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.from('warehouses').select('*').order('name', { ascending: true });

    if (error && error.code !== 'PGRST116' && !error.message?.includes('does not exist')) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: 500 }
      );
    }

    const warehouses = data || [];
    return NextResponse.json({
      success: true,
      count: warehouses.length,
      data: warehouses,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch warehouses' },
      { status: 500 }
    );
  }
}
