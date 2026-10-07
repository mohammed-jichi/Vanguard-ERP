import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || undefined;
    const year = searchParams.get('year') || undefined;

    const supabase = getSupabaseServerClient();
    let query = supabase.from('tax_declarations').select('*');

    if (period) {
      query = query.eq('declaration_period', period);
    }
    if (year) {
      query = query.eq('fiscal_year', year);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error && error.code !== 'PGRST116' && !error.message?.includes('does not exist')) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: 500 }
      );
    }

    const declarations = data || [];
    return NextResponse.json({
      success: true,
      count: declarations.length,
      data: declarations,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch tax declarations' },
      { status: 500 }
    );
  }
}
