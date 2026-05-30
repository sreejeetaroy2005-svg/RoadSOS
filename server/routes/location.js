/**
 * ROADSOS — /api/location  (no DB needed — pure logic)
 */
const express = require('express');
const router  = express.Router();

function mockReverseGeocode(lat, lng) {
  if (lat >= 28.4 && lat <= 28.9 && lng >= 76.8 && lng <= 77.5) {
    if (lat > 28.65) return { city:'Delhi',     area:'North Delhi',          state:'Delhi',     pincode:'110009' };
    if (lat > 28.55) return { city:'Delhi',     area:'Central Delhi',        state:'Delhi',     pincode:'110001' };
    if (lat > 28.48) return { city:'Gurugram',  area:'Sector 29, Gurugram',  state:'Haryana',   pincode:'122001' };
    return              { city:'Faridabad', area:'Sector 15, Faridabad', state:'Haryana',   pincode:'121007' };
  }
  if (lat >= 18.8 && lat <= 19.3 && lng >= 72.7 && lng <= 73.1)
    return { city:'Mumbai',    area:'Andheri West',  state:'Maharashtra', pincode:'400058' };
  if (lat >= 12.8 && lat <= 13.2 && lng >= 77.4 && lng <= 77.8)
    return { city:'Bengaluru', area:'Koramangala',   state:'Karnataka',   pincode:'560034' };
  if (lat >= 12.9 && lat <= 13.2 && lng >= 80.1 && lng <= 80.3)
    return { city:'Chennai',   area:'Anna Nagar',    state:'Tamil Nadu',  pincode:'600040' };
  if (lat >= 17.2 && lat <= 17.6 && lng >= 78.3 && lng <= 78.7)
    return { city:'Hyderabad', area:'Banjara Hills', state:'Telangana',   pincode:'500034' };
  return { city:'India', area:`Near ${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E`, state:'Unknown', pincode:'000000' };
}

router.post('/reverse', (req, res) => {
  const { lat, lng } = req.body;
  if (!lat || !lng) return res.status(400).json({ success:false, error:'lat and lng required' });
  const p = { lat: parseFloat(lat), lng: parseFloat(lng) };
  if (isNaN(p.lat) || isNaN(p.lng)) return res.status(400).json({ success:false, error:'Invalid coordinates' });
  const geo = mockReverseGeocode(p.lat, p.lng);
  res.json({ success:true, data: { ...p, address:`${geo.area}, ${geo.city}, ${geo.state} — ${geo.pincode}`, ...geo, maps_url:`https://maps.google.com/?q=${p.lat},${p.lng}` } });
});

router.post('/cache', (req, res) => {
  const { device_id, lat, lng, address, accuracy } = req.body;
  if (!device_id || !lat || !lng) return res.status(400).json({ success:false, error:'device_id, lat, lng required' });
  res.json({ success:true, message:'Location noted', data:{ device_id, lat:parseFloat(lat), lng:parseFloat(lng), address, accuracy, cached_at:new Date().toISOString() } });
});

module.exports = router;
