"use client";

import { useEffect, useState } from "react";

import type { Invoice } from "@/lib/types";
import { Toast } from "@/components/toast";

export function BillingHistory() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" | "warning" } | null>(null);

  const loadInvoices = () => {
    fetch("/api/invoices")
      .then((res) => res.json() as Promise<Invoice[]>)
      .then(setInvoices)
      .catch(() => setToast({ message: "Failed to load invoices", variant: "error" }));
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const handleDelete = async (invoiceId: string) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) {
      return;
    }

    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const text = await res.text();
        let message = "Failed to delete invoice";
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

      setInvoices((current) => current.filter((inv) => inv.id !== invoiceId));
      setToast({ message: "Invoice deleted successfully", variant: "success" });
    } catch {
      setToast({ message: "Failed to connect to server", variant: "error" });
    }
  };

  return (
    <main className="scrollbar-light flex h-full flex-col overflow-auto">
      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onDismiss={() => setToast(null)}
        />
      )}
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-12 sm:px-10 lg:px-16">
        <section className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
            Billing
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-zinc-950">
            Sales registry
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-600">
            Review past invoices, totals, and customer names from previous sales.
          </p>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          {invoices.map((invoice) => (
            <article
              key={invoice.id}
              className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-zinc-500">{invoice.id}</p>
                  <h3 className="mt-2 text-xl font-semibold text-zinc-950">
                    {invoice.customerName}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-600">
                    {new Date(invoice.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <p className="text-2xl font-semibold text-zinc-950">
                    Rs. {invoice.total.toLocaleString("en-IN")}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleDelete(invoice.id)}
                    className="mt-1 h-7 w-7 flex items-center justify-center rounded-full hover:bg-red-50 text-red-500 transition hover:text-red-700"
                    title="Delete invoice"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M3 6h18M8 6V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2m0 0H3v2c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V6zM5 9h14v11c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V9zm4 2v7M12 11v7M15 11v7" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="mt-5 space-y-3 rounded-2xl bg-stone-50 p-4">
                {invoice.items.map((item) => (
                  <div key={`${invoice.id}-${item.productId}`} className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-zinc-700">
                      {item.productName} × {item.quantity}
                    </span>
                    <span className="font-medium text-zinc-950">
                      Rs. {(item.quantity * item.rate).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}