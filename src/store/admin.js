/*import { configureStore, createSlice } from '@reduxjs/toolkit';

// Auth Slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('adminToken'),
  },
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('adminToken', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('adminToken');
    },
  },
});

// Drivers Slice
const driversSlice = createSlice({
  name: 'drivers',
  initialState: {
    drivers: [],
    loading: false,
    error: null,
  },
  reducers: {
    setDrivers: (state, action) => {
      state.drivers = action.payload;
    },
    updateDriverStatus: (state, action) => {
      const index = state.drivers.findIndex(d => d.id === action.payload.id);
      if (index !== -1) {
        state.drivers[index].status = action.payload.status;
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

// Users Slice
const usersSlice = createSlice({
  name: 'users',
  initialState: {
    users: [],
    loading: false,
  },
  reducers: {
    setUsers: (state, action) => {
      state.users = action.payload;
    },
    updateUserStatus: (state, action) => {
      const index = state.users.findIndex(u => u.id === action.payload.id);
      if (index !== -1) {
        state.users[index].status = action.payload.status;
      }
    },
  },
});

// Pricing Slice
const pricingSlice = createSlice({
  name: 'pricing',
  initialState: {
    pricePerKm: 1.5,
    baseFare: 50,
  },
  reducers: {
    updatePricing: (state, action) => {
      state.pricePerKm = action.payload.pricePerKm;
      state.baseFare = action.payload.baseFare;
    },
  },
});

// Disputes Slice
const disputesSlice = createSlice({
  name: 'disputes',
  initialState: {
    disputes: [],
    loading: false,
  },
  reducers: {
    setDisputes: (state, action) => {
      state.disputes = action.payload;
    },
    updateDisputeStatus: (state, action) => {
      const index = state.disputes.findIndex(d => d.id === action.payload.id);
      if (index !== -1) {
        state.disputes[index].status = action.payload.status;
      }
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export const { setDrivers, updateDriverStatus, setLoading } = driversSlice.actions;
export const { setUsers, updateUserStatus } = usersSlice.actions;
export const { updatePricing } = pricingSlice.actions;
export const { setDisputes, updateDisputeStatus } = disputesSlice.actions;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    drivers: driversSlice.reducer,
    users: usersSlice.reducer,
    pricing: pricingSlice.reducer,
    disputes: disputesSlice.reducer,
  },
});*/





































/**
 * store/admin.js
 * Redux Toolkit — slice principal SiRA Admin.
 * Contient tous les thunks async (appels API) + reducers + selectors.
 * Chaque section correspond à une app Django.
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  loginAdmin        as loginAdminAPI,
  logoutAdmin       as logoutAdminAPI,
  getAdminProfile,
  getDashboardStats,
  getDrivers        as getDriversAPI,
  validateDriver    as validateDriverAPI,
  rejectDriver      as rejectDriverAPI,
  suspendDriver     as suspendDriverAPI,
  activateDriver    as activateDriverAPI,
  getDriverDocuments,
  getRides          as getRidesAPI,
  cancelRide        as cancelRideAPI,
  resolveDispute    as resolveDisputeAPI,
  getRideStats,
  getClients        as getClientsAPI,
  updateUserStatus  as updateUserStatusAPI,
  getOperations     as getOperationsAPI,
  validateOperation as validateOperationAPI,
  rejectOperation   as rejectOperationAPI,
  getFraudAlerts    as getFraudAlertsAPI,
  reportDriver      as reportDriverAPI,
  getGpsAnalysis,
  resolveFraudAlert as resolveFraudAlertAPI,
  getPricing        as getPricingAPI,
  updatePricing     as updatePricingAPI,
  getAdminAlerts,
} from "../services/api";
import { saveTokens, clearTokens } from "../services/axios_instance";

/* ══════════════════════════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════════════════════════ */

/** État de chargement par défaut pour chaque entité */
const loadingState = () => ({ loading: false, error: null });

