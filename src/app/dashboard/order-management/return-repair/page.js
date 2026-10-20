import ReturnRepair from "@/components/commonPages/OrderManagement/ReturnRepair";
import React, { Suspense } from "react";
import { ContentLoader } from "@/components/common/ui/Loader/content-loader";

const page = () => {
  return (
    <Suspense fallback={<ContentLoader />}>
      <ReturnRepair />
    </Suspense>
  );
};

export default page;
