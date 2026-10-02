import { NextRequest, NextResponse } from 'next/server';
import { EventsService } from '@/lib/eventsService';

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // empty body
    }

    if (body.action === 'CREATE' || body.supplier) {
      const sup = body.supplier || body;
      const createdSupplier = EventsService.addInvSupplier({
        SUPPLIERNAME: sup.SUPPLIERNAME || sup.name,
        PHONE: sup.PHONE || sup.phone,
        EMAIL: sup.EMAIL || sup.email
      });
      const all = EventsService.getAllInvSuppliers();
      return NextResponse.json({ success: true, message: 'Supplier added', createdSupplier, data: all.data, total: all.total, last_page: all.last_page });
    }

    const search = body.searchvalue || '';
    const result = EventsService.getAllInvSuppliers(search);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(EventsService.getAllInvSuppliers());
}

