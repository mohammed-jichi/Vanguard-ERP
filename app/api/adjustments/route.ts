import { NextRequest, NextResponse } from 'next/server';
import { AdjustmentsService } from '@/lib/adjustmentsService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    if (action === 'branches') {
      return NextResponse.json(AdjustmentsService.getBranches());
    }
    if (action === 'locations') {
      const branchId = searchParams.get('branchId');
      return NextResponse.json(AdjustmentsService.getLocations(branchId ? Number(branchId) : undefined));
    }
    if (action === 'categories') {
      return NextResponse.json(AdjustmentsService.getCategories());
    }
    if (action === 'divisions') {
      return NextResponse.json(AdjustmentsService.getDivisions());
    }
    if (action === 'groups') {
      return NextResponse.json(AdjustmentsService.getGroups());
    }
    if (action === 'getAdjustmentById') {
      const id = searchParams.get('id');
      const record = AdjustmentsService.getAdjustmentById(Number(id));
      return NextResponse.json(record);
    }

    // Default: adjustments list
    const branchId = searchParams.get('branchId');
    const status = searchParams.get('status');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const allDates = searchParams.get('allDates');
    const search = searchParams.get('search');

    const result = AdjustmentsService.getAdjustmentsList({
      branchId: branchId ? Number(branchId) : undefined,
      status: status ? Number(status) : 3,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      allDates: allDates ? Number(allDates) : 0,
      search: search || undefined
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || body.action;

    switch (action) {
      case 'getAdjustmentService': {
        const items = AdjustmentsService.getAdjustmentItems(
          Number(body.branchid) || 1,
          Number(body.locationid) || 1,
          {
            search: body.searchvalue || '',
            include: Number(body.include) || 0,
            searchBy: Number(body.searchby) || 0,
            comboValue: Number(body.combovalue) || 0,
            checkNegQty: body.checknegqty == 1,
            hide0Qty: body.hide0qty == 1
          }
        );
        return NextResponse.json(items);
      }

      case 'saveAdjustment': {
        const saved = AdjustmentsService.saveAdjustment(body);
        return NextResponse.json({ status: 1, adjustid: saved.ADJUSTID, record: saved });
      }

      case 'postadjustmentService': {
        const posted = AdjustmentsService.postAdjustment(body);
        return NextResponse.json({ status: 1, adjustid: posted.ADJUSTID, record: posted });
      }

      case 'getadjustmentsbybranchService': {
        const list = AdjustmentsService.getAdjustmentsList({
          branchId: Number(body.branchid) || undefined,
          status: Number(body.status) || 3,
          fromDate: body.adjustmentFrom,
          toDate: body.adjustmentTo,
          allDates: body.adjustmentAllDates,
          search: body.searchvalue
        });
        return NextResponse.json(list);
      }

      case 'getadjustrecallService': {
        const found = AdjustmentsService.getAdjustmentById(Number(body.adjustid));
        return NextResponse.json(found ? found.items : []);
      }

      case 'editPreviousAdjustment': {
        const updated = AdjustmentsService.saveAdjustment(body);
        return NextResponse.json(1);
      }

      case 'postPreviousAdjustment': {
        const posted = AdjustmentsService.postAdjustment(body);
        return NextResponse.json(1);
      }

      case 'deleteadjustrecallService': {
        const deleted = AdjustmentsService.deleteAdjustment(Number(body.adjustid));
        return NextResponse.json(deleted ? 1 : 0);
      }

      case 'deleteAllUnpostedAdjustments': {
        const count = AdjustmentsService.deleteAllUnposted(Number(body.branchid) || undefined);
        return NextResponse.json(count);
      }

      case 'deleteUnpostedAdjustmentFromPreview': {
        const ok = AdjustmentsService.deleteAdjustment(Number(body.adjustid));
        return NextResponse.json(ok ? 1 : 0);
      }

      case 'transferAdjustmentToAccounting': {
        const res = AdjustmentsService.transferToAccounting(Number(body.id));
        return NextResponse.json(res);
      }

      case 'getImportedItemsForAdjustments': {
        const items = AdjustmentsService.parseCsv(body.csv || '', Number(body.branchid), Number(body.location));
        return NextResponse.json({ items });
      }

      case 'addLocation': {
        const loc = AdjustmentsService.addLocation(Number(body.branchId) || 1, body.name || 'New Location');
        return NextResponse.json(loc);
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
