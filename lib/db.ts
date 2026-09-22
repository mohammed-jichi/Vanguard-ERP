// ============================================================
// VANGUARD ERP: DATABASE TRANSACTION CLIENT (lib/db.ts)
// Supports Prisma-compatible transactions & Supabase / State bridge
// ============================================================

import {
  OnlinePlatformOrder,
  OnlinePlatformOrderItem,
  VanguardInventoryStock,
} from '@/types/fleet-social-integration';
import {
  SystemTaxConfiguration,
  CompanyDepartment,
  ChartOfAccountRecord,
  JournalVoucherRecord,
  JournalEntryLineRecord,
  GLPrepaidAllocationRecord,
} from '@/types/advanced-accounting';
import {
  RecurringTransactionTemplate,
  RecurringTransactionTemplateItem,
  PurchaseOrderItemRecord,
  InternalTransferItemRecord,
} from '@/types/material-requests';
import {
  ElectronicScaleDevice,
  ElectronicScaleProtocol,
  ReservationShift,
  ReservationSettings,
  SMSNotificationSettings,
  UnderCostSalesReportRow,
} from '@/types/scale-control-notifications';
import {
  SystemHardwareProfile,
  HardwareDeviceCategory,
  HardwareInterfaceType,
} from '@/types/universal-hardware';
import { supabase } from '@/lib/supabaseClient';

export interface SalesInvoiceRecord {
  id: string;
  invoice_ref: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  delivery_date: Date;
  delivery_status: string;
  delivery_corridor_id: number;
  is_posted: boolean;
  proof_signature_svg?: string;
  created_at: Date;
}

export interface SalesInvoiceItemRecord {
  id: string;
  invoice_id: string;
  item_id: string;
  quantity: number;
  unit_price: number;
  unit_price_usd?: number;
}

export interface DeliveryNoteRecord {
  id: string;
  delivery_note_number: number;
  invoice_id: string;
  delivered_by: string;
  recipient_name: string;
  payment_method: 'COD' | 'WHISH';
  collected_amount_usd: number;
  collected_amount_lbp: number;
  signature_svg: string;
  notes?: string;
  created_at: Date;
}

export interface DeliveryNoteItemRecord {
  id: string;
  delivery_note_id: string;
  item_id: string;
  quantity_delivered: number;
}

export interface StockLedgerRecord {
  id: string;
  item_id: string;
  transaction_type: string;
  reference_id: string;
  qty_out: number;
  created_at: Date;
}

export interface FleetLedgerEntryRecord {
  id: string;
  reference_order_id: string;
  account: string;
  amount_usd: number;
  amount_lbp: number;
  entry_type: 'VAULT_COD' | 'WHISH_DEPOSIT';
  notes: string;
  created_at: Date;
}

// In-Memory Database Storage (Shared across operations)
class VanguardDatabaseContext {
  private static instance: VanguardDatabaseContext;

  public orders: OnlinePlatformOrder[] = [
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
  ];

  public inventory: VanguardInventoryStock[] = [
    {
      id: 'inv-item-01',
      item_name: 'زيت زيتون بكر ممتاز بلدي 17.5 لتر (Extra Virgin 17.5L Tin)',
      capacity_kg: 15.2,
      packaging_type: 'تطفيح صاج',
      vanguard_stock: 450,
      qty_reserved: 35,
      available_stock: 415,
      min_threshold: 50,
      cost_price: 85.0,
      unit_price_usd: 100.0,
      plu_code: '00101',
      is_scale_item: true,
      scale_shelf_life_days: 365,
      scale_tare_weight_kg: 0.050,
      scale_item_description: 'Extra Virgin Olive Oil Bulk Tin',
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
      cost_price: 6.5,
      unit_price_usd: 8.5,
      plu_code: '00102',
      is_scale_item: false,
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
      cost_price: 3.5,
      unit_price_usd: 5.0,
      plu_code: '00103',
      is_scale_item: false,
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
      cost_price: 15.0,
      unit_price_usd: 20.0,
      plu_code: '00104',
      is_scale_item: false,
    },
    {
      id: 'inv-scale-01',
      item_name: 'زيتون أخضر بلدي مكبوس بالوزن (Pressed Green Olives)',
      capacity_kg: 1.0,
      packaging_type: 'بالوزن / بالكيلوغرام',
      vanguard_stock: 600,
      qty_reserved: 0,
      available_stock: 600,
      min_threshold: 50,
      cost_price: 3.50,
      unit_price_usd: 5.00,
      plu_code: '00201',
      is_scale_item: true,
      scale_shelf_life_days: 180,
      scale_tare_weight_kg: 0.020,
      scale_item_description: 'Fresh Pickled Green Olives Weighted',
    },
    {
      id: 'inv-scale-02',
      item_name: 'زيتون كالاماتا أسود بلدي (Black Kalamata Olives)',
      capacity_kg: 1.0,
      packaging_type: 'بالوزن / بالكيلوغرام',
      vanguard_stock: 450,
      qty_reserved: 0,
      available_stock: 450,
      min_threshold: 40,
      cost_price: 4.80,
      unit_price_usd: 7.00,
      plu_code: '00202',
      is_scale_item: true,
      scale_shelf_life_days: 180,
      scale_tare_weight_kg: 0.020,
      scale_item_description: 'Kalamata Jumbo Olives Weighted',
    },
    {
      id: 'inv-under-01',
      item_name: 'صابون زيت زيتون بلدي بالوزن (Artisan Olive Soap Clearance)',
      capacity_kg: 0.25,
      packaging_type: 'بالوزن / مفرود',
      vanguard_stock: 200,
      qty_reserved: 0,
      available_stock: 200,
      min_threshold: 20,
      cost_price: 4.50,
      unit_price_usd: 3.00,
      plu_code: '00301',
      is_scale_item: true,
      scale_shelf_life_days: 720,
      scale_tare_weight_kg: 0.010,
      scale_item_description: 'Clearance Artisan Olive Bar',
    },
  ];

  public salesInvoices: SalesInvoiceRecord[] = [
    {
      id: 'inv-sample-audit-01',
      invoice_ref: 'INV-2026-09881',
      customer_name: 'سوبرماركت الباشا (Al-Basha Supermarket)',
      customer_phone: '+96171882233',
      total_amount: 15.0,
      delivery_date: new Date(Date.now() - 2 * 3600 * 1000),
      delivery_status: 'delivered',
      delivery_corridor_id: 1,
      is_posted: true,
      created_at: new Date(Date.now() - 2 * 3600 * 1000),
    },
    {
      id: 'inv-sample-audit-02',
      invoice_ref: 'INV-2026-09882',
      customer_name: 'مؤسسة النور الغذائية (Al-Nour Foods)',
      customer_phone: '+96170112233',
      total_amount: 120.0,
      delivery_date: new Date(Date.now() - 5 * 3600 * 1000),
      delivery_status: 'delivered',
      delivery_corridor_id: 2,
      is_posted: true,
      created_at: new Date(Date.now() - 5 * 3600 * 1000),
    },
  ];

