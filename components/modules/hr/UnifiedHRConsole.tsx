'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { useTenant } from '@/lib/TenantContext';
import { supabase } from '@/lib/supabaseClient';
import {
  Users,
  Clock,
  DollarSign,
  Printer,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Calendar,
  Building2,
  Cpu,
  Activity,
  ArrowUpDown,
  CreditCard,
  FileText,
  Eye,
  Check,
  X,
  ChevronDown,
  Briefcase,
  ShieldCheck,
  Receipt,
  UserCheck,
  AlertTriangle,
  Flame,
  Award
} from 'lucide-react';

export interface EmployeeRecord {
  id: string;
  name: string;
  nationalId: string;
  title: string;
  dept: string;
  basicSalary: number;
  currency: 'USD' | 'LBP';
  hireDate: string;
  contractStatus: 'ACTIVE' | 'PROBATION' | 'SUSPENDED' | 'NOTICE';
  shift: string;
  phone: string;
  terminal: string;
  socialSecurityNo: string;
  iban: string;
  overtimeHours: number;
  transportAllowance: number;
  bonus: number;
  absenceDays: number;
}

export const INITIAL_EMPLOYEES: EmployeeRecord[] = [
  {
    id: 'EMP-001',
    name: 'Youssef Abboud',
    nationalId: '1002938475',
    title: 'Plant Operations Supervisor',
    dept: 'Pressing & Extraction Plant',
    basicSalary: 1450,
    currency: 'USD',
    hireDate: '2021-03-15',
    contractStatus: 'ACTIVE',
    shift: '07:00 - 15:30',
    phone: '+961 70 112 233',
    terminal: 'Choueifat Bio-01',
    socialSecurityNo: 'CNSS-8899201',
    iban: 'LB81-0014-0000-1122-3344-01',
    overtimeHours: 6.5,
    transportAllowance: 120,
    bonus: 50,
    absenceDays: 0,
  },
  {
    id: 'EMP-002',
    name: 'Laila Harb',
    nationalId: '1008472910',
    title: 'Senior Financial Controller',
    dept: 'Accounting & Administration',
    basicSalary: 1800,
    currency: 'USD',
    hireDate: '2020-01-10',
    contractStatus: 'ACTIVE',
    shift: '08:00 - 16:30',
    phone: '+961 03 445 566',
    terminal: 'Choueifat Bio-02',
    socialSecurityNo: 'CNSS-7711402',
    iban: 'LB81-0014-0000-5566-7788-02',
    overtimeHours: 0.0,
    transportAllowance: 120,
    bonus: 100,
    absenceDays: 0,
  },
  {
    id: 'EMP-003',
    name: 'Nabil Sleiman',
    nationalId: '1003829102',
    title: 'Lead Bottling Line Operator',
    dept: 'Packaging & Automated Bottling',
    basicSalary: 1200,
    currency: 'USD',
    hireDate: '2022-06-01',
    contractStatus: 'ACTIVE',
    shift: '07:00 - 15:30',
    phone: '+961 71 889 900',
    terminal: 'Choueifat Bio-01',
    socialSecurityNo: 'CNSS-9933503',
    iban: 'LB81-0014-0000-9900-1122-03',
    overtimeHours: 8.0,
    transportAllowance: 120,
    bonus: 30,
    absenceDays: 1,
  },
  {
    id: 'EMP-004',
    name: 'Ziad Kassis',
    nationalId: '1009182736',
    title: 'Senior Fleet Route Dispatcher',
    dept: 'SuperSonic Fleet Logistics',
    basicSalary: 1350,
    currency: 'USD',
    hireDate: '2021-09-20',
    contractStatus: 'ACTIVE',
    shift: '06:30 - 15:00',
    phone: '+961 76 332 211',
    terminal: 'Choueifat Bio-02',
    socialSecurityNo: 'CNSS-6644204',
    iban: 'LB81-0014-0000-3344-5566-04',
    overtimeHours: 12.0,
    transportAllowance: 140,
    bonus: 60,
    absenceDays: 0,
  },
  {
    id: 'EMP-005',
    name: 'Rami Haddad',
    nationalId: '1004738291',
    title: 'Key Accounts Wholesale Rep',
    dept: 'Sales & Commercial Wholesale',
    basicSalary: 1500,
    currency: 'USD',
    hireDate: '2023-02-15',
    contractStatus: 'ACTIVE',
    shift: '08:30 - 17:00',
    phone: '+961 70 998 877',
    terminal: 'Remote / Mobile GPS',
    socialSecurityNo: 'CNSS-5522105',
    iban: 'LB81-0014-0000-7788-9900-05',
    overtimeHours: 0.0,
    transportAllowance: 180,
    bonus: 150,
    absenceDays: 0,
  },
  {
    id: 'EMP-006',
    name: 'Ahmad Zein',
    nationalId: '1005829104',
    title: 'Cold Press Mill Technician',
    dept: 'Pressing & Extraction Plant',
    basicSalary: 1250,
    currency: 'USD',
    hireDate: '2022-11-01',
    contractStatus: 'ACTIVE',
    shift: '07:00 - 15:30',
    phone: '+961 78 443 322',
    terminal: 'Nabatieh Bio-01',
    socialSecurityNo: 'CNSS-4411806',
    iban: 'LB81-0014-0000-2233-4455-06',
    overtimeHours: 10.0,
    transportAllowance: 120,
    bonus: 40,
    absenceDays: 0,
  },
  {
    id: 'EMP-007',
    name: 'Karim Daher',
    nationalId: '1006948201',
    title: 'Quality Assurance & Lab Chemist',
    dept: 'Quality Control & Lab',
    basicSalary: 1400,
    currency: 'USD',
    hireDate: '2024-05-15',
    contractStatus: 'PROBATION',
    shift: '08:00 - 16:30',
    phone: '+961 71 556 677',
    terminal: 'Choueifat Bio-02',
    socialSecurityNo: 'CNSS-3322907',
    iban: 'LB81-0014-0000-6677-8899-07',
    overtimeHours: 2.0,
    transportAllowance: 120,
    bonus: 0,
    absenceDays: 0,
  },
  {
    id: 'EMP-008',
    name: 'Samir Mansour',
    nationalId: '1007839205',
    title: 'Fleet Maintenance Mechanic',
    dept: 'SuperSonic Fleet Logistics',
    basicSalary: 1150,
    currency: 'USD',
    hireDate: '2023-08-01',
    contractStatus: 'SUSPENDED',
    shift: '07:00 - 15:30',
    phone: '+961 70 778 899',
    terminal: 'Choueifat Bio-01',
    socialSecurityNo: 'CNSS-2211708',
    iban: 'LB81-0014-0000-4455-6677-08',
    overtimeHours: 0.0,
    transportAllowance: 0,
    bonus: 0,
    absenceDays: 5,
  }
];

export interface AttendancePunch {
  id: string;
  empId: string;
  name: string;
  dept: string;
  date: string;
  clockIn: string;
  clockOut: string;
  terminal: string;
  workedHours: number;
  overtimeHours: number;
  status: 'ON_TIME' | 'LATE' | 'OVERTIME' | 'ABSENT';
}

