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

      // Set isLoggedIn to true so CartContext fetches the cart
      setIsLoggedIn(true);

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
      <svg className="absolute bottom-0 right-0 w-[60vw] max-w-[400px] h-auto opacity-20 animate-pulse z-0" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      <div className="flex flex-1 items-center justify-center py-8 px-2 sm:px-6 lg:px-8 z-10 relative">
        <div className="w-full max-w-md space-y-8">
          {/* Brand/Logo */}
          <div className="flex flex-col items-center">
            <h2 className="mt-2 text-center text-3xl sm:text-4xl font-extrabold text-white drop-shadow-lg tracking-tight">Sign in to your account</h2>
            <p className="mt-2 text-center text-base text-blue-100 font-medium">Welcome back! Access your health, orders, and more.</p>
            <p className="mt-1 text-center text-sm text-blue-100">
              Or{' '}
              <Link href="/register" className="font-semibold text-white underline hover:text-blue-200 transition-all duration-200">create a new account</Link>
            </p>
          </div>

          <div className="mt-8 bg-white/70 backdrop-blur-2xl py-8 px-4 sm:px-8 shadow-2xl rounded-3xl border border-blue-100 transition-all duration-300 hover:shadow-blue-200/60">
            <form className="space-y-6" onSubmit={handleSubmit}>
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

              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-blue-300 rounded transition-all duration-200"
                    checked={rememberMe}
                    onChange={handleRememberMeChange}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-blue-700 font-medium">
                    Remember me
                  </label>
                </div>
                <div className="text-sm mt-2 sm:mt-0">
                  <button type="button" onClick={() => setShowForgotModal(true)} className="font-semibold text-blue-600 hover:text-blue-800 transition-all duration-200">Forgot your password?</button>
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  disabled={loading}
                  size="lg"
                  className="w-full font-bold shadow-xl animate-glow"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer/>

      {/* Forgot Password Modal */}
      <Dialog open={showForgotModal} onClose={() => setShowForgotModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-2 sm:px-4">
          <div className="fixed inset-0 bg-black opacity-30" />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto p-6 sm:p-8 z-50 border border-blue-100">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-blue-700 text-2xl transition-colors"
              onClick={() => setShowForgotModal(false)}
              aria-label="Close"
              type="button"
            >
              ×
            </button>
            <div className="flex flex-col items-center mb-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-50 mb-2 shadow">
                <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a3 3 0 003.22 0L22 8m-19 8V8a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
              </div>
              <Dialog.Title className="text-xl font-bold text-blue-700 text-center">Forgot Password</Dialog.Title>
              <p className="text-sm text-blue-500 text-center mt-1">Enter your email to receive an OTP and reset your password.</p>
            </div>
            {forgotStep === 1 && (
              <div className="space-y-4">
                <input
                  type="email"
                  className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 bg-blue-50 text-blue-900 placeholder-blue-300 transition-all duration-200"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  disabled={forgotLoading}
                />
                <button
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg py-2 font-semibold hover:from-blue-700 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
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
                <input
                  type="text"
                  className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 bg-blue-50 text-blue-900 placeholder-blue-300 transition-all duration-200"
                  placeholder="Enter OTP"
                  value={forgotOTP}
                  onChange={e => setForgotOTP(e.target.value)}
                  disabled={forgotLoading}
                />
                <button
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg py-2 font-semibold hover:from-blue-700 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
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
                <input
                  type="password"
                  className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 bg-blue-50 text-blue-900 placeholder-blue-300 transition-all duration-200"
                  placeholder="Enter new password"
                  value={forgotNewPassword}
                  onChange={e => setForgotNewPassword(e.target.value)}
                  disabled={forgotLoading}
                />
                <button
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg py-2 font-semibold hover:from-blue-700 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={handleResetPassword}
                  disabled={forgotLoading || !forgotNewPassword}
                  type="button"
                >
                  {forgotLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            )}
            {(forgotError || forgotSuccess) && (
              <div className={`mt-4 text-sm text-center ${forgotError ? 'text-red-600' : 'text-green-600'}`}>{forgotError || forgotSuccess}</div>
            )}
          </div>
        </div>
      </Dialog>
    </div>
  );
} 