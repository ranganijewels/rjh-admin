import { handlePUT } from "@/lib/apiHandler";

// Replace the set of products assigned to a collection.
export async function PUT(req, { params }) {
  const authHeader = req.headers.get("authorization");
  const { id } = await params;
  return handlePUT(req, `/api/v1/collections/${id}/products`, {
    Authorization: authHeader,
  });
}
