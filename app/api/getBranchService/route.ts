import { NextRequest, NextResponse } from 'next/server';
import { AdjustmentsService } from '@/lib/adjustmentsService';

export async function POST() {
  return NextResponse.json(AdjustmentsService.getBranches());
}

export async function GET() {
  return NextResponse.json(AdjustmentsService.getBranches());
}
