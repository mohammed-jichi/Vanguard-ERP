// lib/eventsService.ts
// Authentic Omega ERP Events Service

import {
  OmegaEventRecord,
  OmegaCalendarEvent,
  OmegaEventCustomer,
  OmegaEventResourceItem,
  OmegaEventDriverItem,
  OmegaEventTypeItem,
  OmegaEventVenueItem,
  INITIAL_OMEGA_EVENTS,
  SEED_CUSTOMERS,
  SEED_EVENT_TYPES,
  SEED_EVENT_VENUES,
  SEED_EVENT_RESOURCES,
  SEED_EMPLOYEES,
  SEED_SUPPLIERS,
  OmegaSupplierItem
} from './eventsData';

let eventsStore: OmegaEventRecord[] = [...INITIAL_OMEGA_EVENTS];
let customersStore: OmegaEventCustomer[] = [...SEED_CUSTOMERS];
let eventTypesStore: OmegaEventTypeItem[] = [...SEED_EVENT_TYPES];
let venuesStore: OmegaEventVenueItem[] = [...SEED_EVENT_VENUES];
let resourcesStore: OmegaEventResourceItem[] = [...SEED_EVENT_RESOURCES];
let employeesStore: OmegaEventDriverItem[] = [...SEED_EMPLOYEES];
let suppliersStore: OmegaSupplierItem[] = [...SEED_SUPPLIERS];

let nextEventId = 1003;
let nextResourceId = 7;
let nextEmployeeId = 5;

export interface GetEventsParams {
  page?: number;
  per_page?: number;
  searchvalue?: string;
  sorting?: {
    value: string;
    type: 'asc' | 'desc';
  };
  customer_id?: number;
  include_event_types?: boolean;
  is_form?: boolean;
  filter?: {
    branchid?: number | string;
    evnt_status?: string;
    date?: string | null;
  };
}

export class EventsService {
  public static getEvents(params: GetEventsParams = {}) {
    let list = [...eventsStore];

    const branchid = params.filter?.branchid;
    if (branchid && branchid !== 'all' && branchid !== 0) {
      const bId = Number(branchid);
      list = list.filter(e => e.branch_id === bId);
    }

    const evnt_status = params.filter?.evnt_status;
    if (evnt_status && evnt_status !== 'all') {
      list = list.filter(e => e.event_status.toLowerCase() === evnt_status.toLowerCase());
    }

    const dateFilter = params.filter?.date;
    if (dateFilter) {
      const targetDate = dateFilter.split(' ')[0].split('T')[0];
      list = list.filter(e => e.event_date.startsWith(targetDate));
    }

    const search = params.searchvalue?.trim().toLowerCase();
    if (search) {
      list = list.filter(e => {
        return (
          e.event_name.toLowerCase().includes(search) ||
          e.customerName.toLowerCase().includes(search) ||
          (e.customer?.COMPANY && e.customer.COMPANY.toLowerCase().includes(search)) ||
          (e.customer?.PHONE && e.customer.PHONE.includes(search)) ||
          (e.customer?.MOBILETEL && e.customer.MOBILETEL.includes(search)) ||
          (e.customer?.EMAIL && e.customer.EMAIL.toLowerCase().includes(search)) ||
          e.evnt_id.toString().includes(search) ||
          e.type.type_name.toLowerCase().includes(search)
        );
      });
    }

    if (params.sorting && params.sorting.value) {
      const { value, type } = params.sorting;
      list.sort((a, b) => {
        let valA: any = (a as any)[value];
        let valB: any = (b as any)[value];

        if (value === 'customer.COMPANY') {
          valA = a.customer?.COMPANY || '';
          valB = b.customer?.COMPANY || '';
        } else if (value === 'type.type_name') {
          valA = a.type?.type_name || '';
          valB = b.type?.type_name || '';
        }

        if (valA === undefined || valA === null) valA = '';
        if (valB === undefined || valB === null) valB = '';

        if (typeof valA === 'string') {
          return type === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        } else {
          return type === 'asc' ? valA - valB : valB - valA;
        }
      });
    } else {
      list.sort((a, b) => b.evnt_id - a.evnt_id);
    }

    const page = params.page || 1;
    const perPage = params.per_page || 15;
    const total = list.length;
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    const offset = (page - 1) * perPage;
    const paginatedData = list.slice(offset, offset + perPage);

    return {
      current_page: page,
      data: paginatedData,
      last_page: lastPage,
      total,
      per_page: perPage
    };
  }

