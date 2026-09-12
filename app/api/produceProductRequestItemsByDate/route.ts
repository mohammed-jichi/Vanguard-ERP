import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch (e) {}

  return NextResponse.json({
    status: 1,
    message: 'Production order dispatched successfully to Central Kitchen station',
    productionDate: body.date || new Date().toISOString().split('T')[0]
  });
}
