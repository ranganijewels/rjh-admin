import { NextResponse } from "next/server";
import { fetchGET, handlePATCH, handleDELETE } from "@/lib/apiHandler";

// There's no single-value GET on the backend, only the category-filtered
// list — so fetch that (small, ~10 rows) and pick out the one being edited.
export async function GET(req, { params }) {
  const { id } = await params;
  const authHeader = req.headers.get("authorization");
  const result = await fetchGET("/api/v1/masters/values", { Authorization: authHeader }, { category: "blog_category" });
  const match = (result?.data || []).find((v) => v.id === id) || null;
  return NextResponse.json({ data: match });
}

export async function PUT(req, { params }) {
  const { id } = await params;
  const authHeader = req.headers.get("authorization");
  const body = await req.json();
  return handlePATCH(
    `/api/v1/masters/values/${id}`,
    { value: body.name || body.value, label: body.name || body.label, description: body.description },
    { Authorization: authHeader }
  );
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  const authHeader = req.headers.get("authorization");
  return handleDELETE(`/api/v1/masters/values/${id}`, null, { Authorization: authHeader });
}
