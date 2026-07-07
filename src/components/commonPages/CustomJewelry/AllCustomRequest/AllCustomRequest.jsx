"use client";

import React, { useState } from "react";
import { ListWithCardToggle } from "@/components/common/ListWithCardToggle";
import useCustomRequestColumn from "../useCustomRequestColumn";
import { useCrudList } from "@/hooks/useCrudList";
import RequestDetailsSheet from "./RequestDetailsModel";
import { ContentLoader } from "@/components/common/ui/Loader/content-loader";

const AllCustomRequest = () => {
  const { list, loading, error } = useCrudList("/api/custom-request");

  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const handleView = (item) => {
    setSelectedRequest(item);
    setSheetOpen(true);
  };

  const columns = useCustomRequestColumn({ onView: handleView });

  const [searchQuery, setSearchQuery] = useState("");

  if (loading) return <ContentLoader />;
  if (error) return <div className="text-destructive">Error: {error}</div>;
  if (!list || list.length === 0)
    return (
      <div className="flex h-full w-full items-center justify-center py-10">
        <span className="text-muted-foreground font-medium text-sm">
          No custom requests yet
        </span>
      </div>
    );

  return (
    <>
      <ListWithCardToggle
        resizableColumns
        title="All Custom Requests"
        data={list}
        columns={columns}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterFunction={(data, query) => {
          if (!query) return data;
          const q = query.toLowerCase();
          return data.filter((item) =>
            String(item.category?.name || "")
              .toLowerCase()
              .includes(q)
          );
        }}
        createBtn={null}
      />

      <RequestDetailsSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        requestDetails={selectedRequest}
      />
    </>
  );
};

export default AllCustomRequest;
