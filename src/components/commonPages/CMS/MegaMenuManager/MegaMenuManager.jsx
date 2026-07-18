"use client";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/common/ui/button";
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from "@/components/common/ui/toolbar";
import StandardMenuEditor from "./StandardMenuEditor";
import CustomizeMenuEditor from "./CustomizeMenuEditor";

const PAGE_SLUG = "mega-menu";

const MENU_KEYS = [
  { key: "engagement", label: "Engagement" },
  { key: "wedding", label: "Wedding" },
  { key: "jewelry", label: "Jewelry" },
  { key: "customize", label: "Customize" },
  { key: "about-us", label: "About Us" },
];

const authHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("authTokenStoreAdmin") : null;
  return { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) };
};

const blankContent = (key) => (key === "customize" ? { mediaTiles: [] } : { columns: [], imageSection: null });

// Editor for the storefront's 5 rich mega-menu dropdowns. Backed by the
// generic CmsSection system (pageSlug='mega-menu', one row per menu key) —
// the same jsonb-content model already used for the Homepage editor. Menus
// with no row yet (never seeded, or a fresh tenant) can be populated from
// the "Load defaults" button, which seeds byte-identical content to what's
// currently hardcoded on the storefront — nothing changes live until saved.
const MegaMenuManager = () => {
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [active, setActive] = useState("engagement");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cms/sections?pageSlug=${PAGE_SLUG}`, { headers: authHeaders() });
      const json = await res.json();
      const map = {};
      (json?.data || []).forEach((s) => {
        map[s.sectionKey] = s;
      });
      setSections(map);
    } catch {
      toast.error("Failed to load mega menu content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/cms/sections/seed", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ pageSlug: PAGE_SLUG }),
      });
      if (!res.ok) throw new Error();
      toast.success("Default mega menu content loaded");
      await load();
    } catch {
      toast.error("Failed to load defaults");
    } finally {
      setSeeding(false);
    }
  };

  const current = sections[active];

  const setContent = (content) => {
    setSections((prev) => {
      const existing = prev[active];
      const idx = MENU_KEYS.findIndex((m) => m.key === active);
      return {
        ...prev,
        [active]: {
          ...(existing || {
            sectionKey: active,
            sectionType: active === "customize" ? "mega-menu-tiles" : "mega-menu",
            label: MENU_KEYS[idx]?.label || active,
            sortOrder: idx,
          }),
          content,
        },
      };
    });
  };

  const handleSave = async () => {
    const sec = current || {
      sectionKey: active,
      sectionType: active === "customize" ? "mega-menu-tiles" : "mega-menu",
      label: MENU_KEYS.find((m) => m.key === active)?.label || active,
      sortOrder: MENU_KEYS.findIndex((m) => m.key === active),
      content: blankContent(active),
    };
    setSaving(true);
    try {
      const payload = {
        pageSlug: PAGE_SLUG,
        sectionKey: sec.sectionKey,
        sectionType: sec.sectionType,
        label: sec.label,
        sortOrder: sec.sortOrder ?? 0,
        isPublished: true,
        content: sec.content,
      };
      const res = sec.id
        ? await fetch(`/api/cms/sections/${sec.id}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(payload) })
        : await fetch("/api/cms/sections", { method: "POST", headers: authHeaders(), body: JSON.stringify(payload) });
      if (!res.ok) throw new Error();
      const saved = await res.json();
      setSections((prev) => ({ ...prev, [active]: saved?.data || saved }));
      toast.success(`${MENU_KEYS.find((m) => m.key === active)?.label} menu saved & published`);
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const missingCount = MENU_KEYS.filter((m) => !sections[m.key]).length;
  const activeLabel = MENU_KEYS.find((m) => m.key === active)?.label;
  const content = current?.content || blankContent(active);

  return (
    <div>
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text="Mega Menu Content" className="font-semibold !text-foreground text-lg" />
          <ToolbarDescription className="mt-1 text-sm">
            Edit the images, columns, links, and CTA for the storefront's Engagement/Wedding/Jewelry/Customize/About Us dropdowns.
          </ToolbarDescription>
        </ToolbarHeading>
        {!loading && missingCount > 0 && (
          <ToolbarActions>
            <Button variant="outline" onClick={handleSeed} disabled={seeding}>
              {seeding ? "Loading…" : `Load defaults for ${missingCount} menu${missingCount > 1 ? "s" : ""}`}
            </Button>
          </ToolbarActions>
        )}
      </Toolbar>

      <div className="flex flex-wrap gap-2 mt-4 mb-4">
        {MENU_KEYS.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setActive(m.key)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              active === m.key
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:bg-muted/50"
            }`}
          >
            {m.label}
            {!loading && !sections[m.key] && <span className="ml-1.5 text-[10px] opacity-70">(not set up)</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <>
          {!current && (
            <p className="text-sm text-muted-foreground mb-3">
              No content saved yet for {activeLabel} — use "Load defaults" above to start from what's live today, or build it from scratch below.
            </p>
          )}
          {active === "customize" ? (
            <CustomizeMenuEditor content={content} onChange={setContent} />
          ) : (
            <StandardMenuEditor content={content} onChange={setContent} />
          )}
          <div className="mt-4 flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save & Publish"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default MegaMenuManager;