/* ══════════════════════════════════════════════════════════════════
   THUNKS — AUTH
   ══════════════════════════════════════════════════════════════════ */

export const loginThunk = createAsyncThunk(
  "admin/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await loginAdminAPI(credentials);
      // Sauvegarde des tokens dans localStorage via l'helper axiosInstance
      saveTokens(data.access, data.refresh);
      return data; // { access, refresh, user }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.detail || "Identifiants incorrects"
      );
    }
  }
);

export const logoutThunk = createAsyncThunk(
  "admin/logout",
  async (_, { rejectWithValue }) => {
    try {
      const refresh = localStorage.getItem("adminRefreshToken");
      if (refresh) await logoutAdminAPI(refresh);
    } catch {
      // On déconnecte quoi qu'il arrive
    } finally {
      clearTokens();
    }
  }
);

export const fetchProfileThunk = createAsyncThunk(
  "admin/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getAdminProfile();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || "Erreur profil");
    }
  }
);

/* ══════════════════════════════════════════════════════════════════
   THUNKS — DASHBOARD
   ══════════════════════════════════════════════════════════════════ */

export const fetchDashboardStats = createAsyncThunk(
  "admin/fetchDashboardStats",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getDashboardStats();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Erreur statistiques");
    }
  }
);

export const fetchAdminAlerts = createAsyncThunk(
  "admin/fetchAlerts",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getAdminAlerts();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Erreur alertes");
    }
  }
);

/* ══════════════════════════════════════════════════════════════════
   THUNKS — DRIVERS
   ══════════════════════════════════════════════════════════════════ */

export const fetchDrivers = createAsyncThunk(
  "admin/fetchDrivers",
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await getDriversAPI(params);
      return data; // { results: [], count: N }
    } catch (err) {
      return rejectWithValue(err.response?.data || "Erreur conducteurs");
    }
  }
);

export const validateDriverThunk = createAsyncThunk(
  "admin/validateDriver",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await validateDriverAPI(id);
      return { id, ...data };
    } catch (err) {
      return rejectWithValue(err.response?.data || "Erreur validation");
    }
  }
);

export const rejectDriverThunk = createAsyncThunk(
  "admin/rejectDriver",
  async ({ id, motif }, { rejectWithValue }) => {
    try {
      const { data } = await rejectDriverAPI(id, motif);
      return { id, motif, ...data };
    } catch (err) {
      return rejectWithValue(err.response?.data || "Erreur refus");
    }
  }
);

export const suspendDriverThunk = createAsyncThunk(
  "admin/suspendDriver",
  async ({ id, motif }, { rejectWithValue }) => {
    try {
      const { data } = await suspendDriverAPI(id, motif);
      return { id, ...data };
    } catch (err) {
      return rejectWithValue(err.response?.data || "Erreur suspension");
    }
  }
);

export const activateDriverThunk = createAsyncThunk(
  "admin/activateDriver",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await activateDriverAPI(id);
      return { id, ...data };
    } catch (err) {
      return rejectWithValue(err.response?.data || "Erreur activation");
    }
  }
);

export const fetchDriverDocuments = createAsyncThunk(
  "admin/fetchDriverDocuments",
  async (driverId, { rejectWithValue }) => {
    try {
      const { data } = await getDriverDocuments(driverId);
      return { driverId, documents: data };
    } catch (err) {
      return rejectWithValue(err.response?.data || "Erreur documents");
    }
  }
);

/* ══════════════════════════════════════════════════════════════════
   THUNKS — RIDES
   ══════════════════════════════════════════════════════════════════ */

export const fetchRides = createAsyncThunk(
  "admin/fetchRides",
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await getRidesAPI(params);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Erreur courses");
    }
  }
);

export const fetchRideStats = createAsyncThunk(
  "admin/fetchRideStats",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getRideStats();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Erreur stats courses");
    }
  }
);

