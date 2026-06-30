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

function isAndroidDevice() {
  if (typeof window === "undefined") {
    return false;
  }

  return /Android/i.test(window.navigator.userAgent);
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

async function sharePng(blob: Blob, fileName: string) {
  const file = new File([blob], fileName, { type: "image/png" });

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: fileName
    });

    return;
  }

  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, "_blank", "noopener,noreferrer");

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
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const appleMobileSafari = isAppleMobileSafari();
  const androidDevice = isAndroidDevice();

  if (mode === "preview") {
    return (
      <Link className="ghost-button" href={`/tilaukset/${date}/${id}/tarra`} target="_blank">
        Nayta etiketin esikatselu
      </Link>
    );
  }

  async function handleLabelExport(size: LabelSize) {
    const pngUrl = getPngUrl(date, id, size);

    if (!appleMobileSafari) {
      openPng(pngUrl);
      return;
    }

    try {
      setError(null);
      setLoadingAction(`pdf-${size}`);

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
      setLoadingAction(null);
    }
  }

  async function handleAndroidShare(size: LabelSize) {
    try {
      setError(null);
      setLoadingAction(`share-${size}`);

      const pngUrl = getPngUrl(date, id, size);
      const pngResponse = await fetch(pngUrl, { cache: "no-store" });

      if (!pngResponse.ok) {
        throw new Error("Tarrakuvan haku epaonnistui.");
      }

      const pngBlob = await pngResponse.blob();
      await sharePng(pngBlob, `forelli-label-${date}-${size}.png`);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Kuvan jakaminen epaonnistui. Kokeile avata PNG ensin.";

      setError(message);
    } finally {
      setLoadingAction(null);
    }
  }

  if (androidDevice) {
    return (
      <div className="label-export-stack">
        <div className="label-export-grid">
          <button
            className="ghost-button"
            disabled={loadingAction !== null}
            onClick={() => openPng(getPngUrl(date, id, "4x6"))}
            type="button"
          >
            Avaa PNG 4x6
          </button>
          <button
            className="ghost-button"
            disabled={loadingAction !== null}
            onClick={() => void handleAndroidShare("4x6")}
            type="button"
          >
            {loadingAction === "share-4x6" ? "Jaetaan..." : "Jaa tulostukseen 4x6"}
          </button>
          <button
            className="ghost-button"
            disabled={loadingAction !== null}
            onClick={() => openPng(getPngUrl(date, id, "4x3"))}
            type="button"
          >
            Avaa PNG 4x3
          </button>
          <button
            className="ghost-button"
            disabled={loadingAction !== null}
            onClick={() => void handleAndroidShare("4x3")}
            type="button"
          >
            {loadingAction === "share-4x3" ? "Jaetaan..." : "Jaa tulostukseen 4x3"}
          </button>
        </div>
        <p className="label-export-note">
          Androidilla voit joko avata PNG-tarran tai jakaa sen suoraan MUNBYN Print -sovellukseen.
        </p>
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
          onClick={() => void handleLabelExport("4x6")}
          type="button"
        >
          {loadingAction === "pdf-4x6" ? "Muodostetaan PDF..." : "Avaa tarra 4x6"}
        </button>
        <button
          className="ghost-button"
          disabled={loadingAction !== null}
          onClick={() => void handleLabelExport("4x3")}
          type="button"
        >
          {loadingAction === "pdf-4x3" ? "Muodostetaan PDF..." : "Avaa tarra 4x3"}
        </button>
      </div>
      <p className="label-export-note">
        {appleMobileSafari
          ? "iPhonessa ja iPadissa Safari muodostaa ensin PDF:n, jonka voit avata tai jakaa suoraan laitteesta."
          : "Muilla laitteilla tarra avautuu PNG-kuvana, jonka voit tallentaa tai avata tulostussovelluksessa."}
      </p>
      {error ? (
        <p aria-live="polite" className="label-export-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
