interface MacroBarProps {
  label: string;
  currentG: number;
  targetG: number;
  colorClassName?: string;
}

export function MacroBar({ label, currentG, targetG, colorClassName = 'bg-lime-500' }: MacroBarProps) {
  const pct = targetG > 0 ? Math.min(100, Math.round((currentG / targetG) * 100)) : 0;

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span className="font-medium text-charcoal-800">{label}</span>
        <span className="text-neutral-500">
          {Math.round(currentG)}g / {Math.round(targetG)}g
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
        <div className={`h-full rounded-full ${colorClassName}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
