import { NextResponse } from "next/server";

export async function DELETE() {
  return NextResponse.json({ success: true });
}

export async function PUT(req, { params }) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json({ data: { id: (await params).id, ...body } });
}
