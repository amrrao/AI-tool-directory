import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "http://3.236.152.152";

// GET /api/tools/:id
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const res = await fetch(
    `${BACKEND_URL}/fetchbyproductid/${params.id}`
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch tool" },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}

// PUT /api/tools/:id
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();

  const res = await fetch(
    `${BACKEND_URL}/tools/${params.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to update tool" },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}

// DELETE /api/tools/:id
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const res = await fetch(
    `${BACKEND_URL}/deletebyproductid/${params.id}`,
    {
      method: "DELETE",
    }
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to delete tool" },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
