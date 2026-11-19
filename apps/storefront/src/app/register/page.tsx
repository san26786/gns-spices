import { Suspense } from 'react';
import { RegisterForm } from './register-form';

export default function RegisterPage() {
  return (
    <div className="max-w-md mx-auto px-6 py-24 text-white">
      <span className="gold-rule">Join the family</span>
      <h1 className="text-4xl font-bold tracking-tight mt-4 mb-8">Create an account</h1>
      <div className="glass-card p-6">
        <Suspense fallback={<div className="text-zinc-400">Loading…</div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
