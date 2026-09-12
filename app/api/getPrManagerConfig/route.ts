import { NextRequest, NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    status: 1,
    ALLOW_CONVERT_PO: 1,
    PRINT_FORMAT: 'standard',
    ENABLE_PREPARATION_STATION: 1,
    AUTO_REFRESH_INTERVAL: 60
  });
}

export async function GET() {
  return NextResponse.json({
    status: 1,
    ALLOW_CONVERT_PO: 1,
    PRINT_FORMAT: 'standard',
    ENABLE_PREPARATION_STATION: 1,
    AUTO_REFRESH_INTERVAL: 60
  });
}
