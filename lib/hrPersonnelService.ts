export {
  DEPARTMENTS_MASTER_KEYS,
  DESIGNATIONS_MASTER_KEYS,
  LOCATIONS_MASTER_KEYS,
} from '@/lib/LanguageContext';
export type {
  DepartmentKey,
  DesignationKey,
  LocationKey,
} from '@/lib/LanguageContext';
/**
 * Vanguard ERP — HR Personnel & Scheduling Engine Service
 * Shared persistent employee directory for Module 6: HR Personnel, Settings Users, and Payroll Schedules.
 */
import { supabase } from '@/lib/supabaseClient';
export interface POSCredentialsConfig {
  nickName: string;
  language: 'ARABIC' | 'ENGLISH' | 'FRENCH' | 'SPANISH' | 'PERSIAN';
  active: boolean;
  accessBackOffice: boolean;
  salesman: boolean;
  driver: boolean;
  training: boolean;
  branch: string;
  backOfficeRole: 'No Access' | 'CASHIER' | 'Delivery' | 'Finance department manager' | 'MANAGER' | 'Sales';
  employeeId: string;
  password?: string;
  secPassword?: string;
  posCloudLoginId?: string;
  posCloudPassword?: string;
  configuration: string;
  cashDrawerPort: 'Usb' | 'Null' | 'COM1' | 'COM2' | 'COM3' | 'COM4' | 'COM5' | 'COM6' | 'LPT1';
  printerType: 'TM295' | 'TM-267' | 'Star SP200F' | 'Citizen' | 'Epson TM-T88' | 'Generic Thermal 80mm';
  openCashDrawer: boolean;
  hideInTimeAttendance: boolean;
  autoTimeAtt: boolean;
  emailSignature?: string;
}

export interface DayOffRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  reason:
    | 'Annual leave'
    | 'Family emergency'
    | 'Force majeure'
    | 'Leave without pay'
    | 'Marriage leave'
    | 'Maternity leave'
    | 'Medical appointment'
    | 'Personal leave'
    | 'Sick leave'
    | 'Weather or transport disruption'
    | 'Work-related injury leave';
  type: 'Full Day' | 'Partial';
  hoursOff?: number;
  paid: 'Yes' | 'No';
  notes?: string;
  approved: boolean;
  createdAt: string;
}

export interface EmployeeScheduleConfig {
  templateName?: string;
  // Day-of-week slots, e.g. Mon: [{ start: '08:00', end: '16:30' }]
  weeklySlots?: Record<string, Array<{ start: string; end: string }>>;
  // Overrides per specific date "YYYY-MM-DD" -> "08:00 - 16:30" or "OFF"
  dateOverrides?: Record<string, string>;
  daysOff?: DayOffRecord[];
}

export interface ExtraPlatformChannel {
  id: string;
  platform: string;
  url: string;
}

export interface SocialMediaRepConfig {
  // Detailed Address
  area: string;
  street: string;
  building: string;
  floor: string;
  // Contact Numbers
  personalPhone: string;
  businessWhatsapp: string;
  // Identification & System Mapping
  repAdminCode: string;
  systemUuid: string;
  // Channels
  facebookUrl?: string;
  tiktokUrl?: string;
  instagramUrl?: string;
  extraChannels?: ExtraPlatformChannel[];
  // Markups
  promotionalOffersPercentage?: number;
  generalItemsPercentage?: number;
}

export interface HREmployeeRecord {
  id: string;
  active: boolean;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  countryCode: string; // e.g. "+961"
  dateOfBirth?: string;
  gender: 'Male' | 'Female';
  maritalStatus:
    | 'Single'
    | 'Married'
    | 'Divorced'
    | 'Widowed'
    | 'Separated'
    | 'Domestic Partner'
    | 'Not Specified';
  childrenCount: number;
  contactPerson?: string;
  contactPhone?: string;
  profilePicture?: string;
  jobOfferDoc?: string;
  department: string;
  designation: string;
  location: string;
  dateHired?: string;
  dateLeft?: string;
  attendanceMacId?: string | null;
  country: string;
  city: string;
  address?: string;
  nationalId?: string;
  socialSecurityNo?: string;
  // Work Location Tab
  brand: string;
  branch: string;
  useBranch: boolean;
  isBackoffice: boolean;
  posEmployeeId?: string;
  posCredentials?: POSCredentialsConfig;
  schedule?: EmployeeScheduleConfig;
  socialMediaRep?: SocialMediaRepConfig;
  createdAt: string;
}

