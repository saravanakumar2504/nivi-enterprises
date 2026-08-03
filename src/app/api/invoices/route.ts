import { NextResponse } from "next/server";

import clientPromise from "@/lib/db";
import type { CreateInvoiceInput, Invoice, InvoiceLine, Product } from "@/lib/types";

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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateInvoiceInput;
    const customerName = body.customerName?.trim();

    if (!customerName) {
      return NextResponse.json({ error: "customerName is required" }, { status: 400 });
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "At least one invoice item is required" }, { status: 400 });
    }

    const invalidLine = body.items.find(
      (item) => !item.productId || !Number.isInteger(item.quantity) || item.quantity <= 0,
    );

    if (invalidLine) {
      return NextResponse.json(
        { error: "Each invoice item must include productId and a positive integer quantity" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const productsCollection = db.collection<Product>("products");
    const invoicesCollection = db.collection<Invoice>("invoices");

    const requestedByProductId = new Map<string, number>();
    for (const item of body.items) {
      const prev = requestedByProductId.get(item.productId) ?? 0;
      requestedByProductId.set(item.productId, prev + item.quantity);
    }

    const productIds = [...requestedByProductId.keys()];
    const products = await productsCollection
      .find(
        { id: { $in: productIds } },
        { projection: { _id: 0 } },
      )
      .toArray();

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: "One or more selected products are no longer available" },
        { status: 400 },
      );
    }

    const productById = new Map(products.map((product) => [product.id, product]));

    const invoiceItems: InvoiceLine[] = body.items.map((item) => {
      const product = productById.get(item.productId) as Product;
      return {
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        rate: product.rate,
      };
    });

    const total = invoiceItems.reduce((sum, item) => sum + item.quantity * item.rate, 0);

    const invoice: Invoice = {
      id: `inv-${Date.now()}`,
      createdAt: new Date().toISOString(),
      customerName,
      items: invoiceItems,
      total,
    };

    const stockUpdateOps = [...requestedByProductId.entries()].map(([productId, quantity]) => ({
      updateOne: {
        filter: { id: productId },
        update: { $inc: { quantity: -quantity } },
      },
    }));

    await invoicesCollection.insertOne(invoice);
    await productsCollection.bulkWrite(stockUpdateOps);

    return NextResponse.json(invoice, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Database unavailable. Unable to create invoice." },
      { status: 503 },
    );
  }
}
