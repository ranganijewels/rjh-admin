import { storeAdminCrud } from "@/services/storeAdminCrud";
import { useCallback } from "react";

export const useCrudApi = (baseUrl) => {
  const api = storeAdminCrud(baseUrl);

  return {
    fetchAll: useCallback(api.fetchAll, []),
    fetchByPages: useCallback(api.fetchByPages, [api]),
    fetchById: useCallback(api.fetchById, []),
    create: useCallback(api.create, []),
    update: useCallback(api.update, []),
    remove: useCallback(api.remove, []),
    toggleStatus: useCallback(api.toggleStatus, []),
  };
};
