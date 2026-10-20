import AllUserList from "@/components/commonPages/UsersRoles/AllUserList";
import React, { Suspense } from "react";
import { ListPageSkeleton } from "@/components/common/ui/skeletons/page-skeleton";

const page = () => {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <AllUserList />
    </Suspense>
  );
};

export default page;
