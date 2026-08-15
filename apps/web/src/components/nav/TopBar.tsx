'use client';

import { useAuth } from '@/components/auth/AuthProvider';

export function TopBar() {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 lg:px-10">
      <div className="text-lg font-bold text-charcoal-900 lg:hidden">
        Fit<span className="text-lime-600">Track</span>
      </div>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-4">
        <span className="text-sm text-neutral-600">{user?.email || 'Signed in'}</span>
        <button
          onClick={() => logout()}
          className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-charcoal-800 transition-colors hover:bg-neutral-100"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
