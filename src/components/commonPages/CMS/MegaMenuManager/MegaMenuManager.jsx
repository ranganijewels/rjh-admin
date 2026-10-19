"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/common/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/common/ui/cards/card";
import { Badge } from "@/components/common/ui/badge";
import { PageHeader } from "@/components/common/ui/page";
import { cn } from "@/lib/utils";
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
      <PageHeader
        titleAs="h2"
        title="Mega Menu Content"
        description={
          <>
            Edit the images, columns, links, and CTA for any nav item with
            &quot;Rich mega-menu&quot; enabled — turn that on per item in CMS →
            Navigation.
          </>
        }
        actions={
          !loading && missingCount > 0 ? (
            <Button variant="outline" onClick={handleSeed} disabled={seeding}>
              {seeding ? "Loading…" : "Load starter content"}
            </Button>
          ) : null
        }
      />

      {loading ? (
        <Card className="mt-4">
          <CardContent className="p-6 text-sm text-muted-foreground">Loading…</CardContent>
        </Card>
      ) : navMenuItems.length === 0 ? (
        <Card className="mt-4 border-dashed">
          <CardContent className="p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No nav items have a rich mega-menu yet. Go to CMS → Navigation, edit
              (or add) a top-level item, and check &quot;Rich mega-menu&quot; — it&apos;ll
              show up here to edit.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Menu picker */}
          <Card className="mt-4">
            <CardHeader className="py-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Menus</p>
                <p className="text-xs text-muted-foreground">
                  {navMenuItems.length} nav {navMenuItems.length === 1 ? "item" : "items"} with a
                  rich mega-menu
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-border">
                {navMenuItems.map((m) => {
                  const isActive = active === m.key;
                  const isMissing = !sections[m.key];
                  return (
                    <li key={m.key}>
                      <button
                        type="button"
                        onClick={() => setActive(m.key)}
                        aria-current={isActive ? "true" : undefined}
                        className={cn(
                          "group flex w-full items-center gap-4 px-4 py-3.5 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                          isActive ? "bg-muted/60" : "hover:bg-muted/40"
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-foreground"
                          )}
                          aria-hidden="true"
                        >
                          {m.label?.charAt(0)?.toUpperCase() || "?"}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="truncate text-sm font-medium text-foreground">
                              {m.label}
                            </span>
                            {isMissing && (
                              <Badge appearance="outline" shape="circle" size="sm">
                                Not set up
                              </Badge>
                            )}
                          </span>
                          <span className="mt-0.5 block text-xs capitalize text-muted-foreground">
                            {m.layout === "tiles" ? "Media tiles" : "Columns + CTA"}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>

          {/* Editor */}
          <Card className="mt-5">
            <CardHeader className="py-4">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {activeItem?.label || "Menu"} content
                </p>
                <p className="text-xs text-muted-foreground">
                  {current
                    ? "Saved content — make your changes and publish again."
                    : "No content saved yet for this menu — build it below and save & publish."}
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {activeItem?.layout === "tiles" ? (
                <CustomizeMenuEditor content={content} onChange={setContent} />
              ) : (
                <StandardMenuEditor content={content} onChange={setContent} />
              )}

              <div className="flex justify-end border-t border-border pt-4">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving…" : "Save & Publish"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default MegaMenuManager;
