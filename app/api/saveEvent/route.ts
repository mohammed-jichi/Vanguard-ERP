import { NextRequest, NextResponse } from 'next/server';
import { EventsService } from '@/lib/eventsService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = EventsService.saveEvent(body);
    if (result.conflict) {
      return NextResponse.json(result, { status: 200 });
    }
    if (result.error) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result.code !== undefined ? result.code : (result.success ? 1 : 0));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
