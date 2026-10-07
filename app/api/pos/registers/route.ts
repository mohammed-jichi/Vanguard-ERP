import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.from('pos_registers').select('*').order('register_number', { ascending: true });

    if (error && error.code !== 'PGRST116' && !error.message?.includes('does not exist')) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: 500 }
      );
    }

    const registers = data || [];
    return NextResponse.json({
      success: true,
      count: registers.length,
      data: registers,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch POS registers' },
      { status: 500 }
    );
  }
}
