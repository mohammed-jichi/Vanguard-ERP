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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const data = ProductRequestService.getAllApprovedProductRequests({
    from: searchParams.get('from') || undefined,
    to: searchParams.get('to') || undefined,
    branchid: searchParams.get('branchid') ? Number(searchParams.get('branchid')) : undefined,
    search: searchParams.get('search') || undefined
  });
  return NextResponse.json(data);
}
