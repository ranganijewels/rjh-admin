import { handleGETWithMap } from "@/lib/apiHandler";

function mapProduct(p) {
  return {
    ...p,
    title: p.productName,
    product_image: p.mainImageUrl,
    design_no: p.productCode,
    style: p.subCategory,
    shape: p.diamondShape,
    srp: p.shopifyPrice,
    collection: p.collectionName,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  };
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const authHeader = req.headers.get("authorization");
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "20";
  const search = searchParams.get("search") || "";
  const query = new URLSearchParams({ page, limit });
  if (search) query.append("search", search);
  return handleGETWithMap(`/api/v1/products?${query}`, { Authorization: authHeader }, mapProduct);
}
