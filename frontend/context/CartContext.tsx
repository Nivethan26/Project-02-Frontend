'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import userService from '../services/user';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  logout: () => void;
  hasHydrated: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const router = useRouter();

  // Function to check login and load cart
  const checkLoginAndLoadCart = async () => {
    if (typeof window === 'undefined') return;
    // const token = sessionStorage.getItem('token');
    // if (token) {
    //   try {
    //     const backendCart = await userService.getCart();
    //     setCartItems(
    //       backendCart.map(item => ({
    //         id: item.product._id,
    //         name: item.product.name,
    //         price: item.product.price,
    //         image: item.product.image,
    //         quantity: item.quantity,
    //       }))
    //     );
    //     setIsLoggedIn(true);

    const token = sessionStorage.getItem('token');
    if (token) {
      try {
        const backendCart = await userService.getCart();
        console.log('Backend cart received:', backendCart);
        
        // Filter out any items with null or invalid product data
        const validCartItems = backendCart
          .filter(item => item.product && item.product._id && item.product.name)
          .map(item => ({
            id: item.product._id,
            name: item.product.name,
            price: item.product.price || 0,
            image: item.product.image || '',
            quantity: item.quantity || 1,
          }));
        
        console.log('Valid cart items after filtering:', validCartItems);
        setCartItems(validCartItems);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Failed to load cart:', error);
        setCartItems([]);
        setIsLoggedIn(false);
      }
    } else {
      const stored = sessionStorage.getItem('cart');
      setCartItems(stored ? JSON.parse(stored) : []);
      setIsLoggedIn(false);
    }
    setHasHydrated(true);
  };

  // Initial load
  useEffect(() => {
    checkLoginAndLoadCart();
    // Listen for storage events (cross-tab login/logout)
    const handleStorage = () => {
        checkLoginAndLoadCart();
    };
    window.addEventListener('storage', handleStorage);
    // Listen for window focus (in case login/logout happens in another tab)
    const handleFocus = () => checkLoginAndLoadCart();
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Save cart to sessionStorage for guests
  useEffect(() => {
    if (!isLoggedIn && hasHydrated) {
      sessionStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoggedIn, hasHydrated]);

  // Sync cart to backend for logged-in users (only for customers)
  useEffect(() => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
    const userStr = typeof window !== 'undefined' ? sessionStorage.getItem('user') : null;
    let userRole = null;
    if (userStr) {
      try {
        userRole = JSON.parse(userStr).role;
      } catch (error) {
        console.error('Failed to parse user from sessionStorage', error);
      }
    }
    if (isLoggedIn && hasHydrated && token && userRole === 'customer') {
      const cartToSync = cartItems.map(item => ({ product: item.id, quantity: item.quantity }));
      userService.updateCart(cartToSync).catch((error: Error) => {
        if (error?.message !== 'Not authorized, no token' && error?.message !== 'Server error') {
          console.error('Error updating cart:', error);
        }
      });
    }
  }, [cartItems, isLoggedIn, hasHydrated]);

  // Fetch cart from backend whenever isLoggedIn becomes true
  useEffect(() => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
    if (token && isLoggedIn) {
      userService.getCart()
        .then(backendCart => {
          const newCartItems = backendCart.map(item => ({
            id: item.product._id,
            name: item.product.name,
            price: item.product.price,
            image: item.product.image,
              quantity: item.quantity,
          }));
          setCartItems(newCartItems);
        })
        .catch(() => setCartItems([]));
    }
    setHasHydrated(true);
  }, [isLoggedIn]);

  const addToCart = (item: CartItem) => {
    if (!isLoggedIn) {
      toast.error('Please login to add items to cart');
      router.push('/login');
      return;
    }
    setCartItems(prev => {
      const existing = prev.find(ci => ci.id === item.id);
      if (existing) {
        return prev.map(ci => ci.id === item.id ? { ...ci, quantity: ci.quantity + item.quantity } : ci);
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
  };

  const clearCart = () => {
    console.log('CartContext: clearCart called. Current cart items:', cartItems);
    setCartItems([]);
    console.log('CartContext: Cart cleared successfully');
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCartItems([]);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, isLoggedIn, setIsLoggedIn, logout, hasHydrated }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}; 