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
      try {
        const empCode = String(employeeId);
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(empCode);
        const empDbPayload: Record<string, any> = {
          employee_code: empCode,
          full_name: employeeName || employeeRecord?.fullName || `${employeeRecord?.firstName || ''} ${employeeRecord?.lastName || ''}`.trim() || 'Employee',
          phone: employeeRecord?.phone || null,
          national_id: employeeRecord?.nationalId || null,
          is_active: isActiveVal,
        };
        if (employeeRecord?.dateHired) {
          empDbPayload.hire_date = employeeRecord.dateHired;
        }
        if (isUuid) {
          empDbPayload.id = empCode;
        }

        const { data: upsertData, error: empErr } = await supabaseServer
          .from('employees')
          .upsert(empDbPayload, { onConflict: isUuid ? 'id' : 'employee_code' })
          .select()
          .maybeSingle();

        if (empErr) {
          console.warn('[API /api/hr/sync-workstation] Supabase employees table notice:', empErr.message);
        } else {
          savedEmployeeRow = upsertData;
        }
      } catch (empEx: any) {
        console.warn('[API /api/hr/sync-workstation] Supabase employees table exception:', empEx);
      }
    } catch (supaEx: any) {
      supabaseNotice = supaEx?.message || 'Supabase unreachable';
      console.warn('[API /api/hr/sync-workstation] Supabase workstation_configs exception:', supaEx);
    }

    const returnedEmployee = {
      ...(employeeRecord || {}),
      id: String(employeeId),
      fullName: employeeName || employeeRecord?.fullName || 'Employee',
      is_active: isActiveVal,
      active: isActiveVal,
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
