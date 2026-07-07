import { useMemo } from "react";
export const useFilteredStoreData = (query,data) => {
  return useMemo(() => {
    if (!query) return data;    return data.filter((item) =>
      (item.designNo && item.designNo.toLowerCase().includes(query.toLowerCase())) ||
      (item.category && item.category.toLowerCase().includes(query.toLowerCase())) ||
      (item.style && item.style.toLowerCase().includes(query.toLowerCase())) ||
      (item.status && item.status.toLowerCase().includes(query.toLowerCase()))
    );
  }, [query]);
};
