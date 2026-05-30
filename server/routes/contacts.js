/**
 * ROADSOS — /api/contacts  (Firestore)
 * GET    /api/contacts
 * GET    /api/contacts/international
 * GET    /api/contacts/personal/:deviceId
 * POST   /api/contacts/personal
 * DELETE /api/contacts/personal/:id
 */

const express = require('express');
const router  = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db, collection, doc, getDoc, getDocs, setDoc, deleteDoc, query, where, orderBy } = require('../firebase');

function docToObj(d) { return { id: d.id, ...d.data() }; }

// GET /api/contacts
router.get('/', async (req, res) => {
  const snap = await getDocs(collection(db, 'emergencyContacts'));
  res.json({ success:true, count:snap.size, data:snap.docs.map(docToObj) });
});

// GET /api/contacts/international
router.get('/international', async (req, res) => {
  const snap = await getDocs(query(collection(db, 'internationalNumbers'), orderBy('country')));
  res.json({ success:true, count:snap.size, data:snap.docs.map(docToObj) });
});

// GET /api/contacts/personal/:deviceId
router.get('/personal/:deviceId', async (req, res) => {
  const snap = await getDocs(
    query(collection(db, 'personalContacts'), where('deviceId','==', req.params.deviceId))
  );
  res.json({ success:true, count:snap.size, data:snap.docs.map(docToObj) });
});

// POST /api/contacts/personal
router.post('/personal', async (req, res) => {
  const { device_id, name, number, icon } = req.body;
  if (!device_id || !name || !number)
    return res.status(400).json({ success:false, error:'device_id, name, number required' });
  if (!/^[\d\s+\-()\u0900-\u097F]{6,20}$/.test(number.trim()))
    return res.status(400).json({ success:false, error:'Invalid phone number' });

  const id = uuidv4();
  const data = { deviceId:device_id, name:name.trim(), number:number.trim(), icon:icon||'👤', createdAt:new Date().toISOString() };
  await setDoc(doc(db, 'personalContacts', id), data);
  res.status(201).json({ success:true, data:{ id, ...data } });
});

// DELETE /api/contacts/personal/:id
router.delete('/personal/:id', async (req, res) => {
  const ref = doc(db, 'personalContacts', req.params.id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return res.status(404).json({ success:false, error:'Contact not found' });
  await deleteDoc(ref);
  res.json({ success:true, message:'Contact deleted' });
});

module.exports = router;
