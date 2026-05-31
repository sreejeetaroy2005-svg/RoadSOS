/**
 * ROADSOS — Bengaluru Services Seed
 * Run: node server/seed_bengaluru.js
 */
require('dotenv').config();
const { db, collection, doc, setDoc, getDocs, query, where } = require('./firebase');

const BENGALURU_SERVICES = [
  // HOSPITALS
  { category:'hospital', name:'Manipal Hospital (HAL)',      phone:'080-25024444', altPhone:'108', area:'HAL Airport Road',  city:'Bengaluru', state:'Karnataka', country:'India', lat:12.9592, lng:77.6474, status:'open', rating:4.7, icon:'🏥', extraInfo:'Private, 24x7' },
  { category:'hospital', name:'St. John\'s Medical College', phone:'080-22065000', altPhone:'108', area:'Koramangala',       city:'Bengaluru', state:'Karnataka', country:'India', lat:12.9352, lng:77.6245, status:'open', rating:4.6, icon:'🏥', extraInfo:'Govt, Level 1 Trauma' },
  { category:'hospital', name:'Fortis Hospital Bannerghatta',phone:'080-66214444', altPhone:'112', area:'Bannerghatta Road', city:'Bengaluru', state:'Karnataka', country:'India', lat:12.8726, lng:77.5970, status:'open', rating:4.5, icon:'🏥', extraInfo:'Private, 24x7' },
  { category:'hospital', name:'Apollo Hospital Bannerghatta',phone:'080-26304050', altPhone:'108', area:'Bannerghatta Road', city:'Bengaluru', state:'Karnataka', country:'India', lat:12.8900, lng:77.5980, status:'open', rating:4.6, icon:'🏥', extraInfo:'Private, Trauma Unit' },
  { category:'hospital', name:'Victoria Hospital',           phone:'080-26701150', altPhone:'108', area:'City Market',       city:'Bengaluru', state:'Karnataka', country:'India', lat:12.9634, lng:77.5760, status:'open', rating:4.2, icon:'🏥', extraInfo:'Govt, Free OPD' },
  { category:'hospital', name:'Bowring & Lady Curzon Hosp',  phone:'080-25591234', altPhone:'108', area:'Shivajinagar',      city:'Bengaluru', state:'Karnataka', country:'India', lat:12.9800, lng:77.6010, status:'open', rating:4.1, icon:'🏥', extraInfo:'Govt, Central Bengaluru' },
  { category:'hospital', name:'Narayana Health City',        phone:'080-71222222', altPhone:'112', area:'Bommasandra',       city:'Bengaluru', state:'Karnataka', country:'India', lat:12.8390, lng:77.6720, status:'open', rating:4.8, icon:'🏥', extraInfo:'Private, World Class' },
  { category:'hospital', name:'Sakra World Hospital',        phone:'080-49690000', altPhone:'108', area:'Marathahalli',      city:'Bengaluru', state:'Karnataka', country:'India', lat:12.9560, lng:77.7010, status:'open', rating:4.5, icon:'🏥', extraInfo:'Private, 24x7' },
  // AMBULANCE
  { category:'ambulance', name:'Karnataka 108 Ambulance',   phone:'108',          altPhone:'112', area:'Statewide',         city:'Bengaluru', state:'Karnataka', country:'India', lat:12.9716, lng:77.5946, status:'open', rating:4.4, icon:'🚑', extraInfo:'Free Govt Service' },
  { category:'ambulance', name:'Ziqitza Bengaluru',         phone:'1800-419-1919',altPhone:'108', area:'Bengaluru',          city:'Bengaluru', state:'Karnataka', country:'India', lat:12.9716, lng:77.5946, status:'open', rating:4.5, icon:'🚑', extraInfo:'ALS/BLS Available' },
  { category:'ambulance', name:'StanPlus Bengaluru',        phone:'1800-313-1414',altPhone:'112', area:'Bengaluru',          city:'Bengaluru', state:'Karnataka', country:'India', lat:12.9560, lng:77.7010, status:'open', rating:4.6, icon:'🚑', extraInfo:'15-min response' },
  // POLICE
  { category:'police', name:'Bengaluru Traffic Police',     phone:'080-22868444', altPhone:'100', area:'Bengaluru',          city:'Bengaluru', state:'Karnataka', country:'India', lat:12.9716, lng:77.5946, status:'open', rating:4.2, icon:'👮', extraInfo:'Traffic Control' },
  { category:'police', name:'Koramangala Police Station',   phone:'080-22943636', altPhone:'100', area:'Koramangala',        city:'Bengaluru', state:'Karnataka', country:'India', lat:12.9352, lng:77.6245, status:'open', rating:4.0, icon:'👮', extraInfo:'South Bengaluru' },
  { category:'police', name:'Indiranagar Police Station',   phone:'080-25209999', altPhone:'100', area:'Indiranagar',        city:'Bengaluru', state:'Karnataka', country:'India', lat:12.9784, lng:77.6408, status:'open', rating:4.1, icon:'👮', extraInfo:'East Bengaluru' },
  { category:'police', name:'Highway Patrol NH-44',         phone:'1033',         altPhone:'100', area:'NH-44, Bengaluru',   city:'Bengaluru', state:'Karnataka', country:'India', lat:12.9100, lng:77.6500, status:'open', rating:4.3, icon:'👮', extraInfo:'Highway Patrol' },
  // TOWING
  { category:'towing', name:'Bengaluru Towing Services',    phone:'9880012345',   altPhone:'',    area:'Bengaluru',          city:'Bengaluru', state:'Karnataka', country:'India', lat:12.9716, lng:77.5946, status:'open', rating:4.2, icon:'🚗', extraInfo:'24x7, All vehicles' },
  { category:'towing', name:'Quick Tow Bengaluru',          phone:'9845123456',   altPhone:'',    area:'Koramangala',        city:'Bengaluru', state:'Karnataka', country:'India', lat:12.9352, lng:77.6245, status:'open', rating:4.3, icon:'🚗', extraInfo:'24x7, Flatbed' },
  { category:'towing', name:'NHAI Towing NH-44',            phone:'1033',         altPhone:'',    area:'NH-44',              city:'Bengaluru', state:'Karnataka', country:'India', lat:12.9100, lng:77.6500, status:'open', rating:4.1, icon:'🚗', extraInfo:'Highway specialist' },
  // PUNCTURE
  { category:'puncture', name:'24x7 Tyre Repair Blr',      phone:'9900098765',   altPhone:'',    area:'Koramangala',        city:'Bengaluru', state:'Karnataka', country:'India', lat:12.9352, lng:77.6245, status:'open', rating:4.1, icon:'🔧', extraInfo:'Mobile service' },
  { category:'puncture', name:'MRF Tyre Centre Blr',       phone:'1800-419-0909',altPhone:'',    area:'Indiranagar',        city:'Bengaluru', state:'Karnataka', country:'India', lat:12.9784, lng:77.6408, status:'open', rating:4.3, icon:'🔧', extraInfo:'Authorised MRF' },
  // TRAUMA
  { category:'trauma', name:'St. John\'s Trauma Centre',   phone:'080-22065000', altPhone:'112', area:'Koramangala',        city:'Bengaluru', state:'Karnataka', country:'India', lat:12.9352, lng:77.6245, status:'open', rating:4.7, icon:'🩺', extraInfo:'Level 1 Trauma' },
  { category:'trauma', name:'Manipal Trauma Centre',       phone:'080-25024444', altPhone:'108', area:'HAL Airport Road',   city:'Bengaluru', state:'Karnataka', country:'India', lat:12.9592, lng:77.6474, status:'open', rating:4.6, icon:'🩺', extraInfo:'Level 2 Trauma' },
  { category:'trauma', name:'Victoria Hospital Trauma',    phone:'080-26701150', altPhone:'108', area:'City Market',        city:'Bengaluru', state:'Karnataka', country:'India', lat:12.9634, lng:77.5760, status:'open', rating:4.2, icon:'🩺', extraInfo:'Govt Trauma Centre' },
];

async function seedBengaluru() {
  console.log('\n🏙️  ROADSOS — Seeding Bengaluru Services\n');
  const colRef = collection(db, 'services');

  // Check if Bengaluru services already exist
  const existing = await getDocs(query(colRef, where('city', '==', 'Bengaluru')));
  if (existing.size > 1) {
    console.log(`  ⏭  Bengaluru services already seeded (${existing.size} docs) — skipping`);
    process.exit(0);
  }

  let count = 0;
  for (let i = 0; i < BENGALURU_SERVICES.length; i++) {
    const id = `blr_${String(i+1).padStart(3,'0')}`;
    await setDoc(doc(db, 'services', id), {
      ...BENGALURU_SERVICES[i],
      createdAt: new Date().toISOString(),
    });
    count++;
    process.stdout.write(`  Writing ${count}/${BENGALURU_SERVICES.length}...\r`);
  }
  console.log(`\n  ✅ services (Bengaluru)  ${count} docs written`);
  console.log('\n✅ Bengaluru seed complete.\n');
  process.exit(0);
}

seedBengaluru().catch(e => { console.error('❌ Seed failed:', e.message); process.exit(1); });
