import { notFound } from 'next/navigation';
import { apiFetch, money } from '@/lib/api';
import { getProductVisual } from '@/lib/catalog';
import { ProductTile } from '@/components/ProductTile';
import type { PriceResponse, ProductDetail } from '@/lib/types';
import { AddToCart } from './add-to-cart';

export const revalidate = 60;

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let product: ProductDetail | null = null;
  try {
    product = await apiFetch<ProductDetail>(`/products/${slug}?region=GB`, { revalidate: 60 });
  } catch (e: any) {
    if (e?.status === 404) notFound();
    throw e;
  }
  if (!product) notFound();

  const primaryVariant = product.variants[0];
  let pricing: PriceResponse | null = null;
  if (primaryVariant) {
    try {
      pricing = await apiFetch<PriceResponse>(
        `/pricing/variants/${primaryVariant.id}?qty=1&region=GB`,
        { revalidate: 60 },
      );
    } catch { /* no price for region, render without */ }
  }

  const visual = getProductVisual({
    slug: product.slug,
    name: product.name,
    category: product.category?.slug ?? product.category?.name,
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-14 text-white">
      <div>
        <ProductTile visual={visual} size="detail" alt={product.name} />
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
          {product.category?.name ?? product.brand}
          {product.originCountry && ` · Origin: ${product.originCountry}`}
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mt-3">{product.name}</h1>
        {product.shortDesc && <p className="mt-4 text-zinc-300 leading-relaxed">{product.shortDesc}</p>}

        {pricing && (
          <div className="mt-7 flex items-baseline gap-3">
            <span className="text-4xl font-bold text-amber-400">{money(pricing.unitPrice, pricing.currency)}</span>
            {pricing.baseUnitPrice !== pricing.unitPrice && (
              <span className="text-zinc-500 line-through">{money(pricing.baseUnitPrice, pricing.currency)}</span>
            )}
          </div>
        )}

        {product.variants.length > 0 && (
          <AddToCart variants={product.variants} currency={pricing?.currency ?? 'GBP'} slug={product.slug} />
        )}

        {product.region.certifications.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {product.region.certifications.map((c) => (
              <span key={c} className="text-xs px-3 py-1 rounded-full border border-emerald-400/40 text-emerald-300 bg-emerald-500/10">
                {c}
              </span>
            ))}
          </div>
        )}

        {product.longDesc && (
          <section className="mt-12">
            <h3 className="text-xl font-bold mb-3 text-amber-400">About</h3>
            <p className="text-zinc-300 leading-relaxed whitespace-pre-line">{product.longDesc}</p>
          </section>
        )}

        {product.region.ingredients && (
          <section className="mt-8">
            <h3 className="text-xl font-bold mb-3 text-amber-400">Ingredients</h3>
            <p className="text-zinc-300 text-sm">{product.region.ingredients}</p>
          </section>
        )}

        {product.region.allergenInfo && (
          <section className="mt-8">
            <h3 className="text-xl font-bold mb-3 text-amber-400">Allergen info</h3>
            <p className="text-zinc-300 text-sm">{product.region.allergenInfo}</p>
          </section>
        )}

        {pricing?.ladder && pricing.ladder.length > 1 && (
          <section className="mt-12 glass-card p-5">
            <h3 className="text-xl font-bold mb-4 text-amber-400">Quantity pricing</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-zinc-400">
                  <th className="py-2">Quantity</th>
                  <th className="py-2">Unit price</th>
                </tr>
              </thead>
              <tbody>
                {pricing.ladder.map((tier) => (
                  <tr key={tier.minQty} className="border-b border-white/5">
                    <td className="py-2 text-zinc-300">{tier.minQty}+</td>
                    <td className="py-2 text-white font-semibold">{money(tier.unitPrice, tier.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </div>
  );
}