  public salesInvoiceItems: SalesInvoiceItemRecord[] = [
    {
      id: 'line-audit-01',
      invoice_id: 'inv-sample-audit-01',
      item_id: 'inv-under-01',
      quantity: 5,
      unit_price: 3.0,
      unit_price_usd: 3.0,
    },
    {
      id: 'line-audit-02',
      invoice_id: 'inv-sample-audit-02',
      item_id: 'inv-item-01',
      quantity: 1,
      unit_price: 100.0,
      unit_price_usd: 100.0,
    },
  ];

  public deliveryNotes: DeliveryNoteRecord[] = [];
  public deliveryNoteItems: DeliveryNoteItemRecord[] = [];
  public stockLedger: StockLedgerRecord[] = [];
  public fleetLedgerEntries: FleetLedgerEntryRecord[] = [];

  public systemTaxConfigurations: SystemTaxConfiguration[] = [
    {
      id: 'tax-cfg-01',
      tax_code: 'VAT_11',
      tax_name: 'Lebanese MOF Standard VAT (11%)',
      tax_rate: 11.0,
      is_active: true,
      enable_rounding_up: false,
      tax1_account_id: 'coa-tax-01',
      tax2_account_id: 'coa-tax-02',
      tax3_account_id: 'coa-tax-03',
    },
  ];

  public companyDepartments: CompanyDepartment[] = [
    { id: 'dept-01', code: 'PROD', name: 'Press Facilities & Olive Oil Production', cost_center_code: 'CC-PROD-01', is_active: true },
    { id: 'dept-02', code: 'FLEET', name: 'SuperSonic Fleet & Logistics', cost_center_code: 'CC-LOG-03', is_active: true },
    { id: 'dept-03', code: 'ADMIN', name: 'Administrative & Financial Headquarters', cost_center_code: 'CC-ADM-01', is_active: true },
    { id: 'dept-04', code: 'SALES', name: 'Commercial Sales & Social CRM', cost_center_code: 'CC-SLS-02', is_active: true },
  ];

  public chartOfAccounts: ChartOfAccountRecord[] = [
    { id: 'coa-1110-01', code: '1110-01', name: 'Cash Vault Physical Drawer', type: 'Current Asset', currency: 'USD / LBP', normal_balance: 'Debit', balance: 42000, status: 'ACTIVE' },
    { id: 'coa-1110-02', code: '1110-02', name: 'BLOM Bank Corporate Commercial Checking', type: 'Current Asset', currency: 'USD', normal_balance: 'Debit', balance: 142200, status: 'ACTIVE' },
    { id: 'coa-1120-00', code: '1120-00', name: 'Trade Accounts Receivable', type: 'Current Asset', currency: 'USD', normal_balance: 'Debit', balance: 24510, status: 'ACTIVE' },
    { id: 'coa-1150-00', code: '1150-00', name: 'Prepaid Operational Expenses & Rent', type: 'Current Asset', currency: 'USD', normal_balance: 'Debit', balance: 60000, status: 'ACTIVE' },
    { id: 'coa-2110-00', code: '2110-00', name: 'Trade Accounts Payable', type: 'Current Liability', currency: 'USD', normal_balance: 'Credit', balance: 64200, status: 'ACTIVE' },
    { id: 'coa-tax-01', code: '2150-01', name: 'MOF VAT Output Tax Payable (11%)', type: 'Current Liability', currency: 'USD', normal_balance: 'Credit', balance: 12500, status: 'ACTIVE' },
    { id: 'coa-tax-02', code: '2150-02', name: 'Municipal Surcharge Tax Account', type: 'Current Liability', currency: 'USD', normal_balance: 'Credit', balance: 1500, status: 'ACTIVE' },
    { id: 'coa-tax-03', code: '2150-03', name: 'Fiscal Stamp Duty Account', type: 'Current Liability', currency: 'USD', normal_balance: 'Credit', balance: 500, status: 'ACTIVE' },
    { id: 'coa-6110-00', code: '6110-00', name: 'Administrative Rent & Facility Expense', type: 'Operating Expense', currency: 'USD', normal_balance: 'Debit', balance: 36000, status: 'ACTIVE' },
  ];

  public journalVouchers: JournalVoucherRecord[] = [];
  public journalEntryLines: JournalEntryLineRecord[] = [];
  public glPrepaidAllocations: GLPrepaidAllocationRecord[] = [];

  public purchaseOrderItems: PurchaseOrderItemRecord[] = [];
  public internalTransferItems: InternalTransferItemRecord[] = [];
  public recurringTransactionTemplates: RecurringTransactionTemplate[] = [
    {
      id: 'rec-tmpl-01',
      template_name: 'Weekly Packaging Depot Restock',
      transaction_type: 'MATERIAL_REQUEST',
      source_branch_id: 'br-beirut-01',
      destination_branch_id: 'br-choueifat-plant',
      notes: 'Standard weekly requisition for glass bottles, tin drums, and cartons',
      created_by: 'emp-mgr-01',
      created_at: new Date().toISOString(),
    },
    {
      id: 'rec-tmpl-02',
      template_name: 'Direct Farmer Intake Purchase Order',
      transaction_type: 'PURCHASE_ORDER',
      source_branch_id: 'br-south-01',
      destination_branch_id: 'br-choueifat-plant',
      notes: 'Direct crop harvest procurement contract template',
      created_by: 'emp-mgr-01',
      created_at: new Date().toISOString(),
    },
  ];
  public recurringTransactionTemplateItems: RecurringTransactionTemplateItem[] = [
    {
      id: 'rtti-01',
      template_id: 'rec-tmpl-01',
      item_id: 'inv-item-01',
      item_name: 'زيت زيتون بكر ممتاز بلدي 17.5 لتر (Extra Virgin 17.5L Tin)',
      default_quantity: 10,
    },
    {
      id: 'rtti-02',
      template_id: 'rec-tmpl-01',
      item_id: 'inv-item-03',
      item_name: 'دبس رمان بلدي نقي 500 مل (Pomegranate Molasses 500ml)',
      default_quantity: 25,
    },
    {
      id: 'rtti-03',
      template_id: 'rec-tmpl-02',
      item_id: 'inv-item-01',
      item_name: 'زيت زيتون بكر ممتاز بلدي 17.5 لتر (Extra Virgin 17.5L Tin)',
      default_quantity: 50,
    },
  ];

