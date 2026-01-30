import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHome, FiArrowLeft, FiAlertCircle } from 'react-icons/fi';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Icon/Illustration */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-primary-100 rounded-full flex items-center justify-center">
              <FiAlertCircle className="w-16 h-16 sm:w-20 sm:h-20 text-primary-600" />
            </div>
            <div className="absolute -top-2 -right-2 w-12 h-12 sm:w-16 sm:h-16 bg-danger-100 rounded-full flex items-center justify-center">
              <span className="text-2xl sm:text-3xl font-bold text-danger-600">4</span>
            </div>
            <div className="absolute -bottom-2 -left-2 w-12 h-12 sm:w-16 sm:h-16 bg-danger-100 rounded-full flex items-center justify-center">
              <span className="text-2xl sm:text-3xl font-bold text-danger-600">4</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold text-gray-900 mb-4">
          404
        </h1>

        {/* Subtitle */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800 mb-4">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <FiArrowLeft className="w-5 h-5" />
            Go Back
          </button>
          
          <Link
            to="/dashboard"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <FiHome className="w-5 h-5" />
            Go to Dashboard
          </Link>
        </div>

        {/* Additional Help */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Need help? <Link to="/dashboard" className="text-primary-600 hover:text-primary-700 font-medium">Return to dashboard</Link> or contact support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

