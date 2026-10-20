import ReturnRepair from "@/components/commonPages/OrderManagement/ReturnRepair";
import React, { Suspense } from "react";
import { ListPageSkeleton } from "@/components/common/ui/skeletons/page-skeleton";

const page = () => {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <ReturnRepair />
    </Suspense>
  );
};

export default page;
