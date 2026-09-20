// ============================================================
// VANGUARD ERP: ADVANCED ACCOUNTING, TAX SPLIT & ALLOCATIONS SERVICE
// ============================================================

import { db } from "@/lib/db";
import {
  SystemTaxConfiguration,
  CompanyDepartment,
  ChartOfAccountRecord,
  JournalVoucherRecord,
  JournalEntryLineRecord,
  GLPrepaidAllocationRecord,
  CreatePrepaidAllocationInput,
} from "@/types/advanced-accounting";

/**
 * 1. Calculate Tax with optional rounding up (matching calculate_vanguard_tax PL/pgSQL function)
 *
 * CREATE OR REPLACE FUNCTION calculate_vanguard_tax(
 *     base_amount NUMERIC,
 *     tax_rate NUMERIC,
 *     apply_rounding BOOLEAN
 * ) RETURNS NUMERIC AS $$
 * DECLARE
 *     calculated_tax NUMERIC;
 * BEGIN
 *     calculated_tax := base_amount * (tax_rate / 100.0);
 *     IF apply_rounding THEN
 *         RETURN CEIL(calculated_tax);
 *     ELSE
 *         RETURN ROUND(calculated_tax, 2);
 *     END IF;
 * END;
 * $$ LANGUAGE plpgsql;
 */
export function calculateVanguardTax(
  baseAmount: number,
  taxRate: number,
  applyRounding: boolean = false
): number {
  const calculatedTax = baseAmount * (taxRate / 100.0);
  if (applyRounding) {
    return Math.ceil(calculatedTax);
  } else {
    return Math.round(calculatedTax * 100) / 100;
  }
}

export class AdvancedAccountingService {
  /**
   * 1. Get or Update Tax Configuration
   */
  static async getTaxConfiguration(taxCode: string = "VAT_11"): Promise<SystemTaxConfiguration | null> {
    return await db.system_tax_configurations.findUnique({
      where: { tax_code: taxCode },
    });
  }

  static async updateTaxConfiguration(
    id: string,
    updates: Partial<SystemTaxConfiguration>
  ): Promise<SystemTaxConfiguration> {
    return await db.system_tax_configurations.update({
      where: { id },
      data: updates,
    });
  }

  /**
   * Calculate Tax based on active configuration
   */
  static async computeTaxForAmount(
    baseAmount: number,
    taxCode: string = "VAT_11",
    overrideRounding?: boolean
  ): Promise<{ baseAmount: number; taxRate: number; calculatedTax: number; roundingApplied: boolean }> {
    const config = await this.getTaxConfiguration(taxCode);
    const taxRate = config ? config.tax_rate : 11.0;
    const applyRounding = overrideRounding ?? (config ? config.enable_rounding_up : false);
    const calculatedTax = calculateVanguardTax(baseAmount, taxRate, applyRounding);

    return {
      baseAmount,
      taxRate,
      calculatedTax,
      roundingApplied: applyRounding,
    };
  }

  /**
   * 2. Split Tax Entries across configured accounts
   * Generates journal lines splitting tax among tax1_account_id, tax2_account_id, and tax3_account_id
   */
  static async generateTaxSplitLines(
    voucherId: string,
    baseAmount: number,
    taxCode: string = "VAT_11",
    departmentId?: string
  ): Promise<JournalEntryLineRecord[]> {
    const config = await this.getTaxConfiguration(taxCode);
    if (!config) throw new Error(`Tax configuration ${taxCode} not found`);

    const totalTax = calculateVanguardTax(baseAmount, config.tax_rate, config.enable_rounding_up);
    const lines: JournalEntryLineRecord[] = [];

    // Check how many tax accounts are configured
    const accounts = [config.tax1_account_id, config.tax2_account_id, config.tax3_account_id].filter(
      Boolean
    ) as string[];

    if (accounts.length === 0) {
      // Fallback default output VAT account
      const line = await db.journal_entry_lines.create({
        data: {
          voucher_id: voucherId,
          account_id: "coa-tax-01",
          department_id: departmentId,
          description: `Tax output VAT (${config.tax_rate}%) on base $${baseAmount.toFixed(2)}`,
          credit: totalTax,
          debit: 0,
        },
      });
      lines.push(line);
      return lines;
    }

    if (accounts.length === 1) {
      const line = await db.journal_entry_lines.create({
        data: {
          voucher_id: voucherId,
          account_id: accounts[0],
          department_id: departmentId,
          description: `Tax line (${config.tax_name}) on base $${baseAmount.toFixed(2)}`,
          credit: totalTax,
          debit: 0,
        },
      });
      lines.push(line);
      return lines;
    }

    // If split across multiple accounts (e.g. MOF 10% + Municipal 1% or proportional)
    const portionPerAccount = Math.round((totalTax / accounts.length) * 100) / 100;
    let distributedSum = 0;

    for (let i = 0; i < accounts.length; i++) {
      const isLast = i === accounts.length - 1;
      const amount = isLast ? Math.round((totalTax - distributedSum) * 100) / 100 : portionPerAccount;
      distributedSum += amount;

      const line = await db.journal_entry_lines.create({
        data: {
          voucher_id: voucherId,
          account_id: accounts[i],
          department_id: departmentId,
          description: `Tax split ${i + 1}/${accounts.length} (${config.tax_name})`,
          credit: amount,
          debit: 0,
        },
      });
      lines.push(line);
    }

    return lines;
  }

  /**
   * 3. Department Support (Department Filter)
   */
  static async getDepartments(): Promise<CompanyDepartment[]> {
    return await db.company_departments.findMany();
  }

