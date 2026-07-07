import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ data: [] });
}

export async function POST(req) {
  return NextResponse.json({ success: true });
}
