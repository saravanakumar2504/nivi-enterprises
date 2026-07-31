"use client";

import { selectInvoices } from "@/lib/selectors/dashboard";
import { useAppSelector } from "@/lib/hooks";

export function BillingHistory() {
  const invoices = useAppSelector(selectInvoices);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-12 sm:px-10 lg:px-16">
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
              <p className="text-2xl font-semibold text-zinc-950">
                Rs. {invoice.total.toLocaleString("en-IN")}
              </p>
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
    </main>
  );
}