export const STANDARD_SCHEDULE_TEMPLATES = [
  {
    name: 'Standard Factory Shift (07:00 - 15:30)',
    workDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    slots: [{ start: '07:00', end: '15:30' }],
    offDays: ['Sat', 'Sun'],
  },
  {
    name: 'Backoffice Administration (08:00 - 16:30)',
    workDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    slots: [{ start: '08:00', end: '16:30' }],
    offDays: ['Sat', 'Sun'],
  },
  {
    name: 'Distribution & Fleet Delivery (06:00 - 14:30)',
    workDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    slots: [{ start: '06:00', end: '14:30' }],
    offDays: ['Sun'],
  },
  {
    name: 'Evening Extraction & Milling (15:00 - 23:30)',
    workDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    slots: [{ start: '15:00', end: '23:30' }],
    offDays: ['Sat', 'Sun'],
  },
  {
    name: 'Weekend Retail & Standby (09:00 - 17:00)',
    workDays: ['Fri', 'Sat', 'Sun'],
    slots: [{ start: '09:00', end: '17:00' }],
    offDays: ['Mon', 'Tue', 'Wed', 'Thu'],
  },
];

export const INITIAL_HR_PERSONNEL: HREmployeeRecord[] = [
  {
    id: '641',
    active: true,
    firstName: 'Mohammed',
    lastName: 'Jichi',
    fullName: 'Mohammed Jichi',
    email: 'mohammed@southernolive-lb.com',
    phone: '71384506',
    countryCode: '+961',
    dateOfBirth: '1985-01-01',
    gender: 'Male',
    maritalStatus: 'Married',
    childrenCount: 2,
    contactPerson: 'Headquarters Admin',
    contactPhone: '+961 71 384506',
    department: 'Management',
    designation: 'General Operations Manager',
    location: 'Office',
    dateHired: '2020-01-01',
    attendanceMacId: '',
    country: 'Lebanon',
    city: 'Choueifat - Aley',
    address: 'Old Saida Road, Choueifat Central Plant',
    nationalId: '1001122334',
    socialSecurityNo: 'CNSS-1122334',
    brand: 'Southern Olive and Oil Products (منتوجات زيت وزيتون الجنوب ش.م.م.)',
    branch: 'Southern Olive and Oil Products - Main',
    useBranch: true,
    isBackoffice: true,
    posEmployeeId: '1',
    posCredentials: {
      nickName: 'Mohammed',
      language: 'ARABIC',
      active: true,
      accessBackOffice: true,
      salesman: true,
      driver: false,
      training: false,
      branch: 'Southern Olive and Oil Products - Main',
      backOfficeRole: 'MANAGER',
      employeeId: '1',
      password: '123',
      configuration: 'Standard POS Retail Config ✔',
      cashDrawerPort: 'Usb',
      printerType: 'TM-267',
      openCashDrawer: true,
      hideInTimeAttendance: false,
      autoTimeAtt: true,
      emailSignature: 'Mohammed Jichi - General Operations Manager\nSouthern Olive and Oil Products S.A.R.L.',
    },
    schedule: {
      templateName: 'Backoffice Administration (08:00 - 16:30)',
    },
    createdAt: '2024-01-01',
  },
  {
    id: '642',
    active: true,
    firstName: 'Hussien',
    lastName: 'Jichi',
    fullName: 'Hussien Jichi',
    email: 'jamaljichihusseinmahdi@gmail.com',
    phone: '71390241',
    countryCode: '+961',
    dateOfBirth: '1988-06-14',
    gender: 'Male',
    maritalStatus: 'Married',
    childrenCount: 2,
    contactPerson: 'Jamal Jichi',
    contactPhone: '+961 71 390241',
    department: 'Owners',
    designation: 'Owner / Director',
    location: 'Office',
    dateHired: '2021-03-15',
    attendanceMacId: '',
    country: 'Lebanon',
    city: 'Choueifat - Aley',
    address: 'Old Saida Road, Choueifat Central Plant',
    nationalId: '1002938475',
    socialSecurityNo: 'CNSS-8899201',
    brand: 'Southern Olive and Oil Products (منتوجات زيت وزيتون الجنوب ش.م.م.)',
    branch: 'Southern Olive and Oil Products - Main',
    useBranch: true,
    isBackoffice: true,
    posEmployeeId: '9',
    posCredentials: {
      nickName: 'Hussien',
      language: 'ARABIC',
      active: true,
      accessBackOffice: true,
      salesman: true,
      driver: false,
      training: false,
      branch: 'Southern Olive and Oil Products - Main',
      backOfficeRole: 'MANAGER',
      employeeId: '9',
      password: '123456',
      configuration: 'Standard POS Retail Config ✔',
      cashDrawerPort: 'Usb',
      printerType: 'TM-267',
      openCashDrawer: true,
      hideInTimeAttendance: false,
      autoTimeAtt: true,
      emailSignature: 'Hussien Jichi - Owner / Director\nSouthern Olive and Oil Products S.A.R.L.',
    },
    schedule: {
      templateName: 'Backoffice Administration (08:00 - 16:30)',
    },
    createdAt: '2024-05-15',
  },
  {
    id: '644',
    active: true,
    firstName: 'Hussein',
    lastName: 'Jichi',
    fullName: 'Hussein Jichi',
    email: 'hussein.jichi@southernolive-lb.com',
    phone: '81958823',
    countryCode: '+961',
    dateOfBirth: '1990-05-10',
    gender: 'Male',
    maritalStatus: 'Single',
    childrenCount: 0,
    department: 'Accounting',
    designation: 'Accountant',
    location: 'Office',
    dateHired: '2022-01-10',
    attendanceMacId: '',
    country: 'Lebanon',
    city: 'Choueifat - Aley',
    address: 'Old Saida Road, Choueifat Central Plant',
    nationalId: '1003829102',
    socialSecurityNo: 'CNSS-9933503',
    brand: 'Southern Olive and Oil Products (منتوجات زيت وزيتون الجنوب ش.م.م.)',
    branch: 'Southern Olive and Oil Products - Main',
    useBranch: true,
    isBackoffice: true,
    posEmployeeId: '5',
    posCredentials: {
      nickName: 'Hussein',
      language: 'ARABIC',
      active: true,
      accessBackOffice: true,
      salesman: false,
      driver: false,
      training: false,
      branch: 'Southern Olive and Oil Products - Main',
      backOfficeRole: 'MANAGER',
      employeeId: '5',
      password: '123',
      configuration: 'Standard POS Retail Config ✔',
      cashDrawerPort: 'Usb',
      printerType: 'TM-267',
      openCashDrawer: true,
      hideInTimeAttendance: false,
      autoTimeAtt: true,
      emailSignature: 'Hussein Jichi - Accountant\nSouthern Olive and Oil Products S.A.R.L.',
    },
    schedule: {
      templateName: 'Backoffice Administration (08:00 - 16:30)',
    },
    createdAt: '2024-06-15',
  },
  {
    id: '649',
    active: true,
    firstName: 'Hiba',
    lastName: 'Aloulou',
    fullName: 'Hiba Aloulou',
    email: 'hiba.aloulou@southernolive-lb.com',
    phone: '78846247',
    countryCode: '+961',
    dateOfBirth: '1995-09-20',
    gender: 'Female',
    maritalStatus: 'Single',
    childrenCount: 0,
    department: 'Sales',
    designation: 'Cashier',
    location: 'Office',
    dateHired: '2023-04-01',
    attendanceMacId: '',
    country: 'Lebanon',
    city: 'Choueifat - Aley',
    address: 'Old Saida Road, Choueifat Central Plant',
    nationalId: '1009182736',
    socialSecurityNo: 'CNSS-4422115',
    brand: 'Southern Olive and Oil Products (منتوجات زيت وزيتون الجنوب ش.م.م.)',
    branch: 'Southern Olive and Oil Products - Main',
    useBranch: true,
    isBackoffice: false,
    posEmployeeId: '10',
    posCredentials: {
      nickName: 'Hiba',
      language: 'ARABIC',
      active: true,
      accessBackOffice: false,
      salesman: true,
      driver: false,
      training: false,
      branch: 'Southern Olive and Oil Products - Main',
      backOfficeRole: 'CASHIER',
      employeeId: '10',
      password: '123',
      configuration: 'Standard POS Retail Config ✔',
      cashDrawerPort: 'Usb',
      printerType: 'TM-267',
      openCashDrawer: true,
      hideInTimeAttendance: false,
      autoTimeAtt: true,
      emailSignature: 'Hiba Aloulou - Cashier\nSouthern Olive and Oil Products S.A.R.L.',
    },
    schedule: {
      templateName: 'Standard Factory Shift (07:00 - 15:30)',
    },
    createdAt: '2024-07-01',
  },
  {
    id: '650',
    active: true,
    firstName: 'Charbel',
    lastName: 'Khoury',
    fullName: 'Charbel Khoury',
    email: 'charbel.khoury@southernolive-lb.com',
    phone: '70112233',
    countryCode: '+961',
    dateOfBirth: '1992-03-12',
    gender: 'Male',
    maritalStatus: 'Married',
    childrenCount: 1,
    department: 'oil_processing',
    designation: 'oil_press_operator',
    location: 'mill_facility',
    dateHired: '2022-09-01',
    attendanceMacId: '',
    country: 'Lebanon',
    city: 'Choueifat - Aley',
    address: 'Choueifat Plant, Press Line 1',
    nationalId: '1004455667',
    socialSecurityNo: 'CNSS-5544332',
    brand: 'Southern Olive and Oil Products (منتوجات زيت وزيتون الجنوب ش.م.م.)',
    branch: 'Southern Olive and Oil Products - Main',
    useBranch: true,
    isBackoffice: false,
    posEmployeeId: '11',
    schedule: {
      templateName: 'Standard Factory Shift (07:00 - 15:30)',
    },
    createdAt: '2024-08-01',
  },
  {
    id: '651',
    active: true,
    firstName: 'Hadi',
    lastName: 'Saad',
    fullName: 'Hadi Saad',
    email: 'hadi.saad@southernolive-lb.com',
    phone: '71445566',
    countryCode: '+961',
    dateOfBirth: '1990-11-05',
    gender: 'Male',
    maritalStatus: 'Single',
    childrenCount: 0,
    department: 'logistics_delivery',
    designation: 'delivery_driver',
    location: 'on_road',
    dateHired: '2023-01-15',
    attendanceMacId: '',
    country: 'Lebanon',
    city: 'Choueifat - Aley',
    address: 'South Fleet Hub, Truck #4',
    nationalId: '1007788990',
    socialSecurityNo: 'CNSS-7766554',
    brand: 'Southern Olive and Oil Products (منتوجات زيت وزيتون الجنوب ش.م.م.)',
    branch: 'Southern Olive and Oil Products - Main',
    useBranch: true,
    isBackoffice: false,
    posEmployeeId: '12',
    schedule: {
      templateName: 'Standard Factory Shift (07:00 - 15:30)',
    },
    createdAt: '2024-09-01',
  },
  {
    id: '652',
    active: true,
    firstName: 'Nour',
    lastName: 'Salameh',
    fullName: 'Nour Salameh',
    email: 'nour.salameh@southernolive-lb.com',
    phone: '76554433',
    countryCode: '+961',
    dateOfBirth: '1996-07-22',
    gender: 'Female',
    maritalStatus: 'Single',
    childrenCount: 0,
    department: 'social_media_marketing',
    designation: 'social_media_rep',
    location: 'remote',
    dateHired: '2024-01-10',
    attendanceMacId: '',
    country: 'Lebanon',
    city: 'Beirut - Achrafieh',
    address: 'Independence Street, Building 12, 4th Floor',
    nationalId: '1008899001',
    socialSecurityNo: 'CNSS-8877665',
    brand: 'Southern Olive and Oil Products (منتوجات زيت وزيتون الجنوب ش.م.م.)',
    branch: 'Southern Olive and Oil Products - Main',
    useBranch: true,
    isBackoffice: false,
    posEmployeeId: '13',
    socialMediaRep: {
      area: 'Beirut',
      street: 'Independence Street',
      building: 'Building 12',
      floor: '4th Floor, Unit 401',
      personalPhone: '+961 76 554 433',
      businessWhatsapp: '+961 3 554 433',
      repAdminCode: 'REP-8801',
      systemUuid: 'e92a839f-43b8-4c6d-9be2-58190d79bf20',
      facebookUrl: 'https://facebook.com/southernolive.nour',
      tiktokUrl: 'https://tiktok.com/@southernolive_nour',
      instagramUrl: 'https://instagram.com/southernolive.nour',
      extraChannels: [
        { id: 'chan-01', platform: 'Snapchat', url: 'https://snapchat.com/add/nour_olive' }
      ],
      promotionalOffersPercentage: 5.0,
      generalItemsPercentage: 10.0,
    },
    schedule: {
      templateName: 'Backoffice Administration (08:00 - 16:30)',
    },
    createdAt: '2024-10-01',
  },
];

