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
  const authHeader = req.headers.get("authorization");
  return handleGETWithMap("/api/v1/products?page=1&limit=50", { Authorization: authHeader }, mapProduct);
}

export async function POST(req) {
  const authHeader = req.headers.get("authorization");
  return handleGETWithMap("/api/v1/products?page=1&limit=50", { Authorization: authHeader }, mapProduct);
}
