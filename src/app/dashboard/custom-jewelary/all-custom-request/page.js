import AllCustomRequest from "@/components/commonPages/CustomJewelry/AllCustomRequest/AllCustomRequest";
import React, { Suspense } from "react";
import { ContentLoader } from "@/components/common/ui/Loader/content-loader";

const page = () => {
  return (
    <Suspense fallback={<ContentLoader />}>
      <AllCustomRequest />
    </Suspense>
  );
};

export default page;
