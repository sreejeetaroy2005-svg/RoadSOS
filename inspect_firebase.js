require('dotenv').config();
const { db, collection, getDocs, orderBy, query } = require('./server/firebase');

async function inspect() {
  console.log('\n🔥 ROADSOS — Live Firestore Data\n');
  console.log('Project:', process.env.FIREBASE_PROJECT_ID);
  console.log('='.repeat(55));

  // 1. SERVICES
  const services = await getDocs(collection(db, 'services'));
  const byCategory = {};
  services.docs.forEach(d => {
    const cat = d.data().category;
    byCategory[cat] = (byCategory[cat] || 0) + 1;
  });
  console.log(`\n📦 services (${services.size} docs)`);
  Object.entries(byCategory).forEach(([cat, count]) =>
    console.log(`   ${cat.padEnd(12)} ${count} records`)
  );
  console.log('   Sample:', services.docs[0].data().name, '|', services.docs[0].data().phone);

  // 2. EMERGENCY CONTACTS
  const contacts = await getDocs(collection(db, 'emergencyContacts'));
  console.log(`\n📞 emergencyContacts (${contacts.size} docs)`);
  contacts.docs.forEach(d => {
    const r = d.data();
    console.log(`   ${r.icon} ${r.name.padEnd(22)} → ${r.number}`);
  });

  // 3. INTERNATIONAL NUMBERS
  const intl = await getDocs(query(collection(db, 'internationalNumbers'), orderBy('country')));
  console.log(`\n🌍 internationalNumbers (${intl.size} docs)`);
  intl.docs.forEach(d => {
    const r = d.data();
    console.log(`   ${r.flag} ${r.country.padEnd(14)} → ${r.number.padEnd(6)} (${r.type})`);
  });

  // 4. FIRST AID
  const firstAid = await getDocs(collection(db, 'firstAid'));
  console.log(`\n🩹 firstAid (${firstAid.size} docs)`);
  firstAid.docs.forEach(d => {
    const r = d.data();
    console.log(`   ${r.icon} ${r.title} — ${r.steps.length} steps`);
  });

  // 5. SOS EVENTS
  const sos = await getDocs(collection(db, 'sosEvents'));
  console.log(`\n🚨 sosEvents (${sos.size} docs) — logged every time SOS is tapped`);
  if (sos.size === 0) {
    console.log('   (empty — tap SOS in the app to create one)');
  } else {
    sos.docs.forEach(d => {
      const r = d.data();
      console.log(`   ID: ${d.id.slice(0,8)}… | Device: ${r.deviceId} | Status: ${r.status}`);
      console.log(`   Location: ${r.lat}, ${r.lng} | Address: ${r.address}`);
      console.log(`   Time: ${r.createdAt}`);
    });
  }

  // 6. INCIDENT REPORTS
  const reports = await getDocs(collection(db, 'incidentReports'));
  console.log(`\n📋 incidentReports (${reports.size} docs) — submitted via the report form`);
  if (reports.size === 0) {
    console.log('   (empty — submit a report in the app to create one)');
  } else {
    reports.docs.forEach(d => {
      const r = d.data();
      console.log(`   ID: ${d.id.slice(0,8)}… | Type: ${r.accType} | Severity: ${r.severity}`);
      console.log(`   Location: ${r.locationTxt} | People: ${r.peopleCount} | Status: ${r.status}`);
      console.log(`   Time: ${r.createdAt}`);
    });
  }

  // 7. PERSONAL CONTACTS
  const personal = await getDocs(collection(db, 'personalContacts'));
  console.log(`\n👤 personalContacts (${personal.size} docs) — saved by users in the app`);
  if (personal.size === 0) {
    console.log('   (empty — add a contact in the app to create one)');
  } else {
    personal.docs.forEach(d => {
      const r = d.data();
      console.log(`   ${r.icon} ${r.name} | ${r.number} | Device: ${r.deviceId}`);
    });
  }

  console.log('\n' + '='.repeat(55));
  console.log('🔗 View live: https://console.firebase.google.com/project/' + process.env.FIREBASE_PROJECT_ID + '/firestore');
  console.log('');
  process.exit(0);
}

inspect().catch(e => { console.error('Error:', e.message); process.exit(1); });
