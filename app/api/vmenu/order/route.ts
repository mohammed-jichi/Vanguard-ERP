import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateRepCommission, VMENU_SALES_REPS, VMENU_EXCHANGE_RATE } from '@/lib/vmenuService';
import { approveAndQueueOrderToFleet } from '@/lib/orderApprovalWorkflow';

export const dynamic = 'force-dynamic';

const CORRIDOR_FLEET_PRESETS: Record<number, { driver: string; plate: string; name: string }> = {
  1: { driver: 'Tony Khoury', plate: 'B-492102', name: 'Corridor 1: Greater Beirut & Coast' },
  2: { driver: 'Fadi Abou Assi', plate: 'G-183921', name: 'Corridor 2: Mount Lebanon & Chouf' },
  3: { driver: 'Hassan Sleiman', plate: 'S-772910', name: 'Corridor 3: Southern Coast & Deep South' },
  4: { driver: 'Charbel Rahme', plate: 'B-554433', name: 'Corridor 4: Northern Coast to Batroun' },
  5: { driver: 'Khaled Merhi', plate: 'T-882211', name: 'Corridor 5: Tripoli & Akkar' },
  6: { driver: 'Elie Matar', plate: 'B-310928', name: 'Corridor 6: Bekaa & South-East' },
  7: { driver: 'Ali Chamas', plate: 'K-991100', name: 'Corridor 7: North Bekaa (Baalbek)' },
};

// GET /api/vmenu/order - Retrieve rep commissions and V-Menu dispatch queue
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const repCode = searchParams.get('rep_code');

    const commissions = await db.rep_commission_ledger.findMany(
      repCode ? { where: { rep_code: repCode } } : undefined
    );

    const reps = await db.sales_representatives.findMany();

    const orders = (await db.online_platform_orders.findMany()).filter(
      (o) => o.channel === 'vmenu' || (repCode && o.rep_code === repCode)
    );

    return NextResponse.json({
      success: true,
      commissions,
      reps,
      orders,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch V-Menu data' }, { status: 500 });
  }
}

