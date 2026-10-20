import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  metalTypeFromPurity,
  resolveProductTitle,
  resolveProductTokens,
  tokenValuesFromLineItem,
} from "@/lib/product-tokens";

const LINE = {
  productName: "{{karat}} {{metal_color}} Gold Round Diamond Elegant Ring",
  metalPurity: "14K",
  metalColor: "YELLOW",
  diamondShape: "Round",
  diamondClarity: "VVS",
  diamondColor: "G",
  centerDiamondWeight: 1.2,
  quantity: 2,
};

describe("metalTypeFromPurity", () => {
  test("reads the metal off the purity", () => {
    assert.equal(metalTypeFromPurity("14K"), "Gold");
    assert.equal(metalTypeFromPurity("18KT"), "Gold");
    assert.equal(metalTypeFromPurity("925"), "Silver");
    assert.equal(metalTypeFromPurity("950"), "Platinum");
    assert.equal(metalTypeFromPurity("Platinum"), "Platinum");
  });

  test("returns nothing for a purity it does not recognise", () => {
    assert.equal(metalTypeFromPurity(""), "");
    assert.equal(metalTypeFromPurity("unobtainium"), "");
  });
});

describe("tokenValuesFromLineItem", () => {
  test("maps the line onto the tokens", () => {
    const values = tokenValuesFromLineItem(LINE);
    assert.equal(values.karat, "14K");
    assert.equal(values.metal_color, "YELLOW");
    assert.equal(values.metal_type, "Gold");
    assert.equal(values.diamond_shape, "Round");
    assert.equal(values.diamond_clarity, "VVS");
    assert.equal(values.diamond_color, "G");
  });

  test("accepts the snake_case field names too", () => {
    const values = tokenValuesFromLineItem({
      metal_purity: "18K",
      metal_color: "ROSE",
    });
    assert.equal(values.karat, "18K");
    assert.equal(values.metal_color, "ROSE");
  });
});

describe("resolveProductTokens", () => {
  test("replaces the tokens with the variant the customer chose", () => {
    const title = resolveProductTitle(LINE.productName, LINE);
    assert.equal(title, "14K YELLOW Gold Round Diamond Elegant Ring");
  });

  test("drops a token it has no value for, instead of showing braces", () => {
    const title = resolveProductTokens("{{karat}} Gold Ring", { karat: "" });
    assert.equal(title, "Gold Ring");
    assert.ok(!title.includes("{{"));
  });

  test("leaves copy without tokens alone", () => {
    assert.equal(
      resolveProductTokens("Plain name", { karat: "14K" }),
      "Plain name"
    );
  });

  test("copes with nothing to resolve", () => {
    assert.equal(resolveProductTokens("", {}), "");
    assert.equal(resolveProductTokens(null, {}), "");
  });

  test("does not leave a double space behind a dropped token", () => {
    const title = resolveProductTokens(
      "{{karat}} {{metal_color}} Gold Ring",
      { karat: "14K", metal_color: "" }
    );
    assert.equal(title, "14K Gold Ring");
  });
});
