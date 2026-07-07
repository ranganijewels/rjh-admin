// useCrudList.js
"use client";
import { useCallback, useEffect, useState } from "react";
import { useCrudApi } from "@/hooks/useCrudApi";

export function useCrudList(path) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { fetchAll, remove, fetchById } = useCrudApi(path);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAll();
      const nestedData = res?.data || [];

      const flatList = Array.isArray(nestedData[0])
        ? nestedData[0]
        : nestedData;

      setList(flatList);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchAll]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async () => {
    await remove(deleteId);
    setConfirmOpen(false);
    setDeleteId(null);
    fetchData();
  };

  return {
    list,
    setList,
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
  };
}
