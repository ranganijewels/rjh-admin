"use client";
import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useProductListColumns } from "./hooks/useProductListColumns";
import ProductCard from "./ProductCard";
import { ListWithCardToggle } from "@/components/common/ListWithCardToggle";
import { ContentLoader } from "@/components/common/ui/Loader/content-loader";
import ConfirmDialog from "@/components/common/ui/ConfirmDialog";
import { Button } from "@/components/common/ui/button";
import { Plus, X, Upload, Download, FileDown, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useCrudListWithPagination } from "@/hooks/useCrudListWithPagination";
import { toTitleCase } from "@/lib/utils";

/* ── Example CSV template ──────────────────────────────────────── */
// Header matches ALL columns in export-csv/route.js HEADERS array.
// Image naming: upload files as {productCode}-{metalColor}-main.jpg (gallery: -gallery-1.jpg etc.)
// OR paste a direct URL in the mainImageUrl column.
const EXAMPLE_CSV = `productName,productCode,shopifySku,category,subCategory,collectionName,metalType,metalPurity,metalColor,diamondShape,diamondQuality,diamondType,diamondCount,diamondWeightCt,centerStoneShape,centerStoneWeightCt,sideStoneDetails,grossWeightG,netWeightG,lengthMm,widthMm,heightMm,ringSize,gender,mainImageUrl,description,shortDescription,longDescription,seoTitle,seoDescription,shopifyTags,status,isReadyForQc,isReadyForShopify,variantType,variantValue
Solitaire Diamond Ring,RJ-RING-001,,Rings,Solitaire,Bridal Collection,Gold,18K,Yellow,Round,VS1-F,Lab Grown Diamond,1,0.5,Round,0.5,,4.2,3.8,,,, 7,Women,,Classic 4-prong solitaire engagement ring in 18K yellow gold,Solitaire ring in 18K gold,,Solitaire Diamond Ring — 18K Gold,,diamond ring solitaire gold,active,false,false,,
Halo Diamond Pendant,RJ-PEND-001,,Pendants,Halo,Everyday Luxury,Gold,18K,White,Oval,VS2-G,Lab Grown Diamond,12,0.75,Oval,0.25,12 round side stones,3.1,2.9,,,,, Women,,Oval center stone surrounded by a halo of round diamonds,Halo pendant in 18K white gold,,,,,active,false,false,,
Diamond Tennis Bracelet,RJ-BRAC-001,,Bracelets,Tennis,Heritage,Gold,14K,Rose,Round,SI1-H,Lab Grown Diamond,24,2.0,,,24 round brilliant diamonds,8.5,7.8,185,5,4,,Women,,Elegant tennis bracelet with 24 round diamonds set in 14K rose gold,Tennis bracelet in 14K rose gold,,,,,active,false,false,,
Silver Solitaire Ring,RJ-RING-S01,,Rings,Solitaire,Silver Collection,Silver,925 (Silver),White,Round,VS2-G,Lab Grown Diamond,1,0.25,Round,0.25,,2.8,2.5,,,, 6,Women,,Classic solitaire in 925 silver — great entry-level piece,925 silver solitaire ring,,,,,active,false,false,,`;

