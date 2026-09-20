// ============================================================
// VANGUARD ERP: SUPERSONIC FLEET & SOCIAL CRM INTEGRATION SERVICE
// ============================================================

import {
  OnlinePlatformOrder,
  OnlinePlatformOrderItem,
  DeliveryNote,
  DeliveryNoteItem,
  VanguardInventoryStock,
  StockLedgerEntry,
  OnlineOrderStatus,
  PaymentCollectionMethod,
  OnlineOrderChannel,
} from '@/types/fleet-social-integration';
import { approveAndQueueOrderToFleet } from '@/lib/orderApprovalWorkflow';
import {
  completeDriverDelivery,
  CompleteDeliveryInput,
} from '@/lib/driverDeliveryWorkflow';

// In-Memory Master State for Reactive Integration & Local Simulation
let mockInventory: VanguardInventoryStock[] = [
  {
    id: 'inv-item-01',
    item_name: 'زيت زيتون بكر ممتاز بلدي 17.5 لتر (Extra Virgin 17.5L Tin)',
    capacity_kg: 15.2,
    packaging_type: 'تطفيح صاج',
    vanguard_stock: 450,
    qty_reserved: 35,
    available_stock: 415,
    min_threshold: 50,
  },
  {
    id: 'inv-item-02',
    item_name: 'ألفية زيت زيتون خضير بلدي 1000 مل (Cold Press 1L Glass)',
    capacity_kg: 0.92,
    packaging_type: 'عبوة زجاج فاخر',
    vanguard_stock: 820,
    qty_reserved: 48,
    available_stock: 772,
    min_threshold: 80,
  },
  {
    id: 'inv-item-03',
    item_name: 'دبس رمان بلدي نقي 500 مل (Pomegranate Molasses 500ml)',
    capacity_kg: 0.65,
    packaging_type: 'قنينة زجاجية',
    vanguard_stock: 310,
    qty_reserved: 20,
    available_stock: 290,
    min_threshold: 40,
  },
  {
    id: 'inv-item-04',
    item_name: 'صندوق زيتون أخضر بلدي محشي 650غ*12 (Pickled Green Olives Box)',
    capacity_kg: 7.8,
    packaging_type: 'صندوق كرتون 12 مرطبان',
    vanguard_stock: 190,
    qty_reserved: 12,
    available_stock: 178,
    min_threshold: 30,
  },
];

