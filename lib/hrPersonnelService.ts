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
  attendanceMacId?: string;
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
    attendanceMacId: '00:1A:2B:3C:4D:01',
    country: 'Lebanon',
    city: 'Choueifat (معمل الشويفات) - Aley',
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
    attendanceMacId: '00:1A:2B:3C:4D:5E',
    country: 'Lebanon',
    city: 'Choueifat (معمل الشويفات) - Aley',
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
    attendanceMacId: '00:1A:2B:3C:4D:03',
    country: 'Lebanon',
    city: 'Choueifat (معمل الشويفات) - Aley',
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
    attendanceMacId: '00:1A:2B:3C:4D:04',
    country: 'Lebanon',
    city: 'Choueifat (معمل الشويفات) - Aley',
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
];

const LOCAL_STORAGE_KEY = 'vanguard_hr_personnel_records_omega_v1';
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

  public static saveEmployee(emp: HREmployeeRecord): HREmployeeRecord[] {
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
      // Background persistence to data/vanguard_accounting_db.json and Supabase workstation_configs table
      if (emp.posCredentials) {
        this.syncWorkstationProfile(emp).catch((err) =>
          console.warn('[HRPersonnelService] Workstation profile sync warning:', err)
        );
      }
    }
    return nextList;
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
