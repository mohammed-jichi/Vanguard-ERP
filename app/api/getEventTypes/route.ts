import { NextRequest, NextResponse } from 'next/server';
import { EventsService } from '@/lib/eventsService';

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    const types = EventsService.getEventTypes({
      page: body.page,
      searchvalue: body.searchvalue,
      sorting: body.sorting
    });
    return NextResponse.json(types);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(EventsService.getEventTypes());
}
