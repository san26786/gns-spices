import type { ProductVisual } from '@/lib/catalog';

/** Renders a square product visual:
 *  - If `visual.image` is set, shows the real product photo.
 *  - Otherwise, draws a "powder pile + spice on top" composition using
 *    the spice's pile colour and emoji icon, on a dark backdrop.
 *
 *  Use `size="card"` (default) for grid cards, or `size="detail"` for the
 *  hero image on a product page. */
export function ProductTile({
  visual,
  size = 'card',
  className = '',
  alt = '',
}: {
  visual: ProductVisual;
  size?: 'card' | 'detail';
  className?: string;
  alt?: string;
}) {
  const radius = size === 'detail' ? 'rounded-3xl' : 'rounded-2xl';
  const iconSize = size === 'detail' ? 'text-[10rem]' : 'text-7xl';
  const iconTop = size === 'detail' ? 'top-[20%]' : 'top-[22%]';

  // Real product photo path
  if (visual.image) {
    return (
      <div className={`relative aspect-square ${radius} overflow-hidden ring-1 ring-white/10 shadow-xl bg-black ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={visual.image}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  // Powder-pile fallback — radial gradient bottom-up in spice color, top
  // spotlight, and emoji floating above the pile.
  const pileBg = `
    radial-gradient(ellipse 80% 55% at 50% 100%, ${visual.pile} 0%, ${visual.pile} 18%, transparent 75%),
    radial-gradient(circle at 50% 18%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 55%),
    radial-gradient(circle at 50% 105%, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 30%),
    linear-gradient(180deg, #050505 0%, #0E0E0E 80%, #050505 100%)
  `;

  return (
    <div
      className={`relative aspect-square ${radius} overflow-hidden ring-1 ring-white/10 shadow-xl ${className}`}
      style={{ background: pileBg }}
    >
      {/* The whole spice / icon, floating above the pile peak */}
      <span
        aria-hidden
        className={`absolute ${iconTop} left-1/2 -translate-x-1/2 ${iconSize} drop-shadow-2xl select-none`}
        style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.55))' }}
      >
        {visual.icon}
      </span>
      {/* Subtle inner shadow at the bottom for depth */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 100% at 50% 100%, rgba(0,0,0,0.5) 0%, transparent 70%)' }}
      />
    </div>
  );
}
