'use client';

import React, { useState } from 'react';
import HrCrudPage from './HrCrudPage';
import { useHrEmployees, HrLookupItem } from '@/lib/hrTenantData';
import { DEFAULT_LABELS, DEFAULT_TIME_OFF_REASONS, EarningDeductionLabel, TimeOffReason, ymdNow } from '@/lib/hrPayrollData';
import { Download } from 'lucide-react';

const nextNum = (items: { id: string }[]) => String(Math.max(0, ...items.map((i) => Number(i.id) || 0)) + 1);

export function HrDepartmentsPage() {
  const { employees } = useHrEmployees();
  const active = employees.filter((e) => e.active !== false);
  const count = (name: string) => active.filter((e) => String(e.department || '').toLowerCase() === name.toLowerCase()).length;
  return (
    <HrCrudPage<HrLookupItem>
      title="Internal Departments"
      subtitle="Departments available for employees, schedules and reports."
      noun="Department"
      flagKey="hr_departments"
      defaults={[]}
      columns={[
        { header: 'Department Name', render: (r) => <span className="font-bold text-slate-900">{r.name}</span>, sort: (r) => r.name.toLowerCase() },
        { header: 'Sort Order', render: (r) => <span className="font-mono">{r.sortOrder}</span>, sort: (r) => r.sortOrder, align: 'right' },
        { header: 'Employee Count', render: (r) => <span className="font-mono font-bold">{count(r.name)}</span>, sort: (r) => count(r.name), align: 'right' }
      ]}
      fields={[
        { key: 'name', label: 'Department Name*', type: 'text', required: true },
        { key: 'sortOrder', label: 'Sorting', type: 'number' }
      ]}
      makeNew={(items) => ({ id: `dept-${Date.now()}`, name: '', sortOrder: items.length + 1 })}
      searchText={(r) => r.name}
      validate={(i, items) => (items.some((x) => x.id !== i.id && x.name.trim().toLowerCase() === i.name.trim().toLowerCase()) ? 'A department with this name already exists.' : null)}
      deleteWarning={(r) => (count(r.name) > 0 ? `${count(r.name)} active employee(s) are in "${r.name}". Delete it anyway?` : null)}
      toolbarExtra={({ items, setItems, setMessage }) => (
        <button
          type="button"
          onClick={() => {
            const have = new Set(items.map((i) => i.name.toLowerCase()));
            const found = Array.from(new Set(active.map((e) => String(e.department || '').trim()).filter(Boolean))).filter((n) => !have.has(n.toLowerCase()));
            if (!found.length) return setMessage('No new departments were found in employee records.');
            setItems((p) => [...p, ...found.map((name, i) => ({ id: `dept-${Date.now()}-${i}`, name, sortOrder: p.length + i + 1 }))]);
            setMessage(`Imported ${found.length} department(s) from employee records.`);
          }}
          className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" /> Import from employees
        </button>
      )}
    />
  );
}

export function HrDesignationsPage() {
  const { employees } = useHrEmployees();
  return (
    <HrCrudPage<HrLookupItem>
      title="Payroll Designations"
      subtitle="Job titles used in employee records and payroll."
      noun="Designation"
      flagKey="hr_designations"
      defaults={[]}
      columns={[{ header: 'Designation Name', render: (r) => <span className="font-bold text-slate-900">{r.name}</span>, sort: (r) => r.name.toLowerCase() }]}
      fields={[{ key: 'name', label: 'Designation Name*', type: 'text', required: true }]}
      makeNew={(items) => ({ id: `des-${Date.now()}`, name: '', sortOrder: items.length + 1 })}
      searchText={(r) => r.name}
      addTitle="Add Designation"
      editTitle="Edit Designation"
      validate={(i, items) => (items.some((x) => x.id !== i.id && x.name.trim().toLowerCase() === i.name.trim().toLowerCase()) ? 'This designation already exists.' : null)}
      deleteWarning={(r) => {
        const n = employees.filter((e) => e.active !== false && String(e.designation || '').toLowerCase() === r.name.toLowerCase()).length;
        return n > 0 ? `${n} active employee(s) use "${r.name}". Delete it anyway?` : null;
      }}
      toolbarExtra={({ items, setItems, setMessage }) => (
        <button
          type="button"
          onClick={() => {
            const have = new Set(items.map((i) => i.name.toLowerCase()));
            const found = Array.from(new Set(employees.filter((e) => e.active !== false).map((e) => String(e.designation || '').trim()).filter(Boolean))).filter((n) => !have.has(n.toLowerCase()));
            if (!found.length) return setMessage('No new designations were found in employee records.');
            setItems((p) => [...p, ...found.map((name, i) => ({ id: `des-${Date.now()}-${i}`, name, sortOrder: p.length + i + 1 }))]);
            setMessage(`Imported ${found.length} designation(s) from employee records.`);
          }}
          className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" /> Import from employees
        </button>
      )}
    />
  );
}

