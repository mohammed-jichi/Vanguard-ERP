import { NextRequest, NextResponse } from 'next/server';
import { EventsService } from '@/lib/eventsService';

export async function POST(req: NextRequest) {
  try {
    let search = '';
    try {
      const body = await req.json();
      search = body.searchvalue || '';
    } catch {
      // empty body
    }
    const result = EventsService.getAllInvSuppliers(search);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(EventsService.getAllInvSuppliers());
}
