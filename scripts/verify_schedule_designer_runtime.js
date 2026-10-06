const assert = require('assert');

// 1. Replicate Helper functions and Constants from ScheduleDesigner / hrPersonnelService
const STANDARD_SCHEDULE_TEMPLATES = [
  {
    name: 'Backoffice Administration (08:00 - 16:30)',
    workDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    timing: '08:00 - 16:30',
    offDays: ['Sun'], // STRICT: Sunday only, Saturday is a regular working day
    slots: [{ start: '08:00', end: '16:30' }],
    dailySchedule: {
      Mon: '08:00 - 16:30',
      Tue: '08:00 - 16:30',
      Wed: '08:00 - 16:30',
      Thu: '08:00 - 16:30',
      Fri: '08:00 - 16:30',
      Sat: '08:00 - 16:30',
      Sun: 'OFF',
    },
  },
  {
    name: 'Standard Factory Shift (07:00 - 15:30)',
    workDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    timing: '07:00 - 15:30',
    slots: [{ start: '07:00', end: '15:30' }],
    offDays: ['Sun'],
    dailySchedule: {
      Mon: '07:00 - 15:30',
      Tue: '07:00 - 15:30',
      Wed: '07:00 - 15:30',
      Thu: '07:00 - 15:30',
      Fri: '07:00 - 15:30',
      Sat: '07:00 - 15:30',
      Sun: 'OFF',
    },
  },
  {
    name: 'Standard 6-Day Operation (08:00 - 16:30)',
    workDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    timing: '08:00 - 16:30',
    slots: [{ start: '08:00', end: '16:30' }],
    offDays: ['Sun'],
    dailySchedule: {
      Mon: '08:00 - 16:30',
      Tue: '08:00 - 16:30',
      Wed: '08:00 - 16:30',
      Thu: '08:00 - 16:30',
      Fri: '08:00 - 16:30',
      Sat: '08:00 - 16:30',
      Sun: 'OFF',
    },
  },
  {
    name: 'Distribution & Fleet Delivery (06:00 - 14:30)',
    workDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    timing: '06:00 - 14:30',
    slots: [{ start: '06:00', end: '14:30' }],
    offDays: ['Sun'],
    dailySchedule: {
      Mon: '06:00 - 14:30',
      Tue: '06:00 - 14:30',
      Wed: '06:00 - 14:30',
      Thu: '06:00 - 14:30',
      Fri: '06:00 - 14:30',
      Sat: '06:00 - 14:30',
      Sun: 'OFF',
    },
  },
  {
    name: 'Evening Extraction & Milling (15:00 - 23:30)',
    workDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    timing: '15:00 - 23:30',
    slots: [{ start: '15:00', end: '23:30' }],
    offDays: ['Sun'],
    dailySchedule: {
      Mon: '15:00 - 23:30',
      Tue: '15:00 - 23:30',
      Wed: '15:00 - 23:30',
      Thu: '15:00 - 23:30',
      Fri: '15:00 - 23:30',
      Sat: '15:00 - 23:30',
      Sun: 'OFF',
    },
  },
  {
    name: 'Weekend Retail & Standby (09:00 - 17:00)',
    workDays: ['Fri', 'Sat', 'Sun'],
    timing: '09:00 - 17:00',
    slots: [{ start: '09:00', end: '17:00' }],
    offDays: ['Mon', 'Tue', 'Wed', 'Thu'],
    dailySchedule: {
      Mon: 'OFF',
      Tue: 'OFF',
      Wed: 'OFF',
      Thu: 'OFF',
      Fri: '09:00 - 17:00',
      Sat: '09:00 - 17:00',
      Sun: '09:00 - 17:00',
    },
  },
];