const DEFAULT_ROLES: HrLookupItem[] = ['CASHIER', 'Delivery', 'Finance department manager', 'MANAGER', 'sales'].map((name, i) => ({ id: String(i + 1), name, sortOrder: i + 1 }));

export function HrRolesPage() {
  return (
    <HrCrudPage<HrLookupItem>
      title="POS Employee Roles"
      subtitle="Roles that can be assigned to POS and back-office employees."
      noun="Role"
      flagKey="hr_roles"
      defaults={DEFAULT_ROLES}
      columns={[
        { header: '#', render: (r) => <span className="font-mono text-slate-500">{r.id}</span>, sort: (r) => Number(r.id) || 0 },
        { header: 'Description', render: (r) => <span className="font-bold text-slate-900">{r.name}</span>, sort: (r) => r.name.toLowerCase() }
      ]}
      fields={[
        { key: 'id', label: 'ID', type: 'text', readOnlyOnEdit: true },
        { key: 'name', label: 'Description*', type: 'text', required: true }
      ]}
      makeNew={(items) => ({ id: nextNum(items), name: '', sortOrder: 0 })}
      searchText={(r) => `${r.id} ${r.name}`}
      validate={(i, items, isNew) =>
        items.some((x) => x.id !== i.id && x.name.trim().toLowerCase() === i.name.trim().toLowerCase())
          ? 'This role already exists.'
          : isNew && items.some((x) => x.id === i.id)
            ? 'That ID is already used.'
            : null
      }
    />
  );
}

export function HrTimeOffReasonsPage() {
  return (
    <HrCrudPage<TimeOffReason>
      title="Time Off Reason"
      subtitle="Reasons offered when an employee requests time off."
      noun="Reason"
      flagKey="hr_time_off_reasons"
      defaults={DEFAULT_TIME_OFF_REASONS}
      columns={[
        { header: 'Description', render: (r) => <span className="font-bold text-slate-900">{r.description}</span>, sort: (r) => r.description.toLowerCase() },
        { header: 'Paid Status', render: (r) => <span className={`px-2.5 py-0.5 rounded-full font-bold ${r.paidStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>{r.paidStatus}</span>, sort: (r) => r.paidStatus }
      ]}
      fields={[
        { key: 'description', label: 'Description*', type: 'text', required: true },
        { key: 'paidStatus', label: 'Paid Status', type: 'select', options: ['Paid', 'Unpaid'] }
      ]}
      makeNew={() => ({ id: `reason-${Date.now()}`, description: '', paidStatus: 'Paid' })}
      searchText={(r) => r.description}
      validate={(i, items) => (items.some((x) => x.id !== i.id && x.description.trim().toLowerCase() === i.description.trim().toLowerCase()) ? 'This reason already exists.' : null)}
    />
  );
}

export function HrEarningsDeductionsPage() {
  const [typeFilter, setTypeFilter] = useState<'All' | 'Earnings' | 'Deduction'>('All');
  return (
    <HrCrudPage<EarningDeductionLabel>
      title="Earnings & Deductions"
      subtitle="Labels available for payment settings and salary processing."
      noun="Label"
      flagKey="hr_earnings_deductions"
      defaults={DEFAULT_LABELS}
      filter={(r) => typeFilter === 'All' || r.type === typeFilter}
      toolbarExtra={() => (
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)} className="px-3 py-1.5 border border-slate-300 rounded-xl bg-white text-xs font-bold">
          <option value="All">Show All</option>
          <option value="Earnings">Earnings</option>
          <option value="Deduction">Deduction</option>
        </select>
      )}
      columns={[
        { header: 'Description', render: (r) => <span className="font-bold text-slate-900">{r.description}{r.employerContribution && <span className="ml-2 px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px]">Employer</span>}</span>, sort: (r) => r.description.toLowerCase() },
        { header: 'Type', render: (r) => <span className={`px-2.5 py-0.5 rounded-full font-bold ${r.type === 'Earnings' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>{r.type}</span>, sort: (r) => r.type },
        { header: 'Created Date', render: (r) => <span className="font-mono text-slate-600">{r.createdDate}</span>, sort: (r) => r.createdDate }
      ]}
      fields={[
        { key: 'description', label: 'Description*', type: 'text', required: true },
        { key: 'type', label: 'Type*', type: 'select', options: ['Earnings', 'Deduction'], required: true },
        { key: 'isDefault', label: 'Default', type: 'checkbox', help: 'Offer this label by default' },
        { key: 'employerContribution', label: 'Employer Contribution', type: 'checkbox', help: 'Paid by the employer on top of salary' }
      ]}
      makeNew={() => ({ id: `label-${Date.now()}`, description: '', type: 'Earnings', createdDate: ymdNow(), isDefault: false, employerContribution: false })}
      searchText={(r) => r.description}
      addTitle="Add Earnings and Deductions"
      editTitle="Edit Earnings and Deductions"
      validate={(i, items) => (items.some((x) => x.id !== i.id && x.description.trim().toLowerCase() === i.description.trim().toLowerCase() && x.type === i.type) ? 'This label already exists.' : null)}
    />
  );
}
