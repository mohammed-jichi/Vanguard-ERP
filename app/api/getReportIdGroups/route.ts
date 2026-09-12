import { NextRequest, NextResponse } from 'next/server';
import { ProductRequestService } from '@/lib/productRequestService';

export async function GET() {
  try {
    const groups = ProductRequestService.getReportIdGroups();
    return NextResponse.json(groups);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch report groups' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const groups = ProductRequestService.getReportIdGroups();
    return NextResponse.json(groups);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch report groups' }, { status: 500 });
  }
}
