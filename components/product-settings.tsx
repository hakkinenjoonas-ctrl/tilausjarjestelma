import { addProductAction, toggleProductActiveAction } from "@/lib/actions/orders";
import type { Product } from "@/lib/types";

type ProductSettingsProps = {
  products: Product[];
};

export function ProductSettings({ products }: ProductSettingsProps) {
  return (
    <section className="settings-grid">
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
