import { NextRequest, NextResponse } from 'next/server';
import { EventsService } from '@/lib/eventsService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const venues = EventsService.getVenues(body.branchid);
    return NextResponse.json(venues);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  const venues = EventsService.getVenues();
  return NextResponse.json(venues);
}
