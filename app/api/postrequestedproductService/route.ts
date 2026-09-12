import { NextRequest, NextResponse } from 'next/server';
import { ProductRequestService } from '@/lib/productRequestService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newPr = ProductRequestService.createProductRequest({
      BRANCHID: body.frombranchid || body.BRANCHID || 1,
      FROMBRANCHID: body.requestedfrombranchid || body.FROMBRANCHID || 2,
      LOCATIONID: body.tolocationid || body.LOCATIONID || 1,
      DELIVERYDATE: body.retrievalDate || body.DELIVERYDATE,
      REMARK: body.remark || body.REMARK,
      items: body.items || body.products || []
    });

    return NextResponse.json({
      status: 1,
      message: 'Product request saved successfully',
      pr: newPr,
      request_nb: newPr.REQUESTNB,
      id: newPr.ID
    });
  } catch (err: any) {
    return NextResponse.json({ status: 0, error: err.message }, { status: 400 });
  }
}
