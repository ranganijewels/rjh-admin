import { NextResponse } from "next/server";

// Must match RegisterDto's role enum exactly (rj-house-api auth/dto/register.dto.ts)
// — "super_admin" was listed here but isn't an accepted value, so picking it
// always failed user creation with a 400.
const ROLES = [
  { id: "admin", name: "Admin", slug: "admin" },
  { id: "manager", name: "Manager", slug: "manager" },
  { id: "staff", name: "Staff", slug: "staff" },
  { id: "viewer", name: "Viewer", slug: "viewer" },
];

export async function GET() {
  return NextResponse.json({ data: ROLES });
}