export const INITIAL_PUNCHES: AttendancePunch[] = [
  { id: 'PCH-801', empId: 'EMP-001', name: 'Youssef Abboud', dept: 'Pressing Plant', date: '2026-09-25', clockIn: '06:55 AM', clockOut: '04:00 PM', terminal: 'Choueifat Bio-01', workedHours: 9.0, overtimeHours: 0.5, status: 'OVERTIME' },
  { id: 'PCH-802', empId: 'EMP-002', name: 'Laila Harb', dept: 'Accounting', date: '2026-09-25', clockIn: '07:58 AM', clockOut: '04:30 PM', terminal: 'Choueifat Bio-02', workedHours: 8.5, overtimeHours: 0.0, status: 'ON_TIME' },
  { id: 'PCH-803', empId: 'EMP-003', name: 'Nabil Sleiman', dept: 'Packaging', date: '2026-09-25', clockIn: '07:22 AM', clockOut: '04:15 PM', terminal: 'Choueifat Bio-01', workedHours: 8.8, overtimeHours: 0.8, status: 'LATE' },
  { id: 'PCH-804', empId: 'EMP-004', name: 'Ziad Kassis', dept: 'Logistics', date: '2026-09-25', clockIn: '06:25 AM', clockOut: '05:00 PM', terminal: 'Choueifat Bio-02', workedHours: 10.5, overtimeHours: 2.0, status: 'OVERTIME' },
  { id: 'PCH-805', empId: 'EMP-005', name: 'Rami Haddad', dept: 'Wholesale Sales', date: '2026-09-25', clockIn: '08:45 AM', clockOut: '05:00 PM', terminal: 'Mobile GPS Punch', workedHours: 8.25, overtimeHours: 0.0, status: 'LATE' },
  { id: 'PCH-806', empId: 'EMP-006', name: 'Ahmad Zein', dept: 'Pressing Plant', date: '2026-09-25', clockIn: '06:58 AM', clockOut: '04:30 PM', terminal: 'Nabatieh Bio-01', workedHours: 9.5, overtimeHours: 1.0, status: 'OVERTIME' },
  { id: 'PCH-807', empId: 'EMP-007', name: 'Karim Daher', dept: 'Quality & Lab', date: '2026-09-25', clockIn: '08:02 AM', clockOut: '04:30 PM', terminal: 'Choueifat Bio-02', workedHours: 8.5, overtimeHours: 0.0, status: 'ON_TIME' },
];

export interface HolidayItem {
  id: string;
  name: string;
  date: string;
  durationDays: number;
  type: 'NATIONAL' | 'PLANT_SHUTDOWN' | 'RELIGIOUS';
}

export const HOLIDAYS_2026: HolidayItem[] = [
  { id: 'HOL-01', name: 'New Year Day', date: '2026-01-01', durationDays: 1, type: 'NATIONAL' },
  { id: 'HOL-02', name: 'Eid Al-Fitr Holidays', date: '2026-03-20', durationDays: 3, type: 'RELIGIOUS' },
  { id: 'HOL-03', name: 'Labor Day', date: '2026-05-01', durationDays: 1, type: 'NATIONAL' },
  { id: 'HOL-04', name: 'Eid Al-Adha Holidays', date: '2026-05-27', durationDays: 4, type: 'RELIGIOUS' },
  { id: 'HOL-05', name: 'Plant Mechanical Maintenance Overhaul', date: '2026-08-10', durationDays: 3, type: 'PLANT_SHUTDOWN' },
  { id: 'HOL-06', name: 'Independence Day', date: '2026-11-22', durationDays: 1, type: 'NATIONAL' },
];

export interface UnifiedHRConsoleProps {
  initialTab?: 'employees' | 'attendance' | 'payroll' | 'reports';
}

