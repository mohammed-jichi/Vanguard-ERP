import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getSupabaseServerClient } from '@/lib/supabaseClient';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'vanguard_accounting_db.json');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      employeeId,
      employeeName,
      branch,
      workstationAuthority,
      drawerKickSettings,
      printerConfig,
      posCredentials,
      employeeRecord,
    } = body;

    if (!employeeId) {
      return NextResponse.json(
        { success: false, error: 'employeeId is required' },
        { status: 400 }
      );
    }

    const configId = `ws-emp-${employeeId}`;
    const now = new Date().toISOString();

    const workstationProfile = {
      id: configId,
      employee_id: String(employeeId),
      employee_name: employeeName || 'Employee',
      branch: branch || 'Southern Olive and Oil Products - Main',
      workstation_authority: workstationAuthority || {
        accessBackOffice: true,
        backOfficeRole: 'MANAGER',
        salesman: true,
        driver: false,
        training: false,
        active: true,
      },
      drawer_kick_settings: drawerKickSettings || {
        openCashDrawer: true,
        cashDrawerPort: 'Usb',
        pin: 2,
      },
      printer_config: printerConfig || {
        printerType: 'TM-267',
        configuration: 'Standard POS Retail Config ✔',
        protocol: 'ESC_POS',
      },
      pos_credentials: posCredentials || null,
      updated_at: now,
    };

    // 1. Persist to data/vanguard_accounting_db.json
    let persistedToJson = false;
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      let dbData: any = {};
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        try {
          dbData = JSON.parse(raw);
        } catch {
          dbData = {};
        }
      }

      // Initialize workstation_configs if not exists
      if (!Array.isArray(dbData.workstation_configs)) {
        dbData.workstation_configs = [];
      }

      const wsIndex = dbData.workstation_configs.findIndex(
        (w: any) => w.id === configId || w.employee_id === String(employeeId)
      );
      if (wsIndex >= 0) {
        dbData.workstation_configs[wsIndex] = workstationProfile;
      } else {
        dbData.workstation_configs.push(workstationProfile);
      }

      // Also ensure employee record with posCredentials is updated in employees array
      if (employeeRecord) {
        if (!Array.isArray(dbData.employees)) {
          dbData.employees = [];
        }
        const empIndex = dbData.employees.findIndex(
          (e: any) => e.id === String(employeeId) || e.id === employeeRecord.id
        );
        if (empIndex >= 0) {
          dbData.employees[empIndex] = {
            ...dbData.employees[empIndex],
            ...employeeRecord,
            posCredentials: posCredentials || employeeRecord.posCredentials,
          };
        } else {
          dbData.employees.push({
            ...employeeRecord,
            posCredentials: posCredentials || employeeRecord.posCredentials,
          });
        }
      }

      dbData.last_updated = now;
      fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf-8');
      persistedToJson = true;
    } catch (fsErr: any) {
      console.error('[API /api/hr/sync-workstation] File persistence error:', fsErr);
    }

    // 2. Persist to Supabase workstation_configs & employees tables
    let persistedToSupabase = false;
    let supabaseNotice = '';
    let savedEmployeeRow: any = null;
    const isActiveVal = Boolean(
      employeeRecord?.is_active ?? employeeRecord?.isActive ?? employeeRecord?.active ?? true
    );

    const empCode = String(employeeId);
    const scheduleCfg = employeeRecord?.schedule_config || employeeRecord?.schedule || null;
    const scheduleTemplate = scheduleCfg?.templateName || employeeRecord?.schedule_template || 'Backoffice Administration (08:00 - 16:30)';
    const completeScheduleConfig = scheduleCfg ? {
      templateName: scheduleTemplate,
      timing: scheduleCfg.timing || '08:00 - 16:30',
      workDays: scheduleCfg.workDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      offDays: scheduleCfg.offDays || ['Sun'],
      applyToAllMonths: Boolean(scheduleCfg.applyToAllMonths),
      dailySchedule: scheduleCfg.dailySchedule || undefined,
      weeklySlots: scheduleCfg.weeklySlots || undefined,
      dateOverrides: scheduleCfg.dateOverrides || {},
      daysOff: scheduleCfg.daysOff || [],
    } : null;

    try {
      const supabaseServer = getSupabaseServerClient();
      const { error: supaErr } = await supabaseServer
        .from('workstation_configs')
        .upsert(
          {
            id: workstationProfile.id,
            employee_id: workstationProfile.employee_id,
            employee_name: workstationProfile.employee_name,
            branch: workstationProfile.branch,
            authority: workstationProfile.workstation_authority,
            drawer_settings: workstationProfile.drawer_kick_settings,
            printer_settings: workstationProfile.printer_config,
            pos_credentials: workstationProfile.pos_credentials,
            updated_at: now,
          },
          { onConflict: 'id' }
        );

      if (supaErr) {
        supabaseNotice = supaErr.message;
        console.warn('[API /api/hr/sync-workstation] Supabase workstation_configs notice:', supaErr.message);
      } else {
        persistedToSupabase = true;
      }

      // 3. Persist to Supabase employees table (HR Master Record sync using service role)
      // 3. Persist to Supabase employees table (HR Master Record sync using service role)
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(empCode);
        const basePayload: Record<string, any> = {
          employee_code: empCode,
          full_name: employeeName || employeeRecord?.fullName || `${employeeRecord?.firstName || ''} ${employeeRecord?.lastName || ''}`.trim() || 'Employee',
          phone: employeeRecord?.phone || null,
          national_id: employeeRecord?.nationalId || null,
          is_active: isActiveVal,
        };
        if (employeeRecord?.dateHired) {
          basePayload.hire_date = employeeRecord.dateHired;
        }
        if (isUuid) {
          basePayload.id = empCode;
        }

        const { data: upsertData, error: empErr } = await supabaseServer
          .from('employees')
          .upsert(basePayload, { onConflict: isUuid ? 'id' : 'employee_code' })
          .select()
          .maybeSingle();

        if (empErr) {
          console.error('[API /api/hr/sync-workstation] Supabase employees table error:', {
            message: empErr.message,
            details: empErr.details,
            hint: empErr.hint,
            code: empErr.code,
          });
        } else {
          savedEmployeeRow = upsertData;
          persistedToSupabase = true;
          console.log('[API /api/hr/sync-workstation] Supabase employees row persisted successfully:', savedEmployeeRow?.id || empCode);
        }
      } catch (empEx: any) {
        console.error('[API /api/hr/sync-workstation] Supabase employees table exception:', empEx);
      }

      // 4. Guaranteed Supabase JSONB persistence via tenants.feature_flags (survives hard reload)
      try {
        const tenantId = employeeRecord?.tenant_id || '00000000-0000-0000-0000-000000000001';
        const { data: tenantData, error: tenantReadErr } = await supabaseServer
          .from('tenants')
          .select('id, feature_flags')
          .eq('id', tenantId)
          .maybeSingle();

        if (tenantReadErr) {
          console.error('[API /api/hr/sync-workstation] Tenant read error:', tenantReadErr);
          throw new Error(`Failed to read tenant feature flags: ${tenantReadErr.message}`);
        }

        if (tenantData) {
          const existingFlags = tenantData.feature_flags || {};
          const existingSchedules = existingFlags.employee_schedules || {};
          const existingEmployees = existingFlags.hr_employees || {};

          if (completeScheduleConfig) {
            const scheduleEntry = {
              employee_id: empCode,
              schedule_template: scheduleTemplate,
              schedule_config: completeScheduleConfig,
              updated_at: now,
            };
            existingSchedules[empCode] = scheduleEntry;
            if (String(employeeId) !== empCode) {
              existingSchedules[String(employeeId)] = scheduleEntry;
            }
          }

          const richEmployeeEntry = {
            ...(employeeRecord || {}),
            id: String(employeeId),
            employee_code: empCode,
            fullName: employeeName || employeeRecord?.fullName || 'Employee',
            is_active: isActiveVal,
            active: isActiveVal,
            schedule_template: scheduleTemplate,
            schedule: completeScheduleConfig,
            schedule_config: completeScheduleConfig,
            updated_at: now,
          };
          existingEmployees[empCode] = richEmployeeEntry;
          if (String(employeeId) !== empCode) {
            existingEmployees[String(employeeId)] = richEmployeeEntry;
          }

          const { error: tenantErr } = await supabaseServer
            .from('tenants')
            .update({
              feature_flags: {
                ...existingFlags,
                employee_schedules: existingSchedules,
                hr_employees: existingEmployees,
              },
              updated_at: now,
            })
            .eq('id', tenantData.id);

          if (tenantErr) {
            console.error('[API /api/hr/sync-workstation] Tenant feature_flags update error:', {
              message: tenantErr.message,
              details: tenantErr.details,
              hint: tenantErr.hint,
              code: tenantErr.code,
            });
            throw new Error(`Tenant schedule persistence failed: ${tenantErr.message}`);
          } else {
            persistedToSupabase = true;
            console.log('[API /api/hr/sync-workstation] Supabase tenant feature_flags schedule persisted for:', empCode);
          }
        } else {
          console.warn('[API /api/hr/sync-workstation] Tenant record not found for ID:', tenantId);
        }
      } catch (tenantEx: any) {
        console.error('[API /api/hr/sync-workstation] Tenant feature_flags exception:', tenantEx);
        throw tenantEx;
      }
    } catch (supaEx: any) {
      supabaseNotice = supaEx?.message || 'Supabase unreachable';
      console.error('[API /api/hr/sync-workstation] Supabase general exception:', supaEx);
      throw supaEx;
    }

    const returnedEmployee = {
      ...(employeeRecord || {}),
      id: String(employeeId),
      fullName: employeeName || employeeRecord?.fullName || 'Employee',
      is_active: isActiveVal,
      active: isActiveVal,
      schedule_template: scheduleTemplate,
      schedule: completeScheduleConfig || employeeRecord?.schedule,
      schedule_config: completeScheduleConfig || employeeRecord?.schedule_config,
      ...(savedEmployeeRow ? { dbRow: savedEmployeeRow } : {}),
    };

    return NextResponse.json({
      success: true,
      employee: returnedEmployee,
      data: workstationProfile,
      persistedToJson,
      persistedToSupabase,
      notice: supabaseNotice || undefined,
    });
  } catch (error: any) {
    console.error('[API /api/hr/sync-workstation] Internal error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabaseServer = getSupabaseServerClient();

    // 1. Fetch remote employees from Supabase table
    const { data: empRows } = await supabaseServer
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });

    // 2. Fetch remote schedules & rich hr_employees from tenants.feature_flags
    const { data: tenantData } = await supabaseServer
      .from('tenants')
      .select('feature_flags')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .maybeSingle();

    const flags = tenantData?.feature_flags || {};
    const remoteSchedules = flags.employee_schedules || {};
    const remoteEmployees = flags.hr_employees || {};

    // 3. Fallback/merge local JSON file
    let jsonEmployees: any[] = [];
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const dbData = JSON.parse(raw);
        if (Array.isArray(dbData.employees)) {
          jsonEmployees = dbData.employees;
        }
      }
    } catch {}

    return NextResponse.json({
      success: true,
      employees: empRows || [],
      remoteSchedules,
      remoteEmployees,
      jsonEmployees,
    });
  } catch (err: any) {
    console.error('[API /api/hr/sync-workstation GET] Error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch HR data' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId');
    if (!employeeId) {
      return NextResponse.json(
        { success: false, error: 'employeeId parameter is required' },
        { status: 400 }
      );
    }

    // 1. Delete from local JSON database
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const dbData = JSON.parse(raw);
        if (Array.isArray(dbData.employees)) {
          dbData.employees = dbData.employees.filter(
            (e: any) => String(e.id) !== String(employeeId)
          );
        }
        if (Array.isArray(dbData.workstation_configs)) {
          dbData.workstation_configs = dbData.workstation_configs.filter(
            (w: any) => String(w.employee_id) !== String(employeeId) && w.id !== `ws-emp-${employeeId}`
          );
        }
        dbData.last_updated = new Date().toISOString();
        fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf-8');
      }
    } catch (fsErr) {
      console.warn('[API /api/hr/sync-workstation DELETE] JSON delete notice:', fsErr);
    }

    // 2. Delete from Supabase via server client
    try {
      const supabaseServer = getSupabaseServerClient();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(employeeId);
      if (isUuid) {
        await supabaseServer.from('employees').delete().or(`id.eq.${employeeId},employee_code.eq.${employeeId}`);
      } else {
        await supabaseServer.from('employees').delete().eq('employee_code', employeeId);
      }
      await supabaseServer.from('workstation_configs').delete().eq('employee_id', employeeId);

      // 3. Authoritative cleanup from tenants.feature_flags (hr_employees & employee_schedules)
      const tenantId = '00000000-0000-0000-0000-000000000001';
      const { data: tenantData } = await supabaseServer
        .from('tenants')
        .select('id, feature_flags')
        .eq('id', tenantId)
        .maybeSingle();

      if (tenantData) {
        const flags = tenantData.feature_flags || {};
        let modified = false;

        if (flags.hr_employees) {
          for (const k of Object.keys(flags.hr_employees)) {
            const item = flags.hr_employees[k];
            if (
              k === String(employeeId) ||
              String(item?.id) === String(employeeId) ||
              String(item?.employee_code) === String(employeeId) ||
              String(item?.posEmployeeId) === String(employeeId)
            ) {
              delete flags.hr_employees[k];
              modified = true;
            }
          }
        }

        if (flags.employee_schedules) {
          for (const k of Object.keys(flags.employee_schedules)) {
            const item = flags.employee_schedules[k];
            if (k === String(employeeId) || String(item?.employee_id) === String(employeeId)) {
              delete flags.employee_schedules[k];
              modified = true;
            }
          }
        }

        if (modified) {
          await supabaseServer
            .from('tenants')
            .update({ feature_flags: flags, updated_at: new Date().toISOString() })
            .eq('id', tenantId);
        }
      }
    } catch (supaErr) {
      console.warn('[API /api/hr/sync-workstation DELETE] Supabase delete notice:', supaErr);
    }

    return NextResponse.json({ success: true, deletedEmployeeId: employeeId });
  } catch (error: any) {
    console.error('[API /api/hr/sync-workstation DELETE] Internal error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
