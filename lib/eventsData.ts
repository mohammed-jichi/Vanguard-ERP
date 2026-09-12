// lib/eventsData.ts
// Authentic Omega ERP Events Data Models & Seed Data

export interface OmegaEventCustomer {
  CUSTOMERID: number;
  COMPANY?: string;
  NAME: string;
  FAMILYNAME?: string;
  PHONE?: string;
  MOBILETEL?: string;
  EMAIL?: string;
  AUTOMATICDISCOUNT?: number;
}

export interface OmegaEventResourceItem {
  id: number;
  resource_name: string;
  resource_description?: string;
  resource_remark?: string;
  resource_type: 'In House' | 'Out Source';
  type: number; // 0 = In House, 1 = Out Source
  cost_usd: number;
  quantity?: number;
  branchid?: number;
  suppliers?: Array<{ SUPPLIERID: number; SUPPLIERNAME: string }> | number[];
}

export interface OmegaSupplierItem {
  SUPPLIERID: number;
  SUPPLIERNAME: string;
  PHONE?: string;
  EMAIL?: string;
}

export interface OmegaEventDriverItem {
  id: number;
  EMPLOYEEID: number;
  NAME: string;
  SALESMANSTATUS?: number;
  MOBILETEL?: string;
  branchid?: number;
  role?: string;
  remark?: string;
  license_number?: string;
}

export interface OmegaEventTypeItem {
  id: number;
  evnt_type_id?: number;
  type_name: string;
  description?: string;
  branchid?: number;
}

export interface OmegaEventVenueItem {
  venue_id: number;
  venue_name: string;
  contact_name: string;
  contact_email: string;
  country: number;
  dialing_code: string;
  contact_phone: string;
  venue_url?: string;
  venue_insta?: string;
  venue_youtube?: string;
  venue_facebook?: string;
  venue_tiktok?: string;
  city: string;
  state: string;
  street?: string;
  building?: string;
  floor?: string;
  lat: number | null;
  lng: number | null;
  zone?: number | null;
  remark?: string;
  branchid?: number;
  capacity?: number;
  address?: string;
}

export interface OmegaCountryItem {
  ID: number;
  COUNTRY_CODE: string;
  DIALING_CODE: string;
  NAME: string;
}

export interface OmegaRegionItem {
  id: number;
  name: string;
  center_lat: number;
  center_lng: number;
}

export interface OmegaSubRegionItem {
  id: number;
  name: string;
  region_id: number;
  region_name: string;
  lat: number;
  lng: number;
}

export interface OmegaZoneItem {
  ID: number;
  ZONE: string;
}

export interface OmegaEventRecord {
  evnt_id: number;
  event_name: string;
  event_type_id: number | string;
  type: {
    id: number;
    type_name: string;
  };
  event_date: string; // YYYY-MM-DD
  event_status: 'pending' | 'confirmed' | 'cancelled';
  status: 'pending' | 'confirmed' | 'cancelled';
  event_start_time: string; // '17:00'
  event_end_time?: string;   // '21:00'
  event_delivery_time?: string;
  event_delivery_type: 'pickup' | 'delivery';
  event_setup_time?: string;
  nb_of_guest: number;
  event_notes?: string;
  branch_id: number;
  branch_name: string;
  customer_id: number;
  customerName: string;
  customer: OmegaEventCustomer;
  venue_id?: number | null;
  venue_name?: string;
  resource_ids?: number[];
  resources?: OmegaEventResourceItem[];
  employee_ids?: number[];
  drivers?: OmegaEventDriverItem[];
  hasinvoice?: boolean;
  overlap?: boolean;
}

export interface OmegaCalendarEvent {
  id: number;
  title: string;
  start: string; // ISO or YYYY-MM-DDTHH:mm:ss
  end?: string;
  allDay: boolean;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  guestCount?: number;
  venueName?: string;
  venueId?: number | null;
  status: 'pending' | 'confirmed' | 'cancelled';
  customerName?: string;
  company?: string;
  branchName?: string;
  typeName?: string;
  eventRecord?: OmegaEventRecord;
}