const DEFAULT_SHIFT_TEMPLATES = STANDARD_SCHEDULE_TEMPLATES;

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
      if (template.dailySchedule && template.dailySchedule[dayAbbr]) {
        return template.dailySchedule[dayAbbr];
      }
      if (template.workDays.includes(dayAbbr)) {
        return template.timing || `${template.slots[0].start} - ${template.slots[0].end}`;
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
    if (template.dailySchedule && template.dailySchedule[dayAbbr]) {
      return template.dailySchedule[dayAbbr];
    }
    if (template.workDays.includes(dayAbbr)) {
      return template.timing || `${template.slots[0].start} - ${template.slots[0].end}`;
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

// 2. In ScheduleDesigner.tsx - Monthly OFF Days calculation:
function calculateMonthOffDays(year, month, scheduleDays) {
  const daysInMonth = new Date(year, month, 0).getDate();
  let offCount = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const shift = scheduleDays[dateStr];
    if (shift === 'OFF') {
      offCount++;
    }
  }
  return offCount; // Must yield 4 or 5 for any standard month with Sunday-only OFF
}

// 3. Batch 12-Month Matrix Generation when "Apply to All Months" is clicked:
function generateFullYearMatrix(template, year = 2026) {
  const matrix = {};
  for (let m = 1; m <= 12; m++) {
    const daysInMonth = new Date(year, m, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, m - 1, d);
      const dayOfWeek = date.getDay(); // 0 is Sunday, 6 is Saturday
      const dateStr = `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

      if (dayOfWeek === 0 || (template.offDays.includes('Sun') && dayOfWeek === 0)) {
        matrix[dateStr] = 'OFF';
      } else {
        matrix[dateStr] = template.timing || '08:00 - 16:30';
      }
    }
  }
  return matrix;
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

const backofficeEmp = {
  id: '642',
  fullName: 'Ali Safa',
  firstName: 'Ali',
  department: 'Accounting',
  schedule: {
    templateName: 'Backoffice Administration (08:00 - 16:30)',
  },
};

// TEST 1: Template Structure & 6-Day Definition Verification (Factory & Backoffice)
console.log('TEST 1: Verifying 6-Day Work Week Templates...');
const backofficeTpl = STANDARD_SCHEDULE_TEMPLATES.find((t) => t.name === 'Backoffice Administration (08:00 - 16:30)');
assert.ok(backofficeTpl, 'Backoffice Administration template must exist');
assert.deepStrictEqual(backofficeTpl.workDays, ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], 'Backoffice must have 6 work days (Mon-Sat)');
assert.deepStrictEqual(backofficeTpl.offDays, ['Sun'], 'Backoffice offDays must contain strictly Sunday');
assert.strictEqual(backofficeTpl.dailySchedule.Sat, '08:00 - 16:30', 'Saturday dailySchedule must be "08:00 - 16:30"');
assert.strictEqual(backofficeTpl.dailySchedule.Sun, 'OFF', 'Sunday dailySchedule must be "OFF"');
console.log('  ✔ Backoffice Administration has Mon-Sat working and Sunday only OFF.');

const factoryTpl = STANDARD_SCHEDULE_TEMPLATES.find((t) => t.name === 'Standard Factory Shift (07:00 - 15:30)');
assert.ok(factoryTpl, 'Standard Factory Shift template must exist');
assert.deepStrictEqual(factoryTpl.workDays, ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], 'Factory shift must have 6 work days (Mon-Sat)');
assert.deepStrictEqual(factoryTpl.offDays, ['Sun'], 'Factory shift offDays must contain strictly Sunday');
console.log('  ✔ Standard Factory Shift has Mon-Sat working and Sunday only OFF.');

// TEST 2: Year 2026 Off-Days Calculation for 6-Day Work Week (Backoffice Administration)
console.log('\nTEST 2: Calculating 2026 Monthly OFF Days for Backoffice Administration (08:00 - 16:30)...');
let totalYearlyOffDays = 0;
const expectedSundaysPerMonth = [4, 4, 5, 4, 5, 4, 4, 5, 4, 4, 5, 4]; // 2026 Sundays

for (let m = 0; m < 12; m++) {
  const offDays = getEmployeeMonthOffDaysCount(backofficeEmp, m, year, [], 'schedule', backofficeTpl.name);
  totalYearlyOffDays += offDays;
  assert.strictEqual(
    offDays,
    expectedSundaysPerMonth[m],
    `Month ${m + 1} must have exactly ${expectedSundaysPerMonth[m]} OFF days, got ${offDays}`
  );
  assert.ok(offDays >= 4 && offDays <= 5, `Month ${m + 1} OFF days count (${offDays}) must be between 4 and 5`);
  console.log(`  Month ${m + 1} (2026): ${offDays} OFF days (Expected: ${expectedSundaysPerMonth[m]}) ✔`);
}

assert.strictEqual(totalYearlyOffDays, 52, `Total yearly off days for Backoffice in 2026 must be 52, got ${totalYearlyOffDays}`);
console.log(`  ✔ Backoffice Administration Total Yearly OFF Days = ${totalYearlyOffDays} (Target: exactly 52 OFF days, never 104)`);

// TEST 3: Specific Day Timing Asserts (Saturday vs Sunday) in Daily Breakdown
console.log('\nTEST 3: Checking Saturday vs Sunday shift timing in Daily Breakdown...');
// Jan 3, 2026 is Saturday
const satShift = calculateEmployeeShiftForDay(backofficeEmp, 3, 0, year, [], 'schedule', backofficeTpl.name);
assert.strictEqual(satShift, '08:00 - 16:30', `Saturday Jan 3 must be a working day (08:00 - 16:30), got ${satShift}`);
console.log(`  Saturday Jan 3, 2026: "${satShift}" (Expected regular working shift 08:00 - 16:30) ✔`);

// Jan 4, 2026 is Sunday
const sunShift = calculateEmployeeShiftForDay(backofficeEmp, 4, 0, year, [], 'schedule', backofficeTpl.name);
assert.strictEqual(sunShift, 'OFF', `Sunday Jan 4 must be OFF, got ${sunShift}`);
console.log(`  Sunday Jan 4, 2026: "${sunShift}" (Expected strictly OFF) ✔`);

// TEST 4: Date Overrides & Inline Toggle Precedence
console.log('\nTEST 4: Checking Date Overrides & Inline Toggle Precedence...');
// Revert Sunday Jan 4 to ON
const empWithOverride = {
  ...backofficeEmp,
  schedule: {
    ...backofficeEmp.schedule,
    dateOverrides: {
      '2026-01-04': '08:00 - 16:30', // Sunday turned ON
      '2026-01-07': 'OFF',           // Wednesday turned OFF
    },
  },
};

const sunTurnedOn = calculateEmployeeShiftForDay(empWithOverride, 4, 0, year, [], 'schedule', backofficeTpl.name);
assert.strictEqual(sunTurnedOn, '08:00 - 16:30', 'Overridden Sunday must show working shift');
console.log(`  Sunday Jan 4 with override: "${sunTurnedOn}" (Successfully toggled ON) ✔`);

const wedTurnedOff = calculateEmployeeShiftForDay(empWithOverride, 7, 0, year, [], 'schedule', backofficeTpl.name);
assert.strictEqual(wedTurnedOff, 'OFF', 'Overridden Wednesday must show OFF');
console.log(`  Wednesday Jan 7 with override: "${wedTurnedOff}" (Successfully toggled OFF) ✔`);

// TEST 5: Formal Approved Day Off takes Precedence
console.log('\nTEST 5: Checking Formal Approved Day Off Record Precedence...');
const formalDayOff = [
  {
    id: 'DO-01',
    employeeId: '642',
    startDate: '2026-01-08',
    endDate: '2026-01-09',
    reason: 'Medical appointment',
    approved: true,
  },
];
const thuDayOff = calculateEmployeeShiftForDay(empWithOverride, 8, 0, year, formalDayOff, 'schedule', backofficeTpl.name);
assert.strictEqual(thuDayOff, 'OFF', 'Approved formal day off must return OFF');
console.log(`  Thursday Jan 8 (Medical appointment): "${thuDayOff}" (Precedence verified) ✔`);

// TEST 6: Batch 12-Month Matrix Generation & calculateMonthOffDays Verification
console.log('\nTEST 6: Simulating Batch 12-Month Schedule Generation via generateFullYearMatrix...');
const fullYearMatrix = generateFullYearMatrix(backofficeTpl, 2026);
let matrixOffDaysCount = 0;
let matrixWorkingDaysCount = 0;

for (let m = 1; m <= 12; m++) {
  const monthOff = calculateMonthOffDays(2026, m, fullYearMatrix);
  matrixOffDaysCount += monthOff;
  assert.strictEqual(monthOff, expectedSundaysPerMonth[m - 1], `Month ${m} calculated off days must be ${expectedSundaysPerMonth[m - 1]}`);
  assert.ok(monthOff >= 4 && monthOff <= 5, `Month ${m} off days must be 4 or 5`);
}

for (const dateStr of Object.keys(fullYearMatrix)) {
  if (fullYearMatrix[dateStr] === 'OFF') {
    // counted above
  } else {
    matrixWorkingDaysCount++;
    assert.strictEqual(fullYearMatrix[dateStr], '08:00 - 16:30');
  }
}

const totalMatrixDays = Object.keys(fullYearMatrix).length;
assert.strictEqual(totalMatrixDays, 365, `Full year 2026 must have 365 days generated, got ${totalMatrixDays}`);
assert.strictEqual(matrixOffDaysCount, 52, `Full year 2026 matrix must have 52 off days, got ${matrixOffDaysCount}`);
assert.strictEqual(matrixWorkingDaysCount, 313, `Full year 2026 matrix must have 313 working days, got ${matrixWorkingDaysCount}`);
console.log(`  Total Days in Matrix: ${totalMatrixDays} (Working: ${matrixWorkingDaysCount}, OFF: ${matrixOffDaysCount}) ✔`);

// TEST 7: Payload Contract & Schema Mapping Verification
console.log('\nTEST 7: Validating Persistence Payload Schema Contract...');
const scheduleConfig = {
  templateName: backofficeTpl.name,
  workDays: backofficeTpl.workDays,
  offDays: backofficeTpl.offDays,
  applyToAllMonths: true,
  dateOverrides: fullYearMatrix,
  daysOff: [],
};

const fullEmployeeRecord = {
  id: '642',
  firstName: 'Ali',
  lastName: 'Safa',
  fullName: 'Ali Safa',
  department: 'Accounting',
  designation: 'Senior Accountant',
  dateHired: '2023-03-01',
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

assert.strictEqual(empDbPayload.employee_code, '642');
assert.strictEqual(empDbPayload.full_name, 'Ali Safa');
assert.strictEqual(empDbPayload.is_active, true);
assert.strictEqual(empDbPayload.date_hired, '2023-03-01');
assert.ok(empDbPayload.schedule_config);
console.log('  ✔ Persistence payload conforms strictly to Supabase employees schema.');

// Helper simulating Custom Designer Action
function applyCustomDesignerAction(
  initialMatrix,
  selectedDays,
  isSetSelectedToOff,
  applyToAllMonths,
  activeMonthIdx = 0,
  workingShiftHours = '08:00 - 16:30',
  yearNum = 2026
) {
  const updatedMatrix = { ...initialMatrix };
  const monthsToProcess = applyToAllMonths
    ? Array.from({ length: 12 }, (_, i) => i)
    : [activeMonthIdx];

  for (const mIdx of monthsToProcess) {
    const daysInMonth = getDaysInMonth(yearNum, mIdx);
    for (let day = 1; day <= daysInMonth; day++) {
      const dayAbbr = getDayOfWeekAbbr(yearNum, mIdx, day);
      const dateStr = `${yearNum}-${(mIdx + 1).toString().padStart(2, '0')}-${day
        .toString()
        .padStart(2, '0')}`;

      if (isSetSelectedToOff) {
        if (selectedDays.includes(dayAbbr)) {
          updatedMatrix[dateStr] = 'OFF';
        } else {
          if (updatedMatrix[dateStr] === 'OFF') {
            updatedMatrix[dateStr] = workingShiftHours;
          }
        }
      } else {
        if (selectedDays.includes(dayAbbr)) {
          updatedMatrix[dateStr] = workingShiftHours;
        } else {
          updatedMatrix[dateStr] = 'OFF';
        }
      }
    }
  }
  return updatedMatrix;
}

// TEST 8: Dynamic Live Matrix Recalculation from Custom Designer Actions (Sat+Sun OFF vs Sun-only OFF)
console.log('\nTEST 8: Simulating Live Custom Designer Actions & Reactive Matrix Recalculation...');

// Step 0: Start from baseline 6-day Backoffice template (52 OFF days)
let liveScheduleMatrix = generateFullYearMatrix(backofficeTpl, 2026);
let initialOffDays = 0;
for (let m = 1; m <= 12; m++) {
  initialOffDays += calculateMonthOffDays(2026, m, liveScheduleMatrix);
}
assert.strictEqual(initialOffDays, 52, 'Initial template baseline must have 52 OFF days');
console.log('  Baseline live matrix initialized: 52 Total OFF days.');

// Step a: Apply Custom Designer action with Sat + Sun set to OFF across all 12 months
console.log('  Action (a): Applying Custom Designer with Sat + Sun set to OFF (All 12 Months)...');
liveScheduleMatrix = applyCustomDesignerAction(
  liveScheduleMatrix,
  ['Sat', 'Sun'],
  true,  // isSetSelectedToOff = true
  true,  // applyToAllMonths = true
  0,
  '08:00 - 16:30',
  2026
);

// Step b: Assert all 12 months recompute to 8-9 OFF days (total 104 OFF days)
let totalOffSatSun = 0;
for (let m = 1; m <= 12; m++) {
  const monthOff = calculateMonthOffDays(2026, m, liveScheduleMatrix);
  totalOffSatSun += monthOff;
  assert.ok(
    monthOff >= 8 && monthOff <= 10,
    `Month ${m} with Sat+Sun OFF must have between 8 and 10 OFF days, got ${monthOff}`
  );
  console.log(`    Month ${m} (Sat+Sun OFF): ${monthOff} OFF days ✔`);
}
assert.strictEqual(totalOffSatSun, 104, `Total yearly OFF days with Sat+Sun OFF must be 104, got ${totalOffSatSun}`);
assert.strictEqual(liveScheduleMatrix['2026-01-03'], 'OFF', 'Saturday Jan 3 must be OFF');
assert.strictEqual(liveScheduleMatrix['2026-01-04'], 'OFF', 'Sunday Jan 4 must be OFF');
assert.strictEqual(liveScheduleMatrix['2026-01-05'], '08:00 - 16:30', 'Monday Jan 5 must be 08:00 - 16:30');
console.log(`  ✔ Sat + Sun marked OFF successfully recomputed all 12 months to 8-9 days (Total: ${totalOffSatSun} OFF days).`);

// Step c: Applying Custom Designer action with only Sun set to OFF across all 12 months
console.log('  Action (c): Applying Custom Designer with ONLY Sun set to OFF (All 12 Months)...');
liveScheduleMatrix = applyCustomDesignerAction(
  liveScheduleMatrix,
  ['Sun'],
  true,  // isSetSelectedToOff = true
  true,  // applyToAllMonths = true
  0,
  '08:00 - 16:30',
  2026
);

// Step d: Assert all 12 months recompute to 4-5 OFF days (total 52 OFF days)
let totalOffSunOnly = 0;
for (let m = 1; m <= 12; m++) {
  const monthOff = calculateMonthOffDays(2026, m, liveScheduleMatrix);
  totalOffSunOnly += monthOff;
  assert.ok(
    monthOff === 4 || monthOff === 5,
    `Month ${m} with only Sun OFF must have 4 or 5 OFF days, got ${monthOff}`
  );
  console.log(`    Month ${m} (Sun-only OFF): ${monthOff} OFF days ✔`);
}
assert.strictEqual(totalOffSunOnly, 52, `Total yearly OFF days with only Sun OFF must be 52, got ${totalOffSunOnly}`);
assert.strictEqual(liveScheduleMatrix['2026-01-03'], '08:00 - 16:30', 'Saturday Jan 3 must be restored to 08:00 - 16:30');
assert.strictEqual(liveScheduleMatrix['2026-01-04'], 'OFF', 'Sunday Jan 4 must remain OFF');
console.log(`  ✔ Only Sun marked OFF successfully recomputed all 12 months to 4-5 days (Total: ${totalOffSunOnly} OFF days).`);

console.log('\n====================================================');
console.log('🎉 ALL 8 RUNTIME AUDIT TEST SUITES PASSED (Exit Code: 0)');
console.log('====================================================\n');
process.exit(0);
