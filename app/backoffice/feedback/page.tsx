'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  MessageSquare,
  AlertTriangle,
  PlusCircle,
  ClipboardList,
  Mail,
  Layers,
  Tag,
  Zap,
  Headphones,
  Sliders,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Star,
  Users
} from 'lucide-react';
import ReportPageLayout, {
  ReportHeader,
  ExportButtons,
  ReportFilters,
  ReportMetricCards,
  ReportTableWrapper,
} from '@/components/reports/ReportPageLayout';

function FeedbackSurveysContent() {
  const searchParams = useSearchParams();
  const activeSection = searchParams.get('section') || 'dashboard';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const metrics = [
    {
      id: 'fb-csat',
      title: 'CSAT Customer Satisfaction',
      value: '94.6%',
      change: { value: '+2.4% vs last mo', trend: 'up' as const },
      subtext: '482 total responses collected',
      icon: <Star className="w-5 h-5 text-amber-500" />
    },
    {
      id: 'fb-complaints',
      title: 'Open Complaints',
      value: '6 Issues',
      change: { value: '4 resolved today', trend: 'up' as const },
      subtext: 'Avg resolution SLA: 3.2 hours',
      icon: <AlertTriangle className="w-5 h-5 text-rose-500" />
    },
    {
      id: 'fb-surveys',
      title: 'Active Surveys',
      value: '3 Live',
      change: { value: '72% completion rate', trend: 'neutral' as const },
      subtext: 'Delivery, Retail, and Quality campaigns',
      icon: <ClipboardList className="w-5 h-5 text-blue-500" />
    },
    {
      id: 'fb-care',
      title: 'Customer Care Reach',
      value: '98.1%',
      change: { value: 'First response < 15m', trend: 'up' as const },
      subtext: 'Dedicated agent desk online',
      icon: <Headphones className="w-5 h-5 text-emerald-500" />
    }
  ];

  const complaintsData = [
    { id: 'CMP-2026-001', customer: 'Beirut Gourmet Market', category: 'Delivery Delay', source: 'WhatsApp Care', priority: 'HIGH', date: '2026-09-15', status: 'RESOLVED', agent: 'Lara Khoury' },
    { id: 'CMP-2026-002', customer: 'Choueifat Retail Depot', category: 'Packaging Seal Check', source: 'Portal Ticket', priority: 'NORMAL', date: '2026-09-14', status: 'IN_PROGRESS', agent: 'Sami Nader' },
    { id: 'CMP-2026-003', customer: 'Verdun Branch #02', category: 'Invoice Discrepancy', source: 'Email', priority: 'NORMAL', date: '2026-09-14', status: 'RESOLVED', agent: 'Walid Sleiman' },
    { id: 'CMP-2026-004', customer: 'Sidon Central Cooperative', category: 'Order Volume Mismatch', source: 'Phone Call', priority: 'HIGH', date: '2026-09-13', status: 'INVESTIGATING', agent: 'Lara Khoury' },
    { id: 'CMP-2026-005', customer: 'Tripoli Olive Wholesale', category: 'Carrier Handover', source: 'Driver App', priority: 'LOW', date: '2026-09-12', status: 'RESOLVED', agent: 'Fadi Abou Assi' },
  ];

  return (
    <ReportPageLayout
      header={
        <ReportHeader
          title="4. Feedback & Surveys Management"
          subtitle="Customer satisfaction telemetry, complaint ticket SLA tracking, and multi-channel survey campaigns"
          breadcrumbs={[
            { label: 'Backoffice', href: '/backoffice' },
            { label: 'Feedback & Surveys' },
            { label: activeSection.replace(/_/g, ' ').toUpperCase() }
          ]}
          reportCode="OM-FB-V1"
          badgeText="VOICE OF CUSTOMER"
          badgeVariant="primary"
          actions={
            <ExportButtons
              onPrint={() => window.print()}
              onExportPdf={() => window.print()}
              onExportCsv={() => alert('Exporting feedback logs to CSV...')}
            />
          }
        />
      }
      metrics={<ReportMetricCards metrics={metrics} />}
      filters={
        <ReportFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search complaints, customer, ticket ID, or agent..."
          onResetFilters={() => { setSearchQuery(''); setStatusFilter('ALL'); }}
        />
      }
      table={
        <ReportTableWrapper
          title="Customer Complaints & Survey Feedback Register"
          subtitle={`Active Section: ${activeSection.replace(/_/g, ' ').toUpperCase()} • Comprehensive SLA audit`}
          totalRecordsCount={complaintsData.length}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Customer Account</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Source Channel</th>
                  <th className="py-3 px-4 text-center">Priority</th>
                  <th className="py-3 px-4">Date Logged</th>
                  <th className="py-3 px-4">Care Agent</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {complaintsData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-bold text-[#195a96]">{row.id}</td>
                    <td className="py-3 px-4 font-sans font-semibold text-slate-900">{row.customer}</td>
                    <td className="py-3 px-4 font-sans text-slate-600">{row.category}</td>
                    <td className="py-3 px-4 font-sans text-slate-600">{row.source}</td>
                    <td className="py-3 px-4 text-center font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.priority === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                        {row.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-sans">{row.date}</td>
                    <td className="py-3 px-4 font-sans text-slate-700">{row.agent}</td>
                    <td className="py-3 px-4 text-center font-sans">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${row.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportTableWrapper>
      }
    />
  );
}

export default function FeedbackSurveysPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading Feedback & Surveys...</div>}>
      <FeedbackSurveysContent />
    </Suspense>
  );
}
