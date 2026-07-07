import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    data: {
      steps: ["branding", "categories", "margin", "launch"],
      current_step: "launch",
      completed: true,
    },
  });
}
