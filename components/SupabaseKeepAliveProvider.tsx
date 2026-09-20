'use client';

import React, { useEffect, useRef } from 'react';

/**
 * SupabaseKeepAliveProvider:
 * Runs a lightweight background heartbeat that continuously touches the Supabase
 * Postgres instance and local ERP database while a session is active.
 * Prevents Supabase project auto-pausing or cold-start latency during operational hours.
 */
export function SupabaseKeepAliveProvider({ children }: { children: React.ReactNode }) {
  const hasPinged = useRef(false);

  useEffect(() => {
    const triggerPing = async () => {
      try {
        await fetch('/api/cron/keep-alive', {
          method: 'GET',
          cache: 'no-store'
        });
      } catch (err) {
        // Silently catch background ping network glitches
      }
    };

    // Initial touch on mount
    if (!hasPinged.current) {
      hasPinged.current = true;
      triggerPing();
    }

    // Ping every 5 minutes (300,000 ms)
    const interval = setInterval(triggerPing, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return <>{children}</>;
}

export default SupabaseKeepAliveProvider;
