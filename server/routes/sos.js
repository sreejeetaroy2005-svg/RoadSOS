/**
 * ROADSOS — /api/sos  (Firestore)
 * POST /api/sos
 * GET  /api/sos
 * GET  /api/sos/:id
 * PUT  /api/sos/:id/resolve
 * PUT  /api/sos/:id/false
 */

const express = require('express');
const router  = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db, collection, doc, getDoc, getDocs, setDoc, updateDoc, query, orderBy, limit } = require('../firebase');

function docToObj(d) { return { id: d.id, ...d.data() }; }

// POST /api/sos
router.post('/', async (req, res) => {
  const { device_id, lat, lng, address, accuracy } = req.body;
  const id = uuidv4();
  const data = {
    deviceId:  device_id || 'anonymous',
    lat:       lat  ? parseFloat(lat)      : null,
    lng:       lng  ? parseFloat(lng)      : null,
    address:   address  || null,
    accuracy:  accuracy ? parseFloat(accuracy) : null,
    status:    'active',
    createdAt: new Date().toISOString(),
    resolvedAt: null,
  };
  await setDoc(doc(db, 'sosEvents', id), data);
  console.log(`🚨 SOS — ${id} | ${device_id} | ${lat},${lng}`);
  res.status(201).json({
    success: true,
    message: 'SOS activated. Emergency services have been notified.',
    data: { id, ...data },
    emergency_numbers: { national:'112', ambulance:'108', police:'100' },
  });
});

// GET /api/sos
router.get('/', async (req, res) => {
  const snap = await getDocs(query(collection(db, 'sosEvents'), orderBy('createdAt','desc'), limit(50)));
  res.json({ success:true, count:snap.size, data:snap.docs.map(docToObj) });
});

// GET /api/sos/:id
router.get('/:id', async (req, res) => {
  const snap = await getDoc(doc(db, 'sosEvents', req.params.id));
  if (!snap.exists()) return res.status(404).json({ success:false, error:'SOS event not found' });
  res.json({ success:true, data:docToObj(snap) });
});

// PUT /api/sos/:id/resolve
router.put('/:id/resolve', async (req, res) => {
  const ref = doc(db, 'sosEvents', req.params.id);
  if (!(await getDoc(ref)).exists()) return res.status(404).json({ success:false, error:'Not found' });
  await updateDoc(ref, { status:'resolved', resolvedAt: new Date().toISOString() });
  res.json({ success:true, message:'SOS resolved' });
});

// PUT /api/sos/:id/false
router.put('/:id/false', async (req, res) => {
  const ref = doc(db, 'sosEvents', req.params.id);
  if (!(await getDoc(ref)).exists()) return res.status(404).json({ success:false, error:'Not found' });
  await updateDoc(ref, { status:'false_alarm', resolvedAt: new Date().toISOString() });
  res.json({ success:true, message:'Marked as false alarm' });
});

module.exports = router;
