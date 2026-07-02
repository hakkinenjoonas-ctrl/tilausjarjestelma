import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { PageIntro } from "@/components/page-intro";
import { getProductionSummaryByDay } from "@/lib/data/orders";
import { formatPickupDate, formatWeight } from "@/lib/utils/format";

export default async function SummaryPage() {
  const days = await getProductionSummaryByDay();

  return (
    <main className="page-stack">
      <PageIntro
        eyebrow="Tiivistelmä"
        title="Valmistettavat määrät päivittäin"
        description="Näkymä kertoo yhdellä silmäyksellä paljonko kutakin tuotetta pitäisi valmistaa jokaiselle noutopäivälle."
      />

      {days.length === 0 ? (
        <EmptyState
          title="Tiivistelmää ei voida laskea vielä"
          description="Kun tilauksia on tallennettu, päiväkohtaiset tuotemääräyhteenvedot tulevat tähän."
        />
      ) : (
        <section className="card-stack">
          {days.map((day) => (
            <article className="panel" key={day.pickup_date}>
              <div className="panel-header">
                <div>
                  <p className="section-label">Noutopäivä</p>
                  <h2>{formatPickupDate(day.pickup_date)}</h2>
                </div>
                <Link className="ghost-button" href={`/tilaukset/${day.pickup_date}`}>
                  Avaa tilaukset
                </Link>
              </div>
              <div className="summary-list">
                {day.products.map((product) => (
                  <article className="summary-row" key={product.product_name}>
                    <strong>{product.product_name}</strong>
                    <span>{formatWeight(product.total_grams)}</span>
                  </article>
                ))}
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
