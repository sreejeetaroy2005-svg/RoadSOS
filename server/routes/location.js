/**
 * ROADSOS — /api/location
 * Real reverse geocoding via OpenStreetMap Nominatim (free, no API key).
 * Falls back to bounding-box mock if Nominatim is unreachable.
 */
const express = require('express');
const router  = express.Router();

// ── Real Nominatim reverse geocoder ──────────────────────────
async function nominatimReverse(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`;
  const res = await fetch(url, {
    headers: {
      'User-Agent':    'ROADSOS/2.0 (road-accident-emergency-app)',
      'Accept-Language': 'en',
    },
    signal: AbortSignal.timeout(5000), // 5s timeout
  });
  if (!res.ok) throw new Error(`Nominatim HTTP ${res.status}`);
  const data = await res.json();

  const addr = data.address || {};
  const city =
    addr.city || addr.town || addr.village || addr.county || addr.state_district || 'Unknown';
  const area =
    addr.suburb || addr.neighbourhood || addr.road || addr.quarter || city;
  const state   = addr.state || 'Unknown';
  const pincode = addr.postcode || '000000';
  const country = addr.country || 'Unknown';
  const address = [area, city, state, pincode].filter(Boolean).join(', ');

  return { city, area, state, pincode, country, address };
}

// ── Bounding-box fallback (used only when Nominatim is unreachable) ──
function mockReverseGeocode(lat, lng) {
  if (lat >= 28.4 && lat <= 28.9 && lng >= 76.8 && lng <= 77.5) {
    if (lat > 28.65) return { city:'Delhi',     area:'North Delhi',          state:'Delhi',     pincode:'110009', country:'India' };
    if (lat > 28.55) return { city:'Delhi',     area:'Central Delhi',        state:'Delhi',     pincode:'110001', country:'India' };
    if (lat > 28.48) return { city:'Gurugram',  area:'Sector 29, Gurugram',  state:'Haryana',   pincode:'122001', country:'India' };
    return              { city:'Faridabad', area:'Sector 15, Faridabad', state:'Haryana',   pincode:'121007', country:'India' };
  }
  if (lat >= 12.7 && lat <= 13.2 && lng >= 77.4 && lng <= 77.8)
    return { city:'Bengaluru', area:'Bengaluru',    state:'Karnataka',   pincode:'560001', country:'India' };
  if (lat >= 18.8 && lat <= 19.3 && lng >= 72.7 && lng <= 73.1)
    return { city:'Mumbai',    area:'Mumbai',        state:'Maharashtra', pincode:'400001', country:'India' };
  if (lat >= 12.9 && lat <= 13.2 && lng >= 80.1 && lng <= 80.3)
    return { city:'Chennai',   area:'Chennai',       state:'Tamil Nadu',  pincode:'600001', country:'India' };
  if (lat >= 17.2 && lat <= 17.6 && lng >= 78.3 && lng <= 78.7)
    return { city:'Hyderabad', area:'Hyderabad',     state:'Telangana',   pincode:'500001', country:'India' };
  if (lat >= 18.4 && lat <= 18.7 && lng >= 73.7 && lng <= 74.0)
    return { city:'Pune',      area:'Pune',          state:'Maharashtra', pincode:'411001', country:'India' };
  return { city:'Unknown', area:`${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E`, state:'Unknown', pincode:'000000', country:'Unknown' };
}

// POST /api/location/reverse
router.post('/reverse', async (req, res) => {
  const { lat, lng } = req.body;
  if (!lat || !lng)
    return res.status(400).json({ success: false, error: 'lat and lng are required' });

  const p = { lat: parseFloat(lat), lng: parseFloat(lng) };
  if (isNaN(p.lat) || isNaN(p.lng))
    return res.status(400).json({ success: false, error: 'lat and lng must be valid numbers' });

  let geo;
  try {
    // Try real Nominatim first
    geo = await nominatimReverse(p.lat, p.lng);
  } catch (err) {
    console.warn('[location/reverse] Nominatim failed, using fallback:', err.message);
    const mock = mockReverseGeocode(p.lat, p.lng);
    geo = { ...mock, address: `${mock.area}, ${mock.city}, ${mock.state} — ${mock.pincode}` };
  }

  res.json({
    success: true,
    data: {
      lat:      p.lat,
      lng:      p.lng,
      address:  geo.address || `${geo.area}, ${geo.city}, ${geo.state}`,
      city:     geo.city,
      area:     geo.area,
      state:    geo.state,
      pincode:  geo.pincode,
      country:  geo.country,
      maps_url: `https://maps.google.com/?q=${p.lat},${p.lng}`,
    },
  });
});

// POST /api/location/cache
router.post('/cache', (req, res) => {
  const { device_id, lat, lng, address, accuracy } = req.body;
  if (!device_id || !lat || !lng)
    return res.status(400).json({ success: false, error: 'device_id, lat, lng required' });
  res.json({
    success: true,
    message: 'Location noted',
    data: { device_id, lat: parseFloat(lat), lng: parseFloat(lng), address, accuracy, cached_at: new Date().toISOString() },
  });
});

module.exports = router;
