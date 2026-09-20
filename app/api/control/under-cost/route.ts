// ============================================================
// API: UNDER COST SALES REPORT (CONTROL VIEW)
// Route: GET /api/control/under-cost
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getUnderCostSalesReport } from '@/lib/universalScaleService';

export async function GET(req: NextRequest) {
  try {
    const report = await getUnderCostSalesReport();

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate under-cost sales report' },
      { status: 500 }
    );
  }
}
