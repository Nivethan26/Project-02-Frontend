"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from '@/context/CartContext';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'react-hot-toast';

// Duplicating interface to make component self-contained
interface Product {
    _id: string;
    name: string;
    price: number;
    packPrice?: number;
    image?: string;
    prescription?: 'required' | 'not_required';
    stock: number;
}

interface RelatedProductCardProps {
    product: Product;
}

const RelatedProductCard: React.FC<RelatedProductCardProps> = ({ product }) => {
    const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
    const router = useRouter();
    const pathname = usePathname();

    const cartItem = cartItems.find(item => item.id === product._id);

    const imageUrl = product.image
        ? `http://localhost:8000/${product.image.replace(/\\/g, '/')}`
        : '/placeholder.png';

    const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault(); // Prevent Link navigation
        
        const token = sessionStorage.getItem('token');
        if (!token) {
            router.push(`/login?redirect=${pathname}`);
            return;
        }

        if (product.prescription === 'required') {
            router.push(`/upload-prescription?product_id=${product._id}`);
            return;
        }

        if (product.stock <= 0) {
            alert("This product is out of stock.");
            return;
        }

        addToCart({
            id: product._id,
            name: product.name,
            price: product.packPrice || product.price,
            quantity: 1,
            image: imageUrl,
        });
        toast.success(`1 x ${product.name} added to cart!`);
    };

    const handleQuantityChange = (e: React.MouseEvent<HTMLButtonElement>, newQuantity: number) => {
        e.preventDefault();
        if (newQuantity > 0) {
            updateQuantity(product._id, newQuantity);
        } else {
            removeFromCart(product._id);
        }
    };

    const displayPrice = product.packPrice || product.price;

    return (
        <Link href={`/products/${product._id}`} className="block h-full">
            <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center h-full transition-transform transform hover:-translate-y-1 duration-300 ease-in-out">
                <div className="relative w-28 h-28 mb-3">
                    <Image 
                        src={imageUrl} 
                        alt={product.name} 
                        fill 
                        className="object-contain rounded-lg"
                        sizes="112px"
                    />
                </div>
                <div className="text-center font-semibold text-gray-800 mb-1 flex-grow">{product.name}</div>
                <div className="text-teal-700 font-bold mb-4">LKR {displayPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                
                <div className="w-full mt-auto">
                    {cartItem ? (
                        <div className="flex items-center justify-center gap-2">
                            <button
                                className="w-10 h-10 rounded-md bg-gray-200 text-2xl font-bold hover:bg-gray-300"
                                onClick={(e) => handleQuantityChange(e, cartItem.quantity - 1)}
                            >-</button>
                            <span className="w-14 h-10 text-center border-gray-300 border rounded-md flex items-center justify-center font-bold">{cartItem.quantity}</span>
                            <button
                                className="w-10 h-10 rounded-md bg-gray-200 text-2xl font-bold hover:bg-gray-300 disabled:opacity-50"
                                onClick={(e) => handleQuantityChange(e, cartItem.quantity + 1)}
                                disabled={cartItem.quantity >= product.stock}
                            >+</button>
                        </div>
                    ) : (
                        <button 
                            className={'w-full py-2 rounded font-bold bg-teal-500 text-white hover:bg-teal-600 disabled:bg-gray-400 disabled:cursor-not-allowed'}
                            onClick={handleAddToCart}
                            disabled={product.stock <= 0}
                        >
                            {product.stock > 0 ? 'ADD TO CART' : 'OUT OF STOCK'}
                        </button>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default RelatedProductCard; 