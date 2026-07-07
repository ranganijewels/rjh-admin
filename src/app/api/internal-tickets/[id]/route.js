import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  return NextResponse.json({ data: { id: (await params).id, subject: "", status: "open", messages: [] } });
}
