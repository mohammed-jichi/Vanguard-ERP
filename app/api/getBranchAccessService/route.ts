import { NextRequest, NextResponse } from 'next/server';
import { ProductRequestService } from '@/lib/productRequestService';

export async function POST() {
  return NextResponse.json(ProductRequestService.getBranches());
}

export async function GET() {
  return NextResponse.json(ProductRequestService.getBranches());
}
