/**
 * Vanguard ERP - Global Database-First Data Gateway Service
 * Repository-Wide Supabase Persistence & Hydration Contract
 * 
 * Enforces zero client-only silos. Every mutation (Create, Update, Delete, Toggle, Field Edit)
 * must strictly await confirmation from Supabase before committing to local state/caches.
 */

import { getSupabaseServerClient } from './supabaseClient';

export type MutationOperation = 'INSERT' | 'UPDATE' | 'DELETE' | 'UPSERT';

export interface MutationResult<T = any> {
  success: boolean;
  data?: T;
  error?: any;
}

export interface QueryResult<T = any> {
  success: boolean;
  data?: T[];
  error?: any;
  [key: string]: any;
}

export const DATA_GATEWAY_SYNC_EVENT = 'vanguard_data_gateway_sync';

/**
 * Universal entity mutation pipeline
 * 1. Awaits network call to database (via /api/data-gateway in browser, or server client).
 * 2. On DB error: halts immediately, logs details, and returns { success: false, error }.
 * 3. On DB success: emits global sync event and returns authoritative data.
 */
export async function mutateEntity<T = any>(
  table: string,
  operation: MutationOperation,
  data: Partial<T>,
  primaryKey?: { field: string; value: any }
): Promise<MutationResult<T>> {
  const isBrowser = typeof window !== 'undefined';

  try {
    if (isBrowser) {
      const res = await fetch('/api/data-gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table,
          operation,
          data,
          primaryKey,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.success) {
        const errorDetails = json.error || { message: `Mutation failed with HTTP ${res.status}` };
        console.error(`[DataGateway Error] Mutation failed on table "${table}" (${operation}):`, errorDetails);
        return {
          success: false,
          error: errorDetails,
        };
      }

      // Successful mutation: notify global event listeners
      window.dispatchEvent(
        new CustomEvent(DATA_GATEWAY_SYNC_EVENT, {
          detail: {
            table,
            operation,
            data: json.data,
            primaryKey,
            timestamp: new Date().toISOString(),
          },
        })
      );

      return {
        success: true,
        data: json.data as T,
      };
    } else {
      // Server-side execution using Service Role
      const supabaseServer = getSupabaseServerClient();
      const normalizedTable = table.toLowerCase().trim();
      const query = supabaseServer.from(normalizedTable);

      let opResult: any;
      let opError: any;

      if (operation === 'INSERT') {
        const { data: d, error: e } = await query.insert(data as any).select();
        opResult = d;
        opError = e;
      } else if (operation === 'UPDATE') {
        if (!primaryKey?.field) throw new Error('primaryKey is required for server UPDATE');
        const { data: d, error: e } = await query.update(data as any).eq(primaryKey.field, primaryKey.value).select();
        opResult = d;
        opError = e;
      } else if (operation === 'DELETE') {
        if (!primaryKey?.field) throw new Error('primaryKey is required for server DELETE');
        const { data: d, error: e } = await query.delete().eq(primaryKey.field, primaryKey.value).select();
        opResult = d;
        opError = e;
      } else if (operation === 'UPSERT') {
        const onConflict = primaryKey?.field;
        const { data: d, error: e } = await query.upsert(data as any, onConflict ? { onConflict } : undefined).select();
        opResult = d;
        opError = e;
      }

      if (opError) {
        console.error(`[DataGateway Server Error] ${table} (${operation}):`, opError);
        return { success: false, error: opError };
      }

      return { success: true, data: opResult as T };
    }
  } catch (err: any) {
    console.error(`[DataGateway Exception] Table "${table}" (${operation}):`, err);
    return {
      success: false,
      error: { message: err?.message || 'Unexpected DataGateway exception' },
    };
  }
}

/**
 * Universal authoritative query helper
 * Ensures remote Supabase database is authoritative over local cache on page reloads.
 */
