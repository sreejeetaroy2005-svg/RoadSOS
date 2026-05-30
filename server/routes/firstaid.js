/**
 * ROADSOS — /api/firstaid  (Firestore, with full error handling)
 */
const express = require('express');
const router  = express.Router();
const { db, collection, doc, getDoc, getDocs } = require('../firebase');

function docToObj(d) { return { id: d.id, ...d.data() }; }

router.get('/', async (req, res) => {
  try {
    const snap = await getDocs(collection(db,'firstAid'));
    res.json({ success:true, count:snap.size, data:snap.docs.map(docToObj) });
  } catch (err) {
    console.error('GET /firstaid:', err.message);
    res.status(500).json({ success:false, error:'Failed to fetch first aid data' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const snap = await getDoc(doc(db,'firstAid',req.params.id));
    if (!snap.exists()) return res.status(404).json({ success:false, error:'Not found' });
    res.json({ success:true, data:docToObj(snap) });
  } catch (err) {
    console.error('GET /firstaid/:id:', err.message);
    res.status(500).json({ success:false, error:'Failed to fetch first aid tip' });
  }
});

module.exports = router;