  static async getJournalLinesByDepartment(departmentId?: string): Promise<JournalEntryLineRecord[]> {
    return await db.journal_entry_lines.findMany(
      departmentId ? { where: { department_id: departmentId } } : undefined
    );
  }

  /**
   * 4. Prepaid Expense Allocation (gl_prepaid_allocations)
   */
  static async createPrepaidExpenseAllocation(
    input: CreatePrepaidAllocationInput
  ): Promise<GLPrepaidAllocationRecord> {
    const {
      originVoucherId,
      prepaidAssetAccountId,
      expenseTargetAccountId,
      totalAmount,
      totalMonths,
      startDate,
    } = input;

    if (totalMonths <= 0) {
      throw new Error("totalMonths must be greater than 0");
    }
    if (totalAmount <= 0) {
      throw new Error("totalAmount must be greater than 0");
    }

    // Verify accounts exist
    const assetAcc = await db.chart_of_accounts.findUnique({ where: { id: prepaidAssetAccountId } });
    if (!assetAcc) throw new Error(`Prepaid asset account ${prepaidAssetAccountId} not found`);

    const expenseAcc = await db.chart_of_accounts.findUnique({ where: { id: expenseTargetAccountId } });
    if (!expenseAcc) throw new Error(`Expense target account ${expenseTargetAccountId} not found`);

    const monthlyInstallment = Math.round((totalAmount / totalMonths) * 100) / 100;
    const effectiveStartDate = startDate || new Date().toISOString().split("T")[0];

    return await db.gl_prepaid_allocations.create({
      data: {
        origin_voucher_id: originVoucherId,
        prepaid_asset_account_id: prepaidAssetAccountId,
        expense_target_account_id: expenseTargetAccountId,
        total_amount: totalAmount,
        monthly_installment: monthlyInstallment,
        total_months: totalMonths,
        remaining_months: totalMonths,
        start_date: effectiveStartDate,
        status: "ACTIVE",
      },
    });
  }

  /**
   * Process a Monthly Amortization Installment for a Prepaid Allocation
   * - Creates an amortizing Journal Voucher
   * - Debits expense target account
   * - Credits prepaid asset account
   * - Decrements remaining_months
   * - Sets status to COMPLETED when remaining_months reaches 0
   */
  static async processMonthlyPrepaidAmortization(
    allocationId: string,
    departmentId?: string
  ): Promise<{
    success: boolean;
    voucherId: string;
    remainingMonths: number;
    amortizedAmount: number;
    status: string;
  }> {
    return await db.$transaction(async (tx) => {
      const alloc = await tx.gl_prepaid_allocations.findUnique({
        where: { id: allocationId },
      });

      if (!alloc) throw new Error(`Prepaid allocation ${allocationId} not found`);
      if (alloc.status !== "ACTIVE") {
        throw new Error(`Allocation ${allocationId} is not active (current: ${alloc.status})`);
      }
      if (alloc.remaining_months <= 0) {
        throw new Error(`Allocation ${allocationId} has no remaining months left`);
      }

      // 1. Create monthly amortization journal voucher
      const voucher = await tx.journal_vouchers.create({
        data: {
          voucher_number: `JV-AMORT-${Date.now().toString().slice(-6)}`,
          narration: `Monthly amortization installment for prepaid allocation ${alloc.id} (${alloc.total_months - alloc.remaining_months + 1}/${alloc.total_months})`,
          is_posted: true,
        },
      });

      // 2. Debit Expense Target Account
      await tx.journal_entry_lines.create({
        data: {
          voucher_id: voucher.id,
          account_id: alloc.expense_target_account_id,
          department_id: departmentId,
          description: `Prepaid expense recognized - month ${alloc.total_months - alloc.remaining_months + 1} of ${alloc.total_months}`,
          debit: alloc.monthly_installment,
          credit: 0,
        },
      });

      // 3. Credit Prepaid Asset Account
      await tx.journal_entry_lines.create({
        data: {
          voucher_id: voucher.id,
          account_id: alloc.prepaid_asset_account_id,
          department_id: departmentId,
          description: `Prepaid asset relief - allocation ${alloc.id}`,
          debit: 0,
          credit: alloc.monthly_installment,
        },
      });

      // 4. Update balances in Chart of Accounts
      const expenseAcc = await tx.chart_of_accounts.findUnique({
        where: { id: alloc.expense_target_account_id },
      });
      if (expenseAcc) {
        await tx.chart_of_accounts.update({
          where: { id: expenseAcc.id },
          data: { balance: (expenseAcc.balance || 0) + alloc.monthly_installment },
        });
      }

      const assetAcc = await tx.chart_of_accounts.findUnique({
        where: { id: alloc.prepaid_asset_account_id },
      });
      if (assetAcc) {
        await tx.chart_of_accounts.update({
          where: { id: assetAcc.id },
          data: { balance: Math.max(0, (assetAcc.balance || 0) - alloc.monthly_installment) },
        });
      }

      // 5. Decrement remaining months & check completion
      const newRemaining = alloc.remaining_months - 1;
      const newStatus = newRemaining === 0 ? "COMPLETED" : "ACTIVE";

      await tx.gl_prepaid_allocations.update({
        where: { id: allocationId },
        data: {
          remaining_months: newRemaining,
          status: newStatus,
        },
      });

      return {
        success: true,
        voucherId: voucher.id,
        remainingMonths: newRemaining,
        amortizedAmount: alloc.monthly_installment,
        status: newStatus,
      };
    });
  }

  static async getPrepaidAllocations(status?: string): Promise<GLPrepaidAllocationRecord[]> {
    return await db.gl_prepaid_allocations.findMany(
      status ? { where: { status } } : undefined
    );
  }
}
