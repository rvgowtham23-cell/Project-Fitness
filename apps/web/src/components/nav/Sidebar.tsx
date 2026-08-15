'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/nutrition', label: 'Nutrition' },
  { href: '/workouts', label: 'Workouts' },
  { href: '/progress', label: 'Progress' },
  { href: '/coach', label: 'Coach' },
  { href: '/profile', label: 'Profile' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-charcoal-900 px-4 py-6 text-neutral-300 lg:flex">
      <div className="mb-8 px-2">
        <span className="text-lg font-bold text-white">
          Fit<span className="text-lime-500">Track</span>
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active ? 'bg-charcoal-800 text-lime-400' : 'hover:bg-charcoal-800 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-2 text-xs text-neutral-500">v0.1.0 &middot; MVP scaffold</div>
    </aside>
  );
}
