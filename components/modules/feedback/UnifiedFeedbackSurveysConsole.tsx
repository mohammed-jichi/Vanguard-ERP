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
  ListFilter
} from 'lucide-react';

export interface ComplaintTicket {
  id: string;
  customerName: string;
  customerPhone: string;
  category: string;
  source: string;
  branch: string;
  priority: 'HIGH' | 'NORMAL' | 'LOW';
  date: string;
  handledBy: string;
  status: 'RESOLVED' | 'IN_PROGRESS' | 'INVESTIGATING' | 'NEW';
  description: string;
  invoiceNo?: string;
  tableNo?: string;
  guestCount?: number;
  invoiceAmount?: number;
}

const INITIAL_COMPLAINTS: ComplaintTicket[] = [
  {
    id: 'CMP-2026-001',
    customerName: 'Beirut Gourmet Market',
    customerPhone: '+961 1 789 450',
    category: 'Delivery Delay',
    source: 'WhatsApp Care',
    branch: 'Choueifat Main Facility',
    priority: 'HIGH',
    date: '2026-09-15',
    handledBy: 'Lara Khoury',
    status: 'RESOLVED',
    description: 'Order delayed by 45 minutes on Corridor 1 due to coastal highway traffic.',
    invoiceNo: 'INV-102971',
    invoiceAmount: 250.00
  },
  {
    id: 'CMP-2026-002',
    customerName: 'Choueifat Retail Depot',
    customerPhone: '+961 3 451 229',
    category: 'Packaging Seal Check',
    source: 'Portal Ticket',
    branch: 'Choueifat Main Facility',
    priority: 'NORMAL',
    date: '2026-09-14',
    handledBy: 'Sami Nader',
    status: 'IN_PROGRESS',
    description: 'Carton cap seal loose on 5L Extra Virgin Tin shipment.',
    invoiceNo: 'INV-102972',
    invoiceAmount: 120.00
  },
  {
    id: 'CMP-2026-003',
    customerName: 'Verdun Olive Specialty Boutique',
    customerPhone: '+961 3 881 204',
    category: 'Invoice Discrepancy',
    source: 'Email',
    branch: 'Sidon Hub',
    priority: 'NORMAL',
    date: '2026-09-14',
    handledBy: 'Walid Sleiman',
    status: 'RESOLVED',
    description: 'Requested commercial discount adjustment for 24-tin case tier.',
    invoiceNo: 'INV-102974',
    invoiceAmount: 480.00
  },
  {
    id: 'CMP-2026-004',
    customerName: 'Sidon Central Cooperative',
    customerPhone: '+961 7 721 340',
    category: 'Order Volume Mismatch',
    source: 'Phone Call',
    branch: 'Sidon Hub',
    priority: 'HIGH',
    date: '2026-09-13',
    handledBy: 'Lara Khoury',
    status: 'INVESTIGATING',
    description: 'Quantity delivered was 50 units, expected 60 units.',
    invoiceNo: 'INV-102975',
    invoiceAmount: 1800.00
  }
];

export interface SurveySubmission {
  id: string;
  surveyTitle: string;
  customerName: string;
  customerPhone: string;
  country: string;
  rating: number;
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
    date: '2026-09-15',
    status: 'OPENED',
    feedbackNotes: 'Rapid resolution of commercial quotation request.'
  }
];

