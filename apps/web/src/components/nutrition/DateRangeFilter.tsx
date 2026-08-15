'use client';

interface DateRange {
  from: string;
  to: string;
}

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  return (
    <div className="flex items-end gap-3 rounded-xl border border-neutral-200 bg-white p-3">
      <label className="flex flex-col text-xs font-medium text-neutral-500">
        From
        <input
          type="date"
          value={value.from}
          onChange={(e) => onChange({ ...value, from: e.target.value })}
          className="mt-1 rounded-md border border-neutral-300 px-2 py-1 text-sm text-charcoal-900"
        />
      </label>
      <label className="flex flex-col text-xs font-medium text-neutral-500">
        To
        <input
          type="date"
          value={value.to}
          onChange={(e) => onChange({ ...value, to: e.target.value })}
          className="mt-1 rounded-md border border-neutral-300 px-2 py-1 text-sm text-charcoal-900"
        />
      </label>
    </div>
  );
}
