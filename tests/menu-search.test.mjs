import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { flattenMenu, searchMenu } from "@/lib/menu-search";

const MENU = [
  { heading: "Catalog" },
  {
    title: "Product Management",
    path: "/dashboard/product-management",
    children: [
      { title: "Product List", path: "/dashboard/product-management/my-products" },
    ],
  },
  { title: "Pricing Engine", path: "/dashboard/pricing" },
  { heading: "Operations" },
  { title: "Orders", path: "/dashboard/order-management/all" },
];

describe("flattenMenu", () => {
  test("skips group headings", () => {
    const flat = flattenMenu(MENU);
    assert.equal(
      flat.some((item) => item.title === "Catalog"),
      false
    );
  });

  test("keeps the items that have a path", () => {
    const flat = flattenMenu(MENU);
    assert.equal(flat.length, 4);
    assert.ok(flat.some((item) => item.path === "/dashboard/pricing"));
  });

  test("records the group trail each item sits under", () => {
    const flat = flattenMenu([
      {
        title: "Product Management",
        children: [
          {
            title: "Product List",
            path: "/dashboard/product-management/my-products",
          },
        ],
      },
    ]);
    assert.equal(flat[0].trail, "Product Management");
  });
});

describe("searchMenu", () => {
  const menu = flattenMenu(MENU);

  test("matches on the title", () => {
    const hits = searchMenu("pricing", null, menu);
    assert.equal(hits.length, 1);
    assert.equal(hits[0].title, "Pricing Engine");
  });

  test("is case insensitive", () => {
    assert.equal(searchMenu("PRICING", null, menu).length, 1);
  });

  test("matches on the group trail", () => {
    const hits = searchMenu("Product Management", null, menu);
    assert.ok(hits.length >= 2);
  });

  test("returns nothing for an empty term", () => {
    assert.deepEqual(searchMenu("   ", null, menu), []);
  });

  test("never offers a page the role may not open", () => {
    const hits = searchMenu("pricing", (path) => path !== "/dashboard/pricing", menu);
    assert.deepEqual(hits, []);
  });
});
