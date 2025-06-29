/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Sidebar from '@/components/layout/Sidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState, useRef } from 'react';
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
  Trash2, 
  AlertTriangle,
  Camera,
  Save,
  X,
  CheckCircle,
  Settings
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

function getInitials(firstName?: string, lastName?: string) {
  return (firstName?.[0] || '') + (lastName?.[0] || '');
}

export default function CustomerProfilePage() {
  const [user, setUser] = useState<User & { phone?: string; address?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal states
  const [showEdit, setShowEdit] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  // Edit profile state
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Change password state
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changing, setChanging] = useState(false);
  const [changeError, setChangeError] = useState<string | null>(null);
  const [changeSuccess, setChangeSuccess] = useState<string | null>(null);

  // Delete account state
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
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
        // Set profile image if available
        if (profile.profileImage) {
          setProfileImage(profile.profileImage);
        }
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  // Profile image upload handlers
  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('profileImage', file);

      // Upload to backend
      const response = await fetch('/api/profile/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      if (data.success && data.imageUrl) {
        setProfileImage(data.imageUrl);
        
        // Update user profile with new image
        if (user) {
          setUser({ ...user, profileImage: data.imageUrl });
        }
        
        // Show success message
        toast.success('Profile image uploaded successfully!');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert(error.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Edit profile handlers
  function handleEditOpen() { 
    setShowEdit(true); 
    setSaveError(null);
    setSaveSuccess(null);
  }
  function handleEditClose() { setShowEdit(false); }
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) { 
    setForm({ ...form, [e.target.name]: e.target.value }); 
  }
  
  async function handleSaveProfile() {
    setSaving(true); 
    setSaveError(null);
    setSaveSuccess(null);
    try {
      const updated = await authService.updateProfile(form);
      setUser(updated);
      setSaveSuccess('Profile updated successfully!');
      setTimeout(() => setShowEdit(false), 1500);
    } catch {
      setSaveError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  }

  // Change password handlers
  function handleChangePasswordOpen() { 
    setShowChangePassword(true); 
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); 
    setChangeError(null); 
    setChangeSuccess(null); 
  }
  function handleChangePasswordClose() { setShowChangePassword(false); }
  function handlePasswordInput(e: React.ChangeEvent<HTMLInputElement>) { 
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value }); 
  }
  
  async function handleChangePassword() {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setChangeError('New passwords do not match.');
      return;
    }
    
    setChanging(true); 
    setChangeError(null); 
    setChangeSuccess(null);
    try {
      const res = await authService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setChangeSuccess(res.message);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setShowChangePassword(false), 1500);
    } catch (err: any) {
      setChangeError(err?.response?.data?.message || 'Failed to change password.');
    } finally {
      setChanging(false);
    }
  }

  // Delete account handlers
  function handleDeleteOpen() { 
    setShowDelete(true); 
    setDeleteError(null); 
  }
  function handleDeleteClose() { setShowDelete(false); }
  
  async function handleDeleteAccount() {
    setDeleting(true); 
    setDeleteError(null);
    try {
      await authService.deleteProfile();
      setShowDelete(false);
      router.push('/');
    } catch (err: any) {
      setDeleteError(err?.response?.data?.message || 'Failed to delete account.');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <ProtectedRoute role="customer">
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
          <Sidebar role="customer" />
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
    <ProtectedRoute role="customer">
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 relative overflow-hidden">
        {/* Professional Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-white/30 to-gray-50/50"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-slate-200/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gray-200/20 rounded-full filter blur-3xl"></div>
        
        <Sidebar role="customer" />
        
        <main className="flex-1 ml-64 p-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Professional Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center shadow-lg">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-1">Profile Management</h1>
                    <p className="text-slate-600 flex items-center space-x-2">
                      <span>Manage your account information and settings</span>
                      <span className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleEditOpen}
                    className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={handleChangePasswordOpen}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Change Password</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <Card className="mb-8 border-0 shadow-xl bg-white">
                <CardContent className="p-6">
                  <div className="text-center">
                    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Error Loading Profile</h3>
                    <p className="text-slate-600">{error}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {user && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                  <Card className="border-0 shadow-xl bg-white">
                    <CardContent className="p-8">
                      <div className="text-center mb-8">
                        <div className="relative inline-block mb-6">
                          {profileImage ? (
                            <div className="w-32 h-32 rounded-full overflow-hidden shadow-2xl border-4 border-slate-200">
                              <img 
                                src={profileImage} 
                                alt={`${user.firstName} ${user.lastName}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-32 h-32 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-2xl">
                              {getInitials(user.firstName, user.lastName)}
                            </div>
                          )}
            <button
                            onClick={handleImageUpload}
                            disabled={uploadingImage}
                            className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200"
                          >
                            {uploadingImage ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                              <Camera className="w-5 h-5" />
                            )}
            </button>
                          {/* Hidden file input */}
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
          </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">
                          {user.firstName} {user.lastName}
                        </h2>
                        <div className="flex items-center justify-center space-x-2 mb-4">
                          <BadgeCheck className="w-5 h-5 text-emerald-500" />
                          <span className={`text-sm font-semibold ${user.status === 'active' ? 'text-emerald-600' : 'text-red-600'}`}>
                            {user.status === 'active' ? 'Active Account' : 'Inactive Account'}
                        </span>
                        </div>
                        <div className="inline-flex items-center space-x-2 bg-slate-100 px-4 py-2 rounded-full">
                          <ShieldCheck className="w-4 h-4 text-slate-600" />
                          <span className="text-sm font-medium text-slate-700 capitalize">{user.role}</span>
                        </div>
                      </div>

                      {/* Account Stats */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                              <CalendarCheck className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-600">Member Since</p>
                              <p className="text-sm font-semibold text-slate-900">
                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                }) : 'N/A'}
                              </p>
                      </div>
                    </div>
                    </div>
                  </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Details Card */}
                <div className="lg:col-span-2">
                  <Card className="border-0 shadow-xl bg-white">
                    <CardContent className="p-8">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                          <Settings className="w-5 h-5 text-slate-700" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Personal Information</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Mail className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-600">Email Address</p>
                              <p className="text-sm font-semibold text-slate-900">{user.email}</p>
                    </div>
                    </div>

                          <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl">
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                              <Phone className="w-5 h-5 text-emerald-600" />
                    </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-600">Phone Number</p>
                              <p className="text-sm font-semibold text-slate-900">{user.phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                        <div className="space-y-4">
                          <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl">
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                              <MapPin className="w-5 h-5 text-amber-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-600">Address</p>
                              <p className="text-sm font-semibold text-slate-900">{user.address || 'Not provided'}</p>
            </div>
          </div>

                          {/* <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Clock className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-600">Last Updated</p>
                              <p className="text-sm font-semibold text-slate-900">
                                {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) : 'N/A'}
                              </p>
                            </div>
                          </div> */}
                        </div>
                    </div>

                      {/* Danger Zone */}
                      <div className="mt-8 pt-8 border-t border-slate-200">
                        <div className="flex items-center space-x-3 mb-4">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          <h4 className="text-lg font-semibold text-slate-900">Danger Zone</h4>
                  </div>
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-red-900">Delete Account</p>
                              <p className="text-sm text-red-700">Permanently delete your account and all associated data</p>
                    </div>
                            <button
                              onClick={handleDeleteOpen}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                  </div>
                    </div>
                  </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            </div>
        </main>

          {/* Edit Profile Modal */}
          {showEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Edit className="w-5 h-5 text-slate-700" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Edit Profile</h2>
                </div>
                <button 
                  onClick={handleEditClose}
                  className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>

                <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                    <input 
                      name="firstName" 
                      value={form.firstName} 
                      onChange={handleChange} 
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                    <input 
                      name="lastName" 
                      value={form.lastName} 
                      onChange={handleChange} 
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                  <input 
                    name="email" 
                    type="email"
                    value={form.email} 
                    onChange={handleChange} 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition" 
                  />
                  </div>
                  <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                  <input 
                    name="phone" 
                    value={form.phone} 
                    onChange={handleChange} 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition" 
                  />
                  </div>
                  <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                  <input 
                    name="address" 
                    value={form.address} 
                    onChange={handleChange} 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition" 
                  />
                </div>

                {saveError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-700">{saveError}</p>
                  </div>
                )}

                {saveSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <p className="text-sm text-emerald-700">{saveSuccess}</p>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleEditClose}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
                </form>
              </div>
            </div>
          )}

          {/* Change Password Modal */}
          {showChangePassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <KeyRound className="w-5 h-5 text-blue-700" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Change Password</h2>
                </div>
                <button 
                  onClick={handleChangePasswordClose}
                  className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>

                <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleChangePassword(); }}>
                  <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                  <input 
                    name="currentPassword" 
                    type="password" 
                    value={passwordForm.currentPassword} 
                    onChange={handlePasswordInput} 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                  <input 
                    name="newPassword" 
                    type="password" 
                    value={passwordForm.newPassword} 
                    onChange={handlePasswordInput} 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                  <input 
                    name="confirmPassword" 
                    type="password" 
                    value={passwordForm.confirmPassword} 
                    onChange={handlePasswordInput} 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" 
                    required 
                  />
                </div>

                {changeError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-700">{changeError}</p>
                  </div>
                )}

                {changeSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <p className="text-sm text-emerald-700">{changeSuccess}</p>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleChangePasswordClose}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={changing}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {changing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Changing...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Change Password</span>
                      </>
                    )}
                  </button>
                </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Account Modal */}
          {showDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-700" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Delete Account</h2>
                </div>
                  <button
                  onClick={handleDeleteClose}
                  className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors"
                  >
                  <X className="w-4 h-4 text-slate-600" />
                  </button>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-900 mb-1">Warning</p>
                    <p className="text-sm text-red-700">
                      This action cannot be undone. All your data, orders, and account information will be permanently deleted.
                    </p>
                  </div>
                </div>
              </div>

              {deleteError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-700">{deleteError}</p>
                </div>
              )}

              <div className="flex space-x-3">
                  <button
                    onClick={handleDeleteClose}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg font-medium transition-colors"
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Account</span>
                    </>
                  )}
                </button>
              </div>
              </div>
            </div>
          )}
      </div>
    </ProtectedRoute>
  );
} 