import { MENU_SIDEBAR } from "@/config/menu.config";

/**
 * Flatten the sidebar config into searchable { title, path, trail } records.
 *
 * Group headings and parent-only items without a path are skipped — they are
 * not destinations, so they would only produce dead search results.
 */
export function flattenMenu(items, trail = []) {
  return items.flatMap((item) => {
    if (item.heading) return [];
    const nextTrail = item.title ? [...trail, item.title] : trail;
    const self = item.path
      ? [{ title: item.title, path: item.path, trail: trail.join(" / ") }]
      : [];
    const children = item.children ? flattenMenu(item.children, nextTrail) : [];
    return [...self, ...children];
  });
}

/** Every page in the sidebar, flattened and ready to search. */
export const SEARCHABLE_MENU = flattenMenu(MENU_SIDEBAR);

/**
 * Filter the flattened menu by a search term, matching the page title or the
 * group trail it sits under ("catalog" finds every page under Catalog).
 */
export function searchMenu(term, canAccess) {
  const needle = term.trim().toLowerCase();
  if (!needle) return [];

  return SEARCHABLE_MENU.filter(
    (item) =>
      (!canAccess || canAccess(item.path)) &&
      (item.title.toLowerCase().includes(needle) ||
        item.trail.toLowerCase().includes(needle))
  );
}
