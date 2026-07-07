"use client";

import { useCrudList } from "@/hooks/useCrudList";
import React, { useCallback, useState } from "react";
import { useCustomMarginProductsColumns } from "../../MarginSetup/hooks/useCustomMarginProductsColumns";
import { ContentLoader } from "@/components/common/ui/Loader/content-loader";
import { ListWithCardToggle } from "@/components/common/ListWithCardToggle";
import ProductCard from "../../ProductManagement/ProductMasterList/ProductCard";
import { ProductCardView } from "../../ProductManagement/ProductMasterList/ProductCardView";

const ByIndividual = () => {
  const [openProductDetailSheet, setOpenProductDetailSheet] = useState(false);
  const [selectedRole, setSelectedRole] = useState("all");
  const [searchQuery, setSearchQuery] = useState();

  const {
    list,
    loading,
    error,
    editData,
    setEditData,
    dialogOpen,
    setDialogOpen,
    fetchData,
    fetchById,
    pagination,
  } = useCrudList("/api/pricing-margin/by-product");

  const [selectedProductId, setSelectedProductId] = useState(
    editData?._id || null
  );
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  const handleSelectAll = () => {
    if (selectedProductIds.length === list.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(list.map((item) => item.id));
    }
  };
  const renderStoreCardsView = (item, { isSelected, toggleSelect }) => (
    <ProductCard
      key={item?.id}
      productId={item?.id}
      product_image={item?.product_image}
      design_no={item?.design_no}
      category={item?.category}
      style={item?.style}
      shape={item?.shape}
      mrp={item?.mrp}
      srp={item?.srp}
      collection={item?.collection}
      gender={item?.gender}
      hideRemove
      hideEdit
      hideActiveCell
      isSelected={isSelected}
      onToggleSelect={(e) => {
        e?.stopPropagation?.();
        toggleSelect(e);
      }}
      onClick={async () => {
        try {
          setSelectedProductId(item?.id);
          const data = await fetchById(item?.id);
          setEditData(data?.data);
          setOpenProductDetailSheet(true);
        } catch (err) {}
      }}
    />
  );

  const columns = useCustomMarginProductsColumns({
    onView: async (item) => {
      try {
        setSelectedProductId(item?.id);
        const data = await fetchById(item?.id);
        setEditData(data?.data);
        setOpenProductDetailSheet(true);
      } catch (err) {}
    },
    onRefresh: fetchData,
  });

  const handleClose = useCallback(() => {
    setOpenProductDetailSheet(false);
    setSelectedProductId(null);
  }, []);

  const filterOptions = (data, query) => {
    const searchLower = query.toLowerCase();

    return data.filter((item) => {
      const category = item?.category?.toLowerCase() || "";

      return category?.includes(searchLower);
    });
  };

  if (loading) return <ContentLoader />;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <ListWithCardToggle
        title="By Individual"
        data={list}
        columns={columns}
        filterOptions={filterOptions}
        // renderCardView={renderStoreCardsView}
        searchQuery={searchQuery}
        showBulkMargin
        onSearchChange={(query) => {
          setSearchQuery(query);
          fetchData(query);
        }}
        onRefresh={fetchData}
        extraHeaderContent={
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedProductIds.length === list.length}
              onChange={handleSelectAll}
            />
            <span>Select All</span>
          </div>
        }
      />

      <ProductCardView
        open={openProductDetailSheet}
        closeProductDetailSheet={handleClose}
        product={editData}
        productId={selectedProductId}
      />
    </>
  );
};

export default ByIndividual;
