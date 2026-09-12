import { NextRequest, NextResponse } from 'next/server';
import { AdjustmentsService } from '@/lib/adjustmentsService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    AdjustmentsService.saveAdjustment(body);
    return NextResponse.json(1);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
