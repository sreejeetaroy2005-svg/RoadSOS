/**
 * ROADSOS — /api/services  (Firestore, with full error handling)
 */
const express = require('express');
const router  = express.Router();
const { db, collection, doc, getDoc, getDocs, addDoc, updateDoc,
        query, where, orderBy, limit } = require('../firebase');

function haversine(lat1, lng1, lat2, lng2) {
  if (!lat1 || !lng1 || !lat2 || !lng2) return null;
  const R = 6371, toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2-lat1), dLng = toRad(lng2-lng1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLng/2)**2;
  return +(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(2);
}
function docToObj(d) { return { id: d.id, ...d.data() }; }

// GET /api/services/nearby
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, category, radius = 20 } = req.query;
    if (!lat || !lng) return res.status(400).json({ success:false, error:'lat and lng required' });
    const userLat = parseFloat(lat), userLng = parseFloat(lng), maxR = parseFloat(radius);
    const q = category && category !== 'all'
      ? query(collection(db,'services'), where('category','==',category))
      : collection(db,'services');
    const snap = await getDocs(q);
    const rows = snap.docs
      .map(d => ({ ...docToObj(d), distance_km: haversine(userLat, userLng, d.data().lat, d.data().lng) }))
      .filter(r => r.distance_km !== null && r.distance_km <= maxR)
      .sort((a,b) => a.distance_km - b.distance_km);
    res.json({ success:true, count:rows.length, data:rows });
  } catch (err) {
    console.error('GET /services/nearby:', err.message);
    res.status(500).json({ success:false, error:'Failed to fetch nearby services' });
  }
});

// GET /api/services
router.get('/', async (req, res) => {
  try {
    const { category, q: search, lat, lng, limit: lim = 100 } = req.query;
    let snap;
    if (category && category !== 'all') {
      snap = await getDocs(query(collection(db,'services'), where('category','==',category), orderBy('rating','desc')));
    } else {
      snap = await getDocs(query(collection(db,'services'), orderBy('rating','desc')));
    }
    let rows = snap.docs.map(docToObj);
    if (search) {
      const s = search.toLowerCase();
      rows = rows.filter(r => r.name?.toLowerCase().includes(s) || r.area?.toLowerCase().includes(s) || r.city?.toLowerCase().includes(s));
    }
    if (lat && lng) {
      const uLat = parseFloat(lat), uLng = parseFloat(lng);
      rows = rows.map(r => ({ ...r, distance_km: haversine(uLat, uLng, r.lat, r.lng) }))
                 .sort((a,b) => (a.distance_km??999) - (b.distance_km??999));
    }
    res.json({ success:true, count:rows.length, data:rows.slice(0, Number(lim)) });
  } catch (err) {
    console.error('GET /services:', err.message);
    res.status(500).json({ success:false, error:'Failed to fetch services' });
  }
});

// GET /api/services/:id
router.get('/:id', async (req, res) => {
  try {
    const snap = await getDoc(doc(db,'services',req.params.id));
    if (!snap.exists()) return res.status(404).json({ success:false, error:'Service not found' });
    res.json({ success:true, data:docToObj(snap) });
  } catch (err) {
    console.error('GET /services/:id:', err.message);
    res.status(500).json({ success:false, error:'Failed to fetch service' });
  }
});

// POST /api/services
router.post('/', async (req, res) => {
  try {
    const { category, name, phone, area } = req.body;
    if (!category || !name || !phone || !area)
      return res.status(400).json({ success:false, error:'category, name, phone, area required' });
    const ref = await addDoc(collection(db,'services'), { ...req.body, createdAt: new Date().toISOString() });
    res.status(201).json({ success:true, data:{ id:ref.id, ...req.body } });
  } catch (err) {
    console.error('POST /services:', err.message);
    res.status(500).json({ success:false, error:'Failed to create service' });
  }
});

// PUT /api/services/:id
router.put('/:id', async (req, res) => {
  try {
    const ref = doc(db,'services',req.params.id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return res.status(404).json({ success:false, error:'Service not found' });
    const updates = {};
    if (req.body.status)    updates.status    = req.body.status;
    if (req.body.rating)    updates.rating    = req.body.rating;
    if (req.body.extraInfo) updates.extraInfo = req.body.extraInfo;
    updates.updatedAt = new Date().toISOString();
    await updateDoc(ref, updates);
    const updated = await getDoc(ref);
    res.json({ success:true, data:docToObj(updated) });
  } catch (err) {
    console.error('PUT /services/:id:', err.message);
    res.status(500).json({ success:false, error:'Failed to update service' });
  }
});

module.exports = router;
