import { NextRequest, NextResponse } from 'next/server';
import { AdjustmentsService } from '@/lib/adjustmentsService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const posted = AdjustmentsService.postAdjustment(body);
    return NextResponse.json({ status: 1, adjustid: posted.ADJUSTID, record: posted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
