import { NextResponse } from "next/server";
import { getProductionReport } from "@/lib/data/orders";

function buildFilename(from?: string | null, to?: string | null) {
  if (from && to) {
    return `sahkopostit-${from}-${to}.csv`;
  }

  return "sahkopostit-kaikki-tilaukset.csv";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") || undefined;
  const to = searchParams.get("to") || undefined;
  const report = await getProductionReport(from, to);

  if (report.email_contacts.length === 0) {
    return NextResponse.json(
      { error: "Sähköposteja ei löytynyt valitulla aikavälillä." },
      { status: 404 }
    );
  }

  const lines = [
    ["asiakas", "sahkoposti", "viimeisin_noutopaiva", "tilausten_lukumaara"].join(";"),
    ...report.email_contacts.map((contact) =>
      [
        `"${contact.customer_name.replaceAll('"', '""')}"`,
        `"${contact.email.replaceAll('"', '""')}"`,
        contact.latest_pickup_date,
        String(contact.order_count)
      ].join(";")
    )
  ];

  const csv = `\uFEFF${lines.join("\n")}`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${buildFilename(
        report.label.from,
        report.label.to
      )}"`,
      "Cache-Control": "no-store"
    }
  });
}
