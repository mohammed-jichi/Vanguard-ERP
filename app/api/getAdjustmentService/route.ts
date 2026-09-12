import { NextRequest, NextResponse } from 'next/server';
import { AdjustmentsService } from '@/lib/adjustmentsService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const items = AdjustmentsService.getAdjustmentItems(
      Number(body.branchid) || 1,
      Number(body.locationid) || 1,
      {
        search: body.searchvalue || '',
        include: Number(body.include) || 0,
        searchBy: Number(body.searchby) || 0,
        comboValue: Number(body.combovalue) || 0,
        checkNegQty: body.checknegqty == 1,
        hide0Qty: body.hide0qty == 1
      }
    );
    return NextResponse.json(items);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
