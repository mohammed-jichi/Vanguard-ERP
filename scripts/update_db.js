const fs = require('fs');

const dbPath = 'data/vanguard_accounting_db.json';
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

if (db.employees) {
  db.employees.forEach((emp) => {
    emp.branch = '1300-01 - Southern Olive and Oil Products - Main';
    if (emp.posCredentials) {
      emp.posCredentials.branch = '1300-01 - Southern Olive and Oil Products - Main';
    }
    if (emp.id === '641') {
      emp.firstName = 'Jichi';
      emp.lastName = 'Mohammed';
      emp.fullName = 'Jichi Mohammed';
      emp.email = 'mohammed.jichi@gmail.com';
      if (emp.posCredentials) {
        emp.posCredentials.nickName = 'Jichi';
        emp.posCredentials.emailSignature = 'Jichi Mohammed - General Operations Manager\nSouthern Olive and Oil Products S.A.R.L.';
      }
    }
  });
}

if (db.users) {
  db.users.forEach((u) => {
    u.branch = '1300-01 - Southern Olive and Oil Products - Main';
    u.facility_id = '1300-01';
    if (u.id === 'u-641' || u.user_code === '641') {
      u.name = 'Jichi Mohammed';
      u.first_name = 'Jichi';
      u.last_name = 'Mohammed';
      u.email = 'mohammed.jichi@gmail.com';
    }
  });
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log('Successfully updated vanguard_accounting_db.json');
