/**
 * ⚡ DropX - Centralized API Service
 */

const API_BASE = '/api';

const API = {
  // Helper for requests
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('dropx_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, error.message);
      throw error;
    }
  },

  // Products
  async getProducts(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.sort) query.append('sort', params.sort);
    if (params.dropsOnly) query.append('dropsOnly', 'true');
    if (params.limit) query.append('limit', params.limit);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request(`/products${queryString}`);
  },

  async getProductById(id) {
    return this.request(`/products/${id}`);
  },

  async createProduct(productData) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  },

  // Auth
  async signup(name, email, password) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
  },

  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  async getProfile() {
    return this.request('/auth/profile');
  },

  // Watchlist
  async getWatchlist() {
    return this.request('/watchlist');
  },

  async addToWatchlist(productId) {
    return this.request('/watchlist', {
      method: 'POST',
      body: JSON.stringify({ productId })
    });
  },

  async removeFromWatchlist(productId) {
    return this.request(`/watchlist/${productId}`, {
      method: 'DELETE'
    });
  },

  // Price Alerts
  async getAlerts() {
    return this.request('/alerts');
  },

  async createAlert(productId, targetPrice) {
    return this.request('/alerts', {
      method: 'POST',
      body: JSON.stringify({ productId, targetPrice })
    });
  },

  async deleteAlert(alertId) {
    return this.request(`/alerts/${alertId}`, {
      method: 'DELETE'
    });
  }
};

window.API = API;
