import { NextRequest, NextResponse } from 'next/server';
import { ProductRequestService } from '@/lib/productRequestService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const reasonId = Number(body.reasonid ?? body.reasonId ?? body.id);
    const description = body.reasonDescription || body.description;

    if (!reasonId || !description || !description.trim()) {
      return NextResponse.json({ error: 'Valid reason id and description required' }, { status: 400 });
    }

    const updated = ProductRequestService.editRejectReason(reasonId, description.trim());
    if (!updated) {
      return NextResponse.json({ error: 'Reason not found' }, { status: 404 });
    }

    // Omega returns 1 on success
    return new NextResponse('1', {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('editReasonService error:', error);
    return NextResponse.json({ error: 'Failed to edit reject reason' }, { status: 500 });
  }
}
