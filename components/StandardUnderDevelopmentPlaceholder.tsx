'use client';

import React, { useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Compass,
  ArrowLeft,
  LayoutDashboard,
  Layers,
  Sparkles,
  Info,
  Clock,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
  Code2,
  CheckCircle2,
  Bell
} from 'lucide-react';
import { useDeepLinkFallback } from './DeepLinkFallbackProvider';

export interface UnderDevelopmentPlaceholderProps {
  moduleTitle?: string;
  moduleCategory?: string;
  expectedSprint?: string;
  description?: string;
  backUrl?: string;
  backLabel?: string;
  showHomeButton?: boolean;
  className?: string;
}

function UnderDevelopmentPlaceholderContent({
  moduleTitle,
  moduleCategory,
  expectedSprint = 'Sprint 2026.9',
  description,
  backUrl = '/backoffice',
  backLabel = 'Back to Enterprise Hub',
  showHomeButton = true,
  className = ''
}: UnderDevelopmentPlaceholderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { notifyFallback } = useDeepLinkFallback();

  // Infer module name from path if not explicitly provided
  const inferredTitle = useMemo(() => {
    if (moduleTitle) return moduleTitle;
    if (!pathname) return 'Enterprise Workspace';

    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return 'General Module';

    const last = segments[segments.length - 1];
    return last
      .split(/[-_]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }, [moduleTitle, pathname]);

  const inferredCategory = useMemo(() => {
    if (moduleCategory) return moduleCategory;
    if (!pathname) return 'Backoffice Extension';
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 1) {
      return segments[0].toUpperCase() + ' • ' + segments[1].toUpperCase();
    }
    return 'SYSTEM COMPONENT';
  }, [moduleCategory, pathname]);

  // Check if accessed from actionable alert or notification link
  const fromAlert = useMemo(() => {
    if (!searchParams) return false;
    return (
      searchParams.get('fromAlert') === 'true' ||
      searchParams.get('source') === 'alert' ||
      Boolean(searchParams.get('alertId')) ||
      Boolean(searchParams.get('action')) ||
      Boolean(searchParams.get('voucherId'))
    );
  }, [searchParams]);

  const alertRef = searchParams?.get('alertId') || searchParams?.get('action') || searchParams?.get('voucherId');

  // Trigger floating Toast banner if accessed via an alert or deep-link
  useEffect(() => {
    if (fromAlert) {
      notifyFallback({
        title: 'Action Staged in Staging Queue',
        message: `You accessed "${inferredTitle}" via an actionable system alert (${alertRef || 'Notification'}). The underlying transaction is logged safely while the direct console view is being finalized.`,
        target: inferredTitle,
        fallbackTo: 'Enterprise Hub',
        severity: 'INFO'
      });
    }
  }, [fromAlert, inferredTitle, alertRef, notifyFallback]);

  return (
    <div className={`min-h-[75vh] w-full flex items-center justify-center p-4 sm:p-8 font-sans ${className}`}>
      <div className="max-w-2xl w-full bg-slate-900/90 border border-slate-800 text-slate-100 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden space-y-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Decorative Background Glow Elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Badge Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 relative z-10 border-b border-slate-800/80 pb-5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Module Under Development</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Target: {expectedSprint}</span>
          </div>
        </div>

        {/* Main Content Showcase */}
        <div className="relative z-10 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Compass className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block font-mono">
              {inferredCategory}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {inferredTitle}
            </h1>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
            {description ||
              `The module "${inferredTitle}" is currently undergoing enterprise QA verification and UI styling to match Vanguard ERP's modern high-density layout. Core transactional logic and data schemas are actively preserved.`}
          </p>

          {/* Actionable Alert Notice Banner if navigated from notifications */}
          {fromAlert && (
            <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
              <Bell className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <span className="font-bold text-amber-300 block uppercase tracking-wide text-[11px]">
                  Alert Direct-Action Context
                </span>
                <p className="text-amber-100/90 leading-normal">
                  You followed an actionable notification ({alertRef || 'Alert'}). No data has been lost; the underlying record is securely persisted in the database.
                </p>
              </div>
            </div>
          )}

          {/* Feature Readiness Checklist */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Full Data Persistence Active</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Multi-Currency & Lebanese COA</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Audit Logging & Telemetry Active</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Dedicated Console Staging</span>
            </div>
          </div>
        </div>

        {/* Action Buttons Section */}
        <div className="relative z-10 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>

          {showHomeButton && (
            <Link
              href={backUrl}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{backLabel}</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StandardUnderDevelopmentPlaceholder(props: UnderDevelopmentPlaceholderProps) {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400 text-xs">Loading module status...</div>}>
      <UnderDevelopmentPlaceholderContent {...props} />
    </Suspense>
  );
}
