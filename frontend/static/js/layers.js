/**
 * City Life - Layers Module
 * Manages toggleable layers and builds custom Leaflet layers and overlays.
 */

export class LayerManager {
  constructor(map, onPlaceSelect) {
    this.map = map;
    this.onPlaceSelect = onPlaceSelect;

    // Active layer groups
    this.layerGroups = {
      attractions: L.markerClusterGroup({ maxClusterRadius: 40 }),
      food: L.markerClusterGroup({ maxClusterRadius: 40 }),
      hotels: L.markerClusterGroup({ maxClusterRadius: 40 }),
      heritage: L.markerClusterGroup({ maxClusterRadius: 40 }),
      budget: L.markerClusterGroup({ maxClusterRadius: 40 }),
      emergency: L.markerClusterGroup({ maxClusterRadius: 40 }),
      unsafe_zones: L.layerGroup(),
      hotspots: L.layerGroup(),
      citizen_reports: L.layerGroup(),
      traffic: L.layerGroup()
    };

    // Layer active states
    this.activeStates = {
      attractions: true,
      food: true,
      hotels: true,
      heritage: true,
      budget: true,
      emergency: true,
      unsafe_zones: true,
      hotspots: true,
      citizen_reports: true,
      traffic: false
    };

    // Add enabled layers to map
    Object.keys(this.layerGroups).forEach(key => {
      if (this.activeStates[key]) {
        this.map.addLayer(this.layerGroups[key]);
      }
    });
  }

  toggleLayer(layerKey, isEnabled) {
    this.activeStates[layerKey] = isEnabled;
    const group = this.layerGroups[layerKey];
    if (!group) return;

    if (isEnabled) {
      if (!this.map.hasLayer(group)) {
        this.map.addLayer(group);
      }
    } else {
      if (this.map.hasLayer(group)) {
        this.map.removeLayer(group);
      }
    }
  }

  isLayerActive(layerKey) {
    return !!this.activeStates[layerKey];
  }

  clearAll() {
    Object.values(this.layerGroups).forEach(group => group.clearLayers());
  }

