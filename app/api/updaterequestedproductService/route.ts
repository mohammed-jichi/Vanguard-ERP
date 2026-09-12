import { NextRequest, NextResponse } from 'next/server';
import { ProductRequestService } from '@/lib/productRequestService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.id || body.requestid || body.REQUESTNB;
    const updated = ProductRequestService.updateProductRequest(Number(id), {
      BRANCHID: body.frombranchid || body.BRANCHID,
      FROMBRANCHID: body.requestedfrombranchid || body.FROMBRANCHID,
      LOCATIONID: body.tolocationid || body.LOCATIONID,
      DELIVERYDATE: body.retrievalDate || body.DELIVERYDATE,
      REMARK: body.remark || body.REMARK,
      items: body.items || body.products
    });

    if (!updated) {
      return NextResponse.json({ status: 0, message: 'Product request not found' }, { status: 404 });
    }

    return NextResponse.json({
      status: 1,
      message: 'Product request updated successfully',
      pr: updated
    });
  } catch (err: any) {
    return NextResponse.json({ status: 0, error: err.message }, { status: 400 });
  }
}
