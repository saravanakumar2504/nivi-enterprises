"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { Product } from "@/lib/types";
import { LoadingIndicator } from "@/components/loading-indicator";

export function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    fetch("/api/products")
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to load products");
        }
        return res.json() as Promise<Product[]>;
      })
      .then((data) => {
        setProducts(data);
        setLoadError(null);
      })
      .catch(() => {
        setLoadError("Products could not be loaded right now. Check the API connection.");
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return products;
    return products.filter((p) =>
      [p.name, p.brand, p.size, p.category, p.modelNumber]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [products, query]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <LoadingIndicator visible={loading} label="Loading products…" />
      {loadError && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">Products</p>
          <h2 className="mt-1 text-2xl font-semibold text-zinc-950">Inventory directory</h2>
        </div>
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, brand or size"
            className="rounded-full border border-black/10 bg-stone-50 px-4 py-2 text-sm text-zinc-950 outline-none transition focus:border-orange-400"
          />
          <Link
            href="/products/add"
            className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            Add product
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-stone-50 text-zinc-500">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Brand</th>
                <th className="px-5 py-3 font-medium">Model No.</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Size / Spec</th>
                <th className="px-5 py-3 font-medium">Unit</th>
                <th className="px-5 py-3 font-medium">Rate (₹)</th>
                <th className="px-5 py-3 font-medium">Action</th>
                <th className="px-5 py-3 font-medium">Delete</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={9} className="px-5 py-8 text-center text-zinc-400">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && loadError && (
                <tr>
                  <td colSpan={9} className="px-5 py-8 text-center text-red-500">
                    {loadError}
                  </td>
                </tr>
              )}
              {!loading && filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-8 text-center text-zinc-400">
                    No products found.
                  </td>
                </tr>
              )}
              {filteredProducts.map((p) => (
                <tr key={p.id} className="border-t border-black/5">
                  <td className="px-5 py-3 font-medium text-zinc-950">{p.name}</td>
                  <td className="px-5 py-3 text-zinc-700">{p.brand}</td>
                  <td className="px-5 py-3 text-zinc-500">{p.modelNumber ?? "—"}</td>
                  <td className="px-5 py-3 text-zinc-500">{p.category || "—"}</td>
                  <td className="px-5 py-3 text-zinc-700">{p.size}</td>
                  <td className="px-5 py-3 text-zinc-500">{p.unit || "—"}</td>
                  <td className="px-5 py-3 text-zinc-700">₹{p.rate.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/products/${p.id}/edit`}
                      className="font-medium text-orange-600 transition hover:text-orange-800"
                    >
                      Edit
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      disabled={deletingId === p.id}
                      aria-label={`Delete ${p.name}`}
                      className="text-zinc-400 transition hover:text-red-500 disabled:opacity-40"
                    >
                      {deletingId === p.id ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-red-400 inline-block" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                          <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193v-.443A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}