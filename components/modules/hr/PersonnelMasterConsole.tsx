'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  HREmployeeRecord,
  HRPersonnelService,
  INITIAL_HR_PERSONNEL,
} from '@/lib/hrPersonnelService';
import NewEmployeeModal from './NewEmployeeModal';
import {
  Search,
  Filter,
  Plus,
  Pencil,
  Trash2,
  User,
  CheckCircle2,
  X,
  ChevronDown,
} from 'lucide-react';

const DEPARTMENTS_LIST = [
  'Accounting',
  'Customer Care',
  'Customer Service and Support',
  'Distribution',
  'HR Human Resources',
  'IT Information Technology',
  'Legal',
  'Maintenance Management',
  'Management',
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
  'General Operations Manager',
  'Human Resources Manager',
  'IT Specialist',
  'Marketing Manager',
  'Operations Manager',
  'Owner',
  'Owner / Director',
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

const TEMPLATES_LIST = [
  'Show All Templates',
  'Custom schedule',
  'Standard Factory Shift (07:00 - 15:30)',
  'Backoffice Administration (08:00 - 16:30)',
  'Distribution & Fleet Delivery (06:00 - 14:30)',
  'Part-Time Morning Shift (08:00 - 12:30)',
  'Weekend Coverage Shift (08:00 - 18:00)',
];

export default function PersonnelMasterConsole() {
  const [employees, setEmployees] = useState<HREmployeeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Top Ribbon Controls
  const [selectedBrand, setSelectedBrand] = useState('Southern Olive and Oil Products (منتوجات زيت وزيتون الجنوب ش.م.م.)');
  const [selectedBranch, setSelectedBranch] = useState('Southern Olive and Oil Products - Main');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter Row State
  const [activeFilter, setActiveFilter] = useState<'Show All' | 'Active' | 'Inactive'>('Show All');
  const [departmentFilter, setDepartmentFilter] = useState('Show All Departments');
  const [designationFilter, setDesignationFilter] = useState('Show All Designations');
  const [templateFilter, setTemplateFilter] = useState('Show All Templates');

  // Modals & State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<HREmployeeRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load employees from HRPersonnelService & subscribe to updates
  useEffect(() => {
    setEmployees(HRPersonnelService.getEmployees());
    setIsLoading(false);

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<HREmployeeRecord[]>;
      if (customEvent.detail && Array.isArray(customEvent.detail)) {
        setEmployees(customEvent.detail);
      } else {
        setEmployees(HRPersonnelService.getEmployees());
      }
    };

    window.addEventListener('vanguard_hr_employees_updated', handleUpdate);
    return () => {
      window.removeEventListener('vanguard_hr_employees_updated', handleUpdate);
    };
  }, []);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // 1. Search Query (name, phone, email, id)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName =
          emp.fullName.toLowerCase().includes(q) ||
          emp.firstName.toLowerCase().includes(q) ||
          emp.lastName.toLowerCase().includes(q);
        const matchesPhone = emp.phone.includes(q);
        const matchesEmail = emp.email ? emp.email.toLowerCase().includes(q) : false;
        const matchesId = emp.id.toLowerCase().includes(q) || (emp.posEmployeeId && emp.posEmployeeId.includes(q));

        if (!matchesName && !matchesPhone && !matchesEmail && !matchesId) {
          return false;
        }
      }

      // 2. Active Filter
      if (activeFilter === 'Active' && !emp.active) return false;
      if (activeFilter === 'Inactive' && emp.active) return false;

      // 3. Department Filter
      if (departmentFilter !== 'Show All Departments') {
        if (emp.department !== departmentFilter) return false;
      }

      // 4. Designation Filter
      if (designationFilter !== 'Show All Designations') {
        if (emp.designation !== designationFilter) return false;
      }

      // 5. Template Filter
      if (templateFilter !== 'Show All Templates') {
        if (templateFilter === 'Custom schedule') {
          if (emp.schedule?.templateName) return false;
        } else {
          if (emp.schedule?.templateName !== templateFilter) return false;
        }
      }

      return true;
    });
  }, [employees, searchQuery, activeFilter, departmentFilter, designationFilter, templateFilter]);

  // Total active count
  const totalActiveCount = useMemo(() => {
    return employees.filter((e) => e.active).length;
  }, [employees]);

  // Pagination Slice
  const totalFiltered = filteredEmployees.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEmployees.slice(start, start + pageSize);
  }, [filteredEmployees, currentPage, pageSize]);

  // Handlers
  const handleOpenNewEmployee = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleOpenEditEmployee = (emp: HREmployeeRecord) => {
    setEditingEmployee(emp);
    setIsModalOpen(true);
  };

  const handleDeleteEmployee = (emp: HREmployeeRecord) => {
    if (confirm(`Are you sure you want to delete employee "${emp.fullName}" (${emp.id})?`)) {
      const updated = HRPersonnelService.deleteEmployee(emp.id);
      setEmployees(updated);
      showToast(`Employee ${emp.fullName} deleted successfully.`);
    }
  };

  const handleEmployeeSaved = (savedEmp: HREmployeeRecord) => {
    setEmployees(HRPersonnelService.getEmployees());
    setIsModalOpen(false);
    setEditingEmployee(null);
    showToast(`Employee ${savedEmp.fullName} saved successfully.`);
  };

  return (
    <div className="space-y-4 pb-16 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-70 flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 animate-slideDown">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 1. HEADER & BREADCRUMB (Strict Omega Design)                         */}
      {/* ==================================================================== */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Personnel</h1>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
          <Link href="/backoffice" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-bold">Personnel</span>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. TOP RIBBON CONTROLS                                               */}
      {/* ==================================================================== */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* Left Ribbon Dropdowns: Brand & Branch */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Brand Dropdown */}
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="px-3 py-2 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary cursor-pointer shadow-2xs max-w-xs truncate"
            >
              <option value="Southern Olive and Oil Products (منتوجات زيت وزيتون الجنوب ش.م.م.)">
                Southern Olive and Oil Products (منتوجات زيت وزيتون الجنوب ش.م.م.)
              </option>
            </select>

            {/* Branch Dropdown */}
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-3 py-2 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary cursor-pointer shadow-2xs"
            >
              <option value="Southern Olive and Oil Products - Main">
                Southern Olive and Oil Products - Main
              </option>
            </select>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by name, phone, email or id"
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-hidden focus:bg-white focus:border-primary"
              />
            </div>
          </div>

          {/* Right Ribbon: Counter & Action Buttons */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            {/* Total Active Employees Counter */}
            <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs font-bold text-emerald-800 shrink-0">
              Total Active Employees: <span className="font-black font-mono ml-0.5">{totalActiveCount}</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Filter Button */}
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                  isFilterOpen
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filter</span>
              </button>

              {/* + New Button */}
              <button
                type="button"
                onClick={handleOpenNewEmployee}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ New</span>
              </button>
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* 3. FILTER TOGGLE ROW (Appears when Filter is clicked)               */}
        {/* ==================================================================== */}
        {isFilterOpen && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 animate-slideDown">
            {/* Dropdown 1: Active */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Status
              </label>
              <select
                value={activeFilter}
                onChange={(e) => {
                  setActiveFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary cursor-pointer shadow-2xs"
              >
                <option value="Show All">Show All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Dropdown 2: Departments */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Department
              </label>
              <select
                value={departmentFilter}
                onChange={(e) => {
                  setDepartmentFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary cursor-pointer shadow-2xs truncate"
              >
                <option value="Show All Departments">Show All Departments</option>
                {DEPARTMENTS_LIST.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Dropdown 3: Designations */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Designation
              </label>
              <select
                value={designationFilter}
                onChange={(e) => {
                  setDesignationFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary cursor-pointer shadow-2xs truncate"
              >
                <option value="Show All Designations">Show All Designations</option>
                {DESIGNATIONS_LIST.map((des) => (
                  <option key={des} value={des}>
                    {des}
                  </option>
                ))}
              </select>
            </div>

            {/* Dropdown 4: Schedule Templates */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Schedule Template
              </label>
              <select
                value={templateFilter}
                onChange={(e) => {
                  setTemplateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary cursor-pointer shadow-2xs truncate"
              >
                {TEMPLATES_LIST.map((tpl) => (
                  <option key={tpl} value={tpl}>
                    {tpl}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 4. PERSONNEL TABLE (Strict Omega Columns)                            */}
      {/* ==================================================================== */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-700 font-bold text-xs uppercase tracking-wider">
                <th className="py-3 px-3.5 w-12 text-center">#</th>
                <th className="py-3 px-4">First Name</th>
                <th className="py-3 px-4">Last Name</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Schedule Template</th>
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4 text-center">POS Login ID</th>
                <th className="py-3 px-4 text-center w-20">Picture</th>
                <th className="py-3 px-4 text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 text-xs font-medium">
                    No personnel found matching the specified criteria.
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((emp, idx) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* # Index / ID */}
                    <td className="py-3 px-3.5 text-center text-xs font-mono font-bold text-slate-500">
                      {(currentPage - 1) * pageSize + idx + 1}
                    </td>

                    {/* First Name */}
                    <td className="py-3 px-4 text-xs font-bold text-slate-900">
                      {emp.firstName}
                    </td>

                    {/* Last Name */}
                    <td className="py-3 px-4 text-xs font-bold text-slate-900">
                      {emp.lastName}
                    </td>

                    {/* Phone */}
                    <td className="py-3 px-4 text-xs font-mono text-slate-700">
                      {emp.phone || '-'}
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4 text-xs font-semibold text-slate-800">
                      {emp.department}
                    </td>

                    {/* Schedule Template */}
                    <td className="py-3 px-4 text-xs font-medium text-slate-600">
                      {emp.schedule?.templateName || (
                        <span className="text-slate-400 italic">Custom schedule</span>
                      )}
                    </td>

                    {/* Brand */}
                    <td className="py-3 px-4 text-xs font-semibold text-slate-700 max-w-[200px] truncate" title="Southern Olive and Oil Products">
                      Southern Olive and Oil Products
                    </td>

                    {/* POS Login ID (Clickable ID Link) */}
                    <td className="py-3 px-4 text-center">
                      {emp.posEmployeeId ? (
                        <button
                          type="button"
                          onClick={() => handleOpenEditEmployee(emp)}
                          className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-primary border border-blue-200 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer"
                          title="View / Edit POS Credentials"
                        >
                          #{emp.posEmployeeId}
                        </button>
                      ) : (
                        <span className="text-slate-400 font-bold">-</span>
                      )}
                    </td>

                    {/* Picture Thumbnail */}
                    <td className="py-3 px-4 text-center">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 mx-auto overflow-hidden flex items-center justify-center">
                        {emp.profilePicture ? (
                          <img
                            src={emp.profilePicture}
                            alt={emp.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-4 h-4 text-slate-400 stroke-1" />
                        )}
                      </div>
                    </td>

                    {/* Actions: Pencil & Trash */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditEmployee(emp)}
                          title="Edit Employee"
                          className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEmployee(emp)}
                          title="Delete Employee"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ==================================================================== */}
        {/* 5. BOTTOM PAGINATION: Centered « 1 »                                 */}
        {/* ==================================================================== */}
        <div className="flex items-center justify-center gap-1.5 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer shadow-2xs"
          >
            «
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
            <button
              key={pg}
              type="button"
              onClick={() => setCurrentPage(pg)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                currentPage === pg
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {pg}
            </button>
          ))}
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer shadow-2xs"
          >
            »
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 6. NEW / EDIT EMPLOYEE MODAL (All 3 Tabs: Personal, Work Location, Schedule) */}
      {/* ==================================================================== */}
      <NewEmployeeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEmployee(null);
        }}
        onEmployeeCreated={handleEmployeeSaved}
        initialEmployee={editingEmployee}
        initialData={editingEmployee}
        employee={editingEmployee}
        hideScheduleTab={false}
      />
    </div>
  );
}
