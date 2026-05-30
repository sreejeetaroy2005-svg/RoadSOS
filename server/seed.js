/**
 * ROADSOS — Firebase Firestore Seed Script
 * Run once: node server/seed.js
 * Seeds all collections: services, emergencyContacts, internationalNumbers, firstAid
 */

require('dotenv').config();
const {
  db, collection, doc, setDoc, getDocs, serverTimestamp
} = require('./firebase');

// ── SERVICES ────────────────────────────────────────────────────────────────
const SERVICES = [
  // HOSPITALS
  { category:'hospital', name:'AIIMS Trauma Centre',    phone:'011-26588500', altPhone:'112', area:'Ansari Nagar',    city:'Delhi',    state:'Delhi',   lat:28.5672, lng:77.2100, status:'open', rating:4.8, icon:'🏥', extraInfo:'Level 1 Trauma, 24x7' },
  { category:'hospital', name:'Safdarjung Hospital',    phone:'011-26707444', altPhone:'108', area:'Ring Road',       city:'Delhi',    state:'Delhi',   lat:28.5706, lng:77.2040, status:'open', rating:4.5, icon:'🏥', extraInfo:'Govt Hospital, Free OPD' },
  { category:'hospital', name:'Apollo Hospital',        phone:'1860-500-1066',altPhone:'112', area:'Sarita Vihar',   city:'Delhi',    state:'Delhi',   lat:28.5355, lng:77.2910, status:'open', rating:4.7, icon:'🏥', extraInfo:'Private, 24x7 Emergency' },
  { category:'hospital', name:'Max Super Speciality',   phone:'011-26515050', altPhone:'108', area:'Saket',          city:'Delhi',    state:'Delhi',   lat:28.5244, lng:77.2066, status:'busy', rating:4.6, icon:'🏥', extraInfo:'Private, ICU Available' },
  { category:'hospital', name:'Fortis Hospital',        phone:'1800-111-4567',altPhone:'112', area:'Vasant Kunj',    city:'Delhi',    state:'Delhi',   lat:28.5200, lng:77.1580, status:'open', rating:4.5, icon:'🏥', extraInfo:'Private, Trauma Unit' },
  { category:'hospital', name:'RML Hospital',           phone:'011-23404000', altPhone:'108', area:'Connaught Place', city:'Delhi',   state:'Delhi',   lat:28.6328, lng:77.2197, status:'open', rating:4.3, icon:'🏥', extraInfo:'Govt, Central Delhi' },
  { category:'hospital', name:'GTB Hospital',           phone:'011-22582525', altPhone:'108', area:'Shahdara',       city:'Delhi',    state:'Delhi',   lat:28.6692, lng:77.3050, status:'open', rating:4.2, icon:'🏥', extraInfo:'Govt, East Delhi' },
  { category:'hospital', name:'Medanta Hospital',       phone:'0124-4141414', altPhone:'108', area:'Sector 38',      city:'Gurugram', state:'Haryana', lat:28.4595, lng:77.0266, status:'open', rating:4.8, icon:'🏥', extraInfo:'Private, World Class' },
  { category:'hospital', name:'Artemis Hospital',       phone:'0124-4511111', altPhone:'112', area:'Sector 51',      city:'Gurugram', state:'Haryana', lat:28.4200, lng:77.0700, status:'open', rating:4.6, icon:'🏥', extraInfo:'Private, Trauma Centre' },
  { category:'hospital', name:'Manipal Hospital',       phone:'080-25024444', altPhone:'108', area:'HAL Airport Rd', city:'Bengaluru',state:'Karnataka',lat:12.9592,lng:77.6474, status:'open', rating:4.7, icon:'🏥', extraInfo:'Private, 24x7' },
  // AMBULANCE
  { category:'ambulance', name:'National Ambulance 108',phone:'108',          altPhone:'112', area:'Nationwide',     city:'Delhi',    state:'Delhi',   lat:null,    lng:null,    status:'open', rating:4.4, icon:'🚑', extraInfo:'Free Govt Service' },
  { category:'ambulance', name:'Ziqitza Ambulance',     phone:'1800-419-1919',altPhone:'108', area:'Delhi NCR',      city:'Delhi',    state:'Delhi',   lat:28.6139, lng:77.2090, status:'open', rating:4.6, icon:'🚑', extraInfo:'Private, ALS/BLS' },
  { category:'ambulance', name:'StanPlus Ambulance',    phone:'1800-313-1414',altPhone:'112', area:'Delhi NCR',      city:'Delhi',    state:'Delhi',   lat:28.5355, lng:77.2910, status:'open', rating:4.7, icon:'🚑', extraInfo:'Private, 15-min response' },
  { category:'ambulance', name:'GVK EMRI Ambulance',    phone:'108',          altPhone:'112', area:'Delhi NCR',      city:'Delhi',    state:'Delhi',   lat:28.6692, lng:77.3050, status:'busy', rating:4.3, icon:'🚑', extraInfo:'Govt, Free Service' },
  { category:'ambulance', name:'Medanta Ambulance',     phone:'0124-4141414', altPhone:'108', area:'Gurugram',       city:'Gurugram', state:'Haryana', lat:28.4595, lng:77.0266, status:'open', rating:4.8, icon:'🚑', extraInfo:'Private, ICU on wheels' },
  // POLICE
  { category:'police', name:'Delhi Traffic Police',     phone:'1095',         altPhone:'100', area:'All Delhi',      city:'Delhi',    state:'Delhi',   lat:28.6139, lng:77.2090, status:'open', rating:4.2, icon:'👮', extraInfo:'Traffic Control' },
  { category:'police', name:'Connaught Place PS',       phone:'011-23341151', altPhone:'100', area:'CP',             city:'Delhi',    state:'Delhi',   lat:28.6328, lng:77.2197, status:'open', rating:4.1, icon:'👮', extraInfo:'Central Delhi' },
  { category:'police', name:'Saket Police Station',     phone:'011-29563100', altPhone:'100', area:'Saket',          city:'Delhi',    state:'Delhi',   lat:28.5244, lng:77.2066, status:'open', rating:4.0, icon:'👮', extraInfo:'South Delhi' },
  { category:'police', name:'Highway Patrol NH-48',     phone:'1033',         altPhone:'100', area:'NH-48',          city:'Gurugram', state:'Haryana', lat:28.4595, lng:77.0266, status:'open', rating:4.3, icon:'👮', extraInfo:'Highway Patrol' },
  { category:'police', name:'PCR Van Control Room',     phone:'100',          altPhone:'112', area:'Delhi',          city:'Delhi',    state:'Delhi',   lat:28.6139, lng:77.2090, status:'open', rating:4.5, icon:'👮', extraInfo:'24x7 PCR' },
  // TOWING
  { category:'towing', name:'Delhi Towing Services',    phone:'9810012345',   altPhone:null,  area:'Delhi NCR',      city:'Delhi',    state:'Delhi',   lat:28.6139, lng:77.2090, status:'open', rating:4.2, icon:'🚗', extraInfo:'24x7, All vehicles' },
  { category:'towing', name:'Rapid Tow & Recovery',     phone:'9899123456',   altPhone:null,  area:'South Delhi',    city:'Delhi',    state:'Delhi',   lat:28.5244, lng:77.2066, status:'open', rating:4.4, icon:'🚗', extraInfo:'24x7, Heavy vehicles' },
  { category:'towing', name:'NH Towing Services',       phone:'9711234567',   altPhone:null,  area:'NH-48',          city:'Gurugram', state:'Haryana', lat:28.4595, lng:77.0266, status:'busy', rating:4.1, icon:'🚗', extraInfo:'Highway specialist' },
  { category:'towing', name:'QuickTow Delhi',           phone:'9871234567',   altPhone:null,  area:'West Delhi',     city:'Delhi',    state:'Delhi',   lat:28.6692, lng:77.1050, status:'open', rating:4.3, icon:'🚗', extraInfo:'24x7, Flatbed' },
  { category:'towing', name:'AAI Road Assist',          phone:'1800-200-1111',altPhone:null,  area:'Delhi NCR',      city:'Delhi',    state:'Delhi',   lat:28.6139, lng:77.2090, status:'open', rating:4.5, icon:'🚗', extraInfo:'Insurance tie-up' },
  // PUNCTURE
  { category:'puncture', name:'Sharma Tyre Works',      phone:'9810098765',   altPhone:null,  area:'Lajpat Nagar',   city:'Delhi',    state:'Delhi',   lat:28.5672, lng:77.2430, status:'open', rating:4.0, icon:'🔧', extraInfo:'All tyre brands' },
  { category:'puncture', name:'24x7 Tyre Repair',       phone:'9899876543',   altPhone:null,  area:'Saket',          city:'Delhi',    state:'Delhi',   lat:28.5244, lng:77.2066, status:'open', rating:4.2, icon:'🔧', extraInfo:'Mobile service' },
  { category:'puncture', name:'Highway Tyre Centre',    phone:'9711876543',   altPhone:null,  area:'NH-48',          city:'Gurugram', state:'Haryana', lat:28.4595, lng:77.0266, status:'busy', rating:3.9, icon:'🔧', extraInfo:'Highway location' },
  { category:'puncture', name:'MRF Tyre Service',       phone:'1800-419-0909',altPhone:null,  area:'Vasant Kunj',    city:'Delhi',    state:'Delhi',   lat:28.5200, lng:77.1580, status:'open', rating:4.4, icon:'🔧', extraInfo:'Authorised MRF' },
  // TRAUMA
  { category:'trauma', name:'AIIMS Trauma Centre',      phone:'011-26588700', altPhone:'112', area:'Ansari Nagar',   city:'Delhi',    state:'Delhi',   lat:28.5672, lng:77.2100, status:'open', rating:4.9, icon:'🩺', extraInfo:'Level 1 Trauma' },
  { category:'trauma', name:'GTB Hospital Trauma',      phone:'011-22582525', altPhone:'108', area:'Shahdara',       city:'Delhi',    state:'Delhi',   lat:28.6692, lng:77.3050, status:'open', rating:4.4, icon:'🩺', extraInfo:'Level 2 Trauma' },
  { category:'trauma', name:'Safdarjung Trauma',        phone:'011-26707000', altPhone:'108', area:'Ring Road',      city:'Delhi',    state:'Delhi',   lat:28.5706, lng:77.2040, status:'busy', rating:4.6, icon:'🩺', extraInfo:'Level 1 Trauma' },
  { category:'trauma', name:'Lok Nayak Hospital',       phone:'011-23232400', altPhone:'112', area:'Daryaganj',      city:'Delhi',    state:'Delhi',   lat:28.6400, lng:77.2400, status:'open', rating:4.3, icon:'🩺', extraInfo:'Level 2 Trauma' },
  { category:'trauma', name:'Medanta Trauma',           phone:'0124-4141414', altPhone:'108', area:'Sector 38',      city:'Gurugram', state:'Haryana', lat:28.4595, lng:77.0266, status:'open', rating:4.8, icon:'🩺', extraInfo:'Level 1 Trauma' },
];

