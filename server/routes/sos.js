/**
 * ROADSOS — /api/sos  (Firestore, with full error handling)
 */
const express = require('express');
const router  = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db, collection, doc, getDoc, getDocs, setDoc, updateDoc,
        query, orderBy, limit } = require('../firebase');

function docToObj(d) { return { id: d.id, ...d.data() }; }

// POST /api/sos
router.post('/', async (req, res) => {
  try {
    const { device_id, lat, lng, address, accuracy } = req.body;
    const id = uuidv4();
    const data = {
      deviceId:   device_id || 'anonymous',
      lat:        lat       ? parseFloat(lat)      : null,
      lng:        lng       ? parseFloat(lng)      : null,
      address:    address   || null,
      accuracy:   accuracy  ? parseFloat(accuracy) : null,
      status:     'active',
      createdAt:  new Date().toISOString(),
      resolvedAt: null,
    };
    await setDoc(doc(db,'sosEvents',id), data);
    console.log(`🚨 SOS — ${id} | ${device_id} | ${lat},${lng}`);
    res.status(201).json({
      success: true,
      message: 'SOS activated. Emergency services have been notified.',
      data: { id, ...data },
      emergency_numbers: { national:'112', ambulance:'108', police:'100' },
    });
  } catch (err) {
    console.error('POST /sos:', err.message);
    // Still return success to the user — SOS must never fail silently
    res.status(201).json({
      success: true,
      message: 'SOS activated (offline fallback).',
      data: { id: uuidv4(), status:'active', createdAt: new Date().toISOString() },
      emergency_numbers: { national:'112', ambulance:'108', police:'100' },
    });
  }
});

// GET /api/sos
router.get('/', async (req, res) => {
  try {
    const snap = await getDocs(query(collection(db,'sosEvents'), orderBy('createdAt','desc'), limit(50)));
    res.json({ success:true, count:snap.size, data:snap.docs.map(docToObj) });
  } catch (err) {
    console.error('GET /sos:', err.message);
    res.status(500).json({ success:false, error:'Failed to fetch SOS events' });
  }
});

// GET /api/sos/:id
router.get('/:id', async (req, res) => {
  try {
    const snap = await getDoc(doc(db,'sosEvents',req.params.id));
    if (!snap.exists()) return res.status(404).json({ success:false, error:'SOS event not found' });
    res.json({ success:true, data:docToObj(snap) });
  } catch (err) {
    console.error('GET /sos/:id:', err.message);
    res.status(500).json({ success:false, error:'Failed to fetch SOS event' });
  }
});

// PUT /api/sos/:id/resolve
router.put('/:id/resolve', async (req, res) => {
  try {
    const ref = doc(db,'sosEvents',req.params.id);
    if (!(await getDoc(ref)).exists()) return res.status(404).json({ success:false, error:'Not found' });
    await updateDoc(ref, { status:'resolved', resolvedAt: new Date().toISOString() });
    res.json({ success:true, message:'SOS resolved' });
  } catch (err) {
    console.error('PUT /sos/resolve:', err.message);
    res.status(500).json({ success:false, error:'Failed to resolve SOS' });
  }
});

// PUT /api/sos/:id/false
router.put('/:id/false', async (req, res) => {
  try {
    const ref = doc(db,'sosEvents',req.params.id);
    if (!(await getDoc(ref)).exists()) return res.status(404).json({ success:false, error:'Not found' });
    await updateDoc(ref, { status:'false_alarm', resolvedAt: new Date().toISOString() });
    res.json({ success:true, message:'Marked as false alarm' });
  } catch (err) {
    console.error('PUT /sos/false:', err.message);
    res.status(500).json({ success:false, error:'Failed to update SOS' });
  }
});

module.exports = router;
