import Link from "next/link";

const routes = [
  {
    href: "/products",
    title: "Products",
    summary: "Inventory list with product name, brand, size, quantity, and rate.",
  },
  {
    href: "/products/add",
    title: "Add Product",
    summary: "Simple form to create a new inventory item for the shop.",
  },
  {
    href: "/products/1/edit",
    title: "Edit Product",
    summary: "Update stock quantity, rate, or size when product details change.",
  },
  {
    href: "/billing/create",
    title: "Create Bill",
    summary: "Select items, enter quantity, calculate subtotal, and save the sale.",
  },
  {
    href: "/billing",
    title: "Billing History",
    summary: "Review saved invoices with totals and sales dates.",
  },
];

export function DashboardOverview() {
  return (
    <main className="flex flex-col gap-8">
      <section className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
          Project Flow
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-zinc-950">
          Build the app route by route.
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-600">
          This page is intentionally simple. Instead of showing dashboard cards,
          it gives you the main screens to build for a shop order and billing
          app.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm transition hover:border-orange-300 hover:bg-orange-50"
          >
            <p className="text-sm font-medium text-orange-600">{route.href}</p>
            <h3 className="mt-3 text-xl font-semibold text-zinc-950">
              {route.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              {route.summary}
            </p>
          </Link>
        ))}
      </section>

      <section className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
          Suggested Order
        </p>
        <ol className="mt-4 space-y-3 text-base leading-7 text-zinc-700">
          <li>1. Build the products list page first.</li>
          <li>2. Add the add-product form next.</li>
          <li>3. Then support editing a product by id.</li>
          <li>4. After inventory works, build billing create.</li>
          <li>5. Finish with billing history.</li>
        </ol>
      </section>
    </main>
  );
}