import { NextRequest, NextResponse } from 'next/server';
import { ServerAccountingStorage } from '@/lib/serverAccountingStorage';

export async function GET(req: NextRequest) {
  try {
    const expenses = await ServerAccountingStorage.getExpenses();

    return NextResponse.json({
      success: true,
      count: expenses.length,
      data: expenses
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch expense vouchers' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const payload = body.expense || body;

    if (!payload.description) {
      return NextResponse.json(
        { success: false, error: 'Expense description is required' },
        { status: 400 }
      );
    }

    const saved = await ServerAccountingStorage.saveExpense(payload);

    return NextResponse.json({
      success: true,
      message: `Expense Voucher ${saved.ev} successfully persisted. Status: ${saved.status}`,
      id: saved.id,
      ev: saved.ev,
      status: saved.status,
      is_posted: saved.posted,
      posted_at: saved.posted_at,
      timestamp: new Date().toISOString(),
      data: saved,
      expense: saved,
      glEntries: (saved as any).gl_entries || []
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to persist expense voucher' },
      { status: 500 }
    );
  }
}
