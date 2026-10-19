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

const authHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("authTokenStoreAdmin") : null;
  return { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) };
};

const blankContent = (layout) => (layout === "tiles" ? { mediaTiles: [] } : { columns: [], imageSection: null });

// Editor for the storefront's rich mega-menu dropdowns. The pill list is no
// longer a fixed 5 — it's every top-level item in CMS > Navigation that has
// "Rich mega-menu" enabled (see NavItemModel.jsx), keyed by that item's
// stable metadata.megaMenuKey. Content itself is still backed by the
// generic CmsSection system (pageSlug='mega-menu'), unchanged.
const MegaMenuManager = () => {
  const [navMenuItems, setNavMenuItems] = useState([]); // [{key, navId, label, layout}]
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [active, setActive] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [navRes, secRes] = await Promise.all([
        fetch("/api/cms/navigation", { headers: authHeaders() }),
        fetch(`/api/cms/sections?pageSlug=${PAGE_SLUG}`, { headers: authHeaders() }),
      ]);
      const navJson = await navRes.json();
      const secJson = await secRes.json();

      const items = (navJson?.data || [])
        .filter((item) => !item.parentId && item.metadata?.hasMegaMenu && item.metadata?.megaMenuKey)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((item) => ({
          key: item.metadata.megaMenuKey,
          navId: item.id,
          label: item.label,
          layout: item.metadata.megaMenuLayout === "tiles" ? "tiles" : "columns",
        }));
      setNavMenuItems(items);

      const map = {};
      (secJson?.data || []).forEach((s) => {
        map[s.sectionKey] = s;
      });
      setSections(map);

      setActive((prevActive) =>
        items.some((m) => m.key === prevActive) ? prevActive : items[0]?.key || null
      );
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
      toast.success("Starter content loaded");
      await load();
    } catch {
      toast.error("Failed to load starter content");
    } finally {
      setSeeding(false);
    }
  };

  const activeItem = navMenuItems.find((m) => m.key === active);
  const current = active ? sections[active] : null;

  const setContent = (content) => {
    if (!activeItem) return;
    setSections((prev) => ({
      ...prev,
      [activeItem.key]: {
        ...(prev[activeItem.key] || {
          sectionKey: activeItem.key,
          sectionType: activeItem.layout === "tiles" ? "mega-menu-tiles" : "mega-menu",
          label: activeItem.label,
          sortOrder: navMenuItems.findIndex((m) => m.key === activeItem.key),
        }),
        content,
      },
    }));
  };

  const handleSave = async () => {
    if (!activeItem) return;
    const sec = current || {
      sectionKey: activeItem.key,
      sectionType: activeItem.layout === "tiles" ? "mega-menu-tiles" : "mega-menu",
      label: activeItem.label,
      sortOrder: navMenuItems.findIndex((m) => m.key === activeItem.key),
      content: blankContent(activeItem.layout),
    };
    setSaving(true);
    try {
      const payload = {
        pageSlug: PAGE_SLUG,
        sectionKey: sec.sectionKey,
        sectionType: sec.sectionType,
        label: activeItem.label,
        sortOrder: sec.sortOrder ?? 0,
        isPublished: true,
        content: sec.content,
      };
      const res = sec.id
        ? await fetch(`/api/cms/sections/${sec.id}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(payload) })
        : await fetch("/api/cms/sections", { method: "POST", headers: authHeaders(), body: JSON.stringify(payload) });
      if (!res.ok) throw new Error();
      const saved = await res.json();
      setSections((prev) => ({ ...prev, [activeItem.key]: saved?.data || saved }));
      toast.success(`${activeItem.label} menu saved & published`);
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const missingCount = navMenuItems.filter((m) => !sections[m.key]).length;
  const content = current?.content || blankContent(activeItem?.layout);

  return (
    <div>
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text="Mega Menu Content" className="font-semibold !text-foreground text-lg" />
          <ToolbarDescription className="mt-1 text-sm">
            Edit the images, columns, links, and CTA for any nav item with "Rich mega-menu" enabled — turn that
            on per item in CMS → Navigation.
          </ToolbarDescription>
        </ToolbarHeading>
        {!loading && missingCount > 0 && (
          <ToolbarActions>
            <Button variant="outline" onClick={handleSeed} disabled={seeding}>
              {seeding ? "Loading…" : "Load starter content"}
            </Button>
          </ToolbarActions>
        )}
      </Toolbar>

      {loading ? (
        <p className="text-sm text-muted-foreground mt-4">Loading…</p>
      ) : navMenuItems.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-8 text-center mt-4">
          <p className="text-sm text-muted-foreground">
            No nav items have a rich mega-menu yet. Go to CMS → Navigation, edit (or add) a top-level item, and
            check "Rich mega-menu" — it'll show up here to edit.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mt-4 mb-4">
            {navMenuItems.map((m) => (
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
                {!sections[m.key] && <span className="ml-1.5 text-[10px] opacity-70">(not set up)</span>}
              </button>
            ))}
          </div>

          {!current && (
            <p className="text-sm text-muted-foreground mb-3">
              No content saved yet for {activeItem?.label} — build it below and Save &amp; Publish.
            </p>
          )}
          {activeItem?.layout === "tiles" ? (
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
