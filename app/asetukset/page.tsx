import { PageIntro } from "@/components/page-intro";
import { ProductSettings } from "@/components/product-settings";
import { getDailyFeaturedProductConfig, getProducts } from "@/lib/data/orders";

export default async function SettingsPage() {
  const [products, featuredProduct] = await Promise.all([
    getProducts(),
    getDailyFeaturedProductConfig()
  ]);

  return (
    <main className="page-stack">
      <PageIntro
        eyebrow="Asetukset"
        title="Hallinnoi tuoterekisteriä"
        description="Tuotteet haetaan aina tietokannasta. Tästä näkymästä on helppo lisätä tai piilottaa sesonkituotteita ilman koodimuutoksia."
      />
      <ProductSettings featuredProduct={featuredProduct} products={products} />
    </main>
  );
}
