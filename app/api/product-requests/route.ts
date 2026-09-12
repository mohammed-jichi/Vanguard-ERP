import { NextRequest, NextResponse } from 'next/server';
import { ProductRequestService } from '@/lib/productRequestService';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from') || undefined;
  const to = searchParams.get('to') || undefined;
  const frombranchid = searchParams.get('frombranchid') ? Number(searchParams.get('frombranchid')) : undefined;
  const requestedfrombranchid = searchParams.get('requestedfrombranchid') ? Number(searchParams.get('requestedfrombranchid')) : undefined;
  const status = searchParams.get('status') || undefined;
  const search = searchParams.get('search') || undefined;

  const data = ProductRequestService.getAllProductRequests({
    from,
    to,
    frombranchid,
    requestedfrombranchid,
    status,
    search
  });

  return NextResponse.json({ success: true, data });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newPr = ProductRequestService.createProductRequest(body);
    return NextResponse.json({ success: true, data: newPr });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
