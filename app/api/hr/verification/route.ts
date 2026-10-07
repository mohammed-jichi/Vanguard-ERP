import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employeeId, pinCode } = body;

    if (!employeeId || !pinCode) {
      return NextResponse.json(
        { success: false, error: 'employeeId and pinCode are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    const { data: employee, error } = await supabase
      .from('employees')
      .select('id, employee_code, full_name, role, department, branch, pos_pin')
      .or(`id.eq.${employeeId},employee_code.eq.${employeeId}`)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      );
    }

    const isValid = String(employee.pos_pin) === String(pinCode);

    return NextResponse.json({
      success: isValid,
      verified: isValid,
      employee: isValid ? {
        id: employee.id,
        employeeCode: employee.employee_code,
        fullName: employee.full_name,
        role: employee.role,
        department: employee.department,
        branch: employee.branch,
      } : null,
      message: isValid ? 'Employee verified' : 'Invalid PIN code',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Verification exception' },
      { status: 500 }
    );
  }
}
