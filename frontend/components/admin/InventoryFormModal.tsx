/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { Editor, EditorProvider } from 'react-simple-wysiwyg';

interface InventoryItem {
    _id: string;
    name: string;
    description: string;
    price: number;
    packPrice?: number;
    stock: number;
    category:string;
    brand?: string;
    packSize?: string;
    tags?: string[];
    images?: string[];
    image?: string;
    status: 'active' | 'inactive';
    prescription: 'required' | 'not_required';
}

interface InventoryFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    itemToEdit: InventoryItem | null;
    onSuccess: () => void;
}

const categoryValueMap: { [key: string]: string } = {
    'Medicine' : 'medicine',
    'Adult Care': 'adult_care',
    'Diabetic Care': 'diabetic_care',
    'Hair Care': 'hair_care',
    'Ayurveda': 'ayurveda',
    'Skin Care': 'skin_care',
    'Mother & Baby Care': 'mother_and_baby_care',
    'Health & Wellness': 'health_and_wellness',
    'Beauty Accessories': 'beauty_accessories',
    'Cosmetics': 'cosmetics',
    'Food Items': 'food_items',
    'Health Monitoring Devices': 'health_monitoring_devices',
    'Kids': 'kids',
    'Household Remedies': 'household_remedies',
    'Pet Care': 'pet_care',
    'Beverages': 'beverages',
    'Sexual Wellness': 'sexual_wellness',
    'Instant Powdered Mixes': 'instant_powdered_mixes',
};

const categories = Object.keys(categoryValueMap);

const initialFormState = {
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    brand: '',
    packSize: '',
    status: 'active' as 'active' | 'inactive',
    prescription: 'not_required' as 'required' | 'not_required',
};

const InventoryFormModal: React.FC<InventoryFormModalProps> = ({ isOpen, onClose, itemToEdit, onSuccess }) => {
    const [formData, setFormData] = useState(initialFormState);
    const [images, setImages] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const isEditMode = !!itemToEdit;

    useEffect(() => {
        if (itemToEdit) {
            setFormData({
                name: itemToEdit.name,
                description: itemToEdit.description,
                price: String(itemToEdit.price || ''),
                stock: String(itemToEdit.stock),
                category: itemToEdit.category,
                brand: itemToEdit.brand || '',
                packSize: itemToEdit.packSize || '',
                status: itemToEdit.status,
                prescription: itemToEdit.prescription,
            });
            if (itemToEdit.images && itemToEdit.images.length > 0) {
                const existingImageUrls = itemToEdit.images.map(img => 
                    img.startsWith('http') ? img : `http://localhost:8000/${img.replace(/\\/g, '/')}`
                );
                setImagePreviews(existingImageUrls);
            } else {
                setImagePreviews([]);
            }
        } else {
            setFormData(initialFormState);
            setImagePreviews([]);
        }
    }, [itemToEdit]);
    
    if (!isOpen) return null;

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleDescriptionChange = (e: { target: { value: string } }) => {
        setFormData(prev => ({ ...prev, description: e.target.value }));
    };
    
    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setImages(files);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setImagePreviews(newPreviews);
        }
    };

    const handleModalClose = () => {
        setFormData(initialFormState);
        setImages([]);
        setImagePreviews([]);
        onClose();
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);

        if (!isEditMode && images.length === 0) {
            toast.error('Image is required.');
            setLoading(false);
            return;
        }

        const data = new FormData();
        (Object.keys(formData) as Array<keyof typeof formData>).forEach(key => {
            const value = formData[key];
            data.append(key, String(value));
        });
        images.forEach(image => {
            data.append('images', image);
        });

        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                toast.error('Authentication token not found');
                return;
            }

            const headers = { Authorization: `Bearer ${token}` };
            let response;

            if (isEditMode) {
                response = await axios.put(`http://localhost:8000/api/admin/inventory/${itemToEdit._id}`, data, { headers });
            } else {
                response = await axios.post('http://localhost:8000/api/admin/inventory', data, { headers });
            }

            if (response.data) {
                toast.success(`Item ${isEditMode ? 'updated' : 'added'} successfully`);
                onSuccess();
                handleModalClose();
            }
        } catch (error: any) {
            console.error('Submit error:', error);
            const errorMessage = error.response?.data?.message || 'Operation failed';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <EditorProvider>
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                    <div className="mt-3">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            {isEditMode ? 'Edit Inventory Item' : 'Add New Inventory Item'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Image</label>
                                <div className="mt-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        multiple
                                    />
                                </div>
                                <div className="mt-2 grid grid-cols-3 gap-4">
                                    {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative w-24 h-24 border rounded-lg overflow-hidden">
                                        <Image
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            fill
                                            priority
                                            className="object-cover"
                                            sizes="96px"
                                        />
                                    </div>
                                    ))}
                                    {imagePreviews.length === 0 && (
                                    <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 col-span-3">
                                        No images selected
                                    </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <Editor
                                    value={formData.description}
                                    onChange={handleDescriptionChange}
                                    containerProps={{ style: { resize: 'vertical' } }}
                                />
                            </div>
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                                <select
                                    name="category"
                                    id="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    required
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((cat) => (
                                    <option key={cat} value={categoryValueMap[cat]}>
                                        {cat}
                                    </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                                <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stock</label>
                                    <input type="number" name="stock" id="stock" value={formData.stock} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Brand</label>
                                    <input
                                        type="text"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Pack Size</label>
                                    <input
                                        type="text"
                                        name="packSize"
                                        value={formData.packSize}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={handleModalClose}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    {loading ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update Item' : 'Add Item')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </EditorProvider>
    );
};

export default InventoryFormModal; 