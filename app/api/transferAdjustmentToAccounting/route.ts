import { NextRequest, NextResponse } from 'next/server';
import { AdjustmentsService } from '@/lib/adjustmentsService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const res = AdjustmentsService.transferToAccounting(Number(body.id));
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
