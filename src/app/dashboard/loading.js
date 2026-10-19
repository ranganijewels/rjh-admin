import { Skeleton } from "@/components/common/ui/skeleton";

/**
 * Route-level loading UI.
 *
 * Shown while a dashboard segment is being fetched or compiled, so the
 * layout does not jump when the real content arrives.
 */
export default function DashboardLoading() {
  return (
    <div className="space-y-5 lg:space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[124px] rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-xl" />
      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}
