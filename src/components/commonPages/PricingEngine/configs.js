// Column + field definitions for each pricing master (drives RateMasterManager).
const METALS = ["Gold", "Silver", "Platinum"];
// Gold day-to-day needs ONLY a 24K row — 22/18/14/10K derive automatically from
// the KT master factors (24K × factor ÷ 99.9). Explicit rows here override.
const PURITIES = ["24K", "22K", "18K", "14K", "10K", "999", "925", "800", "950", "900", "Custom"];
const SHAPES = ["Round", "Princess", "Cushion", "Oval", "Emerald", "Pear", "Marquise", "Custom"];
const CATEGORIES = ["Rings", "Necklaces", "Wedding Bands", "Bracelets", "Earrings", "Pendants"];

export const PRICING_MASTERS = {
  "metal-rates": {
    title: "Metal Rate Master",
    description: "Per-gram / per-ounce metal rates. New rows are effective-dated — history is preserved.",
    columns: [
      { key: "metalType", label: "Metal" },
      { key: "purity", label: "Purity" },
      { key: "rateUnit", label: "Unit" },
      { key: "rate", label: "Rate", type: "money" },
      { key: "effectiveDate", label: "Effective", type: "date" },
    ],
    fields: [
      { key: "metalType", label: "Metal Type", type: "select", options: METALS },
      { key: "purity", label: "Purity", type: "select", options: PURITIES },
      { key: "rateUnit", label: "Rate Unit", type: "select", options: ["per_gram", "per_ounce"], default: "per_gram" },
      { key: "rate", label: "Current Rate (USD)", type: "number" },
      { key: "effectiveDate", label: "Effective Date", type: "date" },
    ],
  },
  "diamond-rates": {
    title: "Diamond Rate Master",
    description: "Per-carat diamond pricing slabs by shape, carat range and quality.",
    columns: [
      { key: "shape", label: "Shape" },
      { key: "minCarat", label: "Min Ct" },
      { key: "maxCarat", label: "Max Ct" },
      { key: "color", label: "Color" },
      // Was "qualityGrade" — a separate field that's basically never filled
      // in; the values admins actually enter (VVS1, VS1, …) live in
      // "clarity", so the list showed "—" for every row. See fields below.
      { key: "clarity", label: "Quality (Clarity)", type: "csv-list" },
      { key: "rateValue", label: "Rate/Ct", type: "money" },
      { key: "effectiveDate", label: "Effective", type: "date" },
    ],
    fields: [
      { key: "shape", label: "Diamond Shape", type: "select", options: SHAPES, optional: true },
      { key: "minCarat", label: "Min Carat", type: "number", default: 0 },
      { key: "maxCarat", label: "Max Carat", type: "number", default: 99 },
      { key: "color", label: "Color", type: "text", placeholder: "e.g. EF (optional)" },
      // Sourced from Catalog Master → Diamond Qualities (VVS1/VVS2/VS1/VS2…).
      // Select one or several — a rate matches if the product's quality is
      // ANY of the selected values. Leave empty to match any quality.
      { key: "clarity", label: "Quality (Clarity)", type: "multiselect", optionsKind: "diamond_quality" },
      { key: "qualityGrade", label: "Quality Grade (advanced, rarely needed)", type: "text", placeholder: "optional", optional: true },
      { key: "cutGrade", label: "Cut Grade", type: "text", placeholder: "optional" },
      { key: "rateValue", label: "Rate per Carat (USD)", type: "number" },
      { key: "effectiveDate", label: "Effective Date", type: "date" },
    ],
  },
  "labor-rates": {
    title: "Labor / Making Charge Master",
    description: "Fixed or % labor by metal, category, carat & weight slabs.",
    columns: [
      { key: "metalType", label: "Metal" },
      { key: "productCategory", label: "Category" },
      { key: "minWeightG", label: "Min g" },
      { key: "maxWeightG", label: "Max g" },
      { key: "laborType", label: "Type" },
      { key: "laborRate", label: "Rate" },
      { key: "effectiveDate", label: "Effective", type: "date" },
    ],
    fields: [
      { key: "metalType", label: "Metal Type", type: "select", options: METALS, optional: true },
      { key: "productCategory", label: "Product Category", type: "select", options: CATEGORIES, optional: true },
      { key: "minCarat", label: "Min Carat", type: "number", default: 0 },
      { key: "maxCarat", label: "Max Carat", type: "number", default: 99 },
      { key: "minWeightG", label: "Min Weight (g)", type: "number", default: 0 },
      { key: "maxWeightG", label: "Max Weight (g)", type: "number", default: 9999 },
      { key: "laborType", label: "Labor Type", type: "select", options: ["fixed", "percentage", "per_gram"], default: "fixed",
        hint: "fixed = flat amount | percentage = % of metal+diamond | per_gram = rate × net metal weight" },
      { key: "laborRate", label: "Labor Rate (USD, % or USD/g)", type: "number" },
      { key: "effectiveDate", label: "Effective Date", type: "date" },
    ],
  },
  "tax-rates": {
    title: "Tax Configuration",
    description: "Country/state taxes (GST, VAT, sales tax, duty).",
    columns: [
      { key: "name", label: "Name" },
      { key: "taxType", label: "Type" },
      { key: "method", label: "Method" },
      { key: "value", label: "Value" },
      { key: "country", label: "Country" },
      { key: "state", label: "State" },
      { key: "effectiveDate", label: "Effective", type: "date" },
    ],
    fields: [
      { key: "name", label: "Tax Name", type: "text" },
      { key: "taxType", label: "Tax Type", type: "select", options: ["GST", "VAT", "Sales Tax", "Import Duty", "Custom"] },
      { key: "method", label: "Calculation Method", type: "select", options: ["percentage", "fixed"], default: "percentage" },
      { key: "value", label: "Value (% or amount)", type: "number" },
      { key: "country", label: "Country (ISO-2)", type: "text", placeholder: "US / IN (blank = all)" },
      { key: "state", label: "State", type: "text", placeholder: "optional" },
      { key: "effectiveDate", label: "Effective Date", type: "date" },
    ],
  },
  "shipping-rates": {
    title: "Shipping Rate Master",
    description: "Zone/country shipping rates by weight.",
    columns: [
      { key: "zone", label: "Zone" },
      { key: "country", label: "Country" },
      { key: "shippingMethod", label: "Method" },
      { key: "rateType", label: "Rate Type" },
      { key: "rate", label: "Rate", type: "money" },
      { key: "estimatedDays", label: "ETA (days)" },
    ],
    fields: [
      { key: "zone", label: "Shipping Zone", type: "text" },
      { key: "country", label: "Country (ISO-2)", type: "text", placeholder: "US (blank = any)" },
      { key: "state", label: "State", type: "text", placeholder: "optional" },
      { key: "minWeightG", label: "Min Weight (g)", type: "number", default: 0 },
      { key: "maxWeightG", label: "Max Weight (g)", type: "number", default: 999999 },
      { key: "shippingMethod", label: "Shipping Method", type: "text", placeholder: "Standard / Express" },
      { key: "rateType", label: "Rate Type", type: "select", options: ["fixed", "weight_based"], default: "fixed" },
      { key: "rate", label: "Rate (USD; per-gram if weight-based)", type: "number" },
      { key: "estimatedDays", label: "Estimated Delivery Days", type: "text", placeholder: "3-5" },
      { key: "effectiveDate", label: "Effective Date", type: "date" },
    ],
  },
  "diamond-metal-weights": {
    title: "Diamond → Metal Weight",
    description: "Maps total diamond carat ranges to the net metal weight (grams of gold/silver in the piece). The engine computes: netWeightG from this table, grossWeightG = netWeightG + (carats × 0.2 g), and applies per-gram labour on netWeightG.",
    columns: [
      { key: "metalType", label: "Metal" },
      { key: "category", label: "Category" },
      { key: "minDiamondCt", label: "Min Ct" },
      { key: "maxDiamondCt", label: "Max Ct" },
      { key: "metalWeightG", label: "Metal Wt (g)" },
      { key: "effectiveDate", label: "Effective", type: "date" },
    ],
    fields: [
      { key: "metalType", label: "Metal Type", type: "select", options: METALS, optional: true,
        hint: "Leave blank to apply to all metals" },
      { key: "category", label: "Category", type: "select", options: CATEGORIES, optional: true,
        hint: "Leave blank to apply to all categories" },
      { key: "minDiamondCt", label: "Min Diamond Ct", type: "number", default: 0 },
      { key: "maxDiamondCt", label: "Max Diamond Ct", type: "number", default: 99 },
      { key: "metalWeightG", label: "Net Metal Weight (g)", type: "number",
        hint: "Weight of the metal alone (without stones). e.g. for a 0.5ct ring = 3.2 g" },
      { key: "effectiveDate", label: "Effective Date", type: "date" },
    ],
  },
  "additional-charges": {
    title: "Additional Charges",
    description: "Certification, packaging, insurance and custom charges applied to every product.",
    columns: [
      { key: "name", label: "Name" },
      { key: "chargeType", label: "Type" },
      { key: "method", label: "Method" },
      { key: "value", label: "Value", type: "money" },
    ],
    fields: [
      { key: "name", label: "Charge Name", type: "text" },
      { key: "chargeType", label: "Charge Type", type: "select", options: ["Certification", "Packaging", "Insurance", "Custom"] },
      { key: "method", label: "Calculation Method", type: "select", options: ["fixed", "percentage"], default: "fixed" },
      { key: "value", label: "Value (USD or %)", type: "number" },
    ],
  },
  "price-books": {
    title: "Price Books (B2B / Wholesale / VIP)",
    description: "Multi-audience pricing. The same BOM + rate masters compute a base price; each price book applies a channel/segment margin, markup & discount. Resolved by customer type.",
    columns: [
      { key: "code", label: "Code" },
      { key: "name", label: "Name" },
      { key: "channel", label: "Channel" },
      { key: "customerType", label: "Customer Type" },
      { key: "discountPercent", label: "Discount %" },
      { key: "markupPercent", label: "Markup %" },
    ],
    fields: [
      { key: "code", label: "Code", type: "text", placeholder: "WHOLESALE-US" },
      { key: "name", label: "Name", type: "text", placeholder: "US Wholesale" },
      { key: "channel", label: "Channel", type: "select", options: ["retail", "wholesale", "b2b", "vip", "marketplace"], default: "retail" },
      { key: "customerType", label: "Customer Type (maps to customer)", type: "select", options: ["", "retail", "wholesale", "corporate"], optional: true, hint: "Auto-applies to customers of this type" },
      { key: "country", label: "Country (optional)", type: "text", optional: true, placeholder: "US" },
      { key: "currencyCode", label: "Currency (optional)", type: "text", optional: true, placeholder: "USD" },
      { key: "marginPercent", label: "Margin % (overrides engine)", type: "number", optional: true },
      { key: "markupPercent", label: "Markup %", type: "number", default: 0 },
      { key: "discountPercent", label: "Discount % (e.g. wholesale −20)", type: "number", default: 0 },
      { key: "priority", label: "Priority", type: "number", default: 0 },
    ],
  },
};
