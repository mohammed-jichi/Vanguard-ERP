import { NextRequest, NextResponse } from 'next/server';
import { AdjustmentsService } from '@/lib/adjustmentsService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const ok = AdjustmentsService.deleteAdjustment(Number(body.adjustid));
    return NextResponse.json(ok ? 1 : 0);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
