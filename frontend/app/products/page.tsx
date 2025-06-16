// app/products/page.tsx
"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem('user');
      if (!user) {
        router.push('/login');
        return;
      }
      try {
        const userData = JSON.parse(user);
        if (userData.role !== 'customer') {
          router.push('/dashboard');
          return;
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error parsing user data:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  const handleUploadClick = () => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
      return;
    }
    try {
      const userData = JSON.parse(user);
      if (userData.role !== 'customer') {
        router.push('/dashboard');
        return;
      }
      router.push('/upload-prescription');
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <button 
        onClick={handleUploadClick}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Upload Prescription
      </button>
    </div>
  );
}
