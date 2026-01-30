import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AuthState, AppDispatch } from '../../store/store';
import { setUser, logoutUser } from '../../store/slices/authSlice';
import { useGetCurrentUserQuery } from '../../store/api/authApi';
import Layout from './Layout';

const ProtectedRoute: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { token, user } = useSelector((state: RootState) => state.auth) as AuthState;
  
  // Fetch user data if token exists but user data is missing
  const { data: currentUser, isLoading, error } = useGetCurrentUserQuery(undefined, {
    skip: !token || !!user,
  });

  useEffect(() => {
    if (currentUser && !user) {
      dispatch(setUser(currentUser));
      // Also persist to localStorage
      localStorage.setItem('user', JSON.stringify(currentUser));
    }
  }, [currentUser, user, dispatch]);

  // If token is invalid, logout and clear cache
  useEffect(() => {
    if (error && 'status' in error && error.status === 401) {
      dispatch(logoutUser());
    }
  }, [error, dispatch]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Show loading only if we're fetching user data and don't have it
  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="spinner w-8 h-8 border-2"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default ProtectedRoute;