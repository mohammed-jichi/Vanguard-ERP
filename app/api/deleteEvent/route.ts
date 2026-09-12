import { NextRequest, NextResponse } from 'next/server';
import { EventsService } from '@/lib/eventsService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = EventsService.deleteEvent(body.evnt_id);
    return NextResponse.json(result.success ? 1 : 0);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
