import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    data: {
      name: "RJ House",
      email: "admin@rjhouse.com",
      phone: "",
      address: "",
      city: "",
      country: "India",
      logo: "",
      website: "rjhouse.com",
    },
  });
}

export async function POST(req) {
  return NextResponse.json({ success: true, message: "Profile updated" });
}
