import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getSupabaseServerClient } from '@/lib/supabaseClient';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'vanguard_accounting_db.json');
const DEFAULT_TENANT_UUID = '00000000-0000-0000-0000-000000000001';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
    let dbCode = empCode;
    let assignedPosId = '';
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

      // 3. Persist to public.employees (tenant-scoped). Create = genuine INSERT with a fresh uuid; edit = UPDATE of that exact row.
      //    Never an upsert keyed on employee_code / pos login id, so one employee can never overwrite another.
      const isUuid = UUID_RE.test(empCode);
      const isNewEmployee = employeeRecord?.isNew === true;
      const rowTenantId = String(employeeRecord?.tenant_id || DEFAULT_TENANT_UUID);

      // 3a. POS Login ID: unique per tenant (create auto-assigns max + 1; edit rejects duplicates)
      const tenantFlagsRes = await supabaseServer.from('tenants').select('feature_flags').eq('id', rowTenantId).maybeSingle();
      const flagEmployees = Object.values(((tenantFlagsRes.data?.feature_flags as any)?.hr_employees || {}) as Record<string, any>);
      const posOf = (e: any) => parseInt(String(e?.posEmployeeId ?? e?.posCredentials?.employeeId ?? ''), 10);
      const takenPos = new Set<number>(
        flagEmployees.filter((e: any) => String(e?.id) !== String(employeeId)).map(posOf).filter((n) => n > 0)
      );
      let posNum = parseInt(String(employeeRecord?.posEmployeeId ?? posCredentials?.employeeId ?? ''), 10);
      if (!(posNum > 0) || takenPos.has(posNum)) {
        if (isNewEmployee || !(posNum > 0)) {
          posNum = Math.max(0, ...Array.from(takenPos)) + 1;
        } else {
          throw new Error(`POS Login ID #${posNum} is already used by another employee in this tenant. Choose a different POS Login ID.`);
        }
      }
      assignedPosId = String(posNum);

      // 3b. Find the exact existing row (by uuid, else by code within this tenant)
      let existingRow: any = null;
      if (isUuid) {
        const r = await supabaseServer.from('employees').select('id, employee_code').eq('id', empCode).maybeSingle();
        existingRow = r.data || null;
      }
      if (!existingRow && !isNewEmployee) {
        const r = await supabaseServer.from('employees').select('id, employee_code').eq('tenant_id', rowTenantId).eq('employee_code', empCode).maybeSingle();
        existingRow = r.data || null;
      }
      if (isNewEmployee && existingRow) {
        throw new Error('An employee with this id already exists; refusing to overwrite it.');
      }

      const fullNameVal = employeeName || employeeRecord?.fullName || `${employeeRecord?.firstName || ''} ${employeeRecord?.lastName || ''}`.trim() || 'Employee';
      const baseFields: Record<string, any> = { full_name: fullNameVal, phone: employeeRecord?.phone || null, is_active: isActiveVal };
      const extendedFields: Record<string, any> = { ...baseFields };
      if (employeeRecord?.nationalId) extendedFields.national_id = employeeRecord.nationalId;
      if (employeeRecord?.dateHired) extendedFields.hire_date = employeeRecord.dateHired;
      const isColumnErr = (e: any) => !!e && /column|schema cache/i.test(e.message || '');

      let upsertData: any = null;
      if (existingRow) {
        dbCode = String(existingRow.employee_code || empCode);
        const doUpdate = (fields: Record<string, any>) => supabaseServer.from('employees').update(fields).eq('id', existingRow.id).select().maybeSingle();
        let r = await doUpdate(extendedFields);
        if (r.error && isColumnErr(r.error)) r = await doUpdate(baseFields);
        if (r.error) throw new Error(`Employee was not saved to public.employees: ${r.error.message}`);
        upsertData = r.data;
      } else {
        const { data: codeRows } = await supabaseServer.from('employees').select('employee_code').eq('tenant_id', rowTenantId);
        const maxNo = (codeRows || []).reduce((m: number, r: any) => {
          const mm = /^EMP-(\d+)$/.exec(String(r.employee_code || ''));
          return mm ? Math.max(m, parseInt(mm[1], 10)) : m;
        }, 0);
        const generatedCode = `EMP-${String(maxNo + 1).padStart(3, '0')}`;
        dbCode = isUuid || isNewEmployee ? generatedCode : empCode;
        const buildRow = (fields: Record<string, any>, code: string) => ({ ...(isUuid ? { id: empCode } : {}), tenant_id: rowTenantId, employee_code: code, ...fields });
        const doInsert = (fields: Record<string, any>, code: string) => supabaseServer.from('employees').insert(buildRow(fields, code)).select().maybeSingle();
        let r = await doInsert(extendedFields, dbCode);
        if (r.error && isColumnErr(r.error)) r = await doInsert(baseFields, dbCode);
        if (r.error && r.error.code === '23505') {
          dbCode = `EMP-${String(maxNo + 2).padStart(3, '0')}`;
          r = await doInsert(extendedFields, dbCode);
          if (r.error && isColumnErr(r.error)) r = await doInsert(baseFields, dbCode);
        }
        if (r.error) throw new Error(`Employee was not saved to public.employees: ${r.error.message}${r.error.hint ? ` (${r.error.hint})` : ''}`);
        upsertData = r.data;
      }
      if (!upsertData) {
        throw new Error('Employee was not saved to public.employees (no row returned - blocked by an RLS policy?)');
      }
      savedEmployeeRow = upsertData;
      persistedToSupabase = true;
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
            employee_code: dbCode,
            isNew: undefined,
            posEmployeeId: assignedPosId || (employeeRecord as any)?.posEmployeeId,
            posCredentials: { ...((posCredentials || employeeRecord?.posCredentials || {}) as any), employeeId: assignedPosId || (posCredentials as any)?.employeeId },
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
                hr_schedules: existingSchedules,
                hr_employees: existingEmployees,
                staff_meta: {
                  ...(existingFlags.staff_meta || {}),
                  ...(savedEmployeeRow?.id
                    ? { [savedEmployeeRow.id]: { role: employeeRecord?.designation || employeeRecord?.department || 'Staff', email: employeeRecord?.email || '' } }
                    : {}),
                },
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
      employee_code: dbCode,
      posEmployeeId: assignedPosId || employeeRecord?.posEmployeeId,
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

