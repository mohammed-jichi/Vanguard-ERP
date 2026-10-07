import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const { data: items, error } = await supabase.from('inventory_items').select('*');

    if (error && error.code !== 'PGRST116' && !error.message?.includes('does not exist')) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: 500 }
      );
    }

    const rows = (items || []).map((item: any) => {
      const qty = Number(item.quantity_on_hand || item.stock || 0);
      const cost = Number(item.unit_cost || item.cost || 0);
      const valuationUsd = Math.round((qty * cost + Number.EPSILON) * 100) / 100;
      return {
        id: item.id,
        sku: item.sku || item.item_code,
        name: item.name,
        category: item.category,
        quantity: qty,
        unitCostUsd: cost,
        valuationUsd,
        valuationLbp: valuationUsd * 89500,
      };
    });

    const totalValuationUsd = rows.reduce((acc: number, r: any) => acc + r.valuationUsd, 0);

    return NextResponse.json({
      success: true,
      count: rows.length,
      data: rows,
      totalValuationUsd,
      totalValuationLbp: totalValuationUsd * 89500,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Valuation error' },
      { status: 500 }
    );
  }
}
