'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/lib/cart';

export default function SiteHeader() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  if (pathname?.startsWith('/partner-strategy') || pathname?.startsWith('/admin')) return null;

  return (
    <>
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
            <CartIcon count={itemCount} />
            <Link
              href="/account"
              className="px-4 py-1.5 rounded-full border border-white/20 hover:border-amber-400 hover:text-amber-400 transition"
            >
              Account
            </Link>
          </nav>
          <nav className="flex md:hidden items-center gap-4 text-sm font-medium text-zinc-200">
            <Link href="/shop" className="hover:text-amber-400">Shop</Link>
            <CartIcon count={itemCount} />
          </nav>
        </div>
      </header>
    </>
  );
}

function CartIcon({ count }: { count: number }) {
  return (
    <Link
      href="/cart"
      aria-label={count ? `Cart, ${count} item${count === 1 ? '' : 's'}` : 'Cart, empty'}
      className="relative inline-flex items-center justify-center w-10 h-10 -my-2 rounded-full text-zinc-200 hover:text-amber-400 transition"
    >
      <svg aria-hidden viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 4h2l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.7a1.5 1.5 0 0 0 1.5-1.1L21 8H6.2" />
        <circle cx="9.5" cy="20" r="1.3" />
        <circle cx="17.5" cy="20" r="1.3" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[1.25rem] h-5 px-1 rounded-full bg-amber-500 text-amber-950 text-[11px] font-bold leading-5 text-center tabular-nums shadow-amber">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
