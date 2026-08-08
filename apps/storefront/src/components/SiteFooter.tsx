'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith('/partner-strategy')) return null;

  return (
    <footer className="mt-24 border-t border-white/10 bg-black/80 text-zinc-300">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-10 text-sm">
        <div className="col-span-2 md:col-span-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logo.png"
            alt="GNS Spices"
            className="h-14 w-auto object-contain mb-4"
          />
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
  );
}
