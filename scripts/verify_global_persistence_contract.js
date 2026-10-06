/**
 * Vanguard ERP — Global Integration Verification Script
 * Repository-Wide Supabase Persistence & Hydration Contract
 * 
 * Verifies:
 * 1. Rule 1: Mandatory Database-First Mutation Pipeline (Create -> Update -> Delete)
 * 2. Rule 2: Authoritative Read & Hydration Contract (Survives hard refresh, zero stale cache)
 * 3. Rule 3: Complete deletion cascade and purge without resurrection on reload
 * 4. Rule 4: Full CRUD round-trip validation against production Supabase
 */

const fs = require('fs');
const dotenv = require('dotenv');

if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
} else if (fs.existsSync('.env')) {
  dotenv.config({ path: '.env' });
}

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://cmntrzsaqapybfhngmdv.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

async function runGlobalPersistenceContractTests() {
  console.log('========================================================================');
  console.log('🧪 RUNNING GLOBAL DATABASE-FIRST PERSISTENCE CONTRACT VERIFICATION');
  console.log('========================================================================');
  console.log(`📡 Connecting to Supabase: ${SUPABASE_URL}`);

  const testId = `TEST-EMP-${Date.now()}`;
  console.log(`🎯 Test Entity ID: ${testId}`);

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passedTests++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  try {
    // -------------------------------------------------------------------------
    // TEST 1: CREATE (MANDATORY DATABASE-FIRST WRITE)
    // -------------------------------------------------------------------------
    console.log('\n--- 1. Testing CREATE Mutation in Supabase ---');
    const createPayload = {
      employee_code: testId,
      full_name: 'Verification Bot Automated Tester',
      phone: '+961 70 999 888',
      national_id: 'LB-999888777',
      is_active: true,
      hire_date: '2026-01-15',
    };

    const initialSchedule = {
      templateName: 'Backoffice Administration (08:00 - 16:30)',
      workDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      offDays: ['Sun'],
      applyToAllMonths: true,
      dateOverrides: {
        '2026-05-01': 'OFF',
        '2026-05-02': 'OFF',
      },
      daysOff: [],
    };

    // 1a. Write to employees table
    const { data: createdRow, error: createErr } = await supabaseAdmin
      .from('employees')
      .upsert(createPayload, { onConflict: 'employee_code' })
      .select()
      .maybeSingle();

    assert(!createErr, `employees table INSERT resolved without error: ${createErr?.message || 'OK'}`);
    assert(createdRow && createdRow.employee_code === testId, `Row inserted into employees table with ID: ${createdRow?.id}`);

    // 1b. Write rich metadata and schedule to tenants.feature_flags
    const { data: tenantRecord, error: tenantReadErr } = await supabaseAdmin
      .from('tenants')
      .select('id, feature_flags')
      .eq('id', DEFAULT_TENANT_ID)
      .maybeSingle();

    assert(!tenantReadErr && tenantRecord, 'Tenant feature flags record retrieved successfully');

    const flags = tenantRecord.feature_flags || {};
    const schedules = flags.employee_schedules || {};
    const employees = flags.hr_employees || {};

    schedules[testId] = {
      employee_id: testId,
      schedule_template: 'Backoffice Administration (08:00 - 16:30)',
      schedule_config: initialSchedule,
      updated_at: new Date().toISOString(),
    };

    employees[testId] = {
      id: testId,
      employee_code: testId,
      fullName: createPayload.full_name,
      phone: createPayload.phone,
      is_active: true,
      schedule_template: 'Backoffice Administration (08:00 - 16:30)',
      schedule: initialSchedule,
      schedule_config: initialSchedule,
      updated_at: new Date().toISOString(),
    };

    const { error: tenantUpdateErr } = await supabaseAdmin
      .from('tenants')
      .update({
        feature_flags: {
          ...flags,
          employee_schedules: schedules,
          hr_employees: employees,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', DEFAULT_TENANT_ID);

    assert(!tenantUpdateErr, 'Rich schedule config written authoritatively to tenants.feature_flags');

    // -------------------------------------------------------------------------
    // TEST 2: READ & HYDRATION (AUTHORITATIVE REMOTE STATE)
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Testing READ & HYDRATION from Supabase (Fresh Remote Read) ---');
    const { data: fetchedEmp, error: fetchErr } = await supabaseAdmin
      .from('employees')
      .select('*')
      .eq('employee_code', testId)
      .maybeSingle();

    assert(!fetchErr && fetchedEmp, 'Employee row queried successfully from Supabase employees table');
    assert(fetchedEmp.full_name === 'Verification Bot Automated Tester', 'Remote employee name matches created payload');
    assert(fetchedEmp.phone === '+961 70 999 888', 'Remote employee phone matches created payload');

    const { data: freshTenant } = await supabaseAdmin
      .from('tenants')
      .select('feature_flags')
      .eq('id', DEFAULT_TENANT_ID)
      .maybeSingle();

    const freshSchedules = freshTenant?.feature_flags?.employee_schedules || {};
    const freshScheduleEntry = freshSchedules[testId];

    assert(freshScheduleEntry !== undefined, 'Remote schedule entry exists in tenants.feature_flags');
    assert(freshScheduleEntry.schedule_template === 'Backoffice Administration (08:00 - 16:30)', 'Schedule template matches created value');
    assert(freshScheduleEntry.schedule_config?.dateOverrides?.['2026-05-01'] === 'OFF', 'Date override 2026-05-01 correctly persisted as OFF');

    // -------------------------------------------------------------------------
    // TEST 3: UPDATE (MODIFY SCHEDULE & PROFILE IN SUPABASE)
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Testing UPDATE Mutation in Supabase ---');
    const updatedSchedule = {
      ...initialSchedule,
      templateName: 'Standard Factory Shift (07:00 - 15:30)',
      dateOverrides: {
        ...initialSchedule.dateOverrides,
        '2026-06-15': '07:00 - 15:30',
        '2026-07-20': 'OFF',
      },
    };

    // Update employees table
    const { error: empUpdateErr } = await supabaseAdmin
      .from('employees')
      .update({
        phone: '+961 70 111 222',
      })
      .eq('employee_code', testId);

    assert(!empUpdateErr, 'Supabase employees table phone update succeeded');

    // Update tenants.feature_flags
    const updatedFlags = freshTenant.feature_flags || {};
    updatedFlags.employee_schedules[testId] = {
      employee_id: testId,
      schedule_template: 'Standard Factory Shift (07:00 - 15:30)',
      schedule_config: updatedSchedule,
      updated_at: new Date().toISOString(),
    };
    if (updatedFlags.hr_employees[testId]) {
      updatedFlags.hr_employees[testId].schedule_template = 'Standard Factory Shift (07:00 - 15:30)';
      updatedFlags.hr_employees[testId].schedule = updatedSchedule;
      updatedFlags.hr_employees[testId].schedule_config = updatedSchedule;
      updatedFlags.hr_employees[testId].phone = '+961 70 111 222';
    }

    const { error: updateTenantErr } = await supabaseAdmin
      .from('tenants')
      .update({ feature_flags: updatedFlags, updated_at: new Date().toISOString() })
      .eq('id', DEFAULT_TENANT_ID);

    assert(!updateTenantErr, 'tenants.feature_flags schedule UPDATE committed successfully');

    // -------------------------------------------------------------------------
    // TEST 4: READ AUTHORITATIVE UPDATED STATE
    // -------------------------------------------------------------------------
    console.log('\n--- 4. Testing READ after UPDATE (Authoritative Re-Fetch) ---');
    const { data: reFetchedEmp } = await supabaseAdmin
      .from('employees')
      .select('*')
      .eq('employee_code', testId)
      .maybeSingle();

    assert(reFetchedEmp.phone === '+961 70 111 222', 'Remote employee phone correctly reflects updated value (+961 70 111 222)');

    const { data: reFetchedTenant } = await supabaseAdmin
      .from('tenants')
      .select('feature_flags')
      .eq('id', DEFAULT_TENANT_ID)
      .maybeSingle();

    const postUpdateSchedule = reFetchedTenant?.feature_flags?.employee_schedules?.[testId];
    assert(postUpdateSchedule?.schedule_template === 'Standard Factory Shift (07:00 - 15:30)', 'Remote schedule template updated to Standard Factory Shift');
    assert(postUpdateSchedule?.schedule_config?.dateOverrides?.['2026-07-20'] === 'OFF', 'Date override 2026-07-20 persisted as OFF');

    // -------------------------------------------------------------------------
    // TEST 5: DELETE & AUTHORITATIVE PURGE (PREVENT RESURRECTION)
    // -------------------------------------------------------------------------
    console.log('\n--- 5. Testing DELETE & PURGE from Supabase ---');
    // 5a. Delete from employees table
    const { error: deleteRowErr } = await supabaseAdmin
      .from('employees')
      .delete()
      .eq('employee_code', testId);

    assert(!deleteRowErr, 'employees table row deleted successfully');

    // 5b. Purge from tenants.feature_flags
    const { data: purgeTenantData } = await supabaseAdmin
      .from('tenants')
      .select('feature_flags')
      .eq('id', DEFAULT_TENANT_ID)
      .maybeSingle();

    const flagsToPurge = purgeTenantData?.feature_flags || {};
    if (flagsToPurge.hr_employees) {
      delete flagsToPurge.hr_employees[testId];
    }
    if (flagsToPurge.employee_schedules) {
      delete flagsToPurge.employee_schedules[testId];
    }

    const { error: purgeErr } = await supabaseAdmin
      .from('tenants')
      .update({ feature_flags: flagsToPurge, updated_at: new Date().toISOString() })
      .eq('id', DEFAULT_TENANT_ID);

    assert(!purgeErr, 'Entity purged from tenants.feature_flags successfully');

    // -------------------------------------------------------------------------
    // TEST 6: READ AFTER DELETE (ZERO RESURRECTION CONFIRMATION)
    // -------------------------------------------------------------------------
    console.log('\n--- 6. Testing READ after DELETE (Zero Resurrection Verification) ---');
    const { data: postDeleteEmp } = await supabaseAdmin
      .from('employees')
      .select('*')
      .eq('employee_code', testId)
      .maybeSingle();

    assert(postDeleteEmp === null, 'Employee row is completely absent from Supabase employees table');

    const { data: finalTenantCheck } = await supabaseAdmin
      .from('tenants')
      .select('feature_flags')
      .eq('id', DEFAULT_TENANT_ID)
      .maybeSingle();

    const finalFlags = finalTenantCheck?.feature_flags || {};
    assert(finalFlags.hr_employees?.[testId] === undefined, 'Employee purged from hr_employees (zero reload resurrection)');
    assert(finalFlags.employee_schedules?.[testId] === undefined, 'Schedule purged from employee_schedules (zero reload resurrection)');

    console.log('\n========================================================================');
    console.log(`🎉 ALL TESTS PASSED: ${passedTests}/${totalTests} assertions verified!`);
    console.log('🏆 Database-First Persistence Contract Verified Successfully!');
    console.log('========================================================================\n');
  } catch (err) {
    console.error('\n❌ Persistence verification encountered a fatal error:', err);
    process.exit(1);
  }
}

runGlobalPersistenceContractTests();
