// ============================================================
// API: ELECTRONIC SCALE DEVICES MANAGEMENT
// Route: GET/POST /api/scales/devices
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get('branch_id') || undefined;

    const devices = await db.electronic_scale_devices.findMany({
      where: { branch_id: branchId },
    });

    return NextResponse.json({
      success: true,
      count: devices.length,
      devices,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to list scale devices' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      scale_name,
      scale_model,
      ip_address,
      port_number,
      weight_barcode_prefix,
      branch_id,
      is_active,
    } = body;

    if (!scale_name) {
      return NextResponse.json(
        { success: false, error: 'scale_name is required' },
        { status: 400 }
      );
    }

    const device = await db.electronic_scale_devices.create({
      data: {
        scale_name,
        scale_model: scale_model || 'UNIVERSAL_PLU',
        ip_address: ip_address || '192.168.1.100',
        port_number: port_number || 4001,
        weight_barcode_prefix: weight_barcode_prefix || '20',
        branch_id: branch_id || null,
        is_active: is_active !== undefined ? is_active : true,
        last_synced_at: null,
      },
    });

    return NextResponse.json({
      success: true,
      device,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create scale device' },
      { status: 500 }
    );
  }
}
