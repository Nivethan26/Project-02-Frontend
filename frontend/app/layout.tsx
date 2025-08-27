import './globals.css';
import { CartProvider } from '../context/CartContext';
import { Toaster } from 'react-hot-toast';
import ScrollToTopButton from '../components/ScrollToTopButton';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Toaster position="top-right" reverseOrder={false} />
          <main>{children}</main>
          <ScrollToTopButton />
        </CartProvider>
      </body>
    </html>
  );
}
