import { NextRequest, NextResponse } from 'next/server';
import { ProductRequestService } from '@/lib/productRequestService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ids = Array.isArray(body.ids) ? body.ids : (body.requestid || body.id ? [body.requestid || body.id] : []);
    const res = ProductRequestService.unapproveMultiProductRequest(ids);
    return NextResponse.json({
      status: 1,
      message: `${res.count} product requests reverted to pending`,
      ...res
    });
  } catch (err: any) {
    return NextResponse.json({ status: 0, error: err.message }, { status: 400 });
  }
}
