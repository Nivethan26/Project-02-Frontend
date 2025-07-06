/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import Sidebar from '@/components/layout/Sidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useEffect, useState } from 'react';
import authService, { User } from '@/services/auth';
import { 
  Mail, 
  Phone, 
  MapPin, 
  User as UserIcon, 
  BadgeCheck, 
  CalendarCheck, 
  ShieldCheck, 
  Edit, 
  KeyRound, 
  Lock,
  Settings,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Stethoscope,
  GraduationCap,
  Clock,
  Star,
  Award,
  Activity
} from 'lucide-react';
import { useRouter } from 'next/navigation';

function getInitials(firstName?: string, lastName?: string) {
  return (firstName?.[0] || '') + (lastName?.[0] || '');
}

export default function DoctorProfilePage() {
  const [user, setUser] = useState<User & { phone?: string; address?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Settings modal state
  const [showSettings, setShowSettings] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Edit profile state
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', address: '', speciality: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Change password state
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [changing, setChanging] = useState(false);
  const [changeError, setChangeError] = useState<string | null>(null);
  const [changeSuccess, setChangeSuccess] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    authService.fetchProfile()
      .then((profile) => {
        setUser(profile);
        setForm({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          email: profile.email || '',
          phone: profile.phone || '',
          address: profile.address || '',
          speciality: profile.speciality || '',
        });
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  // Edit profile handlers
  function handleEditOpen() { setShowEdit(true); setShowSettings(false); }
  function handleEditClose() { setShowEdit(false); }
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) { setForm({ ...form, [e.target.name]: e.target.value }); }
  async function handleSaveProfile() {
    setSaving(true); setSaveError(null);
    try {
      const updated = await authService.updateProfile(form);
      setUser(updated);
      setShowEdit(false);
    } catch {
      setSaveError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  }

  // Change password handlers
  function handleChangePasswordOpen() { setShowChangePassword(true); setShowSettings(false); setPasswordForm({ currentPassword: '', newPassword: '' }); setChangeError(null); setChangeSuccess(null); }
  function handleChangePasswordClose() { setShowChangePassword(false); }
  function handlePasswordInput(e: React.ChangeEvent<HTMLInputElement>) { setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value }); }
  async function handleChangePassword() {
    setChanging(true); setChangeError(null); setChangeSuccess(null);
    try {
      const res = await authService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setChangeSuccess(res.message);
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (err: any) {
      setChangeError(err?.response?.data?.message || 'Failed to change password.');
    } finally {
      setChanging(false);
    }
  }

  if (loading) {
    return (
      <ProtectedRoute role="doctor">
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <Sidebar role="doctor" />
          <main className="flex-1 ml-64 p-8">
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="text-gray-600 font-medium">Loading profile...</span>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute role="doctor">
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Sidebar role="doctor" />
        <main className="flex-1 ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Enhanced Header Section */}
            <div className="mb-10">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                      Professional Profile
                    </h1>
                  </div>
                  <p className="text-gray-600 text-lg font-medium ml-4">
                    Manage your professional information and account settings
                  </p>
                </div>
                <button
                  onClick={() => setShowSettings(true)}
                  className="group relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Settings className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                  Account Settings
                </button>
              </div>
            </div>

            {error ? (
              <div className="bg-red-50 border-l-4 border-red-400 rounded-r-lg p-6 mb-8">
                <div className="flex items-center">
                  <AlertCircle className="w-6 h-6 text-red-400 mr-3" />
                  <div>
                    <h3 className="text-red-800 font-semibold">Error Loading Profile</h3>
                    <p className="text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            ) : user ? (
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* Enhanced Profile Card */}
                <div className="xl:col-span-1">
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Profile Header with Gradient */}
                    <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 text-center relative">
                      <div className="absolute inset-0 bg-black opacity-10"></div>
                      <div className="relative z-10">
                        {/* Enhanced Avatar */}
                        <div className="relative inline-block mb-6">
                          <div className="w-28 h-28 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-white/30 shadow-2xl">
                            {getInitials(user.firstName, user.lastName)}
                          </div>
                          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        
                        {/* Name and Title */}
                        <h2 className="text-2xl font-bold text-white mb-2">
                          {user.firstName} {user.lastName}
                        </h2>
                        <div className="flex items-center justify-center space-x-2 mb-2">
                          <Stethoscope className="w-5 h-5 text-blue-200" />
                          <span className="text-blue-100 font-medium capitalize text-lg">{user.role}</span>
                        </div>
                        {user.speciality && (
                          <div className="flex items-center justify-center space-x-2 mb-4">
                            <GraduationCap className="w-4 h-4 text-blue-200" />
                            <span className="text-blue-100 font-medium text-base">{user.speciality}</span>
                          </div>
                        )}
                        
                        {/* Enhanced Status Badge */}
                        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm ${
                          user.status === 'active' 
                            ? 'bg-green-500/20 text-green-100 border border-green-300/30' 
                            : 'bg-red-500/20 text-red-100 border border-red-300/30'
                        }`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            user.status === 'active' ? 'bg-green-300' : 'bg-red-300'
                          }`}></div>
                          {user.status === 'active' ? 'Active Professional' : 'Inactive'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Details Section */}
                <div className="xl:col-span-3 space-y-8">
                  {/* Personal Information Card */}
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                          <UserIcon className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                      </div>
                    </div>
                    
                    <div className="p-8">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="flex items-start space-x-4 group">
                          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                            <Mail className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Email Address</p>
                            <p className="text-gray-900 font-medium text-lg">{user.email}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-4 group">
                          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                            <Phone className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone Number</p>
                            <p className="text-gray-900 font-medium text-lg">{user.phone || 'Not provided'}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-4 group">
                          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                            <MapPin className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Professional Address</p>
                            <p className="text-gray-900 font-medium text-lg">{user.address || 'Not provided'}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-4 group">
                          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                            <GraduationCap className="w-7 h-7 text-white"/>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Medical Speciality</p>
                            <p className="text-gray-900 font-medium text-lg">{user.speciality || 'Not Set'}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-4 group">
                          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                            <CalendarCheck className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Member Since</p>
                            <p className="text-gray-900 font-medium text-lg">
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              }) : 'Not available'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Enhanced Settings Modal */}
          {showSettings && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all duration-300 scale-100">
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-b border-gray-200 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Account Settings</h2>
                    <button 
                      onClick={() => setShowSettings(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-8 space-y-4">
                  <button
                    onClick={handleEditOpen}
                    className="w-full flex items-center justify-between p-6 rounded-xl border border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <Edit className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900 text-lg">Edit Profile</span>
                        <p className="text-gray-500 text-sm">Update your personal information</p>
                      </div>
                    </div>
                    <span className="text-gray-400 group-hover:text-blue-600 transition-colors">→</span>
                  </button>
                  
                  <button
                    onClick={handleChangePasswordOpen}
                    className="w-full flex items-center justify-between p-6 rounded-xl border border-gray-200 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 transition-all duration-300 group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <Lock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900 text-lg">Change Password</span>
                        <p className="text-gray-500 text-sm">Update your account security</p>
                      </div>
                    </div>
                    <span className="text-gray-400 group-hover:text-yellow-600 transition-colors">→</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Edit Profile Modal */}
          {showEdit && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-b border-gray-200 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
                    <button 
                      onClick={handleEditClose}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <form className="p-8 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">First Name</label>
                    <input 
                      name="firstName" 
                      value={form.firstName} 
                      onChange={handleChange} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 focus:bg-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Last Name</label>
                    <input 
                      name="lastName" 
                      value={form.lastName} 
                      onChange={handleChange} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 focus:bg-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Email Address</label>
                    <input 
                      name="email" 
                      value={form.email} 
                      onChange={handleChange} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 focus:bg-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Phone Number</label>
                    <input 
                      name="phone" 
                      value={form.phone} 
                      onChange={handleChange} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 focus:bg-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Professional Address</label>
                    <input 
                      name="address" 
                      value={form.address} 
                      onChange={handleChange} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 focus:bg-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Medical Speciality</label>
                    <input 
                      name="speciality" 
                      value={form.speciality} 
                      onChange={handleChange} 
                      placeholder="e.g., Cardiology, Neurology, Pediatrics"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 focus:bg-white" 
                    />
                  </div>
                  {saveError && (
                    <div className="bg-red-50 border-l-4 border-red-400 rounded-r-lg p-4">
                      <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
                        <span className="text-red-800 text-sm font-medium">{saveError}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex space-x-4 pt-6">
                    <button
                      type="button"
                      onClick={handleEditClose}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5 mr-3" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Enhanced Change Password Modal */}
          {showChangePassword && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all duration-300 scale-100">
                <div className="bg-gradient-to-r from-gray-50 to-yellow-50 px-8 py-6 border-b border-gray-200 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
                    <button 
                      onClick={handleChangePasswordClose}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <form className="p-8 space-y-6" onSubmit={e => { e.preventDefault(); handleChangePassword(); }}>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Current Password</label>
                    <input 
                      name="currentPassword" 
                      type="password" 
                      value={passwordForm.currentPassword} 
                      onChange={handlePasswordInput} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 focus:bg-white" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">New Password</label>
                    <input 
                      name="newPassword" 
                      type="password" 
                      value={passwordForm.newPassword} 
                      onChange={handlePasswordInput} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 focus:bg-white" 
                      required 
                    />
                  </div>
                  {changeError && (
                    <div className="bg-red-50 border-l-4 border-red-400 rounded-r-lg p-4">
                      <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
                        <span className="text-red-800 text-sm font-medium">{changeError}</span>
                      </div>
                    </div>
                  )}
                  {changeSuccess && (
                    <div className="bg-green-50 border-l-4 border-green-400 rounded-r-lg p-4">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                        <span className="text-green-800 text-sm font-medium">{changeSuccess}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex space-x-4 pt-6">
                    <button
                      type="button"
                      onClick={handleChangePasswordClose}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={changing}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl"
                    >
                      {changing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Changing...
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5 mr-3" />
                          Change Password
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
} 