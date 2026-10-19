import { NextResponse } from "next/server";
import { ROLES } from "@/config/rbac";

// Must match RegisterDto's role enum exactly (rj-house-api auth/dto/register.dto.ts).
// Single source of truth: src/config/rbac.js — the backend only accepts these
// four staff role slugs ("super_admin" is not a valid value).
export async function GET() {
  return NextResponse.json({
    data: ROLES.map((role) => ({
      id: role.key,
      name: role.name,
      slug: role.key,
    })),
  });
}
