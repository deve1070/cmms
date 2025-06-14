import React, { Component, ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './contexts/AuthContext';
import BiomedicalLayout from './components/BiomedicalLayout';
import MaintenanceRoute from './components/MaintenanceRoute';

// Public pages
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';

// Biomedical pages
import BiomedicalEngineerDashboard from './pages/BiomedicalEngineerDashboard';
import Equipment from './pages/Equipment';
import AddEquipment from './pages/AddEquipment';
import WorkOrders from './pages/WorkOrders';
import NewWorkOrder from './pages/NewWorkOrder';
import MaintenanceScheduleView from './pages/MaintenanceScheduleView';
import SpareParts from './pages/SpareParts';
import MaintenanceReports from './pages/MaintenanceReports';
import MaintenanceTechDashboard from './pages/MaintenanceTechDashboard';

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Something went wrong</h1>
            <p>Please refresh the page or try again later.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Toaster position="top-right" />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Welcome />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Admin routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <BiomedicalLayout>
                <BiomedicalEngineerDashboard />
              </BiomedicalLayout>
            </ProtectedRoute>
          }
        />

        {/* Biomedical routes */}
        <Route
          path="/biomedical/dashboard"
          element={
            <ProtectedRoute allowedRoles={['biomedical engineer']}>
              <BiomedicalLayout>
                <BiomedicalEngineerDashboard />
              </BiomedicalLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/biomedical/equipment"
          element={
            <ProtectedRoute allowedRoles={['biomedical engineer']}>
              <BiomedicalLayout>
                <Equipment />
              </BiomedicalLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/biomedical/equipment/add"
          element={
            <ProtectedRoute allowedRoles={['biomedical engineer']}>
              <BiomedicalLayout>
                <AddEquipment />
              </BiomedicalLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/biomedical/work-orders"
          element={
            <ProtectedRoute allowedRoles={['biomedical engineer']}>
              <BiomedicalLayout>
                <WorkOrders />
              </BiomedicalLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/biomedical/work-orders/new"
          element={
            <ProtectedRoute allowedRoles={['biomedical engineer']}>
              <BiomedicalLayout>
                <NewWorkOrder />
              </BiomedicalLayout>
            </ProtectedRoute>
          }
        />

        {/* Maintenance routes */}
        <Route
          path="/maintenance"
          element={
            <ProtectedRoute allowedRoles={['engineer for maintenance']}>
              <MaintenanceRoute>
                <MaintenanceTechDashboard />
              </MaintenanceRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/maintenance/work-orders"
          element={
            <ProtectedRoute allowedRoles={['maintenance', 'engineer', 'engineer for maintenance']}>
              <MaintenanceRoute>
                <WorkOrders />
              </MaintenanceRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/maintenance/work-orders/new"
          element={
            <ProtectedRoute allowedRoles={['maintenance', 'engineer', 'engineer for maintenance']}>
              <MaintenanceRoute>
                <NewWorkOrder />
              </MaintenanceRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/maintenance/schedule"
          element={
            <ProtectedRoute allowedRoles={['maintenance', 'engineer']}>
              <MaintenanceRoute>
                <MaintenanceScheduleView />
              </MaintenanceRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/maintenance/spare-parts"
          element={
            <ProtectedRoute allowedRoles={['maintenance', 'engineer']}>
              <MaintenanceRoute>
                <SpareParts />
              </MaintenanceRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/maintenance/reports"
          element={
            <ProtectedRoute allowedRoles={['maintenance', 'engineer']}>
              <MaintenanceRoute>
                <MaintenanceReports />
              </MaintenanceRoute>
            </ProtectedRoute>
          }
        />

        {/* Lab routes */}
        <Route
          path="/lab/dashboard"
          element={
            <ProtectedRoute allowedRoles={['laboratory technician']}>
              <BiomedicalLayout>
                <BiomedicalEngineerDashboard />
              </BiomedicalLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default App;