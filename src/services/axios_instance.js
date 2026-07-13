

import axios from "axios";

const BASE_URL = "http://localhost:8000/api/v1";

/* ─── Instance principale ─────────────────────────────────────────── */
const API = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

/* ─── Instance secondaire pour le refresh (évite la boucle infinie) ─ */
const REFRESH_API = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

/* ─── Helpers token ───────────────────────────────────────────────── */
export const getAccessToken  = () => localStorage.getItem("adminToken");
export const getRefreshToken = () => localStorage.getItem("adminRefreshToken");

export const saveTokens = (access, refresh) => {
  localStorage.setItem("adminToken",        access);
  localStorage.setItem("adminRefreshToken", refresh);
};

export const clearTokens = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminRefreshToken");
  localStorage.removeItem("rememberedEmail");
};

/* ─── Verrou refresh (évite les appels parallèles) ───────────────── */
let isRefreshing   = false;
let refreshQueue   = [];   // fonctions en attente du nouveau token

const processQueue = (error, token = null) => {
  refreshQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  refreshQueue = [];
};

/* ─── Intercepteur REQUEST — injecte le token ────────────────────── */
API.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

/* ─── Intercepteur RESPONSE — gère les 401 ──────────────────────── */
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Pas un 401 ou déjà tenté → on propage
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Pas de refresh token → déconnexion immédiate
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // Un refresh est déjà en cours → on met en file d'attente
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return API(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // On lance le refresh
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await REFRESH_API.post("/auth/token/refresh/", {
        refresh: refreshToken,
      });

      const newAccess = data.access;
      saveTokens(newAccess, data.refresh ?? refreshToken);

      API.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
      originalRequest.headers.Authorization     = `Bearer ${newAccess}`;

      processQueue(null, newAccess);
      return API(originalRequest);

    } catch (refreshError) {
      processQueue(refreshError, null);
      clearTokens();
      window.location.href = "/login";
      return Promise.reject(refreshError);

    } finally {
      isRefreshing = false;
    }
  }
);

export default API;



/**
 * axiosInstance.js
 * Client HTTP central pour SiRA Admin.
 * - Injecte le Bearer token sur chaque requête
 * - Tente un refresh silencieux si 401 (token expiré)
 * - Déconnecte et redirige vers /login si refresh impossible
 */