import { handleGETWithMap, handlePOST } from "@/lib/apiHandler";
import { toProductBody } from "./[id]/route";

function mapProduct(p) {
  return {
    ...p,
    title: p.productName,
    product_image: p.mainImageUrl,
    design_no: p.productCode,
    style: p.subCategory,
    shape: p.diamondShape,
    metal_color: p.metalColor ?? null,
    collection: p.collectionName,
    gender: p.gender ?? null,
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
  const category =
    searchParams.get("category_id") || searchParams.get("category") || "";
  const metalColor =
    searchParams.get("metal_color") || searchParams.get("metalColor") || "";
  const shape =
    searchParams.get("shape") || searchParams.get("diamondShape") || "";
  const status = searchParams.get("status") || "";

  const query = new URLSearchParams({ page, limit });
  if (search) query.append("search", search);
  if (category) query.append("category", category);
  if (metalColor) query.append("metalColor", metalColor);
  if (shape) query.append("diamondShape", shape);
  if (status) query.append("status", status);

  return handleGETWithMap(`/api/v1/products?${query}`, { Authorization: authHeader }, mapProduct);
}

export async function POST(req) {
  const authHeader = req.headers.get("authorization");
  const raw = await req.json();
  const mappedReq = new Request(req.url, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: authHeader || "" },
    body: JSON.stringify(toProductBody(raw)),
  });
  return handlePOST(mappedReq, "/api/v1/products", { Authorization: authHeader });
}
