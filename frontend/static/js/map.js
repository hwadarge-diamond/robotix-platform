/**
 * City Life - Map Manager Module
 * Manages tiles, layer groups, geolocation, click coordinate listeners, and safe route polylines.
 */

import { LayerManager } from './layers.js';

export class MapManager {
  constructor(containerId, initialCenter, initialZoom, onPlaceSelect, onMapClick) {
    this.initialCenter = initialCenter || [37.7749, -122.4194];
    this.initialZoom = initialZoom || 13;
    this.onPlaceSelect = onPlaceSelect;
    this.onMapClick = onMapClick;

    // Initialize Leaflet map
    this.map = L.map(containerId, {
      center: this.initialCenter,
      zoom: this.initialZoom,
      zoomControl: false
    });

    L.control.zoom({ position: 'topright' }).addTo(this.map);

    // Modern clean tiles (CartoDB Positron / OSM)
    this.tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(this.map);

    // Layer Manager
    this.layers = new LayerManager(this.map, this.onPlaceSelect);

    // Route Layer Group
    this.routeGroup = L.layerGroup().addTo(this.map);

    // Temp Report Pin
    this.reportPin = null;

    // Map click hook
    this.map.on('click', (e) => {
      if (this.onMapClick) {
        this.onMapClick(e.latlng);
      }
    });

    this.userMarker = null;
    this.accuracyCircle = null;
  }

  setCenter(lat, lon, zoom = 14) {
    this.map.flyTo([lat, lon], zoom, { animate: true, duration: 0.8 });
  }

  dropReportPin(lat, lon) {
    if (this.reportPin) this.map.removeLayer(this.reportPin);

    const pinIcon = L.divIcon({
      className: '',
      html: `
        <div class="w-8 h-8 rounded-full bg-amber-500 border-2 border-white shadow-xl flex items-center justify-center text-white animate-bounce">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });

    this.reportPin = L.marker([lat, lon], { icon: pinIcon }).addTo(this.map);
  }

  removeReportPin() {
    if (this.reportPin) {
      this.map.removeLayer(this.reportPin);
      this.reportPin = null;
    }
  }

  clearRoutes() {
    this.routeGroup.clearLayers();
  }

  renderRouteComparison(plan) {
    this.clearRoutes();
    if (!plan) return;

    const { fastest_route, safest_route, risk_reduction_pct } = plan;

    // 1. Fastest Route (Amber dashed polyline)
    const fastestLine = L.polyline(fastest_route.waypoints, {
      color: '#f59e0b',
      weight: 5,
      dashArray: '8, 8',
      opacity: 0.85
    }).addTo(this.routeGroup);

    fastestLine.bindTooltip(`
      <div class="text-xs font-bold text-slate-800">
        ⚡ Fastest: ${fastest_route.duration_minutes} min (${fastest_route.distance_km} km)<br>
        <span class="text-amber-600">Risk Score: ${fastest_route.risk_score}/100</span>
      </div>
    `, { sticky: true });

    // 2. Safest Route (Emerald Green solid polyline)
    const safestLine = L.polyline(safest_route.waypoints, {
      color: '#10b981',
      weight: 7,
      opacity: 0.95
    }).addTo(this.routeGroup);

    safestLine.bindTooltip(`
      <div class="text-xs font-bold text-slate-800">
        🛡 Safest Route: ${safest_route.duration_minutes} min (${safest_route.distance_km} km)<br>
        <span class="text-emerald-600 font-extrabold">Risk Score: ${safest_route.risk_score}/100 (${risk_reduction_pct}% safer)</span>
      </div>
    `, { sticky: true });

    // Start Marker
    const startPt = fastest_route.waypoints[0];
    const endPt = fastest_route.waypoints[fastest_route.waypoints.length - 1];

    const startIcon = L.divIcon({
      className: '',
      html: `<div class="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center border-2 border-white shadow text-xs">A</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    L.marker(startPt, { icon: startIcon }).addTo(this.routeGroup).bindPopup("<b>Route Origin (A)</b>");

    // End Marker
    const endIcon = L.divIcon({
      className: '',
      html: `<div class="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center border-2 border-white shadow text-xs">B</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    L.marker(endPt, { icon: endIcon }).addTo(this.routeGroup).bindPopup("<b>Route Destination (B)</b>");

    // Fit map bounds to show both routes
    const allPoints = [...fastest_route.waypoints, ...safest_route.waypoints];
    this.map.fitBounds(L.latLngBounds(allPoints), { padding: [50, 50] });
  }

  locateUser(onSuccess, onError) {
    if (!navigator.geolocation) {
      if (onError) onError(new Error("Geolocation unsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        if (this.userMarker) this.map.removeLayer(this.userMarker);
        if (this.accuracyCircle) this.map.removeLayer(this.accuracyCircle);

        const icon = L.divIcon({
          className: '',
          html: `<div class="w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center animate-pulse"><div class="w-2.5 h-2.5 rounded-full bg-white"></div></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        this.userMarker = L.marker([latitude, longitude], { icon }).addTo(this.map);
        this.accuracyCircle = L.circle([latitude, longitude], {
          radius: accuracy, color: '#3b82f6', fillColor: '#60a5fa', fillOpacity: 0.15, weight: 1
        }).addTo(this.map);

        this.map.flyTo([latitude, longitude], 15);
        if (onSuccess) onSuccess({ latitude, longitude });
      },
      (err) => {
        if (onError) onError(err);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }
}