const EMERGENCY_CONTACTS = [
  { name:'National Emergency', number:'112', icon:'🆘', country:'India', type:'general' },
  { name:'Ambulance',          number:'108', icon:'🚑', country:'India', type:'medical' },
  { name:'Police',             number:'100', icon:'👮', country:'India', type:'police' },
  { name:'Fire Brigade',       number:'101', icon:'🔥', country:'India', type:'fire' },
  { name:'Traffic Police',     number:'1095',icon:'🚦', country:'India', type:'traffic' },
  { name:'Highway Helpline',   number:'1033',icon:'🛣️', country:'India', type:'highway' },
  { name:'Women Helpline',     number:'1091',icon:'👩', country:'India', type:'women' },
  { name:'Child Helpline',     number:'1098',icon:'👶', country:'India', type:'child' },
  { name:'Disaster Management',number:'1078',icon:'⚠️', country:'India', type:'disaster' },
  { name:'Blood Bank',         number:'1910',icon:'🩸', country:'India', type:'medical' },
];

const INTERNATIONAL = [
  { country:'India',        flag:'🇮🇳', number:'112',   type:'All Emergency' },
  { country:'USA',          flag:'🇺🇸', number:'911',   type:'All Emergency' },
  { country:'UK',           flag:'🇬🇧', number:'999',   type:'All Emergency' },
  { country:'Australia',    flag:'🇦🇺', number:'000',   type:'All Emergency' },
  { country:'Canada',       flag:'🇨🇦', number:'911',   type:'All Emergency' },
  { country:'Germany',      flag:'🇩🇪', number:'112',   type:'All Emergency' },
  { country:'France',       flag:'🇫🇷', number:'15/17', type:'Medical/Police' },
  { country:'Japan',        flag:'🇯🇵', number:'119',   type:'Ambulance' },
  { country:'China',        flag:'🇨🇳', number:'120',   type:'Ambulance' },
  { country:'Brazil',       flag:'🇧🇷', number:'192',   type:'Ambulance' },
  { country:'South Africa', flag:'🇿🇦', number:'10177', type:'Ambulance' },
  { country:'UAE',          flag:'🇦🇪', number:'998',   type:'Ambulance' },
  { country:'Singapore',    flag:'🇸🇬', number:'995',   type:'Ambulance' },
  { country:'New Zealand',  flag:'🇳🇿', number:'111',   type:'All Emergency' },
  { country:'Italy',        flag:'🇮🇹', number:'118',   type:'Ambulance' },
  { country:'Spain',        flag:'🇪🇸', number:'112',   type:'All Emergency' },
  { country:'Russia',       flag:'🇷🇺', number:'103',   type:'Ambulance' },
  { country:'Malaysia',     flag:'🇲🇾', number:'999',   type:'All Emergency' },
];

