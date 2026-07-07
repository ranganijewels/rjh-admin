import { NextResponse } from "next/server";

// Internal tickets / support — return empty paginated list until a full ticketing system is built
export async function GET() {
  return NextResponse.json({
    data: [],
    meta: { current_page: 1, last_page: 1, total: 0, per_page: 20 },
  });
}

export async function POST(req) {
  return NextResponse.json({ success: true, message: "Ticket created" });
}
