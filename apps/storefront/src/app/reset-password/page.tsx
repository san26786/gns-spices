import { Suspense } from 'react';
import Link from 'next/link';
import { ResetPasswordForm } from './reset-password-form';

export const dynamic = 'force-dynamic';

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="max-w-md mx-auto px-6 py-24 text-white">
      <span className="gold-rule">Choose a new password</span>
      <h1 className="text-4xl font-bold tracking-tight mt-4 mb-8">Reset password</h1>
      <div className="glass-card p-6">
        {token ? (
          <Suspense fallback={<div className="text-zinc-400">Loading…</div>}>
            <ResetPasswordForm token={token} />
          </Suspense>
        ) : (
          <p className="text-zinc-300">
            This link is missing its token. Please open the link exactly as it appeared in your email.
          </p>
        )}
      </div>
      <p className="text-sm mt-6 text-zinc-400">
        <Link href="/forgot-password" className="text-amber-400 hover:underline">Request a new reset link</Link>
      </p>
    </div>
  );
}
