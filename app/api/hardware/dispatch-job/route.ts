// ============================================================
// API: DISPATCH HARDWARE JOB (PRINT / DRAWER / POLE / SCALE)
// Route: POST /api/hardware/dispatch-job
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { dispatchHardwareJob } from '@/lib/universalHardwareService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { deviceId, receiptData, labelData, poleDisplay, action, customCommand } = body;

    if (!deviceId) {
      return NextResponse.json(
        { success: false, error: 'deviceId is required' },
        { status: 400 }
      );
    }

    const result = await dispatchHardwareJob(deviceId, {
      receiptData,
      labelData,
      poleDisplay,
      action,
      customCommand,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to dispatch hardware job' },
      { status: 500 }
    );
  }
}
