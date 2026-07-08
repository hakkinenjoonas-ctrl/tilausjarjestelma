import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { getOrdersByPickupDate, getProducts } from "@/lib/data/orders";
import { LabelExportLinks } from "@/components/label-export-links";
import { getLabelSize } from "@/lib/labels";
import { estimateOrderPrice, formatEuroCents } from "@/lib/order-pricing";
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
  const [orders, products] = await Promise.all([getOrdersByPickupDate(date), getProducts()]);

  if (orders.length === 0) {
    notFound();
  }

  const pricedOrders = orders.map((order) => {
    const priceEstimate = estimateOrderPrice(order, products);

    return {
      order,
      totalPriceLabel: priceEstimate.hasEstimate
        ? formatEuroCents(priceEstimate.totalCents)
        : null,
      totalPriceNote: priceEstimate.hasEstimate
        ? priceEstimate.isPartial
          ? "Arvio perustuu hinnoiteltuihin tuotteisiin. Lopullinen summa määräytyy toteutuneen palvelutiskipainon mukaan."
          : "Arvio perustuu tilattuihin määriin. Lopullinen summa määräytyy toteutuneen palvelutiskipainon mukaan ja voi poiketa hieman arviosta."
        : null
    };
  });

  return (
    <main className={`label-print-page ${labelSize}`}>
      <section className="label-toolbar screen-only">
        <div>
          <BrandMark compact logoOnly />
          <p className="eyebrow">Munbyn 403B</p>
          <h2>Tarratulostus {formatPickupDate(date)}</h2>
          <p className="card-copy">
            iOS Safarissa jokainen tarra voidaan muodostaa ensin PDF:ksi. Muilla laitteilla tarra
            avautuu edelleen PNG-kuvana MUNBYN Print -sovellusta varten.
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
            Takaisin päivään
          </Link>
        </div>
      </section>

      {pricedOrders.map(({ order, totalPriceLabel, totalPriceNote }, index) => (
        <article className={`label-sheet ${labelSize}`} key={order.id}>
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
                src="/brand-logo-transparent.png"
                width={112}
              />
            </div>
          </header>

          <div className="screen-only label-download-row">
            <LabelExportLinks date={order.pickup_date} id={order.id} />
          </div>

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
            <span className="label-sequence">
              {index + 1}/{pricedOrders.length}
            </span>
          </footer>
        </article>
      ))}
    </main>
  );
}
