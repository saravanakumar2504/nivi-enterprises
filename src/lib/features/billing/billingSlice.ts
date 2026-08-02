import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { completeSale } from "@/lib/features/shop/shopActions";
import type { Invoice } from "@/lib/types";

type BillingState = {
  invoices: Invoice[];
};

const initialState: BillingState = {
  invoices: [],
};

const billingSlice = createSlice({
  name: "billing",
  initialState,
  reducers: {
    addInvoice: (state, action: PayloadAction<Invoice>) => {
      state.invoices.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(completeSale, (state, action) => {
      const total = action.payload.items.reduce(
        (sum, item) => sum + item.quantity * item.rate,
        0,
      );

      state.invoices.unshift({
        id: action.payload.invoiceId,
        createdAt: action.payload.createdAt,
        customerName: action.payload.customerName,
        items: action.payload.items,
        total,
      });
    });
  },
});

export const { addInvoice } = billingSlice.actions;

export default billingSlice.reducer;