export const cancelRideThunk = createAsyncThunk(
  "admin/cancelRide",
  async ({ id, motif }, { rejectWithValue }) => {
    try {
      const { data } = await cancelRideAPI(id, motif);
      return { id, motif, statut: "annulée", ...data };
    } catch (err) {
      return rejectWithValue(err.response?.data || "Erreur annulation");
    }
  }
);

export const resolveDisputeThunk = createAsyncThunk(
  "admin/resolveDispute",
  async ({ id, resolution }, { rejectWithValue }) => {
    try {
      const { data } = await resolveDisputeAPI(id, resolution);
      return { id, statut: "terminée", ...data };
    } catch (err) {
      return rejectWithValue(err.response?.data || "Erreur litige");
    }
  }
);

/* ══════════════════════════════════════════════════════════════════
   THUNKS — CLIENTS & PAIEMENTS
   ══════════════════════════════════════════════════════════════════ */

export const fetchClients = createAsyncThunk(
  "admin/fetchClients",
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await getClientsAPI(params);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Erreur clients");
    }
  }
);

export const updateClientStatus = createAsyncThunk(
  "admin/updateClientStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const { data } = await updateUserStatusAPI(id, { status });
      return { id, status, ...data };
    } catch (err) {
      return rejectWithValue(err.response?.data || "Erreur statut client");
    }
  }
);

export const fetchOperations = createAsyncThunk(
  "admin/fetchOperations",
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await getOperationsAPI(params);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Erreur opérations");
    }
  }
);

export const validateOperationThunk = createAsyncThunk(
  "admin/validateOperation",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await validateOperationAPI(id);
      return { id, statut: "validé", ...data };
    } catch (err) {
      return rejectWithValue(err.response?.data || "Erreur validation opération");
    }
  }
);

export const rejectOperationThunk = createAsyncThunk(
  "admin/rejectOperation",
  async ({ id, motif }, { rejectWithValue }) => {
    try {
      const { data } = await rejectOperationAPI(id, motif);
      return { id, statut: "rejeté", motif, ...data };
    } catch (err) {
      return rejectWithValue(err.response?.data || "Erreur rejet opération");
    }
  }
);

/* ══════════════════════════════════════════════════════════════════
   THUNKS — ANTI-FRAUDE
   ══════════════════════════════════════════════════════════════════ */

export const fetchFraudAlerts = createAsyncThunk(
  "admin/fetchFraudAlerts",
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await getFraudAlertsAPI(params);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Erreur alertes fraude");
    }
  }
);

export const reportDriverThunk = createAsyncThunk(
  "admin/reportDriver",
  async ({ driverId, motif }, { rejectWithValue }) => {
    try {
      const { data } = await reportDriverAPI(driverId, motif);
      return { driverId, motif, ...data };
    } catch (err) {
      return rejectWithValue(err.response?.data || "Erreur signalement");
    }
  }
);

export const fetchGpsAnalysis = createAsyncThunk(
  "admin/fetchGpsAnalysis",
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await getGpsAnalysis(params);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Erreur analyse GPS");
    }
  }
);

export const resolveFraudThunk = createAsyncThunk(
  "admin/resolveFraud",
  async ({ id, note }, { rejectWithValue }) => {
    try {
      const { data } = await resolveFraudAlertAPI(id, note);
      return { id, ...data };
    } catch (err) {
      return rejectWithValue(err.response?.data || "Erreur résolution fraude");
    }
  }
);

/* ══════════════════════════════════════════════════════════════════
   THUNKS — PRICING
   ══════════════════════════════════════════════════════════════════ */

export const fetchPricing = createAsyncThunk(
  "admin/fetchPricing",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getPricingAPI();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Erreur tarifs");
    }
  }
);

