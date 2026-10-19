import { Skeleton } from "@/components/common/ui/skeleton";

/** Root loading UI — a neutral placeholder while a route is resolved. */
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-3xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}
