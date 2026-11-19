'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/admin-api';

interface Me { id: string; email: string; firstName: string | null; lastName: string | null; staffRole: string }

const NAV: Array<{ href: string; label: string; group?: string }> = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/orders', label: 'Orders', group: 'Sales' },
  { href: '/admin/customers', label: 'Customers', group: 'Sales' },
  { href: '/admin/coupons', label: 'Coupons', group: 'Sales' },
  { href: '/admin/products', label: 'Products', group: 'Catalogue' },
  { href: '/admin/categories', label: 'Categories', group: 'Catalogue' },
  { href: '/labels', label: 'QR & barcodes', group: 'Catalogue' },
  { href: '/admin/enquiries', label: 'Enquiries', group: 'Leads' },
  { href: '/admin/newsletter', label: 'Newsletter', group: 'Leads' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '/admin';
  const router = useRouter();
  // Pages reachable while signed out.
  const isLogin = pathname === '/admin/login' || pathname === '/admin/forgot-password' || pathname === '/admin/reset-password';
  const [me, setMe] = useState<Me | null>(null);
  const [checked, setChecked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (isLogin) return;
    let live = true;
    adminApi
      .get<Me>('/admin/me')
      .then((u) => live && (setMe(u), setChecked(true)))
      .catch(() => live && router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`));
    return () => { live = false; };
  }, [isLogin, pathname, router]);

  useEffect(() => setMenuOpen(false), [pathname]);

  if (isLogin) return <div className="min-h-screen text-white">{children}</div>;
  if (!checked) return <div className="min-h-screen grid place-items-center text-sm text-zinc-500">Checking your session…</div>;

  async function signOut() {
    await adminApi.post('/auth/logout', {}).catch(() => {});
    router.replace('/admin/login');
  }

  const isActive = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href));
  let lastGroup: string | undefined;

  return (
    <>
      <div className="min-h-screen text-white md:grid md:grid-cols-[240px_minmax(0,1fr)]">
        <aside className={`${menuOpen ? 'block' : 'hidden'} md:block border-r border-white/10 bg-black/60 md:sticky md:top-0 md:h-screen md:overflow-y-auto`}>
          <div className="px-5 py-5 border-b border-white/10 hidden md:block">
            <Link href="/admin" className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo.png" alt="GNS Spices" className="h-9 w-auto" />
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-amber-400">Admin</span>
            </Link>
          </div>
          <nav className="p-3 grid gap-0.5 text-sm" aria-label="Admin">
            {NAV.map((n) => {
              const header = n.group && n.group !== lastGroup ? n.group : null;
              lastGroup = n.group;
              return (
                <div key={n.href}>
                  {header && <p className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">{header}</p>}
                  <Link
                    href={n.href}
                    className={`block rounded-lg px-3 py-2 transition ${isActive(n.href) ? 'bg-amber-500/15 text-amber-300 font-semibold' : 'text-zinc-300 hover:bg-white/5 hover:text-white'}`}
                  >
                    {n.label}
                  </Link>
                </div>
              );
            })}
          </nav>
          <div className="p-4 mt-4 border-t border-white/10 text-xs text-zinc-400 grid gap-2">
            <span className="truncate">{me?.email}</span>
            <span className="uppercase tracking-[0.2em] text-[10px] text-zinc-500">{me?.staffRole?.replace('_', ' ')}</span>
            <div className="flex gap-3">
              <Link href="/" className="text-amber-400 hover:text-amber-300">View site</Link>
              <button type="button" onClick={signOut} className="text-zinc-300 hover:text-white">Sign out</button>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/60">
            <Link href="/admin" className="text-xs font-bold tracking-[0.3em] uppercase text-amber-400">GNS Admin</Link>
            <button type="button" onClick={() => setMenuOpen((v) => !v)} className="text-sm text-zinc-200" aria-expanded={menuOpen}>
              {menuOpen ? 'Close' : 'Menu'}
            </button>
          </div>
          <main className="px-4 md:px-8 py-8 max-w-[1400px]">{children}</main>
        </div>
      </div>
    </>
  );
}
