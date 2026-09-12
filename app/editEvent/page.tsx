'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Save,
  ChevronDown,
  Mail,
  Plus,
  Pencil,
  X,
  Info,
  Send,
  Trash2,
  CheckCircle2,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Building,
  ArrowLeft,
  Check,
  Undo,
  Redo,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Indent,
  Outdent
} from 'lucide-react';
import VanguardGlobalHeader from '@/components/VanguardGlobalHeader';
import {
  OmegaEventRecord,
  OmegaEventCustomer,
  OmegaEventResourceItem,
  OmegaEventDriverItem,
  OmegaEventTypeItem,
  OmegaEventVenueItem,
  SEED_EVENT_TYPES,
  SEED_EVENT_VENUES,
  SEED_EVENT_RESOURCES,
  SEED_EMPLOYEES,
  SEED_CUSTOMERS
} from '@/lib/eventsData';
import { EventsService } from '@/lib/eventsService';
import EventVenueModal from '@/components/EventVenueModal';

function EditEventContent() {
  const searchParams = useSearchParams();
  const eventIdParam = searchParams.get('id');

  const [activeScreen, setActiveScreen] = useState('events');
  const [activeTab, setActiveTab] = useState<'info' | 'resources' | 'drivers'>('info');

  // Loaded Event State
  const [eventData, setEventData] = useState<OmegaEventRecord | null>(null);
  const [customer, setCustomer] = useState<OmegaEventCustomer | null>(null);

  // Form Data
  const [formData, setFormData] = useState({
    evnt_id: 1,
    event_name: 'Chami House',
    event_type_id: 1,
    event_date: '2026-09-11',
    event_status: 'pending' as 'pending' | 'confirmed' | 'cancelled',
    event_start_time: '12:00',
    event_end_time: '17:00',
    event_delivery_time: '17:00',
    event_delivery_type: 'pickup' as 'pickup' | 'delivery',
    event_setup_time: '17:00',
    nb_of_guest: 15,
    event_notes: '',
    branchid: 1,
    venue_id: null as number | null
  });

  // Reference Lists
  const [eventTypes, setEventTypes] = useState<OmegaEventTypeItem[]>([...SEED_EVENT_TYPES]);
  const [venuesList, setVenuesList] = useState<OmegaEventVenueItem[]>([...SEED_EVENT_VENUES]);
  const [allResources, setAllResources] = useState<OmegaEventResourceItem[]>([...SEED_EVENT_RESOURCES]);
  const [allEmployees, setAllEmployees] = useState<OmegaEventDriverItem[]>([...SEED_EMPLOYEES]);

  // Assigned items
  const [assignedResources, setAssignedResources] = useState<Array<{ id: number; quantity: number }>>([]);
  const [assignedEmployeeIds, setAssignedEmployeeIds] = useState<number[]>([]);

  // Modals & Dropdowns
  const [actionsDropdownOpen, setActionsDropdownOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [addResourceModalOpen, setAddResourceModalOpen] = useState(false);
  const [addDriverModalOpen, setAddDriverModalOpen] = useState(false);
  const [addTypeModalOpen, setAddTypeModalOpen] = useState(false);
  const [addVenueModalOpen, setAddVenueModalOpen] = useState(false);
  const [editCustomerModalOpen, setEditCustomerModalOpen] = useState(false);

  // New item temp states
  const [newTypeName, setNewTypeName] = useState('');
  const [newVenueName, setNewVenueName] = useState('');
  const [selectedResourceIdToAdd, setSelectedResourceIdToAdd] = useState<number | string>('');
  const [selectedEmployeeIdToAdd, setSelectedEmployeeIdToAdd] = useState<number | string>('');

  // Email Modal Form
  const [emailForm, setEmailForm] = useState({
    customer: 'm.chami@omegapos.com',
    fromEmail: 'info@vanguard-erp.lb',
    bcc: '',
    cc: '',
    subject: 'Chami House',
    message: `Dear Chami,

I hope this message finds you well.

We are pleased to confirm the details of your upcoming event:

Event Name: Chami House`
  });

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load Event
  useEffect(() => {
    const id = eventIdParam || '1';
    const found = EventsService.getEventById(id);
    if (found) {
      setEventData(found);
      setCustomer(found.customer);
      setFormData({
        evnt_id: found.evnt_id,
        event_name: found.event_name,
        event_type_id: Number(found.event_type_id) || 1,
        event_date: found.event_date || '2026-09-11',
        event_status: (found.event_status as any) || 'pending',
        event_start_time: found.event_start_time || '12:00',
        event_end_time: found.event_end_time || '17:00',
        event_delivery_time: found.event_delivery_time || '17:00',
        event_delivery_type: (found.event_delivery_type as any) || 'pickup',
        event_setup_time: found.event_setup_time || '17:00',
        nb_of_guest: found.nb_of_guest || 15,
        event_notes: found.event_notes || '',
        branchid: found.branch_id || 1,
        venue_id: found.venue_id ?? null
      });
      setAssignedResources(found.resource_ids?.map(rId => ({ id: rId, quantity: 1 })) || []);
      setAssignedEmployeeIds(found.employee_ids || []);

      const cEmail = found.customer?.EMAIL || 'm.chami@omegapos.com';
      const cName = found.customer ? (found.customer.FAMILYNAME ? `${found.customer.FAMILYNAME}` : found.customer.NAME) : 'Customer';
      setEmailForm(prev => ({
        ...prev,
        customer: cEmail,
        subject: found.event_name,
        message: `Dear ${cName},

I hope this message finds you well.

We are pleased to confirm the details of your upcoming event:

Event Name: ${found.event_name}`
      }));
    } else {
      // Default to Mohammed Chami & Chami House
      const defaultCustomer = SEED_CUSTOMERS[0];
      setCustomer(defaultCustomer);
    }
  }, [eventIdParam]);

  // Actions Handlers
  const handleOpenEmailModal = () => {
    setEmailModalOpen(true);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailModalOpen(false);
    showToast(`Event confirmation email sent successfully to ${emailForm.customer || 'customer'}!`);
  };

  const handleGoToReceipt = () => {
    const cId = customer?.CUSTOMERID || 9;
    const eId = formData.evnt_id || 1;
    const eName = encodeURIComponent(formData.event_name || 'Chami House');
    if (typeof window !== 'undefined') {
      localStorage.setItem('EVNT_FOR_CustomersRecView', JSON.stringify(eId));
      window.open(`/receipt?customerId=${cId}&eventId=${eId}&eventName=${eName}`, '_blank');
    }
  };

  const handleGoToQuotation = () => {
    const cId = customer?.CUSTOMERID || 9;
    const eId = formData.evnt_id || 1;
    const eName = encodeURIComponent(formData.event_name || 'Chami House');
    if (typeof window !== 'undefined') {
      localStorage.setItem('EVNT_FOR_NEWQUOT', JSON.stringify(eId));
      window.open(`/quotations?customerId=${cId}&eventId=${eId}&eventName=${eName}`, '_blank');
    }
  };

  const handleSaveEvent = () => {
    if (!formData.event_name.trim()) {
      showToast('Event Name is required.');
      return;
    }
    const savePayload = {
      eventForm: {
        ...formData,
        evnt_id: formData.evnt_id
      },
      customer_id: customer?.CUSTOMERID || 9,
      eventDriversForm: { employee_ids: assignedEmployeeIds },
      eventVenueForm: { event_venue_id: formData.venue_id },
      eventResourcesForm: { resource_ids: assignedResources.map(r => r.id) }
    };
    EventsService.saveEvent(savePayload);
    showToast(`Event "${formData.event_name}" updated and saved successfully!`);
  };

  const customerDisplayName = customer
    ? `${customer.NAME} ${customer.FAMILYNAME || ''}`.trim()
    : 'Mohammed Chami';
  const customerIdDisplay = customer?.CUSTOMERID || 9;

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      <VanguardGlobalHeader activeScreen={activeScreen} onSelectScreen={setActiveScreen} />

      {/* Global Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold animate-fade-in border border-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6">
        {/* Top Header Row matching Screenshot 1 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
          {/* Left: Title & Breadcrumbs */}
          <div>
            <h1 className="text-xl font-bold text-slate-800 leading-tight">Edit Events</h1>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 font-normal">
              <Link href="/backoffice/operations?section=dashboard" className="text-[#007bff] hover:underline">
                Home
              </Link>
              <span className="text-slate-400">/</span>
              <Link href="/backoffice/operations?section=events" className="text-[#007bff] hover:underline">
                Events
              </Link>
              <span className="text-slate-400">/</span>
              <span className="text-slate-600 font-medium">Edit Events</span>
            </div>
          </div>

          {/* Center: Event Name - Customer Name with Pencil & Customer ID */}
          <div className="text-center sm:-ml-12">
            <div className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-800">
              <span>{formData.event_name} - {customerDisplayName}</span>
              <button
                type="button"
                onClick={() => setEditCustomerModalOpen(true)}
                className="text-[#007bff] hover:text-[#0056b3] p-0.5 rounded transition-colors"
                title="Edit Customer"
              >
                <Pencil className="w-3 h-3 text-[#007bff]" />
              </button>
            </div>
            <div className="text-xs text-slate-500 font-normal">
              Customer ID: {customerIdDisplay}
            </div>
          </div>

          {/* Right: Save button (green) and Actions dropdown (dark slate) */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleSaveEvent}
              className="px-4 py-1.5 bg-[#28a745] hover:bg-[#218838] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" /> Save
            </button>

            {/* Actions Dropdown Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActionsDropdownOpen(!actionsDropdownOpen)}
                className="px-3.5 py-1.5 bg-[#343a40] hover:bg-[#23272b] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <span>Actions</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {actionsDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setActionsDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded shadow-xl py-1 z-50 text-xs animate-fade-in">
                    <button
                      type="button"
                      onClick={() => {
                        setActionsDropdownOpen(false);
                        handleOpenEmailModal();
                      }}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5 text-slate-700" />
                      <span>Email Event</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActionsDropdownOpen(false);
                        handleGoToReceipt();
                      }}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-slate-700" />
                      <span>New Receipt</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActionsDropdownOpen(false);
                        handleGoToQuotation();
                      }}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-slate-700" />
                      <span>New Quotation</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Card Container with 3 Tabs */}
        <div className="bg-white rounded border border-[#dee2e6] shadow-sm mb-8">
          {/* Sub-tabs: Event Information, Resources, Drivers */}
          <div className="flex items-center gap-6 px-4 pt-3 border-b border-[#dee2e6] text-xs font-semibold select-none">
            <button
              type="button"
              onClick={() => setActiveTab('info')}
              className={`pb-2.5 transition-colors border-b-2 cursor-pointer ${
                activeTab === 'info'
                  ? 'border-[#007bff] text-[#007bff] font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Event Information
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('resources')}
              className={`pb-2.5 transition-colors border-b-2 cursor-pointer ${
                activeTab === 'resources'
                  ? 'border-[#007bff] text-[#007bff] font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Resources
              {assignedResources.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold">
                  {assignedResources.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('drivers')}
              className={`pb-2.5 transition-colors border-b-2 cursor-pointer ${
                activeTab === 'drivers'
                  ? 'border-[#007bff] text-[#007bff] font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Drivers
              {assignedEmployeeIds.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">
                  {assignedEmployeeIds.length}
                </span>
              )}
            </button>
          </div>

          {/* TAB 1: Event Information Form (Matching Screenshot 1 exactly) */}
          {activeTab === 'info' && (
            <div className="p-4 sm:p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-3.5">
                {/* Event Name */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Event Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.event_name}
                    onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#007bff]"
                    placeholder="Enter event name"
                  />
                </div>

                {/* Event Date */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Event Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#007bff]"
                  />
                </div>

                {/* Event Type + Plus button */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Event Type <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-1.5">
                    <select
                      value={formData.event_type_id}
                      onChange={(e) => setFormData({ ...formData, event_type_id: Number(e.target.value) })}
                      className="flex-1 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#007bff]"
                    >
                      {eventTypes.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.type_name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setAddTypeModalOpen(true)}
                      className="px-2.5 py-1.5 bg-[#007bff] hover:bg-[#0069d9] text-white rounded flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                      title="Add New Event Type"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Event Venue + Plus button */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Event Venue
                  </label>
                  <div className="flex gap-1.5">
                    <select
                      value={formData.venue_id ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          venue_id: e.target.value ? Number(e.target.value) : null
                        })
                      }
                      className="flex-1 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#007bff]"
                    >
                      <option value="">Select Venue</option>
                      {venuesList.map((v) => (
                        <option key={v.venue_id} value={v.venue_id}>
                          {v.venue_name} {v.capacity ? `(Capacity: ${v.capacity})` : ''}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setAddVenueModalOpen(true)}
                      className="px-2.5 py-1.5 bg-[#007bff] hover:bg-[#0069d9] text-white rounded flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                      title="Add New Event Venue"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Event Start Time */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Event Start Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.event_start_time}
                    onChange={(e) => setFormData({ ...formData, event_start_time: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#007bff]"
                  />
                </div>

                {/* Number of Guests */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Number of Guests <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.nb_of_guest}
                    onChange={(e) => setFormData({ ...formData, nb_of_guest: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#007bff]"
                  />
                </div>

                {/* Event End Time */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Event End Time
                  </label>
                  <input
                    type="time"
                    value={formData.event_end_time}
                    onChange={(e) => setFormData({ ...formData, event_end_time: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#007bff]"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Status <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.event_status}
                    onChange={(e) => setFormData({ ...formData, event_status: e.target.value as any })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#007bff]"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Delivery Time */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Delivery Time
                  </label>
                  <input
                    type="time"
                    value={formData.event_delivery_time}
                    onChange={(e) => setFormData({ ...formData, event_delivery_time: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#007bff]"
                  />
                </div>

                {/* Delivery Type */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Delivery Type
                  </label>
                  <select
                    value={formData.event_delivery_type}
                    onChange={(e) => setFormData({ ...formData, event_delivery_type: e.target.value as any })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#007bff]"
                  >
                    <option value="pickup">Pickup</option>
                    <option value="delivery">Delivery</option>
                  </select>
                </div>

                {/* Setup Time */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Setup Time
                  </label>
                  <input
                    type="time"
                    value={formData.event_setup_time}
                    onChange={(e) => setFormData({ ...formData, event_setup_time: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#007bff]"
                  />
                </div>

                {/* Select Main Branch */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Select Main Branch <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.branchid}
                    onChange={(e) => setFormData({ ...formData, branchid: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#007bff]"
                  >
                    <option value={1}>Zeit w zaytoun ljanoub</option>
                    <option value={2}>Zeit w zaytoun Beirut</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="pt-2">
                <label className="block font-medium text-slate-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows={3}
                  value={formData.event_notes}
                  onChange={(e) => setFormData({ ...formData, event_notes: e.target.value })}
                  placeholder="Enter notes (optional)"
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#007bff]"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Resources */}
          {activeTab === 'resources' && (
            <div className="p-4 sm:p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700">Assigned Event Resources</h3>
                <button
                  type="button"
                  onClick={() => setAddResourceModalOpen(true)}
                  className="px-3 py-1.5 bg-[#007bff] hover:bg-[#0069d9] text-white rounded text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Assign Resource
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                    <tr>
                      <th className="py-2.5 px-3">Resource Name</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {assignedResources.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400">
                          No resources assigned to this event yet. Click &quot;Assign Resource&quot; to add.
                        </td>
                      </tr>
                    ) : (
                      assignedResources.map((item) => {
                        const res = allResources.find((r) => r.id === item.id);
                        if (!res) return null;
                        const isOutSource = res.type === 1 || res.resource_type === 'Out Source';
                        return (
                          <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2.5 px-3 font-semibold text-slate-800">{res.resource_name}</td>
                            <td className="py-2.5 px-3 text-slate-600">{res.resource_description || '—'}</td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                  isOutSource
                                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                    : 'bg-blue-100 text-blue-800 border border-blue-300'
                                }`}
                              >
                                {isOutSource ? 'Out Source' : 'In House'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  setAssignedResources(assignedResources.filter((r) => r.id !== item.id))
                                }
                                className="p-1 bg-rose-600 hover:bg-rose-700 text-white rounded transition-colors cursor-pointer"
                                title="Remove Resource"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Drivers */}
          {activeTab === 'drivers' && (
            <div className="p-4 sm:p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700">Assigned Drivers & Logistics Staff</h3>
                <button
                  type="button"
                  onClick={() => setAddDriverModalOpen(true)}
                  className="px-3 py-1.5 bg-[#007bff] hover:bg-[#0069d9] text-white rounded text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Assign Driver
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                    <tr>
                      <th className="py-2.5 px-3">Employee Name</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Mobile</th>
                      <th className="py-2.5 px-3">License Number</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {assignedEmployeeIds.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400">
                          No drivers assigned to this event yet. Click &quot;Assign Driver&quot; to add.
                        </td>
                      </tr>
                    ) : (
                      assignedEmployeeIds.map((empId) => {
                        const driver = allEmployees.find((e) => e.id === empId || e.EMPLOYEEID === empId);
                        if (!driver) return null;
                        return (
                          <tr key={driver.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2.5 px-3 font-semibold text-slate-800">{driver.NAME}</td>
                            <td className="py-2.5 px-3 text-slate-600">{driver.role || 'Logistics Driver'}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-600">{driver.MOBILETEL || '—'}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-600">{driver.license_number || '—'}</td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  setAssignedEmployeeIds(assignedEmployeeIds.filter((id) => id !== empId))
                                }
                                className="p-1 bg-rose-600 hover:bg-rose-700 text-white rounded transition-colors cursor-pointer"
                                title="Remove Driver"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer matching Omega ERP */}
        <div className="text-center text-[11px] text-slate-400 py-6 border-t border-slate-200">
          © 2026 Omega Software All rights reserved. | Privacy Policy | Terms and Conditions | Support | Feedback
        </div>
      </main>

      {/* =========================================================================
          MODAL 1: SEND EVENT EMAIL (MATCHING SCREENSHOT 2 EXACTLY)
          ========================================================================= */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-xl overflow-hidden text-xs my-8 border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-white">
              <h3 className="text-sm font-semibold text-slate-800">Send Event Email</h3>
              <button
                type="button"
                onClick={() => setEmailModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSendEmail} className="p-5 space-y-3.5">
              {/* Customer with Info Icon */}
              <div>
                <label className="flex items-center gap-1 font-medium text-slate-700 mb-1">
                  <span>Customer</span>
                  <Info className="w-3 h-3 text-slate-500" />
                </label>
                <textarea
                  rows={2}
                  value={emailForm.customer}
                  onChange={(e) => setEmailForm({ ...emailForm, customer: e.target.value })}
                  placeholder="ex1@omegapos.com,ex2@omegapos.com"
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#007bff]"
                />
              </div>

              {/* From Dropdown */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">From</label>
                <select
                  value={emailForm.fromEmail}
                  onChange={(e) => setEmailForm({ ...emailForm, fromEmail: e.target.value })}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#007bff]"
                >
                  <option value="info@vanguard-erp.lb">info@vanguard-erp.lb</option>
                  <option value="events@vanguard-erp.lb">events@vanguard-erp.lb</option>
                  <option value="orders@vanguard-erp.lb">orders@vanguard-erp.lb</option>
                </select>
              </div>

              {/* Bcc & Cc textareas side-by-side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Bcc</label>
                  <textarea
                    rows={2}
                    value={emailForm.bcc}
                    onChange={(e) => setEmailForm({ ...emailForm, bcc: e.target.value })}
                    placeholder="ex1@omegapos.com,ex2@omegapos.com"
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#007bff]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Cc</label>
                  <textarea
                    rows={2}
                    value={emailForm.cc}
                    onChange={(e) => setEmailForm({ ...emailForm, cc: e.target.value })}
                    placeholder="ex1@omegapos.com,ex2@omegapos.com"
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#007bff]"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                  placeholder="Subject"
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#007bff]"
                />
              </div>

              {/* Message (with rich text toolbar mockup matching Screenshot 2) */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">Message</label>
                <div className="border border-slate-300 rounded overflow-hidden">
                  {/* Toolbar Row 1: Menus */}
                  <div className="flex items-center gap-3 px-2.5 py-1 bg-slate-100 border-b border-slate-200 text-[11px] text-slate-600 font-medium select-none">
                    <span className="hover:text-slate-900 cursor-pointer">File ▾</span>
                    <span className="hover:text-slate-900 cursor-pointer">Edit ▾</span>
                    <span className="hover:text-slate-900 cursor-pointer">View ▾</span>
                    <span className="hover:text-slate-900 cursor-pointer">Format ▾</span>
                  </div>

                  {/* Toolbar Row 2: Actions */}
                  <div className="flex flex-wrap items-center gap-1.5 px-2 py-1 bg-slate-50 border-b border-slate-200 text-slate-600 select-none">
                    <button type="button" className="p-1 hover:bg-slate-200 rounded cursor-pointer" title="Undo">
                      <Undo className="w-3 h-3" />
                    </button>
                    <button type="button" className="p-1 hover:bg-slate-200 rounded cursor-pointer" title="Redo">
                      <Redo className="w-3 h-3" />
                    </button>
                    <div className="h-3 w-px bg-slate-300 mx-0.5" />
                    <span className="text-[11px] px-1 hover:bg-slate-200 rounded cursor-pointer font-medium">Formats ▾</span>
                    <div className="h-3 w-px bg-slate-300 mx-0.5" />
                    <button type="button" className="p-1 hover:bg-slate-200 rounded font-bold cursor-pointer" title="Bold">
                      <Bold className="w-3 h-3" />
                    </button>
                    <button type="button" className="p-1 hover:bg-slate-200 rounded italic cursor-pointer" title="Italic">
                      <Italic className="w-3 h-3" />
                    </button>
                    <div className="h-3 w-px bg-slate-300 mx-0.5" />
                    <button type="button" className="p-1 hover:bg-slate-200 rounded cursor-pointer" title="Align Left">
                      <AlignLeft className="w-3 h-3" />
                    </button>
                    <button type="button" className="p-1 hover:bg-slate-200 rounded cursor-pointer" title="Align Center">
                      <AlignCenter className="w-3 h-3" />
                    </button>
                    <button type="button" className="p-1 hover:bg-slate-200 rounded cursor-pointer" title="Align Right">
                      <AlignRight className="w-3 h-3" />
                    </button>
                    <button type="button" className="p-1 hover:bg-slate-200 rounded cursor-pointer" title="Justify">
                      <AlignJustify className="w-3 h-3" />
                    </button>
                    <div className="h-3 w-px bg-slate-300 mx-0.5" />
                    <button type="button" className="p-1 hover:bg-slate-200 rounded cursor-pointer" title="Bullet List">
                      <List className="w-3 h-3" />
                    </button>
                    <button type="button" className="p-1 hover:bg-slate-200 rounded cursor-pointer" title="Numbered List">
                      <ListOrdered className="w-3 h-3" />
                    </button>
                    <button type="button" className="p-1 hover:bg-slate-200 rounded cursor-pointer" title="Outdent">
                      <Outdent className="w-3 h-3" />
                    </button>
                    <button type="button" className="p-1 hover:bg-slate-200 rounded cursor-pointer" title="Indent">
                      <Indent className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Textarea */}
                  <textarea
                    rows={7}
                    value={emailForm.message}
                    onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                    className="w-full p-3 text-xs text-slate-800 font-sans focus:outline-none resize-y"
                  />
                  <div className="px-2.5 py-0.5 bg-slate-100 text-[10px] text-slate-400 border-t border-slate-200">
                    p
                  </div>
                </div>
              </div>

              {/* Bottom Send Button (dark slate) */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#343a40] hover:bg-[#23272b] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: ASSIGN RESOURCE MODAL
          ========================================================================= */}
      {addResourceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-5 text-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-800">Assign Resource to Event</h3>
              <button onClick={() => setAddResourceModalOpen(false)} className="cursor-pointer">
                <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Select Resource</label>
              <select
                value={selectedResourceIdToAdd}
                onChange={(e) => setSelectedResourceIdToAdd(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs bg-white"
              >
                <option value="">-- Choose Resource --</option>
                {allResources
                  .filter((r) => !assignedResources.some((item) => item.id === r.id))
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.resource_name} ({r.resource_type})
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setAddResourceModalOpen(false)}
                className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selectedResourceIdToAdd) {
                    setAssignedResources([
                      ...assignedResources,
                      { id: Number(selectedResourceIdToAdd), quantity: 1 }
                    ]);
                    setSelectedResourceIdToAdd('');
                    setAddResourceModalOpen(false);
                    showToast('Resource added successfully!');
                  }
                }}
                disabled={!selectedResourceIdToAdd}
                className="px-4 py-1.5 bg-[#007bff] hover:bg-[#0069d9] text-white rounded font-medium disabled:opacity-50 cursor-pointer"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: ASSIGN DRIVER MODAL
          ========================================================================= */}
      {addDriverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-5 text-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-800">Assign Driver to Event</h3>
              <button onClick={() => setAddDriverModalOpen(false)} className="cursor-pointer">
                <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Select Driver / Logistics Staff</label>
              <select
                value={selectedEmployeeIdToAdd}
                onChange={(e) => setSelectedEmployeeIdToAdd(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs bg-white"
              >
                <option value="">-- Choose Employee --</option>
                {allEmployees
                  .filter((emp) => !assignedEmployeeIds.includes(emp.id))
                  .map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.NAME} ({emp.role || 'Driver'}) - {emp.MOBILETEL}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setAddDriverModalOpen(false)}
                className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selectedEmployeeIdToAdd) {
                    setAssignedEmployeeIds([...assignedEmployeeIds, Number(selectedEmployeeIdToAdd)]);
                    setSelectedEmployeeIdToAdd('');
                    setAddDriverModalOpen(false);
                    showToast('Driver assigned successfully!');
                  }
                }}
                disabled={!selectedEmployeeIdToAdd}
                className="px-4 py-1.5 bg-[#007bff] hover:bg-[#0069d9] text-white rounded font-medium disabled:opacity-50 cursor-pointer"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: QUICK ADD EVENT TYPE MODAL
          ========================================================================= */}
      {addTypeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-5 text-xs space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-slate-800">Add New Event Type</h3>
              <button onClick={() => setAddTypeModalOpen(false)} className="cursor-pointer">
                <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Type Name</label>
              <input
                type="text"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                placeholder="e.g. VIP Tasting, Gala..."
                className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setAddTypeModalOpen(false)}
                className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (newTypeName.trim()) {
                    const newId = Date.now();
                    const newType: OmegaEventTypeItem = { id: newId, type_name: newTypeName.trim(), branchid: 1 };
                    setEventTypes([...eventTypes, newType]);
                    setFormData({ ...formData, event_type_id: newId });
                    setNewTypeName('');
                    setAddTypeModalOpen(false);
                    showToast(`Event Type "${newTypeName}" added!`);
                  }
                }}
                disabled={!newTypeName.trim()}
                className="px-4 py-1.5 bg-[#007bff] text-white rounded font-medium disabled:opacity-50 cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: AUTHENTIC EVENT VENUE MODAL (WITH MAP & GEO LOOKUP)
          ========================================================================= */}
      <EventVenueModal
        isOpen={addVenueModalOpen}
        onClose={() => setAddVenueModalOpen(false)}
        onSaved={(savedVenue) => {
          setVenuesList([...venuesList, savedVenue]);
          setFormData(prev => ({ ...prev, venue_id: savedVenue.venue_id }));
          setAddVenueModalOpen(false);
          showToast(`Venue "${savedVenue.venue_name}" added and selected!`);
        }}
      />

      {/* =========================================================================
          MODAL 6: EDIT CUSTOMER MODAL
          ========================================================================= */}
      {editCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-5 text-xs space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-slate-800">Change Event Customer</h3>
              <button onClick={() => setEditCustomerModalOpen(false)} className="cursor-pointer">
                <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Select Customer</label>
              <select
                value={customer?.CUSTOMERID || ''}
                onChange={(e) => {
                  const cId = Number(e.target.value);
                  const sel = SEED_CUSTOMERS.find((c) => c.CUSTOMERID === cId);
                  if (sel) {
                    setCustomer(sel);
                    setEmailForm(prev => ({
                      ...prev,
                      customer: sel.EMAIL || prev.customer
                    }));
                  }
                }}
                className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs bg-white"
              >
                {SEED_CUSTOMERS.map((c) => (
                  <option key={c.CUSTOMERID} value={c.CUSTOMERID}>
                    {c.NAME} {c.FAMILYNAME || ''} (ID: {c.CUSTOMERID}) - {c.PHONE}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setEditCustomerModalOpen(false)}
                className="px-4 py-1.5 bg-[#007bff] text-white rounded font-medium cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EditEventPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading Edit Event...</div>}>
      <EditEventContent />
    </Suspense>
  );
}
