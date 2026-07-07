import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ data: { logo: "", banner: "", primaryColor: "#0d9488" } });
}

export async function POST(req) {
  return NextResponse.json({ success: true, message: "Branding updated" });
}
