'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Clock, Sparkles, ChevronDown, ChevronRight, Folder, ArrowUpRight } from 'lucide-react';
import { ReportCategoryGroup, ReportCategoryItem, ReportCategorySubGroup } from './ReportPageLayout';

export interface ReportSidebarNavProps {
  moduleKey?: string; // e.g. 'sales', 'operations', 'loyalty', 'accounting'
  storageKeyOverride?: string;
  categories?: ReportCategoryGroup[];
  activeReport?: string;
  onSelectReport?: (reportName: string) => void;
  className?: string;
  searchPlaceholder?: string;
}

/**
 * Authentic Omega 2-Column Report Navigation Tree
 * Features:
 * - Dynamic "Recently Viewed" history tracked via localStorage under vanguard_recent_reports_sales or vanguard_recent_reports_inventory (max 5 items, deduplicated).
 * - Multi-level hierarchy support: handles both flat categories and nested sub-groups verbatim.
 * - SSR hydration-safe execution.
 * - Subtle "No recent reports" placeholder when history is empty.
 * - Soft blue pill highlight on active report (bg-blue-50 text-blue-700 font-semibold px-3 py-1.5 rounded-lg).
 * - Cross-module programmatic link support (e.g. Sales Reports -> /sales-control/reports).
 * - Real-time search filter and collapsible accordion parent/child categories.
 */
