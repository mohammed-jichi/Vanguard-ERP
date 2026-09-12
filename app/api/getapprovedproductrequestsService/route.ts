import { NextRequest, NextResponse } from 'next/server';
import { ProductRequestService } from '@/lib/productRequestService';

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch (e) {}

  const data = ProductRequestService.getAllApprovedProductRequests({
    from: body.from,
    to: body.to,
    branchid: body.frombranchid || body.branchid,
    frombranchid: body.requestedfrombranchid,
    search: body.search
  });
  return NextResponse.json(data);
}

export async function GET() {
  const data = ProductRequestService.getAllApprovedProductRequests();
  return NextResponse.json(data);
}
