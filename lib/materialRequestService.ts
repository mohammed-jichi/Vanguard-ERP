// ============================================================
// VANGUARD ERP: MATERIAL REQUESTS & RECURRING TEMPLATES SERVICE
// ============================================================

import { db } from "@/lib/db";
import {
  RecurringTransactionTemplate,
  RecurringTransactionTemplateItem,
  StoreRecurringTemplateInput,
  PurchaseOrderItemRecord,
  InternalTransferItemRecord,
  RecurringTransactionType,
} from "@/types/material-requests";

export class MaterialRequestService {
  /**
   * 1. Store a Recurring Transaction Template (Store & Recall)
   */
  static async storeRecurringTemplate(
    input: StoreRecurringTemplateInput
  ): Promise<RecurringTransactionTemplate> {
    const { templateName, transactionType, sourceBranchId, destinationBranchId, notes, createdBy, items } = input;

    if (!templateName || !transactionType) {
      throw new Error("Template name and transaction type are required");
    }

    if (!items || items.length === 0) {
      throw new Error("Template must contain at least one item");
    }

    return await db.$transaction(async (tx) => {
      const template = await tx.recurring_transaction_templates.create({
        data: {
          template_name: templateName,
          transaction_type: transactionType,
          source_branch_id: sourceBranchId,
          destination_branch_id: destinationBranchId,
          notes,
          created_by: createdBy,
        },
      });

      const templateItems: RecurringTransactionTemplateItem[] = [];

      for (const line of items) {
        const inv = await tx.vanguard_inventory.findUnique({
          where: { id: line.itemId },
          select: { item_name: true },
        });

        const item = await tx.recurring_transaction_template_items.create({
          data: {
            template_id: template.id,
            item_id: line.itemId,
            item_name: inv?.item_name || line.itemId,
            default_quantity: line.defaultQuantity || 1,
          },
        });
        templateItems.push(item);
      }

      return {
        ...template,
        items: templateItems,
      };
    });
  }

  /**
   * 2. Recall a Recurring Transaction Template by ID
   */
  static async recallRecurringTemplate(
    templateId: string
  ): Promise<RecurringTransactionTemplate | null> {
    return await db.recurring_transaction_templates.findUnique({
      where: { id: templateId },
      include: { items: true },
    });
  }

  /**
   * 3. List Stored Recurring Templates
   */
  static async getRecurringTemplates(
    transactionType?: RecurringTransactionType
  ): Promise<RecurringTransactionTemplate[]> {
    return await db.recurring_transaction_templates.findMany(
      transactionType ? { where: { transaction_type: transactionType } } : undefined
    );
  }

  /**
   * 4. Record Requested Item for Purchase Order (Separate requested from approved)
   */
  static async createPurchaseOrderItem(
    orderId: string,
    itemId: string,
    qtyRequested: number,
    unitPrice: number = 0,
    notes?: string
  ): Promise<PurchaseOrderItemRecord> {
    return await db.purchase_order_items.create({
      data: {
        order_id: orderId,
        item_id: itemId,
        qty_requested: qtyRequested,
        qty_approved: 0, // initially 0 until manager approval
        unit_price: unitPrice,
        notes,
      },
    });
  }

  /**
   * 5. Record Requested Item for Internal Transfer (Separate requested from approved)
   */
  static async createInternalTransferItem(
    transferId: string,
    itemId: string,
    qtyRequested: number,
    notes?: string
  ): Promise<InternalTransferItemRecord> {
    return await db.internal_transfer_items.create({
      data: {
        transfer_id: transferId,
        item_id: itemId,
        qty_requested: qtyRequested,
        qty_approved: 0, // initially 0 until warehouse/branch approval
        notes,
      },
    });
  }

  /**
   * 6. Approve Quantities on Purchase Order Items
   */
  static async approvePurchaseOrderQuantities(
    orderId: string,
    approvals: Array<{ itemId: string; qtyApproved: number }>
  ): Promise<PurchaseOrderItemRecord[]> {
    return await db.$transaction(async (tx) => {
      const existingItems = await tx.purchase_order_items.findMany({
        where: { order_id: orderId },
      });

      const updatedList: PurchaseOrderItemRecord[] = [];

      for (const app of approvals) {
        const line = existingItems.find((i) => i.item_id === app.itemId);
        if (line) {
          const updated = await tx.purchase_order_items.update({
            where: { id: line.id },
            data: { qty_approved: app.qtyApproved },
          });
          updatedList.push(updated);
        }
      }

      return updatedList;
    });
  }

  /**
   * 7. Approve Quantities on Internal Transfer Items
   */
  static async approveInternalTransferQuantities(
    transferId: string,
    approvals: Array<{ itemId: string; qtyApproved: number }>
  ): Promise<InternalTransferItemRecord[]> {
    return await db.$transaction(async (tx) => {
      const existingItems = await tx.internal_transfer_items.findMany({
        where: { transfer_id: transferId },
      });

      const updatedList: InternalTransferItemRecord[] = [];

      for (const app of approvals) {
        const line = existingItems.find((i) => i.item_id === app.itemId);
        if (line) {
          const updated = await tx.internal_transfer_items.update({
            where: { id: line.id },
            data: { qty_approved: app.qtyApproved },
          });
          updatedList.push(updated);
        }
      }

      return updatedList;
    });
  }
}
