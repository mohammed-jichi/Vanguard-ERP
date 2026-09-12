import { NextRequest, NextResponse } from 'next/server';
import { ProductRequestService } from '@/lib/productRequestService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const requestId = body.id || body.requestid || body.row?.ID;
    const items = body.items || body.row?.items || [];

    const updated = ProductRequestService.savePrByItemType(Number(requestId), items);
    return NextResponse.json({
      status: 1,
      message: 'Product request preparations saved successfully',
      pr: updated
    });
  } catch (err: any) {
    return NextResponse.json({ status: 0, error: err.message }, { status: 400 });
  }
}
