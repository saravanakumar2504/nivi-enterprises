"use client";

//https://cloud.mongodb.com/v2/6a6efb4c05170407b6806b8b#/overview
import { useState, useCallback, useEffect, type SyntheticEvent } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";

import { useAppDispatch } from "@/lib/hooks";
import { addProduct } from "@/lib/features/products/productsSlice";
import type { Product } from "@/lib/types";
import { LoadingIndicator } from "@/components/loading-indicator";
import { Toast } from "@/components/toast";

type ProductFormProps = {
  mode: "add" | "edit";
  productId?: string;
};

export function ProductForm({ mode, productId }: Readonly<ProductFormProps>) {
  const dispatch = useAppDispatch();
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" | "warning" } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const dismissToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    if (mode !== "edit" || !productId) return;
    fetch(`/api/products/${productId}`)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to load product");
        }
        return res.json() as Promise<Product>;
      })
      .then((data) => {
        setEditProduct(data);
        setLoadError(null);
      })
      .catch(() => {
        setLoadError("Product details could not be loaded right now.");
      });
  }, [mode, productId]);

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    // Capture FormData before flushSync re-renders and nulls currentTarget
    const data = new FormData(event.currentTarget);
    flushSync(() => {
      setSaving(true);
      setToast(null);
    });
    const payload = {
      name: (data.get("name") as string | null) ?? "",
      brand: (data.get("brand") as string | null) ?? "",
      modelNumber: (data.get("modelNumber") as string | null) ?? undefined,
      category: (data.get("category") as string | null) ?? "",
      size: (data.get("size") as string | null) ?? "",
      unit: (data.get("unit") as string | null) ?? "",
      rate: Number(data.get("rate") ?? 0),
    };

    const ve: Record<string, string> = {};
    if (!payload.name.trim()) ve.name = "Required";
    if (!payload.brand.trim()) ve.brand = "Required";
    if (!payload.size.trim()) ve.size = "Required";
    if (!(data.get("rate") as string | null)?.trim()) ve.rate = "Required";
    if (Object.keys(ve).length > 0) {
      setFieldErrors(ve);
      setSaving(false);
      return;
    }
    setFieldErrors({});

    try {
      const isEdit = mode === "edit" && productId;
      const res = await fetch(isEdit ? `/api/products/${productId}` : "/api/products", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        let msg = "Failed to save product";
        if (text) {
          try {
            const json = JSON.parse(text) as { error?: string };
            msg = json.error ?? msg;
          } catch {
            msg = text;
          }
        }
        setToast({ message: msg, variant: res.status === 409 ? "warning" : "error" });
        return;
      }
      const saved = (await res.json()) as Product;
      dispatch(addProduct(saved));
      setToast({ message: mode === "edit" ? "Product updated successfully" : "Product saved successfully", variant: "success" });
    } catch {
      setToast({ message: "Failed to connect to server", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  const title = mode === "add" ? "Add product" : "Edit product";
  const description =
    mode === "add"
      ? "Capture the item details you need for stock lookup and billing."
      : "Update quantity, rate, or size details when stock changes.";

  type AddField = { label: string; name: string; type: string; required: boolean; defaultValue: string; options?: string[] };

  const addFields: AddField[] = [
    { label: "Name",              name: "name",        type: "text",   required: true,  defaultValue: editProduct?.name ?? "" },
    { label: "Brand",             name: "brand",       type: "text",   required: true,  defaultValue: editProduct?.brand ?? "" },
    { label: "Model Number",      name: "modelNumber", type: "text",   required: false, defaultValue: editProduct?.modelNumber ?? "" },
    { label: "Category",          name: "category",    type: "text",   required: false, defaultValue: editProduct?.category ?? "" },
    { label: "Size / Spec",       name: "size",        type: "text",   required: true,  defaultValue: editProduct?.size ?? "" },
    { label: "Unit",              name: "unit",        type: "text",   required: false, defaultValue: editProduct?.unit ?? "" },
    { label: "Selling Rate (\u20b9)", name: "rate",   type: "number", required: true,  defaultValue: editProduct?.rate?.toString() ?? "" },
  ];

  let buttonLabel: string;
  if (saving) {
    buttonLabel = "Saving…";
  } else if (mode === "add") {
    buttonLabel = "Save product";
  } else {
    buttonLabel = "Update product";
  }

  return (
    <>
      <LoadingIndicator visible={saving} label="Saving product…" />
      {toast && (
        <Toast message={toast.message} variant={toast.variant} onDismiss={dismissToast} />
      )}
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-12 sm:px-10 lg:px-16">
      {loadError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}
      <section className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
          Products
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-zinc-950">{title}</h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-600">
          {description}
        </p>

        <form className="mt-8 flex flex-col gap-8" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            {addFields.map((field) => (
              <label key={field.label} className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-zinc-700">
                  {field.label}
                  {field.required && (
                    <span className="ml-0.5 text-red-500">*</span>
                  )}
                </span>
                {field.options ? (
                  <select
                    name={field.name}
                    defaultValue={field.defaultValue}
                    className={`rounded-2xl border px-4 py-3 text-zinc-950 outline-none transition focus:border-orange-400 bg-white ${
                      fieldErrors[field.name] ? "border-red-400" : "border-black/10"
                    }`}
                  >
                    <option value="">Select unit</option>
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    defaultValue={field.defaultValue}
                    placeholder={field.label}
                    className={`rounded-2xl border px-4 py-3 text-zinc-950 outline-none transition focus:border-orange-400 bg-white ${
                      fieldErrors[field.name] ? "border-red-400" : "border-black/10"
                    }`}
                  />
                )}
                {fieldErrors[field.name] && (
                  <span className="text-xs text-red-500">
                    {fieldErrors[field.name]}
                  </span>
                )}
              </label>
            ))}
          </div>
          <div className="md:col-span-2 flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50"
            >
              {saving && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {buttonLabel}
            </button>
            <Link
              href="/products"
              className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-950 hover:text-zinc-950"
            >
              Back to products
            </Link>
          </div>
        </form>
      </section>
    </main>
    </>
  );
}