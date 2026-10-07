import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseClient';
import { mutateEntity } from '@/lib/dataGateway';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const branch = searchParams.get('branch');
    const department = searchParams.get('department');
    const search = searchParams.get('search');

    const supabase = getSupabaseServerClient();
    let query = supabase.from('employees').select('*');

    if (branch && branch !== 'ALL') {
      query = query.or(`branch.ilike.%${branch}%,facility_location.ilike.%${branch}%`);
    }
    if (department && department !== 'ALL') {
      query = query.ilike('department', `%${department}%`);
    }
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%,employee_code.ilike.%${search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error && error.code !== 'PGRST116' && !error.message?.includes('does not exist')) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: 500 }
      );
    }

    const employees = data || [];
    return NextResponse.json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch live employees' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await mutateEntity('employees', 'INSERT', body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to create employee', details: result.error },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      message: 'Employee successfully persisted to database',
      data: result.data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Employee creation error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.id || body.employee_code;
    if (!id) {
      return NextResponse.json(
        { error: 'Primary key (id or employee_code) is required for update' },
        { status: 400 }
      );
    }
    const result = await mutateEntity('employees', 'UPDATE', body, { field: 'id', value: id });
    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to update employee', details: result.error },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      message: 'Employee updated successfully in database',
      data: result.data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Employee update error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'Employee id is required for deletion' },
        { status: 400 }
      );
    }
    const result = await mutateEntity('employees', 'DELETE', {}, { field: 'id', value: id });
    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to delete employee', details: result.error },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      message: 'Employee successfully deleted from database',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Employee deletion error' },
      { status: 500 }
    );
  }
}
