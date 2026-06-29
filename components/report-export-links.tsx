import Link from "next/link";

type ReportExportLinksProps = {
  exportType?: "products" | "emails";
  from?: string;
  to?: string;
};

function buildHref(
  basePath: "/raportit/pdf" | "/raportit/csv" | "/raportit/email-csv",
  from?: string,
  to?: string
) {
  const searchParams = new URLSearchParams();

  if (from) {
    searchParams.set("from", from);
  }

  if (to) {
    searchParams.set("to", to);
  }

  return `${basePath}${searchParams.size ? `?${searchParams.toString()}` : ""}`;
}

export function ReportExportLinks({
  exportType = "products",
  from,
  to
}: ReportExportLinksProps) {
  const pdfHref = buildHref("/raportit/pdf", from, to);
  const csvHref =
    exportType === "emails"
      ? buildHref("/raportit/email-csv", from, to)
      : buildHref("/raportit/csv", from, to);

  return (
    <>
      <Link className="ghost-button" href={pdfHref} target="_blank">
        Lataa PDF
      </Link>
      <Link className="ghost-button" href={csvHref} target="_blank">
        {exportType === "emails" ? "Lataa email CSV" : "Lataa CSV"}
      </Link>
    </>
  );
}
