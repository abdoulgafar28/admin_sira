import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './admin/layouts/admin_layout';
import LoginPage            from './admin/pages/login_page';
import DashboardPage        from './admin/pages/dash_board_page';
import DriversValidationPage from './admin/pages/driver_validation_page';
import UsersManagementPage  from './admin/pages/courses_page';
import FraudControlPage     from './admin/pages/fraude_control_page';
import SurveillancePage     from './admin/pages/surveillance_page';
import PricingPage          from './admin/pages/pricing_page';
import CoursesPage          from './admin/pages/courses_page';
import ClientsOperationsPage from './admin/pages/gestion_oprations';
import ForgotPasswordPage   from './admin/pages/oublier_mot_de_passe';

// ── Garde d'authentification ──────────────────────────────────────────────────
function RequireAuth() {
  const isAuthenticated = Boolean(localStorage.getItem('adminToken'));
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  // Outlet est rendu par AdminLayout via <Outlet />
  return <AdminLayout />;
}

function App() {
  return (
    <Routes>
      {/* ── Route publique ─────────────────────────────────────── */}
      
      <Route path="/login"            element={<LoginPage />} />
      <Route path="/forgotpassword"   element={<ForgotPasswordPage />} />
      <Route path="/resetpassword"    element={<ForgotPasswordPage />} />
      <Route path="/"                 element={<Navigate to="/login" replace />} />




      {/* ── Routes protégées — toutes imbriquées sous AdminLayout ─ */}
      <Route element={<RequireAuth />}>
        <Route path="/dashboard"    element={<DashboardPage />} />
        <Route path="/drivers"      element={<DriversValidationPage />} />
        <Route path="/users"        element={<UsersManagementPage />} />
        <Route path="/antifraude"   element={<FraudControlPage />} />
        <Route path="/surveillance" element={<SurveillancePage />} />
        <Route path="/pricing"      element={<PricingPage />} />
        <Route path="/courses"      element={<CoursesPage />} />
        <Route path="/operations"      element={<ClientsOperationsPage />} />
        <Route path="/forgotpassword"      element={<ForgotPasswordPage />} />
        {/* Fallback connecté */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default App;