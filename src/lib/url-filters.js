/**
 * The pure part of "keep a list's filters in the URL".
 *
 * The URL is the single source of truth: a filter is read from the query
 * string and written back to it, so a view can be bookmarked, shared with a
 * colleague, and survives a refresh — and the browser's back button steps
 * through the filters.
 *
 * A default of `false` is stored as a flag (`?today=1`) and left out of the
 * URL entirely when it is off.
 *
 * These functions are deliberately free of React and of the router, so they
 * can be unit tested on their own.
 */

/** Read the filter values out of a query string. */
export function readFilters(searchParams, defaults = {}) {
  const values = {};
  for (const [key, fallback] of Object.entries(defaults)) {
    const raw = searchParams.get(key);
    if (raw === null) {
      values[key] = fallback;
    } else if (typeof fallback === "boolean") {
      values[key] = raw === "1" || raw === "true";
    } else {
      values[key] = raw;
    }
  }
  return values;
}

/**
 * Apply a patch to a query string.
 *
 * A value that equals its default is removed from the URL, so the default
 * view has a clean URL. Returns a new URLSearchParams; the input is not
 * modified.
 */
export function writeFilters(searchParams, patch, defaults = {}) {
  const params = new URLSearchParams(searchParams.toString());

  for (const [key, value] of Object.entries(patch)) {
    const fallback = defaults[key];
    const isDefault =
      value === fallback || (typeof fallback === "boolean" && !value);
    if (isDefault) {
      params.delete(key);
    } else {
      params.set(
        key,
        typeof value === "boolean" ? (value ? "1" : "") : String(value)
      );
    }
  }

  return params;
}

/** Remove every filter key from a query string. */
export function clearFilters(searchParams, defaults = {}) {
  const params = new URLSearchParams(searchParams.toString());
  for (const key of Object.keys(defaults)) params.delete(key);
  return params;
}