export async function queryEntity<T = any>(
  table: string,
  options?: {
    select?: string;
    orderBy?: string;
    ascending?: boolean;
    limit?: number;
  }
): Promise<QueryResult<T>> {
  const isBrowser = typeof window !== 'undefined';

  try {
    if (isBrowser) {
      const params = new URLSearchParams();
      params.set('table', table);
      if (options?.select) params.set('select', options.select);
      if (options?.orderBy) params.set('orderBy', options.orderBy);
      if (options?.ascending !== undefined) params.set('ascending', String(options.ascending));
      if (options?.limit) params.set('limit', String(options.limit));

      const res = await fetch(`/api/data-gateway?${params.toString()}`, {
        method: 'GET',
        cache: 'no-store',
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        return {
          success: false,
          error: json.error || `Query failed with HTTP ${res.status}`,
        };
      }

      return json as QueryResult<T>;
    } else {
      const supabaseServer = getSupabaseServerClient();
      let query = supabaseServer.from(table).select(options?.select || '*');
      if (options?.orderBy) {
        query = query.order(options.orderBy, { ascending: options.ascending ?? true });
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      const { data, error } = await query;
      if (error) return { success: false, error };
      return { success: true, data: (data as any) || [] };
    }
  } catch (err: any) {
    return {
      success: false,
      error: { message: err?.message || 'Query exception' },
    };
  }
}

/**
 * Subscribe to global data gateway mutations across tabs/components
 */
export function subscribeToDataGateway(callback: (event: CustomEvent) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: Event) => callback(e as CustomEvent);
  window.addEventListener(DATA_GATEWAY_SYNC_EVENT, handler);
  return () => window.removeEventListener(DATA_GATEWAY_SYNC_EVENT, handler);
}

export type DocumentPostingType = 'SALES' | 'PURCHASE' | 'TRANSFER' | 'RETURN' | 'VOUCHER';

export interface DocumentPostingResult {
  success: boolean;
  data?: any;
  error?: any;
}

/**
 * Universal toggle for persistent document posting across Vanguard ERP
 */
export async function toggleDocumentPosting(
  type: DocumentPostingType,
  id: string,
  targetStatus: boolean,
  reason?: string,
  tenantId?: string
): Promise<DocumentPostingResult> {
  const isBrowser = typeof window !== 'undefined';
  try {
    if (isBrowser) {
      const res = await fetch('/api/ledger/toggle-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType: type,
          documentId: id,
          posted: targetStatus,
          reason,
          tenantId,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        return {
          success: false,
          error: json.error || { message: `Toggle post failed with HTTP ${res.status}` },
        };
      }

      window.dispatchEvent(
        new CustomEvent(DATA_GATEWAY_SYNC_EVENT, {
          detail: {
            table: `posting_${type.toLowerCase()}`,
            operation: targetStatus ? 'POST' : 'UNPOST',
            data: json,
            primaryKey: { field: 'id', value: id },
            timestamp: new Date().toISOString(),
          },
        })
      );

      return {
        success: true,
        data: json,
      };
    } else {
      const { getSupabaseServerClient } = await import('./supabaseClient');
      const supabaseServer = getSupabaseServerClient();
      const now = new Date().toISOString();
      const postedAt = targetStatus ? now : null;
      const unpostedAt = !targetStatus ? now : null;

      if (type === 'SALES') {
        await supabaseServer.from('sales_invoices').update({
          is_posted: targetStatus,
          status: targetStatus ? 'Posted' : 'Unposted',
          posted_at: postedAt,
          unposted_at: unpostedAt,
        }).or(`invoice_ref.eq.${id},id.eq.${id}`);
      } else if (type === 'PURCHASE') {
        await supabaseServer.from('purchases_invoices').update({
          is_posted: targetStatus,
          posted: targetStatus,
          status: targetStatus ? 'POSTED' : 'UNPOSTED',
          posted_at: postedAt,
          unposted_at: unpostedAt,
        }).or(`invoice_number.eq.${id},id.eq.${id}`);
      } else if (type === 'TRANSFER') {
        await supabaseServer.from('inventory_transfers').update({
          is_posted: targetStatus,
          posted: targetStatus,
          status: targetStatus ? 'POSTED' : 'DRAFT',
          posted_at: postedAt,
          unposted_at: unpostedAt,
        }).or(`req_no.eq.${id},id.eq.${id}`);
      }
      return { success: true, data: { id, targetStatus } };
    }
  } catch (err: any) {
    return {
      success: false,
      error: { message: err?.message || 'Toggle posting network exception' },
    };
  }
}

