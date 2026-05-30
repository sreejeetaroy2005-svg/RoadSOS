/**
 * ROADSOS — /api/reports  (Firestore, with full error handling)
 */
const express = require('express');
const router  = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db, collection, doc, getDoc, getDocs, setDoc, updateDoc,
        query, orderBy, limit } = require('../firebase');

function docToObj(d) { return { id: d.id, ...d.data() }; }

const VALID_TYPES = ['Vehicle Collision','Single Vehicle Crash','Pedestrian Hit',
  'Two-Wheeler Accident','Truck/Bus Accident','Hit and Run','Other'];
const VALID_SEV = ['Minor — No injuries','Moderate — Minor injuries',
  'Serious — Major injuries','Critical — Life threatening'];

// POST /api/reports
router.post('/', async (req, res) => {
  try {
    const { device_id, acc_type, severity, location_txt, lat, lng, people_count, description, contact_num } = req.body;
    if (!acc_type || !severity || !location_txt)
      return res.status(400).json({ success:false, error:'acc_type, severity, location_txt required' });
    if (!VALID_TYPES.includes(acc_type))
      return res.status(400).json({ success:false, error:'Invalid acc_type' });
    if (!VALID_SEV.includes(severity))
      return res.status(400).json({ success:false, error:'Invalid severity' });
    const id = uuidv4();
    const data = {
      deviceId:    device_id || 'anonymous',
      accType:     acc_type,
      severity,
      locationTxt: location_txt.trim(),
      lat:         lat  ? parseFloat(lat)  : null,
      lng:         lng  ? parseFloat(lng)  : null,
      peopleCount: people_count ? parseInt(people_count) : 1,
      description: description?.trim() || null,
      contactNum:  contact_num?.trim()  || null,
      status:      'submitted',
      createdAt:   new Date().toISOString(),
    };
    await setDoc(doc(db,'incidentReports',id), data);
    console.log(`📋 REPORT — ${id} | ${acc_type} | ${severity} | ${location_txt}`);
    res.status(201).json({ success:true, message:'Report submitted.', data:{ id, ...data } });
  } catch (err) {
    console.error('POST /reports:', err.message);
    res.status(500).json({ success:false, error:'Failed to submit report' });
  }
});

// GET /api/reports
router.get('/', async (req, res) => {
  try {
    const snap = await getDocs(query(collection(db,'incidentReports'), orderBy('createdAt','desc'), limit(100)));
    res.json({ success:true, count:snap.size, data:snap.docs.map(docToObj) });
  } catch (err) {
    console.error('GET /reports:', err.message);
    res.status(500).json({ success:false, error:'Failed to fetch reports' });
  }
});

// GET /api/reports/:id
router.get('/:id', async (req, res) => {
  try {
    const snap = await getDoc(doc(db,'incidentReports',req.params.id));
    if (!snap.exists()) return res.status(404).json({ success:false, error:'Report not found' });
    res.json({ success:true, data:docToObj(snap) });
  } catch (err) {
    console.error('GET /reports/:id:', err.message);
    res.status(500).json({ success:false, error:'Failed to fetch report' });
  }
});

// PUT /api/reports/:id
router.put('/:id', async (req, res) => {
  try {
    const ref = doc(db,'incidentReports',req.params.id);
    if (!(await getDoc(ref)).exists()) return res.status(404).json({ success:false, error:'Not found' });
    const valid = ['submitted','acknowledged','resolved'];
    if (!valid.includes(req.body.status))
      return res.status(400).json({ success:false, error:`status must be one of: ${valid.join(', ')}` });
    await updateDoc(ref, { status: req.body.status });
    const updated = await getDoc(ref);
    res.json({ success:true, data:docToObj(updated) });
  } catch (err) {
    console.error('PUT /reports/:id:', err.message);
    res.status(500).json({ success:false, error:'Failed to update report' });
  }
});

module.exports = router;
