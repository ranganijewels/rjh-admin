import { handleGETWithMap } from "@/lib/apiHandler";

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
  return lines.map((l) => ({
    product_title: `${l.productName || "Item"}${l.quantity > 1 ? ` × ${l.quantity}` : ""}`,
    product: {
      image: l.image || o.productImageUrl || "",
      title: l.productName,
      metal: [l.metalPurity, l.metalColor].filter(Boolean).join(" "),
    },
    center_diamond_weight: l.centerDiamondWeight ? `${l.centerDiamondWeight} ct` : "",
    specs: [
      l.diamondShape && `Shape: ${l.diamondShape}`,
      l.diamondColor && `Color: ${l.diamondColor}`,
      l.diamondClarity && `Clarity: ${l.diamondClarity}`,
      (l.ringSize || l.size) && `Size: ${l.ringSize || l.size}`,
      l.backType && `Back: ${l.backType}`,
      l.engraving && `Engraving: "${l.engraving}"`,
      l.unitPrice != null && `Unit: $${Number(l.unitPrice).toLocaleString("en-US", { maximumFractionDigits: 2 })}`,
    ].filter(Boolean),
  }));
}

export function mapOrder(o) {
  return {
    ...o,
    items: orderItems(o),
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
