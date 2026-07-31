"use client";

import Link from "next/link";

import { useAppSelector } from "@/lib/hooks";
import { selectProducts } from "@/lib/selectors/dashboard";

type ProductFormProps = {
  mode: "add" | "edit";
  productId?: string;
};

export function ProductForm({ mode, productId }: ProductFormProps) {
  const products = useAppSelector(selectProducts);
  const product = products.find((item) => item.id === productId);

  const title = mode === "add" ? "Add product" : "Edit product";
  const description =
    mode === "add"
      ? "Capture the item details you need for stock lookup and billing."
      : "Update quantity, rate, or size details when stock changes.";

  const editFields = [
    { label: "Product name", defaultValue: product?.name ?? "" },
    { label: "Brand", defaultValue: product?.brand ?? "" },
    { label: "Category", defaultValue: product?.category ?? "" },
    { label: "Size / Type", defaultValue: product?.size ?? "" },
    { label: "Quantity", defaultValue: product?.quantity?.toString() ?? "" },
    { label: "Rate", defaultValue: product?.rate?.toString() ?? "" },
  ];

  const addSections = [
    {
      title: "Section 1: General Info",
      fields: [
        { label: "Name", defaultValue: product?.name ?? "", type: "text" },
        { label: "Brand", defaultValue: product?.brand ?? "", type: "text" },
        {
          label: "Category",
          defaultValue: product?.category ?? "",
          type: "text",
        },
        { label: "Model Number", defaultValue: "", type: "text" },
        { label: "Location", defaultValue: "", type: "text" },
        {
          label: "Purchase Rate",
          defaultValue: product?.rate?.toString() ?? "",
          type: "number",
        },
        { label: "Date of Purchase", defaultValue: "", type: "date" },
      ],
    },
    {
      title: "Section 2: Electrical Specs",
      fields: [
        { label: "Size", defaultValue: product?.size ?? "", type: "text" },
        {
          label: "Amperage / Wattage / Voltage",
          defaultValue: "",
          type: "text",
        },
        { label: "Core Count", defaultValue: "", type: "number" },
      ],
    },
    {
      title: "Section 3: Stock & Rates",
      fields: [
        {
          label: "Quantity",
          defaultValue: product?.quantity?.toString() ?? "",
          type: "number",
        },
        { label: "Unit of Measurement", defaultValue: "", type: "text" },
        { label: "Selling Rate", defaultValue: "", type: "number" },
      ],
    },
  ];

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-12 sm:px-10 lg:px-16">
      <section className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
          Products
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-zinc-950">{title}</h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-600">
          {description}
        </p>

        <form className="mt-8 flex flex-col gap-8">
          {mode === "add"
            ? addSections.map((section) => (
                <section
                  key={section.title}
                  className="rounded-3xl border border-black/10 bg-stone-50 p-6"
                >
                  <h3 className="text-lg font-semibold text-zinc-950">
                    {section.title}
                  </h3>
                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    {section.fields.map((field) => (
                      <label
                        key={field.label}
                        className="flex flex-col gap-2 text-sm"
                      >
                        <span className="font-medium text-zinc-700">
                          {field.label}
                        </span>
                        <input
                          type={field.type}
                          defaultValue={field.defaultValue}
                          placeholder={field.type === "date" ? undefined : field.label}
                          className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-orange-400"
                        />
                      </label>
                    ))}
                  </div>
                </section>
              ))
            : (
                <div className="grid gap-5 md:grid-cols-2">
                  {editFields.map((field) => (
                    <label
                      key={field.label}
                      className="flex flex-col gap-2 text-sm"
                    >
                      <span className="font-medium text-zinc-700">
                        {field.label}
                      </span>
                      <input
                        defaultValue={field.defaultValue}
                        placeholder={field.label}
                        className="rounded-2xl border border-black/10 bg-stone-50 px-4 py-3 text-zinc-950 outline-none transition focus:border-orange-400"
                      />
                    </label>
                  ))}
                </div>
              )}
          <div className="md:col-span-2 flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              {mode === "add" ? "Save product" : "Update product"}
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
  );
}