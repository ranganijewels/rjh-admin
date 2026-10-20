import { DashboardPageSkeleton } from "@/components/common/ui/skeletons/page-skeleton";

/**
 * Route-level loading UI for /dashboard/dashboard.
 *
 * Shown while this segment is being fetched, so the panel shows the shape
 * of the page that is coming rather than a spinner.
 */
export default function Loading() {
  return <DashboardPageSkeleton />;
}
