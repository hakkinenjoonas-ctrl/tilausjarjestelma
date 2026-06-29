import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderForm } from "@/components/order-form";
import { PageIntro } from "@/components/page-intro";
import { getOrderById, getProducts } from "@/lib/data/orders";
import { formatPickupDate } from "@/lib/utils/format";

type EditOrderPageProps = {
  params: Promise<{
    date: string;
    id: string;
  }>;
};

export default async function EditOrderPage({ params }: EditOrderPageProps) {
  const { id, date } = await params;
  const [order, products] = await Promise.all([getOrderById(id), getProducts()]);

  if (!order) {
    notFound();
  }

  return (
    <main className="page-stack">
      <PageIntro
        eyebrow="Muokkaa tilausta"
        title={`Tilaus ${formatPickupDate(date)}`}
        description="Paivita asiakkaan tiedot, tuotteet tai noutopaiva ilman ylimaaraisia klikkauksia."
        action={
          <Link className="ghost-button" href={`/tilaukset/${date}`}>
            Takaisin paivan tilauksiin
          </Link>
        }
      />
      <OrderForm products={products} mode="edit" order={order} />
    </main>
  );
}
