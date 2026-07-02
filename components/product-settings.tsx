import {
  addProductAction,
  removeDailyFeaturedProductAction,
  toggleProductActiveAction,
  upsertDailyFeaturedProductAction
} from "@/lib/actions/orders";
import type { DailyFeaturedProduct, Product } from "@/lib/types";

type ProductSettingsProps = {
  featuredProduct: DailyFeaturedProduct | null;
  products: Product[];
};

export function ProductSettings({ featuredProduct, products }: ProductSettingsProps) {
  return (
    <section className="settings-grid">
      <article className="panel featured-product-settings">
        <div className="panel-header">
          <div>
            <p className="section-label">Päivän tuote</p>
            <h2>Asiakaspuolen nosto</h2>
            <p className="card-copy">
              Täytetty päivän tuote näkyy asiakaspuolen varausnäkymässä lisäyspäivänä ja
              seuraavana päivänä.
            </p>
          </div>
        </div>

        {featuredProduct ? (
          <div className="featured-product-preview">
            <div>
              <p className="featured-product-eyebrow">Voimassa</p>
              <strong>
                {featuredProduct.visible_from} - {featuredProduct.visible_to}
              </strong>
            </div>
            <div className="featured-product-meta">
              <span>{featuredProduct.product_name}</span>
              <span>{featuredProduct.price}</span>
              <span>Pyyntialue: {featuredProduct.fishing_area}</span>
            </div>
            <form action={removeDailyFeaturedProductAction}>
              <button className="ghost-button" type="submit">
                Poista päivän tuote
              </button>
            </form>
          </div>
        ) : null}

        <form action={upsertDailyFeaturedProductAction} className="form-grid">
          <label className="field">
            <span>Tuote</span>
            <input
              defaultValue={featuredProduct?.product_name ?? ""}
              name="productName"
              required
              type="text"
            />
          </label>
          <label className="field">
            <span>Hinta</span>
            <input
              defaultValue={featuredProduct?.price ?? ""}
              name="price"
              placeholder="Esim. 29,90 €/kg"
              required
              type="text"
            />
          </label>
          <label className="field field-wide">
            <span>Pyyntialue</span>
            <input
              defaultValue={featuredProduct?.fishing_area ?? ""}
              name="fishingArea"
              placeholder="Esim. Pihlajavesi"
              required
              type="text"
            />
          </label>
          <div className="form-footer">
            <button className="primary-button" type="submit">
              Tallenna päivän tuote
            </button>
          </div>
        </form>
      </article>

      <article className="panel">
        <div className="panel-header">
          <div>
            <p className="section-label">Nykyiset tuotteet</p>
            <h2>Tuoteluettelo</h2>
            <p className="card-copy">
              Aktiiviset tuotteet näkyvät automaattisesti myös asiakaspuolen Varaa-näkymässä.
            </p>
          </div>
        </div>
        <div className="card-stack">
          {products.map((product) => (
            <div
              className={`product-row product-status-row ${product.active ? "product-row-active" : "product-row-inactive"}`}
              key={product.id}
            >
              <div className="product-status-copy">
                <strong>{product.name}</strong>
                <p className="card-copy">
                  Järjestys {product.sort_order}
                </p>
              </div>
              <span
                className={`product-state-pill ${product.active ? "active" : "inactive"}`}
              >
                {product.active ? "Aktiivinen" : "Ei aktiivinen"}
              </span>
              <form action={toggleProductActiveAction}>
                <input name="productId" type="hidden" value={product.id} />
                <input name="active" type="hidden" value={String(product.active)} />
                <button className="ghost-button" type="submit">
                  {product.active ? "Piilota" : "Aktivoi"}
                </button>
              </form>
            </div>
          ))}
        </div>
      </article>

      <article className="panel">
        <div className="panel-header">
          <div>
            <p className="section-label">Lisää tuote</p>
            <h2>Uusi sesonkituote</h2>
          </div>
        </div>
        <form action={addProductAction} className="form-grid">
          <label className="field field-wide">
            <span>Tuotteen nimi</span>
            <input name="name" required type="text" />
          </label>
          <label className="field">
            <span>Järjestys</span>
            <input defaultValue={products.length + 1} min={0} name="sortOrder" type="number" />
          </label>
          <div className="form-footer">
            <button className="primary-button" type="submit">
              Lisää tuote
            </button>
          </div>
        </form>
      </article>
    </section>
  );
}
