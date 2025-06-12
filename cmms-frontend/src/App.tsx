import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Public pages
import Welcome from './pages/Welcome';
import Login from './pages/Login';

// Admin pages
import AdminDashboard from './pages/AdminDashboard';
import EquipmentList from './pages/EquipmentList';
import SpareParts from './pages/SpareParts';
import Contracts from './pages/Contracts';
import Reports from './pages/Reports';
import Budgets from './pages/Budgets';
import Compliance from './pages/Compliance';
import UserManagement from './pages/UserManagement';

// Maintenance pages
import WorkOrders from './pages/WorkOrders';
import ReportMaintenance from './pages/ReportMaintenance';
import MaintenanceTechDashboard from './pages/MaintenanceTechDashboard';
import NewWorkOrder from './pages/NewWorkOrder';
import MaintenanceSchedule from './pages/MaintenanceSchedule';
import MaintenanceReports from './pages/MaintenanceReports';

// Lab Tech pages
import LabTechDashboard from './pages/LabTechDashboard';
import LabEquipmentList from './pages/LabEquipmentList';
import ReportIssue from './pages/ReportIssue';
import LabReports from './pages/LabReports';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Normalize roles for comparison
  const userRole = user.role.toLowerCase();
  const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());

  if (!normalizedAllowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on role
    switch (userRole) {
      case 'admin':
        return <Navigate to="/admin/dashboard" />;
      case 'engineer for maintenance':
        return <Navigate to="/maintenance/dashboard" />;
      case 'laboratory technician':
        return <Navigate to="/lab/dashboard" />;
      case 'biomedical engineer':
        return <Navigate to="/biomedical/dashboard" />;
      default:
        console.warn('Unknown role:', userRole);
        return <Navigate to="/welcome" />;
    }
  }

  return <>{children}</>;
};

const RootRedirect: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.role.toLowerCase();
  switch (role) {
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'engineer for maintenance':
      return <Navigate to="/maintenance/dashboard" replace />;
    case 'laboratory technician':
      return <Navigate to="/lab/dashboard" replace />;
    case 'biomedical engineer':
      return <Navigate to="/biomedical/dashboard" replace />;
    default:
      return <Navigate to="/welcome" replace />;
  }
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Routes>
        {/* Public routes */}
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RootRedirect />} />

        {/* Admin routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/equipment"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <EquipmentList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/spare-parts"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <SpareParts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/contracts"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Contracts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/budgets"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Budgets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/compliance"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Compliance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserManagement />
            </ProtectedRoute>
          }
        />

        {/* Maintenance and Engineer routes */}
        <Route
          path="/maintenance/dashboard"
          element={
            <ProtectedRoute allowedRoles={['maintenance', 'engineer']}>
              <MaintenanceTechDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/maintenance/work-orders"
          element={
            <ProtectedRoute allowedRoles={['maintenance', 'engineer']}>
              <WorkOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/maintenance/work-orders/new"
          element={
            <ProtectedRoute allowedRoles={['maintenance', 'engineer']}>
              <NewWorkOrder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/maintenance/schedule"
          element={
            <ProtectedRoute allowedRoles={['maintenance', 'engineer']}>
              <MaintenanceSchedule />
            </ProtectedRoute>
          }
        />
        <Route
          path="/maintenance/spare-parts"
          element={
            <ProtectedRoute allowedRoles={['maintenance', 'engineer']}>
              <SpareParts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/maintenance/reports"
          element={
            <ProtectedRoute allowedRoles={['maintenance', 'engineer']}>
              <MaintenanceReports />
            </ProtectedRoute>
          }
        />

        {/* Lab Tech routes */}
        <Route
          path="/lab/dashboard"
          element={
            <ProtectedRoute allowedRoles={['laboratory technician']}>
              <LabTechDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lab/equipment"
          element={
            <ProtectedRoute allowedRoles={['laboratory technician']}>
              <LabEquipmentList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lab/report-issue"
          element={
            <ProtectedRoute allowedRoles={['laboratory technician']}>
              <ReportIssue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lab/reports"
          element={
            <ProtectedRoute allowedRoles={['laboratory technician']}>
              <LabReports />
            </ProtectedRoute>
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
