// ============================================================
// API: TEST HARDWARE DEVICE CONNECTION
// Route: POST /api/hardware/test-connection
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { testDeviceConnection } from '@/lib/universalHardwareService';

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

    const testResult = await testDeviceConnection(deviceId);

    return NextResponse.json({
      success: true,
      data: testResult,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to test device connection' },
      { status: 500 }
    );
  }
}
