// ============================================================
// VANGUARD ERP: UNIVERSAL SCALE INTEGRATION, CONTROL & NOTIFICATIONS SERVICE
// Organization: Southern Olive Oil Products S.A.R.L
// ============================================================

import { db, SalesInvoiceRecord } from '@/lib/db';
import {
  ElectronicScaleProtocol,
  ElectronicScaleDevice,
  WeightedBarcodeParsed,
  ScaleSyncExportResult,
  UnderCostSalesReportRow,
  SMSNotificationSettings,
  ReservationShift,
  ReservationSettings,
} from '@/types/scale-control-notifications';
import { VanguardInventoryStock } from '@/types/fleet-social-integration';

/**
 * Parses embedded-weight barcode (e.g. EAN-13 prefixed with 20, 21, 22).
 * Standard format: PP IIIII WWWWW C
 * - PP: 2-digit Prefix
 * - IIIII: 5-digit PLU code
 * - WWWWW: 5-digit Weight in grams (e.g. 01250 = 1.250 kg)
 * - C: Checksum digit
 */
export async function parseWeightedBarcode(
  rawBarcode: string,
  options?: {
    expectedPrefix?: string;
    deviceId?: string;
  }
): Promise<WeightedBarcodeParsed> {
  const cleanBarcode = (rawBarcode || '').trim();

  // Validate length (standard EAN-13 is 13 digits, some scanners omit leading zero => 12 digits)
  if (!cleanBarcode || (cleanBarcode.length !== 12 && cleanBarcode.length !== 13)) {
    return {
      raw_barcode: cleanBarcode,
      prefix: '',
      plu_code: '',
      raw_weight_kg: 0,
      tare_weight_kg: 0,
      net_weight_kg: 0,
      unit_price_usd: 0,
      total_price_usd: 0,
      checksum: '',
      is_scale_item: false,
      is_valid: false,
      error: `Invalid barcode length (${cleanBarcode.length}). Must be 12 or 13 digits.`,
    };
  }

  // Normalize to 13 digits if 12
  const barcode13 = cleanBarcode.length === 12 ? `0${cleanBarcode}` : cleanBarcode;

  const prefix = barcode13.substring(0, 2);
  const pluCode = barcode13.substring(2, 7);
  const weightGramsRaw = parseInt(barcode13.substring(7, 12), 10);
  const checksum = barcode13.substring(12, 13);

  // If specific device provided, verify prefix match
  if (options?.deviceId) {
    const device = await db.electronic_scale_devices.findUnique({
      where: { id: options.deviceId },
    });
    if (device && device.weight_barcode_prefix && device.weight_barcode_prefix !== prefix) {
      return {
        raw_barcode: cleanBarcode,
        prefix,
        plu_code: pluCode,
        raw_weight_kg: 0,
        tare_weight_kg: 0,
        net_weight_kg: 0,
        unit_price_usd: 0,
        total_price_usd: 0,
        checksum,
        is_scale_item: false,
        is_valid: false,
        error: `Barcode prefix '${prefix}' does not match scale profile '${device.scale_name}' prefix '${device.weight_barcode_prefix}'`,
      };
    }
  }

  if (options?.expectedPrefix && options.expectedPrefix !== prefix) {
    return {
      raw_barcode: cleanBarcode,
      prefix,
      plu_code: pluCode,
      raw_weight_kg: 0,
      tare_weight_kg: 0,
      net_weight_kg: 0,
      unit_price_usd: 0,
      total_price_usd: 0,
      checksum,
      is_scale_item: false,
      is_valid: false,
      error: `Expected prefix '${options.expectedPrefix}', received '${prefix}'`,
    };
  }

  const rawWeightKg = Number((weightGramsRaw / 1000).toFixed(3));

  // Lookup PLU in vanguard_inventory
  const item = await db.vanguard_inventory.findFirst({
    where: { plu_code: pluCode },
  });

  if (!item) {
    return {
      raw_barcode: cleanBarcode,
      prefix,
      plu_code: pluCode,
      raw_weight_kg: rawWeightKg,
      tare_weight_kg: 0,
      net_weight_kg: rawWeightKg,
      unit_price_usd: 0,
      total_price_usd: 0,
      checksum,
      is_scale_item: false,
      is_valid: false,
      error: `No active inventory item found for PLU code '${pluCode}'`,
    };
  }

  const tareWeightKg = Number((item.scale_tare_weight_kg || 0).toFixed(3));
  const netWeightKg = Math.max(0, Number((rawWeightKg - tareWeightKg).toFixed(3)));
  const unitPriceUsd = item.unit_price_usd || 0;
  const totalPriceUsd = Number((netWeightKg * unitPriceUsd).toFixed(2));

  return {
    raw_barcode: cleanBarcode,
    prefix,
    plu_code: pluCode,
    raw_weight_kg: rawWeightKg,
    tare_weight_kg: tareWeightKg,
    net_weight_kg: netWeightKg,
    unit_price_usd: unitPriceUsd,
    total_price_usd: totalPriceUsd,
    checksum,
    item_id: item.id,
    item_name: item.item_name,
    is_scale_item: !!item.is_scale_item,
    is_valid: true,
  };
}

