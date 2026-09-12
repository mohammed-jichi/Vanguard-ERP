import { NextRequest, NextResponse } from 'next/server';
import { ProductRequestService } from '@/lib/productRequestService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newT = ProductRequestService.saveTemplate({
      TEMPLATENAME: body.templatename || body.name || 'Saved PR Template',
      BRANCHID: body.branchid || body.BRANCHID || 1,
      LOCATIONID: body.locationid || body.LOCATIONID || 1,
      REMARK: body.remark || body.REMARK,
      items: body.items || body.products || []
    });

    return NextResponse.json({
      status: 1,
      message: 'Product request template saved successfully',
      template: newT
    });
  } catch (err: any) {
    return NextResponse.json({ status: 0, error: err.message }, { status: 400 });
  }
}
