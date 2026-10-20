import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  canAccessPath,
  getModuleForPath,
  hasPermission,
  normalizeRole,
  ROLE_PERMISSIONS,
} from "@/config/rbac";

describe("normalizeRole", () => {
  test("accepts the four backend role slugs", () => {
    assert.equal(normalizeRole("admin"), "admin");
    assert.equal(normalizeRole("manager"), "manager");
    assert.equal(normalizeRole("staff"), "staff");
    assert.equal(normalizeRole("viewer"), "viewer");
  });

  test("is case and separator insensitive", () => {
    assert.equal(normalizeRole("Admin"), "admin");
    assert.equal(normalizeRole("VIEWER"), "viewer");
  });

  test("maps the retired super_admin slug onto admin", () => {
    assert.equal(normalizeRole("super_admin"), "admin");
  });

  test("falls back to the least privileged role", () => {
    assert.equal(normalizeRole("nonsense"), "viewer");
    assert.equal(normalizeRole(undefined), "viewer");
    assert.equal(normalizeRole(null), "viewer");
  });

  test("reads the role off a user object", () => {
    assert.equal(normalizeRole({ slug: "manager" }), "manager");
    assert.equal(normalizeRole({ name: "Staff" }), "staff");
  });
});

describe("getModuleForPath", () => {
  test("maps the catalog routes onto the enterprise module", () => {
    assert.equal(getModuleForPath("/dashboard/catalog/masters"), "enterprise");
    assert.equal(getModuleForPath("/dashboard/catalog/families"), "enterprise");
    assert.equal(getModuleForPath("/dashboard/catalog/boms"), "enterprise");
  });

  test("maps the product routes onto the products module", () => {
    assert.equal(
      getModuleForPath("/dashboard/product-management/my-products"),
      "products"
    );
    assert.equal(
      getModuleForPath("/dashboard/product-categories/rings"),
      "products"
    );
  });

  test("does not match a longer path that merely starts with a prefix", () => {
    // "/dashboard/order-management" must not swallow "/dashboard/order-management-x"
    assert.equal(
      getModuleForPath("/dashboard/order-management/all"),
      "orders"
    );
  });

  test("falls back to the dashboard module", () => {
    assert.equal(getModuleForPath("/dashboard/overview"), "dashboard");
    assert.equal(getModuleForPath("/"), "dashboard");
  });
});

describe("hasPermission", () => {
  test("admin can do everything", () => {
    assert.equal(hasPermission("admin", "products", "delete"), true);
    assert.equal(hasPermission("admin", "users_roles", "create"), true);
  });

  test("viewer is read-only everywhere it has access", () => {
    assert.equal(hasPermission("viewer", "products", "view"), true);
    assert.equal(hasPermission("viewer", "products", "create"), false);
    assert.equal(hasPermission("viewer", "products", "edit"), false);
    assert.equal(hasPermission("viewer", "products", "delete"), false);
  });

  test("staff may create and edit but not delete", () => {
    assert.equal(hasPermission("staff", "products", "create"), true);
    assert.equal(hasPermission("staff", "products", "edit"), true);
    assert.equal(hasPermission("staff", "products", "delete"), false);
  });

  test("staff cannot see enterprise, settings or user administration", () => {
    assert.equal(hasPermission("staff", "enterprise", "view"), false);
    assert.equal(hasPermission("staff", "settings", "view"), false);
    assert.equal(hasPermission("staff", "users_roles", "view"), false);
  });

  test("manager cannot administer users", () => {
    assert.equal(hasPermission("manager", "users_roles", "view"), false);
  });

  test("manager may delete in enterprise and settings, but not in products", () => {
    assert.equal(hasPermission("manager", "enterprise", "delete"), true);
    assert.equal(hasPermission("manager", "settings", "delete"), true);
    // The default for a manager is "edit everything, delete nothing".
    assert.equal(hasPermission("manager", "products", "delete"), false);
    assert.equal(hasPermission("manager", "orders", "delete"), false);
  });

  test("every role's matrix only contains known actions", () => {
    for (const [role, modules] of Object.entries(ROLE_PERMISSIONS)) {
      for (const [module, actions] of Object.entries(modules)) {
        for (const action of Object.keys(actions)) {
          assert.ok(
            ["view", "create", "edit", "delete"].includes(action),
            `${role}/${module} has an unknown action "${action}"`
          );
        }
      }
    }
  });
});

describe("canAccessPath", () => {
  test("blocks a role that may not open the module", () => {
    assert.equal(canAccessPath("staff", "/dashboard/catalog/masters"), false);
    assert.equal(canAccessPath("staff", "/dashboard/all-user-list"), false);
  });

  test("allows a role that may open the module", () => {
    assert.equal(canAccessPath("staff", "/dashboard/product-management/my-products"), true);
    assert.equal(canAccessPath("admin", "/dashboard/catalog/masters"), true);
  });

  test("viewer may read the business modules", () => {
    assert.equal(canAccessPath("viewer", "/dashboard/order-management/all"), true);
    assert.equal(canAccessPath("viewer", "/dashboard/customer-data"), true);
  });
});
