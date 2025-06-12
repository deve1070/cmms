import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
import MainTechDashboard from './pages/MainTechDashboard';
import WorkOrders from './pages/WorkOrders';
import ReportMaintenance from './pages/ReportMaintenance';

// Lab Tech pages
import LabTechDashboard from './pages/LabTechDashboard';
import LabEquipmentList from './pages/LabEquipmentList';
import ReportIssue from './pages/ReportIssue';

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

  if (!allowedRoles.includes(user.role.toLowerCase())) {
    // Redirect to appropriate dashboard based on role
    switch (user.role.toLowerCase()) {
      case 'admin':
        return <Navigate to="/admin/dashboard" />;
      case 'maintenance':
        return <Navigate to="/maintenance/dashboard" />;
      case 'labtech':
        return <Navigate to="/lab/dashboard" />;
      default:
        return <Navigate to="/welcome" />;
    }
  }

  return <>{children}</>;
};

const RootRedirect: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/welcome" />;
  }

  switch (user.role.toLowerCase()) {
    case 'admin':
      return <Navigate to="/admin/dashboard" />;
    case 'maintenance':
      return <Navigate to="/maintenance/dashboard" />;
    case 'labtech':
      return <Navigate to="/lab/dashboard" />;
    default:
      return <Navigate to="/welcome" />;
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

        {/* Maintenance routes */}
        <Route
          path="/maintenance/dashboard"
          element={
            <ProtectedRoute allowedRoles={['maintenance']}>
              <MainTechDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/maintenance/work-orders"
          element={
            <ProtectedRoute allowedRoles={['maintenance']}>
              <WorkOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/maintenance/report"
          element={
            <ProtectedRoute allowedRoles={['maintenance']}>
              <ReportMaintenance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/maintenance/equipment"
          element={
            <ProtectedRoute allowedRoles={['maintenance']}>
              <EquipmentList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/maintenance/spare-parts"
          element={
            <ProtectedRoute allowedRoles={['maintenance']}>
              <SpareParts />
            </ProtectedRoute>
          }
        />

        {/* Lab Tech routes */}
        <Route
          path="/lab/dashboard"
          element={
            <ProtectedRoute allowedRoles={['labtech']}>
              <LabTechDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lab/equipment"
          element={
            <ProtectedRoute allowedRoles={['labtech']}>
              <LabEquipmentList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lab/report-issue"
          element={
            <ProtectedRoute allowedRoles={['labtech']}>
              <ReportIssue />
            </ProtectedRoute>
          }
        />

        {/* Redirect root to appropriate dashboard or welcome page */}
        <Route path="/" element={<RootRedirect />} />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/welcome" />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
