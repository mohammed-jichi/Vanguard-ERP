import { NextRequest, NextResponse } from 'next/server';
import { ProductRequestService } from '@/lib/productRequestService';

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch (e) {}

  const branchId = body.branchid || body.BRANCHID;
  const templates = ProductRequestService.getTemplates(branchId ? Number(branchId) : undefined);
  return NextResponse.json(templates);
}

export async function GET() {
  const templates = ProductRequestService.getTemplates();
  return NextResponse.json(templates);
}
