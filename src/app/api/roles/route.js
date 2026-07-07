import { NextResponse } from "next/server";

const ROLES = [
  { id: "super_admin", name: "Super Admin", slug: "super_admin" },
  { id: "admin", name: "Admin", slug: "admin" },
  { id: "manager", name: "Manager", slug: "manager" },
  { id: "staff", name: "Staff", slug: "staff" },
  { id: "viewer", name: "Viewer", slug: "viewer" },
];

export async function GET() {
  return NextResponse.json({ data: ROLES });
}
