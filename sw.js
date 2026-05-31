/**
 * ROADSOS — Service Worker v3
 * Real offline sync using IndexedDB queues.
 * Strategies: Cache First (shell), Network First + cache fallback (API).
 */

const CACHE_NAME  = 'roadsos-v3';
const API_CACHE   = 'roadsos-api-v3';
const DB_NAME     = 'roadsos-offline';
const DB_VERSION  = 1;
const STORE_SOS   = 'sos_queue';
const STORE_RPT   = 'report_queue';

const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
];

const API_PRECACHE = [
  '/api/contacts',
  '/api/contacts/international',
  '/api/firstaid',
  '/api/services?limit=200',
  '/api/health',
];

// ── IndexedDB helpers ─────────────────────────────────────────

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_SOS))
        db.createObjectStore(STORE_SOS, { keyPath: 'id', autoIncrement: true });
      if (!db.objectStoreNames.contains(STORE_RPT))
        db.createObjectStore(STORE_RPT, { keyPath: 'id', autoIncrement: true });
    };
    req.onsuccess = e => resolve(e.target.result);
    req.onerror   = e => reject(e.target.error);
  });
}

function dbGetAll(db, store) {
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).getAll();
    req.onsuccess = e => resolve(e.target.result);
    req.onerror   = e => reject(e.target.error);
  });
}

function dbDelete(db, store, id) {
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(store, 'readwrite');
    const req = tx.objectStore(store).delete(id);
    req.onsuccess = () => resolve();
    req.onerror   = e => reject(e.target.error);
  });
}

// ── INSTALL ───────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then(cache =>
        Promise.allSettled(PRECACHE_URLS.map(url => cache.add(url)))
      ),
      caches.open(API_CACHE).then(async cache => {
        for (const url of API_PRECACHE) {
          try {
            const res = await fetch(url);
            if (res.ok) await cache.put(url, res.clone());
          } catch (_) {}
        }
      }),
    ]).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE ──────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME && k !== API_CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── FETCH ─────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithCache(request, API_CACHE));
    return;
  }
  if (url.hostname.includes('tile.openstreetmap.org') ||
      url.hostname.includes('arcgisonline.com')) {
    event.respondWith(cacheFirst(request, CACHE_NAME));
    return;
  }
  if (url.hostname.includes('unpkg.com') || url.hostname.includes('fonts.g')) {
    event.respondWith(cacheFirst(request, CACHE_NAME));
    return;
  }
  event.respondWith(cacheFirst(request, CACHE_NAME));
});

async function networkFirstWithCache(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(request.clone());
    if (res.ok) cache.put(request, res.clone());
    return res;
  } catch (_) {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response(
      JSON.stringify({ success: false, offline: true, error: 'Offline — showing cached data', data: [] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function cacheFirst(request, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const res = await fetch(request.clone());
    if (res.ok) cache.put(request, res.clone());
    return res;
  } catch (_) {
    if (request.mode === 'navigate') {
      const shell = await cache.match('/');
      if (shell) return shell;
    }
    return new Response('Offline', { status: 503 });
  }
}

// ── BACKGROUND SYNC ───────────────────────────────────────────
self.addEventListener('sync', event => {
  if (event.tag === 'sync-sos')     event.waitUntil(syncOfflineSOS());
  if (event.tag === 'sync-reports') event.waitUntil(syncOfflineReports());
});

/**
 * Reads every queued SOS event from IndexedDB and POSTs it to /api/sos.
 * Removes each item from the queue only after a successful POST.
 */
async function syncOfflineSOS() {
  let db;
  try { db = await openDB(); } catch (_) { return; }

  const items = await dbGetAll(db, STORE_SOS);
  console.log(`[SW] Syncing ${items.length} queued SOS event(s)`);

  for (const item of items) {
    try {
      const res = await fetch('/api/sos', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(item.payload),
      });
      if (res.ok) {
        await dbDelete(db, STORE_SOS, item.id);
        console.log(`[SW] SOS synced and removed from queue: id=${item.id}`);
        // Notify open clients that sync succeeded
        const clients = await self.clients.matchAll();
        clients.forEach(c => c.postMessage({ type: 'SOS_SYNCED', id: item.id }));
      }
    } catch (err) {
      console.warn(`[SW] SOS sync failed (will retry): ${err.message}`);
    }
  }
}

/**
 * Reads every queued incident report from IndexedDB and POSTs it to /api/reports.
 * Removes each item from the queue only after a successful POST.
 */
async function syncOfflineReports() {
  let db;
  try { db = await openDB(); } catch (_) { return; }

  const items = await dbGetAll(db, STORE_RPT);
  console.log(`[SW] Syncing ${items.length} queued report(s)`);

  for (const item of items) {
    try {
      const res = await fetch('/api/reports', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(item.payload),
      });
      if (res.ok) {
        await dbDelete(db, STORE_RPT, item.id);
        console.log(`[SW] Report synced and removed from queue: id=${item.id}`);
        const clients = await self.clients.matchAll();
        clients.forEach(c => c.postMessage({ type: 'REPORT_SYNCED', id: item.id }));
      }
    } catch (err) {
      console.warn(`[SW] Report sync failed (will retry): ${err.message}`);
    }
  }
}
