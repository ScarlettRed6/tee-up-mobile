import { Skeleton } from './ui/skeleton';

export default function PageLoadingSkeleton({
  titleWidth = 'w-48',
  subtitleWidth = 'w-80',
  rows = 8,
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className={`h-8 ${titleWidth}`} />
        <Skeleton className={`h-4 ${subtitleWidth}`} />
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-4">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-64" />
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-4">
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          {Array.from({ length: rows }).map((_, idx) => (
            <Skeleton key={idx} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
