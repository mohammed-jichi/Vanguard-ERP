'use client';

import { useState, useCallback } from 'react';
import { toast } from '@/lib/toast';
import { toggleDocumentPosting, DocumentPostingType, DocumentPostingResult } from '@/lib/dataGateway';

export type { DocumentPostingType, DocumentPostingResult };
export { toggleDocumentPosting };

export interface TogglePostingOptions<T = any> {
  documentType: DocumentPostingType;
  documentId: string;
  targetStatus: boolean; // true = post, false = unpost
  reason?: string;
  tenantId?: string;
  onOptimisticUpdate?: () => void;
  onRollback?: (error: any) => void;
  onSuccess?: (data: any) => void;
  customSuccessMessage?: string;
  customErrorMessage?: string;
}

export interface ToggleBatchPostingOptions<T = any> {
  documentType: DocumentPostingType;
  documentIds: string[];
  targetStatus: boolean;
  reason?: string;
  tenantId?: string;
  onOptimisticUpdate?: () => void;
  onRollback?: (error: any) => void;
  onSuccess?: (data: any) => void;
  customSuccessMessage?: string;
  customErrorMessage?: string;
}

/**
 * Universal Hook for Persistent Document Posting & Unposting across Vanguard ERP
 * Integrates optimistic UI state update with automatic rollback and authoritative database persistence.
 */
export function useDocumentPosting() {
  const [isPosting, setIsPosting] = useState(false);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);

  const togglePosting = useCallback(async <T = any>({
    documentType,
    documentId,
    targetStatus,
    reason,
    tenantId,
    onOptimisticUpdate,
    onRollback,
    onSuccess,
    customSuccessMessage,
    customErrorMessage,
  }: TogglePostingOptions<T>): Promise<DocumentPostingResult> => {
    // 1. Optimistic UI application
    if (onOptimisticUpdate) {
      try {
        onOptimisticUpdate();
      } catch (optErr) {
        console.warn('[useDocumentPosting] Optimistic update callback error:', optErr);
      }
    }

    setIsPosting(true);
    setActiveDocumentId(documentId);

    try {
      const res = await toggleDocumentPosting(documentType, documentId, targetStatus, reason, tenantId);

      if (!res.success) {
        const errorMsg = res.error?.message || res.error || customErrorMessage || `Failed to ${targetStatus ? 'post' : 'unpost'} document.`;
        if (onRollback) onRollback(res.error);
        toast.error(errorMsg);
        return res;
      }

      const defaultMsg = targetStatus
        ? `${documentType} document successfully posted to General Ledger.`
        : `${documentType} document successfully unposted.`;
      toast.success(customSuccessMessage || defaultMsg);

      if (onSuccess) {
        onSuccess(res.data);
      }

      return res;
    } catch (err: any) {
      console.error('[useDocumentPosting] Exception in togglePosting:', err);
      const errorMsg = customErrorMessage || err?.message || 'Network error updating posting status';
      if (onRollback) onRollback(err);
      toast.error(errorMsg);
      return {
        success: false,
        error: { message: errorMsg },
      };
    } finally {
      setIsPosting(false);
      setActiveDocumentId(null);
    }
  }, []);

  const toggleBatchPosting = useCallback(async ({
    documentType,
    documentIds,
    targetStatus,
    reason,
    tenantId,
    onOptimisticUpdate,
    onRollback,
    onSuccess,
    customSuccessMessage,
    customErrorMessage,
  }: ToggleBatchPostingOptions): Promise<DocumentPostingResult> => {
    if (!documentIds || documentIds.length === 0) {
      return { success: true, data: { count: 0 } };
    }

    if (onOptimisticUpdate) {
      try {
        onOptimisticUpdate();
      } catch (optErr) {
        console.warn('[useDocumentPosting] Batch optimistic update error:', optErr);
      }
    }

    setIsPosting(true);

    try {
      const res = await fetch('/api/ledger/toggle-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType,
          documentIds,
          posted: targetStatus,
          reason,
          tenantId,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.success) {
        const errorMsg = json.error || customErrorMessage || `Failed to ${targetStatus ? 'post' : 'unpost'} batch documents.`;
        if (onRollback) onRollback(json.error);
        toast.error(errorMsg);
        return { success: false, error: json.error };
      }

      const defaultMsg = targetStatus
        ? `All ${documentIds.length} ${documentType.toLowerCase()} documents successfully posted to General Ledger.`
        : `All ${documentIds.length} ${documentType.toLowerCase()} documents unposted.`;
      toast.success(customSuccessMessage || defaultMsg);

      if (onSuccess) {
        onSuccess(json);
      }

      return { success: true, data: json };
    } catch (err: any) {
      console.error('[useDocumentPosting] Exception in toggleBatchPosting:', err);
      const errorMsg = customErrorMessage || err?.message || 'Network error updating batch posting status';
      if (onRollback) onRollback(err);
      toast.error(errorMsg);
      return { success: false, error: { message: errorMsg } };
    } finally {
      setIsPosting(false);
    }
  }, []);

  return {
    togglePosting,
    toggleBatchPosting,
    isPosting,
    activeDocumentId,
  };
}
