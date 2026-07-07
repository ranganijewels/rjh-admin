import { NextResponse } from "next/server";

// Onboarding is JewelLabel-specific; always return completed state
export async function GET(req, { params }) {
  return NextResponse.json({
    data: {
      slug: (await params).slug,
      completed: true,
      on_boarding_exists: true,
    },
  });
}
