'use client';

import Link from 'next/link';

// Shown when the product could not be loaded (for example the API is down).
export default function ProductError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-xl mx-auto px-6 py-24 text-center text-white">
      <h1 className="text-3xl font-bold">We couldn’t load this product</h1>
      <p className="mt-4 text-zinc-400">Something went wrong on our side. Please try again in a moment.</p>
      <div className="mt-8 flex gap-3 justify-center">
        <button type="button" onClick={reset} className="btn-primary">Try again</button>
        <Link href="/shop" className="btn-ghost">Back to the shop</Link>
      </div>
    </div>
  );
}
