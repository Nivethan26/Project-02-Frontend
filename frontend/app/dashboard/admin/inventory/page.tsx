/* eslint-disable react/no-unescaped-entities */
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
  images?: string[];
  image?: string; // Legacy field
  brand?: string;
  packSize?: string;
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
    brand: '',
    packSize: '',
    status: 'active' as 'active' | 'inactive',
    prescription: 'not_required' as 'required' | 'not_required',
    images: [] as string[]
  });
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);

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

  const getImageUrl = (imagePath: string | undefined | null): string => {
    if (!imagePath) {
      return '/placeholder.png';
    }
    const filename = imagePath.replace(/\\/g, '/').split('/').pop();
    return `http://localhost:8000/uploads/products/${filename}`;
  };

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
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setImageFiles(fileArray);

      const previewArray = fileArray.map(file => URL.createObjectURL(file));
      setImagePreview(previewArray);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.category ||
      !formData.price ||
      !formData.stock ||
      !formData.brand.trim()
    ) {
      toast.error('Please fill in all required fields (Pack Size is optional).');
      return;
    }

    if (!isEditMode && imageFiles.length === 0) {
      toast.error('Image is required when adding a new item.');
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

      const postData = new FormData();
      postData.append('name', formData.name);
      postData.append('description', formData.description);
      postData.append('category', formData.category);
      postData.append('price', formData.price);
      postData.append('stock', formData.stock);
      postData.append('brand', formData.brand);
      postData.append('packSize', formData.packSize);
      postData.append('status', formData.status);
      postData.append('prescription', formData.prescription);
      
      if (imageFiles.length > 0) {
        imageFiles.forEach((file) => {
          postData.append('images', file);
        });
      } else if (isEditMode && formData.images.length > 0) {
        // Keep existing images if no new one is uploaded
        postData.append('images', JSON.stringify(formData.images));
      }

      const headers = { 
        Authorization: `Bearer ${token}`,
      };

      if (isEditMode && selectedItem) {
        await axios.put(
          `http://localhost:8000/api/admin/inventory/${selectedItem._id}`,
          postData,
          { headers }
        );
        toast.success('Item updated successfully');
      } else {
        await axios.post(
          'http://localhost:8000/api/admin/inventory',
          postData,
          { headers }
        );
        toast.success('Item added successfully');
      }
      setIsModalOpen(false);
      fetchInventory();
      resetForm();
    } catch (error: any) {
      console.error('Submit error:', error);
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
        router.push('/login');
      } else if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Invalid data provided';
        toast.error(errorMessage);
      } else {
        const errorMessage = error.response?.data?.message || 'Operation failed';
        toast.error(errorMessage);
      }
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    const existingImages = (item.images && item.images.length > 0) ? item.images : (item.image ? [item.image] : []);
    setFormData({
      name: item.name,
      description: item.description,
      category: item.category,
      price: item.price.toString(),
      stock: item.stock.toString(),
      status: item.status,
      prescription: item.prescription,
      images: existingImages,
      brand: item.brand || '',
      packSize: item.packSize || '',
    });
    setImagePreview(existingImages.map(img => getImageUrl(img)));
    setImageFiles([]);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const item = inventory.find(item => item._id === id);
    if (item) {
      setItemToDelete(item);
      setDeleteModalOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found');
        router.push('/login');
        return;
      }

      const response = await axios.delete(
        `http://localhost:8000/api/admin/inventory/${itemToDelete._id}`,
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
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
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
      images: [],
      brand: '',
      packSize: '',
    });
    setImagePreview([]);
    setImageFiles([]);
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
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold">Inventory Items</h2>
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
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
                          src={getImageUrl(item.images && item.images.length > 0 ? item.images[0] : item.image)}
                          alt={item.name}
                          fill
                          priority
                          className="object-cover rounded"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
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
                    <td className="px-3 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.prescription === 'required' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {item.prescription === 'required' ? 'Prescription Required' : 'No Prescription'}
                      </span>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium space-x-2">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'linear-gradient(120deg, rgba(37,99,235,0.7) 0%, rgba(255,255,255,0.7) 100%)' }}>
          <div className="relative max-w-lg w-full mx-auto rounded-2xl shadow-2xl bg-white" style={{ borderTop: '6px solid #2563eb' }}>
            {/* Blue accent bar */}
            <div className="w-full h-2 rounded-t-2xl" style={{ background: 'linear-gradient(90deg, #2563eb 0%, #60a5fa 100%)' }} />
            <div className="p-6 sm:p-8">
              <div className="flex flex-col items-center mb-4">
                <h3 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">{isEditMode ? 'Edit Inventory Item' : 'Add New Inventory Item'}</h3>
                <p className="text-gray-500 text-base text-center">Fill in the details below to {isEditMode ? 'update' : 'add'} an inventory item.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Image Upload Section */}
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Image(s)</label>
                  <div className="flex flex-wrap gap-2 justify-center mb-2">
                    {imagePreview.length > 0 ? (
                      imagePreview.map((preview, index) => (
                        <div key={index} className="w-24 h-24 border-2 border-dashed border-blue-300 bg-blue-50 rounded-lg overflow-hidden relative flex items-center justify-center">
                          <Image
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            fill
                            priority
                            className="object-cover"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="w-24 h-24 flex items-center justify-center text-blue-300 border-2 border-dashed border-blue-200 bg-blue-50 rounded-lg">
                        No image
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="mt-2 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none"
                  />
                </div>
                {/* Main Form Fields: Responsive grid, 1 col on mobile, 3 col on md+ */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Brand</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base px-3 py-2"
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
                    <label className="block text-base font-medium text-gray-700 mb-1">Pack Size</label>
                    <input
                      type="text"
                      value={formData.packSize}
                      onChange={(e) => setFormData({ ...formData, packSize: e.target.value })}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Stock</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base px-3 py-2"
                      required
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Prescription Status</label>
                    <select
                      value={formData.prescription}
                      onChange={(e) => setFormData({ ...formData, prescription: e.target.value as 'required' | 'not_required' })}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base px-3 py-2"
                      required
                    >
                      <option value="not_required">No Prescription Required</option>
                      <option value="required">Prescription Required</option>
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-base font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base px-3 py-2 resize-vertical"
                      required
                    />
                  </div>
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
                    {isEditMode ? 'Update Item' : 'Add Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'linear-gradient(120deg, rgba(239,68,68,0.7) 0%, rgba(255,255,255,0.7) 100%)' }}>
          <div className="relative max-w-md w-full mx-auto rounded-2xl shadow-2xl bg-white" style={{ borderTop: '6px solid #ef4444' }}>
            {/* Red accent bar */}
            <div className="w-full h-2 rounded-t-2xl" style={{ background: 'linear-gradient(90deg, #ef4444 0%, #f87171 100%)' }} />
            <div className="p-6 sm:p-8">
              <div className="flex flex-col items-center mb-6">
                {/* Warning Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">Delete Item</h3>
                <p className="text-gray-600 text-center mb-4">
                  Are you sure you want to delete <span className="font-semibold text-gray-800">"{itemToDelete.name}"</span>?
                </p>
                <p className="text-sm text-red-600 text-center">
                  This action cannot be undone.
                </p>
              </div>

              {/* Item Preview */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <Image
                      src={getImageUrl(itemToDelete.images && itemToDelete.images.length > 0 ? itemToDelete.images[0] : itemToDelete.image)}
                      alt={itemToDelete.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 truncate">{itemToDelete.name}</h4>
                    <p className="text-sm text-gray-600 capitalize">{itemToDelete.category}</p>
                    <p className="text-sm text-gray-600">Stock: {itemToDelete.stock}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelDelete}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 font-semibold shadow-sm transition-colors"
                >
                  Delete Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 