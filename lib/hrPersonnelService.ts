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
  workDays?: string[];
  offDays?: string[];
  applyToAllMonths?: boolean;
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
  isActive?: boolean;
  is_active?: boolean;
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
  profile_picture?: string;
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
  schedule_config?: EmployeeScheduleConfig;
  schedule_template?: string;
  socialMediaRep?: SocialMediaRepConfig;
  createdAt: string;
}

export interface ShiftTemplate {
  name: string;
  workDays: string[];
  timing: string;
  offDays: string[];
  slots: Array<{ start: string; end: string }>;
  dailySchedule?: { [day: string]: string };
}

export const DEFAULT_SHIFT_TEMPLATES: ShiftTemplate[] = [
  {
    name: 'Backoffice Administration (08:00 - 16:30)',
    workDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    timing: '08:00 - 16:30',
    offDays: ['Sun'], // STRICT: Sunday only, Saturday is a regular working day
    slots: [{ start: '08:00', end: '16:30' }],
    dailySchedule: {
      Mon: '08:00 - 16:30',
      Tue: '08:00 - 16:30',
      Wed: '08:00 - 16:30',
      Thu: '08:00 - 16:30',
      Fri: '08:00 - 16:30',
      Sat: '08:00 - 16:30',
      Sun: 'OFF',
    },
  },
  {
    name: 'Standard Factory Shift (07:00 - 15:30)',
    workDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    timing: '07:00 - 15:30',
    offDays: ['Sun'],
    slots: [{ start: '07:00', end: '15:30' }],
    dailySchedule: {
      Mon: '07:00 - 15:30',
      Tue: '07:00 - 15:30',
      Wed: '07:00 - 15:30',
      Thu: '07:00 - 15:30',
      Fri: '07:00 - 15:30',
      Sat: '07:00 - 15:30',
      Sun: 'OFF',
    },
  },
  {
    name: 'Standard 6-Day Operation (08:00 - 16:30)',
    workDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    timing: '08:00 - 16:30',
    offDays: ['Sun'],
    slots: [{ start: '08:00', end: '16:30' }],
    dailySchedule: {
      Mon: '08:00 - 16:30',
      Tue: '08:00 - 16:30',
      Wed: '08:00 - 16:30',
      Thu: '08:00 - 16:30',
      Fri: '08:00 - 16:30',
      Sat: '08:00 - 16:30',
      Sun: 'OFF',
    },
  },
  {
    name: 'Distribution & Fleet Delivery (06:00 - 14:30)',
    workDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    timing: '06:00 - 14:30',
    offDays: ['Sun'],
    slots: [{ start: '06:00', end: '14:30' }],
    dailySchedule: {
      Mon: '06:00 - 14:30',
      Tue: '06:00 - 14:30',
      Wed: '06:00 - 14:30',
      Thu: '06:00 - 14:30',
      Fri: '06:00 - 14:30',
      Sat: '06:00 - 14:30',
      Sun: 'OFF',
    },
  },
  {
    name: 'Evening Extraction & Milling (15:00 - 23:30)',
    workDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    timing: '15:00 - 23:30',
    offDays: ['Sun'],
    slots: [{ start: '15:00', end: '23:30' }],
    dailySchedule: {
      Mon: '15:00 - 23:30',
      Tue: '15:00 - 23:30',
      Wed: '15:00 - 23:30',
      Thu: '15:00 - 23:30',
      Fri: '15:00 - 23:30',
      Sat: '15:00 - 23:30',
      Sun: 'OFF',
    },
  },
  {
    name: 'Weekend Retail & Standby (09:00 - 17:00)',
    workDays: ['Fri', 'Sat', 'Sun'],
    timing: '09:00 - 17:00',
    offDays: ['Mon', 'Tue', 'Wed', 'Thu'],
    slots: [{ start: '09:00', end: '17:00' }],
    dailySchedule: {
      Mon: 'OFF',
      Tue: 'OFF',
      Wed: 'OFF',
      Thu: 'OFF',
      Fri: '09:00 - 17:00',
      Sat: '09:00 - 17:00',
      Sun: '09:00 - 17:00',
    },
  },
];

export const STANDARD_SCHEDULE_TEMPLATES = DEFAULT_SHIFT_TEMPLATES;

export function calculateMonthOffDays(
  year: number,
  month: number,
  scheduleDays: { [dateStr: string]: string }
): number {
  const daysInMonth = new Date(year, month, 0).getDate();
  let offCount = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const shift = scheduleDays[dateStr];
    if (shift === 'OFF') {
      offCount++;
    }
  }
  return offCount;
}

