import { db } from "@/lib/db";

export interface CompleteDeliveryInput {
  orderId: string;
  invoiceId: string;
  driverId: string;
  driverName: string;
  paymentMethod: "COD" | "WHISH";
  collectedUsd: number;
  collectedLbp: number;
  signatureSvg: string;
  items: { itemId: string; quantity: number }[];
}

export async function completeDriverDelivery({
  orderId,
  invoiceId,
  driverId,
  driverName,
  paymentMethod,
  collectedUsd,
  collectedLbp,
  signatureSvg,
  items,
}: CompleteDeliveryInput) {
  return await db.$transaction(async (tx) => {
    // 1. تسجيل سند التسليم الفعلي وإثبات التوقيع POD
    const deliveryNote = await tx.delivery_notes.create({
      data: {
        invoice_id: invoiceId,
        delivered_by: driverId,
        recipient_name: driverName,
        payment_method: paymentMethod,
        collected_amount_usd: collectedUsd,
        collected_amount_lbp: collectedLbp,
        signature_svg: signatureSvg,
      },
    });

    // 2. فك حجز المخزون وخصم الرصيد المستودعي الفعلي
    for (const item of items) {
      await tx.vanguard_inventory.update({
        where: { id: item.itemId },
        data: {
          qty_reserved: { decrement: item.quantity },
          vanguard_stock: { decrement: item.quantity },
        },
      });

      await tx.delivery_note_items.create({
        data: {
          delivery_note_id: deliveryNote.id,
          item_id: item.itemId,
          quantity_delivered: item.quantity,
        },
      });

      // توثيق حركة الصرف النهائي
      await tx.stock_ledger.create({
        data: {
          item_id: item.itemId,
          transaction_type: "DELIVERY_POD",
          reference_id: deliveryNote.id,
          qty_out: item.quantity,
        },
      });
    }

    // 3. تحديث الفاتورة إلى مسلّمة وحفظ التوقيع
    await tx.sales_invoices.update({
      where: { id: invoiceId },
      data: {
        delivery_status: "delivered",
        proof_signature_svg: signatureSvg,
      },
    });

    // 4. تحديث حالة الطلب في SuperSonic Fleet إلى DELIVERED
    await tx.online_platform_orders.update({
      where: { id: orderId },
      data: {
        order_status: "delivered",
        updated_at: new Date(),
      },
    });

    // 5. توجيه القيد المالي لصندوق الكاش Vault أو محفظة Whish
    const targetAccount =
      paymentMethod === "COD"
        ? "Choueifat Central Cash Vault"
        : "SuperSonic Whish Wallet";

    await tx.fleet_ledger_entries.create({
      data: {
        reference_order_id: orderId,
        account: targetAccount,
        amount_usd: collectedUsd,
        amount_lbp: collectedLbp,
        entry_type: paymentMethod === "COD" ? "VAULT_COD" : "WHISH_DEPOSIT",
        notes: `تحصيل شحنة بواسطة السائق ${driverName}`,
      },
    });

    return { success: true, deliveryNoteId: deliveryNote.id };
  });
}
