"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/types";
import { getProductMap, mapItemsWithProductNames } from "@/lib/data/orders";

type ActionState = {
  success: boolean;
  message: string;
};

type SelectedItem = {
  productId: string;
  quantityGrams: number;
};

const validStatuses: OrderStatus[] = ["uusi", "kasittelyssa", "valmis", "noudettu"];

function normalizePhone(phone: string) {
  return phone.replace(/\s+/g, " ").trim();
}

function parseItems(rawValue: FormDataEntryValue | null): SelectedItem[] {
  if (typeof rawValue !== "string" || rawValue.length === 0) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue) as {
      productId: string;
      quantityGrams: number;
    }[];

    return parsed.filter(
      (item) =>
        typeof item.productId === "string" &&
        Number.isInteger(item.quantityGrams) &&
        item.quantityGrams > 0
    );
  } catch {
    return [];
  }
}

function getTodayDateString() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Helsinki"
  }).format(new Date());
}

async function validateOrder(
  formData: FormData,
  options?: {
    activeProductsOnly?: boolean;
  }
) {
  const pickupDate = String(formData.get("pickupDate") ?? "").trim();
  const customerName = String(formData.get("customerName") ?? "").trim();
  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const notes = String(formData.get("notes") ?? "").trim();
  const items = parseItems(formData.get("itemsJson"));

  if (!pickupDate) {
    return { ok: false as const, message: "Valitse noutopäivä." };
  }

  if (pickupDate < getTodayDateString()) {
    return { ok: false as const, message: "Noutopäivä ei voi olla menneisyydessä." };
  }

  if (!customerName) {
    return { ok: false as const, message: "Asiakkaan nimi puuttuu." };
  }

  if (!phone) {
    return { ok: false as const, message: "Puhelinnumero puuttuu." };
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false as const, message: "Sähköpostiosoite ei ole oikeassa muodossa." };
  }

  if (items.length === 0) {
    return { ok: false as const, message: "Valitse vähintään yksi tuote." };
  }

  const productMap = await getProductMap({
    activeOnly: options?.activeProductsOnly ?? false
  });
  const mappedItems = mapItemsWithProductNames(items, productMap);

  if (mappedItems.length === 0) {
    return { ok: false as const, message: "Tuotteita ei voitu tunnistaa." };
  }

  return {
    ok: true as const,
    values: {
      pickupDate,
      customerName,
      phone,
      email,
      notes,
      items: mappedItems
    }
  };
}

function revalidateOrderViews(pickupDate?: string) {
  revalidatePath("/tilaukset");
  revalidatePath("/uusi-tilaus");
  revalidatePath("/varaa");
  revalidatePath("/varaa/kiitos");
  revalidatePath("/raportit");
  revalidatePath("/tiivistelma");
  revalidatePath("/asetukset");

  if (pickupDate) {
    revalidatePath(`/tilaukset/${pickupDate}`);
  }
}

export async function createOrderAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const validation = await validateOrder(formData);

  if (!validation.ok) {
    return { success: false, message: validation.message };
  }

  if (!hasSupabaseEnv()) {
    return {
      success: true,
      message: "Demo-tilassa tallennusta ei kirjoiteta tietokantaan. Kytke Supabase käyttöön."
    };
  }

  const supabase = await createClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      pickup_date: validation.values.pickupDate,
      customer_name: validation.values.customerName,
      phone: validation.values.phone,
      email: validation.values.email || null,
      notes: validation.values.notes || null,
      status: "uusi"
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return { success: false, message: "Tilauksen tallennus epäonnistui." };
  }

  const { error: itemError } = await supabase.from("order_items").insert(
    validation.values.items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity_grams: item.quantity_grams
    }))
  );

  if (itemError) {
    return { success: false, message: "Tuotteiden tallennus epäonnistui." };
  }

  revalidateOrderViews(validation.values.pickupDate);
  redirect(`/tilaukset/${validation.values.pickupDate}`);
}

export async function createPublicBookingAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const honeypot = String(formData.get("website") ?? "").trim();
  const startedAtRaw = String(formData.get("startedAt") ?? "").trim();
  const startedAt = Number(startedAtRaw);
  const now = Date.now();

  if (honeypot) {
    return { success: true, message: "Varauksesi on nyt lähetetty." };
  }

  if (!Number.isFinite(startedAt) || now - startedAt < 1500) {
    return {
      success: false,
      message: "Lomakkeen lähetys epäonnistui. Odota hetki ja yritä uudelleen."
    };
  }

  const validation = await validateOrder(formData, { activeProductsOnly: true });

  if (!validation.ok) {
    return { success: false, message: validation.message };
  }

  if (!hasSupabaseEnv()) {
    revalidateOrderViews(validation.values.pickupDate);
    return {
      success: true,
      message: "Varauksesi on nyt lähetetty."
    };
  }

  const supabase = await createClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      pickup_date: validation.values.pickupDate,
      customer_name: validation.values.customerName,
      phone: validation.values.phone,
      email: validation.values.email || null,
      notes: validation.values.notes || null,
      status: "uusi"
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return { success: false, message: "Varauksen tallennus epäonnistui. Yritä hetken kuluttua uudelleen." };
  }

  const { error: itemError } = await supabase.from("order_items").insert(
    validation.values.items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity_grams: item.quantity_grams
    }))
  );

  if (itemError) {
    return { success: false, message: "Varauksen tuotteita ei voitu tallentaa." };
  }

  revalidateOrderViews(validation.values.pickupDate);
  return {
    success: true,
    message: "Varauksesi on nyt lähetetty."
  };
}

