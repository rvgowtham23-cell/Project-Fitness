import type { ReactNode } from 'react';

interface BannerProps {
  tone?: 'info' | 'error';
  children: ReactNode;
}

export function Banner({ tone = 'info', children }: BannerProps) {
  const toneClasses =
    tone === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-lime-200 bg-lime-50 text-charcoal-700';

  return <div className={`mb-6 rounded-xl border px-4 py-3 text-sm ${toneClasses}`}>{children}</div>;
}
