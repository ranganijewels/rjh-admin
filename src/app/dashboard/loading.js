import { DashboardPageSkeleton } from "@/components/common/ui/skeletons/page-skeleton";

/**
 * Route-level loading UI.
 *
 * Shown while a dashboard segment is being fetched or compiled, so the
 * layout does not jump when the real content arrives.
 */
export default function DashboardLoading() {
  return <DashboardPageSkeleton />;
}
