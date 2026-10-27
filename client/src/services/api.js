/**
 * API Service for NEXTEST Frontend.
 * Centralized fetch client communicating with plain Node.js HTTP backend.
 */

async function request(endpoint, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  const config = {
    ...options,
    credentials: 'include', // Ensures HTTP-only session cookie is sent
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const res = await fetch(endpoint, config);
    let data = null;

    try {
      data = await res.json();
    } catch {
      // Non-json response
      data = null;
    }

    if (!res.ok) {
      const errorMsg = data?.error || `Request failed with status ${res.status}`;
      const error = new Error(errorMsg);
      error.status = res.status;
      error.data = data;
      error.errors = data?.errors || null;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.status) throw err;
    const networkError = new Error('Unable to connect to NEXTEST server. Please check your network or server status.');
    networkError.status = 0;
    throw networkError;
  }
}

export const api = {
  // Authentication
  auth: {
    register: (payload) => request('/api/auth/register', { method: 'POST', body: payload }),
    login: (payload) => request('/api/auth/login', { method: 'POST', body: payload }),
    logout: () => request('/api/auth/logout', { method: 'POST' }),
    me: () => request('/api/auth/me', { method: 'GET' })
  },

  // Student Profile
  students: {
    getProfile: () => request('/api/students/profile', { method: 'GET' }),
    updateProfile: (payload) => request('/api/students/profile', { method: 'PUT', body: payload })
  },

  // Tests Catalogue & Instructions
  tests: {
    getAvailable: () => request('/api/tests/available', { method: 'GET' }),
    getUpcoming: () => request('/api/tests/upcoming', { method: 'GET' }),
    getInstructions: (testId) => request(`/api/tests/${testId}/instructions`, { method: 'GET' })
  },

  // Attempts & Examination Engine
  attempts: {
    getDashboard: () => request('/api/dashboard', { method: 'GET' }),
    getHistory: () => request('/api/attempts/history', { method: 'GET' }),
    start: (testId) => request('/api/attempts/start', { method: 'POST', body: { testId } }),
    get: (attemptId) => request(`/api/attempts/${attemptId}`, { method: 'GET' }),
    save: (attemptId, responses) => request(`/api/attempts/${attemptId}/save`, { method: 'POST', body: { responses } }),
    submit: (attemptId, responses) => request(`/api/attempts/${attemptId}/submit`, { method: 'POST', body: { responses } }),
    getResult: (attemptId) => request(`/api/attempts/${attemptId}/result`, { method: 'GET' })
  },

  // Health
  health: {
    check: () => request('/api/health', { method: 'GET' })
  }
};
