import { NextRequest, NextResponse } from 'next/server';
import { ProductRequestService } from '@/lib/productRequestService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const requestId = body.requestid || body.id || body.row?.ID;

    const res = ProductRequestService.unconfirmGoodsReceiving(Number(requestId));
    if (!res) {
      return NextResponse.json({ status: 0, message: 'Product request not found' }, { status: 404 });
    }

    return NextResponse.json({
      status: 1,
      message: 'Goods receiving unconfirmed successfully',
      pr: res
    });
  } catch (err: any) {
    return NextResponse.json({ status: 0, error: err.message }, { status: 400 });
  }
}
