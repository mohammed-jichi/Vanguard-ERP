'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  List,
  Calendar as CalendarIcon,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Users,
  Building,
  Save,
  RotateCcw,
  ArrowLeft,
  X,
  Clock,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  AlertTriangle,
  ChevronUp,
  Tag,
  Wrench,
  Truck,
  Check
} from 'lucide-react';
import {
  OmegaEventRecord,
  OmegaCalendarEvent,
  OmegaEventCustomer,
  OmegaEventResourceItem,
  OmegaEventDriverItem,
  OmegaEventTypeItem,
  OmegaEventVenueItem,
  OmegaSupplierItem
} from '@/lib/eventsData';
import { EventsService } from '@/lib/eventsService';
import EventVenueModal from '@/components/EventVenueModal';

interface OperationsEventsViewsProps {
  section?: 'events' | 'event_venues' | 'event_resources' | 'event_types';
}

export default function OperationsEventsViews({ section = 'events' }: OperationsEventsViewsProps) {
  // Main view modes: 'list' | 'calendar' | 'new_event' | 'edit_event'
  const [viewType, setViewType] = useState<'list' | 'calendar' | 'new_event'>('list');
  const [calendarViewMode, setCalendarViewMode] = useState<'month' | 'week'>('month');

  // Active sub-section support
  const [activeSection, setActiveSection] = useState<'events' | 'event_venues' | 'event_resources' | 'event_types'>(section);

  useEffect(() => {
    setActiveSection(section);
  }, [section]);

  // Branch & Filter state
  const [selectedBranch, setSelectedBranch] = useState<number | string>(1);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [sorting, setSorting] = useState<{ value: string; type: 'asc' | 'desc' }>({
    value: 'evnt_id',
    type: 'desc'
  });

  // Calendar date state (Default to September 2026 to match live Omega screenshots)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 8, 11)); // Sep 11, 2026

  // Events & auxiliary data
  const [eventsList, setEventsList] = useState<OmegaEventRecord[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<OmegaCalendarEvent[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Reference options
  const [eventTypes, setEventTypes] = useState<OmegaEventTypeItem[]>([]);
  const [venuesList, setVenuesList] = useState<OmegaEventVenueItem[]>([]);
  const [resourceList, setResourceList] = useState<OmegaEventResourceItem[]>([]);
  const [employeeList, setEmployeeList] = useState<OmegaEventDriverItem[]>([]);

  // Modals state
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalEvent, setStatusModalEvent] = useState<OmegaEventRecord | null>(null);
  const [newStatusValue, setNewStatusValue] = useState<'pending' | 'confirmed' | 'cancelled'>('pending');

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedEventForDetails, setSelectedEventForDetails] = useState<OmegaEventRecord | null>(null);

  const [addCustomerModalOpen, setAddCustomerModalOpen] = useState(false);
  const [addEventTypeModalOpen, setAddEventTypeModalOpen] = useState(false);
  const [addVenueModalOpen, setAddVenueModalOpen] = useState(false);
  const [addResourceModalOpen, setAddResourceModalOpen] = useState(false);
  const [isEditResource, setIsEditResource] = useState(false);
  const [editingResourceId, setEditingResourceId] = useState<number | null>(null);

  const [addDriverModalOpen, setAddDriverModalOpen] = useState(false);
  const [newDriverForm, setNewDriverForm] = useState({
    id: null as number | null,
    NAME: '',
    MOBILETEL: '',
    branchid: 1,
    role: 'Transport Driver',
    license_number: '',
    remark: ''
  });

  const [suppliersInvList, setSuppliersInvList] = useState<OmegaSupplierItem[]>([]);

  // Standalone Event Resources state
  const [resourceSearchValue, setResourceSearchValue] = useState('');
  const [resourceSorting, setResourceSorting] = useState<{ value: string; type: 'asc' | 'desc' }>({
    value: 'resource_name',
    type: 'asc'
  });

  // Standalone Event Venues state
  const [venueSearchValue, setVenueSearchValue] = useState('');
  const [venueSorting, setVenueSorting] = useState<{ value: string; type: 'asc' | 'desc' }>({
    value: 'venue_id',
    type: 'desc'
  });
  const [venuePageNumber, setVenuePageNumber] = useState(1);
  const [venueToEdit, setVenueToEdit] = useState<OmegaEventVenueItem | null>(null);
  const [venueModalOpen, setVenueModalOpen] = useState(false);

  // Standalone Event Types state
  const [eventTypeSearchValue, setEventTypeSearchValue] = useState('');
  const [eventTypeSorting, setEventTypeSorting] = useState<{ value: string; type: 'asc' | 'desc' }>({
    value: 'type_name',
    type: 'asc'
  });
  const [eventTypePageNumber, setEventTypePageNumber] = useState(1);
  const [eventTypeToEdit, setEventTypeToEdit] = useState<OmegaEventTypeItem | null>(null);
  const [eventTypeModalOpen, setEventTypeModalOpen] = useState(false);
  const [eventTypeFormData, setEventTypeFormData] = useState({
    type_name: '',
    description: ''
  });

  // Quick Add Form States
  const [newCustomerForm, setNewCustomerForm] = useState({
    NAME: '',
    FAMILYNAME: '',
    COMPANY: '',
    PHONE: '',
    EMAIL: '',
    AUTOMATICDISCOUNT: 0
  });

  const [newEventTypeForm, setNewEventTypeForm] = useState({
    type_name: ''
  });

  const [newVenueForm, setNewVenueForm] = useState({
    venue_name: '',
    address: '',
    capacity: 100,
    contact_phone: ''
  });

  const [newResourceForm, setNewResourceForm] = useState({
    resource_setup_id: null as number | null,
    resource_name: '',
    resource_type: 0, // 0 = In House, 1 = Out Source
    resource_remark: '',
    resource_description: '',
    selectedInvSuppliers: [] as number[]
  });

  // New Event Form State (3 Tabs)
  const [activeNewEventTab, setActiveNewEventTab] = useState<'info' | 'resources' | 'drivers'>('info');
  const [selectedCustomer, setSelectedCustomer] = useState<OmegaEventCustomer | null>(null);
  const [customerSearchInput, setCustomerSearchInput] = useState('');
  const [customerSuggestions, setCustomerSuggestions] = useState<OmegaEventCustomer[]>([]);
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);

  const [newEventFormData, setNewEventFormData] = useState({
    evnt_id: null as number | null,
    event_name: '',
    event_type_id: 1,
    event_date: '2026-09-15',
    event_status: 'pending' as 'pending' | 'confirmed',
    event_start_time: '17:00',
    event_end_time: '21:00',
    event_delivery_time: '16:00',
    event_delivery_type: 'pickup' as 'pickup' | 'delivery',
    event_setup_time: '15:00',
    nb_of_guest: 50,
    event_notes: '',
    branchid: 1,
    venue_id: 1 as number | null
  });

  // Tab 2: Assigned resources
  const [assignedResources, setAssignedResources] = useState<{ id: number; quantity: number }[]>([]);
  // Tab 3: Assigned driver employee IDs
  const [assignedEmployeeIds, setAssignedEmployeeIds] = useState<number[]>([]);

  // Validation error feedback
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'warning' | 'error' | 'info'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load Data
  const fetchData = () => {
    setLoading(true);
    try {
      const res = EventsService.getEvents({
        page: pageNumber,
        searchvalue: searchValue,
        sorting,
        filter: {
          branchid: selectedBranch,
          evnt_status: statusFilter,
          date: dateFilter || null
        }
      });
      setEventsList(res.data);
      setTotalEvents(res.total);
      setTotalPages(res.last_page);

      const cal = EventsService.getEventsForCalendar({
        branchid: selectedBranch,
        evnt_status: statusFilter
      });
      setCalendarEvents(cal);

      setEventTypes(EventsService.getEventTypes().data);
      setVenuesList(EventsService.getVenues(typeof selectedBranch === 'number' ? selectedBranch : 1));
      setResourceList(EventsService.getResourceSetup().data);
      setEmployeeList(EventsService.getEmployeesByBranch(typeof selectedBranch === 'number' ? selectedBranch : 1));
      setSuppliersInvList(EventsService.getAllInvSuppliers().data);
    } catch (e) {
      console.error('Error loading events:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedBranch, statusFilter, dateFilter, searchValue, sorting, pageNumber]);

  // Customer search suggestions
  useEffect(() => {
    if (customerSearchInput.trim().length >= 1) {
      const results = EventsService.searchCustomers(customerSearchInput);
      setCustomerSuggestions(results);
    } else {
      setCustomerSuggestions([]);
    }
  }, [customerSearchInput]);

  // Handle branch change warning
  const handleBranchChange = (newBranch: number | string) => {
    if (assignedEmployeeIds.length > 0) {
      showToast('Changing Branch Resets The Drivers', 'warning');
      setAssignedEmployeeIds([]);
    }
    setSelectedBranch(newBranch);
    setNewEventFormData(prev => ({ ...prev, branchid: Number(newBranch) || 1 }));
  };

  // Reset New Event form
  const handleResetForm = () => {
    setSelectedCustomer(null);
    setCustomerSearchInput('');
    setAssignedResources([]);
    setAssignedEmployeeIds([]);
    setFormErrors([]);
    setNewEventFormData({
      evnt_id: null,
      event_name: '',
      event_type_id: eventTypes[0]?.id || 1,
      event_date: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`,
      event_status: 'pending',
      event_start_time: '17:00',
      event_end_time: '21:00',
      event_delivery_time: '16:00',
      event_delivery_type: 'pickup',
      event_setup_time: '15:00',
      nb_of_guest: 50,
      event_notes: '',
      branchid: Number(selectedBranch) || 1,
      venue_id: venuesList[0]?.venue_id || null
    });
    setActiveNewEventTab('info');
    showToast('Form reset', 'info');
  };

  // Open New Event form from button or day cell click
  const handleOpenNewEvent = (targetDate?: string, targetStartTime?: string) => {
    handleResetForm();
    if (targetDate) {
      setNewEventFormData(prev => ({
        ...prev,
        event_date: targetDate,
        event_start_time: targetStartTime || '17:00',
        event_end_time: targetStartTime ? `${String(Number(targetStartTime.split(':')[0]) + 3).padStart(2, '0')}:00` : '21:00'
      }));
    }
    setViewType('new_event');
  };

  // Edit existing event - opens in new tab matching Omega ERP
  const handleEditEvent = (ev: OmegaEventRecord) => {
    if (typeof window !== 'undefined') {
      window.open('/editEvent?id=' + ev.evnt_id, '_blank');
    }
  };

  // Save Event with full Omega validation logic
  const handleSaveNewEvent = () => {
    const errors: string[] = [];

    if (!selectedCustomer) {
      errors.push('Customer selection is required. Please search and select a customer.');
    }
    if (!newEventFormData.event_name.trim()) {
      errors.push('Event Name is required.');
    }
    if (!newEventFormData.event_date) {
      errors.push('Event Date is required.');
    }
    if (!newEventFormData.event_start_time) {
      errors.push('Event Start Time is required.');
    }
    if (newEventFormData.nb_of_guest <= 0) {
      errors.push('Number of Guests must be at least 1.');
    }

    if (newEventFormData.event_start_time && newEventFormData.event_end_time) {
      if (newEventFormData.event_start_time >= newEventFormData.event_end_time) {
        errors.push('Event Start Time must be earlier than Event End Time.');
      }
      if (newEventFormData.event_delivery_time && newEventFormData.event_delivery_time > newEventFormData.event_end_time) {
        errors.push('Delivery Time cannot be later than Event End Time.');
      }
      if (newEventFormData.event_setup_time && newEventFormData.event_setup_time > newEventFormData.event_end_time) {
        errors.push('Setup Time cannot be later than Event End Time.');
      }
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      showToast(errors[0], 'error');
      setActiveNewEventTab('info');
      return;
    }

    setFormErrors([]);

    const payload = {
      eventForm: {
        ...newEventFormData,
        customer_id: selectedCustomer?.CUSTOMERID
      },
      customer_id: selectedCustomer?.CUSTOMERID,
      eventDriversForm: {
        employee_ids: assignedEmployeeIds
      },
      eventVenueForm: {
        event_venue_id: newEventFormData.venue_id || undefined
      },
      eventResourcesForm: {
        resource_ids: assignedResources.map(r => r.id)
      }
    };

    const res = EventsService.saveEvent(payload);

    if (res.conflict) {
      showToast(`Conflict: ${res.message}`, 'warning');
      return;
    }

    if (res.error) {
      showToast(res.error, 'error');
      return;
    }

    showToast('Event saved successfully', 'success');
    fetchData();
    setViewType('list');
  };

  // Delete Event
  const handleDeleteEvent = (evnt_id: number) => {
    if (confirm('Are you sure you want to delete this event?')) {
      EventsService.deleteEvent(evnt_id);
      showToast('Event deleted', 'success');
      fetchData();
    }
  };

  // Quick Status Update
  const handleOpenStatusModal = (ev: OmegaEventRecord) => {
    setStatusModalEvent(ev);
    setNewStatusValue(ev.event_status);
    setStatusModalOpen(true);
  };

  const handleCommitStatusUpdate = () => {
    if (!statusModalEvent) return;
    const res = EventsService.saveEvent({
      eventForm: {
        evnt_id: statusModalEvent.evnt_id,
        event_status: newStatusValue,
        branchid: statusModalEvent.branch_id
      },
      status_save: true
    });
    if (res.success) {
      showToast('Event Status Updated', 'success');
      setStatusModalOpen(false);
      fetchData();
      if (selectedEventForDetails && selectedEventForDetails.evnt_id === statusModalEvent.evnt_id) {
        setSelectedEventForDetails(prev => prev ? { ...prev, event_status: newStatusValue, status: newStatusValue } : null);
      }
    }
  };

  // Calendar Helpers
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const prevMonth = () => {
    if (calendarViewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    }
  };

  const nextMonth = () => {
    if (calendarViewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    }
  };

  // Month Grid Calculation
  const calendarMonthGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const totalDaysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: {
      date: Date;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      dateString: string;
    }[] = [];

    // Prior month days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = totalDaysInPrevMonth - i;
      const d = new Date(year, month - 1, dayNum);
      const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      cells.push({
        date: d,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: false,
        dateString: str
      });
    }

    // Current month days
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const d = new Date(year, month, day);
      const str = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      // Today highlight matches Sep 11, 2026 from Omega screenshot 2
      const isToday = day === 11 && month === 8 && year === 2026;
      cells.push({
        date: d,
        dayNumber: day,
        isCurrentMonth: true,
        isToday,
        dateString: str
      });
    }

    // Next month overflow days to complete 35 or 42 grid cells
    const remaining = 42 - cells.length;
    for (let day = 1; day <= remaining; day++) {
      const d = new Date(year, month + 1, day);
      const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      cells.push({
        date: d,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: false,
        dateString: str
      });
    }

    return cells;
  }, [currentDate]);

  // Week Grid Calculation
  const calendarWeekDays = useMemo(() => {
    const d = new Date(currentDate);
    const dayOfWeek = d.getDay(); // 0 = Sun
    const startOfWeek = new Date(d);
    startOfWeek.setDate(d.getDate() - dayOfWeek);

    const weekDays: { date: Date; dateString: string; dayName: string; dayNumber: number; isToday: boolean }[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + i);
      const dateString = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;
      const isToday = dayDate.getDate() === 11 && dayDate.getMonth() === 8 && dayDate.getFullYear() === 2026;
      weekDays.push({
        date: dayDate,
        dateString,
        dayName: dayNames[i],
        dayNumber: dayDate.getDate(),
        isToday
      });
    }
    return weekDays;
  }, [currentDate]);

  // Hourly slots for Week view
  const hoursOfDay = useMemo(() => {
    const hours: string[] = [];
    for (let h = 8; h <= 22; h++) {
      hours.push(`${String(h).padStart(2, '0')}:00`);
    }
    return hours;
  }, []);

  // Quick Add Handlers
  const handleQuickAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerForm.NAME.trim()) {
      showToast('Customer Name is required', 'error');
      return;
    }
    const created = EventsService.addCustomer(newCustomerForm);
    setSelectedCustomer(created);
    setCustomerSearchInput(`${created.NAME} ${created.FAMILYNAME || ''}`.trim());
    setAddCustomerModalOpen(false);
    showToast(`Customer ${created.NAME} added and selected`, 'success');
  };

  const handleQuickAddEventType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTypeForm.type_name.trim()) {
      showToast('Type name is required', 'error');
      return;
    }
    const created = EventsService.addEventType({
      type_name: newEventTypeForm.type_name,
      branchid: Number(selectedBranch) || 1
    });
    setEventTypes(EventsService.getEventTypes().data);
    if (created) {
      setNewEventFormData(prev => ({ ...prev, event_type_id: created.id }));
    }
    setNewEventTypeForm({ type_name: '' });
    setAddEventTypeModalOpen(false);
    showToast('Event Type created', 'success');
  };

  const handleQuickAddVenue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVenueForm.venue_name.trim()) {
      showToast('Venue name is required', 'error');
      return;
    }
    const created = EventsService.addVenue({
      ...newVenueForm,
      branchid: Number(selectedBranch) || 1
    });
    if (created) {
      setNewEventFormData(prev => ({ ...prev, venue_id: created.venue_id }));
    }
    setNewVenueForm({ venue_name: '', address: '', capacity: 100, contact_phone: '' });
    setAddVenueModalOpen(false);
    showToast('Event Venue created', 'success');
  };

  const handleSaveResourceModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResourceForm.resource_name.trim()) {
      showToast('Resource name is required', 'error');
      return;
    }
    const res = EventsService.saveResourceSetup({
      resource_setup: {
        resource_setup_id: newResourceForm.resource_setup_id || undefined,
        id: newResourceForm.resource_setup_id || undefined,
        resource_name: newResourceForm.resource_name,
        resource_description: newResourceForm.resource_description,
        resource_remark: newResourceForm.resource_remark,
        resource_type: newResourceForm.resource_type,
        branchid: Number(selectedBranch) || 1
      },
      resources: newResourceForm.resource_type === 1 ? newResourceForm.selectedInvSuppliers : []
    });

    if (res.code === -1) {
      showToast('Resource already exists', 'error');
      return;
    }
    if (!res.success) {
      showToast('Resource not saved', 'error');
      return;
    }

    showToast('Resource setup saved', 'success');
    const updatedResources = EventsService.getResourceSetup().data;
    setResourceList(updatedResources);

    // Auto-assign if creating in new_event view
    if (viewType === 'new_event' && !isEditResource && res.data) {
      if (!assignedResources.some(ar => ar.id === res.data.id)) {
        setAssignedResources(prev => [...prev, { id: res.data.id, quantity: 1 }]);
      }
    }

    setAddResourceModalOpen(false);
  };

  const handleDeleteResource = (resourceId: number) => {
    if (confirm('Are you sure you want to delete this resource setup?')) {
      const res = EventsService.deleteResourceSetup(resourceId);
      if (res.code === 0) {
        showToast('This Resource is assigned to active event', 'error');
      } else {
        showToast('Resource setup deleted', 'success');
        setResourceList(EventsService.getResourceSetup().data);
        setAssignedResources(prev => prev.filter(r => r.id !== resourceId));
      }
    }
  };

  const handleOpenEditResource = (res: OmegaEventResourceItem) => {
    setIsEditResource(true);
    setEditingResourceId(res.id);
    const suppliers = Array.isArray(res.suppliers)
      ? res.suppliers.map(s => (typeof s === 'number' ? s : s.SUPPLIERID))
      : [];
    setNewResourceForm({
      resource_setup_id: res.id,
      resource_name: res.resource_name,
      resource_type: res.type === 1 || res.resource_type === 'Out Source' ? 1 : 0,
      resource_remark: res.resource_remark || '',
      resource_description: res.resource_description || '',
      selectedInvSuppliers: suppliers
    });
    setAddResourceModalOpen(true);
  };

  const handleSaveDriverModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriverForm.NAME.trim()) {
      showToast('Driver Name is required', 'error');
      return;
    }
    if (!newDriverForm.MOBILETEL.trim()) {
      showToast('Mobile phone is required', 'error');
      return;
    }

    const res = EventsService.saveDriver({
      id: newDriverForm.id || undefined,
      EMPLOYEEID: newDriverForm.id || undefined,
      NAME: newDriverForm.NAME,
      MOBILETEL: newDriverForm.MOBILETEL,
      branchid: Number(newDriverForm.branchid) || 1,
      role: newDriverForm.role || 'Transport Driver',
      license_number: newDriverForm.license_number || '',
      remark: newDriverForm.remark || '',
      SALESMANSTATUS: 1
    });

    if (res.success && res.driver) {
      showToast(`Driver ${res.driver.NAME} saved`, 'success');
      const updatedDrivers = EventsService.getEmployeesByBranch(typeof selectedBranch === 'number' ? selectedBranch : 1);
      setEmployeeList(updatedDrivers);

      // Auto-assign if in new_event view
      if (viewType === 'new_event') {
        const dId = res.driver.id;
        if (!assignedEmployeeIds.includes(dId)) {
          setAssignedEmployeeIds(prev => [...prev, dId]);
        }
      }

      setAddDriverModalOpen(false);
    }
  };

  const handleDeleteDriver = (driverId: number) => {
    if (confirm('Are you sure you want to delete this driver?')) {
      const res = EventsService.deleteDriver(driverId);
      if (res.code === 0) {
        showToast('This Driver is assigned to an active event', 'error');
      } else {
        showToast('Driver deleted', 'success');
        setEmployeeList(EventsService.getEmployeesByBranch(typeof selectedBranch === 'number' ? selectedBranch : 1));
        setAssignedEmployeeIds(prev => prev.filter(id => id !== driverId));
      }
    }
  };

  const handleToolbarNewClick = () => {
    if (activeNewEventTab === 'drivers') {
      setNewDriverForm({
        id: null,
        NAME: '',
        MOBILETEL: '',
        branchid: Number(newEventFormData.branchid) || (typeof selectedBranch === 'number' ? selectedBranch : 1),
        role: 'Transport Driver',
        license_number: '',
        remark: ''
      });
      setAddDriverModalOpen(true);
    } else if (activeNewEventTab === 'resources') {
      setIsEditResource(false);
      setEditingResourceId(null);
      setNewResourceForm({
        resource_setup_id: null,
        resource_name: '',
        resource_type: 0,
        resource_remark: '',
        resource_description: '',
        selectedInvSuppliers: []
      });
      setAddResourceModalOpen(true);
    } else {
      handleResetForm();
    }
  };

  const filteredStandaloneResources = useMemo(() => {
    let list = [...resourceList];
    if (resourceSearchValue.trim()) {
      const s = resourceSearchValue.trim().toLowerCase();
      list = list.filter(
        r =>
          r.resource_name.toLowerCase().includes(s) ||
          (r.resource_description && r.resource_description.toLowerCase().includes(s)) ||
          (r.resource_remark && r.resource_remark.toLowerCase().includes(s))
      );
    }
    if (resourceSorting.value) {
      const { value, type } = resourceSorting;
      list.sort((a: any, b: any) => {
        let valA = a[value];
        let valB = b[value];
        if (valA === undefined || valA === null) valA = '';
        if (valB === undefined || valB === null) valB = '';
        if (typeof valA === 'string') {
          return type === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return type === 'asc' ? valA - valB : valB - valA;
      });
    }
    return list;
  }, [resourceList, resourceSearchValue, resourceSorting]);

  // Standalone Event Venues Filtering & Pagination
  const filteredVenues = useMemo(() => {
    let list = [...venuesList];
    if (venueSearchValue.trim()) {
      const s = venueSearchValue.trim().toLowerCase();
      list = list.filter(
        v =>
          v.venue_name.toLowerCase().includes(s) ||
          (v.city && v.city.toLowerCase().includes(s)) ||
          (v.state && v.state.toLowerCase().includes(s)) ||
          (v.contact_name && v.contact_name.toLowerCase().includes(s)) ||
          (v.contact_phone && v.contact_phone.includes(s))
      );
    }
    if (venueSorting.value) {
      const { value, type } = venueSorting;
      list.sort((a: any, b: any) => {
        let valA = a[value] || '';
        let valB = b[value] || '';
        if (typeof valA === 'string') {
          return type === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return type === 'asc' ? valA - valB : valB - valA;
      });
    }
    return list;
  }, [venuesList, venueSearchValue, venueSorting]);

  const venuePerPage = 10;
  const totalVenuePages = Math.max(1, Math.ceil(filteredVenues.length / venuePerPage));
  const paginatedVenues = useMemo(() => {
    const offset = (venuePageNumber - 1) * venuePerPage;
    return filteredVenues.slice(offset, offset + venuePerPage);
  }, [filteredVenues, venuePageNumber, venuePerPage]);

  const handleDeleteVenue = (venue: OmegaEventVenueItem) => {
    if (confirm(`Are you sure you want to delete this venue: ${venue.venue_name}?`)) {
      const res = EventsService.deleteVenue(venue.venue_id);
      if (res.success) {
        showToast('Venue deleted', 'success');
        setVenuesList(EventsService.getVenues());
      } else {
        showToast(res.message || 'Venue is assigned to active event', 'error');
      }
    }
  };

  // Standalone Event Types Filtering & Handlers
  const filteredEventTypes = useMemo(() => {
    let list = [...eventTypes];
    const s = eventTypeSearchValue.trim().toLowerCase();
    if (s) {
      list = list.filter(
        t =>
          t.type_name.toLowerCase().includes(s) ||
          (t.description && t.description.toLowerCase().includes(s))
      );
    }
    if (eventTypeSorting.value) {
      const { value, type } = eventTypeSorting;
      list.sort((a: any, b: any) => {
        let valA = (a[value] || '').toString().toLowerCase();
        let valB = (b[value] || '').toString().toLowerCase();
        return type === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
    }
    return list;
  }, [eventTypes, eventTypeSearchValue, eventTypeSorting]);

  const eventTypesPerPage = 10;
  const totalEventTypePages = Math.max(1, Math.ceil(filteredEventTypes.length / eventTypesPerPage));
  const paginatedEventTypes = useMemo(() => {
    const offset = (eventTypePageNumber - 1) * eventTypesPerPage;
    return filteredEventTypes.slice(offset, offset + eventTypesPerPage);
  }, [filteredEventTypes, eventTypePageNumber, eventTypesPerPage]);

  const handleOpenAddEventType = () => {
    setEventTypeToEdit(null);
    setEventTypeFormData({
      type_name: '',
      description: ''
    });
    setEventTypeModalOpen(true);
  };

  const handleOpenEditEventType = (typeItem: OmegaEventTypeItem) => {
    setEventTypeToEdit(typeItem);
    setEventTypeFormData({
      type_name: typeItem.type_name,
      description: typeItem.description || ''
    });
    setEventTypeModalOpen(true);
  };

  const handleSaveEventType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTypeFormData.type_name.trim()) {
      showToast('Type name is required', 'error');
      return;
    }
    const res = EventsService.saveEventType({
      id: eventTypeToEdit?.id,
      evnt_type_id: eventTypeToEdit?.evnt_type_id || eventTypeToEdit?.id,
      type_name: eventTypeFormData.type_name,
      description: eventTypeFormData.description,
      branchid: typeof selectedBranch === 'number' ? selectedBranch : 1
    });

    if (res.code === 1) {
      showToast('Event Type saved', 'success');
      setEventTypeModalOpen(false);
      setEventTypes(EventsService.getEventTypes().data);
    } else if (res.code === -1) {
      showToast('Event Type already exists', 'error');
    } else {
      showToast(res.message || 'Event Type save failed', 'error');
    }
  };

  const handleDeleteEventType = (typeItem: OmegaEventTypeItem) => {
    const id = typeItem.evnt_type_id || typeItem.id;
    if (confirm('Are you sure you want to delete this event type?')) {
      const res = EventsService.deleteEventType(id);
      if (res.code === 0) {
        showToast('You are not allowed to delete this event type', 'error');
      } else {
        showToast('Event type deleted', 'success');
        setEventTypes(EventsService.getEventTypes().data);
      }
    }
  };

  // Handle resource assignment toggle
  const toggleResource = (resourceId: number) => {
    setAssignedResources(prev => {
      const exists = prev.find(r => r.id === resourceId);
      if (exists) {
        return prev.filter(r => r.id !== resourceId);
      } else {
        return [...prev, { id: resourceId, quantity: 1 }];
      }
    });
  };

  // Handle resource quantity change
  const updateResourceQty = (resourceId: number, qty: number) => {
    setAssignedResources(prev =>
      prev.map(r => (r.id === resourceId ? { ...r, quantity: Math.max(1, qty) } : r))
    );
  };

  // Handle employee/driver toggle
  const toggleEmployee = (empId: number) => {
    setAssignedEmployeeIds(prev => {
      if (prev.includes(empId)) {
        return prev.filter(id => id !== empId);
      } else {
        return [...prev, empId];
      }
    });
  };


  return (
    <div className="w-full bg-background min-h-screen text-foreground font-sans pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded shadow-lg text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-600 text-white'
              : toastMessage.type === 'warning'
              ? 'bg-amber-500 text-white'
              : toastMessage.type === 'error'
              ? 'bg-rose-600 text-white'
              : 'bg-slate-700 text-white'
          }`}
        >
          {toastMessage.type === 'success' && <Check className="w-4 h-4" />}
          {toastMessage.type === 'warning' && <AlertTriangle className="w-4 h-4" />}
          {toastMessage.type === 'error' && <X className="w-4 h-4" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-4">
        {/* Breadcrumb matching Omega */}
        <div className="text-xs text-muted-foreground mb-1">
          <Link href="/backoffice" className="text-primary hover:underline">
            Home
          </Link>
          <span className="mx-1">/</span>
          {activeSection === 'event_venues' ? (
            <span>Event Venues</span>
          ) : activeSection === 'event_resources' ? (
            <span>Event Resources</span>
          ) : activeSection === 'event_types' ? (
            <span>Event Types</span>
          ) : viewType === 'new_event' ? (
            <>
              <button
                onClick={() => setViewType('list')}
                className="text-primary hover:underline bg-transparent border-0 p-0 cursor-pointer text-xs"
              >
                Events
              </button>
              <span className="mx-1">/</span>
              <span>New Events</span>
            </>
          ) : (
            <span>Events</span>
          )}
        </div>

        {/* Page Title */}
        <h1 className="text-[22px] font-semibold text-foreground tracking-tight mb-3">
          {activeSection === 'event_venues'
            ? 'Event Venues'
            : activeSection === 'event_resources'
            ? 'Event Resources'
            : activeSection === 'event_types'
            ? 'Event Types'
            : viewType === 'new_event'
            ? 'New Events'
            : 'Events'}
        </h1>

        {/* ------------------------------------------------------------- */}
        {/* STANDALONE VIEW: EVENT VENUES (MATCHING OMEGA EXACT TABLE)   */}
        {/* ------------------------------------------------------------- */}
        {activeSection === 'event_venues' && (
          <div className="bg-white rounded border border-border shadow-sm p-4 mb-6">
            <div className="btn-toolbar list-toolbar mb-3">
              <div className="w-full">
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-3">
                  <div className="w-full sm:w-96 relative">
                    <input
                      type="search"
                      value={venueSearchValue}
                      onChange={e => {
                        setVenueSearchValue(e.target.value);
                        setVenuePageNumber(1);
                      }}
                      placeholder="Search by venue name, contact name or phone"
                      className="w-full h-[35px] pl-9 pr-3 text-xs border border-border rounded focus:outline-none focus:border-primary"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setVenueToEdit(null);
                        setVenueModalOpen(true);
                      }}
                      className="btn btn-primary h-[35px] px-4 text-xs font-semibold bg-primary hover:bg-primary/90 text-white rounded flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> New
                    </button>
                  </div>
                </div>

                {/* Table matching Omega exact EventVenues page */}
                <div className="table-responsive border border-border rounded overflow-hidden">
                  <table className="table table-custom table-striped table-hover mb-0 w-full text-xs text-left">
                    <thead className="bg-background text-foreground font-semibold border-b border-border">
                      <tr>
                        <th
                          className="py-2.5 px-3 cursor-pointer hover:text-primary transition-colors"
                          onClick={() =>
                            setVenueSorting({
                              value: 'venue_name',
                              type:
                                venueSorting.value === 'venue_name' && venueSorting.type === 'asc'
                                  ? 'desc'
                                  : 'asc'
                            })
                          }
                        >
                          <div className="flex items-center gap-1">
                            Venue Name <span className="text-[10px] text-slate-400">⇅</span>
                          </div>
                        </th>
                        <th
                          className="py-2.5 px-3 cursor-pointer hover:text-primary transition-colors"
                          onClick={() =>
                            setVenueSorting({
                              value: 'city',
                              type:
                                venueSorting.value === 'city' && venueSorting.type === 'asc'
                                  ? 'desc'
                                  : 'asc'
                            })
                          }
                        >
                          <div className="flex items-center gap-1">
                            City <span className="text-[10px] text-slate-400">⇅</span>
                          </div>
                        </th>
                        <th
                          className="py-2.5 px-3 cursor-pointer hover:text-primary transition-colors"
                          onClick={() =>
                            setVenueSorting({
                              value: 'contact_name',
                              type:
                                venueSorting.value === 'contact_name' && venueSorting.type === 'asc'
                                  ? 'desc'
                                  : 'asc'
                            })
                          }
                        >
                          <div className="flex items-center gap-1">
                            Contact Name <span className="text-[10px] text-slate-400">⇅</span>
                          </div>
                        </th>
                        <th
                          className="py-2.5 px-3 cursor-pointer hover:text-primary transition-colors"
                          onClick={() =>
                            setVenueSorting({
                              value: 'contact_phone',
                              type:
                                venueSorting.value === 'contact_phone' && venueSorting.type === 'asc'
                                  ? 'desc'
                                  : 'asc'
                            })
                          }
                        >
                          <div className="flex items-center gap-1">
                            Phone Number <span className="text-[10px] text-slate-400">⇅</span>
                          </div>
                        </th>
                        <th className="py-2.5 px-3 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {paginatedVenues.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-500 italic">
                            No venues found matching your search.
                          </td>
                        </tr>
                      ) : (
                        paginatedVenues.map(row => (
                          <tr key={row.venue_id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2.5 px-3 font-semibold text-foreground">
                              <div className="flex items-center gap-1.5">
                                <Building className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span>{row.venue_name}</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">
                              <span className="font-medium text-slate-800">{row.city || '—'}</span>
                              {row.state && row.state !== row.city && (
                                <span className="text-slate-400 text-[11px] ml-1">({row.state})</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">{row.contact_name || '—'}</td>
                            <td className="py-2.5 px-3 text-slate-600 font-mono">
                              {row.contact_phone ? `${row.dialing_code || '+961'} ${row.contact_phone}` : '—'}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setVenueToEdit(row);
                                    setVenueModalOpen(true);
                                  }}
                                  className="h-7 w-7 bg-primary hover:bg-primary/90 text-white rounded flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                                  title="Edit Venue"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteVenue(row)}
                                  className="h-7 w-7 bg-red-600 hover:bg-red-700 text-white rounded flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                                  title="Delete Venue"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    {totalVenuePages > 1 && (
                      <tfoot className="bg-background border-t border-border">
                        <tr>
                          <td colSpan={5} className="py-2 px-3 text-center">
                            <div className="inline-flex items-center gap-1 text-xs">
                              <button
                                type="button"
                                disabled={venuePageNumber <= 1}
                                onClick={() => setVenuePageNumber(p => Math.max(1, p - 1))}
                                className="px-2 py-1 rounded border border-slate-300 disabled:opacity-40 hover:bg-slate-100"
                              >
                                &laquo;
                              </button>
                              {Array.from({ length: totalVenuePages }).map((_, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setVenuePageNumber(i + 1)}
                                  className={`px-2.5 py-1 rounded border text-xs font-semibold ${
                                    venuePageNumber === i + 1
                                      ? 'bg-primary text-white border-primary'
                                      : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                                  }`}
                                >
                                  {i + 1}
                                </button>
                              ))}
                              <button
                                type="button"
                                disabled={venuePageNumber >= totalVenuePages}
                                onClick={() => setVenuePageNumber(p => Math.min(totalVenuePages, p + 1))}
                                className="px-2 py-1 rounded border border-slate-300 disabled:opacity-40 hover:bg-slate-100"
                              >
                                &raquo;
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STANDALONE VIEW: EVENT RESOURCES (MATCHING OMEGA TABLE SNIPPET) */}
        {/* ------------------------------------------------------------- */}
        {activeSection === 'event_resources' && (
          <div className="bg-white rounded border border-border shadow-sm p-4 mb-6">
            <div className="btn-toolbar list-toolbar mb-3">
              <div className="w-full">
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-3">
                  <div className="w-full sm:w-80 relative">
                    <input
                      type="search"
                      value={resourceSearchValue}
                      onChange={e => setResourceSearchValue(e.target.value)}
                      placeholder="Search by name or description"
                      className="w-full h-[35px] pl-9 pr-3 text-xs border border-border rounded focus:outline-none focus:border-primary"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditResource(false);
                        setEditingResourceId(null);
                        setNewResourceForm({
                          resource_setup_id: null,
                          resource_name: '',
                          resource_type: 0,
                          resource_remark: '',
                          resource_description: '',
                          selectedInvSuppliers: []
                        });
                        setAddResourceModalOpen(true);
                      }}
                      className="btn btn-primary h-[35px] px-4 text-xs font-semibold bg-primary hover:bg-primary/90 text-white rounded flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> New
                    </button>
                  </div>
                </div>

                {/* Table matching Omega exact_event_resources_page.html */}
                <div className="table-responsive border border-border rounded overflow-hidden">
                  <table className="table table-custom table-striped table-hover mb-0 w-full text-xs text-left">
                    <thead className="bg-background text-foreground font-semibold border-b border-border">
                      <tr>
                        <th
                          className="py-2.5 px-3 cursor-pointer hover:text-primary transition-colors"
                          onClick={() =>
                            setResourceSorting({
                              value: 'resource_name',
                              type:
                                resourceSorting.value === 'resource_name' && resourceSorting.type === 'asc'
                                  ? 'desc'
                                  : 'asc'
                            })
                          }
                        >
                          <div className="flex items-center gap-1">
                            Name <span className="text-[10px] text-slate-400">⇅</span>
                          </div>
                        </th>
                        <th
                          className="py-2.5 px-3 cursor-pointer hover:text-primary transition-colors"
                          onClick={() =>
                            setResourceSorting({
                              value: 'resource_description',
                              type:
                                resourceSorting.value === 'resource_description' && resourceSorting.type === 'asc'
                                  ? 'desc'
                                  : 'asc'
                            })
                          }
                        >
                          <div className="flex items-center gap-1">
                            Description <span className="text-[10px] text-slate-400">⇅</span>
                          </div>
                        </th>
                        <th
                          className="py-2.5 px-3 cursor-pointer hover:text-primary transition-colors"
                          onClick={() =>
                            setResourceSorting({
                              value: 'type',
                              type:
                                resourceSorting.value === 'type' && resourceSorting.type === 'asc'
                                  ? 'desc'
                                  : 'asc'
                            })
                          }
                        >
                          <div className="flex items-center gap-1">
                            Type <span className="text-[10px] text-slate-400">⇅</span>
                          </div>
                        </th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredStandaloneResources.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-500 italic">
                            No resources found matching your search.
                          </td>
                        </tr>
                      ) : (
                        filteredStandaloneResources.map(row => {
                          const isOutSource = row.resource_type === 'Out Source' || row.type === 1;
                          return (
                            <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                              <td className="py-2.5 px-3 font-semibold text-foreground">{row.resource_name}</td>
                              <td className="py-2.5 px-3 text-slate-600">
                                {row.resource_description || row.resource_remark || '—'}
                              </td>
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
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditResource(row)}
                                    className="h-7 w-7 bg-primary hover:bg-primary/90 text-white rounded flex items-center justify-center transition-colors shadow-sm"
                                    title="Edit Resource"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteResource(row.id)}
                                    className="h-7 w-7 bg-red-600 hover:bg-red-700 text-white rounded flex items-center justify-center transition-colors shadow-sm"
                                    title="Delete Resource"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STANDALONE VIEW: EVENT TYPES (MATCHING OMEGA EXACT TABLE)     */}
        {/* ------------------------------------------------------------- */}
        {activeSection === 'event_types' && (
          <div className="bg-white rounded border border-border shadow-sm p-4 mb-6">
            <div className="btn-toolbar list-toolbar mb-3">
              <div className="w-full">
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-3">
                  <div className="w-full sm:w-80 relative">
                    <input
                      type="search"
                      value={eventTypeSearchValue}
                      onChange={e => {
                        setEventTypeSearchValue(e.target.value);
                        setEventTypePageNumber(1);
                      }}
                      placeholder="Search by name or description"
                      className="w-full h-[35px] pl-9 pr-3 text-xs border border-border rounded focus:outline-none focus:border-primary"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={handleOpenAddEventType}
                      className="btn btn-primary h-[35px] px-4 text-xs font-semibold bg-primary hover:bg-primary/90 text-white rounded flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> New
                    </button>
                  </div>
                </div>

                {/* Table matching Omega exact EventTypes page */}
                <div className="table-responsive border border-border rounded overflow-hidden">
                  <table className="table table-custom table-striped table-hover mb-0 w-full text-xs text-left">
                    <thead className="bg-background text-foreground font-semibold border-b border-border">
                      <tr>
                        <th
                          className="py-2.5 px-3 cursor-pointer hover:text-primary transition-colors"
                          onClick={() =>
                            setEventTypeSorting({
                              value: 'type_name',
                              type:
                                eventTypeSorting.value === 'type_name' && eventTypeSorting.type === 'asc'
                                  ? 'desc'
                                  : 'asc'
                            })
                          }
                        >
                          <div className="flex items-center gap-1">
                            Name <span className="text-[10px] text-slate-400">⇅</span>
                          </div>
                        </th>
                        <th
                          className="py-2.5 px-3 cursor-pointer hover:text-primary transition-colors"
                          onClick={() =>
                            setEventTypeSorting({
                              value: 'description',
                              type:
                                eventTypeSorting.value === 'description' && eventTypeSorting.type === 'asc'
                                  ? 'desc'
                                  : 'asc'
                            })
                          }
                        >
                          <div className="flex items-center gap-1">
                            Description <span className="text-[10px] text-slate-400">⇅</span>
                          </div>
                        </th>
                        <th className="py-2.5 px-3 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {paginatedEventTypes.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-slate-500 italic">
                            No event types found.
                          </td>
                        </tr>
                      ) : (
                        paginatedEventTypes.map(row => (
                          <tr key={row.id || row.evnt_type_id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2.5 px-3 font-semibold text-foreground">{row.type_name}</td>
                            <td className="py-2.5 px-3 text-slate-600">{row.description || '—'}</td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditEventType(row)}
                                  className="h-7 w-7 bg-primary hover:bg-primary/90 text-white rounded flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                                  title="Edit Event Type"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteEventType(row)}
                                  className="h-7 w-7 bg-red-600 hover:bg-red-700 text-white rounded flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                                  title="Delete Event Type"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    {totalEventTypePages > 1 && (
                      <tfoot className="bg-background border-t border-border">
                        <tr>
                          <td colSpan={3} className="py-2 px-3 text-center">
                            <div className="inline-flex items-center gap-1 text-xs">
                              <button
                                type="button"
                                disabled={eventTypePageNumber <= 1}
                                onClick={() => setEventTypePageNumber(p => Math.max(1, p - 1))}
                                className="px-2 py-1 rounded border border-slate-300 disabled:opacity-40 hover:bg-slate-100"
                              >
                                &laquo;
                              </button>
                              {Array.from({ length: totalEventTypePages }).map((_, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setEventTypePageNumber(i + 1)}
                                  className={`px-2.5 py-1 rounded border text-xs font-semibold ${
                                    eventTypePageNumber === i + 1
                                      ? 'bg-primary text-white border-primary'
                                      : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                                  }`}
                                >
                                  {i + 1}
                                </button>
                              ))}
                              <button
                                type="button"
                                disabled={eventTypePageNumber >= totalEventTypePages}
                                onClick={() => setEventTypePageNumber(p => Math.min(totalEventTypePages, p + 1))}
                                className="px-2 py-1 rounded border border-slate-300 disabled:opacity-40 hover:bg-slate-100"
                              >
                                &raquo;
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW TYPE: NEW EVENT (3 TABS MATCHING OMEGA) */}
        {/* ------------------------------------------------------------- */}
        {activeSection === 'events' && viewType === 'new_event' && (
          <div className="bg-white rounded border border-border shadow-sm p-4 mb-6">
            {/* Toolbar: 3 Tabs on left, Reset & Save on right */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 mb-4">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveNewEventTab('info')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeNewEventTab === 'info'
                      ? 'border-primary text-primary font-semibold'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Event Information
                </button>
                <button
                  type="button"
                  onClick={() => setActiveNewEventTab('resources')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeNewEventTab === 'resources'
                      ? 'border-primary text-primary font-semibold'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Resources
                  {assignedResources.length > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full font-bold">
                      {assignedResources.length}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveNewEventTab('drivers')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeNewEventTab === 'drivers'
                      ? 'border-primary text-primary font-semibold'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Drivers
                  {assignedEmployeeIds.length > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded-full font-bold">
                      {assignedEmployeeIds.length}
                    </span>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewType('list')}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded flex items-center gap-1.5 border border-slate-300"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Events
                </button>
                <button
                  type="button"
                  id="resetEvent"
                  onClick={handleToolbarNewClick}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-primary hover:bg-primary/90 rounded flex items-center gap-1.5 shadow-sm transition-colors"
                  title={
                    activeNewEventTab === 'drivers'
                      ? 'Create New Driver'
                      : activeNewEventTab === 'resources'
                      ? 'Create New Resource'
                      : 'Reset Form for New Event'
                  }
                >
                  <Plus className="w-3.5 h-3.5" />
                  {activeNewEventTab === 'drivers'
                    ? 'New Driver'
                    : activeNewEventTab === 'resources'
                    ? 'New Resource'
                    : 'New'}
                </button>
                <button
                  type="button"
                  id="saveNewEvent"
                  onClick={handleSaveNewEvent}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded flex items-center gap-1.5 shadow-sm font-semibold"
                >
                  <Save className="w-3.5 h-3.5" /> Save
                </button>
              </div>
            </div>

            {/* Validation Errors Box */}
            {formErrors.length > 0 && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  Please correct the following:
                </div>
                <ul className="list-disc pl-5 space-y-0.5">
                  {formErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* TAB 1: EVENT INFORMATION */}
            {activeNewEventTab === 'info' && (
              <div className="space-y-4">
                {/* Customer Selection Row */}
                <div className="p-3 bg-background border border-border rounded">
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Select Customer <span className="text-red-500 font-bold">*</span>
                  </label>

                  <div className="relative flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="search"
                        value={customerSearchInput}
                        onChange={e => {
                          setCustomerSearchInput(e.target.value);
                          setShowCustomerSuggestions(true);
                        }}
                        onFocus={() => setShowCustomerSuggestions(true)}
                        placeholder="search for customer by customerid, phone, name...."
                        className="w-full h-[34px] px-3 text-xs border border-border rounded focus:outline-none focus:border-primary bg-white"
                      />

                      {/* Suggestions Dropdown */}
                      {showCustomerSuggestions && customerSuggestions.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-border rounded shadow-lg z-30 max-h-48 overflow-y-auto">
                          {customerSuggestions.map(cust => (
                            <div
                              key={cust.CUSTOMERID}
                              onClick={() => {
                                setSelectedCustomer(cust);
                                setCustomerSearchInput(`${cust.NAME} ${cust.FAMILYNAME || ''}`.trim());
                                setShowCustomerSuggestions(false);
                              }}
                              className="px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                            >
                              <div className="font-semibold text-slate-800">
                                {cust.NAME} {cust.FAMILYNAME} {cust.COMPANY && `(${cust.COMPANY})`}
                              </div>
                              <div className="text-[11px] text-slate-500 flex gap-3">
                                <span>Phone: {cust.PHONE || cust.MOBILETEL}</span>
                                <span>Discount: {cust.AUTOMATICDISCOUNT}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setAddCustomerModalOpen(true)}
                      className="h-[34px] px-3 bg-primary hover:bg-primary/90 text-white rounded text-xs flex items-center justify-center font-bold"
                      title="Add Customer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Selected Customer Badge (matching Omega ERP exact markup) */}
                  {selectedCustomer && (
                    <div className="mt-2.5 p-2 bg-muted border border-border rounded text-[11px] text-foreground flex justify-between items-start">
                      <div>
                        {selectedCustomer.COMPANY && (
                          <div className="font-bold text-slate-900">{selectedCustomer.COMPANY}</div>
                        )}
                        <div>
                          {selectedCustomer.NAME} {selectedCustomer.FAMILYNAME}
                        </div>
                        <div>{selectedCustomer.PHONE || selectedCustomer.MOBILETEL}</div>
                        <div>{selectedCustomer.EMAIL}</div>
                        {selectedCustomer.AUTOMATICDISCOUNT !== undefined && (
                          <div className="text-emerald-700 font-medium">
                            <small>Automatic Discount ({selectedCustomer.AUTOMATICDISCOUNT}%)</small>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCustomer(null);
                          setCustomerSearchInput('');
                        }}
                        className="text-[11px] text-blue-600 hover:underline"
                      >
                        Change Customer
                      </button>
                    </div>
                  )}
                </div>

                {/* Form Fields: 2 Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Event Name */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Event Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="event_name"
                      value={newEventFormData.event_name}
                      onChange={e => setNewEventFormData({ ...newEventFormData, event_name: e.target.value })}
                      placeholder="Enter event name"
                      className="w-full h-[34px] px-3 text-xs border border-border rounded focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Event Date */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Event Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="event_date"
                      value={newEventFormData.event_date}
                      onChange={e => setNewEventFormData({ ...newEventFormData, event_date: e.target.value })}
                      className="w-full h-[34px] px-3 text-xs border border-border rounded focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Event Type */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Event Type <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={newEventFormData.event_type_id}
                        onChange={e => setNewEventFormData({ ...newEventFormData, event_type_id: Number(e.target.value) })}
                        className="flex-1 h-[34px] px-2 text-xs border border-border rounded focus:outline-none focus:border-primary bg-white"
                      >
                        {eventTypes.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.type_name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setAddEventTypeModalOpen(true)}
                        className="h-[34px] px-2.5 bg-primary text-white rounded text-xs hover:bg-primary/90"
                        title="Add Type"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Event Venue */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Event Venue</label>
                    <div className="flex items-center gap-2">
                      <select
                        value={newEventFormData.venue_id || ''}
                        onChange={e =>
                          setNewEventFormData({
                            ...newEventFormData,
                            venue_id: e.target.value ? Number(e.target.value) : null
                          })
                        }
                        className="flex-1 h-[34px] px-2 text-xs border border-border rounded focus:outline-none focus:border-primary bg-white"
                      >
                        <option value="">-- No Venue / External Location --</option>
                        {venuesList.map(v => (
                          <option key={v.venue_id} value={v.venue_id}>
                            {v.venue_name} (Capacity: {v.capacity || 'N/A'})
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setAddVenueModalOpen(true)}
                        className="h-[34px] px-2.5 bg-primary text-white rounded text-xs hover:bg-primary/90"
                        title="Add Venue"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Event Start Time */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Event Start Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="event_start_time"
                      placeholder="17:00"
                      value={newEventFormData.event_start_time}
                      onChange={e => setNewEventFormData({ ...newEventFormData, event_start_time: e.target.value })}
                      className="w-full h-[34px] px-3 text-xs border border-border rounded focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Number of Guests */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Number of Guests <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="nb_of_guest"
                      min="1"
                      placeholder="Enter Number of Guests here"
                      value={newEventFormData.nb_of_guest}
                      onChange={e =>
                        setNewEventFormData({ ...newEventFormData, nb_of_guest: Math.max(1, Number(e.target.value)) })
                      }
                      className="w-full h-[34px] px-3 text-xs border border-border rounded focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Event End Time */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Event End Time</label>
                    <input
                      type="text"
                      id="event_end_time"
                      placeholder="21:00"
                      value={newEventFormData.event_end_time}
                      onChange={e => setNewEventFormData({ ...newEventFormData, event_end_time: e.target.value })}
                      className="w-full h-[34px] px-3 text-xs border border-border rounded focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newEventFormData.event_status}
                      onChange={e =>
                        setNewEventFormData({
                          ...newEventFormData,
                          event_status: e.target.value as 'pending' | 'confirmed'
                        })
                      }
                      className="w-full h-[34px] px-2 text-xs border border-border rounded focus:outline-none focus:border-primary bg-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                    </select>
                  </div>

                  {/* Delivery Time */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Delivery Time</label>
                    <input
                      type="text"
                      id="event_delivery_time"
                      placeholder="16:00"
                      value={newEventFormData.event_delivery_time}
                      onChange={e => setNewEventFormData({ ...newEventFormData, event_delivery_time: e.target.value })}
                      className="w-full h-[34px] px-3 text-xs border border-border rounded focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Delivery Type */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Delivery Type</label>
                    <select
                      value={newEventFormData.event_delivery_type}
                      onChange={e =>
                        setNewEventFormData({
                          ...newEventFormData,
                          event_delivery_type: e.target.value as 'pickup' | 'delivery'
                        })
                      }
                      className="w-full h-[34px] px-2 text-xs border border-border rounded focus:outline-none focus:border-primary bg-white"
                    >
                      <option value="pickup">Pickup</option>
                      <option value="delivery">Delivery</option>
                    </select>
                  </div>

                  {/* Setup Time */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Setup Time</label>
                    <input
                      type="text"
                      id="event_setup_time"
                      placeholder="15:00"
                      value={newEventFormData.event_setup_time}
                      onChange={e => setNewEventFormData({ ...newEventFormData, event_setup_time: e.target.value })}
                      className="w-full h-[34px] px-3 text-xs border border-border rounded focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Main Branch */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Select Main Branch <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newEventFormData.branchid}
                      onChange={e => handleBranchChange(Number(e.target.value))}
                      className="w-full h-[34px] px-2 text-xs border border-border rounded focus:outline-none focus:border-primary bg-white"
                    >
                      <option value={1}>Zeit w zaytoun ljanoub</option>
                      <option value={2}>Beirut Central Distribution Depot</option>
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Notes</label>
                  <textarea
                    rows={3}
                    id="event_notes"
                    value={newEventFormData.event_notes}
                    onChange={e => setNewEventFormData({ ...newEventFormData, event_notes: e.target.value })}
                    placeholder="Enter notes (optional)"
                    className="w-full p-2.5 text-xs border border-border rounded focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: RESOURCES */}
            {activeNewEventTab === 'resources' && (
              <div className="space-y-4">
                <div className="card border border-border rounded shadow-sm overflow-hidden bg-white mb-3">
                  <div className="card-header bg-background border-b border-border px-4 py-3">
                    <span className="font-semibold text-sm text-foreground">Event Resources</span>
                  </div>

                  <div className="card-body p-4 space-y-4">
                    {/* Row with Select Resource & Inline + Button matching Omega */}
                    <div className="row g-2">
                      <div className="col-12 col-md-6">
                        <label className="block text-xs font-semibold text-foreground mb-1">
                          Select Resource
                        </label>
                        <div className="flex items-center gap-2">
                          <select
                            onChange={e => {
                              if (e.target.value) {
                                toggleResource(Number(e.target.value));
                                e.target.value = '';
                              }
                            }}
                            defaultValue=""
                            className="flex-1 h-[34px] px-3 text-xs border border-border rounded focus:outline-none focus:border-primary bg-white text-foreground"
                          >
                            <option value="" disabled>-- Select Resource to Assign --</option>
                            {resourceList.map(r => {
                              const isAssigned = assignedResources.some(ar => ar.id === r.id);
                              return (
                                <option key={r.id} value={r.id} disabled={isAssigned}>
                                  {r.resource_name} ({r.resource_type || (r.type === 1 ? 'Out Source' : 'In House')}) {isAssigned ? '✓ (Assigned)' : ''}
                                </option>
                              );
                            })}
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditResource(false);
                              setEditingResourceId(null);
                              setNewResourceForm({
                                resource_setup_id: null,
                                resource_name: '',
                                resource_type: 0,
                                resource_remark: '',
                                resource_description: '',
                                selectedInvSuppliers: []
                              });
                              setAddResourceModalOpen(true);
                            }}
                            className="h-[34px] px-3 bg-primary hover:bg-primary/90 text-white rounded text-xs flex items-center justify-center shadow-sm transition-colors"
                            title="Add New Resource"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Resources Table in Authentic Omega Style */}
                    <div className="table-responsive border border-border rounded overflow-hidden">
                      <table className="table table-custom table-striped table-hover mb-0 w-full text-xs text-left">
                        <thead className="bg-background text-foreground font-semibold border-b border-border">
                          <tr>
                            <th className="py-2.5 px-3">Resource Name</th>
                            <th className="py-2.5 px-3">Type</th>
                            <th className="py-2.5 px-3">Description / Remark</th>
                            <th className="py-2.5 px-3 w-28">Quantity</th>
                            <th className="py-2.5 px-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {assignedResources.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-slate-500 italic">
                                No resources assigned to this event yet. Select a resource from the dropdown above or click <strong>+ New Resource</strong> to define one.
                              </td>
                            </tr>
                          ) : (
                            assignedResources.map(item => {
                              const r = resourceList.find(res => res.id === item.id);
                              if (!r) return null;
                              const isOutSource = r.resource_type === 'Out Source' || r.type === 1;
                              return (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="py-2.5 px-3 font-semibold text-foreground">{r.resource_name}</td>
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
                                  <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">
                                    {r.resource_remark || r.resource_description || '—'}
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <input
                                      type="number"
                                      min="1"
                                      value={item.quantity}
                                      onChange={e => updateResourceQty(item.id, Number(e.target.value))}
                                      className="w-16 h-7 px-2 border border-border rounded text-xs focus:outline-none focus:border-primary"
                                    />
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    <button
                                      type="button"
                                      onClick={() => toggleResource(item.id)}
                                      className="px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded border border-transparent hover:border-red-200 transition-colors inline-flex items-center gap-1"
                                      title="Remove resource"
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
                </div>
              </div>
            )}

            {/* TAB 3: DRIVERS */}
            {activeNewEventTab === 'drivers' && (
              <div className="space-y-4">
                <div className="card border border-border rounded shadow-sm overflow-hidden bg-white mb-3">
                  <div className="card-header bg-background border-b border-border px-4 py-3">
                    <span className="font-semibold text-sm text-foreground">Event Drivers</span>
                    <span className="ml-2 text-xs text-slate-500 font-normal">
                      ({newEventFormData.branchid === 2 ? 'Beirut Central Distribution Depot' : 'Zeit w zaytoun ljanoub'})
                    </span>
                  </div>

                  <div className="card-body p-4 space-y-4">
                    {/* Row with Select Employee & Inline + Button matching Omega */}
                    <div className="row g-2">
                      <div className="col-12 col-md-6">
                        <label className="block text-xs font-semibold text-foreground mb-1">
                          Select Employee / Driver
                        </label>
                        <div className="flex items-center gap-2">
                          <select
                            onChange={e => {
                              if (e.target.value) {
                                toggleEmployee(Number(e.target.value));
                                e.target.value = '';
                              }
                            }}
                            defaultValue=""
                            className="flex-1 h-[34px] px-3 text-xs border border-border rounded focus:outline-none focus:border-primary bg-white text-foreground"
                          >
                            <option value="" disabled>-- Select Driver to Assign --</option>
                            {employeeList.map(emp => {
                              const isAssigned = assignedEmployeeIds.includes(emp.id) || assignedEmployeeIds.includes(emp.EMPLOYEEID);
                              return (
                                <option key={emp.id} value={emp.id} disabled={isAssigned}>
                                  {emp.NAME} - {emp.role || 'Driver'} ({emp.MOBILETEL || 'No Phone'}) {isAssigned ? '✓ (Assigned)' : ''}
                                </option>
                              );
                            })}
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              setNewDriverForm({
                                id: null,
                                NAME: '',
                                MOBILETEL: '',
                                branchid: Number(newEventFormData.branchid) || 1,
                                role: 'Transport Driver',
                                license_number: '',
                                remark: ''
                              });
                              setAddDriverModalOpen(true);
                            }}
                            className="h-[34px] px-3 bg-primary hover:bg-primary/90 text-white rounded text-xs flex items-center justify-center shadow-sm transition-colors"
                            title="Add New Driver"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Drivers Table in Authentic Omega Style */}
                    <div className="table-responsive border border-border rounded overflow-hidden">
                      <table className="table table-custom table-striped table-hover mb-0 w-full text-xs text-left">
                        <thead className="bg-background text-foreground font-semibold border-b border-border">
                          <tr>
                            <th className="py-2.5 px-3">Driver Name</th>
                            <th className="py-2.5 px-3">Mobile / Phone</th>
                            <th className="py-2.5 px-3">Branch</th>
                            <th className="py-2.5 px-3">Role / Status</th>
                            <th className="py-2.5 px-3">License Permit</th>
                            <th className="py-2.5 px-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {assignedEmployeeIds.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-slate-500 italic">
                                No drivers assigned to this event yet. Select an employee from the dropdown above or click <strong>+ New Driver</strong> to register a new driver.
                              </td>
                            </tr>
                          ) : (
                            assignedEmployeeIds.map(empId => {
                              const emp = employeeList.find(e => e.id === empId || e.EMPLOYEEID === empId);
                              if (!emp) return null;
                              return (
                                <tr key={empId} className="hover:bg-slate-50 transition-colors">
                                  <td className="py-2.5 px-3 font-semibold text-foreground">{emp.NAME}</td>
                                  <td className="py-2.5 px-3 font-mono text-slate-700">{emp.MOBILETEL || '—'}</td>
                                  <td className="py-2.5 px-3 text-slate-600">
                                    {emp.branchid === 2 ? 'Beirut Central Depot' : 'Zeit w zaytoun ljanoub'}
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                      {emp.role || 'Authorized Driver'}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 font-mono text-xs text-slate-500">
                                    {emp.license_number || '—'}
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    <button
                                      type="button"
                                      onClick={() => toggleEmployee(emp.id)}
                                      className="px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded border border-transparent hover:border-red-200 transition-colors inline-flex items-center gap-1"
                                      title="Remove driver"
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
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* LIST & CALENDAR VIEWS (MATCHING SCREENSHOTS 1, 2, 3) */}
        {/* ------------------------------------------------------------- */}
        {activeSection === 'events' && viewType !== 'new_event' && (
          <div className="space-y-4">
            {/* Top Row: Branch Selector on Left, View Switcher on Right (Matches Screenshot 1 & 2) */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-2">
              <div className="w-full sm:w-80">
                <label htmlFor="branch" className="block text-xs font-semibold text-foreground mb-1">
                  Select Branch
                </label>
                <select
                  id="branch"
                  value={selectedBranch}
                  onChange={e => handleBranchChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="w-full h-[35px] px-3 text-xs border border-border rounded focus:outline-none focus:border-primary bg-white text-foreground"
                >
                  <option value={1}>Zeit w zaytoun ljanoub</option>
                  <option value={2}>Beirut Central Distribution Depot</option>
                  <option value="all">All Branches</option>
                </select>
              </div>

              {/* View Switcher: Connected List & Calendar Buttons */}
              <div className="flex items-center">
                <div className="inline-flex rounded shadow-sm" role="group">
                  <button
                    type="button"
                    onClick={() => setViewType('list')}
                    className={`h-[35px] px-3.5 border text-xs font-medium rounded-l transition-colors flex items-center justify-center ${
                      viewType === 'list'
                        ? 'bg-primary border-primary text-white font-bold'
                        : 'bg-white border-border text-primary hover:bg-slate-50'
                    }`}
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewType('calendar')}
                    className={`h-[35px] px-3.5 border-t border-b border-r text-xs font-medium rounded-r transition-colors flex items-center justify-center ${
                      viewType === 'calendar'
                        ? 'bg-primary border-primary text-white font-bold'
                        : 'bg-white border-border text-primary hover:bg-slate-50'
                    }`}
                    title="Calendar View"
                  >
                    <CalendarIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* --------------------------------------------------------- */}
            {/* 1. LIST VIEW (MATCHES SCREENSHOT 1) */}
            {/* --------------------------------------------------------- */}
            {viewType === 'list' && (
              <div className="bg-white border border-border rounded shadow-sm overflow-hidden">
                {/* Search & Filter Toolbar (Screenshot 1) */}
                <div className="p-3 border-b border-border bg-card">
                  <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2">
                    {/* Search Input */}
                    <div className="flex-1 relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="search"
                        value={searchValue}
                        onChange={e => setSearchValue(e.target.value)}
                        placeholder="Search by name, phone, email, ID or event name"
                        className="w-full h-[35px] pl-9 pr-3 text-xs border border-border rounded focus:outline-none focus:border-primary"
                      />
                    </div>

                    {/* Status Dropdown */}
                    <div className="w-full lg:w-44">
                      <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="w-full h-[35px] px-2.5 text-xs border border-border rounded focus:outline-none focus:border-primary bg-white text-foreground"
                      >
                        <option value="all">All Events</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    {/* Date Filter Input */}
                    <div className="w-full lg:w-44 relative">
                      <input
                        type="date"
                        value={dateFilter}
                        onChange={e => setDateFilter(e.target.value)}
                        placeholder="dd----yyyy"
                        className="w-full h-[35px] px-2 text-xs border border-border rounded focus:outline-none focus:border-primary bg-white text-foreground"
                      />
                    </div>

                    {/* + New Button (Dark Navy button from Screenshot 1) */}
                    <div>
                      <button
                        type="button"
                        onClick={() => handleOpenNewEvent()}
                        className="w-full lg:w-auto h-[35px] px-4 bg-primary hover:bg-primary/90 text-white text-xs font-semibold rounded flex items-center justify-center gap-1 shadow-sm transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> New
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table matching Screenshot 1 */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-white border-b border-border text-foreground font-semibold">
                      <tr>
                        <th
                          className="py-3 px-3 cursor-pointer hover:bg-slate-50 select-none whitespace-nowrap"
                          onClick={() =>
                            setSorting({
                              value: 'branch_name',
                              type: sorting.type === 'asc' ? 'desc' : 'asc'
                            })
                          }
                        >
                          Branch ↕
                        </th>
                        <th
                          className="py-3 px-3 cursor-pointer hover:bg-slate-50 select-none whitespace-nowrap"
                          onClick={() =>
                            setSorting({
                              value: 'event_name',
                              type: sorting.type === 'asc' ? 'desc' : 'asc'
                            })
                          }
                        >
                          Event Name ↕
                        </th>
                        <th
                          className="py-3 px-3 cursor-pointer hover:bg-slate-50 select-none whitespace-nowrap"
                          onClick={() =>
                            setSorting({
                              value: 'customerName',
                              type: sorting.type === 'asc' ? 'desc' : 'asc'
                            })
                          }
                        >
                          Customer Name ↕
                        </th>
                        <th
                          className="py-3 px-3 cursor-pointer hover:bg-slate-50 select-none whitespace-nowrap"
                          onClick={() =>
                            setSorting({
                              value: 'customer.COMPANY',
                              type: sorting.type === 'asc' ? 'desc' : 'asc'
                            })
                          }
                        >
                          Company ↕
                        </th>
                        <th
                          className="py-3 px-3 cursor-pointer hover:bg-slate-50 select-none whitespace-nowrap"
                          onClick={() =>
                            setSorting({
                              value: 'type.type_name',
                              type: sorting.type === 'asc' ? 'desc' : 'asc'
                            })
                          }
                        >
                          Type ↕
                        </th>
                        <th
                          className="py-3 px-3 cursor-pointer hover:bg-slate-50 select-none whitespace-nowrap"
                          onClick={() =>
                            setSorting({
                              value: 'status',
                              type: sorting.type === 'asc' ? 'desc' : 'asc'
                            })
                          }
                        >
                          Status ↕
                        </th>
                        <th
                          className="py-3 px-3 cursor-pointer hover:bg-slate-50 select-none whitespace-nowrap"
                          onClick={() =>
                            setSorting({
                              value: 'event_date',
                              type: sorting.type === 'asc' ? 'desc' : 'asc'
                            })
                          }
                        >
                          Event Date ↕
                        </th>
                        <th className="py-3 px-3 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {eventsList.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-400 font-normal">
                            No events found for this filter criteria.
                          </td>
                        </tr>
                      ) : (
                        eventsList.map(ev => (
                          <tr key={ev.evnt_id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">{ev.branch_name}</td>
                            <td
                              className="py-2.5 px-3 font-medium text-primary hover:underline cursor-pointer whitespace-nowrap"
                              onClick={() => {
                                setSelectedEventForDetails(ev);
                                setDetailsModalOpen(true);
                              }}
                            >
                              {ev.event_name}
                            </td>
                            <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">{ev.customerName}</td>
                            <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                              {ev.customer?.COMPANY || '-'}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{ev.type?.type_name}</td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                <span
                                  className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider text-white ${
                                    ev.event_status === 'confirmed'
                                      ? 'bg-emerald-700'
                                      : ev.event_status === 'pending'
                                      ? 'bg-amber-600'
                                      : 'bg-slate-600'
                                  }`}
                                >
                                  {ev.event_status}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleOpenStatusModal(ev)}
                                  className="text-slate-400 hover:text-slate-600 p-0.5"
                                  title="Change Status"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                              {ev.event_date} {ev.event_start_time}
                            </td>
                            <td className="py-2.5 px-3 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleEditEvent(ev)}
                                  className="p-1 bg-primary text-white rounded hover:bg-primary/90"
                                  title="Edit Event"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteEvent(ev.evnt_id)}
                                  className="p-1 bg-destructive text-white rounded hover:bg-destructive/90"
                                  title="Delete Event"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer with Pagination */}
                <div className="p-3 bg-white border-t border-border flex items-center justify-between text-xs text-slate-500">
                  <div>
                    Showing {eventsList.length} of {totalEvents} events
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={pageNumber <= 1}
                      onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
                      className="px-2.5 py-1 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40"
                    >
                      &laquo; Previous
                    </button>
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 font-semibold rounded border border-blue-200">
                      {pageNumber}
                    </span>
                    <button
                      type="button"
                      disabled={pageNumber >= totalPages}
                      onClick={() => setPageNumber(prev => prev + 1)}
                      className="px-2.5 py-1 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40"
                    >
                      Next &raquo;
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------- */}
            {/* 2. CALENDAR VIEW (MATCHES SCREENSHOTS 2 & 3) */}
            {/* --------------------------------------------------------- */}
            {viewType === 'calendar' && (
              <div className="bg-white border border-border rounded shadow-sm p-4">
                {/* Calendar Navigation Sub-toolbar (Screenshot 2) */}
                <div className="flex items-center justify-between mb-4">
                  {/* Left: < and > navigation buttons */}
                  <div className="inline-flex rounded border border-border overflow-hidden">
                    <button
                      type="button"
                      onClick={prevMonth}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border-r border-border transition-colors"
                      title="Previous"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={nextMonth}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 transition-colors"
                      title="Next"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Center: Dynamic Month & Year Header (e.g. September 2026) */}
                  <div className="text-[20px] font-normal text-foreground tracking-tight">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </div>

                  {/* Right: + New button, plus Month and Week toggles (Screenshot 2) */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenNewEvent()}
                      className="h-[32px] px-3.5 bg-primary hover:bg-primary/90 text-white text-xs font-semibold rounded flex items-center gap-1 shadow-sm transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> New
                    </button>

                    <div className="inline-flex rounded border border-border overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setCalendarViewMode('month')}
                        className={`px-3 py-1 text-xs font-medium border-r border-border transition-colors ${
                          calendarViewMode === 'month'
                            ? 'bg-muted text-slate-900 font-semibold'
                            : 'bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        Month
                      </button>
                      <button
                        type="button"
                        onClick={() => setCalendarViewMode('week')}
                        className={`px-3 py-1 text-xs font-medium transition-colors ${
                          calendarViewMode === 'week'
                            ? 'bg-muted text-slate-900 font-semibold'
                            : 'bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        Week
                      </button>
                    </div>
                  </div>
                </div>

                {/* MONTH VIEW GRID (Screenshot 2 & 3) */}
                {calendarViewMode === 'month' && (
                  <div className="border border-border rounded overflow-hidden">
                    {/* Day Headers: Sun Mon Tue Wed Thu Fri Sat */}
                    <div className="grid grid-cols-7 bg-background border-b border-border text-center text-xs font-semibold text-foreground py-2">
                      <div>Sun</div>
                      <div>Mon</div>
                      <div>Tue</div>
                      <div>Wed</div>
                      <div>Thu</div>
                      <div>Fri</div>
                      <div>Sat</div>
                    </div>

                    {/* 35 or 42 Month Grid Cells */}
                    <div className="grid grid-cols-7 border-collapse">
                      {calendarMonthGrid.map((cell, idx) => {
                        const dayEvents = calendarEvents.filter(e => e.start.startsWith(cell.dateString));
                        return (
                          <div
                            key={idx}
                            onClick={() => handleOpenNewEvent(cell.dateString)}
                            className={`min-h-[110px] sm:min-h-[125px] p-1.5 border-b border-r border-border relative transition-colors cursor-pointer group ${
                              !cell.isCurrentMonth
                                ? 'bg-muted text-muted-foreground' // Greyed out overflow days (Screenshot 2)
                                : cell.isToday
                                ? 'bg-amber-50 text-foreground' // Today yellow highlight (Screenshot 2)
                                : 'bg-white hover:bg-slate-50/70 text-foreground'
                            }`}
                          >
                            {/* Day Number in top-right */}
                            <div className="text-right text-xs font-semibold select-none mb-1">
                              {cell.dayNumber}
                            </div>

                            {/* Scheduled Events Badges */}
                            <div className="space-y-1 overflow-y-auto max-h-[85px]">
                              {dayEvents.map(calEv => (
                                <div
                                  key={calEv.id}
                                  onClick={e => {
                                    e.stopPropagation();
                                    if (calEv.eventRecord) {
                                      setSelectedEventForDetails(calEv.eventRecord);
                                      setDetailsModalOpen(true);
                                    }
                                  }}
                                  className={`px-1.5 py-1 rounded text-[11px] leading-tight text-white shadow-xs cursor-pointer hover:opacity-95 transition-opacity ${
                                    calEv.status === 'confirmed'
                                      ? 'bg-emerald-700'
                                      : calEv.status === 'pending'
                                      ? 'bg-amber-600'
                                      : 'bg-slate-600'
                                  }`}
                                  title={`${calEv.title} (${calEv.status})`}
                                >
                                  <div className="flex items-center justify-between font-semibold">
                                    <span className="truncate">
                                      {calEv.start.split('T')[1]?.slice(0, 5)} {calEv.title}
                                    </span>
                                    {calEv.guestCount && (
                                      <span className="flex items-center gap-0.5 text-[10px] opacity-90">
                                        <Users className="w-2.5 h-2.5" />
                                        {calEv.guestCount}
                                      </span>
                                    )}
                                  </div>
                                  {calEv.venueName && (
                                    <div className="text-[10px] opacity-90 truncate flex items-center gap-0.5 mt-0.5">
                                      <Building className="w-2.5 h-2.5" />
                                      {calEv.venueName}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* WEEK VIEW GRID */}
                {calendarViewMode === 'week' && (
                  <div className="border border-border rounded overflow-hidden">
                    {/* Header: 7 Days of Active Week */}
                    <div className="grid grid-cols-8 bg-background border-b border-border text-center text-xs font-semibold text-foreground py-2">
                      <div className="text-slate-400">Time</div>
                      {calendarWeekDays.map((wDay, idx) => (
                        <div
                          key={idx}
                          className={wDay.isToday ? 'text-blue-700 bg-blue-50/50 py-0.5 rounded' : ''}
                        >
                          <div>{wDay.dayName}</div>
                          <div className="text-[11px] font-normal text-slate-500">{wDay.dayNumber}</div>
                        </div>
                      ))}
                    </div>

                    {/* Hourly Rows */}
                    <div className="max-h-[500px] overflow-y-auto">
                      {hoursOfDay.map(hour => (
                        <div key={hour} className="grid grid-cols-8 border-b border-slate-100 min-h-[44px]">
                          <div className="p-1.5 text-right text-[11px] font-mono text-slate-400 border-r border-slate-200 select-none bg-slate-50/50">
                            {hour}
                          </div>

                          {calendarWeekDays.map(wDay => {
                            const matchingEvents = calendarEvents.filter(
                              e => e.start.startsWith(wDay.dateString) && e.start.includes(`T${hour}`)
                            );
                            return (
                              <div
                                key={wDay.dateString}
                                onClick={() => handleOpenNewEvent(wDay.dateString, hour)}
                                className={`p-1 border-r border-slate-100 relative hover:bg-blue-50/30 cursor-pointer transition-colors ${
                                  wDay.isToday ? 'bg-amber-50/40' : ''
                                }`}
                              >
                                {matchingEvents.map(ev => (
                                  <div
                                    key={ev.id}
                                    onClick={e => {
                                      e.stopPropagation();
                                      if (ev.eventRecord) {
                                        setSelectedEventForDetails(ev.eventRecord);
                                        setDetailsModalOpen(true);
                                      }
                                    }}
                                    className={`p-1 rounded text-[10px] text-white font-medium shadow-xs ${
                                      ev.status === 'confirmed' ? 'bg-emerald-700' : 'bg-amber-600'
                                    }`}
                                  >
                                    <div className="truncate font-semibold">{ev.title}</div>
                                    <div className="text-[9px] opacity-90">{ev.venueName}</div>
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: STATUS UPDATE (MATCHES OMEGA statusUpdate MODAL) */}
      {/* ------------------------------------------------------------- */}
      {statusModalOpen && statusModalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-semibold text-slate-800">Update Event Status</h3>
              <button
                type="button"
                onClick={() => setStatusModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Event Name</label>
                <div className="text-sm font-medium text-slate-900 bg-slate-100 px-3 py-2 rounded">
                  {statusModalEvent.event_name}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Status</label>
                <select
                  value={newStatusValue}
                  onChange={e => setNewStatusValue(e.target.value as any)}
                  className="w-full h-[36px] px-3 text-xs border border-border rounded focus:outline-none focus:border-primary bg-white"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setStatusModalOpen(false)}
                className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCommitStatusUpdate}
                className="px-4 py-1.5 text-xs font-medium text-white bg-primary hover:bg-primary/90 rounded shadow-sm font-semibold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: EVENT DETAILS MODAL */}
      {/* ------------------------------------------------------------- */}
      {detailsModalOpen && selectedEventForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-semibold text-slate-800">{selectedEventForDetails.event_name}</h3>
                <span className="text-xs text-slate-500">ID #{selectedEventForDetails.evnt_id}</span>
              </div>
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded border border-slate-100">
                <div>
                  <span className="text-slate-500">Date & Time:</span>
                  <div className="font-semibold text-slate-800">
                    {selectedEventForDetails.event_date} ({selectedEventForDetails.event_start_time} - {selectedEventForDetails.event_end_time || 'End'})
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Status:</span>
                  <div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold text-white uppercase ${
                        selectedEventForDetails.event_status === 'confirmed'
                          ? 'bg-emerald-600'
                          : selectedEventForDetails.event_status === 'pending'
                          ? 'bg-amber-600'
                          : 'bg-slate-500'
                      }`}
                    >
                      {selectedEventForDetails.event_status}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Venue:</span>
                  <div className="font-semibold text-slate-800">{selectedEventForDetails.venue_name || 'None'}</div>
                </div>
                <div>
                  <span className="text-slate-500">Guests:</span>
                  <div className="font-semibold text-slate-800">{selectedEventForDetails.nb_of_guest} attendees</div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="p-3 bg-blue-50/40 rounded border border-blue-100">
                <div className="font-semibold text-blue-900 mb-1">Customer Information</div>
                <div className="text-slate-700">{selectedEventForDetails.customerName}</div>
                {selectedEventForDetails.customer?.COMPANY && (
                  <div className="text-slate-600 font-semibold">{selectedEventForDetails.customer.COMPANY}</div>
                )}
                <div className="text-slate-500">{selectedEventForDetails.customer?.PHONE || selectedEventForDetails.customer?.MOBILETEL}</div>
              </div>

              {/* Assigned Resources */}
              {selectedEventForDetails.resources && selectedEventForDetails.resources.length > 0 && (
                <div>
                  <div className="font-semibold text-slate-800 mb-1">Allocated Resources:</div>
                  <div className="space-y-1">
                    {selectedEventForDetails.resources.map(res => (
                      <div key={res.id} className="p-2 bg-slate-50 rounded border border-slate-200 flex justify-between">
                        <span>{res.resource_name}</span>
                        <span className="text-slate-500 font-medium">({res.resource_type})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assigned Drivers */}
              {selectedEventForDetails.drivers && selectedEventForDetails.drivers.length > 0 && (
                <div>
                  <div className="font-semibold text-slate-800 mb-1">Assigned Drivers:</div>
                  <div className="space-y-1">
                    {selectedEventForDetails.drivers.map(drv => (
                      <div key={drv.id} className="p-2 bg-slate-50 rounded border border-slate-200 flex justify-between">
                        <span>{drv.NAME} ({drv.role || 'Driver'})</span>
                        <span className="text-slate-500">{drv.MOBILETEL}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedEventForDetails.event_notes && (
                <div>
                  <div className="font-semibold text-slate-800 mb-1">Notes:</div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-200 text-slate-600 italic">
                    {selectedEventForDetails.event_notes}
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  setDetailsModalOpen(false);
                  handleOpenStatusModal(selectedEventForDetails);
                }}
                className="px-3 py-1.5 text-xs text-blue-700 bg-blue-100 hover:bg-blue-200 rounded font-medium"
              >
                Change Status
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDetailsModalOpen(false);
                    handleEditEvent(selectedEventForDetails);
                  }}
                  className="px-3 py-1.5 text-xs text-white bg-primary hover:bg-primary/90 rounded"
                >
                  Edit Event
                </button>
                <button
                  type="button"
                  onClick={() => setDetailsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* QUICK ADD MODAL: CUSTOMER */}
      {/* ------------------------------------------------------------- */}
      {addCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-semibold text-slate-800">Add New Customer</h3>
              <button type="button" onClick={() => setAddCustomerModalOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleQuickAddCustomer} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={newCustomerForm.NAME}
                  onChange={e => setNewCustomerForm({ ...newCustomerForm, NAME: e.target.value })}
                  className="w-full h-8 px-2 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Family Name</label>
                <input
                  type="text"
                  value={newCustomerForm.FAMILYNAME}
                  onChange={e => setNewCustomerForm({ ...newCustomerForm, FAMILYNAME: e.target.value })}
                  className="w-full h-8 px-2 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company</label>
                <input
                  type="text"
                  value={newCustomerForm.COMPANY}
                  onChange={e => setNewCustomerForm({ ...newCustomerForm, COMPANY: e.target.value })}
                  className="w-full h-8 px-2 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mobile / Phone</label>
                <input
                  type="text"
                  value={newCustomerForm.PHONE}
                  onChange={e => setNewCustomerForm({ ...newCustomerForm, PHONE: e.target.value })}
                  className="w-full h-8 px-2 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newCustomerForm.EMAIL}
                  onChange={e => setNewCustomerForm({ ...newCustomerForm, EMAIL: e.target.value })}
                  className="w-full h-8 px-2 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Automatic Discount (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newCustomerForm.AUTOMATICDISCOUNT}
                  onChange={e => setNewCustomerForm({ ...newCustomerForm, AUTOMATICDISCOUNT: Number(e.target.value) })}
                  className="w-full h-8 px-2 border border-slate-300 rounded"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddCustomerModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded"
                >
                  Create Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* QUICK ADD MODAL: EVENT TYPE */}
      {/* ------------------------------------------------------------- */}
      {addEventTypeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-semibold text-slate-800">Add Event Type</h3>
              <button type="button" onClick={() => setAddEventTypeModalOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleQuickAddEventType} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Event Type Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Olive Harvest Gala"
                  value={newEventTypeForm.type_name}
                  onChange={e => setNewEventTypeForm({ type_name: e.target.value })}
                  className="w-full h-8 px-2 border border-slate-300 rounded"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddEventTypeModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded"
                >
                  Save Type
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* AUTHENTIC EVENT VENUE MODAL (NEW / EDIT / QUICK ADD) */}
      {/* ------------------------------------------------------------- */}
      <EventVenueModal
        isOpen={addVenueModalOpen || venueModalOpen}
        venueToEdit={venueToEdit}
        onClose={() => {
          setAddVenueModalOpen(false);
          setVenueModalOpen(false);
          setVenueToEdit(null);
        }}
        onSaved={savedVenue => {
          setVenuesList(EventsService.getVenues());
          setNewEventFormData(prev => ({ ...prev, venue_id: savedVenue.venue_id }));
          showToast(`Venue "${savedVenue.venue_name}" saved successfully`, 'success');
          setAddVenueModalOpen(false);
          setVenueModalOpen(false);
          setVenueToEdit(null);
        }}
      />

      {/* ------------------------------------------------------------- */}
      {/* AUTHENTIC OMEGA MODAL: NEW / EDIT RESOURCE */}
      {/* ------------------------------------------------------------- */}
      {addResourceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xl overflow-hidden border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-background">
              <h3 className="text-base font-semibold text-slate-800">
                {isEditResource ? 'Edit Resource' : 'New Resource'}
              </h3>
              <button
                type="button"
                onClick={() => setAddResourceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form id="newEventResourceForm" onSubmit={handleSaveResourceModal} className="p-5 space-y-4 text-xs">
              {/* Card 1: General */}
              <div className="card border border-border rounded">
                <div className="card-header bg-background border-b border-border px-3 py-2 font-semibold text-slate-700">
                  General
                </div>
                <div className="card-body p-3 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Resource Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter resource name"
                        value={newResourceForm.resource_name}
                        onChange={e => setNewResourceForm({ ...newResourceForm, resource_name: e.target.value })}
                        className="w-full h-8 px-2.5 border border-border rounded focus:outline-none focus:border-primary"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Resource Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newResourceForm.resource_type}
                        onChange={e => setNewResourceForm({ ...newResourceForm, resource_type: Number(e.target.value) })}
                        className="w-full h-8 px-2.5 border border-border rounded focus:outline-none focus:border-primary bg-white"
                      >
                        <option value={0}>In House</option>
                        <option value={1}>Out Source</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Resource Remark</label>
                    <input
                      type="text"
                      placeholder="Enter resource remark"
                      value={newResourceForm.resource_remark}
                      onChange={e => setNewResourceForm({ ...newResourceForm, resource_remark: e.target.value })}
                      className="w-full h-8 px-2.5 border border-border rounded focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Resource Description</label>
                    <textarea
                      rows={2}
                      placeholder="Enter resource description"
                      value={newResourceForm.resource_description}
                      onChange={e => setNewResourceForm({ ...newResourceForm, resource_description: e.target.value })}
                      className="w-full p-2 border border-border rounded focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Suppliers (conditional if Out Source / 1) */}
              {newResourceForm.resource_type === 1 && (
                <div className="card border border-border rounded">
                  <div className="card-header bg-background border-b border-border px-3 py-2 font-semibold text-slate-700">
                    Suppliers
                  </div>
                  <div className="card-body p-3">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Search Supplier <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        multiple
                        value={newResourceForm.selectedInvSuppliers.map(String)}
                        onChange={e => {
                          const selected = Array.from(e.target.selectedOptions, opt => Number(opt.value));
                          setNewResourceForm({ ...newResourceForm, selectedInvSuppliers: selected });
                        }}
                        className="flex-1 min-h-[70px] p-2 border border-border rounded focus:outline-none focus:border-primary bg-white text-xs"
                      >
                        {suppliersInvList.map(sup => (
                          <option key={sup.SUPPLIERID} value={sup.SUPPLIERID}>
                            {sup.SUPPLIERNAME} ({sup.PHONE || 'No Phone'})
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">Hold Ctrl / Cmd to select multiple inventory suppliers.</p>
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddResourceModalOpen(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="saveNewEventResource"
                  className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Save className="w-3.5 h-3.5" /> Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* AUTHENTIC OMEGA MODAL: NEW DRIVER */}
      {/* ------------------------------------------------------------- */}
      {addDriverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-background">
              <h3 className="text-base font-semibold text-slate-800">New Driver</h3>
              <button
                type="button"
                onClick={() => setAddDriverModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form id="newDriverForm" onSubmit={handleSaveDriverModal} className="p-5 space-y-4 text-xs">
              <div className="card border border-border rounded">
                <div className="card-header bg-background border-b border-border px-3 py-2 font-semibold text-slate-700">
                  Driver Information
                </div>
                <div className="card-body p-3 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Driver Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Charbel Tannous"
                        value={newDriverForm.NAME}
                        onChange={e => setNewDriverForm({ ...newDriverForm, NAME: e.target.value })}
                        className="w-full h-8 px-2.5 border border-border rounded focus:outline-none focus:border-primary"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Mobile / Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. +961 70 882 101"
                        value={newDriverForm.MOBILETEL}
                        onChange={e => setNewDriverForm({ ...newDriverForm, MOBILETEL: e.target.value })}
                        className="w-full h-8 px-2.5 border border-border rounded focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Assigned Branch <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newDriverForm.branchid}
                        onChange={e => setNewDriverForm({ ...newDriverForm, branchid: Number(e.target.value) })}
                        className="w-full h-8 px-2.5 border border-border rounded focus:outline-none focus:border-primary bg-white"
                      >
                        <option value={1}>Zeit w zaytoun ljanoub</option>
                        <option value={2}>Beirut Central Distribution Depot</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Role / Status</label>
                      <input
                        type="text"
                        placeholder="e.g. Senior Transport Driver"
                        value={newDriverForm.role}
                        onChange={e => setNewDriverForm({ ...newDriverForm, role: e.target.value })}
                        className="w-full h-8 px-2.5 border border-border rounded focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Driving License / Permit Number</label>
                    <input
                      type="text"
                      placeholder="e.g. LBN-DRV-0089"
                      value={newDriverForm.license_number}
                      onChange={e => setNewDriverForm({ ...newDriverForm, license_number: e.target.value })}
                      className="w-full h-8 px-2.5 border border-border rounded focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Remarks / Vehicle Notes</label>
                    <textarea
                      rows={2}
                      placeholder="Optional notes or vehicle plate assignment..."
                      value={newDriverForm.remark}
                      onChange={e => setNewDriverForm({ ...newDriverForm, remark: e.target.value })}
                      className="w-full p-2 border border-border rounded focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddDriverModalOpen(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="saveNewDriver"
                  className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Save className="w-3.5 h-3.5" /> Save Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* AUTHENTIC OMEGA MODAL: NEW / EDIT EVENT TYPE                  */}
      {/* ------------------------------------------------------------- */}
      {eventTypeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <h3 className="text-sm font-semibold">
                {eventTypeToEdit ? 'Edit Event Type' : 'New Event Type'}
              </h3>
              <button
                type="button"
                onClick={() => setEventTypeModalOpen(false)}
                className="text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form id="eventTypeForm" onSubmit={handleSaveEventType} className="p-5 space-y-4 text-xs">
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Type Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter type name"
                    value={eventTypeFormData.type_name}
                    onChange={e => setEventTypeFormData({ ...eventTypeFormData, type_name: e.target.value })}
                    className="w-full h-8 px-2.5 border border-border rounded focus:outline-none focus:border-primary"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Enter description"
                    value={eventTypeFormData.description}
                    onChange={e => setEventTypeFormData({ ...eventTypeFormData, description: e.target.value })}
                    className="w-full p-2 border border-border rounded focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEventTypeModalOpen(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="saveNewEventType"
                  className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Save className="w-3.5 h-3.5" /> Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 text-center text-xs text-muted-foreground border-t border-border pt-4">
        © 2026 Vanguard ERP. All rights reserved. &nbsp;|&nbsp;
        <span className="hover:underline cursor-pointer"> Privacy Policy</span> &nbsp;|&nbsp;
        <span className="hover:underline cursor-pointer"> Terms and Conditions</span> &nbsp;|&nbsp;
        <span className="hover:underline cursor-pointer"> Support</span> &nbsp;|&nbsp;
        <span className="hover:underline cursor-pointer"> Feedback</span>
      </footer>

      {/* Floating Scroll to Top button (Screenshot 3) */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 w-10 h-10 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105"
        title="Scroll to Top"
      >
        <ChevronUp className="w-5 h-5" />
      </button>
    </div>
  );
}
