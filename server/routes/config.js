/**
 * ROADSOS — /api/config
 * Serves public client-side configuration from environment variables.
 * Only exposes values that are safe to be public (Firebase web config is
 * designed to be public — security is enforced by Firestore rules).
 */
const express = require('express');
const router  = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    firebase: {
      apiKey:            process.env.FIREBASE_API_KEY,
      authDomain:        process.env.FIREBASE_AUTH_DOMAIN,
      projectId:         process.env.FIREBASE_PROJECT_ID,
      storageBucket:     process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId:             process.env.FIREBASE_APP_ID,
    },
    app: {
      name:    'ROADSOS',
      version: process.env.npm_package_version || '2.0.0',
      env:     process.env.NODE_ENV || 'development',
    },
  });
});

module.exports = router;
