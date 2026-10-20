import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

import { getAuthToken } from "@/lib/auth-token";

// The helper reads window.localStorage, so a tiny stand-in is enough.
const store = new Map();
globalThis.window = {
  localStorage: {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
  },
};

describe("getAuthToken", () => {
  beforeEach(() => store.clear());
  afterEach(() => store.clear());

  test("prefers the key the login thunk writes", () => {
    store.set("authTokenStoreAdmin", "from-login");
    store.set("auth", JSON.stringify({ token: "from-store" }));
    assert.equal(getAuthToken(), "from-login");
  });

  test("falls back to the persisted auth slice", () => {
    // A session restored from storage has no authTokenStoreAdmin — without
    // this fallback every API call would go out unauthenticated.
    store.set("auth", JSON.stringify({ user: { name: "P" }, token: "from-store" }));
    assert.equal(getAuthToken(), "from-store");
  });

  test("is null when there is no session", () => {
    assert.equal(getAuthToken(), null);
  });

  test("is null when the stored auth is not valid JSON", () => {
    store.set("auth", "{not json");
    assert.equal(getAuthToken(), null);
  });
});
