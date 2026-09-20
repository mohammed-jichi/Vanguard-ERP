// ============================================================
// API: RESERVATION SHIFTS & TABLE STAY SETTINGS
// Route: GET/PUT/POST /api/reservations/shifts
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const shifts = await db.reservation_shifts.findMany();
    const settings = await db.reservation_settings.findFirst();

    return NextResponse.json({
      success: true,
      settings,
      shifts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch reservation shifts & settings' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { table_stay_period_minutes, active_shift_id } = body;

    const updatedSettings = await db.reservation_settings.update({
      data: {
        ...(table_stay_period_minutes !== undefined && { table_stay_period_minutes }),
        ...(active_shift_id !== undefined && { active_shift_id }),
      },
    });

    return NextResponse.json({
      success: true,
      settings: updatedSettings,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update reservation settings' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { shift_name, start_time, end_time, is_active } = body;

    if (!shift_name || !start_time || !end_time) {
      return NextResponse.json(
        { success: false, error: 'shift_name, start_time, and end_time are required' },
        { status: 400 }
      );
    }

    const shift = await db.reservation_shifts.create({
      data: {
        shift_name,
        start_time,
        end_time,
        is_active: is_active !== undefined ? is_active : true,
      },
    });

    return NextResponse.json({
      success: true,
      shift,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create reservation shift' },
      { status: 500 }
    );
  }
}
