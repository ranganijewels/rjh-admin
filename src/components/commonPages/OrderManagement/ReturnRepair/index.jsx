"use client";

import React, { useMemo, useState } from "react";
import { useFilteredStoreData } from "../../ProductManagement/hooks/useFilteredStoreData";
import { ListWithCardToggle } from "@/components/common/ListWithCardToggle";
import { useReturnRepairColumns } from "../hooks/useReturnRepairColumns";
import { DataGridToolbar } from "../../DataGridToolBar";
import { useCrudList } from "@/hooks/useCrudList";

const ReturnRepair = () => {
  const { list } = useCrudList("/api/order-management/return-repair");
  const columns = useReturnRepairColumns();

  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const filteredList = useMemo(() => {
    if (!searchQuery) return list;

    return list?.filter((item) =>
      item.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [list, searchQuery]);

  return (
    <>
      <ListWithCardToggle
        title="Return/ Repair Orders"
        resizableColumns
        data={filteredList}
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
    </>
  );
};

export default ReturnRepair;
