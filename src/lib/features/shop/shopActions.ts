import { createAction } from "@reduxjs/toolkit";

import type { InvoiceLine } from "@/lib/types";

export type CompleteSalePayload = {
  invoiceId: string;
  createdAt: string;
  customerName: string;
  items: InvoiceLine[];
};

export const completeSale = createAction<CompleteSalePayload>(
  "shop/completeSale",
);