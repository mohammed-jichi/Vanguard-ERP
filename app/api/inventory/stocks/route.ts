import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseClient';
import { mutateEntity } from '@/lib/dataGateway';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const warehouseId = searchParams.get('warehouseId');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const supabase = getSupabaseServerClient();
    let query = supabase.from('inventory_items').select('*');

    if (warehouseId) {
      query = query.eq('warehouse_id', warehouseId);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,barcode.ilike.%${search}%`);
    }

    const { data, error } = await query.order('name', { ascending: true });

    if (error && error.code !== 'PGRST116' && !error.message?.includes('does not exist')) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: 500 }
      );
    }

    const items = data || [];
    return NextResponse.json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch inventory stock' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await mutateEntity('inventory_items', 'INSERT', body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to save inventory item', details: result.error },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      message: 'Inventory item created in database',
      data: result.data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Inventory item error' },
      { status: 500 }
    );
  }
}
