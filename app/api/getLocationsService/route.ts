import { NextRequest, NextResponse } from 'next/server';
import { ProductRequestService } from '@/lib/productRequestService';

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch (e) {}

  const branchId = body.branchid || body.BRANCHID || body.frombranchid;
  const locations = ProductRequestService.getLocations(branchId ? Number(branchId) : undefined);
  return NextResponse.json(locations);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const branchId = searchParams.get('branchid') ? Number(searchParams.get('branchid')) : undefined;
  const locations = ProductRequestService.getLocations(branchId);
  return NextResponse.json(locations);
}
