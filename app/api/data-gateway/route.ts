import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getSupabaseServerClient } from '@/lib/supabaseClient';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'vanguard_accounting_db.json');
const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

export type MutationOperation = 'INSERT' | 'UPDATE' | 'DELETE' | 'UPSERT';

export interface MutationRequestPayload {
  table: string;
  operation: MutationOperation;
  data?: Record<string, any>;
  primaryKey?: { field: string; value: any };
}

/**
 * Global Enterprise Data Gateway API
 * Centralized, authoritative database-first handler that ensures 100% remote persistence
 * to Supabase and prevents client-only silos or silent write failures.
 */
export async function POST(req: NextRequest) {
  try {
    const body: MutationRequestPayload = await req.json();
    const { table, operation, data = {}, primaryKey } = body;

    if (!table) {
      return NextResponse.json(
        { success: false, error: 'Table name is required' },
        { status: 400 }
      );
    }

    if (!operation || !['INSERT', 'UPDATE', 'DELETE', 'UPSERT'].includes(operation)) {
      return NextResponse.json(
        { success: false, error: `Invalid operation: ${operation}` },
        { status: 400 }
      );
    }

    const supabaseServer = getSupabaseServerClient();
    const normalizedTable = table.toLowerCase().trim();

    // =========================================================================
    // 1. SPECIALIZED HANDLER: EMPLOYEES & HR MASTER DIRECTORY
    // =========================================================================
    if (normalizedTable === 'hr_employees' || normalizedTable === 'employees') {
      const empId = primaryKey?.value || data?.id || data?.employee_code || data?.posEmployeeId;

      if (operation === 'DELETE') {
        if (!empId) {
          return NextResponse.json(
            { success: false, error: 'Primary key (employee ID) is required for DELETE' },
            { status: 400 }
          );
        }

        const idStr = String(empId);

        // a) Delete from local fallback JSON file
        try {
          if (fs.existsSync(DB_FILE)) {
            const raw = fs.readFileSync(DB_FILE, 'utf-8');
            const dbData = JSON.parse(raw);
            if (Array.isArray(dbData.employees)) {
              dbData.employees = dbData.employees.filter((e: any) => String(e.id) !== idStr && String(e.employee_code) !== idStr);
            }
            if (Array.isArray(dbData.workstation_configs)) {
              dbData.workstation_configs = dbData.workstation_configs.filter(
                (w: any) => String(w.employee_id) !== idStr && w.id !== `ws-emp-${idStr}`
              );
            }
            dbData.last_updated = new Date().toISOString();
            fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf-8');
          }
        } catch (fsErr) {
          console.warn('[DataGateway DELETE employee] JSON cleanup notice:', fsErr);
        }

        // b) Delete from Supabase employees and workstation_configs tables
        try {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idStr);
          let targetId: string | null = isUuid ? idStr : null;
          let targetCode: string | null = !isUuid ? idStr : null;

          try {
            const query = supabaseServer.from('employees').select('id, employee_code');
            const { data: matched } = isUuid
              ? await query.eq('id', idStr).maybeSingle()
              : await query.eq('employee_code', idStr).maybeSingle();
            if (matched) {
              if (matched.id) targetId = matched.id;
              if (matched.employee_code) targetCode = matched.employee_code;
            }
          } catch (findErr) {
            console.warn('[DataGateway DELETE employee] Find matched employee notice:', findErr);
          }

          if (targetId) {
            await supabaseServer.from('employees').delete().eq('id', targetId);
          }
          if (targetCode) {
            await supabaseServer.from('employees').delete().eq('employee_code', targetCode);
          }
          if (!targetId && isUuid) {
            await supabaseServer.from('employees').delete().eq('id', idStr);
          }
          if (!targetCode) {
            await supabaseServer.from('employees').delete().eq('employee_code', idStr);
          }

          await supabaseServer.from('workstation_configs').delete().or(
            `employee_id.eq.${idStr}${targetCode ? `,employee_id.eq.${targetCode}` : ''}${targetId ? `,employee_id.eq.${targetId}` : ''}`
          );
        } catch (tableErr) {
          console.warn('[DataGateway DELETE employee] Supabase table delete notice:', tableErr);
        }

        // c) Authoritative purge from tenants.feature_flags (hr_employees & employee_schedules)
        try {
          const { data: tenantData } = await supabaseServer
            .from('tenants')
            .select('id, feature_flags')
            .eq('id', DEFAULT_TENANT_ID)
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
                  kStr === idStr ||
                  idVal === idStr ||
                  codeVal === idStr ||
                  posVal === idStr
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
                if (kStr === idStr || empIdVal === idStr) {
                  delete flags.employee_schedules[k];
                  modified = true;
                }
              }
            }

            if (modified) {
              await supabaseServer
                .from('tenants')
                .update({ feature_flags: flags, updated_at: new Date().toISOString() })
                .eq('id', DEFAULT_TENANT_ID);
            }
          }
        } catch (tenantErr) {
          console.warn('[DataGateway DELETE employee] Tenant feature_flags purge notice:', tenantErr);
        }

        return NextResponse.json({
          success: true,
          data: { id: idStr, deleted: true },
        });
      }

      // INSERT / UPDATE / UPSERT
      const now = new Date().toISOString();
      const empCode = String(data.employee_code || data.posEmployeeId || data.id || `EMP-${Date.now()}`);
      const isActiveVal = data.is_active ?? data.active ?? true;
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(empCode);

      const basePayload: Record<string, any> = {
        employee_code: empCode,
        full_name: data.fullName || data.full_name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Employee',
        phone: data.phone || null,
        national_id: data.nationalId || data.national_id || null,
        is_active: isActiveVal,
      };

      if (data.dateHired || data.hire_date) {
        basePayload.hire_date = data.dateHired || data.hire_date;
      }
      if (isUuid) {
        basePayload.id = empCode;
      }

      // 1. Persist to public.employees table
      const { data: upsertData, error: empErr } = await supabaseServer
        .from('employees')
        .upsert(basePayload, { onConflict: isUuid ? 'id' : 'employee_code' })
        .select()
        .maybeSingle();

      if (empErr) {
        console.error('[DataGateway] employees table error:', empErr);
        return NextResponse.json(
          { success: false, error: empErr },
          { status: 400 }
        );
      }

      // 2. Persist rich metadata & complete schedule configuration to tenants.feature_flags
      try {
        const tenantId = data.tenant_id || DEFAULT_TENANT_ID;
        const { data: tenantData } = await supabaseServer
          .from('tenants')
          .select('id, feature_flags')
          .eq('id', tenantId)
          .maybeSingle();

        if (tenantData) {
          const flags = tenantData.feature_flags || {};
          const existingSchedules = flags.employee_schedules || {};
          const existingEmployees = flags.hr_employees || {};

          const scheduleConfig = data.schedule_config || data.schedule || null;
          const scheduleTemplate = data.schedule_template || scheduleConfig?.templateName || 'Backoffice Administration (08:00 - 16:30)';

          if (scheduleConfig) {
            const scheduleEntry = {
              employee_id: empCode,
              schedule_template: scheduleTemplate,
              schedule_config: scheduleConfig,
              updated_at: now,
            };
            existingSchedules[empCode] = scheduleEntry;
            if (data.id && String(data.id) !== empCode) {
              existingSchedules[String(data.id)] = scheduleEntry;
            }
          }

          const richEmployeeEntry = {
            ...data,
            id: String(data.id || empCode),
            employee_code: empCode,
            fullName: basePayload.full_name,
            is_active: isActiveVal,
            active: isActiveVal,
            schedule_template: scheduleTemplate,
            schedule: scheduleConfig,
            schedule_config: scheduleConfig,
            updated_at: now,
          };

          existingEmployees[empCode] = richEmployeeEntry;
          if (data.id && String(data.id) !== empCode) {
            existingEmployees[String(data.id)] = richEmployeeEntry;
          }

          await supabaseServer
            .from('tenants')
            .update({
              feature_flags: {
                ...flags,
                employee_schedules: existingSchedules,
                hr_employees: existingEmployees,
              },
              updated_at: now,
            })
            .eq('id', tenantData.id);
        }
      } catch (tenantSaveErr) {
        console.warn('[DataGateway] Tenant feature flags save notice:', tenantSaveErr);
      }

      return NextResponse.json({
        success: true,
        data: {
          ...data,
          ...upsertData,
          id: data.id || upsertData?.id || empCode,
          employee_code: empCode,
        },
      });
    }

    // =========================================================================
    // 2. GENERIC POSTGREST TABLE MUTATION (SERVICE-ROLE AUTHORITATIVE)
    // =========================================================================
    let query = supabaseServer.from(normalizedTable);

    if (operation === 'INSERT') {
      const { data: insertResult, error: insertErr } = await query.insert(data).select();
      if (insertErr) {
        return NextResponse.json(
          { success: false, error: insertErr },
          { status: 400 }
        );
      }
      return NextResponse.json({ success: true, data: insertResult });
    }

    if (operation === 'UPDATE') {
      if (!primaryKey?.field) {
        return NextResponse.json(
          { success: false, error: 'primaryKey { field, value } is required for UPDATE' },
          { status: 400 }
        );
      }
      const { data: updateResult, error: updateErr } = await query
        .update(data)
        .eq(primaryKey.field, primaryKey.value)
        .select();

      if (updateErr) {
        return NextResponse.json(
          { success: false, error: updateErr },
          { status: 400 }
        );
      }
      return NextResponse.json({ success: true, data: updateResult });
    }

    if (operation === 'DELETE') {
      if (!primaryKey?.field) {
        return NextResponse.json(
          { success: false, error: 'primaryKey { field, value } is required for DELETE' },
          { status: 400 }
        );
      }
      const { data: deleteResult, error: deleteErr } = await query
        .delete()
        .eq(primaryKey.field, primaryKey.value)
        .select();

      if (deleteErr) {
        return NextResponse.json(
          { success: false, error: deleteErr },
          { status: 400 }
        );
      }
      return NextResponse.json({ success: true, data: deleteResult });
    }

    if (operation === 'UPSERT') {
      const onConflict = primaryKey?.field;
      const { data: upsertResult, error: upsertErr } = await query
        .upsert(data, onConflict ? { onConflict } : undefined)
        .select();

      if (upsertErr) {
        return NextResponse.json(
          { success: false, error: upsertErr },
          { status: 400 }
        );
      }
      return NextResponse.json({ success: true, data: upsertResult });
    }

    return NextResponse.json(
      { success: false, error: `Unhandled operation ${operation}` },
      { status: 400 }
    );
  } catch (globalErr: any) {
    console.error('[DataGateway POST] Global exception:', globalErr);
    return NextResponse.json(
      { success: false, error: { message: globalErr?.message || 'Internal Server Error' } },
      { status: 500 }
    );
  }
}

