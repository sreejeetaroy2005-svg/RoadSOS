/**
 * ROADSOS — Database Layer
 * Uses better-sqlite3 (synchronous SQLite) for simplicity and reliability.
 * Creates all tables and seeds initial data on first run.
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || './data/roadsos.db';

// Ensure data directory exists
const dir = path.dirname(path.resolve(DB_PATH));
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new Database(path.resolve(DB_PATH));

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─── SCHEMA ────────────────────────────────────────────────────────────────

db.exec(`
  -- Emergency services (hospitals, ambulance, police, towing, etc.)
  CREATE TABLE IF NOT EXISTS services (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    category    TEXT    NOT NULL CHECK(category IN ('hospital','ambulance','police','towing','puncture','trauma')),
    name        TEXT    NOT NULL,
    phone       TEXT    NOT NULL,
    alt_phone   TEXT,
    area        TEXT    NOT NULL,
    city        TEXT    NOT NULL DEFAULT 'Delhi',
    state       TEXT    NOT NULL DEFAULT 'Delhi',
    lat         REAL,
    lng         REAL,
    status      TEXT    NOT NULL DEFAULT 'open' CHECK(status IN ('open','busy','closed')),
    rating      REAL    DEFAULT 4.0,
    icon        TEXT    DEFAULT '🏥',
    extra_info  TEXT,
    created_at  TEXT    DEFAULT (datetime('now')),
    updated_at  TEXT    DEFAULT (datetime('now'))
  );

  -- National emergency contacts (preloaded, read-only)
  CREATE TABLE IF NOT EXISTS emergency_contacts (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    name    TEXT NOT NULL,
    number  TEXT NOT NULL,
    icon    TEXT DEFAULT '📞',
    country TEXT NOT NULL DEFAULT 'India',
    type    TEXT DEFAULT 'general'
  );

  -- International emergency numbers
  CREATE TABLE IF NOT EXISTS international_numbers (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    country TEXT NOT NULL,
    flag    TEXT NOT NULL,
    number  TEXT NOT NULL,
    type    TEXT NOT NULL
  );

  -- User-saved personal contacts (per session/device via device_id)
  CREATE TABLE IF NOT EXISTS personal_contacts (
    id         TEXT    PRIMARY KEY,
    device_id  TEXT    NOT NULL,
    name       TEXT    NOT NULL,
    number     TEXT    NOT NULL,
    icon       TEXT    DEFAULT '👤',
    created_at TEXT    DEFAULT (datetime('now'))
  );

  -- SOS events log
  CREATE TABLE IF NOT EXISTS sos_events (
    id          TEXT    PRIMARY KEY,
    device_id   TEXT,
    lat         REAL,
    lng         REAL,
    address     TEXT,
    accuracy    REAL,
    status      TEXT    DEFAULT 'active' CHECK(status IN ('active','resolved','false_alarm')),
    created_at  TEXT    DEFAULT (datetime('now')),
    resolved_at TEXT
  );

  -- Incident reports
  CREATE TABLE IF NOT EXISTS incident_reports (
    id           TEXT    PRIMARY KEY,
    device_id    TEXT,
    acc_type     TEXT    NOT NULL,
    severity     TEXT    NOT NULL,
    location_txt TEXT    NOT NULL,
    lat          REAL,
    lng          REAL,
    people_count INTEGER DEFAULT 1,
    description  TEXT,
    contact_num  TEXT,
    status       TEXT    DEFAULT 'submitted' CHECK(status IN ('submitted','acknowledged','resolved')),
    created_at   TEXT    DEFAULT (datetime('now'))
  );

  -- First aid tips
  CREATE TABLE IF NOT EXISTS first_aid (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    icon     TEXT    NOT NULL,
    title    TEXT    NOT NULL,
    steps    TEXT    NOT NULL,  -- JSON array
    warning  TEXT
  );
`);

// ─── SEED DATA ──────────────────────────────────────────────────────────────

function seedIfEmpty(table, insertFn) {
  const count = db.prepare(`SELECT COUNT(*) as c FROM ${table}`).get().c;
  if (count === 0) insertFn();
}

// Seed services
seedIfEmpty('services', () => {
  const insert = db.prepare(`
    INSERT INTO services (category, name, phone, alt_phone, area, city, state, lat, lng, status, rating, icon, extra_info)
    VALUES (@category, @name, @phone, @alt_phone, @area, @city, @state, @lat, @lng, @status, @rating, @icon, @extra_info)
  `);
  const insertMany = db.transaction((rows) => rows.forEach(r => insert.run(r)));
  insertMany([
    // HOSPITALS
    { category:'hospital', name:'AIIMS Trauma Centre', phone:'011-26588500', alt_phone:'112', area:'Ansari Nagar', city:'Delhi', state:'Delhi', lat:28.5672, lng:77.2100, status:'open', rating:4.8, icon:'🏥', extra_info:'Level 1 Trauma, 24x7' },
    { category:'hospital', name:'Safdarjung Hospital', phone:'011-26707444', alt_phone:'108', area:'Ring Road', city:'Delhi', state:'Delhi', lat:28.5706, lng:77.2040, status:'open', rating:4.5, icon:'🏥', extra_info:'Govt Hospital, Free OPD' },
    { category:'hospital', name:'Apollo Hospital', phone:'1860-500-1066', alt_phone:'112', area:'Sarita Vihar', city:'Delhi', state:'Delhi', lat:28.5355, lng:77.2910, status:'open', rating:4.7, icon:'🏥', extra_info:'Private, 24x7 Emergency' },
    { category:'hospital', name:'Max Super Speciality', phone:'011-26515050', alt_phone:'108', area:'Saket', city:'Delhi', state:'Delhi', lat:28.5244, lng:77.2066, status:'busy', rating:4.6, icon:'🏥', extra_info:'Private, ICU Available' },
    { category:'hospital', name:'Fortis Hospital', phone:'1800-111-4567', alt_phone:'112', area:'Vasant Kunj', city:'Delhi', state:'Delhi', lat:28.5200, lng:77.1580, status:'open', rating:4.5, icon:'🏥', extra_info:'Private, Trauma Unit' },
    { category:'hospital', name:'RML Hospital', phone:'011-23404000', alt_phone:'108', area:'Connaught Place', city:'Delhi', state:'Delhi', lat:28.6328, lng:77.2197, status:'open', rating:4.3, icon:'🏥', extra_info:'Govt, Central Delhi' },
    { category:'hospital', name:'GTB Hospital', phone:'011-22582525', alt_phone:'108', area:'Shahdara', city:'Delhi', state:'Delhi', lat:28.6692, lng:77.3050, status:'open', rating:4.2, icon:'🏥', extra_info:'Govt, East Delhi' },
    { category:'hospital', name:'Medanta Hospital', phone:'0124-4141414', alt_phone:'108', area:'Sector 38', city:'Gurugram', state:'Haryana', lat:28.4595, lng:77.0266, status:'open', rating:4.8, icon:'🏥', extra_info:'Private, World Class' },
    { category:'hospital', name:'Artemis Hospital', phone:'0124-4511111', alt_phone:'112', area:'Sector 51', city:'Gurugram', state:'Haryana', lat:28.4200, lng:77.0700, status:'open', rating:4.6, icon:'🏥', extra_info:'Private, Trauma Centre' },
    { category:'hospital', name:'Manipal Hospital', phone:'080-25024444', alt_phone:'108', area:'HAL Airport Road', city:'Bengaluru', state:'Karnataka', lat:12.9592, lng:77.6474, status:'open', rating:4.7, icon:'🏥', extra_info:'Private, 24x7' },
    // AMBULANCE
    { category:'ambulance', name:'National Ambulance 108', phone:'108', alt_phone:'112', area:'Nationwide', city:'Delhi', state:'Delhi', lat:null, lng:null, status:'open', rating:4.4, icon:'🚑', extra_info:'Free Govt Service' },
    { category:'ambulance', name:'Ziqitza Ambulance', phone:'1800-419-1919', alt_phone:'108', area:'Delhi NCR', city:'Delhi', state:'Delhi', lat:28.6139, lng:77.2090, status:'open', rating:4.6, icon:'🚑', extra_info:'Private, ALS/BLS' },
    { category:'ambulance', name:'StanPlus Ambulance', phone:'1800-313-1414', alt_phone:'112', area:'Delhi NCR', city:'Delhi', state:'Delhi', lat:28.5355, lng:77.2910, status:'open', rating:4.7, icon:'🚑', extra_info:'Private, 15-min response' },
    { category:'ambulance', name:'GVK EMRI Ambulance', phone:'108', alt_phone:'112', area:'Delhi NCR', city:'Delhi', state:'Delhi', lat:28.6692, lng:77.3050, status:'busy', rating:4.3, icon:'🚑', extra_info:'Govt, Free Service' },
    { category:'ambulance', name:'Medanta Ambulance', phone:'0124-4141414', alt_phone:'108', area:'Gurugram', city:'Gurugram', state:'Haryana', lat:28.4595, lng:77.0266, status:'open', rating:4.8, icon:'🚑', extra_info:'Private, ICU on wheels' },
    // POLICE
    { category:'police', name:'Delhi Traffic Police', phone:'1095', alt_phone:'100', area:'All Delhi', city:'Delhi', state:'Delhi', lat:28.6139, lng:77.2090, status:'open', rating:4.2, icon:'👮', extra_info:'Traffic Control' },
    { category:'police', name:'Connaught Place PS', phone:'011-23341151', alt_phone:'100', area:'CP', city:'Delhi', state:'Delhi', lat:28.6328, lng:77.2197, status:'open', rating:4.1, icon:'👮', extra_info:'Central Delhi' },
    { category:'police', name:'Saket Police Station', phone:'011-29563100', alt_phone:'100', area:'Saket', city:'Delhi', state:'Delhi', lat:28.5244, lng:77.2066, status:'open', rating:4.0, icon:'👮', extra_info:'South Delhi' },
    { category:'police', name:'Highway Patrol NH-48', phone:'1033', alt_phone:'100', area:'NH-48', city:'Gurugram', state:'Haryana', lat:28.4595, lng:77.0266, status:'open', rating:4.3, icon:'👮', extra_info:'Highway Patrol' },
    { category:'police', name:'PCR Van Control Room', phone:'100', alt_phone:'112', area:'Delhi', city:'Delhi', state:'Delhi', lat:28.6139, lng:77.2090, status:'open', rating:4.5, icon:'👮', extra_info:'24x7 PCR' },
    // TOWING
    { category:'towing', name:'Delhi Towing Services', phone:'9810012345', alt_phone:null, area:'Delhi NCR', city:'Delhi', state:'Delhi', lat:28.6139, lng:77.2090, status:'open', rating:4.2, icon:'🚗', extra_info:'24x7, All vehicles' },
    { category:'towing', name:'Rapid Tow & Recovery', phone:'9899123456', alt_phone:null, area:'South Delhi', city:'Delhi', state:'Delhi', lat:28.5244, lng:77.2066, status:'open', rating:4.4, icon:'🚗', extra_info:'24x7, Heavy vehicles' },
    { category:'towing', name:'NH Towing Services', phone:'9711234567', alt_phone:null, area:'NH-48', city:'Gurugram', state:'Haryana', lat:28.4595, lng:77.0266, status:'busy', rating:4.1, icon:'🚗', extra_info:'Highway specialist' },
    { category:'towing', name:'QuickTow Delhi', phone:'9871234567', alt_phone:null, area:'West Delhi', city:'Delhi', state:'Delhi', lat:28.6692, lng:77.1050, status:'open', rating:4.3, icon:'🚗', extra_info:'24x7, Flatbed' },
    { category:'towing', name:'AAI Road Assist', phone:'1800-200-1111', alt_phone:null, area:'Delhi NCR', city:'Delhi', state:'Delhi', lat:28.6139, lng:77.2090, status:'open', rating:4.5, icon:'🚗', extra_info:'Insurance tie-up' },
    // PUNCTURE
    { category:'puncture', name:'Sharma Tyre Works', phone:'9810098765', alt_phone:null, area:'Lajpat Nagar', city:'Delhi', state:'Delhi', lat:28.5672, lng:77.2430, status:'open', rating:4.0, icon:'🔧', extra_info:'All tyre brands' },
    { category:'puncture', name:'24x7 Tyre Repair', phone:'9899876543', alt_phone:null, area:'Saket', city:'Delhi', state:'Delhi', lat:28.5244, lng:77.2066, status:'open', rating:4.2, icon:'🔧', extra_info:'Mobile service' },
    { category:'puncture', name:'Highway Tyre Centre', phone:'9711876543', alt_phone:null, area:'NH-48', city:'Gurugram', state:'Haryana', lat:28.4595, lng:77.0266, status:'busy', rating:3.9, icon:'🔧', extra_info:'Highway location' },
    { category:'puncture', name:'MRF Tyre Service', phone:'1800-419-0909', alt_phone:null, area:'Vasant Kunj', city:'Delhi', state:'Delhi', lat:28.5200, lng:77.1580, status:'open', rating:4.4, icon:'🔧', extra_info:'Authorised MRF' },
    // TRAUMA
    { category:'trauma', name:'AIIMS Trauma Centre', phone:'011-26588700', alt_phone:'112', area:'Ansari Nagar', city:'Delhi', state:'Delhi', lat:28.5672, lng:77.2100, status:'open', rating:4.9, icon:'🩺', extra_info:'Level 1 Trauma' },
    { category:'trauma', name:'GTB Hospital Trauma', phone:'011-22582525', alt_phone:'108', area:'Shahdara', city:'Delhi', state:'Delhi', lat:28.6692, lng:77.3050, status:'open', rating:4.4, icon:'🩺', extra_info:'Level 2 Trauma' },
    { category:'trauma', name:'Safdarjung Trauma', phone:'011-26707000', alt_phone:'108', area:'Ring Road', city:'Delhi', state:'Delhi', lat:28.5706, lng:77.2040, status:'busy', rating:4.6, icon:'🩺', extra_info:'Level 1 Trauma' },
    { category:'trauma', name:'Lok Nayak Hospital', phone:'011-23232400', alt_phone:'112', area:'Daryaganj', city:'Delhi', state:'Delhi', lat:28.6400, lng:77.2400, status:'open', rating:4.3, icon:'🩺', extra_info:'Level 2 Trauma' },
    { category:'trauma', name:'Medanta Trauma', phone:'0124-4141414', alt_phone:'108', area:'Sector 38', city:'Gurugram', state:'Haryana', lat:28.4595, lng:77.0266, status:'open', rating:4.8, icon:'🩺', extra_info:'Level 1 Trauma' },
  ]);
});

// Seed emergency contacts
seedIfEmpty('emergency_contacts', () => {
  const insert = db.prepare(`INSERT INTO emergency_contacts (name, number, icon, country, type) VALUES (?,?,?,?,?)`);
  const insertMany = db.transaction((rows) => rows.forEach(r => insert.run(...r)));
  insertMany([
    ['National Emergency', '112', '🆘', 'India', 'general'],
    ['Ambulance', '108', '🚑', 'India', 'medical'],
    ['Police', '100', '👮', 'India', 'police'],
    ['Fire Brigade', '101', '🔥', 'India', 'fire'],
    ['Traffic Police', '1095', '🚦', 'India', 'traffic'],
    ['Highway Helpline', '1033', '🛣️', 'India', 'highway'],
    ['Women Helpline', '1091', '👩', 'India', 'women'],
    ['Child Helpline', '1098', '👶', 'India', 'child'],
    ['Disaster Management', '1078', '⚠️', 'India', 'disaster'],
    ['Blood Bank', '1910', '🩸', 'India', 'medical'],
  ]);
});

// Seed international numbers
seedIfEmpty('international_numbers', () => {
  const insert = db.prepare(`INSERT INTO international_numbers (country, flag, number, type) VALUES (?,?,?,?)`);
  const insertMany = db.transaction((rows) => rows.forEach(r => insert.run(...r)));
  insertMany([
    ['India', '🇮🇳', '112', 'All Emergency'],
    ['USA', '🇺🇸', '911', 'All Emergency'],
    ['UK', '🇬🇧', '999', 'All Emergency'],
    ['Australia', '🇦🇺', '000', 'All Emergency'],
    ['Canada', '🇨🇦', '911', 'All Emergency'],
    ['Germany', '🇩🇪', '112', 'All Emergency'],
    ['France', '🇫🇷', '15/17', 'Medical/Police'],
    ['Japan', '🇯🇵', '119', 'Ambulance'],
    ['China', '🇨🇳', '120', 'Ambulance'],
    ['Brazil', '🇧🇷', '192', 'Ambulance'],
    ['South Africa', '🇿🇦', '10177', 'Ambulance'],
    ['UAE', '🇦🇪', '998', 'Ambulance'],
    ['Singapore', '🇸🇬', '995', 'Ambulance'],
    ['New Zealand', '🇳🇿', '111', 'All Emergency'],
    ['Italy', '🇮🇹', '118', 'Ambulance'],
    ['Spain', '🇪🇸', '112', 'All Emergency'],
    ['Russia', '🇷🇺', '103', 'Ambulance'],
    ['Malaysia', '🇲🇾', '999', 'All Emergency'],
  ]);
});

// Seed first aid tips
seedIfEmpty('first_aid', () => {
  const insert = db.prepare(`INSERT INTO first_aid (icon, title, steps, warning) VALUES (?,?,?,?)`);
  const insertMany = db.transaction((rows) => rows.forEach(r => insert.run(...r)));
  insertMany([
    ['🩸', 'Controlling Bleeding',
      JSON.stringify(['Apply firm, direct pressure with a clean cloth or bandage','Do NOT remove the cloth — add more on top if soaked','Elevate the injured limb above heart level if possible','Maintain pressure for at least 10–15 minutes','For severe limb bleeding, apply tourniquet 2–3 inches above wound']),
      'Do NOT apply tourniquet on neck, chest, or abdomen'],
    ['🫁', 'CPR (Cardiopulmonary Resuscitation)',
      JSON.stringify(['Check scene safety, then check victim responsiveness','Call 112 or ask someone to call immediately','Tilt head back, lift chin, check for breathing (10 seconds)','Give 30 chest compressions — hard and fast (100–120/min)','Give 2 rescue breaths (if trained)','Continue 30:2 cycle until help arrives']),
      'Only give rescue breaths if trained. Hands-only CPR is effective'],
    ['🦴', 'Suspected Spinal Injury',
      JSON.stringify(['DO NOT move the victim unless in immediate danger','Keep head, neck, and spine aligned at all times','If must move, use log-roll technique with multiple helpers','Support head and neck manually until EMS arrives','Keep victim warm and calm']),
      'Moving a spinal injury victim incorrectly can cause permanent paralysis'],
    ['🔥', 'Burns from Accident',
      JSON.stringify(['Remove victim from heat source safely','Cool burn with cool (not cold/ice) running water for 20 minutes','Remove jewellery/clothing near burn (if not stuck)','Cover loosely with clean non-fluffy material','Do NOT apply butter, toothpaste, or ice']),
      'Do NOT burst blisters. Seek medical help for burns larger than palm size'],
    ['😵', 'Unconscious Victim',
      JSON.stringify(['Check for response — tap shoulders, shout','Call 112 immediately','Open airway — tilt head, lift chin','Check breathing for 10 seconds','If breathing: place in recovery position (on side)','If not breathing: start CPR']),
      'Never give food or water to an unconscious person'],
    ['🦵', 'Fractures & Broken Bones',
      JSON.stringify(['Immobilise the injured area — do not try to straighten','Support above and below the fracture site','Apply improvised splint (stick, rolled newspaper)','Apply ice pack wrapped in cloth to reduce swelling','Elevate if possible and keep victim still']),
      'Open fractures (bone visible) are medical emergencies — call 108 immediately'],
  ]);
});

module.exports = db;
