import Link from "next/link";
import { CustomerBookingForm } from "@/components/customer-booking-form";
import { EmptyState } from "@/components/empty-state";
import { PageIntro } from "@/components/page-intro";
import { getActiveProducts } from "@/lib/data/orders";

type BookingPageProps = {
  searchParams: Promise<{
    pickup_date?: string;
  }>;
};

export default async function BookingPage({ searchParams }: BookingPageProps) {
  const params = await searchParams;
  const products = await getActiveProducts();

  return (
    <main className="page-stack">
      <PageIntro
        eyebrow="Asiakasvaraus"
        title="Tee ennakkovaraus verkossa"
        description="Valitse noutopaiva, tuotteet ja omat yhteystietosi. Varaus siirtyy suoraan Forellin kasittelyyn."
        action={<Link className="ghost-button" href="/tilaukset">Forellin hallintaan</Link>}
      />
      {products.length > 0 ? (
        <CustomerBookingForm defaultPickupDate={params.pickup_date} products={products} />
      ) : (
        <EmptyState
          title="Varauksia ei voi ottaa vastaan juuri nyt"
          description="Forellin asetuksissa ei ole aktiivisia tuotteita. Aktivoi tuotteet hallinnasta ennen kuin jaat varauslinkin asiakkaille."
          actionHref="/asetukset"
          actionLabel="Avaa asetukset"
        />
      )}
    </main>
  );
}
