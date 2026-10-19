"use client";

import { usePermissions } from "@/provider/permission-provider";

/**
 * Renders children only when the signed-in role has the permission.
 *
 *   <Can module="products" action="create"><Button /></Can>
 */
export function Can({ module, action = "view", fallback = null, children }) {
  const { can } = usePermissions();
  return can(module, action) ? children : fallback;
}

export default Can;
