import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { getOrdersByPickupDate } from "@/lib/data/orders";
import { LabelExportLinks } from "@/components/label-export-links";
import { getLabelSize } from "@/lib/labels";
import {
  formatDateTime,
  formatPickupDate,
  formatPhone,
  formatQuantity
} from "@/lib/utils/format";

type PrintDayPageProps = {
  params: Promise<{
    date: string;
  }>;
  searchParams: Promise<{
    size?: string;
  }>;
};

export default async function PrintDayPage({
  params,
  searchParams
}: PrintDayPageProps) {
  const [{ date }, { size }] = await Promise.all([params, searchParams]);
  const labelSize = getLabelSize(size);
  const orders = await getOrdersByPickupDate(date);

  if (orders.length === 0) {
    notFound();
  }

  return (
    <main className={`label-print-page ${labelSize}`}>
      <section className="label-toolbar screen-only">
        <div>
          <BrandMark compact />
          <p className="eyebrow">Munbyn 403B</p>
          <h2>Tarratulostus {formatPickupDate(date)}</h2>
          <p className="card-copy">
            Avaa tai tallenna jokainen tarra PNG-kuvana ja tulosta se MUNBYN Print -sovelluksessa.
          </p>
        </div>
        <div className="inline-actions">
          <Link className="ghost-button" href={`/tilaukset/${date}/tulosta?size=4x6`}>
            4x6 tarra
          </Link>
          <Link className="ghost-button" href={`/tilaukset/${date}/tulosta?size=4x3`}>
            4x3 tarra
          </Link>
          <Link className="primary-button" href={`/tilaukset/${date}`}>
            Takaisin paivaan
          </Link>
        </div>
      </section>

      {orders.map((order, index) => (
        <article className={`label-sheet ${labelSize}`} key={order.id}>
          <header className="label-header">
            <div className="label-heading-block">
              <p className="label-brand-name">Forelli</p>
              <p className="label-kicker">Noutotilaus</p>
              <h1>{order.customer_name}</h1>
            </div>
            <div className="label-status-block">
              <Image
                alt="Kalakauppa Forelli"
                className="label-corner-logo"
                height={72}
                src="/brand-logo.png"
                width={72}
              />
              <span className={`label-status ${order.status}`}>{order.status}</span>
              <span className="label-sequence">
                {index + 1}/{orders.length}
              </span>
            </div>
          </header>

          <div className="screen-only label-download-row">
            <LabelExportLinks date={order.pickup_date} id={order.id} />
          </div>

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
      ))}
    </main>
  );
}