  public electronicScaleDevices: ElectronicScaleDevice[] = [
    {
      id: 'scale-01',
      scale_name: 'Choueifat Deli Counter Scale - Alfa',
      scale_model: 'ALFA',
      ip_address: '192.168.1.150',
      port_number: 4001,
      weight_barcode_prefix: '20',
      branch_id: 'br-choueifat',
      is_active: true,
      last_synced_at: '2026-09-18T08:30:00Z',
    },
    {
      id: 'scale-02',
      scale_name: 'Beirut Distribution Gourmet Scale - Bizerba',
      scale_model: 'BIZERBA',
      ip_address: '192.168.2.160',
      port_number: 4001,
      weight_barcode_prefix: '21',
      branch_id: 'br-beirut',
      is_active: true,
      last_synced_at: '2026-09-17T18:00:00Z',
    },
    {
      id: 'scale-03',
      scale_name: 'Saida Packaging Line Scale - Toledo',
      scale_model: 'TOLEDO',
      ip_address: '192.168.3.170',
      port_number: 4001,
      weight_barcode_prefix: '22',
      branch_id: 'br-saida',
      is_active: true,
      last_synced_at: '2026-09-18T09:15:00Z',
    },
    {
      id: 'scale-04',
      scale_name: 'Zahle Tasting Room Scale - Dibal',
      scale_model: 'DIBAL',
      ip_address: '192.168.4.180',
      port_number: 4001,
      weight_barcode_prefix: '20',
      branch_id: 'br-zahle',
      is_active: true,
      last_synced_at: null,
    },
    {
      id: 'scale-05',
      scale_name: 'Tripoli Depot POS Scale - Digi',
      scale_model: 'DIGI',
      ip_address: '192.168.5.190',
      port_number: 4001,
      weight_barcode_prefix: '20',
      branch_id: 'br-tripoli',
      is_active: true,
      last_synced_at: '2026-09-16T12:00:00Z',
    },
    {
      id: 'scale-06',
      scale_name: 'Universal Cashier Checkstand - CAS',
      scale_model: 'CAS',
      ip_address: '192.168.1.155',
      port_number: 4001,
      weight_barcode_prefix: '20',
      branch_id: 'br-choueifat',
      is_active: true,
      last_synced_at: '2026-09-18T10:00:00Z',
    },
  ];

  public reservationShifts: ReservationShift[] = [
    {
      id: 'shift-lunch-01',
      shift_name: 'Lunch Shift (فترة الغداء)',
      start_time: '12:00:00',
      end_time: '17:00:00',
      is_active: true,
    },
    {
      id: 'shift-dinner-02',
      shift_name: 'Dinner Shift (فترة العشاء)',
      start_time: '18:00:00',
      end_time: '23:30:00',
      is_active: true,
    },
  ];

  public reservationSettings: ReservationSettings[] = [
    {
      id: 'res-cfg-01',
      table_stay_period_minutes: 120,
      active_shift_id: 'shift-lunch-01',
      updated_at: new Date().toISOString(),
    },
  ];

  public smsNotificationSettings: SMSNotificationSettings[] = [
    {
      id: 'sms-cfg-01',
      sender_id: 'SOUTHERN-OLV',
      country_code: '+961',
      auto_send_on_invoice_close: true,
      send_feedback_link: true,
      feedback_url_base: (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_APP_URL)
        ? `${process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')}/feedback/rate`
        : '/feedback/rate',
      created_at: new Date().toISOString(),
    },
  ];

  public systemHardwareProfiles: SystemHardwareProfile[] = [
    {
      id: 'hw-pos-prt-01',
      device_name: 'Choueifat Front POS Receipt Printer',
      device_category: 'THERMAL_RECEIPT',
      interface_type: 'NETWORK_TCP',
      ip_address: '192.168.1.201',
      port_number: 9100,
      command_protocol: 'ESC_POS',
      device_config: {
        paper_width_mm: 80,
        characters_per_line: 48,
        auto_cutter: true,
        cash_drawer_pulse: true,
        cash_drawer_pin: 2,
      },
      branch_id: 'br-choueifat',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'hw-lbl-prt-02',
      device_name: 'Main Plant Pallet Barcode Printer',
      device_category: 'BARCODE_LABEL_PRINTER',
      interface_type: 'NETWORK_TCP',
      ip_address: '192.168.1.202',
      port_number: 9100,
      command_protocol: 'ZPL',
      device_config: {
        label_width_mm: 100,
        label_height_mm: 150,
        dpi: 203,
        darkness: 15,
      },
      branch_id: 'br-choueifat',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'hw-lbl-prt-03',
      device_name: 'Packaging Line Desktop Label Printer',
      device_category: 'BARCODE_LABEL_PRINTER',
      interface_type: 'USB_RAW',
      command_protocol: 'TSPL',
      device_config: {
        label_width_mm: 50,
        label_height_mm: 30,
        dpi: 203,
      },
      branch_id: 'br-choueifat',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'hw-off-prt-04',
      device_name: 'Headquarters A4 Report Printer',
      device_category: 'A4_OFFICE_PRINTER',
      interface_type: 'SYSTEM_SPOOLER',
      system_printer_name: 'HP_LaserJet_Office_M608',
      command_protocol: 'STANDARD',
      device_config: {
        paper_width_mm: 210,
        characters_per_line: 80,
      },
      branch_id: 'br-choueifat',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'hw-scale-05',
      device_name: 'Intake Floor Platform Scale',
      device_category: 'ELECTRONIC_SCALE',
      interface_type: 'SERIAL_COM',
      serial_port: 'COM3',
      serial_baud_rate: 9600,
      serial_data_bits: 8,
      serial_parity: 'NONE',
      serial_stop_bits: 1,
      command_protocol: 'CAS_TOLEDO_CONTINUOUS',
      device_config: {
        scale_unit: 'KG',
        weight_barcode_prefix: '20',
        scale_polling_interval_ms: 200,
      },
      branch_id: 'br-choueifat',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'hw-pole-06',
      device_name: 'Checkout Customer Pole Display',
      device_category: 'CUSTOMER_POLE_DISPLAY',
      interface_type: 'SERIAL_COM',
      serial_port: 'COM1',
      serial_baud_rate: 9600,
      serial_data_bits: 8,
      serial_parity: 'NONE',
      serial_stop_bits: 1,
      command_protocol: 'ESC_POS',
      device_config: {
        characters_per_line: 20,
        pole_display_mode: 'EPSON_ESC_POS',
      },
      branch_id: 'br-choueifat',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'hw-drawer-07',
      device_name: 'POS Station #1 Cash Drawer',
      device_category: 'CASH_DRAWER',
      interface_type: 'USB_RAW',
      command_protocol: 'ESC_POS',
      device_config: {
        cash_drawer_pulse: true,
        cash_drawer_pin: 2,
      },
      branch_id: 'br-choueifat',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'hw-scan-08',
      device_name: 'Omnidirectional 2D Barcode Scanner',
      device_category: 'BARCODE_SCANNER',
      interface_type: 'KEYBOARD_WEDGE',
      command_protocol: 'STANDARD',
      device_config: {
        barcode_symbologies: ['EAN13', 'CODE128', 'QR', 'DATAMATRIX'],
      },
      branch_id: 'br-choueifat',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'hw-pay-09',
      device_name: 'Integrated POS Card Terminal',
      device_category: 'PAYMENT_TERMINAL_POS',
      interface_type: 'NETWORK_TCP',
      ip_address: '192.168.1.205',
      port_number: 8000,
      command_protocol: 'STANDARD',
      device_config: {},
      branch_id: 'br-choueifat',
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ];

  public static getInstance(): VanguardDatabaseContext {
    if (!VanguardDatabaseContext.instance) {
      VanguardDatabaseContext.instance = new VanguardDatabaseContext();
    }
    return VanguardDatabaseContext.instance;
  }
}

export class TransactionClient {
  private ctx = VanguardDatabaseContext.getInstance();

