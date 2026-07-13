import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../layouts/admin_layout';
import DashboardPage from '../pages/dash_board_page';
import DriversValidationPage from '../pages/driver_validation_page';
import UsersManagementPage from '../pages/users_management_page';
import FraudControlPage from '../pages/fraude_control_page';
import DisputesPage from '../pages/surveillance_page';
import PricingPage from '../pages/pricing_page';
import LoginPage from '../pages/login_page';
import ForgotPasswordPage from '../pages/oublier_mot_de_passe';

function AdminRoutes() {
  return (
    <Routes>
      {/* Routes publiques — SANS AdminLayout */}
      <Route path="login" element={<LoginPage />} />
      <Route path="forgotpassword" element={<ForgotPasswordPage />} />
      <Route path="resetpassword" element={<ForgotPasswordPage />} />

      {/* Routes protégées — AVEC AdminLayout */}
      <Route element={<AdminLayout />}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="drivers" element={<DriversValidationPage />} />
        <Route path="users" element={<UsersManagementPage />} />
        <Route path="fraude" element={<FraudControlPage />} />
        <Route path="disputes" element={<DisputesPage />} />
        <Route path="pricing" element={<PricingPage />} />
        <Route path="*" element={<DashboardPage />} />
      </Route>
    </Routes>
  );
}

export default AdminRoutes;