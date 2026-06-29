export type OrderStatus = "uusi" | "kasittelyssa" | "valmis" | "noudettu";

export type Product = {
  id: string;
  name: string;
  active: boolean;
  sort_order: number;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity_grams: number;
};

export type Order = {
  id: string;
  pickup_date: string;
  customer_name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
};

export type DetailedOrder = Order & {
  order_items: OrderItem[];
};

export type OrderDaySummary = {
  pickup_date: string;
  order_count: number;
  total_grams: number;
};

export type ProductTotal = {
  product_name: string;
  total_grams: number;
};

export type ReportEmailContact = {
  email: string;
  customer_name: string;
  latest_pickup_date: string;
  order_count: number;
};

export type ProductionDaySummary = {
  pickup_date: string;
  products: ProductTotal[];
};
