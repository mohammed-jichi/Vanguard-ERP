'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  MessageSquare,
  AlertTriangle,
  ClipboardList,
  Mail,
  Send,
  Sliders,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Star,
  Users,
  Plus,
  Printer,
  ChevronRight,
  X,
  Phone,
  Tag,
  Headphones,
  Zap,
  Bookmark,
  ListFilter,
  TrendingUp,
  FileSpreadsheet,
  FileText,
  ShieldAlert,
  ThumbsUp,
  Smile,
  Meh,
  Frown,
  Activity,
  CheckCheck,
  Scale
} from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export interface ComplaintTicket {
  id: string;
  customerName: string;
  customerPhone: string;
  category: string;
  channel: 'WhatsApp' | 'Call' | 'In-Store' | 'Portal' | 'Email';
  branch: string;
  severity: 'CRITICAL' | 'MEDIUM' | 'LOW';
  submissionDate: string;
  assignedRep: string;
  investigationStatus: 'NEW' | 'INVESTIGATING' | 'IN_PROGRESS' | 'RESOLVED';
  description: string;
  invoiceNo?: string;
  invoiceAmount?: number;
  rootCause?: string;
  correctivePlan?: string;
  compensationNotes?: string;
  resolutionType?: string;
}

const INITIAL_COMPLAINTS: ComplaintTicket[] = [
  {
    id: 'CMP-2026-001',
    customerName: 'Beirut Gourmet Market',
    customerPhone: '+961 1 789 450',
    category: 'Delivery Delay',
    channel: 'WhatsApp',
    branch: 'Choueifat Main Facility',
    severity: 'CRITICAL',
    submissionDate: '2026-09-15',
    assignedRep: 'Lara Khoury',
    investigationStatus: 'RESOLVED',
    description: 'Order delayed by 45 minutes on Corridor 1 due to coastal highway logistics block.',
    invoiceNo: 'INV-102971',
    invoiceAmount: 250.00,
    rootCause: 'Fleet delivery van breakdown and heavy coastal expressway checkpoint congestion.',
    correctivePlan: 'Rerouted fleet corridor dispatch and provisioned secondary backup van.',
    compensationNotes: 'Free expedited delivery voucher credited to commercial client ledger.',
    resolutionType: 'Care Desk Callback & Clarification'
  },
  {
    id: 'CMP-2026-002',
    customerName: 'Choueifat Retail Depot',
    customerPhone: '+961 3 451 229',
    category: 'Packaging Seal Check',
    channel: 'Portal',
    branch: 'Choueifat Main Facility',
    severity: 'MEDIUM',
    submissionDate: '2026-09-14',
    assignedRep: 'Sami Nader',
    investigationStatus: 'IN_PROGRESS',
    description: 'Carton cap seal loose on 5L Extra Virgin Tin shipment.',
    invoiceNo: 'INV-102972',
    invoiceAmount: 120.00,
    rootCause: 'Torque calibration variance on line 2 sealing head.',
    correctivePlan: 'Recalibrated packaging station torque sensors.',
    compensationNotes: 'Replacement tin dispatched immediately.',
    resolutionType: 'Product Replacement & Redelivery'
  },
  {
    id: 'CMP-2026-003',
    customerName: 'Verdun Olive Specialty Boutique',
    customerPhone: '+961 3 881 204',
    category: 'Invoice Discrepancy',
    channel: 'Email',
    branch: 'Sidon Hub',
    severity: 'LOW',
    submissionDate: '2026-09-14',
    assignedRep: 'Walid Sleiman',
    investigationStatus: 'RESOLVED',
    description: 'Requested commercial discount adjustment for 24-tin case tier.',
    invoiceNo: 'INV-102974',
    invoiceAmount: 480.00,
    rootCause: 'Promotional loyalty tier rebate rate not updated in sales POS batch.',
    correctivePlan: 'Synced pricing matrix across all terminal workstations.',
    compensationNotes: 'Issued commercial credit note CN-891 for $24.00 difference.',
    resolutionType: 'Commercial Credit Note Issued'
  },
  {
    id: 'CMP-2026-004',
    customerName: 'Sidon Central Cooperative',
    customerPhone: '+961 7 721 340',
    category: 'Order Volume Mismatch',
    channel: 'Call',
    branch: 'Sidon Hub',
    severity: 'CRITICAL',
    submissionDate: '2026-09-13',
    assignedRep: 'Lara Khoury',
    investigationStatus: 'INVESTIGATING',
    description: 'Quantity delivered was 50 units, expected 60 units.',
    invoiceNo: 'INV-102975',
    invoiceAmount: 1800.00,
    rootCause: 'Picker scanning discrepancy at Sidon primary dispatch staging dock.',
    correctivePlan: 'Enforce dual barcode scan verification prior to driver vehicle loading.',
    compensationNotes: 'Immediate secondary dispatch of 10 remaining tins with priority flag.',
    resolutionType: 'Quality Assurance Inspection'
  },
  {
    id: 'CMP-2026-005',
    customerName: 'Phoenicia Luxury Resorts S.A.L',
    customerPhone: '+961 1 369 100',
    category: 'Product Quality',
    channel: 'In-Store',
    branch: 'Beirut Central Hub',
    severity: 'MEDIUM',
    submissionDate: '2026-09-12',
    assignedRep: 'Nour Al-Hajj',
    investigationStatus: 'NEW',
    description: 'Special reserve bottles exhibited minor label adhesive peel under high humidity storage.',
    invoiceNo: 'INV-102980',
    invoiceAmount: 950.00,
    rootCause: 'Adhesive temperature tolerance check pending lab review.',
    correctivePlan: 'Testing upgraded water-resistant glue formulations for hospitality grade bottles.',
    compensationNotes: 'Full case relabeling team dispatched on-site.',
    resolutionType: 'Quality Assurance Inspection'
  }
];

