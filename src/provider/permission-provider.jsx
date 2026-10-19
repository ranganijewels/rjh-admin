"use client";

import React, { createContext, useCallback, useContext, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  ACTIONS,
  MODULES,
  ROLE_PERMISSIONS,
  canAccessPath,
  getModuleForPath,
  getRoleMeta,
  hasPermission,
  normalizeRole,
} from "@/config/rbac";

const PermissionContext = createContext(null);

export function PermissionProvider({ children }) {
  const user = useSelector((state) => state.auth?.user);

  // Local-development escape hatch: lets you preview another role without
  // touching the remote database. Only honoured on localhost; never in
  // production. Localhost defaults to admin so the local admin panel is
  // fully explorable; override with:
  //   localStorage.setItem("dev_role_override", "staff"); location.reload();
  const devRole = useMemo(() => {
    if (typeof window === "undefined") return null;
    const host = window.location.hostname;
    if (host !== "localhost" && host !== "127.0.0.1") return null;
    return window.localStorage.getItem("dev_role_override") || "admin";
  }, []);

  const role = normalizeRole(devRole || user?.role);

  const can = useCallback(
    (module, action = "view") => hasPermission(role, module, action),
    [role]
  );

  const canAccess = useCallback(
    (pathname) => canAccessPath(role, pathname),
    [role]
  );

  const value = useMemo(
    () => ({
      role,
      roleMeta: getRoleMeta(role),
      isAdmin: role === "admin",
      permissions: ROLE_PERMISSIONS[role],
      modules: MODULES,
      actions: ACTIONS,
      can,
      canAccess,
      moduleForPath: getModuleForPath,
    }),
    [role, can, canAccess]
  );

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionContext);

  if (!context) {
    throw new Error("usePermissions must be used inside <PermissionProvider>");
  }

  return context;
}
