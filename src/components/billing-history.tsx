"use client";

import { useEffect, useState } from "react";

import type { Invoice } from "@/lib/types";
import { Toast } from "@/components/toast";

export function BillingHistory() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" | "warning" } | null>(null);

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Initialize with last 7 days on mount
  useEffect(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const formatDate = (date: Date): string => {
      return date.toISOString().split("T")[0];
    };

    setStartDate(formatDate(sevenDaysAgo));
    setEndDate(formatDate(today));
  }, []);

  const loadInvoices = (start?: string, end?: string) => {
    const params = new URLSearchParams();
    if (start) {
      // Convert date string to ISO timestamp at start of day (UTC)
      params.append("startDate", `${start}T00:00:00.000Z`);
    }
    if (end) {
      // Convert date string to ISO timestamp at end of day (UTC)
      params.append("endDate", `${end}T23:59:59.999Z`);
    }

    const url = `/api/invoices${params.toString() ? `?${params.toString()}` : ""}`;

    fetch(url)
      .then((res) => res.json() as Promise<Invoice[]>)
      .then(setInvoices)
      .catch(() => setToast({ message: "Failed to load invoices", variant: "error" }));
  };

  useEffect(() => {
    if (startDate && endDate) {
      loadInvoices(startDate, endDate);
    }
  }, [startDate, endDate]);

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

  const handlePrint = (invoice: Invoice) => {
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
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 0px;
          }
          .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #333;
            margin: 0;
          }
          .company-name-2 {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
          }
          .company-info {
            margin-top: 0px;
            font-size: 12px;
            color: #666;
            line-height: 1.6;
            margin-bottom: 10px;

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
            <div class="company-name">NIVI ENTERPRISES</div>
            <div class="company-name-2">Electrical, Hardwares and RO Systems.</div>
            <div class="company-info">
              <div>AISHWARYAM TOWER, 1/74A, PN Rd,<br/>Ayyampalayam, Tiruppur, Tamil Nadu 641666</div>
            </div>
          </div>

          <div class="customer-section">
            <span class="customer-label">Customer: </span>
            <span class="customer-name">${invoice.customerName}</span>
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
              ${invoice.items
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
            <div class="total-amount">Rs. ${invoice.total.toLocaleString("en-IN")}</div>
          </div>

          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Generated on ${new Date(invoice.createdAt).toLocaleString("en-IN")}</p>
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

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-zinc-700">From date</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-2xl border-2 border-black/10 px-4 py-2 text-sm text-zinc-950 outline-none transition focus:border-orange-400"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-zinc-700">To date</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-2xl border-2 border-black/10 px-4 py-2 text-sm text-zinc-950 outline-none transition focus:border-orange-400"
              />
            </label>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          {invoices.length === 0 ? (
            <div className="col-span-full rounded-3xl border-2 border-dashed border-zinc-300 bg-zinc-50 px-8 py-12 text-center">
              <p className="text-lg font-medium text-zinc-600">No invoices found</p>
              <p className="mt-2 text-sm text-zinc-500">
                No bills were created between{" "}
                <span className="font-medium">{new Date(startDate).toLocaleDateString("en-IN")}</span> and{" "}
                <span className="font-medium">{new Date(endDate).toLocaleDateString("en-IN")}</span>.
              </p>
              <p className="mt-4 text-sm text-zinc-400">
                Try adjusting the date range or create a new bill from the{" "}
                <span className="font-medium">Create Bill</span> page.
              </p>
            </div>
          ) : (
            invoices.map((invoice) => (
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
                  <div className="flex items-start gap-2">
                    <p className="text-2xl font-semibold text-zinc-950">
                      Rs. {invoice.total.toLocaleString("en-IN")}
                    </p>
                    <button
                      type="button"
                      onClick={() => handlePrint(invoice)}
                      className="mt-1 h-7 w-7 flex items-center justify-center rounded-full hover:bg-blue-50 text-blue-500 transition hover:text-blue-700"
                      title="Print invoice"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" />
                      </svg>
                    </button>
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
            ))
          )}
        </section>
      </div>
    </main>
  );
}