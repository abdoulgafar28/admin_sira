// src/services/api.js
/**
 * API Admin SiRA — Tous les appels backend.
 * Base URL : http://localhost:8000/api/v1
 * Organisation par domaine : auth, drivers, rides, tracking, fraud, payments, admin_panel
 */
import API from "./axios_instance";

/* ═══════════════════════════════════════════════════════════════
   AUTH — /api/v1/admin/auth/   (AdminLoginView + AdminRegisterViewSet)
   ═══════════════════════════════════════════════════════════════ */

/**
 * Connexion admin par email + password.
 * POST /api/v1/admin/auth/login/
 * Body : { email, password }
 * Retourne : { success, message, data: { refresh, access, user } }
 */
export const loginAdmin = (credentials) =>
  API.post("/admin/auth/login/", credentials);

/**
 * Inscription entreprise + admin.
 * POST /api/v1/admin/auth/register/
 * Body : { company_name, email, password, confirm_password }
 */
export const registerAdmin = (data) =>
  API.post("/admin/auth/register/", data);

/**
 * Déconnexion — blackliste le refresh token.
 * POST /api/v1/auth/logout/
 * Header : Authorization: Bearer <access_token>
 * Body : { refresh }
 */
export const logoutAdmin = (refreshToken) =>
  API.post("/auth/logout/", { refresh: refreshToken });

/**
 * Rafraîchir le token (utilisé par axiosInstance en interne).
 * POST /api/v1/auth/token/refresh/
 * Body : { refresh }
 */
export const refreshToken = (refresh) =>
  API.post("/auth/token/refresh/", { refresh });

/**
 * Profil admin connecté (via /auth/me/ ou /admin/me/)
 * GET /api/v1/auth/me/
 */
export const getAdminProfile = () =>
  API.get("/auth/me/");

/**
 * Changer le mot de passe.
 * POST /api/v1/auth/me/password/
 */
export const changePassword = (data) =>
  API.post("/auth/me/password/", data);

/* ═══════════════════════════════════════════════════════════════
   COMPANIES — /api/v1/admin/companies/
   ═══════════════════════════════════════════════════════════════ */

/**
 * Liste des entreprises (pour dropdown login).
 * GET /api/v1/admin/companies/
 */
export const getCompanies = () =>
  API.get("/admin/companies/");

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD — /api/v1/admin/dashboard/
   ═══════════════════════════════════════════════════════════════ */

/**
 * Statistiques globales du dashboard.
 * GET /api/v1/admin/dashboard/stats/
 */
export const getDashboardStats = () =>
  API.get("/admin/dashboard/stats/");

/**
 * Courses récentes.
 * GET /api/v1/admin/dashboard/recent-rides/
 */
export const getRecentRides = () =>
  API.get("/admin/dashboard/recent-rides/");

/**
 * Alertes admin.
 * GET /api/v1/admin/dashboard/alerts/
 */
export const getAdminAlerts = () =>
  API.get("/admin/dashboard/alerts/");

/* ═══════════════════════════════════════════════════════════════
   DRIVERS — /api/v1/admin/drivers/
   ═══════════════════════════════════════════════════════════════ */

/**
 * Liste des conducteurs (avec filtres).
 * GET /api/v1/admin/drivers/?status=En Attente&search=xxx
 */
export const getDrivers = (params = {}) =>
  API.get("/admin/drivers/", { params });

/**
 * Détail d'un conducteur.
 * GET /api/v1/admin/drivers/:id/
 */
export const getDriverById = (id) =>
  API.get(`/admin/drivers/${id}/`);

/**
 * Valider un conducteur.
 * PATCH /api/v1/admin/drivers/:id/validate/
 * Body : { action: "validate" }
 */
export const validateDriver = (id) =>
  API.patch(`/admin/drivers/${id}/validate/`, { action: "validate" });

