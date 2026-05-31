/**
 * ============================================================
 *  ROADSOS — Road Accident Emergency Assistance
 *  Backend: Node.js + Express + Firebase Firestore
 * ============================================================
 */

require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── MIDDLEWARE ───────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── STATIC ───────────────────────────────────────────────────
app.use(express.static(path.join(__dirname)));

// ── API ROUTES ───────────────────────────────────────────────
app.use('/api/services',  require('./server/routes/services'));
app.use('/api/contacts',  require('./server/routes/contacts'));
app.use('/api/sos',       require('./server/routes/sos'));
app.use('/api/reports',   require('./server/routes/reports'));
app.use('/api/firstaid',  require('./server/routes/firstaid'));
app.use('/api/location',  require('./server/routes/location'));
app.use('/api/config',    require('./server/routes/config'));

app.get('/api/health', (req, res) => {
  res.json({ success:true, status:'ok', app:'ROADSOS', db:'Firebase Firestore',
             projectId: process.env.FIREBASE_PROJECT_ID,
             version:'2.0.0', timestamp: new Date().toISOString(),
             uptime_seconds: Math.floor(process.uptime()) });
});

app.use('/api/*path', (req, res) => {
  res.status(404).json({ success:false, error:`${req.method} ${req.originalUrl} not found` });
});

app.get('*path', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.use((err, req, res, _next) => {
  console.error('❌', err.message);
  res.status(500).json({ success:false, error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message });
});

// ── START ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('🔥 ============================================');
  console.log('   ROADSOS — Firebase Firestore Backend');
  console.log('🔥 ============================================');
  console.log(`   App     : http://localhost:${PORT}`);
  console.log(`   API     : http://localhost:${PORT}/api/health`);
  console.log(`   Project : ${process.env.FIREBASE_PROJECT_ID}`);
  console.log('🔥 ============================================');
  console.log('');
});

module.exports = app;
