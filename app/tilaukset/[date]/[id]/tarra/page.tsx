import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { LabelExportLinks } from "@/components/label-export-links";
import { getOrderById } from "@/lib/data/orders";
import { getProducts } from "@/lib/data/orders";
import { getLabelSize } from "@/lib/labels";
import { estimateOrderPrice, formatEuroCents } from "@/lib/order-pricing";
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
  const [order, products] = await Promise.all([getOrderById(id), getProducts()]);

  if (!order || order.pickup_date !== date) {
    notFound();
  }

  const priceEstimate = estimateOrderPrice(order, products);
  const totalPriceLabel = priceEstimate.hasEstimate
    ? formatEuroCents(priceEstimate.totalCents)
    : null;
  const totalPriceNote = priceEstimate.hasEstimate
    ? priceEstimate.isPartial
      ? "Arvio perustuu hinnoiteltuihin tuotteisiin. Lopullinen summa määräytyy toteutuneen palvelutiskipainon mukaan."
      : "Arvio perustuu tilattuihin määriin. Lopullinen summa määräytyy toteutuneen palvelutiskipainon mukaan ja voi poiketa hieman arviosta."
    : null;

  return (
    <main className={`label-print-page single ${labelSize}`}>
      <section className="label-toolbar screen-only">
        <div>
          <BrandMark compact logoOnly />
          <p className="eyebrow">MUNBYN 403B</p>
          <h2>{order.customer_name}</h2>
          <p className="card-copy">
            iOS Safarissa tarra muodostetaan ensin PDF:ksi. Muilla laitteilla tarra avautuu PNG:nä
            MUNBYN Print -sovellusta varten.
          </p>
        </div>
        <div className="inline-actions">
          <LabelExportLinks date={date} id={id} mode="sizes" />
          <Link className="primary-button" href={`/tilaukset/${date}`}>
            Takaisin päivään
          </Link>
        </div>
        <p className="card-copy">
          403B toimii parhaiten tarkalla 4 tuuman levyisellä tarralla. iPhonessa voit jakaa
          muodostetun PDF:n suoraan tulostukseen.
        </p>
      </section>

      <article className={`label-sheet ${labelSize}`}>
        <header className="label-header">
          <div className="label-heading-block">
            <p className="label-brand-name">Forelli</p>
            <p className="label-kicker">Noutotilaus</p>
            <h1>{order.customer_name}</h1>
          </div>
          <div className="label-logo-block">
            <Image
              alt="Kalakauppa Forelli"
              className="label-corner-logo"
              height={112}
              priority
              src="/brand-logo-transparent.png"
              width={112}
            />
          </div>
        </header>

        <section className="label-primary-meta">
          <div className="label-meta-box pickup-date-box">
            <span className="label-meta-label">Noutopäivä</span>
            <strong className="pickup-date-value">{formatPickupDate(order.pickup_date)}</strong>
          </div>
          <div className="label-meta-box">
            <span className="label-meta-label">Puhelin</span>
            <strong>{formatPhone(order.phone)}</strong>
          </div>
          {order.email ? (
            <div className="label-meta-box">
              <span className="label-meta-label">Sähköposti</span>
              <strong>{order.email}</strong>
            </div>
          ) : null}
        </section>

        {totalPriceLabel ? (
          <section className="label-price-estimate">
            <span className="label-meta-label">Arvioitu yhteensä</span>
            <strong className="label-price-total">{totalPriceLabel}</strong>
            {totalPriceNote ? <p className="label-price-note">{totalPriceNote}</p> : null}
          </section>
        ) : null}

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
            <span className="label-meta-label">Lisätiedot</span>
            <p>{order.notes}</p>
          </section>
        ) : null}

        <footer className="label-footer">
          <span>Luotu {formatDateTime(order.created_at)}</span>
          <span className="label-sequence">Asiakaskortti</span>
        </footer>
      </article>
    </main>
  );
}