let mockPlatformOrders: OnlinePlatformOrder[] = [
  {
    id: 'ord-crm-001',
    order_number: 'ORD-WA-8921',
    channel: 'whatsapp',
    external_chat_id: 'chat_wa_96170112233',
    customer_name: 'سليمان كنعان (Sleiman Kanaan)',
    customer_phone: '03-112233',
    destination_town: 'بيروت - الحمرا (Hamra)',
    delivery_address: 'شارع السادات، بناية النور، الطابق الثالث',
    corridor_id: 1,
    payment_method: 'COD',
    product_amount_usd: 110.0,
    product_amount_lbp: 9900000.0,
    delivery_fee_usd: 4.0,
    rep_name: 'Ahmad Ali Kassem',
    rep_code: 'REP-002',
    sla_minutes_left: 35,
    order_status: 'pending_rep_approval',
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    items: [
      {
        id: 'item-001-1',
        order_id: 'ord-crm-001',
        item_id: 'inv-item-01',
        item_name: 'زيت زيتون بكر ممتاز بلدي 17.5 لتر',
        quantity: 1,
        unit_price_usd: 100.0,
        total_price_usd: 100.0,
      },
      {
        id: 'item-001-2',
        order_id: 'ord-crm-001',
        item_id: 'inv-item-03',
        item_name: 'دبس رمان بلدي نقي 500 مل',
        quantity: 2,
        unit_price_usd: 5.0,
        total_price_usd: 10.0,
      },
    ],
  },
  {
    id: 'ord-crm-002',
    order_number: 'ORD-IG-7412',
    channel: 'social_media',
    external_chat_id: 'ig_user_zeina_b',
    customer_name: 'زينة برجاوي (Zeina Barjawi)',
    customer_phone: '70-998877',
    destination_town: 'صيدا - القياعة (Saida)',
    delivery_address: 'أوتوستراد القياعة، مفرق الأطباء',
    corridor_id: 3,
    payment_method: 'WHISH',
    product_amount_usd: 120.0,
    product_amount_lbp: 10800000.0,
    delivery_fee_usd: 5.0,
    rep_name: 'Hiba Aloulou',
    rep_code: 'REP-004',
    sla_minutes_left: 12,
    order_status: 'approved',
    assigned_driver_name: 'Hassan Sleiman',
    assigned_vehicle_plate: 'S-772910',
    created_at: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    items: [
      {
        id: 'item-002-1',
        order_id: 'ord-crm-002',
        item_id: 'inv-item-01',
        item_name: 'زيت زيتون بكر ممتاز بلدي 17.5 لتر',
        quantity: 1,
        unit_price_usd: 100.0,
        total_price_usd: 100.0,
      },
      {
        id: 'item-002-2',
        order_id: 'ord-crm-002',
        item_id: 'inv-item-04',
        item_name: 'صندوق زيتون أخضر بلدي محشي 650غ*12',
        quantity: 1,
        unit_price_usd: 20.0,
        total_price_usd: 20.0,
      },
    ],
  },
  {
    id: 'ord-crm-003',
    order_number: 'ORD-SS-5520',
    channel: 'supersonic',
    customer_name: 'مؤسسة الهلال الغذائية (Al-Hilal Foods)',
    customer_phone: '01-852963',
    destination_town: 'عاليه - السوق الرئيسي (Aley)',
    delivery_address: 'ساحة عاليه المركزية',
    corridor_id: 2,
    payment_method: 'COD',
    product_amount_usd: 300.0,
    product_amount_lbp: 27000000.0,
    delivery_fee_usd: 6.0,
    rep_name: 'Mahdi Kassem',
    rep_code: 'REP-001',
    sla_minutes_left: 60,
    order_status: 'on_route',
    assigned_driver_name: 'Fadi Abou Assi',
    assigned_vehicle_plate: 'G-183921',
    created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    items: [
      {
        id: 'item-003-1',
        order_id: 'ord-crm-003',
        item_id: 'inv-item-01',
        item_name: 'زيت زيتون بكر ممتاز بلدي 17.5 لتر',
        quantity: 3,
        unit_price_usd: 100.0,
        total_price_usd: 300.0,
      },
    ],
  },
  {
    id: 'ord-crm-004',
    order_number: 'ORD-WB-3310',
    channel: 'website',
    customer_name: 'طارق معلوف (Tarek Maalouf)',
    customer_phone: '03-554433',
    destination_town: 'الشويفات - صالة العرض (Choueifat Showroom)',
    delivery_address: 'استلام مباشر من مركز الشويفات (Showroom Pickup)',
    corridor_id: 2,
    payment_method: 'COD',
    product_amount_usd: 50.0,
    product_amount_lbp: 4500000.0,
    delivery_fee_usd: 0.0,
    rep_name: 'Ahmad Ali Kassem',
    rep_code: 'REP-002',
    sla_minutes_left: 0,
    order_status: 'moved_to_pos_pickup',
    created_at: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    items: [
      {
        id: 'item-004-1',
        order_id: 'ord-crm-004',
        item_id: 'inv-item-03',
        item_name: 'دبس رمان بلدي نقي 500 مل',
        quantity: 10,
        unit_price_usd: 5.0,
        total_price_usd: 50.0,
      },
    ],
  },
];

let mockDeliveryNotes: DeliveryNote[] = [
  {
    id: 'pod-note-001',
    delivery_note_number: 1001,
    invoice_id: 'inv-ref-8812',
    delivered_at: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    delivered_by: 'SS-EMP-01',
    recipient_name: 'عماد البركة (سوبرماركت البركة)',
    payment_method: 'COD',
    collected_amount_usd: 104.0,
    collected_amount_lbp: 9360000.0,
    signature_svg: 'data:image/svg+xml;utf8,<svg viewBox="0 0 100 40"><path d="M10 20 Q 30 5 50 20 T 90 20" stroke="black" fill="none"/></svg>',
    notes: 'تم التسليم والمطابقة مع الفاتورة رقم 8812',
    created_at: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    items: [
      {
        id: 'dn-item-1',
        delivery_note_id: 'pod-note-001',
        item_id: 'inv-item-01',
        quantity_delivered: 1,
      },
    ],
  },
];

let mockStockLedger: StockLedgerEntry[] = [
  {
    id: 'ledger-001',
    item_id: 'inv-item-01',
    transaction_type: 'SALES_DIRECT',
    reference_id: 'inv-ref-8812',
    qty_in: 0,
    qty_out: 1,
    notes: 'Direct POD delivery to Al-Baraka',
    created_at: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
  },
];

