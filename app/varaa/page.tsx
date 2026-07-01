import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CustomerBookingForm } from "@/components/customer-booking-form";
import { EmptyState } from "@/components/empty-state";
import { getActiveProducts } from "@/lib/data/orders";

export const metadata: Metadata = {
  title: "Kalakauppa Forelli | Ennakkovaraus",
  description: "Tee Kalakauppa Forellin ennakkovaraus verkossa ja valitse noutopaiva, tuotteet ja yhteystietosi."
};

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
      <section className="public-hero">
        <div className="public-hero-brand">
          <div className="public-hero-logo-wrap">
            <Image
              alt="Kalakauppa Forelli"
              className="public-hero-logo"
              height={200}
              priority
              src="/brand-logo.png"
              width={200}
            />
          </div>
          <div className="public-hero-copy">
            <p className="public-hero-kicker">Kalakauppa Forelli</p>
            <h1>TUORETTA LAHIKALAA</h1>
            <p className="public-hero-description">
              Tee ennakkovaraus helposti verkossa. Valitse noutopaiva, tuotteet ja omat
              yhteystietosi, niin Forelli kasittelee varauksesi valmiiksi noutoon.
            </p>
            <div className="page-intro-action">
              <Link className="primary-button" href="#varauslomake">
                Aloita varaus
              </Link>
            </div>
          </div>
        </div>
      </section>
      {products.length > 0 ? (
        <div id="varauslomake">
          <CustomerBookingForm defaultPickupDate={params.pickup_date} products={products} />
        </div>
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
