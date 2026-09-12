import { NextRequest, NextResponse } from 'next/server';
import { ProductRequestService } from '@/lib/productRequestService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const page = Number(body.page) || 1;
    const searchvalue = body.searchvalue || '';
    const sorting = body.sorting || { value: 'DESCRIPTION', type: 'asc' };

    const result = ProductRequestService.getRejectReasonsPaginated(page, searchvalue, sorting);
    return NextResponse.json(result);
  } catch (error) {
    console.error('getAllRejectReasonsList error:', error);
    return NextResponse.json({ error: 'Failed to fetch reject reasons' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const searchvalue = searchParams.get('searchvalue') || '';
    const sortVal = searchParams.get('sort') || 'DESCRIPTION';
    const sortType = searchParams.get('type') || 'asc';

    const result = ProductRequestService.getRejectReasonsPaginated(page, searchvalue, { value: sortVal, type: sortType });
    return NextResponse.json(result);
  } catch (error) {
    console.error('getAllRejectReasonsList GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch reject reasons' }, { status: 500 });
  }
}
