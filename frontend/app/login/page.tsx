/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import authService from '@/services/auth';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Dialog } from '@headlessui/react';

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
      
      const response = await authService.login(formData.email, formData.password);
      
      // Check if user is active
      if (response.user.status === 'inactive') {
        throw new Error('Your account is inactive. Please contact support.');
      }

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
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-400 to-blue-300">
      {/* Animated SVG Background Shapes */}
      <svg className="absolute -top-32 -left-32 w-[500px] h-[500px] opacity-30 animate-pulse z-0" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="250" cy="250" r="250" fill="url(#paint0_radial)" />
        <defs>
          <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientTransform="translate(250 250) scale(250)" gradientUnits="userSpaceOnUse">
            <stop stopColor="#60A5FA" />
            <stop offset="1" stopColor="#2563EB" />
          </radialGradient>
        </defs>
      </svg>
      <svg className="absolute bottom-0 right-0 w-[400px] h-[400px] opacity-20 animate-pulse z-0" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="200" cy="200" r="200" fill="url(#paint1_radial)" />
        <defs>
          <radialGradient id="paint1_radial" cx="0" cy="0" r="1" gradientTransform="translate(200 200) scale(200)" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3B82F6" />
            <stop offset="1" stopColor="#1E40AF" />
          </radialGradient>
        </defs>
      </svg>
      {/* Navigation Bar */}
      <Navbar/>

      {/* Login Form */}
      <div className="flex flex-1 items-center justify-center py-12 px-4 sm:px-6 lg:px-8 z-10 relative">
        <div className="w-full max-w-md space-y-8">
          {/* Brand/Logo */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl mb-2 border-4 border-blue-200">
              <span className="text-blue-700 font-extrabold text-3xl tracking-wider drop-shadow">SK</span>
            </div>
            <h2 className="mt-2 text-center text-4xl font-extrabold text-white drop-shadow-lg tracking-tight">Sign in to your account</h2>
            <p className="mt-2 text-center text-base text-blue-100 font-medium">Welcome back! Access your health, orders, and more.</p>
            <p className="mt-1 text-center text-sm text-blue-100">
              Or{' '}
              <Link href="/register" className="font-semibold text-white underline hover:text-blue-200 transition-all duration-200">create a new account</Link>
            </p>
          </div>

          <div className="mt-8 bg-white/60 backdrop-blur-xl py-10 px-8 shadow-2xl rounded-3xl border border-blue-100">
            <form className="space-y-7" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-md bg-red-50 p-4 mb-2">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="relative">
                <label htmlFor="email" className="block text-sm font-semibold text-blue-700 mb-1">Email address</label>
                <div className="mt-1 relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-blue-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 12H8m8 0a4 4 0 11-8 0 4 4 0 018 0zm0 0v1a4 4 0 01-8 0v-1" /></svg>
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`appearance-none block w-full pl-10 pr-4 py-3 border ${errors.email ? 'border-red-300' : 'border-blue-200'} rounded-xl shadow-sm placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 bg-blue-50 text-blue-900 sm:text-sm transition-all duration-200`}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="relative">
                <label htmlFor="password" className="block text-sm font-semibold text-blue-700 mb-1">Password</label>
                <div className="mt-1 relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-blue-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0-1.104.896-2 2-2s2 .896 2 2-.896 2-2 2-2-.896-2-2zm0 0V9m0 2v2" /></svg>
                  </span>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`appearance-none block w-full pl-10 pr-4 py-3 border ${errors.password ? 'border-red-300' : 'border-blue-200'} rounded-xl shadow-sm placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 bg-blue-50 text-blue-900 sm:text-sm transition-all duration-200`}
                    placeholder="Enter your password"
                  />
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-blue-300 rounded transition-all duration-200"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-blue-700 font-medium">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <button type="button" onClick={() => setShowForgotModal(true)} className="font-semibold text-blue-600 hover:text-blue-800 transition-all duration-200">Forgot your password?</button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-xl transition-all duration-200 hover:shadow-blue-400/50 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed animate-glow"
                  style={{ boxShadow: '0 0 16px 2px #60A5FA, 0 2px 8px 0 #2563EB33' }}
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer/>

      {/* Forgot Password Modal */}
      <Dialog open={showForgotModal} onClose={() => setShowForgotModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black opacity-30" />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-auto p-8 z-50">
            <Dialog.Title className="text-lg font-bold mb-4 text-blue-700">Forgot Password</Dialog.Title>
            {forgotStep === 1 && (
              <div className="space-y-4">
                <input
                  type="email"
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  disabled={forgotLoading}
                />
                <button
                  className="w-full bg-blue-600 text-white rounded-lg py-2 font-semibold hover:bg-blue-700"
                  onClick={handleForgotPassword}
                  disabled={forgotLoading || !forgotEmail}
                >
                  {forgotLoading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </div>
            )}
            {forgotStep === 2 && (
              <div className="space-y-4">
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Enter OTP"
                  value={forgotOTP}
                  onChange={e => setForgotOTP(e.target.value)}
                  disabled={forgotLoading}
                />
                <button
                  className="w-full bg-blue-600 text-white rounded-lg py-2 font-semibold hover:bg-blue-700"
                  onClick={handleVerifyOTP}
                  disabled={forgotLoading || !forgotOTP}
                >
                  {forgotLoading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            )}
            {forgotStep === 3 && (
              <div className="space-y-4">
                <input
                  type="password"
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Enter new password"
                  value={forgotNewPassword}
                  onChange={e => setForgotNewPassword(e.target.value)}
                  disabled={forgotLoading}
                />
                <button
                  className="w-full bg-blue-600 text-white rounded-lg py-2 font-semibold hover:bg-blue-700"
                  onClick={handleResetPassword}
                  disabled={forgotLoading || !forgotNewPassword}
                >
                  {forgotLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            )}
            {(forgotError || forgotSuccess) && (
              <div className={`mt-4 text-sm ${forgotError ? 'text-red-600' : 'text-green-600'}`}>{forgotError || forgotSuccess}</div>
            )}
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={() => setShowForgotModal(false)}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
} 