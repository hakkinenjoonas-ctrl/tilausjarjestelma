import { hasSupabaseEnv } from "@/lib/env";
import { createReadOnlyClient } from "@/lib/supabase/read-only";
import { demoOrders, demoProducts } from "@/lib/data/demo-data";
import type {
  DetailedOrder,
  OrderDaySummary,
  OrderItem,
  Product,
  ProductTotal,
  ReportEmailContact,
  ProductionDaySummary
} from "@/lib/types";

function sortOrders(orders: DetailedOrder[]) {
  return [...orders].sort((a, b) => a.pickup_date.localeCompare(b.pickup_date));
}

function aggregateProductTotals(orders: DetailedOrder[]) {
  const totals = new Map<string, number>();

  orders.forEach((order) => {
    order.order_items.forEach((item) => {
      totals.set(item.product_name, (totals.get(item.product_name) ?? 0) + item.quantity_grams);
    });
  });

  return [...totals.entries()]
    .map(([product_name, total_grams]) => ({ product_name, total_grams }))
    .sort((a, b) => b.total_grams - a.total_grams);
}

function aggregateDaySummaries(orders: DetailedOrder[]): OrderDaySummary[] {
  const map = new Map<string, OrderDaySummary>();

  orders.forEach((order) => {
    const existing = map.get(order.pickup_date) ?? {
      pickup_date: order.pickup_date,
      order_count: 0,
      total_grams: 0
    };

    existing.order_count += 1;
    existing.total_grams += order.order_items.reduce(
      (sum, item) => sum + item.quantity_grams,
      0
    );

    map.set(order.pickup_date, existing);
  });

  return [...map.values()].sort((a, b) => a.pickup_date.localeCompare(b.pickup_date));
}

function aggregateProductionSummary(orders: DetailedOrder[]): ProductionDaySummary[] {
  const map = new Map<string, DetailedOrder[]>();

  orders.forEach((order) => {
    const current = map.get(order.pickup_date) ?? [];
    current.push(order);
    map.set(order.pickup_date, current);
  });

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([pickup_date, groupedOrders]) => ({
      pickup_date,
      products: aggregateProductTotals(groupedOrders)
    }));
}

function aggregateEmailContacts(orders: DetailedOrder[]): ReportEmailContact[] {
  const contacts = new Map<string, ReportEmailContact>();

  orders.forEach((order) => {
    if (!order.email) {
      return;
    }

    const normalizedEmail = order.email.trim().toLowerCase();

    if (!normalizedEmail) {
      return;
    }

    const existing = contacts.get(normalizedEmail);

    if (!existing) {
      contacts.set(normalizedEmail, {
        email: normalizedEmail,
        customer_name: order.customer_name,
        latest_pickup_date: order.pickup_date,
        order_count: 1
      });
      return;
    }

    contacts.set(normalizedEmail, {
      email: normalizedEmail,
      customer_name: existing.customer_name,
      latest_pickup_date:
        order.pickup_date > existing.latest_pickup_date
          ? order.pickup_date
          : existing.latest_pickup_date,
      order_count: existing.order_count + 1
    });
  });

  return [...contacts.values()].sort((a, b) => a.email.localeCompare(b.email, "fi"));
}

async function getOrdersWithItems(): Promise<DetailedOrder[]> {
  if (!hasSupabaseEnv()) {
    return sortOrders(demoOrders);
  }

  const supabase = createReadOnlyClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, pickup_date, customer_name, phone, email, notes, status, created_at, updated_at, order_items(id, order_id, product_id, product_name, quantity_grams)"
    )
    .order("pickup_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch orders", error);
    return sortOrders(demoOrders);
  }

  return (data ?? []) as DetailedOrder[];
}

export async function getProducts(): Promise<Product[]> {
  if (!hasSupabaseEnv()) {
    return demoProducts;
  }

  const supabase = createReadOnlyClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, active, sort_order, created_at")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to fetch products", error);
    return demoProducts;
  }

  return (data ?? []) as Product[];
}

export async function getOrderDaySummaries() {
  const orders = await getOrdersWithItems();
  return aggregateDaySummaries(orders);
}

export async function getOrdersByPickupDate(pickupDate: string) {
  const orders = await getOrdersWithItems();
  return orders.filter((order) => order.pickup_date === pickupDate);
}

export async function getOrderById(orderId: string) {
  const orders = await getOrdersWithItems();
  return orders.find((order) => order.id === orderId) ?? null;
}

export async function getProductionSummaryByDay() {
  const orders = await getOrdersWithItems();
  return aggregateProductionSummary(orders);
}

export async function getProductionReport(from?: string, to?: string) {
  const orders = await getOrdersWithItems();

  const filtered = orders.filter((order) => {
    if (from && order.pickup_date < from) {
      return false;
    }

    if (to && order.pickup_date > to) {
      return false;
    }

    return true;
  });

  return {
    label: {
      from: from ?? null,
      to: to ?? null
    },
    rows: aggregateProductTotals(filtered),
    email_contacts: aggregateEmailContacts(filtered)
  };
}

export async function getProductMap() {
  const products = await getProducts();
  return new Map(products.map((product) => [product.id, product]));
}

export function mapItemsWithProductNames(
  items: { productId: string; quantityGrams: number }[],
  productMap: Map<string, Product>
): Omit<OrderItem, "id" | "order_id">[] {
  return items
    .map((item) => {
      const product = productMap.get(item.productId);

      if (!product) {
        return null;
      }

      return {
        product_id: product.id,
        product_name: product.name,
        quantity_grams: item.quantityGrams
      };
    })
    .filter((item): item is Omit<OrderItem, "id" | "order_id"> => item !== null);
}
