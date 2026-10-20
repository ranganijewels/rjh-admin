import { ListPageSkeleton } from "@/components/common/ui/skeletons/page-skeleton";

/**
 * Root loading UI — a neutral placeholder while a route is resolved.
 */
export default function Loading() {
  return <ListPageSkeleton showKpis={false} rows={6} />;
}
