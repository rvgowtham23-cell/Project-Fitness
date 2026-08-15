const WEEKS = 12;
const DAYS = 7;
const INTENSITY_CLASSES = ['bg-neutral-100', 'bg-lime-200', 'bg-lime-400', 'bg-lime-600'];

// Deterministic pseudo-random demo intensities so the heatmap reads as realistic
// data without needing a backend. Swap the intensity source for real workout-count
// data from GET /progress/weekly once that endpoint is live.
function demoIntensity(week: number, day: number): number {
  return (week * 7 + day) % 4;
}

export function ConsistencyHeatmap() {
  return (
    <div className="flex gap-1 overflow-x-auto">
      {Array.from({ length: WEEKS }).map((_, week) => (
        <div key={week} className="flex flex-col gap-1">
          {Array.from({ length: DAYS }).map((_, day) => (
            <div key={day} className={`h-3.5 w-3.5 rounded-sm ${INTENSITY_CLASSES[demoIntensity(week, day)]}`} />
          ))}
        </div>
      ))}
    </div>
  );
}
