// app/api/operations/commercial-oil/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { CommercialOilService } from '@/lib/commercialOilStorage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'all';

    const state = CommercialOilService.getState();

    if (filter === 'tanks') {
      return NextResponse.json({ success: true, data: state.tanks });
    }
    if (filter === 'receipts') {
      return NextResponse.json({ success: true, data: state.receipts });
    }
    if (filter === 'batches') {
      return NextResponse.json({ success: true, data: state.batches });
    }
    if (filter === 'packaging') {
      return NextResponse.json({ success: true, data: state.packagingVouchers });
    }
    if (filter === 'stocks') {
      return NextResponse.json({ success: true, data: state.warehouseStocks });
    }
    if (filter === 'movements') {
      return NextResponse.json({ success: true, data: state.movements });
    }

    return NextResponse.json({
      success: true,
      data: state,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error fetching commercial oil state:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action;

    if (!action) {
      return NextResponse.json({ success: false, error: 'Missing action parameter' }, { status: 400 });
    }

    // Action 1: Unit-by-Unit Oil Intake
    if (action === 'RECEIVE_INTAKE') {
      const receipt = CommercialOilService.receiveOilIntake(body.payload);
      return NextResponse.json({
        success: true,
        message: 'Oil intake receipt successfully registered and posted',
        data: receipt
      }, { status: 201 });
    }

    // Action 2: Weight-Based Mixing & Blending
    if (action === 'CREATE_BLEND') {
      const batch = CommercialOilService.createBlendingBatch(body.payload);
      return NextResponse.json({
        success: true,
        message: 'Blending batch successfully created and deducted from source tanks',
        data: batch
      }, { status: 201 });
    }

    // Action 3: Packaging & Dynamic Box Capacity Posting
    if (action === 'PACKAGE_AND_POST') {
      const voucher = CommercialOilService.packageAndPostBatch(body.payload);
      return NextResponse.json({
        success: true,
        message: 'Packaging batch successfully posted to target warehouse',
        data: voucher
      }, { status: 201 });
    }

    return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error: any) {
    console.error('Error in commercial oil operations API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
