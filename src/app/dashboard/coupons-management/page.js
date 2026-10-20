import React, { Suspense } from "react";
import { ListPageSkeleton } from "@/components/common/ui/skeletons/page-skeleton";
import CouponsManagement from "@/components/commonPages/CouponsManagement";

const page = () => {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <CouponsManagement />
    </Suspense>
  );
};

export default page;