  public static getEventById(id: number | string): OmegaEventRecord | undefined {
    const numId = Number(id);
    const ev = eventsStore.find(e => e.evnt_id === numId);
    if (ev) return ev;
    // Fallback if ID is string or loose equality
    return eventsStore.find(e => String(e.evnt_id) === String(id));
  }

  public static getEventsForCalendar(filter: { branchid?: number | string; evnt_status?: string; date?: string } = {}): OmegaCalendarEvent[] {
    let list = [...eventsStore];

    if (filter.branchid && filter.branchid !== 'all' && filter.branchid !== 0) {
      const bId = Number(filter.branchid);
      list = list.filter(e => e.branch_id === bId);
    }

    if (filter.evnt_status && filter.evnt_status !== 'all') {
      list = list.filter(e => e.event_status.toLowerCase() === filter.evnt_status?.toLowerCase());
    }

    return list.map(e => {
      const startTime = e.event_start_time || '09:00';
      const endTime = e.event_end_time || '18:00';

      const startIso = `${e.event_date}T${startTime.length === 5 ? startTime : startTime.padStart(5, '0')}:00`;
      const endIso = `${e.event_date}T${endTime.length === 5 ? endTime : endTime.padStart(5, '0')}:00`;

      let bgColor = '#f39c12'; // pending: orange
      let borderColor = '#d68910';
      if (e.event_status === 'confirmed') {
        bgColor = '#27ae60'; // confirmed: green
        borderColor = '#1e8449';
      } else if (e.event_status === 'cancelled') {
        bgColor = '#7f8c8d'; // cancelled: grey
        borderColor = '#5f6a6a';
      }

      return {
        id: e.evnt_id,
        title: e.event_name,
        start: startIso,
        end: endIso,
        allDay: false,
        backgroundColor: bgColor,
        borderColor: borderColor,
        textColor: '#ffffff',
        guestCount: e.nb_of_guest,
        venueName: e.venue_name,
        venueId: e.venue_id,
        status: e.event_status,
        customerName: e.customerName,
        company: e.customer?.COMPANY,
        branchName: e.branch_name,
        typeName: e.type.type_name,
        eventRecord: e
      };
    });
  }

