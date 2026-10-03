'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  HREmployeeRecord,
  HRPersonnelService,
  POSCredentialsConfig,
  SocialMediaRepConfig,
  ExtraPlatformChannel,
} from '@/lib/hrPersonnelService';
import { useLanguage } from '@/lib/LanguageContext';
import {
  searchLebaneseCities,
  LebaneseCity,
} from '@/lib/lebaneseCities';
import {
  ALL_WORLD_COUNTRIES,
  ALL_COUNTRY_DIAL_CODES,
  ALL_WORLD_COUNTRIES_INFO,
} from '@/lib/countriesData';
import {
  X,
  User,
  MapPin,
  Calendar,
  Upload,
  FileText,
  Trash2,
  Save,
  Search,
  ChevronDown,
  Briefcase,
  Pencil,
  Clock,
  Shield,
  Key,
  Printer,
  CheckCircle2,
  ExternalLink,
  Laptop,
  Check,
  Plus,
  Share2,
  Globe,
  Phone,
  Percent,
  Copy,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

export interface EmployeeFormData {
  firstName: string;
  lastName: string;
  countryCode: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
  maritalStatus: HREmployeeRecord['maritalStatus'];
  numberOfChildren: number;
  contactPerson: string;
  contactPhone: string;
  department: string;
  designation: string;
  location: string;
  attendanceMacId: string;
  dateHired: string;
  dateLeft: string;
  country: string;
  city: string;
  address: string;
  nationalId: string;
  socialSecurityNumber: string;
  status: 'Active' | 'Inactive';
  posEmployeeId: string;
  brand: string;
  useBranch: boolean;
  branchName: string;
  createBackoffice: boolean;
  socialMediaRep?: SocialMediaRepConfig;
}

export const DEFAULT_EMPLOYEE_FORM_DATA: EmployeeFormData = {
  firstName: '',
  lastName: '',
  countryCode: '+961',
  phone: '',
  email: '',
  dateOfBirth: '1995-01-01',
  gender: 'Male',
  maritalStatus: 'Single',
  numberOfChildren: 0,
  contactPerson: '',
  contactPhone: '',
  department: 'factory_operations',
  designation: 'oil_press_operator',
  location: 'factory_floor',
  attendanceMacId: '',
  dateHired: '2024-05-15',
  dateLeft: '',
  country: 'Lebanon',
  city: 'Choueifat (معمل الشويفات) - Aley',
  address: '',
  nationalId: '',
  socialSecurityNumber: '',
  status: 'Active',
  posEmployeeId: '1',
  brand: 'Southern Olive and Oil Products (منتوجات زيت وزيتون الجنوب ش.م.م.)',
  useBranch: true,
  branchName: 'Southern Olive and Oil Products - Main',
  createBackoffice: true,
  socialMediaRep: {
    area: '',
    street: '',
    building: '',
    floor: '',
    personalPhone: '',
    businessWhatsapp: '',
    repAdminCode: '',
    systemUuid: '',
    facebookUrl: '',
    tiktokUrl: '',
    instagramUrl: '',
    extraChannels: [],
    promotionalOffersPercentage: 5,
    generalItemsPercentage: 10,
  },
};

export function extractEmployeeFormData(data: any): EmployeeFormData {
  if (!data) return DEFAULT_EMPLOYEE_FORM_DATA;

  let fName = data.firstName || data.first_name || '';
  let lName = data.lastName || data.last_name || '';
  if (!fName && data.name) {
    const parts = data.name.trim().split(' ');
    fName = parts[0] || '';
    lName = parts.slice(1).join(' ') || '';
  } else if (!fName && data.fullName) {
    const parts = data.fullName.trim().split(' ');
    fName = parts[0] || '';
    lName = parts.slice(1).join(' ') || '';
  }

  let phoneVal = data.phone || data.contact || '';
  let codeVal = data.countryCode || '+961';
  if (phoneVal.startsWith('+')) {
    const parts = phoneVal.split(' ');
    if (parts.length > 1) {
      codeVal = parts[0];
      phoneVal = parts.slice(1).join(' ');
    }
  }

  const repConfig: SocialMediaRepConfig = data.socialMediaRep ? {
    area: data.socialMediaRep.area || '',
    street: data.socialMediaRep.street || '',
    building: data.socialMediaRep.building || '',
    floor: data.socialMediaRep.floor || '',
    personalPhone: data.socialMediaRep.personalPhone || '',
    businessWhatsapp: data.socialMediaRep.businessWhatsapp || '',
    repAdminCode: data.socialMediaRep.repAdminCode || '',
    systemUuid: data.socialMediaRep.systemUuid || '',
    facebookUrl: data.socialMediaRep.facebookUrl || '',
    tiktokUrl: data.socialMediaRep.tiktokUrl || '',
    instagramUrl: data.socialMediaRep.instagramUrl || '',
    extraChannels: Array.isArray(data.socialMediaRep.extraChannels) ? data.socialMediaRep.extraChannels : [],
    promotionalOffersPercentage: data.socialMediaRep.promotionalOffersPercentage ?? 5,
    generalItemsPercentage: data.socialMediaRep.generalItemsPercentage ?? 10,
  } : {
    area: '',
    street: '',
    building: '',
    floor: '',
    personalPhone: '',
    businessWhatsapp: '',
    repAdminCode: '',
    systemUuid: '',
    facebookUrl: '',
    tiktokUrl: '',
    instagramUrl: '',
    extraChannels: [],
    promotionalOffersPercentage: 5,
    generalItemsPercentage: 10,
  };

  return {
    firstName: fName,
    lastName: lName,
    countryCode: codeVal,
    phone: phoneVal,
    email: data.email || '',
    dateOfBirth: data.dateOfBirth || data.date_of_birth || '1995-01-01',
    gender: data.gender === 'Female' ? 'Female' : 'Male',
    maritalStatus: data.maritalStatus || data.marital_status || 'Single',
    numberOfChildren: data.numberOfChildren ?? data.number_of_children ?? data.childrenCount ?? 0,
    contactPerson: data.contactPerson || data.created_by || '',
    contactPhone: data.contactPhone || '',
    department: data.department || 'factory_operations',
    designation: data.designation || 'oil_press_operator',
    location: data.location || 'factory_floor',
    attendanceMacId: data.attendanceMacId || '',
    dateHired: data.dateHired || data.created_at || '2024-05-15',
    dateLeft: data.dateLeft || '',
    country: data.country || 'Lebanon',
    city: data.city || 'Choueifat (معمل الشويفات) - Aley',
    address: data.address || '',
    nationalId: data.nationalId || '',
    socialSecurityNumber: data.socialSecurityNumber || data.socialSecurityNo || '',
    status: (data.status === 'ACTIVE' || data.status === 'Active' || data.active === true || data.is_active === true) ? 'Active' : 'Inactive',
    posEmployeeId: data.posEmployeeId || data.pos_login_id || (data.user_code ? String(data.user_code) : '1'),
    brand: data.brand || 'Southern Olive and Oil Products (منتوجات زيت وزيتون الجنوب ش.م.م.)',
    useBranch: data.useBranch ?? true,
    branchName: data.branch || data.branchName || 'Southern Olive and Oil Products - Main',
    createBackoffice: data.isBackoffice ?? data.createBackoffice ?? true,
    socialMediaRep: repConfig,
  };
}

interface NewEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmployeeCreated: (employee: HREmployeeRecord) => void;
  initialEmployee?: HREmployeeRecord | null;
  initialData?: any;
  employee?: any;
  hideScheduleTab?: boolean;
}


export const DEPARTMENTS_MASTER_KEYS = [
  'factory_operations',
  'warehouse_storage',
  'oil_processing',
  'packaging_bottling',
  'quality_lab',
  'logistics_delivery',
  'social_media_marketing',
] as const;