export const savePricingThunk = createAsyncThunk(
  "admin/savePricing",
  async (pricingData, { rejectWithValue }) => {
    try {
      const { data } = await updatePricingAPI(pricingData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Erreur sauvegarde tarifs");
    }
  }
);

/* ══════════════════════════════════════════════════════════════════
   STATE INITIAL
   ══════════════════════════════════════════════════════════════════ */

const initialState = {
  /* Auth */
  user:           null,
  isAuthenticated: !!localStorage.getItem("adminToken"),
  auth:           loadingState(),

  /* Dashboard */
  stats: {
    courses:      0,
    conducteurs:  0,
    revenus:      "0",
    litiges:      0,
  },
  alerts:         [],
  dashboard:      loadingState(),

  /* Drivers */
  drivers:        [],
  driverDocuments: {},        // { [driverId]: [...docs] }
  driversState:   loadingState(),

  /* Rides */
  rides:          [],
  rideStats:      {},
  ridesState:     loadingState(),

  /* Clients & paiements */
  clients:        [],
  operations:     [],
  clientsState:   loadingState(),

  /* Fraude */
  fraudAlerts:    [],
  gpsAnalysis:    [],
  fraudState:     loadingState(),

  /* Pricing */
  pricing:        null,
  pricingState:   loadingState(),

  /* Drivers signalés (local, UI only) */
  reportedDrivers: [],
};

/* ══════════════════════════════════════════════════════════════════
   SLICE
   ══════════════════════════════════════════════════════════════════ */

const adminSlice = createSlice({
  name: "admin",
  initialState,

  reducers: {
    /* ── Actions synchrones (mises à jour locales immédiates) ── */

    /** Met à jour le pricing localement (aperçu simulateur) */
    updatePricing(state, action) {
      state.pricing = { ...(state.pricing ?? {}), ...action.payload };
    },

    /** Met à jour le statut d'un utilisateur/client localement */
    updateUserStatus(state, action) {
      const { id, status } = action.payload;
      const client = state.clients.find(c => c.id === id);
      if (client) client.status = status;
    },

    /** Ajoute un conducteur à la liste des signalés (UI) */
    markDriverReported(state, action) {
      if (!state.reportedDrivers.includes(action.payload)) {
        state.reportedDrivers.push(action.payload);
      }
    },

    /** Vide le store à la déconnexion */
    resetStore() {
      return { ...initialState, isAuthenticated: false };
    },

    /** Met à jour la liste des utilisateurs admin */
    setUsers(state, action) {
      state.clients = action.payload;
    },
  },

  extraReducers: (builder) => {

    /* ── AUTH ── */
    builder
      .addCase(loginThunk.pending,  (s) => { s.auth = { loading: true,  error: null }; })
      .addCase(loginThunk.fulfilled,(s, a) => {
        s.auth            = loadingState();
        s.isAuthenticated = true;
        s.user            = a.payload.user ?? null;
      })
      .addCase(loginThunk.rejected, (s, a) => { s.auth = { loading: false, error: a.payload }; })

      .addCase(logoutThunk.fulfilled, (s) => {
        Object.assign(s, { ...initialState, isAuthenticated: false });
      })

      .addCase(fetchProfileThunk.fulfilled, (s, a) => { s.user = a.payload; });

    /* ── DASHBOARD ── */
    builder
      .addCase(fetchDashboardStats.pending,   (s) => { s.dashboard.loading = true; s.dashboard.error = null; })
      .addCase(fetchDashboardStats.fulfilled, (s, a) => {
        s.dashboard.loading = false;
        s.stats = {
          courses:     a.payload.total_rides     ?? 0,
          conducteurs: a.payload.active_drivers  ?? 0,
          revenus:     a.payload.revenue_today   ?? "0",
          litiges:     a.payload.open_disputes   ?? 0,
        };
      })
      .addCase(fetchDashboardStats.rejected,  (s, a) => { s.dashboard = { loading: false, error: a.payload }; })

      .addCase(fetchAdminAlerts.fulfilled, (s, a) => { s.alerts = a.payload.results ?? a.payload ?? []; });

    /* ── DRIVERS ── */
    builder
      .addCase(fetchDrivers.pending,   (s) => { s.driversState.loading = true; s.driversState.error = null; })
      .addCase(fetchDrivers.fulfilled, (s, a) => {
        s.driversState.loading = false;
        s.drivers = a.payload.results ?? a.payload ?? [];
      })
      .addCase(fetchDrivers.rejected,  (s, a) => { s.driversState = { loading: false, error: a.payload }; })

      .addCase(validateDriverThunk.fulfilled, (s, a) => {
        const d = s.drivers.find(d => d.id === a.payload.id);
        if (d) d.status = "validated";
      })
      .addCase(rejectDriverThunk.fulfilled, (s, a) => {
        const d = s.drivers.find(d => d.id === a.payload.id);
        if (d) d.status = "rejected";
      })
      .addCase(suspendDriverThunk.fulfilled, (s, a) => {
        const d = s.drivers.find(d => d.id === a.payload.id);
        if (d) d.status = "suspended";
      })
      .addCase(activateDriverThunk.fulfilled, (s, a) => {
        const d = s.drivers.find(d => d.id === a.payload.id);
        if (d) d.status = "active";
      })
      .addCase(fetchDriverDocuments.fulfilled, (s, a) => {
        s.driverDocuments[a.payload.driverId] = a.payload.documents;
      });

    /* ── RIDES ── */
    builder
      .addCase(fetchRides.pending,   (s) => { s.ridesState.loading = true; s.ridesState.error = null; })
      .addCase(fetchRides.fulfilled, (s, a) => {
        s.ridesState.loading = false;
        s.rides = a.payload.results ?? a.payload ?? [];
      })
      .addCase(fetchRides.rejected,  (s, a) => { s.ridesState = { loading: false, error: a.payload }; })

      .addCase(fetchRideStats.fulfilled, (s, a) => { s.rideStats = a.payload; })

      .addCase(cancelRideThunk.fulfilled, (s, a) => {
        const r = s.rides.find(r => r.id === a.payload.id);
        if (r) { r.statut = "annulée"; r.motifAnnulation = a.payload.motif; }
      })
      .addCase(resolveDisputeThunk.fulfilled, (s, a) => {
        const r = s.rides.find(r => r.id === a.payload.id);
        if (r) r.statut = "terminée";
      });

    /* ── CLIENTS & PAIEMENTS ── */
    builder
      .addCase(fetchClients.pending,   (s) => { s.clientsState.loading = true; s.clientsState.error = null; })
      .addCase(fetchClients.fulfilled, (s, a) => {
        s.clientsState.loading = false;
        s.clients = a.payload.results ?? a.payload ?? [];
      })
      .addCase(fetchClients.rejected,  (s, a) => { s.clientsState = { loading: false, error: a.payload }; })

      .addCase(updateClientStatus.fulfilled, (s, a) => {
        const c = s.clients.find(c => c.id === a.payload.id);
        if (c) c.status = a.payload.status;
      })

      .addCase(fetchOperations.fulfilled, (s, a) => {
        s.operations = a.payload.results ?? a.payload ?? [];
      })
      .addCase(validateOperationThunk.fulfilled, (s, a) => {
        const op = s.operations.find(o => o.id === a.payload.id);
        if (op) op.statut = "validé";
        // Mettre à jour aussi dans la liste du client concerné
        s.clients.forEach(c => {
          const cop = c.operations?.find(o => o.id === a.payload.id);
          if (cop) cop.statut = "validé";
        });
      })
      .addCase(rejectOperationThunk.fulfilled, (s, a) => {
        const op = s.operations.find(o => o.id === a.payload.id);
        if (op) op.statut = "rejeté";
        s.clients.forEach(c => {
          const cop = c.operations?.find(o => o.id === a.payload.id);
          if (cop) cop.statut = "rejeté";
        });
      });

    /* ── FRAUDE ── */
    builder
      .addCase(fetchFraudAlerts.pending,   (s) => { s.fraudState.loading = true; s.fraudState.error = null; })
      .addCase(fetchFraudAlerts.fulfilled, (s, a) => {
        s.fraudState.loading = false;
        s.fraudAlerts = a.payload.results ?? a.payload ?? [];
      })
      .addCase(fetchFraudAlerts.rejected,  (s, a) => { s.fraudState = { loading: false, error: a.payload }; })

      .addCase(fetchGpsAnalysis.fulfilled, (s, a) => { s.gpsAnalysis = a.payload.results ?? a.payload ?? []; })

      .addCase(reportDriverThunk.fulfilled, (s, a) => {
        if (!s.reportedDrivers.includes(a.payload.driverId)) {
          s.reportedDrivers.push(a.payload.driverId);
        }
      })
      .addCase(resolveFraudThunk.fulfilled, (s, a) => {
        s.fraudAlerts = s.fraudAlerts.filter(al => al.id !== a.payload.id);
      });

    /* ── PRICING ── */
    builder
      .addCase(fetchPricing.pending,   (s) => { s.pricingState.loading = true; s.pricingState.error = null; })
      .addCase(fetchPricing.fulfilled, (s, a) => {
        s.pricingState.loading = false;
        s.pricing = a.payload;
      })
      .addCase(fetchPricing.rejected,  (s, a) => { s.pricingState = { loading: false, error: a.payload }; })

      .addCase(savePricingThunk.pending,   (s) => { s.pricingState.loading = true; s.pricingState.error = null; })
      .addCase(savePricingThunk.fulfilled, (s, a) => {
        s.pricingState.loading = false;
        s.pricing = a.payload;
      })
      .addCase(savePricingThunk.rejected,  (s, a) => { s.pricingState = { loading: false, error: a.payload }; });
  },
});

/* ══════════════════════════════════════════════════════════════════
   ACTIONS SYNCHRONES (export)
   ══════════════════════════════════════════════════════════════════ */
export const {
  updatePricing,
  updateUserStatus,
  markDriverReported,
  resetStore,
  setUsers,
} = adminSlice.actions;

/* ══════════════════════════════════════════════════════════════════
   SELECTORS — évitent les accès directs au state dans les composants
   ══════════════════════════════════════════════════════════════════ */

// Auth
export const selectIsAuthenticated = (s) => s.admin.isAuthenticated;
export const selectCurrentUser     = (s) => s.admin.user;
export const selectAuthLoading     = (s) => s.admin.auth.loading;
export const selectAuthError       = (s) => s.admin.auth.error;

// Dashboard
export const selectStats           = (s) => s.admin.stats;
export const selectAlerts          = (s) => s.admin.alerts;
export const selectDashboardLoading= (s) => s.admin.dashboard.loading;

// Drivers
export const selectDrivers         = (s) => s.admin.drivers;
export const selectDriversLoading  = (s) => s.admin.driversState.loading;
export const selectDriverDocuments = (id) => (s) => s.admin.driverDocuments[id] ?? [];

// Rides
export const selectRides           = (s) => s.admin.rides;
export const selectRideStats       = (s) => s.admin.rideStats;
export const selectRidesLoading    = (s) => s.admin.ridesState.loading;

// Clients
export const selectClients         = (s) => s.admin.clients;
export const selectOperations      = (s) => s.admin.operations;
export const selectClientsLoading  = (s) => s.admin.clientsState.loading;

// Fraude
export const selectFraudAlerts     = (s) => s.admin.fraudAlerts;
export const selectGpsAnalysis     = (s) => s.admin.gpsAnalysis;
export const selectReportedDrivers = (s) => s.admin.reportedDrivers;
export const selectFraudLoading    = (s) => s.admin.fraudState.loading;

// Pricing
export const selectPricing         = (s) => s.admin.pricing;
export const selectPricingLoading  = (s) => s.admin.pricingState.loading;

/* ══════════════════════════════════════════════════════════════════
   EXPORT REDUCER
   ══════════════════════════════════════════════════════════════════ */
export default adminSlice.reducer;