// ============================================================
// API: HARDWARE PROFILES MANAGEMENT
// Route: GET/POST /api/hardware/profiles
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { HardwareDeviceCategory, HardwareInterfaceType } from '@/types/universal-hardware';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') as HardwareDeviceCategory | null;
    const interfaceType = searchParams.get('interface_type') as HardwareInterfaceType | null;
    const branchId = searchParams.get('branch_id') || undefined;
    const isActiveParam = searchParams.get('is_active');
    const isActive = isActiveParam !== null ? isActiveParam === 'true' : undefined;

    const profiles = await db.system_hardware_profiles.findMany({
      where: {
        ...(category && { device_category: category }),
        ...(interfaceType && { interface_type: interfaceType }),
        ...(branchId && { branch_id: branchId }),
        ...(isActive !== undefined && { is_active: isActive }),
      },
    });

    return NextResponse.json({
      success: true,
      count: profiles.length,
      profiles,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to list hardware profiles' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      device_name,
      device_category,
      interface_type,
      ip_address,
      port_number,
      serial_port,
      serial_baud_rate,
      serial_data_bits,
      serial_parity,
      serial_stop_bits,
      system_printer_name,
      command_protocol,
      device_config,
      branch_id,
      is_active,
    } = body;

    if (!device_name || !device_category || !interface_type) {
      return NextResponse.json(
        { success: false, error: 'device_name, device_category, and interface_type are required' },
        { status: 400 }
      );
    }

    const newProfile = await db.system_hardware_profiles.create({
      data: {
        device_name,
        device_category,
        interface_type,
        ip_address: ip_address || null,
        port_number: port_number || null,
        serial_port: serial_port || null,
        serial_baud_rate: serial_baud_rate || 9600,
        serial_data_bits: serial_data_bits || 8,
        serial_parity: serial_parity || 'NONE',
        serial_stop_bits: serial_stop_bits || 1,
        system_printer_name: system_printer_name || null,
        command_protocol: command_protocol || 'STANDARD',
        device_config: device_config || {
          paper_width_mm: 80,
          characters_per_line: 48,
          auto_cutter: true,
          cash_drawer_pulse: true,
          weight_barcode_prefix: '20',
          scale_unit: 'KG',
        },
        branch_id: branch_id || null,
        is_active: is_active !== undefined ? is_active : true,
      },
    });

    return NextResponse.json({
      success: true,
      profile: newProfile,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create hardware profile' },
      { status: 500 }
    );
  }
}
