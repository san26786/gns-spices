import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0b0503] via-[#120904] to-[#1a0d05] text-white">
      {/* Background Glow */}
      <div className="absolute left-[-150px] top-10 h-[500px] w-[500px] rounded-full bg-amber-500/20 blur-[180px]" />
      <div className="absolute bottom-0 right-[-150px] h-[450px] w-[450px] rounded-full bg-red-700/10 blur-[180px]" />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 md:py-32 lg:grid-cols-2">
        {/* Left Content */}
        <div className="animate-fade-in">
          <p className="mb-6 text-xs font-semibold tracking-[0.4em] text-yellow-400">
            GNSSPICES
          </p>

          <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-white drop-shadow-lg md:text-7xl">
            Premium spices,
            <br />
            <span className="bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent">
              honest blends.
            </span>
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-relaxed text-zinc-300 md:text-xl">
            Hand-picked from our farms in Kerala, Tamil Nadu and Rajasthan.
            Slow-roasted in small batches. Shipped to chefs, retailers, and
            home cooks across 28 countries.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/shop"
              className="rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-600 px-8 py-4 font-bold text-black shadow-[0_10px_40px_rgba(255,190,0,0.35)] transition-transform duration-300 hover:scale-105"
            >
              Shop the range
            </Link>

            <Link
              href="/B2B"
              className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 font-semibold backdrop-blur-xl transition-colors duration-300 hover:bg-white/10"
            >
              For businesses
            </Link>
          </div>

          <div className="mt-12 flex items-center gap-6 text-[10px] uppercase tracking-[0.3em] text-zinc-500">
            <span>FSSAI</span>
            <span className="h-4 w-px bg-white/15" />
            <span>ISO 22000</span>
            <span className="h-4 w-px bg-white/15" />
            <span>Halal · Kosher</span>
          </div>
        </div>

        {/* Right Grid */}
        <div className="rounded-[36px] border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-4 shadow-[0_20px_80px_rgba(255,180,0,0.12)] backdrop-blur-xl">
          <div className="grid h-[550px] grid-cols-3 gap-4">
            {/* Main Image */}
            <div className="relative col-span-2 row-span-2 overflow-hidden rounded-[30px]">
              <Image
                src="/single-origin-turmeric.png"
                alt="Single origin turmeric"
                fill
                priority
                sizes="(max-width: 1024px) 66vw, 420px"
                className="object-cover transition-transform duration-500 hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            </div>

            {/* Green Chilli */}
            <div className="relative overflow-hidden rounded-[30px]">
              <Image
                src="/green-chilli-bhavnagri.png"
                alt="Green chilli"
                fill
                sizes="(max-width: 1024px) 33vw, 200px"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Saffron */}
            <div className="relative overflow-hidden rounded-[30px]">
              <Image
                src="/saffron-kashmir.png"
                alt="Kashmir saffron"
                fill
                sizes="(max-width: 1024px) 33vw, 200px"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Red Chilli */}
            <div className="relative overflow-hidden rounded-[30px]">
              <Image
                src="/red-chilli-guntur.png"
                alt="Guntur red chilli"
                fill
                sizes="(max-width: 1024px) 33vw, 200px"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Black Pepper */}
            <div className="relative col-span-2 overflow-hidden rounded-[30px]">
              <Image
                src="/black-pepper-garam-masala.png"
                alt="Black pepper garam masala"
                fill
                sizes="(max-width: 1024px) 66vw, 420px"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}