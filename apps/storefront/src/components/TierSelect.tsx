'use client';

import { useState } from 'react';
import { TIER_BADGE, type CatalogVariant } from '@/lib/catalog';

/** A product's grade tiers as one dropdown, so every shop card is the same height. */
export function TierSelect({ slug, name, variants }: { slug: string; name: string; variants: CatalogVariant[] }) {
  const [index, setIndex] = useState(0);
  const v = variants[index] ?? variants[0];
  if (!v) return null;
  const label = v.tier ?? 'House Selection';
  const tone = v.tier ? TIER_BADGE[v.tier] : 'border-white/15 text-zinc-300';

  return (
    <div>
      <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        {variants.length > 1 ? (
          <>
            <label className="sr-only" htmlFor={`tier-${slug}`}>Tier for {name}</label>
            <select
              id={`tier-${slug}`}
              value={index}
              onChange={(e) => setIndex(Number(e.target.value))}
              className={`w-full min-w-0 sm:w-auto sm:flex-1 h-6 rounded-full border px-2.5 py-0 text-[10px] tracking-[0.18em] uppercase font-semibold outline-none cursor-pointer ${tone}`}
            >
              {variants.map((t, i) => (
                <option key={t.tier ?? `house-${i}`} value={i}>{t.tier ?? 'House Selection'}</option>
              ))}
            </select>
          </>
        ) : (
          <span className={`inline-flex h-6 items-center text-[10px] tracking-[0.18em] uppercase px-2 py-0.5 rounded-full border font-semibold ${tone}`}>
            {label}
          </span>
        )}
        {v.pack && <span className="shrink-0 text-[11px] text-zinc-500 tabular-nums">{v.pack}</span>}
      </div>
      <p className="text-xs text-zinc-400 mt-1.5 leading-snug line-clamp-1">{v.description}</p>
    </div>
  );
}
