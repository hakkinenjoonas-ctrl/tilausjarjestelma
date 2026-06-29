import Link from "next/link";
import { OrderForm } from "@/components/order-form";
import { PageIntro } from "@/components/page-intro";
import { getProducts } from "@/lib/data/orders";

type NewOrderPageProps = {
  searchParams: Promise<{
    pickup_date?: string;
  }>;
};

export default async function NewOrderPage({ searchParams }: NewOrderPageProps) {
  const params = await searchParams;
  const products = await getProducts();

  return (
    <main className="page-stack">
      <PageIntro
        eyebrow="Uusi tilaus"
        title="Kirjaa tilaus nopeasti"
        description="Valitse noutopaiva, asiakkaan tiedot ja tuotteet. Tallennus tarkistaa, etta mukana on vahintaan yksi tuote."
        action={<Link className="ghost-button" href="/tilaukset">Takaisin tilauksiin</Link>}
      />
      <OrderForm
        defaultPickupDate={params.pickup_date}
        mode="create"
        products={products}
      />
    </main>
  );
}