export default function UnifiedFeedbackSurveysConsole() {
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
  const [selectedTicket, setSelectedTicket] = useState<ComplaintTicket | null>(null);

  // New Complaint Form
  const [addComplaintForm, setAddComplaintForm] = useState({
    branch: 'Choueifat Main Facility',
    customerName: '',
    customerPhone: '',
    source: 'WhatsApp Care',
    category: 'Delivery Delay',
    description: '',
    invoiceNumber: '',
    tableNumber: '',
    guestNumber: '',
    invoiceAmount: ''
  });

  // Filtered Complaints
  const filteredComplaints = useMemo(() => {
    return INITIAL_COMPLAINTS.filter(c => {
      const matchSearch =
        c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchTab = true;
      if (complaintTabFilter === 'NEW') matchTab = c.status === 'NEW';
      if (complaintTabFilter === 'PRIORITY') matchTab = c.priority === 'HIGH';
      if (complaintTabFilter === 'OPENED') matchTab = c.status === 'IN_PROGRESS' || c.status === 'INVESTIGATING';
      if (complaintTabFilter === 'CLOSED') matchTab = c.status === 'RESOLVED';

      return matchSearch && matchTab;
    });
  }, [searchQuery, complaintTabFilter]);

  return (
    <div className="space-y-4 font-sans text-slate-800">
      {/* 1. TOP HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-primary text-primary-foreground">
              MODULE 4 • FEEDBACK &amp; SURVEYS
            </span>
            <span className="text-xs font-mono text-slate-500 font-bold">
              SECTION: {activeSection.toUpperCase().replace(/_/g, ' ')}
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1">
            {activeSection === 'dashboard' && 'Customer Satisfaction & Complaint Telemetry'}
            {activeSection === 'manage_complaints' && 'Manage Customer Complaints & SLA Tracker'}
            {activeSection === 'add_complaints' && 'Log New Customer Complaint Ticket'}
            {activeSection === 'manage_surveys' && 'Manage Surveys & Quality Feedback Audits'}
            {activeSection === 'send_survey_emails' && 'Survey Campaign Email & Automation Dispatcher'}
            {activeSection === 'complaint_sources' && 'Setup: Complaint Intake Sources'}
            {activeSection === 'complaint_categories' && 'Setup: Complaint Categories & SLA Tiers'}
            {activeSection === 'complaint_action_types' && 'Setup: Resolution Action Types'}
            {activeSection === 'customer_care' && 'Setup: Customer Care Desk Routing'}
            {activeSection === 'surveys_setup' && 'Setup: Multi-Language Survey Builder'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 transition"
            title="Print View"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. DASHBOARD VIEW */}
      {activeSection === 'dashboard' && (
        <div className="space-y-4">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">CSAT Score</span>
                <Star className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-2xl font-black text-slate-900 mt-2 block">94.6%</span>
              <span className="text-xs text-emerald-600 font-semibold mt-0.5 block">+2.4% vs last month</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Open Complaints</span>
                <AlertTriangle className="w-5 h-5 text-rose-500" />
              </div>
              <span className="text-2xl font-black text-rose-600 mt-2 block">4 Active</span>
              <span className="text-xs text-slate-500 font-semibold mt-0.5 block">Avg SLA: 3.2 Hours</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Surveys Completed</span>
                <ClipboardList className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-2xl font-black text-slate-900 mt-2 block">482 MTD</span>
              <span className="text-xs text-blue-600 font-semibold mt-0.5 block">72% completion rate</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Care Desk SLA</span>
                <Headphones className="w-5 h-5 text-emerald-500" />
              </div>
              <span className="text-2xl font-black text-emerald-700 mt-2 block">98.1%</span>
              <span className="text-xs text-slate-500 font-semibold mt-0.5 block">First touch &lt; 15 mins</span>
            </div>
          </div>

          {/* Quick Stream Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
            <h2 className="font-bold text-sm text-slate-900 mb-3">Recent Customer Satisfaction Feedback Stream</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Survey Title</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Rating</th>
                    <th className="py-2.5 px-3">Feedback Summary</th>
                    <th className="py-2.5 px-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {INITIAL_SURVEYS.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{s.surveyTitle}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-700">{s.customerName}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 w-max">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>{s.rating}</span>
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
          {/* Sub tabs & Search Bar matching Omega */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-2">
              {(['ALL', 'NEW', 'PRIORITY', 'OPENED', 'CLOSED'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setComplaintTabFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    complaintTabFilter === tab
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tab === 'ALL' && 'All Complaints'}
                  {tab === 'NEW' && 'New Complaints'}
                  {tab === 'PRIORITY' && 'Priority (High)'}
                  {tab === 'OPENED' && 'Opened / In Progress'}
                  {tab === 'CLOSED' && 'Closed / Resolved'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter complaints by ticket ID, customer name, phone, or issue description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <button
                onClick={() => setSearchQuery('')}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3.5">Ticket ID</th>
                    <th className="py-3 px-3.5">Customer Account</th>
                    <th className="py-3 px-3.5">Category</th>
                    <th className="py-3 px-3.5">Source Channel</th>
                    <th className="py-3 px-3.5 text-center">Priority</th>
                    <th className="py-3 px-3.5">Handled By</th>
                    <th className="py-3 px-3.5">Date Logged</th>
                    <th className="py-3 px-3.5 text-center">Status</th>
                    <th className="py-3 px-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredComplaints.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3.5 font-bold text-primary">{c.id}</td>
                      <td className="py-3 px-3.5 font-sans font-bold text-slate-900">{c.customerName}</td>
                      <td className="py-3 px-3.5 font-sans text-slate-700">{c.category}</td>
                      <td className="py-3 px-3.5 font-sans text-slate-600">{c.source}</td>
                      <td className="py-3 px-3.5 text-center font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.priority === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {c.priority}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 font-sans text-slate-700">{c.handledBy}</td>
                      <td className="py-3 px-3.5 text-slate-500 font-sans">{c.date}</td>
                      <td className="py-3 px-3.5 text-center font-sans">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          c.status === 'RESOLVED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-center font-sans">
                        <button
                          onClick={() => setSelectedTicket(c)}
                          className="px-2.5 py-1 bg-primary text-primary-foreground rounded text-[10px] font-bold hover:bg-primary/90"
                        >
                          View &amp; Resolve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. ADD COMPLAINTS */}
      {activeSection === 'add_complaints' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs max-w-2xl space-y-4">
          <h2 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
            Log New Customer Complaint Ticket
          </h2>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Branch Facility *</label>
              <input
                type="text"
                value={addComplaintForm.branch}
                onChange={(e) => setAddComplaintForm({ ...addComplaintForm, branch: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg font-semibold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Customer Phone Number *</label>
              <input
                type="text"
                placeholder="+961 3 123 456"
                value={addComplaintForm.customerPhone}
                onChange={(e) => setAddComplaintForm({ ...addComplaintForm, customerPhone: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg font-mono"
              />
            </div>
            <div className="col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Customer Name / Account *</label>
              <input
                type="text"
                placeholder="Customer or Commercial account name"
                value={addComplaintForm.customerName}
                onChange={(e) => setAddComplaintForm({ ...addComplaintForm, customerName: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Complaint Source *</label>
              <select
                value={addComplaintForm.source}
                onChange={(e) => setAddComplaintForm({ ...addComplaintForm, source: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg font-semibold bg-white"
              >
                <option value="WhatsApp Care">WhatsApp Care</option>
                <option value="Portal Ticket">Portal Ticket</option>
                <option value="Phone Call">Phone Call</option>
                <option value="Driver App">Driver App</option>
                <option value="Email">Email</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Complaint Category *</label>
              <select
                value={addComplaintForm.category}
                onChange={(e) => setAddComplaintForm({ ...addComplaintForm, category: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg font-semibold bg-white"
              >
                <option value="Delivery Delay">Delivery Delay</option>
                <option value="Packaging Seal Check">Packaging Seal Check</option>
                <option value="Invoice Discrepancy">Invoice Discrepancy</option>
                <option value="Order Volume Mismatch">Order Volume Mismatch</option>
                <option value="Product Quality">Product Quality</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Detailed Description *</label>
              <textarea
                rows={3}
                placeholder="Specify root cause, customer observations, and batch details..."
                value={addComplaintForm.description}
                onChange={(e) => setAddComplaintForm({ ...addComplaintForm, description: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Invoice Number (Optional)</label>
              <input
                type="text"
                placeholder="INV-102971"
                value={addComplaintForm.invoiceNumber}
                onChange={(e) => setAddComplaintForm({ ...addComplaintForm, invoiceNumber: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Invoice Amount ($)</label>
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
                alert('Complaint ticket successfully created and assigned to Customer Care Desk!');
                setAddComplaintForm({
                  branch: 'Choueifat Main Facility',
                  customerName: '',
                  customerPhone: '',
                  source: 'WhatsApp Care',
                  category: 'Delivery Delay',
                  description: '',
                  invoiceNumber: '',
                  tableNumber: '',
                  guestNumber: '',
                  invoiceAmount: ''
                });
              }}
              className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-bold transition"
            >
              Submit Ticket
            </button>
          </div>
        </div>
      )}

      {/* 5. MANAGE SURVEYS */}
      {activeSection === 'manage_surveys' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Survey Name</th>
                    <th className="py-3 px-4">Customer Account</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Country</th>
                    <th className="py-3 px-4 text-center">Avg Rating</th>
                    <th className="py-3 px-4">Date Submitted</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {INITIAL_SURVEYS.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">{s.surveyTitle}</td>
                      <td className="py-3 px-4 text-slate-700">{s.customerName}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{s.customerPhone}</td>
                      <td className="py-3 px-4 text-slate-600">{s.country}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center gap-1">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>{s.rating}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">{s.date}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {s.status}
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
            Survey Email Campaign &amp; Automation
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Target Survey Campaign *</label>
              <select className="w-full p-2 border border-slate-200 rounded-lg bg-white font-semibold">
                <option>Delivery &amp; Doorstep POD Experience</option>
                <option>Product Taste &amp; Acidity Audit</option>
                <option>Customer Care &amp; SLA Response</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Send Audience *</label>
              <select className="w-full p-2 border border-slate-200 rounded-lg bg-white font-semibold">
                <option>All Commercial Wholesale Accounts</option>
                <option>Key Commercial Accounts Only</option>
                <option>Recent Deliveries (Last 7 Days)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Delivery Trigger</label>
              <select className="w-full p-2 border border-slate-200 rounded-lg bg-white font-semibold">
                <option>Send Immediately</option>
                <option>Send 2 Hours Post Delivery</option>
                <option>Send 1 Day Post Delivery</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input type="checkbox" id="includeSent" className="rounded" />
              <label htmlFor="includeSent" className="font-semibold text-slate-700">
                Include customers who already received survey in last 30 days
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => alert('Survey email dispatch started to 142 recipient accounts!')}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
            >
              Dispatch Emails Now
            </button>
          </div>
        </div>
      )}

      {/* 7. SETUP SUB-SECTIONS */}
      {(activeSection === 'complaint_sources' || activeSection === 'complaint_categories' || activeSection === 'complaint_action_types' || activeSection === 'customer_care' || activeSection === 'surveys_setup') && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-bold text-slate-900 text-sm">
              Feedback Setup Engine • {activeSection.toUpperCase().replace(/_/g, ' ')}
            </h2>
            <button className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-bold shadow-xs transition">
              + New Configuration
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Standard Resolution</span>
              <span className="text-lg font-bold text-slate-900 mt-1 block">24h SLA Target</span>
              <span className="text-[11px] text-slate-500 mt-1 block">Active across all customer care channels</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Escalated Tier</span>
              <span className="text-lg font-bold text-rose-700 mt-1 block">4h Urgent SLA</span>
              <span className="text-[11px] text-slate-500 mt-1 block">Automatic alert to Operations Supervisor</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Customer Desk</span>
              <span className="text-lg font-bold text-emerald-700 mt-1 block">WhatsApp API Desk</span>
              <span className="text-[11px] text-slate-500 mt-1 block">Direct two-way customer resolution</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TICKET DETAIL & ACTION */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">Complaint Ticket Resolution</h3>
                <span className="text-xs font-mono font-bold text-primary">{selectedTicket.id}</span>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-bold text-slate-900">{selectedTicket.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-mono text-slate-700">{selectedTicket.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Issue Category:</span>
                <span className="font-semibold text-slate-800">{selectedTicket.category}</span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-500 block mb-1">Reported Description:</span>
                <p className="text-slate-800 italic bg-white p-2 rounded border border-slate-200">{selectedTicket.description}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-700 block">Resolution Action Type *</label>
              <select className="w-full p-2 border border-slate-200 rounded-lg bg-white font-semibold">
                <option>Care Desk Callback &amp; Clarification</option>
                <option>Product Replacement &amp; Redelivery</option>
                <option>Commercial Credit Note Issued</option>
                <option>Quality Assurance Inspection</option>
              </select>

              <label className="font-bold text-slate-700 block pt-2">Resolution Remarks</label>
              <textarea
                rows={2}
                placeholder="Log internal resolution summary and customer agreement..."
                className="w-full p-2 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert('Ticket marked as RESOLVED and customer notification sent!');
                  setSelectedTicket(null);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
              >
                Resolve &amp; Close Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