/**
 * Rejeter un conducteur.
 * PATCH /api/v1/admin/drivers/:id/validate/
 * Body : { action: "reject", motif: "Raison du rejet" }
 */
export const rejectDriver = (id, motif) =>
  API.patch(`/admin/drivers/${id}/validate/`, { action: "reject", motif });

/**
 * Suspendre un conducteur.
 * PATCH /api/v1/drivers/:id/suspend/
 */
export const suspendDriver = (id, motif) =>
  API.patch(`/drivers/${id}/suspend/`, { motif });

/**
 * Réactiver un conducteur.
 * PATCH /api/v1/drivers/:id/activate/
 */
export const activateDriver = (id) =>
  API.patch(`/drivers/${id}/activate/`);

/**
 * Mettre à jour le statut d'un conducteur.
 * PATCH /api/v1/drivers/:id/
 */
export const updateDriverStatus = (id, data) =>
  API.patch(`/drivers/${id}/`, data);

/**
 * Documents d'un conducteur.
 * GET /api/v1/drivers/:id/documents/
 */
export const getDriverDocuments = (id) =>
  API.get(`/drivers/${id}/documents/`);

/* ═══════════════════════════════════════════════════════════════
   RIDES — /api/v1/admin/rides/
   ═══════════════════════════════════════════════════════════════ */

/**
 * Liste des courses (avec filtres).
 * GET /api/v1/admin/rides/?status=En cours&search=xxx
 */
export const getRides = (params = {}) =>
  API.get("/admin/rides/", { params });

/**
 * Détail d'une course.
 * GET /api/v1/admin/rides/:id/
 */
export const getRideById = (id) =>
  API.get(`/admin/rides/${id}/`);

/**
 * Annuler une course.
 * PATCH /api/v1/rides/:id/cancel/
 */
export const cancelRide = (id, motif) =>
  API.patch(`/rides/${id}/cancel/`, { motif });

/**
 * Résoudre un litige.
 * PATCH /api/v1/rides/:id/resolve-dispute/
 */
export const resolveDispute = (id, resolution) =>
  API.patch(`/rides/${id}/resolve-dispute/`, { resolution });

/**
 * Statistiques des courses.
 * GET /api/v1/rides/stats/
 */
export const getRideStats = () =>
  API.get("/rides/stats/");

/* ═══════════════════════════════════════════════════════════════
   TRACKING / SURVEILLANCE — /api/v1/admin/surveillance/
   ═══════════════════════════════════════════════════════════════ */

/**
 * Position temps réel des conducteurs.
 * GET /api/v1/admin/surveillance/?status=Disponible
 */
export const getDriverLocation = (driverId) =>
  API.get(`/tracking/${driverId}/location/`);

/**
 * Historique GPS d'une course.
 * GET /api/v1/tracking/ride/:rideId/path/
 */
export const getRidePath = (rideId) =>
  API.get(`/tracking/ride/${rideId}/path/`);

/**
 * Conducteurs actifs en ce moment.
 * GET /api/v1/tracking/active-drivers/
 */
export const getActiveDrivers = () =>
  API.get("/tracking/active-drivers/");

/* ═══════════════════════════════════════════════════════════════
   FRAUD — /api/v1/admin/fraud/
   ═══════════════════════════════════════════════════════════════ */

/**
 * Liste des alertes fraude.
 * GET /api/v1/admin/fraud/
 */
export const getFraudAlerts = (params = {}) =>
  API.get("/admin/fraud/", { params });

/**
 * Détail d'une alerte fraude.
 * GET /api/v1/admin/fraud/:id/
 */
export const getFraudAlertById = (id) =>
  API.get(`/admin/fraud/${id}/`);

/**
 * Signaler un conducteur.
 * POST /api/v1/fraud/report/
 */
export const reportDriver = (driverId, motif) =>
  API.post("/fraud/report/", { driver_id: driverId, motif });

