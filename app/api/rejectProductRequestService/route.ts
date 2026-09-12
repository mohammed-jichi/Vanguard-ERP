import { NextRequest, NextResponse } from 'next/server';
import { ProductRequestService } from '@/lib/productRequestService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.requestid || body.id || body.REQUESTNB;
    const reason = body.reason || body.rejectionReason || body.DESCRIPTION || 'Rejected by Manager';

    const res = ProductRequestService.rejectProductRequest(Number(id), reason);
    if (!res) {
      return NextResponse.json({ status: 0, message: 'Product request not found' }, { status: 404 });
    }

    return NextResponse.json({
      status: 1,
      message: 'Product request rejected successfully',
      pr: res
    });
  } catch (err: any) {
    return NextResponse.json({ status: 0, error: err.message }, { status: 400 });
  }
}
