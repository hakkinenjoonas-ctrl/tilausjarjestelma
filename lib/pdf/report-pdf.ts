import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { ProductTotal, ReportEmailContact } from "@/lib/types";
import { formatDateTime, formatPickupDate, formatWeight } from "@/lib/utils/format";

type ReportPdfInput = {
  from?: string | null;
  to?: string | null;
  rows: ProductTotal[];
  emailContacts?: ReportEmailContact[];
};

function buildTitle(from?: string | null, to?: string | null) {
  if (from && to) {
    return `${formatPickupDate(from)} - ${formatPickupDate(to)}`;
  }

  return "Kaikki tilaukset";
}

function buildFilename(from?: string | null, to?: string | null) {
  if (from && to) {
    return `raportti-${from}-${to}.pdf`;
  }

  return "raportti-kaikki-tilaukset.pdf";
}

export async function buildReportPdf({
  from,
  to,
  rows,
  emailContacts = []
}: ReportPdfInput) {
  const pdfDoc = await PDFDocument.create();
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  let page = pdfDoc.addPage([595.28, 841.89]);

  const title = buildTitle(from, to);
  const generatedAt = formatDateTime(new Date().toISOString());
  const totalGrams = rows.reduce((sum, row) => sum + row.total_grams, 0);

  let y = 790;

  page.drawText("Kalakaupan tuotantoraportti", {
    x: 48,
    y,
    size: 12,
    font: boldFont,
    color: rgb(0.05, 0.41, 0.43)
  });
  y -= 28;

  page.drawText(title, {
    x: 48,
    y,
    size: 24,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.1)
  });
  y -= 24;

  page.drawText(`Luotu ${generatedAt} - yhteensa ${formatWeight(totalGrams)}`, {
    x: 48,
    y,
    size: 10,
    font: regularFont,
    color: rgb(0.35, 0.35, 0.35)
  });
  y -= 34;

  page.drawLine({
    start: { x: 48, y },
    end: { x: 547, y },
    thickness: 1,
    color: rgb(0.83, 0.83, 0.83)
  });
  y -= 24;

  page.drawText("Tuote", {
    x: 48,
    y,
    size: 11,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.1)
  });
  page.drawText("Maara", {
    x: 450,
    y,
    size: 11,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.1)
  });
  y -= 16;

  page.drawLine({
    start: { x: 48, y },
    end: { x: 547, y },
    thickness: 1,
    color: rgb(0.88, 0.88, 0.88)
  });
  y -= 18;

  rows.forEach((row) => {
    if (y < 72) {
      page = pdfDoc.addPage([595.28, 841.89]);
      y = 790;
      page.drawText("Kalakaupan tuotantoraportti", {
        x: 48,
        y,
        size: 12,
        font: boldFont,
        color: rgb(0.05, 0.41, 0.43)
      });
      y -= 28;
      page.drawText(title, { x: 48, y, size: 18, font: boldFont });
      y -= 30;
      page.drawLine({
        start: { x: 48, y },
        end: { x: 547, y },
        thickness: 1,
        color: rgb(0.88, 0.88, 0.88)
      });
      y -= 22;
    }

    page.drawText(row.product_name, { x: 48, y, size: 12, font: regularFont });
    page.drawText(formatWeight(row.total_grams), {
      x: 450,
      y,
      size: 12,
      font: boldFont
    });
    y -= 24;
  });

  if (emailContacts.length > 0) {
    if (y < 140) {
      page = pdfDoc.addPage([595.28, 841.89]);
      y = 790;
    } else {
      y -= 12;
    }

    page.drawLine({
      start: { x: 48, y },
      end: { x: 547, y },
      thickness: 1,
      color: rgb(0.88, 0.88, 0.88)
    });
    y -= 26;

    page.drawText("Asiakassähköpostit", {
      x: 48,
      y,
      size: 14,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.1)
    });
    y -= 22;

    emailContacts.forEach((contact) => {
      if (y < 72) {
        page = pdfDoc.addPage([595.28, 841.89]);
        y = 790;
      }

      page.drawText(contact.customer_name, { x: 48, y, size: 11, font: boldFont });
      page.drawText(contact.email, { x: 220, y, size: 11, font: regularFont });
      page.drawText(contact.latest_pickup_date, { x: 470, y, size: 10, font: regularFont });
      y -= 20;
    });
  }

  const pdfBytes = await pdfDoc.save();

  return {
    bytes: pdfBytes,
    filename: buildFilename(from, to)
  };
}
