/**
 * Vanguard ERP — HR Personnel Engine Service
 * Shared persistent employee directory for Module 6: HR Personnel & Settings Users.
 */

export interface HREmployeeRecord {
  id: string;
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
  createdAt: string;
}

export const INITIAL_HR_PERSONNEL: HREmployeeRecord[] = [
  {
    id: 'EMP-001',
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
    createdAt: '2024-05-15',
  },
  {
    id: 'EMP-002',
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
    createdAt: '2024-06-01',
  },
  {
    id: 'EMP-003',
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
    createdAt: '2024-06-15',
  },
  {
    id: 'EMP-004',
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
    createdAt: '2024-07-01',
  },
  {
    id: 'EMP-005',
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
    createdAt: '2024-07-10',
  },
  {
    id: 'EMP-006',
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
    createdAt: '2024-04-01',
  },
];

const LOCAL_STORAGE_KEY = 'vanguard_hr_personnel_records_v1';

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
}
