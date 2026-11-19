'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ProductTile } from '@/components/ProductTile';
import type { ProductVisual } from '@/lib/catalog';

/** Main product image with a thumbnail strip. Thumbnails only show when there is more than one image. */
export function Gallery({ name, visual, images }: { name: string; visual: ProductVisual; images: string[] }) {
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <div className="flex flex-col-reverse md:flex-row gap-3 md:gap-4">
      {images.length > 1 && (
        <ul className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible" aria-label="Product images">
          {images.map((src, i) => (
            <li key={src} className="flex-shrink-0">
              <button
                type="button"
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                aria-label={`Show image ${i + 1} of ${images.length}`}
                aria-current={i === active}
                className={`relative block w-16 h-16 rounded-lg overflow-hidden bg-white ring-2 transition ${
                  i === active ? 'ring-amber-400' : 'ring-white/10 hover:ring-amber-400/60'
                }`}
              >
                <Image src={src} alt="" fill sizes="64px" className="object-contain p-1" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex-1 min-w-0">
        <ProductTile visual={{ ...visual, image: current ?? visual.image }} size="detail" alt={name} />
      </div>
    </div>
  );
}
