import type { Metadata } from 'next';
import './globals.css';
import { StoreProvider } from '@/lib/store';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToastContainer from '@/components/ToastContainer';
import CartDrawer from '@/components/CartDrawer';
import SearchModal from '@/components/SearchModal';
import QuickViewModal from '@/components/QuickViewModal';

export const metadata: Metadata = {
  title: 'AL-JO Fashion — Bespoke Haute Couture & Luxury Apparel',
  description:
    'Discover AL-JO Fashion: Italian velvet tuxedos, silk evening gowns, bespoke linen blazers, and luxury leather accessories. Production-ready fashion e-commerce.',
  keywords: ['fashion', 'luxury apparel', 'tuxedo', 'silk dress', 'blazer', 'designer clothes', 'AL-JO'],
  openGraph: {
    title: 'AL-JO Fashion — Luxury Fashion Store',
    description: 'Bespoke suits, gowns, and leather accessories for modern connoisseurs.',
    url: 'https://aljofashion.com',
    siteName: 'AL-JO Fashion',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-neutral-950 text-neutral-100 antialiased selection:bg-amber-500 selection:text-neutral-950">
        <StoreProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <ToastContainer />
          <CartDrawer />
          <SearchModal />
          <QuickViewModal />
        </StoreProvider>
      </body>
    </html>
  );
}
