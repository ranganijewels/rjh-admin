import AllCustomRequest from "@/components/commonPages/CustomJewelry/AllCustomRequest/AllCustomRequest";
import React, { Suspense } from "react";
import { ListPageSkeleton } from "@/components/common/ui/skeletons/page-skeleton";

const page = () => {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <AllCustomRequest />
    </Suspense>
  );
};

export default page;
