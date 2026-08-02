export type Product = {
  id: string;
  name: string;
  brand: string;
  modelNumber?: string;
  category: string;
  size: string;
  unit: string;
  rate: number;
  quantity: number;
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