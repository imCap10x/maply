import { createCanvas } from "@napi-rs/canvas";
import { createWorker } from "tesseract.js";

// Confidence threshold (0-100). Printed/typed text OCRs with high confidence.
// Handwriting produces consistently low, noisy confidence scores.
const PRINTED_TEXT_CONFIDENCE_THRESHOLD = 65;
const MAX_PAGES_TO_OCR = 8; // safety cap so we don't time out on huge files

export async function ocrPdfBuffer(buffer) {
  // Lazy-load pdfjs in a Node-friendly way (no DOM/worker needed server-side).
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const pdf = await loadingTask.promise;

  const pageCount = Math.min(pdf.numPages, MAX_PAGES_TO_OCR);
  const worker = await createWorker("eng");

  let fullText = "";
  let confidences = [];

  try {
    for (let i = 1; i <= pageCount; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2 });

      const canvas = createCanvas(viewport.width, viewport.height);
      const ctx = canvas.getContext("2d");

      await page.render({ canvasContext: ctx, viewport }).promise;
      const pngBuffer = canvas.toBuffer("image/png");

      const { data } = await worker.recognize(pngBuffer);
      fullText += data.text + "\n\n";
      if (typeof data.confidence === "number") {
        confidences.push(data.confidence);
      }
    }
  } finally {
    await worker.terminate();
  }

  const avgConfidence =
    confidences.length > 0
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length
      : 0;

  return {
    text: fullText.trim(),
    avgConfidence,
    isLikelyPrinted: avgConfidence >= PRINTED_TEXT_CONFIDENCE_THRESHOLD,
    pagesProcessed: pageCount,
  };
}
