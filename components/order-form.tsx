"use client";

import { useActionState, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createOrderAction, updateOrderAction } from "@/lib/actions/orders";
import type { DetailedOrder, Product } from "@/lib/types";

const quickAmounts = [100, 200, 300, 400, 500, 600] as const;

type SelectedItem = {
  productId: string;
  amountType: "preset" | "custom";
  quantityGrams: number;
};

type OrderFormProps = {
  products: Product[];
  mode: "create" | "edit";
  defaultPickupDate?: string;
  order?: DetailedOrder;
};

const initialState = {
  success: false,
  message: ""
};

function buildInitialItems(order?: DetailedOrder): SelectedItem[] {
  if (!order) {
    return [];
  }

  return order.order_items.map((item) => ({
    productId: item.product_id,
    amountType: quickAmounts.includes(item.quantity_grams as (typeof quickAmounts)[number])
      ? "preset"
      : "custom",
    quantityGrams: item.quantity_grams
  }));
}

export function OrderForm({
  products,
  mode,
  defaultPickupDate,
  order
}: OrderFormProps) {
  const action = mode === "create" ? createOrderAction : updateOrderAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>(() =>
    buildInitialItems(order)
  );

  const selectedIds = useMemo(
    () => new Set(selectedItems.map((item) => item.productId)),
    [selectedItems]
  );

  function toggleProduct(productId: string, checked: boolean) {
    setSelectedItems((current) => {
      if (checked) {
        return [...current, { productId, amountType: "preset", quantityGrams: 100 }];
      }

      return current.filter((item) => item.productId !== productId);
    });
  }

  function updateQuantity(productId: string, quantityGrams: number) {
    setSelectedItems((current) =>
      current.map((item) =>
        item.productId === productId ? { ...item, quantityGrams } : item
      )
    );
  }

  function updateAmountType(productId: string, amountType: "preset" | "custom") {
    setSelectedItems((current) =>
      current.map((item) =>
        item.productId === productId
          ? {
              ...item,
              amountType,
              quantityGrams: amountType === "preset" ? 100 : item.quantityGrams
            }
          : item
      )
    );
  }

  function adjustQuantity(productId: string, delta: number) {
    setSelectedItems((current) =>
      current.map((item) =>
        item.productId === productId
          ? { ...item, quantityGrams: Math.max(1, item.quantityGrams + delta) }
          : item
      )
    );
  }

  function scrollToProduct(productId: string) {
    const element = document.getElementById(`product-${productId}`);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const selectedProducts = products.filter((product) => selectedIds.has(product.id));

  return (
    <form action={formAction} className="panel form-panel">
      {mode === "edit" && order ? (
        <input name="orderId" type="hidden" value={order.id} />
      ) : null}
      <input name="itemsJson" type="hidden" value={JSON.stringify(selectedItems)} />

      <section className="mobile-summary">
        <article className="summary-chip-card">
          <span className="section-label">Tuotteita</span>
          <strong>{selectedItems.length}</strong>
        </article>
        <article className="summary-chip-card">
          <span className="section-label">Tila</span>
          <strong>{mode === "edit" ? "Muokkaus" : "Uusi tilaus"}</strong>
        </article>
        <button className="ghost-button" onClick={() => router.back()} type="button">
          Takaisin
        </button>
      </section>

      <div className="form-grid">
        <label className="field">
          <span>Noutopäivä</span>
          <input
            defaultValue={order?.pickup_date ?? defaultPickupDate}
            name="pickupDate"
            required
            type="date"
          />
        </label>

        <label className="field">
          <span>Asiakkaan nimi</span>
          <input
            defaultValue={order?.customer_name}
            name="customerName"
            placeholder="Esim. Matti Meikalainen"
            required
            type="text"
          />
        </label>

        <label className="field">
          <span>Puhelinnumero</span>
          <input
            defaultValue={order?.phone}
            inputMode="tel"
            name="phone"
            placeholder="040 123 4567"
            required
            type="tel"
          />
        </label>

        <label className="field">
          <span>Sähköposti</span>
          <input
            defaultValue={order?.email ?? ""}
            inputMode="email"
            name="email"
            placeholder="asiakas@example.com"
            type="email"
          />
        </label>

        <label className="field field-wide">
          <span>Lisatiedot</span>
          <textarea
            defaultValue={order?.notes ?? ""}
            name="notes"
            placeholder="Esim. fileenä ilman nahkaa, nouto klo 14 jälkeen"
            rows={4}
          />
        </label>
      </div>

      <section className="product-picker">
        <div className="section-heading">
          <div>
            <p className="section-label">Tuotteet</p>
            <h3>Valitse tilattavat tuotteet</h3>
          </div>
          <span className="badge">{selectedItems.length} valittuna</span>
        </div>

        {selectedProducts.length > 0 ? (
          <div className="selected-product-strip">
            {selectedProducts.map((product) => (
              <button
                className="selected-product-pill"
                key={product.id}
                onClick={() => scrollToProduct(product.id)}
                type="button"
              >
                {product.name}
              </button>
            ))}
          </div>
        ) : null}

        <div className="product-list">
          {products.map((product) => {
            const selected = selectedIds.has(product.id);
            const selectedItem = selectedItems.find((item) => item.productId === product.id);

            return (
              <label
                className={`product-card ${selected ? "selected" : ""}`}
                id={`product-${product.id}`}
                key={product.id}
              >
                <div className="product-card-top">
                  <div className="checkbox-row">
                    <input
                      checked={selected}
                      onChange={(event) => toggleProduct(product.id, event.target.checked)}
                      type="checkbox"
                    />
                    <strong>{product.name}</strong>
                  </div>
                  <span className={`selection-state ${selected ? "on" : ""}`}>
                    {selected ? "Valittu" : "Ei valittu"}
                  </span>
                </div>

                {selected && selectedItem ? (
                  <div className="amount-stack">
                    <div className="chip-row">
                      {quickAmounts.map((amount) => (
                        <button
                          className={`chip ${
                            selectedItem.amountType === "preset" &&
                            selectedItem.quantityGrams === amount
                              ? "active"
                              : ""
                          }`}
                          key={amount}
                          onClick={(event) => {
                            event.preventDefault();
                            updateAmountType(product.id, "preset");
                            updateQuantity(product.id, amount);
                          }}
                          type="button"
                        >
                          {amount} g
                        </button>
                      ))}
                      <button
                        className={`chip ${
                          selectedItem.amountType === "custom" ? "active" : ""
                        }`}
                        onClick={(event) => {
                          event.preventDefault();
                          updateAmountType(product.id, "custom");
                        }}
                        type="button"
                      >
                        Muu maara
                      </button>
                    </div>

                    {selectedItem.amountType === "custom" ? (
                      <div className="custom-amount-row">
                        <button
                          className="stepper-button"
                          onClick={() => adjustQuantity(product.id, -50)}
                          type="button"
                        >
                          -50 g
                        </button>
                        <label className="field custom-amount-field">
                          <span>Grammoina</span>
                          <input
                            inputMode="numeric"
                            min={1}
                            onChange={(event) =>
                              updateQuantity(product.id, Number(event.target.value) || 0)
                            }
                            type="number"
                            value={selectedItem.quantityGrams}
                          />
                        </label>
                        <button
                          className="stepper-button"
                          onClick={() => adjustQuantity(product.id, 50)}
                          type="button"
                        >
                          +50 g
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </label>
            );
          })}
        </div>
      </section>

      {state.message ? (
        <p className={state.success ? "feedback success" : "feedback error"}>{state.message}</p>
      ) : null}

      <div className="form-footer">
        <button className="primary-button large" disabled={pending} type="submit">
          {pending
            ? "Tallennetaan..."
            : mode === "create"
              ? "Tallenna tilaus"
              : "Tallenna muutokset"}
        </button>
      </div>

      <div className="sticky-submit-bar mobile-only">
        <div className="sticky-submit-meta">
          <strong>{selectedItems.length} tuotetta</strong>
          <span>{mode === "edit" ? "Muokataan tilausta" : "Valmis tallennukseen"}</span>
        </div>
        <button className="primary-button sticky-submit-button" disabled={pending} type="submit">
          {pending ? "Tallennetaan..." : "Tallenna"}
        </button>
      </div>
    </form>
  );
}
