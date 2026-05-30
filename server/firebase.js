/**
 * ROADSOS — Firebase initialisation (backend)
 *
 * We use the Firebase CLIENT SDK on the backend (not Admin SDK) because:
 *  - Firestore is in TEST MODE (open rules) — no service account needed
 *  - No gcloud CLI or key file required
 *  - Works identically to the frontend SDK
 *
 * In production you would switch to firebase-admin with a service account key.
 */

const { initializeApp, getApps } = require('firebase/app');
const {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} = require('firebase/firestore');

const firebaseConfig = {
  apiKey:            process.env.FIREBASE_API_KEY,
  authDomain:        process.env.FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.FIREBASE_PROJECT_ID,
  storageBucket:     process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.FIREBASE_APP_ID,
};

// Initialise only once (important for hot-reload / --watch)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db  = getFirestore(app);

module.exports = {
  db,
  collection, doc,
  getDoc, getDocs,
  addDoc, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit,
  serverTimestamp,
};
