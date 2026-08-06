import { NextResponse } from "next/server";

import clientPromise from "@/lib/db";

const DB_NAME = "nivi-enterprises";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Invoice ID is required" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const result = await db.collection("invoices").deleteOne({ id });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Database unavailable. Unable to delete invoice." },
      { status: 503 },
    );
  }
}
