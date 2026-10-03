// app/api/warehouses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { WarehouseService } from '@/lib/warehouseStorage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const scope = searchParams.get('scope') || undefined;
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const warehouses = WarehouseService.getAllWarehouses({ scope, activeOnly });
    return NextResponse.json({
      success: true,
      data: warehouses,
      count: warehouses.length,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error: any) {
    console.error('Error fetching warehouses:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name && !body.nameAr) {
      return NextResponse.json({ success: false, error: 'Warehouse name is required' }, { status: 400 });
    }

    const created = WarehouseService.createWarehouse(body);
    return NextResponse.json({
      success: true,
      message: 'Warehouse created successfully',
      data: created
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating warehouse:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
