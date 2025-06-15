import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Role } from './config/permissions';
import MaintenanceTechRoute from './components/MaintenanceTechRoute';
import LabTechRoute from './components/LabTechRoute';

// Public pages
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';

// Admin pages
import AdminDashboard from './pages/AdminDashboard';
import AdminLayout from './components/AdminLayout';
import Users from './pages/Users';
import CreateUser from './pages/CreateUser';
import Equipment from './pages/Equipment';
import MaintenanceSchedule from './pages/MaintenanceSchedule';
import MaintenanceReports from './pages/MaintenanceReports';
import MaintenanceTechDashboard from './pages/MaintenanceTechDashboard';
import LabTechDashboard from './pages/LabTechDashboard';
import ActivityLog from './pages/ActivityLog';
import Budgets from './pages/Budgets';
import Compliance from './pages/Compliance';
import ReportMaintenance from './pages/ReportMaintenance';
import LabEquipmentList from './pages/LabEquipmentList';
import LabReports from './pages/LabReports';
import LabNotifications from './pages/LabNotifications';

// Biomedical pages
import BiomedicalLayout from './components/BiomedicalLayout';
import MaintenanceRoute from './components/MaintenanceRoute';
import BiomedicalDashboard from './pages/BiomedicalDashboard';
import MaintenanceRequests from './pages/MaintenanceRequests';
import MaintenanceHistory from './pages/MaintenanceHistory';
import SpareParts from './pages/SpareParts';

// Error Boundary Component
const ErrorFallback = ({ error }: { error: Error }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Reload page
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="users/new" element={<CreateUser />} />
            <Route path="equipment" element={<Equipment />} />
            <Route path="maintenance-schedule" element={<MaintenanceSchedule />} />
            <Route path="maintenance-reports" element={<MaintenanceReports />} />
            <Route path="budgets" element={<Budgets />} />
            <Route path="compliance" element={<Compliance />} />
            <Route path="activity-log" element={<ActivityLog />} />
          </Route>

          {/* Biomedical routes */}
          <Route path="/biomed" element={<BiomedicalLayout />}>
            <Route index element={<BiomedicalDashboard />} />
            <Route path="maintenance" element={<MaintenanceRoute />}>
              <Route index element={<MaintenanceRequests />} />
              <Route path="history" element={<MaintenanceHistory />} />
            </Route>
            <Route path="spare-parts" element={<SpareParts />} />
            <Route path="budgets" element={<Budgets />} />
            <Route path="compliance" element={<Compliance />} />
            <Route path="activity-log" element={<ActivityLog />} />
          </Route>

          {/* Lab Technician routes */}
          <Route path="/lab" element={<LabTechRoute />}>
            <Route index element={<LabTechDashboard />} />
            <Route path="dashboard" element={<LabTechDashboard />} />
            <Route path="equipment" element={<LabEquipmentList />} />
            <Route path="reports" element={<LabReports />} />
            <Route path="notifications" element={<LabNotifications />} />
            <Route path="activity-log" element={<ActivityLog />} />
          </Route>

          {/* Maintenance Technician routes */}
          <Route
            path="/maintenance"
            element={
              <MaintenanceTechRoute>
                <MaintenanceTechDashboard />
              </MaintenanceTechRoute>
            }
          />
          <Route
            path="/maintenance/dashboard"
            element={
              <MaintenanceTechRoute>
                <MaintenanceTechDashboard />
              </MaintenanceTechRoute>
            }
          />
          <Route
            path="/maintenance/report"
            element={
              <MaintenanceTechRoute>
                <ReportMaintenance />
              </MaintenanceTechRoute>
            }
          />
          <Route
            path="/maintenance/work-orders"
            element={
              <MaintenanceTechRoute>
                <MaintenanceRequests />
              </MaintenanceTechRoute>
            }
          />
          <Route
            path="/maintenance/work-orders/:id"
            element={
              <MaintenanceTechRoute>
                <MaintenanceRequests />
              </MaintenanceTechRoute>
            }
          />
          <Route
            path="/maintenance/schedule"
            element={
              <MaintenanceTechRoute>
                <MaintenanceSchedule />
              </MaintenanceTechRoute>
            }
          />
          <Route
            path="/maintenance/schedule/:id"
            element={
              <MaintenanceTechRoute>
                <MaintenanceSchedule />
              </MaintenanceTechRoute>
            }
          />
          <Route
            path="/maintenance/spare-parts"
            element={
              <MaintenanceTechRoute>
                <SpareParts />
              </MaintenanceTechRoute>
            }
          />
          <Route
            path="/maintenance/activity-log"
            element={
              <MaintenanceTechRoute>
                <ActivityLog />
              </MaintenanceTechRoute>
            }
          />

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/welcome" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;