// Authentic Seed Customers
export const SEED_CUSTOMERS: OmegaEventCustomer[] = [
  {
    CUSTOMERID: 9,
    COMPANY: 'Chami Trading & Catering',
    NAME: 'Mohammed',
    FAMILYNAME: 'Chami',
    PHONE: '78851503',
    MOBILETEL: '78851503',
    EMAIL: 'm.chami@omegapos.com',
    AUTOMATICDISCOUNT: 0
  },
  {
    CUSTOMERID: 101,
    COMPANY: 'Syndicate of Lebanese Gastronomy & Chefs',
    NAME: 'Hassan',
    FAMILYNAME: 'Jichi',
    PHONE: '+961 7 830 114',
    MOBILETEL: '+961 70 123 456',
    EMAIL: 'hassan.jichi@syndicate-lebanon.org',
    AUTOMATICDISCOUNT: 10
  },
  {
    CUSTOMERID: 102,
    COMPANY: 'Beirut Chamber of Commerce Agricultural Council',
    NAME: 'Rana',
    FAMILYNAME: 'Atallah',
    PHONE: '+961 1 432 899',
    MOBILETEL: '+961 3 987 654',
    EMAIL: 'r.atallah@cciab.org.lb',
    AUTOMATICDISCOUNT: 5
  },
  {
    CUSTOMERID: 103,
    COMPANY: 'Hasbaya Olive Growers Cooperative',
    NAME: 'Fadi',
    FAMILYNAME: 'Kassir',
    PHONE: '+961 7 554 210',
    MOBILETEL: '+961 71 889 900',
    EMAIL: 'fadi.kassir@hasbaya-coop.lb',
    AUTOMATICDISCOUNT: 15
  },
  {
    CUSTOMERID: 104,
    COMPANY: 'Grand Hills Bistro & Catering S.A.L.',
    NAME: 'Zeina',
    FAMILYNAME: 'Mroueh',
    PHONE: '+961 1 765 432',
    MOBILETEL: '+961 76 543 210',
    EMAIL: 'zeina@grandhills-bistro.com',
    AUTOMATICDISCOUNT: 8
  }
];

// Authentic Seed Event Types
export const SEED_EVENT_TYPES: OmegaEventTypeItem[] = [
  { id: 1, evnt_type_id: 1, type_name: 'Party', description: 'Celebrations, birthdays, anniversaries and casual private gatherings', branchid: 1 },
  { id: 2, evnt_type_id: 2, type_name: 'Catering & Buffet Reception', description: 'Full buffet and live culinary station catering services', branchid: 1 },
  { id: 3, evnt_type_id: 3, type_name: 'Olive Oil Tasting & Masterclass', description: 'Sommelier guided tasting and organoleptic sensory workshop', branchid: 1 },
  { id: 4, evnt_type_id: 4, type_name: 'Corporate Harvest Gala', description: 'Annual corporate banquets, investor showcases and seasonal awards', branchid: 1 },
  { id: 5, evnt_type_id: 5, type_name: 'VIP Private Dinner', description: 'Exclusive executive dinners with curated multi-course menus', branchid: 1 },
  { id: 6, evnt_type_id: 6, type_name: 'Wedding & Social Banquet', description: 'Large scale wedding receptions and formal family banquets', branchid: 1 }
];

// Authentic Seed Venues
export const SEED_EVENT_VENUES: OmegaEventVenueItem[] = [
  {
    venue_id: 1,
    venue_name: 'Zeit w Zaytoun Heritage Courtyard (South)',
    contact_name: 'Ahmad Moussawi',
    contact_email: 'events@zeitwzaytoun.lb',
    country: 115,
    dialing_code: '+961',
    contact_phone: '7740100',
    venue_url: 'https://zeitwzaytoun.lb',
    venue_insta: 'https://www.instagram.com/zeitwzaytoun',
    venue_facebook: 'https://www.facebook.com/zeitwzaytoun',
    venue_youtube: 'https://www.youtube.com/@zeitwzaytoun',
    venue_tiktok: 'https://www.tiktok.com/@zeitwzaytoun',
    city: 'Sour',
    state: 'Sour',
    street: 'Coastal Maritime Road',
    building: 'Courtyard Estate Block A',
    floor: 'Ground Terrace',
    lat: 33.2705,
    lng: 35.2038,
    zone: 4,
    remark: 'Outdoor amphitheater and stone olive press courtyard for banquets and tastings',
    branchid: 1,
    capacity: 250,
    address: 'Coastal Maritime Road, Sour, Lebanon'
  },
  {
    venue_id: 2,
    venue_name: 'Marjeyoun Press Mill & Olive Terrace',
    contact_name: 'Fadi Kassir',
    contact_email: 'fadi.kassir@hasbaya-coop.lb',
    country: 115,
    dialing_code: '+961',
    contact_phone: '7830114',
    venue_url: 'https://marjeyoun-mill.lb',
    venue_insta: 'https://www.instagram.com/marjeyoun_terrace',
    venue_facebook: 'https://www.facebook.com/marjeyounterrace',
    venue_youtube: '',
    venue_tiktok: '',
    city: 'Marjaayoun',
    state: 'Marjaayoun',
    street: 'Hasbaya Highway',
    building: 'Mill House',
    floor: 'Terrace Level 1',
    lat: 33.3595,
    lng: 35.5889,
    zone: 5,
    remark: 'Scenic view of Mount Hermon with century-old olive grove',
    branchid: 1,
    capacity: 180,
    address: 'Hasbaya Highway, Marjaayoun, Lebanon'
  },
  {
    venue_id: 3,
    venue_name: 'Beirut Distribution Grand Hall',
    contact_name: 'Zeina Mroueh',
    contact_email: 'events@vanguard-beirut.lb',
    country: 115,
    dialing_code: '+961',
    contact_phone: '1432899',
    venue_url: 'https://beirut-grandhall.lb',
    venue_insta: 'https://www.instagram.com/beirut_grandhall',
    venue_facebook: '',
    venue_youtube: '',
    venue_tiktok: '',
    city: 'Beirut Central',
    state: 'Beirut',
    street: 'Damascus Road',
    building: 'Hazmieh Commercial Complex',
    floor: '2nd Floor Grand Ballroom',
    lat: 33.8886,
    lng: 35.4955,
    zone: 1,
    remark: 'Modern temperature-controlled corporate banquet and presentation auditorium',
    branchid: 2,
    capacity: 120,
    address: 'Damascus Road, Beirut, Lebanon'
  }
];

