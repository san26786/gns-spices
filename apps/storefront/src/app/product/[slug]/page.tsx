import Link from 'next/link';
import { notFound } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/api';
import { CATALOG, CATEGORY_META, TIER_BADGE, getProductVisual, type CatalogProduct } from '@/lib/catalog';
import { ProductTile } from '@/components/ProductTile';
import { fmtMoney, fmtPack } from '@/lib/format';
import type { ProductDetail, ProductListItem } from '@/lib/types';
import { Gallery } from './gallery';
import { ProductPurchase, type Delivery, type ProductPack } from './purchase';

export const revalidate = 60;

const REGION = 'GB';

interface PacksResponse {
  region: string;
  delivery: Delivery | null;
  packs: ProductPack[];
}

type RelatedPack = { unitPrice: string | null; currency: string | null };

const countryName = (code: string | null) => {
  if (!code) return null;
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) ?? code;
  } catch {
    return code;
  }
};

async function loadProduct(slug: string) {
  try {
    return await apiFetch<ProductDetail>(`/products/${encodeURIComponent(slug)}?region=${REGION}`, { revalidate: 60 });
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e; // shown by error.tsx
  }
}

async function loadPacks(slug: string): Promise<PacksResponse | null> {
  try {
    return await apiFetch<PacksResponse>(`/pricing/products/${encodeURIComponent(slug)}/packs?region=${REGION}`, { revalidate: 60 });
  } catch {
    return null;
  }
}

