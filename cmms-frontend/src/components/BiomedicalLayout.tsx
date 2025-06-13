import React, { useState } from 'react';
import BiomedicalSidebar from './BiomedicalSidebar';
import { Bars3Icon } from '@heroicons/react/24/outline';

interface BiomedicalLayoutProps {
  children: React.ReactNode;
}

const BiomedicalLayout: React.FC<BiomedicalLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <BiomedicalSidebar />
      
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-72' : 'ml-0'}`}>
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                aria-label="Toggle sidebar"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </header>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default BiomedicalLayout; 