/**
 * City Life - Complete Application Orchestrator
 * Integrates all 5 pillars: Map, Scoring & Compare, Safe Routing, Reports & Voice, Insights, and Assistant.
 */

import { ApiClient } from './api.js';
import { MapManager } from './map.js';

class CityLifeApp {
  constructor() {
    this.cityConfig = null;
    this.mapManager = null;
    this.allPlaces = [];
    this.currentPlace = null;
    this.userMode = 'tourist'; // 'tourist' | 'local'
    this.darkMode = false;
    this.currentTimeOfDay = 'evening'; // 'morning' | 'afternoon' | 'evening' | 'night'
    this.language = 'en'; // 'en' | 'es'

    // Scoring weights
    this.weights = { safety: 0.25, cleanliness: 0.20, affordability: 0.20, rating: 0.20, accessibility: 0.15 };

    // Active filters
    this.filters = { q: '', category: 'all', maxPrice: null, minRating: null, minSafety: 0, wheelchairOnly: false };

    // Voice recording state
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;

    // Report pin drop mode
    this.isDropPinMode = false;
    this.droppedPinCoords = null;

    this.init();
  }

  async init() {
    this.setupEventListeners();
    await this.loadCity();
    await this.loadLayers();
    await this.loadWeather();
  }

  async loadCity() {
    this.cityConfig = await ApiClient.getCityConfig();
    const cityTitleEl = document.getElementById('city-title');
    if (cityTitleEl) cityTitleEl.textContent = `${this.cityConfig.city_name}, ${this.cityConfig.country}`;

    const center = [this.cityConfig.center.lat, this.cityConfig.center.lon];
    this.mapManager = new MapManager(
      'map', center, this.cityConfig.default_zoom,
      (placeId) => this.openPlaceDetail(placeId),
      (latlng) => this.handleMapClick(latlng)
    );
  }

  async loadLayers() {
    this.showLoading(true);
    const layersData = await ApiClient.getAllLayers();
    this.mapManager.layers.loadLayersData(layersData);

    this.allPlaces = [
      ...(layersData.attractions || []),
      ...(layersData.food || []),
      ...(layersData.hotels || []),
      ...(layersData.heritage || []),
      ...(layersData.budget || []),
      ...(layersData.emergency || [])
    ];

    const seen = new Set();
    this.allPlaces = this.allPlaces.filter(p => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });

