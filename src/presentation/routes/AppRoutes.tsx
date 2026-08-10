import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../application/context/AuthContext';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AsignarRecojosPage from '../pages/admin/AsignarRecojosPage';
import AsignarEntregasPage from '../pages/admin/AsignarEntregasPage';
import MonitoreoRecojosPage from '../pages/admin/MonitoreoRecojosPage';
import RendicionCuentasAdminPage from '../pages/admin/RendicionCuentasAdminPage';
import { ReprogramacionesAdminPage } from '../pages/admin/ReprogramacionesAdminPage';
import ComercioDashboard from '../pages/comercio/ComercioDashboard';
import MotorizadoRecojosPage from '../pages/motorizado/MotorizadoRecojosPage';
import MotorizadoEntregasPage from '../pages/motorizado/MotorizadoEntregasPage';
import ClienteDashboard from '../pages/cliente/ClienteDashboard';
import UpgradeComercioPage from '../pages/comercio/UpgradeComercioPage';
import LandingPage from '../pages/LandingPage';

// Guard para proteger rutas por Roles explícitos
const RoleProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles: string[] }> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Cargando sesión...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.rolNombre)) {
    // Si no tiene el rol correspondiente, se redirige al distribuidor central
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Guard para impedir re-ingreso a rutas públicas si ya existe sesión activa
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Cargando sesión...
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Dispatcher central inteligente de Rutas por Rol
const RoleRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Cargando sesión...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.rolNombre) {
    case 'Administrador':
      return <Navigate to="/admin/dashboard" replace />;
    case 'Comercio':
      return <Navigate to="/comercio/dashboard" replace />;
    case 'Motorizado':
      return <Navigate to="/motorizado/recojos" replace />;
    case 'ClienteFinal':
      return <Navigate to="/cliente/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page Pública con Rastreo de Envíos */}
        <Route path="/" element={<LandingPage />} />

        {/* Rutas Públicas */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* Dispatcher central de Redirección inteligente */}
        <Route path="/dashboard" element={<RoleRedirect />} />

        {/* Ruta Protegida de Ascenso a Comercio */}
        <Route
          path="/comercio/upgrade"
          element={
            <RoleProtectedRoute allowedRoles={['ClienteFinal']}>
              <UpgradeComercioPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/upgrade-comercio"
          element={
            <RoleProtectedRoute allowedRoles={['ClienteFinal']}>
              <UpgradeComercioPage />
            </RoleProtectedRoute>
          }
        />

        {/* Rutas Protegidas por Rol */}
        <Route
          path="/admin/dashboard"
          element={
            <RoleProtectedRoute allowedRoles={['Administrador']}>
              <AdminDashboard />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin/asignar-recojos"
          element={
            <RoleProtectedRoute allowedRoles={['Administrador']}>
              <AsignarRecojosPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin/asignar-entregas"
          element={
            <RoleProtectedRoute allowedRoles={['Administrador']}>
              <AsignarEntregasPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin/monitoreo-recojos"
          element={
            <RoleProtectedRoute allowedRoles={['Administrador']}>
              <MonitoreoRecojosPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin/rendicion-cuentas"
          element={
            <RoleProtectedRoute allowedRoles={['Administrador']}>
              <RendicionCuentasAdminPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin/reprogramaciones"
          element={
            <RoleProtectedRoute allowedRoles={['Administrador']}>
              <ReprogramacionesAdminPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/comercio/dashboard"
          element={
            <RoleProtectedRoute allowedRoles={['Comercio']}>
              <ComercioDashboard />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/motorizado/dashboard"
          element={<Navigate to="/motorizado/recojos" replace />}
        />

        <Route
          path="/motorizado/recojos"
          element={
            <RoleProtectedRoute allowedRoles={['Motorizado']}>
              <MotorizadoRecojosPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/motorizado/entregas"
          element={
            <RoleProtectedRoute allowedRoles={['Motorizado']}>
              <MotorizadoEntregasPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/cliente/dashboard"
          element={
            <RoleProtectedRoute allowedRoles={['ClienteFinal', 'Comercio']}>
              <ClienteDashboard />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/cliente/rastreo"
          element={<Navigate to="/cliente/dashboard" replace />}
        />

        {/* Fallback de redirección */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
