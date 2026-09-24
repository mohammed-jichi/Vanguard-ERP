'use client';

/**
 * Vanguard ERP System
 * Super Admin Dedicated Activity & Audit Log Console (/admin/activity)
 * 
 * Server-side paginated activity log showing 20 updates per page with full navigation controls.
 * White Enterprise Theme & English Default Localization.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TenantProvider, useTenant } from '@/lib/TenantContext';
import { resolveTenantRouteCode } from '@/lib/authTenantResolver';
import {
  SystemActivity,
  getPaginatedSystemActivities,
  getActionBadgeConfig,
  getActivityDescriptionEn
} from '@/lib/activityLogger';
import {
  ShieldCheck,
  Crown,
  Clock,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Sliders,
  ChevronRight,
  ChevronLeft,
  FileText,
  Activity,
  Hash,
  Database,
  Filter,
  CheckCircle2
} from 'lucide-react';

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Just now';
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mo ago`;
}

function formatFullDate(dateString?: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function ActivityConsoleContent() {
  const router = useRouter();
  const { currentTenant } = useTenant();

  const [activities, setActivities] = useState<SystemActivity[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  const pageSize = 20;

  // Reserve strictly for Super Admins
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('vanguard_user_role');
      if (storedRole && storedRole !== 'SUPER_ADMIN') {
        const rawTenantId = localStorage.getItem('vanguard_tenant_id') || currentTenant?.id || '00000000-0000-0000-0000-000000000001';
        const routeCode = resolveTenantRouteCode(rawTenantId);
        router.replace(`/${routeCode}/dashboard`);
      }
    }
  }, [currentTenant, router]);

  const loadActivities = async (pageToLoad: number) => {
    setIsLoading(true);
    try {
      const result = await getPaginatedSystemActivities(pageToLoad, pageSize);
      setActivities(result.data);
      setTotalPages(result.totalPages);
      setTotalCount(result.totalCount);
      setCurrentPage(result.currentPage);
    } catch (err) {
      console.error('Error loading paginated activities:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Vanguard System Activity & Audit Trail';
    loadActivities(currentPage);
  }, [currentPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleGoToPage = (pg: number) => {
    if (pg >= 1 && pg <= totalPages) {
      setCurrentPage(pg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const filteredActivities = activities.filter(act => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'MODULES') return act.action_type.includes('MODULE');
    if (selectedFilter === 'BRANDING') return act.action_type.includes('BRANDING');
    if (selectedFilter === 'TENANT') return act.action_type.includes('TENANT');
    if (selectedFilter === 'WORKSPACE') return act.action_type.includes('WORKSPACE');
    return true;
  });

  return (
    <div dir="ltr" className="max-w-7xl mx-auto space-y-6 text-slate-900">

      {/* TOP HEADER & BREADCRUMBS */}
      <header className="bg-white border-b-4 border-amber-500 border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-50 border-2 border-amber-400 rounded-2xl flex items-center justify-center shadow-xs shrink-0">
            <Activity className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
              <Link href="/admin" className="hover:text-amber-600 transition-colors flex items-center gap-1">
                <span>Master Admin Console (/admin)</span>
              </Link>
              <span>/</span>
              <span className="text-amber-700 font-semibold">Full Activity & Audit Trail</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
              <Crown className="w-6 h-6 text-amber-500" /> Vanguard System Audit Trail & Activity Log
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Comprehensive tamper-resistant audit trail of tenant operations, license adjustments, branding changes, and module feature flags.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadActivities(currentPage)}
            disabled={isLoading}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-600' : 'text-amber-600'}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/admin"
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-transform hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Admin Console</span>
          </Link>
        </div>
      </header>

      {/* AUDIT SUMMARY STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-bold">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center space-y-1">
          <span className="text-slate-500 uppercase text-[10px] tracking-wider block">Total Operations Recorded</span>
          <h3 className="text-2xl font-black text-slate-900">{totalCount} Events</h3>
          <small className="text-emerald-700 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Supabase Audit Active
          </small>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center space-y-1">
          <span className="text-slate-500 uppercase text-[10px] tracking-wider block">Pagination Window</span>
          <h3 className="text-2xl font-black text-amber-600">20 Events / Page</h3>
          <small className="text-slate-500">
            Page {currentPage} of {totalPages}
          </small>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center space-y-1">
          <span className="text-slate-500 uppercase text-[10px] tracking-wider block">Audit Retention Policy</span>
          <h3 className="text-2xl font-black text-sky-600">Permanent Retention</h3>
          <small className="text-emerald-700 flex items-center justify-center gap-1">
            <Database className="w-3 h-3 text-emerald-600" /> Postgres Write-Ahead
          </small>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center space-y-1">
          <span className="text-slate-500 uppercase text-[10px] tracking-wider block">Authorized Auditor</span>
          <h3 className="text-2xl font-black text-indigo-600">System Owner</h3>
          <small className="text-slate-500">
            Super Admin Access Only
          </small>
        </div>
      </div>

      {/* FILTER BUTTONS & PAGINATION TOP BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5 font-bold">
          <span className="text-slate-500 pr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-amber-600" /> Filter Events:
          </span>
          <button
            onClick={() => setSelectedFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              selectedFilter === 'ALL'
                ? 'bg-amber-500 text-slate-950 border-amber-500 font-black shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            All ({activities.length})
          </button>
          <button
            onClick={() => setSelectedFilter('MODULES')}
            className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              selectedFilter === 'MODULES'
                ? 'bg-amber-500 text-slate-950 border-amber-500 font-black shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Module Config
          </button>
          <button
            onClick={() => setSelectedFilter('BRANDING')}
            className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              selectedFilter === 'BRANDING'
                ? 'bg-amber-500 text-slate-950 border-amber-500 font-black shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Branding
          </button>
          <button
            onClick={() => setSelectedFilter('TENANT')}
            className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              selectedFilter === 'TENANT'
                ? 'bg-amber-500 text-slate-950 border-amber-500 font-black shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Tenant Provisioning
          </button>
          <button
            onClick={() => setSelectedFilter('WORKSPACE')}
            className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              selectedFilter === 'WORKSPACE'
                ? 'bg-amber-500 text-slate-950 border-amber-500 font-black shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Workspace Previews
          </button>
        </div>

        {/* Top Mini Pagination Indicator */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-500">
            Page <strong className="text-amber-700 font-bold">{currentPage}</strong> of <strong className="text-slate-900">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1 || isLoading}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed shadow-xs"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages || isLoading}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed shadow-xs"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* FULL PAGINATED AUDIT LOG TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Action Type</th>
                <th className="p-3.5">Company ID</th>
                <th className="p-3.5">Activity Description & Scope</th>
                <th className="p-3.5">Performed By</th>
                <th className="p-3.5 text-right">Log UUID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-amber-600 font-bold">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    <span>Loading audit records from Supabase...</span>
                  </td>
                </tr>
              ) : filteredActivities.length > 0 ? (
                filteredActivities.map((act) => {
                  const badge = getActionBadgeConfig(act.action_type);
                  const compId = act.company_id || act.companyId || (act.tenant_id === '00000000-0000-0000-0000-000000000001' ? 1300 : null);
                  const descriptionEn = getActivityDescriptionEn(act.description, act.action_type);

                  return (
                    <tr key={act.id} className="hover:bg-slate-50/80 text-slate-700 transition-colors">
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>{formatRelativeTime(act.created_at || act.createdAt)}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                          {formatFullDate(act.created_at || act.createdAt)}
                        </span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border shadow-xs ${badge.badgeClass}`}>
                          <span>{badge.icon}</span>
                          <span>{badge.labelEn}</span>
                        </span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        {compId ? (
                          <span className="font-mono text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded shadow-xs inline-flex items-center gap-1">
                            <Hash className="w-3 h-3 text-amber-700" />
                            <span>{compId}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono text-xs">Global</span>
                        )}
                      </td>

                      <td className="p-3.5 font-semibold text-slate-800 text-xs leading-relaxed max-w-md">
                        {descriptionEn}
                      </td>

                      <td className="p-3.5 whitespace-nowrap text-slate-600 font-medium">
                        <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded font-mono text-[11px] text-slate-700">
                          {act.performed_by || act.performedBy || 'Super Admin'}
                        </span>
                      </td>

                      <td className="p-3.5 text-right font-mono text-[10px] text-slate-400 whitespace-nowrap">
                        {act.id.substring(0, 14)}...
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 font-medium">
                    No activity logs match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* BOTTOM PAGINATION CONTROLS BAR */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="text-slate-500 font-medium">
            Showing <strong className="text-slate-900 font-bold">{filteredActivities.length}</strong> events on this page (out of <strong className="text-slate-900 font-bold">{totalCount}</strong> total events)
          </div>

          <div className="flex items-center gap-2">
            {/* Previous Page Button */}
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1 || isLoading}
              className="bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-bold px-4 py-2 rounded-xl border border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {/* Direct Page Jump Buttons */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                .map((p, idx, arr) => {
                  const prevVal = arr[idx - 1];
                  const hasGap = prevVal && p - prevVal > 1;

                  return (
                    <React.Fragment key={p}>
                      {hasGap && <span className="text-slate-400 px-1 font-mono">...</span>}
                      <button
                        onClick={() => handleGoToPage(p)}
                        className={`w-8 h-8 rounded-lg font-mono font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                          p === currentPage
                            ? 'bg-amber-500 text-slate-950 font-black shadow-xs scale-105'
                            : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                        }`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>

            {/* Next Page Button */}
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages || isLoading}
              className="bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-bold px-4 py-2 rounded-xl border border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shadow-xs"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="text-center text-xs text-slate-400 font-semibold border-t border-slate-200 pt-4">
        Vanguard Audit Logging Engine © 2026 -- Tamper-Resistant Multi-Tenant System Registry
      </footer>

    </div>
  );
}

export default function AdminActivityPage() {
  return (
    <TenantProvider>
      <main className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans">
        <ActivityConsoleContent />
      </main>
    </TenantProvider>
  );
}
