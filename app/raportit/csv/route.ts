import { NextResponse } from "next/server";
import { getProductionReport } from "@/lib/data/orders";

function buildFilename(from?: string | null, to?: string | null) {
  if (from && to) {
    return `raportti-${from}-${to}.csv`;
  }

  return "raportti-kaikki-tilaukset.csv";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") || undefined;
  const to = searchParams.get("to") || undefined;
  const report = await getProductionReport(from, to);

  if (report.rows.length === 0) {
    return NextResponse.json(
      { error: "Raporttiin ei loytynyt dataa valitulla aikavalilla." },
      { status: 404 }
    );
  }

  const lines = [
    ["tuote", "maara_grammoina", "maara_kiloina"].join(";"),
    ...report.rows.map((row) =>
      [
        `"${row.product_name.replaceAll('"', '""')}"`,
        String(row.total_grams),
        (row.total_grams / 1000).toLocaleString("fi-FI", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 1
        })
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
