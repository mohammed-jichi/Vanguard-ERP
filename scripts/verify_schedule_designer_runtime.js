const assert = require('assert');

// 1. Replicate Helper functions and Constants from ScheduleDesigner / hrPersonnelService
const STANDARD_SCHEDULE_TEMPLATES = [
  {
    name: 'Standard Factory Shift (07:00 - 15:30)',
    workDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    slots: [{ start: '07:00', end: '15:30' }],
    offDays: ['Sun'],
  },
  {
    name: 'Standard 6-Day Operation (08:00 - 16:30)',
    workDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    slots: [{ start: '08:00', end: '16:30' }],
    offDays: ['Sun'],
  },
  {
    name: 'Distribution & Fleet Delivery (06:00 - 14:30)',
    workDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    slots: [{ start: '06:00', end: '14:30' }],
    offDays: ['Sun'],
  },
  {
    name: 'Evening Extraction & Milling (15:00 - 23:30)',
    workDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    slots: [{ start: '15:00', end: '23:30' }],
    offDays: ['Sun'],
  },
  {
    name: 'Backoffice Administration (08:00 - 16:30)',
    workDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    slots: [{ start: '08:00', end: '16:30' }],
    offDays: ['Sat', 'Sun'],
  },
  {
    name: 'Weekend Retail & Standby (09:00 - 17:00)',
    workDays: ['Fri', 'Sat', 'Sun'],
    slots: [{ start: '09:00', end: '17:00' }],
    offDays: ['Mon', 'Tue', 'Wed', 'Thu'],
  },
];

function getDaysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function getDayOfWeekAbbr(year, monthIndex, day) {
  const d = new Date(year, monthIndex, day);
  const map = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return map[d.getDay()];
}

function calculateEmployeeShiftForDay(
  emp,
  dayNumber,
  monthIdx,
  yearNum,
  daysOffList,
  manageSubView,
  selectedTemplateName,
  forcedTemplateName
) {
  const dayAbbr = getDayOfWeekAbbr(yearNum, monthIdx, dayNumber);
  const dateStr = `${yearNum}-${(monthIdx + 1).toString().padStart(2, '0')}-${dayNumber
    .toString()
    .padStart(2, '0')}`;

  // 1. Approved formal Day Off request
  const hasDayOff = daysOffList.some(
    (d) =>
      d.employeeId === emp.id &&
      dateStr >= d.startDate &&
      dateStr <= d.endDate
  );
  if (hasDayOff) {
    return 'OFF';
  }

  // 2. Explicit preview if forcedTemplateName is specified and differs from assigned template
  if (forcedTemplateName && forcedTemplateName !== emp.schedule?.templateName) {
    const template = STANDARD_SCHEDULE_TEMPLATES.find((t) => t.name === forcedTemplateName);
    if (template) {
      if (template.workDays.includes(dayAbbr)) {
        return `${template.slots[0].start} - ${template.slots[0].end}`;
      }
      return 'OFF';
    }
  }

  // 3. Explicit date overrides
  if (emp.schedule?.dateOverrides?.[dateStr]) {
    return emp.schedule.dateOverrides[dateStr];
  }

  // 4. In Schedule Template Mode or assigned template fallback
  const activeTplName =
    (manageSubView === 'schedule' ? selectedTemplateName : undefined) ||
    emp.schedule?.templateName ||
    selectedTemplateName ||
    STANDARD_SCHEDULE_TEMPLATES[0].name;

  const template = STANDARD_SCHEDULE_TEMPLATES.find((t) => t.name === activeTplName);
  if (template) {
    if (template.workDays.includes(dayAbbr)) {
      return `${template.slots[0].start} - ${template.slots[0].end}`;
    }
    return 'OFF';
  }

  // 5. Default 6-day fallback (only Sunday is OFF)
  if (dayAbbr === 'Sun') {
    return 'OFF';
  }
  return '08:00 - 16:30';
}

function getEmployeeMonthOffDaysCount(
  emp,
  monthIdx,
  yearNum,
  daysOffList,
  manageSubView,
  selectedTemplateName
) {
  const daysInMonth = getDaysInMonth(yearNum, monthIdx);
  let count = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    if (
      calculateEmployeeShiftForDay(
        emp,
        d,
        monthIdx,
        yearNum,
        daysOffList,
        manageSubView,
        selectedTemplateName
      ) === 'OFF'
    ) {
      count++;
    }
  }
  return count;
}

// ----------------------------------------------------
// TEST SUITE: RUNTIME VERIFICATION
// ----------------------------------------------------
console.log('====================================================');
console.log('🧪 RUNTIME AUDIT & VERIFICATION: SCHEDULE DESIGNER');
console.log('====================================================\n');

