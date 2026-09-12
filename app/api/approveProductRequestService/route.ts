import { NextRequest, NextResponse } from 'next/server';
import { ProductRequestService } from '@/lib/productRequestService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.requestid || body.id || body.REQUESTNB;
    const convertToTransaction = body.convertonly === true || body.convert === true;

    if (Array.isArray(body.ids)) {
      // Multi-approval
      const res = ProductRequestService.approveMultiProductRequest(body.ids, false, convertToTransaction);
      return NextResponse.json({ status: 1, message: `${res.count} requests approved successfully`, ...res });
    }

    const updated = ProductRequestService.approveProductRequest(Number(id), body.items || body.prdetails, convertToTransaction);
    if (!updated) {
      return NextResponse.json({ status: 0, message: 'Product request not found' }, { status: 404 });
    }

    return NextResponse.json({
      status: 1,
      message: 'Product request approved successfully',
      pr: updated
    });
  } catch (err: any) {
    return NextResponse.json({ status: 0, error: err.message }, { status: 400 });
  }
}
