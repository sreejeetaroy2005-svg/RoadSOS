/**
 * ROADSOS — /api/contacts  (Firestore, with full error handling)
 */
const express = require('express');
const router  = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db, collection, doc, getDoc, getDocs, setDoc, deleteDoc,
        query, where, orderBy } = require('../firebase');

function docToObj(d) { return { id: d.id, ...d.data() }; }

// GET /api/contacts
router.get('/', async (req, res) => {
  try {
    const snap = await getDocs(collection(db,'emergencyContacts'));
    res.json({ success:true, count:snap.size, data:snap.docs.map(docToObj) });
  } catch (err) {
    console.error('GET /contacts:', err.message);
    res.status(500).json({ success:false, error:'Failed to fetch contacts' });
  }
});

// GET /api/contacts/international
router.get('/international', async (req, res) => {
  try {
    const snap = await getDocs(query(collection(db,'internationalNumbers'), orderBy('country')));
    res.json({ success:true, count:snap.size, data:snap.docs.map(docToObj) });
  } catch (err) {
    console.error('GET /contacts/international:', err.message);
    res.status(500).json({ success:false, error:'Failed to fetch international numbers' });
  }
});

// GET /api/contacts/personal/:deviceId
router.get('/personal/:deviceId', async (req, res) => {
  try {
    const snap = await getDocs(
      query(collection(db,'personalContacts'), where('deviceId','==',req.params.deviceId))
    );
    res.json({ success:true, count:snap.size, data:snap.docs.map(docToObj) });
  } catch (err) {
    console.error('GET /contacts/personal:', err.message);
    res.status(500).json({ success:false, error:'Failed to fetch personal contacts' });
  }
});

// POST /api/contacts/personal
router.post('/personal', async (req, res) => {
  try {
    const { device_id, name, number, icon } = req.body;
    if (!device_id || !name || !number)
      return res.status(400).json({ success:false, error:'device_id, name, number required' });
    if (!/^[\d\s+\-()\u0900-\u097F]{6,20}$/.test(number.trim()))
      return res.status(400).json({ success:false, error:'Invalid phone number' });
    const id = uuidv4();
    const data = { deviceId:device_id, name:name.trim(), number:number.trim(), icon:icon||'👤', createdAt:new Date().toISOString() };
    await setDoc(doc(db,'personalContacts',id), data);
    res.status(201).json({ success:true, data:{ id, ...data } });
  } catch (err) {
    console.error('POST /contacts/personal:', err.message);
    res.status(500).json({ success:false, error:'Failed to save contact' });
  }
});

// DELETE /api/contacts/personal/:id
router.delete('/personal/:id', async (req, res) => {
  try {
    const ref = doc(db,'personalContacts',req.params.id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return res.status(404).json({ success:false, error:'Contact not found' });
    await deleteDoc(ref);
    res.json({ success:true, message:'Contact deleted' });
  } catch (err) {
    console.error('DELETE /contacts/personal:', err.message);
    res.status(500).json({ success:false, error:'Failed to delete contact' });
  }
});

module.exports = router;