async function loadRelated(product: ProductDetail, entry: CatalogProduct | undefined) {
  // Same shelf as the Shop page when the product is listed there, otherwise the database category.
  let items: { slug: string; name: string; category?: string; blurb: string | null }[] = [];
  if (entry) {
    items = CATALOG.filter((p) => p.category === entry.category && p.slug !== entry.slug).map((p) => ({
      slug: p.slug, name: p.name, category: p.category, blurb: p.shortDesc,
    }));
  } else if (product.category) {
    try {
      const res = await apiFetch<{ data: ProductListItem[] }>(
        `/products?region=${REGION}&category=${encodeURIComponent(product.category.slug)}&limit=9`,
        { revalidate: 120 },
      );
      items = res.data.filter((p) => p.slug !== product.slug).map((p) => ({
        slug: p.slug, name: p.name, category: p.category?.slug, blurb: p.shortDesc,
      }));
    } catch {
      items = [];
    }
  }
  items = items.slice(0, 8);
  if (!items.length) return [];

  let packs: Record<string, RelatedPack[]> = {};
  try {
    packs = (await apiFetch<{ data: Record<string, RelatedPack[]> }>(`/pricing/shop-packs?region=${REGION}`, { revalidate: 120 })).data;
  } catch {
    /* related products still show without prices */
  }
  return items.map((p) => {
    const priced = (packs[p.slug] ?? []).filter((x) => x.unitPrice != null);
    const from = priced.length ? Math.min(...priced.map((x) => Number(x.unitPrice))) : null;
    return { ...p, from, currency: priced[0]?.currency ?? 'GBP', visual: getProductVisual({ slug: p.slug, name: p.name, category: p.category }) };
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await loadProduct(slug).catch(() => null);
  return product
    ? { title: `${product.name} — GNS Spices`, description: product.shortDesc ?? undefined }
    : { title: 'Product not found — GNS Spices' };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) notFound();

  const entry = CATALOG.find((p) => p.slug === product.slug);
  const [packsRes, related] = await Promise.all([loadPacks(product.slug), loadRelated(product, entry)]);

  const visual = getProductVisual({
    slug: product.slug,
    name: product.name,
    category: product.category?.slug ?? product.category?.name,
  });
  // Product photo first, then any uploaded product media that is already a URL.
  const images = [
    ...(visual.image ? [visual.image] : []),
    ...product.media.filter((m) => m.kind === 'image' && /^(https?:\/\/|\/)/.test(m.s3Key)).map((m) => m.s3Key),
  ].filter((v, i, a) => a.indexOf(v) === i);

  const origin = countryName(product.originCountry);
  const shelf = entry ? CATEGORY_META[entry.category] : null;
  const packs = packsRes?.packs ?? product.variants.map((v) => ({
    id: v.id, sku: v.sku, label: v.label, weightGrams: v.weightGrams, packaging: v.packaging,
    unitPrice: null, baseUnitPrice: null, currency: null, stock: null,
  }));
  const barcodes = new Map(product.variants.map((v) => [v.id, v.barcode]));

  const header = (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
        {shelf?.label ?? product.category?.name ?? product.brand}
        {origin && ` · Origin: ${origin}`}
      </p>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-2 leading-tight">{product.name}</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Brand: <span className="text-zinc-200">{product.brand}</span>
      </p>
      {product.shortDesc && <p className="mt-4 text-zinc-300 leading-relaxed">{product.shortDesc}</p>}
      {product.region.certifications.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {product.region.certifications.map((c) => (
            <span key={c} className="text-xs px-3 py-1 rounded-full border border-emerald-400/40 text-emerald-300 bg-emerald-500/10">
              {c}
            </span>
          ))}
        </div>
      )}
    </>
  );

  const specs: [string, React.ReactNode][] = [
    ['Brand', product.brand],
    ...(shelf ? [['Range', shelf.label] as [string, string]] : product.category ? [['Category', product.category.name] as [string, string]] : []),
    ...(origin ? [['Country of origin', origin] as [string, string]] : []),
    ...(entry?.origin ? [['Origin detail', entry.origin] as [string, string]] : []),
    ['Product code', <span key="sku" className="font-mono">{product.skuRoot}</span>],
    ...(packs.length
      ? [[
          'Packs',
          <ul key="packs" className="space-y-0.5">
            {packs.map((p) => (
              <li key={p.id}>
                {fmtPack(p.weightGrams, p.packaging, p.label)} <span className="text-zinc-500 font-mono text-xs">· {p.sku}{barcodes.get(p.id) ? ` · EAN ${barcodes.get(p.id)}` : ''}</span>
              </li>
            ))}
          </ul>,
        ] as [string, React.ReactNode]]
      : []),
  ];

  const details = (
    <>
      {entry && entry.variants.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold mb-3 text-amber-400">About this item</h2>
          <ul className="space-y-3">
            {entry.variants.map((v, i) => (
              <li key={v.tier ?? `house-${i}`} className="flex gap-3 items-start">
                {v.tier ? (
                  <span className={`flex-shrink-0 inline-flex items-center text-[10px] tracking-[0.18em] uppercase px-2 py-0.5 rounded-full border font-semibold ${TIER_BADGE[v.tier]}`}>
                    {v.tier}
                  </span>
                ) : (
                  <span className="flex-shrink-0 inline-flex items-center text-[10px] tracking-[0.18em] uppercase px-2 py-0.5 rounded-full border border-white/15 text-zinc-300 font-semibold">
                    House Selection
                  </span>
                )}
                <span className="text-sm text-zinc-300">
                  {v.description}
                  {v.pack && <span className="text-zinc-500"> · {v.pack}</span>}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {product.longDesc && (
        <section className="mt-8">
          <h2 className="text-xl font-bold mb-3 text-amber-400">Description</h2>
          <p className="text-zinc-300 leading-relaxed whitespace-pre-line">{product.longDesc}</p>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3 text-amber-400">Specifications</h2>
        <dl className="glass-card divide-y divide-white/5 text-sm">
          {specs.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 px-4 py-2.5">
              <dt className="text-zinc-400">{k}</dt>
              <dd className="text-zinc-200 min-w-0 break-words">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {product.region.ingredients && (
        <section className="mt-8">
          <h2 className="text-xl font-bold mb-3 text-amber-400">Ingredients</h2>
          <p className="text-zinc-300 text-sm">{product.region.ingredients}</p>
        </section>
      )}

      {product.region.allergenInfo && (
        <section className="mt-8">
          <h2 className="text-xl font-bold mb-3 text-amber-400">Allergen info</h2>
          <p className="text-zinc-300 text-sm">{product.region.allergenInfo}</p>
        </section>
      )}
    </>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 text-white">
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-zinc-400">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/shop" className="hover:text-amber-400">Shop</Link></li>
          {entry && shelf && (
            <>
              <li aria-hidden>›</li>
              <li><Link href={`/shop?category=${entry.category}`} className="hover:text-amber-400">{shelf.label}</Link></li>
            </>
          )}
          <li aria-hidden>›</li>
          <li className="text-zinc-300 truncate max-w-[60vw]" aria-current="page">{product.name}</li>
        </ol>
      </nav>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-[minmax(0,5fr)_minmax(0,5fr)_minmax(0,3fr)] items-start">
        <div className="lg:row-span-2 self-stretch">
          <div className="md:sticky md:top-28">
          <Gallery name={product.name} visual={visual} images={images} />
          </div>
        </div>
        <ProductPurchase
          slug={product.slug}
          name={product.name}
          image={visual.image ?? null}
          packs={packs}
          delivery={packsRes?.delivery ?? null}
          pricesUnavailable={!packsRes}
          header={header}
          details={details}
        />
      </div>

      {related.length > 0 && (
        <section className="mt-16 pt-10 border-t border-white/10" aria-labelledby="related-heading">
          <h2 id="related-heading" className="text-2xl font-bold mb-6">Related products</h2>
          <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={`/product/${r.slug}`} className="block group">
                  <ProductTile visual={r.visual} alt={r.name} className="mb-3 group-hover:shadow-2xl group-hover:-translate-y-0.5 transition" />
                  <h3 className="text-base font-bold leading-tight text-white group-hover:text-amber-400 transition">{r.name}</h3>
                  {r.blurb && <p className="text-sm text-zinc-400 line-clamp-2 mt-1">{r.blurb}</p>}
                  <p className="mt-1.5 text-sm font-semibold text-amber-400 tabular-nums">
                    {r.from != null ? `From ${fmtMoney(r.from, r.currency)}` : <span className="text-zinc-500 font-normal">Price on request</span>}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
