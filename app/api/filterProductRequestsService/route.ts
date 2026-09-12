import { NextRequest, NextResponse } from 'next/server';
import { ProductRequestService } from '@/lib/productRequestService';

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch (e) {}

  const data = ProductRequestService.getAllProductRequests(body);
  return NextResponse.json(data);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const data = ProductRequestService.getAllProductRequests({
    from: searchParams.get('from') || undefined,
    to: searchParams.get('to') || undefined,
    frombranchid: searchParams.get('frombranchid') ? Number(searchParams.get('frombranchid')) : undefined,
    status: searchParams.get('status') || undefined
  });
  return NextResponse.json(data);
}
