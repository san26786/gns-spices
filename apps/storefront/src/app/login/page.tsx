import Link from 'next/link';
import { LoginForm } from './login-form';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <div className="max-w-md mx-auto px-6 py-24 text-white">
      <span className="gold-rule">Welcome back</span>
      <h1 className="text-4xl font-bold tracking-tight mt-4 mb-8">Sign in</h1>
      <div className="glass-card p-6">
        <LoginForm next={next ?? '/account'} />
      </div>
      <p className="text-sm mt-6 text-zinc-400">
        New to GNS?{' '}
        <Link
          href={`/register${next ? `?next=${next}` : ''}`}
          className="text-amber-400 hover:text-amber-300 font-semibold"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
