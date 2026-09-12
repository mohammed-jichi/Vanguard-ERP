import { NextRequest, NextResponse } from 'next/server';
import { ProductRequestService } from '@/lib/productRequestService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const requestId = body.requestid || body.id || body.row?.ID;
    const items = body.items || body.products || body.row?.items;
    const remark = body.remark || body.row?.REMARK;

    const res = ProductRequestService.confirmGoodsReceiving(Number(requestId), items, remark);
    if (!res) {
      return NextResponse.json({ status: 0, message: 'Product request not found' }, { status: 404 });
    }

    return NextResponse.json({
      status: 1,
      message: 'Goods receiving confirmed successfully! Inventory updated.',
      pr: res
    });
  } catch (err: any) {
    return NextResponse.json({ status: 0, error: err.message }, { status: 400 });
  }
}
