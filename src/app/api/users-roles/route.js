import { NextResponse } from "next/server";
import { ROLES } from "@/config/rbac";

// The backend only supports a fixed role enum, so the Roles page lists the
// supported system roles (single source of truth: src/config/rbac.js).
export async function GET() {
  return NextResponse.json({
    data: ROLES.map((role) => ({
      id: role.key,
      name: role.name,
      description: role.description,
    })),
  });
}
