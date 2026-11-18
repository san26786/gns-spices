import './globals.css';
import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { CartProvider } from '@/lib/cart';

export const metadata: Metadata = {
  title: 'GNS Spices — Premium spices, honest blends',
  description:
    'Single-origin spices and traditional masala blends from India. Retail, wholesale, and private-label, shipped worldwide.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased">
        <CartProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
