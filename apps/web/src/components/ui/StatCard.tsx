interface StatCardProps {
  label: string;
  value: string;
  sublabel?: string;
  accent?: boolean;
}

export function StatCard({ label, value, sublabel, accent }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${accent ? 'text-lime-600' : 'text-charcoal-900'}`}>{value}</p>
      {sublabel ? <p className="mt-1 text-xs text-neutral-500">{sublabel}</p> : null}
    </div>
  );
}
