import { NextResponse } from "next/server";

import clientPromise from "@/lib/db";

const DB_NAME = "nivi-enterprises";

export async function GET() {
  try {
    const client = await clientPromise;
    const docs = await client.db(DB_NAME).collection("invoices")
      .find({}, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json(docs);
  } catch {
    return NextResponse.json(
      { error: "Database unavailable. Unable to load invoices." },
      { status: 503 },
    );
  }
}
