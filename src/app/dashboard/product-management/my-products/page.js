import { Suspense } from "react";

import ProductMasterList from "@/components/commonPages/ProductManagement/ProductMasterList/ProductMasterList";
import { ListPageSkeleton } from "@/components/common/ui/skeletons/page-skeleton";

// The list reads its filters from the URL, so it needs a Suspense boundary
// around `useSearchParams`.
const page = () => (
  <Suspense fallback={<ListPageSkeleton />}>
    <ProductMasterList />
  </Suspense>
);

export default page;
