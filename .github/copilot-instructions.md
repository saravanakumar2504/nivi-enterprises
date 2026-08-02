# Copilot Instructions — Nivi Enterprises

## Project Overview

A Next.js App Router application for shop inventory and billing.
Stack: Next.js 16 · React 19 · TypeScript 5 (strict) · Redux Toolkit 2 · Tailwind CSS 4 · npm.

---

## General Principles

- Keep changes minimal and focused. Don't refactor, reformat, or add features beyond what was asked.
- Prefer simple, readable code over clever or highly abstracted solutions.
- Every new piece of code must be typed — no `any`, no implicit `any`, no type assertions unless unavoidable.
- Never suppress TypeScript errors with `@ts-ignore` or `@ts-expect-error` without a comment explaining why.

---

## TypeScript

- Use `strict: true` rules at all times (already enabled in `tsconfig.json`).
- Prefer `type` over `interface` for object shapes — consistent with existing code.
- Export types from `src/lib/types.ts`; add new domain types there.
- Use `type` imports: `import type { Foo } from "@/lib/types"`.
- Never use `React.FC` — prefer plain function declarations with explicit prop types.

```ts
// good
type CardProps = { title: string; count: number };
export function Card({ title, count }: CardProps) { ... }

// avoid
const Card: React.FC<CardProps> = ({ title, count }) => { ... };
```

---

## Next.js App Router

- All route files live under `src/app/` and export a **default** function.
- Prefer React Server Components (RSC). Only add `"use client"` when the component needs browser APIs, event handlers, or React state/effects.
- Reusable UI components live in `src/components/` and use **named exports**.
- Use `next/link` for all internal navigation — never `<a href>`.
- Use `next/font` for fonts (already configured in `layout.tsx`).
- Use `next/image` for all `<img>` tags.
- Keep `layout.tsx` and `page.tsx` thin — move logic to components under `src/components/`.
- Path alias `@/*` maps to `src/*`; always use it instead of relative `../../` paths.

### Route naming

| Route                    | File                              |
| ------------------------ | --------------------------------- |
| `/products`              | `src/app/products/page.tsx`       |
| `/products/[id]/edit`    | `src/app/products/[id]/edit/page.tsx` |
| `/billing/create`        | `src/app/billing/create/page.tsx` |

---

## React Components

- One component per file. File name matches the exported component in kebab-case: `product-form.tsx` → `export function ProductForm`.
- Co-locate the props type at the top of the file, just above the component.
- Avoid `useEffect` for derived state — compute it inline or use a selector.
- Avoid prop drilling beyond two levels — use Redux state instead.
- Mark a component `"use client"` only at the top of the file, before imports.

---

## Redux Toolkit

### File layout

```
src/lib/
  store.ts                        # configureStore, RootState, AppDispatch
  hooks.ts                        # useAppDispatch, useAppSelector, useAppStore
  types.ts                        # shared domain types
  features/
    <domain>/
      <domain>Slice.ts            # createSlice (reducer + actions)
  selectors/
    <domain>.ts                   # plain selector functions
```

### Slices

- One slice per domain feature (`productsSlice.ts`, `billingSlice.ts`).
- Define a local `<Domain>State` type inside the slice file.
- Expose actions via named exports; export the reducer as `default`.

```ts
export const { addProduct, updateProduct } = productsSlice.actions;
export default productsSlice.reducer;
```

- For mutations that must update **multiple slices**, use a shared action created with `createAction` in `src/lib/features/shop/shopActions.ts` and handle it via `extraReducers` in each affected slice.

### Selectors

- Keep all selectors in `src/lib/selectors/`. Never inline `state.products.items` directly in components.
- Name selectors with the `select` prefix: `selectProducts`, `selectLowStockProducts`.

### Typed hooks

Always use the typed wrappers from `src/lib/hooks.ts`:

```ts
// good
const dispatch = useAppDispatch();
const products = useAppSelector(selectProducts);

// avoid
const dispatch = useDispatch();
const products = useSelector((state: RootState) => state.products.items);
```

---

## Styling — Tailwind CSS 4

- Use Tailwind utility classes directly in JSX; no CSS modules or inline styles.
- Tailwind config is PostCSS-based (`postcss.config.mjs`) — no `tailwind.config.js`.
- Follow the existing colour palette: `orange-*` for brand accents, `zinc-*` for text, `stone-*` for backgrounds.
- Prefer responsive prefixes (`sm:`, `lg:`) over custom breakpoints.
- Keep class lists readable — use multi-line JSX props or `clsx`/`cn` when a list grows long.
- Do not add Tailwind `@apply` in CSS files unless sharing a utility across many components.

---

## Imports

- Group and order imports: **framework → third-party → internal** (`@/lib`, `@/components`), separated by blank lines.
- Always use the `@/` alias for internal imports.
- Prefer named imports. Avoid wildcard (`* as`) imports.

```ts
import { useCallback } from "react";

import { createSlice } from "@reduxjs/toolkit";

import { useAppSelector } from "@/lib/hooks";
import type { Product } from "@/lib/types";
import { selectProducts } from "@/lib/selectors/dashboard";
```

---

## Naming Conventions

| Concept               | Convention               | Example                        |
| --------------------- | ------------------------ | ------------------------------ |
| Component files       | kebab-case               | `product-form.tsx`             |
| Component names       | PascalCase               | `ProductForm`                  |
| Hooks                 | camelCase, `use` prefix  | `useAppSelector`               |
| Slice files           | camelCase + `Slice`      | `productsSlice.ts`             |
| Selector functions    | camelCase, `select` prefix | `selectLowStockProducts`     |
| Shared actions        | camelCase                | `completeSale`                 |
| Route pages           | `page.tsx` (default export) | `export default function ProductsPage` |
| Type names            | PascalCase               | `Product`, `InvoiceLine`       |

---

## What to Avoid

- `any` types — find the correct type or create one in `src/lib/types.ts`.
- Default exports from component files (only route `page.tsx` and `layout.tsx` use default exports).
- Direct `useSelector`/`useDispatch` — always use the typed wrappers.
- Inline Redux selectors in components (e.g., `state => state.products.items`).
- `console.log` left in committed code.
- Hard-coded magic strings or numbers — extract to a named constant.
- Unnecessary `useEffect` — prefer derived values and event-driven state updates.
