"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  clearFilters,
  readFilters,
  writeFilters,
} from "@/lib/url-filters";

/**
 * Keep a list's filters in the URL.
 *
 *   const { values, setValue } = useUrlFilters({ status: "all" });
 *   <Select value={values.status} onValueChange={(v) => setValue("status", v)} />
 *
 * A page that uses this hook must be rendered inside a <Suspense> boundary,
 * because `useSearchParams` opts the route out of static rendering.
 */
export function useUrlFilters(defaults = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // The keys are derived from the defaults; the defaults object itself is
  // usually inline, so it cannot be a dependency.
  const keys = useMemo(() => Object.keys(defaults).sort(), [defaults]);
  const keySignature = keys.join(",");

  const values = useMemo(
    () => readFilters(searchParams, defaults),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [keySignature, searchParams]
  );

  const replace = useCallback(
    (params) => {
      const next = params.toString();
      if (next === searchParams.toString()) return;
      router.replace(`${pathname}${next ? `?${next}` : ""}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const setValue = useCallback(
    (key, value) => {
      replace(writeFilters(searchParams, { [key]: value }, defaults));
    },
    [defaults, replace, searchParams]
  );

  const setValues = useCallback(
    (patch) => {
      replace(writeFilters(searchParams, patch, defaults));
    },
    [defaults, replace, searchParams]
  );

  const reset = useCallback(() => {
    replace(clearFilters(searchParams, defaults));
  }, [defaults, replace, searchParams]);

  return { values, setValue, setValues, reset };
}

export default useUrlFilters;
