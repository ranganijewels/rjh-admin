import { Suspense } from "react";

import AllOrders from "@/components/commonPages/OrderManagement/AllOrders";
import { ContentLoader } from "@/components/common/ui/Loader/content-loader";

// The orders view reads its fulfilment tab and "today" toggle from the URL,
// so it needs a Suspense boundary around `useSearchParams`.
const page = () => (
  <Suspense fallback={<ContentLoader />}>
    <AllOrders />
  </Suspense>
);

export default page;