  public online_platform_orders = {
    findUnique: async (args: {
      where: { id: string };
      include?: { items?: boolean };
    }): Promise<(OnlinePlatformOrder & { items: OnlinePlatformOrderItem[] }) | null> => {
      const order = this.ctx.orders.find((o) => o.id === args.where.id);
      if (!order) return null;
      return {
        ...order,
        items: order.items || [],
      };
    },

    update: async (args: {
      where: { id: string };
      data: Partial<Omit<OnlinePlatformOrder, 'updated_at' | 'created_at'>> & {
        updated_at?: string | Date;
        created_at?: string | Date;
      };
    }): Promise<OnlinePlatformOrder> => {
      const idx = this.ctx.orders.findIndex((o) => o.id === args.where.id);
      if (idx === -1) throw new Error(`Order ${args.where.id} not found`);

      const { created_at, updated_at, ...rest } = args.data;
      const final_updated_at =
        updated_at instanceof Date
          ? updated_at.toISOString()
          : updated_at || new Date().toISOString();
      const final_created_at =
        created_at instanceof Date
          ? created_at.toISOString()
          : created_at || this.ctx.orders[idx].created_at;

      this.ctx.orders[idx] = {
        ...this.ctx.orders[idx],
        ...rest,
        created_at: final_created_at,
        updated_at: final_updated_at,
      };
      return this.ctx.orders[idx];
    },

    findMany: async (args?: any): Promise<OnlinePlatformOrder[]> => {
      return [...this.ctx.orders];
    },

    create: async (args: {
      data: Omit<OnlinePlatformOrder, 'id' | 'created_at' | 'updated_at'> & {
        id?: string;
        created_at?: string | Date;
        updated_at?: string | Date;
      };
    }): Promise<OnlinePlatformOrder> => {
      const id = args.data.id || `ord-crm-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const now = new Date().toISOString();
      const newOrder: OnlinePlatformOrder = {
        ...args.data,
        id,
        created_at: args.data.created_at ? (args.data.created_at instanceof Date ? args.data.created_at.toISOString() : args.data.created_at) : now,
        updated_at: args.data.updated_at ? (args.data.updated_at instanceof Date ? args.data.updated_at.toISOString() : args.data.updated_at) : now,
      };
      this.ctx.orders.unshift(newOrder);
      return newOrder;
    },
  };

  public online_platform_order_items = {
    update: async (args: {
      where: { id: string };
      data: Partial<OnlinePlatformOrderItem>;
    }): Promise<OnlinePlatformOrderItem> => {
      for (const order of this.ctx.orders) {
        if (order.items) {
          const item = order.items.find((i) => i.id === args.where.id);
          if (item) {
            Object.assign(item, args.data);
            return item;
          }
        }
      }
      throw new Error(`Order item ${args.where.id} not found`);
    },
  };

  public vanguard_inventory = {
    findUnique: async (args: {
      where: { id?: string; plu_code?: string };
      select?: { vanguard_stock?: boolean; qty_reserved?: boolean; item_name?: boolean };
    }): Promise<VanguardInventoryStock | null> => {
      const inv = this.ctx.inventory.find(
        (i) => (args.where.id && i.id === args.where.id) || (args.where.plu_code && i.plu_code === args.where.plu_code)
      );
      if (!inv) return null;
      return { ...inv };
    },

    findFirst: async (args: {
      where: { id?: string; plu_code?: string; is_scale_item?: boolean };
    }): Promise<VanguardInventoryStock | null> => {
      const inv = this.ctx.inventory.find((i) => {
        if (args.where.id && i.id !== args.where.id) return false;
        if (args.where.plu_code && i.plu_code !== args.where.plu_code) return false;
        if (args.where.is_scale_item !== undefined && i.is_scale_item !== args.where.is_scale_item) return false;
        return true;
      });
      return inv ? { ...inv } : null;
    },

    findMany: async (args?: {
      where?: { is_scale_item?: boolean; plu_code?: string };
    }): Promise<VanguardInventoryStock[]> => {
      let list = [...this.ctx.inventory];
      if (args?.where?.is_scale_item !== undefined) {
        list = list.filter((i) => i.is_scale_item === args.where!.is_scale_item);
      }
      if (args?.where?.plu_code) {
        list = list.filter((i) => i.plu_code === args.where!.plu_code);
      }
      return list;
    },

    update: async (args: {
      where: { id: string };
      data: Omit<Partial<VanguardInventoryStock>, 'qty_reserved' | 'vanguard_stock'> & {
        qty_reserved?: { increment?: number; decrement?: number } | number;
        vanguard_stock?: { increment?: number; decrement?: number } | number;
      };
    }): Promise<VanguardInventoryStock> => {
      const inv = this.ctx.inventory.find((i) => i.id === args.where.id);
      if (!inv) throw new Error(`Inventory item ${args.where.id} not found`);

      if (typeof args.data.qty_reserved === 'object' && args.data.qty_reserved !== null) {
        if ('increment' in args.data.qty_reserved && typeof args.data.qty_reserved.increment === 'number') {
          inv.qty_reserved += args.data.qty_reserved.increment;
        } else if ('decrement' in args.data.qty_reserved && typeof args.data.qty_reserved.decrement === 'number') {
          inv.qty_reserved = Math.max(0, inv.qty_reserved - args.data.qty_reserved.decrement);
        }
      } else if (typeof args.data.qty_reserved === 'number') {
        inv.qty_reserved = args.data.qty_reserved;
      }

      if (typeof args.data.vanguard_stock === 'object' && args.data.vanguard_stock !== null) {
        if ('decrement' in args.data.vanguard_stock && typeof args.data.vanguard_stock.decrement === 'number') {
          inv.vanguard_stock = Math.max(0, inv.vanguard_stock - args.data.vanguard_stock.decrement);
        } else if ('increment' in args.data.vanguard_stock && typeof args.data.vanguard_stock.increment === 'number') {
          inv.vanguard_stock += args.data.vanguard_stock.increment;
        }
      } else if (typeof args.data.vanguard_stock === 'number') {
        inv.vanguard_stock = args.data.vanguard_stock;
      }

      Object.assign(inv, {
        plu_code: args.data.plu_code ?? inv.plu_code,
        is_scale_item: args.data.is_scale_item ?? inv.is_scale_item,
        scale_shelf_life_days: args.data.scale_shelf_life_days ?? inv.scale_shelf_life_days,
        scale_tare_weight_kg: args.data.scale_tare_weight_kg ?? inv.scale_tare_weight_kg,
        scale_item_description: args.data.scale_item_description ?? inv.scale_item_description,
        cost_price: args.data.cost_price ?? inv.cost_price,
        unit_price_usd: args.data.unit_price_usd ?? inv.unit_price_usd,
      });

      inv.available_stock = Math.max(0, inv.vanguard_stock - inv.qty_reserved);
      return { ...inv };
    },
  };

  public sales_invoices = {
    findUnique: async (args: { where: { id: string } }): Promise<SalesInvoiceRecord | null> => {
      const inv = this.ctx.salesInvoices.find((i) => i.id === args.where.id);
      return inv ? { ...inv } : null;
    },

    findMany: async (args?: { where?: { is_posted?: boolean } }): Promise<SalesInvoiceRecord[]> => {
      let list = [...this.ctx.salesInvoices];
      if (args?.where?.is_posted !== undefined) {
        list = list.filter((i) => i.is_posted === args.where!.is_posted);
      }
      return list;
    },

    create: async (args: {
      data: {
        customer_name: string;
        customer_phone: string;
        total_amount: number;
        delivery_date: Date;
        delivery_status: string;
        delivery_corridor_id: number;
        is_posted: boolean;
      };
    }): Promise<SalesInvoiceRecord> => {
      const newInvoice: SalesInvoiceRecord = {
        id: `inv-sales-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        invoice_ref: `INV-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        customer_name: args.data.customer_name,
        customer_phone: args.data.customer_phone,
        total_amount: args.data.total_amount,
        delivery_date: args.data.delivery_date,
        delivery_status: args.data.delivery_status,
        delivery_corridor_id: args.data.delivery_corridor_id,
        is_posted: args.data.is_posted,
        created_at: new Date(),
      };
      this.ctx.salesInvoices.push(newInvoice);
      return newInvoice;
    },

    update: async (args: {
      where: { id: string };
      data: Partial<SalesInvoiceRecord>;
    }): Promise<SalesInvoiceRecord> => {
      let inv = this.ctx.salesInvoices.find((i) => i.id === args.where.id);
      if (!inv) {
        inv = {
          id: args.where.id,
          invoice_ref: `INV-${args.where.id}`,
          customer_name: 'Customer',
          customer_phone: '',
          total_amount: 0,
          delivery_date: new Date(),
          delivery_status: 'pending_delivery',
          delivery_corridor_id: 1,
          is_posted: true,
          created_at: new Date(),
        };
        this.ctx.salesInvoices.push(inv);
      }
      Object.assign(inv, args.data);
      return inv;
    },
  };

  public sales_invoice_items = {
    findMany: async (args?: { where?: { invoice_id?: string } }): Promise<SalesInvoiceItemRecord[]> => {
      let list = [...this.ctx.salesInvoiceItems];
      if (args?.where?.invoice_id) {
        list = list.filter((i) => i.invoice_id === args.where!.invoice_id);
      }
      return list;
    },

    create: async (args: {
      data: {
        invoice_id: string;
        item_id: string;
        quantity: number;
        unit_price: number;
        unit_price_usd?: number;
      };
    }): Promise<SalesInvoiceItemRecord> => {
      const newLine: SalesInvoiceItemRecord = {
        id: `inv-line-${Date.now()}-${Math.random()}`,
        invoice_id: args.data.invoice_id,
        item_id: args.data.item_id,
        quantity: args.data.quantity,
        unit_price: args.data.unit_price,
        unit_price_usd: args.data.unit_price_usd ?? args.data.unit_price,
      };
      this.ctx.salesInvoiceItems.push(newLine);
      return newLine;
    },
  };

  public delivery_notes = {
    create: async (args: {
      data: {
        invoice_id: string;
        delivered_by: string;
        recipient_name: string;
        payment_method: 'COD' | 'WHISH';
        collected_amount_usd: number;
        collected_amount_lbp: number;
        signature_svg: string;
        notes?: string;
      };
    }): Promise<DeliveryNoteRecord> => {
      const deliveryNote: DeliveryNoteRecord = {
        id: `pod-note-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        delivery_note_number: 1000 + this.ctx.deliveryNotes.length + 1,
        invoice_id: args.data.invoice_id,
        delivered_by: args.data.delivered_by,
        recipient_name: args.data.recipient_name,
        payment_method: args.data.payment_method,
        collected_amount_usd: args.data.collected_amount_usd,
        collected_amount_lbp: args.data.collected_amount_lbp,
        signature_svg: args.data.signature_svg,
        notes: args.data.notes,
        created_at: new Date(),
      };
      this.ctx.deliveryNotes.push(deliveryNote);
      return deliveryNote;
    },

