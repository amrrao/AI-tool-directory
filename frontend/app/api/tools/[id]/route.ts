import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const res = await fetch(
    `http://3.236.152.152/fetchbyproductid/${params.id}`
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

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const res = await fetch(
    `http://3.236.152.152/deletebyproductid/${params.id}`,
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

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
  ) {
    const body = await req.json();
  
    const res = await fetch(
      `http://3.236.152.152/tools/${params.id}`,
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
  