import Link from 'next/link';
import {
  CATEGORY_META,
  TIER_BADGE,
  filterCatalog,
  getProductVisual,
  type CatalogCategory,
  type CatalogProduct,
} from '@/lib/catalog';
import { ProductTile } from '@/components/ProductTile';
import { ShopAddToCart, type ShopPack } from '@/components/ShopAddToCart';
import { apiFetch } from '@/lib/api';

/** Packs and prices from the API, keyed by product slug. Empty if the API is down. */
async function loadPacks(region: string): Promise<Record<string, ShopPack[]>> {
  try {
    const res = await apiFetch<{ data: Record<string, ShopPack[]> }>(
      `/pricing/shop-packs?region=${encodeURIComponent(region)}`,
      { revalidate: 120 },
    );
    return res.data;
  } catch {
    return {};
  }
}

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

  // Shop renders straight from the static catalog — that's the real product
  // list we ship. The API (when up) is used for cart/orders/auth, not catalog.
  const items = filterCatalog(sp.category, sp.q);
  const totalCount = items.length;
  const packs = await loadPacks(region);

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
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((p) => (
            <CatalogCard key={p.slug} product={p} packs={packs[p.slug]} />
          ))}
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

function CatalogCard({ product, packs }: { product: CatalogProduct; packs?: ShopPack[] }) {
  const categoryLabel = CATEGORY_META[product.category].label;
  const visual = getProductVisual({
    slug: product.slug,
    name: product.name,
    category: product.category,
  });
  return (
    <article className="group flex flex-col">
      {/* Photo, name and details open the product page. Add to cart sits outside the link so it never navigates. */}
      <Link href={`/product/${product.slug}`} className="flex-1 flex flex-col">
      <ProductTile
        visual={visual}
        alt={product.name}
        className="mb-4 group-hover:shadow-2xl group-hover:-translate-y-0.5 transition"
      />

      <div className="px-1 flex-1 flex flex-col">
        <p className="text-[10px] tracking-[0.25em] uppercase text-zinc-500">{categoryLabel}</p>
        <h3 className="text-xl font-bold leading-tight text-white mt-1 group-hover:text-amber-400 transition">
          {product.name}
        </h3>
        <p className="text-sm text-zinc-400 line-clamp-2 mt-1.5">{product.shortDesc}</p>
        <p className="text-[11px] tracking-[0.15em] uppercase text-amber-400 mt-2">
          {product.origin}
        </p>
        <p className="text-[10px] tracking-[0.25em] uppercase text-zinc-500 mt-3 mb-1.5">
          {tierCountLabel(product.variants.length)}
        </p>
        <ul className="space-y-2">
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
      </Link>
      {packs && (
        <div className="px-1">
          <ShopAddToCart slug={product.slug} name={product.name} image={visual.image ?? null} packs={packs} />
        </div>
      )}
    </article>
  );
}