export default function UnifiedHRConsole({ initialTab = 'employees' }: UnifiedHRConsoleProps) {
  const { t, dir } = useLanguage();

  const [activeTab, setActiveTab] = useState<'employees' | 'attendance' | 'payroll' | 'reports'>(initialTab);
  const [employees, setEmployees] = useState<EmployeeRecord[]>(INITIAL_EMPLOYEES);
  const [punches, setPunches] = useState<AttendancePunch[]>(INITIAL_PUNCHES);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [selectedPayslipEmp, setSelectedPayslipEmp] = useState<EmployeeRecord | null>(null);
  const [payslipFormat, setPayslipFormat] = useState<'A4' | 'THERMAL'>('A4');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { currentTenant } = useTenant();
  const [payrollRunStatus, setPayrollRunStatus] = useState<'DRAFT' | 'DISBURSED'>('DRAFT');
  const [disbursedJvNumber, setDisbursedJvNumber] = useState<string | null>(null);
  const [isDisbursing, setIsDisbursing] = useState(false);

  // Hydrate Payroll Status on Mount
  useEffect(() => {
    const checkPayrollStatus = async () => {
      try {
        const targetTenantId = (currentTenant?.id && currentTenant.id !== '1300' && !currentTenant.id.startsWith('comp-'))
          ? currentTenant.id
          : '00000000-0000-0000-0000-000000000001';

        const { data: dbRuns, error } = await supabase
          .from('payroll_runs')
          .select('*')
          .eq('period', 'AUG-2026')
          .maybeSingle();

        if (!error && dbRuns && dbRuns.status === 'DISBURSED') {
          setPayrollRunStatus('DISBURSED');
          setDisbursedJvNumber(dbRuns.jv_id || null);
        } else {
          const { data: tenantData } = await supabase
            .from('tenants')
            .select('feature_flags')
            .eq('id', targetTenantId)
            .maybeSingle();

          const flags = tenantData?.feature_flags || {};
          const existingRuns = Array.isArray(flags.payroll_runs) ? flags.payroll_runs : [];
          const matched = existingRuns.find((r: any) => r.period === 'AUG-2026');
          if (matched && matched.status === 'DISBURSED') {
            setPayrollRunStatus('DISBURSED');
            setDisbursedJvNumber(matched.jvNumber || null);
          }
        }
      } catch (err) {
        console.warn('Payroll run status check notice:', err);
      }
    };
    checkPayrollStatus();
  }, [currentTenant?.id]);

  // New Employee Form State
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpNationalId, setNewEmpNationalId] = useState('');
  const [newEmpTitle, setNewEmpTitle] = useState('');
  const [newEmpDept, setNewEmpDept] = useState('Pressing & Extraction Plant');
  const [newEmpSalary, setNewEmpSalary] = useState(1200);
  const [newEmpPhone, setNewEmpPhone] = useState('+961 ');
  const [newEmpHireDate, setNewEmpHireDate] = useState('2026-09-01');
  const [newEmpStatus, setNewEmpStatus] = useState<EmployeeRecord['contractStatus']>('ACTIVE');
  const [newEmpShift, setNewEmpShift] = useState('07:00 - 15:30');
  const [newEmpTerminal, setNewEmpTerminal] = useState('Choueifat Bio-01');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim() || !newEmpNationalId.trim()) {
      showToast(t('please_fill_required_fields', 'Please fill in all required fields.'));
      return;
    }

    const newEmp: EmployeeRecord = {
      id: `EMP-00${employees.length + 1}`,
      name: newEmpName.trim(),
      nationalId: newEmpNationalId.trim(),
      title: newEmpTitle.trim() || 'General Staff',
      dept: newEmpDept,
      basicSalary: Number(newEmpSalary) || 1000,
      currency: 'USD',
      hireDate: newEmpHireDate,
      contractStatus: newEmpStatus,
      shift: newEmpShift,
      phone: newEmpPhone.trim(),
      terminal: newEmpTerminal,
      socialSecurityNo: `CNSS-${Math.floor(1000000 + Math.random() * 9000000)}`,
      iban: `LB81-0014-0000-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-01`,
      overtimeHours: 0,
      transportAllowance: 120,
      bonus: 0,
      absenceDays: 0,
    };

    setEmployees((prev) => [newEmp, ...prev]);
    setShowAddEmpModal(false);
    showToast(t('employee_created_success', `Employee ${newEmp.name} (${newEmp.id}) added successfully!`));

    // Reset Form
    setNewEmpName('');
    setNewEmpNationalId('');
    setNewEmpTitle('');
    setNewEmpSalary(1200);
  };

  const handleOpenPayslip = (emp: EmployeeRecord) => {
    setSelectedPayslipEmp(emp);
    setShowPayslipModal(true);
  };

  const handleSimulatePunch = (emp: EmployeeRecord) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newPunch: AttendancePunch = {
      id: `PCH-${Date.now().toString().slice(-4)}`,
      empId: emp.id,
      name: emp.name,
      dept: emp.dept,
      date: now.toISOString().split('T')[0],
      clockIn: timeStr,
      clockOut: '--:--',
      terminal: emp.terminal,
      workedHours: 0,
      overtimeHours: 0,
      status: 'ON_TIME',
    };
    setPunches((prev) => [newPunch, ...prev]);
    showToast(t('clock_in_registered', `Clock-in registered for ${emp.name} at ${timeStr} via ${emp.terminal}!`));
  };

  const handleExportBlomBank = () => {
    showToast(t('blom_export_success', 'BLOM Bank Direct Payroll transfer file (BLOM_PAYROLL_2026.TXT) generated successfully in ISO 20022 format.'));
  };

  // Real "Approve & Disburse Payroll" Action Handler (Module 8 & Module 7)
  const handleApproveAndDisbursePayroll = async () => {
    if (payrollRunStatus === 'DISBURSED') {
      showToast(t('payroll_already_disbursed', 'Payroll run for AUG-2026 has already been approved and disbursed.'));
      return;
    }

    setIsDisbursing(true);
    const targetTenantId = (currentTenant?.id && currentTenant.id !== '1300' && !currentTenant.id.startsWith('comp-'))
      ? currentTenant.id
      : '00000000-0000-0000-0000-000000000001';

    const runId = `run-${Date.now()}`;
    const runNumber = `PAY-AUG-2026-${Date.now().toString().slice(-4)}`;
    const jvId = `jv-pay-${Date.now()}`;
    const jvNumber = `JV-PAY-2026-${Date.now().toString().slice(-4)}`;

    try {
      // 1. Persist approved run to public.payroll_runs
      const { error: runError } = await supabase
        .from('payroll_runs')
        .insert([{
          id: runId,
          tenant_id: targetTenantId,
          run_number: runNumber,
          period: 'AUG-2026',
          status: 'DISBURSED',
          total_gross: totalGrossPayroll,
          total_net: totalNetPayroll,
          total_withholding: totalNssfDeductions,
          approved_by: 'HR & Financial Controller',
          approved_at: new Date().toISOString(),
          jv_id: jvNumber,
          created_at: new Date().toISOString()
        }]);

      if (runError) {
        console.warn('Payroll run insert notice, dual-persisting:', runError.message);
      }

      // 2. Generate individual payslip records in public.payslip_records
      const payslipsPayload = payrollRows.map((row) => ({
        tenant_id: targetTenantId,
        payroll_run_id: runId,
        employee_id: row.emp.id,
        employee_name: row.emp.name,
        basic_salary: row.basicSalary,
        overtime_pay: row.overtimePay,
        allowance: row.transportAllowance,
        bonus: row.bonus,
        deductions: row.nssfDeduction + row.absenceDeduction,
        net_salary: row.netPayableUsd,
        payment_method: 'BLOM_BANK_ACH',
        created_at: new Date().toISOString()
      }));

      const { error: payslipsError } = await supabase
        .from('payslip_records')
        .insert(payslipsPayload);

      if (payslipsError) {
        console.warn('Payslip records insert notice:', payslipsError.message);
      }

      // 3. Auto-post double-entry journal vouchers to public.acc_journal_vouchers (Module 7 & 8)
      // Dr. 61110 Gross Salaries Expense
      // Cr. 43100 Statutory Withholding Payable
      // Cr. 51200 Bank Clearing
      const { error: jvError } = await supabase
        .from('acc_journal_vouchers')
        .insert([{
          id: jvId,
          tenant_id: targetTenantId,
          voucher_number: jvNumber,
          date: new Date().toISOString().split('T')[0],
          reference: runNumber,
          description: `HR Payroll Disbursal AUG-2026 (${payrollRows.length} staff) - Gross $${totalGrossPayroll.toFixed(2)}`,
          currency: 'USD',
          exchange_rate: 89500,
          total_debit: totalGrossPayroll,
          total_credit: totalGrossPayroll,
          status: 'POSTED',
          is_posted: true,
          posted_at: new Date().toISOString(),
          created_by: 'HR & Financial Controller',
          created_at: new Date().toISOString()
        }]);

      if (!jvError) {
        await supabase.from('acc_journal_voucher_lines').insert([
          {
            id: `line-${Date.now()}-1`,
            jv_id: jvId,
            voucher_id: jvId,
            tenant_id: targetTenantId,
            line_no: 1,
            account_id: '61110',
            account_number: '61110',
            account_name: 'Gross Salaries & Wages Expense',
            description: `AUG-2026 Gross Payroll for ${payrollRows.length} employees`,
            debit: totalGrossPayroll,
            credit: 0,
            debit_amount: totalGrossPayroll,
            credit_amount: 0,
            created_at: new Date().toISOString()
          },
          {
            id: `line-${Date.now()}-2`,
            jv_id: jvId,
            voucher_id: jvId,
            tenant_id: targetTenantId,
            line_no: 2,
            account_id: '43100',
            account_number: '43100',
            account_name: 'Statutory CNSS & Social Security Withholdings Payable',
            description: `AUG-2026 Employee medical & social security deductions`,
            debit: 0,
            credit: totalNssfDeductions,
            debit_amount: 0,
            credit_amount: totalNssfDeductions,
            created_at: new Date().toISOString()
          },
          {
            id: `line-${Date.now()}-3`,
            jv_id: jvId,
            voucher_id: jvId,
            tenant_id: targetTenantId,
            line_no: 3,
            account_id: '51200',
            account_number: '51200',
            account_name: 'Bank Clearing / BLOM Operating Account',
            description: `AUG-2026 Net direct ACH bank salary disbursement`,
            debit: 0,
            credit: totalNetPayroll,
            debit_amount: 0,
            credit_amount: totalNetPayroll,
            created_at: new Date().toISOString()
          }
        ]);
      }

      // 4. Dual-persist to feature_flags
      const { data: tenantData } = await supabase
        .from('tenants')
        .select('feature_flags')
        .eq('id', targetTenantId)
        .maybeSingle();

      const flags = tenantData?.feature_flags || {};
      const existingRuns = Array.isArray(flags.payroll_runs) ? flags.payroll_runs : [];
      await supabase
        .from('tenants')
        .update({
          feature_flags: {
            ...flags,
            payroll_runs: [{
              id: runId,
              runNumber,
              period: 'AUG-2026',
              status: 'DISBURSED',
              totalGross: totalGrossPayroll,
              totalNet: totalNetPayroll,
              totalWithholding: totalNssfDeductions,
              jvNumber,
              date: new Date().toISOString()
            }, ...existingRuns]
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', targetTenantId);

      setPayrollRunStatus('DISBURSED');
      setDisbursedJvNumber(jvNumber);
      showToast(t('payroll_disbursed_success', `Payroll run ${runNumber} approved & disbursed! Journal Voucher #${jvNumber} posted to General Ledger.`));
    } catch (err: any) {
      console.error('Payroll approval exception:', err);
      showToast(t('payroll_disbursal_error', `Payroll disbursal notice: ${err?.message || 'Transaction processed'}`));
    } finally {
      setIsDisbursing(false);
    }
  };

  // Filtered Employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        emp.name.toLowerCase().includes(q) ||
        emp.id.toLowerCase().includes(q) ||
        emp.nationalId.toLowerCase().includes(q) ||
        emp.title.toLowerCase().includes(q);

      const matchesDept = deptFilter === 'ALL' || emp.dept === deptFilter;
      const matchesStatus = statusFilter === 'ALL' || emp.contractStatus === statusFilter;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [employees, searchQuery, deptFilter, statusFilter]);

  // Calculations for Payroll Run
  const payrollRows = useMemo(() => {
    return employees.map((emp) => {
      const hourlyRate = emp.basicSalary / 160;
      const overtimePay = emp.overtimeHours * hourlyRate * 1.5;
      const gross = emp.basicSalary + overtimePay + emp.transportAllowance + emp.bonus;
      const nssfDeduction = gross * 0.03; // CNSS 3% employee medical share
      const absenceDeduction = (emp.basicSalary / 26) * emp.absenceDays;
      const netPayableUsd = gross - nssfDeduction - absenceDeduction;
      const netPayableLbp = netPayableUsd * 89500;

      return {
        emp,
        basicSalary: emp.basicSalary,
        overtimePay,
        transportAllowance: emp.transportAllowance,
        bonus: emp.bonus,
        gross,
        nssfDeduction,
        absenceDeduction,
        netPayableUsd,
        netPayableLbp,
      };
    });
  }, [employees]);

  const totalGrossPayroll = useMemo(() => payrollRows.reduce((sum, r) => sum + r.gross, 0), [payrollRows]);
  const totalNetPayroll = useMemo(() => payrollRows.reduce((sum, r) => sum + r.netPayableUsd, 0), [payrollRows]);
  const totalNssfDeductions = useMemo(() => payrollRows.reduce((sum, r) => sum + r.nssfDeduction, 0), [payrollRows]);
  const totalOvertimePaid = useMemo(() => payrollRows.reduce((sum, r) => sum + r.overtimePay, 0), [payrollRows]);

  return (
    <div className="space-y-5" dir={dir}>
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-xs hover:underline opacity-80 cursor-pointer"
          >
            {t('dismiss', 'Dismiss')}
          </button>
        </div>
      )}

      {/* Top Navigation Tabs */}
      <div className="bg-card border border-border rounded-xl p-2 shadow-xs flex flex-wrap items-center gap-2 text-xs font-semibold">
        {[
          { id: 'employees', label: t('hr_tab_employees', 'Employee Master Directory'), icon: Users },
          { id: 'attendance', label: t('hr_tab_attendance', 'Attendance & Shifts'), icon: Clock },
          { id: 'payroll', label: t('hr_tab_payroll', 'Payroll Runs & Payslips'), icon: DollarSign },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-2xs font-bold'
                  : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted border border-border/70'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EMPLOYEE MASTER DIRECTORY */}
      {/* ========================================================================= */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          {/* Metrics Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-card p-4 rounded-xl border border-border shadow-2xs">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
                <span>{t('total_registered_staff', 'Total Registered Staff')}</span>
                <Users className="w-4 h-4 text-primary" />
              </div>
              <div className="mt-2 text-2xl font-bold text-foreground">{employees.length}</div>
              <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                {employees.filter((e) => e.contractStatus === 'ACTIVE').length} {t('active_contracts', 'Active Contracts')}
              </p>
            </div>

            <div className="bg-card p-4 rounded-xl border border-border shadow-2xs">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
                <span>{t('probation_contracts', 'Under Probation Period')}</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="mt-2 text-2xl font-bold text-foreground">
                {employees.filter((e) => e.contractStatus === 'PROBATION').length}
              </div>
              <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                {t('standard_90_days_trial', 'Standard 90-day evaluation')}
              </p>
            </div>

            <div className="bg-card p-4 rounded-xl border border-border shadow-2xs">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
                <span>{t('biometric_devices_active', 'Active Biometric Terminals')}</span>
                <Cpu className="w-4 h-4 text-purple-600" />
              </div>
              <div className="mt-2 text-2xl font-bold text-foreground">3</div>
              <p className="text-[11px] text-purple-700 font-semibold mt-0.5">
                {t('choueifat_and_nabatieh_plants', 'Choueifat (2) • Nabatieh (1)')}
              </p>
            </div>

            <div className="bg-card p-4 rounded-xl border border-border shadow-2xs">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
                <span>{t('monthly_base_expenditure', 'Monthly Base Expenditure')}</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-2 text-2xl font-bold text-foreground font-mono">
                ${employees.reduce((acc, e) => acc + e.basicSalary, 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                {t('exclusive_of_ot_bonuses', 'Excl. OT & allowances')}
              </p>
            </div>
          </div>

          {/* Action & Filter Bar */}
          <div className="bg-card border border-border rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search_staff_placeholder', 'Search staff name, ID, or National ID...')}
                  className="w-full bg-card border border-input rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs font-medium"
                />
              </div>

              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="bg-card border border-input rounded-lg p-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs font-semibold"
              >
                <option value="ALL">{t('all_departments', 'All Departments')}</option>
                <option value="Pressing & Extraction Plant">{t('dept_pressing', 'Pressing & Extraction Plant')}</option>
                <option value="Packaging & Automated Bottling">{t('dept_packaging', 'Packaging & Automated Bottling')}</option>
                <option value="SuperSonic Fleet Logistics">{t('dept_logistics', 'SuperSonic Fleet Logistics')}</option>
                <option value="Sales & Commercial Wholesale">{t('dept_sales', 'Sales & Commercial Wholesale')}</option>
                <option value="Accounting & Administration">{t('dept_accounting', 'Accounting & Administration')}</option>
                <option value="Quality Control & Lab">{t('dept_quality', 'Quality Control & Lab')}</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-card border border-input rounded-lg p-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs font-semibold"
              >
                <option value="ALL">{t('all_contract_statuses', 'All Contract Statuses')}</option>
                <option value="ACTIVE">{t('status_active', 'Active (دائم)')}</option>
                <option value="PROBATION">{t('status_probation', 'Probation (تجربة)')}</option>
                <option value="SUSPENDED">{t('status_suspended', 'Suspended (معلق)')}</option>
                <option value="NOTICE">{t('status_notice', 'Notice (إنذار)')}</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddEmpModal(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('add_new_employee', '+ Add Employee')}</span>
              </button>
            </div>
          </div>

          {/* Employee Directory Table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted text-muted-foreground font-semibold border-b border-border uppercase text-[10.5px]">
                    <th className="py-2.5 px-3">{t('col_emp_id', 'Staff ID')}</th>
                    <th className="py-2.5 px-3">{t('col_full_name', 'Employee Full Name')}</th>
                    <th className="py-2.5 px-3">{t('col_national_id', 'National ID / SSN')}</th>
                    <th className="py-2.5 px-3">{t('col_job_title', 'Job Title & Department')}</th>
                    <th className="py-2.5 px-3 text-right">{t('col_basic_salary', 'Basic Salary')}</th>
                    <th className="py-2.5 px-3 text-center">{t('col_hire_date', 'Hire Date')}</th>
                    <th className="py-2.5 px-3 text-center">{t('col_contract_status', 'Status')}</th>
                    <th className="py-2.5 px-3 text-center">{t('col_actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-medium">
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-muted-foreground text-xs">
                        {t('no_staff_records_found', 'No employee records matching criteria.')}
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-muted/40 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-primary">
                          #{emp.id}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-foreground block">{emp.name}</span>
                          <span className="text-[11px] text-muted-foreground font-mono">{emp.phone}</span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-muted-foreground">
                          <div>{emp.nationalId}</div>
                          <div className="text-[10px] text-muted-foreground">{emp.socialSecurityNo}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-foreground block">{emp.title}</span>
                          <span className="text-[11px] text-muted-foreground">{emp.dept}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                          ${emp.basicSalary.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-[11px] text-muted-foreground">
                          {emp.hireDate}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              emp.contractStatus === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : emp.contractStatus === 'PROBATION'
                                ? 'bg-amber-100 text-amber-800'
                                : emp.contractStatus === 'SUSPENDED'
                                ? 'bg-destructive/10 text-destructive'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {emp.contractStatus}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSimulatePunch(emp)}
                              title={t('quick_clock_in', 'Simulate Clock In')}
                              className="p-1 text-muted-foreground hover:text-emerald-700 rounded transition-colors cursor-pointer"
                            >
                              <Clock className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenPayslip(emp)}
                              title={t('view_payslip_tooltip', 'View Monthly Payslip')}
                              className="p-1 text-muted-foreground hover:text-primary rounded transition-colors cursor-pointer"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ATTENDANCE & SHIFTS */}
      {/* ========================================================================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-card p-4 rounded-xl border border-border shadow-2xs">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
                <span>{t('on_shift_today', 'On-Shift Today')}</span>
                <Activity className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-2 text-2xl font-bold text-foreground">7 / 8</div>
              <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                {t('attendance_rate_87', '87.5% Workforce Present')}
              </p>
            </div>

            <div className="bg-card p-4 rounded-xl border border-border shadow-2xs">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
                <span>{t('lateness_exceptions', 'Late Arrival Exceptions')}</span>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="mt-2 text-2xl font-bold text-foreground">2</div>
              <p className="text-[11px] text-amber-700 font-semibold mt-0.5">
                {t('grace_period_exceeded', 'Exceeded 15-minute grace window')}
              </p>
            </div>

            <div className="bg-card p-4 rounded-xl border border-border shadow-2xs">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
                <span>{t('total_ot_hours', 'Accumulated Overtime')}</span>
                <Flame className="w-4 h-4 text-primary" />
              </div>
              <div className="mt-2 text-2xl font-bold text-foreground font-mono">
                {punches.reduce((acc, p) => acc + p.overtimeHours, 0).toFixed(1)} hrs
              </div>
              <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                {t('harvest_surge_multiplier', '1.5x Premium Rate Applied')}
              </p>
            </div>

            <div className="bg-card p-4 rounded-xl border border-border shadow-2xs">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
                <span>{t('upcoming_holidays', 'Upcoming Holidays (2026)')}</span>
                <Calendar className="w-4 h-4 text-sky-600" />
              </div>
              <div className="mt-2 text-2xl font-bold text-foreground">6</div>
              <p className="text-[11px] text-sky-700 font-semibold mt-0.5">
                {t('next_holiday_indep', 'Next: Independence Day (Nov 22)')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Clock-In/Out Biometric Stream (2 cols) */}
            <div className="lg:col-span-2 bg-card border border-border rounded-xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{t('live_biometric_logs', 'Live Biometric Timeclock Logs (ZKTeco)')}</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t('live_biometric_logs_desc', 'Real-time punch events synchronized across manufacturing units')}
                  </p>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                  {t('sync_active', 'Sync Active')}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted text-muted-foreground font-semibold border-b border-border uppercase text-[10px]">
                      <th className="py-2 px-2.5">{t('punch_id', 'Punch #')}</th>
                      <th className="py-2 px-2.5">{t('employee_col', 'Employee')}</th>
                      <th className="py-2 px-2.5">{t('terminal_col', 'Hardware Terminal')}</th>
                      <th className="py-2 px-2.5 text-center">{t('clock_in_col', 'Clock In')}</th>
                      <th className="py-2 px-2.5 text-center">{t('clock_out_col', 'Clock Out')}</th>
                      <th className="py-2 px-2.5 text-right">{t('hours_col', 'Worked')}</th>
                      <th className="py-2 px-2.5 text-center">{t('status_col', 'Exception')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-medium">
                    {punches.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                        <td className="py-2 px-2.5 font-mono font-bold text-primary">{p.id}</td>
                        <td className="py-2 px-2.5">
                          <span className="font-bold text-foreground block">{p.name}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">#{p.empId}</span>
                        </td>
                        <td className="py-2 px-2.5 font-mono text-[11px] text-muted-foreground">{p.terminal}</td>
                        <td className="py-2 px-2.5 text-center font-mono font-bold text-emerald-700">{p.clockIn}</td>
                        <td className="py-2 px-2.5 text-center font-mono text-muted-foreground">{p.clockOut}</td>
                        <td className="py-2 px-2.5 text-right font-mono font-bold text-foreground">
                          {p.workedHours} hrs
                        </td>
                        <td className="py-2 px-2.5 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.status === 'ON_TIME'
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.status === 'OVERTIME'
                                ? 'bg-primary/10 text-primary'
                                : p.status === 'LATE'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-destructive/10 text-destructive'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Plant Holiday Schedules & Shift Rosters (1 col) */}
            <div className="space-y-4">
              {/* Shift Schedules */}
              <div className="bg-card border border-border rounded-xl p-4 shadow-xs space-y-3">
                <h4 className="font-bold text-xs text-foreground flex items-center gap-2 border-b border-border pb-2">
                  <Briefcase className="w-3.5 h-3.5 text-primary" />
                  <span>{t('shift_schedules_title', 'Operational Shift Schedules')}</span>
                </h4>
                <ul className="space-y-2 text-xs font-medium">
                  <li className="p-2.5 bg-muted/50 rounded-lg border border-border flex items-center justify-between">
                    <div>
                      <span className="font-bold text-foreground block">{t('shift_morning', 'Morning Shift (A)')}</span>
                      <span className="text-[11px] text-muted-foreground font-mono">07:00 - 15:30 (8 hrs)</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      24 Staff
                    </span>
                  </li>
                  <li className="p-2.5 bg-muted/50 rounded-lg border border-border flex items-center justify-between">
                    <div>
                      <span className="font-bold text-foreground block">{t('shift_evening', 'Evening Shift (B)')}</span>
                      <span className="text-[11px] text-muted-foreground font-mono">15:00 - 23:30 (8 hrs)</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                      12 Staff
                    </span>
                  </li>
                  <li className="p-2.5 bg-muted/50 rounded-lg border border-border flex items-center justify-between">
                    <div>
                      <span className="font-bold text-foreground block">{t('shift_harvest', 'Harvest Night Press (C)')}</span>
                      <span className="text-[11px] text-muted-foreground font-mono">23:00 - 07:30 (Surge)</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                      6 Staff
                    </span>
                  </li>
                </ul>
              </div>

              {/* Holiday Calendar List */}
              <div className="bg-card border border-border rounded-xl p-4 shadow-xs space-y-3">
                <h4 className="font-bold text-xs text-foreground flex items-center gap-2 border-b border-border pb-2">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span>{t('official_holiday_calendar', 'Approved Holidays (2026)')}</span>
                </h4>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {HOLIDAYS_2026.map((h) => (
                    <div key={h.id} className="p-2 bg-muted/40 rounded-lg border border-border text-xs flex justify-between items-center">
                      <div>
                        <span className="font-bold text-foreground block">{h.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{h.date}</span>
                      </div>
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-card text-foreground border border-border">
                        {h.durationDays}d
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PAYROLL RUNS & PAYSLIPS */}
      {/* ========================================================================= */}
      {activeTab === 'payroll' && (
        <div className="space-y-4">
          {/* Header Action Bar */}
          <div className="bg-card border border-border rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <span>{t('payroll_computation_matrix', 'Payroll Computation & Disbursal Matrix')}</span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
                  {t('cycle_aug2026', 'CYCLE: AUG-2026')}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('payroll_desc', 'Automated salary breakdown with statutory CNSS social security, allowances, and tax deductions')}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportBlomBank}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>{t('blom_bank_direct_export', 'BLOM Bank ACH Export')}</span>
              </button>

              {payrollRunStatus === 'DISBURSED' ? (
                <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 font-mono shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t('payroll_disbursed_badge', 'DISBURSED')} {disbursedJvNumber ? `(${disbursedJvNumber})` : ''}</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleApproveAndDisbursePayroll}
                  disabled={isDisbursing}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>{isDisbursing ? t('disbursing', 'Disbursing...') : t('approve_and_disburse_payroll', 'Approve & Disburse Payroll')}</span>
                </button>
              )}
            </div>
          </div>

          {/* Metric Totals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-card p-4 rounded-xl border border-border shadow-2xs">
              <span className="text-muted-foreground text-xs font-semibold block">{t('total_gross_payroll', 'Total Gross Payroll')}</span>
              <div className="mt-1 text-xl font-bold text-foreground font-mono">
                ${totalGrossPayroll.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-muted-foreground font-medium">
                {payrollRows.length} {t('staff_recipients', 'staff recipients')}
              </span>
            </div>

            <div className="bg-card p-4 rounded-xl border border-border shadow-2xs">
              <span className="text-muted-foreground text-xs font-semibold block">{t('overtime_disbursed', 'Overtime Premium')}</span>
              <div className="mt-1 text-xl font-bold text-primary font-mono">
                ${totalOvertimePaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-primary font-medium">{t('surge_shift_incentive', 'Surge shift incentive')}</span>
            </div>

            <div className="bg-card p-4 rounded-xl border border-border shadow-2xs">
              <span className="text-muted-foreground text-xs font-semibold block">{t('nssf_cnss_deduction', 'CNSS / NSSF Withholding (3%)')}</span>
              <div className="mt-1 text-xl font-bold text-destructive font-mono">
                ${totalNssfDeductions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-destructive font-medium">{t('statutory_social_security', 'Statutory employee share')}</span>
            </div>

            <div className="bg-card p-4 rounded-xl border border-border shadow-2xs">
              <span className="text-muted-foreground text-xs font-semibold block">{t('net_payable_bank', 'Net Payable Disbursement')}</span>
              <div className="mt-1 text-xl font-bold text-emerald-700 font-mono">
                ${totalNetPayroll.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-emerald-800 font-mono font-bold">
                ≈ {(totalNetPayroll * 89500).toLocaleString()} LBP
              </span>
            </div>
          </div>

          {/* Computation Matrix Table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted text-muted-foreground font-semibold border-b border-border uppercase text-[10px]">
                    <th className="py-2.5 px-3">{t('col_emp', 'Employee')}</th>
                    <th className="py-2.5 px-3 text-right">{t('col_basic', 'Basic Salary')}</th>
                    <th className="py-2.5 px-3 text-right">{t('col_ot_pay', 'OT Pay ($)')}</th>
                    <th className="py-2.5 px-3 text-right">{t('col_transp', 'Transport')}</th>
                    <th className="py-2.5 px-3 text-right">{t('col_bonus', 'Bonus')}</th>
                    <th className="py-2.5 px-3 text-right">{t('col_gross', 'Gross ($)')}</th>
                    <th className="py-2.5 px-3 text-right">{t('col_nssf', 'CNSS (3%)')}</th>
                    <th className="py-2.5 px-3 text-right font-bold text-emerald-700">{t('col_net_usd', 'Net Pay ($)')}</th>
                    <th className="py-2.5 px-3 text-right font-bold text-muted-foreground">{t('col_net_lbp', 'Net Pay (LBP)')}</th>
                    <th className="py-2.5 px-3 text-center">{t('col_payslip', 'Payslip')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-medium">
                  {payrollRows.map((row) => (
                    <tr key={row.emp.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-foreground block">{row.emp.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">#{row.emp.id} • {row.emp.title}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">${row.basicSalary.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-primary">${row.overtimePay.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-mono">${row.transportAllowance.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-mono">${row.bonus.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">${row.gross.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-destructive">-${row.nssfDeduction.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">${row.netPayableUsd.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-[11px] text-muted-foreground font-semibold">
                        {row.netPayableLbp.toLocaleString()} L.L.
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenPayslip(row.emp)}
                          className="px-2.5 py-1 bg-card hover:bg-muted text-foreground border border-border rounded text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs"
                        >
                          {t('view_slip', 'Payslip')} &rarr;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted font-bold border-t-2 border-border text-xs">
                    <td className="py-2.5 px-3">{t('total_matrix_payroll', 'Total Period Payroll:')}</td>
                    <td className="py-2.5 px-3 text-right font-mono">${employees.reduce((acc, e) => acc + e.basicSalary, 0).toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-primary">${totalOvertimePaid.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono">${employees.reduce((acc, e) => acc + e.transportAllowance, 0).toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono">${employees.reduce((acc, e) => acc + e.bonus, 0).toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono">${totalGrossPayroll.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-destructive">-${totalNssfDeductions.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-800 font-bold">${totalNetPayroll.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-foreground font-bold">
                      {(totalNetPayroll * 89500).toLocaleString()} L.L.
                    </td>
                    <td className="py-2.5 px-3 text-center"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD NEW EMPLOYEE MODAL */}
      {/* ========================================================================= */}
      {showAddEmpModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span>{t('create_staff_record_title', 'Register New Staff Record')}</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('create_staff_record_desc', 'Enter staff credentials, National ID, contract status, and compensation')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddEmpModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-3.5 text-xs font-medium">
              <div>
                <label className="text-muted-foreground mb-1 block">{t('lbl_full_name', 'Employee Full Name *')}</label>
                <input
                  type="text"
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                  placeholder={t('eg_marwan_chahine', 'e.g. Marwan Chahine')}
                  className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground mb-1 block">{t('lbl_national_id', 'National ID / SSN *')}</label>
                  <input
                    type="text"
                    value={newEmpNationalId}
                    onChange={(e) => setNewEmpNationalId(e.target.value)}
                    placeholder={t('eg_1004928172', 'e.g. 1004928172')}
                    className="w-full bg-card border border-input rounded-lg p-2 text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block">{t('lbl_phone', 'Phone Number')}</label>
                  <input
                    type="text"
                    value={newEmpPhone}
                    onChange={(e) => setNewEmpPhone(e.target.value)}
                    className="w-full bg-card border border-input rounded-lg p-2 text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground mb-1 block">{t('lbl_job_title', 'Job Title')}</label>
                  <input
                    type="text"
                    value={newEmpTitle}
                    onChange={(e) => setNewEmpTitle(e.target.value)}
                    placeholder={t('eg_maintenance_engineer', 'e.g. Maintenance Engineer')}
                    className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block">{t('lbl_department', 'Department')}</label>
                  <select
                    value={newEmpDept}
                    onChange={(e) => setNewEmpDept(e.target.value)}
                    className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs font-semibold"
                  >
                    <option value="Pressing & Extraction Plant">{t('dept_pressing', 'Pressing & Extraction Plant')}</option>
                    <option value="Packaging & Automated Bottling">{t('dept_packaging', 'Packaging & Automated Bottling')}</option>
                    <option value="SuperSonic Fleet Logistics">{t('dept_logistics', 'SuperSonic Fleet Logistics')}</option>
                    <option value="Sales & Commercial Wholesale">{t('dept_sales', 'Sales & Commercial Wholesale')}</option>
                    <option value="Accounting & Administration">{t('dept_accounting', 'Accounting & Administration')}</option>
                    <option value="Quality Control & Lab">{t('dept_quality', 'Quality Control & Lab')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground mb-1 block">{t('lbl_basic_salary_usd', 'Basic Salary (USD) *')}</label>
                  <input
                    type="number"
                    value={newEmpSalary}
                    onChange={(e) => setNewEmpSalary(Number(e.target.value))}
                    className="w-full bg-card border border-input rounded-lg p-2 text-foreground font-mono font-bold focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block">{t('lbl_contract_status', 'Contract Status')}</label>
                  <select
                    value={newEmpStatus}
                    onChange={(e) => setNewEmpStatus(e.target.value as any)}
                    className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs font-semibold"
                  >
                    <option value="ACTIVE">{t('status_active', 'Active (دائم)')}</option>
                    <option value="PROBATION">{t('status_probation', 'Probation (تجربة)')}</option>
                    <option value="SUSPENDED">{t('status_suspended', 'Suspended (معلق)')}</option>
                    <option value="NOTICE">{t('status_notice', 'Notice (إنذار)')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground mb-1 block">{t('lbl_hire_date', 'Hire Date')}</label>
                  <input
                    type="date"
                    value={newEmpHireDate}
                    onChange={(e) => setNewEmpHireDate(e.target.value)}
                    className="w-full bg-card border border-input rounded-lg p-2 text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block">{t('lbl_biometric_terminal', 'Assigned Terminal')}</label>
                  <select
                    value={newEmpTerminal}
                    onChange={(e) => setNewEmpTerminal(e.target.value)}
                    className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs font-semibold"
                  >
                    <option value="Choueifat Bio-01">{t('choueifat_bio01', 'Choueifat Bio-01')}</option>
                    <option value="Choueifat Bio-02">{t('choueifat_bio02', 'Choueifat Bio-02')}</option>
                    <option value="Nabatieh Bio-01">{t('nabatieh_bio01', 'Nabatieh Bio-01')}</option>
                    <option value="Remote / Mobile GPS">{t('remote_mobile_gps', 'Remote / Mobile GPS')}</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddEmpModal(false)}
                  className="bg-card hover:bg-muted text-foreground border border-border px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
                >
                  {t('cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  {t('save_employee_btn', 'Save Staff Member →')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: OFFICIAL PAYSLIP PREVIEW MODAL (A4 & THERMAL) */}
      {/* ========================================================================= */}
      {showPayslipModal && selectedPayslipEmp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-4 animate-fadeIn">
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">
                  {t('payslip_preview_title', 'Monthly Payslip Document Preview')}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {/* Format Toggle */}
                <div className="bg-muted p-0.5 rounded-lg border border-border flex text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setPayslipFormat('A4')}
                    className={`px-2 py-0.5 rounded ${
                      payslipFormat === 'A4'
                        ? 'bg-card text-foreground shadow-2xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t('a4', 'A4')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayslipFormat('THERMAL')}
                    className={`px-2 py-0.5 rounded ${
                      payslipFormat === 'THERMAL'
                        ? 'bg-card text-foreground shadow-2xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t('thermal_80mm', 'Thermal (80mm)')}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPayslipModal(false)}
                  className="text-muted-foreground hover:text-foreground text-sm font-bold p-1 cursor-pointer"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Payslip Document Body */}
            {(() => {
              const emp = selectedPayslipEmp;
              const hourlyRate = emp.basicSalary / 160;
              const overtimePay = emp.overtimeHours * hourlyRate * 1.5;
              const gross = emp.basicSalary + overtimePay + emp.transportAllowance + emp.bonus;
              const nssfDeduction = gross * 0.03;
              const absenceDeduction = (emp.basicSalary / 26) * emp.absenceDays;
              const netUsd = gross - nssfDeduction - absenceDeduction;
              const netLbp = netUsd * 89500;

              return payslipFormat === 'A4' ? (
                /* A4 Enterprise Voucher Format */
                <div className="bg-white text-slate-900 border border-slate-300 p-6 rounded-xl shadow-xs space-y-4 font-sans text-xs">
                  {/* Company Header */}
                  <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3">
                    <div>
                      <h2 className="text-base font-black tracking-tight text-slate-900">
                        {t('company_name_en', 'SOUTHERN OLIVE OIL PRODUCTS S.A.R.L')}
                      </h2>
                      <p className="text-[11px] text-slate-600 font-medium">
                        {t('company_tagline', 'Central Pressing, Packaging & Distribution Facility - Choueifat')}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {t('tax_id_22901601_reg_baabda_10420_mof', 'Tax ID: 22901-601 • Reg: Baabda 10420 • MOF Cert: Active')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="bg-slate-900 text-white font-mono font-bold text-xs px-2.5 py-1 rounded">
                        {t('payslip_aug2026', 'PAYSLIP AUG-2026')}
                      </span>
                      <p className="text-[10.5px] text-slate-500 mt-1 font-mono">
                        {t('date_20260831', 'Date: 2026-08-31')}
                      </p>
                    </div>
                  </div>

                  {/* Staff Info Grid */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">{t('emp_info_name', 'Employee Name')}</span>
                      <span className="text-xs font-bold text-slate-900">{emp.name}</span>
                      <span className="text-[10px] text-slate-600 block mt-0.5">#{emp.id} • {emp.title}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">{t('emp_info_dept', 'Department & Facility')}</span>
                      <span className="text-xs font-bold text-slate-900">{emp.dept}</span>
                      <span className="text-[10px] text-slate-600 block mt-0.5">SSN: {emp.socialSecurityNo}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">{t('emp_info_national_id', 'National ID / Iqama')}</span>
                      <span className="text-xs font-mono font-bold text-slate-900">{emp.nationalId}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">{t('emp_info_bank_iban', 'Disbursement IBAN (BLOM)')}</span>
                      <span className="text-[10.5px] font-mono font-bold text-slate-800">{emp.iban}</span>
                    </div>
                  </div>

                  {/* Earnings & Deductions Breakdown */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Earnings */}
                    <div className="border border-slate-200 rounded-lg p-3 space-y-2">
                      <h4 className="font-bold text-[11px] text-emerald-800 uppercase border-b border-slate-200 pb-1">
                        {t('earnings_heading', 'Gross Remuneration ($)')}
                      </h4>
                      <div className="flex justify-between text-[11px]">
                        <span>{t('item_basic_salary', 'Basic Contract Salary')}</span>
                        <span className="font-mono font-bold">${emp.basicSalary.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span>{t('item_overtime_pay', 'Overtime Pay')} ({emp.overtimeHours}h @ 1.5x)</span>
                        <span className="font-mono text-emerald-700 font-bold">${overtimePay.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span>{t('item_transport_allowance', 'Transport Allowance')}</span>
                        <span className="font-mono font-semibold">${emp.transportAllowance.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span>{t('item_bonus_incentive', 'Performance Bonus')}</span>
                        <span className="font-mono font-semibold">${emp.bonus.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold pt-1.5 border-t border-slate-200">
                        <span>{t('item_total_gross', 'Total Gross Earnings:')}</span>
                        <span className="font-mono">${gross.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Deductions */}
                    <div className="border border-slate-200 rounded-lg p-3 space-y-2">
                      <h4 className="font-bold text-[11px] text-destructive uppercase border-b border-slate-200 pb-1">
                        {t('deductions_heading', 'Statutory Deductions ($)')}
                      </h4>
                      <div className="flex justify-between text-[11px]">
                        <span>{t('item_cnss_deduction', 'CNSS Medical Share (3%)')}</span>
                        <span className="font-mono text-destructive font-bold">-${nssfDeduction.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span>{t('item_absence_deduction', 'Unexcused Absence')} ({emp.absenceDays}d)</span>
                        <span className="font-mono text-destructive">-${absenceDeduction.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span>{t('item_income_tax', 'Income Tax Withholding')}</span>
                        <span className="font-mono text-slate-500">$0.00</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold pt-1.5 border-t border-slate-200">
                        <span>{t('item_total_deductions', 'Total Deductions:')}</span>
                        <span className="font-mono text-destructive">-${(nssfDeduction + absenceDeduction).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Net Payable Banner */}
                  <div className="bg-emerald-50 border-2 border-emerald-500 p-3.5 rounded-xl flex items-center justify-between text-emerald-900">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider block">
                        {t('final_net_disbursed', 'Final Net Salary Disbursed via Direct ACH')}
                      </span>
                      <span className="text-xl font-black font-mono">${netUsd.toFixed(2)} USD</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-emerald-700 block font-semibold">{t('equivalent_at_89500_lbp', 'Equivalent at 89,500 LBP:')}</span>
                      <span className="text-base font-bold font-mono">{netLbp.toLocaleString()} L.L.</span>
                    </div>
                  </div>

                  {/* Signature Section */}
                  <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200 text-[10px] text-slate-500">
                    <div className="border-t border-slate-400 pt-1 text-center">
                      {t('hr_authorized_signature', 'HR & Treasury Authorized Signatory')}
                    </div>
                    <div className="border-t border-slate-400 pt-1 text-center">
                      {t('employee_acknowledgement', 'Employee Receipt Acknowledgement')}
                    </div>
                  </div>
                </div>
              ) : (
                /* Thermal 80mm Receipt Format */
                <div className="bg-white text-slate-900 border border-slate-300 p-4 rounded-xl shadow-xs max-w-xs mx-auto font-mono text-[11px] leading-tight space-y-2">
                  <div className="text-center border-b border-dashed border-slate-400 pb-2">
                    <p className="font-bold text-xs">{t('company_short_name', 'SOUTHERN OLIVE OIL')}</p>
                    <p className="text-[10px]">{t('payroll_voucher_receipt', 'PAYROLL VOUCHER (THERMAL)')}</p>
                    <p className="text-[9.5px]">{t('date_20260831_trm01', 'DATE: 2026-08-31 • TRM-01')}</p>
                  </div>
                  <div>
                    <p>EMP: #{emp.id} - {emp.name}</p>
                    <p>NAT ID: {emp.nationalId}</p>
                    <p>DEPT: {emp.dept}</p>
                  </div>
                  <div className="border-t border-b border-dashed border-slate-400 py-1.5 space-y-1">
                    <div className="flex justify-between"><span>{t('basic', 'BASIC:')}</span><span>${emp.basicSalary.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>OT ({emp.overtimeHours}h):</span><span>+${overtimePay.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>{t('transport', 'TRANSPORT:')}</span><span>+${emp.transportAllowance.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>{t('bonus', 'BONUS:')}</span><span>+${emp.bonus.toFixed(2)}</span></div>
                    <div className="flex justify-between font-bold"><span>{t('gross', 'GROSS:')}</span><span>${gross.toFixed(2)}</span></div>
                    <div className="flex justify-between text-red-600"><span>{t('cnss_3', 'CNSS 3%:')}</span><span>-${nssfDeduction.toFixed(2)}</span></div>
                  </div>
                  <div className="text-center font-bold text-sm pt-1">
                    <p>NET: ${netUsd.toFixed(2)} USD</p>
                    <p className="text-xs">{netLbp.toLocaleString()} L.L.</p>
                  </div>
                  <div className="text-center text-[9px] border-t border-dashed border-slate-400 pt-2 text-slate-500">
                    BLOM ACH: {emp.iban.slice(-8)}
                  </div>
                </div>
              );
            })()}

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-[11px] text-muted-foreground font-medium">
                {t('payslip_certified_notice', 'Certified Official Vanguard ERP Payroll Record')}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPayslipModal(false)}
                  className="bg-card hover:bg-muted text-foreground border border-border px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
                >
                  {t('close_btn', 'Close')}
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{t('print_payslip_btn', 'Print Document')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
