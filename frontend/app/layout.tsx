import './globals.css';
import { CartProvider } from '../context/CartContext';
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Toaster position="top-right" reverseOrder={false} />
          <main>{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
