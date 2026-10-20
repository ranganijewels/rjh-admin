/**
 * Dynamic tokens in product copy.
 *
 * A product can be offered in several metals and diamond shapes, so its
 * name and descriptions are written once with tokens that the storefront
 * resolves live for whichever variant the shopper picked:
 *
 *   "{{karat}} {{metal_color}} Gold Round Diamond Elegant Ring"
 *   → "14K YELLOW Gold Round Diamond Elegant Ring"
 *
 * The order lines carry the variant the customer actually chose, so the
 * admin can resolve the same tokens from the line item and show the real
 * name instead of the template.
 */

export const PRODUCT_TOKENS = [
  "metal_type",
  "karat",
  "metal_color",
  "diamond_shape",
  "diamond_weight",
  "diamond_clarity",
  "diamond_color",
];

/**
 * The metal a purity belongs to. The order line stores the purity and the
 * colour separately, but the copy may ask for the metal by name.
 */
export function metalTypeFromPurity(purity) {
  const p = String(purity || "").trim().toUpperCase();

  if (p.includes("SILVER") || /(^|\D)(925|999|800)(\D|$)/.test(p)) return "Silver";
  if (p.includes("PLATINUM") || /(^|\D)(950|900|PT)(\D|$)/.test(p)) {
    return "Platinum";
  }
  if (p.includes("GOLD") || /(^|\D)(10|14|18|22|24)K/.test(p)) return "Gold";

  return "";
}

/**
 * The token values a line item implies.
 *
 * Field names differ between the order line and the legacy single-product
 * order, so both are accepted.
 */
export function tokenValuesFromLineItem(line = {}) {
  const purity = line.metalPurity || line.metal_purity || "";
  const color = line.metalColor || line.metal_color || "";

  return {
    metal_type:
      line.metalType || line.metal_type || metalTypeFromPurity(purity),
    karat: purity,
    metal_color: color,
    diamond_shape: line.diamondShape || line.diamond_shape || "",
    diamond_weight:
      line.centerDiamondWeight ?? line.diamondWeightCt ?? line.diamond_weight ?? "",
    diamond_clarity: line.diamondClarity || line.diamond_clarity || "",
    diamond_color: line.diamondColor || line.diamond_color || "",
  };
}

/**
 * Replace the tokens in a piece of copy with real values.
 *
 * A token with no value behind it is dropped rather than shown as braces —
 * "{{karat}} Gold Ring" becomes "Gold Ring", not "{{karat}} Gold Ring".
 */
export function resolveProductTokens(text, values = {}) {
  if (!text || typeof text !== "string") return "";
  if (!text.includes("{{")) return text;

  let out = text;
  for (const [token, value] of Object.entries(values)) {
    out = out.split(`{{${token}}}`).join(value ? String(value) : "");
  }

  // Anything still unresolved is a token this app does not know about.
  out = out.replace(/\{\{\s*[a-z_]+\s*\}\}/gi, "");

  return out.replace(/\s{2,}/g, " ").trim();
}

/**
 * The display name of a line item, with its tokens resolved.
 */
export function resolveProductTitle(title, line = {}) {
  return resolveProductTokens(title, tokenValuesFromLineItem(line));
}
