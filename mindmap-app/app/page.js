"use client";

import { useState } from "react";
import MindMapView from "../components/MindMapView";

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [tree, setTree] = useState(null);
  const [error, setError] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [fileName, setFileName] = useState("");

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setFileName(file.name);
    setExtracting(true);
    setText("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/extract-pdf", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't read that PDF.");
        setFileName("");
      } else {
        setText(data.text);
      }
    } catch (e) {
      setError("Network error while reading the PDF. Try again.");
      setFileName("");
    } finally {
      setExtracting(false);
    }
  }

  async function handleGenerate() {
    setError("");
    setLoading(true);
    setTree(null);
    try {
      const res = await fetch("/api/generate-mindmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setTree(data.tree);
      }
    } catch (e) {
      setError("Network error — check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 24px 96px" }}>
      {/* Header */}
      <header style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 64 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600 }}>
          Maply
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-soft)" }}>
          notes → mind maps
        </span>
      </header>

      {/* Hero */}
      {!tree && (
        <section style={{ marginBottom: 48 }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: "clamp(32px, 5vw, 52px)",
              lineHeight: 1.1,
              margin: "0 0 16px",
              maxWidth: 640,
            }}
          >
            Turn messy notes into a mind map you can actually study from.
          </h1>
          <p style={{ color: "var(--ink-soft)", fontSize: 17, maxWidth: 520, lineHeight: 1.5 }}>
            Paste your notes, a chapter, or a syllabus below. Get back a clean,
            structured map in seconds — every important point kept, nothing buried in a wall of text.
          </p>
        </section>
      )}

      {/* Input */}
      {!tree && (
        <section>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <label
              htmlFor="pdf-upload"
              style={{
                border: "1px solid var(--line)",
                borderRadius: 8,
                padding: "10px 16px",
                fontSize: 14,
                cursor: "pointer",
                color: "var(--ink)",
                background: "var(--paper)",
              }}
            >
              {extracting ? "Reading PDF (this can take a moment for scanned pages)..." : "Upload a PDF"}
            </label>
            <input
              id="pdf-upload"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            {fileName && !extracting && (
              <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>{fileName}</span>
            )}
            <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>— or paste text below</span>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your notes here..."
            rows={10}
            style={{
              width: "100%",
              padding: 20,
              fontSize: 15,
              lineHeight: 1.6,
              fontFamily: "var(--font-body)",
              border: "1px solid var(--line)",
              borderRadius: 14,
              resize: "vertical",
              background: "var(--paper)",
              color: "var(--ink)",
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 16 }}>
            <button
              onClick={handleGenerate}
              disabled={loading || text.trim().length < 20}
              style={{
                background: loading ? "var(--ink-soft)" : "var(--accent)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "14px 28px",
                fontSize: 15,
                fontWeight: 600,
                cursor: loading ? "default" : "pointer",
                opacity: text.trim().length < 20 ? 0.5 : 1,
              }}
            >
              {loading ? "Mapping it out..." : "Generate mind map"}
            </button>
            {error && (
              <span style={{ color: "var(--error)", fontSize: 14 }}>{error}</span>
            )}
          </div>
        </section>
      )}

      {/* Result */}
      {tree && (
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 24, margin: 0 }}>
              {tree.title}
            </h2>
            <button
              onClick={() => {
                setTree(null);
                setText("");
              }}
              style={{
                background: "transparent",
                border: "1px solid var(--line)",
                borderRadius: 8,
                padding: "8px 16px",
                fontSize: 14,
                cursor: "pointer",
                color: "var(--ink-soft)",
              }}
            >
              Start over
            </button>
          </div>
          <MindMapView tree={tree} />
        </section>
      )}
    </main>
  );
}
