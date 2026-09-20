// ============================================================
// API: SMS NOTIFICATION SETTINGS MANAGEMENT
// Route: GET/PUT /api/notifications/sms/settings
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const settings = await db.sms_notification_settings.findFirst();

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get SMS settings' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sender_id,
      country_code,
      auto_send_on_invoice_close,
      send_feedback_link,
      feedback_url_base,
    } = body;

    const updated = await db.sms_notification_settings.update({
      data: {
        ...(sender_id !== undefined && { sender_id }),
        ...(country_code !== undefined && { country_code }),
        ...(auto_send_on_invoice_close !== undefined && { auto_send_on_invoice_close }),
        ...(send_feedback_link !== undefined && { send_feedback_link }),
        ...(feedback_url_base !== undefined && { feedback_url_base }),
      },
    });

    return NextResponse.json({
      success: true,
      settings: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update SMS settings' },
      { status: 500 }
    );
  }
}
