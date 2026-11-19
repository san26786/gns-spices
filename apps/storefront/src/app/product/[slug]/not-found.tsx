import Link from 'next/link';

export default function ProductNotFound() {
  return (
    <div className="max-w-xl mx-auto px-6 py-24 text-center text-white">
      <h1 className="text-3xl font-bold">Product not found</h1>
      <p className="mt-4 text-zinc-400">This product doesn’t exist or is no longer available.</p>
      <Link href="/shop" className="btn-primary mt-8">Browse the shop</Link>
    </div>
  );
}
