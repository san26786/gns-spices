import Link from 'next/link';
import { ForgotPasswordForm } from './forgot-password-form';

export default function ForgotPasswordPage() {
  return (
    <div className="max-w-md mx-auto px-6 py-24 text-white">
      <span className="gold-rule">Password reset</span>
      <h1 className="text-4xl font-bold tracking-tight mt-4 mb-8">Forgot your password?</h1>
      <div className="glass-card p-6">
        <ForgotPasswordForm />
      </div>
      <p className="text-sm mt-6 text-zinc-400">
        Remembered it?{' '}
        <Link href="/login" className="text-amber-400 hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
