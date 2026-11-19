import { CATALOG, getProductVisual } from '@/lib/catalog';
import { CartView } from './cart-view';

export const metadata = { title: 'Your cart — GNS Spices', robots: { index: false, follow: false } };

export default function CartPage() {
  // Product photos are found on the server (they are read from /public/products),
  // so hand the client a slug → photo map for the cart lines.
  const images: Record<string, string> = {};
  for (const p of CATALOG) {
    const image = getProductVisual({ slug: p.slug, name: p.name, category: p.category }).image;
    if (image) images[p.slug] = image;
  }
  return <CartView images={images} />;
}
