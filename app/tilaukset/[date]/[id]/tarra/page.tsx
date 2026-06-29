import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { LabelExportLinks } from "@/components/label-export-links";
import { getOrderById } from "@/lib/data/orders";
import { getLabelSize } from "@/lib/labels";
import {
  formatDateTime,
  formatPickupDate,
  formatPhone,
  formatQuantity
} from "@/lib/utils/format";

type PrintOrderLabelPageProps = {
  params: Promise<{
    date: string;
    id: string;
  }>;
  searchParams: Promise<{
    size?: string;
  }>;
};
export default async function PrintOrderLabelPage({
  params,
  searchParams
}: PrintOrderLabelPageProps) {
  const [{ date, id }, { size }] = await Promise.all([params, searchParams]);
  const labelSize = getLabelSize(size);
  const order = await getOrderById(id);

  if (!order || order.pickup_date !== date) {
    notFound();
  }

  return (
    <main className={`label-print-page single ${labelSize}`}>
      <section className="label-toolbar screen-only">
        <div>
          <BrandMark compact />
          <p className="eyebrow">MUNBYN 403B</p>
          <h2>{order.customer_name}</h2>
          <p className="card-copy">
            Avaa oikean kokoinen PNG ja tulosta se MUNBYN Print -sovelluksen kautta.
          </p>
        </div>
        <div className="inline-actions">
          <LabelExportLinks date={date} id={id} mode="png" />
          <Link className="primary-button" href={`/tilaukset/${date}`}>
            Takaisin paivaan
          </Link>
        </div>
        <p className="card-copy">
          Suositus: tallenna kuva puhelimeen ja avaa se MUNBYN Print -sovelluksessa. 403B toimii
          parhaiten tarkalla 4 tuuman levyisella PNG-tarralla.
        </p>
      </section>

      <article className={`label-sheet ${labelSize}`}>
        <header className="label-header">
          <div>
            <p className="label-brand-name">Forelli</p>
            <p className="label-kicker">Noutotilaus</p>
            <h1>{order.customer_name}</h1>
          </div>
          <div className="label-status-block">
            <span className={`label-status ${order.status}`}>{order.status}</span>
          </div>
        </header>

        <section className="label-primary-meta">
          <div className="label-meta-box">
            <span className="label-meta-label">Noutopaiva</span>
            <strong>{formatPickupDate(order.pickup_date)}</strong>
          </div>
          <div className="label-meta-box">
            <span className="label-meta-label">Puhelin</span>
            <strong>{formatPhone(order.phone)}</strong>
          </div>
          {order.email ? (
            <div className="label-meta-box">
              <span className="label-meta-label">Sahkoposti</span>
              <strong>{order.email}</strong>
            </div>
          ) : null}
        </section>

        <section className="label-items">
          {order.order_items.map((item) => (
            <div className="label-item-row" key={item.id}>
              <strong>{item.product_name}</strong>
              <span>{formatQuantity(item.quantity_grams)}</span>
            </div>
          ))}
        </section>

        {order.notes ? (
          <section className="label-notes">
            <span className="label-meta-label">Lisatiedot</span>
            <p>{order.notes}</p>
          </section>
        ) : null}

        <footer className="label-footer">
          <span>Luotu {formatDateTime(order.created_at)}</span>
          <span className="label-checkline">
            <span className="label-check-box" />
            Noudettu
          </span>
        </footer>
      </article>
    </main>
  );
}
