import pdfParse from "pdf-parse";
import { ocrPdfBuffer } from "../../../lib/ocr";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return Response.json({ error: "No file received." }, { status: 400 });
    }
    if (file.type !== "application/pdf") {
      return Response.json({ error: "Please upload a PDF file." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let parsed;
    try {
      parsed = await pdfParse(buffer);
    } catch (e) {
      return Response.json(
        { error: "Couldn't read that PDF. It may be corrupted or password protected." },
        { status: 400 }
      );
    }

    const directText = (parsed.text || "").trim();
    const pageCount = parsed.numpages || 1;
    const avgCharsPerPage = directText.length / pageCount;

    if (avgCharsPerPage >= 80) {
      return Response.json({ text: directText });
    }

    let ocrResult;
    try {
      ocrResult = await ocrPdfBuffer(buffer);
    } catch (e) {
      return Response.json(
        { error: "Couldn't process this PDF's pages. Try a different file." },
        { status: 500 }
      );
    }

    if (!ocrResult.text || ocrResult.text.length < 40) {
      return Response.json(
        { error: "Couldn't find readable text in this PDF. Make sure pages are clear and in focus." },
        { status: 422 }
      );
    }

    if (!ocrResult.isLikelyPrinted) {
      return Response.json(
        { error: "This looks like handwriting — we can only read printed or typed text right now." },
        { status: 422 }
      );
    }

    return Response.json({ text: ocrResult.text });
  } catch (err) {
    return Response.json({ error: "Something went wrong reading the PDF." }, { status: 500 });
  }
}
