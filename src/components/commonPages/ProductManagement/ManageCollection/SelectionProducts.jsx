"use client";

import React, { useEffect, useState } from "react";
import { ListWithCardToggle } from "@/components/common/ListWithCardToggle";
import { useSelectionColumns } from "../hooks/useSelectionColumns";
import { useCrudApi } from "@/hooks/useCrudApi";
import { toast } from "sonner";
import { useParams } from "next/navigation";

const SelectionProducts = () => {
  const params = useParams();
  const collectionId = params.id; // collection ID from route
  const storeId = localStorage.getItem("storeId"); // store ID

  const [products, setProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const { fetchAll } = useCrudApi("/api/product-management");
  const { create } = useCrudApi("/api/product-management/selection-products");

  // Fetch products
  const fetchAllCollections = async () => {
    try {
      setLoading(true);
      const res = await fetchAll();
      if (res?.data?.length) {
        // Add checkbox field for UI state
        const productsWithCheckbox = res.data.map((item) => ({
          ...item,
          checkboxes: selectedIds.includes(item.id),
        }));
        setProducts(productsWithCheckbox);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Failed to fetch collections:", err);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCollections();
  }, []);

  // Handle checkbox click
  const handleCheckboxChange = async (item) => {
    if (!storeId || !collectionId) {
      toast.error("Store ID or Collection ID is missing!");
      return;
    }

    try {
      const payload = {
        store_id: storeId,
        collection_id: collectionId,
        product_ids: [item.id],
      };

      await create(payload);

      setSelectedIds((prev) =>
        prev.includes(item.id)
          ? prev.filter((id) => id !== item.id)
          : [...prev, item.id]
      );

      setProducts((prev) =>
        prev.map((p) =>
          p.id === item.id ? { ...p, checkboxes: !p.checkboxes } : p
        )
      );

      toast.success("Product selection updated!");
    } catch (err) {
      console.error("Error updating product:", err);
      toast.error("Failed to update selection");
    }
  };

  const checkboxColumn = {
    id: "checkboxes",
    header: () => (
      <div className="flex items-center justify-center">Select</div>
    ),
    accessorFn: (row) => row.checkboxes,
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <input
          type="checkbox"
          className="h-4 w-4 cursor-pointer"
          checked={row.original.checkboxes}
          onChange={() => handleCheckboxChange(row.original)}
        />
      </div>
    ),
    size: 80,
  };

  const columns = [
    checkboxColumn,
    ...useSelectionColumns({
      editingCell: null,
      setEditingCell: () => {},
      editedValue: null,
      handleSaveEdit: () => {},
      onClick: () => {},
      onView: () => {},
    }),
  ];

  return (
    <div className="space-y-4">
      <ListWithCardToggle
        title="Selection Products"
        data={products}
        columns={columns}
        loading={loading}
        resizableColumns
        infiniteScroll
        bulkActions={[
          {
            key: "addToCollection",
            label: "Add to Collection",
            onRun: async (rows) => {
              if (!storeId || !collectionId) {
                toast.error("Store ID or Collection ID is missing!");
                return;
              }
              await Promise.all(
                rows.map((r) =>
                  create({
                    store_id: storeId,
                    collection_id: collectionId,
                    product_ids: [r.id],
                  })
                )
              );
              const ids = rows.map((r) => r.id);
              setSelectedIds((prev) => [...new Set([...prev, ...ids])]);
              setProducts((prev) =>
                prev.map((p) =>
                  ids.includes(p.id) ? { ...p, checkboxes: true } : p
                )
              );
              toast.success("Selected products added to collection!");
            },
          },
        ]}
      />
    </div>
  );
};

export default SelectionProducts;
