import { db } from "@/lib/db";

export interface ApprovePlatformOrderInput {
  orderId: string;
  repCode: string;
  corridorId: number;
}

export async function approveAndQueueOrderToFleet({
  orderId,
  repCode,
  corridorId,
}: ApprovePlatformOrderInput) {
  return await db.$transaction(async (tx) => {
    // 1. جلب الطلب وبنوده
    const order = await tx.online_platform_orders.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new Error("Order not found");

    // 2. فحص الرصيد المتاح (Vanguard Stock - Reserved) لمنع العجز
    for (const line of order.items) {
      const stock = await tx.vanguard_inventory.findUnique({
        where: { id: line.item_id },
        select: { vanguard_stock: true, qty_reserved: true, item_name: true },
      });

      const availableQty = (stock?.vanguard_stock || 0) - (stock?.qty_reserved || 0);
      if (availableQty < line.quantity) {
        await tx.online_platform_order_items.update({
          where: { id: line.id },
          data: { is_missing: true },
        });
        throw new Error(`الصنف ${stock?.item_name || line.item_id} غير متوفر بالكمية المطلوبة.`);
      }
    }

    // 3. إنشاء فاتورة مبيعات Vanguard بحالة حجز وتسليم مستقبلي
    const salesInvoice = await tx.sales_invoices.create({
      data: {
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        total_amount: order.product_amount_usd,
        delivery_date: new Date(),
        delivery_status: "pending_delivery",
        delivery_corridor_id: corridorId,
        is_posted: true,
      },
    });

    // 4. حجز المخزون فعلياً (qty_reserved) وربط البنود بالفاتورة
    for (const line of order.items) {
      await tx.vanguard_inventory.update({
        where: { id: line.item_id },
        data: { qty_reserved: { increment: line.quantity } },
      });

      await tx.sales_invoice_items.create({
        data: {
          invoice_id: salesInvoice.id,
          item_id: line.item_id,
          quantity: line.quantity,
          unit_price: line.unit_price_usd,
        },
      });
    }

    // 5. تحويل حالة الطلب إلى QUEUED ليظهر فوراً في Departure Manifest في SuperSonic
    const updatedOrder = await tx.online_platform_orders.update({
      where: { id: orderId },
      data: {
        order_status: "queued",
        sales_invoice_id: salesInvoice.id,
        corridor_id: corridorId,
        rep_code: repCode,
        updated_at: new Date(),
      },
    });

    return {
      success: true,
      orderNumber: updatedOrder.order_number,
      invoiceId: salesInvoice.id,
    };
  });
}
