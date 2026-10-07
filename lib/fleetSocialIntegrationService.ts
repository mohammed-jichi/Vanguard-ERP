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
let mockInventory: VanguardInventoryStock[] = [];
let mockPlatformOrders: OnlinePlatformOrder[] = [];
let mockDeliveryNotes: DeliveryNote[] = [];
let mockStockLedger: StockLedgerEntry[] = [];

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
