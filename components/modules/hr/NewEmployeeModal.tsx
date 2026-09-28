'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  HREmployeeRecord,
  HRPersonnelService,
  POSCredentialsConfig,
} from '@/lib/hrPersonnelService';
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
} from 'lucide-react';

interface NewEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmployeeCreated: (employee: HREmployeeRecord) => void;
  initialEmployee?: HREmployeeRecord | null;
  hideScheduleTab?: boolean;
}


const DEPARTMENTS_LIST = [
  'Accounting',
  'Customer Care',
  'Customer Service and Support',
  'Distribution',
  'HR Human Resources',
  'IT Information Technology',
  'Legal',
  'Maintenance Management',
  'Marketing',
  'Owners',
  'Production',
  'Research and Development',
  'Sales',
  'Stores',
];

const DESIGNATIONS_LIST = [
  'Accountant',
  'Administrative Assistant',
  'Business Analyst',
  'Business Development Executive',
  'Cashier',
  'Chief Executive Officer CEO',
  'Chief Financial Officer CFO',
  'Chief Technology Officer CTO',
  'Clerk',
  'CRM Specialist',
  'Customer Care Representative',
  'Customer Service Representative',
  'Digital Marketing Specialist',
  'General Manager',
  'Human Resources Manager',
  'IT Specialist',
  'Marketing Manager',
  'Operations Manager',
  'Owner',
  'Procurement Officer',
  'Quality Control Inspector',
  'Receptionist',
  'Sales Account Manager',
  'Sales Manager',
  'Social Media Manager',
  'Supply Chain Manager',
  'Support Team Leader',
  'Training Manager',
];

