"use client";

import { useEffect, useMemo, useState } from "react";

import { completeSale } from "@/lib/features/shop/shopActions";
import { useAppDispatch } from "@/lib/hooks";
import type { CreateInvoiceInput, Invoice, Product } from "@/lib/types";
import { LoadingIndicator } from "@/components/loading-indicator";
import { Toast } from "@/components/toast";

type BillLine = {
  productId: string;
  productName: string;
  rate: number;
  quantity: number;
};

export function BillCreator() {
  const dispatch = useAppDispatch();
  const [customerName, setCustomerName] = useState("Walk-in Customer");
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [lineItems, setLineItems] = useState<BillLine[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" | "warning" } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const query = searchText.trim();
    if (query.length < 2) {
      return;
    }

    const timer = setTimeout(() => {
      setSearching(true);
      fetch(`/api/products?query=${encodeURIComponent(query)}&limit=20`)
        .then(async (res) => {
          if (!res.ok) {
            const text = await res.text();
            throw new Error(text || "Failed to search products");
          }
          return res.json() as Promise<Product[]>;
        })
        .then((products) => {
          setSearchResults(products);
          setLoadError(null);
        })
        .catch(() => {
          setSearchResults([]);
          setLoadError("Unable to search products right now.");
        })
        .finally(() => setSearching(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText]);

  const subtotal = useMemo(
    () => lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0),
    [lineItems],
  );

  function addLineItem(product: Product) {
    setLineItems((current) => {
      const existing = current.find((line) => line.productId === product.id);
      if (!existing) {
        return [
          ...current,
          {
            productId: product.id,
            productName: product.name,
            rate: product.rate,
            quantity: 1,
          },
        ];
      }

      return current.map((line) =>
        line.productId === product.id
          ? { ...line, quantity: line.quantity + 1 }
          : line,
      );
    });
  }

  function updateLineQuantity(productId: string, delta: number) {
    setLineItems((current) =>
      current
        .map((line) => {
          if (line.productId !== productId) return line;
          const nextQuantity = line.quantity + delta;
          if (nextQuantity < 1) {
            return line;
          }
          return { ...line, quantity: nextQuantity };
        }),
    );
  }

  function removeLineItem(productId: string) {
    setLineItems((current) => current.filter((line) => line.productId !== productId));
  }

  async function saveBill() {
    const trimmedCustomer = customerName.trim();
    if (!trimmedCustomer) {
      setToast({ message: "Customer name is required", variant: "warning" });
      return;
    }

    if (lineItems.length === 0) {
      setToast({ message: "Add at least one product", variant: "warning" });
      return;
    }

    const payload: CreateInvoiceInput = {
      customerName: trimmedCustomer,
      items: lineItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    };

    try {
      setSaving(true);
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        let message = "Failed to create invoice";
        if (text) {
          try {
            const json = JSON.parse(text) as { error?: string };
            message = json.error ?? message;
          } catch {
            message = text;
          }
        }
        setToast({ message, variant: "error" });
        return;
      }

      const invoice = (await res.json()) as Invoice;
      dispatch(
        completeSale({
          invoiceId: invoice.id,
          createdAt: invoice.createdAt,
          customerName: invoice.customerName,
          items: invoice.items,
        }),
      );

      setLineItems([]);
      setSearchText("");
      setSearchResults([]);
      setToast({ message: `Invoice ${invoice.id} saved successfully`, variant: "success" });
    } catch {
      setToast({ message: "Failed to connect to server", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-12 sm:px-10 lg:px-16">
      <LoadingIndicator visible={saving} label="Saving invoice…" />
      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onDismiss={() => setToast(null)}
        />
      )}
      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
            Billing / Create
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-zinc-950">Create bill</h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-600">
            Search your catalog, add items to the current bill, and save the
            invoice in one flow.
          </p>

          <div className="mt-8 grid gap-4">
            <label className="flex flex-col gap-2 text-sm md:max-w-md">
              <span className="font-medium text-zinc-700">Customer name</span>
              <input
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                className="rounded-2xl border border-black/10 bg-stone-50 px-4 py-3 text-zinc-950 outline-none transition focus:border-orange-400"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-zinc-700">Search products</span>
              <input
                value={searchText}
                onChange={(event) => {
                  const value = event.target.value;
                  setSearchText(value);
                  if (value.trim().length < 2) {
                    setSearchResults([]);
                    setLoadError(null);
                  }
                }}
                placeholder="Type product name, brand, size or category"
                className="rounded-2xl border border-black/10 bg-stone-50 px-4 py-3 text-zinc-950 outline-none transition focus:border-orange-400"
              />
            </label>
          </div>

          {loadError && (
            <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loadError}
            </p>
          )}

          <div className="mt-8 rounded-2xl bg-stone-50 p-5">
            <p className="text-sm font-medium text-zinc-500">Search results</p>
            <div className="mt-4 space-y-3">
              {searching && (
                <p className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-zinc-500">
                  Searching products…
                </p>
              )}
              {!searching && searchText.trim().length < 2 && (
                <p className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-zinc-500">
                  Type at least 2 characters to search.
                </p>
              )}
              {!searching && searchText.trim().length >= 2 && searchResults.length === 0 && (
                <p className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-zinc-500">
                  No products found.
                </p>
              )}
              {searchResults.map((product) => (
                <div key={product.id} className="flex items-center justify-between gap-4 rounded-2xl border border-black/5 bg-white p-4">
                  <div>
                    <p className="font-medium text-zinc-950">{product.name}</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {product.brand} • {product.size}
                    </p>
                    <p className="mt-2 text-sm text-zinc-700">
                      Stock: {product.quantity} • Rate: Rs. {product.rate.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addLineItem(product)}
                    className="rounded-full bg-zinc-950 px-4 py-2 text-xs font-medium text-white transition hover:bg-zinc-800"
                  >
                    Add
                  </button>
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
            {lineItems.length === 0 && (
              <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
                Add products to start building a bill.
              </p>
            )}
            {lineItems.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div>
                  <p className="font-medium text-white">{item.productName}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateLineQuantity(item.productId, -1)}
                      className="h-7 w-7 rounded-full border border-white/20 text-sm"
                    >
                      -
                    </button>
                    <span className="min-w-8 text-center text-sm text-zinc-200">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateLineQuantity(item.productId, 1)}
                      className="h-7 w-7 rounded-full border border-white/20 text-sm"
                    >
                      +
                    </button>
                    <span className="ml-2 text-sm text-zinc-300">
                      @ Rs. {item.rate.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">Rs. {(item.quantity * item.rate).toLocaleString("en-IN")}</p>
                  <button
                    type="button"
                    onClick={() => removeLineItem(item.productId)}
                    className="mt-2 text-xs text-red-300 transition hover:text-red-200"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-orange-500 px-5 py-4 text-zinc-950">
            <p className="text-sm font-medium uppercase tracking-[0.2em]">
              Grand total
            </p>
            <p className="mt-2 text-3xl font-semibold">
              Rs. {subtotal.toLocaleString("en-IN")}
            </p>
          </div>
          <button
            type="button"
            onClick={saveBill}
            disabled={saving}
            className="mt-6 w-full rounded-full bg-white px-5 py-3 text-sm font-medium text-zinc-950 transition hover:bg-orange-50"
          >
            {saving ? "Saving…" : "Save bill"}
          </button>
        </aside>
      </section>
    </main>
  );
}