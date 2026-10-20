"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Container } from "@/components/common/ui/container";
import ConfirmDialog from "@/components/common/ui/ConfirmDialog";
import {
  Card,
  CardFooter,
  CardHeader,
  CardTable,
  CardToolbar,
} from "@/components/common/ui/cards/card";
import { DataGrid } from "@/components/common/ui/data-grid";
import { DataGridPagination } from "@/components/common/ui/data-grid-pagination";
import { DataGridTable } from "@/components/common/ui/data-grid-table";
import { ScrollArea, ScrollBar } from "@/components/common/ui/scroll-area";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/common/ui/toggle-group";
import { Columns, LayoutGrid, List, Rows2, Rows3, Search, Settings2, X } from "lucide-react";
import {
  ToolbarDescription,
} from "@/components/common/ui/toolbar";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useMarginService } from "@/services/marginService";
import { DataGridColumnVisibility } from "./ui/data-grid-column-visibility";
import { Label } from "./ui/label";

// Actions have historically been declared as either "action" or "actions".
// Pin both so every table keeps its row actions visible. Identity columns opt
// in with `meta: { identity: true }` and are pinned to the left edge.
function getInitialColumnPinning(columns = []) {
  const actionIds = columns
    .map((column) => column.id)
    .filter((id) => id === "action" || id === "actions");
  const identityIds = columns
    .filter((column) => column.meta?.identity)
    .map((column) => column.id)
    .filter(Boolean);

  return {
    left: ["expand-column", "select", ...identityIds],
    right: actionIds.length ? actionIds : ["actions"],
  };
}