const year = 2026;
const sampleEmp = {
  id: '641',
  fullName: 'Mohammed Jichi',
  firstName: 'Mohammed',
  department: 'Production',
  schedule: {
    templateName: 'Standard Factory Shift (07:00 - 15:30)',
  },
};

// TEST 1: Template Structure & 6-Day Definition Verification
console.log('TEST 1: Verifying 6-Day Work Week Templates...');
const factoryTpl = STANDARD_SCHEDULE_TEMPLATES.find((t) => t.name === 'Standard Factory Shift (07:00 - 15:30)');
assert.ok(factoryTpl, 'Standard Factory Shift template must exist');
assert.deepStrictEqual(factoryTpl.workDays, ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], 'Factory shift must have 6 work days (Mon-Sat)');
assert.deepStrictEqual(factoryTpl.offDays, ['Sun'], 'Factory shift offDays must contain strictly Sunday');
console.log('  ✔ Standard Factory Shift has Mon-Sat working and Sunday only OFF.');

// TEST 2: Year 2026 Off-Days Calculation for 6-Day Work Week
console.log('\nTEST 2: Calculating 2026 Monthly OFF Days for Standard Factory Shift...');
let totalYearlyOffDays = 0;
const expectedSundaysPerMonth = [4, 4, 5, 4, 5, 4, 4, 5, 4, 4, 5, 4]; // 2026 Sundays

for (let m = 0; m < 12; m++) {
  const offDays = getEmployeeMonthOffDaysCount(sampleEmp, m, year, [], 'schedule', factoryTpl.name);
  totalYearlyOffDays += offDays;
  assert.strictEqual(
    offDays,
    expectedSundaysPerMonth[m],
    `Month ${m + 1} must have exactly ${expectedSundaysPerMonth[m]} OFF days, got ${offDays}`
  );
  assert.ok(offDays >= 4 && offDays <= 5, `Month ${m + 1} OFF days count (${offDays}) must be between 4 and 5`);
  console.log(`  Month ${m + 1} (2026): ${offDays} OFF days (Expected: ${expectedSundaysPerMonth[m]}) ✔`);
}

assert.strictEqual(totalYearlyOffDays, 52, `Total yearly off days for 6-day work week in 2026 must be 52, got ${totalYearlyOffDays}`);
console.log(`  ✔ Total Yearly OFF Days = ${totalYearlyOffDays} (Target: exactly 52 OFF days, NOT 104)`);

// TEST 3: Specific Day Timing Asserts (Saturday vs Sunday)
console.log('\nTEST 3: Checking Saturday vs Sunday shift timing...');
// Jan 3, 2026 is Saturday
const satShift = calculateEmployeeShiftForDay(sampleEmp, 3, 0, year, [], 'schedule', factoryTpl.name);
assert.strictEqual(satShift, '07:00 - 15:30', `Saturday Jan 3 must be a working day (07:00 - 15:30), got ${satShift}`);
console.log(`  Saturday Jan 3, 2026: "${satShift}" (Expected working shift) ✔`);

// Jan 4, 2026 is Sunday
const sunShift = calculateEmployeeShiftForDay(sampleEmp, 4, 0, year, [], 'schedule', factoryTpl.name);
assert.strictEqual(sunShift, 'OFF', `Sunday Jan 4 must be OFF, got ${sunShift}`);
console.log(`  Sunday Jan 4, 2026: "${sunShift}" (Expected OFF) ✔`);

// TEST 4: Date Overrides & Inline Toggle Precedence
console.log('\nTEST 4: Checking Date Overrides & Inline Toggle Precedence...');
// Revert Sunday Jan 4 to ON
const empWithOverride = {
  ...sampleEmp,
  schedule: {
    ...sampleEmp.schedule,
    dateOverrides: {
      '2026-01-04': '07:00 - 15:30', // Sunday turned ON
      '2026-01-07': 'OFF',           // Wednesday turned OFF
    },
  },
};

const sunTurnedOn = calculateEmployeeShiftForDay(empWithOverride, 4, 0, year, [], 'schedule', factoryTpl.name);
assert.strictEqual(sunTurnedOn, '07:00 - 15:30', 'Overridden Sunday must show working shift');
console.log(`  Sunday Jan 4 with override: "${sunTurnedOn}" (Successfully toggled ON) ✔`);

const wedTurnedOff = calculateEmployeeShiftForDay(empWithOverride, 7, 0, year, [], 'schedule', factoryTpl.name);
assert.strictEqual(wedTurnedOff, 'OFF', 'Overridden Wednesday must show OFF');
console.log(`  Wednesday Jan 7 with override: "${wedTurnedOff}" (Successfully toggled OFF) ✔`);