// Authentic Seed Resources (matching Omega DB `getResourceSetup`)
export const SEED_EVENT_RESOURCES: OmegaEventResourceItem[] = [
  {
    id: 1,
    resource_name: 'Cobalt Sensory Tasting Glasses (Set of 50)',
    resource_description: 'Certified ISO sensory blue tasting glasses for olive oil organoleptic profiling',
    resource_remark: 'Stored in South Cabinet A',
    resource_type: 'In House',
    type: 0,
    cost_usd: 45.00,
    branchid: 1
  },
  {
    id: 2,
    resource_name: 'Mobile Wireless PA Sound System & Mics',
    resource_description: 'Dual wireless microphones with portable amplifier and Bluetooth connectivity',
    resource_remark: 'Battery-powered amplifier unit',
    resource_type: 'In House',
    type: 0,
    cost_usd: 120.00,
    branchid: 1
  },
  {
    id: 3,
    resource_name: 'Rustic Solid Oak Banquet Tables (10 Units)',
    resource_description: 'Handcrafted natural oak tables for harvest banquets and outdoor dinners',
    resource_remark: 'Contract with Tyre Artisan Rental Co.',
    resource_type: 'Out Source',
    type: 1,
    cost_usd: 250.00,
    branchid: 1,
    suppliers: [101]
  },
  {
    id: 4,
    resource_name: 'Professional Buffet Chafing Warmers',
    resource_description: 'Stainless steel roll-top chafers for hot mezze and catering showcases',
    resource_remark: 'Includes Sterno heating kits',
    resource_type: 'In House',
    type: 0,
    cost_usd: 80.00,
    branchid: 1
  },
  {
    id: 5,
    resource_name: 'Outdoor Ambient LED String Lights & Canopy',
    resource_description: 'Weatherproof warm ambient festoon lighting 100m with support poles',
    resource_remark: 'Third-party staging setup contract',
    resource_type: 'Out Source',
    type: 1,
    cost_usd: 150.00,
    branchid: 1,
    suppliers: [102]
  },
  {
    id: 6,
    resource_name: 'Refrigerated Catering Van with Driver',
    resource_description: 'Dual-temperature refrigerated Mercedes Sprinter for chilled desserts and appetizers',
    resource_remark: 'Vehicle registration license 4482-S',
    resource_type: 'In House',
    type: 0,
    cost_usd: 180.00,
    branchid: 1
  }
];

// Authentic Seed Employees & Drivers (matching Omega DB `getEmployeesByBranch`)
export const SEED_EMPLOYEES: OmegaEventDriverItem[] = [
  { id: 1, EMPLOYEEID: 1, NAME: 'Nadine Ahmar', SALESMANSTATUS: 1, MOBILETEL: '+961 70 882 101', branchid: 1, role: 'Head of Operations & Logistics', license_number: 'LBN-DRV-0012' },
  { id: 2, EMPLOYEEID: 2, NAME: 'Rana Jichi', SALESMANSTATUS: 1, MOBILETEL: '+961 71 553 490', branchid: 1, role: 'Fleet & Catering Dispatcher', license_number: 'LBN-DRV-0034' },
  { id: 3, EMPLOYEEID: 3, NAME: 'Hiba Aloulou', SALESMANSTATUS: 0, MOBILETEL: '+961 76 331 982', branchid: 1, role: 'Logistics Coordinator', license_number: 'LBN-DRV-0056' },
  { id: 4, EMPLOYEEID: 4, NAME: 'Hussein Jichi', SALESMANSTATUS: 1, MOBILETEL: '+961 70 199 821', branchid: 1, role: 'Senior Transport Driver', license_number: 'LBN-DRV-0078' },
  { id: 5, EMPLOYEEID: 5, NAME: 'Ahmad Dirani', SALESMANSTATUS: 1, MOBILETEL: '+961 71 345 678', branchid: 1, role: 'Heavy Transport Driver', license_number: 'LBN-DRV-0099' },
  { id: 6, EMPLOYEEID: 6, NAME: 'Charbel Khoury', SALESMANSTATUS: 1, MOBILETEL: '+961 3 456 789', branchid: 2, role: 'Beirut Distribution Driver', license_number: 'LBN-DRV-0112' }
];

