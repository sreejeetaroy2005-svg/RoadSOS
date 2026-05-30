const db = require('better-sqlite3')('./data/roadsos.db');

console.log('\n========== DATABASE: roadsos.db ==========\n');

// All tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('TABLES:', tables.map(t => t.name).join(', '));

// Row counts
console.log('\n--- ROW COUNTS ---');
tables.forEach(({ name }) => {
  const { c } = db.prepare(`SELECT COUNT(*) as c FROM ${name}`).get();
  console.log(`  ${name.padEnd(25)} ${c} rows`);
});

// Sample services
console.log('\n--- SAMPLE SERVICES (first 5) ---');
db.prepare('SELECT id, category, name, phone, city, status, rating FROM services LIMIT 5').all()
  .forEach(r => console.log(' ', JSON.stringify(r)));

// SOS events
console.log('\n--- SOS EVENTS (logged when SOS button tapped) ---');
const sos = db.prepare('SELECT id, device_id, lat, lng, address, status, created_at FROM sos_events').all();
if (sos.length === 0) console.log('  (none yet — tap SOS button in the app)');
else sos.forEach(r => console.log(' ', JSON.stringify(r)));

// Incident reports
console.log('\n--- INCIDENT REPORTS ---');
const reports = db.prepare('SELECT id, acc_type, severity, location_txt, status, created_at FROM incident_reports').all();
if (reports.length === 0) console.log('  (none yet — submit a report in the app)');
else reports.forEach(r => console.log(' ', JSON.stringify(r)));

// Personal contacts
console.log('\n--- PERSONAL CONTACTS ---');
const contacts = db.prepare('SELECT id, device_id, name, number, created_at FROM personal_contacts').all();
if (contacts.length === 0) console.log('  (none yet — add a contact in the app)');
else contacts.forEach(r => console.log(' ', JSON.stringify(r)));

console.log('\n==========================================\n');
