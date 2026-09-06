'use client';

import React from 'react';

interface EmployeeAttendanceTemplateProps {
  hideToolbar?: boolean;
  dynamicPeriodText?: string;
  executionDate?: string;
  reportTitle?: string;
  fromDate?: string;
  toDate?: string;
}

export const EmployeeAttendanceTemplate: React.FC<EmployeeAttendanceTemplateProps> = ({
  hideToolbar = true,
  dynamicPeriodText,
  executionDate = '06-Sep-2026',
  reportTitle = 'Employee attendance',
  fromDate = '01-Aug-2026',
  toDate = '27-Aug-2026',
}) => {
  const attendanceLogs = [
    {
      empId: 'EMP-001',
      name: 'Youssef Abboud',
      dept: 'Pressing & Plant Operations',
      shift: '07:00 - 15:30',
      punch: '06:55 - 17:30',
      workedHours: '10.5 Hours',
      overtime: '2.0 Hours OT',
      status: 'Present (OT)',
      hourlyRate: '$6.50',
      laborCost: '$68.25',
    },
    {
      empId: 'EMP-002',
      name: 'Laila Harb',
      dept: 'Accounting & Administration',
      shift: '08:00 - 16:30',
      punch: '07:58 - 16:32',
      workedHours: '8.5 Hours',
      overtime: '0.0 Hours',
      status: 'Present',
      hourlyRate: '$8.00',
      laborCost: '$68.00',
    },
    {
      empId: 'EMP-003',
      name: 'Nabil Sleiman',
      dept: 'Packaging & Bottling Line',
      shift: '07:00 - 15:30',
      punch: '07:02 - 15:30',
      workedHours: '8.5 Hours',
      overtime: '0.0 Hours',
      status: 'Present',
      hourlyRate: '$5.50',
      laborCost: '$46.75',
    },
    {
      empId: 'EMP-004',
      name: 'Ziad Kassis',
      dept: 'SuperSonic Fleet Logistics',
      shift: '06:30 - 15:00',
      punch: '06:25 - 16:15',
      workedHours: '9.8 Hours',
      overtime: '1.3 Hours OT',
      status: 'Present (OT)',
      hourlyRate: '$6.00',
      laborCost: '$58.80',
    },
  ];

  const isLaborCost = reportTitle.toLowerCase().includes('labor');

  return (
    <div className="w-full max-w-5xl mx-auto font-sans text-slate-800">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="text-blue-700 font-bold text-[14px]">
          Southern Olive Oil Products S.A.R.L
        </div>
        <div className="text-right text-[11px] font-mono text-slate-500">
          Workforce & Time Tracking
        </div>
      </div>

      <div className="text-center font-bold text-[16px] text-slate-900 mb-2">
        {reportTitle}
      </div>

      <div className="flex justify-between items-center text-[11px] font-mono border-b border-black pb-1 mb-4 text-slate-800">
        <span>Period: {fromDate} to {toDate}</span>
        <span>Standard Shift: 8.5 Hours</span>
        <span>Page 1 of 1</span>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-xs">
        <table className="w-full table-fixed text-left border-collapse text-[11px]">
          <thead>
            <tr className="border-b border-black font-bold text-black leading-tight bg-slate-100">
              <th className="py-2 px-2 normal-case w-[24%]">employee id & name</th>
              <th className="py-2 px-2 normal-case w-[20%]">department</th>
              <th className="py-2 px-2 normal-case w-[14%] text-center">scheduled shift</th>
              <th className="py-2 px-2 normal-case w-[14%] text-center">actual punch in/out</th>
              <th className="py-2 px-2 normal-case w-[12%] text-center">worked hours</th>
              {isLaborCost ? (
                <>
                  <th className="py-2 px-2 normal-case w-[8%] text-right">rate ($)</th>
                  <th className="py-2 px-2 normal-case w-[8%] text-right pr-2">cost ($)</th>
                </>
              ) : (
                <>
                  <th className="py-2 px-2 normal-case w-[8%] text-center">overtime</th>
                  <th className="py-2 px-2 normal-case w-[8%] text-center pr-2">status</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-[10.5px]">
            {attendanceLogs.map((log, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="py-1.5 px-2 font-bold text-slate-900">
                  <span className="font-mono text-slate-500 mr-1">{log.empId}</span> {log.name}
                </td>
                <td className="py-1.5 px-2 text-slate-700">{log.dept}</td>
                <td className="py-1.5 px-2 text-center font-mono text-slate-600">{log.shift}</td>
                <td className="py-1.5 px-2 text-center font-mono text-slate-800">{log.punch}</td>
                <td className="py-1.5 px-2 text-center font-mono font-bold">{log.workedHours}</td>
                {isLaborCost ? (
                  <>
                    <td className="py-1.5 px-2 text-right font-mono text-slate-600">{log.hourlyRate}</td>
                    <td className="py-1.5 px-2 text-right font-mono font-bold text-emerald-800 pr-2">
                      {log.laborCost}
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-1.5 px-2 text-center font-mono text-amber-700">{log.overtime}</td>
                    <td className="py-1.5 px-2 text-center pr-2">
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {log.status}
                      </span>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t-2 border-black mt-4 pt-2 flex justify-between items-center text-xs font-mono font-bold text-slate-700">
        <span>Total Employees Logged: {attendanceLogs.length}</span>
        <span>Total Shift Hours: 37.3 Hours | Overtime: 3.3 Hours</span>
      </div>
    </div>
  );
};
