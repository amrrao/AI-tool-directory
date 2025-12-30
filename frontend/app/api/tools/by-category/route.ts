import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  const res = await fetch(
    `http://3.236.152.152/fetchbycategory?category=${category}`
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch tools" },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
