'use client';

import { useEffect } from 'react';

/**
 * LocalStorageSanitizer
 * Ensures that obsolete mock and cached keys are purged on application initialization,
 * enforcing live Supabase database state across Vanguard ERP.
 */
export function LocalStorageSanitizer() {
  useEffect(() => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.startsWith('vanguard_mock_') ||
            key.startsWith('cached_mock_') ||
            key.startsWith('mock_data_') ||
            key.startsWith('dummy_') ||
            key.startsWith('mock_invoices_') ||
            key.startsWith('sample_'))
        ) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => {
        try {
          localStorage.removeItem(k);
        } catch {}
      });
      if (keysToRemove.length > 0) {
        console.info(`[Vanguard Purge] Cleared ${keysToRemove.length} obsolete mock storage keys.`);
      }
    } catch {
      // Ignore security errors in restricted iframes/browsers
    }
  }, []);

  return null;
}

export default LocalStorageSanitizer;
