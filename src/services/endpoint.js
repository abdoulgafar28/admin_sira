// src/services/endpoints.js

const BASE_URL = "http://localhost:8000/api";

export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/admin/login/",
    REGISTER: "/admin/register/",
    COMPANIES: "/admin/companies/",
    REFRESH: "/admin/refresh/",
    ME: "/admin/me/",
  },
  DRIVERS: {
    LIST: "/admin/drivers/",
    VALIDATE: (id) => `/admin/drivers/${id}/validate/`,
    DOCUMENTS: (id) => `/admin/drivers/${id}/documents/`,
  },
  USERS: {
    LIST: "/admin/users/",
    UPDATE: (id) => `/admin/users/${id}/`,
  },
  FRAUD: {
    TRIPS: "/admin/trips/",
    ANALYZE: (tripId) => `/admin/trips/${tripId}/analyze/`,
  },
  DISPUTES: {
    LIST: "/admin/disputes/",
    RESOLVE: (id) => `/admin/disputes/${id}/resolve/`,
  },
  PRICING: {
    GET: "/admin/pricing/",
    UPDATE: "/admin/pricing/",
  },
  DASHBOARD: {
    STATS: "/admin/stats/",
  },
};

export default BASE_URL;
