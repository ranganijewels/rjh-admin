import AllUserList from "@/components/commonPages/UsersRoles/AllUserList";
import React, { Suspense } from "react";
import { ContentLoader } from "@/components/common/ui/Loader/content-loader";

const page = () => {
  return (
    <Suspense fallback={<ContentLoader />}>
      <AllUserList />
    </Suspense>
  );
};

export default page;
