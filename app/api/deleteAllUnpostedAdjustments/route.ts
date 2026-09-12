import { NextRequest, NextResponse } from 'next/server';
import { AdjustmentsService } from '@/lib/adjustmentsService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const count = AdjustmentsService.deleteAllUnposted(Number(body.branchid) || undefined);
    return NextResponse.json(count);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
