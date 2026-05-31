# 🚨 ROADSOS — Road Accident Emergency Assistance

> A production-ready emergency assistance PWA built for hackathon submission.
> Helps road accident victims and bystanders instantly find nearby emergency services,
> share live location, and access first-aid guidance — even when fully offline.

---

## 📸 Features at a Glance

| Feature | Status |
|---|---|
| One-tap SOS with live GPS | ✅ |
| Live Leaflet.js map — street + satellite toggle | ✅ |
| Nearby services sorted by real GPS distance (server-side Haversine) | ✅ |
| Firebase Firestore backend | ✅ |
| PWA — installable, works fully offline | ✅ |
| Service Worker with Cache First + Network First strategies | ✅ |
| **Real offline sync — IndexedDB queue + Background Sync API** | ✅ |
| **Real reverse geocoding via OpenStreetMap Nominatim** | ✅ |
| Global services: 8 countries, 88 total services | ✅ |
| Error handling (try/catch) on every API route | ✅ |
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
| Map | Leaflet.js + OpenStreetMap + ArcGIS Satellite |
| Geocoding | OpenStreetMap Nominatim (free, no API key) |
| Backend | Node.js + Express |
| Database | Firebase Firestore |
| Offline | Service Worker + Cache API + IndexedDB (PWA) |
| Voice | Web Speech API |
| Fonts | Space Grotesk + Inter + JetBrains Mono |

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18 or higher
- A Firebase project with Firestore enabled in **test mode**

### 1. Clone and install

```bash
cd road_sos
cp .env.example .env        # fill in your Firebase credentials
npm install
```

### 2. Seed Firestore (first time only)

```bash
npm run seed              # India services + contacts + first aid
npm run seed:global       # 7 international cities (USA, UK, AU, UAE, SG, DE, JP)
npm run seed:bengaluru    # Bengaluru-specific services
```

### 3. Start the server

```bash
npm start
```

Open **http://localhost:3000** in Chrome or Edge.

### Development (auto-restart)

```bash
npm run dev
```

---

## 📁 Project Structure

```
road_sos/
├── index.html              ← Full frontend (HTML + CSS + JS)
├── manifest.json           ← PWA manifest
├── sw.js                   ← Service Worker (offline + IndexedDB sync)
├── server.js               ← Express entry point
├── package.json
├── .env                    ← Your Firebase credentials (gitignored)
├── .env.example            ← Template for new contributors
│
├── server/
│   ├── firebase.js         ← Firebase client SDK init
│   ├── seed.js             ← India data seed
│   ├── seed_global.js      ← Global cities seed
│   ├── seed_bengaluru.js   ← Bengaluru seed
│   └── routes/
│       ├── services.js     ← /api/services (with Haversine nearby)
│       ├── contacts.js     ← /api/contacts
│       ├── sos.js          ← /api/sos
│       ├── reports.js      ← /api/reports
│       ├── firstaid.js     ← /api/firstaid
│       ├── location.js     ← /api/location/reverse (Nominatim)
│       └── config.js       ← /api/config
```

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Server health check |
| GET | `/api/services?lat=&lng=` | All services, sorted by distance |
| GET | `/api/services/nearby?lat=&lng=&radius=` | Nearest services (Haversine) |
| GET | `/api/services/:id` | Single service |
| POST | `/api/services` | Add new service |
| PUT | `/api/services/:id` | Update status/rating |
| GET | `/api/contacts` | National emergency numbers |
| GET | `/api/contacts/international` | 18 country numbers |
| GET | `/api/contacts/personal/:deviceId` | User's saved contacts |
| POST | `/api/contacts/personal` | Save a contact |
| DELETE | `/api/contacts/personal/:id` | Delete a contact |
| POST | `/api/sos` | Trigger SOS event |
| GET | `/api/sos` | List SOS events |
| PUT | `/api/sos/:id/resolve` | Mark resolved |
| POST | `/api/reports` | Submit accident report |
| GET | `/api/reports` | List reports |
| PUT | `/api/reports/:id` | Update status |
| GET | `/api/firstaid` | All 6 first-aid guides |
| POST | `/api/location/reverse` | Reverse geocode (Nominatim) |
| GET | `/api/config` | Public Firebase config |

---

## 🔥 Firebase Collections

| Collection | Documents | Description |
|---|---|---|
| `services` | **88** | 34 India + 31 global + 23 Bengaluru |
| `emergencyContacts` | 10 | India national numbers |
| `internationalNumbers` | 18 | Global emergency numbers |
| `firstAid` | 6 | Step-by-step first-aid guides |
| `personalContacts` | grows | User-saved contacts |
| `sosEvents` | grows | Every SOS tap logged |
| `incidentReports` | grows | Accident report submissions |