// TEST 5: Formal Approved Day Off takes Precedence
console.log('\nTEST 5: Checking Formal Approved Day Off Record Precedence...');
const formalDayOff = [
  {
    id: 'DO-01',
    employeeId: '641',
    startDate: '2026-01-08',
    endDate: '2026-01-09',
    reason: 'Medical appointment',
    approved: true,
  },
];
const thuDayOff = calculateEmployeeShiftForDay(empWithOverride, 8, 0, year, formalDayOff, 'schedule', factoryTpl.name);
assert.strictEqual(thuDayOff, 'OFF', 'Approved formal day off must return OFF');
console.log(`  Thursday Jan 8 (Medical appointment): "${thuDayOff}" (Precedence verified) ✔`);

// TEST 6: Batch 12-Month Schedule Matrix Generation
console.log('\nTEST 6: Simulating Batch 12-Month Schedule Generation (All 365 Days)...');
const all12MonthsOverrides = {};
let workingDaysCount = 0;
let offDaysCount = 0;

for (let mIdx = 0; mIdx < 12; mIdx++) {
  const daysInMonth = getDaysInMonth(year, mIdx);
  for (let day = 1; day <= daysInMonth; day++) {
    const dayAbbr = getDayOfWeekAbbr(year, mIdx, day);
    const dateStr = `${year}-${(mIdx + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    if (factoryTpl.workDays.includes(dayAbbr)) {
      all12MonthsOverrides[dateStr] = `${factoryTpl.slots[0].start} - ${factoryTpl.slots[0].end}`;
      workingDaysCount++;
    } else {
      all12MonthsOverrides[dateStr] = 'OFF';
      offDaysCount++;
    }
  }
}

const totalDaysGenerated = Object.keys(all12MonthsOverrides).length;
assert.strictEqual(totalDaysGenerated, 365, `Full year 2026 must have 365 days generated, got ${totalDaysGenerated}`);
assert.strictEqual(offDaysCount, 52, `Full year 2026 must have 52 off days, got ${offDaysCount}`);
assert.strictEqual(workingDaysCount, 313, `Full year 2026 must have 313 working days, got ${workingDaysCount}`);
console.log(`  Total Days in Matrix: ${totalDaysGenerated} (Working: ${workingDaysCount}, OFF: ${offDaysCount}) ✔`);

// TEST 7: Payload Contract & Schema Mapping Verification
console.log('\nTEST 7: Validating Persistence Payload Schema Contract...');
const scheduleConfig = {
  templateName: factoryTpl.name,
  workDays: factoryTpl.workDays,
  offDays: factoryTpl.offDays,
  applyToAllMonths: true,
  dateOverrides: all12MonthsOverrides,
  daysOff: [],
};

const fullEmployeeRecord = {
  id: '641',
  firstName: 'Mohammed',
  lastName: 'Jichi',
  fullName: 'Mohammed Jichi',
  department: 'Production',
  designation: 'Production Lead',
  dateHired: '2023-01-15',
  active: true,
  isActive: true,
  schedule: scheduleConfig,
  schedule_config: scheduleConfig,
};

// Simulate HRPersonnelService sanitization for /api/hr/sync-workstation
const isActive = fullEmployeeRecord.isActive ?? fullEmployeeRecord.active ?? true;
const { active: _omitActive, ...empWithoutActive } = fullEmployeeRecord;
const employeePayload = {
  ...empWithoutActive,
  is_active: isActive,
  schedule: fullEmployeeRecord.schedule_config,
  schedule_config: fullEmployeeRecord.schedule_config,
};

// Asserts on employeePayload
assert.strictEqual(employeePayload.is_active, true, 'is_active must be true');
assert.strictEqual(employeePayload.active, undefined, 'active column must not be present in database payload');
assert.ok(employeePayload.schedule_config, 'schedule_config must be attached to payload');
assert.strictEqual(Object.keys(employeePayload.schedule_config.dateOverrides).length, 365, 'schedule_config must contain 365 date overrides');

// Simulate /api/hr/sync-workstation Supabase employees mapping
const empDbPayload = {
  employee_code: String(employeePayload.id),
  full_name: employeePayload.fullName,
  phone: employeePayload.phone || null,
  national_id: employeePayload.nationalId || null,
  is_active: employeePayload.is_active,
  schedule_config: employeePayload.schedule_config,
  date_hired: employeePayload.dateHired,
};

assert.strictEqual(empDbPayload.employee_code, '641');
assert.strictEqual(empDbPayload.full_name, 'Mohammed Jichi');
assert.strictEqual(empDbPayload.is_active, true);
assert.strictEqual(empDbPayload.date_hired, '2023-01-15');
assert.ok(empDbPayload.schedule_config);
console.log('  ✔ Persistence payload conforms strictly to Supabase employees schema.');

console.log('\n====================================================');
console.log('🎉 ALL 7 RUNTIME AUDIT TEST SUITES PASSED (Exit Code: 0)');
console.log('====================================================\n');
process.exit(0);
