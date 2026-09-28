/**
 * Vanguard ERP — HR Personnel & Scheduling Engine Service
 * Shared persistent employee directory for Module 6: HR Personnel, Settings Users, and Payroll Schedules.
 */

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
  location: 'Office' | 'Remote' | 'Hybrid' | 'Field Based';
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
    id: 'EMP-001',
    active: true,
    firstName: 'Hussien',
    lastName: 'Jichi',
    fullName: 'Hussien Jichi',
    email: 'jamaljichihusseinmahdi@gmail.com',
    phone: '70 112233',
    countryCode: '+961',
    dateOfBirth: '1988-06-14',
    gender: 'Male',
    maritalStatus: 'Married',
    childrenCount: 2,
    contactPerson: 'Jamal Jichi',
    contactPhone: '+961 03 112233',
    department: 'Production',
    designation: 'General Manager',
    location: 'Office',
    dateHired: '2021-03-15',
    attendanceMacId: '00:1A:2B:3C:4D:5E',
    country: 'Lebanon',
    city: 'Choueifat (معمل الشويفات)',
    address: 'Old Saida Road, Choueifat Mill Complex',
    nationalId: '1002938475',
    socialSecurityNo: 'CNSS-8899201',
    brand: 'Southern Olive and Oil Products (منتوجات زيت وزيتون الجنوب ش.م.م.)',
    branch: '1300 Choueifat Central Plant (معمل الشويفات)',
    useBranch: true,
    isBackoffice: true,
    posEmployeeId: '1',
    posCredentials: {
      nickName: 'Hussien',
      language: 'ARABIC',
      active: true,
      accessBackOffice: true,
      salesman: true,
      driver: false,
      training: false,
      branch: '1300 Choueifat Central Plant (معمل الشويفات)',
      backOfficeRole: 'MANAGER',
      employeeId: '1',
      password: '123',
      configuration: 'Standard POS Retail Config ✔',
      cashDrawerPort: 'Usb',
      printerType: 'TM-267',
      openCashDrawer: true,
      hideInTimeAttendance: false,
      autoTimeAtt: true,
      emailSignature: 'Hussien Jichi - General Manager\nSouthern Olive and Oil Products S.A.R.L.',
    },
    schedule: {
      templateName: 'Backoffice Administration (08:00 - 16:30)',
    },
    createdAt: '2024-05-15',
  },
  {
    id: 'EMP-002',
    active: true,
    firstName: 'Ali',
    lastName: 'Hassan',
    fullName: 'Ali Hassan',
    email: 'ali.hassan@southernolive-lb.com',
    phone: '71 445566',
    countryCode: '+961',
    dateOfBirth: '1992-11-20',
    gender: 'Male',
    maritalStatus: 'Single',
    childrenCount: 0,
    contactPerson: 'Hassan Hassan',
    contactPhone: '+961 70 445566',
    department: 'Distribution',
    designation: 'Operations Manager',
    location: 'Field Based',
    dateHired: '2021-08-01',
    attendanceMacId: '00:1A:2B:3C:4D:5F',
    country: 'Lebanon',
    city: 'Hadath',
    address: 'Hadath Main Square, Bldg 12',
    nationalId: '1008472910',
    socialSecurityNo: 'CNSS-7711402',
    brand: 'Southern Olive and Oil Products (منتوجات زيت وزيتون الجنوب ش.م.م.)',
    branch: '1300 Choueifat Central Plant (معمل الشويفات)',
    useBranch: true,
    isBackoffice: true,
    posEmployeeId: '2',
    posCredentials: {
      nickName: 'Ali Ops',
      language: 'ENGLISH',
      active: true,
      accessBackOffice: true,
      salesman: true,
      driver: true,
      training: false,
      branch: '1300 Choueifat Central Plant (معمل الشويفات)',
      backOfficeRole: 'Delivery',
      employeeId: '2',
      password: '123',
      configuration: 'Standard POS Retail Config ✔',
      cashDrawerPort: 'Usb',
      printerType: 'TM295',
      openCashDrawer: true,
      hideInTimeAttendance: false,
      autoTimeAtt: true,
    },
    schedule: {
      templateName: 'Distribution & Fleet Delivery (06:00 - 14:30)',
    },
    createdAt: '2024-06-01',
  },
  {
    id: 'EMP-003',
    active: true,
    firstName: 'Sarah',
    lastName: 'Khoury',
    fullName: 'Sarah Khoury',
    email: 's.khoury@southernolive-lb.com',
    phone: '03 778899',
    countryCode: '+961',
    dateOfBirth: '1995-03-25',
    gender: 'Female',
    maritalStatus: 'Single',
    childrenCount: 0,
    contactPerson: 'Pierre Khoury',
    contactPhone: '+961 03 556677',
    department: 'Accounting',
    designation: 'Accountant',
    location: 'Office',
    dateHired: '2022-01-10',
    attendanceMacId: '00:1A:2B:3C:4D:60',
    country: 'Lebanon',
    city: 'Beirut - Achrafieh',
    address: 'Sassine Square, 4th Floor',
    nationalId: '1003829102',
    socialSecurityNo: 'CNSS-9933503',
    brand: 'Southern Olive and Oil Products (منتوجات زيت وزيتون الجنوب ش.م.م.)',
    branch: '1300 Choueifat Central Plant (معمل الشويفات)',
    useBranch: true,
    isBackoffice: true,
    posEmployeeId: '3',
    posCredentials: {
      nickName: 'Sarah K',
      language: 'ENGLISH',
      active: true,
      accessBackOffice: true,
      salesman: false,
      driver: false,
      training: false,
      branch: '1300 Choueifat Central Plant (معمل الشويفات)',
      backOfficeRole: 'Finance department manager',
      employeeId: '3',
      password: '123',
      configuration: 'Standard POS Retail Config ✔',
      cashDrawerPort: 'Usb',
      printerType: 'Epson TM-T88',
      openCashDrawer: true,
      hideInTimeAttendance: false,
      autoTimeAtt: true,
    },
    schedule: {
      templateName: 'Backoffice Administration (08:00 - 16:30)',
    },
    createdAt: '2024-06-15',
  },
  {
    id: 'EMP-004',
    active: true,
    firstName: 'Omar',
    lastName: 'Zaiter',
    fullName: 'Omar Zaiter',
    email: 'omar.z@southernolive-lb.com',
    phone: '76 332211',
    countryCode: '+961',
    dateOfBirth: '1994-08-10',
    gender: 'Male',
    maritalStatus: 'Married',
    childrenCount: 1,
    contactPerson: 'Mariam Zaiter',
    contactPhone: '+961 76 112233',
    department: 'Sales',
    designation: 'Cashier',
    location: 'Office',
    dateHired: '2022-05-01',
    attendanceMacId: '00:1A:2B:3C:4D:61',
    country: 'Lebanon',
    city: 'Baabda',
    address: 'Antonine Street',
    nationalId: '1009182736',
    socialSecurityNo: 'CNSS-4422115',
    brand: 'Southern Olive and Oil Products (منتوجات زيت وزيتون الجنوب ش.م.م.)',
    branch: '1300 Choueifat Central Plant (معمل الشويفات)',
    useBranch: true,
    isBackoffice: false,
    posEmployeeId: '4',
    posCredentials: {
      nickName: 'Omar Cash',
      language: 'ARABIC',
      active: true,
      accessBackOffice: false,
      salesman: true,
      driver: false,
      training: false,
      branch: '1300 Choueifat Central Plant (معمل الشويفات)',
      backOfficeRole: 'CASHIER',
      employeeId: '4',
      password: '123',
      configuration: 'Standard POS Retail Config ✔',
      cashDrawerPort: 'Usb',
      printerType: 'Star SP200F',
      openCashDrawer: true,
      hideInTimeAttendance: false,
      autoTimeAtt: true,
    },
    schedule: {
      templateName: 'Standard Factory Shift (07:00 - 15:30)',
    },
    createdAt: '2024-07-01',
  },
  {
    id: 'EMP-005',
    active: true,
    firstName: 'Nour',
    lastName: 'Mansour',
    fullName: 'Nour Mansour',
    email: 'nour.m@southernolive-lb.com',
    phone: '71 990011',
    countryCode: '+961',
    dateOfBirth: '1996-12-05',
    gender: 'Female',
    maritalStatus: 'Single',
    childrenCount: 0,
    contactPerson: 'Sami Mansour',
    contactPhone: '+961 71 889900',
    department: 'Sales',
    designation: 'Sales Account Manager',
    location: 'Field Based',
    dateHired: '2023-02-15',
    attendanceMacId: '00:1A:2B:3C:4D:62',
    country: 'Lebanon',
    city: 'Saida (Sidon)',
    address: 'Boulevard Maarouf Saad',
    nationalId: '1005544332',
    socialSecurityNo: 'CNSS-6655443',
    brand: 'Southern Olive and Oil Products (منتوجات زيت وزيتون الجنوب ش.م.م.)',
    branch: '1300 Choueifat Central Plant (معمل الشويفات)',
    useBranch: true,
    isBackoffice: false,
    posEmployeeId: '5',
    posCredentials: {
      nickName: 'Nour Sales',
      language: 'ENGLISH',
      active: true,
      accessBackOffice: true,
      salesman: true,
      driver: false,
      training: true,
      branch: '1300 Choueifat Central Plant (معمل الشويفات)',
      backOfficeRole: 'Sales',
      employeeId: '5',
      password: '123',
      configuration: 'Standard POS Retail Config ✔',
      cashDrawerPort: 'Usb',
      printerType: 'TM295',
      openCashDrawer: false,
      hideInTimeAttendance: false,
      autoTimeAtt: true,
    },
    schedule: {
      templateName: 'Standard Factory Shift (07:00 - 15:30)',
    },
    createdAt: '2024-07-10',
  },
  {
    id: 'EMP-006',
    active: true,
    firstName: 'Mahdi',
    lastName: 'Jichi',
    fullName: 'Mahdi Jichi',
    email: 'mahdi@southernolive-lb.com',
    phone: '70 554433',
    countryCode: '+961',
    dateOfBirth: '1985-04-18',
    gender: 'Male',
    maritalStatus: 'Married',
    childrenCount: 3,
    contactPerson: 'Fatima Jichi',
    contactPhone: '+961 70 334455',
    department: 'Owners',
    designation: 'Chief Executive Officer CEO',
    location: 'Office',
    dateHired: '2020-01-01',
    attendanceMacId: '00:1A:2B:3C:4D:63',
    country: 'Lebanon',
    city: 'Choueifat (معمل الشويفات)',
    address: 'VIP Headquarters Suite',
    nationalId: '1001122334',
    socialSecurityNo: 'CNSS-1122334',
    brand: 'Southern Olive and Oil Products (منتوجات زيت وزيتون الجنوب ش.م.م.)',
    branch: '1300 Choueifat Central Plant (معمل الشويفات)',
    useBranch: true,
    isBackoffice: true,
    posEmployeeId: '6',
    posCredentials: {
      nickName: 'Mahdi CEO',
      language: 'ARABIC',
      active: true,
      accessBackOffice: true,
      salesman: true,
      driver: false,
      training: false,
      branch: '1300 Choueifat Central Plant (معمل الشويفات)',
      backOfficeRole: 'MANAGER',
      employeeId: '6',
      password: '123',
      configuration: 'Standard POS Retail Config ✔',
      cashDrawerPort: 'Usb',
      printerType: 'Citizen',
      openCashDrawer: true,
      hideInTimeAttendance: false,
      autoTimeAtt: true,
    },
    schedule: {
      templateName: 'Backoffice Administration (08:00 - 16:30)',
    },
    createdAt: '2024-04-01',
  },
];

const LOCAL_STORAGE_KEY = 'vanguard_hr_personnel_records_v2';
const DAY_OFF_STORAGE_KEY = 'vanguard_hr_day_off_records_v1';

export class HRPersonnelService {
  public static getEmployees(): HREmployeeRecord[] {
    if (typeof window === 'undefined') {
      return INITIAL_HR_PERSONNEL;
    }
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('[HRPersonnelService] Failed reading from localStorage:', err);
    }
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
      } catch (err) {
        console.warn('[HRPersonnelService] Failed saving day off:', err);
      }
    }
    return nextList;
  }
}