export interface SurveySubmission {
  id: string;
  surveyTitle: string;
  customerName: string;
  customerPhone: string;
  country: string;
  rating: number;
  npsScore: number;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'CRITICAL';
  date: string;
  status: 'NEW' | 'OPENED' | 'DONE';
  feedbackNotes: string;
}

const INITIAL_SURVEYS: SurveySubmission[] = [
  {
    id: 'SRV-881',
    surveyTitle: 'Delivery & Doorstep POD Experience',
    customerName: 'Al-Baraka Supermarket',
    customerPhone: '+961 3 451 229',
    country: 'Lebanon',
    rating: 5,
    npsScore: 10,
    sentiment: 'POSITIVE',
    date: '2026-09-17',
    status: 'DONE',
    feedbackNotes: 'Driver courteous, arrived promptly with cold-chain sealed packages.'
  },
  {
    id: 'SRV-882',
    surveyTitle: 'Product Taste & Acidity Audit',
    customerName: 'Beirut Gourmet Emporium',
    customerPhone: '+961 1 789 450',
    country: 'Lebanon',
    rating: 4.8,
    npsScore: 9,
    sentiment: 'POSITIVE',
    date: '2026-09-16',
    status: 'DONE',
    feedbackNotes: 'Exceptional polyphenol richness in 2026 early-harvest press.'
  },
  {
    id: 'SRV-883',
    surveyTitle: 'Customer Care & SLA Response',
    customerName: 'Tyre Cooperative',
    customerPhone: '+961 7 344 890',
    country: 'Lebanon',
    rating: 4.5,
    npsScore: 8,
    sentiment: 'POSITIVE',
    date: '2026-09-15',
    status: 'OPENED',
    feedbackNotes: 'Rapid resolution of commercial quotation request.'
  },
  {
    id: 'SRV-884',
    surveyTitle: 'Retail Packaging & Seal Integrity',
    customerName: 'Zahle Fine Foods',
    customerPhone: '+961 8 820 114',
    country: 'Lebanon',
    rating: 3.2,
    npsScore: 6,
    sentiment: 'NEUTRAL',
    date: '2026-09-14',
    status: 'OPENED',
    feedbackNotes: 'Outer box showed slight crushing on delivery pallets.'
  },
  {
    id: 'SRV-885',
    surveyTitle: 'Wholesale Pricing & Delivery SLA',
    customerName: 'Tripoli Olive Traders',
    customerPhone: '+961 6 430 552',
    country: 'Lebanon',
    rating: 2.1,
    npsScore: 3,
    sentiment: 'CRITICAL',
    date: '2026-09-13',
    status: 'NEW',
    feedbackNotes: 'Delivery was scheduled for morning but arrived late afternoon.'
  }
];

