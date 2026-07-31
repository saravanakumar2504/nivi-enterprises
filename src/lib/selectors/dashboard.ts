import type { RootState } from "@/lib/store";

export const selectProducts = (state: RootState) => state.products.items;
export const selectInvoices = (state: RootState) => state.billing.invoices;

export const selectTotalProducts = (state: RootState) =>
  state.products.items.length;

export const selectLowStockProducts = (state: RootState) =>
  state.products.items.filter(
    (product) => product.quantity <= product.reorderLevel,
  );

export const selectInventoryValue = (state: RootState) =>
  state.products.items.reduce(
    (sum, product) => sum + product.quantity * product.rate,
    0,
  );

export const selectTotalSales = (state: RootState) =>
  state.billing.invoices.reduce((sum, invoice) => sum + invoice.total, 0);

export const selectRecentInvoices = (state: RootState) =>
  state.billing.invoices.slice(0, 5);