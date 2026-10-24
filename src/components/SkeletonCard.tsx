export default function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-line bg-card p-3">
      <div className="aspect-[4/5] animate-pulse rounded-2xl bg-card-2" />
      <div className="space-y-3 px-2 pt-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-card-2" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-card-2" />
        <div className="h-8 w-full animate-pulse rounded bg-card-2" />
      </div>
    </div>
  );
}
