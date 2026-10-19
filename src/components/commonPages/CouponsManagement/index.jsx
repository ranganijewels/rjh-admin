"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/common/ui/button";
import { Page, PageHeader } from "@/components/common/ui/page";
import {
  StatusFilter,
  buildStatusOptions,
} from "@/components/common/ui/status-filter";
import { Plus } from "lucide-react";
import { ListWithCardToggle } from "@/components/common/ListWithCardToggle";
import useCouponsList from "./useCouponsList";
import ConfirmDialog from "@/components/common/ui/ConfirmDialog";
// import { COUPONS_DATA } from "./constant";
import CouponAddDialog from "./CouponAddDialog";
import { useCrudList } from "@/hooks/useCrudList";
import { useCrudApi } from "@/hooks/useCrudApi";
import { ContentLoader } from "@/components/common/ui/Loader/content-loader";
import { usePermissions } from "@/provider/permission-provider";

const CouponsManagement = () => {
  const { can } = usePermissions();
  const {
    list,
    loading,
    error,
    editData,
    setEditData,
    setDeleteId,
    dialogOpen,
    setDialogOpen,
    confirmOpen,
    setConfirmOpen,
    fetchData,
    handleDelete,
  } = useCrudList("/api/coupon-management");
  const { remove } = useCrudApi("/api/coupon-management");
  const [statusFilter, setStatusFilter] = useState("all");

  const columns = useCouponsList({
    canEdit: can("coupons", "edit"),
    canDelete: can("coupons", "delete"),
    onEdit: (item) => {
      setEditData(item);
      setDialogOpen(true);
    },
    onDelete: (id) => {
      setDeleteId(id);
      setConfirmOpen(true);
    },
  });

  const filterOptions = (data, query) => {
    const searchLower = query.toLowerCase();
    return data.filter((item) => {
      const category = item?.code?.toLowerCase() || "";
      return category.includes(searchLower);
    });
  };


  const couponStatus = (coupon) => (coupon?.is_active ? "Active" : "Inactive");

  const statusOptions = useMemo(
    () =>
      buildStatusOptions(list, couponStatus, {
        allLabel: "All coupons",
        order: ["Active", "Inactive"],
      }),
    [list]
  );

  const scopedList = useMemo(
    () =>
      statusFilter === "all"
        ? list
        : (list || []).filter((coupon) => couponStatus(coupon) === statusFilter),
    [list, statusFilter]
  );

  if (loading) return <ContentLoader />;
  if (error) return <div>Error: {error}</div>;

  return (
    <Page>
      <PageHeader
        title="Coupons"
        description="Discount codes, their limits and validity window — toggle one to put it live on the storefront."
        actions={
          can("coupons", "create") ? (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="size-4" /> Add Coupon
            </Button>
          ) : null
        }
      />

      <StatusFilter
        options={statusOptions}
        value={statusFilter}
        onChange={setStatusFilter}
        ariaLabel="Coupon status"
      />

      <ListWithCardToggle
        titleAs="none"
        data={scopedList}
        columns={columns}
        filterFunction={filterOptions}
        resizableColumns
        infiniteScroll
        bulkActions={can("coupons", "delete") ? [
          {
            key: "delete",
            label: "Delete",
            variant: "destructive",
            confirmMessage:
              "Delete the selected coupon(s)? This cannot be undone.",
            onRun: async (rows) => {
              await Promise.all(rows.map((r) => remove(r.id)));
              fetchData();
            },
          },
        ] : []}
      />

      <CouponAddDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditData(null);
        }}
        onSuccess={fetchData}
        editData={editData}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Coupon"
        message="Are you sure you want to delete this coupon? This action cannot be undone."
      />
    </Page>
  );
};

export default CouponsManagement;
