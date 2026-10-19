"use client";
import React, { useState } from "react";
import { Container } from "@/components/common/ui/container";
import { Card, CardFooter, CardTable } from "@/components/common/ui/cards/card";
import { DataGrid } from "@/components/common/ui/data-grid";
import { DataGridPagination } from "@/components/common/ui/data-grid-pagination";
import { DataGridTable } from "@/components/common/ui/data-grid-table";
import { ScrollArea, ScrollBar } from "@/components/common/ui/scroll-area";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/common/ui/toggle-group";
import { ToolbarTitle } from "@/components/common/ui/toolbar";
import { LayoutGrid, List, TriangleAlert } from "lucide-react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

export const ListWithCardToggle = ({
  title,
  data,
  columns,
  useFilteredData,
  ToolbarComponent,
  renderCardView,
  loading = false,
  error = null,
  emptyMessage = "No records found.",
}) => {
  const [currentMode, setCurrentMode] = useState("list");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  // Only sort by `id` when the table has such a column — TanStack throws
  // when the sort state references a column that isn't part of the table.
  const [sorting, setSorting] = useState(() =>
    columns.some((column) => column.id === "id") ? [{ id: "id", desc: true }] : []
  );
  const [rowSelection, setRowSelection] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = useFilteredData(searchQuery, data);

  const table = useReactTable({
    columns,
    data: filteredData,
    pageCount: Math.ceil((filteredData.length || 0) / pagination.pageSize),
    getRowId: (row) => String(row.id),
    state: { pagination, sorting, rowSelection },
    columnResizeMode: "onChange",
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Container>
      <div className="flex flex-col items-stretch gap-5 lg:gap-7.5">
        <div className="flex flex-wrap items-center gap-5 justify-between">
          <ToolbarTitle>{title}</ToolbarTitle>
          <ToggleGroup
            type="single"
            variant="outline"
            value={currentMode}
            onValueChange={(value) => {
              if (value) setCurrentMode(value);
            }}
          >
            <ToggleGroupItem value="list">
              <List size={16} />
            </ToggleGroupItem>
            {renderCardView && (
              <ToggleGroupItem value="cards">
                <LayoutGrid size={16} />
              </ToggleGroupItem>
            )}
          </ToggleGroup>
        </div>

        {renderCardView && currentMode === "cards" && (
          <>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-7.5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-40 rounded-lg bg-muted animate-pulse"
                  />
                ))}
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                <TriangleAlert size={16} />
                <span>{typeof error === "string" ? error : "Failed to load data."}</span>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="flex items-center justify-center rounded-lg border border-dashed p-10 text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-7.5">
                {filteredData.map(renderCardView)}
              </div>
            )}
          </>
        )}

        {currentMode === "list" && (
          <div className="flex flex-col gap-5 lg:gap-7.5">
            {error ? (
              <Card>
                <div className="flex items-center gap-2 p-4 text-sm text-destructive">
                  <TriangleAlert size={16} />
                  <span>{typeof error === "string" ? error : "Failed to load data."}</span>
                </div>
              </Card>
            ) : loading ? (
              <Card>
                <div className="flex flex-col gap-3 p-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-8 w-full rounded bg-muted animate-pulse"
                    />
                  ))}
                </div>
              </Card>
            ) : (
              <DataGrid
                table={table}
                recordCount={filteredData.length || 0}
                tableLayout={{
                  columnsPinnable: true,
                  columnsMovable: true,
                  columnsVisibility: true,
                  cellBorder: false,
                }}
              >
                <Card>
                  {ToolbarComponent && (
                    <ToolbarComponent
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      pagination={pagination}
                      setPagination={setPagination}
                    />
                  )}
                  <CardTable>
                    <ScrollArea>
                      <DataGridTable />
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                  </CardTable>
                  {/* <CardFooter>
                    <DataGridPagination />
                  </CardFooter> */}
                </Card>
              </DataGrid>
            )}
          </div>
        )}
      </div>
    </Container>
  );
};
