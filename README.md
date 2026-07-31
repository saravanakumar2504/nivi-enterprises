# Nivi Enterprises

Shop order, inventory, and billing application scaffolded with Next.js, React, TypeScript, and Redux Toolkit.

## Getting Started

Run the development server:

```bash
npm run dev
```

Open http://localhost:3000 in the browser.

## Possible Routes

### `/` or `/dashboard`

**Definition:** Dashboard or main page.

**What it does:** Shows quick-glance business metrics such as total products, low-stock items, inventory value, and recent billing activity.

### `/products`

**Definition:** Inventory directory.

**What it does:** Displays a searchable, filterable list of products so the shop can quickly check available stock, rates, quantities, sizes, and item types.

### `/products/add`

**Definition:** Add product page.

**What it does:** Contains the product entry form for fields such as product name, brand, size, quantity, category, and rate. Saving should return the user to the products list.

### `/products/[id]/edit`

**Definition:** Edit product page.

**What it does:** Updates an existing product record. This is where stock quantity, rate, size, or other item details can be changed when inventory is replenished or prices change.

### `/billing`

**Definition:** Sales registry.

**What it does:** Lists previously created bills or invoices with totals, dates, and customer details so the shop can review sales history.

### `/billing/create`

**Definition:** Create bill or checkout page.

**What it does:** Works as the billing counter. The user selects products, enters quantities, calculates line subtotals and grand total, then saves the bill.

**Expected behavior:** Saving a bill should also reduce the corresponding product quantities in inventory and add a new record to the billing registry.