/**
 * Analyse GPS.
 * GET /api/v1/fraud/gps-analysis/
 */
export const getGpsAnalysis = (params = {}) =>
  API.get("/fraud/gps-analysis/", { params });

/**
 * Résoudre une alerte fraude.
 * PATCH /api/v1/admin/fraud/:id/resolve/
 */
export const resolveFraudAlert = (id, note) =>
  API.patch(`/admin/fraud/${id}/resolve/`, { note });

/* ═══════════════════════════════════════════════════════════════
   OPERATIONS / CLIENTS — /api/v1/admin/operations/
   ═══════════════════════════════════════════════════════════════ */

/**
 * Liste des clients.
 * GET /api/v1/admin/operations/clients/?status=Actifs&search=xxx
 */
export const getClients = (params = {}) =>
  API.get("/admin/operations/clients/", { params });

/**
 * Détail d'un client.
 * GET /api/v1/admin/operations/clients/:id/
 */
export const getClientById = (id) =>
  API.get(`/admin/operations/clients/${id}/`);

/**
 * Suspendre / réactiver un client.
 * PATCH /api/v1/admin/operations/clients/:id/suspend/
 * Body : { action: "suspend"|"activate", reason: "..." }
 */
export const updateUserStatus = (id, data) =>
  API.patch(`/admin/operations/clients/${id}/suspend/`, data);

/**
 * Solde d'un client.
 * GET /api/v1/payments/clients/:id/balance/
 */
export const getClientBalance = (id) =>
  API.get(`/payments/clients/${id}/balance/`);

/**
 * Liste des opérations.
 * GET /api/v1/payments/operations/
 */
export const getOperations = (params = {}) =>
  API.get("/payments/operations/", { params });

/**
 * Valider une opération.
 * PATCH /api/v1/payments/operations/:id/validate/
 */
export const validateOperation = (id) =>
  API.patch(`/payments/operations/${id}/validate/`);

/**
 * Rejeter une opération.
 * PATCH /api/v1/payments/operations/:id/reject/
 */
export const rejectOperation = (id, motif) =>
  API.patch(`/payments/operations/${id}/reject/`, { motif });

/* ═══════════════════════════════════════════════════════════════
   PRICING — /api/v1/admin/pricing/
   ═══════════════════════════════════════════════════════════════ */

/**
 * Tarification passager.
 * GET/PUT /api/v1/admin/pricing/passenger/
 */
export const getPricing = () =>
  API.get("/admin/pricing/passenger/");

export const updatePricing = (data) =>
  API.put("/admin/pricing/passenger/", data);

/**
 * Statistiques opérations.
 * GET /api/v1/admin/operations/stats/
 */
export const getOperationsStats = () =>
  API.get("/admin/operations/stats/");

/* ═══════════════════════════════════════════════════════════════
   UTILISATEURS (générique)
   ═══════════════════════════════════════════════════════════════ */

/**
 * Liste des utilisateurs (admin panel).
 * GET /api/v1/admin/users/   (si vous avez cet endpoint)
 */
export const getUsers = () =>
  API.get("/admin/users/");

/**
 * Mettre à jour le statut d'un utilisateur.
 * PATCH /api/v1/admin/users/:id/
 */
export const updateAdminUserStatus = (id, data) =>
  API.patch(`/admin/users/${id}/`, data);

export const verifyAdmin2FA = (email, code) =>
  API.post("/admin/auth/verify-2fa/", { email, code });


/**
 * Demande de réinitialisation de mot de passe.
 * POST /api/v1/admin/auth/forgot-password/
 */
export const forgotPassword = (email) =>
  API.post("/admin/auth/forgot-password/", { email });

/**
 * Réinitialisation du mot de passe.
 * POST /api/v1/admin/auth/reset-password/
 */
export const resetPassword = (token, email, new_password, confirm_password) =>
  API.post("/admin/auth/reset-password/", { token, email, new_password, confirm_password });