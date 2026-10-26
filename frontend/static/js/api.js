/**
 * City Life - Complete API Client Module
 * Supports all Five Pillars: Exploration, Heritage, Safety, Scoring Compare, and Insights.
 */

const API_BASE = '/api';

export const ApiClient = {
  // --- Pillar 1 & Scaffold ---
  async getCityConfig() {
    try {
      const res = await fetch(`${API_BASE}/layers/config`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[ApiClient] Failed to fetch config', err);
      return {
        city_name: 'San Francisco',
        country: 'USA',
        center: { lat: 37.7749, lon: -122.4194 },
        default_zoom: 13,
        bbox: [37.708, -122.52, 37.82, -122.36]
      };
    }
  },

  async getAllLayers() {
    try {
      const res = await fetch(`${API_BASE}/layers/all`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.layers || {};
    } catch (err) {
      console.error('[ApiClient] Failed to fetch layers', err);
      return {};
    }
  },

  async searchPlaces(params = {}) {
    try {
      const qp = new URLSearchParams();
      if (params.q) qp.set('q', params.q);
      if (params.category && params.category !== 'all') qp.set('category', params.category);
      if (params.max_price) qp.set('max_price', params.max_price);
      if (params.min_rating) qp.set('min_rating', params.min_rating);
      if (params.min_safety) qp.set('min_safety', params.min_safety);
      if (params.wheelchair_only) qp.set('wheelchair_only', 'true');
      if (params.limit) qp.set('limit', params.limit);

      const res = await fetch(`${API_BASE}/places?${qp.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.places || [];
    } catch (err) {
      console.error('[ApiClient] Search places failed', err);
      return [];
    }
  },

  async getPlaceDetail(placeId) {
    try {
      const res = await fetch(`${API_BASE}/places/${placeId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.place || null;
    } catch (err) {
      console.error(`[ApiClient] Place detail failed: ${placeId}`, err);
      return null;
    }
  },

  async getNearbyPlaces(lat, lon, radius = 3000) {
    try {
      const res = await fetch(`${API_BASE}/places/nearby?lat=${lat}&lon=${lon}&radius=${radius}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.places || [];
    } catch (err) {
      console.error('[ApiClient] Nearby places failed', err);
      return [];
    }
  },

  async getWeather() {
    try {
      const res = await fetch(`${API_BASE}/layers/weather`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('[ApiClient] Weather failed', err);
      return null;
    }
  },

  // --- Pillar 2: Scoring Engine, Compare & Leaderboards ---
  async comparePlaces(placeAId, placeBId, timeOfDay = 'afternoon') {
    try {
      const res = await fetch(`${API_BASE}/scoring/compare?place_a=${placeAId}&place_b=${placeBId}&time_of_day=${timeOfDay}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.comparison;
    } catch (err) {
      console.error('[ApiClient] Compare places failed', err);
      return null;
    }
  },

  async getLeaderboards(category = null) {
    try {
      const url = category ? `${API_BASE}/scoring/leaderboards?category=${category}` : `${API_BASE}/scoring/leaderboards`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.leaderboards;
    } catch (err) {
      console.error('[ApiClient] Leaderboards failed', err);
      return null;
    }
  },

  async recalculateScore(metrics, weights, timeOfDay = 'afternoon') {
    try {
      const res = await fetch(`${API_BASE}/scoring/recalculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...metrics, weights, time_of_day: timeOfDay })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('[ApiClient] Recalculate score failed', err);
      return null;
    }
  },

  // --- Pillar 3: Citizen Reports & NLP ---
  async submitReport(payload) {
    try {
      const res = await fetch(`${API_BASE}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.detail || errJson.error || `HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      console.error('[ApiClient] Submit report failed', err);
      throw err;
    }
  },

  async voteReport(reportId, voteType = 'upvote') {
    try {
      const res = await fetch(`${API_BASE}/reports/${reportId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote_type: voteType })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('[ApiClient] Vote report failed', err);
      return null;
    }
  },

  // --- Pillar 4: Safe Routing Engine ---
  async planRoute(originLat, originLon, destLat, destLon, timeOfDay = 'evening') {
    try {
      const res = await fetch(`${API_BASE}/routes/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin_lat: originLat,
          origin_lon: originLon,
          dest_lat: destLat,
          dest_lon: destLon,
          time_of_day: timeOfDay
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.plan;
    } catch (err) {
      console.error('[ApiClient] Route planning failed', err);
      return null;
    }
  },

  // --- Pillar 5: Insights Dashboard & Assistant ---
  async getInsightsDashboard() {
    try {
      const res = await fetch(`${API_BASE}/insights/dashboard`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('[ApiClient] Insights dashboard failed', err);
      return null;
    }
  },

  async askAssistant(prompt, userLat = 37.7749, userLon = -122.4194) {
    try {
      const res = await fetch(`${API_BASE}/assistant/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          user_lat: userLat,
          user_lon: userLon
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.response;
    } catch (err) {
      console.error('[ApiClient] Assistant chat failed', err);
      return {
        answer: "Could not retrieve live insights at this moment.",
        citations: []
      };
    }
  },

  // --- History & Culture Hub ---
  async getHeritageSites() {
    try {
      const res = await fetch(`${API_BASE}/heritage/sites`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.sites || [];
    } catch (err) {
      console.error('[ApiClient] Heritage sites failed', err);
      return [];
    }
  },

  async getHeritageItinerary(duration = 4, budget = 2) {
    try {
      const res = await fetch(`${API_BASE}/heritage/itinerary?duration=${duration}&budget=${budget}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.itinerary;
    } catch (err) {
      console.error('[ApiClient] Heritage itinerary failed', err);
      return null;
    }
  }
};
