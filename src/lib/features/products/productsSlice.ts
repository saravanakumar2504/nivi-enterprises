import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { initialProducts } from "@/lib/mock-data";
import { completeSale } from "@/lib/features/shop/shopActions";
import type { Product } from "@/lib/types";

type ProductsState = {
  items: Product[];
};

const initialState: ProductsState = {
  items: initialProducts,
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    addProduct: (state, action: PayloadAction<Product>) => {
      state.items.push(action.payload);
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      state.items = state.items.map((product) =>
        product.id === action.payload.id ? action.payload : product,
      );
    },
    updateProductStock: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>,
    ) => {
      const product = state.items.find(
        (item) => item.id === action.payload.productId,
      );

      if (product) {
        product.quantity = action.payload.quantity;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(completeSale, (state, action) => {
      action.payload.items.forEach((lineItem) => {
        const product = state.items.find(
          (item) => item.id === lineItem.productId,
        );

        if (product) {
          product.quantity = Math.max(product.quantity - lineItem.quantity, 0);
        }
      });
    });
  },
});

export const { addProduct, updateProduct, updateProductStock } =
  productsSlice.actions;

export default productsSlice.reducer;