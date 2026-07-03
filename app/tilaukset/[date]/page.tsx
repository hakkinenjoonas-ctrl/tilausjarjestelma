import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { OrderCard } from "@/components/order-card";
import { PageIntro } from "@/components/page-intro";
import { PrintLink } from "@/components/print-link";
import { getOrdersByPickupDate } from "@/lib/data/orders";
import { formatPickupDate } from "@/lib/utils/format";

type DayOrdersPageProps = {
  params: Promise<{
    date: string;
  }>;
};

export default async function DayOrdersPage({ params }: DayOrdersPageProps) {
  const { date } = await params;
  const orders = await getOrdersByPickupDate(date);

  return (
    <main className="page-stack">
      <PageIntro
        eyebrow="Päivän tilaukset"
        title={formatPickupDate(date)}
        description="Muokkaa tilaa nopeasti, poista virheelliset tilaukset tai avaa tilaus muokattavaksi."
        action={
          <div className="inline-actions">
            <Link className="ghost-button" href="/tilaukset">
              Takaisin päiviin
            </Link>
            <PrintLink orderIds={orders.map((order) => order.id)} pickupDate={date} />
            <Link className="primary-button" href={`/uusi-tilaus?pickup_date=${date}`}>
              Uusi tilaus
            </Link>
          </div>
        }
      />

      {orders.length === 0 ? (
        <EmptyState
          title="Tälle päivälle ei löytynyt tilauksia"
          description="Voit luoda uuden tilauksen valitulle noutopäivälle."
          actionHref={`/uusi-tilaus?pickup_date=${date}`}
          actionLabel="Luo uusi tilaus"
        />
      ) : (
        <section className="card-stack">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </section>
      )}
    </main>
  );
}
