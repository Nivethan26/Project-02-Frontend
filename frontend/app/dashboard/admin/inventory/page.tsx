/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import axios from 'axios';
import Sidebar from '@/components/layout/Sidebar';
import Image from 'next/image';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface InventoryItem {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  status: "active" | "inactive";
  prescription: "required" | "not_required";
  image: string;
}

export default function InventoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    stock: '',
    status: 'active' as 'active' | 'inactive',
    prescription: 'not_required' as 'required' | 'not_required',
    image: ''
  });
  const [imagePreview, setImagePreview] = useState<string>('');

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
    fetchInventory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const fetchInventory = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found');
        router.push('/login');
        return;
      }

      const response = await axios.get('http://localhost:8000/api/admin/inventory', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setInventory(response.data);
    } catch (error: any) {
      console.error('Fetch error:', error);
      console.error('Error response:', error.response);
      
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
        router.push('/login');
        return;
      }
      
      toast.error('Failed to fetch inventory');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData(prev => ({ ...prev, image: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name.trim() || !formData.category || !formData.price || !formData.stock) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (Number(formData.price) <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }

    if (Number(formData.stock) < 0) {
      toast.error('Stock cannot be negative');
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found');
        router.push('/login');
        return;
      }

      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const submitData = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock)
      };

      console.log('Submitting data:', submitData);

      if (isEditMode && selectedItem) {
        const response = await axios.put(
          `http://localhost:8000/api/admin/inventory/${selectedItem._id}`,
          submitData,
          { headers }
        );
        if (response.data) {
          toast.success('Item updated successfully');
          setIsModalOpen(false);
          fetchInventory();
          resetForm();
        }
      } else {
        const response = await axios.post(
          'http://localhost:8000/api/admin/inventory',
          submitData,
          { headers }
        );
        if (response.data) {
          toast.success('Item added successfully');
          setIsModalOpen(false);
          fetchInventory();
          resetForm();
        }
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      console.error('Error response:', error.response);
      
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
        router.push('/login');
        return;
      }
      
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Invalid data provided';
        toast.error(errorMessage);
        return;
      }
      
      const errorMessage = error.response?.data?.message || 'Operation failed';
      toast.error(errorMessage);
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      category: item.category,
      price: item.price.toString(),
      stock: item.stock.toString(),
      status: item.status,
      prescription: item.prescription,
      image: item.image
    });
    setImagePreview(item.image);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          toast.error('Authentication token not found');
          router.push('/login');
          return;
        }

        const response = await axios.delete(
          `http://localhost:8000/api/admin/inventory/${id}`,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            } 
          }
        );
        
        if (response.data) {
          toast.success('Item deleted successfully');
          fetchInventory();
        }
      } catch (error: any) {
        console.error('Delete error:', error);
        console.error('Error response:', error.response);
        
        if (error.response?.status === 401) {
          toast.error('Authentication failed. Please login again.');
          router.push('/login');
          return;
        }
        
        const errorMessage = error.response?.data?.message || 'Failed to delete item';
        toast.error(errorMessage);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      price: '',
      stock: '',
      status: 'active',
      prescription: 'not_required',
      image: ''
    });
    setImagePreview('');
    setIsEditMode(false);
    setSelectedItem(null);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    resetForm();
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
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Manage your inventory items</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Inventory Items</h2>
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add New Item
            </button>
          </div>

          {/* Inventory List */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prescription
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventory.map((item) => (
                  <tr key={item._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-12 w-12 relative">
                        <Image
                          src={item.image || '/placeholder.png'}
                          alt={item.name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">{item.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Rs.{item.price}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.stock}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.prescription === 'required' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {item.prescription === 'required' ? 'Prescription Required' : 'No Prescription'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
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

      {/* Add/Edit Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {isEditMode ? 'Edit Inventory Item' : 'Add New Inventory Item'}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Image</label>
                    <div className="mt-1 flex items-center">
                      <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                        {imagePreview ? (
                          <div className="w-full h-full relative">
                            <Image
                              src={imagePreview}
                              alt="Preview"
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No image
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="ml-4"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select a category</option>
                      <option value="adult_care">Adult Care</option>
                      <option value="diabetic_care">Diabetic Care</option>
                      <option value="hair_care">Hair Care</option>
                      <option value="ayurveda">Ayurveda</option>
                      <option value="skin_care">Skin Care</option>
                      <option value="mother_and_baby_care">Mother & Baby Care</option>
                      <option value="health_and_wellness">Health & Wellness</option>
                      <option value="beauty_accessories">Beauty Accessories</option>
                      <option value="cosmetics">Cosmetics</option>
                      <option value="food_items">Food Items</option>
                      <option value="health_monitoring_devices">Health Monitoring Devices</option>
                      <option value="kids">Kids</option>
                      <option value="household_remedies">Household Remedies</option>
                      <option value="pet_care">Pet Care</option>
                      <option value="beverages">Beverages</option>
                      <option value="sexual_wellness">Sexual Wellness</option>
                      <option value="instant_powdered_mixes">Instant Powdered Mixes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stock</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Prescription Status</label>
                    <select
                      value={formData.prescription}
                      onChange={(e) => setFormData({ ...formData, prescription: e.target.value as "required" | "not_required" })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    >
                      <option value="not_required">No Prescription Required</option>
                      <option value="required">Prescription Required</option>
                    </select>
                  </div>
                </div>
                <div className="mt-5 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {isEditMode ? 'Update Item' : 'Add Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 