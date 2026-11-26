'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const GROUPS: { title: string; items: { label: string; href: string }[] }[] = [
  { title: 'Schedule Overview', items: [{ label: 'Schedule Overview', href: '/backoffice/hr/schedule-overview' }] },
  { title: 'Personnel', items: [{ label: 'Employees', href: '/backoffice/hr/employees' }] },
  { title: 'Schedules', items: [{ label: 'Schedule Manager', href: '/backoffice/hr/schedules' }] },
  {
    title: 'Organization Setup',
    items: [
      { label: 'Internal Departments', href: '/backoffice/hr/departments' },
      { label: 'Designations', href: '/backoffice/hr/designations' },
      { label: 'POS Employee Roles', href: '/backoffice/hr/roles' }
    ]
  },
  {
    title: 'Time & Attendance',
    items: [
      { label: 'Time Off Requests', href: '/backoffice/hr/time-off' },
      { label: 'Schedule Templates', href: '/backoffice/hr/schedule-templates' },
      { label: 'Time Off Reason', href: '/backoffice/hr/time-off-reasons' },
      { label: 'Attendance Summary', href: '/backoffice/hr/attendance' },
      { label: 'Attendance Log', href: '/backoffice/hr/attendance-log' }
    ]
  },
  {
    title: 'Payroll',
    items: [
      { label: 'Payroll Dashboard', href: '/backoffice/hr/payroll' },
      { label: 'Salary Processing', href: '/backoffice/hr/salary-processing' },
      { label: 'Payment Settings', href: '/backoffice/hr/payment-settings' },
      { label: 'Earnings & Deductions', href: '/backoffice/hr/earnings-deductions' }
    ]
  }
];
export default function HrLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const isOn = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-start">
      <nav aria-label="Human Resources" className="hr-no-print w-full lg:w-56 shrink-0 bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs space-y-3 lg:sticky lg:top-3">
        <div className="px-2 text-[11px] font-black uppercase tracking-wider text-slate-400">Human Resources</div>
        {GROUPS.map((g) => (
          <div key={g.title} className="space-y-1">
            <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">{g.title}</div>
            {g.items.map((i) => (
              <Link
                prefetch={false}
                key={i.href}
                href={i.href}
                className={`block px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  isOn(i.href) ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {i.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div className="flex-1 min-w-0 w-full">{children}</div>
    </div>
  );
}
