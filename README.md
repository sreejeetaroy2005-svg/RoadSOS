# 🚨 ROADSOS — Road Accident Emergency Assistance

> A production-ready emergency assistance web app built for hackathon submission.
> Helps road accident victims and bystanders instantly find nearby emergency services,
> share live location, and access first-aid guidance — even when fully offline.

---

## 📸 Features at a Glance

| Feature | Status |
|---|---|
| One-tap SOS with live GPS | ✅ |
| Live Leaflet.js map (OpenStreetMap) | ✅ |
| Nearby services sorted by real GPS distance | ✅ |
| Firebase Firestore backend | ✅ |
| **PWA — installable, works fully offline** | ✅ |
| **Service Worker with cache strategies** | ✅ |
| **Global services: 7 countries, 65 total** | ✅ |
| **Error handling on all API routes** | ✅ |
| Voice commands (Web Speech API) | ✅ |
| First-aid quick guide | ✅ |
| Incident report form | ✅ |
| International emergency numbers (18 countries) | ✅ |
| Dark/light theme toggle | ✅ |
| Mobile-first responsive design | ✅ |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Pure HTML, CSS, Vanilla JavaScript |
| Map | Leaflet.js + OpenStreetMap (no API key needed) |
| Backend | Node.js + Express |
| Database | Firebase Firestore |
| Offline | Service Worker + Cache API (PWA) |
| Voice | Web Speech API |
| Fonts | Space Grotesk + Inter + JetBrains Mono |

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18 or higher
- A Firebase project with Firestore enabled in **test mode**

### 1. Install dependencies

```bash
cd road_sos
npm install
```

### 2. Seed Firestore (first time only)

```bash
# Seed India services + contacts + first aid
npm run seed

# Seed global services (7 countries)
npm run seed:global
```

### 3. Start the server

```bash
npm start
```

Open **http://localhost:3000** in Chrome or Edge.

### Development (auto-restart on file changes)

```bash
npm run dev
```

---

## 📁 Project Structure

```
road_sos/
├── index.html              ← Full frontend (HTML + CSS + JS)
├── manifest.json           ← PWA manifest (installable app)
├── sw.js                   ← Service Worker (offline support)
├── server.js               ← Express server entry point
├── package.json
├── .env                    ← Firebase + server config
│
├── server/
│   ├── firebase.js         ← Firebase client SDK init
│   ├── seed.js             ← India data seed (run once)
│   ├── seed_global.js      ← Global data seed (run once)
│   └── routes/
│       ├── services.js     ← /api/services
│       ├── contacts.js     ← /api/contacts
│       ├── sos.js          ← /api/sos
│       ├── reports.js      ← /api/reports
│       ├── firstaid.js     ← /api/firstaid
│       └── location.js     ← /api/location/reverse
```

---

## 🔌 API Reference

### Health
```
GET /api/health
```

### Emergency Services
```
GET  /api/services                    List all (65 services, 7 countries)
GET  /api/services?category=hospital  Filter by category
GET  /api/services?lat=28.6&lng=77.2  Sort by GPS distance (Haversine)
GET  /api/services?q=aiims            Search by name/area/city
GET  /api/services/nearby?lat=&lng=   Nearest services within radius
GET  /api/services/:id                Single service
POST /api/services                    Add new service
PUT  /api/services/:id                Update status/rating
```

### Contacts
```
GET    /api/contacts                        National emergency numbers (India)
GET    /api/contacts/international          18 country numbers
GET    /api/contacts/personal/:deviceId     User's saved contacts
POST   /api/contacts/personal               Save a contact
DELETE /api/contacts/personal/:id           Delete a contact
```

### SOS Events
```
POST /api/sos                  Trigger SOS (logs to Firestore)
GET  /api/sos                  List all SOS events
GET  /api/sos/:id              Single event
PUT  /api/sos/:id/resolve      Mark resolved
PUT  /api/sos/:id/false        Mark as false alarm
```

### Incident Reports
```
POST /api/reports              Submit accident report
GET  /api/reports              List all reports
GET  /api/reports/:id          Single report
PUT  /api/reports/:id          Update status
```

### First Aid
```
GET /api/firstaid              All 6 first-aid guides
GET /api/firstaid/:id          Single guide
```

### Location
```
POST /api/location/reverse     Reverse geocode lat/lng → address
POST /api/location/cache       Cache device location
```

---

## 🔥 Firebase Collections

| Collection | Documents | Description |
|---|---|---|
| `services` | **65** | 34 India + 31 global (7 countries) |
| `emergencyContacts` | 10 | India national numbers (112, 108, 100…) |
| `internationalNumbers` | 18 | Global emergency numbers |
| `firstAid` | 6 | Step-by-step first-aid guides |
| `personalContacts` | grows | User-saved contacts (per device ID) |
| `sosEvents` | grows | Every SOS tap logged with GPS + timestamp |
| `incidentReports` | grows | Accident report form submissions |

