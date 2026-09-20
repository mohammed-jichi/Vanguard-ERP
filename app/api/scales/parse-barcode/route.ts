// ============================================================
// API: PARSE WEIGHTED SCALE BARCODE
// Route: POST /api/scales/parse-barcode
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { parseWeightedBarcode } from '@/lib/universalScaleService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { barcode, expectedPrefix, deviceId } = body;

    if (!barcode) {
      return NextResponse.json(
        { success: false, error: 'barcode is required' },
        { status: 400 }
      );
    }

    const parsed = await parseWeightedBarcode(barcode, {
      expectedPrefix,
      deviceId,
    });

    return NextResponse.json({
      success: parsed.is_valid,
      data: parsed,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to parse weighted barcode' },
      { status: 500 }
    );
  }
}
