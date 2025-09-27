/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Sidebar from '@/components/layout/Sidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import UserDeleteModal from '@/components/UserDeleteModal';
import userService, { User } from '@/services/user';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch users');
      toast.error(error instanceof Error ? error.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: 'active' | 'inactive') => {
    if (!userId) {
      toast.error('Invalid user ID');
      return;
    }

    try {
      setError(null);
      await userService.updateUserStatus(userId, newStatus);
      toast.success(`User status updated to ${newStatus}`);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error updating user status:', error);
      const message = error instanceof Error ? error.message : 'Failed to update user status';
      setError(message);
      toast.error(message);
    }
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      setError(null);
      await userService.deleteUser(userToDelete._id);
      toast.success('User deleted successfully');
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error deleting user:', error);
      const message = error instanceof Error ? error.message : 'Failed to delete user';
      setError(message);
      toast.error(message);
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const handleEdit = (userId: string) => {
    if (!userId) {
      toast.error('Invalid user ID');
      return;
    }
    router.push(`/dashboard/admin/users/edit/${userId}`);
  };

  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const matchesSearch = 
      fullName.includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeColor = (role: string | undefined) => {
    if (!role) return "bg-gray-100 text-gray-800";
    
    switch (role) {
      case "doctor":
        return "bg-blue-100 text-blue-800";
      case "pharmacist":
        return "bg-green-100 text-green-800";
      case "delivery":
        return "bg-purple-100 text-purple-800";
      case "customer":
        return "bg-gray-100 text-gray-800";
      case "admin":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeColor = (status: string | undefined) => {
    if (!status) return "bg-gray-100 text-gray-800";
    return status === "active" 
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const formatRole = (role: string | undefined) => {
    if (!role) return 'Unknown';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const formatStatus = (status: string | undefined) => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <ProtectedRoute role="admin">
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar role="admin" />
        <main className="flex-1 ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">User Management</h1>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="all">All Roles</option>
                    <option value="doctor">Doctors</option>
                    <option value="pharmacist">Pharmacists</option>
                    <option value="delivery">Delivery Personnel</option>
                    <option value="customer">Customers</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {loading ? (
                <div className="p-4 text-center">Loading...</div>
              ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                      <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                            {formatRole(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(user.status)}`}>
                            {formatStatus(user.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.addedBy ? (
                            <div className="flex flex-col">
                              <span className="text-sm text-gray-900">
                                {user.addedBy.firstName} {user.addedBy.lastName}
                              </span>
                              <span className="text-xs text-gray-500">
                                Added on {new Date(user.addedBy.date).toLocaleDateString()}
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col">
                              <span className="text-sm text-gray-400">Self-registered</span>
                              <span className="text-xs text-gray-500">
                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                              </span>
                            </div>
                          )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-3">
                            {['doctor', 'pharmacist', 'delivery'].includes(user.role) && (
                              user.status === 'active' ? (
                                <button 
                                  onClick={() => handleStatusChange(user._id, 'inactive')}
                                  className="text-red-600 hover:text-red-900 transition-colors duration-200"
                                  title="Deactivate user"
                                >
                                  Deactivate
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleStatusChange(user._id, 'active')}
                                  className="text-green-600 hover:text-green-900 transition-colors duration-200"
                                  title="Activate user"
                                >
                                  Activate
                                </button>
                              )
                            )}
                            {user.role !== 'admin' && (
                              <button 
                                onClick={() => handleDeleteClick(user)}
                                className="text-red-600 hover:text-red-900 transition-colors duration-200"
                                title="Delete user"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              )}
            </div>
          </div>
        </main>
      </div>
      
      {/* Delete Confirmation Modal */}
      <UserDeleteModal
        open={showDeleteModal}
        userName={userToDelete ? `${userToDelete.firstName} ${userToDelete.lastName}` : undefined}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </ProtectedRoute>
  );
} 