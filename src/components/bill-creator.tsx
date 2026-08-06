"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
  const printRef = useRef<HTMLDivElement>(null);
  const [customerName, setCustomerName] = useState("Walk-in Customer");
  const [searchText, setSearchText] = useState("");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [lineItems, setLineItems] = useState<BillLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" | "warning" } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to load products");
        }
        return res.json() as Promise<Product[]>;
      })
      .then((products) => {
        setAllProducts(products);
        setLoadError(null);
      })
      .catch(() => setLoadError("Unable to load products right now."))
      .finally(() => setLoading(false));
  }, []);

  const subtotal = useMemo(
    () => lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0),
    [lineItems],
  );

  const filteredProducts = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return allProducts;
    return allProducts.filter((p) =>
      [p.name, p.brand, p.size, p.category, p.modelNumber]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [searchText, allProducts]);

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
      setToast({ message: `Invoice ${invoice.id} saved successfully`, variant: "success" });
    } catch {
      setToast({ message: "Failed to connect to server", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  function handlePrint() {
    if (lineItems.length === 0) {
      setToast({ message: "Add at least one product to print", variant: "warning" });
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .invoice-container {
            max-width: 600px;
            margin: 0 auto;
            border: 1px solid #ddd;
            padding: 40px;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #333;
            margin: 0;
          }
          .company-info {
            margin-top: 10px;
            font-size: 12px;
            color: #666;
            line-height: 1.6;
          }
          .customer-section {
            margin-bottom: 30px;
            font-size: 14px;
          }
          .customer-label {
            font-weight: bold;
            color: #333;
          }
          .customer-name {
            font-size: 16px;
            color: #333;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .items-table thead {
            background-color: #f5f5f5;
            border-bottom: 2px solid #333;
          }
          .items-table th {
            text-align: left;
            padding: 12px;
            font-weight: bold;
            color: #333;
            font-size: 12px;
          }
          .items-table td {
            padding: 12px;
            border-bottom: 1px solid #ddd;
            font-size: 12px;
          }
          .items-table .text-right {
            text-align: right;
          }
          .total-section {
            text-align: right;
            font-size: 14px;
            margin-bottom: 40px;
            padding-top: 20px;
            border-top: 2px solid #333;
          }
          .total-label {
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
          }
          .total-amount {
            font-size: 24px;
            font-weight: bold;
            color: #333;
          }
          .footer {
            text-align: center;
            font-size: 11px;
            color: #999;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
          }
          @media print {
            body {
              padding: 0;
            }
            .invoice-container {
              border: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <h1 class="company-name">Nivi Enterprises</h1>
            <div class="company-info">
              <div>Phone: 095005 54203</div>
              <div>Address: AISHWARYAM TOWER, 1/74A, PN Rd,<br/>Ayyampalayam, Tiruppur, Tamil Nadu 641666</div>
            </div>
          </div>

          <div class="customer-section">
            <span class="customer-label">Customer: </span>
            <span class="customer-name">${customerName}</span>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Rate</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${lineItems
                .map(
                  (item) => `
                <tr>
                  <td>${item.productName}</td>
                  <td class="text-right">${item.quantity}</td>
                  <td class="text-right">Rs. ${item.rate.toLocaleString("en-IN")}</td>
                  <td class="text-right">Rs. ${(item.quantity * item.rate).toLocaleString("en-IN")}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-label">Grand Total</div>
            <div class="total-amount">Rs. ${subtotal.toLocaleString("en-IN")}</div>
          </div>

          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Generated on ${new Date().toLocaleString("en-IN")}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  }

  return (
    <main className="flex h-full flex-col">
      <LoadingIndicator visible={saving} label="Saving invoice…" />
      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onDismiss={() => setToast(null)}
        />
      )}
      <section className="grid min-h-0 flex-1 gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="flex min-h-0 flex-col rounded-3xl border border-black/10 bg-white shadow-sm">
          <div className="shrink-0 border-b border-black/5 px-8 pt-8 pb-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
              Billing / Create
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-zinc-950">Create bill</h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm">
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
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Name, brand, size or category"
                  className="rounded-2xl border border-black/10 bg-stone-50 px-4 py-3 text-zinc-950 outline-none transition focus:border-orange-400"
                />
              </label>
            </div>

            {loadError && (
              <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {loadError}
              </p>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-auto p-4">
            {loading && (
              <p className="px-4 py-3 text-sm text-zinc-400">Loading products…</p>
            )}
            {!loading && filteredProducts.length === 0 && (
              <p className="px-4 py-3 text-sm text-zinc-400">No products found.</p>
            )}
            <div className="space-y-2">
              {filteredProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between gap-4 rounded-2xl border border-black/5 bg-stone-50 px-4 py-3">
                  <div>
                    <p className="font-medium text-zinc-950">{product.name}</p>
                    <p className="mt-0.5 text-sm text-zinc-500">
                      {product.brand} • {product.size} • Rs. {product.rate.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addLineItem(product)}
                    className="shrink-0 rounded-full bg-zinc-950 px-4 py-2 text-xs font-medium text-white transition hover:bg-zinc-800"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="flex min-h-0 flex-col rounded-3xl border border-black/10 bg-zinc-950 p-8 text-white shadow-sm">
          <p className="shrink-0 text-sm font-semibold uppercase tracking-[0.2em] text-orange-300">
            Bill preview
          </p>
          <div className="scrollbar-dark mt-6 min-h-0 flex-1 space-y-4 pr-1">
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
          <div className="mt-6 shrink-0 rounded-2xl bg-orange-500 px-5 py-4 text-zinc-950">
            <p className="text-sm font-medium uppercase tracking-[0.2em]">
              Grand total
            </p>
            <p className="mt-2 text-3xl font-semibold">
              Rs. {subtotal.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="mt-4 flex gap-3 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 rounded-full border border-white bg-transparent px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Print
            </button>
            <button
              type="button"
              onClick={saveBill}
              disabled={saving}
              className="flex-1 rounded-full bg-white px-5 py-3 text-sm font-medium text-zinc-950 transition hover:bg-orange-50 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save bill"}
            </button>
          </div>
        </aside>
      </section>
    </main>
  );
}