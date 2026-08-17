// The onboarding date-of-birth field is still a raw text input (see the TODO in
// app/onboarding/basic-info.tsx to swap it for a real date picker) — this at least rejects
// shapes like "1998-22-09" (valid \d{4}-\d{2}-\d{2} shape, invalid month) before they ever
// reach Postgres, which errors on out-of-range date/time fields rather than validating them.
export function isValidIsoDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const [, yearStr, monthStr, dayStr] = match;
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}
