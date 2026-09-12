import { NextRequest, NextResponse } from 'next/server';
import { ProductRequestService } from '@/lib/productRequestService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const oldItemId = body.olditemid || body.old_item_id || body.ITEMID;
    const newItemId = body.newitemid || body.new_item_id || body.REPLACE_ITEMID;
    const targetPrIds = body.targetPrIds || body.checkedPrIds;

    const res = ProductRequestService.substituteItem(Number(oldItemId), Number(newItemId), targetPrIds);
    return NextResponse.json({
      status: 1,
      message: `Substituted item across ${res.count} line items`,
      ...res
    });
  } catch (err: any) {
    return NextResponse.json({ status: 0, error: err.message }, { status: 400 });
  }
}