  public static saveEvent(payload: {
    eventForm: any;
    customer_id?: number;
    eventDriversForm?: { employee_ids?: number[] };
    eventVenueForm?: { event_venue_id?: number | string | null };
    eventResourcesForm?: { resource_ids?: number[] };
    status_save?: boolean;
    overlap?: boolean;
  }) {
    const { eventForm, customer_id, eventDriversForm, eventVenueForm, eventResourcesForm, status_save, overlap } = payload;

    // Quick status update check
    if (status_save) {
      const evntId = Number(eventForm.evnt_id);
      const existing = eventsStore.find(e => e.evnt_id === evntId);
      if (existing) {
        existing.event_status = eventForm.event_status;
        existing.status = eventForm.event_status;
        if (eventForm.branchid) existing.branch_id = Number(eventForm.branchid);
        return { success: true, code: 1, message: 'Event Status Updated', event: existing };
      }
      return { success: false, code: 0, message: 'Event not found' };
    }

    // Check duplicate event name
    const existingName = eventsStore.find(e => 
      e.event_name.trim().toLowerCase() === eventForm.event_name.trim().toLowerCase() &&
      (!eventForm.evnt_id || e.evnt_id !== Number(eventForm.evnt_id))
    );
    if (existingName) {
      return {
        success: false,
        error: 'Event name already exists. Please choose a different name.',
        conflict: false
      };
    }

    // Check venue collision / overlap
    const venueId = eventVenueForm?.event_venue_id ? Number(eventVenueForm.event_venue_id) : (eventForm.venue_id ? Number(eventForm.venue_id) : null);
    if (venueId && !overlap) {
      const conflicts = eventsStore.filter(e => 
        e.venue_id === venueId &&
        e.event_date === eventForm.event_date &&
        e.evnt_id !== Number(eventForm.evnt_id) &&
        e.event_status !== 'cancelled' &&
        ((eventForm.event_start_time >= e.event_start_time && eventForm.event_start_time < (e.event_end_time || '23:59')) ||
         (eventForm.event_end_time > e.event_start_time && eventForm.event_end_time <= (e.event_end_time || '23:59')))
      );

      if (conflicts.length > 0) {
        return {
          conflict: true,
          message: 'There is a venue schedule conflict.',
          events: conflicts.map(c => `${c.event_name} (${c.event_start_time} - ${c.event_end_time || 'TBD'})`)
        };
      }
    }

    // Lookup customer
    const custId = customer_id || eventForm.customer_id;
    const customer = customersStore.find(c => c.CUSTOMERID === Number(custId)) || {
      CUSTOMERID: custId || 101,
      FAMILYNAME: '',
      NAME: eventForm.customerName || 'Valued Client',
      COMPANY: eventForm.company || '',
      PHONE: '+961 7 830 114',
      EMAIL: 'client@vanguard-erp.lb'
    };

    // Lookup type
    const typeId = Number(eventForm.event_type_id) || 1;
    const typeObj = eventTypesStore.find(t => t.id === typeId) || { id: typeId, type_name: 'Catering & Reception' };

    // Lookup venue
    const venueObj = venuesStore.find(v => v.venue_id === venueId);

    // Lookup resources
    const resourceIds = eventResourcesForm?.resource_ids || [];
    const assignedResources = resourcesStore.filter(r => resourceIds.includes(r.id));

    // Lookup drivers
    const employeeIds = eventDriversForm?.employee_ids || [];
    const assignedDrivers = employeesStore.filter(emp => employeeIds.includes(emp.id) || employeeIds.includes(emp.EMPLOYEEID));

    const branchName = eventForm.branchid === 2 ? 'Beirut Central Distribution Depot' : 'Zeit w zaytoun ljanoub';

    if (eventForm.evnt_id) {
      const evntId = Number(eventForm.evnt_id);
      const index = eventsStore.findIndex(e => e.evnt_id === evntId);
      if (index !== -1) {
        const updated: OmegaEventRecord = {
          ...eventsStore[index],
          event_name: eventForm.event_name,
          event_type_id: typeId,
          type: typeObj,
          event_date: eventForm.event_date,
          event_status: eventForm.event_status || 'pending',
          status: eventForm.event_status || 'pending',
          event_start_time: eventForm.event_start_time,
          event_end_time: eventForm.event_end_time,
          event_delivery_time: eventForm.event_delivery_time,
          event_delivery_type: eventForm.event_delivery_type || 'pickup',
          event_setup_time: eventForm.event_setup_time,
          nb_of_guest: Number(eventForm.nb_of_guest) || 1,
          event_notes: eventForm.event_notes,
          branch_id: Number(eventForm.branchid) || 1,
          branch_name: branchName,
          customer_id: customer.CUSTOMERID,
          customerName: `${customer.NAME} ${customer.FAMILYNAME || ''}`.trim(),
          customer,
          venue_id: venueId,
          venue_name: venueObj?.venue_name || '',
          resource_ids: resourceIds,
          resources: assignedResources,
          employee_ids: employeeIds,
          drivers: assignedDrivers
        };
        eventsStore[index] = updated;
        return { success: true, event: updated };
      }
    }

    const newEvent: OmegaEventRecord = {
      evnt_id: nextEventId++,
      event_name: eventForm.event_name,
      event_type_id: typeId,
      type: typeObj,
      event_date: eventForm.event_date,
      event_status: eventForm.event_status || 'pending',
      status: eventForm.event_status || 'pending',
      event_start_time: eventForm.event_start_time,
      event_end_time: eventForm.event_end_time,
      event_delivery_time: eventForm.event_delivery_time,
      event_delivery_type: eventForm.event_delivery_type || 'pickup',
      event_setup_time: eventForm.event_setup_time,
      nb_of_guest: Number(eventForm.nb_of_guest) || 1,
      event_notes: eventForm.event_notes,
      branch_id: Number(eventForm.branchid) || 1,
      branch_name: branchName,
      customer_id: customer.CUSTOMERID,
      customerName: `${customer.NAME} ${customer.FAMILYNAME || ''}`.trim(),
      customer,
      venue_id: venueId,
      venue_name: venueObj?.venue_name || '',
      resource_ids: resourceIds,
      resources: assignedResources,
      employee_ids: employeeIds,
      drivers: assignedDrivers,
      hasinvoice: false
    };

    eventsStore.unshift(newEvent);
    return { success: true, event: newEvent };
  }