export function generateFullYearMatrix(
  template: ShiftTemplate,
  year: number = 2026
): { [dateStr: string]: string } {
  const matrix: { [dateStr: string]: string } = {};
  for (let m = 1; m <= 12; m++) {
    const daysInMonth = new Date(year, m, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, m - 1, d);
      const dayOfWeek = date.getDay(); // 0 is Sunday, 6 is Saturday
      const dateStr = `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

      if (dayOfWeek === 0 || (template.offDays.includes('Sun') && dayOfWeek === 0)) {
        matrix[dateStr] = 'OFF';
      } else {
        matrix[dateStr] =
          template.timing ||
          (template.slots && template.slots[0]
            ? `${template.slots[0].start} - ${template.slots[0].end}`
            : '08:00 - 16:30');
      }
    }
  }
  return matrix;
}

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

    const isActive = (emp as any).isActive ?? emp.active ?? true;
    const { active: _omitActive, ...empWithoutActive } = emp as any;
    const scheduleConfig = emp.schedule_config || emp.schedule;
    const scheduleTemplate = scheduleConfig?.templateName || (emp as any).schedule_template || 'Backoffice Administration (08:00 - 16:30)';

    const sanitizedEmp: HREmployeeRecord = {
      ...emp,
      active: isActive,
      isActive: isActive,
      is_active: isActive,
      schedule_template: scheduleTemplate,
      schedule: scheduleConfig,
      schedule_config: scheduleConfig,
    };

    let nextList: HREmployeeRecord[];
    if (idx >= 0) {
      nextList = [...list];
      nextList[idx] = sanitizedEmp;
    } else {
      nextList = [sanitizedEmp, ...list];
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextList));
        window.dispatchEvent(new CustomEvent('vanguard_hr_employees_updated', { detail: nextList }));
      } catch (err) {
        console.warn('[HRPersonnelService] Failed saving to localStorage:', err);
      }

      // Route persistence EXCLUSIVELY through /api/hr/sync-workstation (uses SUPABASE_SERVICE_ROLE_KEY to bypass RLS)
      const employeePayload = {
        ...empWithoutActive,
        is_active: isActive,
        schedule_template: scheduleTemplate,
        schedule: scheduleConfig,
        schedule_config: scheduleConfig,
      };

      console.log('[HRPersonnelService] Dispatching employee persistence payload to /api/hr/sync-workstation:', {
        employeeId: sanitizedEmp.id,
        schedule_template: scheduleTemplate,
        scheduleConfigSummary: {
          templateName: scheduleConfig?.templateName,
          workDays: scheduleConfig?.workDays,
          offDays: scheduleConfig?.offDays,
          overridesCount: Object.keys(scheduleConfig?.dateOverrides || {}).length,
        },
      });

      try {
        const res = await fetch('/api/hr/sync-workstation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeId: sanitizedEmp.id,
            employeeName: sanitizedEmp.fullName || `${sanitizedEmp.firstName || ''} ${sanitizedEmp.lastName || ''}`.trim(),
            branch: sanitizedEmp.branch || 'Southern Olive and Oil Products - Main',
            workstationAuthority: sanitizedEmp.posCredentials ? {
              accessBackOffice: sanitizedEmp.posCredentials.accessBackOffice,
              backOfficeRole: sanitizedEmp.posCredentials.backOfficeRole,
              salesman: sanitizedEmp.posCredentials.salesman,
              driver: sanitizedEmp.posCredentials.driver,
              training: sanitizedEmp.posCredentials.training,
              active: sanitizedEmp.posCredentials.active,
            } : undefined,
            drawerKickSettings: sanitizedEmp.posCredentials ? {
              openCashDrawer: sanitizedEmp.posCredentials.openCashDrawer,
              cashDrawerPort: sanitizedEmp.posCredentials.cashDrawerPort,
              pin: 2,
            } : undefined,
            printerConfig: sanitizedEmp.posCredentials ? {
              printerType: sanitizedEmp.posCredentials.printerType,
              configuration: sanitizedEmp.posCredentials.configuration,
              protocol: 'ESC_POS',
            } : undefined,
            posCredentials: sanitizedEmp.posCredentials,
            employeeRecord: employeePayload,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.error('[HRPersonnelService] /api/hr/sync-workstation persistence failure:', res.status, errData);
          throw new Error(errData?.error || `Server sync failed with HTTP ${res.status}`);
        }

        const data = await res.json().catch(() => ({}));
        console.log('[HRPersonnelService] Sync workstation persistence success:', data);
      } catch (apiErr: any) {
        console.error('[HRPersonnelService] Employee persistence error:', apiErr);
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          console.warn('[HRPersonnelService] Offline: record persisted locally.');
        } else {
          throw apiErr;
        }
      }
    }
    return nextList;
  }

  public static async updateEmployee(emp: HREmployeeRecord): Promise<HREmployeeRecord[]> {
    return this.saveEmployee(emp);
  }

  public static async fetchEmployees(): Promise<HREmployeeRecord[]> {
    if (typeof window === 'undefined') {
      return INITIAL_HR_PERSONNEL;
    }
    const localRecords = this.getEmployees();

    if (typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        let remoteSchedules: Record<string, any> = {};
        let remoteEmployeesMap: Record<string, any> = {};
        let serverDbEmployees: any[] = [];

        try {
          const apiRes = await fetch('/api/hr/sync-workstation');
          if (apiRes.ok) {
            const apiData = await apiRes.json();
            if (apiData.remoteSchedules) remoteSchedules = apiData.remoteSchedules;
            if (apiData.remoteEmployees) remoteEmployeesMap = apiData.remoteEmployees;
            if (Array.isArray(apiData.employees)) serverDbEmployees = apiData.employees;
          }
        } catch (apiFetchErr) {
          console.warn('[HRPersonnelService] /api/hr/sync-workstation GET fetch notice:', apiFetchErr);
        }

        // Build unified map of employees from localRecords, remoteEmployeesMap, and serverDbEmployees
        const mergedMap = new Map<string, HREmployeeRecord>();

        // 1. Seed with local records (preserving local cache foundation)
        for (const local of localRecords) {
          mergedMap.set(String(local.id), { ...local });
        }

        // 2. Overlay with remoteEmployeesMap from Supabase PostgreSQL (tenants.feature_flags)
        for (const [key, remoteEmp] of Object.entries(remoteEmployeesMap)) {
          const empId = String(remoteEmp.id || key);
          const existing = mergedMap.get(empId) || ({} as HREmployeeRecord);
          mergedMap.set(empId, {
            ...existing,
            ...remoteEmp,
            id: empId,
          });
        }

        // 3. Overlay with serverDbEmployees rows from Supabase employees table
        for (const row of serverDbEmployees) {
          const empId = String(row.employee_code || row.id);
          const existing = mergedMap.get(empId) || mergedMap.get(String(row.id)) || ({} as HREmployeeRecord);
          mergedMap.set(empId, {
            ...existing,
            id: existing.id || empId,
            fullName: row.full_name || existing.fullName || 'Employee',
            phone: row.phone || existing.phone || '',
            nationalId: row.national_id || existing.nationalId,
            active: row.is_active ?? existing.active ?? true,
            isActive: row.is_active ?? existing.isActive ?? true,
            is_active: row.is_active ?? existing.is_active ?? true,
            dateHired: row.hire_date || existing.dateHired,
          });
        }

        // 4. Hydrate every employee with live remote schedule and template from Supabase
        const finalHydratedRecords: HREmployeeRecord[] = Array.from(mergedMap.values()).map((emp) => {
          const empId = String(emp.id);
          const empCode = String(emp.posEmployeeId || emp.id);

          const remoteSched =
            remoteSchedules[empId] ||
            remoteSchedules[empCode] ||
            (emp.schedule_config ? { schedule_config: emp.schedule_config, schedule_template: emp.schedule_template } : null);

          const templateName =
            remoteSched?.schedule_template ||
            remoteSched?.schedule_config?.templateName ||
            emp.schedule_template ||
            emp.schedule?.templateName ||
            'Backoffice Administration (08:00 - 16:30)';

          const scheduleConfig: EmployeeScheduleConfig = remoteSched?.schedule_config
            ? {
                ...remoteSched.schedule_config,
                templateName,
              }
            : emp.schedule
            ? {
                ...emp.schedule,
                templateName,
              }
            : {
                templateName,
                workDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                offDays: ['Sun'],
                applyToAllMonths: false,
                dateOverrides: {},
                daysOff: [],
              };

          return {
            ...emp,
            schedule_template: templateName,
            schedule: scheduleConfig,
            schedule_config: scheduleConfig,
          };
        });

        if (finalHydratedRecords.length > 0) {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(finalHydratedRecords));
          window.dispatchEvent(new CustomEvent('vanguard_hr_employees_updated', { detail: finalHydratedRecords }));
          return finalHydratedRecords;
        }
      } catch (err) {
        console.warn('[HRPersonnelService] fetchEmployees from Supabase notice:', err);
      }
    }
    return localRecords;
  }

  public static async syncWorkstationProfile(emp: HREmployeeRecord): Promise<void> {
    try {
      const isActive = (emp as any).isActive ?? emp.active ?? true;
      const { active: _discardActive, ...empWithoutActive } = emp as any;
      await fetch('/api/hr/sync-workstation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: emp.id,
          employeeName: emp.fullName,
          branch: emp.branch,
          workstationAuthority: emp.posCredentials ? {
            accessBackOffice: emp.posCredentials.accessBackOffice,
            backOfficeRole: emp.posCredentials.backOfficeRole,
            salesman: emp.posCredentials.salesman,
            driver: emp.posCredentials.driver,
            training: emp.posCredentials.training,
            active: emp.posCredentials.active,
          } : undefined,
          drawerKickSettings: emp.posCredentials ? {
            openCashDrawer: emp.posCredentials.openCashDrawer,
            cashDrawerPort: emp.posCredentials.cashDrawerPort,
            pin: 2,
          } : undefined,
          printerConfig: emp.posCredentials ? {
            printerType: emp.posCredentials.printerType,
            configuration: emp.posCredentials.configuration,
            protocol: 'ESC_POS',
          } : undefined,
          posCredentials: emp.posCredentials,
          employeeRecord: {
            ...empWithoutActive,
            is_active: isActive,
          },
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
              const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(empId);
              if (isUuid) {
                await supabase.from('employees').delete().or(`id.eq.${empId},employee_code.eq.${empId}`);
              } else {
                await supabase.from('employees').delete().eq('employee_code', empId);
              }
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
