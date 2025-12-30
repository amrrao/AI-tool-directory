import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "http://3.236.152.152";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const res = await fetch(`${BACKEND_URL}/tools`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to create tool" },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
