import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { getProductVisual } from '@/lib/catalog';
import { ProductTile } from '@/components/ProductTile';
import type { ProductListItem } from '@/lib/types';

export const revalidate = 300;

export default async function HomePage() {
  let featured: ProductListItem[] = [];
  try {
    const res = await apiFetch<{ data: ProductListItem[] }>(`/products?region=GB&limit=6`, {
      revalidate: 300,
    });
    featured = res.data;
  } catch {
    // API not yet seeded — render an empty state rather than crash the marketing page.
  }

  return (
    <div className="text-white">
      {/* HERO — dark moody backdrop with amber accent */}
      <section className="relative overflow-hidden hero-backdrop">
        <div className="absolute inset-0 bg-black/30" aria-hidden />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" aria-hidden />

        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-32 md:pt-32 md:pb-40 grid md:grid-cols-2 gap-16 items-center">
          <div className="animate-fade-in">
            <p className="brand-mark mb-6">GNSSPICES</p>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] text-white drop-shadow-lg animate-fade-in-delayed">
              Premium spices,
              <span className="block text-amber-400">honest blends.</span>
            </h1>
            <p className="mt-7 text-lg md:text-xl text-zinc-300 max-w-xl leading-relaxed animate-fade-in-delayed-2">
              Hand-picked from our farms in Kerala, Tamil Nadu and Rajasthan. Slow-roasted in small batches. Shipped to chefs, retailers, and home cooks across 28 countries.
            </p>
            <div className="mt-10 flex flex-wrap gap-3 animate-fade-in-delayed-2">
              <Link href="/shop" className="btn-primary">Shop the range</Link>
              <Link href="/b2b" className="btn-ghost">For businesses</Link>
            </div>
            <div className="mt-12 flex items-center gap-6 text-[10px] tracking-[0.3em] uppercase text-zinc-500">
              <span>FSSAI</span>
              <span className="w-px h-4 bg-white/15" />
              <span>ISO 22000</span>
              <span className="w-px h-4 bg-white/15" />
              <span>Halal · Kosher</span>
            </div>
          </div>

          {/* Hero visual — glossy spice tile mosaic on glass */}
          <div className="relative h-[460px] md:h-[560px] animate-fade-in-delayed-2">
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-3 p-3 glass-card">
              <div className="gloss rounded-2xl bg-spice-turmeric col-span-2 row-span-2 shadow-xl ring-1 ring-white/10 overflow-hidden flex items-end p-5">
                <div>
                  <p className="text-[10px] tracking-[0.3em] uppercase text-spice-maroon/80">Single Origin</p>
                  <p className="font-bold text-2xl text-spice-maroon">Turmeric</p>
                  <p className="text-xs text-spice-maroon/70">Erode, Tamil Nadu</p>
                </div>
              </div>
              <div className="gloss rounded-2xl bg-spice-cardamom shadow-xl ring-1 ring-white/10 overflow-hidden flex items-end p-4">
                <p className="font-bold text-white text-lg leading-tight drop-shadow">
                  Green Chilli<br />
                  <span className="text-[10px] tracking-[0.3em] uppercase opacity-90">Bhavnagri</span>
                </p>
              </div>
              <div className="gloss rounded-2xl bg-spice-saffron shadow-xl ring-1 ring-white/10 overflow-hidden flex items-end p-4">
                <p className="font-bold text-spice-maroon text-lg leading-tight">
                  Saffron<br />
                  <span className="text-[10px] tracking-[0.3em] uppercase opacity-70">Kashmir</span>
                </p>
              </div>
              <div className="gloss rounded-2xl bg-spice-red shadow-xl ring-1 ring-white/10 overflow-hidden flex items-end p-4">
                <p className="font-bold text-white text-lg leading-tight drop-shadow">
                  Red Chilli<br />
                  <span className="text-[10px] tracking-[0.3em] uppercase opacity-95">Guntur</span>
                </p>
              </div>
              <div className="gloss rounded-2xl bg-spice-pepper shadow-xl ring-1 ring-white/10 overflow-hidden flex items-end col-span-2 p-5">
                <div>
                  <p className="text-[10px] tracking-[0.3em] uppercase text-amber-400">Signature Blend No. 7</p>
                  <p className="font-bold text-2xl text-white leading-tight">Black Pepper Garam Masala</p>
                  <p className="text-xs text-zinc-400">Tellicherry · stone-milled</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gns-bg via-black/60 to-transparent pointer-events-none" aria-hidden />
      </section>

      {/* TRUST STRIP */}
      <section className="border-y border-white/5 bg-black/60">
        <div className="max-w-7xl mx-auto px-6 py-7 grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-sm">
          <TrustItem label="100% Pure" sub="No fillers, no colour" />
          <TrustItem label="Lab-Tested" sub="Every single batch" />
          <TrustItem label="Direct Trade" sub="From 230+ farmers" />
          <TrustItem label="Family Owned" sub="Three generations" />
        </div>
      </section>

      {/* SHOP BY CATEGORY */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <span className="gold-rule">Our Range</span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mt-5">Shop by category</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <CategoryCard
            href="/shop?category=powders"
            title="Pure Powders"
            blurb="Turmeric, chilli, coriander & more"
            tone="bg-spice-turmeric"
            ink="text-spice-maroon"
          />
          <CategoryCard
            href="/shop?category=masalas"
            title="Signature Masalas"
            blurb="Garam, biryani, tandoori, kitchen king"
            tone="bg-spice-red"
            ink="text-white"
          />
          <CategoryCard
            href="/shop?category=seeds"
            title="Whole Seeds"
            blurb="Mustard & cumin for tempering"
            tone="bg-spice-cardamom"
            ink="text-white"
          />
          <CategoryCard
            href="/shop?category=whole"
            title="Whole Spices"
            blurb="Tellicherry pepper, bay leaves"
            tone="bg-spice-pepper"
            ink="text-white"
          />
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="border-y border-white/5 bg-black/40">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <span className="gold-rule">Bestsellers</span>
              <h2 className="text-4xl font-bold tracking-tight mt-5">From our shelves</h2>
            </div>
            <Link href="/shop" className="text-sm font-semibold text-amber-400 hover:text-amber-300">
              View all →
            </Link>
          </div>
          {featured.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {featured.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          ) : (
            <div className="glass-card p-12 text-center text-zinc-400">
              Catalog is being set up. Visit{' '}
              <Link href="/shop" className="text-amber-400 hover:text-amber-300 underline">/shop</Link>{' '}
              to browse the full range.
            </div>
          )}
        </div>
      </section>

      {/* OUR STORY */}
      <section className="max-w-7xl mx-auto px-6 py-28 grid md:grid-cols-2 gap-16 items-center">
        <div className="order-2 md:order-1">
          <span className="gold-rule">Our Story</span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mt-5 leading-tight">
            From a single sack of pepper to a family of spices.
          </h2>
          <p className="mt-7 text-zinc-300 leading-relaxed text-lg">
            Our grandfather started GNS with one sack of Malabar black pepper and a borrowed scale. Three generations later, we still source from the same hill villages — only now we ship to 28 countries, blend for Michelin kitchens, and quietly stand behind a dozen private-label brands you already know.
          </p>
          <p className="mt-4 text-zinc-400 leading-relaxed">
            Every spice we sell is traceable to a farm. Every blend is recorded by name and number, the way Grandfather did it. Some things shouldn&apos;t change.
          </p>
          <Link href="/about" className="inline-block mt-8 font-semibold text-amber-400 hover:text-amber-300">
            Read the full story →
          </Link>
        </div>
        <div className="gloss order-1 md:order-2 relative h-[460px] rounded-3xl overflow-hidden bg-gradient-to-br from-spice-maroon via-spice-crimson to-spice-red shadow-2xl ring-1 ring-white/10">
          <div className="absolute inset-0 paper opacity-50" aria-hidden />
          <div className="absolute inset-0 flex flex-col justify-end p-10 text-white">
            <p className="text-2xl md:text-3xl font-bold leading-tight">
              &ldquo;Pure spice doesn&apos;t need a sales pitch. It needs a fair price and an honest scale.&rdquo;
            </p>
            <p className="mt-5 text-xs tracking-[0.3em] uppercase text-amber-400">
              — G. N. Subramanian, Founder
            </p>
          </div>
        </div>
      </section>

      {/* RECIPES TEASER */}
      <section className="border-y border-white/5 bg-black/40">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
            <div>
              <span className="gold-rule">From Our Kitchen</span>
              <h2 className="text-4xl font-bold tracking-tight mt-5">Recipes worth the simmer</h2>
            </div>
            <p className="max-w-md text-zinc-400 text-sm">
              Slow recipes our family makes on Sundays — written down for the first time, with the masalas that bring them to life.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <RecipeCard
              title="Kerala Chicken Curry"
              meta="45 min · Serves 4"
              tone="from-spice-chili via-spice-red to-spice-maroon"
              spice="Garam Masala No. 7"
            />
            <RecipeCard
              title="Slow-Cooked Chana"
              meta="2 hr · Serves 6"
              tone="from-spice-leaf via-spice-cardamom to-spice-pepper"
              spice="Green Chana Masala"
            />
            <RecipeCard
              title="Saffron Rice Pulao"
              meta="35 min · Serves 4"
              tone="from-spice-saffron via-spice-turmeric to-spice-chili"
              spice="Kashmiri Saffron"
            />
          </div>
        </div>
      </section>

      {/* CHANNELS CTA */}
      <section className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-6">
        <ChannelCard
          title="Wholesale & B2B"
          body="Tiered pricing, credit terms, and a dedicated account manager. From restaurants to national retail chains."
          href="/b2b"
          tone="bg-gradient-to-br from-spice-leaf via-spice-cardamom to-spice-pepper"
          tag="For trade"
        />
        <ChannelCard
          title="Private Label"
          body="Launch your own spice range. We handle sourcing, blending, packaging, and compliance — your brand, our craft."
          href="/private-label"
          tone="bg-gradient-to-br from-spice-chili via-spice-red to-spice-maroon"
          tag="Build your brand"
        />
      </section>

      {/* NEWSLETTER — matches the live coming-soon page styling */}
      <section className="border-t border-white/5 bg-black/60">
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <span className="gold-rule">Stay in the kitchen</span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-5">
            Recipes, harvest notes &amp; member-only batches.
          </h2>
          <p className="mt-4 text-zinc-400">
            One letter a month. Never spam. Unsubscribe whenever the soup&apos;s on.
          </p>
          <form className="mt-10 flex flex-col sm:flex-row gap-3 max-w-md mx-auto" action="#" method="post">
            <input
              type="email"
              required
              placeholder="Enter your email"
              className="input-dark flex-1"
            />
            <button type="submit" className="btn-primary">Notify Me</button>
          </form>
          <p className="text-xs text-zinc-500 mt-4">Be the first to know about new harvests &amp; member batches.</p>
        </div>
      </section>
    </div>
  );
}