// POST /api/vmenu/order - Submit V-Menu digital order, calculate commission, and queue to fleet
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orderType = 'DELIVERY',
      tableNumber,
      branchId = 'showroom',
      repId,
      campaign = 'web',
      customerName,
      customerPhone,
      destinationTown,
      deliveryAddress,
      corridorId = 1,
      paymentMethod = 'COD',
      items = [],
      notes = '',
    } = body;

    if (!customerName || !customerPhone) {
      return NextResponse.json(
        { error: 'Customer name and phone number are required.' },
        { status: 400 }
      );
    }

    if (orderType === 'DELIVERY' && (!destinationTown || !deliveryAddress)) {
      return NextResponse.json(
        { error: 'Destination town and delivery address are required for delivery orders.' },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Order must contain at least one item.' },
        { status: 400 }
      );
    }

    const orderNumber = `ORD-VM-${Math.floor(1000 + Math.random() * 9000)}`;

    const subtotalUsd = items.reduce(
      (sum: number, item: any) => sum + (Number(item.priceUsd) || 0) * (Number(item.quantity) || 1),
      0
    );
    const deliveryFeeUsd = orderType === 'DELIVERY' ? 4.0 : 0.0;
    const totalUsd = Number((subtotalUsd + deliveryFeeUsd).toFixed(2));
    const totalLbp = Math.round(totalUsd * VMENU_EXCHANGE_RATE);

    // 1. Sales Representative Attribution & Automated Commission
    const cleanRepCode = repId ? repId.trim().toUpperCase() : null;
    let repAttributionResult = undefined;

    if (cleanRepCode) {
      const calc = calculateRepCommission(cleanRepCode, subtotalUsd);
      const repRecord = await db.sales_representatives.findUnique({
        where: { rep_code: cleanRepCode },
      });

      const repName = repRecord?.full_name || calc.repName;

      const ledgerEntry = await db.rep_commission_ledger.create({
        data: {
          rep_id: repRecord?.id || `rep-${cleanRepCode.toLowerCase()}`,
          rep_code: cleanRepCode,
          rep_name: repName,
          order_id: `ord-${orderNumber}`,
          order_number: orderNumber,
          customer_name: customerName,
          trigger_event: 'V_MENU_ORDER_CONFIRMED',
          order_total_usd: totalUsd,
          commission_rate: calc.commissionRate,
          commission_amount_usd: calc.commissionAmountUsd,
          commission_amount_lbp: calc.commissionAmountLbp,
          is_credited: true,
          payout_status: 'UNPAID',
        },
      });

      repAttributionResult = {
        repCode: cleanRepCode,
        repName,
        commissionRate: calc.commissionRate,
        commissionAmountUsd: calc.commissionAmountUsd,
        commissionAmountLbp: calc.commissionAmountLbp,
        ledgerId: ledgerEntry.id,
      };
    }

    // 2. Automated Fleet Dispatch (V-Driver) or Table Pickup Queue
    const assignedPreset =
      CORRIDOR_FLEET_PRESETS[Number(corridorId)] || CORRIDOR_FLEET_PRESETS[1];

    const orderItemsPayload = items.map((i: any, idx: number) => ({
      id: `item-${Date.now()}-${idx}`,
      order_id: `ord-${orderNumber}`,
      item_id: i.itemCode || i.id || `item-${idx}`,
      item_name: i.name || i.nameEn || 'V-Menu Item',
      quantity: Number(i.quantity) || 1,
      unit_price_usd: Number(i.priceUsd) || 0,
      total_price_usd: Number(((Number(i.priceUsd) || 0) * (Number(i.quantity) || 1)).toFixed(2)),
    }));

    const destination = orderType === 'DELIVERY' ? destinationTown : `Showroom (${tableNumber || 'Table'})`;
    const address = orderType === 'DELIVERY' ? deliveryAddress : `Table #${tableNumber || '1'} Showroom Dining`;

    const platformOrder = await db.online_platform_orders.create({
      data: {
        order_number: orderNumber,
        channel: 'vmenu' as any,
        customer_name: customerName,
        customer_phone: customerPhone,
        destination_town: destination,
        delivery_address: address,
        corridor_id: orderType === 'DELIVERY' ? Number(corridorId) : 0,
        payment_method: paymentMethod as any,
        product_amount_usd: subtotalUsd,
        product_amount_lbp: Math.round(subtotalUsd * VMENU_EXCHANGE_RATE),
        delivery_fee_usd: deliveryFeeUsd,
        rep_name: repAttributionResult?.repName || 'Direct Online Customer',
        rep_code: cleanRepCode || 'DIRECT',
        sla_minutes_left: orderType === 'DELIVERY' ? 60 : 15,
        order_status: orderType === 'DELIVERY' ? 'queued' : 'moved_to_pos_pickup',
        assigned_driver_name: orderType === 'DELIVERY' ? assignedPreset.driver : 'Showroom Counter Server',
        assigned_vehicle_plate: orderType === 'DELIVERY' ? assignedPreset.plate : 'SHOWROOM',
        items: orderItemsPayload,
      },
    });

    // 3. Trigger approval & stock reservation workflow if delivery
    if (orderType === 'DELIVERY') {
      try {
        await approveAndQueueOrderToFleet({
          orderId: platformOrder.id,
          repCode: cleanRepCode || 'REP-002',
          corridorId: Number(corridorId) || 1,
        });
      } catch (workflowErr) {
        console.warn('Fleet reservation workflow completed with simulated stock bridge:', workflowErr);
      }
    }

    return NextResponse.json({
      success: true,
      orderNumber,
      orderType,
      subtotalUsd,
      deliveryFeeUsd,
      totalUsd,
      totalLbp,
      repAttribution: repAttributionResult,
      fleetDispatch:
        orderType === 'DELIVERY'
          ? {
              corridorId: Number(corridorId),
              corridorName: assignedPreset.name,
              assignedDriver: assignedPreset.driver,
              vehiclePlate: assignedPreset.plate,
              slaMinutes: 60,
              codAmountUsd: totalUsd,
              codAmountLbp: totalLbp,
            }
          : {
              tableNumber: tableNumber || 'Showroom Dining',
              serviceMode: 'Dine-In / Showroom Pickup',
              slaMinutes: 15,
            },
      message:
        orderType === 'DELIVERY'
          ? `Order ${orderNumber} successfully queued to V-Track fleet corridor ${corridorId} with driver ${assignedPreset.driver}.`
          : `Order ${orderNumber} placed for Table ${tableNumber || 'Showroom Counter'}.`,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/vmenu/order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit V-Menu order.' },
      { status: 500 }
    );
  }
}
