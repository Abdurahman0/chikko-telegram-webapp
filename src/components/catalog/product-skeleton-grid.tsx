export function ProductSkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-3xl bg-surface p-3">
          <div className="h-32 rounded-2xl bg-surface-accent" />
          <div className="mt-3 h-3 rounded bg-surface-accent" />
          <div className="mt-2 h-3 w-3/4 rounded bg-surface-accent" />
          <div className="mt-4 h-9 rounded-2xl bg-surface-accent" />
        </div>
      ))}
    </div>
  );
}
