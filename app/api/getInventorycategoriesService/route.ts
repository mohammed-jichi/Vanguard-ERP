import { NextResponse } from 'next/server';
import { AdjustmentsService } from '@/lib/adjustmentsService';

export async function POST() {
  return NextResponse.json(AdjustmentsService.getCategories());
}

export async function GET() {
  return NextResponse.json(AdjustmentsService.getCategories());
}
