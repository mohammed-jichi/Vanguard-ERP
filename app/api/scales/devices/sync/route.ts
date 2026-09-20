// ============================================================
// API: SCALE HARDWARE SYNC
// Route: POST /api/scales/devices/sync
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { syncScaleDevice } from '@/lib/universalScaleService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { deviceId } = body;

    if (!deviceId) {
      return NextResponse.json(
        { success: false, error: 'deviceId is required' },
        { status: 400 }
      );
    }

    const result = await syncScaleDevice(deviceId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to sync scale device' },
      { status: 500 }
    );
  }
}
