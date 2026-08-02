import { NextResponse } from "next/server";

import clientPromise from "@/lib/db";
import type { Product } from "@/lib/types";

const DB_NAME = "nivi-enterprises";

type ProductInput = Omit<Product, "id" | "quantity" | "reorderLevel"> & {
  quantity?: number;
  reorderLevel?: number;
};

export async function GET() {
  try {
    const client = await clientPromise;
    const docs = await client.db(DB_NAME).collection("products")
      .find({}, { projection: { _id: 0 } })
      .toArray();
    return NextResponse.json(docs);
  } catch {
    return NextResponse.json(
      { error: "Database unavailable. Unable to load products." },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ProductInput;

    const required = ["name", "brand", "size", "rate"] as const;

    for (const field of required) {
      if (body[field] === undefined || body[field] === null || body[field] === "") {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 },
        );
      }
    }

    const product: Product = {
      ...body,
      id: crypto.randomUUID(),
      quantity: body.quantity ?? 0,
      reorderLevel: body.reorderLevel ?? 0,
    };

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    // Escape regex special chars to prevent ReDoS
    const escapeForRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
    const ci = (s: string) => new RegExp("^" + escapeForRegex(s) + "$", "i");

    const existing = await db.collection("products").findOne({
      name: ci(body.name),
      brand: ci(body.brand),
      size: ci(body.size),
      rate: body.rate,
    });

    if (existing) {
      return NextResponse.json(
        { error: "A product with the same name, brand, size and rate already exists." },
        { status: 409 },
      );
    }

    await db.collection("products").insertOne({ ...product });

    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Database unavailable. Unable to save product." },
      { status: 503 },
    );
  }
}
