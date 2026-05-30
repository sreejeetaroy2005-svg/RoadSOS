/**
 * ROADSOS — Service Worker
 * Strategy:
 *   - App shell (HTML, Leaflet, fonts) → Cache First
 *   - API calls → Network First with cache fallback
 *   - Emergency data (contacts, firstaid, services) → pre-cached at install
 */

const CACHE_NAME    = 'roadsos-v3';
const API_CACHE     = 'roadsos-api-v3';
const OFFLINE_URL   = '/';

// Resources to pre-cache at install (app shell)
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap',
];

// API endpoints to cache for offline use
const API_PRECACHE = [
  '/api/contacts',
  '/api/contacts/international',
  '/api/firstaid',
  '/api/services?limit=100',
  '/api/health',
];

// ── INSTALL ───────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Cache app shell
      caches.open(CACHE_NAME).then(cache =>
        cache.addAll(PRECACHE_URLS.filter(url => !url.startsWith('http') || url.includes('unpkg') || url.includes('fonts')))
          .catch(() => {}) // Don't fail install if external CDN is slow
      ),
      // Pre-cache API data
      caches.open(API_CACHE).then(async cache => {
        for (const url of API_PRECACHE) {
          try {
            const res = await fetch(url);
            if (res.ok) await cache.put(url, res.clone());
          } catch (_) {
            // Offline during install — skip, will cache on first use
          }
        }
      }),
    ]).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE ──────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== API_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH ─────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and browser-extension requests
  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  // ── API requests: Network First → Cache fallback ──
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithCache(request, API_CACHE));
    return;
  }

  // ── Tile requests (OpenStreetMap): Cache First ──
  if (url.hostname.includes('tile.openstreetmap.org')) {
    event.respondWith(cacheFirst(request, CACHE_NAME));
    return;
  }

  // ── External CDN (Leaflet, Google Fonts): Cache First ──
  if (url.hostname.includes('unpkg.com') || url.hostname.includes('fonts.g')) {
    event.respondWith(cacheFirst(request, CACHE_NAME));
    return;
  }

  // ── App shell: Cache First → Network fallback ──
  event.respondWith(cacheFirst(request, CACHE_NAME));
});

// ── STRATEGIES ────────────────────────────────────────────────

/** Network first, fall back to cache. Updates cache on success. */
async function networkFirstWithCache(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const networkRes = await fetch(request.clone());
    if (networkRes.ok) {
      cache.put(request, networkRes.clone()); // update cache in background
    }
    return networkRes;
  } catch (_) {
    // Network failed — serve from cache
    const cached = await cache.match(request);
    if (cached) return cached;
    // Return a meaningful offline JSON response for API calls
    return new Response(
      JSON.stringify({
        success: false,
        offline: true,
        error: 'You are offline. Showing cached data.',
        data: [],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/** Cache first, fall back to network. Caches new responses. */
async function cacheFirst(request, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const networkRes = await fetch(request.clone());
    if (networkRes.ok) cache.put(request, networkRes.clone());
    return networkRes;
  } catch (_) {
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlinePage = await cache.match(OFFLINE_URL);
      if (offlinePage) return offlinePage;
    }
    return new Response('Offline', { status: 503 });
  }
}

// ── BACKGROUND SYNC (SOS offline queue) ──────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-sos') {
    event.waitUntil(syncOfflineSOS());
  }
  if (event.tag === 'sync-reports') {
    event.waitUntil(syncOfflineReports());
  }
});

async function syncOfflineSOS() {
  // Reads queued SOS events from IndexedDB and retries them
  // (Full IndexedDB implementation would go here in production)
  console.log('[SW] Background sync: SOS events');
}

async function syncOfflineReports() {
  console.log('[SW] Background sync: Incident reports');
}
