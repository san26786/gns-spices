import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'GNS Spices — Premium spices, honest blends',
  description:
    'Single-origin spices and traditional masala blends from India. Retail, wholesale, and private-label, shipped worldwide.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased">
        {/* Heritage strip — slim amber-accented top bar */}
        <div className="bg-black/80 border-b border-white/5 text-zinc-400 text-[11px] tracking-[0.25em] uppercase">
          <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
            <span><span className="text-amber-400">●</span> Pure spices · Lab-tested · Family-owned</span>
            <span className="hidden md:inline">Free shipping on retail orders over £40</span>
          </div>
        </div>

        {/* Main header — glass on dark */}
        <header className="glass-strong sticky top-0 z-30 border-b border-white/10">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-3" aria-label="GNS Spices home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/logo.png"
                alt="GNS Spices"
                className="h-12 md:h-14 w-auto object-contain"
              />
            </Link>
            <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-200">
              <Link href="/shop" className="hover:text-amber-400 transition">Shop</Link>
              <Link href="/shop?category=masalas" className="hover:text-amber-400 transition">Masalas</Link>
              <Link href="/b2b" className="hover:text-amber-400 transition">B2B</Link>
              <Link href="/private-label" className="hover:text-amber-400 transition">Private Label</Link>
              <Link href="/cart" className="hover:text-amber-400 transition">Cart</Link>
              <Link
                href="/account"
                className="px-4 py-1.5 rounded-full border border-white/20 hover:border-amber-400 hover:text-amber-400 transition"
              >
                Account
              </Link>
            </nav>
            <nav className="flex md:hidden items-center gap-4 text-sm font-medium text-zinc-200">
              <Link href="/shop" className="hover:text-amber-400">Shop</Link>
              <Link href="/cart" className="hover:text-amber-400">Cart</Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="mt-24 border-t border-white/10 bg-black/80 text-zinc-300">
          <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-10 text-sm">
            <div className="col-span-2 md:col-span-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/logo.png"
                alt="GNS Spices"
                className="h-14 w-auto object-contain mb-4"
              />
              {/* end logo */}
              <p className="text-zinc-400 leading-relaxed">
                Three generations of farming, sourcing, and slow-roasting. From our family in Kerala to kitchens worldwide.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-3 text-amber-400 tracking-wide uppercase text-xs">Shop</h5>
              <ul className="space-y-1.5">
                <li><Link href="/shop" className="hover:text-amber-400 transition">All spices</Link></li>
                <li><Link href="/shop?category=powders" className="hover:text-amber-400 transition">Pure powders</Link></li>
                <li><Link href="/shop?category=seeds" className="hover:text-amber-400 transition">Whole seeds</Link></li>
                <li><Link href="/shop?category=masalas" className="hover:text-amber-400 transition">Signature masalas</Link></li>
                <li><Link href="/shop?category=whole" className="hover:text-amber-400 transition">Whole spices</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-3 text-amber-400 tracking-wide uppercase text-xs">Business</h5>
              <ul className="space-y-1.5">
                <li><Link href="/b2b" className="hover:text-amber-400 transition">Wholesale</Link></li>
                <li><Link href="/private-label" className="hover:text-amber-400 transition">Private label</Link></li>
                <li><Link href="/account/rfqs" className="hover:text-amber-400 transition">Request a quote</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-3 text-amber-400 tracking-wide uppercase text-xs">Trust</h5>
              <ul className="space-y-1.5 text-zinc-400">
                <li>FSSAI certified</li>
                <li>ISO 22000 facility</li>
                <li>Halal &amp; Kosher options</li>
                <li>Lab-tested every batch</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5">
            <p className="max-w-7xl mx-auto px-6 py-5 text-center text-xs text-zinc-500">
              © {new Date().getFullYear()} GNS Spices. Crafted in India. Shipped worldwide.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
