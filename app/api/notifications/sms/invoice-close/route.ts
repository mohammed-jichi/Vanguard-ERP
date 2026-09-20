// ============================================================
// API: SEND INVOICE CLOSE SMS NOTIFICATION & FEEDBACK LINK
// Route: POST /api/notifications/sms/invoice-close
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { composeInvoiceCloseSMS } from '@/lib/universalScaleService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { invoiceId } = body;

    if (!invoiceId) {
      return NextResponse.json(
        { success: false, error: 'invoiceId is required' },
        { status: 400 }
      );
    }

    const smsData = await composeInvoiceCloseSMS(invoiceId);

    return NextResponse.json({
      success: true,
      data: smsData,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to compose invoice close SMS' },
      { status: 500 }
    );
  }
}