export default function NewEmployeeModal({
  isOpen,
  onClose,
  onEmployeeCreated,
  initialEmployee,
  hideScheduleTab = false,
}: NewEmployeeModalProps) {
  // Tabs: 'personal' (Tab 1: Personal *) | 'work_location' (Tab 2: Work Location *) | 'schedule' (Tab 3: Schedule)
  const [activeTab, setActiveTab] = useState<'personal' | 'work_location' | 'schedule'>('personal');

  // Top Toggle
  const [isActive, setIsActive] = useState<boolean>(initialEmployee ? initialEmployee.active : true);

  // Tab 1: Personal Information
  const [firstName, setFirstName] = useState(initialEmployee?.firstName || '');
  const [lastName, setLastName] = useState(initialEmployee?.lastName || '');
  const [countryCode, setCountryCode] = useState(initialEmployee?.countryCode || '+961');
  const [dialCodeSearchQuery, setDialCodeSearchQuery] = useState('');
  const [isDialCodeDropdownOpen, setIsDialCodeDropdownOpen] = useState(false);
  const [phone, setPhone] = useState(initialEmployee?.phone || '');
  const [email, setEmail] = useState(initialEmployee?.email || '');
  const [dob, setDob] = useState(initialEmployee?.dateOfBirth || '1995-01-01');
  const [gender, setGender] = useState<'Male' | 'Female'>(initialEmployee?.gender || 'Male');
  const [maritalStatus, setMaritalStatus] = useState<HREmployeeRecord['maritalStatus']>(
    initialEmployee?.maritalStatus || 'Single'
  );
  const [childrenCount, setChildrenCount] = useState<number>(initialEmployee?.childrenCount || 0);
  const [contactPerson, setContactPerson] = useState(initialEmployee?.contactPerson || '');
  const [contactPhone, setContactPhone] = useState(initialEmployee?.contactPhone || '');

  // Uploads
  const [profilePicture, setProfilePicture] = useState<string | null>(initialEmployee?.profilePicture || null);
  const [jobOfferDoc, setJobOfferDoc] = useState<string | null>(initialEmployee?.jobOfferDoc || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // Work Information
  const [department, setDepartment] = useState(initialEmployee?.department || 'Production');
  const [designation, setDesignation] = useState(initialEmployee?.designation || 'General Manager');
  const [location, setLocation] = useState<'Office' | 'Remote' | 'Hybrid' | 'Field Based'>(
    initialEmployee?.location || 'Office'
  );
  const [dateHired, setDateHired] = useState(initialEmployee?.dateHired || '2024-05-15');
  const [dateLeft, setDateLeft] = useState(initialEmployee?.dateLeft || '');
  const [attendanceMacId, setAttendanceMacId] = useState(initialEmployee?.attendanceMacId || '');

  // Address & Identification
  const [country, setCountry] = useState(initialEmployee?.country || 'Lebanon');
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [city, setCity] = useState(initialEmployee?.city || 'Choueifat (معمل الشويفات)');
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [address, setAddress] = useState(initialEmployee?.address || '');
  const [nationalId, setNationalId] = useState(initialEmployee?.nationalId || '');
  const [socialSecurityNo, setSocialSecurityNo] = useState(initialEmployee?.socialSecurityNo || '');

  // Tab 2: Work Location *
  const [brand, setBrand] = useState('Southern Olive and Oil Products (منتوجات زيت وزيتون الجنوب ش.م.م.)');
  const [useBranch, setUseBranch] = useState(initialEmployee?.useBranch ?? true);
  const [branchName, setBranchName] = useState('1300 Choueifat Central Plant (معمل الشويفات)');
  const [isBackoffice, setIsBackoffice] = useState(initialEmployee?.isBackoffice ?? true);
  const [posEmployeeId, setPosEmployeeId] = useState(initialEmployee?.posEmployeeId || '1');

  // Nested POS Credentials Configuration Modal State
  const [isPosConfigOpen, setIsPosConfigOpen] = useState<boolean>(false);
  const [posNickName, setPosNickName] = useState(initialEmployee?.posCredentials?.nickName || firstName || 'Operator');
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
      `${firstName} ${lastName} - ${designation}\nSouthern Olive and Oil Products S.A.R.L.`
  );

  // Broadcast Key Prompt Modal
  const [isApplyAllPromptOpen, setIsApplyAllPromptOpen] = useState(false);
  const [applyAllKey, setApplyAllKey] = useState('');
  const [posToastMsg, setPosToastMsg] = useState<string | null>(null);

  // Tab 3: Schedule Tab State
  const [schedBrand, setSchedBrand] = useState('Southern Olive and Oil Products (منتوجات زيت وزيتون الجنوب ش.م.م.)');
  const [schedBranch, setSchedBranch] = useState('1300 Choueifat Central Plant (معمل الشويفات)');
  const [schedYear, setSchedYear] = useState('2026');
  const [schedMonth, setSchedMonth] = useState('January');

  const showPosToast = (msg: string) => {
    setPosToastMsg(msg);
    setTimeout(() => setPosToastMsg(null), 3000);
  };

  // Active dial code details
  const activeDialCodeObj = useMemo(() => {
    return (
      ALL_COUNTRY_DIAL_CODES.find((c) => c.code === countryCode) || {
        code: '+961',
        country: 'Lebanon',
        flag: '🇱🇧',
        iso: 'LB',
      }
    );
  }, [countryCode]);

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

    if (!firstName.trim() || !lastName.trim()) {
      alert('First Name and Last Name are required.');
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const allEmployees = HRPersonnelService.getEmployees();
    const nextId = initialEmployee?.id || `EMP-${(allEmployees.length + 1).toString().padStart(3, '0')}`;

    const newEmp: HREmployeeRecord = {
      id: nextId,
      active: isActive,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fullName,
      email: email.trim() || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@southernolive-lb.com`,
      phone: phone.trim() ? `${countryCode} ${phone.trim()}` : '+961 70 000000',
      countryCode,
      dateOfBirth: dob,
      gender,
      maritalStatus,
      childrenCount,
      contactPerson: contactPerson.trim() || undefined,
      contactPhone: contactPhone.trim() || undefined,
      profilePicture: profilePicture || undefined,
      jobOfferDoc: jobOfferDoc || undefined,
      department,
      designation,
      location,
      dateHired: dateHired || undefined,
      dateLeft: dateLeft || undefined,
      attendanceMacId: attendanceMacId.trim() || undefined,
      country,
      city,
      address: address.trim() || undefined,
      nationalId: nationalId.trim() || undefined,
      socialSecurityNo: socialSecurityNo.trim() || undefined,
      brand,
      branch: branchName,
      useBranch,
      isBackoffice,
      posEmployeeId: posEmployeeId || '1',
      posCredentials: {
        nickName: posNickName || firstName || 'Operator',
        language: posLanguage,
        active: posActive,
        accessBackOffice: posAccessBackOffice,
        salesman: posSalesman,
        driver: posDriver,
        training: posTraining,
        branch: branchName,
        backOfficeRole: posBackOfficeRole,
        employeeId: posEmployeeId || '1',
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
      schedule: initialEmployee?.schedule || {
        templateName: 'Standard Factory Shift (07:00 - 15:30)',
      },
      createdAt: initialEmployee?.createdAt || new Date().toISOString().split('T')[0],
    };

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
                {initialEmployee ? `Edit Employee: ${initialEmployee.fullName}` : 'New Employee (HR Personnel Engine)'}
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
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              <span className={`ml-2 text-xs font-bold ${isActive ? 'text-emerald-700' : 'text-slate-500'}`}>
                {isActive ? 'Active' : 'Inactive'}
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
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="e.g. Hussien"
                        className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Last Name*</label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
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
                                    setCountryCode(c.code);
                                    setIsDialCodeDropdownOpen(false);
                                    setDialCodeSearchQuery('');
                                  }}
                                  className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between hover:bg-slate-100 transition-colors cursor-pointer ${
                                    countryCode === c.code && activeDialCodeObj.country === c.country
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
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="user@southernolive-lb.com"
                        className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Date of birth</label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary font-mono"
                      />
                    </div>
                  </div>

                  {/* Gender & Marital Status & Children */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Gender*</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
                        className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary cursor-pointer"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Marital Status</label>
                      <select
                        value={maritalStatus}
                        onChange={(e) => setMaritalStatus(e.target.value as any)}
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
                        value={childrenCount}
                        onChange={(e) => setChildrenCount(Math.max(0, parseInt(e.target.value, 10) || 0))}
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
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        placeholder="Emergency contact name"
                        className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Contact Phone</label>
                      <input
                        type="text"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
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
                    <label className="text-xs font-bold text-slate-700 block">Department*</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary cursor-pointer"
                    >
                      {DEPARTMENTS_LIST.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Designation*</label>
                    <select
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary cursor-pointer"
                    >
                      {DESIGNATIONS_LIST.map((des) => (
                        <option key={des} value={des}>
                          {des}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Location</label>
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary cursor-pointer"
                    >
                      <option value="Office">Office</option>
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Field Based">Field Based</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Attendance Mac ID</label>
                    <input
                      type="text"
                      value={attendanceMacId}
                      onChange={(e) => setAttendanceMacId(e.target.value)}
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
                      value={dateHired}
                      onChange={(e) => setDateHired(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-800 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Date Left (if resigned/terminated)</label>
                    <input
                      type="date"
                      value={dateLeft}
                      onChange={(e) => setDateLeft(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-800 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary"
                    />
                  </div>
                </div>
              </div>

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
                      <span className="truncate">{country}</span>
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
                                setCountry(ctry);
                                setIsCountryDropdownOpen(false);
                                setCountrySearchQuery('');
                              }}
                              className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between hover:bg-slate-100 transition-colors cursor-pointer ${
                                country === ctry ? 'bg-primary/10 text-primary font-bold' : 'text-slate-800'
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
                      <span className="truncate">{city}</span>
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
                                setCity(`${c.name} - ${c.caza}`);
                                setIsCityDropdownOpen(false);
                                setCitySearchQuery('');
                              }}
                              className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between hover:bg-slate-100 transition-colors cursor-pointer ${
                                city.startsWith(c.name) ? 'bg-primary/10 text-primary font-bold' : 'text-slate-800'
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
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      placeholder="100..."
                      className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Social Security Number</label>
                    <input
                      type="text"
                      value={socialSecurityNo}
                      onChange={(e) => setSocialSecurityNo(e.target.value)}
                      placeholder="CNSS-..."
                      className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street, building, floor, landmark"
                    className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary"
                  />
                </div>
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
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
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
                            checked={useBranch}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setUseBranch(checked);
                              if (!checked) {
                                setIsBackoffice(false);
                              }
                            }}
                            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                          />
                        </td>
                        <td className="py-3.5 px-4 text-xs font-bold text-slate-900">
                          {branchName}
                        </td>
                        <td className="py-3.5 px-4">
                          {!useBranch ? (
                            <span className="text-slate-400 font-bold text-sm select-none">-</span>
                          ) : (
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={isBackoffice}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setIsBackoffice(checked);
                                  if (checked && (!posEmployeeId || posEmployeeId === '0')) {
                                    const allEmps = HRPersonnelService.getEmployees();
                                    const nextId = (allEmps.length + 1).toString();
                                    setPosEmployeeId(nextId);
                                  }
                                }}
                                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                              />
                              <span>Create as backoffice employee</span>
                            </label>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {!useBranch || !isBackoffice ? (
                            <span className="text-slate-400 font-bold text-sm select-none">-</span>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-800 rounded-lg text-xs font-mono font-bold">
                                #{posEmployeeId}
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
                      <option value="1300 Choueifat Central Plant (معمل الشويفات)">
                        1300 Choueifat Central Plant
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
                      POS & Backoffice Credentials: {firstName || 'Operator'} {lastName}
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
                      value={branchName}
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
                      value={posEmployeeId}
                      onChange={(e) => setPosEmployeeId(e.target.value)}
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
