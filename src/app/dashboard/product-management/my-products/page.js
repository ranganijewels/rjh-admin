import { Suspense } from "react";

import ProductMasterList from "@/components/commonPages/ProductManagement/ProductMasterList/ProductMasterList";
import { ContentLoader } from "@/components/common/ui/Loader/content-loader";

// The list reads its filters from the URL, so it needs a Suspense boundary
// around `useSearchParams`.
const page = () => (
  <Suspense fallback={<ContentLoader />}>
    <ProductMasterList />
  </Suspense>
);

export default page;
