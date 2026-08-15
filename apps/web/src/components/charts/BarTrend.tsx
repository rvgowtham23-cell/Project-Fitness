// Scaffolding placeholder only. Swap for Recharts (`npm install recharts`) once
// dependencies are installed — its <ResponsiveContainer><BarChart> maps directly
// onto the `{ label, value }[]` shape used here.
interface BarTrendProps {
  data: { label: string; value: number }[];
  maxValue?: number;
}

export function BarTrend({ data, maxValue }: BarTrendProps) {
  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex h-40 items-end gap-3">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-32 w-full items-end">
            <div
              className="w-full rounded-t-md bg-lime-500/80 transition-all"
              style={{ height: `${Math.max(4, Math.round((d.value / max) * 100))}%` }}
              title={`${d.label}: ${d.value}`}
            />
          </div>
          <span className="text-xs text-neutral-500">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
