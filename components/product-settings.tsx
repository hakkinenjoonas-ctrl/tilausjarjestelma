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
          </div>
        </div>
        <div className="card-stack">
          {products.map((product) => (
            <div className="product-row" key={product.id}>
              <div>
                <strong>{product.name}</strong>
                <p className="card-copy">
                  Jarjestys {product.sort_order} • {product.active ? "Aktiivinen" : "Piilotettu"}
                </p>
              </div>
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
            <p className="section-label">Lisaa tuote</p>
            <h2>Uusi sesonkituote</h2>
          </div>
        </div>
        <form action={addProductAction} className="form-grid">
          <label className="field field-wide">
            <span>Tuotteen nimi</span>
            <input name="name" required type="text" />
          </label>
          <label className="field">
            <span>Jarjestys</span>
            <input defaultValue={products.length + 1} min={0} name="sortOrder" type="number" />
          </label>
          <div className="form-footer">
            <button className="primary-button" type="submit">
              Lisaa tuote
            </button>
          </div>
        </form>
      </article>
    </section>
  );
}
