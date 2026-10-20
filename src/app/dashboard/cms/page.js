import React, { Suspense } from "react";
import { ContentLoader } from "@/components/common/ui/Loader/content-loader";
import CMS from "@/components/commonPages/CMS";

const page = () => {
  return (
    <Suspense fallback={<ContentLoader />}>
      <CMS />
    </Suspense>
  );
};

export default page;
