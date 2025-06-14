import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Stethoscope, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

interface SharedLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  title?: string;
  headerContent?: React.ReactNode;
  footerContent?: React.ReactNode;
  userDisplayName?: string;
}

const defaultHeader = (user: { username?: string; role?: string } | null, userDisplayName?: string) => (
  <div className="flex items-center justify-between w-full px-4">
    <div className="flex items-center space-x-3">
      <img
        src="/logo192.png"
        alt="CMMS Logo"
        className="h-8 w-8 rounded-full border border-blue-200"
        onError={(e) => {
          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDA3MGZmIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTIwIDIxdi0yYTQgNCAwIDAgMC00LTRINGE0IDQgMCAwIDAtNCA0djIiPjwvcGF0aD48Y2lyY2xlIGN4PSIxMiIgY3k9IjciIHI9IjQiPjwvY2lyY2xlPjwvc3ZnPg==';
        }}
      />
      <span className="text-xl font-semibold text-white tracking-tight">CMMS</span>
    </div>
    <div className="flex items-center space-x-4">
      <span className="text-blue-100 font-medium hidden sm:block">
        Welcome, {userDisplayName || user?.username || 'User'} ({user?.role || 'Guest'})
      </span>
    </div>
  </div>
);

const defaultFooter = (
  <footer className="w-full py-6 px-6 bg-gradient-to-r from-blue-800 to-indigo-900 text-center text-sm text-blue-100 mt-8">
    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between">
      <div className="flex items-center space-x-2 justify-center sm:justify-start mb-4 sm:mb-0">
        <Stethoscope className="h-5 w-5 text-blue-300" />
        <span>© {new Date().getFullYear()} CMMS - Healthcare Maintenance</span>
      </div>
      <div className="flex space-x-4 justify-center sm:justify-end">
        <Link to="/about" className="text-blue-200 hover:text-white hover:underline">
          About
        </Link>
        <Link to="/contact" className="text-blue-200 hover:text-white hover:underline">
          Contact
        </Link>
        <Link to="/privacy" className="text-blue-200 hover:text-white hover:underline">
          Privacy Policy
        </Link>
      </div>
    </div>
  </footer>
);

const SharedLayout: React.FC<SharedLayoutProps> = ({
  children,
  sidebar,
  title = 'Dashboard',
  headerContent,
  footerContent,
  userDisplayName,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -288 }}
        animate={{ x: isSidebarOpen ? 0 : -288 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed top-0 left-0 h-screen w-72 bg-white shadow-2xl z-40 border-r border-blue-100 lg:relative lg:translate-x-0"
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-blue-100">
            <div className="flex items-center space-x-2">
              <Stethoscope className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold text-gray-800">CMMS</span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-blue-50 lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto">
            {sidebar}
          </div>

          {/* Sidebar Footer with Logout */}
          <div className="p-4 border-t border-blue-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 p-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              aria-label="Log out"
            >
              <LogOut className="h-5 w-5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.div
        animate={{
          marginLeft: isSidebarOpen ? '18rem' : '0',
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex-1 flex flex-col min-h-screen"
      >
        <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-700 to-indigo-700 shadow-md px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-blue-600 text-white transition-colors flex items-center justify-center"
                aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                aria-expanded={isSidebarOpen}
              >
                {isSidebarOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
              <h1 className="text-lg sm:text-xl font-bold text-white truncate">{title}</h1>
            </div>
            {headerContent || defaultHeader(user, userDisplayName)}
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 bg-white/90 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
        {footerContent || defaultFooter}
      </motion.div>
    </div>
  );
};

export default SharedLayout;