    findMany: async (args?: any): Promise<DeliveryNoteRecord[]> => {
      return [...this.ctx.deliveryNotes];
    },
  };

  public delivery_note_items = {
    create: async (args: {
      data: {
        delivery_note_id: string;
        item_id: string;
        quantity_delivered: number;
      };
    }): Promise<DeliveryNoteItemRecord> => {
      const itemRecord: DeliveryNoteItemRecord = {
        id: `dn-item-${Date.now()}-${Math.random()}`,
        delivery_note_id: args.data.delivery_note_id,
        item_id: args.data.item_id,
        quantity_delivered: args.data.quantity_delivered,
      };
      this.ctx.deliveryNoteItems.push(itemRecord);
      return itemRecord;
    },
  };

  public stock_ledger = {
    create: async (args: {
      data: {
        item_id: string;
        transaction_type: string;
        reference_id: string;
        qty_out: number;
      };
    }): Promise<StockLedgerRecord> => {
      const record: StockLedgerRecord = {
        id: `ledger-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        item_id: args.data.item_id,
        transaction_type: args.data.transaction_type,
        reference_id: args.data.reference_id,
        qty_out: args.data.qty_out,
        created_at: new Date(),
      };
      this.ctx.stockLedger.push(record);
      return record;
    },

    findMany: async (args?: any): Promise<StockLedgerRecord[]> => {
      return [...this.ctx.stockLedger];
    },
  };

  public fleet_ledger_entries = {
    create: async (args: {
      data: {
        reference_order_id: string;
        account: string;
        amount_usd: number;
        amount_lbp: number;
        entry_type: 'VAULT_COD' | 'WHISH_DEPOSIT';
        notes: string;
      };
    }): Promise<FleetLedgerEntryRecord> => {
      const entry: FleetLedgerEntryRecord = {
        id: `fle-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        reference_order_id: args.data.reference_order_id,
        account: args.data.account,
        amount_usd: args.data.amount_usd,
        amount_lbp: args.data.amount_lbp,
        entry_type: args.data.entry_type,
        notes: args.data.notes,
        created_at: new Date(),
      };
      this.ctx.fleetLedgerEntries.push(entry);
      return entry;
    },

    findMany: async (args?: any): Promise<FleetLedgerEntryRecord[]> => {
      return [...this.ctx.fleetLedgerEntries];
    },
  };

