import { NextRequest, NextResponse } from 'next/server';
import { GET as keepAliveGet } from '@/app/api/cron/keep-alive/route';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  return keepAliveGet(req);
}

export async function POST(req: NextRequest) {
  return keepAliveGet(req);
}
