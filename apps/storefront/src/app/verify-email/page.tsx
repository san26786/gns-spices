import Link from 'next/link';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; reason?: string }>;
}) {
  const { status, reason } = await searchParams;
  const ok = status === 'ok';
  const missing = status === 'missing';
  const failed = status === 'fail' || (!ok && !missing && !!status);

  return (
    <div className="max-w-md mx-auto px-6 py-24 text-white">
      <span className="gold-rule">Email verification</span>
      <h1 className="text-4xl font-bold tracking-tight mt-4 mb-8">
        {ok ? 'Email confirmed.' : missing ? 'Missing token.' : failed ? 'Link not valid.' : 'Check your inbox.'}
      </h1>
      <div className="glass-card p-6">
        {ok && (
          <>
            <p className="text-zinc-300">Thanks — your email address is confirmed. You&apos;re good to go.</p>
            <Link href="/account" className="btn-primary mt-6 inline-flex">Go to my account →</Link>
          </>
        )}
        {missing && (
          <p className="text-zinc-300">The verification link is missing a token. Please open the link from your email exactly as sent.</p>
        )}
        {failed && (
          <>
            <p className="text-zinc-300">{reason ?? 'This verification link is no longer valid.'}</p>
            <Suspense fallback={null}>
              <ResendCard />
            </Suspense>
          </>
        )}
        {!status && (
          <p className="text-zinc-300">We&apos;ve sent a verification link to your email. Please click it to activate your account.</p>
        )}
      </div>
    </div>
  );
}

function ResendCard() {
  return (
    <p className="mt-6 text-sm text-zinc-400">
      Need a new link? <Link href="/login" className="text-amber-400 hover:underline">Sign in</Link> and we&apos;ll re-send it, or <Link href="/register" className="text-amber-400 hover:underline">create an account</Link>.
    </p>
  );
}
