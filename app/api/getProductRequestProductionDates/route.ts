import { NextRequest, NextResponse } from 'next/server';
import { ProductRequestService } from '@/lib/productRequestService';

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch (e) {}

  const date = body.date || new Date().toISOString().split('T')[0];
  const prod = ProductRequestService.getProductions(date);
  return NextResponse.json(prod);
}

export async function GET() {
  const prod = ProductRequestService.getProductions();
  return NextResponse.json(prod);
}
