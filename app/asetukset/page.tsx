import { PageIntro } from "@/components/page-intro";
import { ProductSettings } from "@/components/product-settings";
import { getProducts } from "@/lib/data/orders";

export default async function SettingsPage() {
  const products = await getProducts();

  return (
    <main className="page-stack">
      <PageIntro
        eyebrow="Asetukset"
        title="Hallinnoi tuoterekisteria"
        description="Tuotteet haetaan aina tietokannasta. Tasta nakymasta on helppo lisaa tai poistaa sesonkituotteita ilman koodimuutoksia."
      />
      <ProductSettings products={products} />
    </main>
  );
}
