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

export async function GET() {
  const data = ProductRequestService.getAllProductRequests();
  return NextResponse.json(data);
}
