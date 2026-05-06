import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import type { ProductListItem } from '@/lib/types';
import {
  CATEGORY_META,
  TIER_BADGE,
  filterCatalog,
  getProductVisual,
  type CatalogCategory,
  type CatalogProduct,
} from '@/lib/catalog';
import { ProductTile } from '@/components/ProductTile';

function tierCountLabel(n: number): string {
  if (n === 1) return 'House Selection';
  if (n === 2) return 'Two Tiers';
  if (n === 3) return 'Three Tiers';
  return `${n} Tiers`;
}

export const revalidate = 120;

type SP = { category?: string; q?: string; region?: string };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const region = sp.region ?? 'GB';
  const activeCategory = (sp.category && sp.category in CATEGORY_META)
    ? (sp.category as CatalogCategory)
    : null;

  let apiItems: ProductListItem[] = [];
  let apiError: string | null = null;
  try {
    const qs = new URLSearchParams({ region, limit: '48' });
    if (sp.category) qs.set('category', sp.category);
    if (sp.q) qs.set('q', sp.q);
    const res = await apiFetch<{ data: ProductListItem[] }>(`/products?${qs}`, { revalidate: 120 });
    apiItems = res.data;
  } catch (e) {
    apiError = e instanceof Error ? e.message : 'Unknown error';
  }

  const useFallback = apiItems.length === 0;
  const fallbackItems = useFallback ? filterCatalog(sp.category, sp.q) : [];
  const totalCount = useFallback ? fallbackItems.length : apiItems.length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 text-white">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-6 mb-2">
        <div>
          <span className="gold-rule">The Full Range</span>
          <h1 className="text-5xl font-bold tracking-tight mt-4">Shop</h1>
          <p className="text-zinc-400 mt-2 text-sm">
            {totalCount} products · Shipping to {region}
          </p>
        </div>
        <form className="flex gap-2" action="/shop">
          {sp.category && <input type="hidden" name="category" value={sp.category} />}
          <input
            type="search"
            name="q"
            defaultValue={sp.q}
            placeholder="Search spices, blends, origins…"
            className="input-dark w-72"
          />
          <button className="btn-primary">Search</button>
        </form>
      </div>

      {/* Category nav */}
      <nav className="mt-10 mb-12 flex flex-wrap gap-2 border-b border-white/10 pb-6">
        <CategoryPill href="/shop" label="All" active={!activeCategory} />
        {(Object.keys(CATEGORY_META) as CatalogCategory[]).map((c) => (
          <CategoryPill
            key={c}
            href={`/shop?category=${c}`}
            label={CATEGORY_META[c].label}
            active={activeCategory === c}
          />
        ))}
      </nav>

      {apiError && useFallback && (
        <div className="glass-card p-4 text-zinc-400 text-xs mb-8">
          Showing the static catalog — the live API is offline. ({apiError.slice(0, 80)}…)
        </div>
      )}

      {totalCount === 0 ? (
        <div className="glass-card p-16 text-center text-zinc-400">
          No products match your filters.
          {sp.q && (
            <p className="mt-2">
              <Link href="/shop" className="text-amber-400 font-semibold hover:text-amber-300">
                Clear search
              </Link>
            </p>
          )}
        </div>
      ) : useFallback ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {fallbackItems.map((p) => (
            <CatalogCard key={p.slug} product={p} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {apiItems.map((p) => {
            const visual = getProductVisual({
              slug: p.slug,
              name: p.name,
              category: p.category?.slug ?? p.category?.name,
            });
            return (
              <Link key={p.id} href={`/product/${p.slug}`} className="block group">
                <ProductTile
                  visual={visual}
                  alt={p.name}
                  className="mb-4 group-hover:shadow-2xl group-hover:-translate-y-0.5 transition"
                />
                <h3 className="text-lg font-bold group-hover:text-amber-400">{p.name}</h3>
                {p.shortDesc && <p className="text-sm text-zinc-400 line-clamp-2 mt-1">{p.shortDesc}</p>}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CategoryPill({
  href, label, active,
}: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={
        active
          ? 'px-4 py-2 rounded-full bg-amber-500 text-amber-950 text-sm font-semibold shadow-amber'
          : 'px-4 py-2 rounded-full border border-white/15 text-sm font-medium text-zinc-300 hover:border-amber-400 hover:text-amber-400 transition'
      }
    >
      {label}
    </Link>
  );
}

function CatalogCard({ product }: { product: CatalogProduct }) {
  const categoryLabel = CATEGORY_META[product.category].label;
  return (
    <article className="block group">
      <div
        className={`gloss aspect-square rounded-2xl ${product.tone} ${product.ink} mb-4 shadow-xl ring-1 ring-white/10 overflow-hidden flex flex-col justify-between p-5 group-hover:shadow-2xl group-hover:-translate-y-0.5 transition`}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="text-[10px] tracking-[0.25em] uppercase opacity-85 leading-tight">
            {categoryLabel}
          </span>
          <span className="text-3xl drop-shadow leading-none">{product.icon}</span>
        </div>
        <div>
          <p className="text-[10px] tracking-[0.25em] uppercase opacity-80">
            {tierCountLabel(product.variants.length)}
          </p>
          <h3 className="text-2xl font-bold leading-tight mt-1 drop-shadow-sm">
            {product.name}
          </h3>
        </div>
      </div>

      <div className="px-1">
        <p className="text-sm text-zinc-300 line-clamp-2">{product.shortDesc}</p>
        <p className="text-[11px] tracking-[0.15em] uppercase text-amber-400 mt-2">
          {product.origin}
        </p>
        <ul className="mt-3 space-y-2.5">
          {product.variants.map((v, i) => (
            <li
              key={v.tier ?? `house-${i}`}
              className="border-t border-white/10 pt-2 first:border-t-0 first:pt-0"
            >
              <div className="flex items-center justify-between gap-3">
                {v.tier ? (
                  <span
                    className={`inline-flex items-center text-[10px] tracking-[0.18em] uppercase px-2 py-0.5 rounded-full border font-semibold ${TIER_BADGE[v.tier]}`}
                  >
                    {v.tier}
                  </span>
                ) : (
                  <span className="inline-flex items-center text-[10px] tracking-[0.18em] uppercase px-2 py-0.5 rounded-full border border-white/15 text-zinc-300 font-semibold">
                    House Selection
                  </span>
                )}
                {v.pack && <span className="text-[11px] text-zinc-500 tabular-nums">{v.pack}</span>}
              </div>
              <p className="text-xs text-zinc-400 mt-1 leading-snug">{v.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
