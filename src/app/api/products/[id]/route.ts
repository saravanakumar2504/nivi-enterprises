import { NextResponse } from "next/server";

import clientPromise from "@/lib/db";
import type { Product } from "@/lib/types";

const DB_NAME = "nivi-enterprises";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const doc = await client
      .db(DB_NAME)
      .collection("products")
      .findOne({ id }, { projection: { _id: 0 } });

    if (!doc) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(doc);
  } catch {
    return NextResponse.json(
      { error: "Database unavailable. Unable to load product." },
      { status: 503 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Partial<Omit<Product, "id">>;

    const client = await clientPromise;
    const result = await client
      .db(DB_NAME)
      .collection("products")
      .findOneAndUpdate(
        { id },
        { $set: body },
        { returnDocument: "after", projection: { _id: 0 } },
      );

    if (!result) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Database unavailable. Unable to update product." },
      { status: 503 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const result = await client
      .db(DB_NAME)
      .collection("products")
      .deleteOne({ id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { error: "Database unavailable. Unable to delete product." },
      { status: 503 },
    );
  }
}
