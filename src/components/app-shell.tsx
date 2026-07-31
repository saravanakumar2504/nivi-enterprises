import Link from "next/link";

type AppShellProps = {
  children: React.ReactNode;
};

const navigation = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/products", label: "Products" },
  { href: "/products/add", label: "Add Product" },
  { href: "/billing", label: "Billing" },
  { href: "/billing/create", label: "Create Bill" },
];

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.14),_transparent_28%),linear-gradient(180deg,_#fff7ed_0%,_#f5f5f4_45%,_#fafaf9_100%)]">
      <header className="border-b border-black/5 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-6 py-6 sm:px-10 lg:px-16">
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-600">
                Nivi Enterprises
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
                Shop orders, inventory, and billing
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
                Keep the app simple first. Build one route at a time without a
                complex dashboard.
              </p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-3">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-orange-300 hover:text-orange-700"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <div className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-10 lg:px-16">
        {children}
      </div>
    </div>
  );
}