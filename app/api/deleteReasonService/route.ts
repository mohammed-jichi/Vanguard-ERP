import { NextRequest, NextResponse } from 'next/server';
import { ProductRequestService } from '@/lib/productRequestService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const reasonId = Number(body.reasonid ?? body.reasonId ?? body.id);

    if (!reasonId) {
      return NextResponse.json({ error: 'Valid reason id required' }, { status: 400 });
    }

    const deleted = ProductRequestService.deleteRejectReason(reasonId);
    if (!deleted) {
      return NextResponse.json({ error: 'Reason not found or could not be deleted' }, { status: 404 });
    }

    // Omega returns 1 on success
    return new NextResponse('1', {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('deleteReasonService error:', error);
    return NextResponse.json({ error: 'Failed to delete reject reason' }, { status: 500 });
  }
}
