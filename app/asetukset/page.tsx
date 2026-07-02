import { PageIntro } from "@/components/page-intro";
import { ProductSettings } from "@/components/product-settings";
import { getProducts } from "@/lib/data/orders";

export default async function SettingsPage() {
  const products = await getProducts();

  return (
    <main className="page-stack">
      <PageIntro
        eyebrow="Asetukset"
        title="Hallinnoi tuoterekisteriä"
        description="Tuotteet haetaan aina tietokannasta. Tästä näkymästä on helppo lisätä tai piilottaa sesonkituotteita ilman koodimuutoksia."
      />
      <ProductSettings products={products} />
    </main>
  );
}
