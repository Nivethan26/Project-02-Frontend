// app/products/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useRouter, usePathname } from 'next/navigation';
import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import CartSidebar from '@/components/CartSidebar';
import { toast } from 'react-hot-toast';
import { useCart } from '@/context/CartContext';
import Loader from '@/components/Loader';

// List of categories (should match sidebar)
const categories = [
  'All',
  'Adult Care',
  'Diabetic Care',
  'Hair Care',
  'Ayurveda',
  'Skin Care',
  'Mother & Baby Care',
  'Health & Wellness',
  'Beauty Accessories',
  'Cosmetics',
  'Food Items',
  'Health Monitoring Devices',
  'Kids',
  'Household Remedies',
  'Pet Care',
  'Beverages',
  'Sexual Wellness',
  'Instant Powdered Mixes'
];

// Mapping from display name to backend value
const categoryValueMap: { [key: string]: string } = {
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

interface InventoryItem {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  packPrice?: number;
  stock: number;
  status: 'active' | 'inactive';
  prescription: 'required' | 'not_required';
  image?: string;
  images?: string[];
}

// Filter options
const priceOptions = [
  { id: 1, label: 'High to Low' },
  { id: 2, label: 'Low to High' },
  { id: 3, label: 'Under LKR 1000' },
  { id: 4, label: 'LKR 1000 - 2500' },
  { id: 5, label: 'Above LKR 2500' }
];

export default function ProductPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('');
  const filterRef = useRef(null);
  const [products, setProducts] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [originalStock, setOriginalStock] = useState<{[key: string]: number}>({});

  // Cart state from context
  const { cartItems, addToCart, updateQuantity, removeFromCart, isLoggedIn } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  // Add this at the top of your component:
  const [isPriceDropdownOpen, setIsPriceDropdownOpen] = useState(false);

  // Helper function to get the correct image URL
  const getProductImage = (product: InventoryItem) => {
    const imagePath = product.images && product.images.length > 0 ? product.images[0] : product.image;
    if (!imagePath) {
      return '/placeholder.png';
    }
    const filename = imagePath.replace(/\\/g, '/').split('/').pop();
    return `http://localhost:8000/uploads/products/${filename}`;
  };

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/products', {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        setProducts(data);
        
        // Store original stock values
        const stockMap: {[key: string]: number} = {};
        data.forEach((product: InventoryItem) => {
          stockMap[product._id] = product.stock;
        });
        setOriginalStock(stockMap);
        
        setLoading(false);
      } catch (error: unknown) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Remove sessionStorage cart logic and use context
  useEffect(() => {
    setHasHydrated(true);
  }, []);

  // Function to update product stock based on cart
  const updateProductStock = useCallback(() => {
    setProducts(prevProducts => {
      return prevProducts.map(product => {
        if (product.prescription === 'not_required') {
          const cartItem = cartItems.find(item => item.id === product._id);
          const cartQuantity = cartItem ? cartItem.quantity : 0;
          const newStock = originalStock[product._id] - cartQuantity;
          return { ...product, stock: newStock };
        } else {
          return { ...product, stock: originalStock[product._id] };
        }
      });
    });
  }, [cartItems, originalStock]);

  useEffect(() => {
    if (hasHydrated && Object.keys(originalStock).length > 0) {
      updateProductStock();
    }
  }, [updateProductStock, hasHydrated, originalStock]);

  // Helper to check login (now from context)
  // const isLoggedIn = () => { ... } // REMOVE

  // Update handleAddToCart to redirect back to products page after login
  const handleAddToCart = (product: InventoryItem) => {
    if (!isLoggedIn) {
      toast.error('Please login to add items to cart');
      router.push(`/login?redirect=${pathname}`);
      return;
    }
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: getProductImage(product),
      quantity: 1,
    });
    toast.success('Added to cart');
  };

  // Handle general upload prescription click
  const handleGeneralUploadClick = () => {
    if (!isLoggedIn) {
      toast.error('Please login to upload a prescription');
      router.push(`/login?redirect=${pathname}`);
      return;
    }
    router.push('/upload-prescription');
  };

  // Handle quantity changes for items in the cart
  const handleQuantityChange = (productId: string, newQuantity: number, stock?: number) => {
    if (stock !== undefined && newQuantity > stock) {
      toast.error('Cannot add more than available stock.');
      return;
    }

    if (newQuantity <= 0) {
      removeFromCart(productId);
      toast.success('Item removed from cart');
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  // Handle Upload Prescription
  const handleUploadClick = (product: InventoryItem) => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=${pathname}`);
      return;
    }
    // Store the product info in sessionStorage for the upload page
    sessionStorage.setItem('prescriptionProduct', JSON.stringify(product));
    router.push('/upload-prescription');
  };

  const handleClickOutside = (event: any) => {
    if (filterRef.current && !(filterRef.current as any).contains(event.target)) {
      setIsPriceDropdownOpen(false);
    }
  };

  // Update getSortedAndFilteredProducts to filter by category
  const getSortedAndFilteredProducts = () => {
    let filteredProducts = [...products];

    // Filter out inactive products
    filteredProducts = filteredProducts.filter(product => product.status === 'active');

    // If searching, ignore category filter
    if (searchTerm) {
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else if (selectedCategory && selectedCategory !== 'All') {
      // Only apply category filter if not searching
      const backendCategory = categoryValueMap[selectedCategory];
      filteredProducts = filteredProducts.filter(product =>
        product.category &&
        product.category.trim().toLowerCase() === backendCategory
      );
    }

    // Apply price filter
    switch (selectedPrice) {
      case 'High to Low':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'Low to High':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'Under LKR 1000':
        filteredProducts = filteredProducts.filter(product => product.price < 1000);
        break;
      case 'LKR 1000 - 2500':
        filteredProducts = filteredProducts.filter(product => product.price >= 1000 && product.price <= 2500);
        break;
      case 'Above LKR 2500':
        filteredProducts = filteredProducts.filter(product => product.price > 2500);
        break;
      default:
        break;
    }

    return filteredProducts;
  };

  // Handle price filter change
  const handlePriceChange = (option: string) => {
    setSelectedPrice(option);
    setIsPriceDropdownOpen(false);
  };

  // In the render, only show cart UI after hydration
  if (!hasHydrated) return null;

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FF]" onClick={handleClickOutside}>
      <Navbar />
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <div className="w-64 bg-gradient-to-b from-blue-50 to-[#E9EDFF] shadow-lg h-screen sticky top-0 overflow-y-auto rounded-r-3xl">
          <div className="py-6 px-4">
            <ul>
              {categories.map((cat) => (
                <li
                  key={cat}
                  className={`mb-2 px-4 py-2 rounded-full cursor-pointer transition-all duration-200 select-none
                    ${selectedCategory === cat
                      ? 'bg-[#1A5CFF] text-white shadow font-semibold scale-105'
                      : 'text-gray-700 hover:bg-blue-100 hover:scale-105'}
                  `}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Search and Cart Section */}
          <div className="flex items-center justify-between mb-6">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-2xl">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <div className="flex items-center">
              {/* Upload Prescription Button */}
              <div
                className="ml-4 cursor-pointer rounded-2xl bg-gradient-to-tr from-green-50 to-white shadow-lg hover:shadow-xl border border-green-200 px-6 py-4 flex items-center gap-4 transition-all duration-300 hover:scale-105"
                onClick={handleGeneralUploadClick}
              >
                <div className="relative flex items-center justify-center">
                  <div className="bg-white rounded-full p-3 flex items-center justify-center shadow-md">
                    <svg
                      className="w-7 h-7 text-green-600 drop-shadow-sm"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex flex-col items-start justify-center ml-1">
                  <span className="font-bold text-lg text-green-800 tracking-tight">Upload</span>
                  <span className="uppercase text-xs font-semibold tracking-wider text-green-600">Prescription</span>
                </div>
              </div>

              {/* Cart Section */}
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
          </div>

          {/* Filter Section */}
          <div className="bg-[#E9EDFF] rounded-lg shadow-sm px-8 py-4 mb-6">
            <div className="flex justify-between items-center max-w-4xl">
              <div className="flex items-center gap-16">
                {/* Filters Icon */}
                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="font-medium">Filters</span>
                </div>

                {/* Price Filter */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPriceDropdownOpen((prev) => !prev);
                    }}
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                  >
                    <span>Prices</span>
                    <svg
                      className={`w-5 h-5 transition-transform ${isPriceDropdownOpen ? 'transform rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isPriceDropdownOpen && (
                    <div
                      ref={filterRef}
                      className="absolute z-10 mt-2 w-48 bg-white rounded-lg shadow-lg py-2"
                    >
                      {priceOptions.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => handlePriceChange(option.label)}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            selectedPrice === option.label
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {getSortedAndFilteredProducts().map((product, index) => {
              const cartItem = cartItems.find((item) => item.id === product._id);
              return (
                <div 
                  key={product._id} 
                  className="bg-white rounded-lg shadow-sm overflow-hidden relative flex flex-col cursor-pointer transition-shadow duration-300 hover:shadow-xl"
                  onClick={() => router.push(`/products/${product._id}`)}
                >
                  {/* Out of Stock label */}
                  {product.stock === 0 && !cartItem && (
                    <div className="absolute top-2 left-2 z-10">
                      <span className="bg-red-600 text-white font-semibold px-2 py-1 text-xs rounded-r">Out of Stock</span>
                    </div>
                  )}
                  <div className="p-4 flex flex-col h-full">
                    <div className="flex justify-center mb-4">
                      <div className="relative h-48 w-full overflow-hidden rounded-t-lg bg-gray-200">
                        <Image
                          src={getProductImage(product)}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                          priority={index < 4} // Prioritize loading for the first few images
                        />
                      </div>
                    </div>
                    <h3 className="text-base font-semibold text-gray-800 truncate" title={product.name}>{product.name}</h3>
                    {product.packPrice ? (
                      <p className="text-blue-600 font-bold text-xl mt-2">
                        LKR {product.packPrice.toFixed(2)}
                      </p>
                    ) : (
                      <p className="text-blue-600 font-bold text-xl mt-2">
                        LKR {product.price.toFixed(2)}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">Stock: {product.stock > 0 ? product.stock : 'Out of Stock'}</p>
                    
                    <div className="mt-auto pt-4">
                      {cartItem ? (
                        <div className="flex items-center justify-center w-full rounded-full border border-gray-300" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleQuantityChange(product._id, cartItem.quantity - 1)}
                            className="px-4 py-2 text-lg font-bold text-gray-600 hover:bg-gray-100 rounded-l-full transition"
                          >
                            -
                          </button>
                          <span className="px-5 font-bold text-lg text-gray-800">{cartItem.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(product._id, cartItem.quantity + 1, product.stock)}
                            disabled={cartItem.quantity >= product.stock}
                            className="px-4 py-2 text-lg font-bold text-gray-600 hover:bg-gray-100 rounded-r-full transition disabled:text-gray-300 disabled:cursor-not-allowed"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (product.prescription === 'required') {
                              handleUploadClick(product);
                            } else {
                              handleAddToCart(product);
                            }
                          }}
                          className="w-full py-2 px-4 rounded-lg text-white font-medium bg-[#1A5CFF] hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                          disabled={product.stock === 0}
                        >
                          {product.prescription === 'required' ? (
                            <>
                              Upload Prescription
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                />
                              </svg>
                            </>
                          ) : (
                            <>
                              Add to Cart
                              <svg
                                className="w-5 h-5"
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
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  );
}