function TrustItem({ label, sub }: { label: string; sub: string }) {
  return (
    <div>
      <p className="text-base font-bold text-amber-400">{label}</p>
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mt-1">{sub}</p>
    </div>
  );
}

function CategoryCard({
  href, title, blurb, tone, ink,
}: { href: string; title: string; blurb: string; tone: string; ink: string }) {
  return (
    <Link
      href={href}
      className={`gloss ${tone} ${ink} rounded-2xl p-7 block aspect-[4/5] overflow-hidden flex flex-col justify-between hover:-translate-y-1 transition shadow-xl hover:shadow-2xl ring-1 ring-white/10`}
    >
      <span className="text-[10px] tracking-[0.3em] uppercase opacity-80">Category</span>
      <div>
        <h3 className="text-2xl font-bold leading-tight drop-shadow-sm">{title}</h3>
        <p className="text-sm opacity-90 mt-2">{blurb}</p>
        <span className="inline-block mt-4 text-sm font-semibold underline underline-offset-4">
          Explore →
        </span>
      </div>
    </Link>
  );
}

function ChannelCard({
  title, body, href, tone, tag,
}: { title: string; body: string; href: string; tone: string; tag: string }) {
  return (
    <Link
      href={href}
      className={`gloss ${tone} text-white rounded-3xl p-10 md:p-12 block hover:opacity-95 transition shadow-2xl ring-1 ring-white/10 overflow-hidden`}
    >
      <span className="text-[10px] tracking-[0.3em] uppercase opacity-85">{tag}</span>
      <h3 className="text-3xl md:text-4xl font-bold tracking-tight mt-3">{title}</h3>
      <p className="opacity-90 max-w-md mt-4 leading-relaxed">{body}</p>
      <span className="inline-block mt-8 font-semibold underline underline-offset-4">
        Learn more →
      </span>
    </Link>
  );
}

