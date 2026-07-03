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

type PrintLinkProps = {
  pickupDate: string;
  orderIds: string[];
};

export function PrintLink({ pickupDate, orderIds }: PrintLinkProps) {
  const [loadingSize, setLoadingSize] = useState<ClientLabelSize | null>(null);
  const [error, setError] = useState<string | null>(null);
  const androidDevice = isAndroidDevice();

  async function handleBatchPrint(size: ClientLabelSize) {
    try {
      setError(null);
      setLoadingSize(size);

      const blobs = await Promise.all(
        orderIds.map((orderId) => fetchPngBlob(getPngUrl(pickupDate, orderId, size)))
      );

      if (androidDevice) {
        const shared = await sharePngFiles(
          blobs,
          orderIds.map((orderId, index) => `forelli-${pickupDate}-${index + 1}-${orderId}-${size}.png`),
          `Forelli tarrat ${pickupDate}`
        );

        if (shared) {
          return;
        }
      }

      const pdfBlob = await buildPdfFromPngBlobs(blobs, size);
      await shareOrOpenPdf(pdfBlob, `forelli-labels-${pickupDate}-${size}.pdf`);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Päivän tarrojen muodostaminen epäonnistui. Kokeile uudelleen.";

      setError(message);
    } finally {
      setLoadingSize(null);
    }
  }

  return (
    <div className="label-export-stack">
      <div className="inline-actions">
        <button
          className="ghost-button"
          disabled={loadingSize !== null || orderIds.length === 0}
          onClick={() => void handleBatchPrint("4x6")}
          type="button"
        >
          {loadingSize === "4x6" ? "Valmistellaan 4x6..." : "Tarrat 4x6"}
        </button>
        <button
          className="ghost-button"
          disabled={loadingSize !== null || orderIds.length === 0}
          onClick={() => void handleBatchPrint("4x3")}
          type="button"
        >
          {loadingSize === "4x3" ? "Valmistellaan 4x3..." : "Tarrat 4x3"}
        </button>
      </div>
      {error ? (
        <p aria-live="polite" className="label-export-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
