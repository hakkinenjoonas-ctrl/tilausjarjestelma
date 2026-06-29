import { EmptyState } from "@/components/empty-state";
import { PageIntro } from "@/components/page-intro";
import { PrintButton } from "@/components/print-button";
import { ReportExportLinks } from "@/components/report-export-links";
import { getProductionReport } from "@/lib/data/orders";
import {
  formatPickupDate,
  formatWeight
} from "@/lib/utils/format";

type ReportsPageProps = {
  searchParams: Promise<{
    from?: string;
    to?: string;
  }>;
};

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const params = await searchParams;
  const report = await getProductionReport(params.from, params.to);

  return (
    <main className="page-stack">
      <PageIntro
        eyebrow="Raportit"
        title="Laske paljonko kutakin tuotetta tarvitaan"
        description="Voit hakea joko yhdelle paivalle tai paivamaaravalille yhteenvedon tuotteiden kokonaismaaroista."
      />

      <form className="panel filter-grid">
        <label className="field">
          <span>Alkaen</span>
          <input defaultValue={params.from} name="from" type="date" />
        </label>
        <label className="field">
          <span>Asti</span>
          <input defaultValue={params.to} name="to" type="date" />
        </label>
        <button className="primary-button" type="submit">
          Paivita raportti
        </button>
      </form>

      {report.rows.length === 0 ? (
        <EmptyState
          title="Raporttiin ei loytynyt dataa"
          description="Valitse paiva tai paivamaaravali, jolle on tallennettu tilauksia."
        />
      ) : (
        <>
          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="section-label">Yhteenveto</p>
                <h2>
                  {report.label.from && report.label.to
                    ? `${formatPickupDate(report.label.from)} - ${formatPickupDate(report.label.to)}`
                    : "Kaikki tilaukset"}
                </h2>
              </div>
              <div className="inline-actions">
                <ReportExportLinks from={params.from} to={params.to} />
                <PrintButton label="Tulosta selaimesta" />
              </div>
            </div>
            <div className="summary-list">
              {report.rows.map((row) => (
                <article className="summary-row" key={row.product_name}>
                  <strong>{row.product_name}</strong>
                  <span>{formatWeight(row.total_grams)}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="section-label">Sahkopostit</p>
                <h2>Ajanjaksolla tilanneet asiakkaat</h2>
              </div>
              <div className="inline-actions">
                <ReportExportLinks
                  exportType="emails"
                  from={params.from}
                  to={params.to}
                />
              </div>
            </div>

            {report.email_contacts.length === 0 ? (
              <EmptyState
                title="Sahkoposteja ei loytynyt"
                description="Valitulla aikavalilla ei ole tilauksia, joissa olisi sahkopostiosoite."
              />
            ) : (
              <div className="summary-list">
                {report.email_contacts.map((contact) => (
                  <article className="summary-row" key={contact.email}>
                    <div className="summary-contact">
                      <strong>{contact.customer_name}</strong>
                      <span>{contact.email}</span>
                    </div>
                    <div className="summary-contact-meta">
                      <span>{contact.order_count} tilausta</span>
                      <span>{formatPickupDate(contact.latest_pickup_date)}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
