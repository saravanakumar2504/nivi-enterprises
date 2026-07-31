import { configureStore } from "@reduxjs/toolkit";

import billingReducer from "@/lib/features/billing/billingSlice";
import productsReducer from "@/lib/features/products/productsSlice";

export const store = configureStore({
  reducer: {
    products: productsReducer,
    billing: billingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;