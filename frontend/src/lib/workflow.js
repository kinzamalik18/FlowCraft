// Turn n8n workflow JSON into React Flow nodes and edges.

const LOGIC_TYPES = ["if", "switch", "merge", "filter", "code", "set", "splitInBatches", "wait", "noOp", "function"];

export function nodeKind(type = "") {
  const short = type.split(".").pop() ?? "";
  if (/trigger$/i.test(short) || ["webhook", "cron", "schedule", "interval", "manualTrigger"].includes(short)) return "trigger";
  if (LOGIC_TYPES.some((t) => short.toLowerCase() === t.toLowerCase())) return "logic";
  return "action";
}

// "n8n-nodes-base.googleSheetsTrigger" -> "Google Sheets Trigger"
export function friendlyType(type = "") {
  const short = type.split(".").pop() ?? type;
  return short
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}

function hasUsablePositions(nodes) {
  const keys = nodes.map((n) => (Array.isArray(n.position) ? n.position.join(",") : ""));
  return keys.every(Boolean) && new Set(keys).size === keys.length;
}

export function toFlow(workflow) {
  const raw = workflow?.nodes ?? [];
  const usePositions = hasUsablePositions(raw);

  const nodes = raw.map((node, i) => ({
    id: node.name,
    type: "n8n",
    position: usePositions ? { x: node.position[0], y: node.position[1] } : { x: i * 260, y: 120 },
    data: { name: node.name, type: node.type, kind: nodeKind(node.type) },
  }));

  const edges = [];
  for (const [source, outputs] of Object.entries(workflow?.connections ?? {})) {
    (outputs?.main ?? []).forEach((branch, outputIndex) => {
      (branch ?? []).forEach((target) => {
        if (!target?.node) return;
        edges.push({
          id: `${source}-${outputIndex}-${target.node}`,
          source,
          target: target.node,
          label: (outputs.main.length > 1 ? (outputIndex === 0 ? "true" : "false") : undefined),
        });
      });
    });
  }
  return { nodes, edges };
}

// Explanation comes back as "- step" lines. Strip markdown emphasis.
export function explanationLines(text = "") {
  return text
    .split("\n")
    .map((line) => line.replace(/^\s*(?:[-*•]|\d+\.)\s*/, "").replace(/\*\*(.+?)\*\*/g, "$1").trim())
    .filter(Boolean);
}