const FIRST_AID = [
  { icon:'🩸', title:'Controlling Bleeding',
    steps:['Apply firm, direct pressure with a clean cloth or bandage','Do NOT remove the cloth — add more on top if soaked','Elevate the injured limb above heart level if possible','Maintain pressure for at least 10–15 minutes','For severe limb bleeding, apply tourniquet 2–3 inches above wound'],
    warning:'Do NOT apply tourniquet on neck, chest, or abdomen' },
  { icon:'🫁', title:'CPR (Cardiopulmonary Resuscitation)',
    steps:['Check scene safety, then check victim responsiveness','Call 112 or ask someone to call immediately','Tilt head back, lift chin, check for breathing (10 seconds)','Give 30 chest compressions — hard and fast (100–120/min)','Give 2 rescue breaths (if trained)','Continue 30:2 cycle until help arrives'],
    warning:'Only give rescue breaths if trained. Hands-only CPR is effective' },
  { icon:'🦴', title:'Suspected Spinal Injury',
    steps:['DO NOT move the victim unless in immediate danger','Keep head, neck, and spine aligned at all times','If must move, use log-roll technique with multiple helpers','Support head and neck manually until EMS arrives','Keep victim warm and calm'],
    warning:'Moving a spinal injury victim incorrectly can cause permanent paralysis' },
  { icon:'🔥', title:'Burns from Accident',
    steps:['Remove victim from heat source safely','Cool burn with cool (not cold/ice) running water for 20 minutes','Remove jewellery/clothing near burn (if not stuck)','Cover loosely with clean non-fluffy material','Do NOT apply butter, toothpaste, or ice'],
    warning:'Do NOT burst blisters. Seek medical help for burns larger than palm size' },
  { icon:'😵', title:'Unconscious Victim',
    steps:['Check for response — tap shoulders, shout','Call 112 immediately','Open airway — tilt head, lift chin','Check breathing for 10 seconds','If breathing: place in recovery position (on side)','If not breathing: start CPR'],
    warning:'Never give food or water to an unconscious person' },
  { icon:'🦵', title:'Fractures & Broken Bones',
    steps:['Immobilise the injured area — do not try to straighten','Support above and below the fracture site','Apply improvised splint (stick, rolled newspaper)','Apply ice pack wrapped in cloth to reduce swelling','Elevate if possible and keep victim still'],
    warning:'Open fractures (bone visible) are medical emergencies — call 108 immediately' },
];

async function seedCollection(colName, data, idField) {
  const colRef = collection(db, colName);
  const existing = await getDocs(colRef);
  if (!existing.empty) {
    console.log(`  ⏭  ${colName} already seeded (${existing.size} docs) — skipping`);
    return;
  }
  for (let i = 0; i < data.length; i++) {
    const id = idField ? data[i][idField] : String(i + 1).padStart(3, '0');
    await setDoc(doc(db, colName, id), { ...data[i], createdAt: new Date().toISOString() });
  }
  console.log(`  ✅ ${colName.padEnd(22)} ${data.length} docs written`);
}

async function main() {
  console.log('\n🔥 ROADSOS — Seeding Firestore\n');
  await seedCollection('services',             SERVICES,           null);
  await seedCollection('emergencyContacts',    EMERGENCY_CONTACTS, null);
  await seedCollection('internationalNumbers', INTERNATIONAL,      null);
  await seedCollection('firstAid',             FIRST_AID,          null);
  console.log('\n✅ Seed complete. Check Firebase Console → Firestore.\n');
  process.exit(0);
}

main().catch(e => { console.error('❌ Seed failed:', e.message); process.exit(1); });