  public static deleteEvent(evnt_id: number) {
    const initialLen = eventsStore.length;
    eventsStore = eventsStore.filter(e => e.evnt_id !== Number(evnt_id));
    return { success: eventsStore.length < initialLen };
  }

  public static getVenues(branchid?: number) {
    if (branchid) {
      return venuesStore.filter(v => !v.branchid || v.branchid === Number(branchid));
    }
    return venuesStore;
  }

  public static getVenuesPaged(params?: {
    page?: number;
    per_page?: number;
    searchvalue?: string;
    sorting?: { value: string; type: 'asc' | 'desc' };
    filter?: any;
  }) {
    let list = [...venuesStore];

    const search = params?.searchvalue?.trim().toLowerCase();
    if (search) {
      list = list.filter(
        v =>
          v.venue_name.toLowerCase().includes(search) ||
          (v.city && v.city.toLowerCase().includes(search)) ||
          (v.state && v.state.toLowerCase().includes(search)) ||
          (v.contact_name && v.contact_name.toLowerCase().includes(search)) ||
          (v.contact_phone && v.contact_phone.includes(search)) ||
          (v.contact_email && v.contact_email.toLowerCase().includes(search))
      );
    }

    if (params?.sorting?.value) {
      const { value, type } = params.sorting;
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

    const page = params?.page || 1;
    const perPage = params?.per_page || 10;
    const total = list.length;
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    const offset = (page - 1) * perPage;
    const paginatedData = list.slice(offset, offset + perPage);

    return {
      data: paginatedData,
      total,
      last_page: lastPage,
      current_page: page,
      per_page: perPage
    };
  }

  public static getVenueById(venue_id: number) {
    return venuesStore.find(v => v.venue_id === Number(venue_id)) || null;
  }

  public static saveVenue(venueForm: Partial<OmegaEventVenueItem>) {
    const venueId = venueForm.venue_id ? Number(venueForm.venue_id) : null;

    // Normalize social links with prefixes
    let venue_insta = venueForm.venue_insta?.trim() || '';
    if (venue_insta && !venue_insta.startsWith('http')) {
      venue_insta = 'https://www.instagram.com/' + venue_insta.replace(/^@/, '');
    }

    let venue_facebook = venueForm.venue_facebook?.trim() || '';
    if (venue_facebook && !venue_facebook.startsWith('http')) {
      venue_facebook = 'https://www.facebook.com/' + venue_facebook;
    }

    let venue_youtube = venueForm.venue_youtube?.trim() || '';
    if (venue_youtube && !venue_youtube.startsWith('http')) {
      venue_youtube = 'https://www.youtube.com/' + venue_youtube;
    }

    let venue_tiktok = venueForm.venue_tiktok?.trim() || '';
    if (venue_tiktok && !venue_tiktok.startsWith('http')) {
      venue_tiktok = 'https://www.tiktok.com/' + (venue_tiktok.startsWith('@') ? venue_tiktok : '@' + venue_tiktok);
    }

    if (venueId) {
      const idx = venuesStore.findIndex(v => v.venue_id === venueId);
      if (idx !== -1) {
        const updated: OmegaEventVenueItem = {
          ...venuesStore[idx],
          venue_name: venueForm.venue_name || venuesStore[idx].venue_name,
          contact_name: venueForm.contact_name || venuesStore[idx].contact_name,
          contact_email: venueForm.contact_email || venuesStore[idx].contact_email,
          country: venueForm.country ? Number(venueForm.country) : venuesStore[idx].country,
          dialing_code: venueForm.dialing_code || venuesStore[idx].dialing_code || '+961',
          contact_phone: venueForm.contact_phone ? String(venueForm.contact_phone) : venuesStore[idx].contact_phone,
          venue_url: venueForm.venue_url || '',
          venue_insta,
          venue_facebook,
          venue_youtube,
          venue_tiktok,
          city: venueForm.city || venuesStore[idx].city,
          state: venueForm.state || venuesStore[idx].state,
          street: venueForm.street || '',
          building: venueForm.building || '',
          floor: venueForm.floor || '',
          lat: venueForm.lat !== undefined ? (venueForm.lat ? Number(venueForm.lat) : null) : venuesStore[idx].lat,
          lng: venueForm.lng !== undefined ? (venueForm.lng ? Number(venueForm.lng) : null) : venuesStore[idx].lng,
          zone: venueForm.zone ? Number(venueForm.zone) : null,
          remark: venueForm.remark || '',
          branchid: venueForm.branchid || venuesStore[idx].branchid || 1,
          capacity: venueForm.capacity || venuesStore[idx].capacity || 100,
          address: `${venueForm.street || ''} ${venueForm.building || ''}, ${venueForm.city || ''}, ${venueForm.state || ''}`.trim()
        };
        venuesStore[idx] = updated;
        return { success: true, code: 1, message: 'Venue saved', data: updated };
      }
    }

    // Check duplicate name
    const existing = venuesStore.find(
      v => v.venue_name.trim().toLowerCase() === (venueForm.venue_name || '').trim().toLowerCase()
    );
    if (existing) {
      return { success: false, code: -1, message: 'Venue already exists' };
    }

    const newId = venuesStore.length + 10;
    const newVenue: OmegaEventVenueItem = {
      venue_id: newId,
      venue_name: venueForm.venue_name || `Venue #${newId}`,
      contact_name: venueForm.contact_name || '',
      contact_email: venueForm.contact_email || '',
      country: venueForm.country ? Number(venueForm.country) : 115,
      dialing_code: venueForm.dialing_code || '+961',
      contact_phone: venueForm.contact_phone ? String(venueForm.contact_phone) : '',
      venue_url: venueForm.venue_url || '',
      venue_insta,
      venue_facebook,
      venue_youtube,
      venue_tiktok,
      city: venueForm.city || '',
      state: venueForm.state || '',
      street: venueForm.street || '',
      building: venueForm.building || '',
      floor: venueForm.floor || '',
      lat: venueForm.lat ? Number(venueForm.lat) : null,
      lng: venueForm.lng ? Number(venueForm.lng) : null,
      zone: venueForm.zone ? Number(venueForm.zone) : null,
      remark: venueForm.remark || '',
      branchid: venueForm.branchid || 1,
      capacity: venueForm.capacity || 100,
      address: `${venueForm.street || ''} ${venueForm.building || ''}, ${venueForm.city || ''}, ${venueForm.state || ''}`.trim()
    };
    venuesStore.push(newVenue);
    return { success: true, code: 1, message: 'Venue saved', data: newVenue };
  }

  public static deleteVenue(venue_id: number) {
    const vId = Number(venue_id);
    const isAssigned = eventsStore.some(e => e.venue_id === vId && e.event_status !== 'cancelled');
    if (isAssigned) {
      return { success: false, code: 0, message: 'Venue is assigned to active event' };
    }
    const initialLen = venuesStore.length;
    venuesStore = venuesStore.filter(v => v.venue_id !== vId);
    return { success: venuesStore.length < initialLen, code: 1, message: 'Venue deleted' };
  }

  public static addVenue(venue: Partial<OmegaEventVenueItem>) {
    return this.saveVenue(venue).data;
  }

  public static getEventTypes(params?: {
    searchvalue?: string;
    sorting?: { value: string; type: 'asc' | 'desc' };
    page?: number;
    per_page?: number;
  }) {
    let list = [...eventTypesStore];

    const search = params?.searchvalue?.trim().toLowerCase();
    if (search) {
      list = list.filter(
        t =>
          t.type_name.toLowerCase().includes(search) ||
          (t.description && t.description.toLowerCase().includes(search))
      );
    }

    if (params?.sorting?.value) {
      const { value, type } = params.sorting;
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

    const page = params?.page || 1;
    const perPage = params?.per_page || 15;
    const total = list.length;
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    const offset = (page - 1) * perPage;
    const paginatedData = list.slice(offset, offset + perPage);

    return {
      data: paginatedData,
      total,
      last_page: lastPage,
      current_page: page,
      per_page: perPage
    };
  }

  public static saveEventType(payload: {
    evnt_type_id?: number | null;
    id?: number | null;
    type_name: string;
    description?: string;
    branchid?: number;
  }) {
    const typeName = payload.type_name?.trim();
    if (!typeName) {
      return { success: false, code: 0, message: 'Type Name is required' };
    }

    const targetId = payload.evnt_type_id || payload.id;

    // Check duplicate type_name (case-insensitive)
    const duplicate = eventTypesStore.find(
      t =>
        t.type_name.toLowerCase() === typeName.toLowerCase() &&
        (targetId ? t.id !== Number(targetId) && t.evnt_type_id !== Number(targetId) : true)
    );

    if (duplicate) {
      return { success: false, code: -1, message: 'Event Type already exists' };
    }

    if (targetId) {
      const idx = eventTypesStore.findIndex(
        t => t.id === Number(targetId) || t.evnt_type_id === Number(targetId)
      );
      if (idx !== -1) {
        const updated: OmegaEventTypeItem = {
          ...eventTypesStore[idx],
          type_name: typeName,
          description: payload.description !== undefined ? payload.description : eventTypesStore[idx].description,
          branchid: payload.branchid || eventTypesStore[idx].branchid || 1
        };
        eventTypesStore[idx] = updated;
        return { success: true, code: 1, message: 'Event Type saved', data: updated };
      }
    }

    const newId = eventTypesStore.length > 0 ? Math.max(...eventTypesStore.map(t => t.id || t.evnt_type_id || 0)) + 1 : 1;
    const newItem: OmegaEventTypeItem = {
      id: newId,
      evnt_type_id: newId,
      type_name: typeName,
      description: payload.description || '',
      branchid: payload.branchid || 1
    };
    eventTypesStore.push(newItem);
    return { success: true, code: 1, message: 'Event Type saved', data: newItem };
  }

  public static deleteEventType(idOrEvntTypeId: number) {
    const targetId = Number(idOrEvntTypeId);
    // Check if assigned to any event
    const isAssigned = eventsStore.some(
      e => Number(e.event_type_id) === targetId || e.type?.id === targetId
    );
    if (isAssigned) {
      return { success: false, code: 0, message: 'You are not allowed to delete this event type' };
    }

    const initialLen = eventTypesStore.length;
    eventTypesStore = eventTypesStore.filter(
      t => t.id !== targetId && t.evnt_type_id !== targetId
    );
    return {
      success: eventTypesStore.length < initialLen,
      code: eventTypesStore.length < initialLen ? 1 : 0,
      message: eventTypesStore.length < initialLen ? 'Event type deleted' : 'Event type not found'
    };
  }

  public static addEventType(type: { type_name: string; branchid?: number; description?: string }) {
    return this.saveEventType(type).data;
  }

  public static getResourceSetup(params?: {
    searchvalue?: string;
    sorting?: { value: string; type: 'asc' | 'desc' };
    page?: number;
    per_page?: number;
  }) {
    let list = [...resourcesStore];

    const search = params?.searchvalue?.trim().toLowerCase();
    if (search) {
      list = list.filter(
        r =>
          r.resource_name.toLowerCase().includes(search) ||
          (r.resource_description && r.resource_description.toLowerCase().includes(search)) ||
          (r.resource_remark && r.resource_remark.toLowerCase().includes(search))
      );
    }

    if (params?.sorting?.value) {
      const { value, type } = params.sorting;
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

    const page = params?.page || 1;
    const perPage = params?.per_page || 15;
    const total = list.length;
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    const offset = (page - 1) * perPage;
    const paginatedData = list.slice(offset, offset + perPage);

    return {
      data: paginatedData,
      total,
      last_page: lastPage,
      current_page: page,
      per_page: perPage
    };
  }

  public static saveResourceSetup(payload: any) {
    const setup = payload.resource_setup || payload;
    const resId = setup.resource_setup_id || setup.id;

    const isOutSource = setup.resource_type === 1 || setup.resource_type === 'Out Source';
    const typeNum = isOutSource ? 1 : 0;
    const typeLabel = isOutSource ? 'Out Source' : 'In House';
    const suppliers = isOutSource ? (payload.resources || setup.selectedInvSuppliers || setup.suppliers || []) : [];

    if (resId) {
      const idx = resourcesStore.findIndex(r => r.id === Number(resId));
      if (idx !== -1) {
        const updated: OmegaEventResourceItem = {
          ...resourcesStore[idx],
          resource_name: setup.resource_name,
          resource_description: setup.resource_description || '',
          resource_remark: setup.resource_remark || '',
          resource_type: typeLabel,
          type: typeNum,
          cost_usd: Number(setup.cost_usd) || resourcesStore[idx].cost_usd || 50,
          suppliers
        };
        resourcesStore[idx] = updated;
        return { success: true, code: 1, data: updated };
      }
    }

    // Check duplicate name
    const existing = resourcesStore.find(
      r => r.resource_name.trim().toLowerCase() === setup.resource_name.trim().toLowerCase()
    );
    if (existing) {
      return { success: false, code: -1, message: 'Resource already exists' };
    }

    const newId = nextResourceId++;
    const newItem: OmegaEventResourceItem = {
      id: newId,
      resource_name: setup.resource_name,
      resource_description: setup.resource_description || '',
      resource_remark: setup.resource_remark || '',
      resource_type: typeLabel,
      type: typeNum,
      cost_usd: Number(setup.cost_usd) || 50,
      branchid: setup.branchid || 1,
      suppliers
    };
    resourcesStore.push(newItem);
    return { success: true, code: 1, data: newItem };
  }

  public static deleteResourceSetup(resource_id: number) {
    const rId = Number(resource_id);
    const isAssigned = eventsStore.some(e => e.resource_ids?.includes(rId));
    if (isAssigned) {
      return { success: false, code: 0, message: 'This Resource is assigned to active event' };
    }
    const initialLen = resourcesStore.length;
    resourcesStore = resourcesStore.filter(r => r.id !== rId);
    return { success: resourcesStore.length < initialLen, code: 1, message: 'Resource setup deleted' };
  }

  public static addResource(resource: Partial<OmegaEventResourceItem>) {
    return this.saveResourceSetup(resource).data;
  }

  public static getEmployeesByBranch(branchid?: number | string, searchvalue?: string) {
    let list = [...employeesStore];
    if (branchid && branchid !== 'all' && Number(branchid) !== 0) {
      const bId = Number(branchid);
      list = list.filter(e => !e.branchid || e.branchid === bId);
    }
    if (searchvalue) {
      const s = searchvalue.trim().toLowerCase();
      list = list.filter(
        e =>
          e.NAME.toLowerCase().includes(s) ||
          (e.MOBILETEL && e.MOBILETEL.includes(s)) ||
          (e.role && e.role.toLowerCase().includes(s)) ||
          (e.license_number && e.license_number.toLowerCase().includes(s))
      );
    }
    return list;
  }

  public static saveDriver(driverData: Partial<OmegaEventDriverItem>) {
    const driverId = driverData.id || driverData.EMPLOYEEID;
    if (driverId) {
      const idx = employeesStore.findIndex(e => e.id === Number(driverId) || e.EMPLOYEEID === Number(driverId));
      if (idx !== -1) {
        const updated: OmegaEventDriverItem = {
          ...employeesStore[idx],
          NAME: driverData.NAME || employeesStore[idx].NAME,
          MOBILETEL: driverData.MOBILETEL || employeesStore[idx].MOBILETEL,
          branchid: Number(driverData.branchid) || employeesStore[idx].branchid || 1,
          role: driverData.role || employeesStore[idx].role || 'Transport Driver',
          license_number: driverData.license_number || employeesStore[idx].license_number || '',
          remark: driverData.remark || employeesStore[idx].remark || '',
          SALESMANSTATUS: driverData.SALESMANSTATUS !== undefined ? driverData.SALESMANSTATUS : 1
        };
        employeesStore[idx] = updated;
        return { success: true, code: 1, driver: updated };
      }
    }

    const newId = nextEmployeeId++;
    const newDriver: OmegaEventDriverItem = {
      id: newId,
      EMPLOYEEID: newId,
      NAME: driverData.NAME || `Driver #${newId}`,
      MOBILETEL: driverData.MOBILETEL || '+961 70 000 000',
      branchid: Number(driverData.branchid) || 1,
      role: driverData.role || 'Transport Driver',
      license_number: driverData.license_number || `LBN-DRV-${String(newId).padStart(4, '0')}`,
      remark: driverData.remark || '',
      SALESMANSTATUS: 1
    };
    employeesStore.push(newDriver);
    return { success: true, code: 1, driver: newDriver };
  }

  public static deleteDriver(driver_id: number) {
    const dId = Number(driver_id);
    const isAssigned = eventsStore.some(e => e.employee_ids?.includes(dId));
    if (isAssigned) {
      return { success: false, code: 0, message: 'This Driver is assigned to an active event' };
    }
    const initialLen = employeesStore.length;
    employeesStore = employeesStore.filter(e => e.id !== dId && e.EMPLOYEEID !== dId);
    return { success: employeesStore.length < initialLen, code: 1, message: 'Driver deleted' };
  }

  public static getAllInvSuppliers(searchvalue?: string) {
    let list = [...suppliersStore];
    if (searchvalue) {
      const s = searchvalue.trim().toLowerCase();
      list = list.filter(
        sup =>
          sup.SUPPLIERNAME.toLowerCase().includes(s) ||
          (sup.PHONE && sup.PHONE.includes(s)) ||
          sup.SUPPLIERID.toString().includes(s)
      );
    }
    return { data: list, total: list.length, last_page: 1 };
  }

  public static addInvSupplier(supplier: Partial<OmegaSupplierItem>) {
    const newId = 100 + suppliersStore.length + 1;
    const item: OmegaSupplierItem = {
      SUPPLIERID: newId,
      SUPPLIERNAME: supplier.SUPPLIERNAME || `Supplier #${newId}`,
      PHONE: supplier.PHONE || '+961 1 000 000',
      EMAIL: supplier.EMAIL || 'supplier@vanguard-erp.lb'
    };
    suppliersStore.push(item);
    return item;
  }

  public static searchCustomers(searchvalue: string) {
    const val = searchvalue.trim().toLowerCase();
    if (!val) return customersStore;
    return customersStore.filter(c => 
      c.NAME.toLowerCase().includes(val) ||
      (c.FAMILYNAME && c.FAMILYNAME.toLowerCase().includes(val)) ||
      (c.COMPANY && c.COMPANY.toLowerCase().includes(val)) ||
      (c.PHONE && c.PHONE.includes(val)) ||
      (c.MOBILETEL && c.MOBILETEL.includes(val)) ||
      (c.EMAIL && c.EMAIL.toLowerCase().includes(val)) ||
      c.CUSTOMERID.toString().includes(val)
    );
  }

  public static getCustomerById(customerId: number) {
    return customersStore.filter(c => c.CUSTOMERID === Number(customerId));
  }

  public static addCustomer(customer: Partial<OmegaEventCustomer>) {
    const newId = 100 + customersStore.length + 1;
    const item: OmegaEventCustomer = {
      CUSTOMERID: newId,
      NAME: customer.NAME || 'New Customer',
      FAMILYNAME: customer.FAMILYNAME || '',
      COMPANY: customer.COMPANY || '',
      PHONE: customer.PHONE || '+961 7 830 114',
      MOBILETEL: customer.MOBILETEL || '+961 70 000 000',
      EMAIL: customer.EMAIL || 'new.customer@vanguard-erp.lb',
      AUTOMATICDISCOUNT: customer.AUTOMATICDISCOUNT || 0
    };
    customersStore.push(item);
    return item;
  }
}
