/**
 * ============================================================================
 * VANGUARD ERP - MASTER TYPESCRIPT TYPE CONTRACTS
 * Organization: Southern Olive Oil Products S.A.R.L
 * ============================================================================
 */

// ============================================================================
// 1. SETUP & CORE INFRASTRUCTURE
// ============================================================================

export interface Branch {
  id: string;
  tenant_id: string;
  code: string;
  name: string; // e.g. 'فرع الشويفات الرئيسي', 'فرع بيروت'
  location?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

export interface CostCenter {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  created_at: string;
}

// ============================================================================
// 2. PRODUCT HIERARCHY & INVENTORY SILOS
// ============================================================================

export interface ProductDivision {
  id: string;
  tenant_id: string;
  code: string;
  name_ar: string;
  name_en?: string;
  created_at: string;
}

export interface ProductGroup {
  id: string;
  tenant_id: string;
  division_id: string;
  code: string;
  name_ar: string;
  name_en?: string;
  created_at: string;
}

export interface StorageTank {
  id: string;
  tenant_id: string;
  tank_code: string;
  tank_type: 'OLIVE_OIL_EXTRA_VIRGIN' | 'POMACE_OIL' | 'MOLASSES' | 'BLEACH_JAVEL';
  capacity_liters: number;
  current_volume_liters: number;
  created_at: string;
}

// ============================================================================
// 3. MODULE 1: SALES CONTROL & POS TERMINALS
// ============================================================================

export interface POSTerminal {
  id: string;
  tenant_id: string;
  branch_id: string;
  terminal_code: string;
  terminal_name: string;
  ip_address?: string;
  is_active: boolean;
  created_at: string;
}

export interface POSShiftEOD {
  id: string;
  tenant_id: string;
  branch_id: string;
  terminal_id?: string;
  cashier_id: string;
  shift_number: number;
  opened_at: string;
  closed_at?: string;
  opening_cash_usd: number;
  opening_cash_lbp: number;
  closing_cash_actual_usd: number;
  closing_cash_actual_lbp: number;
  closing_cash_expected_usd: number;
  closing_cash_expected_lbp: number;
  total_sales_usd: number;
  total_sales_lbp: number;
  total_returns_usd: number;
  total_returns_lbp: number;
  status: 'OPEN' | 'CLOSED' | 'AUDITED';
  z_report_seq?: string;
  created_at: string;
}

// ============================================================================
// 4. MODULE 5: CUSTOMERS & AR (ACCOUNTS RECEIVABLE)
// ============================================================================

export interface Customer {
  id: string;
  tenant_id: string;
  full_name: string;
  phone?: string;
  email?: string;
  address?: string;
  customer_type: 'retail' | 'wholesale' | 'farmer';
  credit_limit: number;
  current_balance: number;
  currency: 'USD' | 'LBP';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerARInvoice {
  id: string;
  tenant_id: string;
  customer_id: string;
  invoice_number: string;
  invoice_date: string;
  due_date?: string;
  total_amount: number;
  paid_amount: number;
  outstanding_balance: number;
  currency: 'USD' | 'LBP';
  status: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE';
  created_at: string;
}

export interface CustomerPaymentReceipt {
  id: string;
  tenant_id: string;
  receipt_number: string;
  customer_id: string;
  invoice_id?: string;
  payment_method: 'CASH' | 'CASH_USD' | 'CASH_LBP' | 'WHISH' | 'BLOM_TRANSFER' | 'CHECK';
  amount_paid: number;
  payment_date: string;
  collected_by?: string;
  notes?: string;
  created_at: string;
}

// ============================================================================
// 5. MODULE 4: OPERATIONS & OLIVE PRESSING
// ============================================================================

export interface OlivePressingLog {
  id: string;
  tenant_id: string;
  receipt_code: string;
  customer_id?: string;
  cultivar: 'Baladi' | 'Sourani' | 'Nabali' | string;
  gross_weight_kg: number;
  tare_weight_kg: number;
  net_weight_kg: number;
  oil_extracted_liters: number;
  oil_yield_ratio: number;
  acidity_level: number;
  pomace_retained_kg: number;
  destination_tank_id?: string;
  fee_type: 'CASH' | 'PERCENTAGE_IN_OIL';
  fee_amount: number;
  operator_id?: string;
  pressing_date: string;
  created_at: string;
}

export interface FormulationRecipe {
  id: string;
  tenant_id: string;
  product_code: string;
  product_name: string;
  category_type: 'FOOD_PRESERVES' | 'INDUSTRIAL_DETERGENT';
  standard_batch_size_liters: number;
  viscosity_target_cps?: number;
  brix_sugar_target?: number;
  target_ph?: number;
  thermal_processing_minutes?: number;
  ingredients_formula: Record<string, unknown>;
  created_at: string;
}

export interface BulkProductionRun {
  id: string;
  tenant_id: string;
  batch_lot_number: string;
  recipe_id: string;
  actual_batch_liters: number;
  measured_viscosity?: number;
  measured_ph?: number;
  measured_brix?: number;
  qc_verdict: 'PENDING_APPROVAL' | 'PASSED' | 'ADJUSTMENT_REQUIRED' | 'REJECTED';
  produced_by?: string;
  approved_by?: string;
  run_date: string;
  created_at: string;
}

// ============================================================================
// 6. MODULE 2: SUPERSONIC FLEET & LOGISTICS
// ============================================================================

export interface FleetVehicle {
  id: string;
  tenant_id: string;
  plate_number: string;
  model?: string;
  capacity_kg?: number;
  assigned_driver_id?: string;
  status: 'AVAILABLE' | 'ON_ROUTE' | 'MAINTENANCE';
  created_at: string;
}

export interface DeliveryRun {
  id: string;
  tenant_id: string;
  run_code: string;
  driver_id?: string;
  vehicle_id?: string;
  dispatch_time: string;
  completion_time?: string;
  status: 'DISPATCHED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  created_at: string;
}

export interface CODSettlement {
  id: string;
  tenant_id: string;
  delivery_run_id?: string;
  driver_id?: string;
  total_collected_usd: number;
  total_collected_lbp: number;
  settlement_status: 'PENDING' | 'DEPOSITED_TO_VAULT' | 'DISCREPANCY';
  verified_by?: string;
  verified_at?: string;
  created_at: string;
}

// ============================================================================
// 7. SUPERSONIC MARKETING & MESSAGING QUEUE (100k+)
// ============================================================================

export interface SuperSonicAudience {
  id: string;
  tenant_id: string;
  customer_id?: string;
  full_name?: string;
  phone: string;
  country_code: string;
  city?: string;
  segment: 'OLIVE_OIL_BUYERS' | 'FARMERS_PRESSING' | 'WHOLESALE_RETAILERS' | 'GENERAL';
  tags: string[];
  is_subscribed: boolean;
  last_messaged_at?: string;
  total_messages_received: number;
  created_at: string;
}

export interface SuperSonicSenderPool {
  id: string;
  tenant_id: string;
  sender_name: string;
  phone_number: string;
  provider_type: 'WHATSAPP_API' | 'WHATSAPP_WEB_GATEWAY' | 'SMS_TWILIO';
  daily_quota: number;
  messages_sent_today: number;
  status: 'ACTIVE' | 'RESTING' | 'COOLDOWN' | 'BANNED';
  last_dispatch_at?: string;
  created_at: string;
}

export interface SuperSonicQueueItem {
  id: string;
  tenant_id: string;
  campaign_id: string;
  audience_id?: string;
  sender_id?: string;
  recipient_phone: string;
  compiled_message: string;
  media_url?: string;
  priority: number;
  status: 'PENDING' | 'PROCESSING' | 'DELIVERED' | 'FAILED';
  retry_count: number;
  error_message?: string;
  scheduled_for: string;
  dispatched_at?: string;
  delivered_at?: string;
}

// ============================================================================
// 8. SOCIAL MEDIA MANAGEMENT (CRM UNIFIED INBOX)
// ============================================================================

export interface SocialChannel {
  id: string;
  tenant_id: string;
  platform: 'WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK_MESSENGER' | 'TIKTOK';
  channel_name: string;
  account_id: string;
  is_active: boolean;
  connected_at: string;
}

export interface SocialConversation {
  id: string;
  tenant_id: string;
  channel_id: string;
  external_sender_id: string;
  customer_name?: string;
  customer_id?: string;
  assigned_rep_id?: string;
  status: 'OPEN' | 'PENDING_CUSTOMER' | 'RESOLVED' | 'SPAM';
  lead_stage: 'INQUIRY' | 'QUOTATION_SENT' | 'ORDER_CREATED' | 'CLOSED_LOST';
  unread_count: number;
  last_message_preview?: string;
  last_message_at: string;
  created_at: string;
}

export interface SocialMessage {
  id: string;
  conversation_id: string;
  sender_type: 'CUSTOMER' | 'REPRESENTATIVE' | 'BOT';
  sender_user_id?: string;
  message_type: 'TEXT' | 'IMAGE' | 'AUDIO_NOTE' | 'DOCUMENT' | 'PRODUCT_CARD';
  content: string;
  media_url?: string;
  delivery_status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  created_at: string;
}

// ============================================================================
// 9. ACCOUNTING & HR MANAGEMENT
// ============================================================================

export interface ChartOfAccount {
  id: string;
  tenant_id: string;
  account_code: string;
  account_name_ar: string;
  account_name_en?: string;
  account_type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  parent_account_id?: string;
  is_reconciled: boolean;
  created_at: string;
}

export interface Employee {
  id: string;
  tenant_id: string;
  department_id?: string;
  employee_code: string;
  full_name: string;
  phone?: string;
  base_salary_usd: number;
  base_salary_lbp: number;
  bank_name: string;
  bank_account_number?: string;
  iban?: string;
  is_active: boolean;
  created_at: string;
}

export interface PayrollRun {
  id: string;
  tenant_id: string;
  payroll_month: number;
  payroll_year: number;
  total_net_usd: number;
  total_net_lbp: number;
  is_disbursed: boolean;
  blom_export_file_ref?: string;
  processed_by?: string;
  processed_at: string;
  created_at: string;
}
