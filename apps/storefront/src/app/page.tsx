import Image from 'next/image';
import Link from 'next/link';
import { NewsletterForm } from '@/components/NewsletterForm';
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
              <PhotoTile src="/home/hero-turmeric.webp" alt="GNS ground turmeric pouch and jar with fresh turmeric roots" className="col-span-2 row-span-2" priority />
              <PhotoTile src="/home/hero-green-chilli.webp" alt="GNS green chilli pickle jar with fresh chillies" />
              <PhotoTile src="/home/hero-saffron.webp" alt="GNS Kashmiri saffron box with saffron threads" />
              <PhotoTile src="/home/hero-red-chilli.webp" alt="GNS ground Byadgi chilli pouch with red chilli powder" />
              <PhotoTile src="/home/hero-garam-masala.webp" alt="GNS black pepper and garam masala jars on a wooden table" className="col-span-2" />
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
            image="/home/cat-pure-powders.webp"
            blurb="Turmeric, chilli, coriander & more"
            tone="bg-spice-turmeric"
            ink="text-spice-maroon"
          />
          <CategoryCard
            href="/shop?category=masalas"
            title="Signature Masalas"
            image="/home/cat-signature-masalas.webp"
            blurb="Garam, biryani, tandoori, kitchen king"
            tone="bg-spice-red"
            ink="text-white"
          />
          <CategoryCard
            href="/shop?category=seeds"
            title="Whole Seeds"
            image="/home/cat-whole-seeds.webp"
            blurb="Mustard & cumin for tempering"
            tone="bg-spice-cardamom"
            ink="text-white"
          />
          <CategoryCard
            href="/shop?category=whole"
            title="Whole Spices"
            image="/home/cat-whole-spices.webp"
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
        <div className="order-1 md:order-2 relative aspect-[584/540] min-h-[440px] rounded-3xl overflow-hidden bg-spice-maroon shadow-2xl ring-1 ring-white/10">
          <Image src="/home/our-story.webp" alt="Whole spices, chillies and cinnamon in wooden bowls on a red background" fill sizes="(min-width: 768px) 600px, 100vw" className="object-cover object-bottom" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/20 to-transparent" aria-hidden />
          <span aria-hidden className="absolute top-2 right-6 font-serif text-8xl leading-none text-amber-500/30 select-none">&rdquo;</span>
          <div className="absolute inset-0 flex flex-col justify-start p-8 md:p-10 text-white">
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
              image="/home/recipe-kerala-chicken-curry.webp"
              meta="45 min · Serves 4"
              tone="from-spice-chili via-spice-red to-spice-maroon"
              spice="Garam Masala No. 7"
            />
            <RecipeCard
              title="Slow-Cooked Chana"
              image="/home/recipe-slow-cooked-chana.webp"
              meta="2 hr · Serves 6"
              tone="from-spice-leaf via-spice-cardamom to-spice-pepper"
              spice="Green Chana Masala"
            />
            <RecipeCard
              title="Saffron Rice Pulao"
              image="/home/recipe-saffron-rice-pulao.webp"
              meta="35 min · Serves 4"
              tone="from-spice-saffron via-spice-turmeric to-spice-chili"
              spice="Kashmiri Saffron"
            />
          </div>
        </div>
      </section>

      {/* CHANNELS CTA */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <span className="gold-rule mb-10">For Trade</span>
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
        <ChannelCard
          title="Wholesale & B2B"
          image="/home/channel-wholesale.webp"
          body="Tiered pricing, credit terms, and a dedicated account manager. From restaurants to national retail chains."
          href="/b2b"
          tone="bg-gradient-to-br from-spice-leaf via-spice-cardamom to-spice-pepper"
          tag="For trade"
        />
        <ChannelCard
          title="Private Label"
          image="/home/channel-private-label.webp"
          body="Launch your own spice range. We handle sourcing, blending, packaging, and compliance — your brand, our craft."
          href="/private-label"
          tone="bg-gradient-to-br from-spice-chili via-spice-red to-spice-maroon"
          tag="Build your brand"
        />
        </div>
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
          <NewsletterForm />
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

/** Photo with a dark gradient so overlaid text stays readable. */
function PhotoTile({
  src, alt, className = '', priority, children,
}: { src: string; alt: string; className?: string; priority?: boolean; children?: React.ReactNode }) {
  return (
    <div className={`relative rounded-2xl overflow-hidden shadow-xl ring-1 ring-white/10 bg-spice-pepper flex items-end p-4 md:p-5 ${className}`}>
      <Image src={src} alt={alt} fill sizes="(min-width: 768px) 400px, 66vw" className="object-cover" priority={priority} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" aria-hidden />
      <div className="relative">{children}</div>
    </div>
  );
}

function CategoryCard({
  href, title, blurb, image,
}: { href: string; title: string; blurb: string; tone?: string; ink?: string; image: string }) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-3xl overflow-hidden border border-white/10 bg-[#121212] text-white shadow-xl transition duration-300 hover:border-amber-500/70 hover:-translate-y-1 hover:shadow-2xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image src={image} alt="" fill sizes="(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
      </div>
      <div className="flex flex-1 flex-col px-5 sm:px-6 pt-5 pb-6">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-500">Category</span>
        <h3 className="mt-2 text-xl font-bold leading-tight">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">{blurb}</p>
        <span className="mt-auto pt-4 inline-flex items-center gap-2 text-sm font-bold">
          Explore
          <svg viewBox="0 0 24 24" className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

function ChannelCard({
  title, body, href, image,
}: { title: string; body: string; href: string; tone?: string; tag?: string; image: string }) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-3xl overflow-hidden border border-white/10 bg-[#0d0d0d] text-white shadow-2xl transition duration-300 hover:border-amber-500/60 hover:-translate-y-1"
    >
      <div className="relative aspect-[604/296] overflow-hidden">
        <Image src={image} alt="" fill sizes="(min-width: 768px) 640px, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
      </div>
      <div className="flex flex-1 flex-col px-6 md:px-7 pt-5 pb-6">
        <span aria-hidden className="block w-12 h-px bg-white/20" />
        <h3 className="mt-4 text-2xl font-bold tracking-tight leading-tight">{title}</h3>
        <p className="mt-2.5 text-zinc-400 text-sm md:text-base leading-relaxed">{body}</p>
        <span className="mt-auto pt-4 inline-flex items-center gap-2.5 text-sm md:text-base">
          <span className="underline underline-offset-4 decoration-1">Learn more</span>
          <span aria-hidden className="transition-transform group-hover:translate-x-1">⟶</span>
        </span>
      </div>
    </Link>
  );
}

function RecipeCard({
  title, meta, spice, image,
}: { title: string; meta: string; tone?: string; spice: string; image: string }) {
  return (
    <div className="group rounded-3xl overflow-hidden border border-white/10 bg-[#121212] text-white shadow-xl transition duration-300 hover:border-amber-500/60 hover:-translate-y-1">
      <div className="relative aspect-[2/1] overflow-hidden bg-spice-pepper">
        <Image src={image} alt={title} fill sizes="(min-width: 768px) 400px, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
      </div>
      <div className="px-6 pt-5 pb-6">
        <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-amber-500">{spice}</p>
        <h3 className="mt-2.5 text-xl font-bold leading-tight">{title}</h3>
        <p className="mt-3 flex flex-wrap items-center gap-x-3 text-[11px] font-semibold tracking-[0.18em] uppercase text-zinc-500">
          {meta.split('·').map((part, i) => (
            <span key={i} className="inline-flex items-center gap-3">
              {i > 0 && <span aria-hidden className="w-1 h-1 rounded-full bg-zinc-600" />}
              {part.trim()}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
