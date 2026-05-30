/**
 * ROADSOS — /api/firstaid  (Firestore)
 */
const express = require('express');
const router  = express.Router();
const { db, collection, doc, getDoc, getDocs } = require('../firebase');

function docToObj(d) { return { id: d.id, ...d.data() }; }

router.get('/', async (req, res) => {
  const snap = await getDocs(collection(db, 'firstAid'));
  res.json({ success:true, count:snap.size, data:snap.docs.map(docToObj) });
});

router.get('/:id', async (req, res) => {
  const snap = await getDoc(doc(db, 'firstAid', req.params.id));
  if (!snap.exists()) return res.status(404).json({ success:false, error:'Not found' });
  res.json({ success:true, data:docToObj(snap) });
});

module.exports = router;
