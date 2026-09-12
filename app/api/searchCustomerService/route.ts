import { NextRequest, NextResponse } from 'next/server';
import { EventsService } from '@/lib/eventsService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const results = EventsService.searchCustomers(body.searchvalue || '');
    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
