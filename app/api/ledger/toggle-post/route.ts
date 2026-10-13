import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseClient';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

export type DocumentType = 'SALES' | 'PURCHASE' | 'TRANSFER' | 'RETURN' | 'VOUCHER';

export interface TogglePostPayload {
  documentType: DocumentType;
  documentId?: string;
  documentIds?: string[];
  posted: boolean;
  reason?: string;
  tenantId?: string;
}

const isUUID = (val: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

/**
 * Universal Unified Document Posting & Reversible Ledger Persistence API
 * POST /api/ledger/toggle-post
 */
export async function POST(req: NextRequest) {
  try {
    const body: TogglePostPayload = await req.json();
    const { documentType, documentId, documentIds, posted, reason, tenantId } = body;

    if (!documentType) {
      return NextResponse.json(
        { success: false, error: 'documentType is required' },
        { status: 400 }
      );
    }

    if (posted === undefined || posted === null) {
      return NextResponse.json(
        { success: false, error: 'posted (boolean) is required' },
        { status: 400 }
      );
    }

    const ids: string[] = [];
    if (documentId) ids.push(documentId);
    if (Array.isArray(documentIds)) {
      for (const id of documentIds) {
        if (id && !ids.includes(id)) ids.push(id);
      }
    }

    if (ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one documentId or documentIds array is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    const targetTenantId =
      tenantId && tenantId !== '1300' && !tenantId.startsWith('comp-')
        ? tenantId
        : DEFAULT_TENANT_ID;

    const now = new Date().toISOString();
    const postedAt = posted ? now : null;
    const unpostedAt = !posted ? now : null;
    const documentStatus = posted ? 'POSTED' : 'UNPOSTED';

    const processedResults: Array<{ id: string; success: boolean; details?: any }> = [];

    // =========================================================================
    // 1. SALES & POS DOCUMENTS
    // =========================================================================
    if (documentType === 'SALES') {
      for (const id of ids) {
        try {
          const isIdUuid = isUUID(id);

          // a) Update sales_invoices table
          const salesUpdatePayload: Record<string, any> = {
            is_posted: posted,
            status: posted ? 'Posted' : 'Unposted',
            updated_at: now,
          };
          if (posted) {
            salesUpdatePayload.posted_at = postedAt;
          } else {
            salesUpdatePayload.unposted_at = unpostedAt;
            if (reason) salesUpdatePayload.unpost_reason = reason;
          }

          if (isIdUuid) {
            await supabase.from('sales_invoices').update(salesUpdatePayload).eq('id', id);
          } else {
            await supabase.from('sales_invoices').update(salesUpdatePayload).or(`invoice_ref.eq.${id},invoice_number.eq.${id}`);
          }

          // b) Update orders table
          const ordersUpdatePayload: Record<string, any> = {
            is_posted: posted,
            status: posted ? 'POSTED' : 'DRAFT',
            updated_at: now,
          };
          if (posted) {
            ordersUpdatePayload.posted_at = postedAt;
          } else {
            ordersUpdatePayload.unposted_at = unpostedAt;
          }

          if (isIdUuid) {
            await supabase.from('orders').update(ordersUpdatePayload).eq('id', id);
          } else {
            await supabase.from('orders').update(ordersUpdatePayload).or(`order_number.eq.${id},id.eq.${id}`);
          }

          // c) General Ledger & Stock audit integrity
          if (!posted) {
            // Unposting / Reversal: flag linked journal vouchers without destroying audit trail
            try {
              await supabase
                .from('acc_journal_vouchers')
                .update({
                  is_posted: false,
                  status: 'REVERSED',
                  description: reason ? `[REVERSED: ${reason}]` : '[REVERSED - UNPOSTED]',
                  updated_at: now,
                })
                .or(`reference.eq.${id},voucher_number.eq.${id}`);
            } catch (jvErr) {
              console.warn('[toggle-post] acc_journal_vouchers reversal notice:', jvErr);
            }

            // Flag stock deduction reversals
            try {
              await supabase
                .from('stock_transactions')
                .update({
                  notes: reason ? `Unposted: ${reason}` : 'Unposted reversal',
                  is_reversed: true,
                })
                .eq('reference_number', id);
            } catch (stErr) {
              console.warn('[toggle-post] stock_transactions reversal notice:', stErr);
            }
          }

          // d) Synchronize tenant feature_flags (sales_invoices / directory)
          try {
            const { data: tenantData } = await supabase
              .from('tenants')
              .select('feature_flags')
              .eq('id', targetTenantId)
              .maybeSingle();

            if (tenantData?.feature_flags) {
              const flags = tenantData.feature_flags;
              let dirty = false;

              if (Array.isArray(flags.sales_invoices)) {
                flags.sales_invoices = flags.sales_invoices.map((inv: any) => {
                  if (inv.id === id || inv.invoiceNumber === id || inv.invoice_number === id) {
                    dirty = true;
                    return {
                      ...inv,
                      posted: posted,
                      is_posted: posted,
                      status: posted ? 'Posted' : 'Unposted',
                      posted_at: postedAt,
                      updatedAt: now,
                    };
                  }
                  return inv;
                });
              }

              if (Array.isArray(flags.sales_invoices_directory)) {
                flags.sales_invoices_directory = flags.sales_invoices_directory.map((inv: any) => {
                  if (inv.id === id || inv.invoiceNumber === id || inv.invoice_number === id) {
                    dirty = true;
                    return {
                      ...inv,
                      posted: posted,
                      is_posted: posted,
                      status: posted ? 'Posted' : 'Unposted',
                      posted_at: postedAt,
                      updatedAt: now,
                    };
                  }
                  return inv;
                });
              }

              if (dirty) {
                await supabase
                  .from('tenants')
                  .update({ feature_flags: flags, updated_at: now })
                  .eq('id', targetTenantId);
              }
            }
          } catch (tenantErr) {
            console.warn('[toggle-post] tenant feature_flags sync notice:', tenantErr);
          }

          processedResults.push({ id, success: true, details: { posted, status: documentStatus } });
        } catch (err: any) {
          console.error(`[toggle-post] Sales error for ${id}:`, err);
          processedResults.push({ id, success: false, details: err?.message });
        }
      }
    }

    // =========================================================================
    // 2. PURCHASING DOCUMENTS
    // =========================================================================
    else if (documentType === 'PURCHASE') {
      for (const id of ids) {
        try {
          const isIdUuid = isUUID(id);

          // a) Update purchases_invoices / purchase_invoices table if present
          const purchasePayload: Record<string, any> = {
            is_posted: posted,
            posted: posted,
            status: posted ? 'POSTED' : 'UNPOSTED',
            updated_at: now,
          };
          if (posted) purchasePayload.posted_at = postedAt;
          else purchasePayload.unposted_at = unpostedAt;

          try {
            if (isIdUuid) {
              await supabase.from('purchases_invoices').update(purchasePayload).eq('id', id);
            } else {
              await supabase.from('purchases_invoices').update(purchasePayload).or(`invoice_number.eq.${id},id.eq.${id}`);
            }
          } catch (pTableErr) {
            console.warn('[toggle-post] purchases_invoices table notice:', pTableErr);
          }

          // b) Update tenant feature_flags.purchases_invoices (authoritative store for PurchasesView)
          try {
            const { data: tenantData } = await supabase
              .from('tenants')
              .select('feature_flags')
              .eq('id', targetTenantId)
              .maybeSingle();

            if (tenantData?.feature_flags?.purchases_invoices && Array.isArray(tenantData.feature_flags.purchases_invoices)) {
              const flags = tenantData.feature_flags;
              const updatedPurchases = flags.purchases_invoices.map((p: any) => {
                if (p.id === id || p.invoiceNumber === id) {
                  return {
                    ...p,
                    posted: posted,
                    transferred: posted,
                    updatedAt: now,
                  };
                }
                return p;
              });

              await supabase
                .from('tenants')
                .update({
                  feature_flags: {
                    ...flags,
                    purchases_invoices: updatedPurchases,
                  },
                  updated_at: now,
                })
                .eq('id', targetTenantId);
            }
          } catch (tenantErr) {
            console.warn('[toggle-post] tenant feature_flags purchases notice:', tenantErr);
          }

          // c) If unposting, reverse any linked journal vouchers
          if (!posted) {
            try {
              await supabase
                .from('acc_journal_vouchers')
                .update({
                  is_posted: false,
                  status: 'REVERSED',
                  description: reason ? `[REVERSED: ${reason}]` : '[REVERSED - UNPOSTED PURCHASE]',
                  updated_at: now,
                })
                .or(`reference.eq.${id},voucher_number.eq.${id}`);
            } catch (jvErr) {
              console.warn('[toggle-post] purchase acc_journal_vouchers reversal notice:', jvErr);
            }
          }

          processedResults.push({ id, success: true, details: { posted, status: documentStatus } });
        } catch (err: any) {
          console.error(`[toggle-post] Purchase error for ${id}:`, err);
          processedResults.push({ id, success: false, details: err?.message });
        }
      }
    }

    // =========================================================================
    // 3. INVENTORY TRANSFERS
    // =========================================================================
    else if (documentType === 'TRANSFER') {
      for (const id of ids) {
        try {
          const isIdUuid = isUUID(id);
          const transferPayload: Record<string, any> = {
            is_posted: posted,
            posted: posted,
            status: posted ? 'POSTED' : 'DRAFT',
            updated_at: now,
          };
          if (posted) transferPayload.posted_at = postedAt;
          else transferPayload.unposted_at = unpostedAt;

          try {
            if (isIdUuid) {
              await supabase.from('inventory_transfers').update(transferPayload).eq('id', id);
            } else {
              await supabase.from('inventory_transfers').update(transferPayload).or(`req_no.eq.${id},id.eq.${id}`);
            }
          } catch (tErr) {
            console.warn('[toggle-post] inventory_transfers table notice:', tErr);
          }

          // Synchronize tenant feature_flags.inventory_transfers
          try {
            const { data: tenantData } = await supabase
              .from('tenants')
              .select('feature_flags')
              .eq('id', targetTenantId)
              .maybeSingle();

            if (tenantData?.feature_flags?.inventory_transfers && Array.isArray(tenantData.feature_flags.inventory_transfers)) {
              const flags = tenantData.feature_flags;
              const updatedTransfers = flags.inventory_transfers.map((tr: any) => {
                if (tr.id === id || tr.reqNo === id) {
                  return {
                    ...tr,
                    posted: posted,
                    status: posted ? (tr.status === 'RECEIVED' ? 'RECEIVED' : 'POSTED') : 'DRAFT',
                    updatedAt: now,
                  };
                }
                return tr;
              });

              await supabase
                .from('tenants')
                .update({
                  feature_flags: {
                    ...flags,
                    inventory_transfers: updatedTransfers,
                  },
                  updated_at: now,
                })
                .eq('id', targetTenantId);
            }
          } catch (tenantErr) {
            console.warn('[toggle-post] tenant feature_flags transfers notice:', tenantErr);
          }

          processedResults.push({ id, success: true, details: { posted, status: documentStatus } });
        } catch (err: any) {
          console.error(`[toggle-post] Transfer error for ${id}:`, err);
          processedResults.push({ id, success: false, details: err?.message });
        }
      }
    }

    // =========================================================================
    // 4. RETURNS (CUSTOMER & SUPPLIER)
    // =========================================================================
    else if (documentType === 'RETURN') {
      for (const id of ids) {
        try {
          const returnPayload: Record<string, any> = {
            is_posted: posted,
            posted: posted,
            status: posted ? 'POSTED' : 'DRAFT',
            updated_at: now,
          };
          if (posted) returnPayload.posted_at = postedAt;
          else returnPayload.unposted_at = unpostedAt;

          try {
            await supabase.from('returns').update(returnPayload).or(`return_number.eq.${id},id.eq.${id}`);
          } catch (rErr) {
            console.warn('[toggle-post] returns table notice:', rErr);
          }

          processedResults.push({ id, success: true, details: { posted, status: documentStatus } });
        } catch (err: any) {
          console.error(`[toggle-post] Return error for ${id}:`, err);
          processedResults.push({ id, success: false, details: err?.message });
        }
      }
    }

    // =========================================================================
    // 5. ACCOUNTING VOUCHERS
    // =========================================================================
    else if (documentType === 'VOUCHER') {
      for (const id of ids) {
        try {
          const voucherPayload: Record<string, any> = {
            is_posted: posted,
            status: posted ? 'POSTED' : 'DRAFT',
            updated_at: now,
          };
          if (posted) voucherPayload.posted_at = postedAt;
          else voucherPayload.unposted_at = unpostedAt;

          await supabase.from('acc_journal_vouchers').update(voucherPayload).or(`voucher_number.eq.${id},id.eq.${id}`);
          processedResults.push({ id, success: true, details: { posted, status: documentStatus } });
        } catch (err: any) {
          console.error(`[toggle-post] Voucher error for ${id}:`, err);
          processedResults.push({ id, success: false, details: err?.message });
        }
      }
    }

    const allSuccessful = processedResults.every((r) => r.success);

    return NextResponse.json({
      success: allSuccessful,
      documentType,
      posted,
      status: documentStatus,
      timestamp: now,
      results: processedResults,
      count: processedResults.length,
    });
  } catch (err: any) {
    console.error('[toggle-post] Global exception:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
