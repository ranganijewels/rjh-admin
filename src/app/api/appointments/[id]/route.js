import { handlePUT } from "@/lib/apiHandler";

export async function PUT(req, { params }) {
  const authHeader = req.headers.get("authorization");
  const { id } = await params;
  return handlePUT(req, `/api/v1/storefront/appointments/${id}`, {
    Authorization: authHeader,
  });
}
