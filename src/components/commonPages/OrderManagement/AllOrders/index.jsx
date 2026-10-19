"use client";

import React, { useState, useEffect, useRef } from "react";
import { AlertCircle, PackageOpen, RefreshCw } from "lucide-react";
import { useOrderListColumns } from "../hooks/useOrderListColumns";
import ViewOrders from "./ViewOrders";
import { useCrudListWithPagination } from "@/hooks/useCrudListWithPagination";
import { ListWithCardToggle } from "@/components/common/ListWithCardToggle";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertContent,
  AlertDescription,
  AlertToolbar,
} from "@/components/common/ui/alert";
import { Button } from "@/components/common/ui/button";

const AllOrders = () => {
  const [openOrderDetailSheet, setOpenOrderDetailSheet] = useState(false);
  const [pageInfo, setPageInfo] = useState({ pageIndex: 0, pageSize: 10 });
  const [searchQuery, setSearchQuery] = useState("");

  const {
    list,
    loading,
    error,
    editData,
    setEditData,
    fetchData,
    fetchById,
    pagination,
  } = useCrudListWithPagination("/api/order-management");

  const [selectedOrderId, setSelectedOrderId] = useState(editData?._id || null);

  const columns = useOrderListColumns({
    onEdit: (item) => {
      console.log("Edit order:", item);
    },
    onView: async (item) => {
      try {
        setSelectedOrderId(item.id);
        const data = await fetchById(item.id);
        setEditData(data?.data);
        setOpenOrderDetailSheet(true);
      } catch (err) {
        console.error(err);
      }
    },
  });

  const searchDebounce = useRef(null);

  useEffect(() => {
    fetchData({
      page: pageInfo.pageIndex + 1,
      pageSize: pageInfo.pageSize,
      search: searchQuery,
    });
  }, []);

  const hasMore = (pagination?.currentPage || 1) < (pagination?.totalPages || 1);
  const handleLoadMore = () => {
    if (loading || !hasMore) return;
    fetchData({
      page: (pagination?.currentPage || 1) + 1,
      pageSize: pageInfo.pageSize,
      search: searchQuery,
      append: true,
    });
  };

  // Reuses the exact single-order cancel mechanism from ViewOrders.jsx
  // (PATCH /api/order-management/:id/status) — orders are never hard-deleted.
  const cancelOrder = async (id) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("authTokenStoreAdmin")
        : null;
    await fetch(`/api/order-management/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ status: "Cancelled" }),
    });
  };

  const filterOptions = (data, query) => {
    const searchLower = query.toLowerCase();

    return data.filter((item) => {
      const category = item?.category?.toLowerCase() || "";

      return category?.includes(searchLower);
    });
  };

  const handleRetry = () => {
    fetchData({
      page: pageInfo.pageIndex + 1,
      pageSize: pageInfo.pageSize,
      search: searchQuery,
    });
  };

  if (error) {
    return (
      <Alert variant="destructive" appearance="light" close={false}>
        <AlertIcon>
          <AlertCircle />
        </AlertIcon>
        <AlertContent>
          <AlertTitle>Failed to load orders</AlertTitle>
          <AlertDescription>
            Please try refreshing or contact support if the problem persists.
          </AlertDescription>
        </AlertContent>
        <AlertToolbar>
          <Button size="sm" variant="destructive" onClick={handleRetry}>
            <RefreshCw className="size-4" />
            Retry
          </Button>
        </AlertToolbar>
      </Alert>
    );
  }

  if (!loading && !searchQuery && (!list || list.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
        <PackageOpen className="size-10 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm font-medium text-foreground">No orders yet</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Create your first order to get started. New orders placed on the
          storefront will also appear here automatically.
        </p>
      </div>
    );
  }

  return (
    <>
      <ListWithCardToggle
        resizableColumns
        title="Order List"
        data={list}
        columns={columns}
        pagination={pageInfo}
        filterOptions={filterOptions}
        onPaginationChange={(updater) => {
          let newPageInfo =
            typeof updater === "function" ? updater(pageInfo) : updater;

          if (!newPageInfo) return;

          setPageInfo(newPageInfo);

          fetchData({
            page: newPageInfo.pageIndex + 1,
            pageSize: newPageInfo.pageSize,
            search: searchQuery,
          });
        }}
        pageCount={pagination?.totalPages || 1}
        totalCount={pagination?.total || 0}
        paginationLinks={pagination?.links}
        serverSidePagination
        infiniteScroll
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        loadingMore={loading && list.length > 0}
        bulkActions={[
          {
            key: "cancel",
            label: "Cancel Orders",
            variant: "destructive",
            confirmMessage:
              "Cancel the selected order(s)? This cannot be undone.",
            onRun: async (rows) => {
              await Promise.all(rows.map((r) => cancelOrder(r.id)));
              fetchData({
                page: pageInfo.pageIndex + 1,
                pageSize: pageInfo.pageSize,
                search: searchQuery,
              });
            },
          },
        ]}
        searchQuery={searchQuery}
        onSearchChange={(query) => {
          setSearchQuery(query);

          if (searchDebounce.current) clearTimeout(searchDebounce.current);
          searchDebounce.current = setTimeout(() => {
            const payload = {
              page: 1,
              pageSize: pageInfo.pageSize,
              search: query,
            };
            fetchData(payload);
            setPageInfo((p) => ({ ...p, pageIndex: 0 }));
          }, 300);
        }}
      />

      <ViewOrders
        open={openOrderDetailSheet}
        onClose={() => setOpenOrderDetailSheet(false)}
        orders={editData}
        orderId={selectedOrderId}
      />
    </>
  );
};

export default AllOrders;
