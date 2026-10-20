/**
 * Flatten the sidebar config into searchable { title, path, trail } records.
 *
 * Group headings and parent-only items without a path are skipped — they are
 * not destinations, so they would only produce dead search results.
 *
 * This module deliberately has no imports: it is pure, so it can be unit
 * tested without pulling in the menu config (and the JSX it contains).
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

/**
 * Filter a flattened menu by a search term, matching the page title or the
 * group trail it sits under ("catalog" finds every page under Catalog).
 *
 * `canAccess` is the permission check for the role; a page the role may not
 * open is never offered.
 */
export function searchMenu(term, canAccess, menu) {
  const needle = String(term || "").trim().toLowerCase();
  if (!needle || !menu) return [];

  return menu.filter(
    (item) =>
      (!canAccess || canAccess(item.path)) &&
      (item.title.toLowerCase().includes(needle) ||
        item.trail.toLowerCase().includes(needle))
  );
}
