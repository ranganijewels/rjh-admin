"use client";

import React, { useMemo, useState } from "react";
import { useFilteredStoreData } from "../../ProductManagement/hooks/useFilteredStoreData";
import { ListWithCardToggle } from "@/components/common/ListWithCardToggle";
import { useReturnRepairColumns } from "../hooks/useReturnRepairColumns";
import { DataGridToolbar } from "../../DataGridToolBar";
import { useCrudList } from "@/hooks/useCrudList";
import { Page, PageHeader } from "@/components/common/ui/page";
import {
  StatusFilter,
  buildStatusOptions,
} from "@/components/common/ui/status-filter";

const ReturnRepair = () => {
  const { list } = useCrudList("/api/order-management/return-repair");
  const columns = useReturnRepairColumns();

  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredList = useMemo(() => {
    if (!searchQuery) return list;

    return list?.filter((item) =>
      item.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [list, searchQuery]);

  const statusLabel = (request) => {
    const value = String(request?.status || "").toLowerCase();
    const labels = {
      submitted: "Submitted",
      in_progress: "In Progress",
      completed: "Completed",
      rejected: "Rejected",
    };
    return labels[value] || request?.status || "Unknown";
  };

  const statusOptions = useMemo(
    () =>
      buildStatusOptions(filteredList, statusLabel, {
        allLabel: "All requests",
        order: ["Submitted", "In Progress", "Completed", "Rejected"],
      }),
    [filteredList]
  );

  const scopedList = useMemo(
    () =>
      statusFilter === "all"
        ? filteredList
        : (filteredList || []).filter(
            (request) => statusLabel(request) === statusFilter
          ),
    [filteredList, statusFilter]
  );

  return (
    <Page>
      <PageHeader
        title="Return / Repair Orders"
        description="Return and repair requests raised by customers, with the action they asked for and where each one stands."
      />

      <StatusFilter
        options={statusOptions}
        value={statusFilter}
        onChange={setStatusFilter}
        ariaLabel="Request status"
      />

      <ListWithCardToggle
        titleAs="none"
        resizableColumns
        data={scopedList}
        columns={columns}
        useFilteredData={useFilteredStoreData}
        infiniteScroll
        ToolbarComponent={(props) => (
          <DataGridToolbar
            {...props}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            pagination={pagination}
            setPagination={setPagination}
          />
        )}
      />
    </Page>
  );
};

export default ReturnRepair;
