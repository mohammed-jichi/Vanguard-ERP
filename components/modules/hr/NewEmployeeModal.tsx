'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  HREmployeeRecord,
  HRPersonnelService,
} from '@/lib/hrPersonnelService';
import {
  LEBANESE_CITIES,
  searchLebaneseCities,
  getGroupedLebaneseCities,
  LebaneseCity,
} from '@/lib/lebaneseCities';
import {
  X,
  User,
  MapPin,
  Building,
  Phone,
  Mail,
  Calendar,
  Upload,
  FileText,
  Trash2,
  Save,
  Search,
  ChevronDown,
  Check,
  CheckCircle2,
  Briefcase,
  Layers,
} from 'lucide-react';

interface NewEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmployeeCreated: (employee: HREmployeeRecord) => void;
}

const COUNTRY_DIAL_CODES = [
  { code: '+961', country: 'Lebanon', flag: '🇱🇧' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦' },
  { code: '+962', country: 'Jordan', flag: '🇯🇴' },
  { code: '+963', country: 'Syria', flag: '🇸🇾' },
  { code: '+964', country: 'Iraq', flag: '🇮🇶' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬' },
  { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+90', country: 'Turkey', flag: '🇹🇷' },
];

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
}: NewEmployeeModalProps) {
  // Tabs: 'personal' (Tab 1: Personal *) | 'work_location' (Tab 2: Work Location *)
  const [activeTab, setActiveTab] = useState<'personal' | 'work_location'>('personal');

  // Tab 1: Personal Information
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [countryCode, setCountryCode] = useState('+961');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('1995-01-01');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [maritalStatus, setMaritalStatus] = useState<HREmployeeRecord['maritalStatus']>('Single');
  const [childrenCount, setChildrenCount] = useState(0);
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Uploads
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [jobOfferDoc, setJobOfferDoc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // Work Information
  const [department, setDepartment] = useState('Production');
  const [designation, setDesignation] = useState('General Manager');
  const [location, setLocation] = useState<'Office' | 'Remote' | 'Hybrid' | 'Field Based'>('Office');
  const [attendanceMacId, setAttendanceMacId] = useState('');

  // Address & Identification
  const [country, setCountry] = useState('Lebanon');
  const [city, setCity] = useState('Choueifat (معمل الشويفات)');
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [socialSecurityNo, setSocialSecurityNo] = useState('');

  // Tab 2: Work Location *
  const [brand, setBrand] = useState('Southern Olive and Oil Products (منتوجات زيت وزيتون الجنوب ش.م.م.)');
  const [useBranch, setUseBranch] = useState(true);
  const [branchName, setBranchName] = useState('1300 Choueifat Central Plant (معمل الشويفات)');
  const [isBackoffice, setIsBackoffice] = useState(true);
  const [posEmployeeId, setPosEmployeeId] = useState('1');

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
    const nextId = `EMP-${(allEmployees.length + 1).toString().padStart(3, '0')}`;

    const newEmp: HREmployeeRecord = {
      id: nextId,
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
      createdAt: new Date().toISOString().split('T')[0],
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
                New Employee (HR Personnel Engine)
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Module 6 Personnel Master Record & Biometric Clock Binding
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

        {/* Tab Switcher Header */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 bg-slate-50/50">
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

                  {/* Phone with Country Dial Code */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Phone*</label>
                    <div className="flex items-center gap-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-32 px-2.5 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary cursor-pointer"
                      >
                        {COUNTRY_DIAL_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.code} ({c.country})
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="70 123456"
                        className="flex-1 px-3 py-2 text-xs font-bold font-mono text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary"
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
              </div>

              {/* Row 3: Address & Identification with Lebanese Cities Directory */}
              <div className="border-t border-slate-200 pt-4 space-y-3">
                <div className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-primary">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Address & Identification</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Country*</label>
                    <input
                      type="text"
                      disabled
                      value={country}
                      className="w-full px-3 py-2 text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 rounded-xl cursor-not-allowed"
                    />
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
                                setCity(`${c.name} (${c.caza})`);
                                setIsCityDropdownOpen(false);
                                setCitySearchQuery('');
                              }}
                              className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between hover:bg-slate-100 transition-colors cursor-pointer ${
                                city.includes(c.name) ? 'bg-primary/10 text-primary font-bold' : 'text-slate-800'
                              }`}
                            >
                              <div>
                                <span className="font-bold">{c.name}</span>
                                <span className="text-[11px] text-slate-500 font-arabic ml-1.5">
                                  {c.nameAr}
                                </span>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
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
          {/* TAB 2: WORK LOCATION *                                            */}
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

                {/* Branches Table */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-600 font-bold text-xs uppercase tracking-wider">
                        <th className="py-3 px-4 w-16 text-center">Use</th>
                        <th className="py-3 px-4">Branch</th>
                        <th className="py-3 px-4">Backoffice</th>
                        <th className="py-3 px-4 w-40 text-center">Employee ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={useBranch}
                            onChange={(e) => setUseBranch(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                          />
                        </td>
                        <td className="py-3.5 px-4 text-xs font-bold text-slate-900">
                          {branchName}
                        </td>
                        <td className="py-3.5 px-4">
                          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isBackoffice}
                              onChange={(e) => setIsBackoffice(e.target.checked)}
                              className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                            />
                            <span>Create as backoffice employee</span>
                          </label>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <input
                            type="text"
                            value={posEmployeeId}
                            onChange={(e) => setPosEmployeeId(e.target.value)}
                            placeholder="1"
                            className="w-20 px-2 py-1 text-xs font-mono font-bold text-center bg-slate-50 border border-slate-200 rounded-lg outline-hidden focus:border-primary"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
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
      </div>
    </div>
  );
}