  createPlaceMarker(place, categoryClass, iconSvg) {
    const icon = L.divIcon({
      className: '',
      html: `
        <div class="city-marker ${categoryClass} w-8 h-8 flex items-center justify-center cursor-pointer shadow-lg">
          ${iconSvg}
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -18]
    });

    const marker = L.marker([place.latitude, place.longitude], { icon });

    // Tooltip popup
    const safetyBadge = place.safety_score >= 85 
      ? '<span class="badge-safe px-1.5 py-0.5 rounded text-xs font-semibold">Safe (Score: ' + place.safety_score + ')</span>'
      : place.safety_score >= 70
      ? '<span class="badge-moderate px-1.5 py-0.5 rounded text-xs font-semibold">Moderate (Score: ' + place.safety_score + ')</span>'
      : '<span class="badge-caution px-1.5 py-0.5 rounded text-xs font-semibold">Caution (Score: ' + place.safety_score + ')</span>';

    const priceText = '$'.repeat(place.price_level || 1);

    marker.bindPopup(`
      <div class="p-1 max-w-xs text-slate-800">
        <h4 class="font-bold text-sm text-slate-900 leading-snug">${place.name}</h4>
        <p class="text-xs text-slate-500 mb-1">${place.neighborhood || ''} • ${priceText} • ★ ${place.rating}</p>
        <div class="mb-2">${safetyBadge}</div>
        <button class="w-full text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-2 rounded view-detail-btn" data-place-id="${place.id}">
          View Full Details
        </button>
      </div>
    `);

    marker.on('click', () => {
      if (this.onPlaceSelect) {
        this.onPlaceSelect(place.id);
      }
    });

    return marker;
  }

  loadLayersData(layersData) {
    this.clearAll();

    // 1. Attractions
    const attractionIcon = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>`;
    (layersData.attractions || []).forEach(p => {
      const m = this.createPlaceMarker(p, 'marker-attraction', attractionIcon);
      this.layerGroups.attractions.addLayer(m);
    });

    // 2. Food & Dining
    const foodIcon = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>`;
    (layersData.food || []).forEach(p => {
      const m = this.createPlaceMarker(p, 'marker-food', foodIcon);
      this.layerGroups.food.addLayer(m);
    });

    // 3. Hotels
    const hotelIcon = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>`;
    (layersData.hotels || []).forEach(p => {
      const m = this.createPlaceMarker(p, 'marker-hotel', hotelIcon);
      this.layerGroups.hotels.addLayer(m);
    });

    // 4. Heritage & Culture
    const heritageIcon = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path></svg>`;
    (layersData.heritage || []).forEach(p => {
      const m = this.createPlaceMarker(p, 'marker-heritage', heritageIcon);
      this.layerGroups.heritage.addLayer(m);
    });

    // 5. Budget Spots
    const budgetIcon = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>`;
    (layersData.budget || []).forEach(p => {
      const m = this.createPlaceMarker(p, 'marker-budget', budgetIcon);
      this.layerGroups.budget.addLayer(m);
    });

    // 6. Emergency & Safety
    const emergencyIcon = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>`;
    (layersData.emergency || []).forEach(p => {
      const m = this.createPlaceMarker(p, 'marker-emergency', emergencyIcon);
      this.layerGroups.emergency.addLayer(m);
    });

    // 7. Unsafe Zones (Simulated Incident Points)
    (layersData.unsafe_zones || []).forEach(inc => {
      const incIcon = L.divIcon({
        className: '',
        html: `
          <div class="city-marker marker-incident w-7 h-7 flex items-center justify-center cursor-pointer shadow-md">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const m = L.marker([inc.latitude, inc.longitude], { icon: incIcon });
      m.bindPopup(`
        <div class="p-1 max-w-xs text-slate-800">
          <div class="flex items-center gap-1.5 mb-1">
            <span class="bg-red-100 text-red-700 text-xs px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Incident</span>
            <span class="bg-slate-100 text-slate-500 text-[10px] px-1 py-0.5 rounded border border-slate-200">Simulated data</span>
          </div>
          <h4 class="font-bold text-xs capitalize text-slate-900">${inc.incident_type} (${inc.severity} severity)</h4>
          <p class="text-xs text-slate-600 mt-1">${inc.description}</p>
          <p class="text-[11px] text-slate-400 mt-1">Time of day: ${inc.time_of_day} • Area: ${inc.neighborhood || 'Central'}</p>
        </div>
      `);
      this.layerGroups.unsafe_zones.addLayer(m);
    });

    // 8. Hotspots (Incident Clusters)
    (layersData.hotspots || []).forEach(hot => {
      const color = hot.risk_level === 'severe' ? '#ef4444' : hot.risk_level === 'high' ? '#f59e0b' : '#3b82f6';
      
      const circle = L.circle([hot.center_latitude, hot.center_longitude], {
        color: color,
        fillColor: color,
        fillOpacity: 0.22,
        weight: 2,
        radius: hot.radius_meters || 150
      });

      circle.bindPopup(`
        <div class="p-1 max-w-xs text-slate-800">
          <div class="flex items-center gap-1 mb-1">
            <span class="text-xs font-bold px-1.5 py-0.5 rounded text-white" style="background-color: ${color}">
              ${hot.risk_level.toUpperCase()} RISK HOTSPOT
            </span>
            <span class="text-[10px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded">Simulated</span>
          </div>
          <p class="text-xs text-slate-700 font-medium">Clustered Incidents: ${hot.incident_count}</p>
          <p class="text-xs text-slate-600 mt-0.5">Primary concern: ${hot.primary_category}</p>
          <p class="text-[11px] text-slate-400 mt-0.5">Peak hazard window: ${hot.time_sensitivity}</p>
        </div>
      `);
      this.layerGroups.hotspots.addLayer(circle);
    });

    // 9. Citizen Reports
    (layersData.citizen_reports || []).forEach(rep => {
      const repIcon = L.divIcon({
        className: '',
        html: `
          <div class="city-marker marker-report w-7 h-7 flex items-center justify-center cursor-pointer shadow-md">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const m = L.marker([rep.latitude, rep.longitude], { icon: repIcon });
      const statusBadge = rep.status === 'verified'
        ? '<span class="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded font-bold">Verified</span>'
        : rep.status === 'resolved'
        ? '<span class="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded font-bold">Resolved</span>'
        : '<span class="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-bold">Unverified</span>';

      m.bindPopup(`
        <div class="p-1 max-w-xs text-slate-800">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-bold uppercase text-slate-700">${rep.category}</span>
            ${statusBadge}
          </div>
          <h4 class="font-semibold text-xs text-slate-900">${rep.title || 'Citizen Report'}</h4>
          <p class="text-xs text-slate-600 mt-1">${rep.description}</p>
          <div class="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>Credibility: ${Math.round(rep.credibility_score || 50)}%</span>
            <span>▲ ${rep.upvotes || 0} confirmations</span>
          </div>
        </div>
      `);
      this.layerGroups.citizen_reports.addLayer(m);
    });

    // 10. Traffic Corridors (Simulated Layer)
    const trafficCorridors = [
      { coords: [[37.7940, -122.3950], [37.7780, -122.4160]], level: 'moderate', name: 'Market St' },
      { coords: [[37.8080, -122.4100], [37.7930, -122.3920]], level: 'heavy', name: 'The Embarcadero' },
      { coords: [[37.8010, -122.4240], [37.7740, -122.4200]], level: 'light', name: 'Van Ness Ave' }
    ];

    trafficCorridors.forEach(corr => {
      const color = corr.level === 'heavy' ? '#ef4444' : corr.level === 'moderate' ? '#f59e0b' : '#10b981';
      const poly = L.polyline(corr.coords, {
        color: color,
        weight: 6,
        opacity: 0.8
      });
      poly.bindPopup(`
        <div class="p-1 text-xs">
          <b>${corr.name} Traffic</b><br>
          Status: <span style="color:${color}; font-weight:bold; text-transform:capitalize;">${corr.level}</span><br>
          <span class="text-slate-400 text-[10px]">Simulated live speed telemetry</span>
        </div>
      `);
      this.layerGroups.traffic.addLayer(poly);
    });
  }
}
