import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-charcoal-950 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-lime-600">Fit Track</p>
          <h1 className="mt-2 text-2xl font-bold text-charcoal-900">Welcome back</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Sign in to review your nutrition and training data.
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
