export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-12 text-center">
      <p className="text-sm text-neutral-500">{message}</p>
    </div>
  );
}
