import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { PageIntro } from "@/components/page-intro";
import { getOrderDaySummaries } from "@/lib/data/orders";
import { formatPickupDate, formatWeight } from "@/lib/utils/format";

export default async function OrdersPage() {
  const daySummaries = await getOrderDaySummaries();

  return (
    <main className="page-stack">
      <PageIntro
        eyebrow="Tilaukset"
        title="Valitse noutopäivä"
        description="Etusivu näyttää vain ne päivät, joille on tilauksia. Yksi painallus avaa päivän kaikki tilaukset."
      />

      {daySummaries.length === 0 ? (
        <EmptyState
          title="Ei vielä tilauksia"
          description="Luo ensimmäinen tilaus, niin noutopäivät alkavat näkyä tässä."
          actionHref="/uusi-tilaus"
          actionLabel="Luo uusi tilaus"
        />
      ) : (
        <section className="day-grid">
          {daySummaries.map((day) => (
            <Link
              className="day-card"
              href={`/tilaukset/${day.pickup_date}`}
              key={day.pickup_date}
            >
              <p className="day-date">{formatPickupDate(day.pickup_date)}</p>
              <strong>{day.order_count} tilausta</strong>
              <span>{formatWeight(day.total_grams)} tuotteita</span>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
