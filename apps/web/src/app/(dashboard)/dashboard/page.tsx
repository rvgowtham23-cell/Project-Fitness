'use client';

import { useMemo } from 'react';
import type { DailyNutritionSummary, NutritionTargets } from '@fitness/shared-types';
import { StatCard } from '@/components/ui/StatCard';
import { MacroBar } from '@/components/ui/MacroBar';
import { Banner } from '@/components/ui/Banner';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { BarTrend } from '@/components/charts/BarTrend';
import { useApiData } from '@/lib/use-api-data';
import { getDailyNutrition, getNutritionTargets } from '@/lib/api-client';

const DEMO_TARGETS: NutritionTargets = {
  calorieTarget: 2200,
  proteinTargetG: 140,
  carbTargetG: 230,
  fatTargetG: 70,
  fiberTargetG: 30,
  waterTargetMl: 2500,
};

const DEMO_SUMMARY: DailyNutritionSummary = {
  summaryDate: new Date().toISOString().slice(0, 10),
  totalCalories: 1640,
  totalProteinG: 98,
  totalCarbsG: 172,
  totalFatG: 52,
  totalFiberG: 18,
  totalWaterMl: 1500,
  targetCalories: DEMO_TARGETS.calorieTarget,
  targetProteinG: DEMO_TARGETS.proteinTargetG,
  mealCount: 3,
};

const DEMO_TREND = [
  { label: 'Mon', value: 2100 },
  { label: 'Tue', value: 1950 },
  { label: 'Wed', value: 2260 },
  { label: 'Thu', value: 1800 },
  { label: 'Fri', value: 2050 },
  { label: 'Sat', value: 2400 },
  { label: 'Sun', value: 1640 },
];

export default function DashboardPage() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const summaryState = useApiData(() => getDailyNutrition(today), [today]);
  const targetsState = useApiData(() => getNutritionTargets(), []);

  const loading = summaryState.loading || targetsState.loading;
  const usingDemoData = Boolean(summaryState.error || targetsState.error);
  const summary = summaryState.data ?? DEMO_SUMMARY;
  const targets = targetsState.data ?? DEMO_TARGETS;

  if (loading) {
    return <LoadingSpinner label="Loading today's summary..." />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-charcoal-900">Today&apos;s overview</h1>
      <p className="mt-1 text-sm text-neutral-500">{summary.summaryDate}</p>

      {usingDemoData ? (
        <Banner>
          Showing sample data — the API server isn&apos;t reachable yet. Data-fetching is wired to{' '}
          <code>GET /nutrition/daily</code> and <code>GET /profile/targets</code>.
        </Banner>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Calories"
          value={`${summary.totalCalories}`}
          sublabel={`of ${summary.targetCalories} kcal target`}
          accent
        />
        <StatCard
          label="Protein"
          value={`${summary.totalProteinG}g`}
          sublabel={`of ${summary.targetProteinG}g target`}
        />
        <StatCard label="Meals logged" value={`${summary.mealCount}`} sublabel="today" />
        <StatCard
          label="Water"
          value={`${(summary.totalWaterMl / 1000).toFixed(1)}L`}
          sublabel={`of ${(targets.waterTargetMl / 1000).toFixed(1)}L target`}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Macros vs. target
          </h2>
          <div className="space-y-4">
            <MacroBar label="Protein" currentG={summary.totalProteinG} targetG={targets.proteinTargetG} colorClassName="bg-lime-500" />
            <MacroBar label="Carbs" currentG={summary.totalCarbsG} targetG={targets.carbTargetG} colorClassName="bg-charcoal-700" />
            <MacroBar label="Fat" currentG={summary.totalFatG} targetG={targets.fatTargetG} colorClassName="bg-neutral-400" />
            <MacroBar label="Fiber" currentG={summary.totalFiberG} targetG={targets.fiberTargetG} colorClassName="bg-lime-700" />
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Calories — last 7 days
          </h2>
          <BarTrend data={DEMO_TREND} />
        </div>
      </div>
    </div>
  );
}
