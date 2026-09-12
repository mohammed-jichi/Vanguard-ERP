import { NextRequest, NextResponse } from 'next/server';
import { ProductRequestService } from '@/lib/productRequestService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    if (body.page !== undefined || body.searchvalue !== undefined) {
      const page = Number(body.page) || 1;
      const searchvalue = body.searchvalue || '';
      const sorting = body.sorting || { value: 'DESCRIPTION', type: 'asc' };
      return NextResponse.json(ProductRequestService.getRejectReasonsPaginated(page, searchvalue, sorting));
    }
    const reasons = ProductRequestService.getRejectReasons();
    return NextResponse.json(reasons);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reject reasons' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const reasons = ProductRequestService.getRejectReasons();
    return NextResponse.json(reasons);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reject reasons' }, { status: 500 });
  }
}