  public system_tax_configurations = {
    findUnique: async (args: {
      where: { id?: string; tax_code?: string };
    }): Promise<SystemTaxConfiguration | null> => {
      const cfg = this.ctx.systemTaxConfigurations.find(
        (c) => (args.where.id && c.id === args.where.id) || (args.where.tax_code && c.tax_code === args.where.tax_code)
      );
      return cfg ? { ...cfg } : null;
    },

    findMany: async (): Promise<SystemTaxConfiguration[]> => {
      return [...this.ctx.systemTaxConfigurations];
    },

    update: async (args: {
      where: { id: string };
      data: Partial<SystemTaxConfiguration>;
    }): Promise<SystemTaxConfiguration> => {
      const idx = this.ctx.systemTaxConfigurations.findIndex((c) => c.id === args.where.id);
      if (idx === -1) throw new Error(`Tax configuration ${args.where.id} not found`);
      this.ctx.systemTaxConfigurations[idx] = {
        ...this.ctx.systemTaxConfigurations[idx],
        ...args.data,
      };
      return { ...this.ctx.systemTaxConfigurations[idx] };
    },

    create: async (args: { data: Omit<SystemTaxConfiguration, 'id'> }): Promise<SystemTaxConfiguration> => {
      const newCfg: SystemTaxConfiguration = {
        ...args.data,
        id: `tax-cfg-${Date.now()}`,
      };
      this.ctx.systemTaxConfigurations.push(newCfg);
      return newCfg;
    },
  };

  public company_departments = {
    findMany: async (): Promise<CompanyDepartment[]> => {
      return [...this.ctx.companyDepartments];
    },

    findUnique: async (args: { where: { id: string } }): Promise<CompanyDepartment | null> => {
      const dept = this.ctx.companyDepartments.find((d) => d.id === args.where.id);
      return dept ? { ...dept } : null;
    },
  };

  public chart_of_accounts = {
    findMany: async (): Promise<ChartOfAccountRecord[]> => {
      return [...this.ctx.chartOfAccounts];
    },

    findUnique: async (args: { where: { id?: string; code?: string } }): Promise<ChartOfAccountRecord | null> => {
      const coa = this.ctx.chartOfAccounts.find(
        (c) => (args.where.id && c.id === args.where.id) || (args.where.code && c.code === args.where.code)
      );
      return coa ? { ...coa } : null;
    },

    update: async (args: {
      where: { id: string };
      data: Partial<ChartOfAccountRecord>;
    }): Promise<ChartOfAccountRecord> => {
      const idx = this.ctx.chartOfAccounts.findIndex((c) => c.id === args.where.id);
      if (idx === -1) throw new Error(`Account ${args.where.id} not found`);
      this.ctx.chartOfAccounts[idx] = {
        ...this.ctx.chartOfAccounts[idx],
        ...args.data,
      };
      return { ...this.ctx.chartOfAccounts[idx] };
    },
  };

  public journal_vouchers = {
    create: async (args: {
      data: {
        voucher_number?: string;
        voucher_date?: string;
        reference_no?: string;
        narration: string;
        is_posted?: boolean;
      };
    }): Promise<JournalVoucherRecord> => {
      const voucher: JournalVoucherRecord = {
        id: `jv-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        voucher_number: args.data.voucher_number || `JV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        voucher_date: args.data.voucher_date || new Date().toISOString().split('T')[0],
        reference_no: args.data.reference_no,
        narration: args.data.narration,
        is_posted: args.data.is_posted ?? true,
        created_at: new Date().toISOString(),
      };
      this.ctx.journalVouchers.push(voucher);
      return voucher;
    },

    findUnique: async (args: {
      where: { id: string };
      include?: { lines?: boolean };
    }): Promise<(JournalVoucherRecord & { lines?: JournalEntryLineRecord[] }) | null> => {
      const voucher = this.ctx.journalVouchers.find((v) => v.id === args.where.id);
      if (!voucher) return null;
      const lines = args.include?.lines
        ? this.ctx.journalEntryLines.filter((l) => l.voucher_id === args.where.id)
        : undefined;
      return { ...voucher, lines };
    },

    findMany: async (): Promise<JournalVoucherRecord[]> => {
      return [...this.ctx.journalVouchers];
    },
  };

  public journal_entry_lines = {
    create: async (args: {
      data: {
        voucher_id: string;
        account_id: string;
        department_id?: string;
        description: string;
        debit?: number;
        credit?: number;
      };
    }): Promise<JournalEntryLineRecord> => {
      const line: JournalEntryLineRecord = {
        id: `jel-${Date.now()}-${Math.random()}`,
        voucher_id: args.data.voucher_id,
        account_id: args.data.account_id,
        department_id: args.data.department_id,
        description: args.data.description,
        debit: args.data.debit || 0,
        credit: args.data.credit || 0,
        created_at: new Date().toISOString(),
      };
      this.ctx.journalEntryLines.push(line);
      return line;
    },

    findMany: async (args?: {
      where?: { voucher_id?: string; department_id?: string; account_id?: string };
    }): Promise<JournalEntryLineRecord[]> => {
      let lines = [...this.ctx.journalEntryLines];
      if (args?.where?.voucher_id) {
        lines = lines.filter((l) => l.voucher_id === args.where!.voucher_id);
      }
      if (args?.where?.department_id) {
        lines = lines.filter((l) => l.department_id === args.where!.department_id);
      }
      if (args?.where?.account_id) {
        lines = lines.filter((l) => l.account_id === args.where!.account_id);
      }
      return lines;
    },
  };

