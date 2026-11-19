'use client';

// Shop-wide cart state.
//
// Two backends behind one hook:
//  - Signed out ("guest"): lines live in localStorage, so the cart survives a
//    refresh. Prices come from the API's price lists when the pack is added.
//  - Signed in ("server"): the API cart (/v1/cart) is the source of truth. It
//    is what checkout reads, it re-prices every line and it follows the
//    shopper across devices.
// When a guest signs in, their local lines are added to the server cart once
// and the local copy is cleared, so nothing is lost or double-counted.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { api } from '@/lib/admin-api';
import type { CartResponse, PriceResponse } from '@/lib/types';
import { fmtMoney, fmtPack } from '@/lib/format';

const STORAGE_KEY = 'gns.cart.v1';
const REGION = 'GB';

export interface CartLine {
  variantId: string;
  sku: string;
  slug: string;
  name: string;
  /** Pack name, e.g. "Home Kitchen · 100g" or "100g · jar". */
  packLabel: string;
  qty: number;
  unitPrice: number;
  currency: string;
  image?: string | null;
  /** Server cart line id (signed-in carts only). */
  itemId?: string;
}

/** What a caller needs to add a pack. `unitPrice` is optional; it is looked up when missing. */
export interface AddInput {
  variantId: string;
  sku: string;
  slug: string;
  name: string;
  packLabel: string;
  image?: string | null;
  unitPrice?: number | null;
  currency?: string | null;
}

type Mode = 'loading' | 'guest' | 'server';

interface CartContextValue {
  mode: Mode;
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  currency: string;
  /** Variant id currently being changed, for disabling buttons. */
  busy: string | null;
  error: string | null;
  add: (input: AddInput, qty?: number) => Promise<boolean>;
  setQty: (variantId: string, qty: number) => Promise<void>;
  remove: (variantId: string) => Promise<void>;
  clearError: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export { fmtMoney, fmtPack };

function readGuest(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (l): l is CartLine =>
        !!l && typeof l.variantId === 'string' && typeof l.qty === 'number' && l.qty > 0 && typeof l.unitPrice === 'number',
    );
  } catch {
    return [];
  }
}

function writeGuest(lines: CartLine[]) {
  try {
    if (lines.length) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage blocked (private mode) — cart still works for this visit */
  }
}

function fromServer(cart: CartResponse, previous: CartLine[]): CartLine[] {
  const images = new Map(previous.map((l) => [l.variantId, l.image]));
  return cart.items.map((it) => ({
    variantId: it.variantId,
    sku: it.sku,
    slug: it.productSlug,
    name: it.productName,
    packLabel: fmtPack(it.weightGrams, it.packaging, it.label),
    qty: it.qty,
    unitPrice: Number(it.unitPrice),
    currency: cart.currency,
    image: images.get(it.variantId) ?? null,
    itemId: it.id,
  }));
}

