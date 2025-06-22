/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import Sidebar from '@/components/layout/Sidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useEffect, useState } from 'react';
import authService, { User } from '@/services/auth';
import { Mail, Phone, MapPin, User as UserIcon, BadgeCheck, CalendarCheck, ShieldCheck, Edit, KeyRound, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

function getInitials(firstName?: string, lastName?: string) {
  return (firstName?.[0] || '') + (lastName?.[0] || '');
}

function AnimatedAvatar({ initials }: { initials: string }) {
  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-400 via-blue-200 to-blue-500 animate-spin-slow blur-sm opacity-60" style={{ zIndex: 1 }} />
      <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white/80 shadow-2xl border-4 border-blue-400 flex items-center justify-center text-blue-600 text-6xl sm:text-7xl font-extrabold relative z-10 backdrop-blur-md">
        {initials}
      </div>
    </div>
  );
}

export default function DeliveryProfilePage() {
  const [user, setUser] = useState<User & { phone?: string; address?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Settings modal state
  const [showSettings, setShowSettings] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Edit profile state
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', address: '' });
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

  return (
    <ProtectedRoute role="delivery">
      <div className="flex min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 relative overflow-hidden">
        {/* Faint white overlay for extra polish */}
        <div className="absolute inset-0 bg-white/40 pointer-events-none z-0" />
        {/* Blurred background shapes */}
        <div className="absolute -top-10 -left-32 w-96 h-96 bg-blue-400 opacity-30 rounded-full filter blur-3xl z-0" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-200 opacity-40 rounded-full filter blur-2xl z-0" />
        <div className="hidden md:block"><Sidebar role="delivery" /></div>
        <main className="flex-1 md:ml-64 p-0 sm:p-4 flex flex-col items-center justify-start relative z-10">
          {/* Banner/Cover */}
          <div className="w-full h-32 sm:h-48 md:h-64 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300 relative flex items-end justify-center shadow-lg">
            <div className="absolute bottom-[-56px] sm:bottom-[-72px] md:bottom-[-88px] z-20">
              {/* Animated Avatar */}
              {user ? (
                <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40">
                  <AnimatedAvatar initials={getInitials(user.firstName, user.lastName)} />
                </div>
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full bg-white/80 shadow-2xl border-4 border-blue-400 flex items-center justify-center text-blue-600 text-5xl sm:text-6xl md:text-7xl font-extrabold animate-fadeIn backdrop-blur-md">
                  <UserIcon className="w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24" />
                </div>
              )}
            </div>
            {/* Floating Manage Account Button */}
            <button
              onClick={() => setShowSettings(true)}
              className="absolute right-4 bottom-4 sm:right-8 sm:bottom-8 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full font-bold shadow-lg transition text-base sm:text-lg flex items-center gap-2 z-30"
              style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}
            >
              Manage Account
              <Edit className="w-5 h-5" /> <span className="hidden xs:inline">Manage Account</span>
            </button>
          </div>
          <div className="w-full flex justify-center mt-20 sm:mt-24">
            <div className="w-full max-w-lg sm:max-w-2xl md:max-w-3xl bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-blue-100 p-4 sm:p-10 md:p-16 md:py-20 animate-fadeInUp relative">
              <h1 className="text-5xl font-bold text-blue-900 mb-3 text-center tracking-tight font-sans">Delivery Profile</h1>
              <p className="text-center text-blue-500 mb-10 text-lg font-medium tracking-normal font-sans">View and manage your personal information</p>
              {loading ? (
                <p className="text-gray-600 text-center">Loading profile details...</p>
              ) : error ? (
                <p className="text-red-600 text-center">{error}</p>
              ) : user ? (
                <div className="space-y-10 sm:space-y-14 md:space-y-16">
                  {/* Name and Status */}
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-10 border-b pb-8 md:pb-12">
                    <div className="text-center md:text-left">
                      <div className="text-4xl font-bold text-gray-800 tracking-tight font-sans">{user.firstName} {user.lastName}</div>
                      <div className="flex items-center justify-center md:justify-start text-lg text-gray-600 mt-3 gap-2 font-bold tracking-normal">
                        <BadgeCheck className="w-6 h-6 text-green-500" />
                        <span className={user.status === 'active' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                          {user.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-blue-50 px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-blue-200 shadow-md mt-4 md:mt-0">
                      <ShieldCheck className="w-6 h-6 text-blue-500" />
                      <span className="capitalize text-blue-700 font-bold text-lg tracking-tight font-sans">{user.role}</span>
                    </div>
                  </div>
                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 md:gap-x-16 md:gap-y-8">
                    <div className="flex items-center space-x-4 group">
                      <Mail className="w-7 h-7 text-blue-400" />
                      <span className="text-gray-700 font-bold group-hover:text-blue-700 transition text-lg tracking-normal font-sans">{user.email}</span>
                    </div>
                    <div className="flex items-center space-x-4 group">
                      <Phone className="w-7 h-7 text-blue-400" />
                      <span className="text-gray-700 font-bold group-hover:text-blue-700 transition text-lg tracking-normal font-sans">{user.phone}</span>
                    </div>
                    <div className="flex items-center space-x-4 group">
                      <MapPin className="w-7 h-7 text-blue-400" />
                      <span className="text-gray-700 font-bold group-hover:text-blue-700 transition text-lg tracking-normal font-sans">{user.address}</span>
                    </div>
                    <div className="flex items-center space-x-4 group">
                      <CalendarCheck className="w-7 h-7 text-blue-400" />
                      <span className="text-gray-700 font-bold group-hover:text-blue-700 transition text-lg tracking-normal font-sans">Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''}</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Settings Modal */}
          {showSettings && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-500/70 animate-fadeIn">
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-scaleIn">
                <button onClick={() => setShowSettings(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
                <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">Manage Account</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-lg border hover:shadow transition cursor-pointer bg-white/80 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <Edit className="w-6 h-6 text-blue-500" />
                      <span className="font-semibold text-gray-800">Edit Profile</span>
                    </div>
                    <button onClick={handleEditOpen} className="text-blue-600 font-semibold">Edit</button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border hover:shadow transition cursor-pointer bg-white/80 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <KeyRound className="w-6 h-6 text-yellow-500" />
                      <span className="font-semibold text-gray-800">Change Password</span>
                    </div>
                    <button onClick={handleChangePasswordOpen} className="text-blue-600 font-semibold">Change</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Profile Modal */}
          {showEdit && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-500/70 animate-fadeIn">
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-scaleIn">
                <button onClick={handleEditClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
                <div className="flex items-center gap-2 mb-4">
                  <UserIcon className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-blue-700">Edit Profile</h2>
                </div>
                <div className="border-b mb-4" />
                <form className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">First Name</label>
                    <input name="firstName" value={form.firstName} onChange={handleChange} className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Last Name</label>
                    <input name="lastName" value={form.lastName} onChange={handleChange} className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Email</label>
                    <input name="email" value={form.email} onChange={handleChange} className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Phone</label>
                    <input name="phone" value={form.phone} onChange={handleChange} className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Address</label>
                    <input name="address" value={form.address} onChange={handleChange} className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
                  </div>
                  <button
                    type="button"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold mt-4 transition disabled:opacity-60"
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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-500/70 animate-fadeIn">
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-scaleIn">
                <button onClick={handleChangePasswordClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-6 h-6 text-yellow-500" />
                  <h2 className="text-xl font-bold text-yellow-700">Change Password</h2>
                </div>
                <div className="border-b mb-4" />
                <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleChangePassword(); }}>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Current Password</label>
                    <input name="currentPassword" type="password" value={passwordForm.currentPassword} onChange={handlePasswordInput} className="w-full border border-yellow-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition" required />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">New Password</label>
                    <input name="newPassword" type="password" value={passwordForm.newPassword} onChange={handlePasswordInput} className="w-full border border-yellow-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition" required />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg font-semibold mt-4 transition disabled:opacity-60"
                    disabled={changing}
                  >
                    {changing ? 'Changing...' : 'Change Password'}
                  </button>
                  {changeError && <p className="text-red-600 text-sm mt-2">{changeError}</p>}
                  {changeSuccess && <p className="text-green-600 text-sm mt-2">{changeSuccess}</p>}
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
      {/* Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.8s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 6s linear infinite;
        }
      `}</style>
    </ProtectedRoute>
  );
} 