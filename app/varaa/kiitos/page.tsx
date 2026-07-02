import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { formatPickupDate } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Kalakauppa Forelli | Varaus vastaanotettu",
  description: "Kalakauppa Forellin ennakkovaraus on vastaanotettu."
};

type BookingSuccessPageProps = {
  searchParams: Promise<{
    customer?: string;
    pickup_date?: string;
  }>;
};

export default async function BookingSuccessPage({
  searchParams
}: BookingSuccessPageProps) {
  const params = await searchParams;
  const customerName = params.customer?.trim();
  const pickupDate = params.pickup_date?.trim();

  return (
    <main className="page-stack">
      <PageIntro
        eyebrow="Kalakauppa Forelli"
        title={customerName ? `Kiitos, ${customerName}` : "Kiitos varauksesta"}
        description={
          pickupDate
            ? `Varaus kirjattiin noutopäivälle ${formatPickupDate(pickupDate)}. Forelli käsittelee sen mahdollisimman pian.`
            : "Varaus kirjattiin onnistuneesti. Forelli käsittelee sen mahdollisimman pian."
        }
        action={<Link className="primary-button" href="/varaa">Tee uusi varaus</Link>}
      />

      <section className="panel success-panel">
        <h2>Mitä seuraavaksi tapahtuu?</h2>
        <p className="intro">
          Varaus on nyt tallessa. Jos Forellilla tarvitsee tarkentaa tuotetta, määriä tai
          noutoaikaa, sinuun ollaan yhteydessä antamiesi tietojen perusteella.
        </p>
        <div className="inline-actions">
          <Link className="ghost-button" href="/varaa">
            Palaa varauslomakkeeseen
          </Link>
        </div>
      </section>
    </main>
  );
}
