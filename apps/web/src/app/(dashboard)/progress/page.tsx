'use client';

import { useState } from 'react';
import { LineTrend } from '@/components/charts/LineTrend';
import { ConsistencyHeatmap } from '@/components/charts/ConsistencyHeatmap';
import { Banner } from '@/components/ui/Banner';
import { useApiData } from '@/lib/use-api-data';
import { getProgressWeekly } from '@/lib/api-client';

const RANGES = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: '90d', label: '90 days' },
  { key: '6mo', label: '6 months' },
  { key: '1yr', label: '1 year' },
] as const;

type RangeKey = (typeof RANGES)[number]['key'];

const DEMO_WEIGHT_TREND: Record<RangeKey, { label: string; value: number }[]> = {
  daily: [
    { label: 'Mon', value: 78.4 }, { label: 'Tue', value: 78.2 }, { label: 'Wed', value: 78.3 },
    { label: 'Thu', value: 78.0 }, { label: 'Fri', value: 77.9 }, { label: 'Sat', value: 77.8 }, { label: 'Sun', value: 77.6 },
  ],
  weekly: [
    { label: 'W1', value: 79.5 }, { label: 'W2', value: 79.0 }, { label: 'W3', value: 78.6 }, { label: 'W4', value: 77.6 },
  ],
  monthly: [
    { label: 'Apr', value: 82 }, { label: 'May', value: 80.5 }, { label: 'Jun', value: 79 }, { label: 'Jul', value: 77.6 },
  ],
  '90d': [
    { label: 'Month 1', value: 82 }, { label: 'Month 2', value: 79.5 }, { label: 'Month 3', value: 77.6 },
  ],
  '6mo': [
    { label: 'Feb', value: 86 }, { label: 'Mar', value: 84 }, { label: 'Apr', value: 82 },
    { label: 'May', value: 80.5 }, { label: 'Jun', value: 79 }, { label: 'Jul', value: 77.6 },
  ],
  '1yr': [
    { label: 'Aug', value: 90 }, { label: 'Oct', value: 87 }, { label: 'Dec', value: 85 },
    { label: 'Feb', value: 83 }, { label: 'Apr', value: 81 }, { label: 'Jun', value: 78.5 }, { label: 'Jul', value: 77.6 },
  ],
};

export default function ProgressPage() {
  const [range, setRange] = useState<RangeKey>('weekly');
  const progressState = useApiData(() => getProgressWeekly(), []);
  const usingDemoData = Boolean(progressState.error);

  return (
    <div>
      <h1 className="text-2xl font-bold text-charcoal-900">Progress</h1>
      <p className="mt-1 text-sm text-neutral-500">Long-term trends across weight and training consistency.</p>

      {usingDemoData ? (
        <Banner>
          Showing sample trends — wired to <code>GET /progress/weekly</code> and{' '}
          <code>GET /progress/weight-history</code>.
        </Banner>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2">
        {RANGES.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={`rounded-full border border-neutral-200 px-4 py-1.5 text-sm font-medium transition-colors ${
              range === r.key ? 'bg-charcoal-900 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">Weight trend</h2>
          <LineTrend data={DEMO_WEIGHT_TREND[range]} />
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">Workout consistency</h2>
          <ConsistencyHeatmap />
          <p className="mt-3 text-xs text-neutral-400">Last 12 weeks &middot; darker = more sessions logged</p>
        </div>
      </div>
    </div>
  );
}
