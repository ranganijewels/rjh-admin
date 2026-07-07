import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    data: {
      categories: [],
      metalColors: ["YELLOW", "WHITE", "ROSE"],
      metalQualities: ["14K", "18K", "22K"],
    },
  });
}
