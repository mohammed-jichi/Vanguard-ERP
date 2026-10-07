import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseClient';
import { mutateEntity } from '@/lib/dataGateway';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    const supabase = getSupabaseServerClient();
    let query = supabase.from('employee_schedules').select('*');

    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }
    if (month) {
      query = query.eq('month', month);
    }
    if (year) {
      query = query.eq('year', year);
    }

    const { data, error } = await query;

    if (error && error.code !== 'PGRST116' && !error.message?.includes('does not exist')) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: 500 }
      );
    }

    const schedules = data || [];
    return NextResponse.json({
      success: true,
      count: schedules.length,
      data: schedules,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch schedules' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await mutateEntity('employee_schedules', 'UPSERT', body, { field: 'id', value: body.id });
    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to save schedule', details: result.error },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      message: 'Schedule saved to database',
      data: result.data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Schedule save error' },
      { status: 500 }
    );
  }
}
