/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import authService from '@/services/auth';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Dialog } from '@headlessui/react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOTP, setForgotOTP] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const { setIsLoggedIn } = useCart();
  const [rememberMe, setRememberMe] = useState(false);

  // Prefill email if remembered
  useEffect(() => {
    const remembered = localStorage.getItem('rememberMe') === 'true';
    const rememberedEmail = localStorage.getItem('rememberedEmail') || '';
    if (remembered && rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRememberMe(e.target.checked);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Clear any existing auth data before login
      authService.logout();
      
      // Remember email if checked
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('rememberedEmail');
      }
      
      const response = await authService.login(formData.email, formData.password);
      
      // Check if user is active
      if (response.user.status === 'inactive') {
        throw new Error('Your account is inactive. Please contact support.');
      }

      // Save user to localStorage for session persistence
      localStorage.setItem('user', JSON.stringify(response.user));
      // Also store userId in sessionStorage for booking/payment
      sessionStorage.setItem('userId', response.user._id);

      // Set isLoggedIn to true so CartContext fetches the cart
      setIsLoggedIn(true);

      // Show welcome toast notification
      toast.success(`Welcome back ${response.user.firstName}! You are successfully logged in to the system!`, {
        duration: 5000, // 5 seconds
        position: 'top-right',
        style: {
          fontSize: '16px',
          padding: '16px',
        },
      });

      // Redirect based on user role
      switch (response.user.role) {
        case 'admin':
          router.push('/dashboard/admin');
          break;
        case 'customer': {
          const redirect = searchParams.get('redirect');
          if (redirect) {
            router.push(redirect);
          } else {
            router.push('/dashboard/customer');
          }
          break;
        }
        case 'doctor':
          router.push('/dashboard/doctor');
          break;
        case 'pharmacist':
          router.push('/dashboard/pharmacist');
          break;
        case 'delivery':
          router.push('/dashboard/delivery');
          break;
        default:
          throw new Error('Invalid user role');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred during login. Please try again.');
      }
      // Clear any partial auth data
      authService.logout();
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);
    try {
      await authService.forgotPassword(forgotEmail);
      setForgotSuccess('OTP sent to your email.');
      setForgotStep(2);
    } catch (err: any) {
      setForgotError(err?.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);
    try {
      await authService.verifyOTP(forgotEmail, forgotOTP);
      setForgotSuccess('OTP verified. Please enter your new password.');
      setForgotStep(3);
    } catch (err: any) {
      setForgotError(err?.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);
    try {
      await authService.resetPassword(forgotEmail, forgotOTP, forgotNewPassword);
      setForgotSuccess('Password reset successful! You can now log in.');
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotStep(1);
        setForgotEmail('');
        setForgotOTP('');
        setForgotNewPassword('');
        setForgotError('');
        setForgotSuccess('');
      }, 2000);
    } catch (err: any) {
      setForgotError(err?.response?.data?.message || 'Failed to reset password.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="md:flex">
              {/* Left Side - Login Form */}
              <div className="md:w-1/2 p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-800">Sign in to your account</h3>
                  <p className="text-gray-600 mt-2">Welcome back! Access your health, orders, and more.</p>
          </div>

                {/* Error Message */}
              {error && (
                  <div className="mb-6">
                    <div className="bg-red-50 border-l-4 border-red-500 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                  </div>
                </div>
              )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                        disabled={loading}
                        className={`block w-full pl-10 pr-3 py-2 rounded-lg border ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          loading ? 'opacity-50 cursor-not-allowed' : ''
                        } text-black`}
                        placeholder="john.doe@example.com"
                      />
                    </div>
                  {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
              </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                        disabled={loading}
                        className={`block w-full pl-10 pr-3 py-2 rounded-lg border ${
                          errors.password ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          loading ? 'opacity-50 cursor-not-allowed' : ''
                        } text-black`}
                        placeholder="••••••••"
                      />
                    </div>
                  {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
              </div>

                  {/* Remember Me and Forgot Password */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={rememberMe}
                    onChange={handleRememberMeChange}
                        disabled={loading}
                  />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                    <div className="text-sm">
                      <button 
                        type="button" 
                        onClick={() => setShowForgotModal(true)} 
                        className="font-medium text-blue-600 hover:text-blue-700"
                      >
                        Forgot password?
                      </button>
                </div>
              </div>

                  {/* Submit Button */}
                  <button
                  type="submit"
                  disabled={loading}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      loading ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Signing in...
                      </div>
                    ) : (
                      'Sign in'
                    )}
                  </button>

                  {/* Register Link */}
                  <p className="text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link href="/register" className="font-medium text-blue-600 hover:text-blue-700">
                      Sign up
                    </Link>
                  </p>
                </form>
              </div>

              {/* Right Side - Professional Info Panel */}
              <div className="md:w-1/2 bg-gradient-to-b from-blue-600 to-blue-800 p-12 text-white hidden md:block relative overflow-hidden">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 animate-pulse"></div>
                  <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <pattern id="grid-pattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#grid-pattern)"/>
                  </svg>
                </div>

                {/* Floating Elements */}
                <div className="absolute top-10 right-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-bounce"></div>
                <div className="absolute bottom-20 left-10 w-16 h-16 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>

                <div className="relative z-10">
                  {/* Header Section */}
                  <div className="text-center mb-12">
                  {/* Medical Hero Icon */}
                  <div className="inline-flex items-center justify-center w-16 h-16">
                    <svg className="w-24 h-24 mb-6" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M32 4C16.536 4 4 16.536 4 32s12.536 28 28 28 28-12.536 28-28S47.464 4 32 4z" fill="#ffffff" fillOpacity="0.1" stroke="#ffffff" strokeWidth="2"/>
                      <path d="M32 20v24M20 32h24" stroke="#ffffff" strokeWidth="4" strokeLinecap="round"/>
                    </svg>
                  </div>
                    <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                      SK Medicals
                    </h2>
                    <p className="text-blue-200 text-lg font-medium">Your Health, Our Priority</p>
                  </div>

                  {/* Features Grid */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-blue-100 text-sm font-medium">Secure & Confidential</span>
                    </div>
                    <div className="flex items-center p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <span className="text-blue-100 text-sm font-medium">Fast Delivery</span>
                    </div>
                    <div className="flex items-center p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span className="text-blue-100 text-sm font-medium">Expert Consultation</span>
                    </div>
                  </div>



                  {/* Bottom Decorative */}
                  <div className="absolute bottom-4 right-4 opacity-20">
                    <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" strokeDasharray="10 5"/>
                      <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="1" strokeDasharray="5 5"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Forgot Password Modal */}
      <Dialog open={showForgotModal} onClose={() => setShowForgotModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-2 sm:px-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto p-6 sm:p-8 z-50 border border-gray-100">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
              onClick={() => setShowForgotModal(false)}
              aria-label="Close"
              type="button"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex flex-col items-center mb-6">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-50 mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a3 3 0 003.22 0L22 8m-19 8V8a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
              </div>
              <Dialog.Title className="text-xl font-bold text-gray-900 text-center">Forgot Password</Dialog.Title>
              <p className="text-sm text-gray-600 text-center mt-2">Enter your email to receive an OTP and reset your password.</p>
            </div>
            {forgotStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
                <input
                  type="email"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-400 transition-all duration-200"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  disabled={forgotLoading}
                />
                </div>
                <button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={handleForgotPassword}
                  disabled={forgotLoading || !forgotEmail}
                  type="button"
                >
                  {forgotLoading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </div>
            )}
            {forgotStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">OTP Code</label>
                <input
                  type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-400 transition-all duration-200"
                  placeholder="Enter OTP"
                  value={forgotOTP}
                  onChange={e => setForgotOTP(e.target.value)}
                  disabled={forgotLoading}
                />
                </div>
                <button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={handleVerifyOTP}
                  disabled={forgotLoading || !forgotOTP}
                  type="button"
                >
                  {forgotLoading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            )}
            {forgotStep === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-400 transition-all duration-200"
                  placeholder="Enter new password"
                  value={forgotNewPassword}
                  onChange={e => setForgotNewPassword(e.target.value)}
                  disabled={forgotLoading}
                />
                </div>
                <button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={handleResetPassword}
                  disabled={forgotLoading || !forgotNewPassword}
                  type="button"
                >
                  {forgotLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            )}
            {(forgotError || forgotSuccess) && (
              <div className={`mt-4 p-3 rounded-lg text-sm text-center ${forgotError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                {forgotError || forgotSuccess}
              </div>
            )}
          </div>
        </div>
      </Dialog>
    </div>
  );
} 