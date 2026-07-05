"use client";

export type ClientLabelSize = "4x6" | "4x3";

const LABEL_DIMENSIONS: Record<
  ClientLabelSize,
  { widthIn: number; heightIn: number; widthMm: number; heightMm: number }
> = {
  "4x6": { widthIn: 4, heightIn: 6, widthMm: 102, heightMm: 152 },
  "4x3": { widthIn: 4, heightIn: 3, widthMm: 101.6, heightMm: 76.2 }
};

export function getPngUrl(date: string, id: string, size: ClientLabelSize) {
  return `/tilaukset/${date}/${id}/tarra/kuva?size=${size}`;
}

export function isAppleMobileSafari() {
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

export function isAndroidDevice() {
  if (typeof window === "undefined") {
    return false;
  }

  return /Android/i.test(window.navigator.userAgent);
}

export function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Kuvan muunto data-urliksi epäonnistui."));
    };

    reader.onerror = () => reject(new Error("Kuvan lukeminen epäonnistui."));
    reader.readAsDataURL(blob);
  });
}

export async function fetchPngBlob(url: string) {
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Tarrakuvan haku epäonnistui.");
  }

  return response.blob();
}

export async function shareOrOpenPdf(blob: Blob, fileName: string) {
  const file = new File([blob], fileName, { type: "application/pdf" });

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

export async function sharePngFiles(blobs: Blob[], fileNames: string[], title: string) {
  const files = blobs.map(
    (blob, index) => new File([blob], fileNames[index] ?? `forelli-label-${index + 1}.png`, { type: "image/png" })
  );

  if (navigator.canShare?.({ files })) {
    await navigator.share({
      files,
      title
    });

    return true;
  }

  return false;
}

export async function buildPdfFromPngBlobs(blobs: Blob[], size: ClientLabelSize) {
  const { jsPDF } = await import("jspdf");
  const { widthIn, heightIn, widthMm, heightMm } = LABEL_DIMENSIONS[size];
  const orientation = widthIn > heightIn ? "landscape" : "portrait";
  const pdf = new jsPDF({
    orientation,
    unit: "mm",
    format: [widthMm, heightMm]
  });

  for (const [index, blob] of blobs.entries()) {
    const pngDataUrl = await blobToDataUrl(blob);

    if (index > 0) {
      pdf.addPage([widthMm, heightMm], orientation);
    }

    pdf.addImage(pngDataUrl, "PNG", 0, 0, widthMm, heightMm, undefined, "FAST");
  }

  return pdf.output("blob");
}
