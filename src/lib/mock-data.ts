import type { Invoice, Product } from "@/lib/types";

export const initialProducts: Product[] = [
  {
    id: "prd-101",
    name: "House Wire",
    brand: "Finolex",
    size: "1.5 sqmm",
    category: "Cable",
    quantity: 96,
    rate: 1280,
    reorderLevel: 25,
  },
  {
    id: "prd-102",
    name: "Modular Switch",
    brand: "Anchor",
    size: "6A",
    category: "Switch",
    quantity: 42,
    rate: 95,
    reorderLevel: 15,
  },
  {
    id: "prd-103",
    name: "LED Bulb",
    brand: "Philips",
    size: "12W",
    category: "Lighting",
    quantity: 18,
    rate: 140,
    reorderLevel: 20,
  },
  {
    id: "prd-104",
    name: "MCB",
    brand: "Havells",
    size: "16A SP",
    category: "Protection",
    quantity: 31,
    rate: 220,
    reorderLevel: 10,
  },
  {
    id: "prd-105",
    name: "PVC Tape",
    brand: "SteelGrip",
    size: "18 mm",
    category: "Accessory",
    quantity: 120,
    rate: 18,
    reorderLevel: 40,
  },
];

export const initialInvoices: Invoice[] = [
  {
    id: "inv-5001",
    createdAt: "2026-07-31T09:15:00.000Z",
    customerName: "Arun Electricals",
    items: [
      {
        productId: "prd-101",
        productName: "House Wire",
        quantity: 2,
        rate: 1280,
      },
      {
        productId: "prd-102",
        productName: "Modular Switch",
        quantity: 10,
        rate: 95,
      },
    ],
    total: 3510,
  },
  {
    id: "inv-5002",
    createdAt: "2026-07-30T14:30:00.000Z",
    customerName: "Walk-in Customer",
    items: [
      {
        productId: "prd-103",
        productName: "LED Bulb",
        quantity: 6,
        rate: 140,
      },
    ],
    total: 840,
  },
];