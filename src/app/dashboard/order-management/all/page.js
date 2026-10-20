import { Suspense } from "react";

import AllOrders from "@/components/commonPages/OrderManagement/AllOrders";
import { ListPageSkeleton } from "@/components/common/ui/skeletons/page-skeleton";

// The orders view reads its fulfilment tab and "today" toggle from the URL,
// so it needs a Suspense boundary around `useSearchParams`.
const page = () => (
  <Suspense fallback={<ListPageSkeleton />}>
    <AllOrders />
  </Suspense>
);

export default page;
