"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useCrudApi } from "@/hooks/useCrudApi";

// The upstream orders endpoint (`GET /api/v1/orders`) accepts only
// page / limit / sortBy / sortDir / search — there is no server-side status or
// date filter. To keep the status tabs, the KPI cards and the "Showing X–Y of
// Z" footer consistent with each other, the list is loaded in full and the
// filtering happens on the client.
const PAGE_LIMIT = 100; // upstream caps `limit` at 100
const MAX_PAGES = 10; // safety ceiling: 1,000 orders

export function useOrderList() {
  const { fetchByPages } = useCrudApi("/api/order-management");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [truncated, setTruncated] = useState(false);

  // `useCrudApi` rebuilds its client on every render, so keep the latest
  // fetcher in a ref instead of depending on it — otherwise the load effect
  // would re-run on every render.
  const fetchRef = useRef(fetchByPages);
  useEffect(() => {
    fetchRef.current = fetchByPages;
  });

  // Guards against out-of-order responses when the list is refreshed.
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);

    try {
      const first = await fetchRef.current({ page: 1, limit: PAGE_LIMIT });
      if (id !== requestId.current) return;

      const rows = [...(first?.data || [])];
      const serverTotal = Number(first?.meta?.total) || rows.length;
      const pageCount = Math.max(
        1,
        Math.ceil(serverTotal / PAGE_LIMIT)
      );
      const pagesToLoad = Math.min(pageCount, MAX_PAGES);

      for (let page = 2; page <= pagesToLoad; page++) {
        const res = await fetchRef.current({ page, limit: PAGE_LIMIT });
        if (id !== requestId.current) return;
        rows.push(...(res?.data || []));
      }

      setOrders(rows);
      setTotal(serverTotal);
      setTruncated(serverTotal > rows.length);
    } catch (e) {
      if (id !== requestId.current) return;
      setOrders([]);
      setError(e?.message || "Failed to load orders");
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { orders, loading, error, total, truncated, refresh: load };
}

export default useOrderList;
