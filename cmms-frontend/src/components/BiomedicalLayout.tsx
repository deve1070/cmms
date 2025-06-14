import React from 'react';
import BiomedicalSidebar from './BiomedicalSidebar';
import SharedLayout from './SharedLayout';

interface BiomedicalLayoutProps {
  children: React.ReactNode;
}

const BiomedicalLayout: React.FC<BiomedicalLayoutProps> = ({ children }) => {
  return (
    <SharedLayout
      sidebar={<BiomedicalSidebar />}
      title="Biomedical Dashboard"
    >
      {children}
    </SharedLayout>
  );
};

export default BiomedicalLayout; 