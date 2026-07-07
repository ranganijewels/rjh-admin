import { useCrudApi } from "@/hooks/useCrudApi";
import { toast } from "sonner";

export const useMarginService = () => {
  const { create } = useCrudApi("/api/pricing-margin/by-category");

  const updateSingleMargin = async ({
    product_id,
    category_id,
    store_margin,
  }) => {
    try {
      const payload = {
        margin_type: 2,
        products: [
          {
            product_id: Number(product_id),
            category_id: Number(category_id),
            store_margin: Number(store_margin),
          },
        ],
      };

      await create(payload);
      toast.success("Margin updated successfully!");
      return true;
    } catch (error) {
      console.error("Error updating margin:", error);
      toast.error("Failed to update margin.");
      return false;
    }
  };

  const updateBulkMargin = async (products, store_margin) => {
    try {
      const payload = {
        margin_type: 2,
        products: products.map((item) => ({
          product_id: Number(item.id),
          category_id: Number(item.category_id),
          store_margin: Number(store_margin),
        })),
      };

      await create(payload);
      toast.success(
        `Bulk margin updated to ${store_margin}% for ${products.length} products`
      );
      return true;
    } catch (error) {
      console.error("Bulk update failed:", error);
      toast.error("Failed to update bulk margins.");
      return false;
    }
  };

  return {
    updateSingleMargin,
    updateBulkMargin,
  };
};
