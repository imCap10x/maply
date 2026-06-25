// Simple tidy tree layout: depth -> x, vertical position based on subtree sizes.
// Returns { nodes, edges } ready for React Flow.

const NODE_W = 220;
const X_GAP = 260;
const Y_GAP = 60;

function countLeaves(node) {
  if (!node.children || node.children.length === 0) return 1;
  return node.children.reduce((sum, c) => sum + countLeaves(c), 0);
}

export function buildLayout(tree) {
  const nodes = [];
  const edges = [];
  let idCounter = 0;

  function place(node, depth, yStart) {
    const id = `n${idCounter++}`;
    const leafCount = countLeaves(node);
    const subtreeHeight = leafCount * (Y_GAP + 40);
    const y = yStart + subtreeHeight / 2 - 20;

    nodes.push({
      id,
      depth,
      label: node.label || node.title,
      y,
    });

    let childY = yStart;
    const childIds = [];
    (node.children || []).forEach((child) => {
      const childLeaf = countLeaves(child);
      const childHeight = childLeaf * (Y_GAP + 40);
      const childId = place(child, depth + 1, childY);
      childIds.push(childId);
      childY += childHeight;
    });

    childIds.forEach((cid) => {
      edges.push({
        id: `e-${id}-${cid}`,
        source: id,
        target: cid,
        type: "smoothstep",
        style: { stroke: depthColor(depth), strokeWidth: 1.5 },
      });
    });

    return id;
  }

  place({ label: tree.title, children: tree.children }, 0, 0);

  const flowNodes = nodes.map((n) => ({
    id: n.id,
    position: { x: n.depth * X_GAP, y: n.y },
    data: { label: n.label, depth: n.depth },
    type: "mindNode",
  }));

  return { nodes: flowNodes, edges };
}

export function depthColor(depth) {
  const colors = ["#181a16", "#2f6f4e", "#5c8a6e", "#b08968", "#8c8c84"];
  return colors[Math.min(depth, colors.length - 1)];
}
