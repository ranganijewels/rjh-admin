"use client";

import React, { useMemo, useState } from "react";
import { ListWithCardToggle } from "@/components/common/ListWithCardToggle";
import { Page, PageHeader } from "@/components/common/ui/page";
import {
  StatusFilter,
  buildStatusOptions,
} from "@/components/common/ui/status-filter";
import useCustomRequestColumn from "../useCustomRequestColumn";
import { useCrudList } from "@/hooks/useCrudList";
import RequestDetailsSheet from "./RequestDetailsModel";
import { ContentLoader } from "@/components/common/ui/Loader/content-loader";
import { useUrlFilters } from "@/hooks/useUrlFilters";

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
  // The status filter lives in the URL, so a filtered view can be
  // bookmarked, shared and survives a refresh.
  const { values: urlFilters, setValue: setUrlFilter } = useUrlFilters({
    status: "all",
  });
  const statusFilter = urlFilters.status;
  const setStatusFilter = (value) => setUrlFilter("status", value);

  const statusLabel = (request) => request?.status || "Unknown";

  const statusOptions = useMemo(
    () =>
      buildStatusOptions(list, statusLabel, {
        allLabel: "All requests",
      }),
    [list]
  );

  const scopedList = useMemo(
    () =>
      statusFilter === "all"
        ? list
        : (list || []).filter(
            (request) => statusLabel(request) === statusFilter
          ),
    [list, statusFilter]
  );

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
    <Page>
      <PageHeader
        title="Custom Requests"
        description="Bespoke jewellery requests from the storefront, with the type of design each customer asked for."
      />

      <StatusFilter
        options={statusOptions}
        value={statusFilter}
        onChange={setStatusFilter}
        ariaLabel="Request status"
      />

      <ListWithCardToggle
        resizableColumns
        titleAs="none"
        data={scopedList}
        columns={columns}
        infiniteScroll
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
    </Page>
  );
};

export default AllCustomRequest;
