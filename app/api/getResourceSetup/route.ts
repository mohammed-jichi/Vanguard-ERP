import { NextRequest, NextResponse } from 'next/server';
import { EventsService } from '@/lib/eventsService';

export async function POST(req: NextRequest) {
  try {
    let params: any = {};
    try {
      params = await req.json();
    } catch {
      // empty body
    }
    const res = EventsService.getResourceSetup(params);
    return NextResponse.json(res);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(EventsService.getResourceSetup());
}
