import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  decodeMaterials,
  decodeMetalOptions,
  decodeMolds,
  decodeSizeWeightDiff,
  encodeMaterials,
  encodeMetalOptions,
  encodeMolds,
  encodeSizeWeightDiff,
} from "@/lib/csvSubTables";

describe("product sub-tables", () => {
  test("materials round-trip", () => {
    const rows = [
      {
        component: "Band",
        materialType: "Metal",
        metalStoneType: "18K",
        shape: "Round",
        quality: "VVS",
        color: "G",
        size: "1.5",
        setting: "4 prong",
        pcs: "1",
        wt: "2.10",
        centerStone: "false",
      },
    ];
    const decoded = decodeMaterials(encodeMaterials(rows));
    assert.equal(decoded.length, 1);
    assert.equal(decoded[0].component, "Band");
    assert.equal(decoded[0].wt, "2.10");
    assert.equal(decoded[0].centerStone, false);
  });

  test("a material with a centre stone comes back as a boolean", () => {
    const decoded = decodeMaterials("Band|Metal|18K|Round|VVS|G|1.5|4 prong|1|2.10|true");
    assert.equal(decoded[0].centerStone, true);
  });

  test("an empty cell decodes to no rows", () => {
    assert.deepEqual(decodeMaterials(""), []);
    assert.deepEqual(decodeMolds(""), []);
  });

  test("molds round-trip", () => {
    const decoded = decodeMolds(encodeMolds([{ name: "A", locker: "L1", pcs: "2" }]));
    assert.deepEqual(decoded, [{ name: "A", locker: "L1", pcs: "2" }]);
  });

  test("size and weight differences round-trip", () => {
    const decoded = decodeSizeWeightDiff(
      encodeSizeWeightDiff([{ size: "6", percent: "3" }])
    );
    assert.deepEqual(decoded, [{ size: "6", percent: "3" }]);
  });

  test("metal options round-trip, including the list-valued fields", () => {
    const rows = [
      { type: "18K", purities: ["VVS", "VS"], colors: ["White", "Yellow"] },
    ];
    const decoded = decodeMetalOptions(encodeMetalOptions(rows));
    assert.equal(decoded.length, 1);
    assert.equal(decoded[0].type, "18K");
    assert.deepEqual(decoded[0].purities, ["VVS", "VS"]);
    assert.deepEqual(decoded[0].colors, ["White", "Yellow"]);
  });

  test("still reads a cell that was written as raw JSON", () => {
    const decoded = decodeMolds('[{"name":"A","locker":"L1","pcs":"2"}]');
    assert.equal(decoded.length, 1);
    assert.equal(decoded[0].name, "A");
  });
});
