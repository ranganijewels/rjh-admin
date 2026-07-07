import { NextResponse } from "next/server";

const SYSTEM_ROLES = [
  { id: "super_admin", name: "Super Admin" },
  { id: "admin", name: "Admin" },
  { id: "manager", name: "Manager" },
  { id: "staff", name: "Staff" },
  { id: "viewer", name: "Viewer" },
];

export async function GET() {
  return NextResponse.json({ data: SYSTEM_ROLES });
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const id = (body.name || "new_role").toLowerCase().replace(/\s+/g, "_");
  return NextResponse.json({ data: { id, name: body.name || "New Role" } });
}
