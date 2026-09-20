'use client';

/**
 * Vanguard ERP System
 * Super Admin Dedicated Activity & Audit Log Console (/admin/activity)
 * 
 * Server-side paginated activity log showing 20 updates per page with full navigation controls.
 * Adheres to Vanguard's luxury dark/gold aesthetic tokens.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TenantProvider, useTenant } from '@/lib/TenantContext';
import {
  SystemActivity,
  getPaginatedSystemActivities,
  getActionBadgeConfig
} from '@/lib/activityLogger';
import {
  ShieldCheck,
  Crown,
  Clock,
  ArrowRight,
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
  if (!dateString) return 'محدث مؤخراً';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'محدث مؤخراً';
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return 'الآن';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'أمس';
  if (diffDays < 30) return `منذ ${diffDays} يوم`;
  const diffMonths = Math.floor(diffDays / 30);
  return `منذ ${diffMonths} شهر`;
}

function formatFullDate(dateString?: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleString('ar-LB', {
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
        const tenantId = localStorage.getItem('vanguard_tenant_id') || currentTenant?.id || '00000000-0000-0000-0000-000000000001';
        router.replace(`/${tenantId}/dashboard`);
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
    <div dir="rtl" className="max-w-7xl mx-auto space-y-6">

      {/* TOP HEADER & BREADCRUMBS */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b-4 border-amber-500 rounded-2xl p-5 md:p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-slate-950 border-2 border-amber-400 rounded-full flex items-center justify-center shadow-lg shrink-0">
            <Activity className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
              <Link href="/admin" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                <span>لوحة التحكم الرئيسية (/admin)</span>
              </Link>
              <span>/</span>
              <span className="text-amber-300">سجل النشاطات والعمليات الكامل</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
              <Crown className="w-6 h-6 text-amber-400" /> Vanguard System Audit Trail & Activity Log
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1">
              سجل تدقيق سحابي كامل لجميع العمليات، تحديثات التراخيص، تعديل الهوية، وصلاحيات الوحدات
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadActivities(currentPage)}
            disabled={isLoading}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : 'text-amber-400'}`} />
            <span>تحديث السجل</span>
          </button>

          <Link
            href="/admin"
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-transform hover:scale-105"
          >
            <span>العودة للوحة المالك ←</span>
          </Link>
        </div>
      </header>

      {/* AUDIT SUMMARY STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-bold">
        <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-4 shadow-xl text-center space-y-1">
          <span className="text-slate-400 uppercase text-[10px] tracking-wider block">Total Operations Recorded</span>
          <h3 className="text-2xl font-black text-white">{totalCount} سجل موثق</h3>
          <small className="text-emerald-400 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Supabase Audit Active
          </small>
        </div>

        <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-4 shadow-xl text-center space-y-1">
          <span className="text-slate-400 uppercase text-[10px] tracking-wider block">Pagination Window</span>
          <h3 className="text-2xl font-black text-amber-400">20 سجل / صفحة</h3>
          <small className="text-slate-300">
            الصفحة {currentPage} من {totalPages}
          </small>
        </div>

        <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-4 shadow-xl text-center space-y-1">
          <span className="text-slate-400 uppercase text-[10px] tracking-wider block">Audit Retention Policy</span>
          <h3 className="text-2xl font-black text-sky-400">غير محدود (Permanent)</h3>
          <small className="text-emerald-400 flex items-center justify-center gap-1">
            <Database className="w-3 h-3" /> Postgres Write-Ahead
          </small>
        </div>

        <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-4 shadow-xl text-center space-y-1">
          <span className="text-slate-400 uppercase text-[10px] tracking-wider block">Authorized Auditor</span>
          <h3 className="text-2xl font-black text-purple-300">System Owner</h3>
          <small className="text-slate-300">
            Super Admin Access Only
          </small>
        </div>
      </div>

      {/* FILTER BUTTONS & PAGINATION TOP BAR */}
      <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5 font-bold">
          <span className="text-slate-400 pl-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-amber-400" /> تصفية العمليات:
          </span>
          <button
            onClick={() => setSelectedFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl border transition-all ${
              selectedFilter === 'ALL'
                ? 'bg-amber-400 text-slate-950 border-amber-400 font-black'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            الكل ({activities.length})
          </button>
          <button
            onClick={() => setSelectedFilter('MODULES')}
            className={`px-3 py-1.5 rounded-xl border transition-all ${
              selectedFilter === 'MODULES'
                ? 'bg-amber-400 text-slate-950 border-amber-400 font-black'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            تهيئة الوحدات
          </button>
          <button
            onClick={() => setSelectedFilter('BRANDING')}
            className={`px-3 py-1.5 rounded-xl border transition-all ${
              selectedFilter === 'BRANDING'
                ? 'bg-amber-400 text-slate-950 border-amber-400 font-black'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            تحديث الهوية
          </button>
          <button
            onClick={() => setSelectedFilter('TENANT')}
            className={`px-3 py-1.5 rounded-xl border transition-all ${
              selectedFilter === 'TENANT'
                ? 'bg-amber-400 text-slate-950 border-amber-400 font-black'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            تأسيس التراخيص
          </button>
          <button
            onClick={() => setSelectedFilter('WORKSPACE')}
            className={`px-3 py-1.5 rounded-xl border transition-all ${
              selectedFilter === 'WORKSPACE'
                ? 'bg-amber-400 text-slate-950 border-amber-400 font-black'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            معاينة مساحات العمل
          </button>
        </div>

        {/* Top Mini Pagination Indicator */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">
            الصفحة <strong className="text-amber-400">{currentPage}</strong> من <strong className="text-white">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1 || isLoading}
              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              title="الصفحة السابقة"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages || isLoading}
              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              title="الصفحة التالية"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* FULL PAGINATED AUDIT LOG TABLE */}
      <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-950 text-amber-400 font-black border-b border-slate-800">
                <th className="p-3.5">الوقت والتاريخ</th>
                <th className="p-3.5">نوع العملية</th>
                <th className="p-3.5">المعرف والشركة</th>
                <th className="p-3.5">بيان التعديل / تفاصيل النشاط</th>
                <th className="p-3.5">المنفّذ (Performed By)</th>
                <th className="p-3.5 text-left">معرف السجل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-amber-400 font-bold">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    <span>جاري تحميل سجل العمليات من Supabase...</span>
                  </td>
                </tr>
              ) : filteredActivities.length > 0 ? (
                filteredActivities.map((act) => {
                  const badge = getActionBadgeConfig(act.action_type);
                  const compId = act.company_id || act.companyId || (act.tenant_id === '00000000-0000-0000-0000-000000000001' ? 1300 : null);

                  return (
                    <tr key={act.id} className="hover:bg-slate-800/40 text-slate-200 transition-colors">
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>{formatRelativeTime(act.created_at || act.createdAt)}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                          {formatFullDate(act.created_at || act.createdAt)}
                        </span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-lg border shadow-xs ${badge.badgeClass}`}>
                          <span>{badge.icon}</span>
                          <span>{badge.labelAr}</span>
                        </span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        {compId ? (
                          <span className="font-mono text-xs font-black bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded shadow inline-flex items-center gap-1">
                            <Hash className="w-3 h-3 text-slate-950" />
                            <span>{compId}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono text-xs">عام</span>
                        )}
                      </td>

                      <td className="p-3.5 font-bold text-white text-xs leading-relaxed max-w-md">
                        {act.description}
                      </td>

                      <td className="p-3.5 whitespace-nowrap text-slate-300 font-medium">
                        <span className="bg-slate-950 border border-slate-800 px-2 py-0.5 rounded font-mono text-[11px] text-slate-300">
                          {act.performed_by || act.performedBy || 'Super Admin'}
                        </span>
                      </td>

                      <td className="p-3.5 text-left font-mono text-[10px] text-slate-400 whitespace-nowrap">
                        {act.id.substring(0, 14)}...
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 font-medium">
                    لا توجد سجلات تطابق الفلتر المحدد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* BOTTOM PAGINATION CONTROLS BAR */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="text-slate-400 font-bold">
            عرض <strong className="text-amber-400">{filteredActivities.length}</strong> سجل في الصفحة الحالية (إجمالي <strong className="text-white">{totalCount}</strong> عملية مسجلة)
          </div>

          <div className="flex items-center gap-2">
            {/* Previous Page Button */}
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1 || isLoading}
              className="bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-white font-black px-4 py-2 rounded-xl border border-slate-800 transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
              <span>السابق (Previous)</span>
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
                      {hasGap && <span className="text-slate-600 px-1 font-mono">...</span>}
                      <button
                        onClick={() => handleGoToPage(p)}
                        className={`w-8 h-8 rounded-lg font-mono font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                          p === currentPage
                            ? 'bg-amber-400 text-slate-950 font-black shadow-md scale-105'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
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
              className="bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-white font-black px-4 py-2 rounded-xl border border-slate-800 transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>التالي (Next)</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="text-center text-xs text-slate-500 font-bold border-t border-slate-800 pt-4">
        Vanguard Audit Logging Engine © 2026 -- Tamper-Resistant Multi-Tenant System Registry
      </footer>

    </div>
  );
}

export default function AdminActivityPage() {
  return (
    <TenantProvider>
      <main className="min-h-screen bg-slate-950 text-white p-4 md:p-8 font-sans">
        <ActivityConsoleContent />
      </main>
    </TenantProvider>
  );
}
