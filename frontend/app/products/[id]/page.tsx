/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { JSX, useState } from 'react';
import { notFound, usePathname, useParams } from 'next/navigation';
import { FaMoneyBillAlt, FaLifeRing, FaCreditCard } from "react-icons/fa";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ProductImageGallery } from './ProductImageGallery';
import { ProductInfo } from './ProductInfo';
import RelatedProductCard from './RelatedProductCard';
import { useCart } from '@/context/CartContext';
import CartSidebar from '@/components/CartSidebar';

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
    images?: string[];
    prescription?: 'required' | 'not_required';
}

interface SupportItem {
    icon: JSX.Element;
    title: string;
    text: string;
}

const SupportInfoBox = () => {
  const supportItems: SupportItem[] = [
    {
      icon: <FaMoneyBillAlt className="w-6 h-6 text-teal-600" />,
      title: "Reliable",
      text: "All products are from verified suppliers",
    },
    {
      icon: <FaLifeRing className="w-6 h-6 text-teal-600" />,
      title: "Dedicated support",
      text: "Hotline: (+94212322600)",
    },
    {
      icon: <FaCreditCard className="w-6 h-6 text-teal-600" />,
      title: "Payment Options",
      text: "Safe online payment options",
    },
  ];

  return (
    <div className="rounded-xl bg-gradient-to-br from-gray-50 to-blue-50 p-6 shadow-sm h-full flex flex-col justify-around">
      {supportItems.map((item, index) => (
        <div key={item.title} className={`flex items-center gap-4 ${index < supportItems.length - 1 ? 'pb-6 mb-6 border-b border-gray-200' : ''}`}>
          <div className="bg-white rounded-full p-3 shadow-sm">
            {item.icon}
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-md">{item.title}</h3>
            <p className="text-sm text-gray-500">{item.text}</p>
          </div>
        </div>
      ))}
    </div>
  )
};

async function getProduct(id: string): Promise<Product | undefined> {
  try {
    const res = await fetch(`http://localhost:8000/api/products/${id}`, { 
      cache: 'no-store',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    if (!res.ok) {
      console.warn(`Product endpoint returned ${res.status}: ${res.statusText}`);
      return undefined;
    }
    return res.json();
  } catch {
    // Don't log the error to console to avoid the fetch failed error
    return undefined;
  }
}

async function getRelatedProducts(id: string): Promise<Product[]> {
  try {
    const res = await fetch(`http://localhost:8000/api/products/${id}/related`, { 
      cache: 'no-store',
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) {
      console.warn(`Related products endpoint returned ${res.status}: ${res.statusText}`);
      return [];
    }
    return res.json();
  } catch {
    return [];
  }
}

export default function ProductDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const [product, setProduct] = React.useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = React.useState<Product[]>([]);
    const [loading, setLoading] = React.useState(true);
    const { cartItems } = useCart();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const pathname = usePathname();

    React.useEffect(() => {
        const fetchProductData = async () => {
            try {
                const productRes = await fetch(`http://localhost:8000/api/products/${id}`, { 
                    cache: 'no-store'
                });
                if (!productRes.ok) {
                    notFound();
                    return;
                }
                const productData = await productRes.json();
                setProduct(productData);

                const relatedRes = await fetch(`http://localhost:8000/api/products/${id}/related`, { 
                    cache: 'no-store'
                });
                if (relatedRes.ok) {
                    const relatedData = await relatedRes.json();
                    setRelatedProducts(relatedData);
                }
            } catch (error) {
                console.error("Failed to fetch product data", error);
                notFound();
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProductData();
        }
    }, [id]);

    if (loading) {
        return <div>Loading...</div>; // Or a proper loading skeleton
    }

    if (!product) {
        notFound();
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-end mb-4">
                    <div
                        className="ml-4 cursor-pointer rounded-2xl bg-gradient-to-tr from-white via-blue-50 to-white shadow-xl px-6 py-4 flex items-center gap-4 transition-transform hover:scale-105 border border-blue-100 min-w-[170px]"
                        onClick={() => setIsCartOpen(true)}
                    >
                        <div className="relative flex items-center justify-center">
                            <div className="bg-[#1A5CFF] rounded-full p-2 flex items-center justify-center shadow-md">
                                <svg
                                    className="h-7 w-7 text-white drop-shadow"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                    />
                                </svg>
                                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-white shadow">
                                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col items-start justify-center ml-2">
                            <span className="uppercase text-xs font-semibold tracking-wider text-gray-500 mb-1">Cart</span>
                            <span className="text-lg font-bold text-gray-800 tracking-tight">LKR {cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                <div className="w-full flex flex-col lg:flex-row gap-10">
                    <div className="w-full lg:w-2/5">
                        <ProductImageGallery 
                            images={
                                product.images && product.images.length > 0 
                                ? product.images 
                                : (product.image ? [product.image] : [])
                            } 
                        />
                    </div>
    
                    <div className="w-full lg:w-3/5 flex flex-col md:flex-row gap-8">
                        <div className="flex-1">
                            <ProductInfo product={product} />
                        </div>
    
                        <div className="w-full md:w-1/3">
                            <SupportInfoBox />
                        </div>
                    </div>
                </div>
    
                <div className="mt-10">
                    <div className="bg-gray-100 p-6 rounded-lg">
                        <div>
                            <h3 className="text-teal-700 font-bold mb-2">DESCRIPTION</h3>
                            <div
                                dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br />') }}
                            />
                        </div>
                    </div>
                </div>
    
                <div className="mt-12">
                    <h2 className="text-xl font-bold text-teal-700 mb-6">RELATED PRODUCTS</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {relatedProducts.map((prod) => (
                            <RelatedProductCard key={prod._id} product={prod} />
                        ))}
                    </div>
                </div>
            </main>
            <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
            <Footer />
        </div>
    );
} 