export default function ReportSidebarNav({
  moduleKey = 'general',
  storageKeyOverride,
  categories = [],
  activeReport = '',
  onSelectReport,
  className = '',
  searchPlaceholder = 'Search reports...',
}: ReportSidebarNavProps) {
  const router = useRouter();

  // Determine localStorage key (vanguard_recent_reports_sales for Sales, vanguard_recent_reports_inventory for Operations/Inventory)
  const storageKey =
    storageKeyOverride ||
    (moduleKey === 'sales'
      ? 'vanguard_recent_reports_sales'
      : moduleKey === 'operations' || moduleKey === 'inventory'
      ? 'vanguard_recent_reports_inventory'
      : `vanguard_recent_reports_${moduleKey}`);

  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [collapsedSubGroups, setCollapsedSubGroups] = useState<Record<string, boolean>>({});
  const [recentReports, setRecentReports] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Hydration-safe localStorage reading
  useEffect(() => {
    setIsMounted(true);
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setRecentReports(parsed.slice(0, 5));
          }
        }
      }
    } catch (err) {
      console.warn(`[ReportSidebarNav] Error reading ${storageKey}:`, err);
    }
  }, [storageKey]);

  // Handle report item click: update active view & refresh recent history
  const handleReportClick = (reportName: string) => {
    React.startTransition(() => {
      if (onSelectReport) {
        onSelectReport(reportName);
      }
    });

    setRecentReports((prev) => {
      // Filter out duplicate, push to top, limit strictly to last 5
      const updated = [reportName, ...prev.filter((r) => r !== reportName)].slice(0, 5);
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          try {
            localStorage.setItem(storageKey, JSON.stringify(updated));
          } catch (err) {
            console.warn(`[ReportSidebarNav] Error writing ${storageKey}:`, err);
          }
        }, 0);
      }
      return updated;
    });
  };

  const toggleGroup = (title: string) => {
    React.startTransition(() => {
      setCollapsedGroups((prev) => ({
        ...prev,
        [title]: !prev[title],
      }));
    });
  };

  const toggleSubGroup = (key: string) => {
    React.startTransition(() => {
      setCollapsedSubGroups((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    });
  };

  // Filter out any hardcoded "Recently Viewed" from passed categories to prevent duplicates
  const nonRecentCategories = useMemo(() => {
    return categories.filter(
      (g) => g.title.trim().toLowerCase() !== 'recently viewed'
    );
  }, [categories]);

  // Filter items in Recently Viewed based on current search query
  const filteredRecentItems = useMemo(() => {
    if (!searchQuery) return recentReports;
    return recentReports.filter((item) =>
      item.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [recentReports, searchQuery]);

  return (
    <aside
      className={`w-72 shrink-0 bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3 print:hidden select-none ${className}`}
    >
      {/* Top Search Reports Card Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
          Search Reports
        </span>
        {isMounted && recentReports.length > 0 && (
          <span className="text-[10px] text-slate-400 font-mono">
            {recentReports.length} recent
          </span>
        )}
      </div>

      {/* Dedicated Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 px-3 pl-8 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all shadow-2xs"
        />
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
      </div>

      {/* Report Tree Navigation Corridor */}
      <div className="space-y-1.5 max-h-[calc(100vh-270px)] overflow-y-auto custom-scrollbar pr-1 pt-1">
        {/* =================================================================
            1. DYNAMIC "RECENTLY VIEWED" GROUP (Always on top above categories)
            ================================================================= */}
        {(!searchQuery || filteredRecentItems.length > 0) && (
          <div className="border-b border-slate-100 pb-2 mb-1">
            <button
              type="button"
              onClick={() => toggleGroup('Recently Viewed')}
              className="w-full flex items-center justify-between py-1 px-1 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600 group-hover:scale-105 transition-transform" />
                <span>Recently Viewed</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
                  collapsedGroups['Recently Viewed'] ? '-rotate-90' : ''
                }`}
              />
            </button>

            {!collapsedGroups['Recently Viewed'] && (
              <div className="space-y-0.5 mt-1">
                {/* SSR Guard / Empty State */}
                {!isMounted || recentReports.length === 0 ? (
                  <div className="px-3 py-1.5 text-xs italic text-slate-400 select-none bg-slate-50/50 rounded-lg">
                    No recent reports
                  </div>
                ) : filteredRecentItems.length === 0 && searchQuery ? (
                  <div className="px-3 py-1.5 text-[11px] italic text-slate-400 select-none">
                    No matching recent reports
                  </div>
                ) : (
                  filteredRecentItems.map((name) => {
                    const isSelected = activeReport === name;
                    return (
                      <button
                        key={`recent-${name}`}
                        type="button"
                        onClick={() => handleReportClick(name)}
                        className={`w-full text-left text-xs transition-colors rounded-lg px-3 py-1.5 font-medium cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-blue-50 text-blue-700 font-semibold'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span className="truncate">{name}</span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 ml-1.5" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}

        {/* =================================================================
            2. CATEGORIES & SUB-SECTIONS (Match 1:1 authentic Omega hierarchy)
            ================================================================= */}
        {nonRecentCategories.map((group) => {
          const isCollapsed = !!collapsedGroups[group.title];

          // Check if flat items match search
          const directItems = group.items || [];
          const matchingDirectItems = directItems.filter((item) => {
            const name = typeof item === 'string' ? item : item.name;
            return name.toLowerCase().includes(searchQuery.toLowerCase());
          });

          // Check if subGroup items match search
          const subGroups = group.subGroups || [];
          const filteredSubGroups = subGroups.map((sub) => {
            const matchingSubItems = sub.items.filter((item) => {
              const name = typeof item === 'string' ? item : item.name;
              return name.toLowerCase().includes(searchQuery.toLowerCase());
            });
            return {
              ...sub,
              items: matchingSubItems,
            };
          }).filter((sub) => !searchQuery || sub.items.length > 0);

          const hasMatches =
            matchingDirectItems.length > 0 || filteredSubGroups.length > 0;

          if (searchQuery && !hasMatches) return null;

          const isRecommended = group.title.trim().toLowerCase() === 'recommended';

          return (
            <div key={group.title} className="border-b border-slate-100 pb-2 mb-1 last:border-b-0">
              {/* Category Header */}
              <button
                type="button"
                onClick={() => toggleGroup(group.title)}
                className="w-full flex items-center justify-between py-1 px-1 text-xs font-bold text-slate-800 hover:text-slate-950 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-1.5">
                  {isRecommended ? (
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 group-hover:rotate-12 transition-transform" />
                  ) : (
                    <Folder className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-600 transition-colors" />
                  )}
                  <span>{group.title}</span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
                    isCollapsed ? '-rotate-90' : ''
                  }`}
                />
              </button>

              {/* Category Content */}
              {!isCollapsed && (
                <div className="space-y-1 mt-1 pl-1">
                  {/* A. Flat items under Category */}
                  {matchingDirectItems.map((item, idx) => {
                    const name = typeof item === 'string' ? item : item.name;
                    const isSelected = activeReport === name;
                    const isLink =
                      (typeof item !== 'string' && (!!item.href || item.isExternalLink)) ||
                      name === 'Sales Reports';
                    const linkHref =
                      typeof item !== 'string' && item.href
                        ? item.href
                        : name === 'Sales Reports'
                        ? '/sales-control/reports'
                        : undefined;
                    const itemKey = `flat-${group.title}-${name}-${idx}`;

                    if (isLink) {
                      return (
                        <button
                          key={itemKey}
                          type="button"
                          onClick={() => {
                            if (linkHref) {
                              router.push(linkHref);
                            }
                          }}
                          className="w-full text-left text-xs rounded-lg px-3 py-1.5 underline font-medium text-slate-700 hover:text-blue-600 cursor-pointer flex items-center justify-between group transition-colors"
                        >
                          <span className="truncate flex items-center gap-1.5">
                            {name}
                            <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
                          </span>
                        </button>
                      );
                    }

                    return (
                      <button
                        key={itemKey}
                        type="button"
                        onClick={() => handleReportClick(name)}
                        className={`w-full text-left text-xs transition-colors rounded-lg px-3 py-1.5 font-medium cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-blue-50 text-blue-700 font-semibold'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span className="truncate">{name}</span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 ml-1.5" />
                        )}
                      </button>
                    );
                  })}

                  {/* B. SubGroups under Category */}
                  {filteredSubGroups.map((sub, sIdx) => {
                    const subGroupKey = `${group.title}__${sub.title}__${sIdx}`;
                    const containsActive = sub.items.some((item) => {
                      const name = typeof item === 'string' ? item : item.name;
                      return name === activeReport;
                    });
                    const isSubCollapsed =
                      collapsedSubGroups[subGroupKey] !== undefined
                        ? collapsedSubGroups[subGroupKey]
                        : (!containsActive && !searchQuery);

                    return (
                      <div key={subGroupKey} className="pt-0.5 pb-1 border-l-2 border-slate-100 pl-2 ml-1 space-y-0.5">
                        {/* SubGroup Header */}
                        <button
                          type="button"
                          onClick={() =>
                            setCollapsedSubGroups((prev) => ({
                              ...prev,
                              [subGroupKey]: !isSubCollapsed,
                            }))
                          }
                          className="w-full flex items-center justify-between py-1 px-1 text-[11.5px] font-semibold text-slate-700 hover:text-blue-700 transition-colors cursor-pointer"
                        >
                          <span className="truncate">{sub.title}</span>
                          <ChevronDown
                            className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${
                              isSubCollapsed ? '-rotate-90' : ''
                            }`}
                          />
                        </button>

                        {/* SubGroup Leaf Items */}
                        {!isSubCollapsed && (
                          <div className="space-y-0.5 pl-1">
                            {sub.items.map((item, iIdx) => {
                              const name = typeof item === 'string' ? item : item.name;
                              const isSelected = activeReport === name;
                              const isLink =
                                (typeof item !== 'string' && (!!item.href || item.isExternalLink)) ||
                                name === 'Sales Reports';
                              const linkHref =
                                typeof item !== 'string' && item.href
                                  ? item.href
                                  : name === 'Sales Reports'
                                  ? '/sales-control/reports'
                                  : undefined;
                              const subItemKey = `sub-${subGroupKey}-${name}-${iIdx}`;

                              if (isLink) {
                                return (
                                  <button
                                    key={subItemKey}
                                    type="button"
                                    onClick={() => {
                                      if (linkHref) {
                                        router.push(linkHref);
                                      }
                                    }}
                                    className="w-full text-left text-xs rounded-lg px-3 py-1.5 underline font-medium text-slate-700 hover:text-blue-600 cursor-pointer flex items-center justify-between group transition-colors"
                                  >
                                    <span className="truncate flex items-center gap-1.5">
                                      {name}
                                      <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
                                    </span>
                                  </button>
                                );
                              }

                              return (
                                <button
                                  key={subItemKey}
                                  type="button"
                                  onClick={() => handleReportClick(name)}
                                  className={`w-full text-left text-xs transition-colors rounded-lg px-3 py-1.5 font-medium cursor-pointer flex items-center justify-between ${
                                    isSelected
                                      ? 'bg-blue-50 text-blue-700 font-semibold'
                                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                  }`}
                                >
                                  <span className="truncate">{name}</span>
                                  {isSelected && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 ml-1.5" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