// Initial Seed Events
export const INITIAL_OMEGA_EVENTS: OmegaEventRecord[] = [
  {
    evnt_id: 1,
    event_name: 'Chami House',
    event_type_id: 1,
    type: { id: 1, type_name: 'Party' },
    event_date: '2026-09-11',
    event_status: 'pending',
    status: 'pending',
    event_start_time: '12:00',
    event_end_time: '17:00',
    event_delivery_time: '17:00',
    event_delivery_type: 'pickup',
    event_setup_time: '17:00',
    nb_of_guest: 15,
    event_notes: '',
    branch_id: 1,
    branch_name: 'Zeit w zaytoun ljanoub',
    customer_id: 9,
    customerName: 'Mohammed Chami',
    customer: SEED_CUSTOMERS[0],
    venue_id: null,
    venue_name: '',
    resource_ids: [],
    resources: [],
    employee_ids: [],
    drivers: [],
    hasinvoice: false
  },
  {
    evnt_id: 1001,
    event_name: 'Autumn Olive Harvest Gala & Tasting Banquet',
    event_type_id: 3,
    type: { id: 3, type_name: 'Olive Oil Tasting & Masterclass' },
    event_date: '2026-09-18',
    event_status: 'confirmed',
    status: 'confirmed',
    event_start_time: '18:00',
    event_end_time: '22:30',
    event_delivery_time: '16:30',
    event_delivery_type: 'delivery',
    event_setup_time: '15:00',
    nb_of_guest: 140,
    event_notes: 'VIP sensory booth setup required. Extra cold-pressed EVOO bottles on display.',
    branch_id: 1,
    branch_name: 'Zeit w zaytoun ljanoub',
    customer_id: 101,
    customerName: 'Hassan Jichi',
    customer: SEED_CUSTOMERS[1],
    venue_id: 1,
    venue_name: 'Zeit w Zaytoun Heritage Courtyard (South)',
    resource_ids: [1, 2, 4],
    resources: [SEED_EVENT_RESOURCES[0], SEED_EVENT_RESOURCES[1], SEED_EVENT_RESOURCES[3]],
    employee_ids: [1, 4],
    drivers: [SEED_EMPLOYEES[0], SEED_EMPLOYEES[3]],
    hasinvoice: false
  },
  {
    evnt_id: 1002,
    event_name: 'Executive Culinary Tasting Seminar & Press Launch',
    event_type_id: 4,
    type: { id: 4, type_name: 'Corporate Harvest Gala' },
    event_date: '2026-09-24',
    event_status: 'pending',
    status: 'pending',
    event_start_time: '17:00',
    event_end_time: '21:00',
    event_delivery_time: '15:30',
    event_delivery_type: 'pickup',
    event_setup_time: '14:00',
    nb_of_guest: 65,
    event_notes: 'Chamber of Commerce delegation visiting South presses.',
    branch_id: 1,
    branch_name: 'Zeit w zaytoun ljanoub',
    customer_id: 102,
    customerName: 'Rana Atallah',
    customer: SEED_CUSTOMERS[2],
    venue_id: 2,
    venue_name: 'Marjeyoun Press Mill & Olive Terrace',
    resource_ids: [2, 5],
    resources: [SEED_EVENT_RESOURCES[1], SEED_EVENT_RESOURCES[4]],
    employee_ids: [2],
    drivers: [SEED_EMPLOYEES[1]],
    hasinvoice: false
  }
];

export const SEED_SUPPLIERS: OmegaSupplierItem[] = [
  { SUPPLIERID: 101, SUPPLIERNAME: 'Tyre Artisan Rental Co.', PHONE: '+961 7 740 221', EMAIL: 'info@tyre-artisan.lb' },
  { SUPPLIERID: 102, SUPPLIERNAME: 'Beirut Sound & Light Event Staging', PHONE: '+961 1 552 119', EMAIL: 'events@beirutsound.com' },
  { SUPPLIERID: 103, SUPPLIERNAME: 'Cedar Banquet Furniture & Linen', PHONE: '+961 9 923 884', EMAIL: 'sales@cedarbanquets.lb' },
  { SUPPLIERID: 104, SUPPLIERNAME: 'Mediterranean Refrigerated Fleet Logistics', PHONE: '+961 7 884 100', EMAIL: 'dispatch@medfleet.com' }
];
