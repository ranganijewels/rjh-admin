import React, { Suspense } from "react";
import { ContentLoader } from "@/components/common/ui/Loader/content-loader";
import CouponsManagement from "@/components/commonPages/CouponsManagement";

const page = () => {
  return (
    <Suspense fallback={<ContentLoader />}>
      <CouponsManagement />
    </Suspense>
  );
};

export default page;
