"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { selectProducts } from "@/lib/selectors/dashboard";
import { useAppSelector } from "@/lib/hooks";

export function ProductsTable() {
  const products = useAppSelector(selectProducts);
  const [query, setQuery] = useState("");

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return products;
    }

    return products.filter((product) => {
      const haystack = [
        product.name,
        product.brand,
        product.size,
        product.category,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [products, query]);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-12 sm:px-10 lg:px-16">
      <section className="flex flex-col gap-4 rounded-3xl border border-black/10 bg-white p-8 shadow-sm lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
            Products
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-zinc-950">
            Inventory directory
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-600">
            Search stock instantly when a customer asks for a cable, switch,
            bulb, or accessory.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, brand, size, or category"
            className="min-w-[280px] rounded-full border border-black/10 bg-stone-50 px-5 py-3 text-sm text-zinc-950 outline-none transition focus:border-orange-400"
          />
          <Link
            href="/products/add"
            className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            Add product
          </Link>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-stone-50 text-sm text-zinc-500">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Brand</th>
                <th className="px-6 py-4 font-medium">Size</th>
                <th className="px-6 py-4 font-medium">Qty</th>
                <th className="px-6 py-4 font-medium">Rate</th>
                <th className="px-6 py-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-t border-black/5">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-zinc-950">{product.name}</p>
                      <p className="text-sm text-zinc-500">{product.category}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-700">{product.brand}</td>
                  <td className="px-6 py-4 text-zinc-700">{product.size}</td>
                  <td className="px-6 py-4 text-zinc-700">{product.quantity}</td>
                  <td className="px-6 py-4 text-zinc-700">
                    Rs. {product.rate.toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/products/${product.id}/edit`}
                      className="text-sm font-medium text-orange-700 transition hover:text-orange-800"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}