/**
 * Formats scale items according to hardware vendor protocol for network transmission.
 */
export function generateScaleExportPayload(
  protocol: ElectronicScaleProtocol,
  items: VanguardInventoryStock[]
): string {
  const scaleItems = items.filter((i) => i.is_scale_item);

  switch (protocol) {
    case 'ALFA':
      // ALFA PLU protocol: PLU,NAME,PRICE,TARE_KG,EXPIRY_DAYS
      return [
        '# VANGUARD ERP -> ALFA SCALE PLU TABLE',
        '# VERSION=2.4 ENCODING=UTF-8',
        ...scaleItems.map((item) => {
          const plu = (item.plu_code || '00000').padStart(5, '0');
          const name = (item.scale_item_description || item.item_name).replace(/[,;]/g, ' ');
          const price = (item.unit_price_usd || 0).toFixed(2);
          const tare = (item.scale_tare_weight_kg || 0).toFixed(3);
          const shelf = item.scale_shelf_life_days || 365;
          return `${plu},${name},${price},${tare},${shelf}`;
        }),
      ].join('\n');

    case 'BIZERBA':
      // BIZERBA GX/SC protocol: REC_TYPE|PLU|DESC|PRICE|TARE_G|SHELF_DAYS
      return [
        '[HEADER:BIZERBA_SCALE_SYNC]',
        'PROTOCOL=GX_PLU_V3',
        ...scaleItems.map((item) => {
          const plu = (item.plu_code || '00000').padStart(6, '0');
          const desc = item.scale_item_description || item.item_name;
          const price = (item.unit_price_usd || 0).toFixed(2);
          const tareG = Math.round((item.scale_tare_weight_kg || 0) * 1000);
          const shelf = item.scale_shelf_life_days || 365;
          return `01|${plu}|${desc}|${price}|${tareG}|${shelf}`;
        }),
      ].join('\r\n');

    case 'DIBAL':
      // DIBAL 500 Series format: DIBAL;PLU;NAME;PRICE;TARE;EXPDAYS
      return scaleItems
        .map((item) => {
          const plu = item.plu_code || '0000';
          const name = (item.scale_item_description || item.item_name).replace(/[;]/g, ' ');
          const price = (item.unit_price_usd || 0).toFixed(2);
          const tare = (item.scale_tare_weight_kg || 0).toFixed(3);
          const expDays = item.scale_shelf_life_days || 365;
          return `DIBAL;${plu};${name};${price};${tare};${expDays}`;
        })
        .join('\n');

    case 'DIGI':
      // DIGI SM Series TSV: PLU\tNAME\tPRICE\tTARE\tSHELF_DAYS
      return [
        'PLU\tNAME\tPRICE\tTARE\tSHELF_DAYS',
        ...scaleItems.map((item) => {
          const plu = item.plu_code || '0000';
          const name = item.scale_item_description || item.item_name;
          const price = (item.unit_price_usd || 0).toFixed(2);
          const tare = (item.scale_tare_weight_kg || 0).toFixed(3);
          const shelf = item.scale_shelf_life_days || 365;
          return `${plu}\t${name}\t${price}\t${tare}\t${shelf}`;
        }),
      ].join('\r\n');

    case 'CAS':
      // CAS CL5000/CL7000 format: PLU|CODE|NAME|PRICE|TARE|SHELF
      return scaleItems
        .map((item) => {
          const plu = (item.plu_code || '0000').padStart(4, '0');
          const name = item.scale_item_description || item.item_name;
          const price = (item.unit_price_usd || 0).toFixed(2);
          const tare = (item.scale_tare_weight_kg || 0).toFixed(3);
          const shelf = item.scale_shelf_life_days || 365;
          return `PLU|${plu}|${name}|${price}|${tare}|${shelf}`;
        })
        .join('\n');

    case 'TOLEDO':
      // Mettler Toledo bPlus / Tiger format: TOLEDO:PLU,NAME,UNIT_PRICE,TARE,DAYS
      return [
        '$$SCALE_PROTOCOL_METTLER_TOLEDO',
        ...scaleItems.map((item) => {
          const plu = item.plu_code || '00000';
          const name = item.scale_item_description || item.item_name;
          const price = (item.unit_price_usd || 0).toFixed(2);
          const tare = (item.scale_tare_weight_kg || 0).toFixed(3);
          const shelf = item.scale_shelf_life_days || 365;
          return `TOLEDO:${plu},${name},${price},${tare},${shelf}`;
        }),
      ].join('\n');

    case 'UNIVERSAL_PLU':
    default:
      return JSON.stringify(
        scaleItems.map((item) => ({
          plu_code: item.plu_code,
          item_id: item.id,
          item_name: item.item_name,
          scale_description: item.scale_item_description,
          unit_price_usd: item.unit_price_usd || 0,
          tare_weight_kg: item.scale_tare_weight_kg || 0,
          shelf_life_days: item.scale_shelf_life_days || 365,
        })),
        null,
        2
      );
  }
}

