# 🚨 ROADSOS — Road Accident Emergency Assistance

> A production-ready emergency assistance web app built for hackathon submission.  
> Helps road accident victims and bystanders instantly find nearby emergency services, share live location, and access first-aid guidance — even offline.

---

## 📸 Features at a Glance

| Feature | Status |
|---|---|
| One-tap SOS with live GPS | ✅ |
| Live Leaflet.js map (OpenStreetMap) | ✅ |
| Nearby services sorted by real distance | ✅ |
| Firebase Firestore backend | ✅ |
| Offline mode with localStorage cache | ✅ |
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
| Map | Leaflet.js + OpenStreetMap |
| Backend | Node.js + Express |
| Database | Firebase Firestore |
| Voice | Web Speech API |
| Fonts | Inter + JetBrains Mono (Google Fonts) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18 or higher
- A Firebase project with Firestore enabled in **test mode**

### 1. Clone / open the project

```bash
cd road_sos
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

The `.env` file is already set up with the project's Firebase credentials:

```env
PORT=3000
FIREBASE_PROJECT_ID=roadsos-24b26
FIREBASE_API_KEY=...
```

To use your own Firebase project, update `.env` with your config values.

### 4. Seed Firestore (first time only)

```bash
npm run seed
```

This writes all 68 documents to Firestore:
- 34 emergency services
- 10 national emergency contacts
- 18 international numbers
- 6 first-aid guides

### 5. Start the server

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
├── index.html              ← Full frontend (HTML + CSS + JS, single file)
├── server.js               ← Express server entry point
├── package.json
├── .env                    ← Firebase + server config
│
├── server/
│   ├── firebase.js         ← Firebase client SDK initialisation
│   ├── seed.js             ← One-time Firestore seed script
│   └── routes/
│       ├── services.js     ← /api/services
│       ├── contacts.js     ← /api/contacts
│       ├── sos.js          ← /api/sos
│       ├── reports.js      ← /api/reports
│       ├── firstaid.js     ← /api/firstaid
│       └── location.js     ← /api/location/reverse
│
└── data/                   ← (legacy SQLite, no longer used)
```

---

## 🔌 API Reference

### Health
```
GET /api/health
```

### Emergency Services
```
GET  /api/services                    List all services
GET  /api/services?category=hospital  Filter by category
GET  /api/services?lat=28.6&lng=77.2  Sort by distance
GET  /api/services?q=aiims            Search by name/area
GET  /api/services/nearby?lat=&lng=   Nearest services (Haversine)
GET  /api/services/:id                Single service
POST /api/services                    Add new service
PUT  /api/services/:id                Update status/rating
```

### Contacts
```
GET    /api/contacts                        National emergency numbers
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
| `services` | 34 | Hospitals, ambulance, police, towing, puncture, trauma |
| `emergencyContacts` | 10 | India national numbers (112, 108, 100…) |
| `internationalNumbers` | 18 | Global emergency numbers |
| `firstAid` | 6 | Step-by-step first-aid guides |
| `personalContacts` | grows | User-saved contacts (per device ID) |
| `sosEvents` | grows | Every SOS tap logged with GPS + timestamp |
| `incidentReports` | grows | Accident report form submissions |

View live data: [Firebase Console → Firestore](https://console.firebase.google.com/project/roadsos-24b26/firestore)

---

## 🗺 Map Features

- **OpenStreetMap** tiles via Leaflet.js (no API key needed)
- Dark-themed map with custom CSS filter
- Color-coded markers per service category
- Blue pulsing dot for live user location
- Popup on each marker: name, phone, status
- "Center on me" button

---

## 🎙 Voice Commands

Tap the microphone button or click any command chip:

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

> Voice works best in Chrome and Edge. Requires microphone permission.

---

## 📴 Offline Mode

When internet is unavailable:
- Orange banner appears: **"OFFLINE MODE ACTIVE"**
- Alert popup notifies the user
- All emergency data (services, contacts, first-aid) remains accessible from localStorage cache
- Last known GPS location is shown from cache
- SOS, call, and SMS buttons still work (they use `tel:` and `sms:` links)
- Incident reports are saved locally and can sync when back online

---

## 📱 Browser Support

| Browser | Support |
|---|---|
| Chrome 90+ | ✅ Full (GPS, Voice, Share) |
| Edge 90+ | ✅ Full |
| Firefox 90+ | ✅ Partial (no voice) |
| Safari iOS 15+ | ✅ Partial (no voice) |
| Samsung Internet | ✅ Partial |

---

## 🏆 Hackathon Evaluation Criteria

| Criterion | Implementation |
|---|---|
| **Reliability & data accuracy** | Firebase Firestore backend, real Indian emergency numbers, Haversine distance sorting |
| **Number of contacts fetched** | 34 services + 10 national + 18 international = 62 contacts |
| **Offline functionality** | localStorage cache, offline banner, all data accessible without network |
| **Innovation** | Live map, voice commands, nearest hospital auto-detection in SOS, real-time GPS |
| **Information integration across countries** | 18 countries with correct emergency numbers |

---

## ⚠️ Disclaimer

This app provides emergency assistance information only. Always call official emergency services (**112**) first. Data shown is for demonstration purposes. ROADSOS is not a substitute for professional medical or law enforcement response.

---

## 📄 License

MIT — built for hackathon demonstration purposes.
