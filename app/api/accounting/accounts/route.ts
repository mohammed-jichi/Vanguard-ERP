import { NextRequest, NextResponse } from 'next/server';
import { ServerAccountingStorage } from '@/lib/serverAccountingStorage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filterType = searchParams.get('type') || undefined;
    const accounts = await ServerAccountingStorage.getAccounts(filterType);

    return NextResponse.json({
      success: true,
      count: accounts.length,
      data: accounts
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.account_number || !body.account_name) {
      return NextResponse.json(
        { success: false, error: 'account_number and account_name are required' },
        { status: 400 }
      );
    }

    const saved = await ServerAccountingStorage.saveAccount(body);

    return NextResponse.json({
      success: true,
      message: 'Account successfully persisted to database',
      id: saved.id,
      account_number: saved.account_number,
      data: saved,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to persist account' },
      { status: 500 }
    );
  }
}