function RecipeCard({
  title, meta, tone, spice,
}: { title: string; meta: string; tone: string; spice: string }) {
  return (
    <div className="glass-card overflow-hidden hover:border-amber-400/30 transition">
      <div className={`gloss h-48 bg-gradient-to-br ${tone} relative overflow-hidden`}>
        <span className="absolute top-4 left-4 text-[10px] tracking-[0.3em] uppercase text-white bg-black/40 backdrop-blur px-2.5 py-1 rounded-full z-10">
          {spice}
        </span>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-xs tracking-[0.15em] uppercase text-zinc-500 mt-2">{meta}</p>
      </div>
    </div>
  );
}

function ProductCard({ p }: { p: ProductListItem }) {
  const visual = getProductVisual({
    slug: p.slug,
    name: p.name,
    category: p.category?.slug ?? p.category?.name,
  });
  return (
    <Link href={`/product/${p.slug}`} className="block group">
      <ProductTile
        visual={visual}
        alt={p.name}
        className="mb-4 group-hover:shadow-amber group-hover:-translate-y-0.5 transition"
      />
      <h3 className="text-lg font-bold group-hover:text-amber-400">{p.name}</h3>
      {p.previewVariant && (
        <p className="text-sm text-zinc-400 mt-1">
          {p.previewVariant.weightGrams >= 1000
            ? `${p.previewVariant.weightGrams / 1000}kg`
            : `${p.previewVariant.weightGrams}g`}
          {' · '}
          {p.previewVariant.packaging}
        </p>
      )}
    </Link>
  );
}
