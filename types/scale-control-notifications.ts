// ============================================================
// VANGUARD ERP: UNIVERSAL SCALE INTEGRATION, CONTROL & NOTIFICATIONS TYPES
// Organization: Southern Olive Oil Products S.A.R.L
// ============================================================

export type ElectronicScaleProtocol =
  | 'UNIVERSAL_PLU'
  | 'ALFA'
  | 'BIZERBA'
  | 'DIBAL'
  | 'DIGI'
  | 'CAS'
  | 'TOLEDO';

export interface ElectronicScaleDevice {
  id: string;
  scale_name: string;
  scale_model: ElectronicScaleProtocol;
  ip_address?: string;
  port_number: number;
  weight_barcode_prefix: string; // e.g. '20', '21', '22'
  branch_id?: string;
  is_active: boolean;
  last_synced_at?: string | null;
}

export interface ScaleItemAttributes {
  plu_code?: string;
  is_scale_item: boolean;
  scale_shelf_life_days: number;
  scale_tare_weight_kg: number;
  scale_item_description?: string;
}

export interface ReservationShift {
  id: string;
  shift_name: string; // Lunch, Dinner, etc.
  start_time: string; // e.g. '12:00:00'
  end_time: string;   // e.g. '17:00:00'
  is_active: boolean;
}

export interface ReservationSettings {
  id: string;
  table_stay_period_minutes: number;
  active_shift_id?: string | null;
  updated_at?: string;
}

export interface SMSNotificationSettings {
  id: string;
  sender_id: string;
  country_code: string;
  auto_send_on_invoice_close: boolean;
  send_feedback_link: boolean;
  feedback_url_base?: string;
  created_at?: string;
}

export interface UnderCostSalesReportRow {
  item_name: string;
  selling_price: number;
  capacity_kg: number | null;
  unit_cost: number;
  loss_margin: number;
  sale_date: string;
  invoice_id?: string;
  invoice_ref?: string;
}

export interface WeightedBarcodeParsed {
  raw_barcode: string;
  prefix: string;
  plu_code: string;
  raw_weight_kg: number;
  tare_weight_kg: number;
  net_weight_kg: number;
  unit_price_usd: number;
  total_price_usd: number;
  checksum: string;
  item_id?: string;
  item_name?: string;
  is_scale_item: boolean;
  is_valid: boolean;
  error?: string;
}

export interface ScaleSyncExportResult {
  device_id: string;
  scale_name: string;
  protocol: ElectronicScaleProtocol;
  item_count: number;
  payload_preview: string;
  synced_at: string;
  status: 'SUCCESS' | 'FAILED';
}
