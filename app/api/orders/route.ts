import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { approveAndQueueOrderToFleet } from "@/lib/orderApprovalWorkflow";
import { completeDriverDelivery } from "@/lib/driverDeliveryWorkflow";
import { OnlinePlatformOrder, OnlineOrderStatus } from "@/types/fleet-social-integration";

// Corridor Presets with Default Drivers & Plates
const CORRIDOR_FLEET_PRESETS: Record<number, { driver: string; plate: string; name: string }> = {
  1: { driver: 'Tony Khoury', plate: 'B-492102', name: 'Corridor 1: Greater Beirut & Coast' },
  2: { driver: 'Fadi Abou Assi', plate: 'G-183921', name: 'Corridor 2: Mount Lebanon & Chouf' },
  3: { driver: 'Hassan Sleiman', plate: 'S-772910', name: 'Corridor 3: Southern Coast & Deep South' },
  4: { driver: 'Charbel Rahme', plate: 'B-554433', name: 'Corridor 4: Northern Coast to Batroun' },
  5: { driver: 'Khaled Merhi', plate: 'T-882211', name: 'Corridor 5: Tripoli & Akkar' },
  6: { driver: 'Elie Matar', plate: 'B-310928', name: 'Corridor 6: Bekaa & South-East' },
  7: { driver: 'Ali Chamas', plate: 'K-991100', name: 'Corridor 7: North Bekaa (Baalbek)' },
};

