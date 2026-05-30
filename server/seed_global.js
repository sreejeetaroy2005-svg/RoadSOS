/**
 * ROADSOS — Global Services Seed
 * Adds emergency services for 10 major cities across 6 countries.
 * Run: node server/seed_global.js
 */
require('dotenv').config();
const { db, collection, doc, setDoc, getDocs, query, where } = require('./firebase');

const GLOBAL_SERVICES = [
  // ── USA — New York ──────────────────────────────────────────
  { category:'hospital',  name:'NewYork-Presbyterian Hospital', phone:'212-746-5454', altPhone:'911', area:'Upper East Side', city:'New York', state:'NY', country:'USA', lat:40.7648, lng:-73.9540, status:'open', rating:4.8, icon:'🏥', extraInfo:'Level 1 Trauma, 24x7' },
  { category:'hospital',  name:'Bellevue Hospital Center',      phone:'212-562-4141', altPhone:'911', area:'Kips Bay',        city:'New York', state:'NY', country:'USA', lat:40.7393, lng:-73.9756, status:'open', rating:4.5, icon:'🏥', extraInfo:'Govt, 24x7 Emergency' },
  { category:'ambulance', name:'NYC EMS / 911 Ambulance',       phone:'911',          altPhone:'911', area:'Citywide',        city:'New York', state:'NY', country:'USA', lat:40.7128, lng:-74.0060, status:'open', rating:4.6, icon:'🚑', extraInfo:'Free Emergency Service' },
  { category:'police',    name:'NYPD Emergency',                phone:'911',          altPhone:'311', area:'Citywide',        city:'New York', state:'NY', country:'USA', lat:40.7128, lng:-74.0060, status:'open', rating:4.3, icon:'👮', extraInfo:'24x7 Emergency' },
  { category:'towing',    name:'NYC Tow Pound',                 phone:'212-971-0770', altPhone:'',    area:'Manhattan',       city:'New York', state:'NY', country:'USA', lat:40.7549, lng:-74.0020, status:'open', rating:3.9, icon:'🚗', extraInfo:'Official City Towing' },

  // ── UK — London ─────────────────────────────────────────────
  { category:'hospital',  name:'St Thomas Hospital',            phone:'020-7188-7188', altPhone:'999', area:'Lambeth',         city:'London', state:'England', country:'UK', lat:51.4988, lng:-0.1187, status:'open', rating:4.7, icon:'🏥', extraInfo:'Major Trauma Centre' },
  { category:'hospital',  name:'Royal London Hospital',         phone:'020-7377-7000', altPhone:'999', area:'Whitechapel',     city:'London', state:'England', country:'UK', lat:51.5188, lng:-0.0597, status:'open', rating:4.6, icon:'🏥', extraInfo:'Level 1 Trauma' },
  { category:'ambulance', name:'London Ambulance Service',      phone:'999',           altPhone:'112', area:'Citywide',        city:'London', state:'England', country:'UK', lat:51.5074, lng:-0.1278, status:'open', rating:4.5, icon:'🚑', extraInfo:'NHS Free Service' },
  { category:'police',    name:'Metropolitan Police',           phone:'999',           altPhone:'101', area:'Citywide',        city:'London', state:'England', country:'UK', lat:51.5074, lng:-0.1278, status:'open', rating:4.2, icon:'👮', extraInfo:'Emergency: 999' },
  { category:'towing',    name:'RAC Breakdown Recovery',        phone:'0333-2000-999', altPhone:'',    area:'Nationwide',      city:'London', state:'England', country:'UK', lat:51.5074, lng:-0.1278, status:'open', rating:4.4, icon:'🚗', extraInfo:'24x7 Roadside Assist' },

  // ── Australia — Sydney ───────────────────────────────────────
  { category:'hospital',  name:'Royal Prince Alfred Hospital',  phone:'02-9515-6111', altPhone:'000', area:'Camperdown',      city:'Sydney', state:'NSW', country:'Australia', lat:-33.8892, lng:151.1872, status:'open', rating:4.7, icon:'🏥', extraInfo:'Major Trauma Centre' },
  { category:'ambulance', name:'NSW Ambulance',                 phone:'000',          altPhone:'112', area:'Statewide',       city:'Sydney', state:'NSW', country:'Australia', lat:-33.8688, lng:151.2093, status:'open', rating:4.5, icon:'🚑', extraInfo:'Free Emergency' },
  { category:'police',    name:'NSW Police Emergency',          phone:'000',          altPhone:'131-444', area:'Statewide',   city:'Sydney', state:'NSW', country:'Australia', lat:-33.8688, lng:151.2093, status:'open', rating:4.3, icon:'👮', extraInfo:'Emergency: 000' },
  { category:'towing',    name:'NRMA Roadside Assist',          phone:'13-11-22',     altPhone:'',    area:'NSW',             city:'Sydney', state:'NSW', country:'Australia', lat:-33.8688, lng:151.2093, status:'open', rating:4.6, icon:'🚗', extraInfo:'24x7 Roadside' },

  // ── UAE — Dubai ──────────────────────────────────────────────
  { category:'hospital',  name:'Rashid Hospital',               phone:'04-219-2000', altPhone:'998', area:'Oud Metha',        city:'Dubai', state:'Dubai', country:'UAE', lat:25.2285, lng:55.3273, status:'open', rating:4.6, icon:'🏥', extraInfo:'Level 1 Trauma, Govt' },
  { category:'hospital',  name:'American Hospital Dubai',       phone:'04-336-7777', altPhone:'998', area:'Oud Metha',        city:'Dubai', state:'Dubai', country:'UAE', lat:25.2285, lng:55.3273, status:'open', rating:4.8, icon:'🏥', extraInfo:'Private, 24x7' },
  { category:'ambulance', name:'Dubai Ambulance 998',           phone:'998',         altPhone:'999', area:'Citywide',         city:'Dubai', state:'Dubai', country:'UAE', lat:25.2048, lng:55.2708, status:'open', rating:4.5, icon:'🚑', extraInfo:'Free Emergency' },
  { category:'police',    name:'Dubai Police Emergency',        phone:'999',         altPhone:'901', area:'Citywide',         city:'Dubai', state:'Dubai', country:'UAE', lat:25.2048, lng:55.2708, status:'open', rating:4.4, icon:'👮', extraInfo:'Emergency: 999' },
  { category:'towing',    name:'RTA Towing Service Dubai',      phone:'800-9090',    altPhone:'',    area:'Citywide',         city:'Dubai', state:'Dubai', country:'UAE', lat:25.2048, lng:55.2708, status:'open', rating:4.2, icon:'🚗', extraInfo:'Official RTA Service' },

  // ── Singapore ────────────────────────────────────────────────
  { category:'hospital',  name:'Singapore General Hospital',    phone:'6222-3322', altPhone:'995', area:'Outram',             city:'Singapore', state:'Singapore', country:'Singapore', lat:1.2796, lng:103.8353, status:'open', rating:4.7, icon:'🏥', extraInfo:'Level 1 Trauma' },
  { category:'ambulance', name:'SCDF Ambulance 995',            phone:'995',       altPhone:'999', area:'Islandwide',         city:'Singapore', state:'Singapore', country:'Singapore', lat:1.3521, lng:103.8198, status:'open', rating:4.6, icon:'🚑', extraInfo:'Free Emergency' },
  { category:'police',    name:'Singapore Police 999',          phone:'999',       altPhone:'1800-255-0000', area:'Islandwide', city:'Singapore', state:'Singapore', country:'Singapore', lat:1.3521, lng:103.8198, status:'open', rating:4.5, icon:'👮', extraInfo:'Emergency: 999' },
  { category:'towing',    name:'AA Singapore Roadside',         phone:'6748-9911', altPhone:'',    area:'Islandwide',         city:'Singapore', state:'Singapore', country:'Singapore', lat:1.3521, lng:103.8198, status:'open', rating:4.3, icon:'🚗', extraInfo:'24x7 Roadside' },

  // ── Germany — Berlin ─────────────────────────────────────────
  { category:'hospital',  name:'Charité – Universitätsmedizin', phone:'030-450-50', altPhone:'112', area:'Mitte',             city:'Berlin', state:'Berlin', country:'Germany', lat:52.5246, lng:13.3780, status:'open', rating:4.8, icon:'🏥', extraInfo:'Level 1 Trauma' },
  { category:'ambulance', name:'Berliner Feuerwehr Rettung',    phone:'112',        altPhone:'110', area:'Citywide',          city:'Berlin', state:'Berlin', country:'Germany', lat:52.5200, lng:13.4050, status:'open', rating:4.5, icon:'🚑', extraInfo:'Free Emergency' },
  { category:'police',    name:'Polizei Berlin Notruf',         phone:'110',        altPhone:'112', area:'Citywide',          city:'Berlin', state:'Berlin', country:'Germany', lat:52.5200, lng:13.4050, status:'open', rating:4.3, icon:'👮', extraInfo:'Emergency: 110' },
  { category:'towing',    name:'ADAC Pannenhilfe',              phone:'0800-5-101-112', altPhone:'', area:'Nationwide',       city:'Berlin', state:'Berlin', country:'Germany', lat:52.5200, lng:13.4050, status:'open', rating:4.7, icon:'🚗', extraInfo:'24x7 Roadside' },

  // ── Japan — Tokyo ────────────────────────────────────────────
  { category:'hospital',  name:'Tokyo Medical University Hospital', phone:'03-3342-6111', altPhone:'119', area:'Shinjuku',   city:'Tokyo', state:'Tokyo', country:'Japan', lat:35.6938, lng:139.7034, status:'open', rating:4.7, icon:'🏥', extraInfo:'24x7 Emergency' },
  { category:'ambulance', name:'Tokyo Fire Dept Ambulance 119', phone:'119',          altPhone:'110', area:'Citywide',       city:'Tokyo', state:'Tokyo', country:'Japan', lat:35.6762, lng:139.6503, status:'open', rating:4.6, icon:'🚑', extraInfo:'Free Emergency' },
  { category:'police',    name:'Tokyo Metropolitan Police 110', phone:'110',          altPhone:'119', area:'Citywide',       city:'Tokyo', state:'Tokyo', country:'Japan', lat:35.6762, lng:139.6503, status:'open', rating:4.5, icon:'👮', extraInfo:'Emergency: 110' },
  { category:'towing',    name:'JAF Roadside Assistance',       phone:'0570-00-8139', altPhone:'',   area:'Nationwide',      city:'Tokyo', state:'Tokyo', country:'Japan', lat:35.6762, lng:139.6503, status:'open', rating:4.6, icon:'🚗', extraInfo:'24x7 Roadside' },
];

async function seedGlobal() {
  console.log('\n🌍 ROADSOS — Seeding Global Services\n');
  const colRef = collection(db, 'services');

  // Check how many non-India services already exist
  const existing = await getDocs(query(colRef, where('country', '!=', 'India')));
  if (existing.size > 0) {
    console.log(`  ⏭  Global services already seeded (${existing.size} docs) — skipping`);
    process.exit(0);
  }

  let count = 0;
  for (let i = 0; i < GLOBAL_SERVICES.length; i++) {
    const id = `global_${String(i+1).padStart(3,'0')}`;
    await setDoc(doc(db, 'services', id), {
      ...GLOBAL_SERVICES[i],
      createdAt: new Date().toISOString(),
    });
    count++;
  }
  console.log(`  ✅ services (global)     ${count} docs written`);
  console.log('\n✅ Global seed complete.\n');
  process.exit(0);
}

seedGlobal().catch(e => { console.error('❌ Global seed failed:', e.message); process.exit(1); });
