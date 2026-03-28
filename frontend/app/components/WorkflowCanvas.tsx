"use client";

import ReactFlow, { Node, Edge, Background, Controls } from
    "reactflow";
import "reactflow/dist/style.css";

type Props = {
    workflow: Record<string, unknown>;
};

// Step 1: Convert n8n nodes into React Flow nodes.
// Each node gets a position from the n8n JSON and a label from its  
name.
function buildNodes(workflow: Record<string, unknown>): Node[] {
    const nodes = workflow.nodes as Array<Record<string, unknown>>;
    if (!nodes) return [];

    return nodes.map((node) => {
        const position = node.position as { x: number; y: number };
        return {
            id: node.id as string,
            position: { x: position?.x ?? 0, y: position?.y ?? 0 },
            data: { label: node.name as string },
            style: {
                background: "#1e293b",
                color: "#f1f5f9",
                border: "1px solid #334155",
                borderRadius: "8px",
                padding: "10px 16px",
            },
        };
    });
}

// Step 2: Convert n8n connections into React Flow edges.
// n8n stores connections as { NodeName: { main: [[{ node, type,     
index }]] } }
function buildEdges(workflow: Record<string, unknown>): Edge[] {
    const connections = workflow.connections as Record<
        string,
        { main: Array<Array<{ node: string }>> }
    >;
    const nodes = workflow.nodes as Array<Record<string, unknown>>;
    if (!connections || !nodes) return [];

    // Build a name-to-id map so we can look up node IDs by name.      
    const nameToId: Record<string, string> = {};
    nodes.forEach((n) => {
        nameToId[n.name as string] = n.id as string;
    });

    const edges: Edge[] = [];
    Object.entries(connections).forEach(([sourceName, conn]) => {
        conn.main?.forEach((outputs) => {
            outputs?.forEach((target, i) => {
                edges.push({
                    id: `${sourceName}-${target.node}-${i}`,
                    source: nameToId[sourceName] ?? sourceName,
                    target: nameToId[target.node] ?? target.node,
                    style: { stroke: "#3b82f6" },
                });
            });
        });
    });

    return edges;
}

// Step 3: Render the React Flow canvas with the nodes and edges.    
export default function WorkflowCanvas({ workflow }: Props) {
    const nodes = buildNodes(workflow);
    const edges = buildEdges(workflow);

    return (
        <div className="w-full h-96 rounded-lg border border-gray-700    
  overflow-hidden">
            <ReactFlow nodes={nodes} edges={edges} fitView>
                <Background color="#334155" gap={16} />
                <Controls />
            </ReactFlow>
        </div>
    );
}