  public gl_prepaid_allocations = {
    create: async (args: {
      data: {
        origin_voucher_id: string;
        prepaid_asset_account_id: string;
        expense_target_account_id: string;
        total_amount: number;
        monthly_installment: number;
        total_months: number;
        remaining_months: number;
        start_date: string;
        status?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
      };
    }): Promise<GLPrepaidAllocationRecord> => {
      const alloc: GLPrepaidAllocationRecord = {
        id: `gpa-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        origin_voucher_id: args.data.origin_voucher_id,
        prepaid_asset_account_id: args.data.prepaid_asset_account_id,
        expense_target_account_id: args.data.expense_target_account_id,
        total_amount: args.data.total_amount,
        monthly_installment: args.data.monthly_installment,
        total_months: args.data.total_months,
        remaining_months: args.data.remaining_months,
        start_date: args.data.start_date,
        status: args.data.status || 'ACTIVE',
        created_at: new Date().toISOString(),
      };
      this.ctx.glPrepaidAllocations.push(alloc);
      return alloc;
    },

    findUnique: async (args: { where: { id: string } }): Promise<GLPrepaidAllocationRecord | null> => {
      const alloc = this.ctx.glPrepaidAllocations.find((a) => a.id === args.where.id);
      return alloc ? { ...alloc } : null;
    },

    findMany: async (args?: { where?: { status?: string } }): Promise<GLPrepaidAllocationRecord[]> => {
      let list = [...this.ctx.glPrepaidAllocations];
      if (args?.where?.status) {
        list = list.filter((a) => a.status === args.where!.status);
      }
      return list;
    },

    update: async (args: {
      where: { id: string };
      data: Partial<GLPrepaidAllocationRecord>;
    }): Promise<GLPrepaidAllocationRecord> => {
      const idx = this.ctx.glPrepaidAllocations.findIndex((a) => a.id === args.where.id);
      if (idx === -1) throw new Error(`Prepaid allocation ${args.where.id} not found`);
      this.ctx.glPrepaidAllocations[idx] = {
        ...this.ctx.glPrepaidAllocations[idx],
        ...args.data,
      };
      return { ...this.ctx.glPrepaidAllocations[idx] };
    },
  };

  public purchase_order_items = {
    create: async (args: {
      data: Omit<PurchaseOrderItemRecord, 'id'>;
    }): Promise<PurchaseOrderItemRecord> => {
      const item: PurchaseOrderItemRecord = {
        id: `poi-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        ...args.data,
      };
      this.ctx.purchaseOrderItems.push(item);
      return item;
    },

    findMany: async (args?: { where?: { order_id?: string } }): Promise<PurchaseOrderItemRecord[]> => {
      let list = [...this.ctx.purchaseOrderItems];
      if (args?.where?.order_id) {
        list = list.filter((i) => i.order_id === args.where!.order_id);
      }
      return list;
    },

    update: async (args: {
      where: { id: string };
      data: Partial<PurchaseOrderItemRecord>;
    }): Promise<PurchaseOrderItemRecord> => {
      const idx = this.ctx.purchaseOrderItems.findIndex((i) => i.id === args.where.id);
      if (idx === -1) throw new Error(`PO Item ${args.where.id} not found`);
      this.ctx.purchaseOrderItems[idx] = {
        ...this.ctx.purchaseOrderItems[idx],
        ...args.data,
      };
      return { ...this.ctx.purchaseOrderItems[idx] };
    },
  };

  public internal_transfer_items = {
    create: async (args: {
      data: Omit<InternalTransferItemRecord, 'id'>;
    }): Promise<InternalTransferItemRecord> => {
      const item: InternalTransferItemRecord = {
        id: `iti-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        ...args.data,
      };
      this.ctx.internalTransferItems.push(item);
      return item;
    },

    findMany: async (args?: { where?: { transfer_id?: string } }): Promise<InternalTransferItemRecord[]> => {
      let list = [...this.ctx.internalTransferItems];
      if (args?.where?.transfer_id) {
        list = list.filter((i) => i.transfer_id === args.where!.transfer_id);
      }
      return list;
    },

    update: async (args: {
      where: { id: string };
      data: Partial<InternalTransferItemRecord>;
    }): Promise<InternalTransferItemRecord> => {
      const idx = this.ctx.internalTransferItems.findIndex((i) => i.id === args.where.id);
      if (idx === -1) throw new Error(`Transfer Item ${args.where.id} not found`);
      this.ctx.internalTransferItems[idx] = {
        ...this.ctx.internalTransferItems[idx],
        ...args.data,
      };
      return { ...this.ctx.internalTransferItems[idx] };
    },
  };

  public recurring_transaction_templates = {
    create: async (args: {
      data: Omit<RecurringTransactionTemplate, 'id' | 'created_at'>;
    }): Promise<RecurringTransactionTemplate> => {
      const tmpl: RecurringTransactionTemplate = {
        id: `rec-tmpl-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        ...args.data,
        created_at: new Date().toISOString(),
      };
      this.ctx.recurringTransactionTemplates.push(tmpl);
      return tmpl;
    },

    findUnique: async (args: {
      where: { id: string };
      include?: { items?: boolean };
    }): Promise<(RecurringTransactionTemplate & { items?: RecurringTransactionTemplateItem[] }) | null> => {
      const tmpl = this.ctx.recurringTransactionTemplates.find((t) => t.id === args.where.id);
      if (!tmpl) return null;
      const items = args.include?.items
        ? this.ctx.recurringTransactionTemplateItems.filter((i) => i.template_id === args.where.id)
        : undefined;
      return { ...tmpl, items };
    },

    findMany: async (args?: { where?: { transaction_type?: string } }): Promise<RecurringTransactionTemplate[]> => {
      let list = [...this.ctx.recurringTransactionTemplates];
      if (args?.where?.transaction_type) {
        list = list.filter((t) => t.transaction_type === args.where!.transaction_type);
      }
      return list;
    },
  };

  public recurring_transaction_template_items = {
    create: async (args: {
      data: Omit<RecurringTransactionTemplateItem, 'id'>;
    }): Promise<RecurringTransactionTemplateItem> => {
      const item: RecurringTransactionTemplateItem = {
        id: `rtti-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        ...args.data,
      };
      this.ctx.recurringTransactionTemplateItems.push(item);
      return item;
    },

    findMany: async (args?: { where?: { template_id?: string } }): Promise<RecurringTransactionTemplateItem[]> => {
      let list = [...this.ctx.recurringTransactionTemplateItems];
      if (args?.where?.template_id) {
        list = list.filter((i) => i.template_id === args.where!.template_id);
      }
      return list;
    },
  };

  public electronic_scale_devices = {
    findMany: async (args?: {
      where?: { branch_id?: string; is_active?: boolean; scale_model?: ElectronicScaleProtocol };
    }): Promise<ElectronicScaleDevice[]> => {
      let list = [...this.ctx.electronicScaleDevices];
      if (args?.where?.branch_id) {
        list = list.filter((d) => d.branch_id === args.where!.branch_id);
      }
      if (args?.where?.is_active !== undefined) {
        list = list.filter((d) => d.is_active === args.where!.is_active);
      }
      if (args?.where?.scale_model) {
        list = list.filter((d) => d.scale_model === args.where!.scale_model);
      }
      return list;
    },

    findUnique: async (args: { where: { id: string } }): Promise<ElectronicScaleDevice | null> => {
      const dev = this.ctx.electronicScaleDevices.find((d) => d.id === args.where.id);
      return dev ? { ...dev } : null;
    },

    create: async (args: { data: Omit<ElectronicScaleDevice, 'id'> }): Promise<ElectronicScaleDevice> => {
      const dev: ElectronicScaleDevice = {
        id: `scale-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        ...args.data,
      };
      this.ctx.electronicScaleDevices.push(dev);
      return dev;
    },

    update: async (args: {
      where: { id: string };
      data: Partial<ElectronicScaleDevice>;
    }): Promise<ElectronicScaleDevice> => {
      const idx = this.ctx.electronicScaleDevices.findIndex((d) => d.id === args.where.id);
      if (idx === -1) throw new Error(`Scale device ${args.where.id} not found`);
      this.ctx.electronicScaleDevices[idx] = {
        ...this.ctx.electronicScaleDevices[idx],
        ...args.data,
      };
      return { ...this.ctx.electronicScaleDevices[idx] };
    },

    delete: async (args: { where: { id: string } }): Promise<boolean> => {
      const idx = this.ctx.electronicScaleDevices.findIndex((d) => d.id === args.where.id);
      if (idx !== -1) {
        this.ctx.electronicScaleDevices.splice(idx, 1);
        return true;
      }
      return false;
    },
  };

