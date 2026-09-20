// ============================================================
// VANGUARD ERP: MATERIAL REQUESTS & RECURRING TEMPLATES TYPES
// ============================================================

export type RecurringTransactionType = 'MATERIAL_REQUEST' | 'PURCHASE_ORDER' | 'TRANSFER';

export interface RecurringTransactionTemplateItem {
  id: string;
  template_id: string;
  item_id: string;
  item_name?: string;
  default_quantity: number;
}

export interface RecurringTransactionTemplate {
  id: string;
  template_name: string;
  transaction_type: RecurringTransactionType;
  source_branch_id?: string;
  destination_branch_id?: string;
  notes?: string;
  created_by?: string;
  created_at?: string;
  items?: RecurringTransactionTemplateItem[];
}

export interface PurchaseOrderItemRecord {
  id: string;
  order_id: string;
  item_id: string;
  qty_requested: number;
  qty_approved: number;
  unit_price?: number;
  notes?: string;
}

export interface InternalTransferItemRecord {
  id: string;
  transfer_id: string;
  item_id: string;
  qty_requested: number;
  qty_approved: number;
  notes?: string;
}

export interface StoreRecurringTemplateInput {
  templateName: string;
  transactionType: RecurringTransactionType;
  sourceBranchId?: string;
  destinationBranchId?: string;
  notes?: string;
  createdBy?: string;
  items: Array<{
    itemId: string;
    defaultQuantity: number;
  }>;
}

export interface ApproveQuantitiesInput {
  recordType: 'PURCHASE_ORDER' | 'TRANSFER';
  recordId: string;
  items: Array<{
    itemId: string;
    qtyApproved: number;
  }>;
}
