import { NextRequest, NextResponse } from 'next/server';
import { ProductRequestService } from '@/lib/productRequestService';

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch (e) {}

  const items = ProductRequestService.searchInventory(
    body.search || body.query || body.search_keyword,
    body.categoryid || body.category
  );

  return NextResponse.json(items);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const items = ProductRequestService.searchInventory(
    searchParams.get('search') || searchParams.get('q') || undefined,
    searchParams.get('categoryid') ? Number(searchParams.get('categoryid')) : undefined
  );
  return NextResponse.json(items);
}
