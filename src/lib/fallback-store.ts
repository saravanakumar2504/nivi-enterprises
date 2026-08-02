import { initialInvoices, initialProducts } from "@/lib/mock-data";
import type { Invoice, Product } from "@/lib/types";

let fallbackProducts: Product[] = initialProducts.map((product) => ({ ...product }));
const fallbackInvoices: Invoice[] = initialInvoices.map((invoice) => ({
  ...invoice,
  items: invoice.items.map((item) => ({ ...item })),
}));

export function getFallbackProducts() {
  return fallbackProducts.map((product) => ({ ...product }));
}

export function getFallbackProductById(id: string) {
  const product = fallbackProducts.find((item) => item.id === id);
  return product ? { ...product } : null;
}

export function addFallbackProduct(product: Product) {
  fallbackProducts = [...fallbackProducts, { ...product }];
  return product;
}

export function updateFallbackProduct(id: string, patch: Partial<Omit<Product, "id">>) {
  const current = fallbackProducts.find((product) => product.id === id);
  if (!current) return null;

  const updated: Product = {
    ...current,
    ...patch,
  };

  fallbackProducts = fallbackProducts.map((product) =>
    product.id === id ? updated : product,
  );

  return { ...updated };
}

export function deleteFallbackProduct(id: string) {
  const before = fallbackProducts.length;
  fallbackProducts = fallbackProducts.filter((product) => product.id !== id);
  return fallbackProducts.length !== before;
}

export function getFallbackInvoices() {
  return fallbackInvoices.map((invoice) => ({
    ...invoice,
    items: invoice.items.map((item) => ({ ...item })),
  }));
}