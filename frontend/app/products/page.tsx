// app/products/page.tsx
"use client";
import { useRouter } from 'next/navigation';

export default function ProductPage() {
  const router = useRouter();

  const handleUploadClick = () => {
    const user = sessionStorage.getItem('user');
    if (!user) {
      router.push('/login?returnUrl=/upload-prescription');
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
      router.push('/login?returnUrl=/upload-prescription');
    }
  };

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
