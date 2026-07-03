"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { createPublicBookingAction } from "@/lib/actions/orders";
import type { DailyFeaturedProduct, Product } from "@/lib/types";

const quickAmounts = [100, 200, 300, 400, 500, 600] as const;

type SelectedItem = {
  productId: string;
  amountType: "preset" | "custom";
  quantityGrams: number;
};

type CustomerBookingFormProps = {
  defaultPickupDate?: string;
  featuredProduct: DailyFeaturedProduct | null;
  products: Product[];
};

const initialState = {
  success: false,
  message: ""
};

export function CustomerBookingForm({
  defaultPickupDate,
  featuredProduct,
  products
}: CustomerBookingFormProps) {
  const [state, formAction, pending] = useActionState(createPublicBookingAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [startedAt, setStartedAt] = useState(() => String(Date.now()));
  const [pickupDate, setPickupDate] = useState(defaultPickupDate ?? "");

  const selectedIds = useMemo(
    () => new Set(selectedItems.map((item) => item.productId)),
    [selectedItems]
  );

  const selectedProducts = products.filter((product) => selectedIds.has(product.id));
  const todayDate = useMemo(
    () =>
      new Intl.DateTimeFormat("sv-SE", {
        timeZone: "Europe/Helsinki"
      }).format(new Date()),
    []
  );
  const effectivePickupDate = pickupDate || defaultPickupDate || todayDate;
  const showFeaturedProduct =
    featuredProduct &&
    effectivePickupDate >= featuredProduct.visible_from &&
    effectivePickupDate <= featuredProduct.visible_to;

  useEffect(() => {
    if (!state.success) {
      return;
    }

    formRef.current?.reset();
    setSelectedItems([]);
    setStartedAt(String(Date.now()));
    setPickupDate(defaultPickupDate ?? "");
  }, [defaultPickupDate, state.success]);

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

  return (
    <form action={formAction} className="panel form-panel public-booking-form" ref={formRef}>
      <input name="itemsJson" type="hidden" value={JSON.stringify(selectedItems)} />
      <input name="startedAt" type="hidden" value={startedAt} />

      <label className="booking-honeypot" htmlFor="website">
        Verkkosivu
      </label>
      <input
        autoComplete="off"
        className="booking-honeypot"
        id="website"
        name="website"
        tabIndex={-1}
        type="text"
      />

      {showFeaturedProduct ? (
        <section className="featured-product-banner" aria-live="polite">
          <p className="featured-product-banner-title">Päivän tuote</p>
          <div className="featured-product-banner-content">
            <strong>{featuredProduct.product_name}</strong>
            <span>{featuredProduct.price}</span>
            <span>Pyyntialue: {featuredProduct.fishing_area}</span>
          </div>
        </section>
      ) : null}

      <div className="form-grid">
        <label className="field">
          <span>Noutopäivä</span>
          <input
            name="pickupDate"
            onChange={(event) => setPickupDate(event.target.value)}
            required
            type="date"
            value={pickupDate}
          />
        </label>

        <label className="field">
          <span>Nimi</span>
          <input
            name="customerName"
            placeholder="Esim. Matti Meikalainen"
            required
            type="text"
          />
        </label>

        <label className="field">
          <span>Puhelinnumero</span>
          <input
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
            inputMode="email"
            name="email"
            placeholder="asiakas@example.com"
            type="email"
          />
        </label>

        <label className="field field-wide">
          <span>Lisätiedot</span>
          <textarea
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
            <h3>Valitse tuotteet varaukseen</h3>
          </div>
          <span className="badge">{selectedItems.length} valittuna</span>
        </div>

        {selectedProducts.length > 0 ? (
          <div className="selected-product-strip">
            {selectedProducts.map((product) => (
              <span className="selected-product-pill" key={product.id}>
                {product.name}
              </span>
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
                id={`public-product-${product.id}`}
                key={product.id}
              >
                <div className="product-card-top">
                  <div className="checkbox-row">
                    <input
                      checked={selected}
                      onChange={(event) => toggleProduct(product.id, event.target.checked)}
                      type="checkbox"
                    />
                    <div className="product-card-copy">
                      <strong>{product.name}</strong>
                      {product.price ? <span>{product.price}</span> : null}
                    </div>
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
                        Muu määrä
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

      <div className="booking-submit-block">
        <p className="card-copy">
          Lähettämällä varauksen siirrät tilauksen suoraan Forellin käsittelyyn. Saat vahvistuksen
          heti seuraavalla sivulla.
        </p>
        <button className="primary-button large" disabled={pending} type="submit">
          {pending ? "Lähetetään varausta..." : "Lähetä varaus"}
        </button>
      </div>
    </form>
  );
}
