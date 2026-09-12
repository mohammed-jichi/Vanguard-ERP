import { NextRequest, NextResponse } from 'next/server';
import { ProductRequestService } from '@/lib/productRequestService';

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch (e) {}

  const data = ProductRequestService.getRequestsByBranchByItemType({
    date: body.date || body.productRequestDate,
    frombranchid: body.frombranchid || body.branchid,
    itemtypeid: body.itemtypeid || body.item_type
  });
  return NextResponse.json(data);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const data = ProductRequestService.getRequestsByBranchByItemType({
    date: searchParams.get('date') || undefined,
    frombranchid: searchParams.get('frombranchid') ? Number(searchParams.get('frombranchid')) : undefined,
    itemtypeid: searchParams.get('itemtypeid') ? Number(searchParams.get('itemtypeid')) : undefined
  });
  return NextResponse.json(data);
}
