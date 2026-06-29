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

async function validateOrder(formData: FormData) {
  const pickupDate = String(formData.get("pickupDate") ?? "").trim();
  const customerName = String(formData.get("customerName") ?? "").trim();
  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const notes = String(formData.get("notes") ?? "").trim();
  const items = parseItems(formData.get("itemsJson"));

  if (!pickupDate) {
    return { ok: false as const, message: "Valitse noutopaiva." };
  }

  if (!customerName) {
    return { ok: false as const, message: "Asiakkaan nimi puuttuu." };
  }

  if (!phone) {
    return { ok: false as const, message: "Puhelinnumero puuttuu." };
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false as const, message: "Sahkopostiosoite ei ole oikeassa muodossa." };
  }

  if (items.length === 0) {
    return { ok: false as const, message: "Valitse vahintaan yksi tuote." };
  }

  const productMap = await getProductMap();
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
      message: "Demo-tilassa tallennusta ei kirjoiteta tietokantaan. Kytke Supabase kayttoon."
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
    return { success: false, message: "Tilauksen tallennus epaonnistui." };
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
    return { success: false, message: "Tuotteiden tallennus epaonnistui." };
  }

  revalidateOrderViews(validation.values.pickupDate);
  redirect(`/tilaukset/${validation.values.pickupDate}`);
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
      message: "Demo-tilassa muutoksia ei kirjoiteta tietokantaan. Kytke Supabase kayttoon."
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
    return { success: false, message: "Tilauksen paivitys epaonnistui." };
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
    return { success: false, message: "Uusien tuotteiden tallennus epaonnistui." };
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
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    active: true
  });

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
