import { ReactFlow, Background, Controls, MiniMap, BackgroundVariant } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useWorkflowStore } from "../store/workflowStore";
import { StartNode } from "../components/nodes/StartNode";
import { ApiNode } from "../components/nodes/ApiNode";
import { ConditionNode } from "../components/nodes/ConditionNode";
import { CustomEdge } from "../components/edges/CustomEdge";
import { Sidebar } from "../components/panels/Sidebar";
import { Toolbar } from "../components/panels/Toolbar";
import { NodeEditPanel } from "../components/panels/NodeEditPanel";

const nodeTypes = {
  start: StartNode,
  api: ApiNode,
  condition: ConditionNode,
  startNode: StartNode,
  apiNode: ApiNode,
  conditionNode: ConditionNode,
};

const edgeTypes = { custom: CustomEdge };

export default function WorkflowEditor() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, selectNode, selectedNodeId } = useWorkflowStore();

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Toolbar />
        <div className="flex-1 relative flex">
          <div className="flex-1">
            <ReactFlow
              nodes={nodes as any}
              edges={edges as any}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={(_, node) => selectNode(node.id)}
              onPaneClick={() => selectNode(null)}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              defaultEdgeOptions={{ type: "custom" }}
              fitView
              isValidConnection={(connection) => connection.source !== connection.target}
            >
              <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
              <Controls />
              <MiniMap />
            </ReactFlow>
          </div>
          {selectedNodeId && <NodeEditPanel />}
        </div>
      </div>
    </div>
  );
}
