import { NextRequest, NextResponse } from 'next/server';
import { ProductRequestService } from '@/lib/productRequestService';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pr = ProductRequestService.getPrDetails(id);
  if (!pr) {
    return NextResponse.json({ success: false, error: 'Product request not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: pr });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const updated = ProductRequestService.updateProductRequest(Number(id), body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Product request not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ok = ProductRequestService.deleteProductRequest(Number(id));
  return NextResponse.json({ success: ok });
}
