import { handleGETWithMap } from "@/lib/apiHandler";
import { resolveProductTitle } from "@/lib/product-tokens";

// Full configured lines (storefront orders since line_items existed); older
// orders fall back to the single product stored on the order row.
function orderItems(o) {
  const lines = Array.isArray(o.lineItems) && o.lineItems.length
    ? o.lineItems
    : o.productId
      ? [{
          productName: o.productName, quantity: o.quantity, image: o.productImageUrl,
          metalPurity: o.metalPurity, metalColor: o.metalColor, diamondShape: o.diamondShape,
          centerDiamondWeight: o.diamondWeightCt, ringSize: o.productSize,
        }]
      : [];
  return lines.map((l) => {
    // The product name is a template ("{{karat}} {{metal_color}} Gold Round
    // Diamond Elegant Ring") that the storefront resolves for the variant
    // the shopper picked. The line carries that variant, so the admin can
    // resolve it too — otherwise the order sheet shows the raw braces.
    const title = resolveProductTitle(l.productName, l);

    return {
      product_title: title || "Item",
      product: {
        image: l.image || o.productImageUrl || "",
        title: title || l.productName,
        metal: [l.metalPurity, l.metalColor].filter(Boolean).join(" "),
      },
      quantity: l.quantity ?? 1,
      unit_price: l.unitPrice,
      center_diamond_weight: l.centerDiamondWeight
        ? `${l.centerDiamondWeight} ct`
        : "",
      specs: [
        l.diamondShape && `Shape: ${l.diamondShape}`,
        l.diamondColor && `Color: ${l.diamondColor}`,
        l.diamondClarity && `Clarity: ${l.diamondClarity}`,
        (l.ringSize || l.size) && `Size: ${l.ringSize || l.size}`,
        l.backType && `Back: ${l.backType}`,
        l.engraving && `Engraving: "${l.engraving}"`,
      ].filter(Boolean),
    };
  });
}

export function mapOrder(o) {
  return {
    ...o,
    items: orderItems(o),
    order_number: o.orderNumber || o.order_number || "",
    is_test: !!o.isTest,
    customer_name: o.customerName,
    total_quantity: o.quantity,
    subtotal: o.totalAmount,
    order_status: o.orderStatus,
    payment_status: o.paymentStatus,
    payment_method: o.paymentMethod,
    payment_gateway: o.paymentGateway,
    currency_code: o.currencyCode,
    charged_amount: o.chargedAmount,
    created_at: o.createdAt,
  };
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const authHeader = req.headers.get("authorization");
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "20";
  const search = searchParams.get("q") || searchParams.get("search") || "";
  const query = new URLSearchParams({ page, limit });
  if (search) query.append("search", search);
  return handleGETWithMap(`/api/v1/orders?${query}`, { Authorization: authHeader }, mapOrder);
}