  public reservation_shifts = {
    findMany: async (args?: { where?: { is_active?: boolean } }): Promise<ReservationShift[]> => {
      let list = [...this.ctx.reservationShifts];
      if (args?.where?.is_active !== undefined) {
        list = list.filter((s) => s.is_active === args.where!.is_active);
      }
      return list;
    },

    findUnique: async (args: { where: { id: string } }): Promise<ReservationShift | null> => {
      const shift = this.ctx.reservationShifts.find((s) => s.id === args.where.id);
      return shift ? { ...shift } : null;
    },

    create: async (args: { data: Omit<ReservationShift, 'id'> }): Promise<ReservationShift> => {
      const shift: ReservationShift = {
        id: `shift-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        ...args.data,
      };
      this.ctx.reservationShifts.push(shift);
      return shift;
    },

    update: async (args: {
      where: { id: string };
      data: Partial<ReservationShift>;
    }): Promise<ReservationShift> => {
      const idx = this.ctx.reservationShifts.findIndex((s) => s.id === args.where.id);
      if (idx === -1) throw new Error(`Reservation shift ${args.where.id} not found`);
      this.ctx.reservationShifts[idx] = {
        ...this.ctx.reservationShifts[idx],
        ...args.data,
      };
      return { ...this.ctx.reservationShifts[idx] };
    },
  };

  public reservation_settings = {
    findFirst: async (): Promise<ReservationSettings> => {
      if (this.ctx.reservationSettings.length === 0) {
        this.ctx.reservationSettings.push({
          id: 'res-cfg-default',
          table_stay_period_minutes: 120,
          active_shift_id: null,
          updated_at: new Date().toISOString(),
        });
      }
      return { ...this.ctx.reservationSettings[0] };
    },

    update: async (args: { data: Partial<ReservationSettings> }): Promise<ReservationSettings> => {
      if (this.ctx.reservationSettings.length === 0) {
        await this.reservation_settings.findFirst();
      }
      this.ctx.reservationSettings[0] = {
        ...this.ctx.reservationSettings[0],
        ...args.data,
        updated_at: new Date().toISOString(),
      };
      return { ...this.ctx.reservationSettings[0] };
    },
  };

  public sms_notification_settings = {
    findFirst: async (): Promise<SMSNotificationSettings> => {
      if (this.ctx.smsNotificationSettings.length === 0) {
        this.ctx.smsNotificationSettings.push({
          id: 'sms-cfg-default',
          sender_id: 'SOUTHERN-OLV',
          country_code: '+961',
          auto_send_on_invoice_close: false,
          send_feedback_link: false,
          feedback_url_base: (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_APP_URL)
            ? `${process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')}/feedback/rate`
            : '/feedback/rate',
          created_at: new Date().toISOString(),
        });
      }
      return { ...this.ctx.smsNotificationSettings[0] };
    },

    update: async (args: { data: Partial<SMSNotificationSettings> }): Promise<SMSNotificationSettings> => {
      if (this.ctx.smsNotificationSettings.length === 0) {
        await this.sms_notification_settings.findFirst();
      }
      this.ctx.smsNotificationSettings[0] = {
        ...this.ctx.smsNotificationSettings[0],
        ...args.data,
      };
      return { ...this.ctx.smsNotificationSettings[0] };
    },
  };

  public system_hardware_profiles = {
    findMany: async (args?: {
      where?: {
        device_category?: HardwareDeviceCategory;
        interface_type?: HardwareInterfaceType;
        branch_id?: string;
        is_active?: boolean;
      };
    }): Promise<SystemHardwareProfile[]> => {
      let list = [...this.ctx.systemHardwareProfiles];
      if (args?.where?.device_category) {
        list = list.filter((d) => d.device_category === args.where!.device_category);
      }
      if (args?.where?.interface_type) {
        list = list.filter((d) => d.interface_type === args.where!.interface_type);
      }
      if (args?.where?.branch_id) {
        list = list.filter((d) => d.branch_id === args.where!.branch_id);
      }
      if (args?.where?.is_active !== undefined) {
        list = list.filter((d) => d.is_active === args.where!.is_active);
      }
      return list;
    },

    findUnique: async (args: { where: { id: string } }): Promise<SystemHardwareProfile | null> => {
      const dev = this.ctx.systemHardwareProfiles.find((d) => d.id === args.where.id);
      return dev ? { ...dev } : null;
    },

    create: async (args: {
      data: Omit<SystemHardwareProfile, 'id' | 'created_at'>;
    }): Promise<SystemHardwareProfile> => {
      const dev: SystemHardwareProfile = {
        id: `hw-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        ...args.data,
        created_at: new Date().toISOString(),
      };
      this.ctx.systemHardwareProfiles.push(dev);
      return dev;
    },

    update: async (args: {
      where: { id: string };
      data: Partial<SystemHardwareProfile>;
    }): Promise<SystemHardwareProfile> => {
      const idx = this.ctx.systemHardwareProfiles.findIndex((d) => d.id === args.where.id);
      if (idx === -1) throw new Error(`Hardware profile ${args.where.id} not found`);
      this.ctx.systemHardwareProfiles[idx] = {
        ...this.ctx.systemHardwareProfiles[idx],
        ...args.data,
      };
      return { ...this.ctx.systemHardwareProfiles[idx] };
    },

    delete: async (args: { where: { id: string } }): Promise<boolean> => {
      const idx = this.ctx.systemHardwareProfiles.findIndex((d) => d.id === args.where.id);
      if (idx !== -1) {
        this.ctx.systemHardwareProfiles.splice(idx, 1);
        return true;
      }
      return false;
    },
  };
}

export const db = {
  ...new TransactionClient(),
  $transaction: async <T>(fn: (tx: TransactionClient) => Promise<T>): Promise<T> => {
    const tx = new TransactionClient();
    return await fn(tx);
  },
};
