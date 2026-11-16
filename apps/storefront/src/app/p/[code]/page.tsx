import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { lookupCode } from '@/lib/codes';

// Target of every printed QR code: https://www.gnsspices.com/p/<CODE>.
// Resolved on each scan, so the destination follows whatever is in the database.
export const dynamic = 'force-dynamic';

export const metadata = { robots: { index: false, follow: false } };

export default async function ScanPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const hit = await lookupCode(decodeURIComponent(code));
  if (!hit) notFound();

  if (hit.product.isActive) redirect(`/product/${hit.product.slug}`);

  return (
    <div className="max-w-xl mx-auto px-6 py-24 text-center text-white">
      <p className="brand-mark">GNS Spices</p>
      <h1 className="text-3xl font-bold mt-4">{hit.product.name} is no longer available</h1>
      <p className="mt-4 text-zinc-300">
        This product has been retired from our range. Have a look at what we stock today.
      </p>
      <Link href="/shop" className="btn-primary mt-8">Shop the range</Link>
      <p className="mt-6 text-xs text-zinc-500">Code {hit.code}</p>
    </div>
  );
}
