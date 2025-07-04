/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import axios from 'axios';
import Sidebar from '@/components/layout/Sidebar';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import LogoutConfirmModal from '@/components/LogoutConfirmModal';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface StaffMember {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'pharmacist' | 'doctor' | 'delivery';
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  speciality?: string;
  profilePhoto?: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phone?: string;
  address?: string;
  role?: string;
}

interface StaffFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  role: 'pharmacist' | 'doctor' | 'delivery';
  profilePhoto: File | null;
  speciality: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState<StaffFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: 'pharmacist',
    profilePhoto: null,
    speciality: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const { logout } = useCart();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    // Check if user is logged in and is admin
    const storedUser = sessionStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(storedUser);
    if (userData.role !== 'admin') {
      toast.error('Unauthorized access');
      router.push('/login');
      return;
    }

    setUser(userData);
    fetchStaffMembers();
  }, [router]);

  const fetchStaffMembers = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/admin/staff', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaffMembers(response.data);
    } catch (error) {
      toast.error('Failed to fetch staff members');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation (only for new staff members)
    if (!isEditMode) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!/(?=.*[a-z])/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one lowercase letter';
      } else if (!/(?=.*[A-Z])/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one uppercase letter';
      } else if (!/(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one number';
      }
    }

    // Phone validation
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (formData.address.length < 5) {
      newErrors.address = 'Address must be at least 5 characters';
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = 'Role is required';
    } else if (!['pharmacist', 'doctor', 'delivery'].includes(formData.role)) {
      newErrors.role = 'Invalid role selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      let submitData: any = formData;
      let headers: any = { Authorization: `Bearer ${token}` };
      let isMultipart = !!formData.profilePhoto || (formData.role === 'doctor' && formData.speciality);
      if (isMultipart) {
        submitData = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (key === 'profilePhoto' && value) {
            submitData.append('profilePhoto', value as File);
          } else if (value !== undefined && value !== null) {
            submitData.append(key, value as string);
          }
        });
        headers['Content-Type'] = 'multipart/form-data';
      }
      if (isEditMode && selectedStaff) {
        await axios.put(`http://localhost:8000/api/admin/staff/${selectedStaff._id}`, submitData, { headers });
        toast.success('Staff member updated successfully');
      } else {
        await axios.post('http://localhost:8000/api/admin/staff', submitData, { headers });
        toast.success('Staff member created successfully');
      }
      setIsModalOpen(false);
      setIsEditMode(false);
      setSelectedStaff(null);
      fetchStaffMembers();
      resetForm();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'An error occurred';
      toast.error(errorMessage);
    }
  };

  const handleEdit = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setFormData({
      firstName: staff.firstName,
      lastName: staff.lastName,
      email: staff.email,
      password: '',
      phone: staff.phone,
      address: staff.address,
      role: staff.role,
      profilePhoto: null,
      speciality: staff.speciality || ''
    });
    if (staff.profilePhoto) {
      setPhotoPreview(`http://localhost:8000/${staff.profilePhoto.replace(/^uploads\//, 'uploads/')}`);
    } else {
      setPhotoPreview(null);
    }
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        const token = sessionStorage.getItem('token');
        await axios.delete(`http://localhost:8000/api/admin/staff/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Staff member deleted successfully');
        fetchStaffMembers();
      } catch (error) {
        toast.error('Failed to delete staff member');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      role: 'pharmacist',
      profilePhoto: null,
      speciality: ''
    });
    setPhotoPreview(null);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setSelectedStaff(null);
    resetForm();
    setPhotoPreview(null);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    router.push('/login');
  };

  const cancelLogout = () => setShowLogoutModal(false);

  const handleStaffLogin = async (staff: StaffMember) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.post('http://localhost:8000/api/auth/staff-login', {
        email: staff.email,
        role: staff.role
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      sessionStorage.setItem('staffToken', response.data.token);
      sessionStorage.setItem('staffUser', JSON.stringify(response.data.user));
      router.push(`/dashboard/${staff.role}`);
    } catch (error) {
      toast.error('Failed to login as staff member');
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar role="admin" />
      
      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.firstName} {user.lastName}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Staff Management</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add New Staff
            </button>
          </div>

          {/* Staff List */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {staffMembers.map((member) => (
                  <tr key={`staff-${member._id}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {member.firstName} {member.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">{member.role}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(member)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(member._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'linear-gradient(120deg, rgba(37,99,235,0.7) 0%, rgba(255,255,255,0.7) 100%)' }}>
          <div className="relative max-w-lg w-full mx-auto rounded-2xl shadow-2xl bg-white" style={{ borderTop: '6px solid #2563eb' }}>
            {/* Blue accent bar */}
            <div className="w-full h-2 rounded-t-2xl" style={{ background: 'linear-gradient(90deg, #2563eb 0%, #60a5fa 100%)' }} />
            <div className="p-6 sm:p-8">
              <div className="flex flex-col items-center mb-4">
                <h3 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">{isEditMode ? 'Edit Staff Member' : 'Add New Staff'}</h3>
                <p className="text-gray-500 text-base text-center">Fill in the details below to {isEditMode ? 'update' : 'add'} a staff member.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Profile Photo Section */}
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Profile Photo (optional)</label>
                  <div className="flex justify-center">
                    <div
                      style={{
                        width: 96,
                        height: 96,
                        border: '2px dashed #2563eb',
                        background: '#f3f6fb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 16,
                        overflow: 'hidden',
                        marginBottom: 8
                      }}
                    >
                      {photoPreview ? (
                        <Image
                          src={photoPreview}
                          alt="Profile Preview"
                          width={96}
                          height={96}
                          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                        />
                      ) : (
                        <span className="text-blue-400 text-3xl">+</span>
                      )}
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files && e.target.files.length > 0 ? e.target.files[0] : null;
                      setFormData({ ...formData, profilePhoto: file });
                      if (file) {
                        setPhotoPreview(URL.createObjectURL(file));
                      } else if (selectedStaff && selectedStaff.profilePhoto) {
                        setPhotoPreview(`http://localhost:8000/${selectedStaff.profilePhoto.replace(/^uploads\//, 'uploads/')}`);
                      } else {
                        setPhotoPreview(null);
                      }
                    }}
                    className="mt-2 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none"
                  />
                </div>
                <hr className="my-2 border-gray-200" />
                {/* Main Form Fields: Responsive grid, 1 col on mobile, 2 col on md+ */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base px-3 py-2 ${errors.firstName ? 'border-red-300' : ''}`}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base px-3 py-2 ${errors.lastName ? 'border-red-300' : ''}`}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base px-3 py-2 ${errors.email ? 'border-red-300' : ''}`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                    )}
                  </div>
                  {!isEditMode && (
                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-1">Password</label>
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base px-3 py-2 ${errors.password ? 'border-red-300' : ''}`}
                      />
                      {errors.password && (
                        <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                      )}
                    </div>
                  )}
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base px-3 py-2 ${errors.phone ? 'border-red-300' : ''}`}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base px-3 py-2 ${errors.address ? 'border-red-300' : ''}`}
                    />
                    {errors.address && (
                      <p className="mt-1 text-xs text-red-600">{errors.address}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Role</label>
                    <select
                      required
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as 'pharmacist' | 'doctor' | 'delivery' })}
                      className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base px-3 py-2 ${errors.role ? 'border-red-300' : ''}`}
                    >
                      <option value="pharmacist">Pharmacist</option>
                      <option value="doctor">Doctor</option>
                      <option value="delivery">Delivery</option>
                    </select>
                    {errors.role && (
                      <p className="mt-1 text-xs text-red-600">{errors.role}</p>
                    )}
                  </div>
                  {formData.role === 'doctor' && (
                    <div className="md:col-span-2">
                      <label className="block text-base font-medium text-gray-700 mb-1">Speciality</label>
                      <input
                        type="text"
                        value={formData.speciality}
                        onChange={e => setFormData({ ...formData, speciality: e.target.value })}
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base px-3 py-2"
                        required={formData.role === 'doctor'}
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 font-semibold shadow-sm"
                  >
                    {isEditMode ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <LogoutConfirmModal open={showLogoutModal} onConfirm={confirmLogout} onCancel={cancelLogout} />
    </div>
  );
}