const LOCAL_STORAGE_KEY = 'vanguard_hr_personnel_records_omega_v2';
const DAY_OFF_STORAGE_KEY = 'vanguard_hr_day_off_records_v1';

export class HRPersonnelService {
  public static getEmployees(): HREmployeeRecord[] {
    if (typeof window === 'undefined') {
      return INITIAL_HR_PERSONNEL;
    }
    try {
      // Purge legacy storage keys that held mock personnel
      localStorage.removeItem('vanguard_hr_personnel_records_v1');
      localStorage.removeItem('vanguard_hr_personnel_records_v2');
      localStorage.removeItem('vanguard_hr_personnel_records_omega_v1');

      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If stored records still have mock employees (Sarah Khoury, Ali Hassan, etc.), purge and reseed
          const hasLegacyMock = parsed.some(
            (e: any) =>
              e.firstName === 'Sarah' ||
              e.lastName === 'Khoury' ||
              e.firstName === 'Omar' ||
              e.lastName === 'Zaiter' ||
              e.firstName === 'Nour' ||
              e.lastName === 'Mansour' ||
              e.firstName === 'Ali' ||
              e.id === 'EMP-001' ||
              e.id === 'EMP-002' ||
              e.id === 'EMP-003'
          );
          if (!hasLegacyMock) {
            return parsed;
          }
        }
      }
    } catch (err) {
      console.warn('[HRPersonnelService] Failed reading from localStorage:', err);
    }

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_HR_PERSONNEL));
    } catch (e) {}

    return INITIAL_HR_PERSONNEL;
  }

  public static async saveEmployee(emp: HREmployeeRecord): Promise<HREmployeeRecord[]> {
    const list = this.getEmployees();
    const idx = list.findIndex((e) => e.id === emp.id);
    let nextList: HREmployeeRecord[];
    if (idx >= 0) {
      nextList = [...list];
      nextList[idx] = emp;
    } else {
      nextList = [emp, ...list];
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextList));
        window.dispatchEvent(new CustomEvent('vanguard_hr_employees_updated', { detail: nextList }));
      } catch (err) {
        console.warn('[HRPersonnelService] Failed saving to localStorage:', err);
      }
      // Supabase upsert to hr_employees table
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        try {
          const { error } = await supabase
            .from('hr_employees')
            .upsert(
              {
                id: emp.id,
                first_name: emp.firstName,
                last_name: emp.lastName,
                full_name: emp.fullName,
                email: emp.email || null,
                phone: emp.phone || null,
                country_code: emp.countryCode || null,
                date_of_birth: emp.dateOfBirth || null,
                gender: emp.gender || null,
                marital_status: emp.maritalStatus || null,
                children_count: emp.childrenCount ?? 0,
                department: emp.department || null,
                designation: emp.designation || null,
                location: emp.location || null,
                country: emp.country || null,
                city: emp.city || null,
                address: emp.address || null,
                national_id: emp.nationalId || null,
                social_security_no: emp.socialSecurityNo || null,
                date_hired: emp.dateHired || null,
                date_left: emp.dateLeft || null,
                pos_employee_id: emp.posEmployeeId || null,
                attendance_mac_id: emp.attendanceMacId || null,
                brand: emp.brand || null,
                branch: emp.branch || null,
                is_backoffice: emp.isBackoffice ?? true,
                pos_credentials: emp.posCredentials || null,
                schedule_config: emp.schedule || null,
                social_media_rep: emp.socialMediaRep || null,
                record_payload: emp,
                active: emp.active,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'id' }
            );

          if (error) {
            console.warn('[HRPersonnelService] Supabase hr_employees upsert notice:', error.message);
          }
        } catch (supaErr) {
          console.warn('[HRPersonnelService] Supabase hr_employees upsert exception:', supaErr);
        }
      }

      // Background persistence to data/vanguard_accounting_db.json and Supabase workstation_configs table
      if (emp.posCredentials) {
        await this.syncWorkstationProfile(emp).catch((err) =>
          console.warn('[HRPersonnelService] Workstation profile sync warning:', err)
        );
      }
    }
    return nextList;
  }

  public static async fetchEmployees(): Promise<HREmployeeRecord[]> {
    if (typeof window === 'undefined') {
      return INITIAL_HR_PERSONNEL;
    }
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        const { data, error } = await supabase
          .from('hr_employees')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          const remoteRecords: HREmployeeRecord[] = data.map((row: any) => {
            if (row.record_payload && typeof row.record_payload === 'object') {
              return row.record_payload as HREmployeeRecord;
            }
            return {
              id: row.id,
              active: row.active ?? true,
              firstName: row.first_name || '',
              lastName: row.last_name || '',
              fullName: row.full_name || `${row.first_name || ''} ${row.last_name || ''}`.trim(),
              email: row.email || '',
              phone: row.phone || '',
              countryCode: row.country_code || '+961',
              dateOfBirth: row.date_of_birth,
              gender: row.gender || 'Male',
              maritalStatus: row.marital_status || 'Single',
              childrenCount: row.children_count ?? 0,
              department: row.department || '',
              designation: row.designation || '',
              location: row.location || '',
              country: row.country || 'Lebanon',
              city: row.city || '',
              address: row.address,
              dateHired: row.date_hired,
              dateLeft: row.date_left,
              attendanceMacId: row.attendance_mac_id,
              posEmployeeId: row.pos_employee_id,
              brand: row.brand || 'Southern Olive and Oil Products (منتوجات زيت وزيتون الجنوب ش.م.م.)',
              branch: row.branch || 'Southern Olive and Oil Products - Main',
              useBranch: true,
              isBackoffice: row.is_backoffice ?? true,
              posCredentials: row.pos_credentials,
              schedule: row.schedule_config,
              socialMediaRep: row.social_media_rep,
              createdAt: row.created_at || new Date().toISOString().split('T')[0],
            };
          });

          if (remoteRecords.length > 0) {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(remoteRecords));
            return remoteRecords;
          }
        }
      } catch (err) {
        console.warn('[HRPersonnelService] fetchEmployees from Supabase notice:', err);
      }
    }
    return this.getEmployees();
  }

  public static async syncWorkstationProfile(emp: HREmployeeRecord): Promise<void> {
    if (!emp.posCredentials) return;
    try {
      await fetch('/api/hr/sync-workstation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: emp.id,
          employeeName: emp.fullName,
          branch: emp.branch,
          workstationAuthority: {
            accessBackOffice: emp.posCredentials.accessBackOffice,
            backOfficeRole: emp.posCredentials.backOfficeRole,
            salesman: emp.posCredentials.salesman,
            driver: emp.posCredentials.driver,
            training: emp.posCredentials.training,
            active: emp.posCredentials.active,
          },
          drawerKickSettings: {
            openCashDrawer: emp.posCredentials.openCashDrawer,
            cashDrawerPort: emp.posCredentials.cashDrawerPort,
            pin: 2,
          },
          printerConfig: {
            printerType: emp.posCredentials.printerType,
            configuration: emp.posCredentials.configuration,
            protocol: 'ESC_POS',
          },
          posCredentials: emp.posCredentials,
          employeeRecord: emp,
        }),
      });
    } catch (err) {
      console.warn('[HRPersonnelService] Workstation sync API notice:', err);
    }
  }

  public static deleteEmployee(empId: string): HREmployeeRecord[] {
    const list = this.getEmployees();
    const nextList = list.filter((e) => e.id !== empId);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextList));
        window.dispatchEvent(new CustomEvent('vanguard_hr_employees_updated', { detail: nextList }));
        if (typeof navigator !== 'undefined' && navigator.onLine) {
          (async () => {
            try {
              await supabase.from('hr_employees').delete().eq('id', empId);
            } catch (err) {
              console.warn('[HRPersonnelService] Supabase delete employee notice:', err);
            }
          })();
        }
      } catch (err) {
        console.warn('[HRPersonnelService] Failed deleting from localStorage:', err);
      }
    }
    return nextList;
  }

  public static getDaysOff(): DayOffRecord[] {
    if (typeof window === 'undefined') {
      return [];
    }
    try {
      const stored = localStorage.getItem(DAY_OFF_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (err) {
      console.warn('[HRPersonnelService] Failed reading days off:', err);
    }
    return [];
  }

  public static saveDayOff(dayOff: DayOffRecord): DayOffRecord[] {
    const list = this.getDaysOff();
    const nextList = [dayOff, ...list];
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(DAY_OFF_STORAGE_KEY, JSON.stringify(nextList));
        window.dispatchEvent(new CustomEvent('vanguard_day_off_updated', { detail: nextList }));
        // Automated background sync routine to mirror records into hr_leave_requests Supabase table
        this.syncDayOffToSupabase(dayOff).catch((err) =>
          console.warn('[HRPersonnelService] Background leave sync error:', err)
        );
      } catch (err) {
        console.warn('[HRPersonnelService] Failed saving day off:', err);
      }
    }
    return nextList;
  }

  public static deleteDayOff(dayOffId: string): DayOffRecord[] {
    const list = this.getDaysOff();
    const nextList = list.filter((d) => d.id !== dayOffId);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(DAY_OFF_STORAGE_KEY, JSON.stringify(nextList));
        window.dispatchEvent(new CustomEvent('vanguard_day_off_updated', { detail: nextList }));
        if (typeof navigator !== 'undefined' && navigator.onLine) {
          (async () => {
            try {
              await supabase.from('hr_leave_requests').delete().eq('id', dayOffId);
            } catch (err) {
              console.warn('[HRPersonnelService] Supabase delete day off notice:', err);
            }
          })();
        }
      } catch (err) {
        console.warn('[HRPersonnelService] Failed deleting day off:', err);
      }
    }
    return nextList;
  }

  public static removeDayOffForEmployeeDate(employeeId: string, dateStr: string): DayOffRecord[] {
    const list = this.getDaysOff();
    const toDelete = list.filter(
      (d) => d.employeeId === employeeId && dateStr >= d.startDate && dateStr <= d.endDate
    );
    const nextList = list.filter(
      (d) => !(d.employeeId === employeeId && dateStr >= d.startDate && dateStr <= d.endDate)
    );
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(DAY_OFF_STORAGE_KEY, JSON.stringify(nextList));
        window.dispatchEvent(new CustomEvent('vanguard_day_off_updated', { detail: nextList }));
        if (typeof navigator !== 'undefined' && navigator.onLine && toDelete.length > 0) {
          const ids = toDelete.map((d) => d.id);
          (async () => {
            try {
              await supabase.from('hr_leave_requests').delete().in('id', ids);
            } catch (err) {
              console.warn('[HRPersonnelService] Supabase delete days off notice:', err);
            }
          })();
        }
      } catch (err) {
        console.warn('[HRPersonnelService] Failed removing days off for date:', err);
      }
    }
    return nextList;
  }

  public static async syncDayOffToSupabase(dayOff: DayOffRecord): Promise<{ success: boolean; error?: string }> {
    if (typeof window === 'undefined') return { success: false, error: 'Server context' };
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return { success: false, error: 'Offline - stored locally' };
    }
    try {
      const { error } = await supabase
        .from('hr_leave_requests')
        .upsert(
          {
            id: dayOff.id,
            employee_id: dayOff.employeeId,
            employee_name: dayOff.employeeName,
            start_date: dayOff.startDate,
            end_date: dayOff.endDate,
            reason: dayOff.reason,
            leave_type: dayOff.type,
            hours_off: dayOff.hoursOff || null,
            paid: dayOff.paid === 'Yes',
            notes: dayOff.notes || null,
            approved: dayOff.approved,
            created_at: dayOff.createdAt,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

      if (error) {
        console.warn('[HRPersonnelService] Supabase hr_leave_requests sync notice:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      console.warn('[HRPersonnelService] Supabase hr_leave_requests sync exception:', err?.message || err);
      return { success: false, error: err?.message || 'Sync failed' };
    }
  }

  public static async syncAllDaysOffToSupabase(): Promise<void> {
    const list = this.getDaysOff();
    if (!list.length) return;
    for (const item of list) {
      await this.syncDayOffToSupabase(item);
    }
  }
}

// Background online re-synchronization routine
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    HRPersonnelService.syncAllDaysOffToSupabase().catch((err) =>
      console.warn('[HRPersonnelService] Auto online sync notice:', err)
    );
  });
}
