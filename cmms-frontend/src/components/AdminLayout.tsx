import React from 'react';
import SharedLayout from './SharedLayout';
import AdminSidebar from './AdminSidebar';
import { getUserDisplayName } from '../types/auth';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout: React.FC<{ children: React.ReactNode; title?: string }> = ({ children, title }) => {
  const { user } = useAuth();
  return (
    <SharedLayout sidebar={<AdminSidebar />} title={title} userDisplayName={getUserDisplayName(user, 'Administrator')}>
      {children}
    </SharedLayout>
  );
};

export default AdminLayout;