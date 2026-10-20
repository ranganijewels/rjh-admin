import React, { Suspense } from "react";
import { DetailPageSkeleton } from "@/components/common/ui/skeletons/page-skeleton";
import CMS from "@/components/commonPages/CMS";

const page = () => {
  return (
    <Suspense fallback={<DetailPageSkeleton />}>
      <CMS />
    </Suspense>
  );
};

export default page;
