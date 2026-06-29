import Link from "next/link";

type LabelExportLinksProps = {
  date: string;
  id: string;
  mode?: "preview" | "png";
};

export function LabelExportLinks({
  date,
  id,
  mode = "preview"
}: LabelExportLinksProps) {
  if (mode === "preview") {
    return (
      <Link className="ghost-button" href={`/tilaukset/${date}/${id}/tarra`} target="_blank">
        Nayta etiketin esikatselu
      </Link>
    );
  }

  return (
    <div className="inline-actions">
      <Link
        className="ghost-button"
        href={`/tilaukset/${date}/${id}/tarra/kuva?size=4x6`}
        target="_blank"
      >
        Avaa PNG 4x6
      </Link>
      <Link
        className="ghost-button"
        href={`/tilaukset/${date}/${id}/tarra/kuva?size=4x3`}
        target="_blank"
      >
        Avaa PNG 4x3
      </Link>
    </div>
  );
}