    this.populateRouteSelects();
    this.populateCompareSelects();
    this.showLoading(false);
  }

  async loadWeather() {
    const weather = await ApiClient.getWeather();
    if (!weather) return;
    const tempEl = document.getElementById('weather-temp');
    const condEl = document.getElementById('weather-condition');
    if (tempEl) tempEl.textContent = `${Math.round(weather.temperature || 16)}°C`;
    if (condEl) condEl.textContent = weather.condition || 'Coastal Air';
  }

  setupEventListeners() {
    // Mode Switcher
    document.getElementById('mode-toggle')?.addEventListener('click', () => {
      this.userMode = this.userMode === 'tourist' ? 'local' : 'tourist';
      this.applyUserMode();
    });

    // Dark Mode
    document.getElementById('theme-toggle')?.addEventListener('click', () => {
      this.darkMode = !this.darkMode;
      document.documentElement.classList.toggle('dark', this.darkMode);
    });

    // Time of Day Toggle
    document.querySelectorAll('[data-tod]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('[data-tod]').forEach(b => {
          b.classList.remove('bg-blue-600', 'text-white');
          b.classList.add('bg-slate-100', 'text-slate-700', 'dark:bg-slate-800', 'dark:text-slate-300');
        });
        btn.classList.add('bg-blue-600', 'text-white');
        btn.classList.remove('bg-slate-100', 'text-slate-700', 'dark:bg-slate-800', 'dark:text-slate-300');
        this.currentTimeOfDay = btn.getAttribute('data-tod');
        this.updateTimeOfDayImpact();
      });
    });

    // Language Switcher (EN / ES)
    document.getElementById('lang-toggle')?.addEventListener('click', () => {
      this.language = this.language === 'en' ? 'es' : 'en';
      document.getElementById('lang-indicator').textContent = this.language.toUpperCase();
      this.translateUI();
    });

    // Search bar
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const val = e.target.value.trim().toLowerCase();
        this.filters.q = val;
        this.renderSearchResults(val);
      });
      document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults?.contains(e.target)) {
          searchResults?.classList.add('hidden');
        }
      });
    }

    // Geolocation
    document.getElementById('locate-me-btn')?.addEventListener('click', () => {
      this.mapManager.locateUser(null, (err) => alert("Location error: " + err.message));
    });

    // Layer toggles
    document.querySelectorAll('[data-layer-key]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-layer-key');
        const nextState = !this.mapManager.layers.isLayerActive(key);
        this.mapManager.layers.toggleLayer(key, nextState);
        btn.classList.toggle('bg-blue-600', nextState);
        btn.classList.toggle('text-white', nextState);
        btn.classList.toggle('bg-slate-100', !nextState);
        btn.classList.toggle('text-slate-700', !nextState);
      });
    });

    // Nav Bar Buttons: Compare, Leaderboard, Report, Routes, Insights, Assistant, Heritage
    document.getElementById('nav-compare-btn')?.addEventListener('click', () => this.openCompareModal());
    document.getElementById('nav-leaderboard-btn')?.addEventListener('click', () => this.openLeaderboards());
    document.getElementById('nav-report-btn')?.addEventListener('click', () => this.openReportModal());
    document.getElementById('nav-routes-btn')?.addEventListener('click', () => this.openRoutesModal());
    document.getElementById('nav-insights-btn')?.addEventListener('click', () => this.openInsightsModal());
    document.getElementById('nav-assistant-btn')?.addEventListener('click', () => this.toggleAssistantDrawer());
    document.getElementById('nav-heritage-btn')?.addEventListener('click', () => this.openHeritageModal());

    // Drawer Close
    document.getElementById('close-drawer-btn')?.addEventListener('click', () => this.closePlaceDetail());

    // Filter Modal Setup
    this.setupFilterListeners();

    // Voice Note Setup
    this.setupVoiceRecorder();

    // Report Pin Drop Listener
    document.getElementById('drop-pin-btn')?.addEventListener('click', () => {
      this.isDropPinMode = true;
      document.getElementById('report-modal')?.classList.add('hidden');
      alert("Click anywhere on the map to set incident coordinates.");
    });

    // Report Submit Button
    document.getElementById('submit-report-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleReportSubmit();
    });

    // Live NLP Preview on Description change
    document.getElementById('report-desc')?.addEventListener('input', (e) => {
      this.updateNLPPreview(e.target.value);
    });

    // Route Plan Calculation
    document.getElementById('calculate-route-btn')?.addEventListener('click', () => this.handleRoutePlanning());

    // Assistant Chat
    document.getElementById('send-chat-btn')?.addEventListener('click', () => this.handleAssistantChat());
    document.getElementById('chat-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.handleAssistantChat();
    });

    // Assistant prompt chips
    document.querySelectorAll('.assistant-prompt-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.getElementById('chat-input').value = chip.textContent.trim();
        this.handleAssistantChat();
      });
    });

    // Heritage Itinerary Generate
    document.getElementById('generate-itinerary-btn')?.addEventListener('click', () => this.handleItineraryGeneration());

    // Delegated clicks from map popups
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.view-detail-btn');
      if (btn) {
        const placeId = parseInt(btn.getAttribute('data-place-id'));
        if (placeId) this.openPlaceDetail(placeId);
      }
    });

    // Onboarding Banner Dismiss
    document.getElementById('dismiss-banner')?.addEventListener('click', () => {
      document.getElementById('onboarding-banner')?.classList.add('hidden');
    });
  }

  handleMapClick(latlng) {
    if (this.isDropPinMode) {
      this.droppedPinCoords = latlng;
      this.mapManager.dropReportPin(latlng.lat, latlng.lng);
      this.isDropPinMode = false;
      document.getElementById('report-lat').value = latlng.lat.toFixed(5);
      document.getElementById('report-lon').value = latlng.lng.toFixed(5);
      document.getElementById('report-coords-badge').textContent = `Pinned: ${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`;
      document.getElementById('report-modal')?.classList.remove('hidden');
    }
  }

  // --- Voice Note Recording (Web Audio & Speech Recognition) ---
  setupVoiceRecorder() {
    const recordBtn = document.getElementById('record-voice-btn');
    const recordStatus = document.getElementById('record-status');
    const audioPreview = document.getElementById('voice-audio-preview');

    if (!recordBtn) return;

    recordBtn.addEventListener('click', async () => {
      if (!this.isRecording) {
        // Start Recording
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          this.mediaRecorder = new MediaRecorder(stream);
          this.audioChunks = [];

          this.mediaRecorder.ondataavailable = (e) => this.audioChunks.push(e.data);
          this.mediaRecorder.onstop = () => {
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
            audioPreview.src = URL.createObjectURL(audioBlob);
            audioPreview.classList.remove('hidden');
          };

          this.mediaRecorder.start();
          this.isRecording = true;
          recordBtn.innerHTML = '⏹ Stop Recording';
          recordBtn.classList.add('bg-red-600', 'text-white', 'animate-pulse');
          recordStatus.textContent = 'Recording live audio... Speak clearly.';

          // Web Speech Recognition if available
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.onresult = (event) => {
              const transcript = event.results[0][0].transcript;
              document.getElementById('report-transcript').value = transcript;
              const desc = document.getElementById('report-desc');
              if (!desc.value) desc.value = transcript;
              this.updateNLPPreview(desc.value);
            };
            recognition.start();
          }
        } catch (err) {
          alert("Microphone access unavailable or denied: " + err.message);
        }
      } else {
        // Stop Recording
        if (this.mediaRecorder) {
          this.mediaRecorder.stop();
          this.mediaRecorder.stream.getTracks().forEach(t => t.stop());
        }
        this.isRecording = false;
        recordBtn.innerHTML = '🎤 Record Voice Note';
        recordBtn.classList.remove('bg-red-600', 'text-white', 'animate-pulse');
        recordStatus.textContent = 'Audio recorded successfully. Transcript generated.';
      }
    });
  }

  updateNLPPreview(text) {
    const previewBox = document.getElementById('nlp-preview-box');
    if (!previewBox) return;

    if (!text || text.length < 5) {
      previewBox.classList.add('hidden');
      return;
    }

    const lower = text.toLowerCase();
    let cat = 'infrastructure';
    let urgency = 'medium';
    let sentiment = 'neutral';

    if (lower.includes('theft') || lower.includes('harass') || lower.includes('knife') || lower.includes('dark')) {
      cat = 'safety'; urgency = 'high'; sentiment = 'negative';
    } else if (lower.includes('accident') || lower.includes('crash') || lower.includes('traffic')) {
      cat = 'traffic'; urgency = 'high'; sentiment = 'negative';
    } else if (lower.includes('garbage') || lower.includes('trash') || lower.includes('dirty')) {
      cat = 'cleanliness'; urgency = 'low'; sentiment = 'negative';
    }

    document.getElementById('nlp-pred-cat').textContent = cat.toUpperCase();
    document.getElementById('nlp-pred-urgency').textContent = urgency.toUpperCase();
    document.getElementById('nlp-pred-sentiment').textContent = sentiment.toUpperCase();
    previewBox.classList.remove('hidden');
  }

  async handleReportSubmit() {
    this.showLoading(true);
    const cat = document.getElementById('report-category').value;
    const desc = document.getElementById('report-desc').value;
    const lat = parseFloat(document.getElementById('report-lat').value || 37.7749);
    const lon = parseFloat(document.getElementById('report-lon').value || -122.4194);
    const photoUrl = document.getElementById('report-photo-url').value;
    const transcript = document.getElementById('report-transcript').value;

    try {
      const res = await ApiClient.submitReport({
        category: cat,
        description: desc,
        latitude: lat,
        longitude: lon,
        photo_url: photoUrl,
        transcript: transcript
      });

      this.showLoading(false);
      document.getElementById('report-modal')?.classList.add('hidden');
      alert(`Report submitted successfully! Status: ${res.verification_status.toUpperCase()} (Credibility: ${res.credibility.score}%)`);

      // Reload layers to display the new report and updated hotspots
      await this.loadLayers();
    } catch (err) {
      this.showLoading(false);
      alert("Submission error: " + err.message);
    }
  }

  // --- Compare Places & Radar Chart ---
  openCompareModal(preselectedPlaceAId = null) {
    const modal = document.getElementById('compare-modal');
    modal?.classList.remove('hidden');

    if (preselectedPlaceAId) {
      const selA = document.getElementById('compare-select-a');
      if (selA) selA.value = preselectedPlaceAId;
    }
    this.renderComparison();
  }

  populateCompareSelects() {
    const selA = document.getElementById('compare-select-a');
    const selB = document.getElementById('compare-select-b');
    if (!selA || !selB) return;

    const options = this.allPlaces.map(p => `<option value="${p.id}">${p.name} (${p.category_slug})</option>`).join('');
    selA.innerHTML = options;
    selB.innerHTML = options;

    if (this.allPlaces.length > 1) {
      selB.selectedIndex = 1;
    }

    selA.addEventListener('change', () => this.renderComparison());
    selB.addEventListener('change', () => this.renderComparison());

    // Sliders for dynamic weights
    ['safety', 'cleanliness', 'affordability', 'rating', 'accessibility'].forEach(metric => {
      const slider = document.getElementById(`weight-${metric}`);
      slider?.addEventListener('input', (e) => {
        document.getElementById(`val-weight-${metric}`).textContent = `${Math.round(e.target.value * 100)}%`;
        this.weights[metric] = parseFloat(e.target.value);
        this.renderComparison();
      });
    });
  }

  async renderComparison() {
    const selA = document.getElementById('compare-select-a');
    const selB = document.getElementById('compare-select-b');
    if (!selA || !selB) return;

    const idA = parseInt(selA.value);
    const idB = parseInt(selB.value);
    if (!idA || !idB) return;

    const data = await ApiClient.comparePlaces(idA, idB, this.currentTimeOfDay);
    if (!data) return;

    // Render Table Metrics
    const tableBody = document.getElementById('compare-table-body');
    if (tableBody) {
      tableBody.innerHTML = data.metrics.map(m => `
        <tr class="border-b border-slate-100 dark:border-slate-800 text-xs">
          <td class="py-2 font-semibold text-slate-700 dark:text-slate-300">${m.metric}</td>
          <td class="py-2 text-center ${m.winner === 'a' ? 'font-black text-blue-600 bg-blue-50/50 dark:bg-blue-950/30' : ''}">
            ${m.val_a} ${m.winner === 'a' ? '🏆' : ''}
          </td>
          <td class="py-2 text-center ${m.winner === 'b' ? 'font-black text-amber-600 bg-amber-50/50 dark:bg-amber-950/30' : ''}">
            ${m.val_b} ${m.winner === 'b' ? '🏆' : ''}
          </td>
        </tr>
      `).join('');
    }

    // Render Canvas Radar Chart
    this.drawRadarChart(data);
  }

  drawRadarChart(data) {
    const canvas = document.getElementById('radar-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(cx, cy) - 25;

    ctx.clearRect(0, 0, w, h);

    const labels = ["Safety", "Cleanliness", "Afford", "Rating", "Access"];
    const metricsA = [
      data.metrics[0].val_a, data.metrics[1].val_a,
      data.metrics[2].val_a, data.metrics[3].val_a, data.metrics[4].val_a
    ];
    const metricsB = [
      data.metrics[0].val_b, data.metrics[1].val_b,
      data.metrics[2].val_b, data.metrics[3].val_b, data.metrics[4].val_b
    ];

    const numAxes = labels.length;
    const angleStep = (Math.PI * 2) / numAxes;

    // Draw background concentric webs
    ctx.strokeStyle = this.darkMode ? '#334155' : '#e2e8f0';
    ctx.lineWidth = 1;
    for (let level = 1; level <= 4; level++) {
      const r = (radius / 4) * level;
      ctx.beginPath();
      for (let i = 0; i < numAxes; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Draw axis lines and labels
    ctx.fillStyle = this.darkMode ? '#94a3b8' : '#64748b';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    for (let i = 0; i < numAxes; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.stroke();

      const labelX = cx + (radius + 15) * Math.cos(angle);
      const labelY = cy + (radius + 15) * Math.sin(angle);
      ctx.fillText(labels[i], labelX, labelY);
    }

    // Draw Place A Polygon (Blue)
    ctx.beginPath();
    metricsA.forEach((val, i) => {
      const r = (val / 100) * radius;
      const angle = i * angleStep - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';
    ctx.fill();
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw Place B Polygon (Amber)
    ctx.beginPath();
    metricsB.forEach((val, i) => {
      const r = (val / 100) * radius;
      const angle = i * angleStep - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
    ctx.fill();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // --- Leaderboards ---
  async openLeaderboards() {
    this.showLoading(true);
    const ranks = await ApiClient.getLeaderboards();
    this.showLoading(false);
    if (!ranks) return;

    const modal = document.getElementById('leaderboard-modal');
    modal?.classList.remove('hidden');

    const bestList = document.getElementById('leaderboard-best-places');
    const worstList = document.getElementById('leaderboard-worst-places');
    const safeNhoods = document.getElementById('leaderboard-safe-nhoods');
    const cautionNhoods = document.getElementById('leaderboard-caution-nhoods');

    if (bestList) {
      bestList.innerHTML = ranks.best_places.map((p, idx) => `
        <div class="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
          <div>
            <span class="font-black text-emerald-800 dark:text-emerald-300">#${idx + 1} ${p.name}</span>
            <p class="text-[11px] text-slate-500">${p.neighborhood} • ★ ${p.rating}</p>
          </div>
          <span class="px-2 py-0.5 rounded font-black bg-emerald-600 text-white text-xs">${Math.round(p.composite_score)}</span>
        </div>
      `).join('');
    }

    if (worstList) {
      worstList.innerHTML = ranks.worst_places.map((p, idx) => `
        <div class="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 flex items-center justify-between text-xs">
          <div>
            <span class="font-bold text-rose-800 dark:text-rose-300">${p.name}</span>
            <p class="text-[11px] text-slate-500">${p.neighborhood} • Score: ${Math.round(p.composite_score)}</p>
          </div>
          <span class="text-xs text-rose-600 font-bold">${Math.round(p.safety_score)} safe</span>
        </div>
      `).join('');
    }

    if (safeNhoods) {
      safeNhoods.innerHTML = ranks.safest_neighborhoods.map(n => `
        <div class="p-2 rounded bg-slate-50 dark:bg-slate-800 text-xs flex justify-between">
          <span class="font-bold text-slate-800 dark:text-slate-200">${n.neighborhood_name}</span>
          <span class="text-emerald-600 font-black">${Math.round(n.safety_score)} Safety</span>
        </div>
      `).join('');
    }

    if (cautionNhoods) {
      cautionNhoods.innerHTML = ranks.least_safe_neighborhoods.map(n => `
        <div class="p-2 rounded bg-slate-50 dark:bg-slate-800 text-xs flex justify-between">
          <span class="font-bold text-slate-800 dark:text-slate-200">${n.neighborhood_name}</span>
          <span class="text-amber-600 font-bold">${Math.round(n.safety_score)} Safety</span>
        </div>
      `).join('');
    }
  }

  // --- Safe Route Planning ---
  populateRouteSelects() {
    const selA = document.getElementById('route-origin-select');
    const selB = document.getElementById('route-dest-select');
    if (!selA || !selB) return;

    const options = this.allPlaces.map(p => `<option value="${p.latitude},${p.longitude}">${p.name}</option>`).join('');
    selA.innerHTML = options;
    selB.innerHTML = options;
    if (this.allPlaces.length > 3) selB.selectedIndex = 3;
  }

  openRoutesModal() {
    document.getElementById('routes-modal')?.classList.remove('hidden');
  }

  async handleRoutePlanning() {
    this.showLoading(true);
    const selA = document.getElementById('route-origin-select');
    const selB = document.getElementById('route-dest-select');
    const [oLat, oLon] = selA.value.split(',').map(parseFloat);
    const [dLat, dLon] = selB.value.split(',').map(parseFloat);

    const plan = await ApiClient.planRoute(oLat, oLon, dLat, dLon, this.currentTimeOfDay);
    this.showLoading(false);
    if (!plan) return;

    // Render stats card
    const card = document.getElementById('route-result-card');
    card.classList.remove('hidden');

    document.getElementById('fastest-route-time').textContent = `${plan.fastest_route.duration_minutes} min`;
    document.getElementById('fastest-route-dist').textContent = `${plan.fastest_route.distance_km} km`;
    document.getElementById('fastest-route-risk').textContent = `Risk: ${plan.fastest_route.risk_score}/100`;

    document.getElementById('safest-route-time').textContent = `${plan.safest_route.duration_minutes} min`;
    document.getElementById('safest-route-dist').textContent = `${plan.safest_route.distance_km} km`;
    document.getElementById('safest-route-risk').textContent = `Risk: ${plan.safest_route.risk_score}/100`;

    document.getElementById('route-reduction-badge').textContent = `🛡 ${plan.risk_reduction_pct}% Risk Reduction`;
    document.getElementById('route-explanation-text').textContent = plan.explanation;

    // Draw route on Leaflet Map
    this.mapManager.renderRouteComparison(plan);
    document.getElementById('routes-modal')?.classList.add('hidden');
  }

  // --- Smart City Insights Dashboard ---
  async openInsightsModal() {
    this.showLoading(true);
    const insights = await ApiClient.getInsightsDashboard();
    this.showLoading(false);
    if (!insights) return;

    const modal = document.getElementById('insights-modal');
    modal?.classList.remove('hidden');

    document.getElementById('stat-total-places').textContent = insights.summary.total_places;
    document.getElementById('stat-total-reports').textContent = insights.summary.total_reports;
    document.getElementById('stat-resolution-rate').textContent = `${insights.summary.resolution_rate_pct}%`;
    document.getElementById('stat-active-hotspots').textContent = insights.summary.active_hotspots;

    const catsList = document.getElementById('insights-cats-list');
    if (catsList) {
      catsList.innerHTML = insights.top_categories.map(c => `
        <div class="flex items-center justify-between text-xs">
          <span class="capitalize font-semibold text-slate-700 dark:text-slate-300">${c.category}</span>
          <span class="font-bold text-blue-600">${c.count} reports</span>
        </div>
      `).join('');
    }

    const newsList = document.getElementById('insights-news-list');
    if (newsList) {
      newsList.innerHTML = insights.trending_news.map(n => `
        <div class="p-2 rounded bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700">
          <span class="font-bold text-slate-900 dark:text-white">${n.title}</span>
          <p class="text-[11px] text-slate-500 mt-0.5">${n.source_name} • ${n.content.slice(0, 90)}...</p>
        </div>
      `).join('');
    }
  }

  // --- Conversational City Assistant ---
  toggleAssistantDrawer() {
    const drawer = document.getElementById('assistant-drawer');
    drawer?.classList.toggle('translate-x-full');
  }

  async handleAssistantChat() {
    const input = document.getElementById('chat-input');
    const prompt = input.value.trim();
    if (!prompt) return;

    const messages = document.getElementById('chat-messages');
    messages.innerHTML += `
      <div class="self-end max-w-[85%] bg-blue-600 text-white rounded-2xl rounded-tr-none p-3 text-xs shadow-sm">
        ${prompt}
      </div>
    `;
    input.value = '';
    messages.scrollTop = messages.scrollHeight;

    const loadingId = 'loading-' + Date.now();
    messages.innerHTML += `
      <div id="${loadingId}" class="self-start max-w-[85%] bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl rounded-tl-none p-3 text-xs animate-pulse">
        Checking verified city knowledge base...
      </div>
    `;
    messages.scrollTop = messages.scrollHeight;

    const res = await ApiClient.askAssistant(prompt);
    document.getElementById(loadingId)?.remove();

    const formattedAnswer = res.answer.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

    const citationChips = (res.citations || []).map(c => `
      <button class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200 hover:bg-blue-100 view-detail-btn" data-place-id="${c.id}">
        📍 ${c.name} (${c.safety_score}/100)
      </button>
    `).join(' ');

    messages.innerHTML += `
      <div class="self-start max-w-[90%] bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl rounded-tl-none p-3 text-xs leading-relaxed shadow-sm">
        <div>${formattedAnswer}</div>
        ${citationChips ? `<div class="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-1">${citationChips}</div>` : ''}
      </div>
    `;
    messages.scrollTop = messages.scrollHeight;
  }

  // --- Heritage Hub & Cultural Itinerary ---
  openHeritageModal() {
    document.getElementById('heritage-modal')?.classList.remove('hidden');
    this.handleItineraryGeneration();
  }

  async handleItineraryGeneration() {
    const dur = parseInt(document.getElementById('itinerary-duration')?.value || 4);
    const bud = parseInt(document.getElementById('itinerary-budget')?.value || 2);

    this.showLoading(true);
    const itin = await ApiClient.getHeritageItinerary(dur, bud);
    this.showLoading(false);
    if (!itin) return;

    document.getElementById('itinerary-title').textContent = itin.title;
    const scheduleContainer = document.getElementById('itinerary-schedule-list');
    if (scheduleContainer) {
      scheduleContainer.innerHTML = itin.schedule.map(s => `
        <div class="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
          <span class="px-2 py-1 rounded bg-amber-500 text-white font-black text-xs shrink-0">${s.time}</span>
          <div>
            <h5 class="font-bold text-slate-900 dark:text-white text-xs">${s.place_name} (${s.neighborhood})</h5>
            <p class="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">${s.visiting_tip}</p>
          </div>
        </div>
      `).join('');
    }
  }

  // --- Place Details ---
  async openPlaceDetail(placeId) {
    this.showLoading(true);
    const place = await ApiClient.getPlaceDetail(placeId);
    this.showLoading(false);
    if (!place) return;

    this.currentPlace = place;
    this.mapManager.setCenter(place.latitude, place.longitude, 16);

    document.getElementById('drawer-title').textContent = place.name;
    document.getElementById('drawer-neighborhood').textContent = place.neighborhood || 'San Francisco';
    document.getElementById('drawer-address').textContent = place.address || '';
    document.getElementById('drawer-category').textContent = place.category_slug.toUpperCase();
    document.getElementById('drawer-hours').textContent = place.opening_hours || 'Hours not specified';
    document.getElementById('drawer-phone').textContent = place.phone || 'N/A';

    const photoEl = document.getElementById('drawer-photo');
    if (photoEl) photoEl.src = place.photo_url || 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=800&q=80';

    const setScoreBar = (barId, valId, score) => {
      const bar = document.getElementById(barId);
      const val = document.getElementById(valId);
      if (bar) bar.style.width = `${Math.min(100, score)}%`;
      if (val) val.textContent = `${Math.round(score)}/100`;
    };

    setScoreBar('score-bar-safety', 'score-val-safety', place.safety_score);
    setScoreBar('score-bar-clean', 'score-val-clean', place.cleanliness_score);
    setScoreBar('score-bar-afford', 'score-val-afford', place.affordability_score);
    setScoreBar('score-bar-access', 'score-val-access', place.accessibility_score);
    setScoreBar('score-bar-composite', 'score-val-composite', place.composite_score);

    const safetyBadge = document.getElementById('drawer-safety-badge');
    if (safetyBadge) {
      if (place.safety_score >= 85) {
        safetyBadge.className = 'badge-safe px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1';
        safetyBadge.innerHTML = '● Verified High Safety';
      } else if (place.safety_score >= 70) {
        safetyBadge.className = 'badge-moderate px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1';
        safetyBadge.innerHTML = '▲ Moderate Caution';
      } else {
        safetyBadge.className = 'badge-caution px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1';
        safetyBadge.innerHTML = '■ Advisory Caution';
      }
    }

    document.getElementById('drawer-rating').textContent = `★ ${place.rating || 4.0}`;
    document.getElementById('drawer-price').textContent = '$'.repeat(place.price_level || 1);
    document.getElementById('drawer-desc').textContent = place.description || '';

    // Heritage notes
    const heritageBox = document.getElementById('drawer-heritage-box');
    const heritageText = document.getElementById('drawer-heritage-text');
    if (place.history_notes || (place.heritage_info && place.heritage_info.historical_significance)) {
      heritageText.textContent = place.heritage_info?.historical_significance || place.history_notes;
      heritageBox.classList.remove('hidden');
    } else {
      heritageBox.classList.add('hidden');
    }

    // Compare with this place button
    const compareTrigger = document.getElementById('drawer-compare-trigger');
    if (compareTrigger) {
      compareTrigger.onclick = () => this.openCompareModal(place.id);
    }

    document.getElementById('drawer-directions-btn').onclick = () => {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`, '_blank');
    };

    document.getElementById('place-drawer')?.classList.remove('translate-x-full', 'translate-y-full');
  }

  closePlaceDetail() {
    document.getElementById('place-drawer')?.classList.add('translate-x-full', 'translate-y-full');
    this.currentPlace = null;
  }

  updateTimeOfDayImpact() {
    // When time of day changes, re-fetch layers and re-render route if visible
    if (this.currentPlace) {
      this.openPlaceDetail(this.currentPlace.id);
    }
  }

  applyUserMode() {
    const modeBadge = document.getElementById('mode-indicator');
    if (modeBadge) {
      modeBadge.textContent = this.userMode === 'tourist' ? 'Tourist Mode' : 'Local Mode';
      modeBadge.className = this.userMode === 'tourist'
        ? 'px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800'
        : 'px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800';
    }
  }

  translateUI() {
    if (this.language === 'es') {
      document.getElementById('search-input').placeholder = "Buscar comida, monumentos, museos...";
      document.querySelector('[data-layer-key="attractions"]').textContent = "★ Atracciones";
      document.querySelector('[data-layer-key="food"]').textContent = "🍴 Restaurantes";
      document.querySelector('[data-layer-key="hotels"]').textContent = "🏨 Hoteles";
      document.querySelector('[data-layer-key="heritage"]').textContent = "🏛 Patrimonio";
      document.querySelector('[data-layer-key="budget"]').textContent = "🏷 Económico";
    } else {
      document.getElementById('search-input').placeholder = "Search food, landmarks, museums...";
      document.querySelector('[data-layer-key="attractions"]').textContent = "★ Attractions";
      document.querySelector('[data-layer-key="food"]').textContent = "🍴 Food & Dining";
      document.querySelector('[data-layer-key="hotels"]').textContent = "🏨 Hotels";
      document.querySelector('[data-layer-key="heritage"]').textContent = "🏛 Heritage";
      document.querySelector('[data-layer-key="budget"]').textContent = "🏷 Budget Spots";
    }
  }

  renderSearchResults(q) {
    const container = document.getElementById('search-results');
    if (!container) return;
    if (!q) { container.classList.add('hidden'); return; }

    const matches = this.allPlaces.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.neighborhood && p.neighborhood.toLowerCase().includes(q))
    ).slice(0, 6);

    if (matches.length === 0) {
      container.innerHTML = `<div class="p-3 text-xs text-slate-500 text-center">No places matching "${q}"</div>`;
      container.classList.remove('hidden');
      return;
    }

    container.innerHTML = matches.map(p => `
      <div class="search-item p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between border-b border-slate-100 dark:border-slate-800" data-id="${p.id}">
        <div>
          <h5 class="text-xs font-bold text-slate-900 dark:text-white">${p.name}</h5>
          <p class="text-[11px] text-slate-500">${p.neighborhood || ''} • ${p.category_slug}</p>
        </div>
        <span class="text-xs font-bold text-blue-600">${Math.round(p.composite_score)} pts</span>
      </div>
    `).join('');
    container.classList.remove('hidden');

    container.querySelectorAll('.search-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = parseInt(el.getAttribute('data-id'));
        container.classList.add('hidden');
        this.openPlaceDetail(id);
      });
    });
  }

  setupFilterListeners() {
    const modal = document.getElementById('filter-modal');
    document.getElementById('filter-btn')?.addEventListener('click', () => modal?.classList.remove('hidden'));
    document.getElementById('close-filter-btn')?.addEventListener('click', () => modal?.classList.add('hidden'));

    const slider = document.getElementById('filter-safety-slider');
    slider?.addEventListener('input', (e) => {
      document.getElementById('filter-safety-val').textContent = `${e.target.value}+`;
    });

    document.getElementById('apply-filter-btn')?.addEventListener('click', async () => {
      this.filters.category = document.getElementById('filter-category').value;
      this.filters.maxPrice = document.getElementById('filter-price').value ? parseInt(document.getElementById('filter-price').value) : null;
      this.filters.minRating = document.getElementById('filter-rating').value ? parseFloat(document.getElementById('filter-rating').value) : null;
      this.filters.minSafety = slider?.value ? parseFloat(slider.value) : 0;
      this.filters.wheelchairOnly = document.getElementById('filter-wheelchair')?.checked || false;

      this.showLoading(true);
      const filtered = await ApiClient.searchPlaces(this.filters);
      this.showLoading(false);
      modal?.classList.add('hidden');
    });

    document.getElementById('reset-filter-btn')?.addEventListener('click', () => {
      this.filters = { q: '', category: 'all', maxPrice: null, minRating: null, minSafety: 0, wheelchairOnly: false };
      if (slider) slider.value = 0;
      document.getElementById('filter-safety-val').textContent = "0+";
      modal?.classList.add('hidden');
    });
  }

  openReportModal() {
    document.getElementById('report-modal')?.classList.remove('hidden');
  }

  showLoading(isLoading) {
    document.getElementById('loading-indicator')?.classList.toggle('hidden', !isLoading);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.cityLifeApp = new CityLifeApp();
});
