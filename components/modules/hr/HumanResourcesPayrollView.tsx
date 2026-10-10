'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useTenant } from '@/lib/TenantContext';
import { toast } from '@/lib/toast';
import { 
  Users, Briefcase, Calendar, Clock, DollarSign, 
  Plus, Search, FileText, CheckCircle2, UserPlus, FileSignature
} from 'lucide-react';

interface Department { id: string; name: string; }
interface Designation { id: string; title: string; department_id: string; }
interface Employee { id: string; employee_code: string; full_name: string; department_id: string; designation_id: string; status: string; basic_salary: number; join_date: string; }
interface Shift { id: string; shift_name: string; standard_hours: number; }
interface Attendance { id: string; employee_id: string; date: string; check_in: string; check_out: string; status: string; overtime_hours: number; }
interface SalaryAdjustment { id: string; employee_id: string; adjustment_type: string; amount: number; reason: string; effective_date: string; is_settled: boolean; }
interface PayrollRun { id: string; payroll_month: string; total_net_payout: number; status: string; }
interface PayrollItem { id: string; payroll_run_id: string; employee_id: string; basic_salary: number; total_allowances: number; total_deductions: number; advances_deducted: number; net_salary: number; }

export function HumanResourcesPayrollView() {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id || 'default-tenant';

  const [activeTab, setActiveTab] = useState<'directory' | 'attendance' | 'adjustments' | 'payroll'>('directory');
  const [loading, setLoading] = useState(true);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [adjustments, setAdjustments] = useState<SalaryAdjustment[]>([]);
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [payrollItems, setPayrollItems] = useState<PayrollItem[]>([]);

  // Modals
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [showPayrollModal, setShowPayrollModal] = useState(false);

  // Forms
  const [newDept, setNewDept] = useState({ name: '', description: '' });
  const [newDesig, setNewDesig] = useState({ department_id: '', title: '' });
  const [newEmployee, setNewEmployee] = useState({ full_name: '', employee_code: '', department_id: '', designation_id: '', basic_salary: 0, join_date: new Date().toISOString().split('T')[0] });
  const [newAttendance, setNewAttendance] = useState({ employee_id: '', date: new Date().toISOString().split('T')[0], hours_worked: 8, standard_hours: 8, status: 'present' });
  const [newAdjustment, setNewAdjustment] = useState({ employee_id: '', adjustment_type: 'advance', amount: 0, reason: '', effective_date: new Date().toISOString().split('T')[0] });
  const [newPayroll, setNewPayroll] = useState({ payroll_month: new Date().toISOString().slice(0, 7) }); // YYYY-MM

  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [depRes, desRes, empRes, shRes, attRes, adjRes, payRes, pIRes] = await Promise.all([
        supabase.from('hr_departments').select('*').eq('tenant_id', tenantId),
        supabase.from('hr_designations').select('*').eq('tenant_id', tenantId),
        supabase.from('hr_employees').select('*').eq('tenant_id', tenantId),
        supabase.from('hr_shifts').select('*').eq('tenant_id', tenantId),
        supabase.from('hr_attendance_records').select('*').eq('tenant_id', tenantId).order('date', { ascending: false }),
        supabase.from('hr_salary_adjustments').select('*').eq('tenant_id', tenantId).order('effective_date', { ascending: false }),
        supabase.from('hr_payroll_runs').select('*').eq('tenant_id', tenantId).order('payroll_month', { ascending: false }),
        supabase.from('hr_payroll_items').select('*, hr_payroll_runs!inner(tenant_id)').eq('hr_payroll_runs.tenant_id', tenantId)
      ]);
      if (depRes.data) setDepartments(depRes.data);
      if (desRes.data) setDesignations(desRes.data);
      if (empRes.data) setEmployees(empRes.data);
      if (shRes.data) setShifts(shRes.data);
      if (attRes.data) setAttendance(attRes.data);
      if (adjRes.data) setAdjustments(adjRes.data);
      if (payRes.data) setPayrollRuns(payRes.data);
      if (pIRes.data) setPayrollItems(pIRes.data);
    } catch (err: any) {
      toast.error('Failed to load HR data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (tenantId) fetchData(); }, [tenantId]);

  const handleAddDepartment = async () => {
    if (!newDept.name) return toast.error('Department name required');
    const { data, error } = await supabase.from('hr_departments').insert([{ ...newDept, tenant_id: tenantId }]).select().single();
    if (error) return toast.error(error.message);
    setDepartments([...departments, data]);
    setShowDeptModal(false); setNewDept({ name: '', description: '' });
    toast.success('Department created');
  };

  const handleAddDesignation = async () => {
    if (!newDesig.title || !newDesig.department_id) return toast.error('Title and Dept required');
    const { data, error } = await supabase.from('hr_designations').insert([{ ...newDesig, tenant_id: tenantId }]).select().single();
    if (error) return toast.error(error.message);
    setDesignations([...designations, data]);
    setNewDesig({ department_id: '', title: '' });
    toast.success('Designation created');
  };

  const handleAddEmployee = async () => {
    if (!newEmployee.full_name || !newEmployee.department_id) return toast.error('Name and Department required');
    const { data, error } = await supabase.from('hr_employees').insert([{ ...newEmployee, tenant_id: tenantId }]).select().single();
    if (error) return toast.error(error.message);
    setEmployees([...employees, data]);
    setShowEmployeeModal(false); setNewEmployee({ full_name: '', employee_code: '', department_id: '', designation_id: '', basic_salary: 0, join_date: new Date().toISOString().split('T')[0] });
    toast.success('Employee onboarded');
  };

  const handleAddAttendance = async () => {
    if (!newAttendance.employee_id) return toast.error('Employee required');
    
    // Auto calculate overtime if worked hours > standard hours
    const overtime_hours = Math.max(0, newAttendance.hours_worked - newAttendance.standard_hours);
    
    const { data, error } = await supabase.from('hr_attendance_records').insert([{ 
      tenant_id: tenantId, 
      employee_id: newAttendance.employee_id, 
      date: newAttendance.date,
      status: newAttendance.status,
      overtime_hours
    }]).select().single();
    
    if (error) return toast.error(error.message);
    setAttendance([data, ...attendance]);
    setShowAttendanceModal(false); 
    toast.success('Attendance logged');
  };

  const handleAddAdjustment = async () => {
    if (!newAdjustment.employee_id || newAdjustment.amount <= 0) return toast.error('Valid employee and amount required');
    const { data, error } = await supabase.from('hr_salary_adjustments').insert([{ ...newAdjustment, tenant_id: tenantId }]).select().single();
    if (error) return toast.error(error.message);
    setAdjustments([data, ...adjustments]);
    setShowAdjustmentModal(false);
    setNewAdjustment({ employee_id: '', adjustment_type: 'advance', amount: 0, reason: '', effective_date: new Date().toISOString().split('T')[0] });
    toast.success('Adjustment recorded');
  };

  const handleProcessPayroll = async () => {
    if (!newPayroll.payroll_month) return toast.error('Payroll month required');
    
    try {
      // 1. Create Draft Payroll Run
      const { data: run, error: runErr } = await supabase.from('hr_payroll_runs').insert([{
        tenant_id: tenantId, payroll_month: newPayroll.payroll_month, status: 'draft'
      }]).select().single();
      if (runErr) throw runErr;

      let totalPayout = 0;
      const itemsToInsert = [];

      // 2. Calculate for each active employee
      const activeEmployees = employees.filter(e => e.status === 'active');
      for (const emp of activeEmployees) {
        // Find unsettled adjustments for this employee
        const unsettled = adjustments.filter(a => a.employee_id === emp.id && !a.is_settled);
        
        const total_allowances = unsettled.filter(a => a.adjustment_type === 'bonus').reduce((sum, a) => sum + Number(a.amount), 0);
        const total_deductions = unsettled.filter(a => a.adjustment_type === 'deduction' || a.adjustment_type === 'penalty').reduce((sum, a) => sum + Number(a.amount), 0);
        const advances_deducted = unsettled.filter(a => a.adjustment_type === 'advance').reduce((sum, a) => sum + Number(a.amount), 0);

        const net_salary = Number(emp.basic_salary) + total_allowances - total_deductions - advances_deducted;
        totalPayout += Math.max(0, net_salary);

        itemsToInsert.push({
          payroll_run_id: run.id,
          employee_id: emp.id,
          basic_salary: emp.basic_salary,
          total_allowances,
          total_deductions,
          advances_deducted,
          net_salary: Math.max(0, net_salary)
        });
      }

      // 3. Insert Payroll Items
      if (itemsToInsert.length > 0) {
        const { error: itemsErr } = await supabase.from('hr_payroll_items').insert(itemsToInsert);
        if (itemsErr) throw itemsErr;
      }

      // 4. Update Run Total
      await supabase.from('hr_payroll_runs').update({ total_net_payout: totalPayout }).eq('id', run.id);

      toast.success('Payroll processed successfully');
      setShowPayrollModal(false);
      fetchData();
    } catch(err:any) { toast.error(err.message); }
  };

  const finalizePayroll = async (runId: string) => {
    try {
      // Update Run Status
      await supabase.from('hr_payroll_runs').update({ status: 'processed', processed_date: new Date().toISOString() }).eq('id', runId);
      
      // Update all items to paid
      await supabase.from('hr_payroll_items').update({ payment_status: 'paid' }).eq('payroll_run_id', runId);
      
      // Mark all adjustments as settled (simplification: mark all unsettled adjustments prior to this month)
      // In a real scenario, we would map the exact adjustments used in the calc, but for now we mark all unsettled as settled.
      await supabase.from('hr_salary_adjustments').update({ is_settled: true }).eq('tenant_id', tenantId).eq('is_settled', false);
      
      toast.success('Payroll Finalized & Accounts Settled');
      fetchData();
    } catch(err:any) { toast.error(err.message); }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Human Resources & Payroll
          </h1>
          <p className="text-sm text-slate-500 mt-1">Dynamic employee management, attendance, and automated payroll processing.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-max overflow-x-auto max-w-full">
        {[
          { id: 'directory', label: 'Personnel Directory', icon: Users },
          { id: 'attendance', label: 'Shifts & Attendance', icon: Clock },
          { id: 'adjustments', label: 'Advances & Deductions', icon: FileText },
          { id: 'payroll', label: 'Payroll Processing', icon: DollarSign },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex whitespace-nowrap items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === t.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[500px]">
        {loading ? (
          <div className="flex justify-center items-center h-64 text-slate-500">Loading HR data...</div>
        ) : (
          <>
            {/* DIRECTORY TAB */}
            {activeTab === 'directory' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="relative w-full md:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input type="text" placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowDeptModal(true)} className="px-3 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" /> Departments
                    </button>
                    <button onClick={() => setShowEmployeeModal(true)} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2">
                      <UserPlus className="w-4 h-4" /> Add Employee
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {employees.length === 0 && <div className="col-span-full py-8 text-center text-slate-500">No employees registered.</div>}
                  {employees.filter(e => e.full_name.toLowerCase().includes(search.toLowerCase()) || e.employee_code?.includes(search)).map(emp => {
                    const dept = departments.find(d => d.id === emp.department_id);
                    const desig = designations.find(d => d.id === emp.designation_id);
                    return (
                      <div key={emp.id} className="border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-bold text-slate-900 text-lg block">{emp.full_name}</span>
                            <span className="text-xs text-slate-500 font-mono">{emp.employee_code || 'No Code'}</span>
                          </div>
                          <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${emp.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                            {emp.status}
                          </span>
                        </div>
                        <div className="space-y-1.5 mb-4 text-sm mt-3 border-t border-slate-100 pt-3">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 flex items-center gap-1"><Briefcase className="w-4 h-4"/> Dept:</span>
                            <span className="font-medium text-slate-900">{dept?.name || 'N/A'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Role:</span>
                            <span className="font-medium text-slate-900">{desig?.title || 'N/A'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 flex items-center gap-1"><DollarSign className="w-4 h-4"/> Basic Salary:</span>
                            <span className="font-bold text-blue-600">${emp.basic_salary.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ATTENDANCE TAB */}
            {activeTab === 'attendance' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-slate-800">Attendance & Timesheets</h2>
                  <button onClick={() => setShowAttendanceModal(true)} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Log Attendance
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-sm text-slate-500">
                        <th className="py-3 px-4 font-medium">Date</th>
                        <th className="py-3 px-4 font-medium">Employee</th>
                        <th className="py-3 px-4 font-medium">Status</th>
                        <th className="py-3 px-4 font-medium text-right">Overtime (Hrs)</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {attendance.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-slate-500">No attendance records found.</td></tr>}
                      {attendance.map(att => {
                        const emp = employees.find(e => e.id === att.employee_id);
                        return (
                          <tr key={att.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-4 text-slate-600">{att.date}</td>
                            <td className="py-3 px-4 font-medium text-slate-900">{emp?.full_name}</td>
                            <td className="py-3 px-4 capitalize">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${att.status === 'present' ? 'bg-emerald-100 text-emerald-700' : att.status === 'absent' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                                {att.status}
                              </span>
                            </td>
                            <td className={`py-3 px-4 text-right font-bold ${att.overtime_hours > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                              {att.overtime_hours}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ADJUSTMENTS TAB */}
            {activeTab === 'adjustments' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-slate-800">Advances, Bonuses & Deductions</h2>
                  <button onClick={() => setShowAdjustmentModal(true)} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Adjustment
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-sm text-slate-500">
                        <th className="py-3 px-4 font-medium">Effective Date</th>
                        <th className="py-3 px-4 font-medium">Employee</th>
                        <th className="py-3 px-4 font-medium">Type</th>
                        <th className="py-3 px-4 font-medium">Reason</th>
                        <th className="py-3 px-4 font-medium text-right">Amount</th>
                        <th className="py-3 px-4 font-medium text-center">Settled?</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {adjustments.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-slate-500">No adjustments recorded.</td></tr>}
                      {adjustments.map(adj => {
                        const emp = employees.find(e => e.id === adj.employee_id);
                        return (
                          <tr key={adj.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-4 text-slate-600">{adj.effective_date}</td>
                            <td className="py-3 px-4 font-medium text-slate-900">{emp?.full_name}</td>
                            <td className="py-3 px-4 capitalize">
                              <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${['advance', 'deduction', 'penalty'].includes(adj.adjustment_type) ? 'text-rose-700 bg-rose-50' : 'text-emerald-700 bg-emerald-50'}`}>
                                {adj.adjustment_type}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-600 truncate max-w-xs">{adj.reason}</td>
                            <td className="py-3 px-4 text-right font-bold text-slate-800">${adj.amount.toLocaleString()}</td>
                            <td className="py-3 px-4 text-center">
                              {adj.is_settled ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <span className="text-amber-500 text-xs font-bold">Pending</span>}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PAYROLL TAB */}
            {activeTab === 'payroll' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-slate-800">Payroll Processing</h2>
                  <button onClick={() => setShowPayrollModal(true)} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2">
                    <FileSignature className="w-4 h-4" /> Calculate Month Payroll
                  </button>
                </div>
                
                <div className="space-y-6">
                  {payrollRuns.length === 0 && <div className="py-12 text-center text-slate-500">No payroll runs found. Calculate a new payroll to start.</div>}
                  
                  {payrollRuns.map(run => {
                    const runItems = payrollItems.filter(i => i.payroll_run_id === run.id);
                    return (
                      <div key={run.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                          <div>
                            <h3 className="font-bold text-slate-800 text-lg">Payroll Period: {run.payroll_month}</h3>
                            <p className="text-sm text-slate-500">Total Net Payout: <span className="font-bold text-slate-900">${run.total_net_payout.toLocaleString()}</span></p>
                          </div>
                          <div>
                            {run.status === 'draft' ? (
                              <button onClick={() => finalizePayroll(run.id)} className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700">
                                Finalize & Settle Run
                              </button>
                            ) : (
                              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 font-bold rounded-lg text-sm flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> Processed & Settled
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="p-0 overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-white border-b border-slate-100 text-xs text-slate-500">
                                <th className="py-2 px-4 font-medium">Employee</th>
                                <th className="py-2 px-4 font-medium text-right">Basic</th>
                                <th className="py-2 px-4 font-medium text-right">Allowances</th>
                                <th className="py-2 px-4 font-medium text-right">Deductions</th>
                                <th className="py-2 px-4 font-medium text-right">Advances (-)</th>
                                <th className="py-2 px-4 font-medium text-right font-bold text-blue-700">Net Salary</th>
                              </tr>
                            </thead>
                            <tbody className="text-sm bg-white">
                              {runItems.map(item => {
                                const emp = employees.find(e => e.id === item.employee_id);
                                return (
                                  <tr key={item.id} className="border-b border-slate-50">
                                    <td className="py-2 px-4 font-medium">{emp?.full_name}</td>
                                    <td className="py-2 px-4 text-right">${item.basic_salary}</td>
                                    <td className="py-2 px-4 text-right text-emerald-600">+${item.total_allowances}</td>
                                    <td className="py-2 px-4 text-right text-rose-600">-${item.total_deductions}</td>
                                    <td className="py-2 px-4 text-right text-amber-600">-${item.advances_deducted}</td>
                                    <td className="py-2 px-4 text-right font-bold text-blue-700">${item.net_salary}</td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODALS */}
      
      {/* Department Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add Department</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Department Name</label>
                <input type="text" value={newDept.name} onChange={e => setNewDept({...newDept, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Sales, Production" />
              </div>
            </div>
            
            <div className="my-6 border-t border-slate-200 pt-4">
              <h4 className="font-semibold text-sm mb-2">Or Add Designation to existing Dept:</h4>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <select value={newDesig.department_id} onChange={e => setNewDesig({...newDesig, department_id: e.target.value})} className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg outline-none bg-white">
                  <option value="">Select Dept...</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <input type="text" value={newDesig.title} onChange={e => setNewDesig({...newDesig, title: e.target.value})} className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg outline-none" placeholder="Job Title" />
              </div>
              <button onClick={handleAddDesignation} className="w-full py-1.5 bg-slate-100 text-blue-600 font-medium text-sm rounded-lg hover:bg-slate-200">Add Designation</button>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
              <button onClick={() => setShowDeptModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Close</button>
              <button onClick={handleAddDepartment} className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Save Dept</button>
            </div>
          </div>
        </div>
      )}

      {/* Employee Modal */}
      {showEmployeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Onboard Employee</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input type="text" value={newEmployee.full_name} onChange={e => setNewEmployee({...newEmployee, full_name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Employee Code</label>
                  <input type="text" value={newEmployee.employee_code} onChange={e => setNewEmployee({...newEmployee, employee_code: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="EMP-001" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                  <select value={newEmployee.department_id} onChange={e => setNewEmployee({...newEmployee, department_id: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">Select Dept...</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Designation / Role</label>
                  <select value={newEmployee.designation_id} onChange={e => setNewEmployee({...newEmployee, designation_id: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">Select Role...</option>
                    {designations.filter(d => d.department_id === newEmployee.department_id).map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Basic Salary ($)</label>
                  <input type="number" value={newEmployee.basic_salary} onChange={e => setNewEmployee({...newEmployee, basic_salary: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Join Date</label>
                  <input type="date" value={newEmployee.join_date} onChange={e => setNewEmployee({...newEmployee, join_date: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowEmployeeModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleAddEmployee} className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Save Employee</button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {showAttendanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Log Attendance & Hours</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Employee</label>
                <select value={newAttendance.employee_id} onChange={e => setNewAttendance({...newAttendance, employee_id: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">Select Employee...</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.full_name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input type="date" value={newAttendance.date} onChange={e => setNewAttendance({...newAttendance, date: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select value={newAttendance.status} onChange={e => setNewAttendance({...newAttendance, status: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="leave">On Leave</option>
                  </select>
                </div>
              </div>
              {newAttendance.status === 'present' && (
                <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Standard Shift Hours</label>
                    <input type="number" value={newAttendance.standard_hours} onChange={e => setNewAttendance({...newAttendance, standard_hours: Number(e.target.value)})} className="w-full px-2 py-1 text-sm border border-slate-300 rounded outline-none" min="0" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Actual Hours Worked</label>
                    <input type="number" value={newAttendance.hours_worked} onChange={e => setNewAttendance({...newAttendance, hours_worked: Number(e.target.value)})} className="w-full px-2 py-1 text-sm border border-blue-300 rounded outline-none focus:ring-2 focus:ring-blue-500" min="0" />
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowAttendanceModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleAddAttendance} className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Save Attendance</button>
            </div>
          </div>
        </div>
      )}

      {/* Adjustment Modal */}
      {showAdjustmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Record Salary Adjustment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Employee</label>
                <select value={newAdjustment.employee_id} onChange={e => setNewAdjustment({...newAdjustment, employee_id: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">Select Employee...</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.full_name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select value={newAdjustment.adjustment_type} onChange={e => setNewAdjustment({...newAdjustment, adjustment_type: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="advance">Salary Advance</option>
                    <option value="bonus">Bonus / Allowance</option>
                    <option value="deduction">General Deduction</option>
                    <option value="penalty">Penalty</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount ($)</label>
                  <input type="number" value={newAdjustment.amount} onChange={e => setNewAdjustment({...newAdjustment, amount: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" min="0" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason / Notes</label>
                <input type="text" value={newAdjustment.reason} onChange={e => setNewAdjustment({...newAdjustment, reason: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowAdjustmentModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleAddAdjustment} className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Save Adjustment</button>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Modal */}
      {showPayrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Calculate Monthly Payroll</h3>
            <p className="text-sm text-slate-600 mb-4">
              This action will evaluate all active employees' basic salaries, aggregate their unsettled advances/deductions/bonuses, and generate a draft payroll run for review.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payroll Month (YYYY-MM)</label>
                <input type="month" value={newPayroll.payroll_month} onChange={e => setNewPayroll({...newPayroll, payroll_month: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowPayrollModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleProcessPayroll} className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Generate Run</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
