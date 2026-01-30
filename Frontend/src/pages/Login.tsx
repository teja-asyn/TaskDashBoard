import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { login, clearError } from '../store/slices/authSlice';
import { apiSlice } from '../store/api/apiSlice';
import type { RootState, AuthState, AppDispatch } from '../store/store';
import { Toaster, toast } from 'react-hot-toast';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading, error, token } = useSelector((state: RootState) => state.auth) as AuthState;

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    // Clear any stale cache before logging in to prevent data leakage
    dispatch(apiSlice.util.resetApiState());
    
    const result = await dispatch(login({ email, password }));
    
    if (login.fulfilled.match(result)) {
      toast.success('Login successful!');
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <Toaster position="top-right" />
      
      {/* Left Side - Branding/Illustration */}
      <div className="hidden xl:flex xl:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 p-8 xl:p-12 flex-col justify-between text-white">
        <div>
          <div className="flex items-center space-x-3 mb-6 xl:mb-8">
            <div className="w-10 h-10 xl:w-12 xl:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <span className="text-xl xl:text-2xl font-bold">T</span>
            </div>
            <span className="text-xl xl:text-2xl font-bold">TaskFlow</span>
          </div>
          <h2 className="text-3xl xl:text-4xl font-bold mb-3 xl:mb-4">Welcome Back!</h2>
          <p className="text-primary-100 text-base xl:text-lg">
            Manage your projects and tasks efficiently with our powerful task management platform.
          </p>
        </div>
        <div className="space-y-3 xl:space-y-4">
          <div className="flex items-center space-x-3 text-primary-100 text-sm xl:text-base">
            <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
            <span>Organize tasks across multiple projects</span>
          </div>
          <div className="flex items-center space-x-3 text-primary-100 text-sm xl:text-base">
            <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
            <span>Track progress with Kanban boards</span>
          </div>
          <div className="flex items-center space-x-3 text-primary-100 text-sm xl:text-base">
            <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
            <span>Collaborate with your team seamlessly</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8 xl:p-12 py-6 sm:py-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="xl:hidden text-center mb-4 sm:mb-6">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-primary-600 rounded-xl mb-2 sm:mb-3">
              <span className="text-lg sm:text-xl font-bold text-white">T</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">TaskFlow</h1>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Welcome Back</h1>
              <p className="text-sm sm:text-base text-gray-600">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 text-sm sm:text-base"
                    placeholder="you@example.com"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base"
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
                  >
                    {showPassword ? <FiEyeOff className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" /> : <FiEye className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between pt-0.5 sm:pt-1">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                    disabled={isLoading}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-xs sm:text-sm text-gray-600 cursor-pointer">
                    Remember me
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-xs sm:text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4 sm:mt-6 text-sm sm:text-base"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span className="ml-2">Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

         

            {/* Sign Up Link */}
            <p className="text-center text-xs sm:text-sm text-gray-600 mt-2">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;