import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ data: { currency: "INR", timezone: "Asia/Kolkata" } });
}

export async function POST(req) {
  return NextResponse.json({ success: true, message: "Settings saved" });
}
