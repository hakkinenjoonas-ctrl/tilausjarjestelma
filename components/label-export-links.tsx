"use client";

import { useState } from "react";
import type { ClientLabelSize } from "@/lib/utils/label-export-client";
import {
  buildPdfFromPngBlobs,
  fetchPngBlob,
  getPngUrl,
  isAndroidDevice,
  shareOrOpenPdf,
  sharePngFiles
} from "@/lib/utils/label-export-client";

type LabelExportLinksProps = {
  date: string;
  id: string;
  mode?: "direct" | "sizes";
  previewLabel?: string;
  directSize?: ClientLabelSize;
};

export function LabelExportLinks({
  date,
  id,
  mode = "direct",
  previewLabel = "Tulosta asiakaskortti",
  directSize = "4x6"
}: LabelExportLinksProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const androidDevice = isAndroidDevice();

  async function handleDirectExport(size: ClientLabelSize) {
    try {
      setError(null);
      setLoadingAction(`direct-${size}`);

      const pngBlob = await fetchPngBlob(getPngUrl(date, id, size));

      if (androidDevice) {
        const shared = await sharePngFiles(
          [pngBlob],
          [`forelli-label-${date}-${size}.png`],
          `Forelli tarra ${date}`
        );

        if (shared) {
          return;
        }
      }

      const pdfBlob = await buildPdfFromPngBlobs([pngBlob], size);
      await shareOrOpenPdf(pdfBlob, `forelli-label-${date}-${size}.pdf`);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Tulostustiedoston muodostaminen epäonnistui. Kokeile uudelleen.";

      setError(message);
    } finally {
      setLoadingAction(null);
    }
  }

  if (mode === "direct") {
    return (
      <div className="label-export-stack">
        <button
          className="ghost-button"
          disabled={loadingAction !== null}
          onClick={() => void handleDirectExport(directSize)}
          type="button"
        >
          {loadingAction === `direct-${directSize}` ? "Valmistellaan tulostusta..." : previewLabel}
        </button>
        {error ? (
          <p aria-live="polite" className="label-export-error">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="label-export-stack">
      <div className="inline-actions">
        <button
          className="ghost-button"
          disabled={loadingAction !== null}
          onClick={() => void handleDirectExport("4x6")}
          type="button"
        >
          {loadingAction === "direct-4x6" ? "Valmistellaan..." : "Tulosta 4x6"}
        </button>
        <button
          className="ghost-button"
          disabled={loadingAction !== null}
          onClick={() => void handleDirectExport("4x3")}
          type="button"
        >
          {loadingAction === "direct-4x3" ? "Valmistellaan..." : "Tulosta 4x3"}
        </button>
      </div>
      <p className="label-export-note">
        {androidDevice
          ? "Androidilla nappi avaa suoraan laitteen jakonäkymän MUNBYN Print -sovellusta varten."
          : "iPhonessa ja selaimessa nappi muodostaa tarrasta suoraan tulostettavan PDF:n."}
      </p>
      {error ? (
        <p aria-live="polite" className="label-export-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
