import { useMemo } from "react";
import { Background, Controls, Handle, Position, ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { friendlyType, toFlow } from "../lib/workflow";

function N8nNode({ data }) {
  return (
    <div className={`node ${data.kind}`}>
      {data.kind !== "trigger" && <Handle type="target" position={Position.Left} />}
      <div className="node-name">{data.name}</div>
      <div className="node-type">{friendlyType(data.type)}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

const nodeTypes = { n8n: N8nNode };

export default function WorkflowCanvas({ workflow }) {
  const { nodes, edges } = useMemo(() => toFlow(workflow), [workflow]);

  return (
    <section aria-label="Workflow diagram">
      <div className="canvas-title">
        <h2>{workflow.name}</h2>
        <div className="legend" aria-hidden="true">
          <span className="t">Trigger</span>
          <span className="a">Action</span>
          <span className="l">Logic</span>
        </div>
      </div>
      <div className="canvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          nodesConnectable={false}
          proOptions={{ hideAttribution: false }}
          defaultEdgeOptions={{ style: { stroke: "#9aa1b2", strokeWidth: 1.5 } }}
        >
          <Background gap={24} color="#e4e6ec" />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </section>
  );
}
