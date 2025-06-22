"use client";

import Image from "next/image";
import { useState, MouseEvent } from "react";

interface ProductImageGalleryProps {
    images: string[];
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ images }) => {
    const [selectedImage, setSelectedImage] = useState(images.length > 0 ? images[0] : '/placeholder.png');
    const [zoomActive, setZoomActive] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const getImageUrl = (imagePath: string) => {
        if (!imagePath) return '/placeholder.png';
        if (imagePath.startsWith('http')) return imagePath;
        
        let normalizedPath = imagePath.replace(/\\/g, '/');
        if (!normalizedPath.startsWith('/')) {
            normalizedPath = '/' + normalizedPath;
        }
        return `http://localhost:8000${normalizedPath}`;
    }

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.pageX - left) / width) * 100;
        const y = ((e.pageY - top) / height) * 100;
        setPosition({ x, y });
    };

    const mainImageUrl = getImageUrl(selectedImage);

    return (
        <div className="relative">
            <div 
                className="relative w-full h-[450px] bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden cursor-crosshair"
                onMouseEnter={() => setZoomActive(true)}
                onMouseLeave={() => setZoomActive(false)}
                onMouseMove={handleMouseMove}
            >
                <Image
                    src={mainImageUrl}
                    alt="Product"
                    fill
                    priority
                    className="object-contain rounded-lg"
                    sizes="(min-width: 1024px) 30vw, 90vw"
                />
            </div>
            
            <div className="flex gap-3 mt-4">
                {images.map((img, idx) => (
                    <div
                        key={idx}
                        className={`relative w-20 h-20 rounded-lg border cursor-pointer ${selectedImage === img ? "border-blue-500" : "border-gray-200"}`}
                        onClick={() => setSelectedImage(img)}
                    >
                        <Image 
                            src={getImageUrl(img)} 
                            alt={`thumb-${idx}`} 
                            fill 
                            className="object-contain rounded-lg"
                            sizes="80px"
                        />
                    </div>
                ))}
            </div>

            {zoomActive && (
                <div 
                    className="absolute top-0 left-full ml-4 w-full h-[450px] pointer-events-none hidden lg:block"
                    style={{
                        backgroundImage: `url(${mainImageUrl})`,
                        backgroundPosition: `${position.x}% ${position.y}%`,
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '250%',
                        zIndex: 20,
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                    }}
                />
            )}
        </div>
    );
}; 