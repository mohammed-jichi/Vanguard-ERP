import { NextRequest, NextResponse } from 'next/server';
import { EventsService } from '@/lib/eventsService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const customer = EventsService.getCustomerById(body.customerid);
    return NextResponse.json(customer);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
