// ============================================================
// VANGUARD ERP: SUPERSONIC FLEET & SOCIAL CRM INTEGRATION TYPES
// ============================================================

export type OnlineOrderChannel = 'supersonic' | 'social_media' | 'whatsapp' | 'website';

export type OnlineOrderStatus = 
  | 'pending_rep_approval' 
  | 'approved' 
  | 'escalated_to_management' 
  | 'queued' 
  | 'on_route' 
  | 'delivered' 
  | 'rejected' 
  | 'moved_to_pos_pickup';

export type PaymentCollectionMethod = 'COD' | 'WHISH';

export type DeliveryStatus = 
  | 'delivered' 
  | 'pending_delivery' 
  | 'partially_delivered' 
  | 'on_route';

export interface OnlinePlatformOrderItem {
  id: string;
  order_id: string;
  item_id: string;
  item_name?: string;
  quantity: number;
  unit_price_usd: number;
  total_price_usd: number;
  notes?: string;
  is_missing?: boolean;
}

export interface OnlinePlatformOrder {
  id: string;
  order_number: string;
  channel: OnlineOrderChannel;
  external_chat_id?: string;
  customer_name: string;
  customer_phone: string;
  destination_town: string;
  delivery_address: string;
  corridor_id: number; // 1 to 7 according to highway corridors
  payment_method: PaymentCollectionMethod;
  product_amount_usd: number;
  product_amount_lbp: number;
  delivery_fee_usd: number;
  rep_name?: string;
  rep_code?: string;
  sla_minutes_left: number;
  order_status: OnlineOrderStatus;
  sales_invoice_id?: string;
  assigned_driver_name?: string;
  assigned_vehicle_plate?: string;
  created_at: string;
  updated_at: string;
  items?: OnlinePlatformOrderItem[];
}

export interface DeliveryNoteItem {
  id: string;
  delivery_note_id: string;
  item_id: string;
  quantity_delivered: number;
}

export interface DeliveryNote {
  id: string;
  delivery_note_number?: number;
  invoice_id: string;
  delivered_at: string;
  delivered_by?: string;
  recipient_name: string;
  payment_method: PaymentCollectionMethod;
  collected_amount_usd: number;
  collected_amount_lbp: number;
  signature_svg?: string;
  notes?: string;
  created_at: string;
  items?: DeliveryNoteItem[];
}

export interface SalesInvoiceDeliveryFields {
  id: string;
  invoice_ref: string;
  delivery_date?: string;
  delivery_status: DeliveryStatus;
  assigned_driver_id?: string;
  delivery_corridor_id?: number;
  delivery_tracking_no?: string;
  proof_signature_svg?: string;
  reference_credit_note_id?: string;
  is_posted?: boolean;
}

export interface VanguardInventoryStock {
  id: string;
  item_name: string;
  capacity_kg: number;
  packaging_type: string;
  vanguard_stock: number;
  qty_reserved: number;
  available_stock: number; // vanguard_stock - qty_reserved
  min_threshold: number;
  cost_price?: number;
  unit_price_usd?: number;
  plu_code?: string;
  is_scale_item?: boolean;
  scale_shelf_life_days?: number;
  scale_tare_weight_kg?: number;
  scale_item_description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface StockLedgerEntry {
  id: string;
  item_id: string;
  transaction_type: 'SALES_DIRECT' | 'SALES_RESERVATION' | 'SALES_DELIVERY_RELEASE' | 'PRODUCTION_IN';
  reference_id?: string;
  qty_in: number;
  qty_out: number;
  notes?: string;
  created_at: string;
}
