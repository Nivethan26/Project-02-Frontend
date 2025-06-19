'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import userService from '../services/user';

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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  // Function to check login and load cart
  const checkLoginAndLoadCart = async () => {
    if (typeof window === 'undefined') return;
    const token = sessionStorage.getItem('token');
    if (token) {
      try {
        const backendCart = await userService.getCart();
        setCartItems(
          backendCart.map((item: any) => ({
            id: item.product._id,
            name: item.product.name,
            price: item.product.price,
            image: item.product.image,
            quantity: item.quantity,
          }))
        );
        setIsLoggedIn(true);
      } catch (e) {
        setCartItems([]);
        setIsLoggedIn(true);
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
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'token') {
        checkLoginAndLoadCart();
      }
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
      } catch {}
    }
    if (isLoggedIn && hasHydrated && token && userRole === 'customer') {
      userService.updateCart(
        cartItems.map(item => ({ product: item.id, quantity: item.quantity }))
      ).catch((error: any) => {
        if (error?.message !== 'Not authorized, no token' && error?.message !== 'Server error') {
          console.error('Error updating cart:', error);
        }
        // Otherwise, suppress the error
      });
    }
  }, [cartItems, isLoggedIn, hasHydrated]);

  const addToCart = (item: CartItem) => {
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
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, isLoggedIn }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}; 