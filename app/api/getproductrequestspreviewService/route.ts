import { NextRequest, NextResponse } from 'next/server';
import { ProductRequestService } from '@/lib/productRequestService';

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch (e) {}

  const reqId = body.requestid || body.id || body.request_nb || body.REQUESTNB;
  if (!reqId) {
    // If no ID is passed, return full preview list
    const list = ProductRequestService.getAllProductRequests();
    return NextResponse.json(list);
  }

  const pr = ProductRequestService.getPrDetails(reqId);
  if (!pr) {
    return NextResponse.json({ error: 'Product request not found' }, { status: 404 });
  }

  // Omega returns format with prdetails or pr array
  return NextResponse.json({
    ...pr,
    prdetails: pr.items,
    data: pr.items
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id') || searchParams.get('requestid');
  if (id) {
    const pr = ProductRequestService.getPrDetails(id);
    return NextResponse.json({ ...pr, prdetails: pr?.items });
  }
  return NextResponse.json(ProductRequestService.getAllProductRequests());
}
