import { NextRequest, NextResponse } from 'next/server';
import { EventsService } from '@/lib/eventsService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = EventsService.saveEventType({
      evnt_type_id: body.evnt_type_id,
      id: body.id,
      type_name: body.type_name,
      description: body.description,
      branchid: body.branchid
    });
    // Omega returns numeric code (1, -1, 0)
    return NextResponse.json(result.code);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