export async function GET(req: NextRequest) {
  try {
    const supabaseServer = getSupabaseServerClient();
    const tenantParam = new URL(req.url).searchParams.get('tenantId') || '';
    const tenantId = UUID_RE.test(tenantParam) ? tenantParam : DEFAULT_TENANT_UUID;

    // 1. Fetch remote employees from Supabase table
    const { data: empRows } = await supabaseServer
      .from('employees')
      .select('*')
      .or(tenantId === DEFAULT_TENANT_UUID ? `tenant_id.eq.${tenantId},tenant_id.is.null` : `tenant_id.eq.${tenantId}`)
      .order('created_at', { ascending: false });

    // 2. Fetch remote schedules & rich hr_employees from tenants.feature_flags
    const { data: tenantData } = await supabaseServer
      .from('tenants')
      .select('feature_flags')
      .eq('id', tenantId)
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
      
      let targetId: string | null = isUuid ? employeeId : null;
      let targetCode: string | null = !isUuid ? employeeId : null;

      try {
        const query = supabaseServer.from('employees').select('id, employee_code');
        const { data: matched } = isUuid
          ? await query.eq('id', employeeId).maybeSingle()
          : await query.eq('employee_code', employeeId).maybeSingle();
        if (matched) {
          if (matched.id) targetId = matched.id;
          if (matched.employee_code) targetCode = matched.employee_code;
        }
      } catch (findErr) {
        console.warn('[API /api/hr/sync-workstation DELETE] Find matched employee notice:', findErr);
      }

      if (targetId) {
        await supabaseServer.from('employees').delete().eq('id', targetId);
        try { await supabaseServer.from('hr_employees').delete().eq('id', targetId); } catch (e) {}
      }
      if (targetCode) {
        await supabaseServer.from('employees').delete().eq('employee_code', targetCode);
        try { await supabaseServer.from('hr_employees').delete().eq('employee_code', targetCode); } catch (e) {}
      }
      if (!targetId && isUuid) {
        await supabaseServer.from('employees').delete().eq('id', employeeId);
        try { await supabaseServer.from('hr_employees').delete().eq('id', employeeId); } catch (e) {}
      }
      if (!targetCode) {
        await supabaseServer.from('employees').delete().eq('employee_code', employeeId);
        try { await supabaseServer.from('hr_employees').delete().eq('employee_code', employeeId); } catch (e) {}
      }

      await supabaseServer.from('workstation_configs').delete().or(
        `employee_id.eq.${employeeId}${targetCode ? `,employee_id.eq.${targetCode}` : ''}${targetId ? `,employee_id.eq.${targetId}` : ''}`
      );

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
            const kStr = String(k);
            const idVal = String(item?.id);
            const codeVal = String(item?.employee_code);
            const posVal = String(item?.posEmployeeId);
            if (
              kStr === String(employeeId) ||
              idVal === String(employeeId) ||
              codeVal === String(employeeId) ||
              posVal === String(employeeId) ||
              (targetCode && (kStr === targetCode || codeVal === targetCode || posVal === targetCode)) ||
              (targetId && (kStr === targetId || idVal === targetId))
            ) {
              delete flags.hr_employees[k];
              modified = true;
            }
          }
        }

        if (flags.employee_schedules) {
          for (const k of Object.keys(flags.employee_schedules)) {
            const item = flags.employee_schedules[k];
            const kStr = String(k);
            const empIdVal = String(item?.employee_id);
            if (
              kStr === String(employeeId) ||
              empIdVal === String(employeeId) ||
              (targetCode && (kStr === targetCode || empIdVal === targetCode)) ||
              (targetId && (kStr === targetId || empIdVal === targetId))
            ) {
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
