/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import Sidebar from '@/components/layout/Sidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useEffect, useState } from 'react';
import authService, { User } from '@/services/auth';
import { Card, CardContent } from '@/components/ui/card';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaShieldAlt, FaEdit, FaKey, FaCheckCircle, FaExclamationTriangle, FaUserCircle, FaCog, FaHistory, FaTruck } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

function getInitials(firstName?: string, lastName?: string) {
  return (firstName?.[0] || '') + (lastName?.[0] || '');
}

export default function DeliveryProfilePage() {
  const [user, setUser] = useState<User & { phone?: string; address?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit profile state
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Change password state
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [changing, setChanging] = useState(false);
  const [changeError, setChangeError] = useState<string | null>(null);
  const [changeSuccess, setChangeSuccess] = useState<string | null>(null);

  // Modal state
  const [showEdit, setShowEdit] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

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
        });
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  // Edit profile handlers
  function handleEditOpen() { setShowEdit(true); }
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
  function handleChangePasswordOpen() { setShowChangePassword(true); setPasswordForm({ currentPassword: '', newPassword: '' }); setChangeError(null); setChangeSuccess(null); }
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
      <ProtectedRoute role="delivery">
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
          <Sidebar role="delivery" />
          <main className="flex-1 ml-64 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute role="delivery">
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 relative overflow-hidden">
        {/* Professional Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-white/30 to-gray-50/50"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-slate-200/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gray-200/20 rounded-full filter blur-3xl"></div>
        
        <Sidebar role="delivery" />
        
        <main className="flex-1 ml-64 p-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Professional Header Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                    <FaUser className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-1">Profile</h1>
                    <p className="text-slate-600 flex items-center space-x-2">
                      <span>Manage your account settings</span>
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    </p>
                  </div>
                </div>
                </div>
            </div>

            {/* Profile Information */}
            {error ? (
              <Card className="border-0 shadow-xl bg-white">
                <CardContent className="p-8">
                  <div className="text-center">
                    <FaExclamationTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Error Loading Profile</h3>
                    <p className="text-slate-600">{error}</p>
          </div>
                </CardContent>
              </Card>
              ) : user ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                  <Card className="border-0 shadow-xl bg-white">
                    <CardContent className="p-6">
                      <div className="text-center mb-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                          <span className="text-3xl font-bold text-white">
                            {getInitials(user.firstName, user.lastName)}
                          </span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">{user.firstName} {user.lastName}</h2>
                        <div className="flex items-center justify-center space-x-2 mb-4">
                          <FaCheckCircle className="w-4 h-4 text-emerald-500" />
                          <span className={`text-sm font-semibold ${user.status === 'active' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {user.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                        </div>
                        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
                          <FaTruck className="w-4 h-4 text-slate-600" />
                          <span className="text-sm font-semibold text-slate-700 capitalize">{user.role}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FaEnvelope className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{user.email}</p>
                            <p className="text-xs text-slate-500">Email Address</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
                          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <FaPhone className="w-5 h-5 text-emerald-600" />
                    </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{user.phone || 'Not provided'}</p>
                            <p className="text-xs text-slate-500">Phone Number</p>
                    </div>
                  </div>
                        
                        <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
                          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <FaMapMarkerAlt className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{user.address || 'Not provided'}</p>
                            <p className="text-xs text-slate-500">Address</p>
                          </div>
                    </div>
                        
                        <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                            <FaCalendarAlt className="w-5 h-5 text-slate-600" />
                    </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                            </p>
                            <p className="text-xs text-slate-500">Joined Date</p>
                    </div>
                    </div>
                  </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Account Management */}
                <div className="lg:col-span-2">
                  <Card className="border-0 shadow-xl bg-white">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                          <FaCog className="w-5 h-5 text-slate-700" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Account Management</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                              <FaEdit className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-slate-900">Edit Profile</h4>
                              <p className="text-sm text-slate-600">Update your personal information</p>
                            </div>
                          </div>
                          <button
                            onClick={handleEditOpen}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl font-semibold transition-colors duration-200"
                          >
                            Edit Profile
                          </button>
                        </div>
                        
                        <div className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl border border-amber-200">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                              <FaKey className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-slate-900">Change Password</h4>
                              <p className="text-sm text-slate-600">Update your account password</p>
                            </div>
                          </div>
                          <button
                            onClick={handleChangePasswordOpen}
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-xl font-semibold transition-colors duration-200"
                          >
                            Change Password
                          </button>
            </div>
          </div>

                      <div className="mt-8 p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                            <FaShieldAlt className="w-5 h-5 text-slate-600" />
                          </div>
                          <h4 className="text-lg font-bold text-slate-900">Account Security</h4>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Account Status</span>
                            <span className={`text-sm font-semibold ${user.status === 'active' ? 'text-emerald-600' : 'text-red-600'}`}>
                              {user.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Role</span>
                            <span className="text-sm font-semibold text-slate-900 capitalize">{user.role}</span>
                    </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Member Since</span>
                            <span className="text-sm font-semibold text-slate-900">
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                            </span>
                  </div>
                    </div>
                  </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : null}
            </div>
        </main>

          {/* Edit Profile Modal */}
          {showEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
              <button onClick={handleEditClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-2xl">&times;</button>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FaEdit className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Edit Profile</h2>
              </div>
                <form className="space-y-4">
                  <div>
                  <label className="block text-slate-700 font-semibold mb-2">First Name</label>
                  <input 
                    name="firstName" 
                    value={form.firstName} 
                    onChange={handleChange} 
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-slate-50" 
                  />
                  </div>
                  <div>
                  <label className="block text-slate-700 font-semibold mb-2">Last Name</label>
                  <input 
                    name="lastName" 
                    value={form.lastName} 
                    onChange={handleChange} 
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-slate-50" 
                  />
                  </div>
                  <div>
                  <label className="block text-slate-700 font-semibold mb-2">Email</label>
                  <input 
                    name="email" 
                    value={form.email} 
                    onChange={handleChange} 
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-slate-50" 
                  />
                  </div>
                  <div>
                  <label className="block text-slate-700 font-semibold mb-2">Phone</label>
                  <input 
                    name="phone" 
                    value={form.phone} 
                    onChange={handleChange} 
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-slate-50" 
                  />
                  </div>
                  <div>
                  <label className="block text-slate-700 font-semibold mb-2">Address</label>
                  <input 
                    name="address" 
                    value={form.address} 
                    onChange={handleChange} 
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-slate-50" 
                  />
                  </div>
                  <button
                    type="button"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold mt-6 transition-colors duration-200 disabled:opacity-60"
                    onClick={handleSaveProfile}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  {saveError && <p className="text-red-600 text-sm mt-2">{saveError}</p>}
                </form>
              </div>
            </div>
          )}

          {/* Change Password Modal */}
          {showChangePassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
              <button onClick={handleChangePasswordClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-2xl">&times;</button>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <FaKey className="w-5 h-5 text-amber-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Change Password</h2>
              </div>
                <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleChangePassword(); }}>
                  <div>
                  <label className="block text-slate-700 font-semibold mb-2">Current Password</label>
                  <input 
                    name="currentPassword" 
                    type="password" 
                    value={passwordForm.currentPassword} 
                    onChange={handlePasswordInput} 
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-slate-50" 
                    required 
                  />
                  </div>
                  <div>
                  <label className="block text-slate-700 font-semibold mb-2">New Password</label>
                  <input 
                    name="newPassword" 
                    type="password" 
                    value={passwordForm.newPassword} 
                    onChange={handlePasswordInput} 
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-slate-50" 
                    required 
                  />
                  </div>
                  <button
                    type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-semibold mt-6 transition-colors duration-200 disabled:opacity-60"
                    disabled={changing}
                  >
                    {changing ? 'Changing...' : 'Change Password'}
                  </button>
                  {changeError && <p className="text-red-600 text-sm mt-2">{changeError}</p>}
                {changeSuccess && <p className="text-emerald-600 text-sm mt-2">{changeSuccess}</p>}
                </form>
              </div>
            </div>
          )}
      </div>
    </ProtectedRoute>
  );
} 