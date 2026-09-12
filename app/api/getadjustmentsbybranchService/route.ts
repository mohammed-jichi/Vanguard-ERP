import { NextRequest, NextResponse } from 'next/server';
import { AdjustmentsService } from '@/lib/adjustmentsService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const list = AdjustmentsService.getAdjustmentsList({
      branchId: Number(body.branchid) || undefined,
      status: Number(body.status) || 3,
      fromDate: body.adjustmentFrom,
      toDate: body.adjustmentTo,
      allDates: body.adjustmentAllDates,
      search: body.searchvalue
    });
    return NextResponse.json(list);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