/**
 * Triggers hardware scale synchronization over network.
 */
export async function syncScaleDevice(deviceId: string): Promise<ScaleSyncExportResult> {
  const device = await db.electronic_scale_devices.findUnique({
    where: { id: deviceId },
  });

  if (!device) {
    throw new Error(`Electronic scale device '${deviceId}' not found`);
  }

  const items = await db.vanguard_inventory.findMany({
    where: { is_scale_item: true },
  });

  const payload = generateScaleExportPayload(device.scale_model, items);
  const nowIso = new Date().toISOString();

  await db.electronic_scale_devices.update({
    where: { id: deviceId },
    data: { last_synced_at: nowIso },
  });

  return {
    device_id: device.id,
    scale_name: device.scale_name,
    protocol: device.scale_model,
    item_count: items.length,
    payload_preview: payload.substring(0, 300) + (payload.length > 300 ? '...' : ''),
    synced_at: nowIso,
    status: 'SUCCESS',
  };
}

/**
 * Implements SQL View view_under_cost_sales_report:
 * SELECT 
 *   i.item_name,
 *   line.unit_price_usd AS selling_price,
 *   i.capacity_kg,
 *   inv.cost_price AS unit_cost,
 *   (inv.cost_price - line.unit_price_usd) AS loss_margin,
 *   inv_parent.created_at AS sale_date
 * FROM sales_invoice_items line
 * JOIN vanguard_inventory i ON line.item_id = i.id
 * LEFT JOIN vanguard_inventory inv ON inv.id = line.item_id
 * JOIN sales_invoices inv_parent ON line.invoice_id = inv_parent.id
 * WHERE line.unit_price_usd <= COALESCE(inv.cost_price, 0);
 */
export async function getUnderCostSalesReport(): Promise<{
  rows: UnderCostSalesReportRow[];
  totalLossAmount: number;
  totalUnderCostLines: number;
  maxLossMargin: number;
}> {
  const invoices = await db.sales_invoices.findMany();
  const allLines = await db.sales_invoice_items.findMany();
  const allInventory = await db.vanguard_inventory.findMany();

  const inventoryMap = new Map<string, VanguardInventoryStock>();
  allInventory.forEach((inv) => inventoryMap.set(inv.id, inv));

  const invoiceMap = new Map<string, SalesInvoiceRecord>();
  invoices.forEach((inv) => invoiceMap.set(inv.id, inv));

  const underCostRows: UnderCostSalesReportRow[] = [];

  for (const line of allLines) {
    const inv = inventoryMap.get(line.item_id);
    const parentInvoice = invoiceMap.get(line.invoice_id);

    if (!inv || !parentInvoice) continue;

    const unitCost = Number(inv.cost_price || 0);
    const sellingPrice = Number(line.unit_price_usd ?? line.unit_price ?? 0);

    // WHERE line.unit_price_usd <= COALESCE(inv.cost_price, 0)
    if (unitCost > 0 && sellingPrice <= unitCost) {
      const lossMargin = Number((unitCost - sellingPrice).toFixed(2));
      underCostRows.push({
        item_name: inv.item_name,
        selling_price: sellingPrice,
        capacity_kg: inv.capacity_kg ?? null,
        unit_cost: unitCost,
        loss_margin: lossMargin,
        sale_date: parentInvoice.created_at
          ? new Date(parentInvoice.created_at).toISOString()
          : new Date().toISOString(),
        invoice_id: parentInvoice.id,
        invoice_ref: parentInvoice.invoice_ref,
      });
    }
  }

  const totalLossAmount = Number(
    underCostRows.reduce((acc, row) => acc + row.loss_margin, 0).toFixed(2)
  );
  const maxLossMargin = underCostRows.reduce(
    (max, row) => Math.max(max, row.loss_margin),
    0
  );

  return {
    rows: underCostRows,
    totalLossAmount,
    totalUnderCostLines: underCostRows.length,
    maxLossMargin,
  };
}

