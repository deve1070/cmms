import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { equipmentApi, workOrdersApi, maintenanceApi, sparePartsApi } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  BarChart3,
  Wrench,
  Calendar,
  Package2,
  ClipboardCheck,
  Bell,
  FileText,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import SharedLayout from '../components/SharedLayout';
import type { Equipment } from '../types/equipment';
import type { WorkOrder } from '../types/workOrder';
import type { MaintenanceReport } from '../types/maintenance';
import type { SparePart } from '../types/sparePart';
import { getUserDisplayName } from '../types/auth';

const sidebar = (
  <nav className="flex flex-col space-y-1 p-4">
    {[
      { name: 'Dashboard', icon: BarChart3, path: '/maintenance/dashboard' },
      { name: 'My Work Orders', icon: Wrench, path: '/maintenance/work-orders' },
      { name: 'View Schedule', icon: Calendar, path: '/maintenance/schedule' },
      { name: 'Spare Parts Inventory', icon: Package2, path: '/maintenance/spare-parts' },
      { name: 'My Activity Log', icon: ClipboardCheck, path: '/maintenance/activity-log' },
    ].map((item) => (
      <Link
        key={item.name}
        to={item.path}
        className="flex items-center space-x-2 p-3 rounded-lg text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-colors"
      >
        <item.icon className="h-5 w-5" />
        <span>{item.name}</span>
      </Link>
    ))}
  </nav>
);

const MaintenanceTechDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  // ... other state declarations ...

  return (
    <SharedLayout 
      title="Maintenance Technician Dashboard" 
      sidebar={sidebar}
      userDisplayName={getUserDisplayName(user, 'Maintenance Technician')}
    >
      {/* ... dashboard content ... */}
      <p className="text-sm text-gray-600">
        Welcome, {getUserDisplayName(user, 'Maintenance Technician')}
      </p>
      {/* ... rest of the dashboard ... */}
    </SharedLayout>
  );
};

export default MaintenanceTechDashboard;