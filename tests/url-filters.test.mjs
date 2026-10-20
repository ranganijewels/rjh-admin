import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  clearFilters,
  readFilters,
  writeFilters,
} from "@/lib/url-filters";

const params = (query) => new URLSearchParams(query);

describe("readFilters", () => {
  test("falls back to the default when the key is absent", () => {
    const values = readFilters(params(""), { status: "all" });
    assert.equal(values.status, "all");
  });

  test("reads a value out of the query string", () => {
    const values = readFilters(params("status=active"), { status: "all" });
    assert.equal(values.status, "active");
  });

  test("reads a boolean flag", () => {
    assert.equal(readFilters(params("today=1"), { today: false }).today, true);
    assert.equal(readFilters(params("today=0"), { today: false }).today, false);
    assert.equal(readFilters(params(""), { today: false }).today, false);
  });

  test("ignores keys that are not declared", () => {
    const values = readFilters(params("other=1"), { status: "all" });
    assert.deepEqual(Object.keys(values), ["status"]);
  });
});

describe("writeFilters", () => {
  test("removes a value that equals its default", () => {
    const next = writeFilters(params("status=active"), { status: "all" }, {
      status: "all",
    });
    assert.equal(next.toString(), "");
  });

  test("sets a value that differs from its default", () => {
    const next = writeFilters(params(""), { status: "active" }, {
      status: "all",
    });
    assert.equal(next.toString(), "status=active");
  });

  test("stores a true boolean as a flag and drops a false one", () => {
    const on = writeFilters(params(""), { today: true }, { today: false });
    assert.equal(on.toString(), "today=1");

    const off = writeFilters(params("today=1"), { today: false }, {
      today: false,
    });
    assert.equal(off.toString(), "");
  });

  test("keeps the other query parameters", () => {
    const next = writeFilters(params("tab=posts&status=all"), { status: "active" }, {
      status: "all",
    });
    assert.equal(next.get("tab"), "posts");
    assert.equal(next.get("status"), "active");
  });

  test("does not modify the query string it was given", () => {
    const original = params("status=active");
    writeFilters(original, { status: "all" }, { status: "all" });
    assert.equal(original.toString(), "status=active");
  });
});

describe("clearFilters", () => {
  test("removes every declared filter and leaves the rest alone", () => {
    const next = clearFilters(params("tab=posts&status=active&today=1"), {
      status: "all",
      today: false,
    });
    assert.equal(next.toString(), "tab=posts");
  });
});
