import { NextRequest, NextResponse } from 'next/server';
import { ProductRequestService } from '@/lib/productRequestService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const description = body.reasonDescription || body.description;

    if (!description || !description.trim()) {
      return NextResponse.json({ error: 'Description is required', success: false }, { status: 400 });
    }

    const created = ProductRequestService.addRejectReason(description.trim());
    // Omega returns 1 on success
    return new NextResponse('1', {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('saveNewReasonService error:', error);
    return NextResponse.json({ error: 'Failed to save new reject reason' }, { status: 500 });
  }
}
