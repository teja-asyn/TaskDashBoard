import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiBell, FiSearch, FiUser, FiLogOut } from 'react-icons/fi';
import { logoutUser } from '../../store/slices/authSlice';
import type { RootState, AppDispatch } from '../../store/store';
import type { AuthState } from '../../types';
import Tooltip from '../common/Tooltip';

const Navbar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth) as AuthState;

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
      <div className="px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <span className="text-xl font-bold text-gray-900">TaskFlow</span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <label htmlFor="global-search" className="sr-only">
              Search tasks, projects, or team members
            </label>
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              id="global-search"
              type="search"
              placeholder="Search tasks, projects, or team members..."
              aria-label="Search tasks, projects, or team members"
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Tooltip content="Notifications">
            <button 
              aria-label="View notifications"
              aria-describedby="notification-badge"
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <FiBell className="w-5 h-5" aria-hidden="true" />
              <span 
                id="notification-badge"
                className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full"
                aria-label="You have new notifications"
              ></span>
            </button>
          </Tooltip>

          {/* User Menu */}
          <div className="relative group">
            <Tooltip content={`${user?.name || 'User'} menu`}>
              <button 
                aria-label="User menu"
                aria-expanded="false"
                aria-haspopup="true"
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center" aria-hidden="true">
                <FiUser className="w-4 h-4 text-primary-600" />
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </button>
            </Tooltip>

            {/* Dropdown Menu */}
            <div 
              role="menu"
              aria-label="User menu"
              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-modal border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
            >
              <div className="p-3 border-b border-gray-200" aria-label="Current user">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <div className="p-1">
                <Link
                  to="/profile"
                  role="menuitem"
                  className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
                >
                  Profile Settings
                </Link>
                <button
                  onClick={handleLogout}
                  role="menuitem"
                  aria-label="Log out"
                  className="flex items-center w-full px-3 py-2 text-sm text-danger-600 hover:bg-danger-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-danger-500 focus:ring-inset"
                >
                  <FiLogOut className="mr-2" aria-hidden="true" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;