import type { DetailedOrder, Product } from "@/lib/types";

type OrderPriceEstimate = {
  hasEstimate: boolean;
  isPartial: boolean;
  pricedItemCount: number;
  totalItemCount: number;
  totalCents: number;
};

function parsePriceToCentsPerKilogram(price: string | null) {
  if (!price) {
    return null;
  }

  const normalized = price.trim().toLowerCase();

  if (!normalized.includes("/kg")) {
    return null;
  }

  const amountMatch = normalized.match(/(\d+[.,]\d{1,2}|\d+)/);

  if (!amountMatch) {
    return null;
  }

  const amount = Number(amountMatch[1].replace(",", "."));

  if (!Number.isFinite(amount)) {
    return null;
  }

  return Math.round(amount * 100);
}

export function estimateOrderPrice(order: DetailedOrder, products: Product[]): OrderPriceEstimate {
  const productPriceMap = new Map(products.map((product) => [product.name, product.price]));

  let totalCents = 0;
  let pricedItemCount = 0;

  for (const item of order.order_items) {
    const centsPerKilogram = parsePriceToCentsPerKilogram(productPriceMap.get(item.product_name) ?? null);

    if (centsPerKilogram === null) {
      continue;
    }

    totalCents += Math.round((centsPerKilogram * item.quantity_grams) / 1000);
    pricedItemCount += 1;
  }

  return {
    hasEstimate: pricedItemCount > 0,
    isPartial: pricedItemCount < order.order_items.length,
    pricedItemCount,
    totalItemCount: order.order_items.length,
    totalCents
  };
}

export function formatEuroCents(cents: number) {
  return `${(cents / 100).toLocaleString("fi-FI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })} €`;
}
