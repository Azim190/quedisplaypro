/**
 * DMC Dar Makkah Engineering Consultancy
 * Backend REST API Client & Synchronization Layer
 * Connects frontend directly to Node.js / SQLite database with automatic fallback
 */

const DMCApi = {
  // Base API URL (relative if served from same origin, or fallback to localhost:3000)
  baseUrl: (window.location.port === '3000' || window.location.pathname.startsWith('/api')) 
    ? '/api' 
    : 'http://localhost:3000/api',

  isConnected: false,
  isChecking: false,

  // Check backend server & SQLite connectivity
  async checkConnection() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1800);

      const res = await fetch(`${this.baseUrl}/health`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        this.isConnected = true;
        this.emitStatus(true, data);
        return true;
      }
    } catch (e) {
      // Backend offline or running in static GitHub Pages mode
    }

    this.isConnected = false;
    this.emitStatus(false, null);
    return false;
  },

  emitStatus(connected, data) {
    window.dispatchEvent(new CustomEvent('dmc-db-status', {
      detail: {
        connected,
        database: connected ? 'SQLite' : 'LocalStorage',
        info: data
      }
    }));
  },

  // Auth
  async login(nationalId, password) {
    if (!this.isConnected) return null;
    try {
      const res = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nationalId, password })
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.user;
    } catch (e) {
      console.warn('API login failed, falling back to local store:', e);
      return null;
    }
  },

  // Quotations
  async getQuotations(filters = {}) {
    if (!this.isConnected) return null;
    try {
      const params = new URLSearchParams();
      if (filters.branch) params.append('branch', filters.branch);
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      if (filters.dateFilter) params.append('dateFilter', filters.dateFilter);
      if (filters.query) params.append('query', filters.query);
      if (filters.sort) params.append('sort', filters.sort);

      const res = await fetch(`${this.baseUrl}/quotations?${params.toString()}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.quotations;
    } catch (e) {
      console.warn('API getQuotations failed:', e);
      return null;
    }
  },

  async getQuotationById(id) {
    if (!this.isConnected) return null;
    try {
      const res = await fetch(`${this.baseUrl}/quotations/${encodeURIComponent(id)}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async createQuotation(quotationData) {
    if (!this.isConnected) return null;
    try {
      const res = await fetch(`${this.baseUrl}/quotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quotationData)
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.error('API createQuotation failed:', e);
      return null;
    }
  },

  async updateQuotation(id, updatedFields) {
    if (!this.isConnected) return null;
    try {
      const res = await fetch(`${this.baseUrl}/quotations/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async updateStatus(id, newStatus, userName) {
    if (!this.isConnected) return null;
    try {
      const res = await fetch(`${this.baseUrl}/quotations/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, userName })
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async addRevision(id, revisionData) {
    if (!this.isConnected) return null;
    try {
      const res = await fetch(`${this.baseUrl}/quotations/${encodeURIComponent(id)}/revisions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(revisionData)
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async deleteQuotation(id, userName) {
    if (!this.isConnected) return null;
    try {
      const res = await fetch(`${this.baseUrl}/quotations/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName })
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  async getDashboardStats() {
    if (!this.isConnected) return null;
    try {
      const res = await fetch(`${this.baseUrl}/dashboard/stats`);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async getAuditLogs() {
    if (!this.isConnected) return null;
    try {
      const res = await fetch(`${this.baseUrl}/audit-logs`);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  }
};

// Immediately check connection on script load
DMCApi.checkConnection();
