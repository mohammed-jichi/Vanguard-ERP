import { NextRequest, NextResponse } from 'next/server';
import { EventsService } from '@/lib/eventsService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = EventsService.saveResourceSetup(body);
    if (!result.success && result.code === -1) {
      return NextResponse.json(-1);
    }
    if (!result.success) {
      return NextResponse.json(0);
    }
    return NextResponse.json(1);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