function downloadExampleCsv() {
  const blob = new Blob([EXAMPLE_CSV], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "product-import-example.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ── Import modal ──────────────────────────────────────────────── */
const ImportModal = ({ open, onClose, onImported }) => {
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [result, setResult] = useState(null);

  const reset = () => { setFile(null); setStatus("idle"); setResult(null); };
  const handleClose = () => { reset(); onClose(); };

  const handleImport = async () => {
    if (!file) return;
    setStatus("loading");
    const token = typeof window !== "undefined" ? localStorage.getItem("authTokenStoreAdmin") : null;
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/product-management/import-csv", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      const json = await res.json();
      if (json.error) { setResult({ error: json.error }); setStatus("error"); }
      else { setResult(json); setStatus("done"); onImported?.(); }
    } catch (e) {
      setResult({ error: e.message });
      setStatus("error");
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Import Products from CSV</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        {status === "idle" || status === "loading" ? (
          <>
            {/* Drop zone */}
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.name.endsWith(".csv")) setFile(f); }}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-orange-400 transition-colors"
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              {file ? (
                <p className="text-sm font-medium text-gray-700">{file.name} <span className="text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span></p>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-700">Click or drag & drop a CSV file</p>
                  <p className="text-xs text-gray-400 mt-1">Only .csv files accepted</p>
                </>
              )}
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
            </div>

            {/* Example download */}
            <button
              onClick={downloadExampleCsv}
              className="mt-3 flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium"
            >
              <FileDown className="w-3.5 h-3.5" /> Download example CSV template
            </button>

            {/* CSV column reference */}
            <details className="mt-3 text-xs text-gray-500">
              <summary className="cursor-pointer font-medium text-gray-600 hover:text-gray-800">Required columns</summary>
              <div className="mt-2 font-mono bg-gray-50 rounded p-2 leading-5 break-all">
                productName*, productCode, category, subCategory, metalType, metalPurity, metalColor, diamondShape, diamondQuality, diamondType, diamondCount, diamondWeightCt, grossWeightG, netWeightG, ringSize, collectionName, gender, description, status, makingCharge
              </div>
              <p className="mt-1 text-gray-400">* required · all others optional</p>
            </details>

            <div className="flex gap-2 mt-5">
              <Button variant="outline" className="flex-1" onClick={handleClose} disabled={status === "loading"}>Cancel</Button>
              <Button className="flex-1 bg-primary hover:bg-primary/90 text-white" onClick={handleImport} disabled={!file || status === "loading"}>
                {status === "loading" ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Importing…</> : <><Upload className="w-4 h-4 mr-2" />Import</>}
              </Button>
            </div>
          </>
        ) : status === "done" ? (
          <>
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-lg font-semibold text-gray-800">Import Complete</p>
              <div className="flex justify-center gap-6 mt-4 text-sm">
                <div className="text-center"><p className="text-2xl font-bold text-green-600">{result.created}</p><p className="text-gray-500">Created</p></div>
                <div className="text-center"><p className="text-2xl font-bold text-gray-800">{result.total}</p><p className="text-gray-500">Total rows</p></div>
                {result.failed > 0 && <div className="text-center"><p className="text-2xl font-bold text-red-500">{result.failed}</p><p className="text-gray-500">Failed</p></div>}
              </div>
            </div>
            {result.errors?.length > 0 && (
              <div className="mt-4 max-h-32 overflow-y-auto bg-red-50 rounded p-3 text-xs text-red-700 space-y-1">
                {result.errors.map((e, i) => <p key={i}>Row {e.row}: {e.reason}</p>)}
              </div>
            )}
            <Button className="w-full mt-5 bg-primary hover:bg-primary/90 text-white" onClick={handleClose}>Done</Button>
          </>
        ) : (
          <>
            <div className="text-center py-4">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <p className="text-lg font-semibold text-gray-800">Import Failed</p>
              <p className="text-sm text-red-600 mt-2">{result?.error}</p>
            </div>
            <div className="flex gap-2 mt-5">
              <Button variant="outline" className="flex-1" onClick={handleClose}>Close</Button>
              <Button className="flex-1 bg-primary hover:bg-primary/90 text-white" onClick={reset}>Try Again</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Compact server-driven filter dropdown.
const FilterSelect = ({ label, value, options, onChange }) => (
  <select
    value={value || "all"}
    onChange={(e) => onChange(e.target.value)}
    className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
  >
    <option value="all">All {label}</option>
    {options.map((o) => (
      <option key={o} value={o}>
        {toTitleCase(o)}
      </option>
    ))}
  </select>
);

const CATEGORIES = ["Rings", "Necklaces", "Wedding Bands", "Bracelets", "Earrings", "Pendants", "Bangles"];
const METAL_COLORS = ["White", "Yellow", "Rose"];
const SHAPES = ["Round", "Oval", "Princess", "Emerald", "Cushion", "Pear", "Marquise", "Radiant", "Asscher", "Heart"];

const authHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authTokenStoreAdmin") : null;
  return { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) };
};

const ProductMasterList = () => {
  const router = useRouter();
  const [pageInfo, setPageInfo] = useState({ pageIndex: 0, pageSize: 10 });
  const [searchQuery, setSearchQuery] = useState("");
  const [priceMap, setPriceMap] = useState({});
  const [importOpen, setImportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    metal_color: "",
    shape: "",
    status: "",
  });

  const {
    list,
    setList,
    loading,
    error,
    deleteId,
    setDeleteId,
    confirmOpen,
    setConfirmOpen,
    remove,
    fetchData,
    pagination,
  } = useCrudListWithPagination("/api/product-management");

  // Products store no price — fetch the live engine price for the visible page.
  // Infinite scroll keeps appending to `list`, so only request prices for ids
  // we haven't already priced — otherwise every scroll-triggered page would
  // re-fetch pricing for the entire accumulated list.
  useEffect(() => {
    const ids = (list || []).map((i) => i.id).filter(Boolean);
    const missingIds = ids.filter((id) => !(id in priceMap));
    if (!missingIds.length) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/pricing-engine/batch", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ productIds: missingIds }),
        });
        const json = await res.json();
        if (!cancelled) setPriceMap((prev) => ({ ...prev, ...(json?.map || {}) }));
      } catch {
        /* leave prices blank if the engine is unreachable */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [list]);

  // Re-fetch from the server whenever a filter changes (reset to page 1).
  const applyFilters = (next) => {
    setFilters(next);
    setPageInfo((p) => ({ ...p, pageIndex: 0 }));
    fetchData({
      page: 1,
      pageSize: pageInfo.pageSize,
      search: searchQuery,
      ...Object.fromEntries(Object.entries(next).filter(([, v]) => v)),
    });
  };

  const setFilter = (key, value) =>
    applyFilters({ ...filters, [key]: value === "all" ? "" : value });

  const clearFilters = () => applyFilters({ category: "", metal_color: "", shape: "", status: "" });
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const rows =
    list?.map((item) => ({
      id: item.id,
      title: item.title,
      product_image: item.product_image,
      design_no: item.design_no,
      category: item.category,
      style: item.style,
      shape: item.shape,
      metal_color: item.metal_color,
      live_price: priceMap[item.id],
      collection: item.collection,
      gender: item.gender,
      created_at: item.created_at,
      updated_at: item.updated_at,
    })) ?? [];

  // Filtering (client-side but applied to currently fetched data only)
  const filteredRows = useMemo(() => {
    let data = rows;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (r) =>
          r.category?.toLowerCase().includes(q) ||
          r.design_no?.toLowerCase().includes(q) ||
          r.style?.toLowerCase().includes(q)
      );
    }

    return data;
  }, [rows, searchQuery]);

  const handleView = useCallback(
    (product) => router.push(`/dashboard/product-management/view/${product.id}`),
    [router]
  );

  const handleAdd = () => router.push("/dashboard/product-management/add");

  const handleExport = async () => {
    setExporting(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authTokenStoreAdmin") : null;
      const res = await fetch("/api/product-management/export-csv", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `products-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch { /* silent */ } finally {
      setExporting(false);
    }
  };

  const handleEdit = useCallback(
    (product) => router.push(`/dashboard/product-management/edit/${product.id}`),
    [router]
  );

  const handleAskDelete = useCallback(
    (id) => {
      setDeleteId(id);
      setConfirmOpen(true);
    },
    [setDeleteId, setConfirmOpen]
  );

  // Removes locally instead of the hook's default re-fetch-current-page
  // behaviour, which would collapse the accumulated infinite-scroll list
  // back down to a single page.
  const handleConfirmDelete = async () => {
    await remove(deleteId);
    setList((prev) => prev.filter((item) => item.id !== deleteId));
    setConfirmOpen(false);
    setDeleteId(null);
  };

  const { columns } = useProductListColumns({
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleAskDelete,
  });

  const renderStoreCardsView = (item) => (
    <ProductCard
      key={item.id}
      {...item}
      onClick={() => handleView(item)}
      onEdit={() => handleEdit(item)}
      onDelete={() => handleAskDelete(item.id)}
    />
  );

  const hasMore = (pagination?.currentPage || 1) < (pagination?.totalPages || 1);
  const handleLoadMore = () => {
    if (loading || !hasMore) return;
    fetchData({
      page: (pagination?.currentPage || 1) + 1,
      pageSize: pageInfo.pageSize,
      search: searchQuery,
      append: true,
      ...activeFilters(),
    });
  };

  // Only show the full-page loader on the FIRST load. On pagination/filter
  // fetches keep the list mounted so the view toggle (grid/table) persists.
  if (loading && !list?.length) return <ContentLoader />;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  const activeFilters = () =>
    Object.fromEntries(Object.entries(filters).filter(([, v]) => v));

  return (
    <>
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <FilterSelect label="Category" value={filters.category} options={CATEGORIES} onChange={(v) => setFilter("category", v)} />
        <FilterSelect label="Metal Color" value={filters.metal_color} options={METAL_COLORS} onChange={(v) => setFilter("metal_color", v)} />
        <FilterSelect label="Diamond Shape" value={filters.shape} options={SHAPES} onChange={(v) => setFilter("shape", v)} />
        <FilterSelect label="Status" value={filters.status} options={["active", "inactive"]} onChange={(v) => setFilter("status", v)} />
        {activeFilterCount > 0 && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <X className="h-3.5 w-3.5 mr-1" /> Clear ({activeFilterCount})
          </Button>
        )}
      </div>

      <ListWithCardToggle
        title="Product Master List"
        description="All products available in the store"
        data={filteredRows}
        columns={columns}
        resizableColumns
        renderCardView={renderStoreCardsView}
        createBtn={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
              <Upload className="mr-1.5 h-4 w-4" /> Import CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
              {exporting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Download className="mr-1.5 h-4 w-4" />}
              Export CSV
            </Button>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </div>
        }
        pagination={pageInfo}
        onPaginationChange={(updater) => {
          const newPageInfo =
            typeof updater === "function" ? updater(pageInfo) : updater;
          setPageInfo(newPageInfo);
          fetchData({
            page: newPageInfo.pageIndex + 1,
            pageSize: newPageInfo.pageSize,
            search: searchQuery,
            ...activeFilters(),
          });
        }}
        pageCount={pagination?.totalPages || 1}
        totalCount={pagination?.total || 0}
        paginationLinks={pagination?.links}
        serverSidePagination
        infiniteScroll
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        loadingMore={loading && list.length > 0}
        searchQuery={searchQuery}
        onSearchChange={(query) => {
          setSearchQuery(query);
          fetchData({ search: query, ...activeFilters() });
        }}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
      />

      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={() => fetchData({ page: 1, pageSize: pageInfo.pageSize })}
      />
    </>
  );
};

export default ProductMasterList;
