// ============================================================
// API: SINGLE HARDWARE PROFILE (GET/PUT/DELETE)
// Route: GET/PUT/DELETE /api/hardware/profiles/[id]
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profile = await db.system_hardware_profiles.findUnique({
      where: { id },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: `Hardware profile '${id}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch hardware profile' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await db.system_hardware_profiles.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({
      success: true,
      profile: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update hardware profile' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await db.system_hardware_profiles.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      deleted,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete hardware profile' },
      { status: 500 }
    );
  }
}
