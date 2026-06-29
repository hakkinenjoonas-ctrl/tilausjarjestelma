import { NextResponse } from "next/server";
import { getProductionReport } from "@/lib/data/orders";
import { buildReportPdf } from "@/lib/pdf/report-pdf";

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

  const pdf = await buildReportPdf({
    from: report.label.from,
    to: report.label.to,
    rows: report.rows,
    emailContacts: report.email_contacts
  });

  return new NextResponse(Buffer.from(pdf.bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${pdf.filename}"`,
      "Cache-Control": "no-store"
    }
  });
}
