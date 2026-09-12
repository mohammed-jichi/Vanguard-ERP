import { NextRequest, NextResponse } from 'next/server';
import { ProductRequestService } from '@/lib/productRequestService';

export async function POST() {
  try {
    const list = ProductRequestService.getReportList();
    return NextResponse.json(list);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch report list' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const list = ProductRequestService.getReportList();
    return NextResponse.json(list);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch report list' }, { status: 500 });
  }
}