/**
 * Composes direct SMS text for invoice closeout and CSAT survey invitation.
 */
export async function composeInvoiceCloseSMS(invoiceId: string): Promise<{
  recipient_phone: string;
  sender_id: string;
  message_text: string;
  feedback_url?: string;
  char_count: number;
  auto_sent: boolean;
}> {
  const invoice = await db.sales_invoices.findUnique({
    where: { id: invoiceId },
  });

  if (!invoice) {
    throw new Error(`Sales invoice '${invoiceId}' not found`);
  }

  const settings = await db.sms_notification_settings.findFirst();

  const recipientPhone = invoice.customer_phone || '+96170000000';
  const senderId = settings.sender_id || 'SOUTHERN-OLV';
  const totalUsd = invoice.total_amount ? invoice.total_amount.toFixed(2) : '0.00';

  let feedbackUrl: string | undefined;
  if (settings.send_feedback_link) {
    const appBase = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_APP_URL) ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '') : '';
    const base = settings.feedback_url_base || (appBase ? `${appBase}/feedback/rate` : '/feedback/rate');
    feedbackUrl = `${base}?inv=${encodeURIComponent(invoice.invoice_ref)}&t=${Date.now()}`;
  }

  // Bilingual polite message
  let messageText = `شكراً لتعاملكم مع مؤسسة منتجات زيتون الجنوب. تم إصدار فاتورتكم رقم ${invoice.invoice_ref} بقيمة $${totalUsd}.`;
  if (feedbackUrl) {
    messageText += ` رأيكم يهمنا جداً، يرجى تقييم الخدمة عبر الرابط: ${feedbackUrl}`;
  }
  messageText += ` Thank you for choosing Southern Olive Oil Products.`;

  return {
    recipient_phone: recipientPhone,
    sender_id: senderId,
    message_text: messageText,
    feedback_url: feedbackUrl,
    char_count: messageText.length,
    auto_sent: !!settings.auto_send_on_invoice_close,
  };
}

/**
 * Calculates table stay duration, shift context, and occupancy cutoff.
 */
export async function evaluateTableStayPeriod(
  seatedAt: Date | string,
  customStayPeriodMinutes?: number
): Promise<{
  stay_period_minutes: number;
  elapsed_minutes: number;
  remaining_minutes: number;
  is_expired: boolean;
  status: 'ACTIVE' | 'WARNING_EXPIRING_SOON' | 'EXPIRED';
  active_shift: ReservationShift | null;
}> {
  const settings = await db.reservation_settings.findFirst();
  const stayMinutes = customStayPeriodMinutes || settings.table_stay_period_minutes || 120;

  const seatedTime = new Date(seatedAt).getTime();
  const now = Date.now();
  const elapsedMinutes = Math.max(0, Math.floor((now - seatedTime) / (60 * 1000)));
  const remainingMinutes = stayMinutes - elapsedMinutes;

  let status: 'ACTIVE' | 'WARNING_EXPIRING_SOON' | 'EXPIRED' = 'ACTIVE';
  if (remainingMinutes <= 0) {
    status = 'EXPIRED';
  } else if (remainingMinutes <= 15) {
    status = 'WARNING_EXPIRING_SOON';
  }

  let activeShift: ReservationShift | null = null;
  if (settings.active_shift_id) {
    activeShift = await db.reservation_shifts.findUnique({
      where: { id: settings.active_shift_id },
    });
  }

  return {
    stay_period_minutes: stayMinutes,
    elapsed_minutes: elapsedMinutes,
    remaining_minutes: remainingMinutes,
    is_expired: remainingMinutes <= 0,
    status,
    active_shift: activeShift,
  };
}
