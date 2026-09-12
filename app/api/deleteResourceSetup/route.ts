import { NextRequest, NextResponse } from 'next/server';
import { EventsService } from '@/lib/eventsService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const resourceId = body.resource_id || body.id;
    const result = EventsService.deleteResourceSetup(Number(resourceId));
    if (!result.success && result.code === 0) {
      return NextResponse.json(0);
    }
    return NextResponse.json(1);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
