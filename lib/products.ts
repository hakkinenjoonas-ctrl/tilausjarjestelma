import type { Product } from "@/lib/types";

export const productGroupOrder = [
  "Savukalat",
  "Graavit",
  "Pihvit",
  "Tuorekala",
  "Tuorekala fileet",
  "Muut"
] as const;

export type ProductGroupName = (typeof productGroupOrder)[number];

function resolveProductGroup(name: string): ProductGroupName {
  const normalized = name.trim().toLowerCase();

  if (
    normalized.includes("savu") ||
    normalized.includes("kylmäsavu") ||
    normalized.includes("savusilakka")
  ) {
    return "Savukalat";
  }

  if (normalized.includes("graavi") || normalized.includes("ceviche")) {
    return "Graavit";
  }

  if (normalized.includes("pihvi")) {
    return "Pihvit";
  }

  if (normalized.includes("filee")) {
    return "Tuorekala fileet";
  }

  if (
    normalized.includes("kokonainen") ||
    normalized.includes("muikku") ||
    normalized.includes("silakka") ||
    normalized.includes("säilyke")
  ) {
    return "Tuorekala";
  }

  return "Muut";
}

export function groupProducts(products: Product[]) {
  const grouped = new Map<ProductGroupName, Product[]>();

  for (const groupName of productGroupOrder) {
    grouped.set(groupName, []);
  }

  for (const product of products) {
    const groupName = resolveProductGroup(product.name);
    grouped.get(groupName)?.push(product);
  }

  return productGroupOrder
    .map((groupName) => ({
      groupName,
      products: grouped.get(groupName) ?? []
    }))
    .filter((group) => group.products.length > 0);
}