export class FleetSocialIntegrationService {
  // 1. Fetch Platform Orders
  static getPlatformOrders(filters?: {
    status?: OnlineOrderStatus;
    corridorId?: number;
    channel?: OnlineOrderChannel;
  }): OnlinePlatformOrder[] {
    let result = [...mockPlatformOrders];
    if (filters?.status) {
      result = result.filter((o) => o.order_status === filters.status);
    }
    if (filters?.corridorId) {
      result = result.filter((o) => o.corridor_id === filters.corridorId);
    }
    if (filters?.channel) {
      result = result.filter((o) => o.channel === filters.channel);
    }
    return result;
  }

  // 2. Fetch Single Order
  static getOrderById(orderId: string): OnlinePlatformOrder | undefined {
    return mockPlatformOrders.find((o) => o.id === orderId);
  }

  // 3. Create Online Platform Order (From Social CRM / WhatsApp / Web)
  static createPlatformOrder(
    orderData: Omit<OnlinePlatformOrder, 'id' | 'order_number' | 'created_at' | 'updated_at'> & {
      order_number?: string;
    }
  ): OnlinePlatformOrder {
    const id = `ord-crm-${Date.now()}`;
    const order_number =
      orderData.order_number ||
      `ORD-${orderData.channel.slice(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: OnlinePlatformOrder = {
      ...orderData,
      id,
      order_number,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockPlatformOrders.unshift(newOrder);
    return newOrder;
  }

  // 4. Approve Platform Order (By Sales Rep) & Reserve Stock
  static approveOrder(
    orderId: string,
    options?: {
      targetCorridorId?: number;
      assignedDriver?: string;
      vehiclePlate?: string;
    }
  ): { success: boolean; order?: OnlinePlatformOrder; message: string } {
    const orderIndex = mockPlatformOrders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) {
      return { success: false, message: 'Order not found' };
    }

    const order = mockPlatformOrders[orderIndex];

    // Trigger stock reservation to prevent double selling
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        const inv = mockInventory.find((i) => i.id === item.item_id);
        if (inv) {
          inv.qty_reserved += item.quantity;
          inv.available_stock = Math.max(0, inv.vanguard_stock - inv.qty_reserved);
        }
      }
    }

    order.order_status = 'approved';
    order.updated_at = new Date().toISOString();
    if (options?.targetCorridorId) order.corridor_id = options.targetCorridorId;
    if (options?.assignedDriver) order.assigned_driver_name = options.assignedDriver;
    if (options?.vehiclePlate) order.assigned_vehicle_plate = options.vehiclePlate;

    return {
      success: true,
      order,
      message: `Order ${order.order_number} approved successfully. Stock reserved to prevent double selling.`,
    };
  }

  // 4b. Transactional Approve & Queue directly to SuperSonic Fleet
  static async approveAndQueueToFleet(input: {
    orderId: string;
    repCode: string;
    corridorId: number;
  }) {
    return await approveAndQueueOrderToFleet(input);
  }

  // 5. Dispatch Order to SuperSonic Fleet
  static dispatchToFleet(
    orderId: string,
    dispatchParams: {
      corridorId: number;
      driverName: string;
      vehiclePlate: string;
      status?: 'queued' | 'on_route';
    }
  ): { success: boolean; order?: OnlinePlatformOrder; message: string } {
    const order = mockPlatformOrders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found' };

    order.order_status = dispatchParams.status || 'queued';
    order.corridor_id = dispatchParams.corridorId;
    order.assigned_driver_name = dispatchParams.driverName;
    order.assigned_vehicle_plate = dispatchParams.vehiclePlate;
    order.updated_at = new Date().toISOString();

    return {
      success: true,
      order,
      message: `Order ${order.order_number} successfully dispatched to Corridor ${order.corridor_id} with driver ${order.assigned_driver_name}`,
    };
  }

  // 6. Switch Fulfillment to POS Pickup Counter
  static routeToPosPickup(
    orderId: string,
    actor: { actorCode: string; actorName: string }
  ): { success: boolean; order?: OnlinePlatformOrder; message: string } {
    const order = mockPlatformOrders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found' };

    order.order_status = 'moved_to_pos_pickup';
    order.delivery_fee_usd = 0;
    order.delivery_address = 'استلام مباشر من صالة العرض (Showroom POS Counter)';
    order.updated_at = new Date().toISOString();

    return {
      success: true,
      order,
      message: `Order ${order.order_number} rerouted to POS Pickup Counter by ${actor.actorName} (${actor.actorCode})`,
    };
  }

  // 7. Escalate to Management (e.g., SLA breach, address dispute, client custom request)
  static escalateToManagement(
    orderId: string,
    reason?: string
  ): { success: boolean; order?: OnlinePlatformOrder; message: string } {
    const order = mockPlatformOrders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found' };

    order.order_status = 'escalated_to_management';
    order.updated_at = new Date().toISOString();

    return {
      success: true,
      order,
      message: `Order ${order.order_number} escalated to Management. Reason: ${reason || 'SLA verification requirement'}`,
    };
  }

  // 8. Confirm POD Delivery & Create Delivery Note (Deducts reserved stock and updates ledger)
  static confirmDelivery(
    orderId: string,
    pod: {
      deliveredByDriverId?: string;
      recipientName: string;
      paymentMethod: PaymentCollectionMethod;
      collectedUsd: number;
      collectedLbp: number;
      signatureSvg: string;
      notes?: string;
    }
  ): { success: boolean; deliveryNote?: DeliveryNote; order?: OnlinePlatformOrder; message: string } {
    const order = mockPlatformOrders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found' };

    // Deduct physical inventory and release reservation
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        const inv = mockInventory.find((i) => i.id === item.item_id);
        if (inv) {
          inv.vanguard_stock = Math.max(0, inv.vanguard_stock - item.quantity);
          inv.qty_reserved = Math.max(0, inv.qty_reserved - item.quantity);
          inv.available_stock = Math.max(0, inv.vanguard_stock - inv.qty_reserved);

          mockStockLedger.push({
            id: `ledger-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            item_id: item.item_id,
            transaction_type: 'SALES_DIRECT',
            reference_id: order.id,
            qty_in: 0,
            qty_out: item.quantity,
            notes: `Delivered by SuperSonic POD - Order ${order.order_number}`,
            created_at: new Date().toISOString(),
          });
        }
      }
    }

    const noteId = `pod-${Date.now()}`;
    const deliveryNote: DeliveryNote = {
      id: noteId,
      delivery_note_number: 1000 + mockDeliveryNotes.length + 1,
      invoice_id: order.sales_invoice_id || `INV-${order.order_number}`,
      delivered_at: new Date().toISOString(),
      delivered_by: pod.deliveredByDriverId || order.assigned_driver_name || 'Driver',
      recipient_name: pod.recipientName,
      payment_method: pod.paymentMethod,
      collected_amount_usd: pod.collectedUsd,
      collected_amount_lbp: pod.collectedLbp,
      signature_svg: pod.signatureSvg,
      notes: pod.notes,
      created_at: new Date().toISOString(),
      items: order.items?.map((item) => ({
        id: `dni-${Date.now()}-${Math.random()}`,
        delivery_note_id: noteId,
        item_id: item.item_id,
        quantity_delivered: item.quantity,
      })),
    };

    mockDeliveryNotes.unshift(deliveryNote);

    order.order_status = 'delivered';
    order.updated_at = new Date().toISOString();

    return {
      success: true,
      deliveryNote,
      order,
      message: `Delivery successfully confirmed for order ${order.order_number}. Delivery Note #${deliveryNote.delivery_note_number} generated.`,
    };
  }

  // 8b. Transactional Complete Driver Delivery with POD, Stock deduction, and Vault/Whish routing
  static async completeDriverDelivery(input: CompleteDeliveryInput) {
    return await completeDriverDelivery(input);
  }

  // 9. Reject Order
  static rejectOrder(orderId: string, reason?: string): { success: boolean; message: string } {
    const order = mockPlatformOrders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found' };

    // Release stock reservation if previously approved
    if (order.order_status === 'approved' || order.order_status === 'queued' || order.order_status === 'on_route') {
      if (order.items) {
        for (const item of order.items) {
          const inv = mockInventory.find((i) => i.id === item.item_id);
          if (inv) {
            inv.qty_reserved = Math.max(0, inv.qty_reserved - item.quantity);
            inv.available_stock = Math.max(0, inv.vanguard_stock - inv.qty_reserved);
          }
        }
      }
    }

    order.order_status = 'rejected';
    order.updated_at = new Date().toISOString();

    return {
      success: true,
      message: `Order ${order.order_number} marked as rejected. Reason: ${reason || 'Customer canceled / rejected at door'}`,
    };
  }

  // 10. Inventory Queries
  static getInventoryWithReservations(): VanguardInventoryStock[] {
    return mockInventory.map((i) => ({
      ...i,
      available_stock: Math.max(0, i.vanguard_stock - i.qty_reserved),
    }));
  }

  // 11. Delivery Notes & POD
  static getDeliveryNotes(): DeliveryNote[] {
    return mockDeliveryNotes;
  }

  // 12. Stock Ledger
  static getStockLedger(): StockLedgerEntry[] {
    return mockStockLedger;
  }
}
