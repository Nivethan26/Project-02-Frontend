"use client";

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter, usePathname } from 'next/navigation';
import { FaFacebookF, FaInstagram, FaTwitter, FaShareAlt } from "react-icons/fa";
import { toast } from 'react-hot-toast';

interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    packPrice?: number;
    stock: number;
    category: string;
    brand?: string;
    packSize?: string;
    tags?: string[];
    image?: string;
    prescription?: 'required' | 'not_required';
}

interface ProductInfoProps {
    product: Product;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => {
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();
    const router = useRouter();
    const pathname = usePathname();

    const handleActionClick = () => {
        // Prevent adding out-of-stock products
        if (product.stock <= 0) {
            toast.error('This product is out of stock');
            return;
        }

        const token = sessionStorage.getItem('token');
        if (!token) {
            router.push(`/login?redirect=${pathname}`);
            return;
        }

        if (product.prescription === 'required') {
            router.push(`/upload-prescription?product_id=${product._id}`);
        } else {
            const getProductImage = (product: Product) => {
                let imageUrl = '/placeholder.png';
                if (product.image) {
                    imageUrl = product.image;
                }
                if (imageUrl && !imageUrl.startsWith('http')) {
                    return `http://localhost:8000/${imageUrl.replace(/\\/g, '/')}`;
                }
                return imageUrl;
            };

            addToCart({
                id: product._id,
                name: product.name,
                price: product.packPrice || product.price,
                quantity: quantity,
                image: getProductImage(product),
            });
            toast.success(`${quantity} x ${product.name} added to cart!`);
        }
    };
    
    return (
        <div>
          <div className="mb-2">
            <span className={`${product.stock > 0 ? 'bg-green-600' : 'bg-red-600'} text-white px-3 py-1 rounded font-semibold text-sm`}>
                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>
          
          <div className="text-2xl text-[#1A5CFF] font-bold mb-4">
            {product.packPrice 
                ? `LKR ${product.packPrice.toFixed(2)}` 
                : `LKR ${product.price.toFixed(2)}`
            }
          </div>
          
          <div className="flex items-center gap-4 mt-6 mb-8">
              <div className="flex items-center gap-2">
                <button
                  className="w-10 h-10 rounded-md bg-gray-200 text-2xl font-bold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >-</button>
                <input
                  type="text"
                  value={quantity}
                  readOnly
                  className="w-14 h-10 text-center border-gray-300 border rounded-md"
                />
                <button
                  className="w-10 h-10 rounded-md bg-gray-200 text-2xl font-bold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setQuantity(q => Math.min(q + 1, product.stock))}
                  disabled={quantity >= product.stock}
                >+</button>
              </div>
              <button 
                  className={`flex-1 py-2.5 rounded-md font-bold text-lg transition ${
                    product.stock > 0 
                      ? 'bg-[#1A5CFF] hover:bg-[#1547CC] text-white' 
                      : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  }`}
                  onClick={handleActionClick}
                  disabled={product.stock <= 0}
              >
                  {product.stock <= 0 
                    ? 'Out of Stock' 
                    : product.prescription === 'required' 
                      ? 'Upload Prescription' 
                      : 'Add to cart'
                  }
              </button>
          </div>
          
          <div className="border-t pt-6">
              <h3 className="text-md font-semibold text-gray-800 mb-3">Product Details</h3>
              <div className="space-y-3 text-gray-700">
                  {product.brand && <div className="flex items-center"><span className="font-semibold w-24">Brand:</span> <span className="text-[#1A5CFF] cursor-pointer">{product.brand}</span></div>}
                  {product.packSize && <div className="flex items-center"><span className="font-semibold w-24">Pack Size:</span> {product.packSize}</div>}
                  {product.category && <div className="flex items-center"><span className="font-semibold w-24">Category:</span> <span className="text-[#1A5CFF] cursor-pointer capitalize">{product.category.replace(/_/g, ' ')}</span></div>}
              </div>
          </div>

          <div className="border-t mt-6 pt-6">
            <div className="flex gap-4 items-center">
              <span className="font-semibold text-gray-700">Share:</span>
              <div className="flex gap-3">
                <FaFacebookF className="text-xl text-gray-500 hover:text-blue-600 cursor-pointer" />
                <FaInstagram className="text-xl text-gray-500 hover:text-pink-500 cursor-pointer" />
                <FaTwitter className="text-xl text-gray-500 hover:text-sky-500 cursor-pointer" />
                <FaShareAlt className="text-xl text-gray-500 hover:text-gray-800 cursor-pointer" />
              </div>
            </div>
          </div>
        </div>
    )
} 