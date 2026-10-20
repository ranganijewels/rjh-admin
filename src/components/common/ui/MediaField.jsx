"use client";
import React, { useId, useRef, useState } from "react";
import { UploadCloud, Trash2 } from "lucide-react";
import { Button } from "@/components/common/ui/button";
import { Input } from "@/components/common/ui/input";
import { SafeImage } from "@/components/common/ui/safe-image";

const authHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authTokenStoreAdmin") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Image field with upload + manual URL entry + live preview + clear. Posts to
// /api/media/upload (proxies NestJS /media/upload, same MinIO-backed endpoint
// the product-image uploader already uses).
const MediaField = ({
  label,
  value,
  onChange,
  prefix = "cms",
  bucket = "cms-media",
  accept = "image/*",
  aspectClassName = "aspect-video",
  hint,
}) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputId = useId();

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch(
        `/api/media/upload?bucket=${encodeURIComponent(bucket)}&prefix=${encodeURIComponent(prefix)}`,
        { method: "POST", headers: authHeaders(), body }
      );
      const data = await res.json();
      if (!res.ok || !data?.url) throw new Error(data?.error || "Upload failed");
      onChange(data.url);
    } catch (e) {
      setError(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor={inputId} className="text-xs font-medium text-muted-foreground">
            {label}
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            <UploadCloud className="h-3.5 w-3.5" />
            {uploading ? "Uploading…" : "Upload"}
          </Button>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
      )}

      <div
        className={`rounded-md border border-input bg-muted/30 overflow-hidden ${aspectClassName} flex items-center justify-center relative`}
      >
        {value ? (
          <SafeImage src={value} alt={label ? `${label} preview` : "Media preview"} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs text-muted-foreground px-3 text-center">
            No image — upload or paste a URL
          </span>
        )}
        {value && (
          <button
            type="button"
            title="Remove"
            aria-label="Remove image"
            onClick={() => onChange("")}
            className="absolute top-1.5 right-1.5 bg-background/90 rounded-md p-1.5 shadow-sm hover:bg-background"
          >
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </button>
        )}
      </div>

      <Input
        className="mt-2 text-xs"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://… or upload above"
      />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
      {hint && !error && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
};

export default MediaField;