// GET /api/orders - List platform orders with optional filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as OnlineOrderStatus | null;
    const corridorId = searchParams.get('corridorId');
    const repCode = searchParams.get('repCode');
    const driverName = searchParams.get('driverName');

    let orders = await db.online_platform_orders.findMany();

    if (status && status !== ('ALL' as any)) {
      orders = orders.filter((o) => o.order_status === status);
    }
    if (corridorId) {
      orders = orders.filter((o) => o.corridor_id === Number(corridorId));
    }
    if (repCode) {
      orders = orders.filter((o) => o.rep_code === repCode);
    }
    if (driverName) {
      orders = orders.filter((o) => o.assigned_driver_name?.toLowerCase().includes(driverName.toLowerCase()));
    }

    return NextResponse.json({
      success: true,
      orders,
      count: orders.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch platform orders' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create new platform order (from Social CRM / WhatsApp / Web)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      channel = 'whatsapp',
      external_chat_id,
      customer_name,
      customer_phone,
      destination_town,
      delivery_address,
      corridor_id = 1,
      payment_method = 'COD',
      product_amount_usd,
      product_amount_lbp,
      delivery_fee_usd = 4.0,
      rep_name = 'Ahmad Ali Kassem',
      rep_code = 'REP-002',
      items = [],
      autoApprove = false,
    } = body;

    if (!customer_name || !customer_phone || !destination_town || !delivery_address) {
      return NextResponse.json(
        { error: 'customer_name, customer_phone, destination_town, and delivery_address are required' },
        { status: 400 }
      );
    }

    const orderNumber = `ORD-${channel.slice(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const calcUsd = product_amount_usd !== undefined ? Number(product_amount_usd) : 100.0;
    const calcLbp = product_amount_lbp !== undefined ? Number(product_amount_lbp) : calcUsd * 90000;

    const assignedFleet = CORRIDOR_FLEET_PRESETS[Number(corridor_id)] || CORRIDOR_FLEET_PRESETS[1];

    const newOrder = await db.online_platform_orders.create({
      data: {
        order_number: orderNumber,
        channel,
        external_chat_id,
        customer_name,
        customer_phone,
        destination_town,
        delivery_address,
        corridor_id: Number(corridor_id),
        payment_method,
        product_amount_usd: calcUsd,
        product_amount_lbp: calcLbp,
        delivery_fee_usd: Number(delivery_fee_usd),
        rep_name,
        rep_code,
        sla_minutes_left: 60,
        order_status: autoApprove ? 'approved' : 'pending_rep_approval',
        assigned_driver_name: assignedFleet.driver,
        assigned_vehicle_plate: assignedFleet.plate,
        items,
      },
    });

    // If auto-approved, trigger workflow
    if (autoApprove) {
      await approveAndQueueOrderToFleet({
        orderId: newOrder.id,
        repCode: rep_code,
        corridorId: Number(corridor_id),
      });
    }

    return NextResponse.json({
      success: true,
      message: `Order ${orderNumber} created successfully`,
      order: newOrder,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create platform order' },
      { status: 500 }
    );
  }
}

// PATCH /api/orders - Companion View & Management Override Interventions
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, action, corridorId, driverName, vehiclePlate, notes, recipientName, paymentMethod } = body;

    if (!orderId || !action) {
      return NextResponse.json(
        { error: 'orderId and action are required' },
        { status: 400 }
      );
    }

    const order = await db.online_platform_orders.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: `Order ${orderId} not found` }, { status: 404 });
    }

    switch (action) {
      case 'REROUTE_CORRIDOR': {
        const newCorridor = Number(corridorId || 1);
        const preset = CORRIDOR_FLEET_PRESETS[newCorridor] || CORRIDOR_FLEET_PRESETS[1];
        const updated = await db.online_platform_orders.update({
          where: { id: orderId },
          data: {
            corridor_id: newCorridor,
            assigned_driver_name: driverName || preset.driver,
            assigned_vehicle_plate: vehiclePlate || preset.plate,
            updated_at: new Date(),
          },
        });
        return NextResponse.json({
          success: true,
          message: `Order #${order.order_number} rerouted to ${preset.name} (Driver: ${updated.assigned_driver_name})`,
          order: updated,
        });
      }

      case 'REASSIGN_DRIVER': {
        const updated = await db.online_platform_orders.update({
          where: { id: orderId },
          data: {
            assigned_driver_name: driverName,
            assigned_vehicle_plate: vehiclePlate || order.assigned_vehicle_plate,
            updated_at: new Date(),
          },
        });
        return NextResponse.json({
          success: true,
          message: `Order #${order.order_number} reassigned to driver ${driverName} (Plate: ${updated.assigned_vehicle_plate})`,
          order: updated,
        });
      }

      case 'OVERRIDE_APPROVE': {
        // Management overrides chat/order and immediately approves and queues to fleet
        const targetCorridor = Number(corridorId || order.corridor_id || 1);
        const result = await approveAndQueueOrderToFleet({
          orderId,
          repCode: order.rep_code || 'MGMT-OVERRIDE',
          corridorId: targetCorridor,
        });
        return NextResponse.json({
          success: true,
          message: `Management Override: Order #${order.order_number} approved and queued to fleet corridor ${targetCorridor}`,
          result,
        });
      }

      case 'FORCE_CLOSE_POD': {
        // Administrative force-close and manual POD confirmation
        const recipient = recipientName || order.customer_name;
        const method = paymentMethod || order.payment_method;
        const totalUsd = order.product_amount_usd + order.delivery_fee_usd;
        const totalLbp = order.product_amount_lbp;

        const result = await completeDriverDelivery({
          orderId,
          invoiceId: order.sales_invoice_id || 'inv-mgmt-force-close',
          driverId: 'emp-mgmt-override',
          driverName: driverName || order.assigned_driver_name || 'Management Override Officer',
          paymentMethod: method,
          collectedUsd: totalUsd,
          collectedLbp: totalLbp,
          signatureSvg: `<svg viewBox="0 0 120 40"><text x="10" y="25" font-family="sans-serif" font-size="12" fill="#047857">MGMT-POD-OVERRIDE</text></svg>`,
          items: (order.items || []).map((i) => ({
            itemId: i.item_id,
            quantity: i.quantity,
          })),
        });

        const updated = await db.online_platform_orders.update({
          where: { id: orderId },
          data: {
            order_status: 'delivered',
            updated_at: new Date(),
          },
        });

        return NextResponse.json({
          success: true,
          message: `Administrative Override: Order #${order.order_number} force-closed & POD approved. Stock deducted & custody logged.`,
          order: updated,
          deliveryNoteId: result.deliveryNoteId,
        });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update order' },
      { status: 500 }
    );
  }
}