---

## 🌍 Global Coverage

Services across **8 countries, 4 continents**:

| Country | City | Services |
|---|---|---|
| 🇮🇳 India | Delhi, Gurugram, Bengaluru | 57 |
| 🇺🇸 USA | New York | 5 |
| 🇬🇧 UK | London | 5 |
| 🇦🇺 Australia | Sydney | 4 |
| 🇦🇪 UAE | Dubai | 5 |
| 🇸🇬 Singapore | Singapore | 4 |
| 🇩🇪 Germany | Berlin | 4 |
| 🇯🇵 Japan | Tokyo | 4 |

International emergency numbers: 18 countries including France, China, Brazil, South Africa, New Zealand, Italy, Spain, Russia, Malaysia, Canada.

---

## 📴 Offline Mode — How It Works

### What works with zero internet

| Feature | Mechanism |
|---|---|
| Full app loads | Service Worker Cache First |
| Emergency contacts | Cached in localStorage + SW cache |
| First-aid guides | Cached in localStorage + SW cache |
| Services list | Cached in localStorage + SW cache |
| Last GPS location | localStorage |
| SOS button | `tel:112` — uses device dialer, no internet needed |
| Call/SMS buttons | `tel:` / `sms:` — device dialer |
| SOS event logging | **IndexedDB queue → syncs when back online** |
| Incident reports | **IndexedDB queue → syncs when back online** |

### Real offline sync (IndexedDB + Background Sync API)

When the network is unavailable:
1. SOS tap → payload written to `sos_queue` in IndexedDB
2. Report submit → payload written to `report_queue` in IndexedDB
3. Background Sync tag registered (`sync-sos`, `sync-reports`)
4. When connectivity returns → Service Worker reads the queue, POSTs each item to the API, removes successful items
5. Open browser tabs receive a `postMessage` notification confirming sync

### PWA — Install on phone

- Android Chrome: **Add to Home Screen** in browser menu
- iOS Safari: **Share → Add to Home Screen**
- Home screen shortcuts: Call 112 and Call Ambulance 108 directly

---

## 🗺 Map Features

- **Street view** (OpenStreetMap) and **Satellite view** (ArcGIS) — toggle with 🗺️/🛰️ button
- Dark-themed map with custom CSS filter
- Color-coded markers per service category
- Blue pulsing dot for live user location
- Popup on each marker: name, phone, status
- Works offline for previously viewed areas (tiles cached by SW)

---

## 🌐 Reverse Geocoding

Uses **OpenStreetMap Nominatim** — free, no API key required.
- Endpoint: `https://nominatim.openstreetmap.org/reverse`
- Returns: city, area/suburb, state, postcode, country
- Works for any location worldwide
- Falls back to bounding-box approximation if Nominatim is unreachable

---

## 🎙 Voice Commands

| Say | Action |
|---|---|
| "Send SOS" | Activates SOS modal |
| "Find hospital" | Filters to hospitals |
| "Call police" | Dials 100 |
| "Call ambulance" | Dials 108 |
| "Show towing" | Filters to towing |
| "My location" | Refreshes GPS |
| "First aid" | Scrolls to first-aid |
| "Map" | Scrolls to live map |

---

## 🛡 Error Handling

Every API route is wrapped in `try/catch`. Firestore timeouts or quota errors return clean JSON (`500`) instead of crashing the process. The SOS POST endpoint returns `201` even if Firestore is down — SOS must never fail.

---

## 🏆 Hackathon Evaluation Criteria

| Criterion | Implementation |
|---|---|
| **Reliability & data accuracy** | Firebase Firestore, real phone numbers, Nominatim geocoding, try/catch on every route |
| **Number of contacts fetched** | 88 services + 10 national + 18 international = **116 contacts** |
| **Offline functionality** | SW Cache First/Network First + IndexedDB queue + Background Sync — full offline with real sync |
| **Innovation** | Live map with satellite toggle, voice commands, nearest hospital in SOS, real-time GPS, background sync |
| **Information integration across countries** | 8 countries with real services + 18 countries with emergency numbers |

---

## 📱 Browser Support

| Browser | GPS | Voice | PWA | Offline | Background Sync |
|---|---|---|---|---|---|
| Chrome 90+ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edge 90+ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Firefox 90+ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Safari iOS 15+ | ✅ | ❌ | ✅ | ✅ | ❌ |
| Samsung Internet | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## ⚠️ Disclaimer

This app provides emergency assistance information only. Always call official emergency services (**112**) first. ROADSOS is not a substitute for professional medical or law enforcement response.

---

## 📄 License

MIT — built for hackathon demonstration purposes.