function friendly(e: unknown): string {
  const err = e as { code?: string; message?: string };
  if (err.code?.startsWith('no_price') || err.message?.startsWith('no_price')) {
    return 'This pack is not on sale online yet. Contact us to order it.';
  }
  return err.message || 'Something went wrong. Please try again.';
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mode, setMode] = useState<Mode>('loading');
  const [lines, setLines] = useState<CartLine[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const linesRef = useRef(lines);
  linesRef.current = lines;
  const modeRef = useRef(mode);
  modeRef.current = mode;

  // Work out who is shopping and load the right cart. Runs on first load and
  // on every navigation, so signing in or out switches the cart over.
  const sync = useCallback(async () => {
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/partner-strategy')) return;
    try {
      let cart = await api.get<CartResponse>('/cart');
      const guest = readGuest();
      if (guest.length) {
        for (const l of guest) {
          try {
            cart = await api.post<CartResponse>('/cart/items', { variantId: l.variantId, qty: l.qty });
          } catch {
            /* a pack that is no longer on sale is skipped */
          }
        }
        writeGuest([]);
      }
      setLines(fromServer(cart, [...linesRef.current, ...guest]));
      setMode('server');
    } catch (e) {
      const status = (e as { status?: number }).status;
      if (status !== 401 && modeRef.current === 'server') return; // keep showing the server cart on a blip
      setLines(readGuest());
      setMode('guest');
    }
  }, [pathname]);

  useEffect(() => {
    void sync();
  }, [sync]);

  // Keep several open tabs in step for guests.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && modeRef.current === 'guest') setLines(readGuest());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const updateGuest = useCallback((next: CartLine[]) => {
    setLines(next);
    writeGuest(next);
  }, []);

  const add = useCallback(
    async (input: AddInput, qty = 1) => {
      setError(null);
      setBusy(input.variantId);
      try {
        if (modeRef.current === 'server') {
          const cart = await api.post<CartResponse>('/cart/items', { variantId: input.variantId, qty });
          setLines(fromServer(cart, [...linesRef.current, { ...input, qty, unitPrice: 0, currency: '' }]));
          return true;
        }

        let unitPrice = input.unitPrice ?? null;
        let currency = input.currency ?? null;
        if (unitPrice == null || !currency) {
          const p = await api.get<PriceResponse>(`/pricing/variants/${input.variantId}?qty=1&region=${REGION}`);
          unitPrice = Number(p.unitPrice);
          currency = p.currency;
        }

        const current = readGuest();
        const existing = current.find((l) => l.variantId === input.variantId);
        const next = existing
          ? current.map((l) => (l.variantId === input.variantId ? { ...l, qty: l.qty + qty, unitPrice, currency: currency! } : l))
          : [
              ...current,
              {
                variantId: input.variantId,
                sku: input.sku,
                slug: input.slug,
                name: input.name,
                packLabel: input.packLabel,
                image: input.image ?? null,
                qty,
                unitPrice,
                currency: currency!,
              },
            ];
        updateGuest(next);
        if (modeRef.current === 'loading') setMode('guest');
        return true;
      } catch (e) {
        setError(friendly(e));
        return false;
      } finally {
        setBusy(null);
      }
    },
    [updateGuest],
  );

  const remove = useCallback(
    async (variantId: string) => {
      setError(null);
      setBusy(variantId);
      try {
        if (modeRef.current === 'server') {
          const line = linesRef.current.find((l) => l.variantId === variantId);
          if (!line?.itemId) return;
          const cart = await api.del<CartResponse>(`/cart/items/${line.itemId}`);
          setLines(fromServer(cart, linesRef.current));
        } else {
          updateGuest(readGuest().filter((l) => l.variantId !== variantId));
        }
      } catch (e) {
        setError(friendly(e));
      } finally {
        setBusy(null);
      }
    },
    [updateGuest],
  );

  const setQty = useCallback(
    async (variantId: string, qty: number) => {
      if (qty < 1) return remove(variantId);
      setError(null);
      setBusy(variantId);
      try {
        if (modeRef.current === 'server') {
          const line = linesRef.current.find((l) => l.variantId === variantId);
          if (!line?.itemId) return;
          const cart = await api.patch<CartResponse>(`/cart/items/${line.itemId}`, { qty });
          setLines(fromServer(cart, linesRef.current));
        } else {
          updateGuest(readGuest().map((l) => (l.variantId === variantId ? { ...l, qty } : l)));
        }
      } catch (e) {
        setError(friendly(e));
      } finally {
        setBusy(null);
      }
    },
    [remove, updateGuest],
  );

  const value = useMemo<CartContextValue>(() => {
    const itemCount = lines.reduce((n, l) => n + l.qty, 0);
    const subtotal = Math.round(lines.reduce((s, l) => s + l.unitPrice * l.qty, 0) * 100) / 100;
    return {
      mode,
      lines,
      itemCount,
      subtotal,
      currency: lines[0]?.currency || 'GBP',
      busy,
      error,
      add,
      setQty,
      remove,
      clearError: () => setError(null),
    };
  }, [mode, lines, busy, error, add, setQty, remove]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
