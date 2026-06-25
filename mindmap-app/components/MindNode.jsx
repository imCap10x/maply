"use client";

import { Handle, Position } from "reactflow";
import { depthColor } from "../lib/layoutTree";

export default function MindNode({ data }) {
  const { label, depth } = data;
  const color = depthColor(depth);
  const isRoot = depth === 0;

  return (
    <div
      style={{
        background: isRoot ? color : "#ffffff",
        color: isRoot ? "#ffffff" : "#181a16",
        border: isRoot ? "none" : `1.5px solid ${color}`,
        borderRadius: 10,
        padding: isRoot ? "14px 20px" : "10px 16px",
        fontFamily: isRoot ? "var(--font-display)" : "var(--font-body)",
        fontWeight: isRoot ? 600 : 500,
        fontSize: isRoot ? 16 : depth === 1 ? 14 : 13,
        maxWidth: 220,
        lineHeight: 1.3,
        boxShadow: isRoot
          ? "0 6px 16px rgba(47,111,78,0.25)"
          : "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: color, width: 6, height: 6 }} />
      {label}
      <Handle type="source" position={Position.Right} style={{ background: color, width: 6, height: 6 }} />
    </div>
  );
}