export const DESIGNATIONS_MASTER_KEYS = [
  'oil_press_operator',
  'packaging_worker',
  'warehouse_worker',
  'factory_worker',
  'forklift_driver',
  'maintenance_tech',
  'storekeeper',
  'delivery_manager',
  'delivery_driver',
  'social_media_manager',
  'social_media_rep',
] as const;

export const LOCATIONS_MASTER_KEYS = [
  'factory_floor',
  'central_warehouse',
  'mill_facility',
  'showroom',
  'on_road',
  'office',
  'remote',
  'hybrid',
] as const;

export default function NewEmployeeModal({
  isOpen,
  onClose,
  onEmployeeCreated,
  initialEmployee,
  initialData,
  employee,
  hideScheduleTab = false,
}: NewEmployeeModalProps) {
  const { t, isRtl, language } = useLanguage();
  const activeRecord = initialData || employee || initialEmployee;

  // Tabs: 'personal' (Tab 1: Personal *) | 'work_location' (Tab 2: Work Location *) | 'schedule' (Tab 3: Schedule)
  const [activeTab, setActiveTab] = useState<'personal' | 'work_location' | 'schedule'>('personal');

  // Unified Form Data State with Instant Dynamic Binding
  const [formData, setFormData] = useState<EmployeeFormData>(() => {
    return extractEmployeeFormData(activeRecord);
  });

  // Reactive synchronizer to pre-fill formData when opening in Edit mode
  useEffect(() => {
    const target = initialData || employee || initialEmployee;
    if (target) {
      setFormData(extractEmployeeFormData(target));

      if (target.profilePicture) setProfilePicture(target.profilePicture);
      if (target.jobOfferDoc) setJobOfferDoc(target.jobOfferDoc);

      const fName = target.firstName || target.first_name || (target.name ? target.name.split(' ')[0] : '');
      const lName = target.lastName || target.last_name || (target.name ? target.name.split(' ').slice(1).join(' ') : '');
      const des = target.designation || 'Manager';

      if (target.posCredentials) {
        setPosNickName(target.posCredentials.nickName || fName || 'Operator');
        setPosLanguage(target.posCredentials.language || 'ARABIC');
        setPosActive(target.posCredentials.active ?? true);
        setPosAccessBackOffice(target.posCredentials.accessBackOffice ?? true);
        setPosSalesman(target.posCredentials.salesman ?? true);
        setPosDriver(target.posCredentials.driver ?? false);
        setPosTraining(target.posCredentials.training ?? false);
        setPosBackOfficeRole(target.posCredentials.backOfficeRole || 'MANAGER');
        setPosPassword(target.posCredentials.password || '123');
        setPosSecPassword(target.posCredentials.secPassword || '');
        setPosCloudLoginId(target.posCredentials.posCloudLoginId || '1300');
        setPosCloudPassword(target.posCredentials.posCloudPassword || '••••••');
        setPosConfiguration(target.posCredentials.configuration || 'Standard POS Retail Config ✔');
        setPosCashDrawerPort(target.posCredentials.cashDrawerPort || 'Usb');
        setPosPrinterType(target.posCredentials.printerType || 'TM-267');
        setPosOpenCashDrawer(target.posCredentials.openCashDrawer ?? true);
        setPosHideInTimeAtt(target.posCredentials.hideInTimeAttendance ?? false);
        setPosAutoTimeAtt(target.posCredentials.autoTimeAtt ?? true);
        setPosEmailSignature(
          target.posCredentials.emailSignature ||
          `${fName} ${lName} - ${des}\nSouthern Olive and Oil Products S.A.R.L.`
        );
      } else {
        setPosNickName(fName || 'Operator');
        setPosEmailSignature(
          `${fName} ${lName} - ${des}\nSouthern Olive and Oil Products S.A.R.L.`
        );
      }
    } else {
      setFormData(DEFAULT_EMPLOYEE_FORM_DATA);
      setProfilePicture(null);
      setJobOfferDoc(null);
    }
  }, [initialData, employee, initialEmployee, isOpen]);

  // Auto-generate UUID for Social Media Representative if empty
  useEffect(() => {
    if (formData.designation === 'social_media_rep') {
      if (!formData.socialMediaRep?.systemUuid) {
        const newUuid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `rep-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        setFormData(prev => ({
          ...prev,
          socialMediaRep: {
            ...(prev.socialMediaRep || DEFAULT_EMPLOYEE_FORM_DATA.socialMediaRep!),
            systemUuid: newUuid,
          }
        }));
      }
    }
  }, [formData.designation]);

  const handleUpdateRepField = (field: keyof SocialMediaRepConfig, value: any) => {
    setFormData(prev => ({
      ...prev,
      socialMediaRep: {
        ...(prev.socialMediaRep || DEFAULT_EMPLOYEE_FORM_DATA.socialMediaRep!),
        [field]: value,
      }
    }));
  };

  const handleAddExtraChannel = () => {
    setFormData(prev => {
      const current = prev.socialMediaRep || DEFAULT_EMPLOYEE_FORM_DATA.socialMediaRep!;
      const channels = current.extraChannels || [];
      const newChannel: ExtraPlatformChannel = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `chan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        platform: '',
        url: '',
      };
      return {
        ...prev,
        socialMediaRep: {
          ...current,
          extraChannels: [...channels, newChannel],
        }
      };
    });
  };

  const handleRemoveExtraChannel = (id: string) => {
    setFormData(prev => {
      const current = prev.socialMediaRep || DEFAULT_EMPLOYEE_FORM_DATA.socialMediaRep!;
      const channels = (current.extraChannels || []).filter(c => c.id !== id);
      return {
        ...prev,
        socialMediaRep: {
          ...current,
          extraChannels: channels,
        }
      };
    });
  };

  const handleUpdateExtraChannel = (id: string, key: 'platform' | 'url', val: string) => {
    setFormData(prev => {
      const current = prev.socialMediaRep || DEFAULT_EMPLOYEE_FORM_DATA.socialMediaRep!;
      const channels = (current.extraChannels || []).map(c => c.id === id ? { ...c, [key]: val } : c);
      return {
        ...prev,
        socialMediaRep: {
          ...current,
          extraChannels: channels,
        }
      };
    });
  };

  // Uploads
  const [profilePicture, setProfilePicture] = useState<string | null>(initialEmployee?.profilePicture || null);
  const [jobOfferDoc, setJobOfferDoc] = useState<string | null>(initialEmployee?.jobOfferDoc || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // Dropdown UI states
  const [isDialCodeDropdownOpen, setIsDialCodeDropdownOpen] = useState(false);
  const [dialCodeSearchQuery, setDialCodeSearchQuery] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState('');

  // Nested POS Credentials Configuration Modal State
  const [isPosConfigOpen, setIsPosConfigOpen] = useState<boolean>(false);
  const [posNickName, setPosNickName] = useState(initialEmployee?.posCredentials?.nickName || activeRecord?.firstName || activeRecord?.first_name || 'Operator');
  const [posLanguage, setPosLanguage] = useState<POSCredentialsConfig['language']>(
    initialEmployee?.posCredentials?.language || 'ARABIC'
  );
  const [posActive, setPosActive] = useState<boolean>(initialEmployee?.posCredentials?.active ?? true);
  const [posAccessBackOffice, setPosAccessBackOffice] = useState<boolean>(
    initialEmployee?.posCredentials?.accessBackOffice ?? true
  );
  const [posSalesman, setPosSalesman] = useState<boolean>(initialEmployee?.posCredentials?.salesman ?? true);
  const [posDriver, setPosDriver] = useState<boolean>(initialEmployee?.posCredentials?.driver ?? false);
  const [posTraining, setPosTraining] = useState<boolean>(initialEmployee?.posCredentials?.training ?? false);
  const [posBackOfficeRole, setPosBackOfficeRole] = useState<POSCredentialsConfig['backOfficeRole']>(
    initialEmployee?.posCredentials?.backOfficeRole || 'MANAGER'
  );
  const [posPassword, setPosPassword] = useState(initialEmployee?.posCredentials?.password || '123');
  const [posSecPassword, setPosSecPassword] = useState(initialEmployee?.posCredentials?.secPassword || '');
  const [posCloudLoginId, setPosCloudLoginId] = useState(initialEmployee?.posCredentials?.posCloudLoginId || '1300');
  const [posCloudPassword, setPosCloudPassword] = useState(initialEmployee?.posCredentials?.posCloudPassword || '••••••');
  const [posConfiguration, setPosConfiguration] = useState(
    initialEmployee?.posCredentials?.configuration || 'Standard POS Retail Config ✔'
  );
  const [posCashDrawerPort, setPosCashDrawerPort] = useState<POSCredentialsConfig['cashDrawerPort']>(
    initialEmployee?.posCredentials?.cashDrawerPort || 'Usb'
  );
  const [posPrinterType, setPosPrinterType] = useState<POSCredentialsConfig['printerType']>(
    initialEmployee?.posCredentials?.printerType || 'TM-267'
  );
  const [posOpenCashDrawer, setPosOpenCashDrawer] = useState<boolean>(
    initialEmployee?.posCredentials?.openCashDrawer ?? true
  );
  const [posHideInTimeAtt, setPosHideInTimeAtt] = useState<boolean>(
    initialEmployee?.posCredentials?.hideInTimeAttendance ?? false
  );
  const [posAutoTimeAtt, setPosAutoTimeAtt] = useState<boolean>(
    initialEmployee?.posCredentials?.autoTimeAtt ?? true
  );
  const [posEmailSignature, setPosEmailSignature] = useState(
    initialEmployee?.posCredentials?.emailSignature ||
      `${activeRecord?.firstName || activeRecord?.first_name || ''} ${activeRecord?.lastName || activeRecord?.last_name || ''} - ${activeRecord?.designation || 'Manager'}\nSouthern Olive and Oil Products S.A.R.L.`
  );

  // Broadcast Key Prompt Modal
  const [isApplyAllPromptOpen, setIsApplyAllPromptOpen] = useState(false);
  const [applyAllKey, setApplyAllKey] = useState('');
  const [posToastMsg, setPosToastMsg] = useState<string | null>(null);

  // Tab 3: Schedule Tab State
  const [schedBrand, setSchedBrand] = useState('Southern Olive and Oil Products (منتوجات زيت وزيتون الجنوب ش.م.م.)');
  const [schedBranch, setSchedBranch] = useState('Southern Olive and Oil Products - Main');
  const [schedYear, setSchedYear] = useState('2026');
  const [schedMonth, setSchedMonth] = useState('January');

  const showPosToast = (msg: string) => {
    setPosToastMsg(msg);
    setTimeout(() => setPosToastMsg(null), 3000);
  };

  // Active dial code details
  const activeDialCodeObj = useMemo(() => {
    return (
      ALL_COUNTRY_DIAL_CODES.find((c) => c.code === formData.countryCode) || {
        code: '+961',
        country: 'Lebanon',
        flag: '🇱🇧',
        iso: 'LB',
      }
    );
  }, [formData.countryCode]);

  // Filtered dial codes
  const filteredDialCodes = useMemo(() => {
    const q = dialCodeSearchQuery.trim().toLowerCase();
    if (!q) return ALL_COUNTRY_DIAL_CODES;
    const cleanQ = q.startsWith('+') ? q.slice(1) : q;
    return ALL_COUNTRY_DIAL_CODES.filter(
      (c) =>
        c.country.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.code.replace('+', '').includes(cleanQ) ||
        c.iso.toLowerCase().includes(q)
    );
  }, [dialCodeSearchQuery]);

  // Filtered worldwide countries
  const filteredCountries = useMemo(() => {
    const q = countrySearchQuery.trim().toLowerCase();
    if (!q) return ALL_WORLD_COUNTRIES;
    return ALL_WORLD_COUNTRIES.filter((c) => c.toLowerCase().includes(q));
  }, [countrySearchQuery]);

  // Filtered Lebanese Cities
  const filteredCities = useMemo(() => {
    return searchLebaneseCities(citySearchQuery);
  }, [citySearchQuery]);

  if (!isOpen) return null;

  // Handle Photo selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfilePicture(url);
    }
  };

  // Handle Document selection
  const handleDocSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setJobOfferDoc(file.name);
    }
  };

  // Handle Save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      alert('First Name and Last Name are required.');
      return;
    }

    const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
    const allEmployees = HRPersonnelService.getEmployees();
    const target = initialData || employee || initialEmployee;
    const nextId = target?.id || `EMP-${(allEmployees.length + 1).toString().padStart(3, '0')}`;

    const newEmp: HREmployeeRecord = {
      id: nextId,
      active: formData.status === 'Active',
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      fullName,
      email: formData.email.trim() || `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}@southernolive-lb.com`,
      phone: formData.phone.trim() ? `${formData.countryCode} ${formData.phone.trim()}` : '+961 70 000000',
      countryCode: formData.countryCode,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      maritalStatus: formData.maritalStatus,
      childrenCount: formData.numberOfChildren,
      contactPerson: formData.contactPerson.trim() || undefined,
      contactPhone: formData.contactPhone.trim() || undefined,
      profilePicture: profilePicture || undefined,
      jobOfferDoc: jobOfferDoc || undefined,
      department: formData.department,
      designation: formData.designation,
      location: formData.location,
      dateHired: formData.dateHired || undefined,
      dateLeft: formData.dateLeft || undefined,
      attendanceMacId: formData.attendanceMacId.trim() || undefined,
      country: formData.country,
      city: formData.city,
      address: formData.address.trim() || undefined,
      nationalId: formData.nationalId.trim() || undefined,
      socialSecurityNo: formData.socialSecurityNumber.trim() || undefined,
      brand: formData.brand,
      branch: formData.branchName,
      useBranch: formData.useBranch,
      isBackoffice: formData.createBackoffice,
      posEmployeeId: formData.posEmployeeId || '1',
      posCredentials: {
        nickName: posNickName || formData.firstName || 'Operator',
        language: posLanguage,
        active: posActive,
        accessBackOffice: posAccessBackOffice,
        salesman: posSalesman,
        driver: posDriver,
        training: posTraining,
        branch: formData.branchName,
        backOfficeRole: posBackOfficeRole,
        employeeId: formData.posEmployeeId || '1',
        password: posPassword,
        secPassword: posSecPassword,
        posCloudLoginId,
        posCloudPassword,
        configuration: posConfiguration,
        cashDrawerPort: posCashDrawerPort,
        printerType: posPrinterType,
        openCashDrawer: posOpenCashDrawer,
        hideInTimeAttendance: posHideInTimeAtt,
        autoTimeAtt: posAutoTimeAtt,
        emailSignature: posEmailSignature,
      },
      schedule: target?.schedule || {
        templateName: 'Backoffice Administration (08:00 - 16:30)',
      },
      socialMediaRep: formData.designation === 'social_media_rep' ? formData.socialMediaRep : undefined,
      createdAt: target?.createdAt || new Date().toISOString().split('T')[0],
    };

      // Persist workstation profile, authority, drawer kick, and ESC/POS printer settings to DB and Supabase
      fetch('/api/hr/sync-workstation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: newEmp.id,
          employeeName: newEmp.fullName,
          branch: newEmp.branch,
          workstationAuthority: {
            accessBackOffice: posAccessBackOffice,
            backOfficeRole: posBackOfficeRole,
            salesman: posSalesman,
            driver: posDriver,
            training: posTraining,
            active: posActive,
          },
          drawerKickSettings: {
            openCashDrawer: posOpenCashDrawer,
            cashDrawerPort: posCashDrawerPort,
            pin: 2,
          },
          printerConfig: {
            printerType: posPrinterType,
            configuration: posConfiguration,
            protocol: 'ESC_POS',
          },
          posCredentials: newEmp.posCredentials,
          employeeRecord: newEmp,
        }),
      }).catch((err) => console.warn('[NewEmployeeModal] Workstation persistence notice:', err));

      HRPersonnelService.saveEmployee(newEmp);
      onEmployeeCreated(newEmp);
      onClose();
    };

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col z-10 animate-zoomIn overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {(initialData || employee || initialEmployee) ? `Edit Employee: ${formData.firstName} ${formData.lastName}` : 'New Employee (HR Personnel Engine)'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Module 6 Personnel Master Record, Biometric Clock Binding & POS Credentials
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher Header (3 Tabs: Personal *, Work Location *, Schedule) */}
        <div className="flex items-center justify-between px-6 pt-3 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('personal')}
              className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'personal'
                  ? 'border-primary text-primary bg-primary/5 rounded-t-xl'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Personal *</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('work_location')}
              className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'work_location'
                  ? 'border-primary text-primary bg-primary/5 rounded-t-xl'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Work Location *</span>
            </button>
            {!hideScheduleTab && (
              <button
                type="button"
                onClick={() => setActiveTab('schedule')}
                className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'schedule'
                    ? 'border-primary text-primary bg-primary/5 rounded-t-xl'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Schedule</span>
              </button>
            )}
          </div>

          {/* Active Switch Toggle at Top */}
          <div className="flex items-center gap-2 pb-2">
            <span className="text-xs font-bold text-slate-700">Status:</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.status === 'Active'} onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked ? 'Active' : 'Inactive' }))}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              <span className={`ml-2 text-xs font-bold ${formData.status === 'Active' ? 'text-emerald-700' : 'text-slate-500'}`}>
                {formData.status}
              </span>
            </label>
          </div>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ================================================================= */}
          {/* TAB 1: PERSONAL *                                                 */}
          {/* ================================================================= */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              {/* Row 1: Employee Information & Uploads Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 2 Cols: Employee Info */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-primary">
                    <User className="w-3.5 h-3.5" />
                    <span>Employee Information</span>
                  </div>

                  {/* First Name & Last Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">First Name*</label>
                      <input
                        type="text"
                        required
                        value={formData.firstName} onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="e.g. Hussien"
                        className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Last Name*</label>
                      <input
                        type="text"
                        required
                        value={formData.lastName} onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="e.g. Jichi"
                        className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Phone with Exhaustive Searchable Country Dial Code */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Phone*</label>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setIsDialCodeDropdownOpen(!isDialCodeDropdownOpen);
                            setIsCountryDropdownOpen(false);
                            setIsCityDropdownOpen(false);
                          }}
                          className="w-36 px-2.5 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer focus:border-primary shadow-2xs hover:bg-slate-50 transition-colors"
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            <span className="text-base leading-none">{activeDialCodeObj.flag}</span>
                            <span className="font-mono font-bold">{activeDialCodeObj.code}</span>
                          </span>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                        </button>

                        {isDialCodeDropdownOpen && (
                          <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-2 max-h-64 overflow-y-auto space-y-1 animate-slideDown">
                            <div className="relative mb-2">
                              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                              <input
                                type="text"
                                autoFocus
                                value={dialCodeSearchQuery}
                                onChange={(e) => setDialCodeSearchQuery(e.target.value)}
                                placeholder="Search code, country or ISO (+971, France, US)..."
                                className="w-full pl-8 pr-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium outline-hidden"
                              />
                            </div>

                            {filteredDialCodes.length === 0 ? (
                              <div className="py-3 text-center text-xs text-slate-400 font-medium">
                                No dial codes matching "{dialCodeSearchQuery}"
                              </div>
                            ) : (
                              filteredDialCodes.map((c, idx) => (
                                <button
                                  key={`${c.code}-${c.country}-${idx}`}
                                  type="button"
                                  onClick={() => {
                                    setFormData(prev => ({ ...prev, countryCode: c.code }));
                                    setIsDialCodeDropdownOpen(false);
                                    setDialCodeSearchQuery('');
                                  }}
                                  className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between hover:bg-slate-100 transition-colors cursor-pointer ${
                                    formData.countryCode === c.code && activeDialCodeObj.country === c.country
                                      ? 'bg-primary/10 text-primary font-bold'
                                      : 'text-slate-800'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <span className="text-base leading-none shrink-0">{c.flag}</span>
                                    <span className="font-medium truncate">{c.country}</span>
                                  </div>
                                  <span className="font-mono font-bold text-slate-600 shrink-0 text-[11px] ml-2">
                                    {c.code}
                                  </span>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>

                      <input
                        type="text"
                        required
                        value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="70 123456"
                        className="flex-1 px-3 py-2 text-xs font-bold font-mono text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Email & Date of Birth */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Email</label>
                      <input
                        type="email"
                        value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="user@southernolive-lb.com"
                        className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Date of birth</label>
                      <input
                        type="date"
                        value={formData.dateOfBirth} onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        className="w-full px-3 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary font-mono"
                      />
                    </div>
                  </div>

                  {/* Gender & Marital Status & Children */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Gender*</label>
                      <select
                        value={formData.gender} onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as 'Male' | 'Female' }))}
                        className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary cursor-pointer"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Marital Status</label>
                      <select
                        value={formData.maritalStatus} onChange={(e) => setFormData(prev => ({ ...prev, maritalStatus: e.target.value as any }))}
                        className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary cursor-pointer"
                      >
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                        <option value="Separated">Separated</option>
                        <option value="Domestic Partner">Domestic Partner</option>
                        <option value="Not Specified">Not Specified</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Number of children</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.numberOfChildren} onChange={(e) => setFormData(prev => ({ ...prev, numberOfChildren: Math.max(0, parseInt(e.target.value, 10) || 0) }))}
                        className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary text-center font-mono"
                      />
                    </div>
                  </div>

                  {/* Contact Person & Contact Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Contact Person</label>
                      <input
                        type="text"
                        value={formData.contactPerson} onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                        placeholder="Emergency contact name"
                        className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Contact Phone</label>
                      <input
                        type="text"
                        value={formData.contactPhone} onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                        placeholder="+961..."
                        className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 1 Col: Profile Picture & Job Offer Uploads */}
                <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <div className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-primary">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Uploads & Documents</span>
                  </div>

                  {/* Profile Picture Box */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">Profile Picture</span>
                    <div className="w-full h-32 rounded-2xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center p-2 overflow-hidden relative">
                      {profilePicture ? (
                        <img
                          src={profilePicture}
                          alt="Profile Preview"
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <User className="w-8 h-8 stroke-1 text-slate-300" />
                          <span className="text-[11px] font-semibold mt-1">no-image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handlePhotoSelect}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 py-1.5 px-3 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer shadow-2xs"
                      >
                        Select image
                      </button>
                      {profilePicture && (
                        <button
                          type="button"
                          onClick={() => setProfilePicture(null)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-xl border border-red-100 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Document Box */}
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <span className="text-xs font-bold text-slate-700 block">Job Offer / CV</span>
                    <div className="w-full h-24 rounded-2xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center p-2 text-center">
                      <FileText className="w-6 h-6 stroke-1 text-slate-400" />
                      <span className="text-[11px] font-semibold text-slate-500 mt-1 truncate max-w-[200px]">
                        {jobOfferDoc || 'no-document'}
                      </span>
                    </div>
                    <input
                      type="file"
                      ref={docInputRef}
                      onChange={handleDocSelect}
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => docInputRef.current?.click()}
                      className="w-full py-1.5 px-3 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer shadow-2xs"
                    >
                      Select document
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 2: Work Information */}
              <div className="border-t border-slate-200 pt-4 space-y-3">
                <div className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-primary">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Work Information</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">{t('department', 'Department')}*</label>
                    <select
                      value={formData.department} onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                      className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary cursor-pointer"
                    >
                      {!DEPARTMENTS_MASTER_KEYS.includes(formData.department as any) && (
                        <option value={formData.department}>
                          {t(`departments.${formData.department}`, formData.department)}
                        </option>
                      )}
                      {DEPARTMENTS_MASTER_KEYS.map((d) => (
                        <option key={d} value={d}>
                          {t(`departments.${d}`)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">{t('designation', 'Designation')}*</label>
                    <select
                      value={formData.designation} onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                      className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary cursor-pointer"
                    >
                      {!DESIGNATIONS_MASTER_KEYS.includes(formData.designation as any) && (
                        <option value={formData.designation}>
                          {t(`designations.${formData.designation}`, formData.designation)}
                        </option>
                      )}
                      {DESIGNATIONS_MASTER_KEYS.map((des) => (
                        <option key={des} value={des}>
                          {t(`designations.${des}`)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">{t('location', 'Location')}</label>
                    <select
                      value={formData.location} onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary cursor-pointer"
                    >
                      {!LOCATIONS_MASTER_KEYS.includes(formData.location as any) && (
                        <option value={formData.location}>
                          {t(`locations.${formData.location}`, formData.location)}
                        </option>
                      )}
                      {LOCATIONS_MASTER_KEYS.map((loc) => (
                        <option key={loc} value={loc}>
                          {t(`locations.${loc}`)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Attendance Mac ID</label>
                    <input
                      type="text"
                      value={formData.attendanceMacId} onChange={(e) => setFormData(prev => ({ ...prev, attendanceMacId: e.target.value }))}
                      placeholder="00:1A:2B:3C:4D:5E"
                      className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Date Hired</label>
                    <input
                      type="date"
                      value={formData.dateHired} onChange={(e) => setFormData(prev => ({ ...prev, dateHired: e.target.value }))}
                      className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-800 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Date Left (if resigned/terminated)</label>
                    <input
                      type="date"
                      value={formData.dateLeft} onChange={(e) => setFormData(prev => ({ ...prev, dateLeft: e.target.value }))}
                      className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-800 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Conditional Social Media Representative Specification */}
              {formData.designation === 'social_media_rep' && (
                <div className="border-t border-slate-200 pt-4">
                  <div className="border border-emerald-200/80 bg-gradient-to-br from-emerald-50/50 via-teal-50/30 to-sky-50/40 rounded-3xl p-5 space-y-5 shadow-xs">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-200/60">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-600/10 text-emerald-700 flex items-center justify-center font-bold shadow-2xs">
                          <Share2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-black text-slate-900 tracking-tight">
                              {t('hr_rep.section_title')}
                            </h3>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                              {t('designations.social_media_rep')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium">
                            {t('hr_rep.section_subtitle')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 1. Detailed Address */}
                    <div className="space-y-2.5">
                      <div className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 text-emerald-800">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{t('hr_rep.address_heading')}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 block">{t('hr_rep.area')}</label>
                          <input
                            type="text"
                            value={formData.socialMediaRep?.area || ''}
                            onChange={(e) => handleUpdateRepField('area', e.target.value)}
                            placeholder={t('hr_rep.area_placeholder')}
                            className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-emerald-600 shadow-2xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 block">{t('hr_rep.street')}</label>
                          <input
                            type="text"
                            value={formData.socialMediaRep?.street || ''}
                            onChange={(e) => handleUpdateRepField('street', e.target.value)}
                            placeholder={t('hr_rep.street_placeholder')}
                            className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-emerald-600 shadow-2xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 block">{t('hr_rep.building')}</label>
                          <input
                            type="text"
                            value={formData.socialMediaRep?.building || ''}
                            onChange={(e) => handleUpdateRepField('building', e.target.value)}
                            placeholder={t('hr_rep.building_placeholder')}
                            className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-emerald-600 shadow-2xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 block">{t('hr_rep.floor')}</label>
                          <input
                            type="text"
                            value={formData.socialMediaRep?.floor || ''}
                            onChange={(e) => handleUpdateRepField('floor', e.target.value)}
                            placeholder={t('hr_rep.floor_placeholder')}
                            className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-emerald-600 shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 2. Contact Numbers */}
                    <div className="space-y-2.5 pt-2 border-t border-emerald-200/50">
                      <div className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 text-emerald-800">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{t('hr_rep.contact_numbers_heading')}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 block">{t('hr_rep.personal_phone')}</label>
                          <input
                            type="text"
                            value={formData.socialMediaRep?.personalPhone || ''}
                            onChange={(e) => handleUpdateRepField('personalPhone', e.target.value)}
                            placeholder={t('hr_rep.personal_phone_placeholder')}
                            className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-emerald-600 shadow-2xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 block">{t('hr_rep.business_whatsapp')}</label>
                          <input
                            type="text"
                            value={formData.socialMediaRep?.businessWhatsapp || ''}
                            onChange={(e) => handleUpdateRepField('businessWhatsapp', e.target.value)}
                            placeholder={t('hr_rep.business_whatsapp_placeholder')}
                            className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-emerald-600 shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 3. Identification & System Mapping */}
                    <div className="space-y-2.5 pt-2 border-t border-emerald-200/50">
                      <div className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 text-emerald-800">
                        <Key className="w-3.5 h-3.5" />
                        <span>{t('hr_rep.identification_heading')}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 block">{t('hr_rep.rep_admin_code')}</label>
                          <input
                            type="text"
                            value={formData.socialMediaRep?.repAdminCode || ''}
                            onChange={(e) => handleUpdateRepField('repAdminCode', e.target.value)}
                            placeholder={t('hr_rep.rep_admin_code_placeholder')}
                            className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-emerald-600 shadow-2xs"
                          />
                          <p className="text-[11px] text-slate-500 font-medium">
                            {t('hr_rep.rep_admin_code_help')}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-700 block">{t('hr_rep.system_uuid')}</label>
                            <button
                              type="button"
                              onClick={() => {
                                const newUuid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `rep-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
                                handleUpdateRepField('systemUuid', newUuid);
                              }}
                              className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>{t('hr_rep.regenerate_uuid')}</span>
                            </button>
                          </div>
                          <input
                            type="text"
                            readOnly
                            value={formData.socialMediaRep?.systemUuid || ''}
                            placeholder={t('hr_rep.system_uuid_placeholder')}
                            className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-700 bg-slate-100/90 border border-slate-200 rounded-xl outline-hidden cursor-default select-all"
                          />
                          <p className="text-[11px] text-slate-500 font-medium">
                            {t('hr_rep.system_uuid_help')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 4. Authorized Social Media Channels & Platforms */}
                    <div className="space-y-2.5 pt-2 border-t border-emerald-200/50">
                      <div className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 text-emerald-800">
                        <Globe className="w-3.5 h-3.5" />
                        <span>{t('hr_rep.channels_heading')}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 block">{t('hr_rep.facebook_url')}</label>
                          <input
                            type="text"
                            value={formData.socialMediaRep?.facebookUrl || ''}
                            onChange={(e) => handleUpdateRepField('facebookUrl', e.target.value)}
                            placeholder={t('hr_rep.facebook_url_placeholder')}
                            className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-emerald-600 shadow-2xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 block">{t('hr_rep.tiktok_url')}</label>
                          <input
                            type="text"
                            value={formData.socialMediaRep?.tiktokUrl || ''}
                            onChange={(e) => handleUpdateRepField('tiktokUrl', e.target.value)}
                            placeholder={t('hr_rep.tiktok_url_placeholder')}
                            className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-emerald-600 shadow-2xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 block">{t('hr_rep.instagram_url')}</label>
                          <input
                            type="text"
                            value={formData.socialMediaRep?.instagramUrl || ''}
                            onChange={(e) => handleUpdateRepField('instagramUrl', e.target.value)}
                            placeholder={t('hr_rep.instagram_url_placeholder')}
                            className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-emerald-600 shadow-2xs"
                          />
                        </div>
                      </div>

                      {/* Dynamic Repeater for Extra Platforms with (+) button */}
                      <div className="bg-white/80 border border-emerald-200/60 rounded-2xl p-3.5 space-y-3 mt-2">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <span>{t('hr_rep.extra_channels_heading')}</span>
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                              {formData.socialMediaRep?.extraChannels?.length || 0}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={handleAddExtraChannel}
                            className="px-2.5 py-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{t('hr_rep.add_channel')}</span>
                          </button>
                        </div>

                        {(!formData.socialMediaRep?.extraChannels || formData.socialMediaRep.extraChannels.length === 0) ? (
                          <div className="text-center py-3 text-xs text-slate-500 font-medium bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                            {t('hr_rep.no_extra_channels')}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {formData.socialMediaRep.extraChannels.map((channel) => (
                              <div key={channel.id} className="flex flex-col sm:flex-row items-center gap-2 bg-slate-50/80 p-2 rounded-xl border border-slate-200/80">
                                <div className="w-full sm:w-1/3">
                                  <input
                                    type="text"
                                    value={channel.platform}
                                    onChange={(e) => handleUpdateExtraChannel(channel.id, 'platform', e.target.value)}
                                    placeholder={t('hr_rep.platform_placeholder')}
                                    className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-lg outline-hidden focus:border-emerald-600"
                                  />
                                </div>
                                <div className="w-full sm:flex-1">
                                  <input
                                    type="text"
                                    value={channel.url}
                                    onChange={(e) => handleUpdateExtraChannel(channel.id, 'url', e.target.value)}
                                    placeholder="https://..."
                                    className="w-full px-2.5 py-1.5 text-xs font-medium text-slate-900 bg-white border border-slate-200 rounded-lg outline-hidden focus:border-emerald-600"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveExtraChannel(channel.id)}
                                  className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                                  title={t('hr_rep.remove_channel')}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 5. Commercial Markup Boundaries */}
                    <div className="space-y-2.5 pt-2 border-t border-emerald-200/50">
                      <div className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 text-emerald-800">
                        <Percent className="w-3.5 h-3.5" />
                        <span>{t('hr_rep.markups_heading')}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 block">{t('hr_rep.promotional_offers_percentage')}</label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={formData.socialMediaRep?.promotionalOffersPercentage ?? 5}
                              onChange={(e) => handleUpdateRepField('promotionalOffersPercentage', parseFloat(e.target.value) || 0)}
                              placeholder={t('hr_rep.promotional_offers_placeholder')}
                              className="w-full px-3 py-2 pr-8 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-emerald-600 shadow-2xs"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">%</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 block">{t('hr_rep.general_items_percentage')}</label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={formData.socialMediaRep?.generalItemsPercentage ?? 10}
                              onChange={(e) => handleUpdateRepField('generalItemsPercentage', parseFloat(e.target.value) || 0)}
                              placeholder={t('hr_rep.general_items_placeholder')}
                              className="w-full px-3 py-2 pr-8 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-emerald-600 shadow-2xs"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">%</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 bg-emerald-100/60 border border-emerald-200/80 rounded-xl p-2.5 text-emerald-900 text-xs font-medium">
                        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <span>{t('hr_rep.markup_note')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Row 3: Address & Identification with Lebanese Cities Directory */}
              <div className="border-t border-slate-200 pt-4 space-y-3">
                <div className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-primary">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Address & Identification</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Exhaustive Searchable Worldwide Country Dropdown */}
                  <div className="space-y-1 relative">
                    <label className="text-xs font-bold text-slate-700 block">Country* (ISO Worldwide)</label>
                    <div
                      onClick={() => {
                        setIsCountryDropdownOpen(!isCountryDropdownOpen);
                        setIsCityDropdownOpen(false);
                        setIsDialCodeDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer focus-within:border-primary shadow-2xs hover:bg-slate-50 transition-colors"
                    >
                      <span className="truncate">{formData.country}</span>
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
                    </div>

                    {isCountryDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-2 max-h-60 overflow-y-auto space-y-1 animate-slideDown">
                        <div className="relative mb-2">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            autoFocus
                            value={countrySearchQuery}
                            onChange={(e) => setCountrySearchQuery(e.target.value)}
                            placeholder="Search 245+ countries (Afghanistan to Zimbabwe)..."
                            className="w-full pl-8 pr-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium outline-hidden"
                          />
                        </div>

                        {filteredCountries.length === 0 ? (
                          <div className="py-3 text-center text-xs text-slate-400 font-medium">
                            No countries found matching "{countrySearchQuery}"
                          </div>
                        ) : (
                          filteredCountries.map((ctry) => (
                            <button
                              key={ctry}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, country: ctry }));
                                setIsCountryDropdownOpen(false);
                                setCountrySearchQuery('');
                              }}
                              className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between hover:bg-slate-100 transition-colors cursor-pointer ${
                                formData.country === ctry ? 'bg-primary/10 text-primary font-bold' : 'text-slate-800'
                              }`}
                            >
                              <span>{ctry}</span>
                              {ctry === 'Lebanon' && (
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                                  Default (🇱🇧)
                                </span>
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Custom Searchable Lebanese City Dropdown */}
                  <div className="space-y-1 relative">
                    <label className="text-xs font-bold text-slate-700 block">City* (Lebanese Directory)</label>
                    <div
                      onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                      className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer focus-within:border-primary shadow-2xs"
                    >
                      <span className="truncate">{formData.city}</span>
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
                    </div>

                    {/* Dropdown Menu */}
                    {isCityDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-2 max-h-60 overflow-y-auto space-y-1 animate-slideDown">
                        <div className="relative mb-2">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            autoFocus
                            value={citySearchQuery}
                            onChange={(e) => setCitySearchQuery(e.target.value)}
                            placeholder="Search Lebanese town or caza..."
                            className="w-full pl-8 pr-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium outline-hidden"
                          />
                        </div>

                        {filteredCities.length === 0 ? (
                          <div className="py-4 text-center text-xs text-slate-400 font-medium">
                            No cities found matching "{citySearchQuery}"
                          </div>
                        ) : (
                          filteredCities.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, city: `${c.name} - ${c.caza}` }));
                                setIsCityDropdownOpen(false);
                                setCitySearchQuery('');
                              }}
                              className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between hover:bg-slate-100 transition-colors cursor-pointer ${
                                formData.city.startsWith(c.name) ? 'bg-primary/10 text-primary font-bold' : 'text-slate-800'
                              }`}
                            >
                              <div>
                                <span className="font-bold">{c.name}</span>
                                {c.nameAr && (
                                  <span className="text-[11px] text-slate-500 font-arabic ml-1.5">
                                    {c.nameAr}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                                {c.caza}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">National ID</label>
                    <input
                      type="text"
                      value={formData.nationalId} onChange={(e) => setFormData(prev => ({ ...prev, nationalId: e.target.value }))}
                      placeholder="100..."
                      className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Social Security Number</label>
                    <input
                      type="text"
                      value={formData.socialSecurityNumber} onChange={(e) => setFormData(prev => ({ ...prev, socialSecurityNumber: e.target.value }))}
                      placeholder="CNSS-..."
                      className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Address</label>
                  <input
                    type="text"
                    value={formData.address} onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Street, building, floor, landmark"
                    className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary"
                  />
                </div>
              </div>

              {/* ================================================================= */}
              {/* OPERATIONAL RBAC MATRIX & INDUSTRIAL GUARDRAILS                   */}
              {/* ================================================================= */}
              <div className="border border-slate-200 bg-gradient-to-br from-slate-50 via-slate-50/70 to-blue-50/30 rounded-3xl p-5 space-y-3.5 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        {t('hr_rep.rbac_matrix_heading')}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {t('hr_rep.rbac_role_active')}: <span className="font-bold text-primary">{t(`designations.${formData.designation}`, formData.designation)}</span>
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 w-fit">
                    {t('hr_rep.guardrails_badge')}
                  </span>
                </div>

                {/* Dynamic RBAC Rule Box Based on Selected Designation */}
                {['oil_press_operator', 'packaging_worker', 'factory_worker', 'maintenance_tech'].includes(formData.designation) && (
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{t('hr_rep.rbac_factory_title')}</span>
                    </div>
                    <p className="text-xs text-amber-950/80 font-medium leading-relaxed pl-6">
                      {t('hr_rep.rbac_factory_desc')}
                    </p>
                  </div>
                )}

                {['warehouse_worker', 'forklift_driver', 'storekeeper'].includes(formData.designation) && (
                  <div className="bg-sky-500/5 border border-sky-500/20 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-center gap-2 text-sky-900 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                      <span>{t('hr_rep.rbac_warehouse_title')}</span>
                    </div>
                    <p className="text-xs text-sky-950/80 font-medium leading-relaxed pl-6">
                      {t('hr_rep.rbac_warehouse_desc')}
                    </p>
                  </div>
                )}

                {['delivery_driver', 'delivery_manager'].includes(formData.designation) && (
                  <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>{t('hr_rep.rbac_delivery_title')}</span>
                    </div>
                    <p className="text-xs text-indigo-950/80 font-medium leading-relaxed pl-6">
                      {t('hr_rep.rbac_delivery_desc')}
                    </p>
                  </div>
                )}

                {formData.designation === 'social_media_rep' && (
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{t('hr_rep.rbac_rep_title')}</span>
                    </div>
                    <p className="text-xs text-emerald-950/80 font-medium leading-relaxed pl-6">
                      {t('hr_rep.rbac_rep_desc')}
                    </p>
                  </div>
                )}

                {!['oil_press_operator', 'packaging_worker', 'factory_worker', 'maintenance_tech', 'warehouse_worker', 'forklift_driver', 'storekeeper', 'delivery_driver', 'delivery_manager', 'social_media_rep'].includes(formData.designation) && (
                  <div className="bg-slate-500/5 border border-slate-500/20 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-slate-600 shrink-0" />
                      <span>{t('hr_rep.rbac_standard_title')}</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed pl-6">
                      {t('hr_rep.rbac_standard_desc')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: WORK LOCATION * & POS SETUP                                */}
          {/* ================================================================= */}
          {activeTab === 'work_location' && (
            <div className="space-y-6">
              <div className="border border-slate-200 bg-slate-50/70 rounded-2xl p-4 space-y-4">
                <div className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center justify-between">
                  <span>Available in Brands / Branches</span>
                  <span className="text-[11px] font-bold text-primary font-mono">1300 Choueifat Complex</span>
                </div>

                {/* Brand Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Brand</label>
                  <select
                    value={formData.brand} onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                    className="w-full px-3 py-2.5 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary cursor-pointer shadow-2xs"
                  >
                    <option value="Southern Olive and Oil Products (منتوجات زيت وزيتون الجنوب ش.م.م.)">
                      Southern Olive and Oil Products (منتوجات زيت وزيتون الجنوب ش.م.م.)
                    </option>
                  </select>
                </div>

                {/* Branches Table with Exact Omega Interaction Logic */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-600 font-bold text-xs uppercase tracking-wider">
                        <th className="py-3 px-4 w-16 text-center">Use</th>
                        <th className="py-3 px-4">Branch</th>
                        <th className="py-3 px-4">Backoffice</th>
                        <th className="py-3 px-4 w-44 text-center">Employee ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={formData.useBranch}
  onChange={(e) => {
    const checked = e.target.checked;
    setFormData(prev => ({
      ...prev,
      useBranch: checked,
      createBackoffice: checked ? prev.createBackoffice : false
    }));
  }}
                            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                          />
                        </td>
                        <td className="py-3.5 px-4 text-xs font-bold text-slate-900">{formData.branchName}</td>
                        <td className="py-3.5 px-4">
                          {!formData.useBranch ? (
                            <span className="text-slate-400 font-bold text-sm select-none">-</span>
                          ) : (
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={formData.createBackoffice}
  onChange={(e) => {
    const checked = e.target.checked;
    setFormData(prev => ({
      ...prev,
      createBackoffice: checked,
      posEmployeeId: checked && (!prev.posEmployeeId || prev.posEmployeeId === '0') ? '1' : prev.posEmployeeId
    }));
  }}
                                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                              />
                              <span>Create as backoffice employee</span>
                            </label>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {!formData.useBranch || !formData.createBackoffice ? (
                            <span className="text-slate-400 font-bold text-sm select-none">-</span>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-800 rounded-lg text-xs font-mono font-bold">
                                #{formData.posEmployeeId}
                              </span>
                              <button
                                type="button"
                                onClick={() => setIsPosConfigOpen(true)}
                                title="Edit Backoffice / POS Credentials"
                                className="p-1 text-primary hover:bg-primary/10 rounded-md border border-primary/20 transition-colors cursor-pointer"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: SCHEDULE TAB (IN MODAL)                                     */}
          {/* ================================================================= */}
          {!hideScheduleTab && activeTab === 'schedule' && (
            <div className="space-y-6">
              <div className="border border-slate-200 bg-slate-50/70 rounded-2xl p-5 space-y-4">
                <div className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center justify-between">
                  <span>Assigned Work Shift Schedule</span>
                  <span className="text-[11px] font-bold text-primary font-mono">Payroll Year 2026</span>
                </div>

                {/* Filter Ribbon Inside Modal */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Brand</label>
                    <select
                      value={schedBrand}
                      onChange={(e) => setSchedBrand(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary"
                    >
                      <option value="Southern Olive and Oil Products (منتوجات زيت وزيتون الجنوب ش.م.م.)">
                        Southern Olive and Oil Products
                      </option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Branch</label>
                    <select
                      value={schedBranch}
                      onChange={(e) => setSchedBranch(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary"
                    >
                      <option value="Southern Olive and Oil Products - Main">
                        Southern Olive and Oil Products - Main
                      </option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Year</label>
                    <select
                      value={schedYear}
                      onChange={(e) => setSchedYear(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary"
                    >
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Month</label>
                    <select
                      value={schedMonth}
                      onChange={(e) => setSchedMonth(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary"
                    >
                      {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(
                        (m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                {/* Empty State / Direct Navigation Callout */}
                <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      No Active Shift Schedule Assigned for {schedMonth} {schedYear}
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mt-1">
                      Configure custom rotational shift slots, time attendance calendars, and off-day requests in the full Schedule Manager engine.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      window.open('/accounting/payroll/employee-schedules', '_blank');
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <span>+ Assign Schedule</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between bg-white">
            <div className="text-[11px] text-slate-500 font-semibold">
              Fields marked with an asterisk (*) are strictly required by the Vanguard HR engine.
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </form>

        {/* ================================================================= */}
        {/* NESTED MODAL: EDIT BACKOFFICE / POS CREDENTIALS                   */}
        {/* ================================================================= */}
        {isPosConfigOpen && (
          <div className="fixed inset-0 z-90 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs">
            <div className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col z-20 animate-zoomIn overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
                <div className="flex items-center gap-2.5">
                  <Laptop className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900">
                      POS & Backoffice Credentials: {formData.firstName || 'Operator'} {formData.lastName}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Terminal interface localization, workstation authority, and hardware peripherals
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPosConfigOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Toast Inside POS Config */}
              {posToastMsg && (
                <div className="bg-slate-900 text-white text-xs px-4 py-2 flex items-center justify-between">
                  <span className="font-bold">{posToastMsg}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
              )}

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                {/* Nick Name & Language */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Nick Name*</label>
                    <input
                      type="text"
                      value={posNickName}
                      onChange={(e) => setPosNickName(e.target.value)}
                      placeholder="e.g. Hussien"
                      className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Language* (POS Localization)</label>
                    <select
                      value={posLanguage}
                      onChange={(e) => setPosLanguage(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary cursor-pointer"
                    >
                      <option value="ARABIC">العربية (ARABIC)</option>
                      <option value="ENGLISH">English (ENGLISH)</option>
                      <option value="FRENCH">Français (FRENCH)</option>
                      <option value="SPANISH">Español (SPANISH)</option>
                      <option value="PERSIAN">فارسی (PERSIAN)</option>
                    </select>
                  </div>
                </div>

                {/* Toggles Row: Active, Access Back Office, Salesman, Driver, Training */}
                <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={posActive}
                      onChange={(e) => setPosActive(e.target.checked)}
                      className="w-4 h-4 rounded text-primary"
                    />
                    <span>Active</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={posAccessBackOffice}
                      onChange={(e) => setPosAccessBackOffice(e.target.checked)}
                      className="w-4 h-4 rounded text-primary"
                    />
                    <span>Access Back Office</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={posSalesman}
                      onChange={(e) => setPosSalesman(e.target.checked)}
                      className="w-4 h-4 rounded text-primary"
                    />
                    <span>Salesman</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={posDriver}
                      onChange={(e) => setPosDriver(e.target.checked)}
                      className="w-4 h-4 rounded text-primary"
                    />
                    <span>Driver</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={posTraining}
                      onChange={(e) => setPosTraining(e.target.checked)}
                      className="w-4 h-4 rounded text-primary"
                    />
                    <span>Training</span>
                  </label>
                </div>

                {/* Branch & Back Office Role */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Branch*</label>
                    <input
                      type="text"
                      disabled
                      value={formData.branchName}
                      className="w-full px-3 py-2 text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 rounded-xl cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Back Office Role*</label>
                    <select
                      value={posBackOfficeRole}
                      onChange={(e) => setPosBackOfficeRole(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary cursor-pointer"
                    >
                      <option value="MANAGER">MANAGER</option>
                      <option value="CASHIER">CASHIER</option>
                      <option value="Delivery">Delivery</option>
                      <option value="Finance department manager">Finance department manager</option>
                      <option value="Sales">Sales</option>
                      <option value="No Access">No Access</option>
                    </select>
                  </div>
                </div>

                {/* Employee ID, Password, Sec Password */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Employee ID</label>
                    <input
                      type="text"
                      value={formData.posEmployeeId}
                      onChange={(e) => setFormData(prev => ({ ...prev, posEmployeeId: e.target.value }))}
                      className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Password</label>
                    <input
                      type="password"
                      value={posPassword}
                      onChange={(e) => setPosPassword(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Sec Password</label>
                    <input
                      type="password"
                      value={posSecPassword}
                      onChange={(e) => setPosSecPassword(e.target.value)}
                      placeholder="Optional"
                      className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                {/* POS Cloud Login & Configuration */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">POS Cloud Login ID</label>
                    <input
                      type="text"
                      value={posCloudLoginId}
                      onChange={(e) => setPosCloudLoginId(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Cloud Password</label>
                    <input
                      type="password"
                      value={posCloudPassword}
                      onChange={(e) => setPosCloudPassword(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Configuration</label>
                    <select
                      value={posConfiguration}
                      onChange={(e) => setPosConfiguration(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl cursor-pointer"
                    >
                      <option value="Standard POS Retail Config ✔">Standard POS Retail Config ✔</option>
                      <option value="Wholesale Distribution Config ✔">Wholesale Distribution Config ✔</option>
                      <option value="Express Mill Cashier ✔">Express Mill Cashier ✔</option>
                    </select>
                  </div>
                </div>

                {/* Apply for all employees Button */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setIsApplyAllPromptOpen(true)}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Apply for all employees</span>
                  </button>
                </div>

                {/* Hardware Ports & Peripherals */}
                <div className="border-t border-slate-200 pt-3 space-y-3">
                  <div className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-primary">
                    <Printer className="w-3.5 h-3.5" />
                    <span>Hardware & Peripherals</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Cash drawer port</label>
                      <select
                        value={posCashDrawerPort}
                        onChange={(e) => setPosCashDrawerPort(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl"
                      >
                        <option value="Usb">Usb</option>
                        <option value="Null">Null</option>
                        <option value="COM1">COM1</option>
                        <option value="COM2">COM2</option>
                        <option value="COM3">COM3</option>
                        <option value="COM4">COM4</option>
                        <option value="COM5">COM5</option>
                        <option value="COM6">COM6</option>
                        <option value="LPT1">LPT1</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Printer Type</label>
                      <select
                        value={posPrinterType}
                        onChange={(e) => setPosPrinterType(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl"
                      >
                        <option value="TM-267">TM-267</option>
                        <option value="TM295">TM295</option>
                        <option value="Star SP200F">Star SP200F</option>
                        <option value="Citizen">Citizen</option>
                        <option value="Epson TM-T88">Epson TM-T88</option>
                        <option value="Generic Thermal 80mm">Generic Thermal 80mm</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-1">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={posOpenCashDrawer}
                        onChange={(e) => setPosOpenCashDrawer(e.target.checked)}
                        className="w-4 h-4 rounded text-primary"
                      />
                      <span>Open Cash Drawer</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={posHideInTimeAtt}
                        onChange={(e) => setPosHideInTimeAtt(e.target.checked)}
                        className="w-4 h-4 rounded text-primary"
                      />
                      <span>Hide in Time Attendance Report</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={posAutoTimeAtt}
                        onChange={(e) => setPosAutoTimeAtt(e.target.checked)}
                        className="w-4 h-4 rounded text-primary"
                      />
                      <span>AutoTime + Att</span>
                    </label>
                  </div>
                </div>

                {/* Email Signature */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Email Signature</label>
                  <textarea
                    rows={2}
                    value={posEmailSignature}
                    onChange={(e) => setPosEmailSignature(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary"
                  />
                </div>
              </div>

              {/* POS Footer */}
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/80">
                <button
                  type="button"
                  onClick={() => {
                    showPosToast('POS configuration broadcasted to all branches.');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
                >
                  Save for all Branches
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPosConfigOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPosConfigOpen(false);
                    }}
                    className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* NESTED PROMPT: ENTER KEY TO PERFORM THIS ACTION ?                 */}
        {/* ================================================================= */}
        {isApplyAllPromptOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xl max-w-sm w-full space-y-4 animate-zoomIn">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Broadcast POS Settings</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Enter key to perform this action ?
                  </p>
                </div>
              </div>

              <input
                type="password"
                autoFocus
                value={applyAllKey}
                onChange={(e) => setApplyAllKey(e.target.value)}
                placeholder="Enter security key..."
                className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl"
              />

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsApplyAllPromptOpen(false);
                    setApplyAllKey('');
                  }}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsApplyAllPromptOpen(false);
                    setApplyAllKey('');
                    showPosToast('POS configuration successfully broadcast to all employees.');
                  }}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors cursor-pointer shadow-xs"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
