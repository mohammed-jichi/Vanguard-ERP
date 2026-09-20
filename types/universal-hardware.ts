// ============================================================
// VANGUARD ERP: UNIVERSAL HARDWARE INTEGRATION ENGINE TYPES
// Organization: Southern Olive Oil Products S.A.R.L
// ============================================================

export type HardwareDeviceCategory =
  | 'THERMAL_RECEIPT'
  | 'BARCODE_LABEL_PRINTER'
  | 'A4_OFFICE_PRINTER'
  | 'ELECTRONIC_SCALE'
  | 'CUSTOMER_POLE_DISPLAY'
  | 'BARCODE_SCANNER'
  | 'CASH_DRAWER'
  | 'PAYMENT_TERMINAL_POS';

export type HardwareInterfaceType =
  | 'NETWORK_TCP'
  | 'SERIAL_COM'
  | 'USB_RAW'
  | 'SYSTEM_SPOOLER'
  | 'BLUETOOTH'
  | 'KEYBOARD_WEDGE';

export type HardwareCommandProtocol =
  | 'STANDARD'
  | 'ESC_POS'
  | 'TSPL'
  | 'ZPL'
  | 'CAS_TOLEDO_CONTINUOUS'
  | 'SMA'
  | 'NCI'
  | 'CPCL'
  | 'OPOS';

export interface DeviceConfigJson {
  paper_width_mm?: number;
  characters_per_line?: number;
  auto_cutter?: boolean;
  cash_drawer_pulse?: boolean;
  cash_drawer_pin?: 2 | 5;
  weight_barcode_prefix?: string;
  scale_unit?: 'KG' | 'LB' | 'G';
  label_width_mm?: number;
  label_height_mm?: number;
  dpi?: 203 | 300 | 600;
  darkness?: number;
  pole_display_mode?: 'EPSON_ESC_POS' | 'DSP800' | 'CD5220';
  scale_polling_interval_ms?: number;
  custom_header?: string;
  custom_footer?: string;
  [key: string]: any;
}

export interface SystemHardwareProfile {
  id: string;
  device_name: string;
  device_category: HardwareDeviceCategory;
  interface_type: HardwareInterfaceType;
  ip_address?: string | null;
  port_number?: number | null;
  serial_port?: string | null;
  serial_baud_rate?: number | null;
  serial_data_bits?: number | null;
  serial_parity?: string | null;
  serial_stop_bits?: number | null;
  system_printer_name?: string | null;
  command_protocol: string; // e.g. ESC_POS, TSPL, ZPL, CAS_TOLEDO_CONTINUOUS, STANDARD
  device_config: DeviceConfigJson;
  branch_id?: string | null;
  is_active: boolean;
  created_at?: string;
}

export interface ReceiptItemInput {
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  tax_flag?: string;
}

export interface EscPosReceiptInput {
  company_name?: string;
  branch_name?: string;
  invoice_ref: string;
  cashier_name?: string;
  customer_name?: string;
  date_time?: string;
  items: ReceiptItemInput[];
  subtotal: number;
  tax_amount: number;
  discount_amount?: number;
  total_amount_usd: number;
  total_amount_lbp?: number;
  exchange_rate?: number;
  payment_method: string;
  barcode_data?: string;
  footer_message?: string;
  kick_cash_drawer?: boolean;
  cut_paper?: boolean;
}

export interface BarcodeLabelInput {
  item_name: string;
  item_code: string;
  barcode_data: string;
  price_usd: number;
  price_lbp?: number;
  capacity?: string;
  production_date?: string;
  expiry_date?: string;
  origin?: string;
  qr_url?: string;
}

export interface HardwareJobDispatchResult {
  device_id: string;
  device_name: string;
  device_category: HardwareDeviceCategory;
  interface_type: HardwareInterfaceType;
  command_protocol: string;
  target_destination: string; // e.g. "192.168.1.200:9100" or "COM3 @ 9600-8-N-1"
  raw_bytes_length: number;
  preview_hex: string;
  command_stream_text: string;
  status: 'DISPATCHED' | 'FAILED';
  dispatched_at: string;
  message?: string;
}

export interface DeviceTestConnectionResult {
  device_id: string;
  device_name: string;
  device_category: HardwareDeviceCategory;
  interface_type: HardwareInterfaceType;
  destination: string;
  status: 'CONNECTED' | 'OFFLINE' | 'PORT_ERROR';
  latency_ms: number;
  checked_at: string;
  details: string;
}
