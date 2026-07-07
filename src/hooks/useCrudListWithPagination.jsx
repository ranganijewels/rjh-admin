"use client";
import { useCallback, useEffect, useState } from "react";
import { useCrudApi } from "@/hooks/useCrudApi";

export function useCrudListWithPagination(path, extraParams = {}) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    per_page: 10,
    links: [],
  });

  const { fetchByPages, remove, fetchById } = useCrudApi(path);

  const fetchData = useCallback(
    async (params = {}) => {
      const { page = 1, pageSize = 10, ...rest } = params;
      setLoading(true);
      try {
        const body = {
          page,
          limit: pageSize,
          ...rest, // search, category_id, metal_color, shape, status, …
          ...extraParams,
        };

        const res = await fetchByPages(body);
        setList(res.data || []);
        setPagination({
          currentPage: res?.meta?.current_page || page,
          totalPages: res?.meta?.last_page || 1,
          total: res?.meta?.total || 0,
          per_page: res?.meta?.per_page || pageSize,
          links: res?.meta?.links || [],
        });
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [fetchByPages, extraParams]
  );

  useEffect(() => {
    fetchData({ page: 1, pageSize: 10 });
  }, []);

  const handleDelete = async () => {
    try {
      await remove(deleteId);
      setConfirmOpen(false);
      setDeleteId(null);
      fetchData({
        page: pagination.currentPage,
        pageSize: pagination.per_page,
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return {
    list,
    loading,
    error,
    editData,
    setEditData,
    deleteId,
    dialogOpen,
    setDialogOpen,
    confirmOpen,
    setConfirmOpen,
    setDeleteId,
    fetchData,
    handleDelete,
    fetchById,
    pagination,
  };
}
