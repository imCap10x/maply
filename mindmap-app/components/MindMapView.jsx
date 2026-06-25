"use client";

import { useMemo, useRef } from "react";
import ReactFlow, { Background, Controls, MiniMap } from "reactflow";
import "reactflow/dist/style.css";
import { toPng } from "html-to-image";
import { buildLayout } from "../lib/layoutTree";
import MindNode from "./MindNode";

const nodeTypes = { mindNode: MindNode };

export default function MindMapView({ tree }) {
  const wrapperRef = useRef(null);
  const { nodes, edges } = useMemo(() => buildLayout(tree), [tree]);

  const handleExport = () => {
    if (!wrapperRef.current) return;
    toPng(wrapperRef.current, { backgroundColor: "#fbfbf9", pixelRatio: 2 }).then((dataUrl) => {
      const link = document.createElement("a");
      link.download = `${tree.title || "mindmap"}.png`;
      link.href = dataUrl;
      link.click();
    });
  };

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <button
          onClick={handleExport}
          style={{
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 18px",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Download as PNG
        </button>
      </div>
      <div
        ref={wrapperRef}
        style={{
          width: "100%",
          height: "70vh",
          background: "var(--paper)",
          border: "1px solid var(--line)",
          borderRadius: 16,
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#e6e6e0" gap={24} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
}
