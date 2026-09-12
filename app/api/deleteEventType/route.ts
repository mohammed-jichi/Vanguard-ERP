import { NextRequest, NextResponse } from 'next/server';
import { EventsService } from '@/lib/eventsService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.evnt_type_id || body.id;
    const result = EventsService.deleteEventType(Number(id));
    // Omega returns numeric code: 1 = success, 0 = not allowed
    return NextResponse.json(result.code);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
