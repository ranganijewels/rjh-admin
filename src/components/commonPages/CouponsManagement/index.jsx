"use client";

import React from "react";
import { Button } from "@/components/common/ui/button";
import { Plus } from "lucide-react";
import { ListWithCardToggle } from "@/components/common/ListWithCardToggle";
import useCouponsList from "./useCouponsList";
import ConfirmDialog from "@/components/common/ui/ConfirmDialog";
// import { COUPONS_DATA } from "./constant";
import CouponAddDialog from "./CouponAddDialog";
import { useCrudList } from "@/hooks/useCrudList";
import { ContentLoader } from "@/components/common/ui/Loader/content-loader";

const CouponsManagement = () => {
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

  const columns = useCouponsList({
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

  if (loading) return <ContentLoader />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4">
      <ListWithCardToggle
        title="Coupons Management"
        data={list}
        columns={columns}
        filterFunction={filterOptions}
        resizableColumns
        createBtn={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Coupons
          </Button>
        }
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
    </div>
  );
};

export default CouponsManagement;
