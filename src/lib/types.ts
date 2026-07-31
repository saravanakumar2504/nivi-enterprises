export type Product = {
  id: string;
  name: string;
  brand: string;
  size: string;
  category: string;
  quantity: number;
  rate: number;
  reorderLevel: number;
};

export type InvoiceLine = {
  productId: string;
  productName: string;
  quantity: number;
  rate: number;
};

export type Invoice = {
  id: string;
  createdAt: string;
  customerName: string;
  items: InvoiceLine[];
  total: number;
};