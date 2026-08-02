"use client";

import { useEffect, useMemo, useState } from "react";

import { completeSale } from "@/lib/features/shop/shopActions";
import { useAppDispatch } from "@/lib/hooks";
import type { Product } from "@/lib/types";

const sampleCart = [
  { productId: "prd-101", quantity: 1 },
  { productId: "prd-103", quantity: 4 },
];

export function BillCreator() {
  const dispatch = useAppDispatch();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json() as Promise<Product[]>)
      .then(setProducts);
  }, []);

  const selectedItems = useMemo(
    () =>
      sampleCart
        .map((entry) => {
          const product = products.find((item) => item.id === entry.productId);

          if (!product) {
            return null;
          }

          return {
            productId: product.id,
            productName: product.name,
            quantity: entry.quantity,
            rate: product.rate,
          };
        })
        .filter((item) => item !== null),
    [products],
  );

  const total = selectedItems.reduce(
    (sum, item) => sum + item.quantity * item.rate,
    0,
  );

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-12 sm:px-10 lg:px-16">
      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
            Billing / Create
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-zinc-950">
            Create bill scaffold
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-600">
            This page is the right route for your digital cash register. The
            final implementation should let the user search inventory, choose
            quantities, calculate subtotals, and dispatch one action that both
            records the invoice and reduces stock.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-zinc-700">Customer name</span>
              <input
                defaultValue="Walk-in Customer"
                className="rounded-2xl border border-black/10 bg-stone-50 px-4 py-3 text-zinc-950 outline-none transition focus:border-orange-400"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-zinc-700">Search products</span>
              <input
                defaultValue="House Wire"
                className="rounded-2xl border border-black/10 bg-stone-50 px-4 py-3 text-zinc-950 outline-none transition focus:border-orange-400"
              />
            </label>
          </div>

          <div className="mt-8 rounded-2xl bg-stone-50 p-5">
            <p className="text-sm font-medium text-zinc-500">Available products</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="rounded-2xl border border-black/5 bg-white p-4"
                >
                  <p className="font-medium text-zinc-950">{product.name}</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {product.brand} • {product.size}
                  </p>
                  <p className="mt-3 text-sm text-zinc-700">
                    Stock: {product.quantity} • Rate: Rs. {product.rate}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="rounded-3xl border border-black/10 bg-zinc-950 p-8 text-white shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-300">
            Bill preview
          </p>
          <div className="mt-6 space-y-4">
            {selectedItems.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div>
                  <p className="font-medium text-white">{item.productName}</p>
                  <p className="text-sm text-zinc-300">
                    {item.quantity} × Rs. {item.rate.toLocaleString("en-IN")}
                  </p>
                </div>
                <p className="font-semibold text-white">
                  Rs. {(item.quantity * item.rate).toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-orange-500 px-5 py-4 text-zinc-950">
            <p className="text-sm font-medium uppercase tracking-[0.2em]">
              Grand total
            </p>
            <p className="mt-2 text-3xl font-semibold">
              Rs. {total.toLocaleString("en-IN")}
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              dispatch(
                completeSale({
                  invoiceId: `inv-${Date.now()}`,
                  createdAt: new Date().toISOString(),
                  customerName: "Walk-in Customer",
                  items: selectedItems,
                }),
              )
            }
            className="mt-6 w-full rounded-full bg-white px-5 py-3 text-sm font-medium text-zinc-950 transition hover:bg-orange-50"
          >
            Simulate save bill
          </button>
        </aside>
      </section>
    </main>
  );
}