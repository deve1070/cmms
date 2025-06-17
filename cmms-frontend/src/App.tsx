import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Role } from './config/permissions';
import MaintenanceTechRoute from './components/MaintenanceTechRoute';
import LabTechRoute from './components/LabTechRoute';
import AdminRoute from './components/AdminRoute';
import BiomedicalRoute from './components/BiomedicalRoute';

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
import BiomedicalEngineerDashboard from './pages/BiomedicalEngineerDashboard';
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
        <Toaster position="top-right" />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/welcome" element={<Welcome />} />

          {/* Admin routes */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<Users />} />
              <Route path="/admin/users/new" element={<CreateUser />} />
              <Route path="/admin/equipment" element={<Equipment />} />
              <Route path="/admin/maintenance-schedule" element={<MaintenanceSchedule />} />
              <Route path="/admin/maintenance-reports" element={<MaintenanceReports />} />
              <Route path="/admin/activity-log" element={<ActivityLog />} />
              <Route path="/admin/budgets" element={<Budgets />} />
              <Route path="/admin/compliance" element={<Compliance />} />
            </Route>
          </Route>

          {/* Biomedical Engineer routes */}
          <Route element={<BiomedicalRoute />}>
            <Route path="/biomedical/dashboard" element={<BiomedicalEngineerDashboard />} />
            <Route path="/biomedical/equipment" element={<Equipment />} />
            <Route path="/biomedical/maintenance-requests" element={<MaintenanceRequests />} />
            <Route path="/biomedical/maintenance-history" element={<MaintenanceHistory />} />
            <Route path="/biomedical/spare-parts" element={<SpareParts />} />
          </Route>

          {/* Lab Technician routes */}
          <Route element={<LabTechRoute />}>
            <Route path="/lab/dashboard" element={<LabTechDashboard />} />
            <Route path="/lab/equipment" element={<LabEquipmentList />} />
            <Route path="/lab/reports" element={<LabReports />} />
            <Route path="/lab/notifications" element={<LabNotifications />} />
          </Route>

          {/* Maintenance Technician routes */}
          <Route element={<MaintenanceTechRoute />}>
            <Route path="/maintenance/dashboard" element={<MaintenanceTechDashboard />} />
            <Route path="/maintenance/report" element={<ReportMaintenance />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/welcome" replace />} />
          <Route path="*" element={<Navigate to="/welcome" replace />} />
        </Routes>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;