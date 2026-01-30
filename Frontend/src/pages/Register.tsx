import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiCheck, FiX } from 'react-icons/fi';
import { register, clearError } from '../store/slices/authSlice';
import { apiSlice } from '../store/api/apiSlice';
import type { RootState, AuthState, AppDispatch } from '../store/store';
import { Toaster, toast } from 'react-hot-toast';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  // Password requirements validation
  const passwordRequirements = useMemo(() => {
    const password = formData.password;
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*]/.test(password),
    };
  }, [formData.password]);

  const isPasswordValid = useMemo(() => {
    return Object.values(passwordRequirements).every(req => req === true);
  }, [passwordRequirements]);

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!isPasswordValid) {
      newErrors.password = 'Password does not meet all requirements';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error for this field when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      });
    }
    // Show password requirements when user starts typing password
    if (e.target.name === 'password' && e.target.value.length > 0) {
      setShowPasswordRequirements(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Clear any stale cache before registering to prevent data leakage
    dispatch(apiSlice.util.resetApiState());

    const result = await dispatch(register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    }));
    
    if (register.fulfilled.match(result)) {
      toast.success('Registration successful!');
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
          <h2 className="text-3xl xl:text-4xl font-bold mb-3 xl:mb-4">Get Started Today</h2>
          <p className="text-primary-100 text-base xl:text-lg">
            Join thousands of teams already using TaskFlow to manage their projects and boost productivity.
          </p>
        </div>
        <div className="space-y-3 xl:space-y-4">
          <div className="flex items-center space-x-3 text-primary-100 text-sm xl:text-base">
            <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
            <span>Free forever for individuals</span>
          </div>
          <div className="flex items-center space-x-3 text-primary-100 text-sm xl:text-base">
            <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
            <span>Unlimited projects and tasks</span>
          </div>
          <div className="flex items-center space-x-3 text-primary-100 text-sm xl:text-base">
            <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
            <span>Real-time collaboration</span>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8 xl:p-12 py-6 sm:py-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="xl:hidden text-center mb-4 sm:mb-6">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-primary-600 rounded-xl mb-2 sm:mb-3">
              <span className="text-lg sm:text-xl font-bold text-white">T</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">TaskFlow</h1>
          </div>

          {/* Registration Form */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Create Account</h1>
              <p className="text-sm sm:text-base text-gray-600">Start managing your tasks efficiently</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className={`input-field pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 text-sm sm:text-base ${errors.name ? 'input-error' : ''}`}
                    placeholder="John Doe"
                    disabled={isLoading}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1.5 text-xs sm:text-sm text-danger-600 flex items-center">
                    <span className="mr-1">•</span>
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`input-field pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 text-sm sm:text-base ${errors.email ? 'input-error' : ''}`}
                    placeholder="you@example.com"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs sm:text-sm text-danger-600 flex items-center">
                    <span className="mr-1">•</span>
                    {errors.email}
                  </p>
                )}
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
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setShowPasswordRequirements(true)}
                    className={`input-field pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base ${
                      errors.password ? 'input-error' : isPasswordValid && formData.password ? 'border-success-500' : ''
                    }`}
                    placeholder="Create a password"
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
                
                {/* Password Requirements */}
                {showPasswordRequirements && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Password must contain:</p>
                    <div className="space-y-1.5">
                      <div className={`flex items-center text-xs ${passwordRequirements.minLength ? 'text-success-600' : 'text-gray-500'}`}>
                        {passwordRequirements.minLength ? (
                          <FiCheck className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
                        ) : (
                          <FiX className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
                        )}
                        <span>At least 8 characters</span>
                      </div>
                      <div className={`flex items-center text-xs ${passwordRequirements.hasUppercase ? 'text-success-600' : 'text-gray-500'}`}>
                        {passwordRequirements.hasUppercase ? (
                          <FiCheck className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
                        ) : (
                          <FiX className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
                        )}
                        <span>One uppercase letter (A-Z)</span>
                      </div>
                      <div className={`flex items-center text-xs ${passwordRequirements.hasLowercase ? 'text-success-600' : 'text-gray-500'}`}>
                        {passwordRequirements.hasLowercase ? (
                          <FiCheck className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
                        ) : (
                          <FiX className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
                        )}
                        <span>One lowercase letter (a-z)</span>
                      </div>
                      <div className={`flex items-center text-xs ${passwordRequirements.hasNumber ? 'text-success-600' : 'text-gray-500'}`}>
                        {passwordRequirements.hasNumber ? (
                          <FiCheck className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
                        ) : (
                          <FiX className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
                        )}
                        <span>One number (0-9)</span>
                      </div>
                      <div className={`flex items-center text-xs ${passwordRequirements.hasSpecialChar ? 'text-success-600' : 'text-gray-500'}`}>
                        {passwordRequirements.hasSpecialChar ? (
                          <FiCheck className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
                        ) : (
                          <FiX className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
                        )}
                        <span>One special character (!@#$%^&*)</span>
                      </div>
                    </div>
                  </div>
                )}

                {errors.password && (
                  <p className="mt-1.5 text-xs sm:text-sm text-danger-600 flex items-center">
                    <span className="mr-1">•</span>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`input-field pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base ${
                      errors.confirmPassword 
                        ? 'input-error' 
                        : formData.confirmPassword && formData.password === formData.confirmPassword 
                        ? 'border-success-500' 
                        : ''
                    }`}
                    placeholder="Confirm your password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    aria-pressed={showConfirmPassword}
                    className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
                  >
                    {showConfirmPassword ? <FiEyeOff className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" /> : <FiEye className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password === formData.confirmPassword && !errors.confirmPassword && (
                  <p className="mt-1.5 text-xs sm:text-sm text-success-600 flex items-center">
                    <FiCheck className="w-3.5 h-3.5 mr-1" />
                    Passwords match
                  </p>
                )}
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-xs sm:text-sm text-danger-600 flex items-center">
                    <span className="mr-1">•</span>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Terms */}
              <div className="flex items-start pt-0.5 sm:pt-1">
                <input
                  id="terms"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-0.5 cursor-pointer flex-shrink-0"
                  required
                  disabled={isLoading}
                />
                <label htmlFor="terms" className="ml-2 block text-xs sm:text-sm text-gray-600 cursor-pointer">
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary-600 hover:text-primary-700 font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
                    Privacy Policy
                  </Link>
                </label>
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
                    <span className="ml-2">Creating account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Sign In Link */}
            <p className="text-center text-xs sm:text-sm text-gray-600 mt-2">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;