import { ImageResponse } from "next/og";
import { demoOrders, demoProducts } from "@/lib/data/demo-data";
import { getSupabaseEnv, hasSupabaseEnv } from "@/lib/env";
import { getLabelDimensions, getLabelSize, OrderLabel } from "@/lib/labels";
import { estimateOrderPrice, formatEuroCents } from "@/lib/order-pricing";
import type { DetailedOrder, Product } from "@/lib/types";

export const runtime = "edge";

type RouteContext = {
  params: Promise<{
    date: string;
    id: string;
  }>;
};

async function fetchOrderById(orderId: string, pickupDate: string) {
  if (!hasSupabaseEnv()) {
    return demoOrders.find((order) => order.id === orderId && order.pickup_date === pickupDate) ?? null;
  }

  const { url, anonKey } = getSupabaseEnv();
  const query = new URL(`${url}/rest/v1/orders`);

  query.searchParams.set(
    "select",
    "id,pickup_date,customer_name,phone,email,notes,status,created_at,updated_at,order_items(id,order_id,product_id,product_name,quantity_grams)"
  );
  query.searchParams.set("id", `eq.${orderId}`);
  query.searchParams.set("pickup_date", `eq.${pickupDate}`);

  const response = await fetch(query, {
    headers: {
      apikey: anonKey,
      authorization: `Bearer ${anonKey}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    return null;
  }

  const orders = (await response.json()) as DetailedOrder[];
  return orders[0] ?? null;
}

async function fetchProducts() {
  if (!hasSupabaseEnv()) {
    return demoProducts;
  }

  const { url, anonKey } = getSupabaseEnv();
  const query = new URL(`${url}/rest/v1/products`);
  query.searchParams.set("select", "id,name,price,active,sort_order,created_at");
  query.searchParams.set("order", "sort_order.asc");

  const response = await fetch(query, {
    headers: {
      apikey: anonKey,
      authorization: `Bearer ${anonKey}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    return demoProducts;
  }

  return (await response.json()) as Product[];
}

export async function GET(request: Request, context: RouteContext) {
  const { searchParams } = new URL(request.url);
  const size = getLabelSize(searchParams.get("size") ?? undefined);
  const { date, id } = await context.params;
  const [order, products] = await Promise.all([fetchOrderById(id, date), fetchProducts()]);

  if (!order || order.pickup_date !== date) {
    return new Response("Order not found", { status: 404 });
  }

  const { width, height } = getLabelDimensions(size);
  const logoSrc = new URL("/brand-logo-transparent.png", request.url).toString();
  const priceEstimate = estimateOrderPrice(order, products);
  const totalPriceLabel = priceEstimate.hasEstimate
    ? formatEuroCents(priceEstimate.totalCents)
    : null;
  const totalPriceNote = priceEstimate.hasEstimate
    ? priceEstimate.isPartial
      ? "Arvio perustuu hinnoiteltuihin tuotteisiin. Lopullinen summa määräytyy toteutuneen palvelutiskipainon mukaan."
      : "Arvio perustuu tilattuihin määriin. Lopullinen summa määräytyy toteutuneen palvelutiskipainon mukaan ja voi poiketa hieman arviosta."
    : null;

  return new ImageResponse(
    <OrderLabel
      logoSrc={logoSrc}
      order={order}
      size={size}
      totalPriceLabel={totalPriceLabel}
      totalPriceNote={totalPriceNote}
    />,
    {
    width,
    height,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store"
    }
    }
  );
}
