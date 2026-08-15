// Scaffolding placeholder only. Swap for Recharts <LineChart>/<ResponsiveContainer>
// once dependencies are installed — the `{ label, value }[]` shape carries over directly.
interface LineTrendProps {
  data: { label: string; value: number }[];
  height?: number;
}

export function LineTrend({ data, height = 160 }: LineTrendProps) {
  const width = 600;
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = (i / Math.max(1, data.length - 1)) * width;
    const y = height - ((d.value - min) / range) * (height - 20) - 10;
    return { x, y };
  });

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-40 w-full min-w-[400px]" preserveAspectRatio="none">
        <polyline
          points={points.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke="#B6FF3C"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <circle key={data[i].label} cx={p.x} cy={p.y} r={4} fill="#121316" stroke="#B6FF3C" strokeWidth={2} />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-xs text-neutral-500">
        {data.map((d) => (
          <span key={d.label}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}
