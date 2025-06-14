import React from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <button
          onClick={() => navigate('/welcome')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default Unauthorized; 