---

## 🌍 Global Coverage

Services are seeded for **7 countries across 4 continents**:

| Country | City | Services |
|---|---|---|
| 🇮🇳 India | Delhi, Gurugram, Bengaluru | 34 |
| 🇺🇸 USA | New York | 5 |
| 🇬🇧 UK | London | 5 |
| 🇦🇺 Australia | Sydney | 4 |
| 🇦🇪 UAE | Dubai | 5 |
| 🇸🇬 Singapore | Singapore | 4 |
| 🇩🇪 Germany | Berlin | 4 |
| 🇯🇵 Japan | Tokyo | 4 |

Each entry has the correct local emergency number, real GPS coordinates, and real phone numbers.

---

## 📴 Offline Mode — How It Works

This is the most important feature for the hackathon brief.

### What happens without internet

1. **Service Worker intercepts all requests** before they hit the network.
2. **App shell** (HTML, CSS, JS, Leaflet, fonts) → served from **Cache First** — loads in milliseconds, zero network needed.
3. **API calls** (`/api/services`, `/api/contacts`, `/api/firstaid`) → **Network First with cache fallback** — tries the server, but if offline, returns the last cached response automatically.
4. **Map tiles** (OpenStreetMap) → **Cache First** — previously viewed map areas load offline.

### What works with zero internet
- Full app loads (HTML, CSS, JS)
- All emergency contacts visible
- All first-aid guides accessible
- Last known GPS location shown
- SOS button works (calls `tel:112` directly)
- Call and SMS buttons work (use device dialer)
- Incident reports saved to localStorage, synced when back online

### PWA — Install on phone
The app is installable as a Progressive Web App:
- Android Chrome: tap **"Add to Home Screen"** in the browser menu
- iOS Safari: tap **Share → Add to Home Screen**
- Home screen shortcuts: **Call 112** and **Call Ambulance 108** directly from the icon

### Service Worker strategies

| Request type | Strategy | Behaviour |
|---|---|---|
| App shell (`/`, CSS, JS) | Cache First | Instant load, no network needed |
| API calls (`/api/*`) | Network First + Cache | Live data when online, cached when offline |
| Map tiles (OSM) | Cache First | Viewed areas work offline |
| External CDN (Leaflet, fonts) | Cache First | Cached after first load |

---

## 🛡 Error Handling

Every API route handler is wrapped in `try/catch`. If Firestore has a timeout, quota error, or network blip:

- All routes return a clean JSON error response (`500` with `{ success: false, error: "..." }`)
- The Express process **never crashes**
- The SOS POST endpoint has a special rule: even if Firestore is completely unreachable, it still returns `201` with the emergency numbers — **SOS must never fail**

---

## 🗺 Map Features

- OpenStreetMap tiles via Leaflet.js — **no API key needed**
- Dark-themed map with custom CSS filter
- Color-coded markers per service category
- Blue pulsing dot for live user location
- Popup on each marker: name, phone, status
- Works offline for previously viewed areas

---

## 🎙 Voice Commands

Tap the microphone or click any command chip:

| Say | Action |
|---|---|
| "Send SOS" | Activates SOS modal |
| "Find hospital" | Filters to hospitals |
| "Call police" | Dials 100 |
| "Call ambulance" | Dials 108 |
| "Show towing" | Filters to towing services |
| "My location" | Refreshes GPS |
| "First aid" | Scrolls to first-aid section |
| "Map" | Scrolls to live map |

> Works best in Chrome and Edge. Requires microphone permission.

---

## 🏆 Hackathon Evaluation Criteria

| Criterion | What was built |
|---|---|
| **Reliability & data accuracy** | Firebase Firestore backend, real phone numbers, Haversine distance sorting, try/catch on every route |
| **Number of contacts fetched** | 65 services + 10 national + 18 international = **93 contacts** |
| **Offline functionality** | Service Worker with Cache First + Network First strategies. Full app loads offline after first visit. PWA installable. |
| **Innovation** | Live map, voice commands, nearest hospital auto-detection in SOS, real-time GPS, background sync |
| **Information integration across countries** | 7 countries with real services + 18 countries with emergency numbers |

---

## 📱 Browser Support

| Browser | GPS | Voice | PWA Install | Offline |
|---|---|---|---|---|
| Chrome 90+ | ✅ | ✅ | ✅ | ✅ |
| Edge 90+ | ✅ | ✅ | ✅ | ✅ |
| Firefox 90+ | ✅ | ❌ | ❌ | ✅ |
| Safari iOS 15+ | ✅ | ❌ | ✅ (Add to HS) | ✅ |
| Samsung Internet | ✅ | ✅ | ✅ | ✅ |

---

## ⚠️ Disclaimer

This app provides emergency assistance information only. Always call official emergency services (**112**) first. Data shown is for demonstration purposes. ROADSOS is not a substitute for professional medical or law enforcement response.

---

## 📄 License

MIT — built for hackathon demonstration purposes.
