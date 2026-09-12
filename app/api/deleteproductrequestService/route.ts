import { NextRequest, NextResponse } from 'next/server';
import { ProductRequestService } from '@/lib/productRequestService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.id || body.requestid || body.REQUESTNB;
    const ok = ProductRequestService.deleteProductRequest(Number(id));
    return NextResponse.json({
      status: ok ? 1 : 0,
      message: ok ? 'Product request deleted successfully' : 'Product request not found'
    });
  } catch (err: any) {
    return NextResponse.json({ status: 0, error: err.message }, { status: 400 });
  }
}