export async function updateOrderAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const orderId = String(formData.get("orderId") ?? "").trim();
  const validation = await validateOrder(formData);

  if (!orderId) {
    return { success: false, message: "Tilauksen tunniste puuttuu." };
  }

  if (!validation.ok) {
    return { success: false, message: validation.message };
  }

  if (!hasSupabaseEnv()) {
    return {
      success: true,
      message: "Demo-tilassa muutoksia ei kirjoiteta tietokantaan. Kytke Supabase käyttöön."
    };
  }

  const supabase = await createClient();
  const { error: orderError } = await supabase
    .from("orders")
    .update({
      pickup_date: validation.values.pickupDate,
      customer_name: validation.values.customerName,
      phone: validation.values.phone,
      email: validation.values.email || null,
      notes: validation.values.notes || null
    })
    .eq("id", orderId);

  if (orderError) {
    return { success: false, message: "Tilauksen päivitys epäonnistui." };
  }

  const { error: deleteError } = await supabase
    .from("order_items")
    .delete()
    .eq("order_id", orderId);

  if (deleteError) {
    return { success: false, message: "Vanhoja tuotteita ei voitu poistaa." };
  }

  const { error: itemError } = await supabase.from("order_items").insert(
    validation.values.items.map((item) => ({
      order_id: orderId,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity_grams: item.quantity_grams
    }))
  );

  if (itemError) {
    return { success: false, message: "Uusien tuotteiden tallennus epäonnistui." };
  }

  revalidateOrderViews(validation.values.pickupDate);
  redirect(`/tilaukset/${validation.values.pickupDate}`);
}

export async function updateOrderStatusAction(formData: FormData) {
  const orderId = String(formData.get("orderId") ?? "").trim();
  const pickupDate = String(formData.get("pickupDate") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim() as OrderStatus;

  if (!orderId || !pickupDate || !validStatuses.includes(status)) {
    return;
  }

  if (!hasSupabaseEnv()) {
    revalidateOrderViews(pickupDate);
    return;
  }

  const supabase = await createClient();
  await supabase.from("orders").update({ status }).eq("id", orderId);

  revalidateOrderViews(pickupDate);
}

export async function deleteOrderAction(formData: FormData) {
  const orderId = String(formData.get("orderId") ?? "").trim();
  const pickupDate = String(formData.get("pickupDate") ?? "").trim();

  if (!orderId || !pickupDate) {
    return;
  }

  if (!hasSupabaseEnv()) {
    revalidateOrderViews(pickupDate);
    return;
  }

  const supabase = await createClient();
  await supabase.from("orders").delete().eq("id", orderId);

  revalidateOrderViews(pickupDate);
}

export async function addProductAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const price = String(formData.get("price") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder") ?? 0);

  if (!name) {
    return;
  }

  if (!hasSupabaseEnv()) {
    revalidateOrderViews();
    return;
  }

  const supabase = await createClient();
  await supabase.from("products").insert({
    name,
    price: price || null,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    active: true
  });

  revalidateOrderViews();
}

export async function updateProductAction(formData: FormData) {
  const productId = String(formData.get("productId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const price = String(formData.get("price") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder") ?? 0);

  if (!productId || !name) {
    return;
  }

  if (!hasSupabaseEnv()) {
    revalidateOrderViews();
    return;
  }

  const supabase = await createClient();
  await supabase.from("products").update({
    name,
    price: price || null,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0
  }).eq("id", productId);

  revalidateOrderViews();
}

export async function toggleProductActiveAction(formData: FormData) {
  const productId = String(formData.get("productId") ?? "").trim();
  const active = String(formData.get("active") ?? "") === "true";

  if (!productId) {
    return;
  }

  if (!hasSupabaseEnv()) {
    revalidateOrderViews();
    return;
  }

  const supabase = await createClient();
  await supabase.from("products").update({ active: !active }).eq("id", productId);

  revalidateOrderViews();
}

export async function upsertDailyFeaturedProductAction(formData: FormData) {
  const productName = String(formData.get("productName") ?? "").trim();
  const price = String(formData.get("price") ?? "").trim();
  const fishingArea = String(formData.get("fishingArea") ?? "").trim();
  const visibleFrom = getTodayDateString();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const visibleTo = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Helsinki"
  }).format(tomorrow);

  if (!productName || !price || !fishingArea) {
    return;
  }

  if (!hasSupabaseEnv()) {
    revalidateOrderViews();
    return;
  }

  const supabase = await createClient();
  await supabase.from("daily_featured_product").upsert(
    {
      id: "default",
      product_name: productName,
      price,
      fishing_area: fishingArea,
      visible_from: visibleFrom,
      visible_to: visibleTo
    },
    { onConflict: "id" }
  );

  revalidateOrderViews();
}

export async function removeDailyFeaturedProductAction() {
  if (!hasSupabaseEnv()) {
    revalidateOrderViews();
    return;
  }

  const supabase = await createClient();
  await supabase.from("daily_featured_product").delete().eq("id", "default");
  revalidateOrderViews();
}