export default function UnifiedFeedbackSurveysConsole() {
  const { t, dir } = useLanguage();
  const searchParams = useSearchParams();
  const rawSection = searchParams.get('section') || 'dashboard';

  const activeSection = useMemo(() => {
    switch (rawSection.toLowerCase()) {
      case 'manage_complaints': return 'manage_complaints';
      case 'add_complaints': return 'add_complaints';
      case 'manage_surveys': return 'manage_surveys';
      case 'send_survey_emails': return 'send_survey_emails';
      case 'complaint_sources': return 'complaint_sources';
      case 'complaint_categories': return 'complaint_categories';
      case 'complaint_action_types': return 'complaint_action_types';
      case 'customer_care': return 'customer_care';
      case 'surveys_setup': return 'surveys_setup';
      default: return 'dashboard';
    }
  }, [rawSection]);

  const [searchQuery, setSearchQuery] = useState('');
  const [complaintTabFilter, setComplaintTabFilter] = useState<'ALL' | 'NEW' | 'PRIORITY' | 'OPENED' | 'CLOSED'>('ALL');
  const [channelFilter, setChannelFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [selectedTicket, setSelectedTicket] = useState<ComplaintTicket | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Resolution Form in Modal
  const [resolutionActionType, setResolutionActionType] = useState<string>('Care Desk Callback & Clarification');
  const [rootCauseInput, setRootCauseInput] = useState<string>('');
  const [correctivePlanInput, setCorrectivePlanInput] = useState<string>('');
  const [compensationInput, setCompensationInput] = useState<string>('');
  const [resolutionRemarksInput, setResolutionRemarksInput] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Open ticket for resolution
  const handleOpenTicketModal = (ticket: ComplaintTicket) => {
    setSelectedTicket(ticket);
    setResolutionActionType(ticket.resolutionType || 'Care Desk Callback & Clarification');
    setRootCauseInput(ticket.rootCause || '');
    setCorrectivePlanInput(ticket.correctivePlan || '');
    setCompensationInput(ticket.compensationNotes || '');
    setResolutionRemarksInput('');
  };

  // New Complaint Form
  const [addComplaintForm, setAddComplaintForm] = useState({
    branch: 'Choueifat Main Facility',
    customerName: '',
    customerPhone: '',
    channel: 'WhatsApp' as 'WhatsApp' | 'Call' | 'In-Store' | 'Portal' | 'Email',
    category: 'Delivery Delay',
    severity: 'MEDIUM' as 'CRITICAL' | 'MEDIUM' | 'LOW',
    assignedRep: 'Lara Khoury',
    description: '',
    invoiceNumber: '',
    invoiceAmount: '',
    rootCause: '',
    correctivePlan: '',
    compensationNotes: ''
  });

  // Filtered Complaints
  const filteredComplaints = useMemo(() => {
    return INITIAL_COMPLAINTS.filter(c => {
      const matchSearch =
        c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.customerPhone.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchTab = true;
      if (complaintTabFilter === 'NEW') matchTab = c.investigationStatus === 'NEW';
      if (complaintTabFilter === 'PRIORITY') matchTab = c.severity === 'CRITICAL';
      if (complaintTabFilter === 'OPENED') matchTab = c.investigationStatus === 'IN_PROGRESS' || c.investigationStatus === 'INVESTIGATING';
      if (complaintTabFilter === 'CLOSED') matchTab = c.investigationStatus === 'RESOLVED';

      let matchChannel = true;
      if (channelFilter !== 'ALL') matchChannel = c.channel === channelFilter;

      let matchSeverity = true;
      if (severityFilter !== 'ALL') matchSeverity = c.severity === severityFilter;

      return matchSearch && matchTab && matchChannel && matchSeverity;
    });
  }, [searchQuery, complaintTabFilter, channelFilter, severityFilter]);

  // Export functions
  const handleExportPDF = () => {
    showToast(t('surveys_pdf_exported_toast', 'Customer Survey & NPS Report PDF generated successfully.'));
  };

  const handleExportExcel = () => {
    showToast(t('surveys_excel_exported_toast', 'Customer Survey & NPS Telemetry Excel workbook exported.'));
  };

  return (
    <div dir={dir} className="space-y-4 font-sans text-slate-800 text-left rtl:text-right">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-slideUp text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. TOP HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-primary text-primary-foreground">
              {t('module_5_feedback_surveys', 'MODULE 5 • FEEDBACK & SURVEYS (الشكاوى والاستطلاعات)')}
            </span>
            <span className="text-xs font-mono text-slate-500 font-bold">
              {t('section_colon', 'SECTION:')} {activeSection.toUpperCase().replace(/_/g, ' ')}
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1">
            {activeSection === 'dashboard' && t('csat_complaints_telemetry_title', 'Customer Satisfaction & Complaint Telemetry')}
            {activeSection === 'manage_complaints' && t('manage_complaints_sla_title', 'Manage Customer Complaints & SLA Tracker')}
            {activeSection === 'add_complaints' && t('log_new_complaint_ticket_title', 'Log New Customer Complaint Ticket')}
            {activeSection === 'manage_surveys' && t('manage_surveys_nps_title', 'Manage Surveys & NPS Quality Audits')}
            {activeSection === 'send_survey_emails' && t('survey_campaign_automation_title', 'Survey Campaign Email & Automation Dispatcher')}
            {activeSection === 'complaint_sources' && t('setup_complaint_sources_title', 'Setup: Complaint Intake Sources')}
            {activeSection === 'complaint_categories' && t('setup_complaint_categories_title', 'Setup: Complaint Categories & SLA Tiers')}
            {activeSection === 'complaint_action_types' && t('setup_resolution_actions_title', 'Setup: Resolution Action Types')}
            {activeSection === 'customer_care' && t('setup_customer_care_routing_title', 'Setup: Customer Care Desk Routing')}
            {activeSection === 'surveys_setup' && t('setup_multilang_survey_builder_title', 'Setup: Multi-Language Survey Builder')}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            title={t('export_pdf', 'Export PDF')}
          >
            <FileText className="w-3.5 h-3.5 text-rose-600" />
            <span>{t('pdf_report', 'PDF Report')}</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            title={t('export_excel', 'Export Excel')}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('excel_workbook', 'Excel')}</span>
          </button>
          <button
            onClick={() => window.print()}
            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-slate-700 transition cursor-pointer"
            title={t('print_view', 'Print View')}
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. DASHBOARD VIEW */}
      {activeSection === 'dashboard' && (
        <div className="space-y-4">
          {/* Metric Cards & NPS Telemetry Gauges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* CSAT Card */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('csat_score', 'CSAT Score')}</span>
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              </div>
              <span className="text-2xl font-black text-slate-900 mt-2 block">94.6%</span>
              <span className="text-xs text-emerald-600 font-semibold mt-0.5 block">{t('csat_increase_note', '+2.4% vs last month')}</span>
            </div>

            {/* NPS Net Promoter Score Gauge */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('nps_gauge_title', 'NPS Score (Net Promoter)')}</span>
                <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-black text-indigo-700">+68</span>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {t('promoters_category', 'Promoters 82%')}
                </span>
              </div>
              <span className="text-xs text-slate-500 font-semibold mt-0.5 block">{t('nps_benchmark_note', 'World Class Hospitality & Retail tier')}</span>
            </div>

            {/* Open Complaints */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('open_complaints', 'Open Complaints')}</span>
                <AlertTriangle className="w-5 h-5 text-rose-500" />
              </div>
              <span className="text-2xl font-black text-rose-600 mt-2 block">4 {t('active_tickets', 'Active')}</span>
              <span className="text-xs text-slate-500 font-semibold mt-0.5 block">{t('avg_sla_hours', 'Avg SLA: 3.2 Hours')}</span>
            </div>

            {/* Care Desk SLA */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('care_desk_sla', 'Care Desk SLA')}</span>
                <Headphones className="w-5 h-5 text-emerald-500" />
              </div>
              <span className="text-2xl font-black text-emerald-700 mt-2 block">98.1%</span>
              <span className="text-xs text-slate-500 font-semibold mt-0.5 block">{t('first_touch_mins', 'First touch < 15 mins')}</span>
            </div>
          </div>

          {/* Quick Stream Table with Sentiment Badges */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <h2 className="font-bold text-sm text-slate-900">{t('recent_feedback_stream_title', 'Recent Customer Satisfaction Feedback Stream')}</h2>
              <span className="text-xs font-bold text-slate-500">{t('showing_live_synced_surveys', 'Live Synced Survey Audits • 2026')}</span>
            </div>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left rtl:text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">{t('survey_title', 'Survey Title')}</th>
                    <th className="py-2.5 px-3">{t('customer_account', 'Customer Account')}</th>
                    <th className="py-2.5 px-3 text-center">{t('rating', 'Rating')}</th>
                    <th className="py-2.5 px-3 text-center">{t('sentiment_badge', 'Sentiment')}</th>
                    <th className="py-2.5 px-3">{t('feedback_summary', 'Feedback Summary')}</th>
                    <th className="py-2.5 px-3">{t('date', 'Date')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {INITIAL_SURVEYS.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{s.surveyTitle}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-700">{s.customerName}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>{s.rating}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 ${
                          s.sentiment === 'POSITIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : s.sentiment === 'NEUTRAL'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {s.sentiment === 'POSITIVE' && <Smile className="w-3 h-3 text-emerald-600" />}
                          {s.sentiment === 'NEUTRAL' && <Meh className="w-3 h-3 text-blue-600" />}
                          {s.sentiment === 'CRITICAL' && <Frown className="w-3 h-3 text-rose-600" />}
                          <span>
                            {s.sentiment === 'POSITIVE' && t('sentiment_positive', 'Positive')}
                            {s.sentiment === 'NEUTRAL' && t('sentiment_neutral', 'Neutral')}
                            {s.sentiment === 'CRITICAL' && t('sentiment_critical', 'Critical')}
                          </span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 truncate max-w-[280px]">{s.feedbackNotes}</td>
                      <td className="py-2.5 px-3 text-slate-400 font-mono">{s.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. MANAGE COMPLAINTS */}
      {activeSection === 'manage_complaints' && (
        <div className="space-y-4">
          {/* Sub tabs & Search Bar */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-2">
              {(['ALL', 'NEW', 'PRIORITY', 'OPENED', 'CLOSED'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setComplaintTabFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    complaintTabFilter === tab
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tab === 'ALL' && t('all_complaints', 'All Complaints')}
                  {tab === 'NEW' && t('new_complaints', 'New Complaints')}
                  {tab === 'PRIORITY' && t('priority_high_complaints', 'Priority (Critical / High)')}
                  {tab === 'OPENED' && t('opened_in_progress_complaints', 'Opened / In Progress')}
                  {tab === 'CLOSED' && t('closed_resolved_complaints', 'Closed / Resolved')}
                </button>
              ))}
            </div>

            {/* Filter controls row: Search + Channel Filter + Severity Filter */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={t('search_complaints_placeholder', 'Filter complaints by ticket ID, customer name, phone, or issue description...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 rtl:pl-4 rtl:pr-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              {/* Channel Selector */}
              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className="p-1.5 border border-slate-200 rounded-lg text-xs font-bold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer w-full sm:w-auto"
              >
                <option value="ALL">{t('all_channels', 'All Channels')}</option>
                <option value="WhatsApp">{t('channel_whatsapp', 'WhatsApp Care')}</option>
                <option value="Call">{t('channel_call', 'Phone Call')}</option>
                <option value="In-Store">{t('channel_instore', 'In-Store POS')}</option>
                <option value="Portal">{t('channel_portal', 'Online Portal')}</option>
                <option value="Email">{t('channel_email', 'Direct Email')}</option>
              </select>

              {/* Severity Selector */}
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="p-1.5 border border-slate-200 rounded-lg text-xs font-bold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer w-full sm:w-auto"
              >
                <option value="ALL">{t('all_severities', 'All Severities')}</option>
                <option value="CRITICAL">{t('severity_critical', 'Critical')}</option>
                <option value="MEDIUM">{t('severity_medium', 'Medium')}</option>
                <option value="LOW">{t('severity_low', 'Low')}</option>
              </select>

              <button
                onClick={() => {
                  setSearchQuery('');
                  setChannelFilter('ALL');
                  setSeverityFilter('ALL');
                }}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                {t('reset', 'Reset')}
              </button>
            </div>
          </div>

          {/* Complaints Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3.5">{t('ticket_id', 'Ticket ID')}</th>
                    <th className="py-3 px-3.5">{t('submission_date', 'Submission Date')}</th>
                    <th className="py-3 px-3.5">{t('customer_account', 'Customer Account')}</th>
                    <th className="py-3 px-3.5">{t('channel_source', 'Channel')}</th>
                    <th className="py-3 px-3.5 text-center">{t('severity_priority', 'Severity')}</th>
                    <th className="py-3 px-3.5">{t('assigned_rep', 'Assigned Rep')}</th>
                    <th className="py-3 px-3.5 text-center">{t('investigation_status', 'Investigation Status')}</th>
                    <th className="py-3 px-3.5 text-center">{t('action', 'Action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredComplaints.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 font-semibold font-sans">
                        {t('no_complaints_found', 'No complaints found matching current search criteria')}
                      </td>
                    </tr>
                  ) : (
                    filteredComplaints.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-3.5 font-bold text-primary">{c.id}</td>
                        <td className="py-3 px-3.5 text-slate-500 font-sans">{c.submissionDate}</td>
                        <td className="py-3 px-3.5 font-sans font-bold text-slate-900">
                          <div>{c.customerName}</div>
                          <span className="text-[11px] text-slate-400 font-normal">{c.customerPhone}</span>
                        </td>
                        <td className="py-3 px-3.5 font-sans text-slate-700">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 inline-block">
                            {c.channel}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-center font-sans">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.severity === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : c.severity === 'MEDIUM'
                              ? 'bg-amber-100 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {c.severity === 'CRITICAL' && t('severity_critical', 'Critical')}
                            {c.severity === 'MEDIUM' && t('severity_medium', 'Medium')}
                            {c.severity === 'LOW' && t('severity_low', 'Low')}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 font-sans text-slate-700 font-semibold">{c.assignedRep}</td>
                        <td className="py-3 px-3.5 text-center font-sans">
                          <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                            c.investigationStatus === 'RESOLVED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : c.investigationStatus === 'INVESTIGATING'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : c.investigationStatus === 'IN_PROGRESS'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {c.investigationStatus === 'RESOLVED' && t('status_resolved', 'Resolved')}
                            {c.investigationStatus === 'INVESTIGATING' && t('status_investigating', 'Investigating')}
                            {c.investigationStatus === 'IN_PROGRESS' && t('status_in_progress', 'In Progress')}
                            {c.investigationStatus === 'NEW' && t('status_new', 'New')}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-center font-sans">
                          <button
                            onClick={() => handleOpenTicketModal(c)}
                            className="px-2.5 py-1 bg-primary text-primary-foreground rounded text-[10px] font-bold hover:bg-primary/90 transition cursor-pointer"
                          >
                            {t('view_and_resolve', 'View & Resolve')}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. ADD COMPLAINTS */}
      {activeSection === 'add_complaints' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs max-w-3xl space-y-4">
          <h2 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
            {t('log_new_complaint_ticket_title', 'Log New Customer Complaint Ticket')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">{t('branch_facility_req', 'Branch Facility *')}</label>
              <input
                type="text"
                value={addComplaintForm.branch}
                onChange={(e) => setAddComplaintForm({ ...addComplaintForm, branch: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg font-semibold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">{t('customer_phone_req', 'Customer Phone Number *')}</label>
              <input
                type="text"
                placeholder="+961 3 123 456"
                value={addComplaintForm.customerPhone}
                onChange={(e) => setAddComplaintForm({ ...addComplaintForm, customerPhone: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg font-mono"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">{t('customer_name_account_req', 'Customer Name / Commercial Account *')}</label>
              <input
                type="text"
                placeholder={t('customer_name_placeholder', 'Commercial account or contact person name...')}
                value={addComplaintForm.customerName}
                onChange={(e) => setAddComplaintForm({ ...addComplaintForm, customerName: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">{t('channel_source_req', 'Complaint Intake Channel *')}</label>
              <select
                value={addComplaintForm.channel}
                onChange={(e) => setAddComplaintForm({ ...addComplaintForm, channel: e.target.value as any })}
                className="w-full p-2 border border-slate-200 rounded-lg font-semibold bg-white cursor-pointer"
              >
                <option value="WhatsApp">{t('channel_whatsapp', 'WhatsApp Care')}</option>
                <option value="Call">{t('channel_call', 'Phone Call')}</option>
                <option value="In-Store">{t('channel_instore', 'In-Store POS')}</option>
                <option value="Portal">{t('channel_portal', 'Online Portal')}</option>
                <option value="Email">{t('channel_email', 'Direct Email')}</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">{t('severity_req', 'Severity Level *')}</label>
              <select
                value={addComplaintForm.severity}
                onChange={(e) => setAddComplaintForm({ ...addComplaintForm, severity: e.target.value as any })}
                className="w-full p-2 border border-slate-200 rounded-lg font-semibold bg-white cursor-pointer"
              >
                <option value="CRITICAL">{t('severity_critical', 'Critical')}</option>
                <option value="MEDIUM">{t('severity_medium', 'Medium')}</option>
                <option value="LOW">{t('severity_low', 'Low')}</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">{t('complaint_category_req', 'Complaint Category *')}</label>
              <select
                value={addComplaintForm.category}
                onChange={(e) => setAddComplaintForm({ ...addComplaintForm, category: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg font-semibold bg-white cursor-pointer"
              >
                <option value="Delivery Delay">{t('category_delivery_delay', 'Delivery Delay')}</option>
                <option value="Packaging Seal Check">{t('category_packaging_seal', 'Packaging Seal Check')}</option>
                <option value="Invoice Discrepancy">{t('category_invoice_discrepancy', 'Invoice Discrepancy')}</option>
                <option value="Order Volume Mismatch">{t('category_volume_mismatch', 'Order Volume Mismatch')}</option>
                <option value="Product Quality">{t('category_product_quality', 'Product Quality')}</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">{t('assigned_representative', 'Assigned Representative *')}</label>
              <input
                type="text"
                value={addComplaintForm.assignedRep}
                onChange={(e) => setAddComplaintForm({ ...addComplaintForm, assignedRep: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg font-semibold"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">{t('detailed_description_req', 'Detailed Issue Description *')}</label>
              <textarea
                rows={3}
                placeholder={t('description_placeholder', 'Specify root cause, customer observations, and product batch details...')}
                value={addComplaintForm.description}
                onChange={(e) => setAddComplaintForm({ ...addComplaintForm, description: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg"
              />
            </div>

            {/* Root Cause & Corrective Plan in Add Form */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">{t('root_cause_analysis_label', 'Root Cause Analysis')}</label>
              <input
                type="text"
                placeholder={t('root_cause_placeholder', 'e.g. Traffic corridor delay, batch torque variance...')}
                value={addComplaintForm.rootCause}
                onChange={(e) => setAddComplaintForm({ ...addComplaintForm, rootCause: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">{t('corrective_action_plan_label', 'Corrective Action Plan')}</label>
              <input
                type="text"
                placeholder={t('corrective_plan_placeholder', 'Preventive workflow actions...')}
                value={addComplaintForm.correctivePlan}
                onChange={(e) => setAddComplaintForm({ ...addComplaintForm, correctivePlan: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">{t('invoice_number_opt', 'Invoice Number (Optional)')}</label>
              <input
                type="text"
                placeholder="INV-102971"
                value={addComplaintForm.invoiceNumber}
                onChange={(e) => setAddComplaintForm({ ...addComplaintForm, invoiceNumber: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">{t('invoice_amount_usd', 'Invoice Amount ($)')}</label>
              <input
                type="number"
                placeholder="250.00"
                value={addComplaintForm.invoiceAmount}
                onChange={(e) => setAddComplaintForm({ ...addComplaintForm, invoiceAmount: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => {
                showToast(t('complaint_ticket_created_toast', 'Complaint ticket successfully created and assigned to Customer Care Desk!'));
                setAddComplaintForm({
                  branch: 'Choueifat Main Facility',
                  customerName: '',
                  customerPhone: '',
                  channel: 'WhatsApp',
                  category: 'Delivery Delay',
                  severity: 'MEDIUM',
                  assignedRep: 'Lara Khoury',
                  description: '',
                  invoiceNumber: '',
                  invoiceAmount: '',
                  rootCause: '',
                  correctivePlan: '',
                  compensationNotes: ''
                });
              }}
              className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
            >
              {t('submit_ticket', 'Submit Ticket')}
            </button>
          </div>
        </div>
      )}

      {/* 5. MANAGE SURVEYS */}
      {activeSection === 'manage_surveys' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-bold text-sm text-slate-900">{t('surveys_nps_audits_title', 'Customer Surveys & Net Promoter Score (NPS) Telemetry')}</h2>
                <p className="text-xs text-slate-500 font-medium">{t('surveys_telemetry_sub', 'Detailed feedback response audit, sentiment tagging, and customer satisfaction logs')}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportPDF}
                  className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-rose-100 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{t('export_survey_report', 'Export Survey Report PDF')}</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">{t('survey_name', 'Survey Name')}</th>
                    <th className="py-3 px-4">{t('customer_account', 'Customer Account')}</th>
                    <th className="py-3 px-4">{t('phone', 'Phone')}</th>
                    <th className="py-3 px-4">{t('country', 'Country')}</th>
                    <th className="py-3 px-4 text-center">{t('rating', 'Rating')}</th>
                    <th className="py-3 px-4 text-center">{t('nps_score_col', 'NPS Score')}</th>
                    <th className="py-3 px-4 text-center">{t('sentiment_badge', 'Sentiment')}</th>
                    <th className="py-3 px-4">{t('date_submitted', 'Date Submitted')}</th>
                    <th className="py-3 px-4 text-center">{t('status', 'Status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {INITIAL_SURVEYS.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">{s.surveyTitle}</td>
                      <td className="py-3 px-4 text-slate-700 font-semibold">{s.customerName}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{s.customerPhone}</td>
                      <td className="py-3 px-4 text-slate-600">{s.country}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center justify-center gap-1">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>{s.rating}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold font-mono">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          s.npsScore >= 9 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          s.npsScore >= 7 ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {s.npsScore}/10
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 ${
                          s.sentiment === 'POSITIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : s.sentiment === 'NEUTRAL'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {s.sentiment === 'POSITIVE' && t('sentiment_positive', 'Positive')}
                          {s.sentiment === 'NEUTRAL' && t('sentiment_neutral', 'Neutral')}
                          {s.sentiment === 'CRITICAL' && t('sentiment_critical', 'Critical')}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">{s.date}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {s.status === 'DONE' && t('status_done', 'Completed')}
                          {s.status === 'OPENED' && t('status_opened', 'Opened')}
                          {s.status === 'NEW' && t('status_new', 'New')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. SEND SURVEY EMAILS */}
      {activeSection === 'send_survey_emails' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs max-w-xl space-y-4">
          <h2 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
            {t('survey_email_campaign_automation_header', 'Survey Email Campaign & Automation')}
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">{t('target_survey_campaign_req', 'Target Survey Campaign *')}</label>
              <select className="w-full p-2 border border-slate-200 rounded-lg bg-white font-semibold cursor-pointer">
                <option>{t('survey_pod_experience', 'Delivery & Doorstep POD Experience')}</option>
                <option>{t('survey_taste_audit', 'Product Taste & Acidity Audit')}</option>
                <option>{t('survey_care_sla', 'Customer Care & SLA Response')}</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">{t('send_audience_req', 'Send Audience *')}</label>
              <select className="w-full p-2 border border-slate-200 rounded-lg bg-white font-semibold cursor-pointer">
                <option>{t('audience_all_wholesale', 'All Commercial Wholesale Accounts')}</option>
                <option>{t('audience_key_accounts', 'Key Commercial Accounts Only')}</option>
                <option>{t('audience_recent_deliveries', 'Recent Deliveries (Last 7 Days)')}</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">{t('delivery_trigger', 'Delivery Trigger')}</label>
              <select className="w-full p-2 border border-slate-200 rounded-lg bg-white font-semibold cursor-pointer">
                <option>{t('trigger_immediately', 'Send Immediately')}</option>
                <option>{t('trigger_2h_post_delivery', 'Send 2 Hours Post Delivery')}</option>
                <option>{t('trigger_1d_post_delivery', 'Send 1 Day Post Delivery')}</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input type="checkbox" id="includeSent" className="rounded" />
              <label htmlFor="includeSent" className="font-semibold text-slate-700 cursor-pointer">
                {t('include_recent_surveys_checkbox', 'Include customers who already received survey in last 30 days')}
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => showToast(t('survey_dispatched_toast', 'Survey email dispatch started to 142 recipient accounts!'))}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
            >
              {t('dispatch_emails_now', 'Dispatch Emails Now')}
            </button>
          </div>
        </div>
      )}

      {/* 7. SETUP SUB-SECTIONS */}
      {(activeSection === 'complaint_sources' || activeSection === 'complaint_categories' || activeSection === 'complaint_action_types' || activeSection === 'customer_care' || activeSection === 'surveys_setup') && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-bold text-slate-900 text-sm">
              {t('feedback_setup_engine', 'Feedback Setup Engine')} • {activeSection.toUpperCase().replace(/_/g, ' ')}
            </h2>
            <button
              onClick={() => showToast(t('configuration_dialog_opened_toast', 'Configuration registry form opened.'))}
              className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
            >
              {t('new_configuration', '+ New Configuration')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">{t('standard_resolution', 'Standard Resolution')}</span>
              <span className="text-lg font-bold text-slate-900 mt-1 block">{t('target_24h_sla', '24h SLA Target')}</span>
              <span className="text-[11px] text-slate-500 mt-1 block">{t('active_care_channels_desc', 'Active across all customer care channels')}</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">{t('escalated_tier', 'Escalated Tier')}</span>
              <span className="text-lg font-bold text-rose-700 mt-1 block">{t('target_4h_sla', '4h Urgent SLA')}</span>
              <span className="text-[11px] text-slate-500 mt-1 block">{t('ops_alert_desc', 'Automatic alert to Operations Supervisor')}</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">{t('customer_desk', 'Customer Desk')}</span>
              <span className="text-lg font-bold text-emerald-700 mt-1 block">{t('whatsapp_api_desk', 'WhatsApp API Desk')}</span>
              <span className="text-[11px] text-slate-500 mt-1 block">{t('direct_twoway_resolution_desc', 'Direct two-way customer resolution')}</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: COMPLAINT RESOLUTION & ACTIONS (Root cause, corrective plan, compensation) */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">{t('complaint_ticket_resolution_title', 'Complaint Ticket Resolution & Actions')}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-mono font-bold text-primary">{selectedTicket.id}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {t('channel_colon', 'Channel:')} {selectedTicket.channel}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                    {t('severity_colon', 'Severity:')} {selectedTicket.severity}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ticket Info Card */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">{t('customer_account', 'Customer Account')}:</span>
                <span className="font-bold text-slate-900">{selectedTicket.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t('phone', 'Phone')}:</span>
                <span className="font-mono text-slate-700">{selectedTicket.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t('issue_category', 'Issue Category')}:</span>
                <span className="font-semibold text-slate-800">{selectedTicket.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t('submission_date', 'Submission Date')}:</span>
                <span className="font-mono text-slate-700">{selectedTicket.submissionDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t('assigned_rep', 'Assigned Rep')}:</span>
                <span className="font-bold text-slate-800">{selectedTicket.assignedRep}</span>
              </div>
              {selectedTicket.invoiceNo && (
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('invoice_ref_no', 'Invoice Reference #')}:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedTicket.invoiceNo} (${selectedTicket.invoiceAmount?.toFixed(2)})</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-500 block mb-1 font-semibold">{t('reported_issue_desc', 'Reported Customer Description:')}</span>
                <p className="text-slate-800 italic bg-white p-2.5 rounded-lg border border-slate-200">{selectedTicket.description}</p>
              </div>
            </div>

            {/* Resolution & Actions Form */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('resolution_action_type_req', 'Resolution Action Type *')}</label>
                <select
                  value={resolutionActionType}
                  onChange={(e) => setResolutionActionType(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-white font-semibold cursor-pointer"
                >
                  <option value="Care Desk Callback & Clarification">{t('action_callback_clarification', 'Care Desk Callback & Clarification')}</option>
                  <option value="Product Replacement & Redelivery">{t('action_replacement_redelivery', 'Product Replacement & Redelivery')}</option>
                  <option value="Commercial Credit Note Issued">{t('action_credit_note_issued', 'Commercial Credit Note Issued')}</option>
                  <option value="Quality Assurance Inspection">{t('action_qa_inspection', 'Quality Assurance Inspection')}</option>
                </select>
              </div>

              {/* Root Cause Analysis Field */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('root_cause_analysis_req', 'Root Cause Analysis *')}</label>
                <textarea
                  rows={2}
                  value={rootCauseInput}
                  onChange={(e) => setRootCauseInput(e.target.value)}
                  placeholder={t('root_cause_analysis_placeholder', 'Document investigated root cause (e.g. equipment variance, transport delay, staging dock mismatch)...')}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              {/* Corrective Action Plan (CAPA) */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('corrective_action_plan_req', 'Corrective & Preventive Action (CAPA) Plan *')}</label>
                <textarea
                  rows={2}
                  value={correctivePlanInput}
                  onChange={(e) => setCorrectivePlanInput(e.target.value)}
                  placeholder={t('corrective_plan_placeholder_detailed', 'Define operational and quality assurance steps taken to prevent recurrence...')}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              {/* Compensation Notes */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('compensation_notes_label', 'Customer Compensation & Settlement Notes')}</label>
                <input
                  type="text"
                  value={compensationInput}
                  onChange={(e) => setCompensationInput(e.target.value)}
                  placeholder={t('compensation_placeholder', 'e.g. Free delivery coupon, commercial credit note voucher, replacement shipment...')}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              {/* Resolution Remarks */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('final_resolution_remarks', 'Final Resolution Remarks & Client Agreement')}</label>
                <textarea
                  rows={2}
                  value={resolutionRemarksInput}
                  onChange={(e) => setResolutionRemarksInput(e.target.value)}
                  placeholder={t('resolution_remarks_placeholder', 'Log internal resolution summary and customer verbal or written consent...')}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                onClick={() => {
                  showToast(t('ticket_resolved_toast', 'Ticket marked as RESOLVED, CAPA plan registered, and customer notification sent!'));
                  setSelectedTicket(null);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('resolve_and_close_ticket', 'Resolve & Close Ticket')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
