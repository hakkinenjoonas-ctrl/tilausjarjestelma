"use client";

import Link from "next/link";
import { useState } from "react";

type LabelExportLinksProps = {
  date: string;
  id: string;
  mode?: "preview" | "png";
};

type LabelSize = "4x6" | "4x3";

const LABEL_DIMENSIONS: Record<LabelSize, { width: number; height: number }> = {
  "4x6": { width: 4, height: 6 },
  "4x3": { width: 4, height: 3 }
};

function getPngUrl(date: string, id: string, size: LabelSize) {
  return `/tilaukset/${date}/${id}/tarra/kuva?size=${size}`;
}

function isAppleMobileSafari() {
  if (typeof window === "undefined") {
    return false;
  }

  const userAgent = window.navigator.userAgent;
  const isIOSDevice =
    /iP(hone|ad|od)/.test(userAgent) ||
    (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
  const isSafariEngine = /WebKit/i.test(userAgent) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(userAgent);

  return isIOSDevice && isSafariEngine;
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Kuvan muunto data-urliksi epaonnistui."));
    };

    reader.onerror = () => reject(new Error("Kuvan lukeminen epaonnistui."));
    reader.readAsDataURL(blob);
  });
}

async function shareOrOpenPdf(blob: Blob, fileName: string) {
  const file = new File([blob], fileName, { type: "application/pdf" });

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: fileName
    });

    return;
  }

  const blobUrl = URL.createObjectURL(blob);
  window.location.assign(blobUrl);

  window.setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 30000);
}

function openPng(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

export function LabelExportLinks({
  date,
  id,
  mode = "preview"
}: LabelExportLinksProps) {
  const [loadingSize, setLoadingSize] = useState<LabelSize | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (mode === "preview") {
    return (
      <Link className="ghost-button" href={`/tilaukset/${date}/${id}/tarra`} target="_blank">
        Nayta etiketin esikatselu
      </Link>
    );
  }

  async function handleLabelExport(size: LabelSize) {
    const pngUrl = getPngUrl(date, id, size);

    if (!isAppleMobileSafari()) {
      openPng(pngUrl);
      return;
    }

    try {
      setError(null);
      setLoadingSize(size);

      const pngResponse = await fetch(pngUrl, { cache: "no-store" });

      if (!pngResponse.ok) {
        throw new Error("Tarrakuvan haku epaonnistui.");
      }

      const pngBlob = await pngResponse.blob();
      const pngDataUrl = await blobToDataUrl(pngBlob);
      const { jsPDF } = await import("jspdf");
      const { width, height } = LABEL_DIMENSIONS[size];
      const pdf = new jsPDF({
        orientation: width > height ? "landscape" : "portrait",
        unit: "in",
        format: [width, height]
      });

      pdf.addImage(pngDataUrl, "PNG", 0, 0, width, height, undefined, "FAST");

      const pdfBlob = pdf.output("blob");
      await shareOrOpenPdf(pdfBlob, `forelli-label-${date}-${size}.pdf`);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "PDF:n muodostaminen epaonnistui. Kokeile uudelleen.";

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
          disabled={loadingSize !== null}
          onClick={() => void handleLabelExport("4x6")}
          type="button"
        >
          {loadingSize === "4x6" ? "Muodostetaan PDF..." : "Avaa tarra 4x6"}
        </button>
        <button
          className="ghost-button"
          disabled={loadingSize !== null}
          onClick={() => void handleLabelExport("4x3")}
          type="button"
        >
          {loadingSize === "4x3" ? "Muodostetaan PDF..." : "Avaa tarra 4x3"}
        </button>
      </div>
      <p className="label-export-note">
        iPhonessa ja iPadissa Safari muodostaa ensin PDF:n, jonka voit avata tai jakaa suoraan
        laitteesta.
      </p>
      {error ? (
        <p aria-live="polite" className="label-export-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
