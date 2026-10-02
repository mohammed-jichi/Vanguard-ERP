// app/api/warehouses/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { WarehouseService } from '@/lib/warehouseStorage';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const warehouse = WarehouseService.getWarehouseById(id);
    if (!warehouse) {
      return NextResponse.json({ success: false, error: 'Warehouse not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: warehouse });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = WarehouseService.updateWarehouse(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Warehouse not found or update failed' }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      message: 'Warehouse updated successfully',
      data: updated
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const success = WarehouseService.deleteWarehouse(id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Could not delete warehouse (protected or not found)' }, { status: 400 });
    }
    return NextResponse.json({
      success: true,
      message: 'Warehouse deleted/deactivated successfully'
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