/**
 * Authoritative Read & Hydration Contract (Rule 2)
 * Ensures remote database is single source of truth upon hard browser reload.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const table = searchParams.get('table');
    const select = searchParams.get('select') || '*';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const orderCol = searchParams.get('orderBy');
    const ascending = searchParams.get('ascending') !== 'false';

    if (!table) {
      return NextResponse.json(
        { success: false, error: 'Table parameter is required' },
        { status: 400 }
      );
    }

    const supabaseServer = getSupabaseServerClient();
    const normalizedTable = table.toLowerCase().trim();

    // Specialized fetch for employees
    if (normalizedTable === 'hr_employees' || normalizedTable === 'employees') {
      const { data: empRows, error: empErr } = await supabaseServer
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: tenantData } = await supabaseServer
        .from('tenants')
        .select('feature_flags')
        .eq('id', DEFAULT_TENANT_ID)
        .maybeSingle();

      const flags = tenantData?.feature_flags || {};
      const remoteSchedules = flags.employee_schedules || {};
      const remoteEmployees = flags.hr_employees || {};

      return NextResponse.json({
        success: true,
        data: empRows || [],
        remoteEmployees,
        remoteSchedules,
      });
    }

    let query = supabaseServer.from(normalizedTable).select(select);
    if (orderCol) {
      query = query.order(orderCol, { ascending });
    }
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json(
        { success: false, error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('[DataGateway GET] Global exception:', err);
    return NextResponse.json(
      { success: false, error: { message: err?.message || 'Internal Server Error' } },
      { status: 500 }
    );
  }
}
