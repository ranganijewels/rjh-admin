"use client";

import React, { useEffect, useRef, useState } from "react";
import { Upload, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SafeImage } from "@/components/common/ui/safe-image";

const authHeaders = () => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("authTokenStoreAdmin")
      : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export function detectType(url) {
  const u = (url || "").toLowerCase();
  if (/\.(glb|gltf)(\?|$)/.test(u)) return "model";
  if (/\.(mp4|webm|mov|avi|m4v)(\?|$)/.test(u)) return "video";
  return "image";
}

// Loads Google's <model-viewer> web component once.
function useModelViewer() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.customElements?.get("model-viewer")) return;
    if (document.getElementById("model-viewer-script")) return;
    const s = document.createElement("script");
    s.id = "model-viewer-script";
    s.type = "module";
    s.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js";
    document.head.appendChild(s);
  }, []);
}

export function MediaPreview({ url, type, className }) {
  useModelViewer();
  const t = type || detectType(url);
  if (!url) return <div className={`bg-muted ${className}`} />;
  if (t === "video") {
    return <video src={url} className={className} muted loop playsInline controls />;
  }
  if (t === "model") {
    return (
       
      <model-viewer
        src={url}
        camera-controls=""
        auto-rotate=""
        style={{ width: "100%", height: "100%", background: "#f5f5f5" }}
      ></model-viewer>
    );
  }
  return <SafeImage src={url} alt="" className={className} />;
}

const ROLES = ["gallery", "main", "rollover"];

// Manages an unbounded list of media (image/video/3D) for one metal color.
export default function MediaManager({ color, items, onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const added = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/product-management/upload", {
          method: "POST",
          headers: authHeaders(),
          body: fd,
        });
        // A file over the server's size limit never reaches our JSON route —
        // nginx returns its own HTML "413 Request Entity Too Large" page, and
        // res.json() on that throws a confusing "Unexpected token '<'"
        // instead of a real error. Detect that case explicitly.
        if (res.status === 413) {
          throw new Error(`${file.name} is too large for the server to accept. Try a smaller/compressed file.`);
        }
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.url) throw new Error(json?.error || "Upload failed");
        added.push({ url: json.url, type: detectType(json.url), role: "gallery", seoAltText: "" });
      }
      onChange([...items, ...added]);
      toast.success(`${added.length} file(s) uploaded`);
    } catch (e) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const setRole = (i, role) => {
    // Only one main / one rollover per color
    const next = items.map((it, idx) => {
      if (idx === i) return { ...it, role };
      if ((role === "main" || role === "rollover") && it.role === role) {
        return { ...it, role: "gallery" };
      }
      return it;
    });
    onChange(next);
  };

  const setAltText = (i, seoAltText) => {
    onChange(items.map((it, idx) => (idx === i ? { ...it, seoAltText } : it)));
  };

  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));

  // Swatch + label per metal colour. Silver/Platinum are their own metals (not
  // "… Gold"), so label them by colour name and give them a neutral swatch.
  const SWATCHES = {
    White: "bg-gray-200 dark:bg-secondary",
    Yellow: "bg-yellow-300",
    Rose: "bg-[#e6b8a2]",
    Silver: "bg-gray-300 dark:bg-secondary",
    Platinum: "bg-slate-300",
  };
  const swatch = SWATCHES[color] || "bg-gray-200 dark:bg-secondary";
  // Gold colours read naturally as "White Gold"; Silver/Platinum stand alone.
  const label = ["White", "Yellow", "Rose"].includes(color) ? `${color} Gold` : color;

  return (
    <div className="border border-border rounded-lg p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`inline-block w-4 h-4 rounded-full border ${swatch}`} />
          <span className="text-sm font-medium">{label}</span>
          <span className="text-xs text-muted-foreground">({items.length})</span>
        </div>
        <button
          type="button"
          onClick={() => !uploading && inputRef.current?.click()}
          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-border hover:bg-muted"
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          Add image / video / 3D
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*,.glb,.gltf,model/gltf-binary"
          className="hidden"
          onChange={(e) => upload(Array.from(e.target.files || []))}
        />
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">
          No media yet. Add as many images, videos, or 3D models (.glb) as you like.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map((it, i) => (
            <div key={i} className="border border-border rounded-md overflow-hidden">
              <div className="aspect-square bg-muted/30 relative">
                <MediaPreview url={it.url} type={it.type} className="w-full h-full object-cover" />
                <span className="absolute top-1 left-1 text-[10px] px-1 rounded bg-black/60 text-white uppercase">
                  {it.type}
                </span>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 text-white hover:bg-black"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
              <select
                value={it.role || "gallery"}
                onChange={(e) => setRole(i, e.target.value)}
                className="w-full text-xs border-t border-border px-1 py-1 bg-background"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r === "main" ? "★ Main" : r === "rollover" ? "↻ Rollover" : "Gallery"}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={it.seoAltText || ""}
                onChange={(e) => setAltText(i, e.target.value)}
                placeholder="Alt text (SEO)"
                title="Describes the image for search engines and screen readers"
                className="w-full text-xs border-t border-border px-1.5 py-1 bg-background placeholder:text-muted-foreground/70"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