export const ListWithCardToggle = ({
  title,
  description,
  data = [],
  columns = [],
  pagination: externalPagination,
  onPaginationChange,
  pageCount,
  totalCount,
  paginationLinks,
  renderCardView,
  createBtn,
  filterDropdownProps,
  // Extra controls rendered next to the filter dropdowns (e.g. a "Clear"
  // button for the active filters).
  filterActions,
  disableFooter,
  disableDescription,
  customCardHeader,
  searchQuery: externalSearchQuery,
  onSearchChange,
  filterFunction,
  serverSidePagination = false,
  ToolbarComponent,
  showBulkMargin,
  onRefresh,
  onSelectionChange,
  // Opt-in: drag-to-resize column borders + single-line truncation of long cells
  // (uses each column's `size` as the starting width; table becomes fixed-layout).
  resizableColumns = false,
  // Opt-in: replace the pagination footer (both views) with a scroll sentinel
  // that calls onLoadMore as it comes into view. `data` must already be the
  // full accumulated list (the caller appends pages, not this component).
  infiniteScroll = false,
  onLoadMore,
  hasMore = false,
  loadingMore = false,
  // Columns hidden on a first visit, e.g. { gender: false }. A column the user
  // has toggled in the Columns menu always wins — the stored visibility is
  // merged over this default.
  defaultHiddenColumns = {},
  // Generic bulk-action bar shown when rows are selected, regardless of view
  // mode: [{key, label, variant?, confirmMessage?, onRun: (selectedRowObjects) => Promise<void>}]
  bulkActions = [],
  // Overrides the empty-state text. Left unset, the message adapts: a list
  // that is empty because of a filter says so, instead of "No data available".
  emptyMessage,
  // Extra classes for the outer container. Defaults to no extra horizontal
  // padding: the app shell already provides the page padding (p-4 md:p-6),
  // so the list lines up with the page header instead of being inset twice.
  contentClassName = "px-0 lg:px-0",
  // Opt-in: on screens below `lg` the card view is used automatically, since
  // a wide data table cannot fit. The user can still switch back to the list.
  responsiveCards = false,
  // Changing this value resets the table back to the first page (used when a
  // filter/tab changes the underlying rows).
  paginationResetKey,
  // Render the title as a section heading (h2) instead of the page heading
  // (h1) — used when the page already renders its own <PageHeader>. Pass
  // "none" to drop the title block entirely (the actions stay).
  titleAs = "h1",
}) => {
  const [currentMode, setCurrentMode] = useState(
    renderCardView && !responsiveCards ? "cards" : "list"
  );
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  // Default to sorting by `id` descending — but only when the table actually
  // has an `id` column. TanStack throws "Column with id 'id' does not exist"
  // when the sort state references a column that isn't part of the table,
  // which is the case for most of the admin tables (orderId, request_id,
  // srno, …).
  const [sorting, setSorting] = useState(() =>
    columns.some((column) => column.id === "id") ? [{ id: "id", desc: true }] : []
  );
  const [rowSelection, setRowSelection] = useState({});
  // Row density is a per-list preference, like the column visibility.
  const [density, setDensity] = useState(() => {
    if (typeof window === "undefined") return "comfortable";
    try {
      return localStorage.getItem(`${title}-row-density`) || "comfortable";
    } catch {
      return "comfortable";
    }
  });
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery || "");
  const [deletePermissionIds, setDeletePermissionIds] = useState([]);

  const [isSaving, setIsSaving] = useState(false);
  const { updateBulkMargin } = useMarginService();

  // Separate state for list view
  const [showBulkInputList, setShowBulkInputList] = useState(false);
  const [bulkLabourList, setBulkLabourList] = useState("");
  const [bulkDiamondList, setBulkDiamondList] = useState("");

  // Separate state for card view
  const [showBulkInputCard, setShowBulkInputCard] = useState(false);
  const [bulkLabourCard, setBulkLabourCard] = useState("");
  const [bulkDiamondCard, setBulkDiamondCard] = useState("");

  const [columnPinning, setColumnPinning] = useState(() =>
    getInitialColumnPinning(columns)
  );

  // Responsive card view: below `lg` the stacked cards replace the table.
  // `modeOverride` remembers an explicit choice by the user, which always
  // wins over the automatic behaviour.
  const [isNarrow, setIsNarrow] = useState(false);
  const [modeOverride, setModeOverride] = useState(null);

  useEffect(() => {
    if (!responsiveCards) return undefined;
    const query = window.matchMedia("(max-width: 1023px)");
    const apply = () => setIsNarrow(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, [responsiveCards]);

  const effectiveMode =
    modeOverride ?? (responsiveCards && isNarrow ? "cards" : currentMode);

  // New rows (filter/tab change) may no longer cover the current page, so
  // jump back to the first page.
  useEffect(() => {
    setPagination((prev) =>
      prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }
    );
  }, [paginationResetKey]);

  // Drop sort entries whose column no longer exists (columns can change when
  // a page swaps its column set) — otherwise TanStack throws while building
  // the sorted row model.
  useEffect(() => {
    setSorting((prev) => {
      const next = prev.filter((sort) =>
        columns.some((column) => column.id === sort.id)
      );
      return next.length === prev.length ? prev : next;
    });
  }, [columns]);

  const actualPagination = serverSidePagination
    ? externalPagination
    : pagination;

  // Default filter function if none provided
  const defaultFilterFunction = (data, query) => {
    if (!query) return data;
    const lowercaseQuery = query.toLowerCase();
    return data.filter((item) =>
      Object.values(item).some(
        (value) =>
          value && value.toString().toLowerCase().includes(lowercaseQuery)
      )
    );
  };

  const handleBulkSave = async (mode) => {
    const isListMode = mode === "list";
    const labour = isListMode ? bulkLabourList : bulkLabourCard;
    const diamond = isListMode ? bulkDiamondList : bulkDiamondCard;

    if ((!labour && !diamond) || deletePermissionIds.length === 0) return;

    setIsSaving(true);
    try {
      const selectedProducts = table
        .getRowModel()
        .rows.filter((row) => deletePermissionIds.includes(row.id))
        .map((row) => row.original);

      const success = await updateBulkMargin(selectedProducts, {
        labour,
        diamond,
      });

      if (success) {
        onRefresh?.();

        if (isListMode) {
          setShowBulkInputList(false);
          setBulkLabourList("");
          setBulkDiamondList("");
        } else {
          setShowBulkInputCard(false);
          setBulkLabourCard("");
          setBulkDiamondCard("");
        }

        setRowSelection({});
      }
    } finally {
      setIsSaving(false);
    }
  };

  const COLUMN_VISIBILITY_KEY = `${title}-column-visibility`;

  const [columnVisibility, setColumnVisibility] = useState(() => {
    if (typeof window === "undefined") return { ...defaultHiddenColumns };
    try {
      const stored = JSON.parse(localStorage.getItem(COLUMN_VISIBILITY_KEY));
      // The stored choices win; the defaults only fill in columns the user
      // has never touched.
      if (stored && typeof stored === "object") {
        return { ...defaultHiddenColumns, ...stored };
      }
    } catch {
      // Fall through to the defaults when the stored value is unusable.
    }
    return { ...defaultHiddenColumns };
  });

  useEffect(() => {
    localStorage.setItem(
      COLUMN_VISIBILITY_KEY,
      JSON.stringify(columnVisibility)
    );
  }, [columnVisibility, COLUMN_VISIBILITY_KEY]);

  useEffect(() => {
    try {
      localStorage.setItem(`${title}-row-density`, density);
    } catch {
      // A blocked storage quota should not break the table.
    }
  }, [density, title]);

  useEffect(() => {
    if (typeof onSelectionChange === "function") {
      const selectedRows = table
        .getSelectedRowModel()
        .rows.map((r) => r.original);
      onSelectionChange(selectedRows);
    }
  }, [rowSelection]);

  const filteredData = useMemo(() => {
    if (serverSidePagination || !searchQuery) return data;
    const filterFunc = filterFunction || defaultFilterFunction;
    return filterFunc(data, searchQuery);
  }, [data, searchQuery, filterFunction, serverSidePagination]);

  // An empty list reads very differently depending on why it is empty: "this
  // catalogue has nothing in it yet" and "your filter matched nothing" are
  // different messages and only one of them is actionable.
  const hasActiveFilter = Boolean(searchQuery?.trim()) ||
    Object.values(filterDropdownProps || {}).some(
      (filter) => filter?.value && filter.value !== "all"
    );

  const resolvedEmptyMessage =
    emptyMessage ||
    (hasActiveFilter
      ? "Nothing matches the current search and filters."
      : "No records yet.");

  const table = useReactTable({
    columns,
    data: serverSidePagination ? data : filteredData,
    getRowId: (row, index) => {
      const key = row?.variant_id ?? row?.product_id ?? row?.id ?? index;

      return `row-${key}-${index}`;
    },
    state: {
      pagination: actualPagination,
      sorting,
      rowSelection,
      columnPinning,
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
    columnResizeMode: "onChange",
    enableColumnResizing: resizableColumns,
    onPaginationChange: serverSidePagination
      ? onPaginationChange
      : setPagination,
    onSortingChange: setSorting,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(serverSidePagination
      ? { manualPagination: true, pageCount }
      : {
          getPaginationRowModel: getPaginationRowModel(),
          getFilteredRowModel: getFilteredRowModel(),
        }),
  });

  useEffect(() => {
    setDeletePermissionIds(Object.keys(rowSelection));
  }, [rowSelection]);

  // Sync external search query with internal state
  useEffect(() => {
    if (externalSearchQuery === undefined) return;
    setSearchQuery((prev) =>
      prev === externalSearchQuery ? prev : externalSearchQuery
    );
  }, [externalSearchQuery]);

  const handleSearchChange = (value) => {
    if (!serverSidePagination) {
      setSearchQuery(value);
      // Reset to first page when searching
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
    onSearchChange?.(value);
  };

  const displayedData = serverSidePagination ? data : filteredData;
  const currentSearchValue = serverSidePagination
    ? externalSearchQuery ?? ""
    : searchQuery;

  // Infinite scroll: one sentinel shared by both views (only one is mounted
  // at a time), observed for the lifetime of the component. Server-paginated
  // callers pass onLoadMore/hasMore/loadingMore; client fetch-all callers
  // just pass infiniteScroll and this grows the local page size instead.
  const localHasMore =
    !serverSidePagination && pagination.pageSize < filteredData.length;
  const sentinelRef = useRef(null);
  useEffect(() => {
    if (!infiniteScroll) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        if (serverSidePagination) {
          if (hasMore && !loadingMore) onLoadMore?.();
        } else {
          setPagination((prev) =>
            prev.pageSize < filteredData.length
              ? { ...prev, pageSize: prev.pageSize + 20 }
              : prev
          );
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [
    infiniteScroll,
    onLoadMore,
    hasMore,
    loadingMore,
    effectiveMode,
    serverSidePagination,
    filteredData.length,
  ]);

  return (
    <Container className={contentClassName}>
      <div className="flex flex-col items-stretch gap-5 lg:gap-7.5">
        {/* Header — only rendered when it has something to show. A page that
            supplies its own <PageHeader> and has no card view used to get a
            row containing nothing but a single "List view" button, floating
            above the card with a 30px gap above it. */}
        {(titleAs !== "none" || createBtn || renderCardView) && (
          <div className="flex flex-wrap items-center gap-5 justify-between">
            {titleAs !== "none" && (
              <div>
                {titleAs === "h2" ? (
                  <h2 className="text-base font-semibold text-foreground">
                    {title}
                  </h2>
                ) : (
                  <h1 className="text-2xl font-semibold leading-tight text-foreground">
                    {title}
                  </h1>
                )}
                {!disableDescription && (
                  <ToolbarDescription>{description}</ToolbarDescription>
                )}
              </div>
            )}

            {/* The action block has to be allowed to wrap: on a phone the
                "Import CSV / Export CSV / Bulk Upload Images" row is wider
                than the screen and used to run off the right edge. */}
            <div className="flex flex-wrap items-center justify-end gap-2">
              {createBtn && createBtn}
              {renderCardView && (
                <ToggleGroup
                  type="single"
                  variant="outline"
                  value={effectiveMode}
                  onValueChange={(value) => {
                    if (!value) return;
                    setCurrentMode(value);
                    setModeOverride(value);
                  }}
                >
                  <ToggleGroupItem
                    value="list"
                    aria-label="List view"
                    title="List view"
                  >
                    <List size={16} />
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="cards"
                    aria-label="Card view"
                    title="Card view"
                  >
                    <LayoutGrid size={16} />
                  </ToggleGroupItem>
                </ToggleGroup>
              )}
            </div>
          </div>
        )}

        {bulkActions.length > 0 && deletePermissionIds.length > 0 && (
          <BulkActionsBar
            actions={bulkActions}
            count={deletePermissionIds.length}
            getSelectedRows={() =>
              table.getSelectedRowModel().rows.map((r) => r.original)
            }
            onDone={() => setRowSelection({})}
          />
        )}

        {/* Card View */}
        {renderCardView && effectiveMode === "cards" && (
          <>
            {/* Bulk Action Toolbar for Cards */}
            {showBulkMargin && deletePermissionIds.length > 0 && (
              <div className="flex items-center justify-end gap-3 mb-4">
                {!showBulkInputCard ? (
                  <Button
                    variant="primary"
                    onClick={() => setShowBulkInputCard(true)}
                  >
                    Bulk Action
                  </Button>
                ) : (
                  <>
                    <Label>Labour</Label>
                    <input
                      type="number"
                      placeholder="margin"
                      className="border border-input rounded-md text-2sm px-3 py-1 w-20 text-center"
                      value={bulkLabourCard}
                      onChange={(e) => setBulkLabourCard(e.target.value)}
                    />
                    <Label>Diamond</Label>
                    <input
                      type="number"
                      placeholder="margin"
                      className="border border-input rounded-md text-2sm px-3 py-1 w-20 text-center"
                      value={bulkDiamondCard}
                      onChange={(e) => setBulkDiamondCard(e.target.value)}
                    />
                    <Button
                      variant="primary"
                      onClick={() => handleBulkSave("card")}
                      disabled={
                        isSaving || (!bulkLabourCard && !bulkDiamondCard)
                      }
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowBulkInputCard(false);
                        setBulkLabourCard("");
                        setBulkDiamondCard("");
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-7.5">
              {displayedData.map((item) => {
                const idStr = String(item.id);
                const isSelected = deletePermissionIds.includes(idStr);

                const toggleSelect = (e) => {
                  if (e && typeof e.stopPropagation === "function")
                    e.stopPropagation();

                  setRowSelection((prev) => {
                    const newSelection = { ...prev };
                    if (newSelection[idStr]) delete newSelection[idStr];
                    else newSelection[idStr] = true;
                    return newSelection;
                  });
                };

                return (
                  <div key={item.id}>
                    {renderCardView(item, { isSelected, toggleSelect })}
                  </div>
                );
              })}
            </div>

            {/* Card-view pagination (the table-view pagination lives in DataGrid) */}
            {!infiniteScroll && (
              <CardPagination
                table={table}
                recordCount={serverSidePagination ? totalCount || 0 : filteredData.length || 0}
              />
            )}
          </>
        )}

        {/* Table View */}
        {effectiveMode === "list" && (
          <div className="flex flex-col gap-5 lg:gap-7.5">
            <DataGrid
              table={table}
              emptyMessage={resolvedEmptyMessage}
              recordCount={
                serverSidePagination
                  ? totalCount || 0
                  : filteredData.length || 0
              }
              tableLayout={{
                columnsPinnable: true,
                columnsMovable: true,
                columnsVisibility: true,
                cellBorder: true,
                headerSticky: true,
                columnsResizable: resizableColumns,
                dense: density === "compact",
                ...(resizableColumns ? { width: "fixed" } : {}),
              }}
              onRowSelectionChange={setRowSelection}
            >
              <Card>
                <CardHeader className="flex-col sm:flex-row items-stretch sm:items-center py-5 gap-2.5 justify-between">
                  {/*Use custom Toolbar if passed */}
                  {ToolbarComponent ? (
                    <ToolbarComponent
                      searchQuery={currentSearchValue}
                      setSearchQuery={handleSearchChange}
                      pagination={pagination}
                      setPagination={setPagination}
                    />
                  ) : (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                      {/* Search */}
                      <div className="relative">
                        <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
                        <Input
                          placeholder="Search..."
                          value={currentSearchValue}
                          onChange={(e) => handleSearchChange(e.target.value)}
                          className="ps-9 w-full"
                        />
                        {currentSearchValue && (
                          <Button
                            mode="icon"
                            variant="ghost"
                            className="absolute end-1.5 top-1/2 -translate-y-1/2 h-6 w-6"
                            onClick={() => handleSearchChange("")}
                            aria-label="Clear search"
                            title="Clear search"
                          >
                            <X />
                          </Button>
                        )}
                      </div>

                      {/* Dropdown Filter */}
                      {filterDropdownProps && (
                        <div className="flex flex-wrap items-center gap-2">
                          {Object.entries(filterDropdownProps).map(
                            ([key, filter]) => (
                              <Select
                                key={key}
                                value={filter.value}
                                onValueChange={filter.onChange}
                              >
                                <SelectTrigger className="w-full sm:w-36">
                                  <SelectValue
                                    placeholder={filter.placeholder || key}
                                  />
                                </SelectTrigger>

                                <SelectContent>
                                  {filter.options.map((opt) => (
                                    <SelectItem
                                      key={opt.value}
                                      value={opt.value}
                                    >
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )
                          )}
                          {filterActions}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3">
                    {showBulkMargin && deletePermissionIds.length > 0 && (
                      <div className="flex items-center gap-3">
                        {!showBulkInputList ? (
                          <Button
                            variant="primary"
                            onClick={() => setShowBulkInputList(true)}
                          >
                            Bulk Action
                          </Button>
                        ) : (
                          <>
                            <Label>Labour</Label>
                            <input
                              type="number"
                              placeholder="margin"
                              className="border border-input rounded-md text-2sm px-3 py-1 w-20 text-center"
                              value={bulkLabourList}
                              onChange={(e) =>
                                setBulkLabourList(e.target.value)
                              }
                            />
                            <Label>Diamond</Label>
                            <input
                              type="number"
                              placeholder="margin"
                              className="border border-input rounded-md text-2sm px-3 py-1 w-20 text-center"
                              value={bulkDiamondList}
                              onChange={(e) =>
                                setBulkDiamondList(e.target.value)
                              }
                            />
                            <Button
                              variant="primary"
                              onClick={() => handleBulkSave("list")}
                              disabled={
                                isSaving ||
                                (!bulkLabourList && !bulkDiamondList)
                              }
                            >
                              {isSaving ? "Saving..." : "Save"}
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => {
                                setShowBulkInputList(false);
                                setBulkLabourList("");
                                setBulkDiamondList("");
                              }}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>
                    )}

                    <CardToolbar className="flex items-center gap-2">
                      {/* Row density — comfortable or compact. */}
                      <ToggleGroup
                        type="single"
                        value={density}
                        onValueChange={(value) => {
                          if (value) setDensity(value);
                        }}
                        variant="outline"
                        size="sm"
                        aria-label="Row density"
                        className="hidden sm:flex"
                      >
                        <ToggleGroupItem
                          value="comfortable"
                          aria-label="Comfortable rows"
                          title="Comfortable rows"
                        >
                          <Rows3 className="size-4" />
                        </ToggleGroupItem>
                        <ToggleGroupItem
                          value="compact"
                          aria-label="Compact rows"
                          title="Compact rows"
                        >
                          <Rows2 className="size-4" />
                        </ToggleGroupItem>
                      </ToggleGroup>

                      {/* Column Visibility Toggle */}
                      <DataGridColumnVisibility
                        table={table}
                        trigger={
                          <Button variant="outline" size="md">
                            <Settings2 className="mr-2 h-4 w-4" />
                            Columns
                          </Button>
                        }
                      />

                    </CardToolbar>
                  </div>
                </CardHeader>

                {customCardHeader && (
                  <CardHeader>{customCardHeader}</CardHeader>
                )}

                <CardTable>
                  <ScrollArea>
                    <DataGridTable />
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </CardTable>

                {!disableFooter && !infiniteScroll && (
                  <CardFooter>
                    <DataGridPagination
                      paginationLinks={paginationLinks}
                      totalCount={
                        serverSidePagination ? totalCount : filteredData.length
                      }
                    />
                  </CardFooter>
                )}
              </Card>
            </DataGrid>
          </div>
        )}

        {infiniteScroll && (serverSidePagination ? hasMore : localHasMore) && (
          <div ref={sentinelRef} className="flex items-center justify-center py-6">
            {loadingMore && (
              <span className="text-sm text-muted-foreground">Loading more…</span>
            )}
          </div>
        )}
      </div>
    </Container>
  );
};

// Bulk-action bar shown above both views when rows are selected. Actions with
// a confirmMessage go through ConfirmDialog first; others run immediately.
function BulkActionsBar({ actions, count, getSelectedRows, onDone }) {
  const [runningKey, setRunningKey] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const run = async (action) => {
    setRunningKey(action.key);
    try {
      await action.onRun(getSelectedRows());
      onDone?.();
    } catch (e) {
      toast.error(e?.message || `${action.label} failed`);
    } finally {
      setRunningKey(null);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 rounded-md border border-input bg-muted/40 px-4 py-2.5">
        <span className="text-sm font-medium">{count} selected</span>
        <div className="flex items-center gap-2 ms-auto">
          {/* `hidden: true` lets a page hide an action its role may not run
              without having to build the whole list conditionally. */}
          {actions.filter((action) => !action.hidden).map((action) => (
            <Button
              key={action.key}
              size="sm"
              variant={action.variant || "outline"}
              disabled={runningKey === action.key}
              onClick={() =>
                action.confirmMessage ? setConfirmAction(action) : run(action)
              }
            >
              {runningKey === action.key ? "Working…" : action.label}
            </Button>
          ))}
        </div>
      </div>
      <ConfirmDialog
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => {
          const action = confirmAction;
          setConfirmAction(null);
          run(action);
        }}
        title={confirmAction?.label}
        message={confirmAction?.confirmMessage}
        confirmLabel={confirmAction?.label}
        confirmVariant={
          confirmAction?.variant === "destructive" ? "destructive" : "primary"
        }
      />
    </>
  );
}

// Standalone pagination bar for card/grid view (table view uses DataGridPagination).
function CardPagination({ table, recordCount, sizes = [10, 20, 50, 100] }) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const pageCount = table.getPageCount() || 1;
  if (pageCount <= 1 && recordCount <= pageSize) return null;
  const from = recordCount === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, recordCount);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
      <div className="flex items-center gap-2.5">
        <span className="text-sm text-muted-foreground">
          {recordCount > 0
            ? `Showing ${from}–${to} of ${recordCount}`
            : "No records"}
        </span>
        {/* Same rows-per-page control as the table footer, so the card view
            (mobile / tablet) can change the page size too. */}
        <Select
          value={`${pageSize}`}
          onValueChange={(value) => table.setPageSize(Number(value))}
        >
          <SelectTrigger className="h-8 w-fit" size="sm">
            <SelectValue placeholder={`${pageSize}`} />
          </SelectTrigger>
          <SelectContent side="top" className="min-w-[80px]">
            {sizes.map((size) => (
              <SelectItem key={size} value={`${size}`}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.setPageIndex(0)}
          disabled={pageIndex === 0}
        >
          «
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Prev
        </Button>
        <span className="px-2 text-sm whitespace-nowrap">
          Page {pageIndex + 1} of {pageCount}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.setPageIndex(pageCount - 1)}
          disabled={pageIndex >= pageCount - 1}
        >
          »
        </Button>
      </div>
    </div>
  );
}
